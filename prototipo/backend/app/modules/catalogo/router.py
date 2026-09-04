# -*- coding: utf-8 -*-
"""
Enrutador de API: Catálogo Omnicanal y Disponibilidad por Sucursal (M07 - CU10)
Comentado paso a paso conforme al caso de uso CU10.
"""
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.catalogo.schemas import (
    PrendaCatalogoResponse, DisponibilidadPrendaDetalle
)
from app.modules.catalogo.service import CatalogoControl

router = APIRouter(prefix="/catalogo", tags=["Catálogo Omnicanal y Disponibilidad (CU10)"])

@router.get("", response_model=List[PrendaCatalogoResponse])
def consultar_catalogo_endpoint(
    id_categoria: Optional[int] = Query(None, description="Filtrar por categoría de prenda"),
    id_marca: Optional[int] = Query(None, description="Filtrar por marca comercial"),
    id_temporada: Optional[int] = Query(None, description="Filtrar por campaña estacional"),
    talla: Optional[str] = Query(None, description="Filtrar por talla (S, M, L, XL, etc.)"),
    color: Optional[str] = Query(None, description="Filtrar por color (Azul, Blanco, etc.)"),
    precio_min: Optional[Decimal] = Query(None, description="Precio mínimo en Bs."),
    precio_max: Optional[Decimal] = Query(None, description="Precio máximo en Bs."),
    id_sucursal: Optional[int] = Query(None, description="Filtrar productos con stock en una sucursal específica"),
    busqueda: Optional[str] = Query(None, description="Término de búsqueda por nombre o SKU"),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU10 - Consultar Catálogo y Disponibilidad por Sucursal
    # Paso 1: El cliente ingresa criterios de búsqueda o filtros en el catálogo
    # Paso 1.1: Invocación a CatalogoControl.consultar_prendas()
    return CatalogoControl.consultar_prendas(
        db=db,
        id_categoria=id_categoria,
        id_marca=id_marca,
        id_temporada=id_temporada,
        talla=talla,
        color=color,
        precio_min=precio_min,
        precio_max=precio_max,
        id_sucursal=id_sucursal,
        busqueda=busqueda
    )

@router.get("/{id_producto}/disponibilidad-sucursales", response_model=DisponibilidadPrendaDetalle)
def consultar_disponibilidad_sucursales_endpoint(
    id_producto: int,
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU10 - Disponibilidad por Sucursal en Detalle de Producto
    # Paso 1: El cliente hace clic en 'Ver disponibilidad en tiendas'
    # Paso 1.1: Invocación a CatalogoControl.obtener_disponibilidad_sucursales()
    return CatalogoControl.obtener_disponibilidad_sucursales(db, id_producto=id_producto)
