# -*- coding: utf-8 -*-
"""
Enrutador de API para CU22: Gestionar Respaldo y Restauración de Base de Datos Multitenant.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.backups.schemas import (
    RespaldoResponse, CrearSnapshotRequest, VerificarIntegridadResponse, SnapshotGlobalResponse,
    ProgramacionRespaldoCreate, ProgramacionRespaldoResponse,
    RestaurarSnapshotRequest, RestaurarSnapshotResponse
)
from app.modules.p01_seguridad_acceso.backups.service import BackupService

router = APIRouter(prefix="/backups", tags=["Respaldos y Restauración de Base de Datos (CU22)"])


# ==============================================================================
# Snapshots a Demanda y Descarga
# ==============================================================================

@router.get("/historial", response_model=List[RespaldoResponse])
def listar_historial_respaldos(
    id_empresa: Optional[int] = Query(None, description="Filtro de inquilino (Exclusivo Super Admin)"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Obtiene el historial cronológico de copias de seguridad.
    - Super Admin: Puede consultar cualquier empresa o todas.
    - Administrador de Tenant: Estrictamente restringido a su propia empresa.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.obtener_historial_respaldos(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None
    )


@router.post("/snapshot", response_model=RespaldoResponse, status_code=status.HTTP_201_CREATED)
def generar_snapshot_tenant(
    body: Optional[CrearSnapshotRequest] = None,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Dispara la extracción atómica y compresión de datos del inquilino con sello SHA-256.
    - Super Admin: Puede especificar la empresa destinataria (body.id_empresa).
    - Administrador de Tenant: Siempre genera el snapshot para su propia empresa.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    if is_super:
        tenant_id = (body.id_empresa if body and body.id_empresa else None) or current_user.id_empresa
        if not tenant_id:
            from app.modules.p01_seguridad_acceso.tenants.models import Empresa
            primera = db.query(Empresa).first()
            tenant_id = primera.id_empresa if primera else 1
    else:
        if not current_user.id_empresa:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El administrador no cuenta con una empresa activa asignada."
            )
        tenant_id = current_user.id_empresa

    tablas = body.tablas_alcance if body else None
    return BackupService.generar_snapshot_tenant(
        db=db,
        tenant_id=tenant_id,
        usuario_id=current_user.id_usuario,
        tablas_alcance=tablas
    )


@router.get("/{id_respaldo}/descargar")
def descargar_snapshot(
    id_respaldo: int,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Descarga el archivo de respaldo seguro garantizando aislamiento y firma SHA-256 en header.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    ruta_archivo, nombre_archivo, checksum = BackupService.obtener_archivo_respaldo(
        db=db,
        id_respaldo=id_respaldo,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super
    )

    headers = {
        "Content-Disposition": f'attachment; filename="{nombre_archivo}"',
        "X-Checksum-SHA256": checksum,
        "Access-Control-Expose-Headers": "X-Checksum-SHA256, Content-Disposition"
    }
    return FileResponse(
        path=ruta_archivo,
        filename=nombre_archivo,
        media_type="application/gzip",
        headers=headers
    )


@router.post("/{id_respaldo}/verificar-integridad", response_model=VerificarIntegridadResponse)
def verificar_integridad_snapshot(
    id_respaldo: int,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Recalcula y verifica la validez matemática del Checksum SHA-256 del archivo físico.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.verificar_integridad_checksum(
        db=db,
        id_respaldo=id_respaldo,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super
    )


# ==============================================================================
# CU22: Programación Automática de Respaldos (Fecha y Hora)
# ==============================================================================

@router.post("/programaciones", response_model=ProgramacionRespaldoResponse, status_code=status.HTTP_201_CREATED)
def crear_programacion_respaldo(
    body: ProgramacionRespaldoCreate,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Programa un respaldo automático eligiendo fecha, hora, recurrencia y tablas.
    - Super Admin: Puede programar para cualquier empresa tenant.
    - Administrador de Tenant: Programa para su propia empresa.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    if is_super:
        tenant_id = body.id_empresa or current_user.id_empresa
        if not tenant_id:
            from app.modules.p01_seguridad_acceso.tenants.models import Empresa
            primera = db.query(Empresa).first()
            tenant_id = primera.id_empresa if primera else 1
    else:
        if not current_user.id_empresa:
            raise HTTPException(status_code=403, detail="El administrador no tiene empresa asignada.")
        tenant_id = current_user.id_empresa

    return BackupService.crear_programacion_respaldo(
        db=db,
        tenant_id=tenant_id,
        usuario_id=current_user.id_usuario,
        data=body
    )


@router.get("/programaciones", response_model=List[ProgramacionRespaldoResponse])
def listar_programaciones_respaldo(
    id_empresa: Optional[int] = Query(None, description="Filtro de inquilino (Exclusivo Super Admin)"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Obtiene la lista de políticas de respaldo automático programadas.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.listar_programaciones(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None
    )


@router.delete("/programaciones/{id_programacion}")
def cancelar_programacion_respaldo(
    id_programacion: int,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Cancela y desactiva una política de respaldo programado.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.cancelar_programacion(
        db=db,
        id_programacion=id_programacion,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super
    )


@router.post("/programaciones/{id_programacion}/ejecutar", response_model=RespaldoResponse)
def ejecutar_programacion_inmediata(
    id_programacion: int,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Dispara la ejecución forzada inmediata de una regla programada.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.ejecutar_programacion_inmediata(
        db=db,
        id_programacion=id_programacion,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        usuario_id=current_user.id_usuario
    )


@router.post("/programaciones/ejecutar-pendientes")
def ejecutar_programaciones_pendientes(
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Disparo de verificación de políticas automáticas vencidas (Daemon / Cron).
    """
    return BackupService.ejecutar_programaciones_pendientes(db=db)


# ==============================================================================
# CU22: Restauración de Respaldo Multitenant
# ==============================================================================

@router.post("/{id_respaldo}/restaurar", response_model=RestaurarSnapshotResponse)
def restaurar_snapshot_tenant(
    id_respaldo: int,
    body: Optional[RestaurarSnapshotRequest] = None,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Restaura atómicamente un snapshot del inquilino a la base de datos tras verificar Checksum SHA-256.
    - Super Admin: Puede restaurar cualquier respaldo.
    - Administrador de Tenant: Sólo puede restaurar respaldos de su propio inquilino.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return BackupService.restaurar_snapshot_tenant(
        db=db,
        id_respaldo=id_respaldo,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        usuario_id=current_user.id_usuario
    )


# ==============================================================================
# Respaldo WAL Global de Infraestructura (Exclusivo Super Admin)
# ==============================================================================

@router.post("/global-wal", response_model=SnapshotGlobalResponse)
def disparar_wal_infraestructura(
    cluster_id: str = Query("cluster-render-pg15", description="Identificador del cluster PostgreSQL"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    CU22: Disparo de respaldo físico WAL/PITR para recuperación de desastres globales (Exclusivo Super Admin).
    """
    return BackupService.disparar_wal_global_cluster(
        db=db,
        superadmin_usuario_id=current_user.id_usuario,
        cluster_id=cluster_id
    )
