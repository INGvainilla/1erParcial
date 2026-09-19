class ReservaDetalle {
  final int idReservaDetalle;
  final int idProducto;
  final String talla;
  final String color;
  final int cantidad;
  final String? nombreProducto;
  final String? codigoSkuBase;
  final String? imagenPrincipal;

  ReservaDetalle({
    required this.idReservaDetalle,
    required this.idProducto,
    required this.talla,
    required this.color,
    required this.cantidad,
    this.nombreProducto,
    this.codigoSkuBase,
    this.imagenPrincipal,
  });

  factory ReservaDetalle.fromJson(Map<String, dynamic> json) {
    return ReservaDetalle(
      idReservaDetalle: json['id_reserva_detalle'] ?? 0,
      idProducto: json['id_producto'] ?? 0,
      talla: json['talla'] ?? '',
      color: json['color'] ?? '',
      cantidad: json['cantidad'] ?? 1,
      nombreProducto: json['nombre_producto'],
      codigoSkuBase: json['codigo_sku_base'],
      imagenPrincipal: json['imagen_principal'],
    );
  }
}

class Reserva {
  final int idReserva;
  final int idUsuario;
  final int idSucursal;
  final String codigoQr;
  final String? qrTexto;
  final DateTime fechaVisita;
  final String estado;
  final DateTime creadoEn;
  final String? nombreSucursal;
  final String? nombreCiudad;
  final String? nombreCliente;
  final List<ReservaDetalle> detalles;

  Reserva({
    required this.idReserva,
    required this.idUsuario,
    required this.idSucursal,
    required this.codigoQr,
    this.qrTexto,
    required this.fechaVisita,
    required this.estado,
    required this.creadoEn,
    this.nombreSucursal,
    this.nombreCiudad,
    this.nombreCliente,
    required this.detalles,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    var rawDetalles = json['detalles'] as List<dynamic>? ?? [];
    return Reserva(
      idReserva: json['id_reserva'] ?? 0,
      idUsuario: json['id_usuario'] ?? 0,
      idSucursal: json['id_sucursal'] ?? 0,
      codigoQr: json['codigo_qr'] ?? '',
      qrTexto: json['qr_texto'],
      fechaVisita: DateTime.tryParse(json['fecha_visita'] ?? '') ?? DateTime.now(),
      estado: json['estado'] ?? 'PENDIENTE',
      creadoEn: DateTime.tryParse(json['creado_en'] ?? '') ?? DateTime.now(),
      nombreSucursal: json['nombre_sucursal'],
      nombreCiudad: json['nombre_ciudad'],
      nombreCliente: json['nombre_cliente'],
      detalles: rawDetalles.map((d) => ReservaDetalle.fromJson(d)).toList(),
    );
  }
}
