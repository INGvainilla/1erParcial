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
from app.modules.auth.models import Usuario
from app.modules.usuarios.schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse, DesbloquearUsuarioResponse
)
from app.modules.usuarios.service import UsuarioAdminControl

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios (CU04)"])

@router.get("", response_model=List[UsuarioResponse])
@router.get("/", response_model=List[UsuarioResponse], include_in_schema=False)
def listar_usuarios_endpoint(
    rol: Optional[str] = Query(None, description="Filtrar por rol"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU04 - Listar Usuarios
    # Paso 1: Administrador consulta la lista de usuarios con filtros opcionales
    # Paso 1.1: Invocación a UsuarioAdminControl.listar_usuarios()
    return UsuarioAdminControl.listar_usuarios(db, rol=rol, estado=estado, id_sucursal=id_sucursal)

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def crear_usuario_endpoint(
    request_data: UsuarioCreate,
    request: Request,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU04 - Alta de Personal Administrativo / Operativo
    # Paso 1: Administrador envía formulario de nuevo empleado
    # Paso 1.1: Invocación a UsuarioAdminControl.registrar_usuario_staff()
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.registrar_usuario_staff(
        db=db,
        request=request_data,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip
    )

@router.put("/{id_usuario}", response_model=UsuarioResponse)
def modificar_usuario_endpoint(
    id_usuario: int,
    request_data: UsuarioUpdate,
    request: Request,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU04 - Modificar Usuario
    # Paso 1: Administrador envía datos actualizados de un usuario
    # Paso 1.1: Invocación a UsuarioAdminControl.modificar_usuario()
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.modificar_usuario(
        db=db,
        id_usuario=id_usuario,
        request=request_data,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip
    )

@router.put("/{id_usuario}/desbloquear", response_model=DesbloquearUsuarioResponse)
def desbloquear_cuenta_endpoint(
    id_usuario: int,
    request: Request,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU04 - Desbloquear Cuenta
    # Paso 2: Administrador presiona botón 'Desbloquear Cuenta'
    # Paso 2.1: Invocación a UsuarioAdminControl.desbloquear_cuenta()
    client_ip = request.client.host if request.client else "127.0.0.1"
    return UsuarioAdminControl.desbloquear_cuenta(
        db=db,
        id_usuario=id_usuario,
        admin_id=current_user.id_usuario,
        ip_origen=client_ip
    )
