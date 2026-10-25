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


# CU22: Solicitar Recomendación Contextual de IA, Paso 1.2: Ctrl -> ClimaExt : consultarClimaActual(ciudad)
@router.get("/clima", response_model=ClimaLocalDTO)
def get_clima_local(
    ciudad: Optional[str] = Query(None, description="Nombre de la ciudad (Santa Cruz, La Paz, Cochabamba)")
):
    """
    Retorna el estado meteorológico local y las pautas textiles inteligentes recomendadas para la jornada.
    """
    # CU22: Solicitar Recomendación Contextual de IA, Paso 1.3: ClimaExt --> Ctrl : retorna temperatura, sensación y condición
    return resolver_clima(ciudad)


# CU22: Solicitar Recomendación Contextual de IA, Paso 1.1: UI -> Ctrl : solicitar_recomendaciones(ciudad, ocasion, id_usuario)
@router.get("/outfits", response_model=RecomendacionesContextualesResponse)
def get_outfits_recomendados(
    ciudad: Optional[str] = Query(None, description="Ciudad para contexto de clima"),
    ocasion: Optional[str] = Query("TODAS", description="Ocasión (Formal, Casual, Cena / Gala, TODAS)"),
    temporada: Optional[str] = Query("TODAS", description="Temporada o campaña"),
    estilo: Optional[str] = Query("TODOS", description="Estilo de preferencia"),
    presupuesto: Optional[str] = Query("TODOS", description="Rango de presupuesto"),
    filtro_clima: Optional[str] = Query("AUTO", description="Filtro o rango de temperatura (AUTO, Cálido, Templado, Frío, Lluvioso)"),
    prompt_ia: Optional[str] = Query(None, description="Instrucción libre o evento para el Asistente IA"),
    db: Session = Depends(get_db)
):
    """
    Genera combinaciones completas de outfits considerando telemetría meteorológica en vivo,
    filtros de estilo, colorimetría y existencias físicas de inventario.
    """
    # CU22: Solicitar Recomendación Contextual de IA, Paso 1.10: Ctrl --> UI : entrega listado de outfits y análisis del estilista
    return generar_outfits_contextuales(
        db=db,
        ciudad_nombre=ciudad,
        ocasion=ocasion,
        temporada=temporada,
        estilo=estilo,
        presupuesto=presupuesto,
        prompt_ia=prompt_ia,
        filtro_clima=filtro_clima
    )


# CU23: Buscar Productos por Comandos de Voz, Paso 1.1: UI -> Ctrl : procesar_busqueda_voz(audio_buffer / consulta_voz)
@router.post("/busqueda-voz", response_model=BusquedaVozResponse)
def post_busqueda_voz(
    request: BusquedaVozRequest,
    db: Session = Depends(get_db)
):
    """
    Procesa consultas en lenguaje natural provenientes del reconocimiento por voz móvil,
    extrayendo intención, ocasión, colores y devolviendo productos sugeridos ordenados por afinidad semántica.
    """
    # CU23: Buscar Productos por Comandos de Voz, Paso 1.8: Ctrl --> UI : transfiere resultados y transcripción final
    return procesar_busqueda_voz_semantica(db=db, consulta_voz=request.consulta_voz)
