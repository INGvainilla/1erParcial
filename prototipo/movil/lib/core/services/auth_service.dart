import '../constants/api_constants.dart';
import '../models/usuario.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  // CU01: Autenticar Usuario (Login RBAC), Paso 1.1: Cliente Móvil invoca el endpoint POST /auth/login hacia AutenticacionControl
  Future<Usuario> login(String email, String password) async {
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.1.1: Despachar petición HTTP POST con credenciales JSON
    final response = await _api.post(
      ApiConstants.login,
      body: {
        'email': email,
        'password': password,
        'recordar_sesion': true,
      },
      requiresAuth: false,
    );

    // CU01: Autenticar Usuario (Login RBAC), Paso 1.7: Extraer token JWT de la respuesta del servidor
    final token = response['access_token'];
    if (token != null) {
      // CU01: Autenticar Usuario (Login RBAC), Paso 1.7.1: Persistir token de acceso de forma segura en FlutterSecureStorage
      await _api.saveToken(token);
    }
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.7.2: Retornar modelo entidad Usuario deserializado
    return Usuario.fromJson(response, token: token);
  }

  // CU02: Registrar Cliente (Sign Up), Paso 1.1: IRegistroBoundary invoca registro() en AuthService hacia RegistroClienteControl
  Future<Usuario> registro({
    required String nombres,
    required String apellidos,
    required String email,
    required String password,
    String? telefono,
  }) async {
    // CU02: Registrar Cliente (Sign Up), Paso 1.1.1: Despachar petición HTTP POST a /auth/registro con datos del cliente
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
    // CU02: Registrar Cliente (Sign Up), Paso 1.7: Extraer y persistir token JWT de sesión en almacenamiento seguro
    final token = response['access_token'] as String?;
    if (token != null) {
      await _api.saveToken(token);
    }
    // CU02: Registrar Cliente (Sign Up), Paso 1.8: Retornar modelo deserializado de Usuario para iniciar sesión
    return Usuario.fromJson(response, token: token);
  }

  // CU03: Recuperar Contraseña (Token OTP), Paso 1.1: IRecuperarPasswordBoundary invoca solicitarOtp() hacia RecuperacionControl
  Future<String> solicitarOtp(String email) async {
    // CU03: Recuperar Contraseña (Token OTP), Paso 1.1.1: Despachar petición HTTP POST a /auth/recuperar-password/solicitar
    final response = await _api.post(
      ApiConstants.solicitarOtp,
      body: {'email': email},
      requiresAuth: false,
    );
    // CU03: Recuperar Contraseña (Token OTP), Paso 1.6: Retornar mensaje de confirmación de emisión de código
    return response['mensaje'] ?? 'Código de recuperación enviado.';
  }

  // CU03: Recuperar Contraseña (Token OTP), Paso 2.1: IRecuperarPasswordBoundary invoca resetPasswordOtp() con código de 6 dígitos
  Future<void> resetPasswordOtp({
    required String email,
    required String codigoOtp,
    required String nuevaPassword,
  }) async {
    // CU03: Recuperar Contraseña (Token OTP), Paso 2.1.1: Despachar petición HTTP POST a /auth/recuperar-password/verificar
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
