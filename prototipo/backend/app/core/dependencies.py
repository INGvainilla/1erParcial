# -*- coding: utf-8 -*-
"""
Inyección de Dependencias y Seguridad RBAC para FastAPI
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.modules.p01_seguridad_acceso.auth.models import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    """Valida el token JWT del encabezado Authorization: Bearer <token> y recupera el usuario"""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado. Inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de token inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    usuario = db.query(Usuario).filter(Usuario.id_usuario == int(user_id)).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    if usuario.estado_cuenta == "BLOQUEADO_POR_INTENTOS":
        from datetime import datetime, timezone
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        if usuario.bloqueado_hasta and now_utc > usuario.bloqueado_hasta:
            usuario.estado_cuenta = "ACTIVO"
            usuario.intentos_fallidos = 0
            usuario.bloqueado_hasta = None
            db.commit()
            db.refresh(usuario)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Su cuenta se encuentra bloqueada temporalmente por seguridad. Contacte al Administrador."
            )
    elif usuario.estado_cuenta != "ACTIVO":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Cuenta no activa ({usuario.estado_cuenta}). Contacte al Administrador.")
    return usuario

def require_roles(allowed_roles: list):
    """Filtro de autorización estricta por roles jerárquicos (RBAC)"""
    def role_checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        # SUPER_ADMIN tiene acceso global a todas las operaciones
        if current_user.rol == "SUPER_ADMIN":
            return current_user
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los roles: {allowed_roles}. Tu rol es: {current_user.rol}"
            )
        return current_user
    return role_checker


def require_super_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Verifica que el usuario actual tenga rol de Super Administrador de la plataforma SaaS"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación restringida exclusivamente al Super Administrador de la Plataforma SaaS."
        )
    return current_user


def get_tenant_id(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> int:
    """
    Inyector de dependencias que resuelve el tenant_id (id_empresa) de la sesión.
    Garantiza el aislamiento lógico estricto exigido por la cátedra para el modelo SaaS.
    """
    if current_user.rol == "SUPER_ADMIN":
        # Si es super admin y no tiene empresa asignada, retorna None o su id si lo tuviera
        return current_user.id_empresa
    if not current_user.id_empresa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no se encuentra asignado a ninguna empresa activa (tenant)."
        )
    return current_user.id_empresa

