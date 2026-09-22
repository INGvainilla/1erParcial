import 'package:flutter/material.dart';
import 'package:fashionstore_mobile/core/models/orden.dart';
import 'package:fashionstore_mobile/core/models/pago.dart';
import 'package:fashionstore_mobile/core/services/api_service.dart';
import 'package:fashionstore_mobile/core/services/pagos_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p10_logistica_delivery/tracking/views/tracking_screen.dart';

class PagoOrdenScreen extends StatefulWidget {
  final Orden orden;
  final Function(int)? onSwitchTab;

  const PagoOrdenScreen({Key? key, required this.orden, this.onSwitchTab}) : super(key: key);

  @override
  State<PagoOrdenScreen> createState() => _PagoOrdenScreenState();
}

class _PagoOrdenScreenState extends State<PagoOrdenScreen> {
  final PagosService _pagosService = PagosService();
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _numeroTarjetaCtrl;
  late final TextEditingController _vencimientoCtrl;
  late final TextEditingController _cvcCtrl;
  late final TextEditingController _titularCtrl;

  IntencionPago? _intencion;
  TransaccionPago? _transaccionExitosa;
  bool _isGeneratingIntent = true;
  bool _isConfirming = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _numeroTarjetaCtrl = TextEditingController(text: '4242 4242 4242 4242');
    _vencimientoCtrl = TextEditingController(text: '12/28');
    _cvcCtrl = TextEditingController(text: '123');
    _titularCtrl = TextEditingController(text: 'CLIENTE FASHIONSTORE');
    _iniciarIntencion();
  }

  @override
  void dispose() {
    _numeroTarjetaCtrl.dispose();
    _vencimientoCtrl.dispose();
    _cvcCtrl.dispose();
    _titularCtrl.dispose();
    super.dispose();
  }

  void _resetTarjetaPrueba() {
    setState(() {
      _numeroTarjetaCtrl.text = '4242 4242 4242 4242';
      _vencimientoCtrl.text = '12/28';
      _cvcCtrl.text = '123';
      _titularCtrl.text = 'CLIENTE FASHIONSTORE';
    });
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
    if (_formKey.currentState?.validate() == false) return;

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

        // Tarjeta visual interactiva estilo Visa Luxury
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              colors: [Color(0xFF202533), Color(0xFF13151E)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(color: AppTheme.accentGold.withOpacity(0.55), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 38,
                        height: 26,
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4AF37),
                          borderRadius: BorderRadius.circular(4),
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFFDF7A), Color(0xFF997A15)],
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.memory, size: 18, color: Colors.black87),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.contactless, color: Colors.white54, size: 20),
                    ],
                  ),
                  const Text(
                    'VISA',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontStyle: FontStyle.italic,
                      fontSize: 20,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              AnimatedBuilder(
                animation: _numeroTarjetaCtrl,
                builder: (context, _) => Text(
                  _numeroTarjetaCtrl.text.isEmpty ? '•••• •••• •••• ••••' : _numeroTarjetaCtrl.text,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    letterSpacing: 2.0,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TITULAR',
                          style: TextStyle(color: Colors.white38, fontSize: 9, letterSpacing: 1.0),
                        ),
                        AnimatedBuilder(
                          animation: _titularCtrl,
                          builder: (context, _) => Text(
                            _titularCtrl.text.isEmpty ? 'CLIENTE FASHIONSTORE' : _titularCtrl.text.toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'VENCE',
                        style: TextStyle(color: Colors.white38, fontSize: 9, letterSpacing: 1.0),
                      ),
                      AnimatedBuilder(
                        animation: _vencimientoCtrl,
                        builder: (context, _) => Text(
                          _vencimientoCtrl.text.isEmpty ? 'MM/AA' : _vencimientoCtrl.text,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Formulario de tarjeta editable
        Form(
          key: _formKey,
          child: Container(
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
                    const Text(
                      'TARJETA DE PRUEBA (STRIPE)',
                      style: TextStyle(
                        color: AppTheme.accentGold,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    TextButton.icon(
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        visualDensity: VisualDensity.compact,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: _resetTarjetaPrueba,
                      icon: const Icon(Icons.refresh, size: 14, color: AppTheme.accentGold),
                      label: const Text(
                        'Restablecer',
                        style: TextStyle(fontSize: 11, color: AppTheme.accentGold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Campo Número de Tarjeta
                TextFormField(
                  controller: _numeroTarjetaCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Número de Tarjeta',
                    prefixIcon: const Icon(Icons.credit_card, size: 20, color: AppTheme.accentGold),
                    suffixIcon: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('VISA', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 10)),
                      ),
                    ),
                    hintText: '4242 4242 4242 4242',
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Ingresa el número de tarjeta';
                    if (v.replaceAll(' ', '').length < 15) return 'Número incompleto';
                    return null;
                  },
                ),
                const SizedBox(height: 12),

                // Fila Vencimiento y CVC
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _vencimientoCtrl,
                        keyboardType: TextInputType.datetime,
                        decoration: const InputDecoration(
                          labelText: 'Vencimiento (MM/AA)',
                          prefixIcon: Icon(Icons.date_range, size: 18, color: AppTheme.accentGold),
                          hintText: '12/28',
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Requerido';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _cvcCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'CVC / CVV',
                          prefixIcon: Icon(Icons.lock_outline, size: 18, color: AppTheme.accentGold),
                          hintText: '123',
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Requerido';
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Campo Titular
                TextFormField(
                  controller: _titularCtrl,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'Nombre del Titular',
                    prefixIcon: Icon(Icons.person_outline, size: 20, color: AppTheme.accentGold),
                    hintText: 'CLIENTE FASHIONSTORE',
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Ingresa el titular';
                    return null;
                  },
                ),

                const SizedBox(height: 12),
                const Divider(height: 20),

                if (_isGeneratingIntent)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Column(
                        children: [
                          CircularProgressIndicator(color: AppTheme.accentGold, strokeWidth: 2),
                          SizedBox(height: 8),
                          Text('Conectando con Stripe Sandbox...', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                        ],
                      ),
                    ),
                  )
                else if (_intencion != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('PaymentIntent ID:', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                      Text(
                        _intencion!.paymentIntentId.length > 20
                            ? '${_intencion!.paymentIntentId.substring(0, 18)}...'
                            : _intencion!.paymentIntentId,
                        style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Moneda de Liquidación:', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                      Text(_intencion!.moneda, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11)),
                    ],
                  ),
                ],
              ],
            ),
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
