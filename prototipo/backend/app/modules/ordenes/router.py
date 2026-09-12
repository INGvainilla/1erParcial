# -*- coding: utf-8 -*-
"""
Controlador / Router: Procesar Compra Digital y Checkout (CU14 - M12)
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.models import Usuario
from app.modules.ordenes.schemas import OrdenCreateRequest, OrdenResponse
from app.modules.ordenes.services import (
    crear_orden_desde_carrito,
    obtener_orden_por_id
)

router = APIRouter(prefix="/ordenes", tags=["Órdenes y Checkout (CU14)"])


@router.post("/checkout", response_model=OrdenResponse, status_code=status.HTTP_201_CREATED)
def procesar_checkout_endpoint(
    orden_in: OrdenCreateRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU14: Formaliza la compra transformando el carrito del usuario en una Orden de Venta oficial.
    Valida existencias atómicamente, aplica tarifa de entrega y vacía el carrito.
    """
    return crear_orden_desde_carrito(
        db=db,
        id_usuario=current_user.id_usuario,
        orden_in=orden_in
    )


@router.get("/{id_orden}", response_model=OrdenResponse)
def consultar_orden_endpoint(
    id_orden: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU14: Obtiene los datos detallados de una orden de venta.
    """
    return obtener_orden_por_id(
        db=db,
        id_orden=id_orden,
        id_usuario=current_user.id_usuario
    )
