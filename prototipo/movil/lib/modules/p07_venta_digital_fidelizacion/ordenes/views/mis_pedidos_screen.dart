import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fashionstore_mobile/core/models/orden.dart';
import 'package:fashionstore_mobile/core/services/network_service.dart';
import 'package:fashionstore_mobile/core/services/ordenes_service.dart';
import 'package:fashionstore_mobile/core/services/pagos_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p09_procesamiento_pagos/pagos/views/pago_orden_screen.dart';
import 'package:fashionstore_mobile/modules/p10_logistica_delivery/tracking/views/tracking_screen.dart';
import 'package:fashionstore_mobile/modules/p08_punto_venta_pos/devoluciones/solicitud_devolucion_screen.dart';
import 'package:fashionstore_mobile/core/services/devoluciones_service.dart';
import 'package:fashionstore_mobile/core/services/offline_devoluciones_service.dart';

class MisPedidosScreen extends StatefulWidget {
  const MisPedidosScreen({Key? key}) : super(key: key);

  @override
  State<MisPedidosScreen> createState() => _MisPedidosScreenState();
}

class _MisPedidosScreenState extends State<MisPedidosScreen> {
  final OrdenesService _ordenesService = OrdenesService();
  final PagosService _pagosService = PagosService();

  List<Orden> _ordenes = [];
  List<Map<String, dynamic>> _operacionesOffline = [];
  bool _isLoading = true;
  String? _errorMessage;

  Timer? _timerMonitoreoConexion;
  bool _isAutoPaying = false;

  @override
  void initState() {
    super.initState();
    _cargarOrdenes();

    // Monitoreo proactivo: en cuanto detecta internet, paga automáticamente sin que el cliente presione nada
    _timerMonitoreoConexion = Timer.periodic(const Duration(seconds: 4), (timer) {
      _verificarYAutoliquidar();
    });
  }

  @override
  void dispose() {
    _timerMonitoreoConexion?.cancel();
    super.dispose();
  }

  Future<void> _verificarYAutoliquidar() async {
    if (_isAutoPaying) return;
    final tieneInternet = await NetworkService.tieneInternetReal();
    if (!tieneInternet) return;

    final hayPendientes = _ordenes.any((o) => o.estadoPago.toUpperCase() == 'PENDIENTE') ||
        _operacionesOffline.any((op) => op['tipo_operacion'] == 'PAGO_ORDEN');

    if (!hayPendientes) return;

    _isAutoPaying = true;
    try {
      int liquidadas = 0;

      // 1. Sincronizar cola local de SQLite
      liquidadas += await OfflineDevolucionesService().sincronizarPagosPendientes(_pagosService);

      // 2. Pagar automáticamente las órdenes que quedaron en PENDIENTE
      for (var o in _ordenes) {
        if (o.estadoPago.toUpperCase() == 'PENDIENTE') {
          try {
            final intent = await _pagosService.crearIntencionPago(o.idOrden);
            await _pagosService.confirmarPagoDirecto(o.idOrden, intent.paymentIntentId);
            liquidadas++;
          } catch (_) {}
        }
      }

      if (liquidadas > 0) {
        final listActualizada = await _ordenesService.getMisOrdenes();
        final offlineOps = await OfflineDevolucionesService().obtenerOperacionesPendientes();
        if (mounted) {
          setState(() {
            _ordenes = listActualizada;
            _operacionesOffline = offlineOps;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('⚡ ¡Internet restablecido! Se confirmó el pago automático de $liquidadas pedido(s).'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    } catch (_) {
    } finally {
      _isAutoPaying = false;
    }
  }

  Future<void> _cargarOrdenes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Sincronización automática de devoluciones offline pendientes (CU11 / CU12)
      final sincs = await OfflineDevolucionesService().sincronizarPendientes(DevolucionesService());
      if (sincs > 0 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Sincronizadas $sincs solicitud(es) de devolución encoladas offline.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (_) {}

    try {
      final offlineOps = await OfflineDevolucionesService().obtenerOperacionesPendientes();
      if (mounted) _operacionesOffline = offlineOps;
    } catch (_) {}

    try {
      final list = await _ordenesService.getMisOrdenes();
      if (!mounted) return;
      setState(() {
        _ordenes = list;
        _isLoading = false;
      });

      // Si hay internet, verificar si alguna orden pendiente puede autoliquidarse
      _verificarYAutoliquidar();
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
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          if (_operacionesOffline.isNotEmpty) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.orangeAccent, width: 1.2),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Icon(Icons.wifi_off_rounded, color: Colors.orangeAccent, size: 20),
                                      SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'OPERACIONES EN COLA OFFLINE (CU11 / CU12)',
                                          style: TextStyle(
                                            color: Colors.orangeAccent,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Las siguientes solicitudes fueron guardadas en SQLite local sin conexión a Internet. Se transmitirán y liquidarán automáticamente al conectarte a Wi-Fi o Datos Móviles:',
                                    style: TextStyle(color: Colors.white70, fontSize: 11),
                                  ),
                                  const SizedBox(height: 10),
                                  ..._operacionesOffline.map((op) {
                                    final totalEst = op['total_estimado'] != null ? double.tryParse(op['total_estimado'].toString()) ?? 0.0 : 0.0;
                                    final vale = op['codigo_vale_local'];
                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: AppTheme.bgSurface,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: Colors.orange.withOpacity(0.3)),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Ticket: ${op['nro_ticket_original'] ?? 'DEV-OFFLINE'}',
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                                                ),
                                                if (vale != null)
                                                  Text('Vale provisional: $vale', style: const TextStyle(color: Colors.orangeAccent, fontSize: 11)),
                                                const Text('Estado: PENDIENTE DE SINCRONIZAR', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            'Bs. ${totalEst.toStringAsFixed(2)}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.orangeAccent),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ],
                              ),
                            ),
                          ],
                          ..._ordenes.map((orden) => Padding(
                                padding: const EdgeInsets.only(bottom: 14),
                                child: _buildOrdenCard(context, orden),
                              )),
                        ],
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
                  orden.estadoPago.toUpperCase() == 'PENDIENTE'
                      ? 'PENDIENTE DE PAGO'
                      : orden.estadoPago.toUpperCase(),
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
          if (!esPagado) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.12),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.hourglass_empty_rounded, color: Colors.amber, size: 14),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Pedido registrado pero aún PENDIENTE. Conéctate a Internet para completar el cobro digital.',
                      style: TextStyle(color: Colors.amber, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
          ],
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
