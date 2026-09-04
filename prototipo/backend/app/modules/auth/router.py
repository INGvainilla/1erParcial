# -*- coding: utf-8 -*-
"""
Router API: Autenticación, Registro y Recuperación OTP (CU01, CU02, CU03)
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.models import Usuario
from app.modules.auth.schemas import (
    LoginRequest, TokenResponse, RegistroRequest, SolicitarOtpRequest, ResetPasswordOtpRequest
)
from app.modules.auth.service import AuthService, RegistroService, RecuperacionService

router = APIRouter(prefix="/auth", tags=["01. Autenticación y Cuentas (CU01, CU02, CU03)"])

@router.post("/login", response_model=TokenResponse, summary="CU01: Iniciar Sesión con RBAC y Bloqueo Preventivo")
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    # CU01: Autenticar Usuario y Control de Acceso
    ip = req.client.host if req.client else "127.0.0.1"
    ua = req.headers.get("User-Agent", "Unknown")
    return AuthService.autenticar_usuario(db, request, ip_origen=ip, user_agent=ua)

@router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="CU02: Auto-registro de Clientes")
def registro_cliente(request: RegistroRequest, db: Session = Depends(get_db)):
    # CU02: Registrar Cliente
    return RegistroService.registrar_cliente(db, request)

@router.post("/recuperar-password/solicitar", summary="CU03: Solicitar Código OTP de Recuperación")
def solicitar_otp(request: SolicitarOtpRequest, db: Session = Depends(get_db)):
    # CU03: Recuperar Contraseña (Paso 1: Emisión OTP)
    return RecuperacionService.solicitar_otp(db, request)

@router.post("/recuperar-password/verificar", summary="CU03: Validar OTP y Restablecer Contraseña")
def verificar_otp_y_reset(request: ResetPasswordOtpRequest, db: Session = Depends(get_db)):
    # CU03: Recuperar Contraseña (Paso 2: Canje OTP y cambio de clave)
    return RecuperacionService.validar_otp_y_restablecer(db, request)

@router.get("/me", summary="Obtener perfil del usuario actualmente autenticado")
def get_perfil_actual(current_user: Usuario = Depends(get_current_user)):
    return {
        "id_usuario": current_user.id_usuario,
        "nombres": current_user.nombres,
        "apellidos": current_user.apellidos,
        "email": current_user.email,
        "rol": current_user.rol,
        "id_sucursal": current_user.id_sucursal,
        "estado_cuenta": current_user.estado_cuenta,
        "ultimo_acceso": current_user.ultimo_acceso
    }
