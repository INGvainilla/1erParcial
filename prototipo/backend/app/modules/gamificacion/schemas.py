# -*- coding: utf-8 -*-
"""
Esquemas DTO (Pydantic): Fidelización Gamificada (M16 - CU21)
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class InsigniaDTO(BaseModel):
    id: str
    nombre: str
    descripcion: str
    icono: str
    desbloqueada: bool
    fecha_desbloqueo: Optional[str] = None


class RecompensaDTO(BaseModel):
    id: str
    codigo: str
    titulo: str
    descripcion: str
    costo_puntos: int
    categoria: str
    icono: str
    disponible: bool = True


class GamificacionPerfilResponse(BaseModel):
    id_perfil: int
    id_usuario: int
    nombre_cliente: str
    puntos_actuales: int
    puntos_historicos: int
    nivel: str  # BRONCE, PLATA, ORO, DIAMANTE
    progreso_nivel_pct: float
    puntos_siguiente_nivel: int
    siguiente_nivel: Optional[str] = None
    descuento_nivel_pct: float
    beneficios_nivel: List[str]
    insignias: List[InsigniaDTO]
    compras_contabilizadas: int


class CanjeRequest(BaseModel):
    codigo_recompensa: str = Field(..., description="Código de la recompensa a canjear")


class CanjeResponse(BaseModel):
    exito: bool
    mensaje: str
    codigo_cupon: Optional[str] = None
    puntos_restantes: int


class BonoAccionRequest(BaseModel):
    accion: str = Field(..., description="Acción realizada: PROBAR_RA, BUSQUEDA_VOZ, COMPARTIR_LOOK")
