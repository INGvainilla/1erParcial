import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/models/catalogo_item.dart';

class ComparadorProvider extends ChangeNotifier {
  final List<PrendaCatalogo> _prendas = [];

  List<PrendaCatalogo> get prendas => List.unmodifiable(_prendas);
  int get cantidad => _prendas.length;
  bool get estaLleno => _prendas.length >= 3;
  bool get puedeComparar => _prendas.length >= 2;

  bool estaEnComparador(int idProducto) {
    return _prendas.any((p) => p.idProducto == idProducto);
  }

  bool togglePrenda(PrendaCatalogo prenda) {
    if (estaEnComparador(prenda.idProducto)) {
      removerPrenda(prenda.idProducto);
      return false;
    } else {
      return agregarPrenda(prenda);
    }
  }

  bool agregarPrenda(PrendaCatalogo prenda) {
    if (_prendas.length >= 3) {
      return false;
    }
    if (!estaEnComparador(prenda.idProducto)) {
      _prendas.add(prenda);
      notifyListeners();
      return true;
    }
    return false;
  }

  void removerPrenda(int idProducto) {
    _prendas.removeWhere((p) => p.idProducto == idProducto);
    notifyListeners();
  }

  void limpiar() {
    _prendas.clear();
    notifyListeners();
  }

  double get totalPrecioBase {
    return _prendas.fold(0.0, (acc, p) => acc + p.precioBase);
  }

  double get totalPrecioFinal {
    return _prendas.fold(0.0, (acc, p) => acc + p.precioFinal);
  }

  double get ahorroTotal {
    return totalPrecioBase - totalPrecioFinal;
  }
}
