class PrendaColor {
  final int idColor;
  final String nombre;
  final String codigoHex;

  PrendaColor({
    required this.idColor,
    required this.nombre,
    required this.codigoHex,
  });

  factory PrendaColor.fromJson(Map<String, dynamic> json) {
    return PrendaColor(
      idColor: json['id_color'] ?? 0,
      nombre: json['nombre'] ?? json['color_nombre'] ?? '',
      codigoHex: json['codigo_hex'] ?? '#000000',
    );
  }
}

class PrendaTalla {
  final int idTalla;
  final String talla;
  final int orden;
  final double? precio;
  final double? factor;

  PrendaTalla({
    required this.idTalla,
    required this.talla,
    required this.orden,
    this.precio,
    this.factor,
  });

  factory PrendaTalla.fromJson(Map<String, dynamic> json) {
    return PrendaTalla(
      idTalla: json['id_talla'] ?? 0,
      talla: json['talla'] ?? '',
      orden: json['orden'] ?? 0,
      precio: json['precio'] != null ? double.tryParse(json['precio'].toString()) : null,
      factor: json['factor'] != null ? double.tryParse(json['factor'].toString()) : null,
    );
  }
}

class StockSucursalItem {
  final int idSucursal;
  final String nombreSucursal;
  final String nombreCiudad;
  final String direccion;
  final int stockDisponible;
  final List<String> tallasDisponibles;
  final List<String> coloresDisponibles;

  StockSucursalItem({
    required this.idSucursal,
    required this.nombreSucursal,
    required this.nombreCiudad,
    required this.direccion,
    required this.stockDisponible,
    required this.tallasDisponibles,
    required this.coloresDisponibles,
  });

  factory StockSucursalItem.fromJson(Map<String, dynamic> json) {
    return StockSucursalItem(
      idSucursal: json['id_sucursal'] ?? 0,
      nombreSucursal: json['nombre_sucursal'] ?? '',
      nombreCiudad: json['nombre_ciudad'] ?? '',
      direccion: json['direccion'] ?? '',
      stockDisponible: json['stock_disponible'] ?? 0,
      tallasDisponibles: (json['tallas_disponibles'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      coloresDisponibles: (json['colores_disponibles'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class PrendaCatalogo {
  final int idProducto;
  final String codigoSkuBase;
  final String nombre;
  final String? descripcion;
  final double precioBase;
  final double descuentoPct;
  final double precioFinal;
  final int idCategoria;
  final String? nombreCategoria;
  final int idMarca;
  final String? nombreMarca;
  final int? idTemporada;
  final String? codigoTemporada;
  final String? imagenPrincipal;
  final String? modelo3dGlb;
  final List<PrendaColor> colores;
  final List<PrendaTalla> tallas;
  final int stockTotalDisponible;
  final List<StockSucursalItem> disponibilidadSucursales;

  PrendaCatalogo({
    required this.idProducto,
    required this.codigoSkuBase,
    required this.nombre,
    this.descripcion,
    required this.precioBase,
    required this.descuentoPct,
    required this.precioFinal,
    required this.idCategoria,
    this.nombreCategoria,
    required this.idMarca,
    this.nombreMarca,
    this.idTemporada,
    this.codigoTemporada,
    this.imagenPrincipal,
    this.modelo3dGlb,
    required this.colores,
    required this.tallas,
    required this.stockTotalDisponible,
    required this.disponibilidadSucursales,
  });

  factory PrendaCatalogo.fromJson(Map<String, dynamic> json) {
    var rawColores = json['colores'] as List<dynamic>? ?? [];
    var rawTallas = json['tallas'] as List<dynamic>? ?? [];
    var rawSucursales = json['disponibilidad_sucursales'] as List<dynamic>? ?? [];

    return PrendaCatalogo(
      idProducto: json['id_producto'] ?? 0,
      codigoSkuBase: json['codigo_sku_base'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      precioBase: (json['precio_base'] != null) ? double.parse(json['precio_base'].toString()) : 0.0,
      descuentoPct: (json['descuento_aplicable_pct'] != null) ? double.parse(json['descuento_aplicable_pct'].toString()) : 0.0,
      precioFinal: (json['precio_final'] != null) ? double.parse(json['precio_final'].toString()) : 0.0,
      idCategoria: json['id_categoria'] ?? 0,
      nombreCategoria: json['nombre_categoria'],
      idMarca: json['id_marca'] ?? 0,
      nombreMarca: json['nombre_marca'],
      idTemporada: json['id_temporada'],
      codigoTemporada: json['codigo_temporada'],
      imagenPrincipal: json['imagen_principal'],
      modelo3dGlb: json['modelo_3d_glb'],
      colores: rawColores.map((c) => PrendaColor.fromJson(c)).toList(),
      tallas: rawTallas.map((t) => PrendaTalla.fromJson(t)).toList(),
      stockTotalDisponible: json['stock_total_disponible'] ?? 0,
      disponibilidadSucursales: rawSucursales.map((s) => StockSucursalItem.fromJson(s)).toList(),
    );
  }

  static String _fmt(double v) => (v % 1 == 0) ? v.toInt().toString() : v.toStringAsFixed(2);

  String get rangoPreciosTexto {
    final precios = tallas
        .map((t) => t.precio)
        .where((p) => p != null && p > 0)
        .cast<double>()
        .toList();

    if (precios.isEmpty) {
      return 'Bs. ${_fmt(precioFinal)}';
    }

    precios.sort();
    final min = precios.first;
    final max = precios.last;

    if ((max - min).abs() < 0.01) {
      return 'Bs. ${_fmt(min)}';
    }

    return 'Bs. ${_fmt(min)} - ${_fmt(max)}';
  }
}
