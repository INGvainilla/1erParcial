import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'package:uuid/uuid.dart';
import 'devoluciones_service.dart';

class OfflineDevolucionesService {
  static final OfflineDevolucionesService _instance = OfflineDevolucionesService._internal();
  factory OfflineDevolucionesService() => _instance;
  OfflineDevolucionesService._internal();

  Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDB();
    return _db!;
  }

  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'fashionstore_offline.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE operaciones_pendientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE,
            tipo_operacion TEXT,
            nro_ticket_original TEXT,
            payload_json TEXT,
            estado TEXT,
            fecha_registro TEXT,
            total_estimado REAL,
            diferencia_estimada REAL,
            codigo_vale_local TEXT,
            nueva_talla TEXT,
            nuevo_color TEXT
          )
        ''');
      },
    );
  }

  /// Guarda una solicitud de devolución o cambio en SQLite local cuando no hay conexión
  Future<Map<String, dynamic>> guardarDevolucionOffline({
    required String nroTicketOriginal,
    required String motivo,
    required String tipoResolucion,
    required Map<String, dynamic> payload,
    required double totalEstimado,
    required double diferenciaEstimada,
    String? nuevaTalla,
    String? nuevoColor,
  }) async {
    final db = await database;
    final uuid = const Uuid().v4();
    final now = DateTime.now().toIso8601String();
    final correlativoLocal = 'DEV-OFFLINE-${uuid.substring(0, 8).toUpperCase()}';
    final valeLocal = (diferenciaEstimada < 0 || tipoResolucion == 'VALE_CREDITO')
        ? 'VALE-LOCAL-${uuid.substring(0, 6).toUpperCase()}'
        : null;

    await db.insert(
      'operaciones_pendientes',
      {
        'uuid': uuid,
        'tipo_operacion': 'DEVOLUCION_CAMBIO',
        'nro_ticket_original': nroTicketOriginal,
        'payload_json': jsonEncode(payload),
        'estado': 'PENDIENTE_SINCRONIZACION',
        'fecha_registro': now,
        'total_estimado': totalEstimado,
        'diferencia_estimada': diferenciaEstimada,
        'codigo_vale_local': valeLocal,
        'nueva_talla': nuevaTalla,
        'nuevo_color': nuevoColor,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    return {
      'is_offline': true,
      'id_devolucion': 0,
      'nro_devolucion': correlativoLocal,
      'codigo_vale': valeLocal,
      'total_devuelto': totalEstimado,
      'diferencia_cobrada': diferenciaEstimada,
      'estado': 'PENDIENTE_SINCRONIZACION',
      'mensaje_kardex': 'Operación encolada en SQLite local (CU11/CU12). Se sincronizará con el Kardex al detectar conexión.',
    };
  }

  /// Consulta las solicitudes pendientes almacenadas localmente
  Future<List<Map<String, dynamic>>> obtenerOperacionesPendientes() async {
    final db = await database;
    return await db.query(
      'operaciones_pendientes',
      where: 'estado = ?',
      whereArgs: ['PENDIENTE_SINCRONIZACION'],
      orderBy: 'id DESC',
    );
  }

  /// Intenta sincronizar las operaciones pendientes cuando vuelve la conexión a Internet
  Future<int> sincronizarPendientes(DevolucionesService apiService) async {
    final pendientes = await obtenerOperacionesPendientes();
    int sincronizadas = 0;

    for (var op in pendientes) {
      try {
        final payload = jsonDecode(op['payload_json'] as String) as Map<String, dynamic>;
        final res = await apiService.procesarDevolucion(payload);

        if (res.isNotEmpty && res['nro_devolucion'] != null) {
          final db = await database;
          await db.update(
            'operaciones_pendientes',
            {'estado': 'SINCRONIZADO'},
            where: 'id = ?',
            whereArgs: [op['id']],
          );
          sincronizadas++;
        }
      } catch (_) {
        // Continúa con la siguiente si aún falla la red
      }
    }
    return sincronizadas;
  }

  /// Encola una orden de compra pendiente de pago para su liquidación automática al volver internet
  Future<void> encolarPagoOrdenOffline({
    required int idOrden,
    required String nroTicket,
    required double total,
  }) async {
    final db = await database;
    final uuid = const Uuid().v4();
    final now = DateTime.now().toIso8601String();

    await db.insert(
      'operaciones_pendientes',
      {
        'uuid': uuid,
        'tipo_operacion': 'PAGO_ORDEN',
        'nro_ticket_original': nroTicket,
        'payload_json': jsonEncode({'id_orden': idOrden, 'total': total}),
        'estado': 'PENDIENTE_SINCRONIZACION',
        'fecha_registro': now,
        'total_estimado': total,
        'diferencia_estimada': 0.0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Sincroniza y liquida automáticamente las órdenes pendientes de pago cuando se restablece la conexión a Internet
  Future<int> sincronizarPagosPendientes(dynamic pagosService) async {
    final db = await database;
    final pendientes = await db.query(
      'operaciones_pendientes',
      where: 'tipo_operacion = ? AND estado = ?',
      whereArgs: ['PAGO_ORDEN', 'PENDIENTE_SINCRONIZACION'],
    );
    int sincronizados = 0;

    for (var op in pendientes) {
      try {
        final payload = jsonDecode(op['payload_json'] as String) as Map<String, dynamic>;
        final idOrden = payload['id_orden'] as int;

        final intent = await pagosService.crearIntencionPago(idOrden);
        await pagosService.confirmarPagoDirecto(idOrden, intent.paymentIntentId);

        await db.update(
          'operaciones_pendientes',
          {'estado': 'SINCRONIZADO'},
          where: 'id = ?',
          whereArgs: [op['id']],
        );
        sincronizados++;
      } catch (_) {
        // Si ya fue pagado o falla temporalmente, continuar
      }
    }
    return sincronizados;
  }
}

