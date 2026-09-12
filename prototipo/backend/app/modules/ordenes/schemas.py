# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Órdenes de Venta y Checkout (CU14)
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class OrdenCreateRequest(BaseModel):
    modalidad_entrega: str = Field(..., description="'DELIVERY' o 'RETIRO_TIENDA'")
    id_sucursal: Optional[int] = Field(None, description="Requerido si modalidad_entrega es 'RETIRO_TIENDA'")
    direccion_envio: Optional[str] = Field(None, description="Requerido si modalidad_entrega es 'DELIVERY'")
    telefono_contacto: Optional[str] = Field(None, description="Teléfono de referencia para despacho o contacto")
    nit_factura: str = Field(..., description="NIT o Carnet de Identidad para la factura fiscal")
    razon_social_factura: str = Field(..., description="Razón Social o Nombre completo para la factura")
    notas_entrega: Optional[str] = Field(None, description="Instrucciones adicionales para la entrega")

class OrdenDetalleResponse(BaseModel):
    id_detalle_orden: int
    id_producto: int
    nombre_producto: str
    codigo_sku_base: str
    imagen_principal: Optional[str] = None
    talla: str
    color: str
    cantidad: int
    precio_unitario: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)

class OrdenResponse(BaseModel):
    id_orden: int
    id_usuario: Optional[int] = None
    id_sucursal: Optional[int] = None
    nombre_sucursal: Optional[str] = None
    numero_factura: Optional[str] = None
    canal_venta: str
    modalidad_entrega: str
    direccion_envio: Optional[str] = None
    telefono_contacto: Optional[str] = None
    nit_factura: Optional[str] = None
    razon_social_factura: Optional[str] = None
    notas_entrega: Optional[str] = None
    subtotal: float
    costo_envio: float
    total: float
    estado_pago: str
    estado_logistica: str
    creado_en: datetime
    detalles: List[OrdenDetalleResponse]

    model_config = ConfigDict(from_attributes=True)
