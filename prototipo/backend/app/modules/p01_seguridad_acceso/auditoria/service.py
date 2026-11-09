# -*- coding: utf-8 -*-
"""
Servicio de Dominio para CU21: Gestionar Bitácora y Auditoría de Accesos Multitenant.
Implementa:
- Filtrado cronológico y aislamiento estricto por tenant_id (o supervisión cross-tenant para SUPER_ADMIN).
- Detección de fuerza bruta y métricas de seguridad (24h).
- Desbloqueo preventivo de cuentas.
- Generación de informe formal de auditoría con sello SHA-256 (CSV / PDF).
"""
import io
import csv
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from fastapi import HTTPException, status

from app.modules.p01_seguridad_acceso.auth.models import BitacoraAcceso, Usuario
from app.modules.p01_seguridad_acceso.auditoria.schemas import (
    BitacoraItemResponse, MetricasSeguridadResponse, CuentaBloqueadaItem
)


def _utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AuditoriaService:

    @staticmethod
    def consultar_eventos(
        db: Session,
        tenant_id: Optional[int],
        is_superadmin: bool = False,
        empresa_id_filtro: Optional[int] = None,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        tipo_evento: Optional[str] = None,
        exitoso: Optional[bool] = None,
        ip_origen: Optional[str] = None,
        usuario_id: Optional[int] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[BitacoraItemResponse]:
        """
        CU21: Consulta eventos de auditoría garantizando aislamiento multitenant.
        Si no es Super Admin, restringe irrevocablemente a id_empresa == tenant_id.
        """
        query = db.query(BitacoraAcceso, Usuario).outerjoin(
            Usuario, BitacoraAcceso.id_usuario == Usuario.id_usuario
        )

        # Regla de Aislamiento Multitenant (Secuencia CU21 Paso 4 y 7a/7b)
        if not is_superadmin:
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Aislamiento Multitenant: El usuario no cuenta con un tenant_id asignado."
                )
            query = query.filter(
                or_(
                    BitacoraAcceso.id_empresa == tenant_id,
                    Usuario.id_empresa == tenant_id
                )
            )
        else:
            # Super Admin puede filtrar por tenant específico o ver global (incluye eventos de plataforma)
            if empresa_id_filtro is not None:
                query = query.filter(
                    or_(
                        BitacoraAcceso.id_empresa == empresa_id_filtro,
                        Usuario.id_empresa == empresa_id_filtro,
                        BitacoraAcceso.id_empresa.is_(None)
                    )
                )

        # Filtros opcionales
        if fecha_desde:
            query = query.filter(BitacoraAcceso.fecha_hora >= fecha_desde)
        if fecha_hasta:
            query = query.filter(BitacoraAcceso.fecha_hora <= fecha_hasta)
        if tipo_evento:
            query = query.filter(BitacoraAcceso.tipo_evento == tipo_evento)
        if exitoso is not None:
            query = query.filter(BitacoraAcceso.exitoso == exitoso)
        if ip_origen:
            query = query.filter(BitacoraAcceso.ip_origen.ilike(f"%{ip_origen}%"))
        if usuario_id:
            query = query.filter(BitacoraAcceso.id_usuario == usuario_id)

        rows = query.order_by(desc(BitacoraAcceso.fecha_hora)).offset(offset).limit(limit).all()

        resultado: List[BitacoraItemResponse] = []
        for bitacora, usuario in rows:
            empresa_val = bitacora.id_empresa or (usuario.id_empresa if usuario else None)
            resultado.append(
                BitacoraItemResponse(
                    id_bitacora=bitacora.id_bitacora,
                    id_empresa=empresa_val,
                    id_usuario=bitacora.id_usuario,
                    nombre_usuario=f"{usuario.nombres} {usuario.apellidos}" if usuario else None,
                    email_usuario=usuario.email if usuario else bitacora.email_intento,
                    rol_usuario=usuario.rol if usuario else None,
                    tipo_evento=bitacora.tipo_evento or ("LOGIN_EXITOSO" if bitacora.exitoso else "LOGIN_FALLIDO"),
                    ip_origen=bitacora.ip_origen,
                    user_agent=bitacora.user_agent,
                    exitoso=bitacora.exitoso,
                    motivo=bitacora.motivo,
                    detalles_json=bitacora.detalles_json,
                    fecha_hora=bitacora.fecha_hora
                )
            )
        return resultado

    @staticmethod
    def obtener_metricas_seguridad(
        db: Session,
        tenant_id: Optional[int],
        is_superadmin: bool = False,
        empresa_id_filtro: Optional[int] = None
    ) -> MetricasSeguridadResponse:
        """
        CU21: Métricas de seguridad y detección de fuerza bruta en las últimas 24 horas.
        """
        hace_24h = _utc_now() - timedelta(hours=24)

        query = db.query(BitacoraAcceso, Usuario).outerjoin(
            Usuario, BitacoraAcceso.id_usuario == Usuario.id_usuario
        ).filter(BitacoraAcceso.fecha_hora >= hace_24h)

        if not is_superadmin:
            query = query.filter(
                or_(
                    BitacoraAcceso.id_empresa == tenant_id,
                    Usuario.id_empresa == tenant_id
                )
            )
        elif empresa_id_filtro:
            query = query.filter(
                or_(
                    BitacoraAcceso.id_empresa == empresa_id_filtro,
                    Usuario.id_empresa == empresa_id_filtro,
                    BitacoraAcceso.id_empresa.is_(None)
                )
            )

        eventos_24h = query.all()
        total_24h = len(eventos_24h)
        exitosos = sum(1 for b, _ in eventos_24h if b.exitoso)
        fallidos = total_24h - exitosos
        tasa_exito = round((exitosos / total_24h * 100.0), 2) if total_24h > 0 else 100.0

        # Cuentas bloqueadas actualmente
        q_bloqueados = db.query(Usuario).filter(
            or_(
                Usuario.estado_cuenta == "BLOQUEADO_POR_INTENTOS",
                Usuario.intentos_fallidos >= 5
            )
        )
        if not is_superadmin:
            q_bloqueados = q_bloqueados.filter(Usuario.id_empresa == tenant_id)
        elif empresa_id_filtro:
            q_bloqueados = q_bloqueados.filter(Usuario.id_empresa == empresa_id_filtro)
        total_bloqueados = q_bloqueados.count()

        # Detección de patrones de fuerza bruta (IPs con >= 3 fallos en 24h)
        ip_fallos: Dict[str, int] = {}
        for b, _ in eventos_24h:
            if not b.exitoso:
                ip_fallos[b.ip_origen] = ip_fallos.get(b.ip_origen, 0) + 1

        ips_sospechosas = [
            {"ip": ip, "fallos_24h": count, "alerta": "ALTA" if count >= 5 else "MEDIA"}
            for ip, count in sorted(ip_fallos.items(), key=lambda x: x[1], reverse=True)
            if count >= 3
        ]

        return MetricasSeguridadResponse(
            id_empresa=empresa_id_filtro if is_superadmin else tenant_id,
            total_accesos_24h=total_24h,
            total_exitosos_24h=exitosos,
            total_fallidos_24h=fallidos,
            tasa_exito_porcentaje=tasa_exito,
            total_cuentas_bloqueadas=total_bloqueados,
            ips_sospechosas=ips_sospechosas
        )

    @staticmethod
    def listar_cuentas_bloqueadas(
        db: Session,
        tenant_id: Optional[int],
        is_superadmin: bool = False,
        empresa_id_filtro: Optional[int] = None
    ) -> List[CuentaBloqueadaItem]:
        """
        CU21: Lista usuarios bloqueados o en castigo preventivo.
        """
        query = db.query(Usuario).filter(
            or_(
                Usuario.estado_cuenta == "BLOQUEADO_POR_INTENTOS",
                Usuario.intentos_fallidos >= 5
            )
        )
        if not is_superadmin:
            query = query.filter(Usuario.id_empresa == tenant_id)
        elif empresa_id_filtro:
            query = query.filter(Usuario.id_empresa == empresa_id_filtro)

        usuarios = query.all()
        ahora = _utc_now()
        items: List[CuentaBloqueadaItem] = []
        for u in usuarios:
            minutos = 0
            if u.bloqueado_hasta and u.bloqueado_hasta > ahora:
                minutos = max(1, int((u.bloqueado_hasta - ahora).total_seconds() / 60))
            items.append(
                CuentaBloqueadaItem(
                    id_usuario=u.id_usuario,
                    id_empresa=u.id_empresa,
                    nombres=u.nombres,
                    apellidos=u.apellidos,
                    email=u.email,
                    rol=u.rol,
                    intentos_fallidos=u.intentos_fallidos,
                    bloqueado_hasta=u.bloqueado_hasta,
                    minutos_restantes=minutos
                )
            )
        return items

    @staticmethod
    def desbloquear_cuenta(
        db: Session,
        id_usuario: int,
        admin_usuario_id: int,
        tenant_id: Optional[int],
        is_superadmin: bool = False
    ) -> Usuario:
        """
        CU21: Desbloqueo administrativo de cuenta y registro en auditoría.
        """
        usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        if not is_superadmin and usuario.id_empresa != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para desbloquear usuarios de otra empresa tenant."
            )

        usuario.estado_cuenta = "ACTIVO"
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None

        # Asiento en auditoría
        bitacora = BitacoraAcceso(
            id_usuario=admin_usuario_id,
            id_empresa=usuario.id_empresa,
            email_intento=usuario.email,
            tipo_evento="DESBLOQUEO_MANUAL",
            ip_origen="127.0.0.1",
            user_agent="Panel Admin Auditoria",
            exitoso=True,
            motivo=f"Desbloqueo preventivo de cuenta {usuario.email} por administrador #{admin_usuario_id}"
        )
        db.add(bitacora)
        db.commit()
        db.refresh(usuario)
        return usuario

    @staticmethod
    def exportar_informe_csv(
        eventos: List[BitacoraItemResponse],
        tenant_nombre: str = "Empresa Tenant"
    ) -> Tuple[bytes, str, str]:
        """
        CU21: Genera CSV firmado con metadatos y Checksum SHA-256.
        Retorna (contenido_bytes, checksum_sha256, filename).
        """
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')

        writer.writerow(["FASHIONSTORE SAAS - REPORTE DE AUDITORÍA Y SEGURIDAD"])
        writer.writerow(["Inquilino:", tenant_nombre])
        writer.writerow(["Fecha Emisión (UTC):", _utc_now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow(["Total Registros:", len(eventos)])
        writer.writerow([])
        writer.writerow([
            "ID", "Fecha y Hora (UTC)", "Tipo Evento", "Usuario", "Email",
            "Rol", "Dirección IP", "Exitoso", "Motivo / Detalle"
        ])

        for ev in eventos:
            writer.writerow([
                ev.id_bitacora,
                ev.fecha_hora.strftime("%Y-%m-%d %H:%M:%S"),
                ev.tipo_evento,
                ev.nombre_usuario or "N/A",
                ev.email_usuario or "N/A",
                ev.rol_usuario or "N/A",
                ev.ip_origen,
                "SI" if ev.exitoso else "NO",
                ev.motivo or ""
            ])

        csv_str = output.getvalue()
        csv_bytes = csv_str.encode("utf-8-sig")
        sha256 = hashlib.sha256(csv_bytes).hexdigest()
        filename = f"auditoria_seguridad_{_utc_now().strftime('%Y%m%d_%H%M%S')}.csv"
        return csv_bytes, sha256, filename

