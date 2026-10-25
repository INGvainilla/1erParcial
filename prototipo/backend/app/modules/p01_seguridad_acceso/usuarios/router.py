# -*- coding: utf-8 -*-
"""
Enrutador de API: Gestión de Usuarios y Roles (M01 - CU04)
Expone los endpoints protegidos por RBAC con roles estrictos (ADMINISTRADOR).
Comentado paso a paso conforme al flujo del caso de uso CU04.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.usuarios.schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse, DesbloquearUsuarioResponse
)
from app.modules.p01_seguridad_acceso.usuarios.service import UsuarioAdminControl

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios (CU04)"])

@router.get("", response_model=List[UsuarioResponse])
@router.get("/", response_model=List[UsuarioResponse], include_in_schema=False)
def listar_usuarios_endpoint(
    rol: Optional[str] = Query(None, description="Filtrar por rol"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU05: Gestionar Usuarios y Roles por Empresa (RBAC Multitenant)
    id_empresa_filtro = None if current_user.rol == "SUPER_ADMIN" else current_user.id_empresa
    return UsuarioAdminControl.listar_usuarios(
        db, rol=rol, estado=estado, id_sucursal=id_sucursal, id_empresa=id_empresa_filtro
    )

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear_usuario_endpoint(
    request_data: UsuarioCreate,
    request: Request,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU05: Alta de usuario asignando automáticamente la empresa del administrador
    client_ip = request.client.host if request.client else "127.0.0.1"
    empresa_id_destino = request_data.id_empresa if current_user.rol == "SUPER_ADMIN" else current_user.id_empresa
    return UsuarioAdminControl.registrar_usuario_staff(
        db=db,
        request=request_data,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip,
        id_empresa=empresa_id_destino
    )

@router.put("/{id_usuario}", response_model=UsuarioResponse)
def modificar_usuario_endpoint(
    id_usuario: int,
    request_data: UsuarioUpdate,
    request: Request,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3: Administrador envía datos actualizados
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.modificar_usuario(
        db=db,
        id_usuario=id_usuario,
        request=request_data,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip,
        current_user=current_user
    )

@router.put("/{id_usuario}/desbloquear", response_model=DesbloquearUsuarioResponse)
def desbloquear_cuenta_endpoint(
    id_usuario: int,
    request: Request,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU04: Gestionar Usuarios y Roles (RBAC), Paso 4: Desbloqueo administrativo
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.desbloquear_cuenta(
        db=db,
        id_usuario=id_usuario,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip,
        current_user=current_user
    )

@router.put("/{id_usuario}/bloquear", response_model=DesbloquearUsuarioResponse)
def bloquear_cuenta_endpoint(
    id_usuario: int,
    request: Request,
    minutos: int = Query(30, description="Minutos de bloqueo temporal"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CU04: Gestionar Usuarios y Roles (RBAC), Paso 5: Bloqueo preventivo o administrativo
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.bloquear_cuenta(
        db=db,
        id_usuario=id_usuario,
        admin_id=current_user.id_usuario,
        minutos=minutos,
        ip_origen=client_ip,
        current_user=current_user
    )
