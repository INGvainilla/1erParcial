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

  // CU22: Solicitar Recomendación Contextual de IA, Paso 1.1: UI -> Ctrl : solicitar_recomendaciones(ciudad, ocasion, id_usuario)
  Future<void> cargarContexto({String? ciudad, String? ocasion}) async {
    if (ciudad != null) _ciudad = ciudad;
    if (ocasion != null) _ocasion = ocasion;

    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final urlClima = ApiConstants.recomendacionesClima(_ciudad);
      // CU22: Solicitar Recomendación Contextual de IA, Paso 1.2: Ctrl -> ClimaExt : consultarClimaActual(ciudad)
      final resClima = await _api.get(urlClima, requiresAuth: false);
      if (resClima is Map<String, dynamic>) {
        // CU22: Solicitar Recomendación Contextual de IA, Paso 1.3: ClimaExt --> Ctrl : retorna temperatura, sensación y condición
        _clima = ClimaLocal.fromJson(resClima);
      }

      final urlOutfits = ApiConstants.recomendacionesOutfits(ciudad: _ciudad, ocasion: _ocasion);
      // CU22: Solicitar Recomendación Contextual de IA, Paso 1.4: Ctrl -> LLMExt : generarRecomendacionEstilista(clima, ocasion, reglas_color)
      final resOutfits = await _api.get(urlOutfits, requiresAuth: false);
      if (resOutfits is Map<String, dynamic> && resOutfits.containsKey('outfits_recomendados')) {
        final rawList = resOutfits['outfits_recomendados'] as List<dynamic>? ?? [];
        // CU22: Solicitar Recomendación Contextual de IA, Paso 1.10: Ctrl --> UI : entrega listado de outfits y análisis del estilista
        _outfits = rawList.map((o) => OutfitRecomendado.fromJson(o as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _cargando = false;
      notifyListeners();
    }
  }

  // CU23: Buscar Productos por Comandos de Voz, Paso 1.1: UI -> Ctrl : procesar_busqueda_voz(audio_buffer / consulta_voz)
  Future<BusquedaVozResultado?> procesarComandoVoz(String textoVoz) async {
    _buscandoVoz = true;
    _errorVoz = null;
    _resultadoVoz = null;
    notifyListeners();

    try {
      // CU23: Buscar Productos por Comandos de Voz, Paso 1.4: Ctrl -> NLPExt : extraerIntencionesYEntidades(consulta_texto)
      final res = await _api.post(
        ApiConstants.busquedaVoz,
        body: {'consulta_voz': textoVoz},
        requiresAuth: false,
      );
      if (res is Map<String, dynamic>) {
        // CU23: Buscar Productos por Comandos de Voz, Paso 1.8: Ctrl --> UI : transfiere resultados y transcripción final
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
