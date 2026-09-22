import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:fashionstore_mobile/core/models/orden.dart';
import 'package:fashionstore_mobile/core/services/devoluciones_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';

class SolicitudDevolucionScreen extends StatefulWidget {
  final Orden orden;

  const SolicitudDevolucionScreen({Key? key, required this.orden}) : super(key: key);

  @override
  State<SolicitudDevolucionScreen> createState() => _SolicitudDevolucionScreenState();
}

class _SolicitudDevolucionScreenState extends State<SolicitudDevolucionScreen> {
  final DevolucionesService _devolucionesService = DevolucionesService();

  final Map<int, bool> _prendasSeleccionadas = {};
  final Map<int, int> _cantidadesDevolver = {};
  final Map<int, String> _estadoFisico = {};

  String _motivoSeleccionado = 'Cambio de talla / no me quedó';
  String _tipoResolucion = 'VALE_CREDITO'; // 'VALE_CREDITO', 'CAMBIO_VARIANTE', 'REEMBOLSO_EFECTIVO'
  final _observacionesController = TextEditingController();

  bool _isSubmitting = false;
  String? _errorMessage;

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
      setState(() => _errorMessage = 'Selecciona al menos una prenda para devolver.');
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

    try {
      final itemsPayload = seleccionados.map((d) {
        return {
          'id_producto': d.idProducto,
          'talla': d.talla,
          'color': d.color,
          'cantidad': _cantidadesDevolver[d.idProducto] ?? 1,
          'estado_fisico': _estadoFisico[d.idProducto] ?? 'APTO_VENTA',
        };
      }).toList();

      final ticketOriginal = widget.orden.numeroFactura ?? 'ORDEN-${widget.orden.idOrden}';

      final body = {
        'nro_ticket_original': ticketOriginal,
        'motivo': _motivoSeleccionado,
        'tipo_resolucion': _tipoResolucion,
        'items': itemsPayload,
      };

      final res = await _devolucionesService.procesarDevolucion(body);

      if (!mounted) return;

      final nroDev = res['nro_devolucion'] ?? 'DEV-PROCESADA';
      final codigoVale = res['codigo_vale'];
      final totalDev = (res['total_devuelto'] != null)
          ? double.tryParse(res['total_devuelto'].toString()) ?? _totalEstimadoDevolucion
          : _totalEstimadoDevolucion;
      final msgKardex = res['mensaje_kardex'] ?? 'Reingreso inmutable al Kardex valorado al CPP histórico.';

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppTheme.bgSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.accentGold),
          ),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: AppTheme.success),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  '¡Devolución Procesada (CU25)!',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Comprobante Oficial: $nroDev',
                style: const TextStyle(color: AppTheme.accentGold, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 6),
              Text(
                'Total liquidado: Bs. ${totalDev.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              if (codigoVale != null && codigoVale.toString().isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgMain,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.accentGold),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CÓDIGO DE VALE / NOTA DE CRÉDITO:',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '$codigoVale',
                            style: const TextStyle(
                              color: AppTheme.accentGold,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, color: AppTheme.accentGold, size: 18),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: '$codigoVale'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Código de vale copiado al portapapeles')),
                              );
                            },
                          ),
                        ],
                      ),
                      const Text(
                        'Puedes usarlo inmediatamente como cupón en el checkout.',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.inventory_2_outlined, size: 18, color: Colors.greenAccent),
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
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx); // Cierra diálogo
                Navigator.pop(context, true); // Regresa a mis pedidos
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentGold,
                foregroundColor: AppTheme.bgMain,
              ),
              child: const Text('ENTENDIDO / FINALIZAR'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = 'Error procesando la devolución: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final nroTicket = widget.orden.numeroFactura ?? 'ORDEN #${widget.orden.idOrden}';
    final fechaStr = DateFormat('dd/MM/yyyy').format(widget.orden.creadoEn);

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
              '1. SELECCIONA LAS PRENDAS A DEVOLVER O CAMBIAR',
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
              title: 'Vale de Crédito Digital (Recomendado)',
              subtitle: 'Genera un cupón de crédito utilizable en futuras compras.',
              tipo: 'VALE_CREDITO',
              icon: Icons.confirmation_number_outlined,
            ),
            const SizedBox(height: 8),

            _buildResolucionOption(
              title: 'Cambio de Variante / Talla',
              subtitle: 'Acércate a la sucursal Equipetrol para retirar otra prenda.',
              tipo: 'CAMBIO_VARIANTE',
              icon: Icons.swap_horiz_outlined,
            ),
            const SizedBox(height: 8),

            _buildResolucionOption(
              title: 'Reembolso Económico',
              subtitle: 'Devolución directa según el medio de pago original.',
              tipo: 'REEMBOLSO_EFECTIVO',
              icon: Icons.payments_outlined,
            ),

            const SizedBox(height: 24),

            // Resumen de liquidación
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
                  const Text('Total a Devolver / Compensar:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(
                    'Bs. ${_totalEstimadoDevolucion.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.accentGold,
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
