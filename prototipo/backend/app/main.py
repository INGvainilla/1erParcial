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

# Inicializar tablas de base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## FashionStore - API Backend Oficial (Ciclo 1)
    Plataforma inteligente de comercio electrónico omnicanal para ropa masculina con vestidores virtuales y RA.
    
    ### Casos de Uso Implementados (Ciclo 1):
    * **CU01**: Autenticar Usuario y Control de Acceso (RBAC)
    * **CU02**: Registrar Cliente (Auto-registro de clientes)
    * **CU03**: Recuperar Contraseña (Token OTP de 6 dígitos con ventana de 15 min)
    * **CU04**: Gestionar Usuarios y Roles (RBAC y Desbloqueo administrativo)
    * **CU05**: Gestionar Ciudades y Sucursales Físicas (GPS y Capacidad de probadores)
    * **CU06**: Gestionar Catálogo de Productos y Atributos de Moda (SKU, Colores HEX, Tallas, Modelo 3D)
    * **CU07**: Gestionar Temporadas y Colecciones (SS/FW y Descuentos de Liquidación)
    * **CU08**: Gestionar Proveedores Textiles (NIT único y Términos Comerciales)
    * **CU09**: Gestionar Inventario Multi-Sucursal y Costos Ponderados (Recálculo matemático de CPP y Kardex)
    * **CU10**: Consultar Catálogo y Disponibilidad por Sucursal (Omnicanal)
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
        db = SessionLocal()
        if not db.query(Usuario).first():
            print(" [STARTUP] Base de datos vacia detectada. Ejecutando siembra inicial de datos semilla...")
            seed_database()
        db.close()
    except Exception as e:
        print(f" [STARTUP] Advertencia en inicializacion automatica: {e}")


@app.get("/health", tags=["Estado del Sistema"])
def health_check():
    return {
        "status": "ONLINE",
        "sistema": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ciclo": "Ciclo 1: Fundamentos y Módulos Base",
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

