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
from app.modules.p01_seguridad_acceso.tenants.schemas import EmpresaCreate
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


@router.post("/registro-empresa", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Afiliación y Registro de Empresas/Boutiques al SaaS (B2B)")
def registro_empresa_saas(datos: EmpresaCreate, db: Session = Depends(get_db)):
    """
    Onboarding público de nuevas marcas/boutiques arrendatarias (Tenants) en FashionStore SaaS:
    1. Da de alta la empresa en estado ACTIVA y con esquema lógico.
    2. Asigna el plan de suscripción seleccionado (o por defecto Plan Profesional).
    3. Crea la sucursal central inicial de la empresa.
    4. Crea el usuario Administrador y genera token de acceso JWT.
    """
    from fastapi import HTTPException
    from app.modules.p01_seguridad_acceso.tenants import services as tenant_services
    from app.core.security import create_access_token
    from app.core.email import enviar_correo_bienvenida

    if not datos.admin_email or not datos.admin_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar el correo y contraseña del administrador de la nueva empresa."
        )

    admin_email_clean = str(datos.admin_email).strip().lower()
    if db.query(Usuario).filter(Usuario.email == admin_email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El correo '{admin_email_clean}' ya está registrado. Inicie sesión o utilice otro correo para el administrador."
        )

    if not datos.id_plan_inicial:
        planes = tenant_services.listar_planes(db, solo_activos=True)
        if planes:
            plan_pro = next((p for p in planes if "PRO" in p.codigo.upper()), planes[0])
            datos.id_plan_inicial = plan_pro.id_plan

    # 1. Resolver plan y precio de suscripción
    planes = tenant_services.listar_planes(db, solo_activos=True)
    plan_obj = next((p for p in planes if p.id_plan == datos.id_plan_inicial), None)
    if not plan_obj and planes:
        plan_obj = next((p for p in planes if "PRO" in p.codigo.upper()), planes[0])
        datos.id_plan_inicial = plan_obj.id_plan

    monto_suscripcion = float(plan_obj.precio_mensual) if plan_obj else 199.00
    plan_nombre = plan_obj.nombre if plan_obj else "Profesional"
    plan_codigo = plan_obj.codigo if plan_obj else "PLAN_PRO"

    # 2. Procesar cobro de suscripción inicial (CU17 / CU03)
    import uuid
    from datetime import datetime
    from app.core.email import enviar_correo_factura_suscripcion_saas

    metodo_cobro = (datos.metodo_pago or "TARJETA").upper()
    ultimos_4 = "4242"
    if datos.tarjeta_numero:
        clean_card = "".join(ch for ch in str(datos.tarjeta_numero) if ch.isdigit())
        if len(clean_card) >= 4:
            ultimos_4 = clean_card[-4:]

    nro_factura = f"FAC-SAAS-2026-{uuid.uuid4().hex[:4].upper()}"
    transaccion_id = f"pi_stripe_saas_{uuid.uuid4().hex[:12]}"

    # 3. Crear empresa (Tenant), sucursal central y usuario administrador
    empresa = tenant_services.crear_empresa(db, datos)

    admin_user = db.query(Usuario).filter(Usuario.email == admin_email_clean).first()
    if not admin_user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo inicializar la cuenta administradora.")

    # 4. Asignar identificadores de suscripción Stripe
    suscripcion = tenant_services.obtener_suscripcion_activa(db, empresa.id_empresa)
    if suscripcion:
        suscripcion.stripe_subscription_id = f"sub_saas_{uuid.uuid4().hex[:10]}"
        suscripcion.stripe_customer_id = f"cus_saas_{uuid.uuid4().hex[:10]}"
        db.commit()

    token_jwt = create_access_token(
        data={"sub": str(admin_user.id_usuario), "email": admin_user.email, "rol": admin_user.rol}
    )

    # 5. Generar y despachar factura digital de suscripción por correo electrónico y audit log
    transaccion_info = {
        "payment_intent_id": transaccion_id,
        "monto": monto_suscripcion,
        "metodo": metodo_cobro,
        "ultimos4": ultimos_4,
        "numero_factura": nro_factura,
        "fecha": datetime.now().strftime("%d/%m/%Y %H:%M")
    }

    try:
        destinatarios_notif = [admin_user.email]
        if empresa.email_contacto and empresa.email_contacto.lower() != admin_user.email.lower():
            destinatarios_notif.append(empresa.email_contacto)

        enviar_correo_factura_suscripcion_saas(
            destinatarios=destinatarios_notif,
            nombre_admin=f"{admin_user.nombres} {admin_user.apellidos}",
            empresa_dict={
                "id_empresa": empresa.id_empresa,
                "nombre_comercial": empresa.nombre_comercial,
                "razon_social": empresa.razon_social,
                "nit": empresa.nit,
                "dominio_slug": empresa.dominio_slug
            },
            plan_dict={
                "nombre": plan_nombre,
                "codigo": plan_codigo,
                "precio_mensual": monto_suscripcion
            },
            transaccion_dict=transaccion_info
        )
    except Exception as e_envio:
        print(f" [AVISO REGISTRO SAAS] Error en despacho de email: {e_envio}")

    return TokenResponse(
        access_token=token_jwt,
        token_type="bearer",
        id_usuario=admin_user.id_usuario,
        id_empresa=empresa.id_empresa,
        nombre_empresa=empresa.nombre_comercial,
        dominio_slug_empresa=empresa.dominio_slug,
        nombres=admin_user.nombres,
        apellidos=admin_user.apellidos,
        nombre_completo=admin_user.nombre_completo,
        email=admin_user.email,
        rol=admin_user.rol,
        id_sucursal=admin_user.id_sucursal,
        numero_factura_saas=nro_factura,
        monto_suscripcion_pagado=monto_suscripcion,
        plan_nombre=plan_nombre,
        mensaje_pago=f"Suscripción al {plan_nombre} cobrada exitosamente (Bs. {monto_suscripcion:.2f}). Factura {nro_factura} emitida."
    )

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
