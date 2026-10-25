# -*- coding: utf-8 -*-
"""
Enrutador de API: Inventario Multi-Sucursal y Costos Ponderados (M06 - CU09)
Comentado paso a paso conforme al caso de uso CU09.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.subscription import exigir_suscripcion_vigente
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.core.tenancy import resolver_empresa
from app.modules.p05_inventario_costos_analitica.inventario.schemas import (
    EntradaLoteCreate, KardexResponse, InventarioResponse
)
from app.modules.p05_inventario_costos_analitica.inventario.service import InventarioControl

router = APIRouter(prefix="/inventario", tags=["Gestión de Inventario y Costos (CU09)"])

@router.post("/entradas", response_model=KardexResponse, status_code=status.HTTP_201_CREATED)
def registrar_entrada_lote_endpoint(
    request: EntradaLoteCreate,
    current_user: Usuario = Depends(exigir_suscripcion_vigente),
    db: Session = Depends(get_db)
):
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado. Se requiere uno de los roles: ADMINISTRADOR, LOGISTICA, ENCARGADO_SUCURSAL. Tu rol es: {current_user.rol}"
        )
    # CU07/CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP)
    return InventarioControl.procesar_entrada_mercaderia(db, request, current_user=current_user)

@router.get("/stock", response_model=List[InventarioResponse])
def consultar_stock_endpoint(
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    id_empresa: Optional[int] = Query(None, description="Filtrar por empresa (Tenant)"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # CU07: Gestionar Inventario Multi-Sucursal con Aislamiento Multitenant
    empresa_id = resolver_empresa(current_user, id_empresa)
    return InventarioControl.consultar_stock(
        db, id_sucursal=id_sucursal, id_producto=id_producto, id_empresa=empresa_id
    )

@router.get("/kardex", response_model=List[KardexResponse])
def consultar_kardex_endpoint(
    id_inventario: Optional[int] = Query(None, description="Filtrar por registro de inventario"),
    id_sucursal: Optional[int] = Query(None, description="Filtrar por sucursal"),
    id_producto: Optional[int] = Query(None, description="Filtrar por producto"),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "LOGISTICA", "ENCARGADO_SUCURSAL"])),
    db: Session = Depends(get_db)
):
    # CU07/CU09: Comprobante de kardex físico-valorado con nuevo CPP
    return InventarioControl.consultar_kardex(
        db,
        id_inventario=id_inventario,
        id_sucursal=id_sucursal,
        id_producto=id_producto,
        current_user=current_user
    )

