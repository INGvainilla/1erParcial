import 'dart:async';
import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/models/tracking.dart';
import 'package:fashionstore_mobile/core/services/logistica_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class TrackingScreen extends StatefulWidget {
  final int idOrden;

  const TrackingScreen({Key? key, required this.idOrden}) : super(key: key);

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  final LogisticaService _logisticaService = LogisticaService();

  Tracking? _tracking;
  bool _isLoading = true;
  String? _errorMessage;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _cargarTracking();
    _iniciarPolling();
  }

  void _iniciarPolling() {
    _pollTimer = Timer.periodic(const Duration(milliseconds: 2500), (_) {
      _refrescarSilencioso();
    });
  }

  Future<void> _refrescarSilencioso() async {
    if (!mounted) return;
    try {
      final data = await _logisticaService.getTracking(widget.idOrden);
      if (!mounted) return;
      setState(() {
        _tracking = data;
      });
    } catch (_) {
      // Ignorar errores transitorios de sondeo silencioso
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _cargarTracking() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await _logisticaService.getTracking(widget.idOrden);
      if (!mounted) return;
      setState(() {
        _tracking = data;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'No se pudo cargar el seguimiento: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: Text(
                'Seguimiento #${widget.idOrden}',
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.success.withOpacity(0.15),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: AppTheme.success.withOpacity(0.4)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.circle, color: AppTheme.success, size: 7),
                  SizedBox(width: 4),
                  Text('EN VIVO', style: TextStyle(color: AppTheme.success, fontSize: 9, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarTracking,
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
                        Text(_errorMessage!, style: const TextStyle(color: AppTheme.danger)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _cargarTracking, child: const Text('Reintentar')),
                      ],
                    ),
                  ),
                )
              : _tracking == null
                  ? const Center(child: Text('No hay información de despacho.'))
                  : ListView(
                      padding: const EdgeInsets.all(20),
                      children: [
                        // Cabecera de estado
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: AppTheme.bgSurface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _tracking!.numeroFactura ?? 'ORDEN #${_tracking!.idOrden}',
                                    style: const TextStyle(
                                      color: AppTheme.accentGold,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accentGold.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '${_tracking!.porcentajeProgreso}% COMPLETADO',
                                      style: const TextStyle(
                                        color: AppTheme.accentGold,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              // Barra de progreso lineal
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: _tracking!.porcentajeProgreso / 100.0,
                                  minHeight: 6,
                                  backgroundColor: AppTheme.bgElevated,
                                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentGold),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Estado Actual: ${_tracking!.estadoLogistica}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _tracking!.modalidadEntrega == 'DELIVERY'
                                    ? 'Destino: ${_tracking!.direccionEnvio ?? "Dirección cliente"}'
                                    : 'Retiro en: ${_tracking!.nombreSucursal ?? "Sucursal"} (${_tracking!.direccionSucursal ?? ""})',
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Repartidor asignado (si aplica)
                        if (_tracking!.nombreRepartidor != null && _tracking!.nombreRepartidor!.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.bgSurface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Row(
                              children: [
                                const CircleAvatar(
                                  backgroundColor: AppTheme.bgElevated,
                                  child: Icon(Icons.delivery_dining, color: AppTheme.accentGold),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Repartidor Asignado', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                                      Text(_tracking!.nombreRepartidor!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                      if (_tracking!.telefonoRepartidor != null)
                                        Text('Tel: ${_tracking!.telefonoRepartidor}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],

                        // Stepper de 4 etapas
                        const Text(
                          'ETAPAS DEL DESPACHO',
                          style: TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),

                        ..._tracking!.pasos.asMap().entries.map((entry) {
                          final int idx = entry.key;
                          final paso = entry.value;
                          final bool isLast = idx == _tracking!.pasos.length - 1;

                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: paso.completado
                                          ? AppTheme.accentGold
                                          : paso.activo
                                              ? AppTheme.accentGold.withOpacity(0.2)
                                              : AppTheme.bgElevated,
                                      border: Border.all(
                                        color: (paso.completado || paso.activo)
                                            ? AppTheme.accentGold
                                            : AppTheme.border,
                                        width: 1.5,
                                      ),
                                    ),
                                    child: Icon(
                                      paso.completado ? Icons.check : Icons.circle,
                                      size: paso.completado ? 16 : 8,
                                      color: paso.completado
                                          ? AppTheme.bgMain
                                          : paso.activo
                                              ? AppTheme.accentGold
                                              : AppTheme.textMuted,
                                    ),
                                  ),
                                  if (!isLast)
                                    Container(
                                      width: 2,
                                      height: 36,
                                      color: paso.completado ? AppTheme.accentGold : AppTheme.border,
                                    ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        paso.titulo,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                          color: (paso.completado || paso.activo)
                                              ? AppTheme.textPrimary
                                              : AppTheme.textMuted,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        paso.descripcion,
                                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),

                        const SizedBox(height: 20),

                        // Lista de prendas en el paquete
                        const Text(
                          'PRENDAS EN ESTE PAQUETE',
                          style: TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),

                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.bgSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            children: _tracking!.prendas.map((p) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(Icons.checkroom_outlined, size: 18, color: AppTheme.accentGold),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        '${p.cantidad}x ${p.nombreProducto} (${p.talla}/${p.color})',
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
    );
  }
}
