import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fashionstore_mobile/core/providers/carrito_provider.dart';
import 'package:fashionstore_mobile/core/theme/app_theme.dart';
import 'package:fashionstore_mobile/modules/p03_catalogo_estilismo_ia/catalogo/views/catalogo_screen.dart';
import 'package:fashionstore_mobile/modules/p06_reservas_presenciales/reservas/views/mis_tickets_screen.dart';
import 'package:fashionstore_mobile/modules/p07_venta_digital_fidelizacion/carrito/views/carrito_screen.dart';
import 'package:fashionstore_mobile/modules/p01_seguridad_acceso/cuenta/views/cuenta_screen.dart';

class MainShell extends StatefulWidget {
  final int initialTab;

  const MainShell({Key? key, this.initialTab = 0}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  void _switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CarritoProvider>(context);

    final List<Widget> screens = [
      CatalogoScreen(onSwitchTab: _switchTab),
      MisTicketsScreen(onSwitchTab: _switchTab, isActive: _currentIndex == 1),
      CarritoScreen(onSwitchTab: _switchTab),
      CuentaScreen(onIrAReservas: () => _switchTab(1)),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _switchTab,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.storefront_outlined),
            activeIcon: Icon(Icons.storefront),
            label: 'Catálogo',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: 'Reservas',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: cart.totalItems > 0,
              backgroundColor: AppTheme.accentGold,
              textColor: AppTheme.bgMain,
              label: Text(
                '${cart.totalItems}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
              child: const Icon(Icons.shopping_bag_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: cart.totalItems > 0,
              backgroundColor: AppTheme.accentGold,
              textColor: AppTheme.bgMain,
              label: Text(
                '${cart.totalItems}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
              child: const Icon(Icons.shopping_bag),
            ),
            label: 'Bolsa',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Cuenta',
          ),
        ],
      ),
    );
  }
}
