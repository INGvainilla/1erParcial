import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/constants/api_constants.dart';
import 'package:fashionstore_mobile/core/models/gamificacion.dart';
import 'package:fashionstore_mobile/core/services/api_service.dart';

class GamificacionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  GamificacionPerfil? _perfil;
  List<RecompensaItem> _recompensas = [];
  List<CuponUsuarioItem> _misCupones = [];
  bool _cargando = false;
  String? _error;

  GamificacionPerfil? get perfil => _perfil;
  List<RecompensaItem> get recompensas => List.unmodifiable(_recompensas);
  List<CuponUsuarioItem> get misCupones => List.unmodifiable(_misCupones);
  bool get cargando => _cargando;
  String? get error => _error;

  // CU21: Gestionar Fidelización Gamificada, Paso Consulta: UI -> Ctrl : getPerfilGamificacion(id_usuario)
  Future<void> cargarPerfil() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.get(ApiConstants.gamificacionPerfil);
      if (res is Map<String, dynamic>) {
        // CU21: Gestionar Fidelización Gamificada, Paso Consulta 1.2: retorna puntos_actuales y nivel
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

  // CU21: Gestionar Fidelización Gamificada, Paso 2: Selecciona recompensa y solicita canje
  // CU21: Gestionar Fidelización Gamificada, Paso 2.1: canjear_recompensa(id_usuario, codigo_recompensa)
  Future<Map<String, dynamic>> canjearRecompensa(String codigoRecompensa) async {
    try {
      final res = await _api.post(
        ApiConstants.gamificacionCanjear,
        body: {'codigo_recompensa': codigoRecompensa},
      );
      if (res is Map<String, dynamic>) {
        // CU21: Gestionar Fidelización Gamificada, Paso 2.8: devuelve cupón listo para usar en checkout
        await cargarPerfil();
        await cargarRecompensas();
        await cargarMisCupones();
        return res;
      }
      return {'exito': false, 'mensaje': 'Respuesta inesperada del servidor.'};
    } catch (e) {
      return {'exito': false, 'mensaje': e.toString()};
    }
  }

  Future<void> cargarMisCupones() async {
    try {
      final res = await _api.get(ApiConstants.gamificacionMisCupones);
      if (res is List) {
        _misCupones = res.map((c) => CuponUsuarioItem.fromJson(c as Map<String, dynamic>)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error cargando mis cupones: $e');
    }
  }

  Future<ValidarCuponResult> validarCupon(String codigoCupon) async {
    try {
      final res = await _api.post(
        ApiConstants.gamificacionValidarCupon,
        body: {'codigo_cupon': codigoCupon.trim().toUpperCase()},
      );
      if (res is Map<String, dynamic>) {
        return ValidarCuponResult.fromJson(res);
      }
      return ValidarCuponResult(
        valido: false,
        mensaje: 'Error de formato en la respuesta del servidor.',
        montoDescuento: 0.0,
        tipoBeneficio: 'DESCUENTO_MONTO',
      );
    } catch (e) {
      return ValidarCuponResult(
        valido: false,
        mensaje: e.toString().replaceAll('Exception: ', ''),
        montoDescuento: 0.0,
        tipoBeneficio: 'DESCUENTO_MONTO',
      );
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
