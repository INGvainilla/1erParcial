class ApiConstants {
  // Para emulador Android usar 10.0.2.2, para iOS localhost, para dispositivo IP local
  static const String baseUrl = "http://10.0.2.2:8000/api/v1";
  
  // Endpoints Ciclo 1
  static const String login = "$baseUrl/auth/login";
  static const String registro = "$baseUrl/auth/registro";
  static const String solicitarOtp = "$baseUrl/auth/recuperar-password/solicitar";
  static const String verificarOtp = "$baseUrl/auth/recuperar-password/verificar";
  static const String catalogo = "$baseUrl/catalogo";
  static const String sucursales = "$baseUrl/sucursales";
}
