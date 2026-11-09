import 'dart:async';
import 'package:flutter/material.dart';
import 'network_service.dart';
import 'offline_devoluciones_service.dart';
import 'ordenes_service.dart';
import 'pagos_service.dart';
import 'reserva_service.dart';
import 'devoluciones_service.dart';
import 'carrito_service.dart';

class GlobalSyncService {
  static final GlobalSyncService _instance = GlobalSyncService._internal();
  factory GlobalSyncService() => _instance;
  GlobalSyncService._internal();

  final OrdenesService _ordenesService = OrdenesService();
  final PagosService _pagosService = PagosService();
  final ReservaService _reservaService = ReservaService();
  final DevolucionesService _devolucionesService = DevolucionesService();
  final CarritoService _carritoService = CarritoService();

  Timer? _timer;
  bool _isSyncing = false;
  bool _estabaOffline = false;

  final ValueNotifier<bool> isOfflineNotifier = ValueNotifier<bool>(false);
  final ValueNotifier<int> totalSincronizadosNotifier = ValueNotifier<int>(0);
  final ValueNotifier<String?> syncMessageNotifier = ValueNotifier<String?>(null);

  void iniciarMonitoreo({GlobalKey<ScaffoldMessengerState>? scaffoldMessengerKey}) {
    if (_timer != null) return;

    // Ejecutar chequeo inmediato
    _verificarYSincronizar(scaffoldMessengerKey: scaffoldMessengerKey);

    // Monitoreo periódico continuo cada 3 segundos
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _verificarYSincronizar(scaffoldMessengerKey: scaffoldMessengerKey);
    });
  }

  void detenerMonitoreo() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> forzarSincronizacion({GlobalKey<ScaffoldMessengerState>? scaffoldMessengerKey}) async {
    await _verificarYSincronizar(scaffoldMessengerKey: scaffoldMessengerKey, forzar: true);
  }

  Future<void> _verificarYSincronizar({
    GlobalKey<ScaffoldMessengerState>? scaffoldMessengerKey,
    bool forzar = false,
  }) async {
    if (_isSyncing) return;

    final tieneNet = await NetworkService.tieneInternetReal();
    final bool esOfflineAhora = !tieneNet;

    if (isOfflineNotifier.value != esOfflineAhora) {
      isOfflineNotifier.value = esOfflineAhora;
    }

    if (!tieneNet) {
      _estabaOffline = true;
      return;
    }

    // Si tiene conexión a internet (Wi-Fi o Datos)
    _isSyncing = true;
    try {
      final resultados = await OfflineDevolucionesService().sincronizarTodo(
        ordenesService: _ordenesService,
        pagosService: _pagosService,
        reservaService: _reservaService,
        devolucionesService: _devolucionesService,
        carritoService: _carritoService,
      );

      final totalSinc = (resultados['reservas'] ?? 0) +
          (resultados['ordenes'] ?? 0) +
          (resultados['pagos'] ?? 0) +
          (resultados['devoluciones'] ?? 0) +
          (resultados['carrito'] ?? 0);

      if (totalSinc > 0 || _estabaOffline) {
        if (totalSinc > 0) {
          totalSincronizadosNotifier.value += totalSinc;
          final msg = '⚡ ¡Conexión a Internet detectada! Sus pedidos y reservas pendientes fueron procesados y pasaron a estado PAGADO ($totalSinc operaciones sincronizadas).';
          syncMessageNotifier.value = msg;

          if (scaffoldMessengerKey?.currentState != null) {
            scaffoldMessengerKey!.currentState!.showSnackBar(
              SnackBar(
                content: Text(msg),
                backgroundColor: Colors.green.shade700,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        }
        _estabaOffline = false;
      }
    } catch (_) {
      // Continuar silenciosamente sin interrumpir la experiencia de usuario
    } finally {
      _isSyncing = false;
    }
  }
}

