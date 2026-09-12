# -*- coding: utf-8 -*-
"""
Controlador / Router: Administrar Carrito de Compras Omnicanal (CU13 - M11)
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.models import Usuario
from app.modules.carrito.schemas import (
    CarritoItemAdd, CarritoItemUpdate, CarritoResponse
)
from app.modules.carrito.services import (
    obtener_carrito_usuario,
    agregar_item_carrito,
    actualizar_cantidad_item,
    eliminar_item_carrito,
    vaciar_carrito
)

router = APIRouter(prefix="/carrito", tags=["Carrito de Compras (CU13)"])


@router.get("", response_model=CarritoResponse)
@router.get("/", response_model=CarritoResponse, include_in_schema=False)
def ver_carrito(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU13: Obtiene el estado actual del carrito activo del cliente autenticado con totales.
    """
    return obtener_carrito_usuario(db=db, id_usuario=current_user.id_usuario)


@router.post("/items", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED)
def agregar_item(
    item_in: CarritoItemAdd,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU13: Añade un producto al carrito de compras validando existencias atómicamente.
    """
    return agregar_item_carrito(db=db, id_usuario=current_user.id_usuario, item_in=item_in)


@router.patch("/items/{id_item}", response_model=CarritoResponse)
def actualizar_item(
    id_item: int,
    item_in: CarritoItemUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU13: Actualiza la cantidad de un ítem existente en el carrito con verificación de stock.
    """
    return actualizar_cantidad_item(
        db=db,
        id_usuario=current_user.id_usuario,
        id_item=id_item,
        nueva_cantidad=item_in.cantidad
    )


@router.delete("/items/{id_item}", response_model=CarritoResponse)
def eliminar_item(
    id_item: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU13: Elimina un ítem específico del carrito de compras y recalcula el total general.
    """
    return eliminar_item_carrito(db=db, id_usuario=current_user.id_usuario, id_item=id_item)


@router.delete("", response_model=CarritoResponse)
@router.delete("/", response_model=CarritoResponse, include_in_schema=False)
def vaciar_carrito_endpoint(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CU13: Vacía todos los productos del carrito activo del cliente.
    """
    return vaciar_carrito(db=db, id_usuario=current_user.id_usuario)
