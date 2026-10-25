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
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p05_inventario_costos_analitica.inventario.schemas import (
    EntradaLoteCreate, KardexResponse, InventarioResponse
)
from app.modules.p05_inventario_costos_analitica.inventario.service import InventarioControl

router = APIRouter(prefix="/inventario", tags=["Gestión de Inventario y Costos (CU09)"])

@router.post("/entradas", response_model=KardexResponse, status_code=status.HTTP_201_CREATED)
def registrar_entrada_lote_endpoint(
    request: EntradaLoteCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"])),
    db: Session = Depends(get_db)
):
    # CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1: Enviar datos lote (sucursal, SKU, cant, costo_unit)
    # CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1.1: procesarEntradaMercaderia(sucursal_id, SKU, cant, costo_unit)
    return InventarioControl.procesar_entrada_mercaderia(db, request)

@router.get("/stock", response_model=List[InventarioResponse])
def consultar_stock_endpoint(
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    id_empresa: Optional[int] = Query(None, description="Filtrar por empresa (Tenant)"),
    db: Session = Depends(get_db)
):
    # CU07: Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP)
    return InventarioControl.consultar_stock(db, id_sucursal=id_sucursal, id_producto=id_producto, id_empresa=id_empresa)

@router.get("/kardex", response_model=List[KardexResponse])
def consultar_kardex_endpoint(
    id_inventario: Optional[int] = Query(None, description="Filtrar por registro de inventario"),
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"])),
    db: Session = Depends(get_db)
):
    # CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1.8: mostrar comprobante de kardex con nuevo CPP
    return InventarioControl.consultar_kardex(
        db, id_inventario=id_inventario, id_sucursal=id_sucursal, id_producto=id_producto
    )
