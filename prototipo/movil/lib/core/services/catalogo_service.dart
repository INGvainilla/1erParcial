import '../constants/api_constants.dart';
import '../models/catalogo_item.dart';
import 'api_service.dart';
import 'offline_devoluciones_service.dart';
import 'offline_catalogo_seed.dart';

class CatalogoService {
  final ApiService _api = ApiService();
  final OfflineDevolucionesService _offlineService = OfflineDevolucionesService();

  // CU10: Consultar Catálogo y Disponibilidad Omnicanal, Paso 1.1: consultarPrendas(criteriosFiltro)
  Future<List<PrendaCatalogo>> getCatalogo({
    String? busqueda,
    int? idCategoria,
    int? idMarca,
    int? idTemporada,
    int? idSucursal,
  }) async {
    final params = <String, String>{};
    if (busqueda != null && busqueda.trim().isNotEmpty) {
      params['busqueda'] = busqueda.trim();
    }
    if (idCategoria != null) params['id_categoria'] = idCategoria.toString();
    if (idMarca != null) params['id_marca'] = idMarca.toString();
    if (idTemporada != null) params['id_temporada'] = idTemporada.toString();
    if (idSucursal != null) params['id_sucursal'] = idSucursal.toString();

    String url = ApiConstants.catalogo;
    if (params.isNotEmpty) {
      final query = Uri(queryParameters: params).query;
      url = '$url?$query';
    }

    try {
      final response = await _api.get(url, requiresAuth: false);
      if (response is List) {
        final listMap = response.cast<Map<String, dynamic>>();
        _offlineService.guardarCatalogoOffline(listMap).catchError((_) {});
        return listMap.map((item) => PrendaCatalogo.fromJson(item)).toList();
      }
    } catch (_) {
      // Fallback a SQLite Local / Seed Offline (CU08)
      final offline = await _offlineService.obtenerCatalogoOffline(
        busqueda: busqueda,
        idCategoria: idCategoria,
        idSucursal: idSucursal,
      );
      if (offline.isNotEmpty) {
        return offline.map((item) => PrendaCatalogo.fromJson(item)).toList();
      }
      return OfflineCatalogoSeed.prendas
          .map((item) => PrendaCatalogo.fromJson(item))
          .toList();
    }
    return [];
  }

  // CU10: Consultar Catálogo y Disponibilidad Omnicanal, Paso 1.8: opt consultarDetallePrendaConStock(productoId)
  // CU10: Consultar Catálogo y Disponibilidad Omnicanal, Paso 1.4: consultarStockPorSucursal(producto_id, sucursalId)
  Future<List<StockSucursalItem>> getDisponibilidadSucursales(
    int idProducto, {
    String? talla,
    String? color,
  }) async {
    String url = ApiConstants.disponibilidadSucursales(idProducto);
    final params = <String, String>{};
    if (talla != null && talla.isNotEmpty) params['talla'] = talla;
    if (color != null && color.isNotEmpty) params['color'] = color;
    if (params.isNotEmpty) {
      url = '$url?${Uri(queryParameters: params).query}';
    }
    try {
      final response = await _api.get(url, requiresAuth: false);
      if (response is Map && response.containsKey('sucursales')) {
        final list = response['sucursales'] as List<dynamic>;
        return list.map((item) => StockSucursalItem.fromJson(item)).toList();
      }
    } catch (_) {
      final offline = await _offlineService.obtenerCatalogoOffline();
      final item = offline.firstWhere((p) => p['id_producto'] == idProducto, orElse: () => {});
      if (item.isNotEmpty && item['disponibilidad_sucursales'] != null) {
        final list = item['disponibilidad_sucursales'] as List<dynamic>;
        return list.map((s) => StockSucursalItem.fromJson(s)).toList();
      }
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getCategorias() async {
    try {
      final response = await _api.get(ApiConstants.categorias, requiresAuth: false);
      if (response is List) {
        final list = response.cast<Map<String, dynamic>>();
        _offlineService.guardarCategoriasOffline(list).catchError((_) {});
        return list;
      }
    } catch (_) {
      final offline = await _offlineService.obtenerCategoriasOffline();
      if (offline.isNotEmpty) return offline;
    }
    return OfflineCatalogoSeed.categorias;
  }

  Future<List<Map<String, dynamic>>> getMarcas() async {
    try {
      final response = await _api.get(ApiConstants.marcas, requiresAuth: false);
      if (response is List) {
        return response.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<List<Map<String, dynamic>>> getTemporadas() async {
    try {
      final response = await _api.get(ApiConstants.temporadas, requiresAuth: false);
      if (response is List) {
        return response.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<List<Map<String, dynamic>>> getSucursales() async {
    try {
      final response = await _api.get(ApiConstants.sucursales, requiresAuth: false);
      if (response is List) {
        final list = response.cast<Map<String, dynamic>>();
        _offlineService.guardarSucursalesOffline(list).catchError((_) {});
        return list;
      }
    } catch (_) {
      final offline = await _offlineService.obtenerSucursalesOffline();
      if (offline.isNotEmpty) return offline;
    }
    return OfflineCatalogoSeed.sucursales;
  }
}
