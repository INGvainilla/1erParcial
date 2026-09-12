# -*- coding: utf-8 -*-
"""
Esquemas Pydantic / DTO: Pasarela de Pagos Stripe (CU16)
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class IntencionPagoRequest(BaseModel):
    id_orden: int = Field(..., description="ID de la orden de venta en estado PENDIENTE a cobrar")

class IntencionPagoResponse(BaseModel):
    client_secret: str
    publishable_key: str
    id_orden: int
    numero_factura: str
    total: float
    moneda: str
    payment_intent_id: str

class ConfirmarPagoDirectoRequest(BaseModel):
    id_orden: int = Field(..., description="ID de la orden confirmada")
    payment_intent_id: str = Field(..., description="ID del PaymentIntent de Stripe confirmado")

class TransaccionResponse(BaseModel):
    id_transaccion: int
    id_orden: int
    pasarela: str
    payment_intent_id: str
    monto: float
    moneda: str
    estado: str
    marca_tarjeta: Optional[str] = None
    ultimos4: Optional[str] = None
    fecha_creacion: datetime
    numero_factura: Optional[str] = None

    class Config:
        from_attributes = True

class WebhookResponse(BaseModel):
    status: str
    message: str

# --- CU17: Gestión de Tipos y Medios de Cobro ---
class MetodoPagoUpdate(BaseModel):
    activo: Optional[bool] = Field(None, description="Estado operativo del medio de cobro (Activo / Inactivo)")
    credenciales: Optional[Dict[str, str]] = Field(None, description="Parámetros y API keys configurables")

class MetodoPagoResponse(BaseModel):
    id_metodo: int
    codigo: str
    nombre: str
    tipo: str
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    activo: bool
    requiere_credenciales: bool
    credenciales_enmascaradas: Dict[str, str] = {}
    actualizado_en: Optional[datetime] = None

    class Config:
        from_attributes = True

class MetodoPagoPublicoResponse(BaseModel):
    codigo: str
    nombre: str
    tipo: str
    icono: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True

