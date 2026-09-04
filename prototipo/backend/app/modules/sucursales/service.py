# -*- coding: utf-8 -*-
"""
Clase Control: Lógica de Gestión de Ciudades y Sucursales Físicas (CU05)
Conforme a B4.txt (línea 40), las clases de control contienen exclusivamente métodos de negocio
y NO poseen atributos propios. Cada método documenta sus pasos correlativos de ejecución.
"""
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.sucursales.models import Ciudad, Sucursal
from app.modules.sucursales.schemas import (
    CiudadCreate, CiudadResponse, SucursalCreate, SucursalUpdate, SucursalResponse
)

class SucursalControl:
    """
    Controlador de Gestión de Ciudades y Sucursales Físicas (SucursalControl - CU05)
    Supervisa la infraestructura geográfica, validación de coordenadas GPS y probadores.
    """

    # --- CIUDADES ---
    @staticmethod
    def listar_ciudades(db: Session) -> List[CiudadResponse]:
        # Paso 1: Consulta de catálogo geográfico de ciudades
        ciudades = db.query(Ciudad).order_by(Ciudad.nombre_ciudad.asc()).all()
        return [CiudadResponse.from_orm(c) for c in ciudades]

    @staticmethod
    def crear_ciudad(db: Session, request: CiudadCreate) -> CiudadResponse:
        # Paso 1: Validar unicidad y registrar ciudad en CiudadEntity
        nombre_normalizado = request.nombre_ciudad.strip()
        depto_normalizado = request.departamento.strip()

        ciudad_existente = db.query(Ciudad).filter(
            Ciudad.nombre_ciudad.ilike(nombre_normalizado),
            Ciudad.departamento.ilike(depto_normalizado)
        ).first()

        if ciudad_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La ciudad '{nombre_normalizado}' ya se encuentra registrada en el departamento {depto_normalizado}."
            )

        nueva_ciudad = Ciudad(
            nombre_ciudad=nombre_normalizado,
            departamento=depto_normalizado
        )
        db.add(nueva_ciudad)
        db.commit()
        db.refresh(nueva_ciudad)
        return CiudadResponse.from_orm(nueva_ciudad)

    # --- SUCURSALES ---
    @staticmethod
    def listar_sucursales(
        db: Session,
        id_ciudad: Optional[int] = None,
        estado: Optional[str] = None
    ) -> List[SucursalResponse]:
        # Paso 1: Consultar sucursales con filtros geográficos u operativos
        query = db.query(Sucursal)
        if id_ciudad:
            query = query.filter(Sucursal.id_ciudad == id_ciudad)
        if estado:
            query = query.filter(Sucursal.estado == estado.upper())

        sucursales = query.order_by(Sucursal.id_sucursal.asc()).all()
        resultado = []
        for s in sucursales:
            resultado.append(SucursalResponse(
                id_sucursal=s.id_sucursal,
                id_ciudad=s.id_ciudad,
                nombre_ciudad=s.ciudad.nombre_ciudad if s.ciudad else None,
                departamento=s.ciudad.departamento if s.ciudad else None,
                nombre_sucursal=s.nombre_sucursal,
                direccion=s.direccion,
                latitud=s.latitud,
                longitud=s.longitud,
                telefono=s.telefono,
                capacidad_probadores=s.capacidad_probadores,
                horario_apertura=s.horario_apertura,
                horario_cierre=s.horario_cierre,
                estado=s.estado
            ))
        return resultado

    @staticmethod
    def obtener_sucursal(db: Session, id_sucursal: int) -> SucursalResponse:
        sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == id_sucursal).first()
        if not sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sucursal con ID {id_sucursal} no encontrada."
            )
        return SucursalResponse(
            id_sucursal=sucursal.id_sucursal,
            id_ciudad=sucursal.id_ciudad,
            nombre_ciudad=sucursal.ciudad.nombre_ciudad if sucursal.ciudad else None,
            departamento=sucursal.ciudad.departamento if sucursal.ciudad else None,
            nombre_sucursal=sucursal.nombre_sucursal,
            direccion=sucursal.direccion,
            latitud=sucursal.latitud,
            longitud=sucursal.longitud,
            telefono=sucursal.telefono,
            capacidad_probadores=sucursal.capacidad_probadores,
            horario_apertura=sucursal.horario_apertura,
            horario_cierre=sucursal.horario_cierre,
            estado=sucursal.estado
        )

    @staticmethod
    def registrar_sucursal(db: Session, request: SucursalCreate) -> SucursalResponse:
        # =========================================================================
        # CASO DE USO: CU05 - Gestionar Ciudades y Sucursales Físicas (Alta)
        # Diagrama de Comunicación: Com_CU05_Gestionar_Sucursales
        # =========================================================================
        # Paso 1: El Administrador ingresa datos de la sucursal (nombre, dir, lat, lon, probadores, horarios) en ISucursalBoundary
        # Paso 1.1: ISucursalBoundary invoca registrarSucursal(datosSucursal) en SucursalControl

        # Paso 1.2: SucursalControl verifica la existencia de la ciudad en CiudadEntity
        ciudad = db.query(Ciudad).filter(Ciudad.id_ciudad == request.id_ciudad).first()
        if not ciudad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La ciudad con ID {request.id_ciudad} no existe en el sistema."
            )

        # Paso 1.3: CiudadEntity confirma ciudad válida
        
        # Paso 1.4: SucursalControl valida reglas de negocio:
        # - Coordenadas GPS válidas (Latitud: -90 a +90, Longitud: -180 a +180)
        # - Capacidad de probadores mayor o igual a 1
        lat = Decimal(str(request.latitud))
        lon = Decimal(str(request.longitud))
        if lat < Decimal("-90.0") or lat > Decimal("90.0"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Latitud GPS fuera de rango (-90 a +90).")
        if lon < Decimal("-180.0") or lon > Decimal("180.0"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Longitud GPS fuera de rango (-180 a +180).")
        if request.capacidad_probadores < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La capacidad de probadores debe ser al menos 1.")

        nueva_sucursal = Sucursal(
            id_ciudad=request.id_ciudad,
            nombre_sucursal=request.nombre_sucursal.strip(),
            direccion=request.direccion.strip(),
            latitud=lat,
            longitud=lon,
            telefono=request.telefono.strip() if request.telefono else None,
            capacidad_probadores=request.capacidad_probadores,
            horario_apertura=request.horario_apertura,
            horario_cierre=request.horario_cierre,
            estado=request.estado.upper()
        )
        db.add(nueva_sucursal)
        db.commit()
        db.refresh(nueva_sucursal)

        # Paso 1.5: SucursalEntity retorna sucursal_id generado
        # Paso 1.6: SucursalControl confirma el éxito del registro
        # Paso 1.7: ISucursalBoundary renderiza la sucursal en grilla y visualización cartográfica
        return SucursalResponse(
            id_sucursal=nueva_sucursal.id_sucursal,
            id_ciudad=nueva_sucursal.id_ciudad,
            nombre_ciudad=ciudad.nombre_ciudad,
            departamento=ciudad.departamento,
            nombre_sucursal=nueva_sucursal.nombre_sucursal,
            direccion=nueva_sucursal.direccion,
            latitud=nueva_sucursal.latitud,
            longitud=nueva_sucursal.longitud,
            telefono=nueva_sucursal.telefono,
            capacidad_probadores=nueva_sucursal.capacidad_probadores,
            horario_apertura=nueva_sucursal.horario_apertura,
            horario_cierre=nueva_sucursal.horario_cierre,
            estado=nueva_sucursal.estado
        )

    @staticmethod
    def modificar_sucursal(db: Session, id_sucursal: int, request: SucursalUpdate) -> SucursalResponse:
        # Paso 1: Edición de campos operativos de la sucursal
        sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == id_sucursal).first()
        if not sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sucursal con ID {id_sucursal} no encontrada."
            )

        if request.nombre_sucursal:
            sucursal.nombre_sucursal = request.nombre_sucursal.strip()
        if request.direccion:
            sucursal.direccion = request.direccion.strip()
        if request.latitud is not None:
            lat = Decimal(str(request.latitud))
            if lat < Decimal("-90.0") or lat > Decimal("90.0"):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Latitud inválida.")
            sucursal.latitud = lat
        if request.longitud is not None:
            lon = Decimal(str(request.longitud))
            if lon < Decimal("-180.0") or lon > Decimal("180.0"):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Longitud inválida.")
            sucursal.longitud = lon
        if request.telefono is not None:
            sucursal.telefono = request.telefono.strip() if request.telefono else None
        if request.capacidad_probadores is not None:
            if request.capacidad_probadores < 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Capacidad de probadores mínima es 1.")
            sucursal.capacidad_probadores = request.capacidad_probadores
        if request.horario_apertura:
            sucursal.horario_apertura = request.horario_apertura
        if request.horario_cierre:
            sucursal.horario_cierre = request.horario_cierre
        if request.estado:
            sucursal.estado = request.estado.upper()

        db.commit()
        db.refresh(sucursal)
        return SucursalResponse(
            id_sucursal=sucursal.id_sucursal,
            id_ciudad=sucursal.id_ciudad,
            nombre_ciudad=sucursal.ciudad.nombre_ciudad if sucursal.ciudad else None,
            departamento=sucursal.ciudad.departamento if sucursal.ciudad else None,
            nombre_sucursal=sucursal.nombre_sucursal,
            direccion=sucursal.direccion,
            latitud=sucursal.latitud,
            longitud=sucursal.longitud,
            telefono=sucursal.telefono,
            capacidad_probadores=sucursal.capacidad_probadores,
            horario_apertura=sucursal.horario_apertura,
            horario_cierre=sucursal.horario_cierre,
            estado=sucursal.estado
        )
