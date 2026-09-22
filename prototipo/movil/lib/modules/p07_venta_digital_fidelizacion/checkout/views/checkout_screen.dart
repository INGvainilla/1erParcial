import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fashionstore_mobile/core/models/gamificacion.dart';
import 'package:fashionstore_mobile/core/providers/auth_provider.dart';
import 'package:fashionstore_mobile/core/providers/carrito_provider.dart';
import 'package:fashionstore_mobile/core/providers/gamificacion_provider.dart';
import 'package:fashionstore_mobile/core/services/api_service.dart';
import 'package:fashionstore_mobile/core/services/catalogo_service.dart';
import 'package:fashionstore_mobile/core/services/ordenes_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p09_procesamiento_pagos/pagos/views/pago_orden_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final Function(int)? onSwitchTab;
  final String? initialCupon;

  const CheckoutScreen({Key? key, this.onSwitchTab, this.initialCupon}) : super(key: key);

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final OrdenesService _ordenesService = OrdenesService();
  final CatalogoService _catalogoService = CatalogoService();

  String _modalidadEntrega = 'DELIVERY'; // 'DELIVERY' o 'RETIRO_TIENDA'
  int? _selectedSucursalId;
  final _direccionController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _nitController = TextEditingController();
  final _razonSocialController = TextEditingController();
  final _notasController = TextEditingController();
  final _cuponController = TextEditingController();

  ValidarCuponResult? _cuponAplicado;
  bool _isValidatingCupon = false;
  String? _cuponError;

  List<Map<String, dynamic>> _sucursales = [];
  bool _isLoadingSucursales = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.usuario != null) {
      _razonSocialController.text = auth.usuario!.displayName;
      _nitController.text = '4859201'; // Default CI for demo
      _telefonoController.text = '70012345';
      _direccionController.text = 'Av. San Martín #450, Equipetrol, Santa Cruz';
    }
    _cargarSucursales();

    if (widget.initialCupon != null && widget.initialCupon!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _aplicarCupon(widget.initialCupon);
      });
    }
  }

  @override
  void dispose() {
    _direccionController.dispose();
    _telefonoController.dispose();
    _nitController.dispose();
    _razonSocialController.dispose();
    _notasController.dispose();
    _cuponController.dispose();
    super.dispose();
  }

  Future<void> _cargarSucursales() async {
    try {
      final sucs = await _catalogoService.getSucursales();
      if (!mounted) return;
      setState(() {
        _sucursales = sucs;
        if (_sucursales.isNotEmpty) {
          _selectedSucursalId = _sucursales.first['id_sucursal'] as int;
        }
        _isLoadingSucursales = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoadingSucursales = false);
    }
  }

  Future<void> _aplicarCupon([String? codigoDirecto]) async {
    final codigo = (codigoDirecto ?? _cuponController.text).trim().toUpperCase();
    if (codigo.isEmpty) {
      setState(() => _cuponError = 'Ingresa un código de cupón.');
      return;
    }

    setState(() {
      _isValidatingCupon = true;
      _cuponError = null;
    });

    try {
      final gProvider = Provider.of<GamificacionProvider>(context, listen: false);
      final res = await gProvider.validarCupon(codigo);
      if (!mounted) return;

      if (res.valido) {
        setState(() {
          _cuponAplicado = res;
          _cuponController.text = res.codigoCupon ?? codigo;
          _cuponError = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Cupón aplicado exitosamente! ${res.mensaje}'),
            backgroundColor: AppTheme.success,
            duration: const Duration(seconds: 2),
          ),
        );
      } else {
        setState(() {
          _cuponAplicado = null;
          _cuponError = res.mensaje;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _cuponAplicado = null;
        _cuponError = 'Error validando cupón: $e';
      });
    } finally {
      if (mounted) setState(() => _isValidatingCupon = false);
    }
  }

  void _removerCupon() {
    setState(() {
      _cuponAplicado = null;
      _cuponController.clear();
      _cuponError = null;
    });
  }

  void _mostrarSelectorCupones() {
    final gProvider = Provider.of<GamificacionProvider>(context, listen: false);
    gProvider.cargarMisCupones();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Consumer<GamificacionProvider>(
          builder: (context, gp, _) {
            final disponibles = gp.misCupones.where((c) => !c.utilizado).toList();

            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.confirmation_number_outlined, color: AppTheme.accentGold),
                          SizedBox(width: 8),
                          Text(
                            'Mis Cupones Disponibles',
                            style: TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppTheme.textMuted),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (disponibles.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(20),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppTheme.bgMain,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.sentiment_dissatisfied_outlined, color: AppTheme.textMuted, size: 36),
                          SizedBox(height: 8),
                          Text(
                            'No tienes cupones activos sin usar.',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Canjea tus puntos en el Club VIP para obtener descuentos.',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  else
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: disponibles.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, idx) {
                          final cup = disponibles[idx];
                          final isSelected = _cuponAplicado?.codigoCupon == cup.codigoCupon;

                          return InkWell(
                            onTap: () {
                              Navigator.pop(ctx);
                              _aplicarCupon(cup.codigoCupon);
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isSelected ? AppTheme.accentGold.withOpacity(0.12) : AppTheme.bgMain,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected ? AppTheme.accentGold : AppTheme.border,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accentGold.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.local_offer, color: AppTheme.accentGold, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          cup.codigoCupon,
                                          style: const TextStyle(
                                            color: AppTheme.accentGold,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            letterSpacing: 1,
                                          ),
                                        ),
                                        Text(
                                          cup.tipoBeneficio == 'ENVIO_GRATIS'
                                              ? 'Envío Nacional Gratis'
                                              : 'Descuento de Bs. ${cup.montoDescuento.toStringAsFixed(2)}',
                                          style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12),
                                        ),
                                        if (cup.diasRestantes > 0)
                                          Text(
                                            'Válido por ${cup.diasRestantes} días más',
                                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                                          ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.pop(ctx);
                                      _aplicarCupon(cup.codigoCupon);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.accentGold,
                                      foregroundColor: AppTheme.bgMain,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    child: const Text('APLICAR'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _procesarOrden() async {
    final cart = Provider.of<CarritoProvider>(context, listen: false);
    if (cart.items.isEmpty) {
      setState(() => _errorMessage = 'Tu bolsa de compras está vacía.');
      return;
    }

    if (_modalidadEntrega == 'RETIRO_TIENDA' && _selectedSucursalId == null) {
      setState(() => _errorMessage = 'Selecciona una sucursal para el retiro.');
      return;
    }

    if (_modalidadEntrega == 'DELIVERY' && _direccionController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Ingresa la dirección completa para el delivery.');
      return;
    }

    if (_nitController.text.trim().isEmpty || _razonSocialController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Ingresa el NIT/CI y Razón Social para la factura fiscal.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final orden = await _ordenesService.checkout(
        modalidadEntrega: _modalidadEntrega,
        idSucursal: _modalidadEntrega == 'RETIRO_TIENDA' ? _selectedSucursalId : null,
        direccionEnvio: _modalidadEntrega == 'DELIVERY' ? _direccionController.text.trim() : null,
        telefonoContacto: _telefonoController.text.trim().isNotEmpty ? _telefonoController.text.trim() : null,
        nitFactura: _nitController.text.trim(),
        razonSocialFactura: _razonSocialController.text.trim(),
        notasEntrega: _notasController.text.trim().isNotEmpty ? _notasController.text.trim() : null,
        codigoCupon: _cuponAplicado?.codigoCupon,
      );

      // Recargar carrito (el backend ya lo vació transaccionalmente)
      await cart.cargarCarrito();

      if (!mounted) return;
      // Redirigir a pantalla de pago directo
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => PagoOrdenScreen(
            orden: orden,
            onSwitchTab: widget.onSwitchTab,
          ),
        ),
      );
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Error inesperado al generar orden: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CarritoProvider>(context);

    final double costoEnvio;
    if (_modalidadEntrega == 'DELIVERY') {
      if (_cuponAplicado != null && _cuponAplicado!.tipoBeneficio == 'ENVIO_GRATIS') {
        costoEnvio = 0.0;
      } else {
        costoEnvio = 25.0;
      }
    } else {
      costoEnvio = 0.0;
    }

    final double descuentoCupon;
    if (_cuponAplicado != null && _cuponAplicado!.tipoBeneficio != 'ENVIO_GRATIS') {
      descuentoCupon = _cuponAplicado!.montoDescuento;
    } else {
      descuentoCupon = 0.0;
    }

    final double totalFinal = (cart.totalGeneral - descuentoCupon + costoEnvio).clamp(0.0, double.infinity);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirmar Compra (Checkout)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: AppTheme.danger.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.danger.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppTheme.danger, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.danger, fontSize: 13)),
                    ),
                  ],
                ),
              ),

            // 1. Modalidad de entrega
            const Text(
              '1. MODALIDAD DE ENTREGA',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildModalidadOption(
                    title: 'Delivery',
                    subtitle: 'Tarifa Bs. 25.00',
                    icon: Icons.delivery_dining_outlined,
                    isSelected: _modalidadEntrega == 'DELIVERY',
                    onTap: () => setState(() => _modalidadEntrega = 'DELIVERY'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildModalidadOption(
                    title: 'Retiro en Tienda',
                    subtitle: 'Gratis en sucursal',
                    icon: Icons.storefront_outlined,
                    isSelected: _modalidadEntrega == 'RETIRO_TIENDA',
                    onTap: () => setState(() => _modalidadEntrega = 'RETIRO_TIENDA'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_modalidadEntrega == 'DELIVERY') ...[
              TextField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección de Entrega',
                  prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.accentGold, size: 20),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _telefonoController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Teléfono de Contacto',
                  prefixIcon: Icon(Icons.phone_outlined, color: AppTheme.accentGold, size: 20),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _notasController,
                decoration: const InputDecoration(
                  labelText: 'Instrucciones para el repartidor (opcional)',
                  prefixIcon: Icon(Icons.notes_outlined, color: AppTheme.textMuted, size: 20),
                ),
              ),
            ] else ...[
              if (_isLoadingSucursales)
                const Center(child: CircularProgressIndicator(color: AppTheme.accentGold))
              else
                DropdownButtonFormField<int>(
                  isExpanded: true,
                  value: _selectedSucursalId,
                  decoration: const InputDecoration(
                    labelText: 'Sucursal de Retiro',
                    prefixIcon: Icon(Icons.storefront_outlined, color: AppTheme.accentGold, size: 20),
                  ),
                  dropdownColor: AppTheme.bgSurface,
                  items: _sucursales.map((s) {
                    return DropdownMenuItem<int>(
                      value: s['id_sucursal'] as int,
                      child: Text(
                        "${s['nombre_sucursal']} (${s['nombre_ciudad']})",
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedSucursalId = val),
                ),
            ],

            const SizedBox(height: 28),

            // 2. Datos de Facturación Fiscal (Bolivia)
            const Text(
              '2. FACTURACIÓN FISCAL',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _nitController,
              decoration: const InputDecoration(
                labelText: 'NIT o Carnet de Identidad',
                prefixIcon: Icon(Icons.badge_outlined, color: AppTheme.accentGold, size: 20),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _razonSocialController,
              decoration: const InputDecoration(
                labelText: 'Razón Social / Nombre Completo',
                prefixIcon: Icon(Icons.person_outline, color: AppTheme.accentGold, size: 20),
              ),
            ),

            const SizedBox(height: 28),

            // 3. Cupón de Descuento / Fidelización VIP
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '3. CUPÓN DE DESCUENTO / VIP',
                  style: TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                TextButton.icon(
                  onPressed: _mostrarSelectorCupones,
                  icon: const Icon(Icons.confirmation_number_outlined, size: 16, color: AppTheme.accentGold),
                  label: const Text(
                    'Ver mis cupones',
                    style: TextStyle(color: AppTheme.accentGold, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (_cuponAplicado == null) ...[
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _cuponController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        hintText: 'Ej. CUPON_25BS o FS-VIP',
                        labelText: 'Código de Cupón',
                        prefixIcon: Icon(Icons.local_offer_outlined, color: AppTheme.accentGold, size: 20),
                        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                      onSubmitted: (_) => _aplicarCupon(),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: _isValidatingCupon ? null : () => _aplicarCupon(),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    child: _isValidatingCupon
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                          )
                        : const Text('Aplicar', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              if (_cuponError != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: AppTheme.danger, size: 16),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _cuponError!,
                        style: const TextStyle(color: AppTheme.danger, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ] else ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.success.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.success.withOpacity(0.5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppTheme.success, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  _cuponAplicado!.codigoCupon ?? _cuponController.text,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: AppTheme.success,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.success.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'APLICADO',
                                  style: TextStyle(color: AppTheme.success, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _cuponAplicado!.tipoBeneficio == 'ENVIO_GRATIS'
                                ? 'Beneficio: Costo de envío 100% bonificado (Gratis).'
                                : 'Descuento aplicado: Bs. ${_cuponAplicado!.montoDescuento.toStringAsFixed(2)}',
                            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textMuted, size: 20),
                      tooltip: 'Remover cupón',
                      onPressed: _removerCupon,
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 28),

            // 4. Resumen de la Orden
            const Text(
              '4. RESUMEN DE LA ORDEN',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Prendas (${cart.totalItems})', style: const TextStyle(color: AppTheme.textSecondary)),
                      Text('Bs. ${cart.totalGeneral.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                  if (descuentoCupon > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              const Icon(Icons.local_offer, size: 14, color: AppTheme.success),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  'Descuento Cupón (${_cuponAplicado?.codigoCupon ?? ''})',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: AppTheme.success, fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '- Bs. ${descuentoCupon.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Costo de Entrega', style: TextStyle(color: AppTheme.textSecondary)),
                      Text(
                        _modalidadEntrega == 'RETIRO_TIENDA'
                            ? 'Gratis (En Sucursal)'
                            : (_cuponAplicado?.tipoBeneficio == 'ENVIO_GRATIS'
                                ? 'Gratis (Cupón Envío)'
                                : 'Bs. ${costoEnvio.toStringAsFixed(2)}'),
                        style: TextStyle(
                          color: costoEnvio > 0 ? AppTheme.textPrimary : AppTheme.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Divider(),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total a Pagar',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Bs. ${totalFinal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.accentGold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _procesarOrden,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                      )
                    : const Text(
                        'Confirmar y Proceder al Pago',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModalidadOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accentGold.withOpacity(0.12) : AppTheme.bgSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.accentGold : AppTheme.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: isSelected ? AppTheme.accentGold : AppTheme.textSecondary, size: 24),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: isSelected ? AppTheme.accentGold : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
