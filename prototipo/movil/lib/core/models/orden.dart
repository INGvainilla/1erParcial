class OrdenDetalle {
  final int idDetalleOrden;
  final int idProducto;
  final String nombreProducto;
  final String codigoSkuBase;
  final String? imagenPrincipal;
  final String talla;
  final String color;
  final int cantidad;
  final double precioUnitario;
  final double subtotal;

  OrdenDetalle({
    required this.idDetalleOrden,
    required this.idProducto,
    required this.nombreProducto,
    required this.codigoSkuBase,
    this.imagenPrincipal,
    required this.talla,
    required this.color,
    required this.cantidad,
    required this.precioUnitario,
    required this.subtotal,
  });

  factory OrdenDetalle.fromJson(Map<String, dynamic> json) {
    return OrdenDetalle(
      idDetalleOrden: json['id_detalle_orden'] ?? 0,
      idProducto: json['id_producto'] ?? 0,
      nombreProducto: json['nombre_producto'] ?? '',
      codigoSkuBase: json['codigo_sku_base'] ?? '',
      imagenPrincipal: json['imagen_principal'],
      talla: json['talla'] ?? '',
      color: json['color'] ?? '',
      cantidad: json['cantidad'] ?? 1,
      precioUnitario: (json['precio_unitario'] != null)
          ? double.parse(json['precio_unitario'].toString())
          : 0.0,
      subtotal: (json['subtotal'] != null)
          ? double.parse(json['subtotal'].toString())
          : 0.0,
    );
  }
}

class Orden {
  final int idOrden;
  final int? idUsuario;
  final int? idSucursal;
  final String? nombreSucursal;
  final String? numeroFactura;
  final String canalVenta;
  final String modalidadEntrega;
  final String? direccionEnvio;
  final String? telefonoContacto;
  final String? nitFactura;
  final String? razonSocialFactura;
  final String? notasEntrega;
  final double subtotal;
  final double costoEnvio;
  final double total;
  final String estadoPago;
  final String estadoLogistica;
  final DateTime creadoEn;
  final List<OrdenDetalle> detalles;

  Orden({
    required this.idOrden,
    this.idUsuario,
    this.idSucursal,
    this.nombreSucursal,
    this.numeroFactura,
    required this.canalVenta,
    required this.modalidadEntrega,
    this.direccionEnvio,
    this.telefonoContacto,
    this.nitFactura,
    this.razonSocialFactura,
    this.notasEntrega,
    required this.subtotal,
    required this.costoEnvio,
    required this.total,
    required this.estadoPago,
    required this.estadoLogistica,
    required this.creadoEn,
    required this.detalles,
  });

  factory Orden.fromJson(Map<String, dynamic> json) {
    var rawDetalles = json['detalles'] as List<dynamic>? ?? [];
    return Orden(
      idOrden: json['id_orden'] ?? 0,
      idUsuario: json['id_usuario'],
      idSucursal: json['id_sucursal'],
      nombreSucursal: json['nombre_sucursal'],
      numeroFactura: json['numero_factura'],
      canalVenta: json['canal_venta'] ?? 'WEB',
      modalidadEntrega: json['modalidad_entrega'] ?? 'DELIVERY',
      direccionEnvio: json['direccion_envio'],
      telefonoContacto: json['telefono_contacto'],
      nitFactura: json['nit_factura'],
      razonSocialFactura: json['razon_social_factura'],
      notasEntrega: json['notas_entrega'],
      subtotal: (json['subtotal'] != null) ? double.parse(json['subtotal'].toString()) : 0.0,
      costoEnvio: (json['costo_envio'] != null) ? double.parse(json['costo_envio'].toString()) : 0.0,
      total: (json['total'] != null) ? double.parse(json['total'].toString()) : 0.0,
      estadoPago: json['estado_pago'] ?? 'PENDIENTE',
      estadoLogistica: json['estado_logistica'] ?? 'CREADA',
      creadoEn: DateTime.tryParse(json['creado_en'] ?? '') ?? DateTime.now(),
      detalles: rawDetalles.map((d) => OrdenDetalle.fromJson(d)).toList(),
    );
  }
}
