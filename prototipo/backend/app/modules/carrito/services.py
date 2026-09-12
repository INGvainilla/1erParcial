# -*- coding: utf-8 -*-
"""
Lógica de Negocio y Validación Atómica de Existencias para Carrito de Compras (CU13)
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import Optional

from app.modules.carrito.models import Carrito, CarritoItem
from app.modules.carrito.schemas import (
    CarritoItemAdd, CarritoResponse, CarritoItemResponse
)
from app.modules.productos.models import Producto
from app.modules.inventario.models import Inventario


def consultar_stock_disponible_global(db: Session, id_producto: int, talla: str, color: str) -> int:
    """
    CU13 - Validación Atómica:
    Calcula la suma de stock_disponible en todas las sucursales para la combinación producto/talla/color.
    """
    resultado = db.query(func.coalesce(func.sum(Inventario.stock_disponible), 0)).filter(
        Inventario.id_producto == id_producto,
        Inventario.talla == talla,
        Inventario.color == color
    ).scalar()
    return int(resultado or 0)


def obtener_o_crear_carrito_activo(db: Session, id_usuario: int) -> Carrito:
    """
    Obtiene el carrito activo del cliente o crea uno nuevo de inmediato.
    """
    carrito = db.query(Carrito).options(
        joinedload(Carrito.items).joinedload(CarritoItem.producto)
    ).filter(
        Carrito.id_usuario == id_usuario,
        Carrito.estado == "ACTIVO"
    ).first()

    if not carrito:
        carrito = Carrito(id_usuario=id_usuario, estado="ACTIVO")
        db.add(carrito)
        db.commit()
        db.refresh(carrito)

    return carrito


def construir_carrito_response(db: Session, carrito: Carrito) -> CarritoResponse:
    """
    Calcula subtotales, totales generales y existencias máximas para cada ítem.
    """
    items_response = []
    total_items = 0
    total_general = 0.0

    for it in (carrito.items or []):
        stock_max = consultar_stock_disponible_global(db, it.id_producto, it.talla, it.color)
        p_unit = float(it.precio_unitario)
        subtotal = round(p_unit * it.cantidad, 2)
        total_items += it.cantidad
        total_general += subtotal

        prod = it.producto
        items_response.append(
            CarritoItemResponse(
                id_item=it.id_item,
                id_producto=it.id_producto,
                nombre_producto=prod.nombre if prod else f"Producto #{it.id_producto}",
                codigo_sku_base=prod.codigo_sku_base if prod else f"SKU-{it.id_producto}",
                imagen_principal=prod.imagen_principal if prod else None,
                talla=it.talla,
                color=it.color,
                cantidad=it.cantidad,
                precio_unitario=p_unit,
                subtotal=subtotal,
                stock_maximo_disponible=stock_max
            )
        )

    return CarritoResponse(
        id_carrito=carrito.id_carrito,
        id_usuario=carrito.id_usuario,
        estado=carrito.estado,
        total_items=total_items,
        total_general=round(total_general, 2),
        items=items_response
    )


def obtener_carrito_usuario(db: Session, id_usuario: int) -> CarritoResponse:
    """
    Retorna el estado actual del carrito del usuario.
    """
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)
    return construir_carrito_response(db, carrito)


def agregar_item_carrito(db: Session, id_usuario: int, item_in: CarritoItemAdd) -> CarritoResponse:
    """
    CU13: Añade un producto al carrito previa validación atómica de existencias.
    Si ya existía en el carrito, incrementa la cantidad.
    """
    # 1. Validar existencia del producto
    producto = db.query(Producto).filter(Producto.id_producto == item_in.id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto #{item_in.id_producto} no fue encontrado."
        )

    # 2. Validación atómica de existencias
    stock_disponible = consultar_stock_disponible_global(db, item_in.id_producto, item_in.talla, item_in.color)
    
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)

    # Verificar si ya existe el ítem en el carrito con misma talla y color
    item_existente = db.query(CarritoItem).filter(
        CarritoItem.id_carrito == carrito.id_carrito,
        CarritoItem.id_producto == item_in.id_producto,
        CarritoItem.talla == item_in.talla,
        CarritoItem.color == item_in.color
    ).first()

    if item_existente:
        nueva_cantidad = item_existente.cantidad + item_in.cantidad
        if nueva_cantidad > stock_disponible:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Solo quedan {stock_disponible} unidades disponibles para {item_in.talla} / {item_in.color} (ya tienes {item_existente.cantidad} en tu carrito)."
            )
        item_existente.cantidad = nueva_cantidad
    else:
        if item_in.cantidad > stock_disponible:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Solo quedan {stock_disponible} unidades disponibles para {item_in.talla} / {item_in.color}."
            )
        nuevo_item = CarritoItem(
            id_carrito=carrito.id_carrito,
            id_producto=item_in.id_producto,
            talla=item_in.talla,
            color=item_in.color,
            cantidad=item_in.cantidad,
            precio_unitario=producto.precio_base
        )
        db.add(nuevo_item)

    db.commit()
    db.refresh(carrito)
    return construir_carrito_response(db, carrito)


def actualizar_cantidad_item(db: Session, id_usuario: int, id_item: int, nueva_cantidad: int) -> CarritoResponse:
    """
    CU13: Actualiza la cantidad de un ítem existente con validación de stock.
    """
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)

    item = db.query(CarritoItem).filter(
        CarritoItem.id_item == id_item,
        CarritoItem.id_carrito == carrito.id_carrito
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ítem del carrito no encontrado."
        )

    # Validar existencias
    stock_disponible = consultar_stock_disponible_global(db, item.id_producto, item.talla, item.color)
    if nueva_cantidad > stock_disponible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock máximo alcanzado. Solo disponemos de {stock_disponible} unidades en existencia."
        )

    item.cantidad = nueva_cantidad
    db.commit()
    db.refresh(carrito)
    return construir_carrito_response(db, carrito)


def eliminar_item_carrito(db: Session, id_usuario: int, id_item: int) -> CarritoResponse:
    """
    CU13: Remueve un ítem específico del carrito del cliente.
    """
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)

    item = db.query(CarritoItem).filter(
        CarritoItem.id_item == id_item,
        CarritoItem.id_carrito == carrito.id_carrito
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ítem del carrito no encontrado."
        )

    db.delete(item)
    db.commit()
    db.refresh(carrito)
    return construir_carrito_response(db, carrito)


def vaciar_carrito(db: Session, id_usuario: int) -> CarritoResponse:
    """
    CU13: Limpia todos los productos del carrito del cliente.
    """
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)

    db.query(CarritoItem).filter(
        CarritoItem.id_carrito == carrito.id_carrito
    ).delete(synchronize_session=False)

    db.commit()
    db.refresh(carrito)
    return construir_carrito_response(db, carrito)
