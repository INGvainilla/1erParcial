# -*- coding: utf-8 -*-
"""
Servicios de Lógica de Negocio: Integración con Pasarela de Pagos Stripe (CU16)
Cumplimiento estricto con skillsCU16.MD
"""
import stripe
import json
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.modules.ordenes.models import OrdenVenta
from app.modules.pagos.models import TransaccionPago, MetodoPagoConfig
from app.modules.pagos.schemas import (
    IntencionPagoResponse,
    TransaccionResponse,
    MetodoPagoResponse,
    MetodoPagoUpdate,
    MetodoPagoPublicoResponse
)

# Configurar API Key de Stripe Sandbox
stripe.api_key = settings.STRIPE_SECRET_KEY

def crear_intencion_pago(
    db: Session,
    id_orden: int,
    id_usuario: int,
    rol_usuario: str
) -> IntencionPagoResponse:
    """
    CU16: Genera un PaymentIntent en Stripe para cobrar una orden en estado PENDIENTE.
    - Convierte el total a centavos (requerido por Stripe).
    - Asocia metadata con id_orden y numero_factura.
    - Devuelve el client_secret para que el frontend tokenice sin almacenar datos de tarjeta.
    """
    orden = db.query(OrdenVenta).filter(OrdenVenta.id_orden == id_orden).first()
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de venta #{id_orden} no encontrada."
        )

    # Control de Acceso: El cliente solo puede pagar sus propias órdenes
    if rol_usuario == "CLIENTE" and orden.id_usuario != id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene autorización para procesar el pago de esta orden."
        )

    if orden.estado_pago == "PAGADO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden #{id_orden} ({orden.numero_factura}) ya figura como PAGADA."
        )

    monto_float = float(orden.total)
    if monto_float <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El importe total de la orden debe ser superior a 0."
        )

    # Stripe requiere el importe en centavos enteros (ej: 280.00 Bs -> 28000 centavos)
    monto_centavos = int(round(monto_float * 100))
    moneda = (settings.STRIPE_CURRENCY or "bob").lower()

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=monto_centavos,
            currency=moneda,
            description=f"FashionStore - Factura {orden.numero_factura}",
            metadata={
                "id_orden": str(orden.id_orden),
                "numero_factura": orden.numero_factura or f"ORD-{orden.id_orden}",
                "id_usuario": str(orden.id_usuario or id_usuario)
            },
            automatic_payment_methods={
                "enabled": True,
            }
        )

        return IntencionPagoResponse(
            client_secret=payment_intent.client_secret,
            publishable_key=settings.STRIPE_PUBLISHABLE_KEY,
            id_orden=orden.id_orden,
            numero_factura=orden.numero_factura or f"ORD-{orden.id_orden}",
            total=monto_float,
            moneda=moneda.upper(),
            payment_intent_id=payment_intent.id
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error en la pasarela de pagos Stripe: {str(e.user_message or str(e))}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al generar intención de cobro: {str(e)}"
        )


def confirmar_transaccion_pago(
    db: Session,
    id_orden: int,
    payment_intent_id: str
) -> TransaccionResponse:
    """
    CU16: Confirma el estado del PaymentIntent contra la API de Stripe y asienta el pago en BD.
    - Si Stripe confirma éxito (status='succeeded'), actualiza orden a PAGADO.
    - Avanza estado logístico a 'PREPARACION' o 'LISTO_DESPACHO'.
    - Registra la transacción inmutable en transacciones_pago.
    """
    orden = db.query(OrdenVenta).filter(OrdenVenta.id_orden == id_orden).first()
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden #{id_orden} no encontrada."
        )

    # Si ya estaba registrada y pagada, devolver el registro existente
    tx_existente = db.query(TransaccionPago).filter(
        TransaccionPago.payment_intent_id == payment_intent_id
    ).first()
    if tx_existente and orden.estado_pago == "PAGADO":
        return TransaccionResponse(
            id_transaccion=tx_existente.id_transaccion,
            id_orden=tx_existente.id_orden,
            pasarela=tx_existente.pasarela,
            payment_intent_id=tx_existente.payment_intent_id,
            monto=float(tx_existente.monto),
            moneda=tx_existente.moneda,
            estado=tx_existente.estado,
            marca_tarjeta=tx_existente.marca_tarjeta,
            ultimos4=tx_existente.ultimos4,
            fecha_creacion=tx_existente.fecha_creacion,
            numero_factura=orden.numero_factura
        )

    try:
        # Verificar directamente contra los servidores seguros de Stripe
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo verificar el pago en Stripe: {str(e)}"
        )

    if pi.status != "succeeded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El pago no ha sido completado exitosamente en la pasarela. Estado actual: '{pi.status}'."
        )

    # Extraer metadatos de la tarjeta utilizada (sin guardar nunca números sensibles)
    marca = None
    last4 = None
    try:
        if pi.charges and pi.charges.data:
            charge = pi.charges.data[0]
            card_data = charge.payment_method_details.card if charge.payment_method_details else None
            if card_data:
                marca = card_data.brand
                last4 = card_data.last4
    except Exception:
        pass

    # Actualizar estado de la orden
    orden.estado_pago = "PAGADO"
    if orden.modalidad_entrega == "RETIRO_TIENDA":
        orden.estado_logistica = "LISTO_DESPACHO"
    else:
        orden.estado_logistica = "PREPARACION"

    # Registrar en transacciones_pago
    tx = TransaccionPago(
        id_orden=orden.id_orden,
        pasarela="STRIPE",
        payment_intent_id=payment_intent_id,
        monto=Decimal(str(round(pi.amount / 100.0, 2))),
        moneda=pi.currency.upper(),
        estado="SUCCEEDED",
        metodo_pago="card",
        marca_tarjeta=marca or "card",
        ultimos4=last4 or "4242",
        detalles_raw=json.dumps({"id": pi.id, "status": pi.status, "currency": pi.currency})
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return TransaccionResponse(
        id_transaccion=tx.id_transaccion,
        id_orden=tx.id_orden,
        pasarela=tx.pasarela,
        payment_intent_id=tx.payment_intent_id,
        monto=float(tx.monto),
        moneda=tx.moneda,
        estado=tx.estado,
        marca_tarjeta=tx.marca_tarjeta,
        ultimos4=tx.ultimos4,
        fecha_creacion=tx.fecha_creacion,
        numero_factura=orden.numero_factura
    )


def procesar_webhook_stripe(
    db: Session,
    payload: bytes,
    sig_header: str
) -> dict:
    """
    CU16: Procesamiento asíncrono de Webhooks enviados por Stripe.
    - Valida la firma criptográfica (Invalid signature -> 400 Bad Request).
    - Procesa el evento 'payment_intent.succeeded' marcando la orden como pagada.
    """
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firma de webhook ausente (Header Stripe-Signature requerido)."
        )

    try:
        # Validación criptográfica oficial de Stripe
        if webhook_secret and webhook_secret != "whsec_test":
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=webhook_secret
            )
        else:
            # Si el webhook secret es de prueba local, validar decodificación de JSON
            event_data = json.loads(payload.decode("utf-8"))
            event = event_data
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firma criptográfica de webhook inválida: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al verificar webhook de Stripe: {str(e)}"
        )

    event_type = event.get("type")
    if event_type == "payment_intent.succeeded":
        pi = event["data"]["object"]
        id_orden_str = pi.get("metadata", {}).get("id_orden")
        if id_orden_str and id_orden_str.isdigit():
            id_orden = int(id_orden_str)
            try:
                confirmar_transaccion_pago(db, id_orden, pi["id"])
            except Exception as e:
                print(f"[WEBHOOK STRIPE] Advertencia al procesar confirmación: {str(e)}")

    return {"status": "success", "event_type": event_type}


# ==============================================================================
# CU17: GESTIONAR TIPOS Y MEDIOS DE COBRO
# ==============================================================================

def enmascarar_credenciales(credenciales: Dict[str, Any]) -> Dict[str, str]:
    """
    Enmascara claves secretas y tokens (ej: sk_test_****dXFK) para proteger credenciales sensibles.
    """
    enmascaradas = {}
    for k, v in (credenciales or {}).items():
        v_str = str(v).strip()
        if not v_str:
            enmascaradas[k] = ""
            continue
        # Si es secreto o key largo
        if len(v_str) > 10:
            enmascaradas[k] = f"{v_str[:8]}****************{v_str[-4:]}"
        elif len(v_str) > 4:
            enmascaradas[k] = f"{v_str[:2]}****{v_str[-2:]}"
        else:
            enmascaradas[k] = "****"
    return enmascaradas


def asegurar_metodos_pago_semilla(db: Session):
    """
    Inicializa de forma idempotente los 4 canales de cobro fundamentales del sistema si la tabla está vacía.
    """
    count = db.query(MetodoPagoConfig).count()
    if count > 0:
        return

    medios_iniciales = [
        MetodoPagoConfig(
            codigo="EFECTIVO",
            nombre="Efectivo en Caja Mostrador",
            tipo="FISICO",
            descripcion="Cobro presencial en billetes y monedas con cálculo automático de vuelto en sucursales.",
            icono="fa-money-bill-wave",
            activo=True,
            requiere_credenciales=False,
            credenciales_json="{}"
        ),
        MetodoPagoConfig(
            codigo="TARJETA_POS",
            nombre="Terminal POS / Tarjeta Física",
            tipo="FISICO",
            descripcion="Cobro presencial con tarjetas Visa/Mastercard mediante datafast / terminal PinPad inalámbrico.",
            icono="fa-credit-card",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "terminal_id": "POS-DATAFAST-001",
                "banco_adquirente": "Banco Mercantil Santa Cruz"
            })
        ),
        MetodoPagoConfig(
            codigo="STRIPE",
            nombre="Pasarela Digital Stripe (Online)",
            tipo="DIGITAL",
            descripcion="Cobro internacional en línea con tarjetas de crédito/débito, 3D Secure y tokenización PCI-DSS.",
            icono="fa-stripe",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
                "secret_key": settings.STRIPE_SECRET_KEY,
                "webhook_secret": settings.STRIPE_WEBHOOK_SECRET
            })
        ),
        MetodoPagoConfig(
            codigo="QR_BCB",
            nombre="Código QR Simple BCB Interoperable",
            tipo="OMNICANAL",
            descripcion="Cobros instantáneos mediante códigos QR bajo el estándar interoperable del Banco Central de Bolivia.",
            icono="fa-qrcode",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "banco_origen": "Banco Central de Bolivia",
                "cuenta_recaudacion": "1000004928190",
                "comercio_id": "FASHIONSTORE-BO"
            })
        )
    ]

    for m in medios_iniciales:
        db.add(m)
    db.commit()


def listar_metodos_pago(db: Session, solo_activos: bool = False) -> List[MetodoPagoResponse]:
    """
    Lista todos los medios de pago con sus credenciales debidamente enmascaradas.
    """
    asegurar_metodos_pago_semilla(db)

    query = db.query(MetodoPagoConfig)
    if solo_activos:
        query = query.filter(MetodoPagoConfig.activo == True)

    metodos = query.order_by(MetodoPagoConfig.id_metodo.asc()).all()

    resultado = []
    for m in metodos:
        raw_creds = {}
        if m.credenciales_json:
            try:
                raw_creds = json.loads(m.credenciales_json)
            except Exception:
                pass

        resultado.append(
            MetodoPagoResponse(
                id_metodo=m.id_metodo,
                codigo=m.codigo,
                nombre=m.nombre,
                tipo=m.tipo,
                descripcion=m.descripcion,
                icono=m.icono,
                activo=m.activo,
                requiere_credenciales=m.requiere_credenciales,
                credenciales_enmascaradas=enmascarar_credenciales(raw_creds),
                actualizado_en=m.actualizado_en
            )
        )

    return resultado


def listar_metodos_pago_publicos(db: Session) -> List[MetodoPagoPublicoResponse]:
    """
    Endpoint liviano para checkout web y terminal POS para verificar disponibilidad operativa.
    """
    asegurar_metodos_pago_semilla(db)
    metodos = db.query(MetodoPagoConfig).filter(MetodoPagoConfig.activo == True).all()
    return [
        MetodoPagoPublicoResponse(
            codigo=m.codigo,
            nombre=m.nombre,
            tipo=m.tipo,
            icono=m.icono,
            activo=m.activo
        ) for m in metodos
    ]


def actualizar_metodo_pago(
    db: Session,
    id_metodo: int,
    update_data: MetodoPagoUpdate
) -> MetodoPagoResponse:
    """
    CU17: Modifica el estado activo/inactivo o actualiza credenciales de un medio de cobro.
    - Si se actualizan claves de Stripe, refresca dinámicamente stripe.api_key en caliente.
    """
    asegurar_metodos_pago_semilla(db)

    metodo = db.query(MetodoPagoConfig).filter(MetodoPagoConfig.id_metodo == id_metodo).first()
    if not metodo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Método de pago con ID #{id_metodo} no encontrado."
        )

    if update_data.activo is not None:
        metodo.activo = update_data.activo

    if update_data.credenciales is not None:
        raw_creds = {}
        if metodo.credenciales_json:
            try:
                raw_creds = json.loads(metodo.credenciales_json)
            except Exception:
                pass

        for k, v in update_data.credenciales.items():
            # Si el valor no fue alterado (es decir, contiene los asteriscos de enmascaramiento), ignorar
            if "****" not in str(v):
                raw_creds[k] = str(v).strip()

        metodo.credenciales_json = json.dumps(raw_creds)

        # Si el método es Stripe, propagar claves en tiempo de ejecución
        if metodo.codigo == "STRIPE":
            new_sec = raw_creds.get("secret_key")
            new_pub = raw_creds.get("publishable_key")
            new_wh = raw_creds.get("webhook_secret")
            if new_sec:
                stripe.api_key = new_sec
                settings.STRIPE_SECRET_KEY = new_sec
            if new_pub:
                settings.STRIPE_PUBLISHABLE_KEY = new_pub
            if new_wh:
                settings.STRIPE_WEBHOOK_SECRET = new_wh

    metodo.actualizado_en = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(metodo)

    final_creds = {}
    if metodo.credenciales_json:
        try:
            final_creds = json.loads(metodo.credenciales_json)
        except Exception:
            pass

    return MetodoPagoResponse(
        id_metodo=metodo.id_metodo,
        codigo=metodo.codigo,
        nombre=metodo.nombre,
        tipo=metodo.tipo,
        descripcion=metodo.descripcion,
        icono=metodo.icono,
        activo=metodo.activo,
        requiere_credenciales=metodo.requiere_credenciales,
        credenciales_enmascaradas=enmascarar_credenciales(final_creds),
        actualizado_en=metodo.actualizado_en
    )

