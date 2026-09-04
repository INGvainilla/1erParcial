# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Gestión de Usuarios y Roles (M01 - CU04)
Coherencia con UsuarioEntity y requisitos de seguridad RBAC.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UsuarioCreate(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico institucional o de contacto")
    password: str = Field(..., min_length=8, description="Contraseña inicial del empleado")
    nombre_completo: str = Field(..., min_length=3, max_length=150)
    telefono: Optional[str] = Field(None, max_length=30)
    rol: str = Field(..., description="ADMINISTRADOR, ENCARGADO_SUCURSAL, CAJERO, LOGISTICA")
    id_sucursal: Optional[int] = Field(None, description="Sucursal asignada si es encargado o cajero")

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=150)
    telefono: Optional[str] = Field(None, max_length=30)
    rol: Optional[str] = Field(None, description="ADMINISTRADOR, ENCARGADO_SUCURSAL, CAJERO, LOGISTICA")
    id_sucursal: Optional[int] = Field(None, description="Sucursal física asignada")
    estado_cuenta: Optional[str] = Field(None, description="ACTIVO, INACTIVO, BLOQUEADO_POR_INTENTOS")

class UsuarioResponse(BaseModel):
    id_usuario: int
    email: str
    nombre_completo: str
    telefono: Optional[str] = None
    rol: str
    estado_cuenta: str
    intentos_fallidos: int
    bloqueado_hasta: Optional[datetime] = None
    id_sucursal: Optional[int] = None
    sucursal_nombre: Optional[str] = None
    creado_en: datetime

    class Config:
        from_attributes = True

class DesbloquearUsuarioResponse(BaseModel):
    id_usuario: int
    email: str
    estado_cuenta: str
    intentos_fallidos: int
    mensaje: str
