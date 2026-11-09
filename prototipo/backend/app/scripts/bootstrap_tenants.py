# -*- coding: utf-8 -*-
"""
Bootstrap idempotente de la plataforma SaaS multitenant (CU01 al CU07).

Crea y sincroniza, SOLO si no existen:
- Planes de suscripción SaaS (Básico, Profesional).
- Ecosistema multitenant representativo (6 Empresas Arrendatarias activas):
    1. FashionStore (NIT 1029384756, Santa Cruz - Plan Profesional)
    2. Elegance Men (NIT 2039485761, La Paz - Plan Básico)
    3. Sartoria Italiana (NIT 3049586712, Sucre / Tarija - Plan Profesional)
    4. UrbanStyle Cochabamba (NIT 4059687823, Cochabamba - Plan Básico)
    5. Andina Luxury Alpaca (NIT 5069798934, La Paz / Santa Cruz - Plan Profesional)
    6. Casual & Denim Co. (NIT 6079809045, Santa Cruz - Plan Básico)
- Sucursales físicas con geolocalización real en Bolivia y capacidad de probadores.
- Cuentas de usuarios Administrador y Cajero para cada tenant.
- Catálogo de prendas exclusivas por marca con tallas, colores e inventario inicial valorado en CPP.
- Atributos textiles (CU06) y verificación de CPP (CU07).

Es 100% idempotente y seguro de ejecutar en cada arranque.
"""
import json
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, Optional, Tuple

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, Base, engine
from app.core.migrations import ensure_columns
from app.core.security import get_password_hash

# Registro completo de modelos SQLAlchemy
import app.modules.p01_seguridad_acceso.tenants.models
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

from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.tenants.models import Empresa, PlanSuscripcion, SuscripcionEmpresa
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal, Ciudad
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, ProductoColor, ProductoTalla, Categoria, Marca
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario

# Límites de cuotas SaaS acordes a especificación §9.4
MAX_SUCURSALES_BASICO = 2
MAX_SUCURSALES_PROFESIONAL = 10
MAX_SUCURSALES_PROFESIONAL_LEGADO = 5

GUIA_MEDIDAS = {
    "S": {"pecho_cm": 96, "cintura_cm": 82, "cadera_cm": 94, "manga_cm": 62, "cuello_cm": 38, "largo_cm": 72},
    "M": {"pecho_cm": 104, "cintura_cm": 90, "cadera_cm": 102, "manga_cm": 64, "cuello_cm": 40, "largo_cm": 74},
    "L": {"pecho_cm": 112, "cintura_cm": 98, "cadera_cm": 110, "manga_cm": 66, "cuello_cm": 42, "largo_cm": 76},
    "XL": {"pecho_cm": 120, "cintura_cm": 106, "cadera_cm": 118, "manga_cm": 68, "cuello_cm": 44, "largo_cm": 78},
    "38": {"pecho_cm": 98, "cintura_cm": 84, "cadera_cm": 96, "manga_cm": 63, "cuello_cm": 38, "largo_cm": 73},
    "39": {"pecho_cm": 102, "cintura_cm": 88, "cadera_cm": 100, "manga_cm": 64, "cuello_cm": 39, "largo_cm": 74},
    "40": {"pecho_cm": 106, "cintura_cm": 92, "cadera_cm": 104, "manga_cm": 65, "cuello_cm": 40, "largo_cm": 75},
    "42": {"pecho_cm": 114, "cintura_cm": 100, "cadera_cm": 112, "manga_cm": 67, "cuello_cm": 42, "largo_cm": 77},
}

# Ecosistema Representativo de Empresas Arrendatarias (Tenants)
TENANT_SPECS = [
    {
        "nit": "1029384756",
        "razon_social": "FashionStore Bolivia S.R.L.",
        "nombre_comercial": "FashionStore",
        "dominio_slug": "fashionstore-scz",
        "schema_name": "tenant_fashionstore_scz",
        "email_contacto": "gerencia@fashionstore.bo",
        "telefono": "+591 3 3445566",
        "direccion": "Av. San Martín #450, Equipetrol, Santa Cruz",
        "logo_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
        "presupuesto_disponible": Decimal("75000.00"),
        "plan_codigo": "PLAN_PRO",
        "admin": {
            "email": "alberto.delgado@store.bo",
            "nombres": "Alberto",
            "apellidos": "Delgado",
            "password": "Admin123*",
            "rol": "ADMINISTRADOR"
        },
        "sucursales": [],  # Creadas en seed_data inicial
        "prendas": []
    },
    {
        "nit": "2039485761",
        "razon_social": "Textiles Elegance S.A.",
        "nombre_comercial": "Elegance Men",
        "dominio_slug": "elegance-men",
        "schema_name": "tenant_elegance_men",
        "email_contacto": "contacto@elegance.bo",
        "telefono": "+591 2 2789012",
        "direccion": "Av. Montenegro #890, San Miguel, La Paz",
        "logo_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
        "presupuesto_disponible": Decimal("45000.00"),
        "plan_codigo": "PLAN_BASICO",
        "admin": {
            "email": "admin@elegance.bo",
            "nombres": "Carlos",
            "apellidos": "Elegance Admin",
            "password": "Elegance123*",
            "rol": "ADMINISTRADOR"
        },
        "cajero": {
            "email": "cajero@elegance.bo",
            "nombres": "Marco",
            "apellidos": "Vargas Cajero",
            "password": "Cajero123*",
            "rol": "CAJERO"
        },
        "sucursales": [
            {
                "nombre": "Sucursal San Miguel (Elegance)",
                "ciudad": "La Paz",
                "direccion": "Av. Montenegro #890, San Miguel",
                "lat": Decimal("-16.541200"),
                "lon": Decimal("-68.082300"),
                "tel": "+591 2 2789012",
                "probadores": 4
            },
            {
                "nombre": "Sucursal Las Brisas (Elegance)",
                "ciudad": "Santa Cruz",
                "direccion": "Centro Comercial Las Brisas, Nivel 2",
                "lat": Decimal("-17.761200"),
                "lon": Decimal("-63.182300"),
                "tel": "+591 3 3456789",
                "probadores": 5
            }
        ],
        "prendas": [
            {
                "sku": "ELEG-TRAJE-001",
                "nombre": "Traje Dos Piezas Slim Fit Gris Oxford",
                "descripcion": "Traje ejecutivo confeccionado en mezcla de lana virgen y seda, solapa muesca.",
                "precio": Decimal("1450.00"),
                "categoria_nombre": "Trajes y Blazers",
                "marca_nombre": "Urban Tailor",
                "imagen": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
                "composicion": "70% Lana Virgen, 30% Seda Natural",
                "colores": [("Gris Oxford", "#3E444A")],
                "tallas": ["38", "40", "42"]
            },
            {
                "sku": "ELEG-CAMISA-002",
                "nombre": "Camisa Cuello Francés Blanca Elegance",
                "descripcion": "Camisa de vestir blanca en popelina de algodón de doble cabo con botones de madreperla.",
                "precio": Decimal("320.00"),
                "categoria_nombre": "Camisas Formales",
                "marca_nombre": "Oxford Heritage",
                "imagen": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
                "composicion": "100% Algodón Egipcio Giza 45",
                "colores": [("Blanco Óptico", "#FFFFFF")],
                "tallas": ["S", "M", "L", "XL"]
            }
        ]
    },
    {
        "nit": "3049586712",
        "razon_social": "Sartoria Italiana de Bolivia S.A.",
        "nombre_comercial": "Sartoria Italiana",
        "dominio_slug": "sartoria-italiana",
        "schema_name": "tenant_sartoria_bo",
        "email_contacto": "contacto@sartoria.bo",
        "telefono": "+591 4 6451234",
        "direccion": "Calle Calvo #120, Plaza 25 de Mayo, Sucre",
        "logo_url": "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=300",
        "presupuesto_disponible": Decimal("95000.00"),
        "plan_codigo": "PLAN_PRO",
        "admin": {
            "email": "admin@sartoria.bo",
            "nombres": "Giovanni",
            "apellidos": "Rossi Sartor",
            "password": "Sartoria123*",
            "rol": "ADMINISTRADOR"
        },
        "cajero": {
            "email": "cajero@sartoria.bo",
            "nombres": "Paola",
            "apellidos": "Mendoza Sucre",
            "password": "Cajero123*",
            "rol": "CAJERO"
        },
        "sucursales": [
            {
                "nombre": "Sucursal Sucre Colonial (Sartoria)",
                "ciudad": "La Paz",
                "direccion": "Calle Calvo #120, Casco Histórico, Sucre",
                "lat": Decimal("-19.047500"),
                "lon": Decimal("-65.259700"),
                "tel": "+591 4 6451234",
                "probadores": 4
            },
            {
                "nombre": "Sucursal Tarija Centro (Sartoria)",
                "ciudad": "Santa Cruz",
                "direccion": "Calle General Trigo #450, Tarija",
                "lat": Decimal("-21.535500"),
                "lon": Decimal("-64.729600"),
                "tel": "+591 4 6645678",
                "probadores": 3
            }
        ],
        "prendas": [
            {
                "sku": "SART-SMOK-001",
                "nombre": "Smoking Solapa Chal Lujo Negro",
                "descripcion": "Smoking ceremonial de corte italiano artesanal con solapa chal en satén de seda pura.",
                "precio": Decimal("2200.00"),
                "categoria_nombre": "Trajes y Blazers",
                "marca_nombre": "Sartorial Milano",
                "imagen": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
                "composicion": "85% Lana Super 150s, 15% Seda Mulberry",
                "colores": [("Negro Ceremonial", "#0A0A0A")],
                "tallas": ["38", "40", "42"]
            },
            {
                "sku": "SART-BLAZ-002",
                "nombre": "Blazer Desestructurado Lino Azul Navy",
                "descripcion": "Blazer ligero de verano confeccionado en lino italiano transpirable sin forro.",
                "precio": Decimal("890.00"),
                "categoria_nombre": "Trajes y Blazers",
                "marca_nombre": "Sartorial Milano",
                "imagen": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
                "composicion": "100% Lino Italiano de Biella",
                "colores": [("Azul Navy", "#1A2B4C")],
                "tallas": ["M", "L", "XL"]
            }
        ]
    },
    {
        "nit": "4059687823",
        "razon_social": "UrbanStyle Streetwear Bolivia S.R.L.",
        "nombre_comercial": "UrbanStyle Cochabamba",
        "dominio_slug": "urbanstyle-cbba",
        "schema_name": "tenant_urbanstyle_cbba",
        "email_contacto": "contacto@urbanstyle.bo",
        "telefono": "+591 4 4256789",
        "direccion": "Av. América #850, Zona Norte, Cochabamba",
        "logo_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300",
        "presupuesto_disponible": Decimal("52000.00"),
        "plan_codigo": "PLAN_BASICO",
        "admin": {
            "email": "admin@urbanstyle.bo",
            "nombres": "Mateo",
            "apellidos": "Quispe Urban",
            "password": "UrbanStyle123*",
            "rol": "ADMINISTRADOR"
        },
        "cajero": {
            "email": "cajero@urbanstyle.bo",
            "nombres": "Lucía",
            "apellidos": "Fernández CBBA",
            "password": "Cajero123*",
            "rol": "CAJERO"
        },
        "sucursales": [
            {
                "nombre": "Sucursal Cine Center (UrbanStyle)",
                "ciudad": "Cochabamba",
                "direccion": "Av. Ramón Rivero, CC Cine Center Local 14",
                "lat": Decimal("-17.382400"),
                "lon": Decimal("-66.155800"),
                "tel": "+591 4 4256789",
                "probadores": 4
            },
            {
                "nombre": "Sucursal América Norte (UrbanStyle)",
                "ciudad": "Cochabamba",
                "direccion": "Av. América #850, Zona Norte",
                "lat": Decimal("-17.375600"),
                "lon": Decimal("-66.158900"),
                "tel": "+591 4 4458912",
                "probadores": 3
            }
        ],
        "prendas": [
            {
                "sku": "URBN-HOOD-001",
                "nombre": "Hoodie Oversize French Terry Noir",
                "descripcion": "Polerón urbano de gramaje pesado 450 GSM con capucha forrada y bolsillo canguro.",
                "precio": Decimal("380.00"),
                "categoria_nombre": "Camisas Formales",
                "marca_nombre": "Urban Tailor",
                "imagen": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
                "composicion": "100% Algodón Cardado Peinado",
                "colores": [("Noir Urbano", "#1E1E1E")],
                "tallas": ["S", "M", "L", "XL"]
            },
            {
                "sku": "URBN-CARG-002",
                "nombre": "Pantalón Cargo Tactical Denim",
                "descripcion": "Pantalón cargo relaxed fit con 6 bolsillos utilitarios y costuras reforzadas.",
                "precio": Decimal("420.00"),
                "categoria_nombre": "Pantalones Casuales",
                "marca_nombre": "Urban Tailor",
                "imagen": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
                "composicion": "98% Algodón Denim Ring-Spun, 2% Elastano",
                "colores": [("Gris Asfalto", "#4A5568")],
                "tallas": ["38", "40", "42"]
            }
        ]
    },
    {
        "nit": "5069798934",
        "razon_social": "Corporación Textil Andina Luxury S.A.",
        "nombre_comercial": "Andina Luxury Alpaca",
        "dominio_slug": "andina-luxury",
        "schema_name": "tenant_andina_luxury",
        "email_contacto": "contacto@andinaluxury.bo",
        "telefono": "+591 2 2781122",
        "direccion": "Av. Ballivián #1100, Calacoto, La Paz",
        "logo_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300",
        "presupuesto_disponible": Decimal("140000.00"),
        "plan_codigo": "PLAN_PRO",
        "admin": {
            "email": "admin@andinaluxury.bo",
            "nombres": "Rodrigo",
            "apellidos": "Camacho Alpaca",
            "password": "Andina123*",
            "rol": "ADMINISTRADOR"
        },
        "cajero": {
            "email": "cajero@andinaluxury.bo",
            "nombres": "Elena",
            "apellidos": "Vallejos Alpaca",
            "password": "Cajero123*",
            "rol": "CAJERO"
        },
        "sucursales": [
            {
                "nombre": "Sucursal Calacoto High-End (Andina)",
                "ciudad": "La Paz",
                "direccion": "Av. Ballivián #1100, Calacoto",
                "lat": Decimal("-16.539800"),
                "lon": Decimal("-68.086500"),
                "tel": "+591 2 2781122",
                "probadores": 4
            },
            {
                "nombre": "Sucursal Los Tajibos (Andina)",
                "ciudad": "Santa Cruz",
                "direccion": "Av. San Martín #455, Galería Los Tajibos",
                "lat": Decimal("-17.765000"),
                "lon": Decimal("-63.195000"),
                "tel": "+591 3 3421234",
                "probadores": 4
            }
        ],
        "prendas": [
            {
                "sku": "ANDI-ABRI-001",
                "nombre": "Abrigo Imperial 100% Baby Alpaca Camel",
                "descripcion": "Abrigo tres cuartos en fibra virgen de baby alpaca de primer esquileo. Suavidad térmica inigualable.",
                "precio": Decimal("2850.00"),
                "categoria_nombre": "Trajes y Blazers",
                "marca_nombre": "Sartorial Milano",
                "imagen": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
                "composicion": "100% Baby Alpaca Boliviana Certificada",
                "colores": [("Camel Andino", "#C19A6B")],
                "tallas": ["M", "L", "XL"]
            },
            {
                "sku": "ANDI-BUFA-002",
                "nombre": "Bufanda Telar Andino Gris Perla",
                "descripcion": "Bufanda tejida a telar tradicional con flecos finos en hilado fino de alpaca.",
                "precio": Decimal("490.00"),
                "categoria_nombre": "Pantalones Casuales",
                "marca_nombre": "Oxford Heritage",
                "imagen": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
                "composicion": "100% Alpaca Superfine",
                "colores": [("Gris Perla", "#D3D3D3")],
                "tallas": ["M"]
            }
        ]
    },
    {
        "nit": "6079809045",
        "razon_social": "Casual & Denim Indumentaria S.R.L.",
        "nombre_comercial": "Casual & Denim",
        "dominio_slug": "casual-denim",
        "schema_name": "tenant_casual_denim",
        "email_contacto": "contacto@casualdenim.bo",
        "telefono": "+591 3 3429988",
        "direccion": "Centro Comercial Ventura Mall, Local 120, Santa Cruz",
        "logo_url": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300",
        "presupuesto_disponible": Decimal("38000.00"),
        "plan_codigo": "PLAN_BASICO",
        "admin": {
            "email": "admin@casualdenim.bo",
            "nombres": "Daniel",
            "apellidos": "Soliz Casual",
            "password": "Casual123*",
            "rol": "ADMINISTRADOR"
        },
        "cajero": {
            "email": "cajero@casualdenim.bo",
            "nombres": "Valeria",
            "apellidos": "Rios Casual",
            "password": "Cajero123*",
            "rol": "CAJERO"
        },
        "sucursales": [
            {
                "nombre": "Sucursal Ventura Mall (Casual & Denim)",
                "ciudad": "Santa Cruz",
                "direccion": "4to Anillo y Av. San Martín, CC Ventura Mall Local 120",
                "lat": Decimal("-17.755000"),
                "lon": Decimal("-63.198000"),
                "tel": "+591 3 3429988",
                "probadores": 3
            }
        ],
        "prendas": [
            {
                "sku": "CASU-CHIN-001",
                "nombre": "Pantalón Chino Smart Stretch Khaki",
                "descripcion": "Chino versátil para oficina y fin de semana con tecnología confort stretch.",
                "precio": Decimal("295.00"),
                "categoria_nombre": "Pantalones Casuales",
                "marca_nombre": "Urban Tailor",
                "imagen": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
                "composicion": "97% Algodón Twill, 3% Elastano",
                "colores": [("Khaki Arena", "#C3B091")],
                "tallas": ["38", "40", "42"]
            },
            {
                "sku": "CASU-POLO-002",
                "nombre": "Polo Piqué Algodón Pima Marino",
                "descripcion": "Polo clásico cuello camisero con tapeta de dos botones de nácar genuino.",
                "precio": Decimal("240.00"),
                "categoria_nombre": "Camisas Formales",
                "marca_nombre": "Oxford Heritage",
                "imagen": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
                "composicion": "100% Algodón Pima Piqué",
                "colores": [("Azul Marino Profundo", "#102A43")],
                "tallas": ["S", "M", "L", "XL"]
            }
        ]
    }
]


def _resolver_ciudad(db: Session, nombre_ciudad: str) -> int:
    """Busca o crea la ciudad para asociar a la sucursal."""
    c = db.query(Ciudad).filter(Ciudad.nombre_ciudad.ilike(f"%{nombre_ciudad}%")).first()
    if not c:
        c = Ciudad(nombre_ciudad=nombre_ciudad, departamento=nombre_ciudad)
        db.add(c)
        db.flush()
    return c.id_ciudad


def _resolver_categoria(db: Session, nombre_cat: str) -> int:
    """Obtiene o crea la categoría para el producto."""
    cat = db.query(Categoria).filter(Categoria.nombre_categoria.ilike(f"%{nombre_cat}%")).first()
    if not cat:
        cat = Categoria(nombre_categoria=nombre_cat, descripcion=f"Prendas de la línea {nombre_cat}")
        db.add(cat)
        db.flush()
    return cat.id_categoria


def _resolver_marca(db: Session, nombre_marca: str) -> int:
    """Obtiene o crea la marca textil."""
    m = db.query(Marca).filter(Marca.nombre_marca.ilike(f"%{nombre_marca}%")).first()
    if not m:
        m = Marca(nombre_marca=nombre_marca)
        db.add(m)
        db.flush()
    return m.id_marca


def _sembrar_planes(db: Session, resumen: Dict) -> Tuple[PlanSuscripcion, PlanSuscripcion]:
    """CU02: Planes de Suscripción SaaS Básico y Profesional."""
    plan_basico = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_BASICO").first()
    if not plan_basico:
        plan_basico = PlanSuscripcion(
            nombre="Básico", codigo="PLAN_BASICO",
            max_sucursales=MAX_SUCURSALES_BASICO, max_usuarios=10,
            permite_reportes_ia=True, permite_ml_dashboard=True, soporta_offline=True,
            precio_mensual=Decimal("99.00"), estado="ACTIVO",
            descripcion="Plan esencial para pequeñas boutiques textiles con hasta 2 sucursales y operación offline."
        )
        db.add(plan_basico)
        resumen["planes_creados"] += 1

    plan_pro = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_PRO").first()
    if not plan_pro:
        plan_pro = PlanSuscripcion(
            nombre="Profesional", codigo="PLAN_PRO",
            max_sucursales=MAX_SUCURSALES_PROFESIONAL, max_usuarios=25,
            permite_reportes_ia=True, permite_ml_dashboard=True, soporta_offline=True,
            precio_mensual=Decimal("199.00"), estado="ACTIVO",
            descripcion="Plan integral con hasta 10 sucursales, reportes generativos con IA y dashboards de Machine Learning."
        )
        db.add(plan_pro)
        resumen["planes_creados"] += 1
    elif plan_pro.max_sucursales == MAX_SUCURSALES_PROFESIONAL_LEGADO:
        plan_pro.max_sucursales = MAX_SUCURSALES_PROFESIONAL
        resumen["planes_reconciliados"] += 1

    db.commit()
    db.refresh(plan_basico)
    db.refresh(plan_pro)
    return plan_basico, plan_pro


def _sembrar_ecosistema_tenants(db: Session, plan_basico: PlanSuscripcion, plan_pro: PlanSuscripcion, resumen: Dict) -> Empresa:
    """Siembra completa e idempotente del ecosistema de 6 tenants."""
    planes_map = {
        "PLAN_BASICO": plan_basico,
        "PLAN_PRO": plan_pro
    }

    emp1 = None

    for spec in TENANT_SPECS:
        emp = db.query(Empresa).filter(Empresa.nit == spec["nit"]).first()
        nueva_empresa = False
        if not emp:
            emp = Empresa(
                nit=spec["nit"],
                razon_social=spec["razon_social"],
                nombre_comercial=spec["nombre_comercial"],
                dominio_slug=spec["dominio_slug"],
                schema_name=spec["schema_name"],
                email_contacto=spec["email_contacto"],
                telefono=spec["telefono"],
                direccion=spec["direccion"],
                logo_url=spec["logo_url"],
                presupuesto_disponible=spec["presupuesto_disponible"],
                estado="ACTIVA"
            )
            db.add(emp)
            db.flush()
            nueva_empresa = True
            resumen["empresas_creadas"] += 1

        if spec["nit"] == "1029384756":
            emp1 = emp

        # Suscripción Activa
        susc = db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == emp.id_empresa).first()
        if not susc:
            plan_obj = planes_map.get(spec["plan_codigo"], plan_pro)
            db.add(SuscripcionEmpresa(
                id_empresa=emp.id_empresa,
                id_plan=plan_obj.id_plan,
                fecha_inicio=date.today() - timedelta(days=15),
                fecha_vencimiento=date.today() + timedelta(days=350),
                estado="ACTIVA",
                auto_renovar=True
            ))
            resumen["suscripciones_creadas"] += 1

        # Sucursales
        sucursales_db = []
        for s_spec in spec.get("sucursales", []):
            s_exist = db.query(Sucursal).filter(
                Sucursal.id_empresa == emp.id_empresa,
                Sucursal.nombre_sucursal == s_spec["nombre"]
            ).first()
            if not s_exist:
                id_ciudad = _resolver_ciudad(db, s_spec["ciudad"])
                s_exist = Sucursal(
                    id_empresa=emp.id_empresa,
                    id_ciudad=id_ciudad,
                    nombre_sucursal=s_spec["nombre"],
                    direccion=s_spec["direccion"],
                    latitud=s_spec["lat"],
                    longitud=s_spec["lon"],
                    telefono=s_spec["tel"],
                    capacidad_probadores=s_spec.get("probadores", 4),
                    horario_apertura="09:00",
                    horario_cierre="21:00",
                    estado="OPERATIVA"
                )
                db.add(s_exist)
                db.flush()
                resumen.setdefault("sucursales_creadas", 0)
                resumen["sucursales_creadas"] += 1
            sucursales_db.append(s_exist)

        primera_sucursal_id = sucursales_db[0].id_sucursal if sucursales_db else None

        # Usuario Administrador de Tenant
        admin_data = spec.get("admin")
        if admin_data and not db.query(Usuario).filter(Usuario.email == admin_data["email"]).first():
            db.add(Usuario(
                id_empresa=emp.id_empresa,
                nombres=admin_data["nombres"],
                apellidos=admin_data["apellidos"],
                email=admin_data["email"],
                password_hash=get_password_hash(admin_data["password"]),
                telefono=spec["telefono"],
                rol="ADMINISTRADOR",
                id_sucursal=primera_sucursal_id,
                estado_cuenta="ACTIVO"
            ))
            resumen["usuarios_creados"] += 1

        # Usuario Cajero de Tenant
        cajero_data = spec.get("cajero")
        if cajero_data and not db.query(Usuario).filter(Usuario.email == cajero_data["email"]).first():
            db.add(Usuario(
                id_empresa=emp.id_empresa,
                nombres=cajero_data["nombres"],
                apellidos=cajero_data["apellidos"],
                email=cajero_data["email"],
                password_hash=get_password_hash(cajero_data["password"]),
                telefono=spec["telefono"],
                rol="CAJERO",
                id_sucursal=primera_sucursal_id,
                estado_cuenta="ACTIVO"
            ))
            resumen["usuarios_creados"] += 1

        # Prendas y Catálogo Exclusivo del Tenant
        for p_spec in spec.get("prendas", []):
            prod = db.query(Producto).filter(Producto.codigo_sku_base == p_spec["sku"]).first()
            if not prod:
                id_cat = _resolver_categoria(db, p_spec["categoria_nombre"])
                id_mrc = _resolver_marca(db, p_spec["marca_nombre"])
                prod = Producto(
                    id_empresa=emp.id_empresa,
                    id_categoria=id_cat,
                    id_marca=id_mrc,
                    codigo_sku_base=p_spec["sku"],
                    nombre=p_spec["nombre"],
                    descripcion=p_spec["descripcion"],
                    precio_base=p_spec["precio"],
                    imagen_principal=p_spec["imagen"],
                    composicion_textil=p_spec["composicion"],
                    medidas_antropometricas=json.dumps(GUIA_MEDIDAS, ensure_ascii=False),
                    estado="PUBLICADO"
                )
                db.add(prod)
                db.flush()
                resumen.setdefault("productos_creados", 0)
                resumen["productos_creados"] += 1

                # Colores
                for c_nom, c_hex in p_spec.get("colores", [("Único", "#000000")]):
                    db.add(ProductoColor(
                        id_producto=prod.id_producto,
                        color_nombre=c_nom,
                        codigo_hex=c_hex,
                        codigo_hex_secundario="#FFFFFF"
                    ))

                # Tallas
                for t_val in p_spec.get("tallas", ["M", "L"]):
                    m = GUIA_MEDIDAS.get(t_val, GUIA_MEDIDAS["M"])
                    db.add(ProductoTalla(
                        id_producto=prod.id_producto,
                        talla=t_val,
                        precio=p_spec["precio"],
                        medidas_cm=f"Pecho {m['pecho_cm']}cm, Cintura {m['cintura_cm']}cm, Largo {m['largo_cm']}cm"
                    ))

                # Inventario inicial en cada sucursal del tenant
                costo_base = Decimal(str(float(p_spec["precio"]) * 0.55)).quantize(Decimal("0.01"))
                for s_obj in sucursales_db:
                    for t_val in p_spec.get("tallas", ["M"]):
                        col_nom = p_spec.get("colores", [("Único", "#000000")])[0][0]
                        db.add(Inventario(
                            id_empresa=emp.id_empresa,
                            id_sucursal=s_obj.id_sucursal,
                            id_producto=prod.id_producto,
                            talla=t_val,
                            color=col_nom,
                            stock_fisico=20,
                            stock_reservado=0,
                            stock_disponible=20,
                            stock_minimo=3,
                            ultimo_costo_compra=costo_base,
                            costo_promedio_ponderado=costo_base
                        ))

        db.commit()

    return emp1


def _sembrar_usuarios_globales(db: Session, resumen: Dict) -> None:
    """Super Administrador global SaaS y cuentas de control."""
    if not db.query(Usuario).filter(Usuario.email == "superadmin@fashionstore.bo").first():
        db.add(Usuario(
            id_empresa=None, nombres="Super", apellidos="Administrador SaaS",
            email="superadmin@fashionstore.bo", password_hash=get_password_hash("SuperAdmin123*"),
            telefono="+591 70000001", rol="SUPER_ADMIN", estado_cuenta="ACTIVO"
        ))
        resumen["usuarios_creados"] += 1

    rodrigo = db.query(Usuario).filter(Usuario.email == "rodrigo.cliente@gmail.com").first()
    if rodrigo:
        rodrigo.password_hash = get_password_hash("Admin123*")

    db.commit()


def _vincular_huerfanos(db: Session, emp1: Empresa, resumen: Dict) -> None:
    """Garantiza que ningún recurso quede sin tenant asignado."""
    for modelo, clave in ((Sucursal, "sucursales"), (Producto, "productos"), (Inventario, "inventarios")):
        huerfanos = db.query(modelo).filter(modelo.id_empresa.is_(None)).all()
        for registro in huerfanos:
            registro.id_empresa = emp1.id_empresa
        resumen["vinculados"][clave] = len(huerfanos)

    usuarios = db.query(Usuario).filter(Usuario.id_empresa.is_(None), Usuario.rol != "SUPER_ADMIN").all()
    for u in usuarios:
        u.id_empresa = emp1.id_empresa
    resumen["vinculados"]["usuarios"] = len(usuarios)
    db.commit()


def _completar_atributos_textiles(db: Session, resumen: Dict) -> None:
    """CU06: Rellena composicion_textil y medidas_antropometricas donde falten."""
    productos = db.query(Producto).filter(
        (Producto.composicion_textil.is_(None)) | (Producto.medidas_antropometricas.is_(None))
    ).all()
    for prod in productos:
        if not prod.composicion_textil:
            prod.composicion_textil = "100% Algodón Pima Peruano Hipoalergénico"
        if not prod.medidas_antropometricas:
            prod.medidas_antropometricas = json.dumps(GUIA_MEDIDAS, ensure_ascii=False)
    resumen["productos_completados"] = len(productos)

    for c in db.query(ProductoColor).filter(ProductoColor.codigo_hex_secundario.is_(None)).all():
        c.codigo_hex_secundario = "#F8FAFC" if c.codigo_hex != "#FFFFFF" else "#0F172A"

    for t in db.query(ProductoTalla).filter(ProductoTalla.medidas_cm.is_(None)).all():
        m = GUIA_MEDIDAS.get(str(t.talla).upper())
        if m:
            t.medidas_cm = f"Pecho {m['pecho_cm']}cm, Cintura {m['cintura_cm']}cm, Largo {m['largo_cm']}cm"
    db.commit()


def _verificar_cpp(db: Session, resumen: Dict) -> None:
    """CU07: Reconciliación de CPP <= 0 con stock positivo."""
    pendientes = db.query(Inventario).filter(
        Inventario.stock_fisico > 0, Inventario.costo_promedio_ponderado <= 0
    ).all()
    for inv in pendientes:
        inv.costo_promedio_ponderado = inv.ultimo_costo_compra or Decimal("120.00")
    resumen["cpp_reparados"] = len(pendientes)
    db.commit()


def bootstrap_tenants(db: Optional[Session] = None, vincular_huerfanos: bool = False) -> Dict:
    """
    Punto de entrada idempotente para la siembra y bootstrap multitenant.
    """
    propia = db is None
    Base.metadata.create_all(bind=engine)
    ensure_columns(engine)
    db = db or SessionLocal()
    resumen: Dict = {
        "planes_creados": 0, "planes_reconciliados": 0, "empresas_creadas": 0,
        "suscripciones_creadas": 0, "usuarios_creados": 0, "sucursales_creadas": 0,
        "productos_creados": 0, "vinculados": {},
        "productos_completados": 0, "cpp_reparados": 0,
    }
    try:
        plan_basico, plan_pro = _sembrar_planes(db, resumen)
        emp1 = _sembrar_ecosistema_tenants(db, plan_basico, plan_pro, resumen)
        _sembrar_usuarios_globales(db, resumen)
        if emp1 and vincular_huerfanos:
            _vincular_huerfanos(db, emp1, resumen)
        _completar_atributos_textiles(db, resumen)
        _verificar_cpp(db, resumen)

        # Siembra y sincronización de operaciones reales multitenant (CU08 al CU25)
        from app.scripts.seed_operaciones_tenants import sembrar_operaciones_por_tenant
        for t_obj in db.query(Empresa).filter(Empresa.id_empresa.in_([2, 32, 33, 34, 35])).all():
            sembrar_operaciones_por_tenant(db, t_obj.id_empresa)

        return resumen
    except Exception:
        db.rollback()
        raise
    finally:
        if propia:
            db.close()
