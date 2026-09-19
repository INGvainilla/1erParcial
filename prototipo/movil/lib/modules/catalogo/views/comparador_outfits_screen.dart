import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:fashionstore_mobile/core/models/catalogo_item.dart';
import 'package:fashionstore_mobile/core/providers/comparador_provider.dart';
import 'package:fashionstore_mobile/core/providers/carrito_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/ar_viewer/views/vestidor_ar_screen.dart';

class ComparadorOutfitsScreen extends StatelessWidget {
  const ComparadorOutfitsScreen({Key? key}) : super(key: key);

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

  @override
  Widget build(BuildContext context) {
    final comparador = context.watch<ComparadorProvider>();
    final prendas = comparador.prendas;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.compare_arrows, color: AppTheme.goldColor),
            const SizedBox(width: 8),
            Text('Comparador de Outfits (${prendas.length}/3)'),
          ],
        ),
        actions: [
          if (prendas.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, color: Colors.white70),
              tooltip: 'Vaciar Comparador',
              onPressed: () => comparador.limpiar(),
            ),
        ],
      ),
      body: prendas.isEmpty
          ? _buildEmptyState(context)
          : Column(
              children: [
                // Resumen Financiero Consolidado del Outfit
                _buildSummaryBar(context, comparador),

                // Contenido Lado a Lado
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: prendas
                              .map((p) => _buildPrendaColumn(context, p, comparador))
                              .toList(),
                        ),
                      ),
                    ),
                  ),
                ),

                // Barra Inferior de Acción (Comprar Outfit Completo)
                _buildBottomBar(context, comparador),
              ],
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.goldColor.withOpacity(0.3)),
              ),
              child: const Icon(Icons.compare_arrows, size: 64, color: AppTheme.goldColor),
            ),
            const SizedBox(height: 24),
            const Text(
              'Comparador Vacío',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Selecciona hasta 3 prendas del catálogo para contrastar estilos, materiales, colores y precios lado a lado.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.goldColor,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.grid_view),
              label: const Text('EXPLORAR CATÁLOGO', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryBar(BuildContext context, ComparadorProvider comp) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        border: const Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'VALOR TOTAL DEL OUTFIT',
                style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11, letterSpacing: 1),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    'Bs. ${comp.totalPrecioFinal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: AppTheme.goldColor,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (comp.ahorroTotal > 0) ...[
                    const SizedBox(width: 8),
                    Text(
                      'Bs. ${comp.totalPrecioBase.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 13,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          if (comp.ahorroTotal > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.greenAccent),
              ),
              child: Text(
                'Ahorras Bs. ${comp.ahorroTotal.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPrendaColumn(BuildContext context, PrendaCatalogo p, ComparadorProvider comp) {
    const colWidth = 220.0;

    return Container(
      width: colWidth,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Quitar del comparador
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  p.codigoSkuBase,
                  style: const TextStyle(color: AppTheme.goldColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.close, color: Colors.white54, size: 18),
                onPressed: () => comp.removerPrenda(p.idProducto),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Imagen de la Prenda
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
              height: 180,
              width: double.infinity,
              color: Colors.black26,
              child: p.imagenPrincipal != null
                  ? CachedNetworkImage(
                      imageUrl: p.imagenPrincipal!,
                      fit: BoxFit.cover,
                    )
                  : const Icon(Icons.checkroom, size: 60, color: Colors.white30),
            ),
          ),
          const SizedBox(height: 10),

          // Nombre y Marca
          Text(
            p.nombre,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            '${p.nombreCategoria ?? "Prenda"} • ${p.nombreMarca ?? "Boutique"}',
            style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
          ),
          const SizedBox(height: 8),

          // Precios
          Row(
            children: [
              Text(
                'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              if (p.descuentoPct > 0) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '-${p.descuentoPct.toInt()}%',
                    style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
          const Divider(color: Colors.white12, height: 20),

          // Colores
          const Text('Colores disponibles:', style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            children: p.colores
                .map((c) => Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _parseHex(c.codigoHex),
                        border: Border.all(color: Colors.white38),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 10),

          // Tallas
          const Text('Tallas:', style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11)),
          const SizedBox(height: 4),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: p.tallas
                .map((t) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(t.talla, style: const TextStyle(color: Colors.white, fontSize: 10)),
                    ))
                .toList(),
          ),
          const SizedBox(height: 10),

          // Disponibilidad Sucursales
          const Text('Disponibilidad física:', style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11)),
          const SizedBox(height: 4),
          Text(
            p.stockTotalDisponible > 0
                ? '${p.stockTotalDisponible} unidades en sucursales'
                : 'Agotado temporalmente',
            style: TextStyle(
              color: p.stockTotalDisponible > 0 ? Colors.greenAccent : Colors.orangeAccent,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),

          // Botón Probar en RA individual
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.goldColor,
              side: const BorderSide(color: AppTheme.goldColor),
              minimumSize: const Size(double.infinity, 36),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.view_in_ar, size: 16),
            label: const Text('PROBAR EN RA', style: TextStyle(fontSize: 11)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VestidorArScreen(prenda: p),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, ComparadorProvider comp) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        border: const Border(top: BorderSide(color: Colors.white12)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.goldColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.shopping_bag),
                label: Text(
                  'COMPRAR OUTFIT COMPLETO (${comp.cantidad} PRENDAS)',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                onPressed: () {
                  final carrito = context.read<CarritoProvider>();
                  for (final p in comp.prendas) {
                    final color = p.colores.isNotEmpty ? p.colores.first : null;
                    final talla = p.tallas.isNotEmpty ? p.tallas.first.talla : 'M';
                    carrito.agregarItem(
                      idProducto: p.idProducto,
                      talla: talla,
                      color: color?.nombre ?? 'Estándar',
                      cantidad: 1,
                    );
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('¡${comp.cantidad} prendas del outfit añadidas a tu bolsa de compras!'),
                      backgroundColor: AppTheme.cardColor,
                    ),
                  );
                  Navigator.pop(context);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
