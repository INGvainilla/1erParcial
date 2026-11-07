import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:fashionstore_mobile/core/models/orden.dart';
import 'package:fashionstore_mobile/core/services/devoluciones_service.dart';
import 'package:fashionstore_mobile/core/services/offline_devoluciones_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class SolicitudDevolucionScreen extends StatefulWidget {
  final Orden orden;

  const SolicitudDevolucionScreen({Key? key, required this.orden}) : super(key: key);

  @override
  State<SolicitudDevolucionScreen> createState() => _SolicitudDevolucionScreenState();
}

class _SolicitudDevolucionScreenState extends State<SolicitudDevolucionScreen> {
  final DevolucionesService _devolucionesService = DevolucionesService();
  final OfflineDevolucionesService _offlineService = OfflineDevolucionesService();

  final Map<int, bool> _prendasSeleccionadas = {};
  final Map<int, int> _cantidadesDevolver = {};
  final Map<int, String> _estadoFisico = {};

  String _motivoSeleccionado = 'Cambio de talla / no me quedó';
  String _tipoResolucion = 'CAMBIO_VARIANTE'; // Por defecto para facilitar la experiencia
  final _observacionesController = TextEditingController();

  String _nuevaTallaCambio = 'M';
  String _nuevoColorCambio = '';
  int? _productoCambioId;

  bool _isSubmitting = false;
  String? _errorMessage;

  // Matriz de factores de talla oficial de FashionStore (proporcional al precio base M / 40)
  static const Map<String, double> _factoresTalla = {
    'XS': 0.90,
    'S': 0.95,
    'M': 1.00,
    'L': 1.05,
    'XL': 1.10,
    'XXL': 1.15,
    '3XL': 1.20,
    '38': 0.95,
    '39': 0.98,
    '40': 1.00,
    '41': 1.02,
    '42': 1.05,
    '43': 1.08,
    '44': 1.10,
  };

  final List<String> _motivos = [
    'Cambio de talla / no me quedó',
    'Defecto o tara de confección',
    'No era lo esperado / no me gustó el calce',
    'Preferencia personal',
  ];

  @override
  void initState() {
    super.initState();
    for (var d in widget.orden.detalles) {
      _prendasSeleccionadas[d.idProducto] = false;
      _cantidadesDevolver[d.idProducto] = 1;
      _estadoFisico[d.idProducto] = 'APTO_VENTA';
    }

    if (widget.orden.detalles.isNotEmpty) {
      final primerDetalle = widget.orden.detalles.first;
      // Pre-seleccionar la primera prenda del pedido
      _prendasSeleccionadas[primerDetalle.idProducto] = true;
      _productoCambioId = primerDetalle.idProducto;
      _nuevoColorCambio = primerDetalle.color;
      _nuevaTallaCambio = primerDetalle.talla.toUpperCase().trim();
    }
  }

  OrdenDetalle? get _prendaReferencia {
    for (var d in widget.orden.detalles) {
      if (_prendasSeleccionadas[d.idProducto] == true) {
        return d;
      }
    }
    return widget.orden.detalles.isNotEmpty ? widget.orden.detalles.first : null;
  }

  List<String> get _tallasSugeridas {
    final ref = _prendaReferencia;
    if (ref == null) return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    final tallaOrig = ref.talla.trim().toUpperCase();
    if (RegExp(r'^\d+$').hasMatch(tallaOrig)) {
      final num = int.tryParse(tallaOrig) ?? 40;
      if (num >= 35 && num <= 48) {
        return ['38', '39', '40', '41', '42', '43', '44'];
      }
      return ['28', '30', '32', '34', '36', '38', '40'];
    }
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  }

  List<String> get _coloresSugeridos {
    final ref = _prendaReferencia;
    final colOrig = ref?.color.trim() ?? '';
    final setColores = <String>{
      if (colOrig.isNotEmpty) colOrig,
      'Azul Marino',
      'Negro Clásico',
      'Blanco Puro',
      'Gris Oxford',
      'Verde Salvia',
      'Celeste Pastel',
      'Vino Tinto',
      'Beige Claro',
    };
    return setColores.toList();
  }

  /// Calcula el precio unitario exacto de cualquier talla con respecto a la prenda del pedido
  double _calcularPrecioParaTalla(String talla) {
    final ref = _prendaReferencia;
    if (ref == null) return 100.0;
    final tallaOrig = ref.talla.trim().toUpperCase();
    final tallaDest = talla.trim().toUpperCase();

    // Si es la misma talla (ej. cambio directo de color), precio idéntico
    if (tallaDest == tallaOrig) {
      return ref.precioUnitario;
    }

    final factorOrig = _factoresTalla[tallaOrig] ?? 1.00;
    final factorDest = _factoresTalla[tallaDest] ?? 1.00;

    final precioBase = ref.precioUnitario / factorOrig;
    final precioCalculado = precioBase * factorDest;
    return (precioCalculado * 100).round() / 100.0;
  }

  /// Precio de la nueva prenda seleccionada para el cambio
  double get _precioNuevaPrenda {
    return _calcularPrecioParaTalla(_nuevaTallaCambio);
  }

  /// Precio original pagado en la orden por la prenda a cambiar
  double get _precioPrendaOriginal {
    return _prendaReferencia?.precioUnitario ?? 0.0;
  }

  /// Diferencia de precio al realizar el cambio:
  /// > 0: El cliente abona la diferencia (talla más grande)
  /// < 0: La tienda devuelve saldo al cliente mediante Vale (talla más pequeña)
  /// == 0: Cambio directo mano a mano (mismo precio o cambio de color)
  double get _diferenciaIntercambio {
    if (_tipoResolucion != 'CAMBIO_VARIANTE') return 0.0;
    final diff = _precioNuevaPrenda - _precioPrendaOriginal;
    return (diff * 100).round() / 100.0;
  }

  @override
  void dispose() {
    _observacionesController.dispose();
    super.dispose();
  }

  int get _diasTranscurridos {
    final now = DateTime.now();
    return now.difference(widget.orden.creadoEn).inDays;
  }

  bool get _dentroDePlazo => _diasTranscurridos <= 14;

  double get _totalEstimadoDevolucion {
    double total = 0;
    for (var d in widget.orden.detalles) {
      if (_prendasSeleccionadas[d.idProducto] == true) {
        final cant = _cantidadesDevolver[d.idProducto] ?? 1;
        total += d.precioUnitario * cant;
      }
    }
    return total;
  }

  Future<void> _enviarSolicitud() async {
    final seleccionados = widget.orden.detalles
        .where((d) => _prendasSeleccionadas[d.idProducto] == true)
        .toList();

    if (seleccionados.isEmpty) {
      setState(() => _errorMessage = 'Selecciona al menos una prenda para devolver o cambiar.');
      return;
    }

    if (!_dentroDePlazo) {
      setState(() => _errorMessage = 'El plazo máximo de 14 días para devoluciones ha expirado.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final ticketOriginal = widget.orden.numeroFactura ?? 'ORDEN-${widget.orden.idOrden}';

    final itemsPayload = seleccionados.map((d) {
      return {
        'id_producto': d.idProducto,
        'talla': d.talla,
        'color': d.color,
        'cantidad': _cantidadesDevolver[d.idProducto] ?? 1,
        'estado_fisico': _estadoFisico[d.idProducto] ?? 'APTO_VENTA',
      };
    }).toList();

    Map<String, dynamic>? cambioInfo;
    if (_tipoResolucion == 'CAMBIO_VARIANTE') {
      final primerItem = seleccionados.first;
      cambioInfo = {
        'nuevo_producto_id': _productoCambioId ?? primerItem.idProducto,
        'nueva_talla': _nuevaTallaCambio.isNotEmpty ? _nuevaTallaCambio : primerItem.talla,
        'nuevo_color': _nuevoColorCambio.isNotEmpty ? _nuevoColorCambio : primerItem.color,
        'nueva_cantidad': 1,
      };
    }

    final body = {
      'nro_ticket_original': ticketOriginal,
      'motivo': _motivoSeleccionado,
      'tipo_resolucion': _tipoResolucion,
      'items': itemsPayload,
      if (cambioInfo != null) 'cambio_info': cambioInfo,
    };

    try {
      final res = await _devolucionesService.procesarDevolucion(body);
      if (!mounted) return;
      _mostrarDialogoResultado(res, isOffline: false);
    } catch (e) {
      final errStr = e.toString().toLowerCase();
      final esErrorRed = errStr.contains('socketexception') ||
          errStr.contains('clientexception') ||
          errStr.contains('connection refused') ||
          errStr.contains('failed host lookup') ||
          errStr.contains('network is unreachable') ||
          errStr.contains('timeout') ||
          errStr.contains('os error: connection refused') ||
          errStr.contains('handshake');

      if (esErrorRed) {
        // Modo Offline: Guardar en SQLite local conforme a CU11/CU12
        try {
          final resOffline = await _offlineService.guardarDevolucionOffline(
            nroTicketOriginal: ticketOriginal,
            motivo: _motivoSeleccionado,
            tipoResolucion: _tipoResolucion,
            payload: body,
            totalEstimado: _totalEstimadoDevolucion,
            diferenciaEstimada: _diferenciaIntercambio,
            nuevaTalla: _tipoResolucion == 'CAMBIO_VARIANTE' ? _nuevaTallaCambio : null,
            nuevoColor: _tipoResolucion == 'CAMBIO_VARIANTE' ? _nuevoColorCambio : null,
          );
          if (!mounted) return;
          _mostrarDialogoResultado(resOffline, isOffline: true);
          return;
        } catch (localErr) {
          if (!mounted) return;
          setState(() => _errorMessage = 'Error guardando en almacenamiento offline: $localErr');
          return;
        }
      }

      if (!mounted) return;
      setState(() => _errorMessage = 'Error procesando la devolución: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _mostrarDialogoResultado(Map<String, dynamic> res, {required bool isOffline}) {
    final nroDev = res['nro_devolucion'] ?? (isOffline ? 'DEV-OFFLINE' : 'DEV-PROCESADA');
    final codigoVale = res['codigo_vale'];
    final totalDev = (res['total_devuelto'] != null)
        ? double.tryParse(res['total_devuelto'].toString()) ?? _totalEstimadoDevolucion
        : _totalEstimadoDevolucion;
    final msgKardex = res['mensaje_kardex'] ?? 'Reingreso inmutable al Kardex valorado al CPP histórico.';
    final ref = _prendaReferencia;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isOffline ? Colors.orangeAccent : AppTheme.accentGold,
            width: 1.5,
          ),
        ),
        title: Row(
          children: [
            Icon(
              isOffline ? Icons.wifi_off_rounded : Icons.check_circle_rounded,
              color: isOffline ? Colors.orangeAccent : AppTheme.success,
              size: 26,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isOffline ? '📡 Registro Offline (CU11/CU12)' : '¡Devolución Procesada (CU25)!',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isOffline) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.cloud_queue, color: Colors.orangeAccent, size: 20),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Sin conexión a Internet (Wi-Fi o Datos Móviles). Tu solicitud ha sido asegurada localmente en SQLite y se sincronizará automáticamente al reconectarte.',
                          style: TextStyle(color: Colors.orangeAccent, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              Text(
                isOffline ? 'Comprobante Local: $nroDev' : 'Comprobante Oficial: $nroDev',
                style: TextStyle(
                  color: isOffline ? Colors.orangeAccent : AppTheme.accentGold,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Valor de la prenda devuelta: Bs. ${totalDev.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),

              // Detalle de la resolución de intercambio
              if (_tipoResolucion == 'CAMBIO_VARIANTE') ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgMain,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: _diferenciaIntercambio > 0
                          ? AppTheme.accentGold
                          : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _diferenciaIntercambio > 0
                                ? Icons.trending_up
                                : (_diferenciaIntercambio < 0 ? Icons.savings_outlined : Icons.swap_horiz),
                            color: _diferenciaIntercambio > 0
                                ? AppTheme.accentGold
                                : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _diferenciaIntercambio > 0
                                  ? 'TALLA MAYOR: ABONO DE DIFERENCIA'
                                  : (_diferenciaIntercambio < 0
                                      ? 'TALLA MENOR: REEMBOLSO A TU FAVOR'
                                      : 'INTERCAMBIO DIRECTO DE COLOR'),
                              style: TextStyle(
                                color: _diferenciaIntercambio > 0
                                    ? AppTheme.accentGold
                                    : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Nueva Prenda: Talla $_nuevaTallaCambio • Color $_nuevoColorCambio',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Precio nueva talla: Bs. ${_precioNuevaPrenda.toStringAsFixed(2)}',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                      ),
                      const SizedBox(height: 6),
                      if (_diferenciaIntercambio > 0) ...[
                        Text(
                          'Monto adicional a abonar: +Bs. ${_diferenciaIntercambio.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppTheme.accentGold, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Pasa por la Sucursal Equipetrol para retirar tu prenda abonando la diferencia.',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ] else if (_diferenciaIntercambio < 0) ...[
                        Text(
                          'Saldo reembolsado a tu favor: Bs. ${(-_diferenciaIntercambio).toStringAsFixed(2)}',
                          style: const TextStyle(color: Colors.greenAccent, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isOffline
                              ? 'Tu reembolso se encuentra en estado pendiente. Al reconectarte a Internet (Wi-Fi o datos) se emitirá tu Vale de Crédito Oficial.'
                              : 'Se te ha reembolsado la diferencia restante mediante un Vale de Crédito Digital.',
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ] else ...[
                        const Text(
                          'Diferencia: Bs. 0.00 (Mismo precio)',
                          style: TextStyle(color: Colors.lightBlueAccent, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Cambio directo mano a mano de ${ref?.color ?? ''} a $_nuevoColorCambio en sucursal.',
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

              // Código de Vale si aplica
              if (codigoVale != null && codigoVale.toString().isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgMain,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.greenAccent),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isOffline ? 'VALE PROVISIONAL OFFLINE:' : 'CÓDIGO DE VALE GENERADO:',
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          if (isOffline)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('PENDIENTE SINCRONIZAR', style: TextStyle(color: Colors.orangeAccent, fontSize: 9)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '$codigoVale',
                            style: const TextStyle(
                              color: Colors.greenAccent,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, color: Colors.greenAccent, size: 18),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: '$codigoVale'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Código de vale copiado al portapapeles')),
                              );
                            },
                          ),
                        ],
                      ),
                      Text(
                        isOffline
                            ? 'Este código se validará en el servidor apenas recuperes acceso a Wi-Fi o datos móviles.'
                            : 'Puedes usarlo inmediatamente como cupón de descuento en tu próxima compra.',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

              // Estado Kardex
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      isOffline ? Icons.save_as_outlined : Icons.inventory_2_outlined,
                      size: 18,
                      color: isOffline ? Colors.orangeAccent : Colors.greenAccent,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        msgKardex,
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context, true);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isOffline ? Colors.orangeAccent : AppTheme.accentGold,
              foregroundColor: AppTheme.bgMain,
            ),
            child: Text(isOffline ? 'ENTENDIDO (GUARDADO OFFLINE)' : 'ENTENDIDO / FINALIZAR'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final nroTicket = widget.orden.numeroFactura ?? 'ORDEN #${widget.orden.idOrden}';
    final fechaStr = DateFormat('dd/MM/yyyy').format(widget.orden.creadoEn);
    final ref = _prendaReferencia;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Devolución / Cambio (CU25)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.danger.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.danger.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppTheme.danger, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.danger, fontSize: 13)),
                    ),
                  ],
                ),
              ),

            // Encabezado del Ticket
            Container(
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
                        nroTicket,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: AppTheme.accentGold,
                        ),
                      ),
                      Text(
                        'Bs. ${widget.orden.total.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Fecha de Compra: $fechaStr', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  const SizedBox(height: 12),

                  // Banner de Ventana de 14 días
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: (_dentroDePlazo ? Colors.green : Colors.red).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: (_dentroDePlazo ? Colors.green : Colors.red).withOpacity(0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _dentroDePlazo ? Icons.check_circle_outline : Icons.warning_amber_rounded,
                          color: _dentroDePlazo ? Colors.greenAccent : Colors.redAccent,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _dentroDePlazo
                                ? 'Dentro del plazo fiscal: $_diasTranscurridos días transcurridos (Máximo 14 días permitidos).'
                                : 'Plazo vencido: Han transcurrido $_diasTranscurridos días desde la compra (Máximo 14 días).',
                            style: TextStyle(
                              color: _dentroDePlazo ? Colors.greenAccent : Colors.redAccent,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 1. Selección de Prendas
            const Text(
              '1. SELECCIONA LA PRENDA A DEVOLVER O CAMBIAR',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 10),

            ...widget.orden.detalles.map((d) {
              final isChecked = _prendasSeleccionadas[d.idProducto] ?? false;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isChecked ? AppTheme.accentGold.withOpacity(0.08) : AppTheme.bgSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isChecked ? AppTheme.accentGold : AppTheme.border,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          activeColor: AppTheme.accentGold,
                          checkColor: AppTheme.bgMain,
                          value: isChecked,
                          onChanged: (val) {
                            setState(() {
                              _prendasSeleccionadas[d.idProducto] = val ?? false;
                              if (val == true) {
                                _productoCambioId = d.idProducto;
                                _nuevoColorCambio = d.color;
                                _nuevaTallaCambio = d.talla.toUpperCase().trim();
                              }
                            });
                          },
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                d.nombreProducto,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Talla: ${d.talla} • Color: ${d.color} • Cant: ${d.cantidad}',
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          'Bs. ${d.subtotal.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.accentGold),
                        ),
                      ],
                    ),
                    if (isChecked) ...[
                      const Divider(),
                      Row(
                        children: [
                          const Text('Estado Físico: ', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _estadoFisico[d.idProducto] ?? 'APTO_VENTA',
                              dropdownColor: AppTheme.bgSurface,
                              items: const [
                                DropdownMenuItem(
                                  value: 'APTO_VENTA',
                                  child: Text('Apto para venta (etiquetas intactas)', style: TextStyle(fontSize: 11)),
                                ),
                                DropdownMenuItem(
                                  value: 'DEFECTUOSO_MERMA',
                                  child: Text('Defectuoso / Tara de fábrica', style: TextStyle(fontSize: 11)),
                                ),
                              ],
                              onChanged: (val) {
                                if (val != null) setState(() => _estadoFisico[d.idProducto] = val);
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              );
            }).toList(),

            const SizedBox(height: 16),

            // 2. Motivo de la Solicitud
            const Text(
              '2. MOTIVO DE LA DEVOLUCIÓN',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),

            DropdownButtonFormField<String>(
              isExpanded: true,
              value: _motivoSeleccionado,
              dropdownColor: AppTheme.bgSurface,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.help_outline, color: AppTheme.accentGold, size: 20),
                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
              ),
              items: _motivos.map((m) {
                return DropdownMenuItem(
                  value: m,
                  child: Text(
                    m,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _motivoSeleccionado = val);
              },
            ),

            const SizedBox(height: 20),

            // 3. Resolución Preferida
            const Text(
              '3. TIPO DE COMPENSACIÓN DESEADA',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),

            _buildResolucionOption(
              title: 'Cambio de Variante / Talla (Recomendado)',
              subtitle: 'Intercambia por otra talla o color con liquidación automática de precio.',
              tipo: 'CAMBIO_VARIANTE',
              icon: Icons.swap_horiz_rounded,
            ),
            const SizedBox(height: 8),

            _buildResolucionOption(
              title: 'Vale de Crédito Digital',
              subtitle: 'Genera un cupón de crédito utilizable en futuras compras.',
              tipo: 'VALE_CREDITO',
              icon: Icons.confirmation_number_outlined,
            ),
            const SizedBox(height: 8),

            _buildResolucionOption(
              title: 'Reembolso Económico',
              subtitle: 'Devolución directa según el medio de pago original.',
              tipo: 'REEMBOLSO_EFECTIVO',
              icon: Icons.payments_outlined,
            ),

            // SECCIÓN ESPECÍFICA PARA CAMBIO DE VARIANTE / TALLA
            if (_tipoResolucion == 'CAMBIO_VARIANTE') ...[
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.bgSurface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.accentGold, width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.tune_rounded, color: AppTheme.accentGold, size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'CONFIGURAR PRENDA DE INTERCAMBIO (CU25)',
                            style: TextStyle(
                              color: AppTheme.accentGold,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Prenda de referencia
                    if (ref != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, size: 16, color: AppTheme.accentGold),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Prenda a sustituir: ${ref.nombreProducto} (Talla: ${ref.talla} • Bs. ${ref.precioUnitario.toStringAsFixed(2)})',
                                style: const TextStyle(color: Colors.white70, fontSize: 11),
                              ),
                            ),
                          ],
                        ),
                      ),

                    const Text(
                      'Selecciona la nueva talla deseada y su precio:',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 10),

                    // Chips de tallas con precios proporcionales
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _tallasSugeridas.map((t) {
                        final isSel = _nuevaTallaCambio.toUpperCase().trim() == t.toUpperCase().trim();
                        final precioTalla = _calcularPrecioParaTalla(t);

                        return ChoiceChip(
                          label: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                t,
                                style: TextStyle(
                                  color: isSel ? AppTheme.bgMain : Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                              Text(
                                'Bs. ${precioTalla.toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: isSel ? AppTheme.bgMain : AppTheme.accentGold,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          selected: isSel,
                          selectedColor: AppTheme.accentGold,
                          backgroundColor: AppTheme.bgMain,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          side: BorderSide(
                            color: isSel ? AppTheme.accentGold : AppTheme.border,
                            width: isSel ? 1.5 : 1,
                          ),
                          onSelected: (val) {
                            if (val) setState(() => _nuevaTallaCambio = t);
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    const Text(
                      'Color deseado para la nueva prenda:',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      isExpanded: true,
                      value: _coloresSugeridos.contains(_nuevoColorCambio)
                          ? _nuevoColorCambio
                          : _coloresSugeridos.first,
                      dropdownColor: AppTheme.bgSurface,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.palette_outlined, color: AppTheme.accentGold, size: 18),
                        contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      ),
                      items: _coloresSugeridos.map((c) {
                        return DropdownMenuItem(
                          value: c,
                          child: Text(c, style: const TextStyle(fontSize: 13)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _nuevoColorCambio = val);
                      },
                    ),

                    const SizedBox(height: 16),

                    // TARJETA DE LIQUIDACIÓN DINÁMICA (Caso A, B o C)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _diferenciaIntercambio > 0
                            ? AppTheme.accentGold.withOpacity(0.12)
                            : (_diferenciaIntercambio < 0
                                ? Colors.green.withOpacity(0.12)
                                : Colors.blue.withOpacity(0.12)),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _diferenciaIntercambio > 0
                              ? AppTheme.accentGold
                              : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                _diferenciaIntercambio > 0
                                    ? Icons.trending_up
                                    : (_diferenciaIntercambio < 0 ? Icons.savings_outlined : Icons.swap_horiz_rounded),
                                color: _diferenciaIntercambio > 0
                                    ? AppTheme.accentGold
                                    : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _diferenciaIntercambio > 0
                                      ? 'TALLA MAYOR: ABONO DE DIFERENCIA'
                                      : (_diferenciaIntercambio < 0
                                          ? 'TALLA MENOR: REEMBOLSO A TU FAVOR'
                                          : 'CAMBIO DE COLOR / MISMO PRECIO'),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                    color: _diferenciaIntercambio > 0
                                        ? AppTheme.accentGold
                                        : (_diferenciaIntercambio < 0 ? Colors.greenAccent : Colors.lightBlueAccent),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (_diferenciaIntercambio > 0) ...[
                            Text(
                              'Aumento a pagar por talla mayor: +Bs. ${_diferenciaIntercambio.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: AppTheme.accentGold,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'La nueva talla $_nuevaTallaCambio (Bs. ${_precioNuevaPrenda.toStringAsFixed(2)}) supera a tu talla original ${ref?.talla ?? ''} (Bs. ${_precioPrendaOriginal.toStringAsFixed(2)}). Abonarás la diferencia al retirar.',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ] else if (_diferenciaIntercambio < 0) ...[
                            Text(
                              'Saldo a tu favor a reembolsar: Bs. ${(-_diferenciaIntercambio).toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Colors.greenAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'La talla $_nuevaTallaCambio (Bs. ${_precioNuevaPrenda.toStringAsFixed(2)}) es más económica que la original ${ref?.talla ?? ''} (Bs. ${_precioPrendaOriginal.toStringAsFixed(2)}). Se te reembolsará la diferencia mediante Vale de Crédito.',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ] else ...[
                            const Text(
                              'Diferencia a liquidar: Bs. 0.00',
                              style: TextStyle(
                                color: Colors.lightBlueAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Ambas prendas tienen el mismo precio fiscal (Bs. ${_precioPrendaOriginal.toStringAsFixed(2)}). Se efectúa un intercambio directo mano a mano sin cobro ni devolución adicional.',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Resumen de liquidación final
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _tipoResolucion == 'CAMBIO_VARIANTE'
                          ? (_diferenciaIntercambio > 0
                              ? 'Abono requerido en caja:'
                              : (_diferenciaIntercambio < 0
                                  ? 'Reembolso restante (Vale):'
                                  : 'Liquidación cambio directo:'))
                          : 'Total a Devolver / Compensar:',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  Text(
                    _tipoResolucion == 'CAMBIO_VARIANTE'
                        ? (_diferenciaIntercambio > 0
                            ? '+Bs. ${_diferenciaIntercambio.toStringAsFixed(2)}'
                            : (_diferenciaIntercambio < 0
                                ? 'Bs. ${(-_diferenciaIntercambio).toStringAsFixed(2)}'
                                : 'Bs. 0.00'))
                        : 'Bs. ${_totalEstimadoDevolucion.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: _tipoResolucion == 'CAMBIO_VARIANTE' && _diferenciaIntercambio < 0
                          ? Colors.greenAccent
                          : AppTheme.accentGold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (!_dentroDePlazo || _isSubmitting || _totalEstimadoDevolucion <= 0)
                    ? null
                    : _enviarSolicitud,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                      )
                    : const Text(
                        'Confirmar Devolución / Cambio',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResolucionOption({
    required String title,
    required String subtitle,
    required String tipo,
    required IconData icon,
  }) {
    final isSelected = _tipoResolucion == tipo;

    return InkWell(
      onTap: () => setState(() => _tipoResolucion = tipo),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accentGold.withOpacity(0.1) : AppTheme.bgSurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppTheme.accentGold : AppTheme.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppTheme.accentGold : AppTheme.textSecondary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: isSelected ? AppTheme.accentGold : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.radio_button_checked, color: AppTheme.accentGold, size: 18)
            else
              const Icon(Icons.radio_button_off, color: AppTheme.textMuted, size: 18),
          ],
        ),
      ),
    );
  }
}
