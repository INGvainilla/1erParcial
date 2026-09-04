# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Catálogo de Productos y Atributos de Moda (CU06)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.productos.models import Categoria, Marca, Producto, ProductoColor, ProductoTalla
from app.modules.temporadas.models import Temporada
from app.modules.productos.schemas import (
    CategoriaCreate, CategoriaResponse, MarcaCreate, MarcaResponse,
    ProductoCreate, ProductoUpdate, ProductoResponse, ColorResponse, TallaResponse
)

class ProductoControl:
    """
    Controlador de Gestión de Productos y Atributos de Moda (ProductoControl - CU06)
    Supervisa el catálogo, unicidad de SKU base, variantes cromáticas HEX y tallas.
    """

    # --- CATEGORÍAS ---
    @staticmethod
    def listar_categorias(db: Session) -> List[CategoriaResponse]:
        cats = db.query(Categoria).order_by(Categoria.nombre_categoria.asc()).all()
        return [CategoriaResponse.from_orm(c) for c in cats]

    @staticmethod
    def crear_categoria(db: Session, request: CategoriaCreate) -> CategoriaResponse:
        nombre = request.nombre_categoria.strip()
        existente = db.query(Categoria).filter(Categoria.nombre_categoria.ilike(nombre)).first()
        if existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Categoría '{nombre}' ya existe.")
        nueva = Categoria(nombre_categoria=nombre, descripcion=request.descripcion)
        db.add(nueva)
        db.commit()
        db.refresh(nueva)
        return CategoriaResponse.from_orm(nueva)

    # --- MARCAS ---
    @staticmethod
    def listar_marcas(db: Session) -> List[MarcaResponse]:
        marcas = db.query(Marca).order_by(Marca.nombre_marca.asc()).all()
        return [MarcaResponse.from_orm(m) for m in marcas]

    @staticmethod
    def crear_marca(db: Session, request: MarcaCreate) -> MarcaResponse:
        nombre = request.nombre_marca.strip()
        existente = db.query(Marca).filter(Marca.nombre_marca.ilike(nombre)).first()
        if existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Marca '{nombre}' ya existe.")
        nueva = Marca(nombre_marca=nombre)
        db.add(nueva)
        db.commit()
        db.refresh(nueva)
        return MarcaResponse.from_orm(nueva)

    # --- PRODUCTOS (CU06) ---
    @staticmethod
    def listar_productos(
        db: Session,
        id_categoria: Optional[int] = None,
        id_marca: Optional[int] = None,
        id_temporada: Optional[int] = None,
        estado: Optional[str] = None
    ) -> List[ProductoResponse]:
        query = db.query(Producto)
        if id_categoria:
            query = query.filter(Producto.id_categoria == id_categoria)
        if id_marca:
            query = query.filter(Producto.id_marca == id_marca)
        if id_temporada:
            query = query.filter(Producto.id_temporada == id_temporada)
        if estado:
            query = query.filter(Producto.estado == estado.upper())

        productos = query.order_by(Producto.id_producto.desc()).all()
        resultado = []
        for p in productos:
            colores_resp = [ColorResponse(id_color=c.id_color, color_nombre=c.color_nombre, codigo_hex=c.codigo_hex) for c in p.colores]
            tallas_resp = [TallaResponse(id_talla=t.id_talla, talla=t.talla) for t in p.tallas]
            resultado.append(ProductoResponse(
                id_producto=p.id_producto,
                codigo_sku_base=p.codigo_sku_base,
                nombre=p.nombre,
                descripcion=p.descripcion,
                precio_base=p.precio_base,
                id_categoria=p.id_categoria,
                nombre_categoria=p.categoria.nombre_categoria if p.categoria else None,
                id_marca=p.id_marca,
                nombre_marca=p.marca.nombre_marca if p.marca else None,
                id_temporada=p.id_temporada,
                codigo_temporada=p.temporada.codigo_campana if p.temporada else None,
                id_proveedor=p.id_proveedor,
                imagen_principal=p.imagen_principal,
                modelo_3d_glb=p.modelo_3d_glb,
                estado=p.estado,
                colores=colores_resp,
                tallas=tallas_resp
            ))
        return resultado

    @staticmethod
    def obtener_producto(db: Session, id_producto: int) -> ProductoResponse:
        p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {id_producto} no encontrado.")
        colores_resp = [ColorResponse(id_color=c.id_color, color_nombre=c.color_nombre, codigo_hex=c.codigo_hex) for c in p.colores]
        tallas_resp = [TallaResponse(id_talla=t.id_talla, talla=t.talla) for t in p.tallas]
        return ProductoResponse(
            id_producto=p.id_producto,
            codigo_sku_base=p.codigo_sku_base,
            nombre=p.nombre,
            descripcion=p.descripcion,
            precio_base=p.precio_base,
            id_categoria=p.id_categoria,
            nombre_categoria=p.categoria.nombre_categoria if p.categoria else None,
            id_marca=p.id_marca,
            nombre_marca=p.marca.nombre_marca if p.marca else None,
            id_temporada=p.id_temporada,
            codigo_temporada=p.temporada.codigo_campana if p.temporada else None,
            id_proveedor=p.id_proveedor,
            imagen_principal=p.imagen_principal,
            modelo_3d_glb=p.modelo_3d_glb,
            estado=p.estado,
            colores=colores_resp,
            tallas=tallas_resp
        )

    @staticmethod
    def guardar_producto(db: Session, request: ProductoCreate) -> ProductoResponse:
        # =========================================================================
        # CASO DE USO: CU06 - Gestionar Productos y Atributos de Moda (Alta de Prenda)
        # Diagrama de Comunicación: Com_CU06_Gestionar_Productos
        # =========================================================================
        # Paso 1: El Administrador envía la ficha técnica (SKU, nombre, tallas[], colores[], modelo 3D) en IProductoBoundary
        sku_base = request.codigo_sku_base.strip().upper()

        # Paso 1.1: IProductoBoundary invoca guardarProducto(datosProducto) en ProductoControl

        # Paso 1.2: ProductoControl valida unicidad de codigo_sku_base en ProductoEntity
        sku_existente = db.query(Producto).filter(Producto.codigo_sku_base == sku_base).first()
        if sku_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El SKU base '{sku_base}' ya se encuentra registrado en el catálogo."
            )

        # Validar existencia de categoría y marca
        cat = db.query(Categoria).filter(Categoria.id_categoria == request.id_categoria).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
        mrc = db.query(Marca).filter(Marca.id_marca == request.id_marca).first()
        if not mrc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca no encontrada.")

        # Paso 1.3: ProductoControl crea el registro base en ProductoEntity
        nuevo_producto = Producto(
            id_categoria=request.id_categoria,
            id_marca=request.id_marca,
            id_temporada=request.id_temporada,
            id_proveedor=request.id_proveedor,
            codigo_sku_base=sku_base,
            nombre=request.nombre.strip(),
            descripcion=request.descripcion.strip() if request.descripcion else None,
            precio_base=Decimal(str(request.precio_base)),
            imagen_principal=request.imagen_principal,
            modelo_3d_glb=request.modelo_3d_glb,
            estado="PUBLICADO"
        )
        db.add(nuevo_producto)
        db.flush()

        # Paso 1.4: ProductoEntity retorna producto_id generado
        producto_id = nuevo_producto.id_producto

        # Paso 1.5: ProductoControl asocia variantes de colores en ColorEntity
        colores_creados = []
        for c in request.colores:
            color_obj = ProductoColor(
                id_producto=producto_id,
                color_nombre=c.color_nombre.strip(),
                codigo_hex=c.codigo_hex.strip().upper()
            )
            db.add(color_obj)
            colores_creados.append(color_obj)

        # Paso 1.6: ProductoControl asocia variantes de tallas en TallaEntity
        tallas_creadas = []
        tallas_set = set()
        for t in request.tallas:
            talla_norm = t.strip().upper()
            if talla_norm not in tallas_set:
                talla_obj = ProductoTalla(
                    id_producto=producto_id,
                    talla=talla_norm
                )
                db.add(talla_obj)
                tallas_creadas.append(talla_obj)
                tallas_set.add(talla_norm)

        db.commit()
        db.refresh(nuevo_producto)

        # Paso 1.7: ProductoControl notifica producto guardado con sus variantes
        # Paso 1.8: IProductoBoundary renderiza la ficha confirmada con variantes y visualizador 3D
        colores_resp = [ColorResponse(id_color=c.id_color, color_nombre=c.color_nombre, codigo_hex=c.codigo_hex) for c in colores_creados]
        tallas_resp = [TallaResponse(id_talla=t.id_talla, talla=t.talla) for t in tallas_creadas]
        
        return ProductoResponse(
            id_producto=nuevo_producto.id_producto,
            codigo_sku_base=nuevo_producto.codigo_sku_base,
            nombre=nuevo_producto.nombre,
            descripcion=nuevo_producto.descripcion,
            precio_base=nuevo_producto.precio_base,
            id_categoria=nuevo_producto.id_categoria,
            nombre_categoria=cat.nombre_categoria,
            id_marca=nuevo_producto.id_marca,
            nombre_marca=mrc.nombre_marca,
            id_temporada=nuevo_producto.id_temporada,
            codigo_temporada=nuevo_producto.temporada.codigo_campana if nuevo_producto.temporada else None,
            id_proveedor=nuevo_producto.id_proveedor,
            imagen_principal=nuevo_producto.imagen_principal,
            modelo_3d_glb=nuevo_producto.modelo_3d_glb,
            estado=nuevo_producto.estado,
            colores=colores_resp,
            tallas=tallas_resp
        )

    @staticmethod
    def modificar_producto(db: Session, id_producto: int, request: ProductoUpdate) -> ProductoResponse:
        # Paso 1: Edición de campos de producto
        p = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto {id_producto} no encontrado.")

        if request.nombre:
            p.nombre = request.nombre.strip()
        if request.descripcion is not None:
            p.descripcion = request.descripcion.strip() if request.descripcion else None
        if request.precio_base is not None:
            p.precio_base = Decimal(str(request.precio_base))
        if request.id_categoria:
            p.id_categoria = request.id_categoria
        if request.id_marca:
            p.id_marca = request.id_marca
        if request.id_temporada is not None:
            p.id_temporada = request.id_temporada if request.id_temporada > 0 else None
        if request.id_proveedor is not None:
            p.id_proveedor = request.id_proveedor if request.id_proveedor > 0 else None
        if request.imagen_principal:
            p.imagen_principal = request.imagen_principal
        if request.modelo_3d_glb:
            p.modelo_3d_glb = request.modelo_3d_glb
        if request.estado:
            p.estado = request.estado.upper()

        # Si se envían nuevos colores, reemplazar
        if request.colores is not None:
            db.query(ProductoColor).filter(ProductoColor.id_producto == id_producto).delete()
            for c in request.colores:
                db.add(ProductoColor(id_producto=id_producto, color_nombre=c.color_nombre.strip(), codigo_hex=c.codigo_hex.strip().upper()))

        # Si se envían nuevas tallas, reemplazar
        if request.tallas is not None:
            db.query(ProductoTalla).filter(ProductoTalla.id_producto == id_producto).delete()
            tallas_set = set()
            for t in request.tallas:
                talla_norm = t.strip().upper()
                if talla_norm not in tallas_set:
                    db.add(ProductoTalla(id_producto=id_producto, talla=talla_norm))
                    tallas_set.add(talla_norm)

        db.commit()
        db.refresh(p)
        return ProductoControl.obtener_producto(db, id_producto)
