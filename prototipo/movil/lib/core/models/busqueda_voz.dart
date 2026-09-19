class PrendaBusquedaVoz {
  final int idProducto;
  final String codigoSkuBase;
  final String nombre;
  final String categoria;
  final double precioFinal;
  final double descuentoPct;
  final String? imagenPrincipal;
  final String? modelo3dGlb;
  final List<String> coloresDisponibles;
  final int relevanciaScore;
  final String motivoCoincidencia;

  PrendaBusquedaVoz({
    required this.idProducto,
    required this.codigoSkuBase,
    required this.nombre,
    required this.categoria,
    required this.precioFinal,
    required this.descuentoPct,
    this.imagenPrincipal,
    this.modelo3dGlb,
    required this.coloresDisponibles,
    required this.relevanciaScore,
    required this.motivoCoincidencia,
  });

  factory PrendaBusquedaVoz.fromJson(Map<String, dynamic> json) {
    final rawColores = json['colores_disponibles'] as List<dynamic>? ?? [];

    return PrendaBusquedaVoz(
      idProducto: json['id_producto'] ?? 0,
      codigoSkuBase: json['codigo_sku_base'] ?? '',
      nombre: json['nombre'] ?? '',
      categoria: json['categoria'] ?? 'Prenda',
      precioFinal: (json['precio_final'] != null) ? double.parse(json['precio_final'].toString()) : 0.0,
      descuentoPct: (json['descuento_pct'] != null) ? double.parse(json['descuento_pct'].toString()) : 0.0,
      imagenPrincipal: json['imagen_principal'],
      modelo3dGlb: json['modelo_3d_glb'],
      coloresDisponibles: rawColores.map((c) => c.toString()).toList(),
      relevanciaScore: json['relevancia_score'] ?? 50,
      motivoCoincidencia: json['motivo_coincidencia'] ?? 'Afinidad semántica',
    );
  }
}

class BusquedaVozResultado {
  final String consultaOriginal;
  final String intencionDetectada;
  final String? ocasionDetectada;
  final String? categoriaDetectada;
  final int totalEncontrados;
  final List<PrendaBusquedaVoz> prendasSugeridas;

  BusquedaVozResultado({
    required this.consultaOriginal,
    required this.intencionDetectada,
    this.ocasionDetectada,
    this.categoriaDetectada,
    required this.totalEncontrados,
    required this.prendasSugeridas,
  });

  factory BusquedaVozResultado.fromJson(Map<String, dynamic> json) {
    final rawPrendas = json['prendas_sugeridas'] as List<dynamic>? ?? [];

    return BusquedaVozResultado(
      consultaOriginal: json['consulta_original'] ?? '',
      intencionDetectada: json['intencion_detectada'] ?? '',
      ocasionDetectada: json['ocasion_detectada'],
      categoriaDetectada: json['categoria_detectada'],
      totalEncontrados: json['total_encontrados'] ?? 0,
      prendasSugeridas: rawPrendas.map((p) => PrendaBusquedaVoz.fromJson(p)).toList(),
    );
  }
}
