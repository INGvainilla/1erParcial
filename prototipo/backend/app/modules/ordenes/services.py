# -*- coding: utf-8 -*-
"""
Capa de Servicio y Transaccionalidad ACID para Órdenes y Checkout (CU14)
"""
from datetime import datetime
import uuid
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.modules.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.ordenes.schemas import (
    OrdenCreateRequest, OrdenResponse, OrdenDetalleResponse
)
from app.modules.carrito.models import Carrito, CarritoItem
from app.modules.carrito.services import (
    consultar_stock_disponible_global,
    obtener_o_crear_carrito_activo
)
from app.modules.sucursales.models import Sucursal


def construir_orden_response(orden: OrdenVenta) -> OrdenResponse:
    """
    Construye el DTO de respuesta para una orden de venta.
    """
    detalles_dto = []
    for d in (orden.detalles or []):
        detalles_dto.append(
            OrdenDetalleResponse(
                id_detalle_orden=d.id_detalle_orden,
                id_producto=d.id_producto,
                nombre_producto=d.producto.nombre if d.producto else f"Producto #{d.id_producto}",
                codigo_sku_base=d.producto.codigo_sku_base if d.producto else f"SKU-{d.id_producto}",
                imagen_principal=d.producto.imagen_principal if d.producto else None,
                talla=d.talla,
                color=d.color,
                cantidad=d.cantidad,
                precio_unitario=float(d.precio_unitario),
                subtotal=float(d.subtotal)
            )
        )

    nombre_suc = orden.sucursal.nombre_sucursal if orden.sucursal else None

    return OrdenResponse(
        id_orden=orden.id_orden,
        id_usuario=orden.id_usuario,
        id_sucursal=orden.id_sucursal,
        nombre_sucursal=nombre_suc,
        numero_factura=orden.numero_factura,
        canal_venta=orden.canal_venta,
        modalidad_entrega=orden.modalidad_entrega,
        direccion_envio=orden.direccion_envio,
        telefono_contacto=orden.telefono_contacto,
        nit_factura=orden.nit_factura,
        razon_social_factura=orden.razon_social_factura,
        notas_entrega=orden.notas_entrega,
        subtotal=float(orden.subtotal),
        costo_envio=float(orden.costo_envio),
        total=float(orden.total),
        estado_pago=orden.estado_pago,
        estado_logistica=orden.estado_logistica,
        creado_en=orden.creado_en,
        detalles=detalles_dto
    )


def crear_orden_desde_carrito(db: Session, id_usuario: int, orden_in: OrdenCreateRequest) -> OrdenResponse:
    """
    CU14: Formaliza el checkout trasladando transaccionalmente los ítems del carrito
    a una Orden de Venta oficial. Valida existencias y vacía el carrito.
    """
    # 1. Recuperar Carrito Activo
    carrito = obtener_o_crear_carrito_activo(db, id_usuario)
    if not carrito.items or len(carrito.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu carrito de compras está vacío. Añade prendas al carrito antes de proceder al checkout."
        )

    # 2. Validar Modalidad de Entrega y Costo de Envío
    modalidad = orden_in.modalidad_entrega.strip().upper()
    costo_envio = Decimal("0.00")
    sucursal_id = None

    if modalidad == "RETIRO_TIENDA":
        if not orden_in.id_sucursal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes seleccionar una sucursal física para el retiro de tu compra."
            )
        sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == orden_in.id_sucursal).first()
        if not sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La sucursal #{orden_in.id_sucursal} no existe en la red."
            )
        sucursal_id = sucursal.id_sucursal
        costo_envio = Decimal("0.00")

    elif modalidad == "DELIVERY":
        if not orden_in.direccion_envio or not orden_in.direccion_envio.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes ingresar la dirección completa de entrega a domicilio."
            )
        # Tarifa plana inicial de logística de delivery en Bolivia (Ciclo 2)
        costo_envio = Decimal("25.00")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Modalidad de entrega no válida. Debe ser 'DELIVERY' o 'RETIRO_TIENDA'."
        )

    # Validar campos de facturación obligatorios
    if not orden_in.nit_factura or not orden_in.nit_factura.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El NIT o Carnet de Identidad para la factura es obligatorio."
        )
    if not orden_in.razon_social_factura or not orden_in.razon_social_factura.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La Razón Social o Nombre para la factura es obligatoria."
        )

    # 3. Validación de Stock Atómica (Doble Check Concurrente)
    for it in carrito.items:
        stock_real = consultar_stock_disponible_global(db, it.id_producto, it.talla, it.color)
        if it.cantidad > stock_real:
            nombre_p = it.producto.nombre if it.producto else f"Producto #{it.id_producto}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{nombre_p}' ({it.talla} / {it.color}). Quedan {stock_real} unidades disponibles en la red y solicitas {it.cantidad}."
            )

    # 4. Inserción Transaccional Atómica (ACID)
    try:
        subtotal_acum = Decimal("0.00")
        detalles_a_crear = []

        for it in carrito.items:
            precio_u = Decimal(str(it.precio_unitario))
            sub_linea = precio_u * Decimal(it.cantidad)
            subtotal_acum += sub_linea

            detalles_a_crear.append({
                "id_producto": it.id_producto,
                "talla": it.talla,
                "color": it.color,
                "cantidad": it.cantidad,
                "precio_unitario": precio_u,
                "subtotal": sub_linea
            })

        total_orden = subtotal_acum + costo_envio
        correlativo_fac = f"FAC-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"

        # Crear cabecera de orden
        nueva_orden = OrdenVenta(
            id_usuario=id_usuario,
            id_sucursal=sucursal_id,
            numero_factura=correlativo_fac,
            canal_venta="WEB",
            modalidad_entrega=modalidad,
            direccion_envio=orden_in.direccion_envio.strip() if orden_in.direccion_envio else None,
            telefono_contacto=orden_in.telefono_contacto.strip() if orden_in.telefono_contacto else None,
            nit_factura=orden_in.nit_factura.strip(),
            razon_social_factura=orden_in.razon_social_factura.strip(),
            notas_entrega=orden_in.notas_entrega.strip() if orden_in.notas_entrega else None,
            subtotal=subtotal_acum,
            costo_envio=costo_envio,
            total=total_orden,
            estado_pago="PENDIENTE",
            estado_logistica="CREADA"
        )
        db.add(nueva_orden)
        db.flush()

        # Insertar detalles asociados
        for d in detalles_a_crear:
            det = OrdenDetalle(
                id_orden=nueva_orden.id_orden,
                id_producto=d["id_producto"],
                talla=d["talla"],
                color=d["color"],
                cantidad=d["cantidad"],
                precio_unitario=d["precio_unitario"],
                subtotal=d["subtotal"]
            )
            db.add(det)

        # 5. Crucial: Vaciar el Carrito del Usuario tras formalizar la orden
        db.query(CarritoItem).filter(
            CarritoItem.id_carrito == carrito.id_carrito
        ).delete(synchronize_session=False)

        db.commit()
        db.refresh(nueva_orden)
        return construir_orden_response(nueva_orden)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al procesar la orden: {str(e)}"
        )


def obtener_orden_por_id(db: Session, id_orden: int, id_usuario: int) -> OrdenResponse:
    """
    Recupera los detalles de una orden creada por su ID.
    Verifica que pertenezca al usuario (o admin).
    """
    orden = db.query(OrdenVenta).options(
        joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto),
        joinedload(OrdenVenta.sucursal)
    ).filter(OrdenVenta.id_orden == id_orden).first()

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden #{id_orden} no encontrada."
        )

    if orden.id_usuario != id_usuario:
        # Verificar si es admin
        from app.modules.auth.models import Usuario
        user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not user or user.rol != "ADMINISTRADOR":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes autorización para consultar esta orden."
            )

    return construir_orden_response(orden)
