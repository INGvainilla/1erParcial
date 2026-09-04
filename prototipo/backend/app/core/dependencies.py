# -*- coding: utf-8 -*-
"""
Inyección de Dependencias y Seguridad RBAC para FastAPI
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.modules.auth.models import Usuario

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
    if usuario.estado_cuenta != "ACTIVO":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Cuenta no activa: {usuario.estado_cuenta}")
    return usuario

def require_roles(allowed_roles: list):
    """Filtro de autorización estricta por roles jerárquicos (RBAC)"""
    def role_checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los roles: {allowed_roles}. Tu rol es: {current_user.rol}"
            )
        return current_user
    return role_checker
