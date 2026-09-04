# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Catálogo Digital Omnicanal y Disponibilidad por Sucursal (M07 - CU10)
Coherencia con ProductoEntity, InventarioEntity y SucursalEntity (Sección 2.3).
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field
from app.modules.productos.schemas import ColorResponse, TallaResponse

class StockSucursalItem(BaseModel):
    id_sucursal: int
    nombre_sucursal: str
    nombre_ciudad: str
    direccion: str
    latitud: Decimal
    longitud: Decimal
    stock_disponible: int
    tallas_disponibles: List[str] = []
    colores_disponibles: List[str] = []

class PrendaCatalogoResponse(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    descuento_aplicable_pct: Decimal = Decimal("0.00")
    precio_final: Decimal
    id_categoria: int
    nombre_categoria: Optional[str] = None
    id_marca: int
    nombre_marca: Optional[str] = None
    id_temporada: Optional[int] = None
    codigo_temporada: Optional[str] = None
    imagen_principal: Optional[str] = None
    modelo_3d_glb: Optional[str] = None
    colores: List[ColorResponse] = []
    tallas: List[TallaResponse] = []
    stock_total_disponible: int = 0
    disponibilidad_sucursales: List[StockSucursalItem] = []

    class Config:
        from_attributes = True

class DisponibilidadPrendaDetalle(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    sucursales: List[StockSucursalItem] = []
