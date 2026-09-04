# -*- coding: utf-8 -*-
"""
Enrutador de API: Gestión de Proveedores Textiles (M05 - CU08)
Comentado paso a paso conforme al caso de uso CU08.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.proveedores.schemas import (
    ProveedorCreate, ProveedorUpdate, ProveedorResponse
)
from app.modules.proveedores.service import ProveedorControl

router = APIRouter(prefix="/proveedores", tags=["Gestión de Proveedores (CU08)"])

@router.get("", response_model=List[ProveedorResponse])
def listar_proveedores_endpoint(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU08 - Consultar Proveedores
    # Paso 1: Personal de logística consulta el directorio de proveedores
    # Paso 1.1: Invocación a ProveedorControl.listar_proveedores()
    return ProveedorControl.listar_proveedores(db, estado=estado)

@router.get("/{id_proveedor}", response_model=ProveedorResponse)
def obtener_proveedor_endpoint(
    id_proveedor: int,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"])),
    db: Session = Depends(get_db)
):
    return ProveedorControl.obtener_proveedor(db, id_proveedor=id_proveedor)

@router.post("", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED)
def registrar_proveedor_endpoint(
    request: ProveedorCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU08 - Alta de Proveedor Textil
    # Paso 1: Personal de logística envía datos comerciales y NIT
    # Paso 1.1: Invocación a ProveedorControl.registrar_proveedor()
    return ProveedorControl.registrar_proveedor(db, request)

@router.put("/{id_proveedor}", response_model=ProveedorResponse)
def modificar_proveedor_endpoint(
    id_proveedor: int,
    request: ProveedorUpdate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU08 - Modificación de Proveedor
    # Paso 1: Personal de logística actualiza contacto o términos
    # Paso 1.1: Invocación a ProveedorControl.modificar_proveedor()
    return ProveedorControl.modificar_proveedor(db, id_proveedor=id_proveedor, request=request)
