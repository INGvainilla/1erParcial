# -*- coding: utf-8 -*-
"""
Enrutador de Configuración de Medios de Cobro (CU17 - M15)
Coherencia con skillsCU17.MD
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.auth.models import Usuario
from app.modules.pagos.schemas import (
    MetodoPagoResponse,
    MetodoPagoUpdate,
    MetodoPagoPublicoResponse
)
from app.modules.pagos.services import (
    listar_metodos_pago,
    listar_metodos_pago_publicos,
    actualizar_metodo_pago
)

router = APIRouter(
    prefix="/configuracion/pagos",
    tags=["Gestionar Tipos y Medios de Cobro (CU17)"]
)

@router.get(
    "",
    response_model=List[MetodoPagoResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar Todos los Métodos de Pago y Credenciales Enmascaradas (CU17)"
)
def api_listar_metodos_pago(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"]))
):
    """
    Exclusivo para Administrador General:
    Devuelve la configuración completa de todos los canales de pago con llaves secretas enmascaradas.
    """
    return listar_metodos_pago(db=db, solo_activos=False)


@router.patch(
    "/{id_metodo}",
    response_model=MetodoPagoResponse,
    status_code=status.HTTP_200_OK,
    summary="Activar/Desactivar o Parametrizar un Medio de Cobro (CU17)"
)
def api_actualizar_metodo_pago(
    id_metodo: int,
    update_data: MetodoPagoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"]))
):
    """
    Exclusivo para Administrador General:
    Modifica el estado activo/inactivo (Toggle Switch) o actualiza credenciales sensibles (API Keys).
    """
    return actualizar_metodo_pago(db=db, id_metodo=id_metodo, update_data=update_data)


@router.get(
    "/activos",
    response_model=List[MetodoPagoPublicoResponse],
    status_code=status.HTTP_200_OK,
    summary="Consultar Canales de Pago Activos para Clientes/Caja"
)
def api_listar_metodos_activos(
    db: Session = Depends(get_db)
):
    """
    Endpoint público/operativo consumido por Checkout (CU14/CU16) y Terminal POS (CU15)
    para verificar qué métodos de cobro se encuentran habilitados.
    """
    return listar_metodos_pago_publicos(db=db)
