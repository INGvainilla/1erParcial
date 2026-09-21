# -*- coding: utf-8 -*-
"""
Aplicación Principal FastAPI - FashionStore Backend (Ciclo 1: Fundamentos y Módulos Base)
Integrantes: Alberto Delgado y Andy Mujica
Materia: Sistemas de Información II (SI2) - Semestre 2-2026
Docente: MSc. Ing. Angélica Garzón Cuéllar
Metodología: PUDS - UML 2.5+
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import Base, engine

# Importar todos los modelos organizados en los 10 paquetes para registro en metadata
import app.modules.p01_seguridad_acceso.auth.models
import app.modules.p02_estructura_operativa.sucursales.models
import app.modules.p03_catalogo_estilismo_ia.productos.models
import app.modules.p03_catalogo_estilismo_ia.temporadas.models
import app.modules.p04_aprovisionamiento_proveedores.proveedores.models
import app.modules.p05_inventario_costos_analitica.inventario.models
import app.modules.p06_reservas_presenciales.reservas.models
import app.modules.p07_venta_digital_fidelizacion.carrito.models
import app.modules.p07_venta_digital_fidelizacion.ordenes.models
import app.modules.p07_venta_digital_fidelizacion.gamificacion.models
import app.modules.p08_punto_venta_pos.pos.models
import app.modules.p09_procesamiento_pagos.pagos.models

# Importar enrutadores desde la arquitectura de 10 paquetes
from app.modules.p01_seguridad_acceso.auth.router import router as auth_router
from app.modules.p01_seguridad_acceso.usuarios.router import router as usuarios_router
from app.modules.p02_estructura_operativa.sucursales.router import router as sucursales_router, ciudades_router
from app.modules.p03_catalogo_estilismo_ia.productos.router import router as productos_router
from app.modules.p03_catalogo_estilismo_ia.temporadas.router import router as temporadas_router
from app.modules.p03_catalogo_estilismo_ia.catalogo.router import router as catalogo_router
from app.modules.p03_catalogo_estilismo_ia.ia_recomendaciones.router import router as recomendaciones_router
from app.modules.p04_aprovisionamiento_proveedores.proveedores.router import router as proveedores_router
from app.modules.p05_inventario_costos_analitica.inventario.router import router as inventario_router
from app.modules.p05_inventario_costos_analitica.dashboard.router import router as dashboard_router
from app.modules.p06_reservas_presenciales.reservas.router import router as reservas_router
from app.modules.p07_venta_digital_fidelizacion.carrito.router import router as carrito_router
from app.modules.p07_venta_digital_fidelizacion.ordenes.router import router as ordenes_router
from app.modules.p07_venta_digital_fidelizacion.gamificacion.router import router as gamificacion_router
from app.modules.p08_punto_venta_pos.pos.router import router as pos_router
from app.modules.p09_procesamiento_pagos.pagos.router import router as pagos_router
from app.modules.p09_procesamiento_pagos.pagos.config_router import router as config_pagos_router
from app.modules.p10_logistica_delivery.logistica.router import router as logistica_router

# Inicializar tablas de base de datos y migraciones preventivas DDL
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);"))
        conn.commit()
except Exception:
    pass

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## FashionStore - API Backend Oficial (Ciclo 3: Innovación, RA, IA, Fidelización y Post-Venta)
    Plataforma inteligente de comercio electrónico omnicanal para ropa masculina con vestidores virtuales, IA y POS.
    
    ### 25 Casos de Uso Implementados (Ciclos 1, 2 y 3):
    * **P01 Seguridad:** CU01 (Auth RBAC), CU02 (Registro), CU03 (OTP Password), CU04 (Gestión Usuarios).
    * **P02 Operativa:** CU05 (Sucursales GPS y Probadores).
    * **P03 Catálogo & IA:** CU06 (Catálogo Moda), CU07 (Temporadas), CU10 (Catálogo Omnicanal), CU19 (Vestidor Virtual RA 3D), CU20 (Comparador Outfits), CU22 (Recomendaciones IA Clima/Ocasión), CU23 (Búsqueda por Voz Semántica).
    * **P04 Proveedores:** CU08 (Proveedores Textiles y NIT).
    * **P05 Inventario & Analítica:** CU09 (Inventario Kardex CPP), CU24 (Dashboards Ejecutivos y Cuadros de Mando).
    * **P06 Reservas:** CU11 (Crear Reserva Probador), CU12 (Preparar y Atender Reserva QR), CU13 (Cancelar Reserva).
    * **P07 Venta & Fidelización:** CU14 (Checkout Digital), CU21 (Fidelización Gamificada, Puntos e Insignias).
    * **P08 POS & Devoluciones:** CU15 (Venta en Caja Mostrador), CU25 (Gestionar Devolución y Cambio de Prendas con Kardex CPP).
    * **P09 Pagos:** CU16 (Pasarela Stripe & QR), CU17 (Configuración Medios de Pago).
    * **P10 Logística:** CU18 (Despacho, Asignación Repartidor y Tracking Delivery).
    """
)

# Configuración de CORS con soporte para dominios locales y cloud (Render, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Enrutadores con prefijo /api/v1
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(ciudades_router, prefix=API_PREFIX)
app.include_router(sucursales_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(temporadas_router, prefix=API_PREFIX)
app.include_router(proveedores_router, prefix=API_PREFIX)
app.include_router(inventario_router, prefix=API_PREFIX)
app.include_router(catalogo_router, prefix=API_PREFIX)
app.include_router(reservas_router, prefix=API_PREFIX)
app.include_router(carrito_router, prefix=API_PREFIX)
app.include_router(ordenes_router, prefix=API_PREFIX)
app.include_router(pos_router, prefix=API_PREFIX)
app.include_router(pagos_router, prefix=API_PREFIX)
app.include_router(config_pagos_router, prefix=API_PREFIX)
app.include_router(logistica_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(gamificacion_router, prefix=API_PREFIX)
app.include_router(recomendaciones_router, prefix=API_PREFIX)

# Montar frontend web estático si existe (soporta distribución Angular compilada o carpeta web directa)
web_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web"))
candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web_dist")),
    "/app/web_dist",
    "/app/backend/web_dist",
    os.path.join(web_dir, "dist", "web_app", "browser"),
    os.path.join(web_dir, "dist", "web-app", "browser"),
    os.path.join(web_dir, "dist", "web", "browser"),
    os.path.join(web_dir, "dist", "browser"),
    os.path.join(web_dir, "dist"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "dist", "web_app", "browser")),
    "/app/web/dist/web_app/browser",
    "/app/prototipo/web/dist/web_app/browser",
    "/prototipo/web/dist/web_app/browser",
    web_dir
]

target_dir = None
for candidate in candidates:
    if os.path.exists(candidate) and os.path.isfile(os.path.join(candidate, "index.html")):
        target_dir = candidate
        break

if not target_dir and os.path.exists(web_dir):
    target_dir = web_dir

if target_dir:
    print(f" [FRONTEND] Servidor web montado desde: {target_dir}")
    app.mount("/app", StaticFiles(directory=target_dir, html=True), name="web_app")


@app.on_event("startup")
def startup_event():
    try:
        from app.core.database import SessionLocal
        from app.modules.p01_seguridad_acceso.auth.models import Usuario
        from app.scripts.seed_data import seed_database
        import os
        force_seed = os.getenv("FORCE_SEED", "false").lower() in ("true", "1")
        db = SessionLocal()
        if not db.query(Usuario).first() or force_seed:
            print(f" [STARTUP] Inicializando siembra de datos semilla (force_reset={force_seed})...")
            seed_database(force_reset=force_seed)
        db.close()
    except Exception as e:
        print(f" [STARTUP] Advertencia en inicializacion automatica: {e}")


@app.get("/health", tags=["Estado del Sistema"])
def health_check():
    return {
        "status": "ONLINE",
        "sistema": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ciclo": "Ciclo 3: Innovación, Realidad Aumentada, IA, Gamificación y Devoluciones (CU25)",
        "casos_de_uso_activos": 25,
        "desarrolladores": ["Alberto Delgado", "Andy Mujica"],
        "materia": "Sistemas de Información II (SI2) - 2-2026"
    }

@app.get("/", tags=["Estado del Sistema"])
def root_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/app/")

@app.get("/app", tags=["Estado del Sistema"])
def app_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/app/")

