import '../constants/api_constants.dart';
import '../models/orden.dart';
import 'api_service.dart';

class OrdenesService {
  final ApiService _api = ApiService();

  Future<Orden> checkout({
    required String modalidadEntrega,
    int? idSucursal,
    String? direccionEnvio,
    String? telefonoContacto,
    required String nitFactura,
    required String razonSocialFactura,
    String? notasEntrega,
  }) async {
    final body = {
      'modalidad_entrega': modalidadEntrega,
      if (idSucursal != null) 'id_sucursal': idSucursal,
      if (direccionEnvio != null && direccionEnvio.isNotEmpty) 'direccion_envio': direccionEnvio,
      if (telefonoContacto != null && telefonoContacto.isNotEmpty) 'telefono_contacto': telefonoContacto,
      'nit_factura': nitFactura,
      'razon_social_factura': razonSocialFactura,
      if (notasEntrega != null && notasEntrega.isNotEmpty) 'notas_entrega': notasEntrega,
      'canal_venta': 'APP',
    };

    final response = await _api.post(
      ApiConstants.checkout,
      body: body,
      requiresAuth: true,
    );
    return Orden.fromJson(response);
  }

  Future<List<Orden>> getMisOrdenes() async {
    final response = await _api.get(ApiConstants.ordenes, requiresAuth: true);
    if (response is List) {
      return response.map((o) => Orden.fromJson(o)).toList();
    }
    return [];
  }

  Future<Orden> getOrden(int id) async {
    final response = await _api.get(ApiConstants.ordenDetalle(id), requiresAuth: true);
    return Orden.fromJson(response);
  }
}
