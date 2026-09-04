import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import 'detalle_prenda_screen.dart';

class CatalogoScreen extends StatefulWidget {
  const CatalogoScreen({Key? key}) : super(key: key);

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  List<dynamic> _prendas = [];
  bool _isLoading = true;
  String _busqueda = "";

  @override
  void initState() {
    super.initState();
    _cargarPrendas();
  }

  // ===========================================================================
  // CASO DE USO: CU10 - Consultar Catálogo y Disponibilidad por Sucursal
  // ===========================================================================
  Future<void> _cargarPrendas() async {
    // Paso 1: El cliente consulta el catálogo de moda masculina en la app móvil
    setState(() => _isLoading = true);

    // Paso 1.1: Invocación a GET /api/v1/catalogo
    try {
      final uri = Uri.parse("${ApiConstants.catalogo}?busqueda=$_busqueda");
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        // Paso 1.2: Serialización del catálogo con existencias en tiempo real
        setState(() {
          _prendas = jsonDecode(response.body);
        });
      }
    } catch (e) {
      debugPrint("Error al cargar prendas: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("FashionStore Masculino"),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarPrendas,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: "Buscar prenda, camisa, pantalón...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (val) {
                _busqueda = val;
                _cargarPrendas();
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _prendas.isEmpty
                    ? const Center(child: Text("No se encontraron prendas."))
                    : ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _prendas.length,
                        itemBuilder: (context, index) {
                          final p = _prendas[index];
                          final int stock = p["stock_total_disponible"] ?? 0;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DetallePrendaScreen(prenda: p),
                                  ),
                                );
                              },
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                    child: Image.network(
                                      p["imagen_principal"] ??
                                          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
                                      height: 180,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        height: 180,
                                        color: Colors.grey[800],
                                        child: const Icon(Icons.image_not_supported, size: 48),
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          p["nombre_marca"] ?? "FashionStore",
                                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          p["nombre"],
                                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              "Bs. ${p['precio_final']}",
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.w800,
                                                color: Color(0xFF6366F1),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: stock > 0
                                                    ? Colors.green.withOpacity(0.2)
                                                    : Colors.red.withOpacity(0.2),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                stock > 0 ? "$stock disponibles" : "Agotado",
                                                style: TextStyle(
                                                  color: stock > 0 ? Colors.green : Colors.red,
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
