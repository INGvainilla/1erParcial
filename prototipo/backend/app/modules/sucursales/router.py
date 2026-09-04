# -*- coding: utf-8 -*-
"""
Enrutador de API: Gestión de Ciudades y Sucursales Físicas (M02 - CU05)
Comentado paso a paso conforme al caso de uso CU05.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.sucursales.schemas import (
    CiudadCreate, CiudadResponse, SucursalCreate, SucursalUpdate, SucursalResponse
)
from app.modules.sucursales.service import SucursalControl

router = APIRouter(prefix="/sucursales", tags=["Gestión de Sucursales y Ciudades (CU05)"])
ciudades_router = APIRouter(prefix="/ciudades", tags=["Gestión de Ciudades"])

# --- ENDPOINTS CIUDADES ---
@ciudades_router.get("", response_model=List[CiudadResponse])
def listar_ciudades_endpoint(db: Session = Depends(get_db)):
    # Paso 1: Consulta del directorio de ciudades
    return SucursalControl.listar_ciudades(db)

@ciudades_router.post("", response_model=CiudadResponse, status_code=status.HTTP_201_CREATED)
def crear_ciudad_endpoint(
    request: CiudadCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # Paso 1: Administrador registra nueva ciudad
    return SucursalControl.crear_ciudad(db, request)

# --- ENDPOINTS SUCURSALES (CU05) ---
@router.get("", response_model=List[SucursalResponse])
def listar_sucursales_endpoint(
    id_ciudad: Optional[int] = Query(None, description="Filtrar por ID de ciudad"),
    estado: Optional[str] = Query(None, description="Filtrar por estado operativo"),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU05 - Consultar Sucursales
    # Paso 1: Cliente u operador solicita listado de tiendas físicas con filtros
    # Paso 1.1: Invocación a SucursalControl.listar_sucursales()
    return SucursalControl.listar_sucursales(db, id_ciudad=id_ciudad, estado=estado)

@router.get("/{id_sucursal}", response_model=SucursalResponse)
def obtener_sucursal_endpoint(id_sucursal: int, db: Session = Depends(get_db)):
    # Paso 1: Detalle de sucursal específica con ubicación GPS y probadores
    return SucursalControl.obtener_sucursal(db, id_sucursal=id_sucursal)

@router.post("", response_model=SucursalResponse, status_code=status.HTTP_201_CREATED)
def registrar_sucursal_endpoint(
    request: SucursalCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU05 - Alta de Sucursal Física
    # Paso 1: Administrador envía formulario de apertura de sucursal (GPS, probadores)
    # Paso 1.1: Invocación a SucursalControl.registrar_sucursal()
    return SucursalControl.registrar_sucursal(db, request)

@router.put("/{id_sucursal}", response_model=SucursalResponse)
def modificar_sucursal_endpoint(
    id_sucursal: int,
    request: SucursalUpdate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU05 - Modificación de Sucursal
    # Paso 1: Administrador actualiza horarios o capacidad de probadores
    # Paso 1.1: Invocación a SucursalControl.modificar_sucursal()
    return SucursalControl.modificar_sucursal(db, id_sucursal=id_sucursal, request=request)
