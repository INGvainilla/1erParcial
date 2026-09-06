# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Administración de Usuarios y Roles (CU04)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_password_hash
from app.modules.auth.models import Usuario, BitacoraAcceso
from app.modules.sucursales.models import Sucursal
from app.modules.usuarios.schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse, DesbloquearUsuarioResponse
)

class UsuarioAdminControl:
    """
    Controlador de Gestión de Usuarios y Roles (UsuarioAdminControl - CU04)
    Maneja el ciclo de vida de los empleados del sistema y el desbloqueo de seguridad.
    """

    @staticmethod
    def listar_usuarios(
        db: Session,
        rol: Optional[str] = None,
        estado: Optional[str] = None,
        id_sucursal: Optional[int] = None
    ) -> List[UsuarioResponse]:
        # =========================================================================
        # CASO DE USO: CU04 - Gestionar Usuarios y Roles (Consulta y Filtros)
        # =========================================================================
        # Paso 1: El Administrador accede al panel de usuarios y define criterios de filtro
        # Paso 1.1: IGestionUsuariosBoundary invoca listar_usuarios() en UsuarioAdminControl
        query = db.query(Usuario).options(joinedload(Usuario.sucursal))
        
        # Paso 1.2: UsuarioAdminControl aplica los filtros sobre UsuarioEntity
        if rol:
            query = query.filter(Usuario.rol == rol.upper())
        if estado:
            query = query.filter(Usuario.estado_cuenta == estado.upper())
        if id_sucursal:
            query = query.filter(Usuario.id_sucursal == id_sucursal)

        # Paso 1.3: UsuarioEntity ejecuta la consulta y retorna la colección de usuarios
        usuarios = query.order_by(Usuario.id_usuario.desc()).all()

        # Paso 1.4: Mapear respuesta incluyendo el nombre descriptivo de la sucursal asignada
        resultado = []
        for u in usuarios:
            sucursal_nombre = u.sucursal.nombre_sucursal if u.sucursal else None
            resultado.append(UsuarioResponse(
                id_usuario=u.id_usuario,
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
        ip_origen: str = "127.0.0.1"
    ) -> UsuarioResponse:
        # =========================================================================
        # CASO DE USO: CU04 - Gestionar Usuarios y Roles (Alta de Empleado)
        # Diagrama de Comunicación: Com_CU04_Gestionar_Usuarios
        # =========================================================================
        # Paso 1: El Administrador ingresa datos del usuario (email, clave, rol, sucursal) en IGestionUsuariosBoundary
        email = request.email.strip().lower()
        rol_solicitado = request.rol.upper()

        roles_validos = {"ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA", "CLIENTE"}
        if rol_solicitado not in roles_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rol '{rol_solicitado}' no es válido en la matriz RBAC."
            )

        # Paso 1.1: IGestionUsuariosBoundary envía registrarOModificarUsuario(datosUsuario) a UsuarioAdminControl

        # Paso 1.2: UsuarioAdminControl verifica si la sucursal física asignada existe y está activa
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

        # Paso 1.3: UsuarioAdminControl verifica unicidad del correo electrónico en UsuarioEntity
        usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado por otro usuario."
            )

        # Paso 1.4: Cifrado seguro de contraseña inicial mediante Bcrypt (factor=12) y persistencia en UsuarioEntity
        hashed_pw = get_password_hash(request.password)
        partes = request.nombre_completo.strip().split(" ", 1)
        nombres = partes[0]
        apellidos = partes[1] if len(partes) > 1 else "."

        nuevo_usuario = Usuario(
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

        # Paso 1.5: UsuarioEntity confirma la persistencia y retorna el id_usuario generado
        db.commit()
        db.refresh(nuevo_usuario)

        # Paso 1.6: UsuarioAdminControl asienta el evento de auditoría en BitacoraEntity
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"ALTA_USUARIO: Se creó usuario ID {nuevo_usuario.id_usuario} ({nuevo_usuario.email}) con rol {rol_solicitado}"
        )
        db.add(bitacora)
        db.commit()

        # Paso 1.7: UsuarioAdminControl devuelve el usuario registrado al Boundary
        sucursal_nombre = nuevo_usuario.sucursal.nombre_sucursal if nuevo_usuario.sucursal else None
        return UsuarioResponse(
            id_usuario=nuevo_usuario.id_usuario,
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
        ip_origen: str = "127.0.0.1"
    ) -> UsuarioResponse:
        # =========================================================================
        # CASO DE USO: CU04 - Modificación de Datos y Roles de Usuario
        # =========================================================================
        # Paso 1: El Administrador edita campos del usuario y envía la petición
        # Paso 1.1: IGestionUsuariosBoundary invoca modificarUsuario() en UsuarioAdminControl
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con ID {id_usuario} no encontrado."
            )

        # Paso 1.2: Validar sucursal si fue modificada
        if request.id_sucursal is not None:
            if request.id_sucursal > 0:
                sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == request.id_sucursal).first()
                if not sucursal:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada.")
                usuario.id_sucursal = request.id_sucursal
            else:
                usuario.id_sucursal = None

        # Paso 1.3: Validar rol si fue modificado
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
            usuario.estado_cuenta = request.estado_cuenta.upper()

        # Paso 1.4: UsuarioAdminControl persiste los cambios en UsuarioEntity
        db.commit()
        db.refresh(usuario)

        # Paso 1.5: Registrar auditoría en BitacoraEntity
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"MODIF_USUARIO: Se modificó información de usuario ID {id_usuario}"
        )
        db.add(bitacora)
        db.commit()

        # Paso 1.6: Retornar usuario modificado
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
        ip_origen: str = "127.0.0.1"
    ) -> DesbloquearUsuarioResponse:
        # =========================================================================
        # CASO DE USO: CU04 - Desbloqueo Administrativo de Cuenta Bloqueada
        # Diagrama de Comunicación: Com_CU04_Gestionar_Usuarios (Mensaje 2)
        # =========================================================================
        # Paso 2: El Administrador pulsa el botón 'Desbloquear Cuenta' en IGestionUsuariosBoundary
        # Paso 2.1: IGestionUsuariosBoundary invoca desbloquearCuentaUsuario(usuario_id) en UsuarioAdminControl
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con ID {id_usuario} no existe en el sistema."
            )

        # Paso 2.2: UsuarioAdminControl resetea intentos fallidos, limpia bloqueado_hasta y actualiza estado en UsuarioEntity
        usuario.estado_cuenta = "ACTIVO"
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None

        # Paso 2.3: UsuarioEntity confirma actualización exitosa (estado='ACTIVO', intentos=0)
        db.commit()
        db.refresh(usuario)

        # Registrar auditoría de seguridad
        bitacora = BitacoraAcceso(
            id_usuario=admin_id,
            ip_origen=ip_origen,
            exitoso=True,
            motivo=f"DESBLOQUEO_ADMIN: Administrador ID {admin_id} desbloqueó cuenta de {usuario.email}"
        )
        db.add(bitacora)
        db.commit()

        # Paso 2.4: UsuarioAdminControl confirma la reactivación al Boundary
        # Paso 2.5: IGestionUsuariosBoundary actualiza el badge a verde [ACTIVO]
        return DesbloquearUsuarioResponse(
            id_usuario=usuario.id_usuario,
            email=usuario.email,
            estado_cuenta=usuario.estado_cuenta,
            intentos_fallidos=usuario.intentos_fallidos,
            mensaje=f"La cuenta del usuario {usuario.email} ha sido desbloqueada exitosamente y restaurada a estado ACTIVO."
        )
