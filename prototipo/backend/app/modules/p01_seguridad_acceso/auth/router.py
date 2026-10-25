# -*- coding: utf-8 -*-
"""
Router API: Autenticación, Registro y Recuperación OTP (CU01, CU02, CU03)
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.auth.schemas import (
    LoginRequest, TokenResponse, RegistroRequest, SolicitarOtpRequest, ResetPasswordOtpRequest
)
from app.modules.p01_seguridad_acceso.auth.service import AuthService, RegistroService, RecuperacionService

router = APIRouter(prefix="/auth", tags=["01. Autenticación y Cuentas (CU01, CU02, CU03)"])

# CU01 (Autenticar Usuario), Paso 1.1: ILoginBoundary invoca el endpoint POST /auth/login hacia AutenticacionControl
@router.post("/login", response_model=TokenResponse, summary="CU01: Iniciar Sesión con RBAC y Bloqueo Preventivo")
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    # CU01 (Autenticar Usuario), Paso 1.1.1: Extraer dirección IP origen y User-Agent del cliente para auditoría
    ip = req.client.host if req.client else "127.0.0.1"
    ua = req.headers.get("User-Agent", "Unknown")
    # CU01 (Autenticar Usuario), Paso 1.1.2: Delegar autenticación a AuthService.autenticar_usuario()
    return AuthService.autenticar_usuario(db, request, ip_origen=ip, user_agent=ua)

# CU02 (Registrar Cliente), Paso 1.1: IRegistroBoundary invoca el endpoint POST /auth/registro hacia RegistroClienteControl
@router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="CU02: Auto-registro de Clientes")
def registro_cliente(request: RegistroRequest, db: Session = Depends(get_db)):
    # CU02 (Registrar Cliente), Paso 1.1.1: Delegar registro a RegistroService.registrar_cliente()
    return RegistroService.registrar_cliente(db, request)

# CU03 (Recuperar Contraseña), Paso 1.1: IRecuperarPasswordBoundary invoca POST /auth/recuperar-password/solicitar hacia RecuperacionControl
@router.post("/recuperar-password/solicitar", summary="CU03: Solicitar Código OTP de Recuperación")
def solicitar_otp(request: SolicitarOtpRequest, db: Session = Depends(get_db)):
    # CU03 (Recuperar Contraseña), Paso 1.1.1: Delegar emisión y despacho OTP a RecuperacionService.solicitar_otp()
    return RecuperacionService.solicitar_otp(db, request)

# CU03 (Recuperar Contraseña), Paso 2.1: IRecuperarPasswordBoundary invoca POST /auth/recuperar-password/verificar hacia RecuperacionControl
@router.post("/recuperar-password/verificar", summary="CU03: Validar OTP y Restablecer Contraseña")
def verificar_otp_y_reset(request: ResetPasswordOtpRequest, db: Session = Depends(get_db)):
    # CU03 (Recuperar Contraseña), Paso 2.1.1: Delegar validación de OTP y cambio de clave a RecuperacionService.validar_otp_y_restablecer()
    return RecuperacionService.validar_otp_y_restablecer(db, request)

@router.get("/me", summary="Obtener perfil del usuario actualmente autenticado con contexto tenant")
def get_perfil_actual(current_user: Usuario = Depends(get_current_user)):
    return {
        "id_usuario": current_user.id_usuario,
        "id_empresa": current_user.id_empresa,
        "nombre_empresa": current_user.empresa.nombre_comercial if current_user.empresa else None,
        "dominio_slug_empresa": current_user.empresa.dominio_slug if current_user.empresa else None,
        "nombres": current_user.nombres,
        "apellidos": current_user.apellidos,
        "email": current_user.email,
        "rol": current_user.rol,
        "id_sucursal": current_user.id_sucursal,
        "estado_cuenta": current_user.estado_cuenta,
        "ultimo_acceso": current_user.ultimo_acceso
    }
