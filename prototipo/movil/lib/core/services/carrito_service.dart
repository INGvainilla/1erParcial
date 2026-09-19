import '../constants/api_constants.dart';
import '../models/carrito.dart';
import 'api_service.dart';

class CarritoService {
  final ApiService _api = ApiService();

  Future<Carrito> getCarrito() async {
    final response = await _api.get(ApiConstants.carrito, requiresAuth: true);
    return Carrito.fromJson(response);
  }

  Future<Carrito> addItem({
    required int idProducto,
    required String talla,
    required String color,
    int cantidad = 1,
  }) async {
    final response = await _api.post(
      ApiConstants.carritoItems,
      body: {
        'id_producto': idProducto,
        'talla': talla,
        'color': color,
        'cantidad': cantidad,
      },
      requiresAuth: true,
    );
    return Carrito.fromJson(response);
  }

  Future<Carrito> updateCantidad(int idItem, int cantidad) async {
    final response = await _api.patch(
      ApiConstants.carritoItem(idItem),
      body: {'cantidad': cantidad},
      requiresAuth: true,
    );
    return Carrito.fromJson(response);
  }

  Future<Carrito> removeItem(int idItem) async {
    final response = await _api.delete(
      ApiConstants.carritoItem(idItem),
      requiresAuth: true,
    );
    return Carrito.fromJson(response);
  }

  Future<void> vaciarCarrito() async {
    await _api.delete(ApiConstants.vaciarCarrito, requiresAuth: true);
  }
}
