import 'package:flutter/foundation.dart';
import '../models/carrito.dart';
import '../services/api_service.dart';
import '../services/carrito_service.dart';

class CarritoProvider extends ChangeNotifier {
  final CarritoService _carritoService = CarritoService();

  Carrito? _carrito;
  bool _isLoading = false;
  String? _errorMessage;

  Carrito? get carrito => _carrito;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get totalItems => _carrito?.totalItems ?? 0;
  double get totalGeneral => _carrito?.totalGeneral ?? 0.0;
  List<CarritoItem> get items => _carrito?.items ?? [];
  bool get estaVacio => items.isEmpty;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void limpiar() {
    _carrito = null;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> cargarCarrito() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _carrito = await _carritoService.getCarrito();
    } on ApiException catch (e) {
      _errorMessage = e.message;
    } catch (e) {
      _errorMessage = 'No se pudo cargar el carrito: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> agregarItem({
    required int idProducto,
    required String talla,
    required String color,
    int cantidad = 1,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _carrito = await _carritoService.addItem(
        idProducto: idProducto,
        talla: talla,
        color: color,
        cantidad: cantidad,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'No se pudo agregar la prenda: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> actualizarCantidad(int idItem, int cantidad) async {
    try {
      _carrito = await _carritoService.updateCantidad(idItem, cantidad);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Error al actualizar cantidad: $e';
      notifyListeners();
      return false;
    }
  }

  Future<bool> eliminarItem(int idItem) async {
    try {
      _carrito = await _carritoService.removeItem(idItem);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Error al eliminar ítem: $e';
      notifyListeners();
      return false;
    }
  }

  Future<void> vaciar() async {
    try {
      await _carritoService.vaciarCarrito();
      _carrito = null;
      notifyListeners();
    } catch (_) {}
  }
}
