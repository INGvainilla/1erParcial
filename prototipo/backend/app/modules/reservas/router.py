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
    actualizar_estado_reserva, validar_y_atender_qr,
    listar_mis_reservas, obtener_reserva_por_id
)

router = APIRouter(prefix="/reservas", tags=["Reservas (CU11 y CU12)"])

# ==========================================
# CU11: SOLICITAR Y CONSULTAR RESERVA (CLIENTE)
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


@router.get("/mis-reservas", response_model=List[ReservaResponse])
def listar_mis_reservas_endpoint(
    current_user: Usuario = Depends(require_roles(["CLIENTE", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU11: Permite al cliente autenticado consultar todas sus reservas activas y pasadas con su código QR.
    """
    return listar_mis_reservas(db=db, id_usuario=current_user.id_usuario)


@router.get("/{id_reserva}", response_model=ReservaResponse)
def obtener_reserva_detalle_endpoint(
    id_reserva: int,
    current_user: Usuario = Depends(require_roles(["CLIENTE", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU11: Permite consultar el ticket QR y detalle de una reserva específica por su ID.
    """
    es_admin = current_user.rol in ["ADMINISTRADOR", "ENCARGADO_SUCURSAL"]
    return obtener_reserva_por_id(db=db, id_reserva=id_reserva, id_usuario=current_user.id_usuario, es_admin=es_admin)



# ==========================================
# CU12: PREPARAR Y ATENDER RESERVA PRESENCIAL (ENCARGADO)
# ==========================================

@router.get("/sucursal/hoy", response_model=List[ReservaEncargadoResponse])
def obtener_reservas_hoy_endpoint(
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal específica (solo Admin)"),
    fecha: Optional[str] = Query("hoy", description="Filtro de fecha: 'hoy', 'todas', 'proximas', o 'YYYY-MM-DD'"),
    current_user: Usuario = Depends(require_roles(["ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU12: Lista las reservas del día (o fecha/rango seleccionado) para la sucursal del encargado autenticado.
    Si es Administrador, puede filtrar por sucursal específica o ver todas.
    """
    es_admin = (current_user.rol == "ADMINISTRADOR")
    target_sucursal = current_user.id_sucursal or id_sucursal

    # Si es encargado y no tiene sucursal asociada: error
    if not es_admin and not target_sucursal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta no está asociada a ninguna sucursal."
        )
    
    reservas = listar_reservas_sucursal_hoy(db=db, id_sucursal=target_sucursal, fecha_filtro=fecha)
    
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
