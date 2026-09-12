# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.auth.models import Usuario
from app.modules.sucursales.models import Sucursal
from app.modules.reservas.schemas import (
    ReservaCreate, ReservaResponse, ReservaEstadoUpdate,
    ReservaQrScanRequest, ReservaEncargadoResponse
)
from app.modules.reservas.services import (
    crear_reserva, listar_reservas_sucursal_hoy,
    actualizar_estado_reserva, validar_y_atender_qr
)

router = APIRouter(prefix="/reservas", tags=["Reservas (CU11 y CU12)"])

# ==========================================
# CU11: SOLICITAR RESERVA COMO CLIENTE
# ==========================================

@router.post("", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def solicitar_reserva_endpoint(
    reserva_in: ReservaCreate,
    current_user: Usuario = Depends(require_roles(["CLIENTE", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    Endpoint para que un cliente autenticado solicite una reserva en una sucursal.
    """
    return crear_reserva(db=db, reserva_in=reserva_in, id_usuario=current_user.id_usuario)


# ==========================================
# CU12: PREPARAR Y ATENDER RESERVA PRESENCIAL (ENCARGADO)
# ==========================================

@router.get("/sucursal/hoy", response_model=List[ReservaEncargadoResponse])
def obtener_reservas_hoy_endpoint(
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal específica (solo Admin)"),
    current_user: Usuario = Depends(require_roles(["ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    Lista las reservas del día de hoy para la sucursal del encargado autenticado.
    Si es Administrador y no tiene sucursal fija, toma la solicitada o la primera activa.
    """
    target_sucursal = current_user.id_sucursal or id_sucursal
    if not target_sucursal and current_user.rol == "ADMINISTRADOR":
        primera = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").first()
        if primera:
            target_sucursal = primera.id_sucursal

    if not target_sucursal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta no está asociada a ninguna sucursal."
        )
    
    reservas = listar_reservas_sucursal_hoy(db=db, id_sucursal=target_sucursal)
    
    # Enriquecer con nombre del cliente
    resultado = []
    for r in reservas:
        data = ReservaEncargadoResponse.model_validate(r)
        if r.usuario:
            data.nombre_cliente = f"{r.usuario.nombres} {r.usuario.apellidos}" if hasattr(r.usuario, 'nombres') else "Cliente"
        resultado.append(data)
    
    return resultado


@router.patch("/{id_reserva}/estado", response_model=ReservaResponse)
def cambiar_estado_reserva_endpoint(
    id_reserva: int,
    estado_in: ReservaEstadoUpdate,
    current_user: Usuario = Depends(require_roles(["ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    Actualiza el estado de una reserva (ej. PENDIENTE -> PREPARADA).
    Solo el encargado de la sucursal dueña de la reserva (o un administrador) puede realizarlo.
    """
    id_sucursal = current_user.id_sucursal
    es_admin = (current_user.rol == "ADMINISTRADOR")
    if not id_sucursal and not es_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta no está asociada a ninguna sucursal."
        )
    return actualizar_estado_reserva(
        db=db,
        id_reserva=id_reserva,
        nuevo_estado=estado_in.estado,
        id_sucursal=id_sucursal,
        es_admin=es_admin
    )


@router.post("/escanear-qr", response_model=ReservaEncargadoResponse)
def escanear_qr_endpoint(
    qr_in: ReservaQrScanRequest,
    current_user: Usuario = Depends(require_roles(["ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    Recibe el texto del QR escaneado (o ID), busca la reserva, la valida y la marca como ATENDIDA.
    """
    id_sucursal = current_user.id_sucursal
    es_admin = (current_user.rol == "ADMINISTRADOR")
    if not id_sucursal and not es_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta no está asociada a ninguna sucursal."
        )
    
    reserva = validar_y_atender_qr(
        db=db,
        codigo_qr=qr_in.codigo_qr,
        id_sucursal=id_sucursal,
        es_admin=es_admin
    )
    
    data = ReservaEncargadoResponse.model_validate(reserva)
    if reserva.usuario:
        data.nombre_cliente = f"{reserva.usuario.nombres} {reserva.usuario.apellidos}" if hasattr(reserva.usuario, 'nombres') else "Cliente"
    
    return data
