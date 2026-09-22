import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fashionstore_mobile/core/models/orden.dart';
import 'package:fashionstore_mobile/core/services/ordenes_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p09_procesamiento_pagos/pagos/views/pago_orden_screen.dart';
import 'package:fashionstore_mobile/modules/p10_logistica_delivery/tracking/views/tracking_screen.dart';
import 'package:fashionstore_mobile/modules/p08_punto_venta_pos/devoluciones/solicitud_devolucion_screen.dart';

class MisPedidosScreen extends StatefulWidget {
  const MisPedidosScreen({Key? key}) : super(key: key);

  @override
  State<MisPedidosScreen> createState() => _MisPedidosScreenState();
}

class _MisPedidosScreenState extends State<MisPedidosScreen> {
  final OrdenesService _ordenesService = OrdenesService();
  List<Orden> _ordenes = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _cargarOrdenes();
  }

  Future<void> _cargarOrdenes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _ordenesService.getMisOrdenes();
      if (!mounted) return;
      setState(() {
        _ordenes = list;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'No se pudieron cargar tus pedidos: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Pedidos y Compras'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarOrdenes,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accentGold))
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppTheme.danger),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.danger)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _cargarOrdenes, child: const Text('Reintentar')),
                      ],
                    ),
                  ),
                )
              : _ordenes.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.receipt_long_outlined, size: 64, color: AppTheme.textMuted),
                            const SizedBox(height: 16),
                            const Text('No tienes pedidos registrados', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            const Text(
                              'Tus compras omnicanal en web y app aparecerán aquí.',
                              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      color: AppTheme.accentGold,
                      onRefresh: _cargarOrdenes,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _ordenes.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (context, index) {
                          final orden = _ordenes[index];
                          return _buildOrdenCard(context, orden);
                        },
                      ),
                    ),
    );
  }

  Widget _buildOrdenCard(BuildContext context, Orden orden) {
    final bool esPagado = orden.estadoPago.toUpperCase() == 'PAGADO';
    final fechaStr = DateFormat('dd/MM/yyyy HH:mm').format(orden.creadoEn);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                orden.numeroFactura ?? 'ORDEN #${orden.idOrden}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: AppTheme.accentGold,
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (esPagado ? AppTheme.success : Colors.amber).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  orden.estadoPago.toUpperCase(),
                  style: TextStyle(
                    color: esPagado ? AppTheme.success : Colors.amber,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Fecha: $fechaStr • Canal: ${orden.canalVenta}',
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 6),
          Text(
            'Modalidad: ${orden.modalidadEntrega == "DELIVERY" ? "Envío a domicilio" : "Retiro en sucursal"} (${orden.estadoLogistica})',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
          ),
          const Divider(height: 20),

          // Detalles de prendas
          ...orden.detalles.take(2).map((d) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${d.cantidad}x ${d.nombreProducto} (${d.talla}/${d.color})',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                      ),
                    ),
                    Text(
                      'Bs. ${d.subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              )),
          if (orden.detalles.length > 2)
            Text(
              '+ ${orden.detalles.length - 2} prenda(s) más...',
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
            ),

          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              Text(
                'Bs. ${orden.total.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Botones de acción
          Row(
            children: [
              if (!esPagado) ...[
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PagoOrdenScreen(orden: orden),
                        ),
                      ).then((_) => _cargarOrdenes());
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text('Pagar Ahora', style: TextStyle(fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TrackingScreen(idOrden: orden.idOrden),
                      ),
                    );
                  },
                  icon: const Icon(Icons.location_on_outlined, size: 16),
                  label: const Text('Seguimiento', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
              if (esPagado) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => SolicitudDevolucionScreen(orden: orden),
                        ),
                      ).then((_) => _cargarOrdenes());
                    },
                    icon: const Icon(Icons.assignment_return_outlined, size: 16, color: AppTheme.accentGold),
                    label: const Text('Devolución', style: TextStyle(fontSize: 12, color: AppTheme.accentGold)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: const BorderSide(color: AppTheme.accentGold),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
