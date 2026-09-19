import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/constants/api_constants.dart';
import 'package:fashionstore_mobile/core/models/gamificacion.dart';
import 'package:fashionstore_mobile/core/services/api_service.dart';

class GamificacionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  GamificacionPerfil? _perfil;
  List<RecompensaItem> _recompensas = [];
  bool _cargando = false;
  String? _error;

  GamificacionPerfil? get perfil => _perfil;
  List<RecompensaItem> get recompensas => List.unmodifiable(_recompensas);
  bool get cargando => _cargando;
  String? get error => _error;

  Future<void> cargarPerfil() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.get(ApiConstants.gamificacionPerfil);
      if (res is Map<String, dynamic>) {
        _perfil = GamificacionPerfil.fromJson(res);
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _cargando = false;
      notifyListeners();
    }
  }

  Future<void> cargarRecompensas() async {
    try {
      final res = await _api.get(ApiConstants.gamificacionRecompensas);
      if (res is List) {
        _recompensas = res.map((r) => RecompensaItem.fromJson(r as Map<String, dynamic>)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error cargando recompensas: $e');
    }
  }

  Future<Map<String, dynamic>> canjearRecompensa(String codigoRecompensa) async {
    try {
      final res = await _api.post(
        ApiConstants.gamificacionCanjear,
        body: {'codigo_recompensa': codigoRecompensa},
      );
      if (res is Map<String, dynamic>) {
        await cargarPerfil();
        await cargarRecompensas();
        return res;
      }
      return {'exito': false, 'mensaje': 'Respuesta inesperada del servidor.'};
    } catch (e) {
      return {'exito': false, 'mensaje': e.toString()};
    }
  }

  Future<void> registrarBonoAccion(String accion) async {
    try {
      await _api.post(
        ApiConstants.gamificacionBonoAccion,
        body: {'accion': accion},
      );
      await cargarPerfil();
    } catch (e) {
      debugPrint('Error registrando bono de accion: $e');
    }
  }
}
