# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Punto de Venta en Caja (CU15 - POS)
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class PosItemInput(BaseModel):
    id_producto: int
    sku: str
    nombre_producto: Optional[str] = None
    talla: str
    color: str
    cantidad: int = Field(default=1, ge=1)
    precio_unitario: float = Field(..., ge=0)

class PosVentaCreate(BaseModel):
    id_reserva_origen: Optional[int] = Field(None, description="ID de reserva si la venta proviene de una reserva")
    nit_cliente: str = Field(default="0", description="NIT o CI del cliente (0 para 'Sin NIT')")
    nombre_cliente: str = Field(default="Cliente Mostrador", description="Nombre o Razón Social para factura")
    metodo_pago: str = Field(..., description="'EFECTIVO', 'TARJETA_POS', 'QR_LOCAL'")
    monto_recibido: float = Field(..., ge=0, description="Monto entregado por el cliente si es efectivo")
    items: List[PosItemInput] = Field(..., min_length=1, description="Lista de prendas a cobrar")

class PosProductoLookupResponse(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_principal: Optional[str] = None
    tallas: List[str]
    colores: List[str]
    stock_disponible_sucursal: int

    model_config = ConfigDict(from_attributes=True)

class PosReservaLoadResponse(BaseModel):
    id_reserva: int
    qr_texto: Optional[str] = None
    nombre_cliente: str
    nit_cliente: Optional[str] = "0"
    estado: str
    detalles: List[PosItemInput]
    subtotal: float

class PosTicketDetalle(BaseModel):
    nombre_producto: str
    codigo_sku_base: str
    talla: str
    color: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class PosTicketResponse(BaseModel):
    id_orden: int
    numero_factura: str
    id_sucursal: int
    nombre_sucursal: str
    direccion_sucursal: str
    fecha_hora: datetime
    nit_cliente: str
    nombre_cliente: str
    metodo_pago: str
    subtotal: float
    total: float
    monto_recibido: float
    cambio_devolver: float
    cajero_nombre: str
    detalles: List[PosTicketDetalle]

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ESQUEMAS CU25: Gestionar Devolución y Cambio de Prendas
# ============================================================================

class TicketItemLookup(BaseModel):
    id_producto: int
    nombre_producto: str
    codigo_sku_base: str
    talla: str
    color: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    costo_historico_cpp: float
    imagen_principal: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TicketConsultaResponse(BaseModel):
    id_orden: int
    numero_factura: str
    fecha_emision: datetime
    nombre_cliente: str
    nit_cliente: str
    total: float
    dias_transcurridos: int
    es_valido_14_dias: bool
    mensaje_plazo: str
    items: List[TicketItemLookup]

    model_config = ConfigDict(from_attributes=True)


class DevolucionItemInput(BaseModel):
    id_producto: int
    talla: str
    color: str
    cantidad: int = Field(default=1, ge=1)
    estado_fisico: str = Field(default="APTO_VENTA", description="'APTO_VENTA' (reingresa a stock) o 'DEFECTUOSO_MERMA' (cuarentena)")


class CambioVarianteInput(BaseModel):
    nuevo_producto_id: int
    nueva_talla: str
    nuevo_color: str
    nueva_cantidad: int = Field(default=1, ge=1)


class DevolucionCreate(BaseModel):
    nro_ticket_original: str = Field(..., description="Número correlativo de la factura (ej: POS-2026-0042)")
    motivo: str = Field(..., description="Motivo: 'Cambio de talla', 'Tara de confección', 'Preferencia del cliente'")
    tipo_resolucion: str = Field(..., description="'CAMBIO_VARIANTE', 'VALE_CREDITO', 'REEMBOLSO_EFECTIVO', 'REEMBOLSO_STRIPE'")
    items: List[DevolucionItemInput] = Field(..., min_length=1, description="Prendas objeto de devolución")
    cambio_info: Optional[CambioVarianteInput] = Field(None, description="Datos de la nueva prenda si es cambio de variante")


class DevolucionTicketResponse(BaseModel):
    id_devolucion: int
    nro_devolucion: str
    nro_ticket_original: str
    fecha_hora: datetime
    sucursal_nombre: str
    cajero_nombre: str
    cliente_nombre: str
    motivo: str
    tipo_resolucion: str
    total_devuelto: float
    diferencia_cobrada: float
    codigo_vale: Optional[str] = None
    mensaje_kardex: str
    items_devueltos: List[dict]
    item_nuevo_entregado: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)
