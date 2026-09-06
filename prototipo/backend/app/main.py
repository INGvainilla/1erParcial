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

# Importar todos los modelos para registro en metadata
import app.modules.auth.models
import app.modules.sucursales.models
import app.modules.proveedores.models
import app.modules.temporadas.models
import app.modules.productos.models
import app.modules.inventario.models

# Importar enrutadores
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.sucursales.router import router as sucursales_router, ciudades_router
from app.modules.productos.router import router as productos_router
from app.modules.temporadas.router import router as temporadas_router
from app.modules.proveedores.router import router as proveedores_router
from app.modules.inventario.router import router as inventario_router
from app.modules.catalogo.router import router as catalogo_router

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

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        from app.modules.auth.models import Usuario
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
