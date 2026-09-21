# -*- coding: utf-8 -*-
"""
Controlador / Router: Recomendaciones de IA y Búsqueda por Voz (CU22, CU23 - M17)
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.p03_catalogo_estilismo_ia.ia_recomendaciones.schemas import (
    ClimaLocalDTO,
    RecomendacionesContextualesResponse,
    BusquedaVozRequest,
    BusquedaVozResponse
)
from app.modules.p03_catalogo_estilismo_ia.ia_recomendaciones.services import (
    resolver_clima,
    generar_outfits_contextuales,
    procesar_busqueda_voz_semantica
)

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones Contextuales de IA y Voz (CU22, CU23)"])


@router.get("/clima", response_model=ClimaLocalDTO)
def get_clima_local(
    ciudad: Optional[str] = Query(None, description="Nombre de la ciudad (Santa Cruz, La Paz, Cochabamba)")
):
    """
    Retorna el estado meteorológico local y las pautas textiles inteligentes recomendadas para la jornada.
    """
    return resolver_clima(ciudad)


@router.get("/outfits", response_model=RecomendacionesContextualesResponse)
def get_outfits_recomendados(
    ciudad: Optional[str] = Query(None, description="Ciudad para contexto de clima"),
    ocasion: Optional[str] = Query("TODAS", description="Ocasión (Formal, Casual, Coctel, TODAS)"),
    db: Session = Depends(get_db)
):
    """
    Genera combinaciones completas de outfits considerando temperatura local, colorimetría,
    estilo sartorial y compatibilidad textil.
    """
    return generar_outfits_contextuales(db=db, ciudad_nombre=ciudad, ocasion=ocasion)


@router.post("/busqueda-voz", response_model=BusquedaVozResponse)
def post_busqueda_voz(
    request: BusquedaVozRequest,
    db: Session = Depends(get_db)
):
    """
    Procesa consultas en lenguaje natural provenientes del reconocimiento por voz móvil,
    extrayendo intención, ocasión, colores y devolviendo productos sugeridos ordenados por afinidad semántica.
    """
    return procesar_busqueda_voz_semantica(db=db, consulta_voz=request.consulta_voz)
