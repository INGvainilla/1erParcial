import 'package:flutter/material.dart';
import '../../../core/models/orden.dart';
import '../../../core/models/pago.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/pagos_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../tracking/views/tracking_screen.dart';

class PagoOrdenScreen extends StatefulWidget {
  final Orden orden;
  final Function(int)? onSwitchTab;

  const PagoOrdenScreen({Key? key, required this.orden, this.onSwitchTab}) : super(key: key);

  @override
  State<PagoOrdenScreen> createState() => _PagoOrdenScreenState();
}

class _PagoOrdenScreenState extends State<PagoOrdenScreen> {
  final PagosService _pagosService = PagosService();

  IntencionPago? _intencion;
  TransaccionPago? _transaccionExitosa;
  bool _isGeneratingIntent = true;
  bool _isConfirming = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _iniciarIntencion();
  }

  Future<void> _iniciarIntencion() async {
    setState(() {
      _isGeneratingIntent = true;
      _errorMessage = null;
    });

    try {
      final intent = await _pagosService.crearIntencionPago(widget.orden.idOrden);
      if (!mounted) return;
      setState(() {
        _intencion = intent;
        _isGeneratingIntent = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.message;
        _isGeneratingIntent = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error al contactar pasarela de pagos: $e';
        _isGeneratingIntent = false;
      });
    }
  }

  Future<void> _confirmarPago() async {
    if (_intencion == null) return;

    setState(() {
      _isConfirming = true;
      _errorMessage = null;
    });

    try {
      final tx = await _pagosService.confirmarPagoDirecto(
        widget.orden.idOrden,
        _intencion!.paymentIntentId,
      );

      if (!mounted) return;
      setState(() {
        _transaccionExitosa = tx;
        _isConfirming = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.message;
        _isConfirming = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error al procesar la confirmación del pago: $e';
        _isConfirming = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pasarela de Pago (CU16)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _transaccionExitosa != null
            ? _buildPagoExitosoView()
            : _buildFormularioPagoView(),
      ),
    );
  }

  Widget _buildFormularioPagoView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tarjeta resumen de orden
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
                    widget.orden.numeroFactura ?? 'ORDEN #${widget.orden.idOrden}',
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
                      color: Colors.amber.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'PENDIENTE DE PAGO',
                      style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total a Cobrar:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                  Text(
                    'Bs. ${widget.orden.total.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Modalidad: ${widget.orden.modalidadEntrega == "DELIVERY" ? "Envío a domicilio" : "Retiro en sucursal"}',
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        if (_errorMessage != null)
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 20),
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

        const Text(
          'MEDIO DE PAGO DIGITAL',
          style: TextStyle(
            color: AppTheme.textMuted,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 12),

        // Tarjeta simulador de pasarela Stripe
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
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.bgElevated,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.credit_card, color: AppTheme.accentGold, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Tarjeta de Crédito / Débito', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('Stripe Sandbox Omni-Channel', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),

              if (_isGeneratingIntent)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Column(
                      children: [
                        CircularProgressIndicator(color: AppTheme.accentGold, strokeWidth: 2),
                        SizedBox(height: 12),
                        Text('Generando intención criptográfica en Stripe...', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                )
              else if (_intencion != null) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('PaymentIntent ID:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    Text(
                      _intencion!.paymentIntentId.length > 20
                          ? '${_intencion!.paymentIntentId.substring(0, 18)}...'
                          : _intencion!.paymentIntentId,
                      style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Moneda de Liquidación:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    Text(_intencion!.moneda, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgElevated,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.shield_outlined, color: AppTheme.success, size: 18),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Transacción segura de pruebas. Haz clic en el botón inferior para autorizar el cobro.',
                          style: TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 30),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: (_isGeneratingIntent || _isConfirming || _intencion == null)
                ? null
                : _confirmarPago,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: _isConfirming
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: AppTheme.bgMain, strokeWidth: 2),
                  )
                : Text(
                    'Pagar Bs. ${widget.orden.total.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildPagoExitosoView() {
    final tx = _transaccionExitosa!;

    return Center(
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.success.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, color: AppTheme.success, size: 64),
          ),
          const SizedBox(height: 20),
          const Text(
            '¡Pago Confirmado con Éxito!',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Comprobante emitido para ${tx.numeroFactura ?? widget.orden.numeroFactura}',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.bgSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Monto Pagado:', style: TextStyle(color: AppTheme.textSecondary)),
                    Text(
                      'Bs. ${tx.monto.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Pasarela:', style: TextStyle(color: AppTheme.textSecondary)),
                    Text(tx.pasarela, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('ID Transacción:', style: TextStyle(color: AppTheme.textSecondary)),
                    Text('#${tx.idTransaccion}', style: const TextStyle(fontFamily: 'monospace')),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // Botón ver seguimiento
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => TrackingScreen(idOrden: widget.orden.idOrden),
                  ),
                );
              },
              icon: const Icon(Icons.location_on_outlined),
              label: const Text('Ver Seguimiento de mi Pedido'),
            ),
          ),
          const SizedBox(height: 12),

          OutlinedButton(
            onPressed: () {
              Navigator.pop(context);
              if (widget.onSwitchTab != null) {
                widget.onSwitchTab!(0); // Regresar al catálogo
              }
            },
            child: const Text('Volver a la Tienda'),
          ),
        ],
      ),
    );
  }
}
