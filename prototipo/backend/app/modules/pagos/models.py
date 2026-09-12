# -*- coding: utf-8 -*-
"""
Modelos de Persistencia: Transacciones de Pagos Electrónicos (CU16 - M14)
Coherencia con skillsCU16.MD
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.modules.ordenes.models import OrdenVenta

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class TransaccionPago(Base):
    """
    Entidad TransaccionPago (transacciones_pago):
    Registro inmutable de los cobros digitales confirmados a través de pasarelas externas (Stripe).
    Cumple con el estándar PCI: Cero almacenamiento de números de tarjeta o CVV.
    """
    __tablename__ = "transacciones_pago"

    id_transaccion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_orden = Column(Integer, ForeignKey("ordenes_venta.id_orden", ondelete="CASCADE"), nullable=False, index=True)
    pasarela = Column(String(50), nullable=False, default="STRIPE")
    payment_intent_id = Column(String(150), unique=True, index=True, nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    moneda = Column(String(10), nullable=False, default="BOB")
    estado = Column(String(30), nullable=False, default="SUCCEEDED")  # SUCCEEDED, FAILED, PENDING
    metodo_pago = Column(String(50), nullable=False, default="card")
    marca_tarjeta = Column(String(50), nullable=True)  # visa, mastercard, amex
    ultimos4 = Column(String(4), nullable=True)        # ej: "4242"
    detalles_raw = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=utc_now)

    # Relaciones
    orden = relationship("OrdenVenta")


class MetodoPagoConfig(Base):
    """
    Entidad MetodoPagoConfig (metodos_pago):
    Configuración global de canales y pasarelas de pago (CU17).
    Permite activar/desactivar y parametrizar credenciales de cobro en tiempo real.
    """
    __tablename__ = "metodos_pago"

    id_metodo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(30), nullable=False, default="OMNICANAL")  # FISICO, DIGITAL, OMNICANAL
    descripcion = Column(String(255), nullable=True)
    icono = Column(String(50), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    requiere_credenciales = Column(Boolean, nullable=False, default=False)
    credenciales_json = Column(Text, nullable=True)
    creado_en = Column(DateTime, default=utc_now)
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

