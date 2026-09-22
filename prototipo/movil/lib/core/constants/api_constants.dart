import 'package:flutter/foundation.dart';

class ApiConstants {
  static const String _envHost = String.fromEnvironment('API_HOST');

  static String get baseUrl {
    if (_envHost.isNotEmpty) {
      return 'http://$_envHost:8000/api/v1';
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      // USB conectado: ejecutar 'adb reverse tcp:8000 tcp:8000' antes de correr
      return 'http://127.0.0.1:8000/api/v1';
    }
    return 'http://localhost:8000/api/v1';
  }

  // Auth (CU01, CU02, CU03)
  static String get login => '$baseUrl/auth/login';
  static String get registro => '$baseUrl/auth/registro';
  static String get solicitarOtp => '$baseUrl/auth/recuperar-password/solicitar';
  static String get verificarOtp => '$baseUrl/auth/recuperar-password/verificar';
  static String get me => '$baseUrl/auth/me';

  // Catálogo y filtros (CU10)
  static String get catalogo => '$baseUrl/catalogo';
  static String disponibilidadSucursales(int id) => '$baseUrl/catalogo/$id/disponibilidad-sucursales';
  static String get sucursales => '$baseUrl/sucursales';
  static String get categorias => '$baseUrl/productos/categorias';
  static String get marcas => '$baseUrl/productos/marcas';
  static String get temporadas => '$baseUrl/temporadas';

  // Carrito (CU13)
  static String get carrito => '$baseUrl/carrito';
  static String get carritoItems => '$baseUrl/carrito/items';
  static String carritoItem(int idItem) => '$baseUrl/carrito/items/$idItem';
  static String get vaciarCarrito => '$baseUrl/carrito/vaciar';

  // Reservas (CU11)
  static String get reservas => '$baseUrl/reservas';
  static String get misReservas => '$baseUrl/reservas/mis-reservas';
  static String reservaDetalle(int id) => '$baseUrl/reservas/$id';

  // Órdenes y Checkout (CU14)
  static String get ordenes => '$baseUrl/ordenes';
  static String get checkout => '$baseUrl/ordenes/checkout';
  static String ordenDetalle(int id) => '$baseUrl/ordenes/$id';

  // Pagos (CU16, CU17)
  static String get pagoIntencion => '$baseUrl/pagos/intencion';
  static String get pagoConfirmar => '$baseUrl/pagos/confirmar';
  static String pagoPorOrden(int idOrden) => '$baseUrl/pagos/orden/$idOrden';
  static String get configPagosActivos => '$baseUrl/configuracion/pagos/activos';

  // Logística y Tracking (CU18)
  static String tracking(int idOrden) => '$baseUrl/logistica/tracking/$idOrden';
  static String get calcularTarifa => '$baseUrl/logistica/calcular-tarifa';

  // Gamificación y Fidelización (CU21)
  static String get gamificacionPerfil => '$baseUrl/gamificacion/perfil';
  static String get gamificacionRecompensas => '$baseUrl/gamificacion/recompensas';
  static String get gamificacionCanjear => '$baseUrl/gamificacion/canjear';
  static String get gamificacionBonoAccion => '$baseUrl/gamificacion/bono-accion';
  static String get gamificacionMisCupones => '$baseUrl/gamificacion/mis-cupones';
  static String get gamificacionValidarCupon => '$baseUrl/gamificacion/validar-cupon';

  // Recomendaciones Contextuales de IA (CU22)
  static String recomendacionesClima([String? ciudad]) =>
      ciudad != null ? '$baseUrl/recomendaciones/clima?ciudad=${Uri.encodeComponent(ciudad)}' : '$baseUrl/recomendaciones/clima';
  static String recomendacionesOutfits({String? ciudad, String? ocasion}) {
    final params = <String>[];
    if (ciudad != null) params.add('ciudad=${Uri.encodeComponent(ciudad)}');
    if (ocasion != null) params.add('ocasion=${Uri.encodeComponent(ocasion)}');
    return params.isEmpty ? '$baseUrl/recomendaciones/outfits' : '$baseUrl/recomendaciones/outfits?${params.join('&')}';
  }

  // Búsqueda por Voz y Semántica (CU23)
  static String get busquedaVoz => '$baseUrl/recomendaciones/busqueda-voz';

  // Devoluciones y Cambios de Prendas (CU25)
  static String devolucionTicket(String nroTicket) => '$baseUrl/pos/devoluciones/ticket/${Uri.encodeComponent(nroTicket)}';
  static String get procesarDevolucion => '$baseUrl/pos/devoluciones';
}

