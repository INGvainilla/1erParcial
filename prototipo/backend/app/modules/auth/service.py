# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Autenticación, Registro y Recuperación OTP (CU01, CU02, CU03)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from datetime import datetime, timedelta, timezone

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import (
    verify_password, get_password_hash, create_access_token, generate_otp_code
)
from app.modules.auth.models import Usuario, TokenRecuperacion, BitacoraAcceso
from app.modules.auth.schemas import (
    LoginRequest, TokenResponse, RegistroRequest, SolicitarOtpRequest, ResetPasswordOtpRequest
)
from app.core.email import enviar_correo_otp

class AuthService:
    """
    Controlador de Seguridad y Autenticación RBAC (AutenticacionControl - CU01)
    """

    @staticmethod
    def autenticar_usuario(db: Session, request: LoginRequest, ip_origen: str = "127.0.0.1", user_agent: str = None) -> TokenResponse:
        # =========================================================================
        # CASO DE USO: CU01 - Autenticar Usuario y Control de Acceso (RBAC)
        # Diagrama de Comunicación: Com_CU01_Autenticar_Usuario
        # =========================================================================
        
        # Paso 1: El actor ingresa credenciales (email y password) en la interfaz ILoginBoundary
        email = request.email.strip().lower()
        password = request.password

        # Paso 1.1: ILoginBoundary invoca el método autenticarUsuario() de AutenticacionControl
        
        # Paso 1.2: AutenticacionControl consulta a UsuarioEntity (buscarPorEmail)
        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        # Paso 1.3: UsuarioEntity retorna los datos persistidos o None
        if not usuario:
            # Registrar intento fallido en bitácora de auditoría
            bitacora = BitacoraAcceso(
                id_usuario=None, ip_origen=ip_origen, user_agent=user_agent, exitoso=False, motivo="Correo no registrado"
            )
            db.add(bitacora)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas. Verifique su correo o contraseña."
            )

        # Paso 1.4: Verificar si la cuenta se encuentra bloqueada preventivamente
        if usuario.estado_cuenta == "BLOQUEADO_POR_INTENTOS":
            # Verificar si expiró el tiempo de castigo preventivo (30 min)
            if usuario.bloqueado_hasta and utc_now() > usuario.bloqueado_hasta:
                usuario.estado_cuenta = "ACTIVO"
                usuario.intentos_fallidos = 0
                usuario.bloqueado_hasta = None
                db.commit()
            else:
                tiempo_restante = "30 minutos"
                if usuario.bloqueado_hasta:
                    minutos = max(1, int((usuario.bloqueado_hasta - utc_now()).total_seconds() / 60))
                    tiempo_restante = f"{minutos} minutos"
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cuenta bloqueada preventivamente tras superar 5 intentos fallidos. Intente nuevamente en {tiempo_restante} o utilice la opción 'Recuperar Contraseña'."
                )

        if usuario.estado_cuenta == "INACTIVO":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La cuenta se encuentra inactiva. Contacte al Administrador General."
            )

        # Paso 1.5: Validar password en claro contra password_hash usando Bcrypt
        clave_valida = verify_password(password, usuario.password_hash)

        if not clave_valida:
            # Incrementar contador de intentos fallidos
            usuario.intentos_fallidos += 1
            restantes = settings.MAX_LOGIN_ATTEMPTS - usuario.intentos_fallidos

            # Si supera 5 intentos consecutivos, bloquear la cuenta por 30 min
            if usuario.intentos_fallidos >= settings.MAX_LOGIN_ATTEMPTS:
                usuario.estado_cuenta = "BLOQUEADO_POR_INTENTOS"
                usuario.bloqueado_hasta = utc_now() + timedelta(minutes=settings.ACCOUNT_LOCK_MINUTES)
                motivo = "Bloqueo automático por 5to intento fallido"
            else:
                motivo = f"Contraseña errónea (Intento {usuario.intentos_fallidos})"

            bitacora = BitacoraAcceso(
                id_usuario=usuario.id_usuario, ip_origen=ip_origen, user_agent=user_agent, exitoso=False, motivo=motivo
            )
            db.add(bitacora)
            db.commit()

            if usuario.estado_cuenta == "BLOQUEADO_POR_INTENTOS":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cuenta bloqueada preventivamente por 30 minutos al registrar {settings.MAX_LOGIN_ATTEMPTS} intentos fallidos consecutivos."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Contraseña incorrecta. Le quedan {restantes} intento(s) antes del bloqueo preventivo."
                )

        # Paso 1.6: Autenticación exitosa -> resetear intentos fallidos y actualizar último acceso
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.ultimo_acceso = utc_now()

        # Paso 1.7: Generar Token JWT con claims de rol y expiración configurable
        delta_exp = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS) if request.recordar_sesion else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token_jwt = create_access_token(
            data={"sub": str(usuario.id_usuario), "email": usuario.email, "rol": usuario.rol},
            expires_delta=delta_exp
        )

        # Paso 1.8: Registrar acceso exitoso en bitácora de auditoría
        bitacora = BitacoraAcceso(
            id_usuario=usuario.id_usuario, ip_origen=ip_origen, user_agent=user_agent, exitoso=True, motivo="Login exitoso"
        )
        db.add(bitacora)
        db.commit()
        db.refresh(usuario)

        # Paso 1.9: Retornar token JWT y datos del perfil para navegación según rol
        return TokenResponse(
            access_token=token_jwt,
            token_type="bearer",
            id_usuario=usuario.id_usuario,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            nombre_completo=usuario.nombre_completo,
            email=usuario.email,
            rol=usuario.rol,
            id_sucursal=usuario.id_sucursal
        )


class RegistroService:
    """
    Controlador de Registro Autoservicio de Clientes (RegistroClienteControl - CU02)
    """

    @staticmethod
    def registrar_cliente(db: Session, request: RegistroRequest) -> TokenResponse:
        # =========================================================================
        # CASO DE USO: CU02 - Registrar Cliente (Auto-registro de Clientes)
        # Diagrama de Comunicación: Com_CU02_Registrar_Cliente
        # =========================================================================

        # Paso 1: El cliente no autenticado ingresa datos personales en IRegistroBoundary
        email = request.email.strip().lower()

        # Paso 1.1: IRegistroBoundary invoca procesarRegistroCliente() en RegistroClienteControl

        # Paso 1.2: RegistroClienteControl consulta si el correo ya existe en UsuarioEntity
        existente = db.query(Usuario).filter(Usuario.email == email).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado. Inicie sesión o recupere su contraseña."
            )

        # Paso 1.3: Cifrar la contraseña mediante algoritmo Bcrypt con factor de coste 12
        password_cifrada = get_password_hash(request.password)

        # Paso 1.4: Persistir nuevo registro de usuario con rol estricto CLIENTE
        nuevo_usuario = Usuario(
            id_sucursal=None,
            nombres=request.nombres.strip(),
            apellidos=request.apellidos.strip(),
            email=email,
            password_hash=password_cifrada,
            telefono=request.telefono,
            rol="CLIENTE",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0,
            ultimo_acceso=utc_now()
        )
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        # Paso 1.5: Despachar notificación de bienvenida (simulado o SMTP)
        # EmailService.despacharBienvenida(email, request.nombres)

        # Paso 1.6: Emitir token de sesión automático para ingreso directo
        token_jwt = create_access_token(
            data={"sub": str(nuevo_usuario.id_usuario), "email": nuevo_usuario.email, "rol": nuevo_usuario.rol}
        )

        # Paso 1.7: Retornar token y confirmar alta
        return TokenResponse(
            access_token=token_jwt,
            token_type="bearer",
            id_usuario=nuevo_usuario.id_usuario,
            nombres=nuevo_usuario.nombres,
            apellidos=nuevo_usuario.apellidos,
            nombre_completo=nuevo_usuario.nombre_completo,
            email=nuevo_usuario.email,
            rol=nuevo_usuario.rol,
            id_sucursal=None
        )


class RecuperacionService:
    """
    Controlador de Recuperación de Contraseña mediante Código OTP (RecuperacionControl - CU03)
    """

    @staticmethod
    def solicitar_otp(db: Session, request: SolicitarOtpRequest) -> dict:
        # =========================================================================
        # CASO DE USO: CU03 - Recuperar Contraseña (Token OTP de 6 Dígitos)
        # Diagrama de Secuencia: Diseno_Secuencia_Recuperacion_OTP
        # =========================================================================

        # Paso 1: Usuario ingresa su correo en IRecuperarClaveBoundary
        email = request.email.strip().lower()

        # Paso 1.1: IRecuperarClaveBoundary invoca solicitarOtp() en RecuperacionControl
        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        # Mitigación de Enumeración de Cuentas (OWASP): si no existe, responder genéricamente
        if not usuario:
            return {
                "mensaje": "Si el correo ingresado se encuentra registrado, le hemos enviado el código de verificación OTP de 6 dígitos.",
                "tiempo_expiracion_minutos": settings.OTP_EXPIRE_MINUTES
            }

        # Paso 1.2: Generar código numérico criptográfico de 6 dígitos
        codigo_otp = generate_otp_code()
        codigo_otp_hash = get_password_hash(codigo_otp)

        # Paso 1.3: Invalidar tokens previos no utilizados para este usuario
        db.query(TokenRecuperacion).filter(
            TokenRecuperacion.id_usuario == usuario.id_usuario,
            TokenRecuperacion.utilizado == False
        ).update({"utilizado": True})

        # Paso 1.4: Persistir el nuevo token OTP con expiración de 15 minutos
        nuevo_token = TokenRecuperacion(
            id_usuario=usuario.id_usuario,
            codigo_otp_hash=codigo_otp_hash,
            expiracion=utc_now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
            utilizado=False,
            intentos_verificacion=0
        )
        db.add(nuevo_token)
        db.commit()

        # Paso 1.5: Enviar código OTP por correo electrónico real vía SMTP Gmail
        enviar_correo_otp(
            destinatario=email,
            codigo_otp=codigo_otp,
            nombre_usuario=usuario.nombre_completo or "Cliente",
            async_send=True
        )
        print(f" [EMAIL SMTP] Enviado a: {email} | Código OTP generado: {codigo_otp} | Válido por {settings.OTP_EXPIRE_MINUTES} min")

        # Paso 1.6: Retornar confirmación sin revelar existencia directa
        return {
            "mensaje": "Si el correo ingresado se encuentra registrado, le hemos enviado el código de verificación OTP de 6 dígitos.",
            "tiempo_expiracion_minutos": settings.OTP_EXPIRE_MINUTES,
            # Para fines de prueba y depuración en el parcial:
            "codigo_otp_simulado": codigo_otp
        }

    @staticmethod
    def validar_otp_y_restablecer(db: Session, request: ResetPasswordOtpRequest) -> dict:
        # =========================================================================
        # Paso 2: Usuario introduce el código de 6 dígitos y la nueva contraseña
        # =========================================================================
        email = request.email.strip().lower()
        codigo = request.codigo_otp.strip()

        # Paso 2.1: Recuperar usuario y su token activo
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        if not usuario:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solicitud inválida o usuario no existente.")

        token_record = db.query(TokenRecuperacion).filter(
            TokenRecuperacion.id_usuario == usuario.id_usuario,
            TokenRecuperacion.utilizado == False
        ).order_by(TokenRecuperacion.id_token.desc()).first()

        if not token_record:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No existe una solicitud de recuperación activa para este correo.")

        # Paso 2.2: Validar si el token ya expiró (> 15 minutos)
        if utc_now() > token_record.expiracion:
            token_record.utilizado = True
            db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El código OTP ha expirado (límite de 15 minutos). Solicite uno nuevo.")

        # Paso 2.3: Validar código OTP con bcrypt
        otp_valido = verify_password(codigo, token_record.codigo_otp_hash)

        if not otp_valido:
            token_record.intentos_verificacion += 1
            db.commit()
            # Si supera 3 intentos fallidos de OTP, invalidar token
            if token_record.intentos_verificacion >= settings.MAX_OTP_ATTEMPTS:
                token_record.utilizado = True
                db.commit()
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código bloqueado por superar 3 intentos erróneos. Solicite un nuevo código.")
            restantes = settings.MAX_OTP_ATTEMPTS - token_record.intentos_verificacion
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Código OTP incorrecto. Le quedan {restantes} intento(s).")

        # Paso 2.4: Código válido -> cifrar nueva contraseña y actualizar usuario
        usuario.password_hash = get_password_hash(request.nueva_password)
        usuario.estado_cuenta = "ACTIVO"
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None

        # Paso 2.5: Marcar token OTP como canjeado
        token_record.utilizado = True

        db.commit()

        return {"mensaje": "¡Contraseña restablecida exitosamente! Ahora puede iniciar sesión con sus nuevas credenciales."}
