# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para CU21: Gestionar Bitácora y Auditoría de Accesos Multitenant.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class BitacoraItemResponse(BaseModel):
    id_bitacora: int
    id_empresa: Optional[int] = None
    id_usuario: Optional[int] = None
    nombre_usuario: Optional[str] = None
    email_usuario: Optional[str] = None
    rol_usuario: Optional[str] = None
    tipo_evento: str
    ip_origen: str
    user_agent: Optional[str] = None
    exitoso: bool
    motivo: Optional[str] = None
    detalles_json: Optional[str] = None
    fecha_hora: datetime

    class Config:
        from_attributes = True


class MetricasSeguridadResponse(BaseModel):
    id_empresa: Optional[int] = None
    total_accesos_24h: int
    total_exitosos_24h: int
    total_fallidos_24h: int
    tasa_exito_porcentaje: float
    total_cuentas_bloqueadas: int
    ips_sospechosas: List[Dict[str, Any]]


class CuentaBloqueadaItem(BaseModel):
    id_usuario: int
    id_empresa: Optional[int] = None
    nombres: str
    apellidos: str
    email: str
    rol: str
    intentos_fallidos: int
    bloqueado_hasta: Optional[datetime] = None
    minutos_restantes: Optional[int] = None

    class Config:
        from_attributes = True


class DesbloqueoResponse(BaseModel):
    id_usuario: int
    email: str
    estado_cuenta: str
    mensaje: str

