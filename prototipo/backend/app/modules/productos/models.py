# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Catálogo de Productos y Atributos de Moda (M03 - CU06, CU10)
Coherencia con Sección 2.3 (ProductoEntity, CategoriaEntity, ColorEntity, TallaEntity) y Sección 3.3.
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Categoria(Base):
    """Entidad Categoría (CategoriaEntity)"""
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_categoria = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(200), nullable=True)

    productos = relationship("Producto", back_populates="categoria")


class Marca(Base):
    """Entidad Marca Comercial"""
    __tablename__ = "marcas"

    id_marca = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_marca = Column(String(50), unique=True, nullable=False)

    productos = relationship("Producto", back_populates="marca")


class Producto(Base):
    """
    Entidad Producto (ProductoEntity):
    Ficha técnica de la prenda de vestir masculina con SKU base único y soporte 3D para RA (CU06).
    """
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria", ondelete="RESTRICT"), nullable=False)
    id_marca = Column(Integer, ForeignKey("marcas.id_marca", ondelete="RESTRICT"), nullable=False)
    id_temporada = Column(Integer, ForeignKey("temporadas.id_temporada", ondelete="SET NULL"), nullable=True)
    id_proveedor = Column(Integer, ForeignKey("proveedores.id_proveedor", ondelete="SET NULL"), nullable=True)
    codigo_sku_base = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_base = Column(Numeric(10, 2), nullable=False)
    imagen_principal = Column(String(255), nullable=True)
    modelo_3d_glb = Column(String(255), nullable=True)
    estado = Column(String(30), nullable=False, default="PUBLICADO")  # BORRADOR, PUBLICADO, DESCATALOGADO

    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    marca = relationship("Marca", back_populates="productos")
    temporada = relationship("Temporada", back_populates="productos")
    proveedor = relationship("Proveedor", back_populates="productos")
    colores = relationship("ProductoColor", back_populates="producto", cascade="all, delete-orphan")
    tallas = relationship("ProductoTalla", back_populates="producto", cascade="all, delete-orphan")
    inventarios = relationship("Inventario", back_populates="producto", cascade="all, delete-orphan")


class ProductoColor(Base):
    """
    Entidad Color (ColorEntity):
    Manejo normalizado de paleta de colores multivaluados con código HEX (CU06).
    """
    __tablename__ = "producto_colores"

    id_color = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="CASCADE"), nullable=False)
    color_nombre = Column(String(50), nullable=False)
    codigo_hex = Column(String(10), nullable=False)  # Ej. #000080

    producto = relationship("Producto", back_populates="colores")


class ProductoTalla(Base):
    """
    Entidad Talla (TallaEntity):
    Manejo normalizado de tallas disponibles (CU06).
    """
    __tablename__ = "producto_tallas"

    id_talla = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto", ondelete="CASCADE"), nullable=False)
    talla = Column(String(20), nullable=False)  # S, M, L, XL, 38, 40, 42

    producto = relationship("Producto", back_populates="tallas")
