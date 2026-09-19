import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/carrito_provider.dart';
import 'core/providers/comparador_provider.dart';
import 'core/providers/gamificacion_provider.dart';
import 'core/providers/recomendaciones_ia_provider.dart';
import 'core/theme/app_theme.dart';
import 'modules/auth/views/login_screen.dart';
import 'modules/auth/views/registro_screen.dart';
import 'modules/checkout/views/checkout_screen.dart';
import 'modules/ordenes/views/mis_pedidos_screen.dart';
import 'modules/reservas/views/crear_reserva_screen.dart';
import 'modules/reservas/views/mis_tickets_screen.dart';
import 'modules/shell/views/main_shell.dart';
import 'modules/gamificacion/views/recompensas_screen.dart';
import 'modules/ia_recomendaciones/views/recomendaciones_ia_screen.dart';
import 'modules/catalogo/views/comparador_outfits_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FashionStoreApp());
}

class FashionStoreApp extends StatelessWidget {
  const FashionStoreApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initSession()),
        ChangeNotifierProvider(create: (_) => CarritoProvider()),
        ChangeNotifierProvider(create: (_) => ComparadorProvider()),
        ChangeNotifierProvider(create: (_) => GamificacionProvider()),
        ChangeNotifierProvider(create: (_) => RecomendacionesIaProvider()),
      ],
      child: MaterialApp(
        title: 'FashionStore Boutique',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const MainShell(),
        routes: {
          '/catalogo': (_) => const MainShell(initialTab: 0),
          '/reservas': (_) => const MainShell(initialTab: 1),
          '/reservas/crear': (_) => const CrearReservaScreen(),
          '/reservas/ticket': (_) => const MisTicketsScreen(),
          '/carrito': (_) => const MainShell(initialTab: 2),
          '/checkout': (_) => const CheckoutScreen(),
          '/cuenta': (_) => const MainShell(initialTab: 3),
          '/pedidos': (_) => const MisPedidosScreen(),
          '/login': (_) => const LoginScreen(),
          '/registro': (_) => const RegistroScreen(),
          '/comparador': (_) => const ComparadorOutfitsScreen(),
          '/recompensas': (_) => const RecompensasScreen(),
          '/recomendaciones': (_) => const RecomendacionesIaScreen(),
        },
      ),
    );
  }
}
