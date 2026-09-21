# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Ciudades y Sucursales (M02 - CU05)
Coherencia con Sección 2.3 (CiudadEntity, SucursalEntity) y Sección 3.3.
"""
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ciudad(Base):
    """Entidad Ciudad (CiudadEntity)"""
    __tablename__ = "ciudades"

    id_ciudad = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_ciudad = Column(String(50), nullable=False)
    departamento = Column(String(50), nullable=False)

    sucursales = relationship("Sucursal", back_populates="ciudad", cascade="all, delete-orphan")


class Sucursal(Base):
    """
    Entidad Sucursal (SucursalEntity):
    Representa las tiendas físicas con geolocalización GPS y capacidad de probadores (CU05).
    """
    __tablename__ = "sucursales"

    id_sucursal = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_ciudad = Column(Integer, ForeignKey("ciudades.id_ciudad", ondelete="CASCADE"), nullable=False)
    nombre_sucursal = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    latitud = Column(Numeric(10, 8), nullable=False)
    longitud = Column(Numeric(11, 8), nullable=False)
    telefono = Column(String(20), nullable=True)
    capacidad_probadores = Column(Integer, nullable=False, default=4)
    horario_apertura = Column(String(10), nullable=False, default="09:00")
    horario_cierre = Column(String(10), nullable=False, default="21:00")
    estado = Column(String(30), nullable=False, default="OPERATIVA")  # OPERATIVA, MANTENIMIENTO, CERRADA

    ciudad = relationship("Ciudad", back_populates="sucursales")
    usuarios = relationship("Usuario", back_populates="sucursal")
    inventarios = relationship("Inventario", back_populates="sucursal", cascade="all, delete-orphan")
