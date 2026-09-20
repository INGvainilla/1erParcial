# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gestión de Ciudades y Sucursales (M02 - CU05)
Coherencia con CiudadEntity y SucursalEntity (Sección 2.3).
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

class CiudadBase(BaseModel):
    nombre_ciudad: str = Field(..., min_length=2, max_length=50)
    departamento: str = Field(..., min_length=2, max_length=50)

class CiudadCreate(CiudadBase):
    pass

class CiudadResponse(CiudadBase):
    id_ciudad: int

    class Config:
        from_attributes = True


class SucursalBase(BaseModel):
    id_ciudad: int = Field(..., description="ID de la ciudad a la que pertenece")
    nombre_sucursal: str = Field(..., min_length=3, max_length=100)
    direccion: str = Field(..., min_length=5, max_length=200)
    latitud: Decimal = Field(..., ge=-90.0, le=90.0, description="Coordenada GPS Latitud")
    longitud: Decimal = Field(..., ge=-180.0, le=180.0, description="Coordenada GPS Longitud")
    telefono: Optional[str] = Field(None, max_length=20)
    capacidad_probadores: int = Field(4, ge=1, description="Número de probadores físicos disponibles")
    horario_apertura: str = Field("09:00", max_length=10)
    horario_cierre: str = Field("21:00", max_length=10)
    estado: str = Field("OPERATIVA", description="OPERATIVA, MANTENIMIENTO, CERRADA")

class SucursalCreate(SucursalBase):
    pass

class SucursalUpdate(BaseModel):
    nombre_sucursal: Optional[str] = Field(None, min_length=3, max_length=100)
    direccion: Optional[str] = Field(None, min_length=5, max_length=200)
    latitud: Optional[Decimal] = Field(None, ge=-90.0, le=90.0)
    longitud: Optional[Decimal] = Field(None, ge=-180.0, le=180.0)
    telefono: Optional[str] = Field(None, max_length=20)
    capacidad_probadores: Optional[int] = Field(None, ge=1)
    horario_apertura: Optional[str] = Field(None, max_length=10)
    horario_cierre: Optional[str] = Field(None, max_length=10)
    estado: Optional[str] = Field(None)

class SucursalResponse(SucursalBase):
    id_sucursal: int
    nombre_ciudad: Optional[str] = None
    departamento: Optional[str] = None

    class Config:
        from_attributes = True
