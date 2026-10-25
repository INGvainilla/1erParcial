# -*- coding: utf-8 -*-
"""
Helper de Aislamiento Multitenant (RNF02, RNF04, Sección 9.6)
Centraliza la resolución de tenants, validación de pertenencia y filtrado seguro.
"""
from typing import Optional, Any
from fastapi import HTTPException, status
from app.modules.p01_seguridad_acceso.auth.models import Usuario


def resolver_empresa(user: Usuario, id_empresa: Optional[int] = None) -> Optional[int]:
    """
    Resuelve el ID de empresa autorizado para el usuario actual.
    - SUPER_ADMIN: Puede consultar cualquier empresa especificando `id_empresa`,
      o su propia empresa, o None para ver todo el sistema.
    - Otros roles (ADMINISTRADOR, ENCARGADO, etc.): Quedan estrictamente confinados
      a `user.id_empresa`. Si intentan solicitar un `id_empresa` distinto, se rechaza con 403.
    """
    if user.rol == "SUPER_ADMIN":
        if id_empresa is not None:
            return id_empresa
        return user.id_empresa

    if user.id_empresa is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: El usuario no está vinculado a ninguna empresa."
        )

    if id_empresa is not None and id_empresa != user.id_empresa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: No tiene permisos para operar o consultar datos de otra empresa."
        )

    return user.id_empresa


def exigir_mismo_tenant(
    user: Usuario,
    id_empresa_recurso: Optional[int],
    detalle: Optional[str] = None
) -> None:
    """
    Garantiza que el recurso pertenezca a la misma empresa del usuario.
    SUPER_ADMIN tiene acceso global y no se restringe.
    """
    if user.rol == "SUPER_ADMIN":
        return

    if user.id_empresa is None or id_empresa_recurso is None or user.id_empresa != id_empresa_recurso:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detalle or "Acceso denegado: El recurso pertenece a otra empresa."
        )


def filtrar_por_tenant(query: Any, model: Any, user: Usuario, id_empresa: Optional[int] = None) -> Any:
    """
    Aplica el filtro de `id_empresa` a una consulta SQLAlchemy según el rol del usuario.
    """
    if not hasattr(model, "id_empresa"):
        return query

    if user.rol == "SUPER_ADMIN":
        if id_empresa is not None:
            return query.filter(model.id_empresa == id_empresa)
        return query

    empresa_id = resolver_empresa(user, id_empresa)
    return query.filter(model.id_empresa == empresa_id)
