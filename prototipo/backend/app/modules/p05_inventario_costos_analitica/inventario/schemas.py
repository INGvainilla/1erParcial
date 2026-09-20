# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gestión de Inventario Multi-Sucursal y Costos Ponderados (M06 - CU09)
Coherencia con InventarioEntity y KardexEntity (Sección 2.3).
"""
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class EntradaLoteCreate(BaseModel):
    id_sucursal: int = Field(..., description="ID de la sucursal receptora física")
    id_producto: int = Field(..., description="ID del producto recepcionado")
    talla: str = Field(..., min_length=1, max_length=20, description="Talla de la prenda (S, M, L, XL, etc.)")
    color: str = Field(..., min_length=2, max_length=50, description="Color de la prenda (Azul Marino, Negro, etc.)")
    cantidad_recibida: int = Field(..., gt=0, description="Unidades físicas recibidas en el lote")
    costo_unitario_compra: Decimal = Field(..., gt=0, description="Costo de adquisición por unidad de este lote en Bs.")
    numero_factura: Optional[str] = Field("F-SIN-NUM", max_length=100, description="Referencia de factura o remisión del proveedor")

class KardexResponse(BaseModel):
    id_movimiento: int
    id_inventario: int
    tipo_movimiento: str
    cantidad: int
    costo_unitario_movimiento: Decimal
    saldo_cantidad_resultante: int
    saldo_cpp_resultante: Decimal
    referencia_documento: Optional[str] = None
    fecha_hora: datetime

    class Config:
        from_attributes = True

class InventarioResponse(BaseModel):
    id_inventario: int
    id_sucursal: int
    nombre_sucursal: Optional[str] = None
    id_producto: int
    codigo_sku_base: Optional[str] = None
    nombre_producto: Optional[str] = None
    talla: str
    color: str
    stock_fisico: int
    stock_reservado: int
    stock_disponible: int
    stock_minimo: int
    ultimo_costo_compra: Decimal
    costo_promedio_ponderado: Decimal
    actualizado_en: Optional[datetime] = None

    class Config:
        from_attributes = True
