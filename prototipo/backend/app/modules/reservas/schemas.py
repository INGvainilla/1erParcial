# -*- coding: utf-8 -*-
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ReservaDetalleCreate(BaseModel):
    id_producto: int
    talla: str
    color: str
    cantidad: int

class ReservaDetalleResponse(BaseModel):
    id_reserva_detalle: int
    id_producto: int
    talla: str
    color: str
    cantidad: int

    model_config = ConfigDict(from_attributes=True)

class ReservaCreate(BaseModel):
    id_sucursal: int
    fecha_visita: datetime
    detalles: List[ReservaDetalleCreate]

class ReservaResponse(BaseModel):
    id_reserva: int
    id_usuario: int
    id_sucursal: int
    codigo_qr: str
    fecha_visita: datetime
    estado: str
    creado_en: datetime
    detalles: List[ReservaDetalleResponse]

    model_config = ConfigDict(from_attributes=True)

class ReservaEstadoUpdate(BaseModel):
    estado: str

class ReservaQrScanRequest(BaseModel):
    codigo_qr: str

class ReservaEncargadoResponse(BaseModel):
    """Respuesta enriquecida para el tablero del encargado (CU12)"""
    id_reserva: int
    id_usuario: int
    id_sucursal: int
    codigo_qr: str
    qr_texto: Optional[str] = None
    fecha_visita: datetime
    estado: str
    creado_en: datetime
    nombre_cliente: Optional[str] = None
    detalles: List[ReservaDetalleResponse]

    model_config = ConfigDict(from_attributes=True)

