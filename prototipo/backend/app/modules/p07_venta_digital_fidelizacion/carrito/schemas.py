# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para el Carrito de Compras Omnicanal (CU13)
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class CarritoItemAdd(BaseModel):
    id_producto: int
    talla: str
    color: str
    cantidad: int = Field(default=1, ge=1, description="Cantidad a añadir (mínimo 1)")

class CarritoItemUpdate(BaseModel):
    cantidad: int = Field(..., ge=1, description="Nueva cantidad deseada (mínimo 1)")

class CarritoItemResponse(BaseModel):
    id_item: int
    id_producto: int
    nombre_producto: str
    codigo_sku_base: str
    imagen_principal: Optional[str] = None
    talla: str
    color: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    stock_maximo_disponible: int

    model_config = ConfigDict(from_attributes=True)

class CarritoResponse(BaseModel):
    id_carrito: int
    id_usuario: int
    estado: str
    total_items: int
    total_general: float
    items: List[CarritoItemResponse]

    model_config = ConfigDict(from_attributes=True)
