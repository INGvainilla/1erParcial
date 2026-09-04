# -*- coding: utf-8 -*-
"""
Enrutador de API: Gestión de Temporadas y Colecciones (M04 - CU07)
Comentado paso a paso conforme al caso de uso CU07.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.modules.auth.models import Usuario
from app.modules.temporadas.schemas import (
    TemporadaCreate, TemporadaUpdate, TemporadaResponse, ActivarLiquidacionRequest
)
from app.modules.temporadas.service import TemporadaControl

router = APIRouter(prefix="/temporadas", tags=["Gestión de Temporadas (CU07)"])

@router.get("", response_model=List[TemporadaResponse])
def listar_temporadas_endpoint(
    estado: Optional[str] = Query(None, description="Filtrar por estado: VIGENTE, LIQUIDACION, FINALIZADA"),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU07 - Consultar Temporadas
    # Paso 1: Usuario u Operador solicita lista de colecciones y campañas estacionales
    # Paso 1.1: Invocación a TemporadaControl.listar_temporadas()
    return TemporadaControl.listar_temporadas(db, estado=estado)

@router.post("", response_model=TemporadaResponse, status_code=status.HTTP_201_CREATED)
def programar_temporada_endpoint(
    request: TemporadaCreate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU07 - Alta y Programación de Temporada
    # Paso 1: Administrador envía datos de la campaña (código, fechas, productos)
    # Paso 1.1: Invocación a TemporadaControl.programar_temporada()
    return TemporadaControl.programar_temporada(db, request)

@router.put("/{id_temporada}", response_model=TemporadaResponse)
def modificar_temporada_endpoint(
    id_temporada: int,
    request: TemporadaUpdate,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU07 - Modificación de Temporada
    # Paso 1: Administrador actualiza fechas o productos asociados
    # Paso 1.1: Invocación a TemporadaControl.modificar_temporada()
    return TemporadaControl.modificar_temporada(db, id_temporada=id_temporada, request=request)

@router.post("/{id_temporada}/liquidar", response_model=TemporadaResponse)
def activar_liquidacion_endpoint(
    id_temporada: int,
    request: ActivarLiquidacionRequest,
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"])),
    db: Session = Depends(get_db)
):
    # CASO DE USO: CU07 - Activar Liquidación de Temporada
    # Paso 1: Administrador activa descuento promocional de remate estacional
    # Paso 1.1: Invocación a TemporadaControl.activar_descuento_liquidacion()
    return TemporadaControl.activar_descuento_liquidacion(db, id_temporada=id_temporada, request=request)
