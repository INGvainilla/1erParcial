# -*- coding: utf-8 -*-
"""
Enrutador REST FastAPI para Gobernanza SaaS Multitenant (CU01, CU02, CU03)
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_super_admin, require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.tenants.schemas import (
    EmpresaCreate, EmpresaUpdate, EmpresaResponse,
    PlanCreate, PlanUpdate, PlanResponse,
    SuscripcionCreate, SuscripcionResponse
)
from app.modules.p01_seguridad_acceso.tenants import services

router = APIRouter(prefix="/tenants", tags=["M01: Gobernanza SaaS y Multitenancy"])


# ==============================================================================
# CU02: PLANES DE SUSCRIPCIÓN
# ==============================================================================
@router.get("/planes", response_model=List[PlanResponse], summary="CU02: Listar Planes de Suscripción")
def listar_planes(solo_activos: bool = True, db: Session = Depends(get_db)):
    return services.listar_planes(db, solo_activos)


@router.get("/planes/{id_plan}", response_model=PlanResponse, summary="CU02: Obtener Detalle de Plan")
def obtener_plan(id_plan: int, db: Session = Depends(get_db)):
    return services.obtener_plan_por_id(db, id_plan)


@router.post("/planes", response_model=PlanResponse, status_code=status.HTTP_201_CREATED, summary="CU02: Crear Plan de Suscripción")
def crear_plan(
    datos: PlanCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_super_admin)
):
    return services.crear_plan(db, datos)


@router.put("/planes/{id_plan}", response_model=PlanResponse, summary="CU02: Actualizar Plan de Suscripción")
def actualizar_plan(
    id_plan: int,
    datos: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_super_admin)
):
    return services.actualizar_plan(db, id_plan, datos)


# ==============================================================================
# CU01: GESTIÓN DE EMPRESAS (TENANTS)
# ==============================================================================
@router.get("/empresas", response_model=List[EmpresaResponse], summary="CU01: Listar Empresas Registradas (Tenants)")
def listar_empresas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol == "SUPER_ADMIN":
        return services.listar_empresas(db)
    elif current_user.id_empresa:
        empresa = services.obtener_empresa_por_id(db, current_user.id_empresa)
        return [empresa] if empresa else []
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para consultar empresas registradas."
        )


@router.get("/empresas/{id_empresa}", response_model=EmpresaResponse, summary="CU01: Obtener Ficha de Empresa")
def obtener_empresa(
    id_empresa: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "SUPER_ADMIN" and current_user.id_empresa != id_empresa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido: no puede consultar datos de otra empresa."
        )
    return services.obtener_empresa_por_id(db, id_empresa)


@router.post("/empresas", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED, summary="CU01: Registrar Nueva Empresa (Tenant)")
def registrar_empresa(
    datos: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_super_admin)
):
    return services.crear_empresa(db, datos)


@router.put("/empresas/{id_empresa}", response_model=EmpresaResponse, summary="CU01: Modificar Datos de Empresa")
def actualizar_empresa(
    id_empresa: int,
    datos: EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "SUPER_ADMIN" and (current_user.id_empresa != id_empresa or current_user.rol not in ["ADMINISTRADOR", "GERENTE"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No cuenta con privilegios para modificar esta empresa."
        )
    return services.actualizar_empresa(db, id_empresa, datos)


# ==============================================================================
# CU03: GESTIÓN DE SUSCRIPCIONES
# ==============================================================================
@router.post("/suscripciones", response_model=SuscripcionResponse, status_code=status.HTTP_201_CREATED, summary="CU03: Contratar o Renovar Suscripción")
def contratar_suscripcion(
    datos: SuscripcionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_super_admin)
):
    return services.crear_o_renovar_suscripcion(db, datos)


@router.get("/empresas/{id_empresa}/suscripcion-activa", response_model=SuscripcionResponse, summary="CU03: Consultar Suscripción Activa de Empresa")
def obtener_suscripcion_activa(
    id_empresa: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "SUPER_ADMIN" and current_user.id_empresa != id_empresa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para consultar la suscripción de otra empresa."
        )
    susc = services.obtener_suscripcion_activa(db, id_empresa)
    if not susc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"La empresa #{id_empresa} no tiene una suscripción activa")
    return susc
