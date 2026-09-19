import '../constants/api_constants.dart';
import '../models/usuario.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<Usuario> login(String email, String password) async {
    final response = await _api.post(
      ApiConstants.login,
      body: {
        'email': email,
        'password': password,
        'recordar_sesion': true,
      },
      requiresAuth: false,
    );

    final token = response['access_token'];
    if (token != null) {
      await _api.saveToken(token);
    }
    return Usuario.fromJson(response, token: token);
  }

  Future<Usuario> registro({
    required String nombres,
    required String apellidos,
    required String email,
    required String password,
    String? telefono,
  }) async {
    final response = await _api.post(
      ApiConstants.registro,
      body: {
        'nombres': nombres,
        'apellidos': apellidos,
        'email': email,
        'password': password,
        if (telefono != null && telefono.isNotEmpty) 'telefono': telefono,
      },
      requiresAuth: false,
    );
    final token = response['access_token'] as String?;
    if (token != null) {
      await _api.saveToken(token);
    }
    return Usuario.fromJson(response, token: token);
  }

  Future<String> solicitarOtp(String email) async {
    final response = await _api.post(
      ApiConstants.solicitarOtp,
      body: {'email': email},
      requiresAuth: false,
    );
    return response['mensaje'] ?? 'Código de recuperación enviado.';
  }

  Future<void> resetPasswordOtp({
    required String email,
    required String codigoOtp,
    required String nuevaPassword,
  }) async {
    await _api.post(
      ApiConstants.verificarOtp,
      body: {
        'email': email,
        'codigo_otp': codigoOtp,
        'nueva_password': nuevaPassword,
      },
      requiresAuth: false,
    );
  }

  Future<Usuario> getMe() async {
    final response = await _api.get(ApiConstants.me, requiresAuth: true);
    final token = await _api.getToken();
    return Usuario.fromJson(response, token: token);
  }

  Future<void> logout() async {
    await _api.clearToken();
  }
}
