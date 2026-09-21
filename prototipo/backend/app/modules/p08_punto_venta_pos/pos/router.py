# -*- coding: utf-8 -*-
"""
Controlador / Router: Terminal de Punto de Venta en Caja (CU15 - M13)
"""
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p08_punto_venta_pos.pos.schemas import (
    PosVentaCreate, PosProductoLookupResponse,
    PosReservaLoadResponse, PosTicketResponse,
    TicketConsultaResponse, DevolucionCreate, DevolucionTicketResponse
)
from app.modules.p08_punto_venta_pos.pos.services import (
    buscar_producto_por_sku,
    cargar_reserva_para_pos,
    procesar_venta_pos,
    consultar_ticket_para_devolucion,
    procesar_devolucion_pos
)

router = APIRouter(prefix="/pos", tags=["Punto de Venta POS y Devoluciones (CU15, CU25)"])


def resolver_sucursal_usuario(current_user: Usuario, db: Session, id_sucursal_param: Optional[int] = None) -> int:
    """Resuelve la sucursal activa del cajero o encargado (o sucursal por defecto para Admin)"""
    id_suc = current_user.id_sucursal or id_sucursal_param
    if not id_suc and current_user.rol == "ADMINISTRADOR":
        primera = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").first()
        if primera:
            id_suc = primera.id_sucursal

    if not id_suc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu usuario no tiene una sucursal física asignada para operar la caja."
        )
    return id_suc


@router.get("/productos/{sku}", response_model=PosProductoLookupResponse)
def buscar_producto_endpoint(
    sku: str,
    id_sucursal: Optional[int] = Query(None, description="Sucursal para verificar existencias"),
    current_user: Usuario = Depends(require_roles(["CAJERO", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU15: Busca un producto por SKU o código de barras y devuelve sus atributos y stock en la sucursal actual.
    """
    suc_id = resolver_sucursal_usuario(current_user, db, id_sucursal)
    return buscar_producto_por_sku(db=db, sku=sku, id_sucursal=suc_id)


@router.get("/reservas/{codigo_qr}", response_model=PosReservaLoadResponse)
def cargar_reserva_endpoint(
    codigo_qr: str,
    id_sucursal: Optional[int] = Query(None, description="Sucursal de la caja"),
    current_user: Usuario = Depends(require_roles(["CAJERO", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU15: Carga una reserva previa por su código QR o ID para transformarla en venta en mostrador.
    """
    suc_id = resolver_sucursal_usuario(current_user, db, id_sucursal)
    return cargar_reserva_para_pos(db=db, codigo_qr=codigo_qr, id_sucursal=suc_id)


@router.post("/venta", response_model=PosTicketResponse, status_code=status.HTTP_201_CREATED)
def procesar_venta_endpoint(
    venta_in: PosVentaCreate,
    id_sucursal: Optional[int] = Query(None, description="Sucursal de la caja"),
    current_user: Usuario = Depends(require_roles(["CAJERO", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU15: Registra la venta física presencial, descuenta inventario de la sucursal,
    crea el asiento en Kardex y retorna el ticket fiscal oficial con el cambio.
    """
    suc_id = resolver_sucursal_usuario(current_user, db, id_sucursal)
    cajero_nombre = f"{current_user.nombres} {current_user.apellidos}".strip()

    return procesar_venta_pos(
        db=db,
        id_cajero=current_user.id_usuario,
        id_sucursal=suc_id,
        cajero_nombre=cajero_nombre,
        venta_in=venta_in
    )


# ============================================================================
# ENDPOINTS CU25: Devoluciones y Cambios de Prendas
# ============================================================================

@router.get("/devoluciones/ticket/{nro_ticket}", response_model=TicketConsultaResponse)
def consultar_ticket_devolucion_endpoint(
    nro_ticket: str,
    current_user: Usuario = Depends(require_roles(["CAJERO", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU25: Consulta un ticket fiscal para trámite de devolución o cambio de prendas.
    Valida el límite de 14 días calendario y devuelve el detalle de prendas con sus costos históricos CPP.
    """
    return consultar_ticket_para_devolucion(db=db, nro_ticket=nro_ticket)


@router.post("/devoluciones", response_model=DevolucionTicketResponse, status_code=status.HTTP_201_CREATED)
def procesar_devolucion_endpoint(
    dev_in: DevolucionCreate,
    id_sucursal: Optional[int] = Query(None, description="Sucursal de la caja"),
    current_user: Usuario = Depends(require_roles(["CAJERO", "ENCARGADO_SUCURSAL", "ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    """
    CU25: Procesa la devolución o cambio de prenda en mostrador:
    - Valida ventana de 14 días calendario.
    - Inspección física (Apto para venta vs Defectuoso).
    - Asienta reingreso inmutable al Kardex valorado al CPP histórico.
    - Liquida la compensación: Cambio de prenda (matriz de factor de talla), Vale de crédito o Reembolso.
    """
    suc_id = resolver_sucursal_usuario(current_user, db, id_sucursal)
    cajero_nombre = f"{current_user.nombres} {current_user.apellidos}".strip()

    return procesar_devolucion_pos(
        db=db,
        id_cajero=current_user.id_usuario,
        id_sucursal=suc_id,
        cajero_nombre=cajero_nombre,
        dev_in=dev_in
    )
