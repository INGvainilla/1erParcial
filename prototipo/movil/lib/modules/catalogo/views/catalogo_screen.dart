import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:provider/provider.dart';
import '../../../core/models/catalogo_item.dart';
import '../../../core/services/catalogo_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/comparador_provider.dart';
import '../../../core/providers/gamificacion_provider.dart';
import 'detalle_prenda_screen.dart';
import 'comparador_outfits_screen.dart';
import '../../ia_recomendaciones/views/recomendaciones_ia_screen.dart';
import '../../ia_recomendaciones/widgets/modal_busqueda_voz.dart';

class CatalogoScreen extends StatefulWidget {
  final Function(int)? onSwitchTab;

  const CatalogoScreen({Key? key, this.onSwitchTab}) : super(key: key);

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  final CatalogoService _catalogoService = CatalogoService();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  List<PrendaCatalogo> _prendas = [];
  List<Map<String, dynamic>> _categorias = [];
  List<Map<String, dynamic>> _sucursales = [];

  bool _isLoading = true;
  String? _errorMessage;

  int? _selectedCategoriaId;
  int? _selectedSucursalId;

  @override
  void initState() {
    super.initState();
    _cargarFiltrosYCatalogo();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _cargarFiltrosYCatalogo() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _catalogoService.getCategorias(),
        _catalogoService.getSucursales(),
        _catalogoService.getCatalogo(
          busqueda: _searchController.text,
          idCategoria: _selectedCategoriaId,
          idSucursal: _selectedSucursalId,
        ),
      ]);

      if (!mounted) return;
      setState(() {
        _categorias = results[0] as List<Map<String, dynamic>>;
        _sucursales = results[1] as List<Map<String, dynamic>>;
        _prendas = results[2] as List<PrendaCatalogo>;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error al cargar catálogo: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _recargarCatalogo() async {
    try {
      final list = await _catalogoService.getCatalogo(
        busqueda: _searchController.text,
        idCategoria: _selectedCategoriaId,
        idSucursal: _selectedSucursalId,
      );
      if (!mounted) return;
      setState(() {
        _prendas = list;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error al filtrar: $e';
        _isLoading = false;
      });
    }
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      _recargarCatalogo();
    });
  }

  void _abrirBusquedaVoz() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.bgSurface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => ModalBusquedaVozReal(
        titulo: 'Búsqueda por Voz (CU23)',
        onTextoConfirmado: (texto) {
          _searchController.text = texto;
          _recargarCatalogo();
          try {
            context.read<GamificacionProvider>().registrarBonoAccion('BUSQUEDA_VOZ');
          } catch (_) {}
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'FASHIONSTORE',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.5,
                color: AppTheme.accentGold,
              ),
            ),
            const Text(
              'Colección Exclusiva Masculina',
              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, letterSpacing: 0.5),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppTheme.accentGold),
            tooltip: 'Estilista Virtual IA (CU22)',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const RecomendacionesIaScreen()),
              );
            },
          ),
          Consumer<ComparadorProvider>(
            builder: (context, comp, _) => IconButton(
              icon: Badge(
                isLabelVisible: comp.cantidad > 0,
                label: Text('${comp.cantidad}'),
                child: const Icon(Icons.compare_arrows, color: Colors.white70),
              ),
              tooltip: 'Comparador de Outfits (CU20)',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ComparadorOutfitsScreen()),
                );
              },
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            tooltip: 'Actualizar catálogo',
            onPressed: _cargarFiltrosYCatalogo,
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda boutique
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Buscar trajes, camisas, pantalones...',
                prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 20),
                suffixIcon: SizedBox(
                  width: _searchController.text.isNotEmpty ? 88 : 48,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear, size: 18, color: AppTheme.textMuted),
                          onPressed: () {
                            _searchController.clear();
                            _recargarCatalogo();
                          },
                        ),
                      IconButton(
                        icon: const Icon(Icons.mic, color: AppTheme.accentGold, size: 20),
                        tooltip: 'Búsqueda por Voz',
                        onPressed: _abrirBusquedaVoz,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Chips de categorías (Corregido: nombre_categoria y sin overflow)
          if (_categorias.isNotEmpty)
            SizedBox(
              height: 46,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                scrollDirection: Axis.horizontal,
                itemCount: _categorias.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    final isAll = _selectedCategoriaId == null;
                    return ChoiceChip(
                      label: const Text('Todas'),
                      selected: isAll,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      onSelected: (selected) {
                        if (!isAll) {
                          setState(() => _selectedCategoriaId = null);
                          _recargarCatalogo();
                        }
                      },
                    );
                  }
                  final cat = _categorias[index - 1];
                  final catId = cat['id_categoria'] as int;
                  final nombre = cat['nombre_categoria'] ?? cat['nombre'] ?? 'Categoría $catId';
                  final isSel = _selectedCategoriaId == catId;
                  return ChoiceChip(
                    label: Text(nombre.toString()),
                    selected: isSel,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    onSelected: (selected) {
                      setState(() => _selectedCategoriaId = selected ? catId : null);
                      _recargarCatalogo();
                    },
                  );
                },
              ),
            ),

          // Filtro por sucursal opcional
          if (_sucursales.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Row(
                children: [
                  const Icon(Icons.storefront, size: 16, color: AppTheme.accentGold),
                  const SizedBox(width: 6),
                  const Text('Tienda:', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int?>(
                        value: _selectedSucursalId,
                        isDense: true,
                        isExpanded: true,
                        dropdownColor: AppTheme.bgSurface,
                        style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12),
                        items: [
                          const DropdownMenuItem<int?>(
                            value: null,
                            child: Text('Todas las sucursales'),
                          ),
                          ..._sucursales.map((s) => DropdownMenuItem<int?>(
                                value: s['id_sucursal'] as int,
                                child: Text("${s['nombre_sucursal']} (${s['nombre_ciudad']})"),
                              )),
                        ],
                        onChanged: (val) {
                          setState(() => _selectedSucursalId = val);
                          _recargarCatalogo();
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 4),

          // Grid 2 columnas de prendas
          Expanded(
            child: _isLoading
                ? _buildShimmerGrid()
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.wifi_off, size: 48, color: AppTheme.textMuted),
                            const SizedBox(height: 12),
                            Text(_errorMessage!, style: const TextStyle(color: AppTheme.danger)),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _cargarFiltrosYCatalogo,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _prendas.isEmpty
                        ? const Center(
                            child: Text(
                              'No se encontraron prendas con los filtros seleccionados.',
                              style: TextStyle(color: AppTheme.textSecondary),
                            ),
                          )
                        : RefreshIndicator(
                            color: AppTheme.accentGold,
                            onRefresh: _cargarFiltrosYCatalogo,
                            child: GridView.builder(
                              padding: const EdgeInsets.all(16),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 14,
                                mainAxisSpacing: 14,
                                childAspectRatio: 0.65,
                              ),
                              itemCount: _prendas.length,
                              itemBuilder: (context, index) {
                                final p = _prendas[index];
                                return _buildPrendaCard(context, p);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrendaCard(BuildContext context, PrendaCatalogo p) {
    final bool hayStock = p.stockTotalDisponible > 0;

    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DetallePrendaScreen(
              prenda: p,
              onSwitchTab: widget.onSwitchTab,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.bgSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen de la prenda
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: p.imagenPrincipal ??
                        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      color: AppTheme.bgElevated,
                      child: const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accentGold),
                        ),
                      ),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      color: AppTheme.bgElevated,
                      child: const Icon(Icons.broken_image_outlined, color: AppTheme.textMuted),
                    ),
                  ),
                  if (!hayStock)
                    Container(
                      color: Colors.black.withOpacity(0.65),
                      alignment: Alignment.center,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.danger.withOpacity(0.85),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'AGOTADO',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Información
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.nombreMarca?.toUpperCase() ?? 'FASHIONSTORE',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppTheme.accentGold,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    p.nombre,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                      if (hayStock)
                        Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: Text(
                            '${p.stockTotalDisponible}u',
                            style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.65,
      ),
      itemCount: 6,
      itemBuilder: (_, __) {
        return Shimmer.fromColors(
          baseColor: AppTheme.bgSurface,
          highlightColor: AppTheme.bgElevated,
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.bgSurface,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      },
    );
  }
}
