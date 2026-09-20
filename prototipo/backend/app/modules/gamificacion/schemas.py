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
    progreso_siguiente_nivel_pct: float = 0.0
    puntos_siguiente_nivel: int
    puntos_faltantes: int = 0
    siguiente_nivel: Optional[str] = None
    descuento_nivel_pct: float
    descuento_permanente_pct: float = 0.0
    compras_equivalente_ascenso_bs: float = 0.0
    beneficios_nivel: List[str]
    insignias: List[InsigniaDTO]
    compras_contabilizadas: int


class CanjeRequest(BaseModel):
    codigo_recompensa: str = Field(..., description="Código de la recompensa a canjear")


class CanjeResponse(BaseModel):
    exito: bool
    mensaje: str
    codigo_cupon: Optional[str] = None
    monto_descuento: float = 0.0
    puntos_restantes: int


class BonoAccionRequest(BaseModel):
    accion: str = Field(..., description="Acción realizada: PROBAR_RA, BUSQUEDA_VOZ, COMPARTIR_LOOK")


class CuponUsuarioDTO(BaseModel):
    id_cupon: int
    codigo_cupon: str
    monto_descuento: float
    tipo_beneficio: str
    utilizado: bool
    fecha_emision: str
    fecha_expiracion: str
    dias_restantes: int


class ValidarCuponRequest(BaseModel):
    codigo_cupon: str = Field(..., description="Código de cupón alfanumérico a validar en Checkout")


class ValidarCuponResponse(BaseModel):
    valido: bool
    mensaje: str
    codigo_cupon: Optional[str] = None
    monto_descuento: float = 0.0
    tipo_beneficio: str = "DESCUENTO_MONTO"

