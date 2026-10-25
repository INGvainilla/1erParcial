# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gobernanza SaaS y Multitenancy (CU01, CU02, CU03)
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ==============================================================================
# CU02: GESTIONAR PLANES DE SUSCRIPCIÓN
# ==============================================================================
class PlanBase(BaseModel):
    nombre: str = Field(..., max_length=50, example="Profesional")
    codigo: str = Field(..., max_length=30, example="PLAN_PRO")
    max_sucursales: int = Field(5, ge=1, example=5)
    max_usuarios: int = Field(25, ge=1, example=25)
    permite_reportes_ia: bool = Field(True, example=True)
    permite_ml_dashboard: bool = Field(True, example=True)
    soporta_offline: bool = Field(True, example=True)
    precio_mensual: Decimal = Field(Decimal("199.00"), ge=Decimal("0.00"), example=199.00)
    estado: str = Field("ACTIVO", max_length=20, example="ACTIVO")
    descripcion: Optional[str] = Field(None, example="Plan avanzado con analítica IA y múltiples sucursales")


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    nombre: Optional[str] = None
    max_sucursales: Optional[int] = None
    max_usuarios: Optional[int] = None
    permite_reportes_ia: Optional[bool] = None
    permite_ml_dashboard: Optional[bool] = None
    soporta_offline: Optional[bool] = None
    precio_mensual: Optional[Decimal] = None
    estado: Optional[str] = None
    descripcion: Optional[str] = None


class PlanResponse(PlanBase):
    id_plan: int
    creado_en: datetime

    class Config:
        from_attributes = True


# ==============================================================================
# CU01: GESTIONAR EMPRESAS (TENANTS)
# ==============================================================================
class EmpresaBase(BaseModel):
    nit: str = Field(..., max_length=30, example="1029384756")
    razon_social: str = Field(..., max_length=150, example="FashionStore Bolivia S.R.L.")
    nombre_comercial: str = Field(..., max_length=100, example="FashionStore")
    dominio_slug: str = Field(..., max_length=63, example="fashionstore-scz")
    email_contacto: EmailStr = Field(..., example="gerencia@fashionstore.bo")
    telefono: Optional[str] = Field(None, max_length=30, example="+591 3 3456789")
    direccion: Optional[str] = Field(None, max_length=200, example="Av. San Martín #450, Equipetrol, Santa Cruz")
    logo_url: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300")
    presupuesto_disponible: Decimal = Field(Decimal("50000.00"), ge=Decimal("0.00"), example=50000.00)
    estado: str = Field("ACTIVA", max_length=20, example="ACTIVA")


class EmpresaCreate(EmpresaBase):
    id_plan_inicial: Optional[int] = Field(None, description="Plan inicial opcional al registrar la empresa")
    admin_nombres: Optional[str] = Field(None, example="Carlos")
    admin_apellidos: Optional[str] = Field(None, example="Mendoza")
    admin_email: Optional[EmailStr] = Field(None, example="admin@fashionstore.bo")
    admin_password: Optional[str] = Field(None, min_length=6, example="Admin123*")


class EmpresaUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    email_contacto: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    logo_url: Optional[str] = None
    presupuesto_disponible: Optional[Decimal] = None
    estado: Optional[str] = Field(None, pattern="^(ACTIVA|SUSPENDIDA|INACTIVA)$")


class EmpresaEstadoUpdate(BaseModel):
    estado: str = Field(..., pattern="^(ACTIVA|SUSPENDIDA|INACTIVA)$", example="ACTIVA")


class EmpresaResponse(EmpresaBase):
    id_empresa: int
    schema_name: Optional[str] = None
    creado_en: datetime
    actualizado_en: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==============================================================================
# CU03: GESTIONAR SUSCRIPCIONES
# ==============================================================================
class SuscripcionCreate(BaseModel):
    id_empresa: int
    id_plan: int
    meses_duracion: int = Field(1, ge=1, le=24, example=1)
    stripe_payment_method_id: Optional[str] = None
    auto_renovar: bool = True


class SuscripcionResponse(BaseModel):
    id_suscripcion: int
    id_empresa: int
    id_plan: int
    fecha_inicio: date
    fecha_vencimiento: date
    estado: str
    auto_renovar: bool
    actualizado_en: Optional[datetime] = None
    plan: Optional[PlanResponse] = None

    class Config:
        from_attributes = True
