# -*- coding: utf-8 -*-
"""
Enrutador de Endpoints: Pasarela de Pagos Stripe (CU16 - M14)
"""
from fastapi import APIRouter, Depends, Request, Header, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.models import Usuario
from app.modules.pagos.schemas import (
    IntencionPagoRequest,
    IntencionPagoResponse,
    ConfirmarPagoDirectoRequest,
    TransaccionResponse,
    WebhookResponse
)
from app.modules.pagos.services import (
    crear_intencion_pago,
    confirmar_transaccion_pago,
    procesar_webhook_stripe
)

router = APIRouter(
    prefix="/pagos",
    tags=["Pasarela de Pagos Electrónica (CU16)"]
)

@router.post(
    "/intencion",
    response_model=IntencionPagoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generar Intención de Pago en Stripe (CU16)"
)
def api_crear_intencion_pago(
    payload: IntencionPagoRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Inicia el flujo de cobro digital para una orden de venta en estado PENDIENTE.
    Devuelve el client_secret para que el frontend tokenice la tarjeta sin intermediar datos sensibles.
    """
    return crear_intencion_pago(
        db=db,
        id_orden=payload.id_orden,
        id_usuario=current_user.id_usuario,
        rol_usuario=current_user.rol
    )


@router.post(
    "/confirmar",
    response_model=TransaccionResponse,
    status_code=status.HTTP_200_OK,
    summary="Confirmar y Asentar Pago Aprobado por Pasarela (CU16)"
)
def api_confirmar_pago(
    payload: ConfirmarPagoDirectoRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Verifica con la API de Stripe que el PaymentIntent esté en estado 'succeeded',
    marca la orden como PAGADA y genera el asiento inmutable en transacciones_pago.
    """
    return confirmar_transaccion_pago(
        db=db,
        id_orden=payload.id_orden,
        payment_intent_id=payload.payment_intent_id
    )


@router.post(
    "/webhook/stripe",
    response_model=WebhookResponse,
    status_code=status.HTTP_200_OK,
    summary="Webhook Asíncrono de Notificación de Stripe (CU16)"
)
async def api_webhook_stripe(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """
    Endpoint público de escucha para eventos emitidos por Stripe.
    Verifica la firma criptográfica usando Stripe-Signature y actualiza la orden de venta asíncronamente.
    """
    body = await request.body()
    res = procesar_webhook_stripe(
        db=db,
        payload=body,
        sig_header=stripe_signature or ""
    )
    return WebhookResponse(
        status="success",
        message=f"Evento '{res.get('event_type')}' procesado exitosamente."
    )
