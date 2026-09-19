class IntencionPago {
  final String clientSecret;
  final String publishableKey;
  final int idOrden;
  final String numeroFactura;
  final double total;
  final String moneda;
  final String paymentIntentId;

  IntencionPago({
    required this.clientSecret,
    required this.publishableKey,
    required this.idOrden,
    required this.numeroFactura,
    required this.total,
    required this.moneda,
    required this.paymentIntentId,
  });

  factory IntencionPago.fromJson(Map<String, dynamic> json) {
    return IntencionPago(
      clientSecret: json['client_secret'] ?? '',
      publishableKey: json['publishable_key'] ?? '',
      idOrden: json['id_orden'] ?? 0,
      numeroFactura: json['numero_factura'] ?? '',
      total: (json['total'] != null) ? double.parse(json['total'].toString()) : 0.0,
      moneda: json['moneda'] ?? 'BOB',
      paymentIntentId: json['payment_intent_id'] ?? '',
    );
  }
}

class TransaccionPago {
  final int idTransaccion;
  final int idOrden;
  final String pasarela;
  final String paymentIntentId;
  final double monto;
  final String moneda;
  final String estado;
  final String? marcaTarjeta;
  final String? ultimos4;
  final DateTime fechaCreacion;
  final String? numeroFactura;

  TransaccionPago({
    required this.idTransaccion,
    required this.idOrden,
    required this.pasarela,
    required this.paymentIntentId,
    required this.monto,
    required this.moneda,
    required this.estado,
    this.marcaTarjeta,
    this.ultimos4,
    required this.fechaCreacion,
    this.numeroFactura,
  });

  factory TransaccionPago.fromJson(Map<String, dynamic> json) {
    return TransaccionPago(
      idTransaccion: json['id_transaccion'] ?? 0,
      idOrden: json['id_orden'] ?? 0,
      pasarela: json['pasarela'] ?? '',
      paymentIntentId: json['payment_intent_id'] ?? '',
      monto: (json['monto'] != null) ? double.parse(json['monto'].toString()) : 0.0,
      moneda: json['moneda'] ?? 'BOB',
      estado: json['estado'] ?? '',
      marcaTarjeta: json['marca_tarjeta'],
      ultimos4: json['ultimos4'],
      fechaCreacion: DateTime.tryParse(json['fecha_creacion'] ?? '') ?? DateTime.now(),
      numeroFactura: json['numero_factura'],
    );
  }
}

class MetodoPago {
  final String codigo;
  final String nombre;
  final String tipo;
  final String? icono;
  final bool activo;

  MetodoPago({
    required this.codigo,
    required this.nombre,
    required this.tipo,
    this.icono,
    required this.activo,
  });

  factory MetodoPago.fromJson(Map<String, dynamic> json) {
    return MetodoPago(
      codigo: json['codigo'] ?? '',
      nombre: json['nombre'] ?? '',
      tipo: json['tipo'] ?? '',
      icono: json['icono'],
      activo: json['activo'] ?? true,
    );
  }
}
