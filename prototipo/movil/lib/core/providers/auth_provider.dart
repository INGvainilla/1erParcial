import 'package:flutter/foundation.dart';
import '../models/usuario.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  Usuario? _usuario;
  bool _isLoading = false;
  String? _errorMessage;

  Usuario? get usuario => _usuario;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _usuario != null;
  bool get isCliente => _usuario?.isCliente ?? false;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> initSession() async {
    final token = await _apiService.getToken();
    if (token == null || token.isEmpty) {
      _usuario = null;
      notifyListeners();
      return;
    }

    try {
      _isLoading = true;
      notifyListeners();

      final me = await _authService.getMe();
      if (!me.isCliente) {
        await _apiService.clearToken();
        _usuario = null;
        _errorMessage = 'Esta app es de uso exclusivo para clientes. El personal debe ingresar desde el portal web.';
      } else {
        _usuario = me;
        _errorMessage = null;
      }
    } catch (_) {
      await _apiService.clearToken();
      _usuario = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authService.login(email, password);

      // Gate: Solo clientes en la app móvil
      if (!user.isCliente) {
        await _authService.logout();
        _usuario = null;
        _errorMessage = 'Acceso restringido: Esta aplicación móvil es para clientes. El personal de tienda y administradores deben usar la plataforma web.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _usuario = user;
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Error inesperado al iniciar sesión: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> registro({
    required String nombres,
    required String apellidos,
    required String email,
    required String password,
    String? telefono,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _usuario = await _authService.registro(
        nombres: nombres,
        apellidos: apellidos,
        email: email,
        password: password,
        telefono: telefono,
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
      _errorMessage = 'Error inesperado al registrar usuario: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<String?> solicitarOtp(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final msg = await _authService.solicitarOtp(email);
      _isLoading = false;
      notifyListeners();
      return msg;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _errorMessage = 'Error al solicitar código OTP: $e';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> resetPasswordOtp({
    required String email,
    required String codigoOtp,
    required String nuevaPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.resetPasswordOtp(
        email: email,
        codigoOtp: codigoOtp,
        nuevaPassword: nuevaPassword,
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
      _errorMessage = 'Error al restablecer contraseña: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _usuario = null;
    _errorMessage = null;
    notifyListeners();
  }
}
