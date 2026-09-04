import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';

class DetallePrendaScreen extends StatefulWidget {
  final dynamic prenda;
  const DetallePrendaScreen({Key? key, required this.prenda}) : super(key: key);

  @override
  State<DetallePrendaScreen> createState() => _DetallePrendaScreenState();
}

class _DetallePrendaScreenState extends State<DetallePrendaScreen> {
  List<dynamic> _sucursales = [];
  bool _cargandoSucursales = true;

  @override
  void initState() {
    super.initState();
    _cargarDisponibilidadSucursales();
  }

  // ===========================================================================
  // CASO DE USO: CU10 - Disponibilidad por Sucursal Física en Tiempo Real
  // ===========================================================================
  Future<void> _cargarDisponibilidadSucursales() async {
    // Paso 2: El cliente consulta en qué tiendas físicas hay stock de la prenda
    final idProducto = widget.prenda["id_producto"];

    // Paso 2.1: Invocación a GET /api/v1/catalogo/{id_producto}/disponibilidad-sucursales
    try {
      final response = await http.get(
        Uri.parse("${ApiConstants.catalogo}/$idProducto/disponibilidad-sucursales"),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _sucursales = data["sucursales"] ?? [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar disponibilidad: $e");
    } finally {
      setState(() => _cargandoSucursales = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.prenda;
    final colores = p["colores"] as List<dynamic>? ?? [];
    final tallas = p["tallas"] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(title: Text(p["nombre"])),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(
              p["imagen_principal"] ??
                  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
              height: 300,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p["nombre_marca"] ?? "FashionStore",
                    style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    p["nombre"],
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Bs. ${p['precio_final']}",
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF6366F1)),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    p["descripcion"] ?? "Prenda confeccionada bajo altos estándares textiles.",
                    style: const TextStyle(color: Colors.white70, height: 1.4),
                  ),
                  const SizedBox(height: 20),

                  // Colores normalizados con código HEX (CU06)
                  const Text("Colores Disponibles:", style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: colores.map((c) {
                      final hexStr = (c["codigo_hex"] as String).replaceAll("#", "");
                      final colorVal = Color(int.parse("FF$hexStr", radix: 16));
                      return Container(
                        margin: const EdgeInsets.only(right: 8),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: colorVal,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Tallas disponibles (CU06)
                  const Text("Tallas Disponibles:", style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: tallas.map((t) {
                      return Chip(
                        label: Text(t["talla"]),
                        backgroundColor: Colors.white10,
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                  const Divider(),

                  // Disponibilidad en Sucursales Físicas (CU10 / CU05)
                  const Text(
                    "Disponibilidad en Tiendas Físicas:",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  if (_cargandoSucursales)
                    const Center(child: CircularProgressIndicator())
                  else if (_sucursales.isEmpty)
                    const Text("No hay datos de existencias en tiendas.")
                  else
                    ..._sucursales.map((s) {
                      final int stock = s["stock_disponible"] ?? 0;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: const Icon(Icons.storefront, color: Color(0xFF6366F1)),
                          title: Text(s["nombre_sucursal"], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text("${s['direccion']} (${s['nombre_ciudad']})"),
                          trailing: Text(
                            stock > 0 ? "$stock uds." : "Agotado",
                            style: TextStyle(
                              color: stock > 0 ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
