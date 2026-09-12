# -*- coding: utf-8 -*-
"""
Enrutador de API REST para Logística y Despacho de Delivery (CU18)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.logistica.schemas import (
    LogisticaOrdenResponse, AsignarRepartidorRequest, CambioEstadoLogistica,
    TrackingResponse, CalcularTarifaRequest, CalcularTarifaResponse
)
from app.modules.logistica.services import (
    listar_ordenes_delivery, transicionar_estado_logistica,
    asignar_repartidor_a_orden, obtener_tracking_cliente,
    listar_repartidores_disponibles
)
from app.modules.logistica.geo import calcular_distancia_haversine, calcular_tarifa_delivery

router = APIRouter(prefix="/logistica", tags=["Logística y Despacho de Delivery (CU18)"])


@router.get("/ordenes", response_model=List[LogisticaOrdenResponse])
def get_ordenes_logistica(
    estado: Optional[str] = Query(None, description="Filtro opcional por estado logístico"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"]))
):
    """
    Retorna el listado de órdenes en modalidad DELIVERY que ya fueron pagadas (CU16).
    Utilizado por el Tablero Kanban de Logística (CU18).
    """
    return listar_ordenes_delivery(db, estado_filtro=estado)


@router.post("/ordenes/{id_orden}/asignar", response_model=LogisticaOrdenResponse)
def asignar_repartidor_orden(
    id_orden: int,
    request: AsignarRepartidorRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"]))
):
    """
    Asigna un repartidor o empresa de courier a la orden.
    Si la orden estaba en 'LISTO_DESPACHO', pasa a 'EN_TRANSITO'.
    """
    return asignar_repartidor_a_orden(db, id_orden, request)


@router.patch("/ordenes/{id_orden}/estado", response_model=LogisticaOrdenResponse)
def cambiar_estado_orden_logistica(
    id_orden: int,
    request: CambioEstadoLogistica,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"]))
):
    """
    Avanza el estado logístico de la orden siguiendo la máquina de estados finita:
    CREADA -> PREPARACION -> LISTO_DESPACHO -> EN_TRANSITO -> ENTREGADA.
    Si el salto es ilegal, responde HTTP 409 Conflict.
    """
    return transicionar_estado_logistica(db, id_orden, request.nuevo_estado)


@router.get("/repartidores")
def get_repartidores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA"]))
):
    """
    Lista los conductores y couriers registrados disponibles para asignación.
    """
    return listar_repartidores_disponibles(db)


@router.post("/calcular-tarifa", response_model=CalcularTarifaResponse)
def calcular_tarifa_haversine(request: CalcularTarifaRequest):
    """
    Endpoint utilitario: Calcula la distancia geodésica mediante Haversine y
    el costo tarifado de envío según la distancia en kilómetros.
    """
    distancia = calcular_distancia_haversine(
        request.latitud_origen, request.longitud_origen,
        request.latitud_destino, request.longitud_destino
    )
    costo = calcular_tarifa_delivery(distancia)
    
    # Estimación de tiempo aproximado: 15 min de preparación + 4 min por Km en ciudad
    tiempo_estimado = int(round(15 + (distancia * 4)))

    return CalcularTarifaResponse(
        distancia_km=distancia,
        costo_envio=costo,
        tiempo_estimado_minutos=tiempo_estimado
    )


@router.get("/tracking/{id_orden}", response_model=TrackingResponse)
def get_tracking_orden(
    id_orden: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint de seguimiento público o del cliente:
    Retorna el estado de progreso logístico, pasos completados, repartidor y prendas.
    """
    return obtener_tracking_cliente(db, id_orden)
