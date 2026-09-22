class InsigniaItem {
  final String id;
  final String nombre;
  final String descripcion;
  final String icono;
  final bool desbloqueada;
  final String? fechaDesbloqueo;

  InsigniaItem({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.icono,
    required this.desbloqueada,
    this.fechaDesbloqueo,
  });

  factory InsigniaItem.fromJson(Map<String, dynamic> json) {
    return InsigniaItem(
      id: json['id'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
      icono: json['icono'] ?? 'star',
      desbloqueada: json['desbloqueada'] ?? false,
      fechaDesbloqueo: json['fecha_desbloqueo'],
    );
  }
}

class RecompensaItem {
  final String id;
  final String codigo;
  final String titulo;
  final String descripcion;
  final int costoPuntos;
  final String categoria;
  final String icono;
  final bool disponible;

  RecompensaItem({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.descripcion,
    required this.costoPuntos,
    required this.categoria,
    required this.icono,
    required this.disponible,
  });

  factory RecompensaItem.fromJson(Map<String, dynamic> json) {
    return RecompensaItem(
      id: json['id'] ?? '',
      codigo: json['codigo'] ?? '',
      titulo: json['titulo'] ?? '',
      descripcion: json['descripcion'] ?? '',
      costoPuntos: json['costo_puntos'] ?? 0,
      categoria: json['categoria'] ?? '',
      icono: json['icono'] ?? 'redeem',
      disponible: json['disponible'] ?? false,
    );
  }
}

class GamificacionPerfil {
  final int idPerfil;
  final int idUsuario;
  final String nombreCliente;
  final int puntosActuales;
  final int puntosHistoricos;
  final String nivel;
  final double progresoNivelPct;
  final int puntosSiguienteNivel;
  final String? siguienteNivel;
  final double descuentoNivelPct;
  final List<String> beneficiosNivel;
  final List<InsigniaItem> insignias;
  final int comprasContabilizadas;

  GamificacionPerfil({
    required this.idPerfil,
    required this.idUsuario,
    required this.nombreCliente,
    required this.puntosActuales,
    required this.puntosHistoricos,
    required this.nivel,
    required this.progresoNivelPct,
    required this.puntosSiguienteNivel,
    this.siguienteNivel,
    required this.descuentoNivelPct,
    required this.beneficiosNivel,
    required this.insignias,
    required this.comprasContabilizadas,
  });

  factory GamificacionPerfil.fromJson(Map<String, dynamic> json) {
    final rawInsignias = json['insignias'] as List<dynamic>? ?? [];
    final rawBeneficios = json['beneficios_nivel'] as List<dynamic>? ?? [];

    return GamificacionPerfil(
      idPerfil: json['id_perfil'] ?? 0,
      idUsuario: json['id_usuario'] ?? 0,
      nombreCliente: json['nombre_cliente'] ?? 'Cliente',
      puntosActuales: json['puntos_actuales'] ?? 0,
      puntosHistoricos: json['puntos_historicos'] ?? 0,
      nivel: json['nivel'] ?? 'BRONCE',
      progresoNivelPct: (json['progreso_nivel_pct'] != null)
          ? double.parse(json['progreso_nivel_pct'].toString())
          : 0.0,
      puntosSiguienteNivel: json['puntos_siguiente_nivel'] ?? 0,
      siguienteNivel: json['siguiente_nivel'],
      descuentoNivelPct: (json['descuento_nivel_pct'] != null)
          ? double.parse(json['descuento_nivel_pct'].toString())
          : 0.0,
      beneficiosNivel: rawBeneficios.map((b) => b.toString()).toList(),
      insignias: rawInsignias.map((i) => InsigniaItem.fromJson(i)).toList(),
      comprasContabilizadas: json['compras_contabilizadas'] ?? 0,
    );
  }
}

class CuponUsuarioItem {
  final int idCupon;
  final String codigoCupon;
  final double montoDescuento;
  final String tipoBeneficio;
  final bool utilizado;
  final String fechaEmision;
  final String fechaExpiracion;
  final int diasRestantes;

  CuponUsuarioItem({
    required this.idCupon,
    required this.codigoCupon,
    required this.montoDescuento,
    required this.tipoBeneficio,
    required this.utilizado,
    required this.fechaEmision,
    required this.fechaExpiracion,
    required this.diasRestantes,
  });

  factory CuponUsuarioItem.fromJson(Map<String, dynamic> json) {
    return CuponUsuarioItem(
      idCupon: json['id_cupon'] ?? 0,
      codigoCupon: json['codigo_cupon'] ?? '',
      montoDescuento: (json['monto_descuento'] != null) ? double.parse(json['monto_descuento'].toString()) : 0.0,
      tipoBeneficio: json['tipo_beneficio'] ?? 'DESCUENTO_MONTO',
      utilizado: json['utilizado'] ?? false,
      fechaEmision: json['fecha_emision'] ?? '',
      fechaExpiracion: json['fecha_expiracion'] ?? '',
      diasRestantes: json['dias_restantes'] ?? 0,
    );
  }
}

class ValidarCuponResult {
  final bool valido;
  final String mensaje;
  final String? codigoCupon;
  final double montoDescuento;
  final String tipoBeneficio;

  ValidarCuponResult({
    required this.valido,
    required this.mensaje,
    this.codigoCupon,
    required this.montoDescuento,
    required this.tipoBeneficio,
  });

  factory ValidarCuponResult.fromJson(Map<String, dynamic> json) {
    return ValidarCuponResult(
      valido: json['valido'] ?? false,
      mensaje: json['mensaje'] ?? '',
      codigoCupon: json['codigo_cupon'],
      montoDescuento: (json['monto_descuento'] != null) ? double.parse(json['monto_descuento'].toString()) : 0.0,
      tipoBeneficio: json['tipo_beneficio'] ?? 'DESCUENTO_MONTO',
    );
  }
}
