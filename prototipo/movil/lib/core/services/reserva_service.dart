import '../constants/api_constants.dart';
import '../models/reserva.dart';
import 'api_service.dart';

class ReservaService {
  final ApiService _api = ApiService();

  Future<Reserva> crearReserva({
    required int idSucursal,
    required DateTime fechaVisita,
    required List<Map<String, dynamic>> detalles,
  }) async {
    final response = await _api.post(
      ApiConstants.reservas,
      body: {
        'id_sucursal': idSucursal,
        'fecha_visita': fechaVisita.toIso8601String(),
        'detalles': detalles,
      },
      requiresAuth: true,
    );
    return Reserva.fromJson(response);
  }

  Future<List<Reserva>> getMisReservas() async {
    final response = await _api.get(ApiConstants.misReservas, requiresAuth: true);
    if (response is List) {
      return response.map((r) => Reserva.fromJson(r)).toList();
    }
    return [];
  }

  Future<Reserva> getReserva(int id) async {
    final response = await _api.get(ApiConstants.reservaDetalle(id), requiresAuth: true);
    return Reserva.fromJson(response);
  }
}
