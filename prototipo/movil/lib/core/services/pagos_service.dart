import '../constants/api_constants.dart';
import '../models/pago.dart';
import 'api_service.dart';

class PagosService {
  final ApiService _api = ApiService();

  // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 1.1: crear_intencion_pago(id_orden)
  Future<IntencionPago> crearIntencionPago(int idOrden) async {
    final response = await _api.post(
      ApiConstants.pagoIntencion,
      body: {'id_orden': idOrden},
      requiresAuth: true,
    );
    return IntencionPago.fromJson(response);
  }

  // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2.3: confirmar_transaccion_pago(payment_intent_id, id_orden)
  Future<TransaccionPago> confirmarPagoDirecto(int idOrden, String paymentIntentId) async {
    final response = await _api.post(
      ApiConstants.pagoConfirmar,
      body: {
        'id_orden': idOrden,
        'payment_intent_id': paymentIntentId,
      },
      requiresAuth: true,
    );
    return TransaccionPago.fromJson(response);
  }

  Future<TransaccionPago?> getPagoPorOrden(int idOrden) async {
    try {
      final response = await _api.get(
        ApiConstants.pagoPorOrden(idOrden),
        requiresAuth: true,
      );
      return TransaccionPago.fromJson(response);
    } catch (_) {
      return null;
    }
  }

  Future<List<MetodoPago>> getConfigPagosActivos() async {
    try {
      final response = await _api.get(
        ApiConstants.configPagosActivos,
        requiresAuth: false,
      );
      if (response is List) {
        return response.map((m) => MetodoPago.fromJson(m)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
