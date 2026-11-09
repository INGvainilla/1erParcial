import '../constants/api_constants.dart';
import '../models/carrito.dart';
import 'api_service.dart';
import 'network_service.dart';
import 'offline_devoluciones_service.dart';

class CarritoService {
  final ApiService _api = ApiService();
  final OfflineDevolucionesService _offlineService = OfflineDevolucionesService();

  Future<Carrito> getCarrito() async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) {
      return await _offlineService.obtenerCarritoOffline();
    }

    try {
      final response = await _api.get(ApiConstants.carrito, requiresAuth: true);
      return Carrito.fromJson(response);
    } catch (_) {
      return await _offlineService.obtenerCarritoOffline();
    }
  }

  // CU13: Administrar Carrito de Compras Omnicanal, Paso 1.1: agregar_item(id_usuario, datos_item)
  Future<Carrito> addItem({
    required int idProducto,
    required String talla,
    required String color,
    int cantidad = 1,
    String? nombreProducto,
    String? codigoSkuBase,
    String? imagenPrincipal,
    double? precioUnitario,
    bool bypassingOffline = false,
  }) async {
    if (!bypassingOffline) {
      final tieneNet = await NetworkService.tieneInternetReal();
      if (!tieneNet) {
        return await _offlineService.guardarItemCarritoOffline(
          idProducto: idProducto,
          talla: talla,
          color: color,
          cantidad: cantidad,
          nombre: nombreProducto,
          sku: codigoSkuBase,
          imagen: imagenPrincipal,
          precio: precioUnitario,
        );
      }
    }

    try {
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
    } on ApiException catch (e) {
      if (!bypassingOffline &&
          (e.statusCode == 0 ||
              e.message.contains('No se pudo conectar') ||
              e.message.contains('SocketException') ||
              e.message.contains('Network is unreachable'))) {
        return await _offlineService.guardarItemCarritoOffline(
          idProducto: idProducto,
          talla: talla,
          color: color,
          cantidad: cantidad,
          nombre: nombreProducto,
          sku: codigoSkuBase,
          imagen: imagenPrincipal,
          precio: precioUnitario,
        );
      }
      rethrow;
    } catch (e) {
      if (!bypassingOffline) {
        return await _offlineService.guardarItemCarritoOffline(
          idProducto: idProducto,
          talla: talla,
          color: color,
          cantidad: cantidad,
          nombre: nombreProducto,
          sku: codigoSkuBase,
          imagen: imagenPrincipal,
          precio: precioUnitario,
        );
      }
      rethrow;
    }
  }

  // CU13: Administrar Carrito de Compras Omnicanal, Paso 2.1: actualizar_cantidad(id_item, nueva_cant)
  Future<Carrito> updateCantidad(int idItem, int cantidad) async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) {
      return await _offlineService.actualizarCantidadCarritoOffline(idItem, cantidad);
    }

    try {
      final response = await _api.patch(
        ApiConstants.carritoItem(idItem),
        body: {'cantidad': cantidad},
        requiresAuth: true,
      );
      return Carrito.fromJson(response);
    } catch (_) {
      return await _offlineService.actualizarCantidadCarritoOffline(idItem, cantidad);
    }
  }

  // CU13: Administrar Carrito de Compras Omnicanal, Paso 2.3: actualizarOCantidadCeroEliminar(id_item, 0)
  Future<Carrito> removeItem(int idItem) async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) {
      return await _offlineService.eliminarItemCarritoOffline(idItem);
    }

    try {
      final response = await _api.delete(
        ApiConstants.carritoItem(idItem),
        requiresAuth: true,
      );
      return Carrito.fromJson(response);
    } catch (_) {
      return await _offlineService.eliminarItemCarritoOffline(idItem);
    }
  }

  Future<void> vaciarCarrito() async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) {
      await _offlineService.vaciarCarritoOffline();
      return;
    }

    try {
      await _api.delete(ApiConstants.vaciarCarrito, requiresAuth: true);
    } catch (_) {
      await _offlineService.vaciarCarritoOffline();
    }
  }
}
