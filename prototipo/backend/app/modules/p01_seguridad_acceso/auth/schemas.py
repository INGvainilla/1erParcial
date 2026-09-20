# -*- coding: utf-8 -*-
"""
Esquemas Pydantic: Autenticación, Registro y Recuperación OTP (CU01, CU02, CU03)
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# --- CU01: Login RBAC ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    recordar_sesion: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id_usuario: int
    nombres: str
    apellidos: str
    nombre_completo: Optional[str] = None
    email: str
    rol: str
    id_sucursal: Optional[int] = None

# --- CU02: Auto-registro de Clientes ---
class RegistroRequest(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    telefono: Optional[str] = Field(None, max_length=30)

# --- CU03: Recuperación de Contraseña con OTP ---
class SolicitarOtpRequest(BaseModel):
    email: EmailStr

class SolicitarOtpResponse(BaseModel):
    mensaje: str
    tiempo_expiracion_minutos: int = 15

class ResetPasswordOtpRequest(BaseModel):
    email: EmailStr
    codigo_otp: str = Field(..., min_length=6, max_length=6)
    nueva_password: str = Field(..., min_length=8)
