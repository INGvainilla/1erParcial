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

  // CU01: Autenticar Usuario (Login RBAC), Paso 1.1: AuthProvider coordina la autenticación del usuario desde la app móvil
  Future<bool> login(String email, String password) async {
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.1.0: Inicializar estado de carga y resetear errores previos
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // CU01: Autenticar Usuario (Login RBAC), Paso 1.1.1: Invocar AuthService para enviar credenciales al backend
      final user = await _authService.login(email, password);

      // CU01: Autenticar Usuario (Login RBAC), Paso 1.4: Validación RBAC en cliente - Restricción de acceso para la App Móvil (solo CLIENTE)
      if (!user.isCliente) {
        await _authService.logout();
        _usuario = null;
        _errorMessage = 'Acceso restringido: Esta aplicación móvil es para clientes. El personal de tienda y administradores deben usar la plataforma web.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // CU01: Autenticar Usuario (Login RBAC), Paso 1.7: Almacenar usuario autenticado en el estado global
      _usuario = user;
      _isLoading = false;
      notifyListeners();
      return true;
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.5.5: Captura de error de API (401 credenciales inválidas / 403 bloqueo preventivo)
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

  // CU02: Registrar Cliente (Sign Up), Paso 1.1: AuthProvider procesa el auto-registro del cliente móvil
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
      // CU02: Registrar Cliente (Sign Up), Paso 1.1.1: Invocar servicio de registro en backend
      _usuario = await _authService.registro(
        nombres: nombres,
        apellidos: apellidos,
        email: email,
        password: password,
        telefono: telefono,
      );
      // CU02: Registrar Cliente (Sign Up), Paso 1.7: Actualizar sesión activa del cliente registrado
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

  // CU03: Recuperar Contraseña (Token OTP), Paso 1.1: AuthProvider despacha la solicitud de emisión de código OTP
  Future<String?> solicitarOtp(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // CU03: Recuperar Contraseña (Token OTP), Paso 1.1.1: Invocar backend para generar y enviar OTP por correo
      final msg = await _authService.solicitarOtp(email);
      // CU03: Recuperar Contraseña (Token OTP), Paso 1.6: Retornar mensaje de éxito
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

  // CU03: Recuperar Contraseña (Token OTP), Paso 2.1: AuthProvider envía código OTP y nueva clave para su restablecimiento
  Future<bool> resetPasswordOtp({
    required String email,
    required String codigoOtp,
    required String nuevaPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // CU03: Recuperar Contraseña (Token OTP), Paso 2.1.1: Invocar verificación y cambio en backend
      await _authService.resetPasswordOtp(
        email: email,
        codigoOtp: codigoOtp,
        nuevaPassword: nuevaPassword,
      );
      // CU03: Recuperar Contraseña (Token OTP), Paso 2.7: Confirmación de contraseña actualizada
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
