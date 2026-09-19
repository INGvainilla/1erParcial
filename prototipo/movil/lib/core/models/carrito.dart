class CarritoItem {
  final int idItem;
  final int idProducto;
  final String nombreProducto;
  final String codigoSkuBase;
  final String? imagenPrincipal;
  final String talla;
  final String color;
  final int cantidad;
  final double precioUnitario;
  final double subtotal;
  final int stockMaximoDisponible;

  CarritoItem({
    required this.idItem,
    required this.idProducto,
    required this.nombreProducto,
    required this.codigoSkuBase,
    this.imagenPrincipal,
    required this.talla,
    required this.color,
    required this.cantidad,
    required this.precioUnitario,
    required this.subtotal,
    required this.stockMaximoDisponible,
  });

  factory CarritoItem.fromJson(Map<String, dynamic> json) {
    return CarritoItem(
      idItem: json['id_item'] ?? 0,
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
      stockMaximoDisponible: json['stock_maximo_disponible'] ?? 0,
    );
  }
}

class Carrito {
  final int idCarrito;
  final int idUsuario;
  final String estado;
  final int totalItems;
  final double totalGeneral;
  final List<CarritoItem> items;

  Carrito({
    required this.idCarrito,
    required this.idUsuario,
    required this.estado,
    required this.totalItems,
    required this.totalGeneral,
    required this.items,
  });

  factory Carrito.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List<dynamic>? ?? [];
    return Carrito(
      idCarrito: json['id_carrito'] ?? 0,
      idUsuario: json['id_usuario'] ?? 0,
      estado: json['estado'] ?? 'ACTIVO',
      totalItems: json['total_items'] ?? 0,
      totalGeneral: (json['total_general'] != null)
          ? double.parse(json['total_general'].toString())
          : 0.0,
      items: rawItems.map((it) => CarritoItem.fromJson(it)).toList(),
    );
  }
}
