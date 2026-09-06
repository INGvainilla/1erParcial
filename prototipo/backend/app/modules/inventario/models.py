# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Inventario Multi-Sucursal y Costos Ponderados (M06 - CU09)
Coherencia estricta con Sección 2.3 (InventarioEntity, KardexEntity), B4.txt y Sección 3.3.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Inventario(Base):
    """
    Entidad Inventario (InventarioEntity):
    Manejo de stock físico, disponible, último costo y recálculo de CPP (CU09).
    """
    __tablename__ = "inventario"

    id_inventario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal", ondelete="CASCADE"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="CASCADE"), nullable=False)
    talla = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    stock_fisico = Column(Integer, nullable=False, default=0)
    stock_reservado = Column(Integer, nullable=False, default=0)
    stock_disponible = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=5)
    ultimo_costo_compra = Column(Numeric(10, 2), nullable=False, default=0.00)
    costo_promedio_ponderado = Column(Numeric(10, 2), nullable=False, default=0.00)
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)


    sucursal = relationship("Sucursal", back_populates="inventarios")
    producto = relationship("Producto", back_populates="inventarios")
    movimientos_kardex = relationship("KardexMovimiento", back_populates="inventario", cascade="all, delete-orphan")


class KardexMovimiento(Base):
    """
    Entidad Kardex (KardexEntity):
    Asiento inmutable de movimientos de entrada y salida con saldos físicos y valorados (CU09).
    """
    __tablename__ = "kardex_movimientos"

    id_movimiento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_inventario = Column(Integer, ForeignKey("inventario.id_inventario", ondelete="CASCADE"), nullable=False)
    tipo_movimiento = Column(String(30), nullable=False)  # ENTRADA_COMPRA, SALIDA_VENTA, RESERVA_APARTADA
    cantidad = Column(Integer, nullable=False)
    costo_unitario_movimiento = Column(Numeric(10, 2), nullable=False)
    saldo_cantidad_resultante = Column(Integer, nullable=False)
    saldo_cpp_resultante = Column(Numeric(10, 2), nullable=False)
    referencia_documento = Column(String(100), nullable=True)  # Ej. "Factura F-9021"
    fecha_hora = Column(DateTime, default=utc_now)

    inventario = relationship("Inventario", back_populates="movimientos_kardex")

