class TrackingPaso {
  final String codigo;
  final String titulo;
  final String descripcion;
  final bool completado;
  final bool activo;
  final String icono;

  TrackingPaso({
    required this.codigo,
    required this.titulo,
    required this.descripcion,
    required this.completado,
    required this.activo,
    required this.icono,
  });

  factory TrackingPaso.fromJson(Map<String, dynamic> json) {
    return TrackingPaso(
      codigo: json['codigo'] ?? '',
      titulo: json['titulo'] ?? '',
      descripcion: json['descripcion'] ?? '',
      completado: json['completado'] ?? false,
      activo: json['activo'] ?? false,
      icono: json['icono'] ?? 'info',
    );
  }
}

class PrendaTracking {
  final int idDetalleOrden;
  final int idProducto;
  final String nombreProducto;
  final String codigoSkuBase;
  final String? imagenPrincipal;
  final String talla;
  final String color;
  final int cantidad;

  PrendaTracking({
    required this.idDetalleOrden,
    required this.idProducto,
    required this.nombreProducto,
    required this.codigoSkuBase,
    this.imagenPrincipal,
    required this.talla,
    required this.color,
    required this.cantidad,
  });

  factory PrendaTracking.fromJson(Map<String, dynamic> json) {
    return PrendaTracking(
      idDetalleOrden: json['id_detalle_orden'] ?? 0,
      idProducto: json['id_producto'] ?? 0,
      nombreProducto: json['nombre_producto'] ?? '',
      codigoSkuBase: json['codigo_sku_base'] ?? '',
      imagenPrincipal: json['imagen_principal'],
      talla: json['talla'] ?? '',
      color: json['color'] ?? '',
      cantidad: json['cantidad'] ?? 1,
    );
  }
}

class Tracking {
  final int idOrden;
  final String? numeroFactura;
  final String modalidadEntrega;
  final int? idSucursal;
  final String? nombreSucursal;
  final String? direccionSucursal;
  final String estadoPago;
  final String estadoLogistica;
  final String? direccionEnvio;
  final String? nombreCliente;
  final String? nombreRepartidor;
  final String? telefonoRepartidor;
  final double? distanciaKm;
  final double costoEnvio;
  final double total;
  final DateTime creadoEn;
  final int porcentajeProgreso;
  final List<TrackingPaso> pasos;
  final List<PrendaTracking> prendas;

  Tracking({
    required this.idOrden,
    this.numeroFactura,
    required this.modalidadEntrega,
    this.idSucursal,
    this.nombreSucursal,
    this.direccionSucursal,
    required this.estadoPago,
    required this.estadoLogistica,
    this.direccionEnvio,
    this.nombreCliente,
    this.nombreRepartidor,
    this.telefonoRepartidor,
    this.distanciaKm,
    required this.costoEnvio,
    required this.total,
    required this.creadoEn,
    required this.porcentajeProgreso,
    required this.pasos,
    required this.prendas,
  });

  factory Tracking.fromJson(Map<String, dynamic> json) {
    var rawPasos = json['pasos'] as List<dynamic>? ?? [];
    var rawPrendas = json['prendas'] as List<dynamic>? ?? [];

    return Tracking(
      idOrden: json['id_orden'] ?? 0,
      numeroFactura: json['numero_factura'],
      modalidadEntrega: json['modalidad_entrega'] ?? 'DELIVERY',
      idSucursal: json['id_sucursal'],
      nombreSucursal: json['nombre_sucursal'],
      direccionSucursal: json['direccion_sucursal'],
      estadoPago: json['estado_pago'] ?? '',
      estadoLogistica: json['estado_logistica'] ?? '',
      direccionEnvio: json['direccion_envio'],
      nombreCliente: json['nombre_cliente'],
      nombreRepartidor: json['nombre_repartidor'],
      telefonoRepartidor: json['telefono_repartidor'],
      distanciaKm: (json['distancia_km'] != null) ? double.parse(json['distancia_km'].toString()) : null,
      costoEnvio: (json['costo_envio'] != null) ? double.parse(json['costo_envio'].toString()) : 0.0,
      total: (json['total'] != null) ? double.parse(json['total'].toString()) : 0.0,
      creadoEn: DateTime.tryParse(json['creado_en'] ?? '') ?? DateTime.now(),
      porcentajeProgreso: json['porcentaje_progreso'] ?? 0,
      pasos: rawPasos.map((p) => TrackingPaso.fromJson(p)).toList(),
      prendas: rawPrendas.map((pr) => PrendaTracking.fromJson(pr)).toList(),
    );
  }
}
