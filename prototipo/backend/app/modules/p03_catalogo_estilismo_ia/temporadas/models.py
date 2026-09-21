# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Temporadas y Colecciones (M04 - CU07)
Coherencia con Sección 2.3 (TemporadaEntity) y Sección 3.3.
"""
from sqlalchemy import Column, Integer, String, Date, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

class Temporada(Base):
    """
    Entidad Temporada (TemporadaEntity):
    Calendarización estacional (SS/FW) y control de liquidaciones (CU07).
    """
    __tablename__ = "temporadas"

    id_temporada = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_campana = Column(String(30), unique=True, index=True, nullable=False)
    nombre_temporada = Column(String(100), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    descuento_liquidacion = Column(Numeric(5, 2), nullable=False, default=0.00)
    estado = Column(String(20), nullable=False, default="VIGENTE")  # VIGENTE, LIQUIDACION, FINALIZADA

    productos = relationship("Producto", back_populates="temporada")
