# -*- coding: utf-8 -*-
"""
Esquemas DTO (Pydantic): Recomendaciones de IA y Búsqueda por Voz (M17 - CU22, CU23)
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class ClimaLocalDTO(BaseModel):
    ciudad: str
    temperatura_c: float
    sensacion_c: float
    condicion: str
    descripcion_clima: str
    icono_clima: str
    recomendacion_textil: str
    humedad_pct: Optional[int] = Field(None, description="Porcentaje de humedad relativa actual")
    viento_kmh: Optional[float] = Field(None, description="Velocidad del viento en km/h")
    fuente_meteo: Optional[str] = Field("Open-Meteo Satelital en Vivo", description="Origen de la telemetría climática")
    es_tiempo_real: Optional[bool] = Field(True, description="Indica si los datos fueron obtenidos en vivo")


class PrendaOutfitDTO(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    categoria: str
    precio_base: float
    precio_final: float
    descuento_pct: float
    imagen_principal: Optional[str] = None
    color_sugerido: str
    color_hex: str
    talla_sugerida: str
    modelo_3d_glb: Optional[str] = None


class OutfitRecomendadoDTO(BaseModel):
    id_outfit: str
    titulo: str
    ocasion: str
    estilo: str
    afinidad_climatica_pct: int
    analisis_estilista_ia: str
    regla_colorimetria: str
    prendas: List[PrendaOutfitDTO]
    precio_total_original: float
    precio_total_final: float
    ahorro_total: float


class RecomendacionesContextualesResponse(BaseModel):
    ciudad: str
    clima: ClimaLocalDTO
    ocasion_seleccionada: str
    temporada_seleccionada: Optional[str] = "TODAS"
    estilo_seleccionado: Optional[str] = "TODOS"
    presupuesto_seleccionado: Optional[str] = "TODOS"
    filtro_clima_seleccionado: Optional[str] = "AUTO"
    prompt_ia: Optional[str] = None
    razonamiento_ia: Optional[str] = None
    total_outfits: int
    outfits_recomendados: List[OutfitRecomendadoDTO]


class BusquedaVozRequest(BaseModel):
    consulta_voz: str = Field(..., description="Transcripción del comando de voz del usuario")


class PrendaResultadoBusquedaDTO(BaseModel):
    id_producto: int
    codigo_sku_base: str
    nombre: str
    categoria: str
    precio_final: float
    descuento_pct: float
    imagen_principal: Optional[str] = None
    modelo_3d_glb: Optional[str] = None
    colores_disponibles: List[str]
    relevancia_score: int
    motivo_coincidencia: str


class BusquedaVozResponse(BaseModel):
    consulta_original: str
    intencion_detectada: str
    ocasion_detectada: Optional[str] = None
    categoria_detectada: Optional[str] = None
    total_encontrados: int
    prendas_sugeridas: List[PrendaResultadoBusquedaDTO]
