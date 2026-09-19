import '../constants/api_constants.dart';
import '../models/tracking.dart';
import 'api_service.dart';

class LogisticaService {
  final ApiService _api = ApiService();

  Future<Tracking> getTracking(int idOrden) async {
    final response = await _api.get(
      ApiConstants.tracking(idOrden),
      requiresAuth: false, // Tracking endpoint is public
    );
    return Tracking.fromJson(response);
  }

  Future<Map<String, dynamic>> calcularTarifa({
    required double latOrigen,
    required double lonOrigen,
    required double latDestino,
    required double lonDestino,
  }) async {
    final response = await _api.post(
      ApiConstants.calcularTarifa,
      body: {
        'latitud_origen': latOrigen,
        'longitud_origen': lonOrigen,
        'latitud_destino': latDestino,
        'longitud_destino': lonDestino,
      },
      requiresAuth: false,
    );
    return response as Map<String, dynamic>;
  }
}
