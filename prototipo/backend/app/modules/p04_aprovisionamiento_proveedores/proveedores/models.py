# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Proveedores Textiles (M05 - CU08)
Coherencia con Sección 2.3 (ProveedorEntity) y Sección 3.3.
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Proveedor(Base):
    """
    Entidad Proveedor (ProveedorEntity):
    Directorio de abastecimiento con control de NIT tributario único (CU08).
    """
    __tablename__ = "proveedores"

    id_proveedor = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nit_identificacion = Column(String(30), unique=True, index=True, nullable=False)
    razon_social = Column(String(150), nullable=False)
    contacto_nombre = Column(String(100), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    terminos_pago = Column(String(50), nullable=False, default="CONTADO")  # CONTADO, CREDITO_30_DIAS, CREDITO_60_DIAS
    estado = Column(String(20), nullable=False, default="ACTIVO")

    productos = relationship("Producto", back_populates="proveedor")
