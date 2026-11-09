import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'package:uuid/uuid.dart';
import 'devoluciones_service.dart';
import 'offline_catalogo_seed.dart';
import 'network_service.dart';
import 'carrito_service.dart';
import '../models/orden.dart';
import '../models/reserva.dart';
import '../models/carrito.dart';

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

    final db = await openDatabase(
      path,
      version: 3,
      onCreate: (db, version) async {
        await _createTables(db);
        await _seedCatalogIfEmpty(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        await _createTables(db);
        await _seedCatalogIfEmpty(db);
      },
    );

    // Asegurar siempre que las tablas y el catálogo existan
    await _createTables(db);
    await _seedCatalogIfEmpty(db);

    return db;
  }

  Future<void> _createTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS operaciones_pendientes (
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

    await db.execute('''
      CREATE TABLE IF NOT EXISTS catalogo_cache (
        id_producto INTEGER PRIMARY KEY,
        id_categoria INTEGER,
        nombre TEXT,
        json_data TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS categorias_cache (
        id_categoria INTEGER PRIMARY KEY,
        nombre_categoria TEXT,
        descripcion TEXT,
        json_data TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS sucursales_cache (
        id_sucursal INTEGER PRIMARY KEY,
        nombre_sucursal TEXT,
        direccion TEXT,
        nombre_ciudad TEXT,
        json_data TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS ordenes_cache (
        id_orden INTEGER PRIMARY KEY,
        numero_factura TEXT,
        total REAL,
        estado_pago TEXT,
        json_data TEXT,
        fecha TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS reservas_cache (
        id_reserva INTEGER PRIMARY KEY,
        codigo_qr TEXT,
        estado TEXT,
        json_data TEXT,
        fecha TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS carrito_offline (
        id_item INTEGER PRIMARY KEY AUTOINCREMENT,
        id_producto INTEGER,
        nombre_producto TEXT,
        codigo_sku_base TEXT,
        imagen_principal TEXT,
        talla TEXT,
        color TEXT,
        cantidad INTEGER,
        precio_unitario REAL,
        subtotal REAL,
        stock_maximo_disponible INTEGER,
        sincronizado INTEGER DEFAULT 0
      )
    ''');
  }

  Future<void> _seedCatalogIfEmpty(Database db) async {
    try {
      final count = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM catalogo_cache')) ?? 0;
      if (count == 0) {
        final batch = db.batch();
        for (var p in OfflineCatalogoSeed.prendas) {
          batch.insert(
            'catalogo_cache',
            {
              'id_producto': p['id_producto'],
              'id_categoria': p['id_categoria'],
              'nombre': p['nombre'],
              'json_data': jsonEncode(p),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        for (var c in OfflineCatalogoSeed.categorias) {
          batch.insert(
            'categorias_cache',
            {
              'id_categoria': c['id_categoria'],
              'nombre_categoria': c['nombre_categoria'],
              'descripcion': c['descripcion'] ?? '',
              'json_data': jsonEncode(c),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        for (var s in OfflineCatalogoSeed.sucursales) {
          batch.insert(
            'sucursales_cache',
            {
              'id_sucursal': s['id_sucursal'],
              'nombre_sucursal': s['nombre_sucursal'],
              'direccion': s['direccion'] ?? '',
              'nombre_ciudad': s['nombre_ciudad'] ?? 'Santa Cruz',
              'json_data': jsonEncode(s),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        await batch.commit(noResult: true);
      }
    } catch (_) {}
  }

  // ==========================================
  // CU08: CATÁLOGO, CATEGORÍAS Y SUCURSALES OFFLINE
  // ==========================================

  Future<void> guardarCatalogoOffline(List<Map<String, dynamic>> prendas) async {
    if (prendas.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var p in prendas) {
      batch.insert(
        'catalogo_cache',
        {
          'id_producto': p['id_producto'],
          'id_categoria': p['id_categoria'],
          'nombre': p['nombre'],
          'json_data': jsonEncode(p),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> obtenerCatalogoOffline({
    String? busqueda,
    int? idCategoria,
    int? idSucursal,
  }) async {
    final db = await database;
    await _seedCatalogIfEmpty(db);

    String where = '';
    List<dynamic> whereArgs = [];

    if (idCategoria != null) {
      where = 'id_categoria = ?';
      whereArgs.add(idCategoria);
    }

    if (busqueda != null && busqueda.trim().isNotEmpty) {
      final term = '%${busqueda.trim()}%';
      if (where.isNotEmpty) where += ' AND ';
      where += 'nombre LIKE ?';
      whereArgs.add(term);
    }

    final rows = await db.query(
      'catalogo_cache',
      where: where.isNotEmpty ? where : null,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'id_producto DESC',
    );

    if (rows.isEmpty && (busqueda == null || busqueda.isEmpty) && idCategoria == null) {
      return OfflineCatalogoSeed.prendas;
    }

    List<Map<String, dynamic>> items = [];
    for (var r in rows) {
      try {
        final map = jsonDecode(r['json_data'] as String) as Map<String, dynamic>;
        if (idSucursal != null) {
          final sucursales = map['disponibilidad_sucursales'] as List<dynamic>? ?? [];
          final hasSucursal = sucursales.any((s) => s['id_sucursal'] == idSucursal && (s['stock_disponible'] ?? 0) > 0);
          if (!hasSucursal) continue;
        }
        items.add(map);
      } catch (_) {}
    }

    return items;
  }

  Future<void> guardarCategoriasOffline(List<Map<String, dynamic>> categorias) async {
    if (categorias.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var c in categorias) {
      batch.insert(
        'categorias_cache',
        {
          'id_categoria': c['id_categoria'],
          'nombre_categoria': c['nombre_categoria'] ?? c['nombre'],
          'descripcion': c['descripcion'] ?? '',
          'json_data': jsonEncode(c),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> obtenerCategoriasOffline() async {
    final db = await database;
    await _seedCatalogIfEmpty(db);
    final rows = await db.query('categorias_cache', orderBy: 'id_categoria ASC');
    if (rows.isEmpty) return OfflineCatalogoSeed.categorias;
    return rows.map((r) {
      try {
        return jsonDecode(r['json_data'] as String) as Map<String, dynamic>;
      } catch (_) {
        return {
          'id_categoria': r['id_categoria'],
          'nombre_categoria': r['nombre_categoria'],
          'descripcion': r['descripcion'],
        };
      }
    }).toList();
  }

  Future<void> guardarSucursalesOffline(List<Map<String, dynamic>> sucursales) async {
    if (sucursales.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var s in sucursales) {
      batch.insert(
        'sucursales_cache',
        {
          'id_sucursal': s['id_sucursal'],
          'nombre_sucursal': s['nombre_sucursal'],
          'direccion': s['direccion'] ?? '',
          'nombre_ciudad': s['nombre_ciudad'] ?? 'Santa Cruz',
          'json_data': jsonEncode(s),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> obtenerSucursalesOffline() async {
    final db = await database;
    await _seedCatalogIfEmpty(db);
    final rows = await db.query('sucursales_cache', orderBy: 'id_sucursal ASC');
    if (rows.isEmpty) return OfflineCatalogoSeed.sucursales;
    return rows.map((r) {
      try {
        return jsonDecode(r['json_data'] as String) as Map<String, dynamic>;
      } catch (_) {
        return {
          'id_sucursal': r['id_sucursal'],
          'nombre_sucursal': r['nombre_sucursal'],
          'direccion': r['direccion'],
          'nombre_ciudad': r['nombre_ciudad'],
        };
      }
    }).toList();
  }

  // ==========================================
  // CU10 / CU11 / CU12: ORDENES Y CHECKOUT OFFLINE
  // ==========================================

  Future<Map<String, dynamic>> guardarOrdenCheckoutOffline({
    required String modalidadEntrega,
    int? idSucursal,
    String? direccionEnvio,
    String? telefonoContacto,
    required String nitFactura,
    required String razonSocialFactura,
    String? notasEntrega,
    String? codigoCupon,
    required double total,
    required List<Map<String, dynamic>> items,
  }) async {
    final db = await database;
    final uuid = const Uuid().v4();
    final now = DateTime.now().toIso8601String();
    final correlativoLocal = 'FAC-OFFLINE-${uuid.substring(0, 8).toUpperCase()}';

    final payload = {
      'modalidad_entrega': modalidadEntrega,
      if (idSucursal != null) 'id_sucursal': idSucursal,
      if (direccionEnvio != null && direccionEnvio.isNotEmpty) 'direccion_envio': direccionEnvio,
      if (telefonoContacto != null && telefonoContacto.isNotEmpty) 'telefono_contacto': telefonoContacto,
      'nit_factura': nitFactura,
      'razon_social_factura': razonSocialFactura,
      if (notasEntrega != null && notasEntrega.isNotEmpty) 'notas_entrega': notasEntrega,
      if (codigoCupon != null && codigoCupon.trim().isNotEmpty) 'codigo_cupon': codigoCupon.trim().toUpperCase(),
      'total': total,
      'items': items,
      'canal_venta': 'APP',
    };

    await db.insert(
      'operaciones_pendientes',
      {
        'uuid': uuid,
        'tipo_operacion': 'ORDEN_CHECKOUT',
        'nro_ticket_original': correlativoLocal,
        'payload_json': jsonEncode(payload),
        'estado': 'PENDIENTE_SINCRONIZACION',
        'fecha_registro': now,
        'total_estimado': total,
        'diferencia_estimada': 0.0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Guardar también como Orden local visible en Mis Pedidos
    final mockDetalles = items.map((i) => {
      'id_detalle_orden': 0,
      'id_producto': i['id_producto'] ?? 0,
      'nombre_producto': i['nombre_producto'] ?? 'Prenda',
      'codigo_sku_base': i['codigo_sku_base'] ?? 'SKU-OFFLINE',
      'imagen_principal': i['imagen_principal'],
      'talla': i['talla'] ?? '',
      'color': i['color'] ?? '',
      'cantidad': i['cantidad'] ?? 1,
      'precio_unitario': i['precio_unitario'] ?? 0.0,
      'subtotal': i['subtotal'] ?? 0.0,
    }).toList();

    final ordenLocalMap = {
      'id_orden': DateTime.now().millisecondsSinceEpoch % 100000,
      'numero_factura': correlativoLocal,
      'canal_venta': 'APP',
      'modalidad_entrega': modalidadEntrega,
      'direccion_envio': direccionEnvio,
      'telefono_contacto': telefonoContacto,
      'nit_factura': nitFactura,
      'razon_social_factura': razonSocialFactura,
      'subtotal': total,
      'costo_envio': 0.0,
      'total': total,
      'estado_pago': 'PENDIENTE (OFFLINE)',
      'estado_logistica': 'CREADA_LOCAL',
      'creado_en': now,
      'detalles': mockDetalles,
    };

    await db.insert(
      'ordenes_cache',
      {
        'id_orden': ordenLocalMap['id_orden'],
        'numero_factura': correlativoLocal,
        'total': total,
        'estado_pago': 'PENDIENTE (OFFLINE)',
        'json_data': jsonEncode(ordenLocalMap),
        'fecha': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Vaciar carrito offline tras checkout exitoso
    try {
      await db.delete('carrito_offline');
    } catch (_) {}

    return {
      'is_offline': true,
      'id_orden': ordenLocalMap['id_orden'],
      'numero_factura': correlativoLocal,
      'total': total,
      'modalidad_entrega': modalidadEntrega,
      'estado_pago': 'PENDIENTE (OFFLINE)',
      'mensaje': 'Compra registrada en SQLite local (CU10/CU11/CU12). Se liquidará automáticamente al detectar conexión.',
    };
  }

  Future<void> guardarOrdenesCacheOffline(List<Orden> ordenes) async {
    if (ordenes.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var o in ordenes) {
      batch.insert(
        'ordenes_cache',
        {
          'id_orden': o.idOrden,
          'numero_factura': o.numeroFactura ?? 'ORDEN #${o.idOrden}',
          'total': o.total,
          'estado_pago': o.estadoPago,
          'json_data': jsonEncode(o.toJson()),
          'fecha': o.creadoEn.toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Orden>> obtenerOrdenesCacheOffline() async {
    final db = await database;
    final rows = await db.query('ordenes_cache', orderBy: 'id_orden DESC');
    List<Orden> list = [];
    for (var r in rows) {
      try {
        final map = jsonDecode(r['json_data'] as String) as Map<String, dynamic>;
        list.add(Orden.fromJson(map));
      } catch (_) {}
    }
    return list;
  }

  // ==========================================
  // CU11 / CU12: DEVOLUCIONES Y CAMBIOS OFFLINE
  // ==========================================

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

  Future<List<Map<String, dynamic>>> obtenerOperacionesPendientes() async {
    final db = await database;
    return await db.query(
      'operaciones_pendientes',
      where: 'estado = ?',
      whereArgs: ['PENDIENTE_SINCRONIZACION'],
      orderBy: 'id DESC',
    );
  }

  Future<int> sincronizarPendientes(DevolucionesService apiService) async {
    final pendientes = await obtenerOperacionesPendientes();
    int sincronizadas = 0;

    for (var op in pendientes) {
      if (op['tipo_operacion'] == 'DEVOLUCION_CAMBIO') {
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
        } catch (_) {}
      }
    }
    return sincronizadas;
  }

  Future<int> sincronizarOrdenesCheckoutPendientes(dynamic ordenesService, dynamic pagosService) async {
    final db = await database;
    final pendientes = await db.query(
      'operaciones_pendientes',
      where: 'tipo_operacion = ? AND estado = ?',
      whereArgs: ['ORDEN_CHECKOUT', 'PENDIENTE_SINCRONIZACION'],
    );
    int sincronizadas = 0;

    for (var op in pendientes) {
      try {
        final payload = jsonDecode(op['payload_json'] as String) as Map<String, dynamic>;
        final items = payload['items'] as List<dynamic>? ?? [];

        // 1. Re-inyectar las prendas en el carrito del servidor para que el checkout no diga 'carrito vacío'
        final CarritoService carritoApi = CarritoService();
        for (var item in items) {
          try {
            await carritoApi.addItem(
              idProducto: (item['id_producto'] as num).toInt(),
              talla: (item['talla'] ?? 'M').toString(),
              color: (item['color'] ?? 'Estándar').toString(),
              cantidad: (item['cantidad'] as num? ?? 1).toInt(),
              bypassingOffline: true,
            );
          } catch (_) {}
        }

        // 2. Ejecutar checkout en el servidor
        final orden = await ordenesService.checkout(
          modalidadEntrega: payload['modalidad_entrega'] ?? 'DELIVERY',
          idSucursal: payload['id_sucursal'],
          direccionEnvio: payload['direccion_envio'],
          telefonoContacto: payload['telefono_contacto'],
          nitFactura: payload['nit_factura'] ?? '0',
          razonSocialFactura: payload['razon_social_factura'] ?? 'Consumidor Final',
          notasEntrega: payload['notas_entrega'],
          codigoCupon: payload['codigo_cupon'],
        );

        if (orden != null && orden.idOrden > 0) {
          // 3. Liquidar y pagar automáticamente para que el estado pase a 'PAGADO'
          if (pagosService != null) {
            try {
              final intent = await pagosService.crearIntencionPago(orden.idOrden);
              await pagosService.confirmarPagoDirecto(orden.idOrden, intent.paymentIntentId);
            } catch (_) {}
          }

          // 4. Marcar en SQLite como SINCRONIZADO
          await db.update(
            'operaciones_pendientes',
            {'estado': 'SINCRONIZADO'},
            where: 'id = ?',
            whereArgs: [op['id']],
          );

          // 5. Eliminar la orden temporal offline (ej. FAC-OFFLINE-73F0BF89) de ordenes_cache
          final nroTicketOffline = op['nro_ticket_original'] as String?;
          if (nroTicketOffline != null) {
            await db.delete(
              'ordenes_cache',
              where: 'numero_factura = ?',
              whereArgs: [nroTicketOffline],
            );
          }

          // 6. Guardar la orden oficial pagada en ordenes_cache
          try {
            final ordenOficial = await ordenesService.getOrden(orden.idOrden);
            await db.insert(
              'ordenes_cache',
              {
                'id_orden': ordenOficial.idOrden,
                'numero_factura': ordenOficial.numeroFactura ?? 'ORDEN #${ordenOficial.idOrden}',
                'total': ordenOficial.total,
                'estado_pago': ordenOficial.estadoPago, // PAGADO
                'json_data': jsonEncode(ordenOficial.toJson()),
                'fecha': ordenOficial.creadoEn.toIso8601String(),
              },
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (_) {}

          sincronizadas++;
        }
      } catch (_) {}
    }
    return sincronizadas;
  }

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
      } catch (_) {}
    }
    return sincronizados;
  }

  // ==========================================
  // CU11: RESERVAS EN PROBADOR OFFLINE
  // ==========================================

  Future<Reserva> guardarReservaOffline({
    required int idSucursal,
    required DateTime fechaVisita,
    required List<Map<String, dynamic>> detalles,
  }) async {
    final db = await database;
    final uuid = const Uuid().v4();
    final now = DateTime.now().toIso8601String();
    final qrLocal = 'FS-RES-OFFLINE-${uuid.substring(0, 8).toUpperCase()}';
    final localId = DateTime.now().millisecondsSinceEpoch % 100000;

    String nombreSucursal = 'Sucursal #$idSucursal';
    String nombreCiudad = 'Santa Cruz';
    try {
      final sucs = await db.query('sucursales_cache', where: 'id_sucursal = ?', whereArgs: [idSucursal]);
      if (sucs.isNotEmpty) {
        nombreSucursal = sucs.first['nombre_sucursal'] as String? ?? nombreSucursal;
        nombreCiudad = sucs.first['nombre_ciudad'] as String? ?? nombreCiudad;
      }
    } catch (_) {}

    List<Map<String, dynamic>> detallesEnriquecidos = [];
    for (var d in detalles) {
      final prodId = d['id_producto'];
      String prodNombre = d['nombre_producto'] ?? 'Prenda #$prodId';
      String prodSku = d['codigo_sku_base'] ?? 'SKU-OFFLINE';
      String? prodImg = d['imagen_principal'];
      try {
        final prods = await db.query('catalogo_cache', where: 'id_producto = ?', whereArgs: [prodId]);
        if (prods.isNotEmpty) {
          final pMap = jsonDecode(prods.first['json_data'] as String);
          prodNombre = pMap['nombre'] ?? prodNombre;
          prodSku = pMap['codigo_sku_base'] ?? prodSku;
          prodImg = pMap['imagen_principal'] ?? prodImg;
        }
      } catch (_) {}

      detallesEnriquecidos.add({
        'id_reserva_detalle': 0,
        'id_producto': prodId,
        'talla': d['talla'] ?? 'M',
        'color': d['color'] ?? 'Estándar',
        'cantidad': d['cantidad'] ?? 1,
        'nombre_producto': prodNombre,
        'codigo_sku_base': prodSku,
        'imagen_principal': prodImg,
      });
    }

    final payload = {
      'id_sucursal': idSucursal,
      'fecha_visita': fechaVisita.toIso8601String(),
      'detalles': detallesEnriquecidos.map((d) => {
        'id_producto': d['id_producto'],
        'talla': d['talla'],
        'color': d['color'],
        'cantidad': d['cantidad'],
      }).toList(),
    };

    await db.insert(
      'operaciones_pendientes',
      {
        'uuid': uuid,
        'tipo_operacion': 'RESERVA',
        'nro_ticket_original': qrLocal,
        'payload_json': jsonEncode(payload),
        'estado': 'PENDIENTE_SINCRONIZACION',
        'fecha_registro': now,
        'total_estimado': 0.0,
        'diferencia_estimada': 0.0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    final reservaMap = {
      'id_reserva': localId,
      'id_usuario': 1,
      'id_sucursal': idSucursal,
      'codigo_qr': qrLocal,
      'qr_texto': 'TICKET DE RESERVA EN PROBADOR (CU11) - MODO OFFLINE\nCódigo: $qrLocal\nSucursal: $nombreSucursal\nFecha: ${fechaVisita.toIso8601String()}\nEstado: PENDIENTE DE CONEXIÓN',
      'fecha_visita': fechaVisita.toIso8601String(),
      'estado': 'PENDIENTE (OFFLINE)',
      'creado_en': now,
      'nombre_sucursal': nombreSucursal,
      'nombre_ciudad': nombreCiudad,
      'nombre_cliente': 'Cliente Offline',
      'detalles': detallesEnriquecidos,
    };

    await db.insert(
      'reservas_cache',
      {
        'id_reserva': localId,
        'codigo_qr': qrLocal,
        'estado': 'PENDIENTE (OFFLINE)',
        'json_data': jsonEncode(reservaMap),
        'fecha': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    return Reserva.fromJson(reservaMap);
  }

  Future<void> guardarReservasCacheOffline(List<Reserva> reservas) async {
    if (reservas.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var r in reservas) {
      batch.insert(
        'reservas_cache',
        {
          'id_reserva': r.idReserva,
          'codigo_qr': r.codigoQr,
          'estado': r.estado,
          'json_data': jsonEncode(r.toJson()),
          'fecha': r.creadoEn.toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Reserva>> obtenerReservasCacheOffline() async {
    final db = await database;
    final rows = await db.query('reservas_cache', orderBy: 'id_reserva DESC');
    List<Reserva> list = [];
    for (var r in rows) {
      try {
        final map = jsonDecode(r['json_data'] as String) as Map<String, dynamic>;
        list.add(Reserva.fromJson(map));
      } catch (_) {}
    }
    return list;
  }

  Future<int> sincronizarReservasPendientes(dynamic reservaService) async {
    final db = await database;
    final pendientes = await db.query(
      'operaciones_pendientes',
      where: 'tipo_operacion = ? AND estado = ?',
      whereArgs: ['RESERVA', 'PENDIENTE_SINCRONIZACION'],
    );
    int sincronizadas = 0;

    for (var op in pendientes) {
      try {
        final payload = jsonDecode(op['payload_json'] as String) as Map<String, dynamic>;
        final idSucursal = payload['id_sucursal'] as int;
        final fechaVisita = DateTime.parse(payload['fecha_visita'] as String);
        final detalles = (payload['detalles'] as List<dynamic>)
            .map((d) => Map<String, dynamic>.from(d))
            .toList();

        final dynamic resServidor = await reservaService.crearReserva(
          idSucursal: idSucursal,
          fechaVisita: fechaVisita,
          detalles: detalles,
          bypassingOffline: true,
        );

        if (resServidor != null && resServidor.idReserva > 0) {
          await db.update(
            'operaciones_pendientes',
            {'estado': 'SINCRONIZADO'},
            where: 'id = ?',
            whereArgs: [op['id']],
          );

          await db.delete('reservas_cache', where: 'codigo_qr = ?', whereArgs: [op['nro_ticket_original']]);
          await db.insert(
            'reservas_cache',
            {
              'id_reserva': resServidor.idReserva,
              'codigo_qr': resServidor.codigoQr,
              'estado': resServidor.estado,
              'json_data': jsonEncode(resServidor.toJson()),
              'fecha': resServidor.creadoEn.toIso8601String(),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
          sincronizadas++;
        }
      } catch (_) {}
    }
    return sincronizadas;
  }

  // ==========================================
  // CU13: CARRITO OFFLINE
  // ==========================================

  Future<Carrito> guardarItemCarritoOffline({
    required int idProducto,
    required String talla,
    required String color,
    int cantidad = 1,
    String? nombre,
    String? sku,
    String? imagen,
    double? precio,
  }) async {
    final db = await database;
    String prodNombre = nombre ?? 'Prenda #$idProducto';
    String prodSku = sku ?? 'SKU-OFFLINE';
    String? prodImg = imagen;
    double prodPrecio = precio ?? 0.0;

    try {
      final prods = await db.query('catalogo_cache', where: 'id_producto = ?', whereArgs: [idProducto]);
      if (prods.isNotEmpty) {
        final pMap = jsonDecode(prods.first['json_data'] as String);
        if (prodNombre.contains('#')) prodNombre = pMap['nombre'] ?? prodNombre;
        if (prodSku == 'SKU-OFFLINE') prodSku = pMap['codigo_sku_base'] ?? prodSku;
        prodImg ??= pMap['imagen_principal'];
        if (prodPrecio == 0.0) {
          prodPrecio = double.tryParse((pMap['precio_base'] ?? pMap['precio_final'] ?? 0.0).toString()) ?? 0.0;
        }
      }
    } catch (_) {}

    final existing = await db.query(
      'carrito_offline',
      where: 'id_producto = ? AND talla = ? AND color = ?',
      whereArgs: [idProducto, talla, color],
    );

    if (existing.isNotEmpty) {
      final row = existing.first;
      final actualCant = (row['cantidad'] as int? ?? 1) + cantidad;
      final nuevoSubtotal = actualCant * prodPrecio;
      await db.update(
        'carrito_offline',
        {
          'cantidad': actualCant,
          'subtotal': nuevoSubtotal,
          'sincronizado': 0,
        },
        where: 'id_item = ?',
        whereArgs: [row['id_item']],
      );
    } else {
      await db.insert('carrito_offline', {
        'id_producto': idProducto,
        'nombre_producto': prodNombre,
        'codigo_sku_base': prodSku,
        'imagen_principal': prodImg,
        'talla': talla,
        'color': color,
        'cantidad': cantidad,
        'precio_unitario': prodPrecio,
        'subtotal': prodPrecio * cantidad,
        'stock_maximo_disponible': 99,
        'sincronizado': 0,
      });
    }

    return await obtenerCarritoOffline();
  }

  Future<Carrito> obtenerCarritoOffline() async {
    final db = await database;
    final rows = await db.query('carrito_offline', orderBy: 'id_item ASC');
    List<CarritoItem> items = [];
    double total = 0.0;
    int totalItems = 0;

    for (var r in rows) {
      final item = CarritoItem(
        idItem: r['id_item'] as int,
        idProducto: r['id_producto'] as int,
        nombreProducto: r['nombre_producto'] as String? ?? 'Prenda',
        codigoSkuBase: r['codigo_sku_base'] as String? ?? 'SKU',
        imagenPrincipal: r['imagen_principal'] as String?,
        talla: r['talla'] as String? ?? '',
        color: r['color'] as String? ?? '',
        cantidad: r['cantidad'] as int? ?? 1,
        precioUnitario: (r['precio_unitario'] as num? ?? 0.0).toDouble(),
        subtotal: (r['subtotal'] as num? ?? 0.0).toDouble(),
        stockMaximoDisponible: r['stock_maximo_disponible'] as int? ?? 99,
      );
      items.add(item);
      total += item.subtotal;
      totalItems += item.cantidad;
    }

    return Carrito(
      idCarrito: 0,
      idUsuario: 1,
      estado: 'ACTIVO_OFFLINE',
      totalItems: totalItems,
      totalGeneral: total,
      items: items,
    );
  }

  Future<Carrito> actualizarCantidadCarritoOffline(int idItem, int cantidad) async {
    final db = await database;
    if (cantidad <= 0) {
      await db.delete('carrito_offline', where: 'id_item = ?', whereArgs: [idItem]);
    } else {
      final rows = await db.query('carrito_offline', where: 'id_item = ?', whereArgs: [idItem]);
      if (rows.isNotEmpty) {
        final precio = (rows.first['precio_unitario'] as num? ?? 0.0).toDouble();
        await db.update(
          'carrito_offline',
          {
            'cantidad': cantidad,
            'subtotal': precio * cantidad,
            'sincronizado': 0,
          },
          where: 'id_item = ?',
          whereArgs: [idItem],
        );
      }
    }
    return await obtenerCarritoOffline();
  }

  Future<Carrito> eliminarItemCarritoOffline(int idItem) async {
    final db = await database;
    await db.delete('carrito_offline', where: 'id_item = ?', whereArgs: [idItem]);
    return await obtenerCarritoOffline();
  }

  Future<void> vaciarCarritoOffline() async {
    final db = await database;
    await db.delete('carrito_offline');
  }

  Future<int> sincronizarCarritoOffline(dynamic carritoService) async {
    final db = await database;
    final rows = await db.query('carrito_offline');
    if (rows.isEmpty) return 0;
    int sincronizados = 0;

    for (var r in rows) {
      try {
        await carritoService.addItem(
          idProducto: r['id_producto'] as int,
          talla: r['talla'] as String,
          color: r['color'] as String,
          cantidad: r['cantidad'] as int,
          bypassingOffline: true,
        );
        sincronizados++;
      } catch (_) {}
    }

    if (sincronizados > 0) {
      await db.delete('carrito_offline');
    }
    return sincronizados;
  }

  // ==========================================
  // SINCRONIZACIÓN TOTAL UNIFICADA
  // ==========================================

  Future<Map<String, int>> sincronizarTodo({
    dynamic ordenesService,
    dynamic pagosService,
    dynamic reservaService,
    dynamic devolucionesService,
    dynamic carritoService,
  }) async {
    final tieneNet = await NetworkService.tieneInternetReal();
    if (!tieneNet) return {'reservas': 0, 'ordenes': 0, 'pagos': 0, 'devoluciones': 0, 'carrito': 0};

    int reservasSync = 0;
    int ordenesSync = 0;
    int pagosSync = 0;
    int devolucionesSync = 0;
    int carritoSync = 0;

    // 1. Reservas
    if (reservaService != null) {
      try {
        reservasSync = await sincronizarReservasPendientes(reservaService);
      } catch (_) {}
    }

    // 2. Carrito offline
    if (carritoService != null) {
      try {
        carritoSync = await sincronizarCarritoOffline(carritoService);
      } catch (_) {}
    }

    // 3. Órdenes Checkout
    if (ordenesService != null) {
      try {
        ordenesSync = await sincronizarOrdenesCheckoutPendientes(ordenesService, pagosService);
      } catch (_) {}
    }

    // 4. Pagos
    if (pagosService != null) {
      try {
        pagosSync = await sincronizarPagosPendientes(pagosService);
      } catch (_) {}
    }

    // 5. Devoluciones
    if (devolucionesService != null) {
      try {
        devolucionesSync = await sincronizarPendientes(devolucionesService);
      } catch (_) {}
    }

    return {
      'reservas': reservasSync,
      'ordenes': ordenesSync,
      'pagos': pagosSync,
      'devoluciones': devolucionesSync,
      'carrito': carritoSync,
    };
  }
}
