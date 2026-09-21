import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../../core/models/catalogo_item.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/carrito_provider.dart';
import '../../../core/services/catalogo_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/views/login_screen.dart';
import '../../reservas/views/crear_reserva_screen.dart';
import '../../ar_viewer/views/vestidor_ar_screen.dart';
import 'comparador_outfits_screen.dart';
import '../../../core/providers/comparador_provider.dart';

class DetallePrendaScreen extends StatefulWidget {
  final PrendaCatalogo prenda;
  final Function(int)? onSwitchTab;

  const DetallePrendaScreen({
    Key? key,
    required this.prenda,
    this.onSwitchTab,
  }) : super(key: key);

  @override
  State<DetallePrendaScreen> createState() => _DetallePrendaScreenState();
}

class _DetallePrendaScreenState extends State<DetallePrendaScreen> {
  final CatalogoService _catalogoService = CatalogoService();

  late PrendaColor _selectedColor;
  late PrendaTalla _selectedTalla;

  List<StockSucursalItem> _sucursales = [];
  bool _cargandoSucursales = true;
  bool _agregandoAlCarrito = false;

  @override
  void initState() {
    super.initState();
    final p = widget.prenda;
    _selectedColor = p.colores.isNotEmpty
        ? p.colores.first
        : PrendaColor(idColor: 0, nombre: 'Estándar', codigoHex: '#181C24');
    _selectedTalla = p.tallas.isNotEmpty
        ? p.tallas.first
        : PrendaTalla(idTalla: 0, talla: 'M', orden: 1);

    _cargarDisponibilidad(
      talla: _selectedTalla.talla,
      color: _selectedColor.nombre,
    );
  }

  Future<void> _cargarDisponibilidad({String? talla, String? color}) async {
    setState(() => _cargandoSucursales = true);
    try {
      final sucs = await _catalogoService.getDisponibilidadSucursales(
        widget.prenda.idProducto,
        talla: talla,
        color: color,
      );
      if (!mounted) return;
      setState(() {
        _sucursales = sucs;
        _cargandoSucursales = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _cargandoSucursales = false);
    }
  }

  Future<void> _agregarABolsa() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      _solicitarLogin('Para agregar prendas a tu bolsa debes iniciar sesión.');
      return;
    }

    setState(() => _agregandoAlCarrito = true);
    final cart = Provider.of<CarritoProvider>(context, listen: false);

    final ok = await cart.agregarItem(
      idProducto: widget.prenda.idProducto,
      talla: _selectedTalla.talla,
      color: _selectedColor.nombre,
      cantidad: 1,
    );

    setState(() => _agregandoAlCarrito = false);

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.prenda.nombre} añadida a tu bolsa.'),
          backgroundColor: AppTheme.bgElevated,
          action: SnackBarAction(
            label: 'Ver bolsa',
            textColor: AppTheme.accentGold,
            onPressed: () {
              Navigator.pop(context);
              if (widget.onSwitchTab != null) {
                widget.onSwitchTab!(2); // Tab 2: Bolsa
              }
            },
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(cart.errorMessage ?? 'No se pudo agregar la prenda.'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  void _irAReservar() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      _solicitarLogin('Para reservar prendas en tienda debes iniciar sesión.');
      return;
    }

    // Verificar que haya stock para la variante seleccionada
    final stockVariante = _sucursales.fold<int>(
      0, (sum, s) => sum + s.stockDisponible
    );
    if (stockVariante == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Sin stock disponible para talla ${_selectedTalla.talla} / ${_selectedColor.nombre}. Prueba otra variante.',
          ),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CrearReservaScreen(
          prendaPreseleccionada: widget.prenda,
          colorPreseleccionado: _selectedColor.nombre.isNotEmpty
              ? _selectedColor.nombre
              : 'Estándar',
          tallaPreseleccionada: _selectedTalla.talla,
          onSwitchTab: widget.onSwitchTab,
        ),
      ),
    );
  }

  void _solicitarLogin(String razon) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSurface,
        title: const Text('Iniciar Sesión'),
        content: Text(razon),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Ahora no', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            child: const Text('Ingresar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.prenda;
    final bool hayStock = p.stockTotalDisponible > 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(p.nombre, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          Consumer<ComparadorProvider>(
            builder: (context, comp, _) {
              final esta = comp.estaEnComparador(p.idProducto);
              return IconButton(
                icon: Badge(
                  isLabelVisible: comp.cantidad > 0,
                  label: Text('${comp.cantidad}'),
                  child: Icon(
                    esta ? Icons.compare_arrows : Icons.add_chart_outlined,
                    color: esta ? AppTheme.accentGold : Colors.white70,
                  ),
                ),
                tooltip: 'Comparador de Outfits',
                onPressed: () {
                  final agregado = comp.togglePrenda(p);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(agregado
                          ? 'Prenda añadida al Comparador (${comp.cantidad}/3)'
                          : 'Prenda removida del Comparador'),
                      action: comp.puedeComparar
                          ? SnackBarAction(
                              label: 'VER',
                              textColor: AppTheme.accentGold,
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const ComparadorOutfitsScreen(),
                                  ),
                                );
                              },
                            )
                          : null,
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                // Imagen grande
                AspectRatio(
                  aspectRatio: 1.1,
                  child: CachedNetworkImage(
                    imageUrl: p.imagenPrincipal ??
                        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(color: AppTheme.bgSurface),
                    errorWidget: (_, __, ___) => Container(
                      color: AppTheme.bgSurface,
                      child: const Icon(Icons.broken_image_outlined, size: 48, color: AppTheme.textMuted),
                    ),
                  ),
                ),

                // Botón Vestidor Virtual con Realidad Aumentada (CU19)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.accentGold,
                      side: const BorderSide(color: AppTheme.accentGold, width: 1.5),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: AppTheme.accentGold.withOpacity(0.08),
                    ),
                    icon: const Icon(Icons.view_in_ar, size: 22),
                    label: const Text(
                      'PROBAR EN VESTIDOR VIRTUAL (RA)',
                      style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => VestidorArScreen(
                            prenda: p,
                            initialColor: _selectedColor,
                            initialTalla: _selectedTalla,
                          ),
                        ),
                      );
                    },
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Marca y precio
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.nombreMarca?.toUpperCase() ?? 'FASHIONSTORE',
                                  style: const TextStyle(
                                    color: AppTheme.accentGold,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  p.nombre,
                                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              if (p.descuentoPct > 0)
                                Text(
                                  'Bs. ${p.precioBase.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textMuted,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Descripción
                      if (p.descripcion != null && p.descripcion!.isNotEmpty) ...[
                        Text(
                          p.descripcion!,
                          style: const TextStyle(color: AppTheme.textSecondary, height: 1.4, fontSize: 13),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Selector de color
                      if (p.colores.isNotEmpty) ...[
                        const Text(
                          'COLOR',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 12,
                          children: p.colores.map((c) {
                            final isSelected = _selectedColor.idColor == c.idColor;
                            Color chipColor = Colors.grey;
                            try {
                              final hex = c.codigoHex.replaceAll('#', '');
                              chipColor = Color(int.parse('FF$hex', radix: 16));
                            } catch (_) {}

                            return InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () {
                                setState(() => _selectedColor = c);
                                _cargarDisponibilidad(
                                  talla: _selectedTalla.talla,
                                  color: c.nombre,
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppTheme.accentGold.withOpacity(0.15) : AppTheme.bgSurface,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? AppTheme.accentGold : AppTheme.border,
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 14,
                                      height: 14,
                                      decoration: BoxDecoration(
                                        color: chipColor,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white24),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      c.nombre,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        color: isSelected ? AppTheme.accentGold : AppTheme.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Selector de talla
                      if (p.tallas.isNotEmpty) ...[
                        const Text(
                          'TALLA',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 10,
                          children: p.tallas.map((t) {
                            final isSelected = _selectedTalla.idTalla == t.idTalla;
                            return ChoiceChip(
                              label: Text(t.talla),
                              selected: isSelected,
                              onSelected: (_) {
                                setState(() => _selectedTalla = t);
                                _cargarDisponibilidad(
                                  talla: t.talla,
                                  color: _selectedColor.nombre,
                                );
                              },
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),
                      ],

                      const Divider(),
                      const SizedBox(height: 16),

                      // Disponibilidad en tiendas físicas (CU10)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'DISPONIBILIDAD EN TIENDAS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color: AppTheme.textMuted,
                            ),
                          ),
                          Text(
                            hayStock ? '${p.stockTotalDisponible} unidades en red' : 'Sin stock global',
                            style: TextStyle(
                              fontSize: 11,
                              color: hayStock ? AppTheme.success : AppTheme.danger,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (_cargandoSucursales)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accentGold),
                            ),
                          ),
                        )
                      else if (_sucursales.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.bgSurface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: const Text(
                            'Esta prenda se despacha desde el almacén central.',
                            style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                          ),
                        )
                      else
                        ..._sucursales.map((s) {
                          final stockDisp = s.stockDisponible;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: AppTheme.bgSurface,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.storefront_outlined, size: 18, color: AppTheme.accentGold),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        s.nombreSucursal,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                      Text(
                                        '${s.direccion} • ${s.nombreCiudad}',
                                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: (stockDisp > 0 ? AppTheme.success : AppTheme.danger).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    stockDisp > 0 ? '$stockDisp disp.' : 'Agotado',
                                    style: TextStyle(
                                      color: stockDisp > 0 ? AppTheme.success : AppTheme.danger,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Botones inferiores de acción
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: const BoxDecoration(
              color: AppTheme.bgSurface,
              border: Border(top: BorderSide(color: AppTheme.border)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Reservar en probador (CU11)
                  Expanded(
                    flex: 1,
                    child: OutlinedButton(
                      onPressed: _irAReservar,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Reservar', style: TextStyle(fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Añadir a la bolsa (CU13)
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: (!hayStock || _agregandoAlCarrito) ? null : _agregarABolsa,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _agregandoAlCarrito
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.bgMain),
                            )
                          : const Text('Añadir a la Bolsa'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
