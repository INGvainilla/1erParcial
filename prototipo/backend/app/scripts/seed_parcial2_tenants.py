# -*- coding: utf-8 -*-
"""
Script de Migración y Población de Datos para el Segundo Parcial (CU01 al CU07):
1. Crea tablas de planes_suscripcion, empresas, suscripciones.
2. Agrega columnas id_empresa, medidas_antropometricas, composicion_textil, codigo_hex_secundario.
3. Siembra los planes Básico y Profesional, y las empresas piloto.
4. Vincula todos los datos existentes (sucursales, usuarios, productos, inventario) a la Empresa #1 (FashionStore).
5. Crea el usuario SUPER_ADMIN de la plataforma SaaS.
6. Pobla las medidas antropométricas en cm y composición textil para CU06.

Ahora es un envoltorio delgado: la lógica vive en `app.core.migrations` (columnas portables
PostgreSQL/SQLite) y `app.scripts.bootstrap_tenants` (siembra idempotente), que además se
ejecutan automáticamente al arrancar la aplicación. Uso por CLI sin cambios:
    python -m app.scripts.seed_parcial2_tenants
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import Base, engine
import app.main  # Asegura que todos los modelos de los 10 paquetes estén registrados en SQLAlchemy
from app.core.migrations import ensure_columns
from app.scripts.bootstrap_tenants import bootstrap_tenants


def migrar_y_poblar_parcial2():
    print("=== [PARCIAL 2] INICIANDO MIGRACIÓN DDL Y SIEMBRA MULTITENANT ===")

    aplicados = ensure_columns(engine)
    print(f"[OK] Migraciones DDL ejecutadas ({len(aplicados)} columnas agregadas).")

    Base.metadata.create_all(bind=engine)
    print("[OK] Tablas de modelos Base sincronizadas.")

    resumen = bootstrap_tenants(vincular_huerfanos=True)
    print(f"[OK] Siembra multitenant completada: {resumen}")
    print("=== [PARCIAL 2] SIEMBRA Y MIGRACIÓN COMPLETADA EXITOSAMENTE ===")


if __name__ == "__main__":
    migrar_y_poblar_parcial2()
