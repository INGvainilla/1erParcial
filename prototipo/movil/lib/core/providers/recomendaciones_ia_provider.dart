import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/constants/api_constants.dart';
import 'package:fashionstore_mobile/core/models/recomendacion_ia.dart';
import 'package:fashionstore_mobile/core/models/busqueda_voz.dart';
import 'package:fashionstore_mobile/core/services/api_service.dart';

class RecomendacionesIaProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  ClimaLocal? _clima;
  List<OutfitRecomendado> _outfits = [];
  String _ciudad = 'Santa Cruz';
  String _ocasion = 'TODAS';
  bool _cargando = false;
  String? _error;

  BusquedaVozResultado? _resultadoVoz;
  bool _buscandoVoz = false;
  String? _errorVoz;

  ClimaLocal? get clima => _clima;
  List<OutfitRecomendado> get outfits => List.unmodifiable(_outfits);
  String get ciudad => _ciudad;
  String get ocasion => _ocasion;
  bool get cargando => _cargando;
  String? get error => _error;

  BusquedaVozResultado? get resultadoVoz => _resultadoVoz;
  bool get buscandoVoz => _buscandoVoz;
  String? get errorVoz => _errorVoz;

  Future<void> cargarContexto({String? ciudad, String? ocasion}) async {
    if (ciudad != null) _ciudad = ciudad;
    if (ocasion != null) _ocasion = ocasion;

    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final urlClima = ApiConstants.recomendacionesClima(_ciudad);
      final resClima = await _api.get(urlClima, requiresAuth: false);
      if (resClima is Map<String, dynamic>) {
        _clima = ClimaLocal.fromJson(resClima);
      }

      final urlOutfits = ApiConstants.recomendacionesOutfits(ciudad: _ciudad, ocasion: _ocasion);
      final resOutfits = await _api.get(urlOutfits, requiresAuth: false);
      if (resOutfits is Map<String, dynamic> && resOutfits.containsKey('outfits_recomendados')) {
        final rawList = resOutfits['outfits_recomendados'] as List<dynamic>? ?? [];
        _outfits = rawList.map((o) => OutfitRecomendado.fromJson(o as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _cargando = false;
      notifyListeners();
    }
  }

  Future<BusquedaVozResultado?> procesarComandoVoz(String textoVoz) async {
    _buscandoVoz = true;
    _errorVoz = null;
    _resultadoVoz = null;
    notifyListeners();

    try {
      final res = await _api.post(
        ApiConstants.busquedaVoz,
        body: {'consulta_voz': textoVoz},
        requiresAuth: false,
      );
      if (res is Map<String, dynamic>) {
        _resultadoVoz = BusquedaVozResultado.fromJson(res);
        return _resultadoVoz;
      }
      return null;
    } catch (e) {
      _errorVoz = e.toString();
      return null;
    } finally {
      _buscandoVoz = false;
      notifyListeners();
    }
  }

  void limpiarResultadoVoz() {
    _resultadoVoz = null;
    _errorVoz = null;
    notifyListeners();
  }
}
