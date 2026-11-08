# -*- coding: utf-8 -*-
"""
Migraciones ligeras e idempotentes (PostgreSQL y SQLite).
Cubre tablas y columnas requeridas para el Parcial 2 (CU08 al CU15).
"""
import logging
from typing import List, Tuple

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger("fashionstore.migrations")

# (tabla, columna, tipo SQL portable)
COLUMNAS_PARCIAL2: List[Tuple[str, str, str]] = [
    ("producto_tallas", "precio", "NUMERIC(10, 2)"),
    ("producto_tallas", "medidas_cm", "VARCHAR(150)"),
    ("usuarios", "id_empresa", "INTEGER"),
    ("sucursales", "id_empresa", "INTEGER"),
    ("productos", "id_empresa", "INTEGER"),
    ("productos", "medidas_antropometricas", "TEXT"),
    ("productos", "composicion_textil", "VARCHAR(150)"),
    ("producto_colores", "codigo_hex_secundario", "VARCHAR(10)"),
    ("inventario", "id_empresa", "INTEGER"),
    ("traspasos_inter_sucursal", "observaciones", "TEXT"),
]

# (nombre del índice, tabla, columna). `CREATE INDEX IF NOT EXISTS` es válido en ambos motores.
INDICES_PARCIAL2: List[Tuple[str, str, str]] = [
    ("ix_usuarios_id_empresa", "usuarios", "id_empresa"),
    ("ix_sucursales_id_empresa", "sucursales", "id_empresa"),
    ("ix_productos_id_empresa", "productos", "id_empresa"),
    ("ix_inventario_id_empresa", "inventario", "id_empresa"),
]


def ensure_columns(engine: Engine) -> List[str]:
    """
    Crea tablas y agrega columnas necesarias para el Parcial 2 (CU08 al CU15).
    Portable tanto para SQLite local como PostgreSQL de producción.
    Idempotente: ejecutarla varias veces no produce errores ni cambios adicionales.
    """
    aplicados: List[str] = []
    inspector = inspect(engine)

    # 1. Crear tablas esenciales para el 2do Parcial si no existen
    is_sqlite = engine.dialect.name == "sqlite"
    id_col_type = "INTEGER PRIMARY KEY AUTOINCREMENT" if is_sqlite else "SERIAL PRIMARY KEY"

    with engine.begin() as conn:
        if not inspector.has_table("operaciones_offline_sync"):
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS operaciones_offline_sync (
                    id_operacion {id_col_type},
                    uuid_operacion VARCHAR(64) UNIQUE NOT NULL,
                    id_empresa INTEGER NOT NULL,
                    id_sucursal INTEGER NOT NULL,
                    tipo_operacion VARCHAR(50) NOT NULL,
                    payload_json TEXT NOT NULL,
                    hash_sha256 VARCHAR(64),
                    estado_sync VARCHAR(30) DEFAULT 'CONFIRMADA',
                    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            aplicados.append("create_table.operaciones_offline_sync")
            print(" [MIGRACION] Tabla creada: operaciones_offline_sync")

        if not inspector.has_table("traspasos_inter_sucursal"):
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS traspasos_inter_sucursal (
                    id_traspaso {id_col_type},
                    codigo_traspaso VARCHAR(64) UNIQUE NOT NULL,
                    id_empresa INTEGER NOT NULL,
                    id_sucursal_origen INTEGER NOT NULL,
                    id_sucursal_destino INTEGER NOT NULL,
                    id_usuario_solicita INTEGER,
                    id_usuario_recibe INTEGER,
                    estado VARCHAR(30) DEFAULT 'EN_TRANSITO',
                    detalles_json TEXT NOT NULL,
                    observaciones TEXT,
                    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_recepcion TIMESTAMP
                )
            """))
            aplicados.append("create_table.traspasos_inter_sucursal")
            print(" [MIGRACION] Tabla creada: traspasos_inter_sucursal")

        if not inspector.has_table("ordenes_compra_desktop"):
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS ordenes_compra_desktop (
                    id_orden_compra {id_col_type},
                    codigo_orden VARCHAR(64) UNIQUE NOT NULL,
                    id_empresa INTEGER NOT NULL,
                    id_proveedor INTEGER NOT NULL,
                    id_sucursal_destino INTEGER NOT NULL,
                    id_usuario INTEGER,
                    monto_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
                    subtotal NUMERIC(12, 2) DEFAULT 0.00,
                    iva NUMERIC(12, 2) DEFAULT 0.00,
                    total_con_iva NUMERIC(12, 2) DEFAULT 0.00,
                    estado VARCHAR(30) DEFAULT 'EMITIDA',
                    user_agent VARCHAR(255),
                    ip_origen VARCHAR(64),
                    detalles_json TEXT NOT NULL,
                    observaciones TEXT,
                    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_aprobacion TIMESTAMP,
                    id_usuario_aprueba INTEGER,
                    fecha_recepcion TIMESTAMP,
                    id_usuario_recepcion INTEGER,
                    nro_factura VARCHAR(64),
                    discrepancias_json TEXT
                )
            """))
            aplicados.append("create_table.ordenes_compra_desktop")
            print(" [MIGRACION] Tabla creada: ordenes_compra_desktop")

    # Refrescar inspector
    inspector = inspect(engine)

    for tabla, columna, tipo in COLUMNAS_PARCIAL2:
        if not inspector.has_table(tabla):
            continue
        existentes = {c["name"] for c in inspector.get_columns(tabla)}
        if columna in existentes:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(f'ALTER TABLE {tabla} ADD COLUMN {columna} {tipo}'))
            aplicados.append(f"{tabla}.{columna}")
            logger.warning("[MIGRACION] Columna agregada: %s.%s %s", tabla, columna, tipo)
            print(f" [MIGRACION] Columna agregada: {tabla}.{columna} {tipo}")
        except Exception as exc:  # no ocultar: registrar y continuar con el resto
            logger.error("[MIGRACION] No se pudo agregar %s.%s: %s", tabla, columna, exc)
            print(f" [MIGRACION] ERROR agregando {tabla}.{columna}: {exc}")

    # Refrescar la caché del inspector para que los índices vean las columnas nuevas
    inspector = inspect(engine)
    for nombre, tabla, columna in INDICES_PARCIAL2:
        if not inspector.has_table(tabla):
            continue
        if columna not in {c["name"] for c in inspector.get_columns(tabla)}:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(f'CREATE INDEX IF NOT EXISTS {nombre} ON {tabla} ({columna})'))
        except Exception as exc:
            logger.error("[MIGRACION] No se pudo crear el índice %s: %s", nombre, exc)
            print(f" [MIGRACION] ERROR creando índice {nombre}: {exc}")

    return aplicados
