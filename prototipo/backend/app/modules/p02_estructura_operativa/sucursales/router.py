# -*- coding: utf-8 -*-
"""
Enrutador de API: Gestión de Ciudades y Sucursales Físicas (M02 - CU05)
Comentado paso a paso conforme al caso de uso CU05.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_user_optional, require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.schemas import (
    CiudadCreate, CiudadResponse, SucursalCreate, SucursalUpdate, SucursalResponse
)
from app.modules.p02_estructura_operativa.sucursales.service import SucursalControl

router = APIRouter(prefix="/sucursales", tags=["Gestión de Sucursales y Ciudades (CU05)"])
ciudades_router = APIRouter(prefix="/ciudades", tags=["Gestión de Ciudades"])

# --- ENDPOINTS CIUDADES ---
@ciudades_router.get("", response_model=List[CiudadResponse])
def listar_ciudades_endpoint(db: Session = Depends(get_db)):
    # CU05: Gestionar Ciudades y Sucursales, Paso 1: Administrador consulta catálogo de ciudades operativas
    # CU05: Gestionar Ciudades y Sucursales, Paso 1.1: Invocación a SucursalControl.listar_ciudades()
    return SucursalControl.listar_ciudades(db)

@ciudades_router.post("", response_model=CiudadResponse, status_code=status.HTTP_201_CREATED)
def crear_ciudad_endpoint(
    request: CiudadCreate,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU05: Gestionar Ciudades y Sucursales, Paso 2: Administrador registra nueva ciudad de cobertura
    # CU05: Gestionar Ciudades y Sucursales, Paso 2.1: Invocación a SucursalControl.crear_ciudad()
    return SucursalControl.crear_ciudad(db, request)

# --- ENDPOINTS SUCURSALES (CU05) ---
@router.get("", response_model=List[SucursalResponse])
def listar_sucursales_endpoint(
    id_ciudad: Optional[int] = Query(None, description="Filtrar por ID de ciudad"),
    estado: Optional[str] = Query(None, description="Filtrar por estado operativo"),
    id_empresa: Optional[int] = Query(None, description="Filtrar por empresa (Tenant)"),
    current_user: Optional[Usuario] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # CU05: Consultar sucursales físicas con filtros geográficos, operativos o de tenant
    return SucursalControl.listar_sucursales(
        db, id_ciudad=id_ciudad, estado=estado, id_empresa=id_empresa, current_user=current_user
    )

@router.get("/{id_sucursal}", response_model=SucursalResponse)
def obtener_sucursal_endpoint(
    id_sucursal: int,
    current_user: Optional[Usuario] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # CU05: Consultar detalle individual con coordenadas GPS y probadores
    return SucursalControl.obtener_sucursal(db, id_sucursal=id_sucursal, current_user=current_user)

@router.post("", response_model=SucursalResponse, status_code=status.HTTP_201_CREATED)
def registrar_sucursal_endpoint(
    request: SucursalCreate,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU05: Alta de sucursal física asignada automáticamente al tenant del administrador
    return SucursalControl.registrar_sucursal(db, request, current_user=current_user)

@router.put("/{id_sucursal}", response_model=SucursalResponse)
def modificar_sucursal_endpoint(
    id_sucursal: int,
    request: SucursalUpdate,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU05: Administrador actualiza horarios operativos o probadores con verificación de tenant
    return SucursalControl.modificar_sucursal(
        db, id_sucursal=id_sucursal, request=request, current_user=current_user
    )
