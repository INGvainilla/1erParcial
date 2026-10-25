# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Administración de Usuarios y Roles (CU04)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import get_password_hash
from app.core.tenancy import exigir_mismo_tenant
from app.modules.p01_seguridad_acceso.auth.models import Usuario, BitacoraAcceso
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p01_seguridad_acceso.usuarios.schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse, DesbloquearUsuarioResponse
)

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class UsuarioAdminControl:
    """
    Controlador de Gestión de Usuarios y Roles (UsuarioAdminControl - CU04)
    Maneja el ciclo de vida de los empleados del sistema y el desbloqueo de seguridad.
    """

    @staticmethod
    @staticmethod
    def listar_usuarios(
        db: Session,
        rol: Optional[str] = None,
        estado: Optional[str] = None,
        id_sucursal: Optional[int] = None,
        id_empresa: Optional[int] = None
    ) -> List[UsuarioResponse]:
        # CU05: Gestionar Usuarios y Roles por Empresa (RBAC Multitenant)
        query = db.query(Usuario).options(joinedload(Usuario.sucursal))
        
        if id_empresa:
            query = query.filter(Usuario.id_empresa == id_empresa)
        if rol:
            query = query.filter(Usuario.rol == rol.upper())
        if estado:
            query = query.filter(Usuario.estado_cuenta == estado.upper())
        if id_sucursal:
            query = query.filter(Usuario.id_sucursal == id_sucursal)

        usuarios = query.order_by(Usuario.id_usuario.desc()).all()

        resultado = []
        for u in usuarios:
            sucursal_nombre = u.sucursal.nombre_sucursal if u.sucursal else None
            resultado.append(UsuarioResponse(
                id_usuario=u.id_usuario,
                id_empresa=u.id_empresa,
                email=u.email,
                nombre_completo=u.nombre_completo,
                telefono=getattr(u, 'telefono', None),
                rol=u.rol,
                estado_cuenta=u.estado_cuenta,
                intentos_fallidos=u.intentos_fallidos,
                bloqueado_hasta=u.bloqueado_hasta,
                id_sucursal=u.id_sucursal,
                sucursal_nombre=sucursal_nombre,
                creado_en=u.creado_en
            ))
        return resultado

    @staticmethod
    def registrar_usuario_staff(
        db: Session,
        request: UsuarioCreate,
        admin_id: int,
        ip_origen: str = "127.0.0.1",
        id_empresa: Optional[int] = None
    ) -> UsuarioResponse:
        # CU05: Gestionar Usuarios y Roles por Empresa (RBAC Multitenant)
        email = request.email.strip().lower()
        rol_solicitado = request.rol.upper()

        roles_validos = {"SUPER_ADMIN", "ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA", "CLIENTE"}
        if rol_solicitado not in roles_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rol '{rol_solicitado}' no es válido en la matriz RBAC."
            )

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.1: Verificar existencia y estado de la sucursal física asignada
        if request.id_sucursal and int(request.id_sucursal) > 0:
            sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == int(request.id_sucursal)).first()
            if not sucursal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La sucursal física seleccionada (ID {request.id_sucursal}) no existe en el sistema. Por favor seleccione una sucursal activa."
                )
            if sucursal.estado == "CERRADA":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede asignar personal a una sucursal con estado CERRADA."
                )
            request.id_sucursal = sucursal.id_sucursal
        else:
            request.id_sucursal = None

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.2: Verificar unicidad del correo en UsuarioEntity
        usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado por otro usuario."
            )

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.3: Cifrado seguro de contraseña con Bcrypt (factor=12) y persistencia
        hashed_pw = get_password_hash(request.password)
        partes = request.nombre_completo.strip().split(" ", 1)
        nombres = partes[0]
        apellidos = partes[1] if len(partes) > 1 else "."

        empresa_asignada = request.id_empresa or id_empresa

        nuevo_usuario = Usuario(
            id_empresa=empresa_asignada,
            email=email,
            password_hash=hashed_pw,
            nombres=nombres,
            apellidos=apellidos,
            telefono=request.telefono,
            rol=rol_solicitado,
            id_sucursal=request.id_sucursal,
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        db.add(nuevo_usuario)
        db.flush()

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.4: UsuarioEntity confirma persistencia y genera id_usuario
        db.commit()
        db.refresh(nuevo_usuario)

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.5: Registrar auditoría de alta en BitacoraEntity
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"ALTA_USUARIO: Se creó usuario ID {nuevo_usuario.id_usuario} ({nuevo_usuario.email}) con rol {rol_solicitado} en Empresa #{empresa_asignada}"
        )
        db.add(bitacora)
        db.commit()

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 2.6: Retornar UsuarioResponse al Boundary
        sucursal_nombre = nuevo_usuario.sucursal.nombre_sucursal if nuevo_usuario.sucursal else None
        return UsuarioResponse(
            id_usuario=nuevo_usuario.id_usuario,
            id_empresa=nuevo_usuario.id_empresa,
            email=nuevo_usuario.email,
            nombre_completo=nuevo_usuario.nombre_completo,
            telefono=getattr(nuevo_usuario, 'telefono', None),
            rol=nuevo_usuario.rol,
            estado_cuenta=nuevo_usuario.estado_cuenta,
            intentos_fallidos=nuevo_usuario.intentos_fallidos,
            bloqueado_hasta=nuevo_usuario.bloqueado_hasta,
            id_sucursal=nuevo_usuario.id_sucursal,
            sucursal_nombre=sucursal_nombre,
            creado_en=nuevo_usuario.creado_en
        )

    @staticmethod
    def modificar_usuario(
        db: Session,
        id_usuario: int,
        request: UsuarioUpdate,
        admin_id: int,
        ip_origen: str = "127.0.0.1",
        current_user: Optional[Usuario] = None
    ) -> UsuarioResponse:
        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3: Administrador edita campos del usuario y envía la petición
        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.1: Recuperar usuario a modificar en UsuarioEntity
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con ID {id_usuario} no encontrado."
            )

        if current_user and current_user.rol != "SUPER_ADMIN":
            exigir_mismo_tenant(
                current_user,
                usuario.id_empresa,
                "Acceso denegado: No puede modificar un usuario de otra empresa."
            )

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.2: Validar sucursal asignada si fue actualizada
        if request.id_sucursal is not None:
            if request.id_sucursal > 0:
                sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == request.id_sucursal).first()
                if not sucursal:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada.")
                usuario.id_sucursal = request.id_sucursal
            else:
                usuario.id_sucursal = None

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.3: Validar rol asignado en la matriz RBAC
        if request.rol:
            rol_upper = request.rol.upper()
            roles_validos = {"ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA", "CLIENTE"}
            if rol_upper not in roles_validos:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rol inválido.")
            usuario.rol = rol_upper

        if request.nombre_completo:
            partes = request.nombre_completo.strip().split(" ", 1)
            usuario.nombres = partes[0]
            usuario.apellidos = partes[1] if len(partes) > 1 else "."
        if request.telefono is not None:
            usuario.telefono = request.telefono
        if request.estado_cuenta:
            nuevo_estado = request.estado_cuenta.upper()
            usuario.estado_cuenta = nuevo_estado
            if nuevo_estado == "BLOQUEADO_POR_INTENTOS":
                usuario.intentos_fallidos = max(usuario.intentos_fallidos, settings.MAX_LOGIN_ATTEMPTS)
                usuario.bloqueado_hasta = utc_now() + timedelta(minutes=settings.ACCOUNT_LOCK_MINUTES)
            elif nuevo_estado == "ACTIVO":
                usuario.intentos_fallidos = 0
                usuario.bloqueado_hasta = None
            elif nuevo_estado == "INACTIVO":
                usuario.bloqueado_hasta = None

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.4: Persistir cambios de perfil y rol en UsuarioEntity
        db.commit()
        db.refresh(usuario)

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.5: Asentar auditoría de modificación en BitacoraEntity
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"MODIF_USUARIO: Se modificó información de usuario ID {id_usuario}"
        )
        db.add(bitacora)
        db.commit()

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 3.6: Retornar usuario actualizado al Boundary
        sucursal_nombre = usuario.sucursal.nombre_sucursal if usuario.sucursal else None
        return UsuarioResponse(
            id_usuario=usuario.id_usuario,
            email=usuario.email,
            nombre_completo=usuario.nombre_completo,
            telefono=getattr(usuario, 'telefono', None),
            rol=usuario.rol,
            estado_cuenta=usuario.estado_cuenta,
            intentos_fallidos=usuario.intentos_fallidos,
            bloqueado_hasta=usuario.bloqueado_hasta,
            id_sucursal=usuario.id_sucursal,
            sucursal_nombre=sucursal_nombre,
            creado_en=usuario.creado_en
        )

    @staticmethod
    def desbloquear_cuenta(
        db: Session,
        id_usuario: int,
        admin_id: int,
        ip_origen: str = "127.0.0.1",
        current_user: Optional[Usuario] = None
    ) -> DesbloquearUsuarioResponse:
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con ID {id_usuario} no existe en el sistema."
            )

        if current_user and current_user.rol != "SUPER_ADMIN":
            exigir_mismo_tenant(
                current_user,
                usuario.id_empresa,
                "Acceso denegado: No puede desbloquear un usuario de otra empresa."
            )

        usuario.estado_cuenta = "ACTIVO"
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None

        db.commit()
        db.refresh(usuario)

        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"DESBLOQUEO_ADMIN: Administrador ID {admin_id} desbloqueó cuenta de {usuario.email}"
        )
        db.add(bitacora)
        db.commit()

        return DesbloquearUsuarioResponse(
            id_usuario=usuario.id_usuario,
            email=usuario.email,
            estado_cuenta=usuario.estado_cuenta,
            intentos_fallidos=usuario.intentos_fallidos,
            bloqueado_hasta=usuario.bloqueado_hasta,
            mensaje=f"La cuenta del usuario {usuario.email} ha sido desbloqueada exitosamente y restaurada a estado ACTIVO."
        )

    @staticmethod
    def bloquear_cuenta(
        db: Session,
        id_usuario: int,
        admin_id: int,
        minutos: int = 30,
        ip_origen: str = "127.0.0.1",
        current_user: Optional[Usuario] = None
    ) -> DesbloquearUsuarioResponse:
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con ID {id_usuario} no existe en el sistema."
            )
        if usuario.id_usuario == admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puede bloquear su propia cuenta de Administrador."
            )

        if current_user and current_user.rol != "SUPER_ADMIN":
            exigir_mismo_tenant(
                current_user,
                usuario.id_empresa,
                "Acceso denegado: No puede bloquear un usuario de otra empresa."
            )

        usuario.estado_cuenta = "BLOQUEADO_POR_INTENTOS"
        usuario.intentos_fallidos = max(usuario.intentos_fallidos, settings.MAX_LOGIN_ATTEMPTS)
        usuario.bloqueado_hasta = utc_now() + timedelta(minutes=minutos)

        db.commit()
        db.refresh(usuario)

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 5.2: Asentar auditoría de bloqueo en BitacoraEntity
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"BLOQUEO_ADMIN: Administrador ID {admin_id} bloqueó temporalmente la cuenta de {usuario.email} por {minutos} min"
        )
        db.add(bitacora)
        db.commit()

        # CU04: Gestionar Usuarios y Roles (RBAC), Paso 5.3: Confirmar bloqueo a IGestionUsuariosBoundary
        return DesbloquearUsuarioResponse(
            id_usuario=usuario.id_usuario,
            email=usuario.email,
            estado_cuenta=usuario.estado_cuenta,
            intentos_fallidos=usuario.intentos_fallidos,
            bloqueado_hasta=usuario.bloqueado_hasta,
            mensaje=f"La cuenta del usuario {usuario.email} ha sido bloqueada temporalmente por {minutos} minutos."
        )
