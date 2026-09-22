import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:fashionstore_mobile/core/models/gamificacion.dart';
import 'package:fashionstore_mobile/core/providers/gamificacion_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p07_venta_digital_fidelizacion/checkout/views/checkout_screen.dart';

class RecompensasScreen extends StatefulWidget {
  const RecompensasScreen({Key? key}) : super(key: key);

  @override
  State<RecompensasScreen> createState() => _RecompensasScreenState();
}

class _RecompensasScreenState extends State<RecompensasScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final gProvider = context.read<GamificacionProvider>();
      gProvider.cargarPerfil();
      gProvider.cargarRecompensas();
      gProvider.cargarMisCupones();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _colorNivel(String nivel) {
    switch (nivel.toUpperCase()) {
      case 'DIAMANTE':
        return const Color(0xFF00E5FF);
      case 'ORO':
        return AppTheme.goldColor;
      case 'PLATA':
        return const Color(0xFFE0E0E0);
      default:
        return const Color(0xFFCD7F32); // Bronce
    }
  }

  IconData _iconForName(String name) {
    switch (name) {
      case 'shopping_bag':
        return Icons.shopping_bag_outlined;
      case 'view_in_ar':
        return Icons.view_in_ar;
      case 'mic':
        return Icons.mic_none;
      case 'storefront':
        return Icons.storefront;
      case 'workspace_premium':
        return Icons.workspace_premium;
      case 'military_tech':
        return Icons.military_tech;
      case 'local_offer':
        return Icons.local_offer_outlined;
      case 'local_shipping':
        return Icons.local_shipping_outlined;
      case 'airline_seat_recline_extra':
        return Icons.airline_seat_recline_extra;
      case 'stars':
        return Icons.stars_outlined;
      default:
        return Icons.star_border;
    }
  }

  void _canjear(RecompensaItem rec) async {
    final gProvider = context.read<GamificacionProvider>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.goldColor),
        ),
        title: const Text('Confirmar Canje', style: TextStyle(color: Colors.white)),
        content: Text(
          '¿Deseas canjear "${rec.titulo}" por ${rec.costoPuntos} puntos?',
          style: const TextStyle(color: AppTheme.textColor),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('CANCELAR', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.goldColor,
              foregroundColor: Colors.black,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('CANJEAR'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final res = await gProvider.canjearRecompensa(rec.codigo);
      if (!mounted) return;

      if (res['exito'] == true) {
        final cupon = res['codigo_cupon'] ?? '';
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppTheme.cardColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Colors.greenAccent),
            ),
            title: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.greenAccent),
                SizedBox(width: 8),
                Text('¡Canje Exitoso!', style: TextStyle(color: Colors.white)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  res['mensaje'] ?? 'Recompensa canjeada',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textColor),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.goldColor),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        cupon,
                        style: const TextStyle(
                          color: AppTheme.goldColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          letterSpacing: 1.5,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, color: Colors.white70, size: 20),
                        tooltip: 'Copiar Cupón',
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: cupon));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Código copiado al portapapeles')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Úsalo en el checkout digital o muéstralo en mostrador POS.',
                  style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('LISTO', style: TextStyle(color: AppTheme.goldColor)),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['mensaje'] ?? 'No se pudo canjear'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final gProvider = context.watch<GamificacionProvider>();
    final perfil = gProvider.perfil;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.workspace_premium, color: AppTheme.goldColor),
            SizedBox(width: 8),
            Text('Club de Fidelización VIP'),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.goldColor,
          labelColor: AppTheme.goldColor,
          unselectedLabelColor: Colors.white60,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Mi Nivel VIP'),
            Tab(text: 'Mis Cupones'),
            Tab(text: 'Canjes'),
            Tab(text: 'Insignias'),
          ],
        ),
      ),
      body: gProvider.cargando && perfil == null
          ? const Center(child: CircularProgressIndicator(color: AppTheme.goldColor))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildTabNivel(context, perfil),
                _buildTabCupones(context, gProvider),
                _buildTabCanjes(context, gProvider),
                _buildTabInsignias(context, perfil),
              ],
            ),
    );
  }

  Widget _buildTabNivel(BuildContext context, GamificacionPerfil? perfil) {
    if (perfil == null) {
      return const Center(child: Text('No hay datos disponibles'));
    }

    final colorNivel = _colorNivel(perfil.nivel);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tarjeta de Membresía de Lujo
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF1E2430),
                  colorNivel.withOpacity(0.15),
                  const Color(0xFF12151C),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: colorNivel.withOpacity(0.6), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: colorNivel.withOpacity(0.15),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'FASHIONSTORE PRIVILEGE',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: colorNivel,
                          fontSize: 12,
                          letterSpacing: 2,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: colorNivel.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: colorNivel),
                      ),
                      child: Text(
                        'RANGO ${perfil.nivel}',
                        style: TextStyle(
                          color: colorNivel,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  perfil.nombreCliente,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${perfil.puntosActuales}',
                      style: TextStyle(
                        color: colorNivel,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        'PUNTOS DISPONIBLES',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11, letterSpacing: 1),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Barra de Progreso hacia el siguiente nivel
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: (perfil.progresoNivelPct / 100.0).clamp(0.0, 1.0),
                    minHeight: 8,
                    backgroundColor: Colors.white12,
                    valueColor: AlwaysStoppedAnimation<Color>(colorNivel),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        perfil.siguienteNivel != null
                            ? 'Faltan ${perfil.puntosSiguienteNivel} pts para ${perfil.siguienteNivel}'
                            : 'Rango Máximo Alcanzado',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${perfil.progresoNivelPct.toInt()}%',
                      style: TextStyle(color: colorNivel, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Beneficios Exclusivos del Nivel
          const Text(
            'BENEFICIOS DE TU RANGO',
            style: TextStyle(color: AppTheme.goldColor, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),
          ...perfil.beneficiosNivel.map((b) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.cardColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: AppTheme.goldColor, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        b,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 20),

          // Métricas de Acumulación
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.cardColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('Compras Pagadas', '${perfil.comprasContabilizadas}'),
                Container(height: 30, width: 1, color: Colors.white12),
                _buildStatItem('Puntos Históricos', '${perfil.puntosHistoricos}'),
                Container(height: 30, width: 1, color: Colors.white12),
                _buildStatItem('Descuento Rango', '${perfil.descuentoNivelPct.toInt()}%'),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Escala de Rangos VIP y Cupones Desbloqueables
          const Text(
            'RANGOS VIP & BENEFICIOS DISPONIBLES',
            style: TextStyle(color: AppTheme.goldColor, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),

          _buildTierCard(
            nombre: 'BRONCE',
            rangoPuntos: '0 - 499 pts',
            descuento: '0% Base',
            beneficioClave: 'Acceso a catálogo general y acumulación de 1 pt por cada Bs. 10.',
            cuponClave: 'Canjes en catálogo de recompensas',
            esActivo: perfil.nivel.toUpperCase() == 'BRONCE',
            esAlcanzado: true,
            color: const Color(0xFFCD7F32),
            icon: Icons.shield_outlined,
          ),
          const SizedBox(height: 10),

          _buildTierCard(
            nombre: 'PLATA',
            rangoPuntos: '500 - 1,499 pts',
            descuento: '5% Permanente',
            beneficioClave: '5% descuento automático en tienda web y POS.',
            cuponClave: 'Cupón especial: FS-PLATA5',
            esActivo: perfil.nivel.toUpperCase() == 'PLATA',
            esAlcanzado: perfil.puntosHistoricos >= 500,
            color: const Color(0xFFE0E0E0),
            icon: Icons.military_tech_outlined,
          ),
          const SizedBox(height: 10),

          _buildTierCard(
            nombre: 'ORO',
            rangoPuntos: '1,500 - 2,999 pts',
            descuento: '10% Permanente',
            beneficioClave: '10% descuento + Acceso prioritario al Probador VIP en sucursal.',
            cuponClave: 'Cupón especial: FS-ORO10',
            esActivo: perfil.nivel.toUpperCase() == 'ORO',
            esAlcanzado: perfil.puntosHistoricos >= 1500,
            color: AppTheme.goldColor,
            icon: Icons.workspace_premium_outlined,
          ),
          const SizedBox(height: 10),

          _buildTierCard(
            nombre: 'DIAMANTE',
            rangoPuntos: '3,000+ pts',
            descuento: '15% Permanente',
            beneficioClave: '15% descuento + Envíos a domicilio 100% GRATIS siempre.',
            cuponClave: 'Cupón especial: FS-DIAMANTE15 & Envíos Gratis',
            esActivo: perfil.nivel.toUpperCase() == 'DIAMANTE',
            esAlcanzado: perfil.puntosHistoricos >= 3000,
            color: const Color(0xFF00E5FF),
            icon: Icons.diamond_outlined,
          ),
        ],
      ),
    );
  }

  Widget _buildTierCard({
    required String nombre,
    required String rangoPuntos,
    required String descuento,
    required String beneficioClave,
    required String cuponClave,
    required bool esActivo,
    required bool esAlcanzado,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: esActivo ? color.withOpacity(0.12) : AppTheme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: esActivo ? color : (esAlcanzado ? Colors.white24 : Colors.white10),
          width: esActivo ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 22),
                  const SizedBox(width: 8),
                  Text(
                    'Nivel $nombre',
                    style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '($rangoPuntos)',
                    style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                  ),
                ],
              ),
              if (esActivo)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'TU NIVEL',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                )
              else if (esAlcanzado)
                const Text(
                  'ALCANZADO',
                  style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 10),
                )
              else
                const Text(
                  'BLOQUEADO',
                  style: TextStyle(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 10),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  descuento,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  beneficioClave,
                  style: const TextStyle(color: AppTheme.textColor, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.confirmation_number_outlined, size: 14, color: AppTheme.goldColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  cuponClave,
                  style: const TextStyle(color: AppTheme.goldColor, fontSize: 11, fontStyle: FontStyle.italic),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabCupones(BuildContext context, GamificacionProvider gProvider) {
    final cupones = gProvider.misCupones;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'MIS CUPONES ACTIVOS',
                    style: TextStyle(color: AppTheme.goldColor, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Listos para aplicar en Delivery o Retiro en Tienda',
                    style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh, color: AppTheme.goldColor),
                tooltip: 'Actualizar cupones',
                onPressed: () => gProvider.cargarMisCupones(),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (cupones.isEmpty)
            Container(
              padding: const EdgeInsets.all(30),
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                children: [
                  const Icon(Icons.confirmation_number_outlined, color: AppTheme.mutedTextColor, size: 48),
                  const SizedBox(height: 14),
                  const Text(
                    'Aún no has canjeado cupones',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Canjea tus puntos acumulados en la pestaña "Canjes" para generar tus códigos de descuento.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.mutedTextColor, fontSize: 12),
                  ),
                  const SizedBox(height: 18),
                  ElevatedButton.icon(
                    onPressed: () => _tabController.animateTo(2),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.goldColor,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.card_giftcard, size: 18),
                    label: const Text('IR AL CATÁLOGO DE CANJES', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: cupones.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, idx) {
                final cup = cupones[idx];
                final bool esEnvio = cup.tipoBeneficio == 'ENVIO_GRATIS';

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cup.utilizado ? Colors.white.withOpacity(0.03) : AppTheme.cardColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: cup.utilizado ? Colors.white10 : AppTheme.goldColor.withOpacity(0.4),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: esEnvio ? Colors.blueAccent.withOpacity(0.2) : AppTheme.goldColor.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: esEnvio ? Colors.blueAccent : AppTheme.goldColor),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  esEnvio ? Icons.local_shipping_outlined : Icons.local_offer_outlined,
                                  size: 14,
                                  color: esEnvio ? Colors.lightBlueAccent : AppTheme.goldColor,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  esEnvio ? 'ENVÍO GRATIS' : 'DESCUENTO Bs. ${cup.montoDescuento.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: esEnvio ? Colors.lightBlueAccent : AppTheme.goldColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: cup.utilizado ? Colors.white10 : Colors.green.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              cup.utilizado ? 'UTILIZADO' : 'DISPONIBLE',
                              style: TextStyle(
                                color: cup.utilizado ? Colors.white38 : Colors.greenAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.black45,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              cup.codigoCupon,
                              style: TextStyle(
                                color: cup.utilizado ? Colors.white38 : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                letterSpacing: 1.5,
                              ),
                            ),
                            InkWell(
                              onTap: () {
                                Clipboard.setData(ClipboardData(text: cup.codigoCupon));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Código copiado al portapapeles'),
                                    duration: Duration(seconds: 1),
                                  ),
                                );
                              },
                              child: const Padding(
                                padding: EdgeInsets.all(4),
                                child: Icon(Icons.copy, color: AppTheme.goldColor, size: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            cup.diasRestantes > 0
                                ? 'Válido por ${cup.diasRestantes} días más'
                                : (cup.fechaExpiracion.isNotEmpty ? 'Expira: ${cup.fechaExpiracion.split('T').first}' : 'Sin vencimiento'),
                            style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                          ),
                          if (!cup.utilizado)
                            TextButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CheckoutScreen(initialCupon: cup.codigoCupon),
                                  ),
                                );
                              },
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                visualDensity: VisualDensity.compact,
                              ),
                              icon: const Icon(Icons.shopping_bag_outlined, size: 14, color: AppTheme.goldColor),
                              label: const Text(
                                'USAR EN CHECKOUT',
                                style: TextStyle(color: AppTheme.goldColor, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String val) {
    return Column(
      children: [
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11)),
      ],
    );
  }

  Widget _buildTabInsignias(BuildContext context, GamificacionPerfil? perfil) {
    if (perfil == null) return const Center(child: Text('No hay datos'));

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.9,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: perfil.insignias.length,
      itemBuilder: (context, idx) {
        final ins = perfil.insignias[idx];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: ins.desbloqueada ? AppTheme.goldColor.withOpacity(0.7) : Colors.white12,
              width: ins.desbloqueada ? 1.5 : 1,
            ),
            boxShadow: ins.desbloqueada
                ? [
                    BoxShadow(
                      color: AppTheme.goldColor.withOpacity(0.12),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: ins.desbloqueada ? AppTheme.goldColor.withOpacity(0.2) : Colors.white.withOpacity(0.05),
                ),
                child: Icon(
                  _iconForName(ins.icono),
                  size: 32,
                  color: ins.desbloqueada ? AppTheme.goldColor : Colors.white24,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                ins.nombre,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: ins.desbloqueada ? Colors.white : Colors.white38,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                ins.descripcion,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 10),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: ins.desbloqueada ? Colors.green.withOpacity(0.2) : Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ins.desbloqueada ? 'DESBLOQUEADA' : 'BLOQUEADA',
                  style: TextStyle(
                    color: ins.desbloqueada ? Colors.greenAccent : Colors.white38,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTabCanjes(BuildContext context, GamificacionProvider gProvider) {
    final recompensas = gProvider.recompensas;
    final puntosUsuario = gProvider.perfil?.puntosActuales ?? 0;

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: recompensas.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, idx) {
        final rec = recompensas[idx];
        final puedeCanjear = puntosUsuario >= rec.costoPuntos;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.goldColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_iconForName(rec.icono), color: AppTheme.goldColor, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rec.titulo,
                      style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      rec.descripcion,
                      style: const TextStyle(color: AppTheme.mutedTextColor, fontSize: 11),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.stars, size: 14, color: AppTheme.goldColor),
                        const SizedBox(width: 4),
                        Text(
                          '${rec.costoPuntos} Puntos',
                          style: const TextStyle(
                            color: AppTheme.goldColor,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: puedeCanjear ? AppTheme.goldColor : Colors.white12,
                  foregroundColor: puedeCanjear ? Colors.black : Colors.white38,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: puedeCanjear ? () => _canjear(rec) : null,
                child: Text(
                  puedeCanjear ? 'CANJEAR' : 'FALTAN PTS',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
