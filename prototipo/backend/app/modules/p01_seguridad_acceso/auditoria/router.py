# -*- coding: utf-8 -*-
"""
Enrutador de API para CU21: Gestionar Bitácora y Auditoría de Accesos Multitenant.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.auditoria.schemas import (
    BitacoraItemResponse, MetricasSeguridadResponse, CuentaBloqueadaItem, DesbloqueoResponse
)
from app.modules.p01_seguridad_acceso.auditoria.service import AuditoriaService

router = APIRouter(prefix="/auditoria", tags=["Bitácora y Auditoría de Accesos (CU21)"])


@router.get("/eventos", response_model=List[BitacoraItemResponse])
def consultar_eventos_auditoria(
    fecha_desde: Optional[datetime] = Query(None, description="Fecha de inicio ISO 8601"),
    fecha_hasta: Optional[datetime] = Query(None, description="Fecha de fin ISO 8601"),
    tipo_evento: Optional[str] = Query(None, description="Filtro por tipo de evento"),
    exitoso: Optional[bool] = Query(None, description="Filtro por éxito/fallo"),
    ip_origen: Optional[str] = Query(None, description="Filtro por IP de origen"),
    id_usuario: Optional[int] = Query(None, description="Filtro por usuario específico"),
    id_empresa: Optional[int] = Query(None, description="Filtro por empresa (Exclusivo Super Admin)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU21: Consulta registros inmutables de auditoría.
    Si el usuario es ADMINISTRADOR, se filtra estrictamente por su id_empresa.
    Si es SUPER_ADMIN, puede consultar global o filtrar por inquilino.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return AuditoriaService.consultar_eventos(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        tipo_evento=tipo_evento,
        exitoso=exitoso,
        ip_origen=ip_origen,
        usuario_id=id_usuario,
        limit=limit,
        offset=offset
    )


@router.get("/metricas", response_model=MetricasSeguridadResponse)
def obtener_metricas_seguridad(
    id_empresa: Optional[int] = Query(None, description="Filtro por empresa (Exclusivo Super Admin)"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU21: Resumen de métricas de seguridad en las últimas 24 horas y detección de fuerza bruta.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return AuditoriaService.obtener_metricas_seguridad(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None
    )


@router.get("/cuentas-bloqueadas", response_model=List[CuentaBloqueadaItem])
def listar_cuentas_bloqueadas(
    id_empresa: Optional[int] = Query(None, description="Filtro por empresa (Exclusivo Super Admin)"),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU21: Lista cuentas actualmente suspendidas o bloqueadas por exceso de intentos fallidos.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    return AuditoriaService.listar_cuentas_bloqueadas(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None
    )


@router.post("/desbloquear-cuenta/{id_usuario}", response_model=DesbloqueoResponse)
def desbloquear_cuenta_endpoint(
    id_usuario: int,
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU21: Desbloqueo administrativo de cuenta previo análisis de seguridad.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    usuario = AuditoriaService.desbloquear_cuenta(
        db=db,
        id_usuario=id_usuario,
        admin_usuario_id=current_user.id_usuario,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super
    )
    return DesbloqueoResponse(
        id_usuario=usuario.id_usuario,
        email=usuario.email,
        estado_cuenta=usuario.estado_cuenta,
        mensaje="Cuenta desbloqueada exitosamente y registrada en bitácora de auditoría."
    )


@router.get("/exportar")
def exportar_auditoria_csv(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    tipo_evento: Optional[str] = Query(None),
    exitoso: Optional[bool] = Query(None),
    id_empresa: Optional[int] = Query(None),
    current_user: Usuario = Depends(require_roles(["SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA"])),
    db: Session = Depends(get_db)
):
    """
    CU21: Exporta reporte formal de auditoría en formato CSV con firma SHA-256 en cabecera HTTP.
    """
    is_super = current_user.rol == "SUPER_ADMIN"
    eventos = AuditoriaService.consultar_eventos(
        db=db,
        tenant_id=current_user.id_empresa,
        is_superadmin=is_super,
        empresa_id_filtro=id_empresa if is_super else None,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        tipo_evento=tipo_evento,
        exitoso=exitoso,
        limit=5000,
        offset=0
    )

    tenant_name = current_user.empresa.nombre_comercial if current_user.empresa else "FashionStore Global"
    csv_bytes, sha256_hash, filename = AuditoriaService.exportar_informe_csv(eventos, tenant_name)

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "text/csv; charset=utf-8",
        "X-Checksum-SHA256": sha256_hash,
        "X-Total-Records": str(len(eventos))
    }
    return Response(content=csv_bytes, media_type="text/csv", headers=headers)
