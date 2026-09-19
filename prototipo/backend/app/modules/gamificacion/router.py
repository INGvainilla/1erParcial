# -*- coding: utf-8 -*-
"""
Controlador / Router: Fidelización Gamificada (CU21 - M16)
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.models import Usuario
from app.modules.gamificacion.schemas import (
    GamificacionPerfilResponse,
    RecompensaDTO,
    CanjeRequest,
    CanjeResponse,
    BonoAccionRequest
)
from app.modules.gamificacion.services import (
    obtener_o_crear_perfil,
    listar_recompensas,
    canjear_recompensa_usuario,
    otorgar_bono_accion
)

router = APIRouter(prefix="/gamificacion", tags=["Fidelización Gamificada (CU21)"])


@router.get("/perfil", response_model=GamificacionPerfilResponse)
def get_perfil_gamificacion(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el estado de fidelización del cliente autenticado:
    Puntos actuales, nivel jerárquico (Bronce a Diamante), progreso porcentual,
    insignias desbloqueadas y beneficios exclusivos de la boutique.
    """
    try:
        return obtener_o_crear_perfil(db, current_user.id_usuario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recompensas", response_model=List[RecompensaDTO])
def get_recompensas_disponibles(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna el catálogo de beneficios y recompensas canjeables con su disponibilidad según los puntos del usuario.
    """
    perfil = obtener_o_crear_perfil(db, current_user.id_usuario)
    return listar_recompensas(perfil.puntos_actuales)


@router.post("/canjear", response_model=CanjeResponse)
def post_canjear_recompensa(
    request: CanjeRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Canjea una recompensa descontando los puntos requeridos y emitiendo el código de cupón.
    """
    return canjear_recompensa_usuario(db, current_user.id_usuario, request.codigo_recompensa)


@router.post("/bono-accion")
def post_bono_accion(
    request: BonoAccionRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Registra bonos de puntos por interacción activa:
    - PROBAR_RA: +25 pts y desbloqueo de insignia 'Visionario 3D'
    - BUSQUEDA_VOZ: +15 pts y desbloqueo de insignia 'Comando de Voz'
    - COMPARTIR_LOOK: +20 pts
    """
    return otorgar_bono_accion(db, current_user.id_usuario, request.accion)
