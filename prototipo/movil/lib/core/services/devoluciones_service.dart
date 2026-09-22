import '../constants/api_constants.dart';
import 'api_service.dart';

class DevolucionesService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> consultarTicket(String nroTicket) async {
    final res = await _api.get(
      ApiConstants.devolucionTicket(nroTicket),
      requiresAuth: true,
    );
    if (res is Map<String, dynamic>) {
      return res;
    }
    return {};
  }

  Future<Map<String, dynamic>> procesarDevolucion(Map<String, dynamic> data) async {
    final res = await _api.post(
      ApiConstants.procesarDevolucion,
      body: data,
      requiresAuth: true,
    );
    if (res is Map<String, dynamic>) {
      return res;
    }
    return {};
  }
}
