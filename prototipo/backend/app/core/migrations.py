# -*- coding: utf-8 -*-
"""
Migraciones ligeras e idempotentes (PostgreSQL y SQLite).

Sustituye a los bloques `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` envueltos en
`try/except: pass`: esa sintaxis solo existe en PostgreSQL, así que en SQLite fallaba
en silencio y dejaba el esquema viejo (error `no such column: usuarios.id_empresa`).

Aquí se inspecciona el esquema real con `sqlalchemy.inspect`, se agregan solo las
columnas que faltan y CUALQUIER fallo se registra en lugar de ocultarse.
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
    Agrega las columnas multitenant/textiles que falten en tablas YA existentes.
    Las tablas inexistentes se omiten: `Base.metadata.create_all` las creará completas.

    Idempotente: ejecutarla varias veces no produce errores ni cambios adicionales.
    Retorna la lista de cambios aplicados (útil para pruebas y bitácora).
    """
    aplicados: List[str] = []
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
