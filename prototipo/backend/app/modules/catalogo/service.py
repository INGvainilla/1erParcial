# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Catálogo Omnicanal y Disponibilidad por Sucursal (CU10)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.modules.productos.models import Producto, ProductoColor, ProductoTalla
from app.modules.inventario.models import Inventario
from app.modules.sucursales.models import Sucursal
from app.modules.productos.schemas import ColorResponse, TallaResponse
from app.modules.catalogo.schemas import (
    PrendaCatalogoResponse, StockSucursalItem, DisponibilidadPrendaDetalle
)

class CatalogoControl:
    """
    Controlador de Consulta de Catálogo y Disponibilidad Omnicanal (CatalogoControl - CU10)
    Supervisa la búsqueda de prendas, filtrado multicriterio (talla, color, categoría, temporada)
    y la sincronización en tiempo real de existencias físicas por tienda física.
    """

    @staticmethod
    def consultar_prendas(
        db: Session,
        id_categoria: Optional[int] = None,
        id_marca: Optional[int] = None,
        id_temporada: Optional[int] = None,
        talla: Optional[str] = None,
        color: Optional[str] = None,
        precio_min: Optional[Decimal] = None,
        precio_max: Optional[Decimal] = None,
        id_sucursal: Optional[int] = None,
        busqueda: Optional[str] = None
    ) -> List[PrendaCatalogoResponse]:
        # =========================================================================
        # CASO DE USO: CU10 - Consultar Catálogo y Disponibilidad por Sucursal
        # Diagrama de Comunicación: Com_CU10_Consultar_Catalogo
        # =========================================================================
        # Paso 1: El Cliente o usuario selecciona criterios de filtro en ICatalogoBoundary:
        # (categoría, marca, temporada, talla, color, rango de precios, sucursal física de interés)

        # Paso 1.1: ICatalogoBoundary invoca consultarPrendas(criteriosFiltro) en CatalogoControl

        # Paso 1.2: CatalogoControl formula la consulta estructurada sobre ProductoEntity
        query = db.query(Producto).filter(Producto.estado == "PUBLICADO")

        if id_categoria:
            query = query.filter(Producto.id_categoria == id_categoria)
        if id_marca:
            query = query.filter(Producto.id_marca == id_marca)
        if id_temporada:
            query = query.filter(Producto.id_temporada == id_temporada)
        if precio_min:
            query = query.filter(Producto.precio_base >= precio_min)
        if precio_max:
            query = query.filter(Producto.precio_base <= precio_max)
        if busqueda:
            termino = f"%{busqueda.strip()}%"
            query = query.filter(
                (Producto.nombre.ilike(termino)) | (Producto.codigo_sku_base.ilike(termino))
            )

        # Filtro de talla a nivel relacional
        if talla:
            talla_norm = talla.strip().upper()
            query = query.join(Producto.tallas).filter(ProductoTalla.talla == talla_norm)

        # Filtro de color a nivel relacional
        if color:
            color_norm = f"%{color.strip()}%"
            query = query.join(Producto.colores).filter(ProductoColor.color_nombre.ilike(color_norm))

        # Paso 1.3: ProductoEntity ejecuta el filtro y retorna la colección de productos base
        productos = query.order_by(Producto.id_producto.desc()).all()

        # Paso 1.4: CatalogoControl consulta en tiempo real las existencias disponibles en InventarioEntity
        # cruzando con las sucursales operativas
        sucursales_activas = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").all()
        sucursal_map = {s.id_sucursal: s for s in sucursales_activas}

        catalogo_resultado = []

        for p in productos:
            # Calcular descuento estacional si la temporada está en liquidación
            descuento_pct = Decimal("0.00")
            if p.temporada and p.temporada.estado == "LIQUIDACION" and p.temporada.descuento_liquidacion > 0:
                descuento_pct = Decimal(str(p.temporada.descuento_liquidacion))

            precio_final = p.precio_base * (Decimal("1.00") - (descuento_pct / Decimal("100.00")))
            precio_final = precio_final.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Consultar existencias de inventario para este producto
            inv_query = db.query(Inventario).filter(Inventario.id_producto == p.id_producto)
            if id_sucursal:
                inv_query = inv_query.filter(Inventario.id_sucursal == id_sucursal)

            items_inv = inv_query.all()

            # Paso 1.5: InventarioEntity retorna existencias físicas por sucursal, talla y color
            stock_total = 0
            stock_por_sucursal_dict = {}

            for it in items_inv:
                if it.id_sucursal not in sucursal_map:
                    continue
                stock_total += it.stock_disponible
                if it.id_sucursal not in stock_por_sucursal_dict:
                    s_obj = sucursal_map[it.id_sucursal]
                    stock_por_sucursal_dict[it.id_sucursal] = {
                        "id_sucursal": s_obj.id_sucursal,
                        "nombre_sucursal": s_obj.nombre_sucursal,
                        "nombre_ciudad": s_obj.ciudad.nombre_ciudad if s_obj.ciudad else "Bolivia",
                        "direccion": s_obj.direccion,
                        "latitud": s_obj.latitud,
                        "longitud": s_obj.longitud,
                        "stock_disponible": 0,
                        "tallas": set(),
                        "colores": set()
                    }
                stock_por_sucursal_dict[it.id_sucursal]["stock_disponible"] += it.stock_disponible
                if it.stock_disponible > 0:
                    stock_por_sucursal_dict[it.id_sucursal]["tallas"].add(it.talla)
                    stock_por_sucursal_dict[it.id_sucursal]["colores"].add(it.color)

            # Si el cliente filtró por una sucursal específica y no hay stock en ella, se omite de los resultados
            if id_sucursal and (id_sucursal not in stock_por_sucursal_dict or stock_por_sucursal_dict[id_sucursal]["stock_disponible"] <= 0):
                continue

            # Mapear sucursales a DTO
            lista_sucursales_dto = []
            for s_id, s_data in stock_por_sucursal_dict.items():
                lista_sucursales_dto.append(StockSucursalItem(
                    id_sucursal=s_data["id_sucursal"],
                    nombre_sucursal=s_data["nombre_sucursal"],
                    nombre_ciudad=s_data["nombre_ciudad"],
                    direccion=s_data["direccion"],
                    latitud=s_data["latitud"],
                    longitud=s_data["longitud"],
                    stock_disponible=s_data["stock_disponible"],
                    tallas_disponibles=sorted(list(s_data["tallas"])),
                    colores_disponibles=sorted(list(s_data["colores"]))
                ))

            colores_resp = [ColorResponse(id_color=c.id_color, color_nombre=c.color_nombre, codigo_hex=c.codigo_hex) for c in p.colores]
            tallas_resp = [TallaResponse(id_talla=t.id_talla, talla=t.talla) for t in p.tallas]

            # Paso 1.6: CatalogoControl serializa y consolida la respuesta del catálogo con stock real
            catalogo_resultado.append(PrendaCatalogoResponse(
                id_producto=p.id_producto,
                codigo_sku_base=p.codigo_sku_base,
                nombre=p.nombre,
                descripcion=p.descripcion,
                precio_base=p.precio_base,
                descuento_aplicable_pct=descuento_pct,
                precio_final=precio_final,
                id_categoria=p.id_categoria,
                nombre_categoria=p.categoria.nombre_categoria if p.categoria else None,
                id_marca=p.id_marca,
                nombre_marca=p.marca.nombre_marca if p.marca else None,
                id_temporada=p.id_temporada,
                codigo_temporada=p.temporada.codigo_campana if p.temporada else None,
                imagen_principal=p.imagen_principal,
                modelo_3d_glb=p.modelo_3d_glb,
                colores=colores_resp,
                tallas=tallas_resp,
                stock_total_disponible=stock_total,
                disponibilidad_sucursales=lista_sucursales_dto
            ))

        # Paso 1.7: CatalogoControl entrega el catálogo enriquecido
        # Paso 1.8: ICatalogoBoundary renderiza el catálogo digital y badges de disponibilidad
        return catalogo_resultado

    @staticmethod
    def obtener_disponibilidad_sucursales(db: Session, id_producto: int) -> DisponibilidadPrendaDetalle:
        # Consulta dedicada de stock físico por sucursal para la ficha de producto
        producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
        if not producto:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")

        sucursales = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").all()
        resultado_sucursales = []

        for s in sucursales:
            items_inv = db.query(Inventario).filter(
                Inventario.id_producto == id_producto,
                Inventario.id_sucursal == s.id_sucursal
            ).all()

            stock_suc = sum(it.stock_disponible for it in items_inv)
            tallas_suc = set(it.talla for it in items_inv if it.stock_disponible > 0)
            colores_suc = set(it.color for it in items_inv if it.stock_disponible > 0)

            resultado_sucursales.append(StockSucursalItem(
                id_sucursal=s.id_sucursal,
                nombre_sucursal=s.nombre_sucursal,
                nombre_ciudad=s.ciudad.nombre_ciudad if s.ciudad else "Bolivia",
                direccion=s.direccion,
                latitud=s.latitud,
                longitud=s.longitud,
                stock_disponible=stock_suc,
                tallas_disponibles=sorted(list(tallas_suc)),
                colores_disponibles=sorted(list(colores_suc))
            ))

        return DisponibilidadPrendaDetalle(
            id_producto=producto.id_producto,
            codigo_sku_base=producto.codigo_sku_base,
            nombre=producto.nombre,
            sucursales=resultado_sucursales
        )
