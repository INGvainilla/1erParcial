import '../constants/api_constants.dart';
import '../models/catalogo_item.dart';
import 'api_service.dart';

class CatalogoService {
  final ApiService _api = ApiService();

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

    final response = await _api.get(url, requiresAuth: false);
    if (response is List) {
      return response.map((item) => PrendaCatalogo.fromJson(item)).toList();
    }
    return [];
  }

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
    final response = await _api.get(url, requiresAuth: false);
    if (response is Map && response.containsKey('sucursales')) {
      final list = response['sucursales'] as List<dynamic>;
      return list.map((item) => StockSucursalItem.fromJson(item)).toList();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getCategorias() async {
    final response = await _api.get(ApiConstants.categorias, requiresAuth: false);
    if (response is List) {
      return response.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getMarcas() async {
    final response = await _api.get(ApiConstants.marcas, requiresAuth: false);
    if (response is List) {
      return response.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getTemporadas() async {
    final response = await _api.get(ApiConstants.temporadas, requiresAuth: false);
    if (response is List) {
      return response.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getSucursales() async {
    final response = await _api.get(ApiConstants.sucursales, requiresAuth: false);
    if (response is List) {
      return response.cast<Map<String, dynamic>>();
    }
    return [];
  }
}
