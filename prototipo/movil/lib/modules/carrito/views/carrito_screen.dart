import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../../core/models/carrito.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/carrito_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/views/login_screen.dart';
import '../../checkout/views/checkout_screen.dart';

class CarritoScreen extends StatefulWidget {
  final Function(int)? onSwitchTab;

  const CarritoScreen({Key? key, this.onSwitchTab}) : super(key: key);

  @override
  State<CarritoScreen> createState() => _CarritoScreenState();
}

class _CarritoScreenState extends State<CarritoScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        Provider.of<CarritoProvider>(context, listen: false).cargarCarrito();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final cart = Provider.of<CarritoProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Bolsa de Compras')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.shopping_bag_outlined, size: 64, color: AppTheme.textMuted),
                const SizedBox(height: 16),
                const Text(
                  'Inicia sesión para ver tu bolsa',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Tus prendas se sincronizan en todos tus dispositivos y se reservan en tiempo real.',
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
        title: const Text('Bolsa de Compras'),
        actions: [
          if (cart.items.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, color: AppTheme.textSecondary),
              tooltip: 'Vaciar bolsa',
              onPressed: () => _confirmarVaciar(context, cart),
            ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: () => cart.cargarCarrito(),
          ),
        ],
      ),
      body: cart.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.accentGold),
            )
          : cart.items.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.shopping_bag_outlined, size: 70, color: AppTheme.textMuted),
                        const SizedBox(height: 16),
                        const Text(
                          'Tu bolsa está vacía',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Explora nuestro catálogo de alta sastrería masculina y añade tus prendas favoritas.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                        ),
                        const SizedBox(height: 24),
                        OutlinedButton(
                          onPressed: () {
                            if (widget.onSwitchTab != null) {
                              widget.onSwitchTab!(0); // Catálogo
                            }
                          },
                          child: const Text('Explorar Colección'),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    // Lista de ítems
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: cart.items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = cart.items[index];
                          return _buildItemCard(context, item, cart);
                        },
                      ),
                    ),

                    // Resumen y botón de Checkout
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: AppTheme.bgSurface,
                        border: Border(top: BorderSide(color: AppTheme.border)),
                      ),
                      child: SafeArea(
                        top: false,
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Estimado',
                                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                                ),
                                Text(
                                  'Bs. ${cart.totalGeneral.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => CheckoutScreen(onSwitchTab: widget.onSwitchTab),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                ),
                                child: const Text(
                                  'Proceder al Checkout',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildItemCard(BuildContext context, CarritoItem item, CarritoProvider cart) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen miniatura
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: item.imagenPrincipal ??
                  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
              width: 70,
              height: 85,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: AppTheme.bgElevated),
              errorWidget: (_, __, ___) => Container(
                color: AppTheme.bgElevated,
                width: 70,
                height: 85,
                child: const Icon(Icons.broken_image_outlined, size: 24, color: AppTheme.textMuted),
              ),
            ),
          ),
          const SizedBox(width: 14),

          // Datos y controles
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.nombreProducto,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: AppTheme.textMuted),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => cart.eliminarItem(item.idItem),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Talla: ${item.talla}  •  Color: ${item.color}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Bs. ${item.subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppTheme.accentGold,
                      ),
                    ),

                    // Selector de cantidad (+/-) limitado por stock
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.bgElevated,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 14),
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            onPressed: item.cantidad > 1
                                ? () => cart.actualizarCantidad(item.idItem, item.cantidad - 1)
                                : () => cart.eliminarItem(item.idItem),
                          ),
                          Text(
                            '${item.cantidad}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add, size: 14),
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            onPressed: item.cantidad < item.stockMaximoDisponible
                                ? () => cart.actualizarCantidad(item.idItem, item.cantidad + 1)
                                : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _confirmarVaciar(BuildContext context, CarritoProvider cart) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSurface,
        title: const Text('¿Vaciar la bolsa?'),
        content: const Text('Se eliminarán todas las prendas que tienes agregadas.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              cart.vaciar();
            },
            child: const Text('Vaciar'),
          ),
        ],
      ),
    );
  }
}
