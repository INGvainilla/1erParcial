import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/carrito_provider.dart';
import '../../../core/providers/gamificacion_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/views/login_screen.dart';
import '../../ordenes/views/mis_pedidos_screen.dart';
import '../../gamificacion/views/recompensas_screen.dart';
import '../../ia_recomendaciones/views/recomendaciones_ia_screen.dart';
import '../../catalogo/views/comparador_outfits_screen.dart';

class CuentaScreen extends StatefulWidget {
  final VoidCallback? onIrAReservas;

  const CuentaScreen({Key? key, this.onIrAReservas}) : super(key: key);

  @override
  State<CuentaScreen> createState() => _CuentaScreenState();
}

class _CuentaScreenState extends State<CuentaScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.isAuthenticated) {
        context.read<GamificacionProvider>().cargarPerfil();
      }
    });
  }

  Color _colorNivel(String nivel) {
    switch (nivel.toUpperCase()) {
      case 'DIAMANTE':
        return const Color(0xFF00E5FF);
      case 'ORO':
        return AppTheme.accentGold;
      case 'PLATA':
        return const Color(0xFFE0E0E0);
      default:
        return const Color(0xFFCD7F32);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.usuario;

    if (!auth.isAuthenticated || user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mi Cuenta')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_outline, size: 64, color: AppTheme.textMuted),
                const SizedBox(height: 16),
                const Text(
                  'Inicia sesión para una experiencia completa',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Gestiona tus pedidos, reservas de probador y puntos de fidelización.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    child: const Text('Iniciar Sesión'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final gamProv = context.watch<GamificacionProvider>();
    final perfil = gamProv.perfil;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Cuenta'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.textSecondary),
            tooltip: 'Cerrar sesión',
            onPressed: () => _confirmarLogout(context),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Tarjeta de perfil boutique
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppTheme.accentGold.withOpacity(0.15),
                  child: Text(
                    user.nombres.isNotEmpty ? user.nombres[0].toUpperCase() : 'C',
                    style: const TextStyle(
                      color: AppTheme.accentGold,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.displayName,
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGold.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.accentGold.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'CLIENTE EXCLUSIVO',
                          style: TextStyle(
                            color: AppTheme.accentGold,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Tarjeta de Membresía VIP Gamificada (CU21)
          if (perfil != null)
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const RecompensasScreen()),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF1E2430),
                      _colorNivel(perfil.nivel).withOpacity(0.12),
                      const Color(0xFF12151D),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _colorNivel(perfil.nivel).withOpacity(0.5)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
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
                          child: Row(
                            children: [
                              Icon(Icons.workspace_premium, color: _colorNivel(perfil.nivel), size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'CLUB PRIVILEGE • RANGO ${perfil.nivel}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: _colorNivel(perfil.nivel),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_ios, color: Colors.white38, size: 12),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${perfil.puntosActuales} PTS',
                              style: TextStyle(
                                color: _colorNivel(perfil.nivel),
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              'Saldo de Lealtad Canjeable',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                            ),
                          ],
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _colorNivel(perfil.nivel),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const RecompensasScreen()),
                            );
                          },
                          child: const Text('VER CANJES', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (perfil.progresoNivelPct / 100.0).clamp(0.0, 1.0),
                        minHeight: 6,
                        backgroundColor: Colors.white12,
                        valueColor: AlwaysStoppedAnimation<Color>(_colorNivel(perfil.nivel)),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      perfil.siguienteNivel != null
                          ? 'Faltan ${perfil.puntosSiguienteNivel} pts para ascender a ${perfil.siguienteNivel}'
                          : 'Rango Máximo Diamante alcanzado',
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 24),

          const Text(
            'TRANSACCIONES Y SERVICIOS INTELIGENTES',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 12),

          _buildActionTile(
            icon: Icons.receipt_long_outlined,
            title: 'Mis Pedidos y Compras',
            subtitle: 'Historial, facturas y seguimiento en vivo',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MisPedidosScreen()),
              );
            },
          ),
          const SizedBox(height: 10),

          _buildActionTile(
            icon: Icons.qr_code_2_outlined,
            title: 'Mis Tickets de Reserva',
            subtitle: 'Códigos QR para probar prendas en tienda física',
            onTap: () {
              if (widget.onIrAReservas != null) {
                widget.onIrAReservas!();
              }
            },
          ),
          const SizedBox(height: 10),

          // Acceso Gamificación (CU21)
          _buildActionTile(
            icon: Icons.workspace_premium,
            title: 'Club de Fidelización & Canjes (CU21)',
            subtitle: 'Progresión de nivel, insignias y cupones de recompensa',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const RecompensasScreen()),
              );
            },
          ),
          const SizedBox(height: 10),

          // Acceso Estilista IA (CU22)
          _buildActionTile(
            icon: Icons.auto_awesome,
            title: 'Estilista Virtual con IA (CU22)',
            subtitle: 'Recomendaciones inteligentes de outfits según clima local',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const RecomendacionesIaScreen()),
              );
            },
          ),
          const SizedBox(height: 10),

          // Acceso Comparador de Outfits (CU20)
          _buildActionTile(
            icon: Icons.compare_arrows,
            title: 'Comparador de Outfits (CU20)',
            subtitle: 'Contrasta hasta 3 combinaciones completas lado a lado',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ComparadorOutfitsScreen()),
              );
            },
          ),

          const SizedBox(height: 28),

          const Text(
            'INFORMACIÓN',
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
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'FashionStore App Móvil v1.0 (Ciclo 3)',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text(
                  'Canal exclusivo para clientes con soporte de Realidad Aumentada (RA), IA contextual y Gamificación.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () => _confirmarLogout(context),
            icon: const Icon(Icons.logout, size: 18),
            label: const Text('Cerrar Sesión'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.danger,
              side: BorderSide(color: AppTheme.danger.withOpacity(0.5)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: AppTheme.bgSurface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.border),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.bgElevated,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppTheme.accentGold, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmarLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSurface,
        title: const Text('¿Cerrar sesión?'),
        content: const Text('Deberás volver a ingresar tus credenciales para acceder a tus pedidos y bolsa.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () async {
              final authProv = Provider.of<AuthProvider>(context, listen: false);
              final cartProv = Provider.of<CarritoProvider>(context, listen: false);
              Navigator.pop(ctx);
              await authProv.logout();
              cartProv.limpiar();
            },
            child: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }
}
