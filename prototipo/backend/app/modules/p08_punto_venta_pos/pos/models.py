# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Devoluciones y Cambios de Prendas (CU25 - M15)
Coherencia con Sección 2.3, 3.3 y DDL de Base de Datos de ciclo3.md.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Devolucion(Base):
    """
    Entidad Devolución (CU25):
    Comprobante oficial de cambio o devolución de mercadería con validación de plazo (<= 14 días).
    """
    __tablename__ = "devoluciones"

    id_devolucion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_id = Column(String(50), nullable=False, default="fashionstore_scz")
    id_orden = Column(Integer, ForeignKey("ordenes_venta.id_orden", ondelete="RESTRICT"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal", ondelete="RESTRICT"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="RESTRICT"), nullable=False)
    nro_ticket_original = Column(String(50), index=True, nullable=False)
    nro_devolucion = Column(String(50), unique=True, index=True, nullable=False)
    fecha_devolucion = Column(DateTime, default=utc_now, nullable=False)
    motivo = Column(String(150), nullable=False)
    tipo_resolucion = Column(String(30), nullable=False)  # 'CAMBIO_VARIANTE', 'VALE_CREDITO', 'REEMBOLSO_EFECTIVO', 'REEMBOLSO_STRIPE'
    total_devuelto = Column(Numeric(10, 2), nullable=False, default=0.00)
    diferencia_cobrada = Column(Numeric(10, 2), nullable=False, default=0.00)
    codigo_vale = Column(String(50), nullable=True)  # Código de nota de crédito si aplica
    estado = Column(String(20), nullable=False, default="COMPLETADA")  # COMPLETADA, ANULADA

    # Relaciones
    orden = relationship("OrdenVenta")
    sucursal = relationship("Sucursal")
    usuario = relationship("Usuario")
    detalles = relationship("DevolucionDetalle", back_populates="devolucion", cascade="all, delete-orphan")


class DevolucionDetalle(Base):
    """
    Entidad Detalle de Devolución e Inspección Física (CU25):
    Registra el estado físico de la prenda devuelta, su costo histórico CPP para reingreso al Kardex,
    y los datos de la nueva prenda si es cambio de variante.
    """
    __tablename__ = "devolucion_detalles"

    id_detalle_devolucion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_devolucion = Column(Integer, ForeignKey("devoluciones.id_devolucion", ondelete="CASCADE"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="RESTRICT"), nullable=False)
    talla = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    costo_historico_cpp = Column(Numeric(10, 2), nullable=False)  # CPP al momento de la venta para Kardex inmutable
    precio_unitario_original = Column(Numeric(10, 2), nullable=False)
    estado_fisico = Column(String(30), nullable=False, default="APTO_VENTA")  # 'APTO_VENTA', 'DEFECTUOSO_MERMA'
    nuevo_producto_cambio_id = Column(Integer, ForeignKey("productos.id_producto", ondelete="RESTRICT"), nullable=True)
    nueva_talla = Column(String(20), nullable=True)
    nuevo_color = Column(String(50), nullable=True)

    # Relaciones
    devolucion = relationship("Devolucion", back_populates="detalles")
    producto = relationship("Producto", foreign_keys=[id_producto])
    nuevo_producto = relationship("Producto", foreign_keys=[nuevo_producto_cambio_id])
