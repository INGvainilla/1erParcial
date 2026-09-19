import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:fashionstore_mobile/core/models/recomendacion_ia.dart';
import 'package:fashionstore_mobile/core/providers/recomendaciones_ia_provider.dart';
import 'package:fashionstore_mobile/core/providers/carrito_provider.dart';
import 'package:fashionstore_mobile/core/providers/gamificacion_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import '../widgets/modal_busqueda_voz.dart';

class RecomendacionesIaScreen extends StatefulWidget {
  const RecomendacionesIaScreen({Key? key}) : super(key: key);

  @override
  State<RecomendacionesIaScreen> createState() => _RecomendacionesIaScreenState();
}

class _RecomendacionesIaScreenState extends State<RecomendacionesIaScreen> {
  final List<String> _ciudades = ['Santa Cruz', 'La Paz', 'Cochabamba'];
  final List<String> _ocasiones = ['TODAS', 'Formal', 'Casual'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RecomendacionesIaProvider>().cargarContexto();
    });
  }

  Color _parseHex(String hex) {
    try {
      final buffer = StringBuffer();
      if (hex.length == 6 || hex.length == 7) buffer.write('ff');
      buffer.write(hex.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return Colors.grey;
    }
  }

  void _abrirModalVoz() {
    final iaProvider = context.read<RecomendacionesIaProvider>();
    final gamProvider = context.read<GamificacionProvider>();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.cardColor,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => ModalBusquedaVozReal(
        titulo: 'Asistente de Estilo por Voz (CU23)',
        onTextoConfirmado: (texto) async {
          await iaProvider.procesarComandoVoz(texto);
          try {
            gamProvider.registrarBonoAccion('BUSQUEDA_VOZ');
          } catch (_) {}
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final iaProvider = context.watch<RecomendacionesIaProvider>();
    final clima = iaProvider.clima;
    final outfits = iaProvider.outfits;
    final resultadoVoz = iaProvider.resultadoVoz;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.auto_awesome, color: AppTheme.goldColor),
            SizedBox(width: 8),
            Text('Estilista Virtual IA'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.mic, color: AppTheme.goldColor),
            tooltip: 'Buscar por Voz (CU23)',
            onPressed: _abrirModalVoz,
          ),
        ],
      ),
      body: iaProvider.cargando && clima == null
          ? const Center(child: CircularProgressIndicator(color: AppTheme.goldColor))
          : RefreshIndicator(
              color: AppTheme.goldColor,
              onRefresh: () => iaProvider.cargarContexto(),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Selector de Ciudad y Contexto de Clima
                    _buildClimaCard(context, clima, iaProvider),
                    const SizedBox(height: 16),

                    // Si hay resultado de búsqueda por voz reciente, mostrarlo destacado
                    if (resultadoVoz != null) ...[
                      _buildResultadoVozCard(context, resultadoVoz, iaProvider),
                      const SizedBox(height: 20),
                    ],

                    // Selector de Ocasión
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'OUTFITS SUGERIDOS PARA HOY',
                          style: TextStyle(
                            color: AppTheme.goldColor,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                        DropdownButton<String>(
                          value: iaProvider.ocasion,
                          dropdownColor: AppTheme.cardColor,
                          underline: const SizedBox(),
                          icon: const Icon(Icons.tune, color: AppTheme.goldColor, size: 16),
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          items: _ocasiones
                              .map((o) => DropdownMenuItem(value: o, child: Text(o)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) {
                              iaProvider.cargarContexto(ocasion: val);
                            }
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Lista de Outfits Generados
                    if (outfits.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Text(
                            'No se encontraron combinaciones para este filtro.',
                            style: TextStyle(color: AppTheme.mutedTextColor),
                          ),
                        ),
                      )
                    else
                      ...outfits.map((o) => _buildOutfitCard(context, o)).toList(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildClimaCard(BuildContext context, ClimaLocal? clima, RecomendacionesIaProvider prov) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E2430), Color(0xFF151922)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.goldColor.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on, color: AppTheme.goldColor, size: 18),
                  const SizedBox(width: 4),
                  Text(
                    clima?.ciudad ?? 'Santa Cruz',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              // Chips de cambio de ciudad
              Wrap(
                spacing: 6,
                children: _ciudades.map((c) {
                  final isSel = c.toLowerCase() == (clima?.ciudad.toLowerCase() ?? '').split(' ').first;
                  return GestureDetector(
                    onTap: () => prov.cargarContexto(ciudad: c),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isSel ? AppTheme.goldColor : Colors.white10,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        c,
                        style: TextStyle(
                          color: isSel ? Colors.black : Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          const Divider(color: Colors.white12, height: 24),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.goldColor.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  clima?.iconoClima == 'ac_unit' ? Icons.ac_unit : Icons.wb_sunny,
                  color: AppTheme.goldColor,
                  size: 28,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${clima?.temperaturaC.toStringAsFixed(1) ?? "28.0"}°C • ${clima?.condicion ?? "Cálido"}',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      clima?.descripcionClima ?? 'Clima ideal para vestir con elegancia.',
                      style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                const Icon(Icons.tips_and_updates, color: AppTheme.goldColor, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    clima?.recomendacionTextil ?? 'Telas frescas y transpirables.',
                    style: const TextStyle(color: AppTheme.textColor, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultadoVozCard(
      BuildContext context, dynamic resultadoVoz, RecomendacionesIaProvider iaProvider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B202D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.greenAccent.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.mic, color: Colors.greenAccent, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'RESULTADO DE BÚSQUEDA POR VOZ',
                    style: TextStyle(
                      color: Colors.greenAccent,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.close, color: Colors.white54, size: 18),
                onPressed: () => iaProvider.limpiarResultadoVoz(),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '"${resultadoVoz.consultaOriginal}"',
            style: const TextStyle(color: Colors.white, fontSize: 14, fontStyle: FontStyle.italic),
          ),
          const SizedBox(height: 6),
          Text(
            'Intención NLP: ${resultadoVoz.intencionDetectada}',
            style: const TextStyle(color: AppTheme.goldColor, fontSize: 11),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 140,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: resultadoVoz.prendasSugeridas.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, idx) {
                final p = resultadoVoz.prendasSugeridas[idx];
                return Container(
                  width: 120,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.cardColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: Container(
                          height: 65,
                          width: double.infinity,
                          color: Colors.black26,
                          child: p.imagenPrincipal != null
                              ? CachedNetworkImage(imageUrl: p.imagenPrincipal!, fit: BoxFit.cover)
                              : const Icon(Icons.checkroom, size: 30, color: Colors.white24),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        p.nombre,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                        style: const TextStyle(color: AppTheme.goldColor, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Text(
                        'Relevancia: ${p.relevanciaScore}%',
                        style: const TextStyle(color: Colors.greenAccent, fontSize: 9),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOutfitCard(BuildContext context, OutfitRecomendado outfit) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabecera: Título y Afinidad Climática
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  outfit.titulo,
                  style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.greenAccent),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Colors.greenAccent, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '${outfit.afinidadClimaticaPct}% Afinidad',
                      style: const TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${outfit.estilo} • ${outfit.ocasion}',
            style: const TextStyle(color: AppTheme.goldColor, fontSize: 12),
          ),
          const SizedBox(height: 12),

          // Análisis del Estilista de IA
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.psychology, color: AppTheme.goldColor, size: 16),
                    SizedBox(width: 6),
                    Text(
                      'CONSEJO DEL ASESOR DE IMAGEN',
                      style: TextStyle(color: AppTheme.goldColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  outfit.analisisEstilistaIa,
                  style: const TextStyle(color: AppTheme.textColor, fontSize: 12),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.palette, color: Colors.purpleAccent, size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        outfit.reglaColorimetria,
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontStyle: FontStyle.italic),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Galería horizontal de prendas del outfit
          SizedBox(
            height: 160,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: outfit.prendas.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, idx) {
                final p = outfit.prendas[idx];
                return Container(
                  width: 130,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF141822),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          height: 70,
                          width: double.infinity,
                          color: Colors.black26,
                          child: p.imagenPrincipal != null
                              ? CachedNetworkImage(imageUrl: p.imagenPrincipal!, fit: BoxFit.cover)
                              : const Icon(Icons.checkroom, size: 36, color: Colors.white30),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        p.nombre,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _parseHex(p.colorHex),
                            ),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              p.colorSugerido,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 9),
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                        style: const TextStyle(color: AppTheme.goldColor, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),

          // Total y Botón de Compra
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('OUTFIT COMPLETO', style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 10)),
                  Text(
                    'Bs. ${outfit.precioTotalFinal.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                label: const Text('COMPRAR OUTFIT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                onPressed: () {
                  final carrito = context.read<CarritoProvider>();
                  for (final p in outfit.prendas) {
                    carrito.agregarItem(
                      idProducto: p.idProducto,
                      talla: p.tallaSugerida,
                      color: p.colorSugerido,
                      cantidad: 1,
                    );
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('¡${outfit.prendas.length} prendas del outfit añadidas a tu bolsa!'),
                      backgroundColor: AppTheme.cardColor,
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

