# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gestión de Proveedores Textiles (M05 - CU08)
Coherencia con ProveedorEntity (Sección 2.3).
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ProveedorBase(BaseModel):
    nit_identificacion: str = Field(..., min_length=5, max_length=30, description="NIT tributario único de la empresa proveedora")
    razon_social: str = Field(..., min_length=3, max_length=150, description="Razón Social legal o nombre de la empresa textil")
    contacto_nombre: Optional[str] = Field(None, max_length=100, description="Nombre del asesor o contacto de ventas")
    telefono: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = None
    terminos_pago: str = Field("CONTADO", description="CONTADO, CREDITO_30_DIAS, CREDITO_60_DIAS")
    estado: str = Field("ACTIVO", description="ACTIVO, INACTIVO")

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = Field(None, min_length=3, max_length=150)
    contacto_nombre: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = None
    terminos_pago: Optional[str] = None
    estado: Optional[str] = None

class ProveedorResponse(ProveedorBase):
    id_proveedor: int

    class Config:
        from_attributes = True
