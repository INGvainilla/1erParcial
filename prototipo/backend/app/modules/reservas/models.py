# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.modules.auth.models import Usuario
from app.modules.sucursales.models import Sucursal
from app.modules.productos.models import Producto

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Reserva(Base):
    __tablename__ = "reservas"

    id_reserva = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal", ondelete="CASCADE"), nullable=False)
    codigo_qr = Column(Text, unique=True, nullable=False)  # Base64 data URI de la imagen QR
    qr_texto = Column(String(200), unique=True, nullable=True)  # CU12: Texto legible del QR para escaneo
    fecha_visita = Column(DateTime, nullable=False)
    estado = Column(String(30), default="PENDIENTE")
    creado_en = Column(DateTime, default=utc_now)

    detalles = relationship("ReservaDetalle", back_populates="reserva", cascade="all, delete-orphan")
    usuario = relationship("Usuario")
    sucursal = relationship("Sucursal")


class ReservaDetalle(Base):
    __tablename__ = "reserva_detalles"

    id_reserva_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_reserva = Column(Integer, ForeignKey("reservas.id_reserva", ondelete="CASCADE"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="CASCADE"), nullable=False)
    talla = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)

    reserva = relationship("Reserva", back_populates="detalles")
    producto = relationship("Producto")
