# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Inventario Multi-Sucursal y Costos Ponderados (CU09)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.inventario.models import Inventario, KardexMovimiento
from app.modules.sucursales.models import Sucursal
from app.modules.productos.models import Producto
from app.modules.inventario.schemas import (
    EntradaLoteCreate, KardexResponse, InventarioResponse
)

class InventarioControl:
    """
    Controlador de Gestión de Inventarios y Valuación por CPP (InventarioControl - CU09)
    Supervisa la recepción de mercadería física, control de existencias multi-sucursal,
    asientos inmutables de Kardex y recálculo matemático del Costo Promedio Ponderado.
    """

    @staticmethod
    def procesar_entrada_mercaderia(db: Session, request: EntradaLoteCreate) -> KardexResponse:
        # =========================================================================
        # CASO DE USO: CU09 - Gestionar Inventario Multi-Sucursal y Costos (CPP)
        # Diagrama de Comunicación: Com_CU09_Gestionar_Inventario
        # =========================================================================
        # Paso 1: El Personal de Logística registra la entrada de un lote en IInventarioBoundary:
        # (sucursal_id, producto_id, talla, color, cantidad_recibida, costo_unitario_compra, numero_factura)
        
        # Validar existencia de sucursal física
        sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == request.id_sucursal).first()
        if not sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sucursal con ID {request.id_sucursal} no existe."
            )

        # Validar existencia de producto
        producto = db.query(Producto).filter(Producto.id_producto == request.id_producto).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {request.id_producto} no existe en el catálogo."
            )

        cant_lote = request.cantidad_recibida
        if cant_lote <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad recibida en el lote debe ser mayor a cero unidades."
            )

        costo_lote = Decimal(str(request.costo_unitario_compra))
        if costo_lote <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El costo unitario de compra debe ser estrictamente mayor a cero."
            )

        talla_norm = request.talla.strip().upper()
        color_norm = request.color.strip()

        # Paso 1.1: IInventarioBoundary invoca procesarEntradaMercaderia(...) en InventarioControl

        # Paso 1.2: InventarioControl consulta existencias y CPP actual en InventarioEntity
        item_inv = db.query(Inventario).filter(
            Inventario.id_sucursal == request.id_sucursal,
            Inventario.id_producto == request.id_producto,
            Inventario.talla == talla_norm,
            Inventario.color == color_norm
        ).first()

        # Paso 1.3: InventarioEntity retorna (stock_ant, cpp_ant)
        if item_inv:
            stock_anterior = item_inv.stock_fisico
            cpp_anterior = Decimal(str(item_inv.costo_promedio_ponderado))

            # Paso 1.4: InventarioControl calcula el nuevo Costo Promedio Ponderado (CPP)
            # Fórmula formal matemática de Costo Promedio Ponderado:
            # CPP = [(Stock_ant * CPP_ant) + (Cant_lote * Costo_lote)] / (Stock_ant + Cant_lote)
            inversion_anterior = Decimal(str(stock_anterior)) * cpp_anterior
            inversion_nueva = Decimal(str(cant_lote)) * costo_lote
            nuevo_stock_total = stock_anterior + cant_lote
            
            nuevo_cpp_raw = (inversion_anterior + inversion_nueva) / Decimal(str(nuevo_stock_total))
            nuevo_cpp = nuevo_cpp_raw.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Paso 1.5: InventarioControl actualiza existencias y costos en InventarioEntity
            item_inv.stock_fisico = nuevo_stock_total
            item_inv.stock_disponible = nuevo_stock_total - item_inv.stock_reservado
            item_inv.ultimo_costo_compra = costo_lote
            item_inv.costo_promedio_ponderado = nuevo_cpp
        else:
            # Primer ingreso de la variante en la sucursal física
            nuevo_stock_total = cant_lote
            nuevo_cpp = costo_lote.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            item_inv = Inventario(
                id_sucursal=request.id_sucursal,
                id_producto=request.id_producto,
                talla=talla_norm,
                color=color_norm,
                stock_fisico=cant_lote,
                stock_reservado=0,
                stock_disponible=cant_lote,
                stock_minimo=5,
                ultimo_costo_compra=costo_lote,
                costo_promedio_ponderado=nuevo_cpp
            )
            db.add(item_inv)
            db.flush()

        # Paso 1.6: InventarioControl asienta el movimiento inmutable en KardexEntity
        referencia = f"Factura: {request.numero_factura.strip()}" if request.numero_factura else "Recepción Lote Proveedor"
        asiento = KardexMovimiento(
            id_inventario=item_inv.id_inventario,
            tipo_movimiento="ENTRADA_COMPRA",
            cantidad=cant_lote,
            costo_unitario_movimiento=costo_lote,
            saldo_cantidad_resultante=nuevo_stock_total,
            saldo_cpp_resultante=nuevo_cpp,
            referencia_documento=referencia
        )
        db.add(asiento)
        db.commit()
        db.refresh(asiento)

        # Paso 1.7: InventarioControl notifica inventario actualizado (nuevo stock, nuevo CPP)
        # Paso 1.8: IInventarioBoundary muestra comprobante de kardex con el nuevo CPP calculado
        return KardexResponse(
            id_movimiento=asiento.id_movimiento,
            id_inventario=asiento.id_inventario,
            tipo_movimiento=asiento.tipo_movimiento,
            cantidad=asiento.cantidad,
            costo_unitario_movimiento=asiento.costo_unitario_movimiento,
            saldo_cantidad_resultante=asiento.saldo_cantidad_resultante,
            saldo_cpp_resultante=asiento.saldo_cpp_resultante,
            referencia_documento=asiento.referencia_documento,
            fecha_hora=asiento.fecha_hora
        )

    @staticmethod
    def consultar_stock(
        db: Session,
        id_sucursal: Optional[int] = None,
        id_producto: Optional[int] = None
    ) -> List[InventarioResponse]:
        query = db.query(Inventario)
        if id_sucursal:
            query = query.filter(Inventario.id_sucursal == id_sucursal)
        if id_producto:
            query = query.filter(Inventario.id_producto == id_producto)

        items = query.all()
        resultado = []
        for it in items:
            resultado.append(InventarioResponse(
                id_inventario=it.id_inventario,
                id_sucursal=it.id_sucursal,
                nombre_sucursal=it.sucursal.nombre_sucursal if it.sucursal else None,
                id_producto=it.id_producto,
                codigo_sku_base=it.producto.codigo_sku_base if it.producto else None,
                nombre_producto=it.producto.nombre if it.producto else None,
                talla=it.talla,
                color=it.color,
                stock_fisico=it.stock_fisico,
                stock_reservado=it.stock_reservado,
                stock_disponible=it.stock_disponible,
                stock_minimo=it.stock_minimo,
                ultimo_costo_compra=it.ultimo_costo_compra,
                costo_promedio_ponderado=it.costo_promedio_ponderado,
                actualizado_en=it.actualizado_en
            ))
        return resultado

    @staticmethod
    def consultar_kardex(
        db: Session,
        id_inventario: Optional[int] = None,
        id_sucursal: Optional[int] = None,
        id_producto: Optional[int] = None
    ) -> List[KardexResponse]:
        query = db.query(KardexMovimiento)
        if id_inventario:
            query = query.filter(KardexMovimiento.id_inventario == id_inventario)
        elif id_sucursal or id_producto:
            query = query.join(Inventario)
            if id_sucursal:
                query = query.filter(Inventario.id_sucursal == id_sucursal)
            if id_producto:
                query = query.filter(Inventario.id_producto == id_producto)

        movimientos = query.order_by(KardexMovimiento.id_movimiento.desc()).all()
        return [KardexResponse.from_orm(m) for m in movimientos]
