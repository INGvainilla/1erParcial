# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para CU22: Gestionar Respaldo y Restauración de Base de Datos Multitenant.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CrearSnapshotRequest(BaseModel):
    id_empresa: Optional[int] = Field(
        None,
        description="ID de empresa a respaldar (Exclusivo Super Admin; los administradores de tenant siempre respaldan su propia empresa)"
    )
    tablas_alcance: Optional[List[str]] = Field(
        None,
        description="Tablas a incluir o None para todas las tablas operativas del inquilino"
    )
    comentario: Optional[str] = Field(None, description="Nota descriptiva del respaldo")


class RespaldoResponse(BaseModel):
    id_respaldo: int
    id_empresa: int
    id_usuario: Optional[int] = None
    nombre_archivo: str
    tipo_respaldo: str
    tamano_bytes: int
    tamano_mb: float
    checksum_sha256: str
    estado: str
    tablas_incluidas: Optional[str] = None
    total_registros: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class VerificarIntegridadResponse(BaseModel):
    id_respaldo: int
    checksum_registrado: str
    checksum_calculado: str
    integro: bool
    tamano_bytes: int
    mensaje: str


class SnapshotGlobalResponse(BaseModel):
    cluster_id: str
    tipo_respaldo: str
    checksum_sha256: str
    nombre_archivo: str
    tamano_bytes: int
    total_registros: int
    estado: str
    mensaje: str


# ==============================================================================
# CU22: Programación Automática de Respaldos (Fecha y Hora)
# ==============================================================================

class ProgramacionRespaldoCreate(BaseModel):
    id_empresa: Optional[int] = Field(
        None,
        description="ID de empresa destinataria (Exclusivo Super Admin; los administradores de tenant configuran la suya)"
    )
    nombre: str = Field("Respaldo Automático Programado", description="Nombre descriptivo de la política")
    fecha_hora_programada: datetime = Field(..., description="Fecha y hora de ejecución programada (ISO 8601)")
    frecuencia: str = Field("UNA_VEZ", description="Frecuencia: UNA_VEZ, DIARIO, SEMANAL, MENSUAL")
    hora_ejecucion: Optional[str] = Field("02:00", description="Hora sugerida en formato HH:MM")
    tablas_alcance: Optional[List[str]] = Field(None, description="Subconjunto de tablas o None para todas")


class ProgramacionRespaldoResponse(BaseModel):
    id_programacion: int
    id_empresa: int
    nombre_empresa: Optional[str] = None
    id_usuario: Optional[int] = None
    nombre: str
    fecha_hora_programada: datetime
    frecuencia: str
    hora_ejecucion: Optional[str] = None
    activo: bool
    estado: str
    tablas_alcance: Optional[str] = None
    ultimo_respaldo_id: Optional[int] = None
    fecha_ultima_ejecucion: Optional[datetime] = None
    resultado: Optional[str] = None
    creado_en: datetime

    class Config:
        from_attributes = True


# ==============================================================================
# CU22: Restauración de Respaldo Multitenant
# ==============================================================================

class RestaurarSnapshotRequest(BaseModel):
    confirmar: bool = Field(True, description="Confirmación explícita de sobreescritura/restauración")


class RestaurarSnapshotResponse(BaseModel):
    id_respaldo: int
    id_empresa: int
    exitoso: bool
    total_tuplas_restauradas: int
    tablas_restauradas: List[str]
    checksum_verificado: str
    mensaje: str
    fecha_restauracion: datetime
