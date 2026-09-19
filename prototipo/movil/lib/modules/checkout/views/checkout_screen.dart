import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/carrito_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/catalogo_service.dart';
import '../../../core/services/ordenes_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../pagos/views/pago_orden_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final Function(int)? onSwitchTab;

  const CheckoutScreen({Key? key, this.onSwitchTab}) : super(key: key);

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final OrdenesService _ordenesService = OrdenesService();
  final CatalogoService _catalogoService = CatalogoService();

  String _modalidadEntrega = 'DELIVERY'; // 'DELIVERY' o 'RETIRO_TIENDA'
  int? _selectedSucursalId;
  final _direccionController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _nitController = TextEditingController();
  final _razonSocialController = TextEditingController();
  final _notasController = TextEditingController();

  List<Map<String, dynamic>> _sucursales = [];
  bool _isLoadingSucursales = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.usuario != null) {
      _razonSocialController.text = auth.usuario!.displayName;
      _nitController.text = '4859201'; // Default CI for demo
      _telefonoController.text = '70012345';
      _direccionController.text = 'Av. San Martín #450, Equipetrol, Santa Cruz';
    }
    _cargarSucursales();
  }

  @override
  void dispose() {
    _direccionController.dispose();
    _telefonoController.dispose();
    _nitController.dispose();
    _razonSocialController.dispose();
    _notasController.dispose();
    super.dispose();
  }

  Future<void> _cargarSucursales() async {
    try {
      final sucs = await _catalogoService.getSucursales();
      if (!mounted) return;
      setState(() {
        _sucursales = sucs;
        if (_sucursales.isNotEmpty) {
          _selectedSucursalId = _sucursales.first['id_sucursal'] as int;
        }
        _isLoadingSucursales = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoadingSucursales = false);
    }
  }

  Future<void> _procesarOrden() async {
    final cart = Provider.of<CarritoProvider>(context, listen: false);
    if (cart.items.isEmpty) {
      setState(() => _errorMessage = 'Tu bolsa de compras está vacía.');
      return;
    }

    if (_modalidadEntrega == 'RETIRO_TIENDA' && _selectedSucursalId == null) {
      setState(() => _errorMessage = 'Selecciona una sucursal para el retiro.');
      return;
    }

    if (_modalidadEntrega == 'DELIVERY' && _direccionController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Ingresa la dirección completa para el delivery.');
      return;
    }

    if (_nitController.text.trim().isEmpty || _razonSocialController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Ingresa el NIT/CI y Razón Social para la factura fiscal.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final orden = await _ordenesService.checkout(
        modalidadEntrega: _modalidadEntrega,
        idSucursal: _modalidadEntrega == 'RETIRO_TIENDA' ? _selectedSucursalId : null,
        direccionEnvio: _modalidadEntrega == 'DELIVERY' ? _direccionController.text.trim() : null,
        telefonoContacto: _telefonoController.text.trim().isNotEmpty ? _telefonoController.text.trim() : null,
        nitFactura: _nitController.text.trim(),
        razonSocialFactura: _razonSocialController.text.trim(),
        notasEntrega: _notasController.text.trim().isNotEmpty ? _notasController.text.trim() : null,
      );

      // Recargar carrito (el backend ya lo vació transaccionalmente)
      await cart.cargarCarrito();

      if (!mounted) return;
      // Redirigir a pantalla de pago directo
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => PagoOrdenScreen(
            orden: orden,
            onSwitchTab: widget.onSwitchTab,
          ),
        ),
      );
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Error inesperado al generar orden: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CarritoProvider>(context);
    final double costoEnvio = _modalidadEntrega == 'DELIVERY' ? 25.0 : 0.0;
    final double totalFinal = cart.totalGeneral + costoEnvio;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirmar Compra (Checkout)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
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

            // 1. Modalidad de entrega
            const Text(
              '1. MODALIDAD DE ENTREGA',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildModalidadOption(
                    title: 'Delivery',
                    subtitle: 'Tarifa Bs. 25.00',
                    icon: Icons.delivery_dining_outlined,
                    isSelected: _modalidadEntrega == 'DELIVERY',
                    onTap: () => setState(() => _modalidadEntrega = 'DELIVERY'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildModalidadOption(
                    title: 'Retiro en Tienda',
                    subtitle: 'Gratis en sucursal',
                    icon: Icons.storefront_outlined,
                    isSelected: _modalidadEntrega == 'RETIRO_TIENDA',
                    onTap: () => setState(() => _modalidadEntrega = 'RETIRO_TIENDA'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_modalidadEntrega == 'DELIVERY') ...[
              TextField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección de Entrega',
                  prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.accentGold, size: 20),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _telefonoController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Teléfono de Contacto',
                  prefixIcon: Icon(Icons.phone_outlined, color: AppTheme.accentGold, size: 20),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _notasController,
                decoration: const InputDecoration(
                  labelText: 'Instrucciones para el repartidor (opcional)',
                  prefixIcon: Icon(Icons.notes_outlined, color: AppTheme.textMuted, size: 20),
                ),
              ),
            ] else ...[
              if (_isLoadingSucursales)
                const Center(child: CircularProgressIndicator(color: AppTheme.accentGold))
              else
                DropdownButtonFormField<int>(
                  value: _selectedSucursalId,
                  decoration: const InputDecoration(
                    labelText: 'Sucursal de Retiro',
                    prefixIcon: Icon(Icons.storefront_outlined, color: AppTheme.accentGold, size: 20),
                  ),
                  dropdownColor: AppTheme.bgSurface,
                  items: _sucursales.map((s) {
                    return DropdownMenuItem<int>(
                      value: s['id_sucursal'] as int,
                      child: Text("${s['nombre_sucursal']} (${s['nombre_ciudad']})"),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedSucursalId = val),
                ),
            ],

            const SizedBox(height: 28),

            // 2. Datos de Facturación Fiscal (Bolivia)
            const Text(
              '2. FACTURACIÓN FISCAL',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _nitController,
              decoration: const InputDecoration(
                labelText: 'NIT o Carnet de Identidad',
                prefixIcon: Icon(Icons.badge_outlined, color: AppTheme.accentGold, size: 20),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _razonSocialController,
              decoration: const InputDecoration(
                labelText: 'Razón Social / Nombre Completo',
                prefixIcon: Icon(Icons.person_outline, color: AppTheme.accentGold, size: 20),
              ),
            ),

            const SizedBox(height: 28),

            // 3. Resumen de la Orden
            const Text(
              '3. RESUMEN DE LA ORDEN',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
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
                      Text('Prendas (${cart.totalItems})', style: const TextStyle(color: AppTheme.textSecondary)),
                      Text('Bs. ${cart.totalGeneral.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Costo de Entrega', style: TextStyle(color: AppTheme.textSecondary)),
                      Text(
                        costoEnvio > 0 ? 'Bs. ${costoEnvio.toStringAsFixed(2)}' : 'Gratis',
                        style: TextStyle(
                          color: costoEnvio > 0 ? AppTheme.textPrimary : AppTheme.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Divider(),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total a Pagar',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Bs. ${totalFinal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.accentGold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _procesarOrden,
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
                        'Confirmar y Proceder al Pago',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModalidadOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accentGold.withOpacity(0.12) : AppTheme.bgSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.accentGold : AppTheme.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: isSelected ? AppTheme.accentGold : AppTheme.textSecondary, size: 24),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: isSelected ? AppTheme.accentGold : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
