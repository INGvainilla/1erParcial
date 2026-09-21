# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gestión de Temporadas y Colecciones (M04 - CU07)
Coherencia con TemporadaEntity (Sección 2.3).
"""
from typing import Optional, List
from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field

class TemporadaBase(BaseModel):
    codigo_campana: str = Field(..., min_length=3, max_length=30, description="Ej. SS-2026, FW-2026")
    nombre_temporada: str = Field(..., min_length=3, max_length=100)
    fecha_inicio: date = Field(..., description="Fecha de inicio de la temporada comercial")
    fecha_fin: date = Field(..., description="Fecha de conclusión de la temporada")
    descuento_liquidacion: Decimal = Field(Decimal("0.00"), ge=0, le=90, description="Porcentaje de descuento para liquidación (0 a 90%)")
    estado: str = Field("VIGENTE", description="VIGENTE, LIQUIDACION, FINALIZADA")

class TemporadaCreate(TemporadaBase):
    productos_ids: Optional[List[int]] = Field(None, description="IDs de productos a vincular con esta colección")

class TemporadaUpdate(BaseModel):
    nombre_temporada: Optional[str] = Field(None, min_length=3, max_length=100)
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    descuento_liquidacion: Optional[Decimal] = Field(None, ge=0, le=90)
    estado: Optional[str] = None
    productos_ids: Optional[List[int]] = None

class TemporadaResponse(TemporadaBase):
    id_temporada: int
    cantidad_productos_asociados: int = 0

    class Config:
        from_attributes = True

class ActivarLiquidacionRequest(BaseModel):
    descuento_liquidacion: Decimal = Field(..., gt=0, le=90, description="Porcentaje de descuento para remate estacional")
