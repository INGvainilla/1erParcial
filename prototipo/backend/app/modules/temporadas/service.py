# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Gestión de Temporadas y Colecciones (CU07)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.temporadas.models import Temporada
from app.modules.productos.models import Producto
from app.modules.temporadas.schemas import (
    TemporadaCreate, TemporadaUpdate, TemporadaResponse, ActivarLiquidacionRequest
)

class TemporadaControl:
    """
    Controlador de Gestión de Temporadas y Colecciones (TemporadaControl - CU07)
    Administra los ciclos de moda masculina (SS/FW) y los descuentos por liquidación estacional.
    """

    @staticmethod
    def listar_temporadas(db: Session, estado: Optional[str] = None) -> List[TemporadaResponse]:
        query = db.query(Temporada)
        if estado:
            query = query.filter(Temporada.estado == estado.upper())
        temporadas = query.order_by(Temporada.fecha_inicio.desc()).all()
        resultado = []
        for t in temporadas:
            cant_prod = len(t.productos)
            resultado.append(TemporadaResponse(
                id_temporada=t.id_temporada,
                codigo_campana=t.codigo_campana,
                nombre_temporada=t.nombre_temporada,
                fecha_inicio=t.fecha_inicio,
                fecha_fin=t.fecha_fin,
                descuento_liquidacion=t.descuento_liquidacion,
                estado=t.estado,
                cantidad_productos_asociados=cant_prod
            ))
        return resultado

    @staticmethod
    def programar_temporada(db: Session, request: TemporadaCreate) -> TemporadaResponse:
        # =========================================================================
        # CASO DE USO: CU07 - Gestionar Temporadas y Colecciones (Programación)
        # Diagrama de Comunicación: Com_CU07_Gestionar_Temporadas
        # =========================================================================
        # Paso 1: El Administrador ingresa temporada (código, fechas, productos_ids[]) en ITemporadaBoundary
        codigo = request.codigo_campana.strip().upper()

        # Paso 1.1: ITemporadaBoundary invoca programarTemporada(datosTemp, productos_ids) en TemporadaControl

        # Paso 1.2: TemporadaControl valida que el rango de fechas sea coherente (inicio < fin)
        if request.fecha_inicio >= request.fecha_fin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La fecha de inicio debe ser estrictamente anterior a la fecha de finalización."
            )

        # Validar unicidad de código de campaña
        existente = db.query(Temporada).filter(Temporada.codigo_campana == codigo).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La temporada con código de campaña '{codigo}' ya se encuentra registrada."
            )

        # Paso 1.3: TemporadaControl crea el registro validado en TemporadaEntity
        nueva_temp = Temporada(
            codigo_campana=codigo,
            nombre_temporada=request.nombre_temporada.strip(),
            fecha_inicio=request.fecha_inicio,
            fecha_fin=request.fecha_fin,
            descuento_liquidacion=Decimal(str(request.descuento_liquidacion)),
            estado=request.estado.upper()
        )
        db.add(nueva_temp)
        db.flush()

        # Paso 1.4: TemporadaEntity retorna temporada_id generado
        temporada_id = nueva_temp.id_temporada

        # Paso 1.5: TemporadaControl asocia productos seleccionados a la temporada en ProductoEntity
        cant_asociados = 0
        if request.productos_ids:
            for p_id in request.productos_ids:
                prod = db.query(Producto).filter(Producto.id_producto == p_id).first()
                if prod:
                    prod.id_temporada = temporada_id
                    cant_asociados += 1

        db.commit()
        db.refresh(nueva_temp)

        # Paso 1.6: TemporadaControl confirma temporada vigente
        # Paso 1.7: ITemporadaBoundary visualiza la campaña estacional activada
        return TemporadaResponse(
            id_temporada=nueva_temp.id_temporada,
            codigo_campana=nueva_temp.codigo_campana,
            nombre_temporada=nueva_temp.nombre_temporada,
            fecha_inicio=nueva_temp.fecha_inicio,
            fecha_fin=nueva_temp.fecha_fin,
            descuento_liquidacion=nueva_temp.descuento_liquidacion,
            estado=nueva_temp.estado,
            cantidad_productos_asociados=cant_asociados
        )

    @staticmethod
    def modificar_temporada(db: Session, id_temporada: int, request: TemporadaUpdate) -> TemporadaResponse:
        temp = db.query(Temporada).filter(Temporada.id_temporada == id_temporada).first()
        if not temp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Temporada {id_temporada} no encontrada.")

        if request.nombre_temporada:
            temp.nombre_temporada = request.nombre_temporada.strip()
        if request.fecha_inicio and request.fecha_fin:
            if request.fecha_inicio >= request.fecha_fin:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fecha inicio debe ser menor a fin.")
            temp.fecha_inicio = request.fecha_inicio
            temp.fecha_fin = request.fecha_fin
        elif request.fecha_inicio:
            if request.fecha_inicio >= temp.fecha_fin:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fecha inicio debe ser menor a fin.")
            temp.fecha_inicio = request.fecha_inicio
        elif request.fecha_fin:
            if temp.fecha_inicio >= request.fecha_fin:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fecha fin debe ser mayor a inicio.")
            temp.fecha_fin = request.fecha_fin

        if request.descuento_liquidacion is not None:
            temp.descuento_liquidacion = Decimal(str(request.descuento_liquidacion))
        if request.estado:
            temp.estado = request.estado.upper()

        if request.productos_ids is not None:
            # Desasociar productos anteriores y asociar nuevos
            db.query(Producto).filter(Producto.id_temporada == id_temporada).update({"id_temporada": None})
            for p_id in request.productos_ids:
                prod = db.query(Producto).filter(Producto.id_producto == p_id).first()
                if prod:
                    prod.id_temporada = id_temporada

        db.commit()
        db.refresh(temp)
        return TemporadaResponse(
            id_temporada=temp.id_temporada,
            codigo_campana=temp.codigo_campana,
            nombre_temporada=temp.nombre_temporada,
            fecha_inicio=temp.fecha_inicio,
            fecha_fin=temp.fecha_fin,
            descuento_liquidacion=temp.descuento_liquidacion,
            estado=temp.estado,
            cantidad_productos_asociados=len(temp.productos)
        )

    @staticmethod
    def activar_descuento_liquidacion(db: Session, id_temporada: int, request: ActivarLiquidacionRequest) -> TemporadaResponse:
        # Paso 1: Activar liquidación de fin de temporada con descuento masivo
        temp = db.query(Temporada).filter(Temporada.id_temporada == id_temporada).first()
        if not temp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Temporada no encontrada.")

        temp.descuento_liquidacion = Decimal(str(request.descuento_liquidacion))
        temp.estado = "LIQUIDACION"
        db.commit()
        db.refresh(temp)
        return TemporadaResponse(
            id_temporada=temp.id_temporada,
            codigo_campana=temp.codigo_campana,
            nombre_temporada=temp.nombre_temporada,
            fecha_inicio=temp.fecha_inicio,
            fecha_fin=temp.fecha_fin,
            descuento_liquidacion=temp.descuento_liquidacion,
            estado=temp.estado,
            cantidad_productos_asociados=len(temp.productos)
        )
