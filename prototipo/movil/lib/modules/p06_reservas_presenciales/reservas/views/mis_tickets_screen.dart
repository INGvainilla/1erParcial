import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:fashionstore_mobile/core/models/reserva.dart';
import 'package:fashionstore_mobile/core/providers/auth_provider.dart';
import 'package:fashionstore_mobile/core/services/reserva_service.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p01_seguridad_acceso/auth/views/login_screen.dart';
import 'crear_reserva_screen.dart';

class MisTicketsScreen extends StatefulWidget {
  final Function(int)? onSwitchTab;
  final bool isActive;

  const MisTicketsScreen({Key? key, this.onSwitchTab, this.isActive = false}) : super(key: key);

  @override
  State<MisTicketsScreen> createState() => _MisTicketsScreenState();
}

class _MisTicketsScreenState extends State<MisTicketsScreen> {
  final ReservaService _reservaService = ReservaService();

  List<Reserva> _reservas = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _haCargadoInicial = false;
  int? _lastUserId;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = Provider.of<AuthProvider>(context);
    final currentUserId = auth.usuario?.idUsuario;
    if (auth.isAuthenticated && (!_haCargadoInicial || _lastUserId != currentUserId)) {
      _haCargadoInicial = true;
      _lastUserId = currentUserId;
      _cargarMisReservas();
    }
  }

  @override
  void didUpdateWidget(covariant MisTicketsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        _cargarMisReservas();
      }
    }
  }

  Future<void> _cargarMisReservas() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final list = await _reservaService.getMisReservas();
      if (!mounted) return;
      setState(() {
        _reservas = list;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error al cargar reservas: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mis Tickets de Probador')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.qr_code_2, size: 64, color: AppTheme.textMuted),
                const SizedBox(height: 16),
                const Text(
                  'Inicia sesión para ver tus tickets',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Presenta tus códigos QR en nuestras tiendas para acceder a tu probador reservado.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                  child: const Text('Iniciar Sesión'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Tickets de Probador'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.accentGold),
            tooltip: 'Nueva reserva',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CrearReservaScreen(onSwitchTab: widget.onSwitchTab),
                ),
              ).then((_) => _cargarMisReservas());
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarMisReservas,
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
                        ElevatedButton(onPressed: _cargarMisReservas, child: const Text('Reintentar')),
                      ],
                    ),
                  ),
                )
              : _reservas.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.qr_code_scanner, size: 64, color: AppTheme.textMuted),
                            const SizedBox(height: 16),
                            const Text(
                              'No tienes tickets de reserva activos',
                              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Puedes reservar prendas de nuestra colección para probártelas en cualquiera de nuestras sucursales físicas.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CrearReservaScreen(onSwitchTab: widget.onSwitchTab),
                                  ),
                                ).then((_) => _cargarMisReservas());
                              },
                              icon: const Icon(Icons.calendar_today_outlined, size: 18),
                              label: const Text('Reservar en Probador'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      color: AppTheme.accentGold,
                      onRefresh: _cargarMisReservas,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _reservas.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final res = _reservas[index];
                          return _buildTicketCard(context, res);
                        },
                      ),
                    ),
    );
  }

  Widget _buildTicketCard(BuildContext context, Reserva r) {
    final fechaVisitaStr = DateFormat('dd/MM/yyyy • HH:mm').format(r.fechaVisita);
    final qrData = r.qrTexto ?? r.codigoQr;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Cabecera del ticket
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppTheme.bgElevated,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.storefront_outlined, size: 18, color: AppTheme.accentGold),
                    const SizedBox(width: 8),
                    Text(
                      r.nombreSucursal ?? 'Sucursal #${r.idSucursal}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                _buildEstadoBadge(r.estado),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              children: [
                // Renderizado del Código QR
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: _buildQrWidget(r, qrData),
                ),
                const SizedBox(height: 12),
                Text(
                  qrData.length > 28 ? '${qrData.substring(0, 26)}...' : qrData,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11, fontFamily: 'monospace'),
                ),
                const SizedBox(height: 16),

                // Información de visita
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Fecha de Visita:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    Text(fechaVisitaStr, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                  ],
                ),
                if (r.nombreCiudad != null) ...[
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Ciudad:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      Text(r.nombreCiudad!, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12)),
                    ],
                  ),
                ],

                const Divider(height: 24),

                // Prendas a probar
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Prendas en este ticket:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ),
                const SizedBox(height: 8),

                ...r.detalles.map((d) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.checkroom, size: 14, color: AppTheme.accentGold),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${d.cantidad}x ${d.nombreProducto ?? "Prenda #${d.idProducto}"} (${d.talla}/${d.color})',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrWidget(Reserva r, String qrData) {
    // Si codigo_qr contiene base64 de imagen
    if (r.codigoQr.startsWith('data:image') || r.codigoQr.length > 300) {
      try {
        final cleanBase64 = r.codigoQr.contains(',') ? r.codigoQr.split(',')[1] : r.codigoQr;
        final bytes = base64Decode(cleanBase64);
        return Image.memory(bytes, width: 160, height: 160);
      } catch (_) {}
    }

    // Fallback estándar con qr_flutter usando el texto o código del ticket
    return QrImageView(
      data: qrData.isNotEmpty ? qrData : 'RSV-${r.idReserva}',
      version: QrVersions.auto,
      size: 160.0,
      backgroundColor: Colors.white,
      eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
      dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
    );
  }

  Widget _buildEstadoBadge(String estado) {
    Color color;
    switch (estado.toUpperCase()) {
      case 'PENDIENTE':
        color = Colors.amber;
        break;
      case 'EN_PROBADOR':
        color = Colors.blue;
        break;
      case 'COMPLETADA':
        color = AppTheme.success;
        break;
      case 'CANCELADA':
        color = AppTheme.danger;
        break;
      default:
        color = AppTheme.textMuted;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        estado.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
