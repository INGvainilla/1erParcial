# -*- coding: utf-8 -*-
"""
Modelos de Persistencia: Órdenes de Venta y Checkout (CU14 - M12)
Coherencia con Sección 3.3 de ciclo2.md y skillsCU14.MD
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.modules.auth.models import Usuario
from app.modules.sucursales.models import Sucursal
from app.modules.productos.models import Producto

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class OrdenVenta(Base):
    """
    Entidad OrdenVenta (ordenes_venta):
    Cabecera de la transacción de venta omnicanal (WEB, APP, POS).
    """
    __tablename__ = "ordenes_venta"

    id_orden = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True, index=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal", ondelete="SET NULL"), nullable=True)
    numero_factura = Column(String(50), unique=True, nullable=True)
    canal_venta = Column(String(20), nullable=False, default="WEB")  # WEB, APP, POS
    modalidad_entrega = Column(String(20), nullable=False)  # DELIVERY, RETIRO_TIENDA, COMPRA_FISICA
    
    # Datos de Entrega y Facturación (CU14)
    direccion_envio = Column(String(255), nullable=True)
    telefono_contacto = Column(String(30), nullable=True)
    nit_factura = Column(String(30), nullable=True)
    razon_social_factura = Column(String(150), nullable=True)
    notas_entrega = Column(Text, nullable=True)

    # Importes Financieros
    subtotal = Column(Numeric(10, 2), nullable=False)
    costo_envio = Column(Numeric(10, 2), nullable=False, default=0.00)
    total = Column(Numeric(10, 2), nullable=False)

    # Estados
    estado_pago = Column(String(20), nullable=False, default="PENDIENTE")  # PENDIENTE, PAGADO, RECHAZADO
    estado_logistica = Column(String(30), nullable=False, default="CREADA")  # CREADA, PREPARACION, LISTO_DESPACHO, EN_TRANSITO, ENTREGADA
    creado_en = Column(DateTime, default=utc_now)

    # CU18: Despacho y Logística de Delivery
    id_repartidor = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    nombre_repartidor = Column(String(100), nullable=True)
    telefono_repartidor = Column(String(30), nullable=True)
    latitud_destino = Column(Numeric(10, 8), nullable=True)
    longitud_destino = Column(Numeric(11, 8), nullable=True)
    distancia_km = Column(Numeric(6, 2), nullable=True)

    # Relaciones
    usuario = relationship("Usuario", foreign_keys=[id_usuario])
    repartidor = relationship("Usuario", foreign_keys=[id_repartidor])
    sucursal = relationship("Sucursal")
    detalles = relationship("OrdenDetalle", back_populates="orden", cascade="all, delete-orphan", lazy="joined")


class OrdenDetalle(Base):
    """
    Entidad OrdenDetalle (ordenes_detalle):
    Líneas de prendas adquiridas en la orden de venta.
    """
    __tablename__ = "ordenes_detalle"

    id_detalle_orden = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_orden = Column(Integer, ForeignKey("ordenes_venta.id_orden", ondelete="CASCADE"), nullable=False, index=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="RESTRICT"), nullable=False)
    talla = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    # Relaciones
    orden = relationship("OrdenVenta", back_populates="detalles")
    producto = relationship("Producto", lazy="joined")
