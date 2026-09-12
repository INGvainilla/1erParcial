# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Logística y Despacho de Delivery (CU18)
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class CalcularTarifaRequest(BaseModel):
    latitud_origen: float = Field(..., description="Latitud de la sucursal o almacén de origen")
    longitud_origen: float = Field(..., description="Longitud de la sucursal o almacén de origen")
    latitud_destino: float = Field(..., description="Latitud de entrega del cliente")
    longitud_destino: float = Field(..., description="Longitud de entrega del cliente")

class CalcularTarifaResponse(BaseModel):
    distancia_km: float
    costo_envio: float
    tiempo_estimado_minutos: int

class AsignarRepartidorRequest(BaseModel):
    id_repartidor: Optional[int] = Field(None, description="ID del usuario con rol REPARTIDOR o personal de entrega")
    nombre_repartidor: str = Field(..., description="Nombre del repartidor o agencia de courier")
    telefono_repartidor: Optional[str] = Field(None, description="Teléfono de contacto del repartidor")

class CambioEstadoLogistica(BaseModel):
    nuevo_estado: str = Field(..., description="Nuevo estado logístico: PREPARACION, LISTO_DESPACHO, EN_TRANSITO, ENTREGADA")
    notas: Optional[str] = Field(None, description="Observaciones o notas de la transición")

class PrendaEmpaqueItem(BaseModel):
    id_detalle_orden: int
    id_producto: int
    nombre_producto: str
    codigo_sku_base: str
    imagen_principal: Optional[str] = None
    talla: str
    color: str
    cantidad: int

    model_config = ConfigDict(from_attributes=True)

class LogisticaOrdenResponse(BaseModel):
    id_orden: int
    numero_factura: Optional[str] = None
    canal_venta: str
    modalidad_entrega: str
    id_usuario: Optional[int] = None
    nombre_cliente: Optional[str] = None
    telefono_contacto: Optional[str] = None
    direccion_envio: Optional[str] = None
    notas_entrega: Optional[str] = None
    latitud_destino: Optional[float] = None
    longitud_destino: Optional[float] = None
    distancia_km: Optional[float] = None
    costo_envio: float
    total: float
    estado_pago: str
    estado_logistica: str
    creado_en: datetime
    # Datos de Repartidor
    id_repartidor: Optional[int] = None
    nombre_repartidor: Optional[str] = None
    telefono_repartidor: Optional[str] = None
    # Sucursal de origen
    id_sucursal: Optional[int] = None
    nombre_sucursal: Optional[str] = None
    # Prendas para empaque
    prendas: List[PrendaEmpaqueItem] = []

    model_config = ConfigDict(from_attributes=True)

class TrackingPaso(BaseModel):
    codigo: str
    titulo: str
    descripcion: str
    completado: bool
    activo: bool
    icono: str

class TrackingResponse(BaseModel):
    id_orden: int
    numero_factura: Optional[str] = None
    estado_pago: str
    estado_logistica: str
    direccion_envio: Optional[str] = None
    nombre_cliente: Optional[str] = None
    nombre_repartidor: Optional[str] = None
    telefono_repartidor: Optional[str] = None
    distancia_km: Optional[float] = None
    costo_envio: float
    total: float
    creado_en: datetime
    porcentaje_progreso: int
    pasos: List[TrackingPaso]
    prendas: List[PrendaEmpaqueItem] = []
