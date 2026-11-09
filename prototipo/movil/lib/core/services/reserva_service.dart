import '../constants/api_constants.dart';
import '../models/reserva.dart';
import 'api_service.dart';
import 'network_service.dart';
import 'offline_devoluciones_service.dart';

class ReservaService {
  final ApiService _api = ApiService();

  // CU11: Solicitar Reserva de Prendas en Sucursal, Paso 1.1: crear_reserva(datos_reserva, id_usuario)
  Future<Reserva> crearReserva({
    required int idSucursal,
    required DateTime fechaVisita,
    required List<Map<String, dynamic>> detalles,
    bool bypassingOffline = false,
  }) async {
    if (!bypassingOffline) {
      final tieneNet = await NetworkService.tieneInternetReal();
      if (!tieneNet) {
        return await OfflineDevolucionesService().guardarReservaOffline(
          idSucursal: idSucursal,
          fechaVisita: fechaVisita,
          detalles: detalles,
        );
      }
    }

    try {
      final response = await _api.post(
        ApiConstants.reservas,
        body: {
          'id_sucursal': idSucursal,
          'fecha_visita': fechaVisita.toIso8601String(),
          'detalles': detalles,
        },
        requiresAuth: true,
      );
      final reserva = Reserva.fromJson(response);
      OfflineDevolucionesService().guardarReservasCacheOffline([reserva]).catchError((_) {});
      return reserva;
    } on ApiException catch (e) {
      if (!bypassingOffline &&
          (e.statusCode == 0 ||
              e.message.contains('No se pudo conectar') ||
              e.message.contains('SocketException') ||
              e.message.contains('Network is unreachable'))) {
        return await OfflineDevolucionesService().guardarReservaOffline(
          idSucursal: idSucursal,
          fechaVisita: fechaVisita,
          detalles: detalles,
        );
      }
      rethrow;
    } catch (e) {
      if (!bypassingOffline) {
        return await OfflineDevolucionesService().guardarReservaOffline(
          idSucursal: idSucursal,
          fechaVisita: fechaVisita,
          detalles: detalles,
        );
      }
      rethrow;
    }
  }

  // CU11: Solicitar Reserva de Prendas en Sucursal, Paso 1.13: renderiza ticket QR y agrega a Mis Tickets
  Future<List<Reserva>> getMisReservas() async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) {
      return await OfflineDevolucionesService().obtenerReservasCacheOffline();
    }

    try {
      final response = await _api.get(ApiConstants.misReservas, requiresAuth: true);
      if (response is List) {
        final list = response.map((r) => Reserva.fromJson(r)).toList();
        OfflineDevolucionesService().guardarReservasCacheOffline(list).catchError((_) {});

        final offlineList = await OfflineDevolucionesService().obtenerReservasCacheOffline();
        final pendientes = offlineList.where(
          (r) => r.estado.toUpperCase().contains('OFFLINE') || r.codigoQr.startsWith('FS-RES-OFFLINE')
        ).toList();

        return [...pendientes, ...list];
      }
      return await OfflineDevolucionesService().obtenerReservasCacheOffline();
    } catch (_) {
      return await OfflineDevolucionesService().obtenerReservasCacheOffline();
    }
  }

  // CU11: Solicitar Reserva de Prendas en Sucursal, Paso 1.12: retorna reserva con ticket QR generado
  Future<Reserva> getReserva(int id) async {
    try {
      final response = await _api.get(ApiConstants.reservaDetalle(id), requiresAuth: true);
      return Reserva.fromJson(response);
    } catch (e) {
      final offlineList = await OfflineDevolucionesService().obtenerReservasCacheOffline();
      final match = offlineList.firstWhere(
        (r) => r.idReserva == id,
        orElse: () => throw e,
      );
      return match;
    }
  }
}
