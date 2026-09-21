import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/catalogo_item.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/catalogo_service.dart';
import '../../../core/services/reserva_service.dart';
import '../../../core/theme/app_theme.dart';
import 'mis_tickets_screen.dart';

class CrearReservaScreen extends StatefulWidget {
  final PrendaCatalogo? prendaPreseleccionada;
  final String? colorPreseleccionado;
  final String? tallaPreseleccionada;
  final Function(int)? onSwitchTab;

  const CrearReservaScreen({
    Key? key,
    this.prendaPreseleccionada,
    this.colorPreseleccionado,
    this.tallaPreseleccionada,
    this.onSwitchTab,
  }) : super(key: key);

  @override
  State<CrearReservaScreen> createState() => _CrearReservaScreenState();
}

class _CrearReservaScreenState extends State<CrearReservaScreen> {
  final ReservaService _reservaService = ReservaService();
  final CatalogoService _catalogoService = CatalogoService();

  List<Map<String, dynamic>> _sucursales = [];
  bool _isLoadingSucursales = true;
  int? _selectedSucursalId;

  DateTime _fechaSeleccionada = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _horaSeleccionada = const TimeOfDay(hour: 15, minute: 0);

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _cargarSucursales();
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

  Future<void> _seleccionarFecha() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fechaSeleccionada,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.accentGold,
              surface: AppTheme.bgSurface,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _fechaSeleccionada = picked);
    }
  }

  Future<void> _seleccionarHora() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _horaSeleccionada,
      builder: (ctx, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.accentGold,
              surface: AppTheme.bgSurface,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _horaSeleccionada = picked);
    }
  }

  Future<void> _crearReserva() async {
    if (_selectedSucursalId == null) {
      setState(() => _errorMessage = 'Selecciona una sucursal para la visita.');
      return;
    }

    final fechaHoraVisita = DateTime(
      _fechaSeleccionada.year,
      _fechaSeleccionada.month,
      _fechaSeleccionada.day,
      _horaSeleccionada.hour,
      _horaSeleccionada.minute,
    );

    final List<Map<String, dynamic>> detalles = [];
    if (widget.prendaPreseleccionada != null) {
      detalles.add({
        'id_producto': widget.prendaPreseleccionada!.idProducto,
        'talla': widget.tallaPreseleccionada ?? 'M',
        'color': (widget.colorPreseleccionado != null && widget.colorPreseleccionado!.isNotEmpty)
            ? widget.colorPreseleccionado!
            : 'Estándar',
        'cantidad': 1,
      });
    } else {
      // Sin prenda preseleccionada: reserva de probador sin prenda específica
      setState(() => _errorMessage = 'Selecciona una prenda desde el catálogo para reservar el probador.');
      setState(() => _isSubmitting = false);
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      await _reservaService.crearReserva(
        idSucursal: _selectedSucursalId!,
        fechaVisita: fechaHoraVisita,
        detalles: detalles,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Reserva creada exitosamente! Tu ticket QR está listo.'),
          backgroundColor: AppTheme.success,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const MisTicketsScreen(),
        ),
      );
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Error inesperado al crear reserva: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.prendaPreseleccionada;
    final fechaFormateada = DateFormat('dd/MM/yyyy').format(_fechaSeleccionada);
    final horaFormateada = '${_horaSeleccionada.hour.toString().padLeft(2, '0')}:${_horaSeleccionada.minute.toString().padLeft(2, '0')}';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reservar en Probador (CU11)'),
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
                    Expanded(child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.danger, fontSize: 13))),
                  ],
                ),
              ),

            // Prenda preseleccionada
            if (p != null) ...[
              const Text(
                'PRENDA A PROBAR',
                style: TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.bgSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.checkroom, color: AppTheme.accentGold, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.nombre, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(
                            'Talla: ${widget.tallaPreseleccionada ?? "M"} • Color: ${widget.colorPreseleccionado ?? "Estándar"}',
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'Bs. ${p.precioFinal.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentGold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // 1. Sucursal física
            const Text(
              '1. SUCURSAL FÍSICA',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 10),

            if (_isLoadingSucursales)
              const Center(child: CircularProgressIndicator(color: AppTheme.accentGold))
            else
              DropdownButtonFormField<int>(
                value: _selectedSucursalId,
                decoration: const InputDecoration(
                  labelText: 'Seleccionar Tienda',
                  prefixIcon: Icon(Icons.storefront_outlined, color: AppTheme.accentGold),
                ),
                dropdownColor: AppTheme.bgSurface,
                isExpanded: true,
                items: _sucursales.map((s) {
                  return DropdownMenuItem<int>(
                    value: s['id_sucursal'] as int,
                    child: Text(
                      "${s['nombre_sucursal']} (${s['nombre_ciudad']})",
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedSucursalId = val),
              ),

            const SizedBox(height: 24),

            // 2. Fecha y hora de visita
            const Text(
              '2. FECHA Y HORA ESTIMADA',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: _seleccionarFecha,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.bgSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_outlined, color: AppTheme.accentGold, size: 20),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Fecha', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                              Text(fechaFormateada, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: _seleccionarHora,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.bgSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.access_time, color: AppTheme.accentGold, size: 20),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Hora', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                              Text(horaFormateada, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Nota explicativa del caso de uso CU11
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.bgSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: AppTheme.accentGold, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Al confirmar, se generará un Ticket con Código QR exclusivo. Preséntalo en el probador de la tienda para que el encargado prepare tus prendas inmediatamente.',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _crearReserva,
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
                        'Generar Ticket de Reserva QR',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
