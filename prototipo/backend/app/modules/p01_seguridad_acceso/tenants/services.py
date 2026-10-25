# -*- coding: utf-8 -*-
"""
Servicios de Dominio para Gobernanza SaaS Multitenant (CU01, CU02, CU03)
Implementa la lógica de negocio, validaciones y trazabilidad según ICONIX.
"""
from datetime import date, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.p01_seguridad_acceso.tenants.models import Empresa, PlanSuscripcion, SuscripcionEmpresa
from app.modules.p01_seguridad_acceso.tenants.schemas import EmpresaCreate, EmpresaUpdate, PlanCreate, PlanUpdate, SuscripcionCreate
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.core.security import get_password_hash


# ==============================================================================
# CU02: GESTIONAR PLANES DE SUSCRIPCIÓN
# ==============================================================================
def listar_planes(db: Session, solo_activos: bool = True) -> List[PlanSuscripcion]:
    query = db.query(PlanSuscripcion)
    if solo_activos:
        query = query.filter(PlanSuscripcion.estado == "ACTIVO")
    return query.order_by(PlanSuscripcion.precio_mensual.asc()).all()


def obtener_plan_por_id(db: Session, id_plan: int) -> PlanSuscripcion:
    plan = db.query(PlanSuscripcion).filter(PlanSuscripcion.id_plan == id_plan).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan de suscripción #{id_plan} no encontrado")
    return plan


def crear_plan(db: Session, datos: PlanCreate) -> PlanSuscripcion:
    existente = db.query(PlanSuscripcion).filter(
        (PlanSuscripcion.nombre == datos.nombre) | (PlanSuscripcion.codigo == datos.codigo)
    ).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe un plan con este nombre o código")
    
    plan = PlanSuscripcion(**datos.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def actualizar_plan(db: Session, id_plan: int, datos: PlanUpdate) -> PlanSuscripcion:
    plan = obtener_plan_por_id(db, id_plan)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(plan, campo, valor)
    db.commit()
    db.refresh(plan)
    return plan


# ==============================================================================
# CU01: GESTIONAR EMPRESAS (TENANTS)
# ==============================================================================
def listar_empresas(db: Session) -> List[Empresa]:
    return db.query(Empresa).order_by(Empresa.id_empresa.desc()).all()


def obtener_empresa_por_id(db: Session, id_empresa: int) -> Empresa:
    emp = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Empresa #{id_empresa} no encontrada")
    return emp


def obtener_empresa_por_slug(db: Session, dominio_slug: str) -> Optional[Empresa]:
    return db.query(Empresa).filter(Empresa.dominio_slug == dominio_slug).first()


def crear_empresa(db: Session, datos: EmpresaCreate) -> Empresa:
    # 1. Validar unicidad de NIT y dominio_slug
    if db.query(Empresa).filter(Empresa.nit == datos.nit).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El NIT '{datos.nit}' ya se encuentra registrado por otra empresa")
    if db.query(Empresa).filter(Empresa.dominio_slug == datos.dominio_slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El identificador de dominio '{datos.dominio_slug}' ya está en uso")

    empresa_data = datos.model_dump(exclude={"id_plan_inicial", "admin_nombres", "admin_apellidos", "admin_email", "admin_password"})
    empresa = Empresa(**empresa_data)
    empresa.schema_name = f"tenant_{datos.dominio_slug.replace('-', '_')}"
    db.add(empresa)
    db.flush()

    # 2. Asignar plan inicial si se especificó
    if datos.id_plan_inicial:
        plan = obtener_plan_por_id(db, datos.id_plan_inicial)
        fecha_fin = date.today() + timedelta(days=30)
        suscripcion = SuscripcionEmpresa(
            id_empresa=empresa.id_empresa,
            id_plan=plan.id_plan,
            fecha_inicio=date.today(),
            fecha_vencimiento=fecha_fin,
            estado="ACTIVA"
        )
        db.add(suscripcion)

    # 3. Crear usuario administrador inicial para la empresa si se enviaron credenciales
    if datos.admin_email and datos.admin_password:
        if not db.query(Usuario).filter(Usuario.email == datos.admin_email).first():
            admin_user = Usuario(
                id_empresa=empresa.id_empresa,
                nombres=datos.admin_nombres or "Admin",
                apellidos=datos.admin_apellidos or datos.nombre_comercial,
                email=datos.admin_email,
                password_hash=get_password_hash(datos.admin_password),
                telefono=datos.telefono,
                rol="ADMINISTRADOR",
                estado_cuenta="ACTIVO"
            )
            db.add(admin_user)

    db.commit()
    db.refresh(empresa)
    return empresa


def actualizar_empresa(db: Session, id_empresa: int, datos: EmpresaUpdate) -> Empresa:
    empresa = obtener_empresa_por_id(db, id_empresa)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(empresa, campo, valor)
    db.commit()
    db.refresh(empresa)
    return empresa


# ==============================================================================
# CU03: GESTIONAR SUSCRIPCIÓN DE EMPRESA
# ==============================================================================
def obtener_suscripcion_activa(db: Session, id_empresa: int) -> Optional[SuscripcionEmpresa]:
    return db.query(SuscripcionEmpresa).filter(
        SuscripcionEmpresa.id_empresa == id_empresa,
        SuscripcionEmpresa.estado == "ACTIVA"
    ).order_by(SuscripcionEmpresa.fecha_vencimiento.desc()).first()


def crear_o_renovar_suscripcion(db: Session, datos: SuscripcionCreate) -> SuscripcionEmpresa:
    empresa = obtener_empresa_por_id(db, datos.id_empresa)
    plan = obtener_plan_por_id(db, datos.id_plan)

    susc_actual = obtener_suscripcion_activa(db, datos.id_empresa)
    fecha_inicio = date.today()
    if susc_actual and susc_actual.fecha_vencimiento >= date.today():
        fecha_inicio = susc_actual.fecha_vencimiento
        susc_actual.estado = "RENOVADA"

    dias_duracion = datos.meses_duracion * 30
    fecha_vencimiento = fecha_inicio + timedelta(days=dias_duracion)

    nueva_susc = SuscripcionEmpresa(
        id_empresa=empresa.id_empresa,
        id_plan=plan.id_plan,
        fecha_inicio=fecha_inicio,
        fecha_vencimiento=fecha_vencimiento,
        estado="ACTIVA",
        auto_renovar=datos.auto_renovar
    )
    db.add(nueva_susc)
    db.commit()
    db.refresh(nueva_susc)
    return nueva_susc
