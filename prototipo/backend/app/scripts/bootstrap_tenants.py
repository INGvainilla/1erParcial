# -*- coding: utf-8 -*-
"""
Bootstrap idempotente de la plataforma SaaS multitenant (CU01 al CU07).

Crea, SOLO si no existen: planes de suscripción, empresas piloto, suscripciones,
Super Administrador de la plataforma y administrador de la Empresa 2. Además completa
los atributos textiles (CU06) y verifica el CPP (CU07) únicamente donde faltan datos.

Es seguro ejecutarlo en cada arranque: no duplica registros ni pisa cambios manuales.

Vinculación de datos huérfanos a la Empresa #1:
  - Se ejecuta cuando la Empresa #1 se crea en esta corrida (migración inicial), o
  - cuando se pide explícitamente con `vincular_huerfanos=True` (uso por CLI).
  En arranques normales NO se ejecuta, para no reasignar a la Empresa #1 usuarios o
  recursos creados después sin empresa.
"""
import json
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash
# Importar modelos de los 10 paquetes para asegurar registro completo de mappers SQLAlchemy
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
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, ProductoColor, ProductoTalla
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario

# Valores acordes al enunciado (§9.4): Básico hasta 2 sucursales, Profesional hasta 10.
MAX_SUCURSALES_BASICO = 2
MAX_SUCURSALES_PROFESIONAL = 10
# Valor que tenía el seed anterior para Profesional; solo se reconcilia si sigue intacto.
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


def _sembrar_planes(db: Session, resumen: Dict) -> tuple:
    # CU02: Planes de Suscripción
    plan_basico = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_BASICO").first()
    if not plan_basico:
        plan_basico = PlanSuscripcion(
            nombre="Básico", codigo="PLAN_BASICO",
            max_sucursales=MAX_SUCURSALES_BASICO, max_usuarios=10,
            permite_reportes_ia=False, permite_ml_dashboard=False, soporta_offline=True,
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
        # Reconciliación con el enunciado, solo si conserva el valor del seed anterior
        plan_pro.max_sucursales = MAX_SUCURSALES_PROFESIONAL
        resumen["planes_reconciliados"] += 1

    db.commit()
    db.refresh(plan_basico)
    db.refresh(plan_pro)
    return plan_basico, plan_pro


def _sembrar_empresas(db: Session, resumen: Dict) -> tuple:
    # CU01: Empresas (Tenants)
    emp1 = db.query(Empresa).filter(Empresa.nit == "1029384756").first()
    emp1_nueva = False
    if not emp1:
        emp1 = Empresa(
            nit="1029384756", razon_social="FashionStore Bolivia S.R.L.", nombre_comercial="FashionStore",
            dominio_slug="fashionstore-scz", schema_name="tenant_fashionstore_scz",
            email_contacto="gerencia@fashionstore.bo", telefono="+591 3 3445566",
            direccion="Av. San Martín #450, Equipetrol, Santa Cruz",
            logo_url="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
            presupuesto_disponible=Decimal("75000.00"), estado="ACTIVA"
        )
        db.add(emp1)
        db.flush()
        emp1_nueva = True
        resumen["empresas_creadas"] += 1

    emp2 = db.query(Empresa).filter(Empresa.nit == "2039485761").first()
    if not emp2:
        emp2 = Empresa(
            nit="2039485761", razon_social="Textiles Elegance S.A.", nombre_comercial="Elegance Men",
            dominio_slug="elegance-men", schema_name="tenant_elegance_men",
            email_contacto="contacto@elegance.bo", telefono="+591 2 2789012",
            direccion="Av. Montenegro #890, San Miguel, La Paz",
            logo_url="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
            presupuesto_disponible=Decimal("40000.00"), estado="ACTIVA"
        )
        db.add(emp2)
        db.flush()
        resumen["empresas_creadas"] += 1

    db.commit()
    db.refresh(emp1)
    db.refresh(emp2)
    return emp1, emp2, emp1_nueva


def _sembrar_suscripciones(db: Session, emp1, emp2, plan_basico, plan_pro, resumen: Dict) -> None:
    # CU03: Suscripción de Empresa
    if not db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == emp1.id_empresa).first():
        db.add(SuscripcionEmpresa(
            id_empresa=emp1.id_empresa, id_plan=plan_pro.id_plan,
            fecha_inicio=date.today() - timedelta(days=30),
            fecha_vencimiento=date.today() + timedelta(days=335),
            estado="ACTIVA", auto_renovar=True
        ))
        resumen["suscripciones_creadas"] += 1
    if not db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == emp2.id_empresa).first():
        db.add(SuscripcionEmpresa(
            id_empresa=emp2.id_empresa, id_plan=plan_basico.id_plan,
            fecha_inicio=date.today(), fecha_vencimiento=date.today() + timedelta(days=60),
            estado="ACTIVA", auto_renovar=True
        ))
        resumen["suscripciones_creadas"] += 1
    db.commit()


def _sembrar_usuarios(db: Session, emp2, resumen: Dict) -> None:
    # CU04: Super Administrador global (sin id_empresa)
    if not db.query(Usuario).filter(Usuario.email == "superadmin@fashionstore.bo").first():
        db.add(Usuario(
            id_empresa=None, nombres="Super", apellidos="Administrador SaaS",
            email="superadmin@fashionstore.bo", password_hash=get_password_hash("SuperAdmin123*"),
            telefono="+591 70000001", rol="SUPER_ADMIN", estado_cuenta="ACTIVO"
        ))
        resumen["usuarios_creados"] += 1

    # CU05: Administrador de la Empresa #2 (credenciales estables para pruebas y demostración)
    if not db.query(Usuario).filter(Usuario.email == "admin@elegance.bo").first():
        db.add(Usuario(
            id_empresa=emp2.id_empresa, nombres="Carlos", apellidos="Elegance Admin",
            email="admin@elegance.bo", password_hash=get_password_hash("Elegance123*"),
            telefono="+591 71112233", rol="ADMINISTRADOR", estado_cuenta="ACTIVO"
        ))
        resumen["usuarios_creados"] += 1
    db.commit()


def _vincular_huerfanos(db: Session, emp1, resumen: Dict) -> None:
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
    # CU06: solo donde faltan datos (nunca pisa lo ya cargado)
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
    # CU07: un CPP <= 0 con stock se repara con el último costo de compra
    pendientes = db.query(Inventario).filter(
        Inventario.stock_fisico > 0, Inventario.costo_promedio_ponderado <= 0
    ).all()
    for inv in pendientes:
        inv.costo_promedio_ponderado = inv.ultimo_costo_compra or Decimal("120.00")
    resumen["cpp_reparados"] = len(pendientes)
    db.commit()


def bootstrap_tenants(db: Optional[Session] = None, vincular_huerfanos: bool = False) -> Dict:
    """
    Punto de entrada idempotente. Requiere que las tablas y columnas ya existan
    (`ensure_columns` + `Base.metadata.create_all`).
    Retorna un resumen de lo que hizo en esta corrida.
    """
    propia = db is None
    db = db or SessionLocal()
    resumen: Dict = {
        "planes_creados": 0, "planes_reconciliados": 0, "empresas_creadas": 0,
        "suscripciones_creadas": 0, "usuarios_creados": 0, "vinculados": {},
        "productos_completados": 0, "cpp_reparados": 0,
    }
    try:
        plan_basico, plan_pro = _sembrar_planes(db, resumen)
        emp1, emp2, emp1_nueva = _sembrar_empresas(db, resumen)
        _sembrar_suscripciones(db, emp1, emp2, plan_basico, plan_pro, resumen)
        _sembrar_usuarios(db, emp2, resumen)
        if emp1_nueva or vincular_huerfanos:
            _vincular_huerfanos(db, emp1, resumen)
        _completar_atributos_textiles(db, resumen)
        _verificar_cpp(db, resumen)
        return resumen
    except Exception:
        db.rollback()
        raise
    finally:
        if propia:
            db.close()
