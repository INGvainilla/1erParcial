# -*- coding: utf-8 -*-
"""
Enrutador de API: Catálogo de Productos y Atributos de Moda (M03 - CU06)
Comentado paso a paso conforme al caso de uso CU06.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.productos.schemas import (
    CategoriaCreate, CategoriaResponse, MarcaCreate, MarcaResponse,
    ProductoCreate, ProductoUpdate, ProductoResponse
)
from app.modules.productos.service import ProductoControl

router = APIRouter(prefix="/productos", tags=["Gestión de Productos (CU06)"])

# --- CATEGORIAS ---
@router.get("/categorias", response_model=List[CategoriaResponse])
def listar_categorias_endpoint(db: Session = Depends(get_db)):
    return ProductoControl.listar_categorias(db)

@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def crear_categoria_endpoint(
    request: CategoriaCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    return ProductoControl.crear_categoria(db, request)

# --- MARCAS ---
@router.get("/marcas", response_model=List[MarcaResponse])
def listar_marcas_endpoint(db: Session = Depends(get_db)):
    return ProductoControl.listar_marcas(db)

@router.post("/marcas", response_model=MarcaResponse, status_code=status.HTTP_201_CREATED)
def crear_marca_endpoint(
    request: MarcaCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    return ProductoControl.crear_marca(db, request)

# --- PRODUCTOS (CU06) ---
@router.get("", response_model=List[ProductoResponse])
def listar_productos_endpoint(
    id_categoria: Optional[int] = Query(None, description="Filtrar por categoría"),
    id_marca: Optional[int] = Query(None, description="Filtrar por marca"),
    id_temporada: Optional[int] = Query(None, description="Filtrar por temporada"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU06 - Consulta de Catálogo
    # Paso 1: Usuario u Operador consulta prendas disponibles
    # Paso 1.1: Invocación a ProductoControl.listar_productos()
    return ProductoControl.listar_productos(
        db, id_categoria=id_categoria, id_marca=id_marca, id_temporada=id_temporada, estado=estado
    )

@router.get("/{id_producto}", response_model=ProductoResponse)
def obtener_producto_endpoint(id_producto: int, db: Session = Depends(get_db)):
    # Paso 1: Detalle de ficha técnica de producto
    return ProductoControl.obtener_producto(db, id_producto=id_producto)

@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def guardar_producto_endpoint(
    request: ProductoCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU06 - Alta de Producto y Atributos
    # Paso 1: Administrador envía ficha técnica con tallas y colores HEX
    # Paso 1.1: Invocación a ProductoControl.guardar_producto()
    return ProductoControl.guardar_producto(db, request)

@router.put("/{id_producto}", response_model=ProductoResponse)
def modificar_producto_endpoint(
    id_producto: int,
    request: ProductoUpdate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU06 - Modificación de Producto
    # Paso 1: Administrador actualiza datos de la prenda
    # Paso 1.1: Invocación a ProductoControl.modificar_producto()
    return ProductoControl.modificar_producto(db, id_producto=id_producto, request=request)
