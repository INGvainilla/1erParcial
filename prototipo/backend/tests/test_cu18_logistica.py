# -*- coding: utf-8 -*-
"""
Test de Integración para CU18: Gestionar Despacho y Logística de Delivery
Criterios de Aceptación:
1. Cálculo de distancia geodésica con Haversine y tarificación por Km.
2. Bloqueo estricto de transiciones ilegales con HTTP 409 Conflict.
3. Máquina de estados completa: CREADA -> PREPARACION -> LISTO_DESPACHO -> EN_TRANSITO -> ENTREGADA.
4. Asignación de conductor/courier a orden lista para despacho.
5. Endpoint de Tracking en tiempo real para visualización del cliente.
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
from app.modules.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.productos.models import Producto
from app.modules.sucursales.models import Sucursal
from app.modules.logistica.geo import calcular_distancia_haversine, calcular_tarifa_delivery
from app.modules.logistica.schemas import AsignarRepartidorRequest
from app.modules.logistica.services import (
    listar_ordenes_delivery,
    transicionar_estado_logistica,
    asignar_repartidor_a_orden,
    obtener_tracking_cliente
)
from fastapi import HTTPException

def run_tests():
    db = SessionLocal()
    try:
        print("=== INICIANDO TEST CU18: GESTIONAR DESPACHO Y LOGÍSTICA DE DELIVERY ===")

        # 1. Test Geodésico: Haversine y Tarificación
        # Coordenadas conocidas en Santa Cruz: Centro a Equipetrol (~3.5 km)
        distancia = calcular_distancia_haversine(-17.7833, -63.1821, -17.7553, -63.1979)
        assert 3.2 <= distancia <= 3.8, f"Distancia calculada fuera de rango: {distancia} km"
        tarifa_base = calcular_tarifa_delivery(2.5)
        assert tarifa_base == 15.00, f"Tarifa esperada 15.00, obtenida {tarifa_base}"
        tarifa_larga = calcular_tarifa_delivery(5.0)
        assert tarifa_larga == 20.00, f"Tarifa esperada 20.00, obtenida {tarifa_larga}"
        print(f"[OK] Cálculo Haversine verificado: {distancia} km, tarifas: Bs. {tarifa_base} (2.5km) y Bs. {tarifa_larga} (5.0km)")

        # 2. Obtener un cliente y sucursal existentes en la BD
        cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE").first()
        if not cliente:
            cliente = db.query(Usuario).first()
        assert cliente is not None, "Debe existir al menos un usuario para pruebas"

        sucursal = db.query(Sucursal).first()
        id_sucursal = sucursal.id_sucursal if sucursal else 1

        # Obtener un producto existente
        prod = db.query(Producto).first()
        assert prod is not None, "Debe existir al menos un producto"

        # 3. Crear una orden de venta de prueba con DELIVERY y PAGADA
        correlativo = f"TEST-LOGISTICA-{datetime.now().microsecond}"
        orden = OrdenVenta(
            id_usuario=cliente.id_usuario,
            id_sucursal=id_sucursal,
            numero_factura=correlativo,
            canal_venta="WEB",
            modalidad_entrega="DELIVERY",
            direccion_envio="Condominio Vista Bella Torre B, Av. Cristo Redentor",
            telefono_contacto="78901234",
            nit_factura="98765432",
            razon_social_factura=f"{cliente.nombres} {cliente.apellidos}",
            subtotal=Decimal("200.00"),
            costo_envio=Decimal("20.00"),
            total=Decimal("220.00"),
            estado_pago="PAGADO",
            estado_logistica="CREADA",
            latitud_destino=Decimal("-17.760000"),
            longitud_destino=Decimal("-63.180000"),
            distancia_km=Decimal("3.50")
        )
        db.add(orden)
        db.commit()
        db.refresh(orden)

        # Agregar detalle
        det = OrdenDetalle(
            id_orden=orden.id_orden,
            id_producto=prod.id_producto,
            talla="M",
            color="Azul",
            cantidad=1,
            precio_unitario=Decimal("200.00"),
            subtotal=Decimal("200.00")
        )
        db.add(det)
        db.commit()
        db.refresh(orden)
        print(f"[OK] Orden de delivery pagada creada: #{orden.id_orden} ({orden.numero_factura})")

        # 4. Listar órdenes de delivery en logística
        ordenes_log = listar_ordenes_delivery(db)
        ids_log = [o.id_orden for o in ordenes_log]
        assert orden.id_orden in ids_log, f"La orden #{orden.id_orden} debe figurar en el tablero de logística"
        print(f"[OK] Tablero de logística recuperó {len(ordenes_log)} órdenes delivery pagadas")

        # 5. TEST CRÍTICO: Bloqueo de salto ilegal (CREADA -> ENTREGADA) con HTTP 409
        conflicto_detectado = False
        try:
            transicionar_estado_logistica(db, orden.id_orden, "ENTREGADA")
        except HTTPException as e:
            if e.status_code == 409:
                conflicto_detectado = True
                print(f"[OK] Salto ilegal bloqueado con HTTP 409 Conflict: '{e.detail}'")
        assert conflicto_detectado is True, "El sistema debió arrojar HTTP 409 Conflict al saltar de CREADA a ENTREGADA"

        # 6. Máquina de Estados Estricta: Transición Secuencial
        # Paso A: CREADA -> PREPARACION
        res_prep = transicionar_estado_logistica(db, orden.id_orden, "PREPARACION")
        assert res_prep.estado_logistica == "PREPARACION"
        print("[OK] Paso 1: Orden en 'PREPARACION' (empaque de prendas)")

        # Paso B: PREPARACION -> LISTO_DESPACHO
        res_listo = transicionar_estado_logistica(db, orden.id_orden, "LISTO_DESPACHO")
        assert res_listo.estado_logistica == "LISTO_DESPACHO"
        print("[OK] Paso 2: Orden en 'LISTO_DESPACHO' (paquete embalado)")

        # Paso C: Asignar Courier & Avanzar a EN_TRANSITO
        req_asignar = AsignarRepartidorRequest(
            id_repartidor=None,
            nombre_repartidor="Rodrigo Delivery (Motos Ya Express)",
            telefono_repartidor="76543210"
        )
        res_transito = asignar_repartidor_a_orden(db, orden.id_orden, req_asignar)
        assert res_transito.estado_logistica == "EN_TRANSITO"
        assert res_transito.nombre_repartidor == "Rodrigo Delivery (Motos Ya Express)"
        print(f"[OK] Paso 3: Courier asignado '{res_transito.nombre_repartidor}' -> Estado 'EN_TRANSITO'")

        # Paso D: EN_TRANSITO -> ENTREGADA
        res_entregada = transicionar_estado_logistica(db, orden.id_orden, "ENTREGADA")
        assert res_entregada.estado_logistica == "ENTREGADA"
        print("[OK] Paso 4: Orden marcada como 'ENTREGADA'")

        # 7. Test de Tracking Cliente
        tracking = obtener_tracking_cliente(db, orden.id_orden)
        assert tracking.id_orden == orden.id_orden
        assert tracking.estado_logistica == "ENTREGADA"
        assert tracking.porcentaje_progreso == 100
        assert len(tracking.pasos) == 5
        assert tracking.pasos[-1].completado is True
        assert tracking.nombre_repartidor == "Rodrigo Delivery (Motos Ya Express)"
        print(f"[OK] Tracking verificado: Progreso {tracking.porcentaje_progreso}%, Repartidor: {tracking.nombre_repartidor}")

        print("\n=======================================================")
        print(">>> TODOS LOS TESTS DE CU18 LOGISTICA PASARON EXITOSAMENTE! <<<")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
