class ClimaLocal {
  final String ciudad;
  final double temperaturaC;
  final double sensacionC;
  final String condicion;
  final String descripcionClima;
  final String iconoClima;
  final String recomendacionTextil;

  ClimaLocal({
    required this.ciudad,
    required this.temperaturaC,
    required this.sensacionC,
    required this.condicion,
    required this.descripcionClima,
    required this.iconoClima,
    required this.recomendacionTextil,
  });

  factory ClimaLocal.fromJson(Map<String, dynamic> json) {
    return ClimaLocal(
      ciudad: json['ciudad'] ?? '',
      temperaturaC: (json['temperatura_c'] != null) ? double.parse(json['temperatura_c'].toString()) : 25.0,
      sensacionC: (json['sensacion_c'] != null) ? double.parse(json['sensacion_c'].toString()) : 25.0,
      condicion: json['condicion'] ?? '',
      descripcionClima: json['descripcion_clima'] ?? '',
      iconoClima: json['icono_clima'] ?? 'sunny',
      recomendacionTextil: json['recomendacion_textil'] ?? '',
    );
  }
}

class PrendaOutfitItem {
  final int idProducto;
  final String codigoSkuBase;
  final String nombre;
  final String categoria;
  final double precioBase;
  final double precioFinal;
  final double descuentoPct;
  final String? imagenPrincipal;
  final String colorSugerido;
  final String colorHex;
  final String tallaSugerida;
  final String? modelo3dGlb;

  PrendaOutfitItem({
    required this.idProducto,
    required this.codigoSkuBase,
    required this.nombre,
    required this.categoria,
    required this.precioBase,
    required this.precioFinal,
    required this.descuentoPct,
    this.imagenPrincipal,
    required this.colorSugerido,
    required this.colorHex,
    required this.tallaSugerida,
    this.modelo3dGlb,
  });

  factory PrendaOutfitItem.fromJson(Map<String, dynamic> json) {
    return PrendaOutfitItem(
      idProducto: json['id_producto'] ?? 0,
      codigoSkuBase: json['codigo_sku_base'] ?? '',
      nombre: json['nombre'] ?? '',
      categoria: json['categoria'] ?? 'Prenda',
      precioBase: (json['precio_base'] != null) ? double.parse(json['precio_base'].toString()) : 0.0,
      precioFinal: (json['precio_final'] != null) ? double.parse(json['precio_final'].toString()) : 0.0,
      descuentoPct: (json['descuento_pct'] != null) ? double.parse(json['descuento_pct'].toString()) : 0.0,
      imagenPrincipal: json['imagen_principal'],
      colorSugerido: json['color_sugerido'] ?? 'Original',
      colorHex: json['color_hex'] ?? '#000000',
      tallaSugerida: json['talla_sugerida'] ?? 'M',
      modelo3dGlb: json['modelo_3d_glb'],
    );
  }
}

class OutfitRecomendado {
  final String idOutfit;
  final String titulo;
  final String ocasion;
  final String estilo;
  final int afinidadClimaticaPct;
  final String analisisEstilistaIa;
  final String reglaColorimetria;
  final List<PrendaOutfitItem> prendas;
  final double precioTotalOriginal;
  final double precioTotalFinal;
  final double ahorroTotal;

  OutfitRecomendado({
    required this.idOutfit,
    required this.titulo,
    required this.ocasion,
    required this.estilo,
    required this.afinidadClimaticaPct,
    required this.analisisEstilistaIa,
    required this.reglaColorimetria,
    required this.prendas,
    required this.precioTotalOriginal,
    required this.precioTotalFinal,
    required this.ahorroTotal,
  });

  factory OutfitRecomendado.fromJson(Map<String, dynamic> json) {
    final rawPrendas = json['prendas'] as List<dynamic>? ?? [];

    return OutfitRecomendado(
      idOutfit: json['id_outfit'] ?? '',
      titulo: json['titulo'] ?? '',
      ocasion: json['ocasion'] ?? '',
      estilo: json['estilo'] ?? '',
      afinidadClimaticaPct: json['afinidad_climatica_pct'] ?? 95,
      analisisEstilistaIa: json['analisis_estilista_ia'] ?? '',
      reglaColorimetria: json['regla_colorimetria'] ?? '',
      prendas: rawPrendas.map((p) => PrendaOutfitItem.fromJson(p)).toList(),
      precioTotalOriginal: (json['precio_total_original'] != null)
          ? double.parse(json['precio_total_original'].toString())
          : 0.0,
      precioTotalFinal: (json['precio_total_final'] != null)
          ? double.parse(json['precio_total_final'].toString())
          : 0.0,
      ahorroTotal: (json['ahorro_total'] != null)
          ? double.parse(json['ahorro_total'].toString())
          : 0.0,
    );
  }
}
