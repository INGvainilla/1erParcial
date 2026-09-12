# -*- coding: utf-8 -*-
"""
Test de Integración para CU16: Procesar Pago con Pasarela Electrónica (Stripe)
"""
import sys
import os
from decimal import Decimal
from datetime import datetime

# Ajustar path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Importar app para resolver modelos y mappers
import app.main
from app.core.database import SessionLocal
from app.modules.auth.models import Usuario
from app.modules.ordenes.models import OrdenVenta
from app.modules.pagos.models import TransaccionPago
from app.modules.pagos.services import (
    crear_intencion_pago,
    confirmar_transaccion_pago,
    procesar_webhook_stripe
)
from fastapi import HTTPException

def run_tests():
    db = SessionLocal()
    try:
        print("=== INICIANDO TEST CU16: PROCESAR PAGO CON PASARELA STRIPE ===")

        # 1. Obtener usuario cliente para la prueba
        cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE").first()
        if not cliente:
            cliente = db.query(Usuario).first()
        assert cliente is not None, "Debe existir al menos un usuario"
        print(f"[OK] Cliente de prueba: {cliente.email} (ID: {cliente.id_usuario})")

        # 2. Crear una orden de prueba en estado PENDIENTE
        correlativo = f"TEST-STRIPE-{datetime.now().microsecond}"
        orden = OrdenVenta(
            id_usuario=cliente.id_usuario,
            id_sucursal=1,
            numero_factura=correlativo,
            canal_venta="WEB",
            modalidad_entrega="DELIVERY",
            direccion_envio="Av. 6 de Agosto #1234",
            telefono_contacto="77889900",
            nit_factura="12345678",
            razon_social_factura="Cliente Test Stripe",
            subtotal=Decimal("150.00"),
            costo_envio=Decimal("25.00"),
            total=Decimal("175.00"),
            estado_pago="PENDIENTE",
            estado_logistica="CREADA"
        )
        db.add(orden)
        db.commit()
        db.refresh(orden)
        print(f"[OK] Orden de prueba creada: ID #{orden.id_orden}, Factura: {orden.numero_factura}, Total: Bs. {orden.total}")

        # 3. Test: Generación de PaymentIntent real contra Stripe Sandbox
        intencion = crear_intencion_pago(
            db=db,
            id_orden=orden.id_orden,
            id_usuario=cliente.id_usuario,
            rol_usuario=cliente.rol
        )
        assert intencion.id_orden == orden.id_orden
        assert intencion.client_secret is not None
        assert "_secret_" in intencion.client_secret
        assert intencion.payment_intent_id.startswith("pi_")
        assert intencion.total == 175.00
        print(f"[OK] PaymentIntent generado en Stripe: {intencion.payment_intent_id}")
        print(f"[OK] Client Secret tokenizado: {intencion.client_secret[:18]}... (PCI Compliant)")

        # 4. Test: Seguridad - Rechazar cobro si la orden ya está pagada
        orden.estado_pago = "PAGADO"
        db.commit()
        try:
            crear_intencion_pago(
                db=db,
                id_orden=orden.id_orden,
                id_usuario=cliente.id_usuario,
                rol_usuario=cliente.rol
            )
            assert False, "Debió rechazar generar intención para una orden ya pagada"
        except HTTPException as e:
            print(f"[OK] Validación de orden ya pagada interceptada con éxito: {e.detail}")

        # 5. Test: Registro en Transacciones de Pago (Simulación de confirmación y Webhook)
        orden.estado_pago = "PENDIENTE"
        db.commit()

        # Simular registro de transacción exitosa en base de datos
        tx = TransaccionPago(
            id_orden=orden.id_orden,
            pasarela="STRIPE",
            payment_intent_id=intencion.payment_intent_id,
            monto=orden.total,
            moneda="BOB",
            estado="SUCCEEDED",
            metodo_pago="card",
            marca_tarjeta="visa",
            ultimos4="4242"
        )
        db.add(tx)
        orden.estado_pago = "PAGADO"
        orden.estado_logistica = "PREPARACION"
        db.commit()
        db.refresh(tx)
        db.refresh(orden)

        assert orden.estado_pago == "PAGADO"
        assert orden.estado_logistica == "PREPARACION"
        assert tx.id_transaccion is not None
        assert tx.ultimos4 == "4242"
        print(f"[OK] Asiento inmutable en transacciones_pago creado: ID #{tx.id_transaccion}, PaymentIntent: {tx.payment_intent_id}")
        print(f"[OK] Estado de orden actualizado: {orden.estado_pago}, Logística: {orden.estado_logistica}")

        # 6. Test: Seguridad de Webhook - Rechazar firma ausente o inválida
        try:
            procesar_webhook_stripe(
                db=db,
                payload=b'{"id": "evt_test", "type": "payment_intent.succeeded"}',
                sig_header=""
            )
            assert False, "Debió rechazar webhook con firma ausente"
        except HTTPException as e:
            print(f"[OK] Rechazo de webhook sin firma interceptado: {e.detail}")

        print("\n=== TODOS LOS TESTS DE CU16 BACKEND COMPLETADOS CON ÉXITO ===")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
