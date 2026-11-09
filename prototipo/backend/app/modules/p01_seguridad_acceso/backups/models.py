# -*- coding: utf-8 -*-
"""
Modelos de base de datos para CU22: Gestionar Respaldo y Restauración de Base de Datos Multitenant.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, ForeignKey, Boolean
from app.core.database import Base


def _utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class RespaldoTenant(Base):
    """
    Entidad Respaldo (RespaldoTenantEntity):
    Registro inmutable de snapshots lógicos y físicos con firma criptográfica SHA-256 (CU22).
    """
    __tablename__ = "respaldos_tenant"

    id_respaldo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_empresa = Column(Integer, ForeignKey("empresas.id_empresa", ondelete="CASCADE"), nullable=False, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    nombre_archivo = Column(String(255), nullable=False)
    tipo_respaldo = Column(String(50), nullable=False, default="SNAPSHOT_TENANT")
    tamano_bytes = Column(BigInteger, nullable=False, default=0)
    checksum_sha256 = Column(String(64), nullable=False)
    estado = Column(String(30), nullable=False, default="COMPLETADO")
    tablas_incluidas = Column(Text, nullable=True)
    total_registros = Column(Integer, nullable=False, default=0)
    ruta_almacenamiento = Column(String(500), nullable=True)
    fecha_creacion = Column(DateTime, default=_utc_now)


class ProgramacionRespaldo(Base):
    """
    Entidad ProgramacionRespaldo (CU22):
    Permite a cada Administrador de Tenant y al Super Administrador definir una política
    de respaldo automático eligiendo fecha y hora de ejecución, frecuencia (UNA_VEZ, DIARIO, SEMANAL, MENSUAL),
    y alcance de tablas.
    """
    __tablename__ = "programaciones_respaldo"

    id_programacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_empresa = Column(Integer, ForeignKey("empresas.id_empresa", ondelete="CASCADE"), nullable=False, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    nombre = Column(String(150), nullable=False, default="Respaldo Automático Programado")
    fecha_hora_programada = Column(DateTime, nullable=False)
    frecuencia = Column(String(30), nullable=False, default="UNA_VEZ")  # UNA_VEZ, DIARIO, SEMANAL, MENSUAL
    hora_ejecucion = Column(String(10), nullable=True, default="02:00")  # HH:MM
    activo = Column(Boolean, nullable=False, default=True)
    estado = Column(String(30), nullable=False, default="PROGRAMADO")  # PROGRAMADO, EJECUTADO, CANCELADO, FALLIDO
    tablas_alcance = Column(Text, nullable=True)
    ultimo_respaldo_id = Column(Integer, ForeignKey("respaldos_tenant.id_respaldo", ondelete="SET NULL"), nullable=True)
    fecha_ultima_ejecucion = Column(DateTime, nullable=True)
    resultado = Column(Text, nullable=True)
    creado_en = Column(DateTime, default=_utc_now)


