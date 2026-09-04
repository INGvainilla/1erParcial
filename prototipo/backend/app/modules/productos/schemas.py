# -*- coding: utf-8 -*-
"""
Esquemas Pydantic para Catálogo de Productos y Atributos de Moda (M03 - CU06)
Coherencia con ProductoEntity, CategoriaEntity, ColorEntity y TallaEntity.
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

# --- CATEGORIAS ---
class CategoriaCreate(BaseModel):
    nombre_categoria: str = Field(..., min_length=2, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=200)

class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre_categoria: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

# --- MARCAS ---
class MarcaCreate(BaseModel):
    nombre_marca: str = Field(..., min_length=2, max_length=50)

class MarcaResponse(BaseModel):
    id_marca: int
    nombre_marca: str

    class Config:
        from_attributes = True

# --- COLORES Y TALLAS ---
class ColorItem(BaseModel):
    color_nombre: str = Field(..., min_length=2, max_length=50, description="Ej. Azul Marino")
    codigo_hex: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$", description="Código Hexadecimal, ej. #000080")

class ColorResponse(BaseModel):
    id_color: int
    color_nombre: str
    codigo_hex: str

    class Config:
        from_attributes = True

class TallaResponse(BaseModel):
    id_talla: int
    talla: str

    class Config:
        from_attributes = True

# --- PRODUCTOS ---
class ProductoCreate(BaseModel):
    codigo_sku_base: str = Field(..., min_length=3, max_length=50, description="Código SKU base único")
    nombre: str = Field(..., min_length=3, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Decimal = Field(..., gt=0, description="Precio de venta en Bs.")
    id_categoria: int
    id_marca: int
    id_temporada: Optional[int] = None
    id_proveedor: Optional[int] = None
    imagen_principal: Optional[str] = Field(None, description="URL de fotografía en alta resolución")
    modelo_3d_glb: Optional[str] = Field(None, description="Enlace a archivo .glb para Realidad Aumentada")
    colores: List[ColorItem] = Field(..., min_items=1, description="Lista de colores con código HEX")
    tallas: List[str] = Field(..., min_items=1, description="Lista de tallas, ej. ['S', 'M', 'L', 'XL']")

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Optional[Decimal] = Field(None, gt=0)
    id_categoria: Optional[int] = None
    id_marca: Optional[int] = None
    id_temporada: Optional[int] = None
    id_proveedor: Optional[int] = None
    imagen_principal: Optional[str] = None
    modelo_3d_glb: Optional[str] = None
    estado: Optional[str] = Field(None, description="BORRADOR, PUBLICADO, DESCATALOGADO")
    colores: Optional[List[ColorItem]] = None
    tallas: Optional[List[str]] = None

class ProductoResponse(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    id_categoria: int
    nombre_categoria: Optional[str] = None
    id_marca: int
    nombre_marca: Optional[str] = None
    id_temporada: Optional[int] = None
    codigo_temporada: Optional[str] = None
    id_proveedor: Optional[int] = None
    imagen_principal: Optional[str] = None
    modelo_3d_glb: Optional[str] = None
    estado: str
    colores: List[ColorResponse] = []
    tallas: List[TallaResponse] = []

    class Config:
        from_attributes = True
