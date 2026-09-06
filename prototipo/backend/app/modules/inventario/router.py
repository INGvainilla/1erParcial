# -*- coding: utf-8 -*-
"""
Enrutador de API: Inventario Multi-Sucursal y Costos Ponderados (M06 - CU09)
Comentado paso a paso conforme al caso de uso CU09.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.inventario.schemas import (
    EntradaLoteCreate, KardexResponse, InventarioResponse
)
from app.modules.inventario.service import InventarioControl

router = APIRouter(prefix="/inventario", tags=["Gestión de Inventario y Costos (CU09)"])

@router.post("/entradas", response_model=KardexResponse, status_code=status.HTTP_201_CREATED)
def registrar_entrada_lote_endpoint(
    request: EntradaLoteCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU09 - Registrar Entrada de Lote y Recalcular CPP
    # Paso 1: Personal de logística envía lote recepcionado con costo unitario de compra
    # Paso 1.1: Invocación a InventarioControl.procesar_entrada_mercaderia()
    return InventarioControl.procesar_entrada_mercaderia(db, request)

@router.get("/stock", response_model=List[InventarioResponse])
def consultar_stock_endpoint(
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU09 - Consulta de Existencias Multi-Sucursal
    # Paso 1: Consulta de stock físico, reservado y disponible con CPP valuado
    return InventarioControl.consultar_stock(db, id_sucursal=id_sucursal, id_producto=id_producto)

@router.get("/kardex", response_model=List[KardexResponse])
def consultar_kardex_endpoint(
    id_inventario: Optional[int] = Query(None, description="Filtrar por registro de inventario"),
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU09 - Consulta de Asientos de Kardex Inmutable
    # Paso 1: Auditoría de movimientos con saldos físicos y valuación por CPP
    return InventarioControl.consultar_kardex(
        db, id_inventario=id_inventario, id_sucursal=id_sucursal, id_producto=id_producto
    )
