# -*- coding: utf-8 -*-
"""
Capa de Servicio para Gestión de Despacho y Logística de Delivery (CU18)
Implementa la máquina de estados finita estricta con HTTP 409 Conflict.
"""
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.modules.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.sucursales.models import Sucursal
from app.modules.auth.models import Usuario
from app.modules.logistica.schemas import (
    LogisticaOrdenResponse, PrendaEmpaqueItem,
    TrackingResponse, TrackingPaso, AsignarRepartidorRequest
)
from app.modules.logistica.geo import calcular_distancia_haversine, calcular_tarifa_delivery

# Definición de la Máquina de Estados Finita Estricta
TRANSICIONES_PERMITIDAS = {
    "CREADA": ["PREPARACION"],
    "PREPARACION": ["LISTO_DESPACHO"],
    "LISTO_DESPACHO": ["EN_TRANSITO"],
    "EN_TRANSITO": ["ENTREGADA"],
    "ENTREGADA": []  # Estado terminal
}

def formatear_orden_logistica(orden: OrdenVenta) -> LogisticaOrdenResponse:
    prendas = []
    for d in (orden.detalles or []):
        prendas.append(PrendaEmpaqueItem(
            id_detalle_orden=d.id_detalle_orden,
            id_producto=d.id_producto,
            nombre_producto=d.producto.nombre if d.producto else f"Producto #{d.id_producto}",
            codigo_sku_base=d.producto.codigo_sku_base if d.producto else f"SKU-{d.id_producto}",
            imagen_principal=d.producto.imagen_principal if d.producto else None,
            talla=d.talla,
            color=d.color,
            cantidad=d.cantidad
        ))

    nombre_cliente = None
    if orden.usuario:
        nombre_cliente = f"{orden.usuario.nombres} {orden.usuario.apellidos}".strip()
    elif orden.razon_social_factura:
        nombre_cliente = orden.razon_social_factura

    nombre_suc = orden.sucursal.nombre_sucursal if orden.sucursal else "Almacén Central"

    return LogisticaOrdenResponse(
        id_orden=orden.id_orden,
        numero_factura=orden.numero_factura,
        canal_venta=orden.canal_venta,
        modalidad_entrega=orden.modalidad_entrega,
        id_usuario=orden.id_usuario,
        nombre_cliente=nombre_cliente,
        telefono_contacto=orden.telefono_contacto,
        direccion_envio=orden.direccion_envio,
        notas_entrega=orden.notas_entrega,
        latitud_destino=float(orden.latitud_destino) if orden.latitud_destino is not None else None,
        longitud_destino=float(orden.longitud_destino) if orden.longitud_destino is not None else None,
        distancia_km=float(orden.distancia_km) if orden.distancia_km is not None else None,
        costo_envio=float(orden.costo_envio),
        total=float(orden.total),
        estado_pago=orden.estado_pago,
        estado_logistica=orden.estado_logistica,
        creado_en=orden.creado_en,
        id_repartidor=orden.id_repartidor,
        nombre_repartidor=orden.nombre_repartidor,
        telefono_repartidor=orden.telefono_repartidor,
        id_sucursal=orden.id_sucursal,
        nombre_sucursal=nombre_suc,
        prendas=prendas
    )


def listar_ordenes_delivery(db: Session, estado_filtro: Optional[str] = None) -> List[LogisticaOrdenResponse]:
    """
    Retorna todas las órdenes con modalidad DELIVERY y estado de pago PAGADO.
    Opcionalmente filtra por estado_logistica.
    """
    query = (
        db.query(OrdenVenta)
        .options(
            joinedload(OrdenVenta.usuario),
            joinedload(OrdenVenta.sucursal),
            joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
        )
        .filter(
            OrdenVenta.modalidad_entrega == "DELIVERY",
            OrdenVenta.estado_pago == "PAGADO"
        )
    )

    if estado_filtro:
        query = query.filter(OrdenVenta.estado_logistica == estado_filtro)

    ordenes = query.order_by(OrdenVenta.id_orden.desc()).all()
    return [formatear_orden_logistica(o) for o in ordenes]


def transicionar_estado_logistica(db: Session, id_orden: int, nuevo_estado: str) -> LogisticaOrdenResponse:
    """
    Ejecuta el avance de estado logístico respetando la máquina de estados finita.
    Si el salto no es válido según TRANSICIONES_PERMITIDAS, arroja HTTP 409 Conflict.
    """
    orden = (
        db.query(OrdenVenta)
        .options(
            joinedload(OrdenVenta.usuario),
            joinedload(OrdenVenta.sucursal),
            joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
        )
        .filter(OrdenVenta.id_orden == id_orden)
        .first()
    )

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La orden #{id_orden} no existe en el sistema."
        )

    if orden.modalidad_entrega != "DELIVERY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden #{id_orden} tiene modalidad '{orden.modalidad_entrega}'. El flujo logístico de despacho aplica solo a órdenes DELIVERY."
        )

    estado_actual = orden.estado_logistica
    nuevo_estado_clean = nuevo_estado.strip().upper()

    if nuevo_estado_clean == estado_actual:
        # Idempotente
        return formatear_orden_logistica(orden)

    permitidos = TRANSICIONES_PERMITIDAS.get(estado_actual, [])

    if nuevo_estado_clean not in permitidos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Transición no permitida: No se puede cambiar el estado de '{estado_actual}' "
                f"a '{nuevo_estado_clean}'. "
                f"Las transiciones válidas desde '{estado_actual}' son: {permitidos if permitidos else 'Ninguna (Estado final)'}."
            )
        )

    # Validar prerrequisito de asignación para entrar en tránsito
    if nuevo_estado_clean == "EN_TRANSITO" and not orden.nombre_repartidor:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede poner la orden 'EN_TRANSITO' sin haber asignado previamente un repartidor o courier."
        )

    orden.estado_logistica = nuevo_estado_clean
    db.commit()
    db.refresh(orden)
    return formatear_orden_logistica(orden)


def asignar_repartidor_a_orden(db: Session, id_orden: int, request: AsignarRepartidorRequest) -> LogisticaOrdenResponse:
    """
    Asigna un repartidor o empresa de courier a una orden.
    Si la orden se encontraba en 'LISTO_DESPACHO', opcionalmente se transiciona a 'EN_TRANSITO'.
    """
    orden = (
        db.query(OrdenVenta)
        .options(
            joinedload(OrdenVenta.usuario),
            joinedload(OrdenVenta.sucursal),
            joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
        )
        .filter(OrdenVenta.id_orden == id_orden)
        .first()
    )

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La orden #{id_orden} no existe en el sistema."
        )

    if orden.modalidad_entrega != "DELIVERY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden #{id_orden} no corresponde a despacho por delivery."
        )

    orden.id_repartidor = request.id_repartidor
    orden.nombre_repartidor = request.nombre_repartidor.strip()
    if request.telefono_repartidor:
        orden.telefono_repartidor = request.telefono_repartidor.strip()

    # Si la orden estaba lista para despacho, al asignarla avanza a EN_TRANSITO automáticamente
    if orden.estado_logistica == "LISTO_DESPACHO":
        orden.estado_logistica = "EN_TRANSITO"

    db.commit()
    db.refresh(orden)
    return formatear_orden_logistica(orden)


def obtener_tracking_cliente(db: Session, id_orden: int) -> TrackingResponse:
    """
    Genera el estado en tiempo real para la vista de Tracking del Cliente (CU18).
    Incluye los 4 pasos del Stepper y el porcentaje de progreso acumulado.
    """
    orden = (
        db.query(OrdenVenta)
        .options(
            joinedload(OrdenVenta.usuario),
            joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
        )
        .filter(OrdenVenta.id_orden == id_orden)
        .first()
    )

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró información de tracking para la orden #{id_orden}."
        )

    estado = orden.estado_logistica
    
    # Secuencia de pasos
    # 1. Pago Confirmado
    # 2. En Preparación / Empacando
    # 3. Listo para Despacho
    # 4. En Camino (Delivery)
    # 5. Entregado

    pasos = [
        TrackingPaso(
            codigo="PAGADO",
            titulo="Pago Confirmado",
            descripcion="Tu pago fue procesado exitosamente y la orden fue emitida.",
            completado=orden.estado_pago == "PAGADO",
            activo=orden.estado_logistica == "CREADA",
            icono="fas fa-receipt"
        ),
        TrackingPaso(
            codigo="PREPARACION",
            titulo="En Empaque",
            descripcion="El equipo de almacén está seleccionando y empaquetando tus prendas.",
            completado=estado in ["PREPARACION", "LISTO_DESPACHO", "EN_TRANSITO", "ENTREGADA"],
            activo=estado == "PREPARACION",
            icono="fas fa-box-open"
        ),
        TrackingPaso(
            codigo="LISTO_DESPACHO",
            titulo="Listo para Despacho",
            descripcion="Paquete embalado con precinto de seguridad, a la espera del courier.",
            completado=estado in ["LISTO_DESPACHO", "EN_TRANSITO", "ENTREGADA"],
            activo=estado == "LISTO_DESPACHO",
            icono="fas fa-dolly"
        ),
        TrackingPaso(
            codigo="EN_TRANSITO",
            titulo="En Camino",
            descripcion=f"El repartidor {orden.nombre_repartidor or ''} va en camino a tu domicilio." if orden.nombre_repartidor else "El repartidor va en camino a tu domicilio.",
            completado=estado in ["EN_TRANSITO", "ENTREGADA"],
            activo=estado == "EN_TRANSITO",
            icono="fas fa-motorcycle"
        ),
        TrackingPaso(
            codigo="ENTREGADA",
            titulo="Entregado",
            descripcion="¡Pedido entregado satisfactoriamente en destino!",
            completado=estado == "ENTREGADA",
            activo=estado == "ENTREGADA",
            icono="fas fa-check-circle"
        )
    ]

    porcentaje_map = {
        "CREADA": 20,
        "PREPARACION": 40,
        "LISTO_DESPACHO": 60,
        "EN_TRANSITO": 85,
        "ENTREGADA": 100
    }
    porcentaje = porcentaje_map.get(estado, 10)

    prendas = []
    for d in (orden.detalles or []):
        prendas.append(PrendaEmpaqueItem(
            id_detalle_orden=d.id_detalle_orden,
            id_producto=d.id_producto,
            nombre_producto=d.producto.nombre if d.producto else f"Producto #{d.id_producto}",
            codigo_sku_base=d.producto.codigo_sku_base if d.producto else f"SKU-{d.id_producto}",
            imagen_principal=d.producto.imagen_principal if d.producto else None,
            talla=d.talla,
            color=d.color,
            cantidad=d.cantidad
        ))

    nombre_cliente = None
    if orden.usuario:
        nombre_cliente = f"{orden.usuario.nombres} {orden.usuario.apellidos}".strip()
    elif orden.razon_social_factura:
        nombre_cliente = orden.razon_social_factura

    return TrackingResponse(
        id_orden=orden.id_orden,
        numero_factura=orden.numero_factura,
        estado_pago=orden.estado_pago,
        estado_logistica=orden.estado_logistica,
        direccion_envio=orden.direccion_envio,
        nombre_cliente=nombre_cliente,
        nombre_repartidor=orden.nombre_repartidor,
        telefono_repartidor=orden.telefono_repartidor,
        distancia_km=float(orden.distancia_km) if orden.distancia_km is not None else None,
        costo_envio=float(orden.costo_envio),
        total=float(orden.total),
        creado_en=orden.creado_en,
        porcentaje_progreso=porcentaje,
        pasos=pasos,
        prendas=prendas
    )


def listar_repartidores_disponibles(db: Session):
    """
    Retorna los usuarios con rol de repartidor o logística que pueden ser asignados a entregas.
    """
    usuarios = db.query(Usuario).filter(Usuario.activo == True).all()
    # Retornar usuarios con rol LOGISTICA o REPARTIDOR o personal interno
    repartidores = [
        {
            "id_usuario": u.id_usuario,
            "nombre_completo": f"{u.nombres} {u.apellidos}".strip(),
            "email": u.email,
            "telefono": u.telefono or "70000000",
            "rol": u.rol
        }
        for u in usuarios if u.rol in ["LOGISTICA", "REPARTIDOR", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"]
    ]
    return repartidores
