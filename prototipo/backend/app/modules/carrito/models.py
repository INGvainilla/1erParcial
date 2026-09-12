# -*- coding: utf-8 -*-
"""
Modelos de Persistencia: Carrito de Compras Omnicanal (CU13 - M11)
Entidades: Carrito y CarritoItem con soporte relacional y multicanal.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.modules.auth.models import Usuario
from app.modules.productos.models import Producto

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Carrito(Base):
    """
    Entidad Carrito:
    Almacena la sesión de compra activa del cliente.
    """
    __tablename__ = "carritos"

    id_carrito = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)
    estado = Column(String(30), nullable=False, default="ACTIVO")  # ACTIVO, ABANDONADO, PROCESADO
    creado_en = Column(DateTime, default=utc_now)
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relaciones
    usuario = relationship("Usuario")
    items = relationship("CarritoItem", back_populates="carrito", cascade="all, delete-orphan", lazy="joined")


class CarritoItem(Base):
    """
    Entidad CarritoItem:
    Detalle de prenda seleccionada con SKU específico (id_producto, talla, color),
    cantidad solicitada y congelamiento del precio unitario al momento de adición.
    """
    __tablename__ = "carrito_items"

    id_item = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_carrito = Column(Integer, ForeignKey("carritos.id_carrito", ondelete="CASCADE"), nullable=False, index=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="CASCADE"), nullable=False)
    talla = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    agregado_en = Column(DateTime, default=utc_now)

    # Relaciones
    carrito = relationship("Carrito", back_populates="items")
    producto = relationship("Producto", lazy="joined")
