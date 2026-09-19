class Usuario {
  final int idUsuario;
  final String nombres;
  final String apellidos;
  final String? nombreCompleto;
  final String email;
  final String rol;
  final int? idSucursal;
  final String? token;

  Usuario({
    required this.idUsuario,
    required this.nombres,
    required this.apellidos,
    this.nombreCompleto,
    required this.email,
    required this.rol,
    this.idSucursal,
    this.token,
  });

  String get displayName => nombreCompleto ?? '$nombres $apellidos';
  bool get isCliente => rol.toUpperCase() == 'CLIENTE';

  factory Usuario.fromJson(Map<String, dynamic> json, {String? token}) {
    return Usuario(
      idUsuario: json['id_usuario'] ?? 0,
      nombres: json['nombres'] ?? '',
      apellidos: json['apellidos'] ?? '',
      nombreCompleto: json['nombre_completo'],
      email: json['email'] ?? '',
      rol: json['rol'] ?? 'CLIENTE',
      idSucursal: json['id_sucursal'],
      token: token ?? json['access_token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_usuario': idUsuario,
      'nombres': nombres,
      'apellidos': apellidos,
      'nombre_completo': nombreCompleto,
      'email': email,
      'rol': rol,
      'id_sucursal': idSucursal,
      if (token != null) 'access_token': token,
    };
  }
}
