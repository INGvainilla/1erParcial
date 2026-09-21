# -*- coding: utf-8 -*-
"""
Suite de Pruebas Automatizadas para CU25: Gestionar Devolución y Cambio de Prendas
Valida:
- Verificación de vigencia de ticket (<= 14 días calendario)
- Bloqueo de tickets vencidos (> 14 días)
- Inspección física (Apto para la venta vs Defectuoso / Merma)
- Reingreso inmutable al Kardex al Costo Promedio Ponderado (CPP) histórico
- Matriz de compensación: Cambio de variante (+5% factor talla L), Vale de crédito y Reembolso
"""
import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import HTTPException

import app.main
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.p08_punto_venta_pos.pos.models import Devolucion, DevolucionDetalle
from app.modules.p08_punto_venta_pos.pos.schemas import (
    DevolucionCreate, DevolucionItemInput, CambioVarianteInput
)
from app.modules.p08_punto_venta_pos.pos.services import (
    consultar_ticket_para_devolucion,
    procesar_devolucion_pos
)


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def cajero_usuario(db):
    cajero = db.query(Usuario).filter(Usuario.email == "alberto.delgado@store.bo").first()
    if not cajero:
        cajero = db.query(Usuario).first()
    return cajero


@pytest.fixture
def sucursal_activa(db):
    suc = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").first()
    return suc


def test_cu25_consultar_ticket_dentro_de_plazo(db):
    """CU25: Valida que un ticket emitido hace 5 días sea marcado como apto para devolución"""
    res = consultar_ticket_para_devolucion(db, "POS-2026-0042")
    assert res.numero_factura == "POS-2026-0042"
    assert res.es_valido_14_dias is True
    assert res.dias_transcurridos <= 14
    assert "Dentro de plazo" in res.mensaje_plazo
    assert len(res.items) >= 1
    assert res.items[0].costo_historico_cpp > 0


def test_cu25_consultar_ticket_fuera_de_plazo(db, cajero_usuario, sucursal_activa):
    """CU25: Valida que un ticket con más de 14 días sea detectado como vencido"""
    # Crear orden vencida (hace 22 días)
    nro_vencido = f"POS-VENCIDO-{int(utc_now().timestamp())}"
    orden_vencida = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_vencido,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="0",
        razon_social_factura="Cliente Vencido",
        subtotal=Decimal("180.00"),
        total=Decimal("180.00"),
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=22)
    )
    db.add(orden_vencida)
    db.commit()

    res = consultar_ticket_para_devolucion(db, nro_vencido)
    assert res.es_valido_14_dias is False
    assert res.dias_transcurridos >= 20
    assert "Plazo de devolución vencido" in res.mensaje_plazo


def test_cu25_procesar_cambio_variante_factor_talla(db, cajero_usuario, sucursal_activa):
    """
    CU25: Procesa un cambio de talla M por talla L aplicando el factor +5%
    Verifica:
    - Reingreso de prenda original al stock disponible (APTO_VENTA).
    - Asiento inmutable al Kardex al CPP histórico (DEVOLUCION_VENTA).
    - Descuento de stock de la nueva talla L y cobro de la diferencia (+5%).
    """
    prod = db.query(Producto).filter(Producto.nombre.ilike("%Oxford%")).first()
    if not prod:
        prod = db.query(Producto).first()

    inv_m = db.query(Inventario).filter(
        Inventario.id_sucursal == sucursal_activa.id_sucursal,
        Inventario.id_producto == prod.id_producto,
        Inventario.talla == "M"
    ).first()

    inv_l = db.query(Inventario).filter(
        Inventario.id_sucursal == sucursal_activa.id_sucursal,
        Inventario.id_producto == prod.id_producto,
        Inventario.talla == "L"
    ).first()

    # Asegurar stock
    if not inv_l or inv_l.stock_disponible < 5:
        if inv_l:
            inv_l.stock_disponible += 5
            inv_l.stock_fisico += 5
            db.commit()

    stock_ant_m = inv_m.stock_disponible if inv_m else 10
    stock_ant_l = inv_l.stock_disponible if inv_l else 10

    precio_base = Decimal(str(prod.precio_base))

    # Crear orden reciente para devolver
    nro_ticket = f"POS-CAMBIO-{int(utc_now().timestamp())}"
    orden = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_ticket,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="123456",
        razon_social_factura="Carlos Mendoza",
        subtotal=precio_base,
        total=precio_base,
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=3)
    )
    db.add(orden)
    db.flush()

    det = OrdenDetalle(
        id_orden=orden.id_orden,
        id_producto=prod.id_producto,
        talla="M",
        color="Azul Marino",
        cantidad=1,
        precio_unitario=precio_base,
        subtotal=precio_base
    )
    db.add(det)
    db.commit()

    payload = DevolucionCreate(
        nro_ticket_original=nro_ticket,
        motivo="Cambio por talla L",
        tipo_resolucion="CAMBIO_VARIANTE",
        items=[
            DevolucionItemInput(
                id_producto=prod.id_producto,
                talla="M",
                color="Azul Marino",
                cantidad=1,
                estado_fisico="APTO_VENTA"
            )
        ],
        cambio_info=CambioVarianteInput(
            nuevo_producto_id=prod.id_producto,
            nueva_talla="L",
            nuevo_color="Blanco Óptico" if inv_l and inv_l.color else "Azul Marino",
            nueva_cantidad=1
        )
    )

    ticket_dev = procesar_devolucion_pos(
        db=db,
        id_cajero=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        cajero_nombre="Alberto Delgado",
        dev_in=payload
    )

    assert ticket_dev.nro_devolucion.startswith("DEV-")
    assert ticket_dev.tipo_resolucion == "CAMBIO_VARIANTE"
    assert ticket_dev.total_devuelto == float(precio_base)
    # Diferencia por factor de talla L (+5%)
    dif_esperada = round(float(precio_base * Decimal("0.05")), 2)
    assert ticket_dev.diferencia_cobrada == dif_esperada
    assert ticket_dev.item_nuevo_entregado["factor_talla"] == 1.05

    # Validar asiento en Kardex de reingreso al CPP
    kardex_reingreso = db.query(KardexMovimiento).filter(
        KardexMovimiento.referencia_documento.ilike(f"%{ticket_dev.nro_devolucion}%"),
        KardexMovimiento.tipo_movimiento == "DEVOLUCION_VENTA"
    ).first()
    assert kardex_reingreso is not None
    assert kardex_reingreso.cantidad == 1


def test_cu25_procesar_devolucion_vale_credito(db, cajero_usuario, sucursal_activa):
    """CU25: Valida la emisión de vale de crédito digital por devolución"""
    prod = db.query(Producto).first()
    nro_ticket = f"POS-VALE-{int(utc_now().timestamp())}"
    orden = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_ticket,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="0",
        razon_social_factura="Cliente Vale",
        subtotal=Decimal("150.00"),
        total=Decimal("150.00"),
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=2)
    )
    db.add(orden)
    db.flush()

    det = OrdenDetalle(
        id_orden=orden.id_orden,
        id_producto=prod.id_producto,
        talla="M",
        color="Negro",
        cantidad=1,
        precio_unitario=Decimal("150.00"),
        subtotal=Decimal("150.00")
    )
    db.add(det)
    db.commit()

    payload = DevolucionCreate(
        nro_ticket_original=nro_ticket,
        motivo="Preferencia del cliente",
        tipo_resolucion="VALE_CREDITO",
        items=[
            DevolucionItemInput(
                id_producto=prod.id_producto,
                talla="M",
                color="Negro",
                cantidad=1,
                estado_fisico="APTO_VENTA"
            )
        ]
    )

    ticket_dev = procesar_devolucion_pos(
        db=db,
        id_cajero=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        cajero_nombre="Alberto Delgado",
        dev_in=payload
    )

    assert ticket_dev.tipo_resolucion == "VALE_CREDITO"
    assert ticket_dev.codigo_vale is not None
    assert ticket_dev.codigo_vale.startswith("VALE-FS-")
    assert ticket_dev.total_devuelto == 150.0
    assert ticket_dev.diferencia_cobrada == 0.0


def test_cu25_bloqueo_devolucion_ticket_vencido(db, cajero_usuario, sucursal_activa):
    """CU25: Valida que el backend rechace con HTTP 400 una devolución de ticket vencido"""
    prod = db.query(Producto).first()
    nro_vencido = f"POS-VENCIDO2-{int(utc_now().timestamp())}"
    orden = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_vencido,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="0",
        razon_social_factura="Cliente Vencido",
        subtotal=Decimal("100.00"),
        total=Decimal("100.00"),
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=30)
    )
    db.add(orden)
    db.flush()

    det = OrdenDetalle(
        id_orden=orden.id_orden,
        id_producto=prod.id_producto,
        talla="M",
        color="Azul",
        cantidad=1,
        precio_unitario=Decimal("100.00"),
        subtotal=Decimal("100.00")
    )
    db.add(det)
    db.commit()

    payload = DevolucionCreate(
        nro_ticket_original=nro_vencido,
        motivo="Intento fuera de plazo",
        tipo_resolucion="REEMBOLSO_EFECTIVO",
        items=[
            DevolucionItemInput(
                id_producto=prod.id_producto,
                talla="M",
                color="Azul",
                cantidad=1,
                estado_fisico="APTO_VENTA"
            )
        ]
    )

    with pytest.raises(HTTPException) as exc_info:
        procesar_devolucion_pos(
            db=db,
            id_cajero=cajero_usuario.id_usuario,
            id_sucursal=sucursal_activa.id_sucursal,
            cajero_nombre="Alberto Delgado",
            dev_in=payload
        )

    assert exc_info.value.status_code == 400
    assert "Plazo de devolución vencido" in exc_info.value.detail


def test_cu25_reembolso_efectivo_reingreso_inventario(db, cajero_usuario, sucursal_activa):
    """
    CU25: Valida que en un REEMBOLSO_EFECTIVO de prenda APTO_VENTA:
    1. Se reintegre el dinero (total_devuelto == precio de compra, diferencia_cobrada == 0)
    2. La prenda vuelva al inventario incrementando tanto stock_fisico como stock_disponible
    3. Se asiente en Kardex el reingreso DEVOLUCION_VENTA al CPP histórico inmutable
    """
    prod = db.query(Producto).first()
    talla_test = "S"
    color_test = "Blanco Puro"
    nro_ticket = f"POS-REEMB-{int(utc_now().timestamp())}"

    # Obtener inventario antes de la devolución
    inv = db.query(Inventario).filter(
        Inventario.id_sucursal == sucursal_activa.id_sucursal,
        Inventario.id_producto == prod.id_producto,
        Inventario.talla == talla_test,
        Inventario.color == color_test
    ).first()

    if not inv:
        inv = Inventario(
            id_sucursal=sucursal_activa.id_sucursal,
            id_producto=prod.id_producto,
            talla=talla_test,
            color=color_test,
            stock_fisico=10,
            stock_reservado=0,
            stock_disponible=10,
            stock_minimo=3,
            ultimo_costo_compra=Decimal("110.00"),
            costo_promedio_ponderado=Decimal("110.00")
        )
        db.add(inv)
        db.commit()

    stock_fisico_antes = inv.stock_fisico
    stock_disponible_antes = inv.stock_disponible

    # Crear la venta previa válida (dentro de los 14 días)
    orden = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_ticket,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="4499112",
        razon_social_factura="Juan Reembolso",
        subtotal=Decimal("250.00"),
        total=Decimal("250.00"),
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=1)
    )
    db.add(orden)
    db.flush()

    det = OrdenDetalle(
        id_orden=orden.id_orden,
        id_producto=prod.id_producto,
        talla=talla_test,
        color=color_test,
        cantidad=1,
        precio_unitario=Decimal("250.00"),
        subtotal=Decimal("250.00")
    )
    db.add(det)
    db.commit()

    # Cajero procesa devolución con REEMBOLSO_EFECTIVO
    payload = DevolucionCreate(
        nro_ticket_original=nro_ticket,
        motivo="Cliente desistió de la compra, solicita dinero en efectivo",
        tipo_resolucion="REEMBOLSO_EFECTIVO",
        items=[
            DevolucionItemInput(
                id_producto=prod.id_producto,
                talla=talla_test,
                color=color_test,
                cantidad=1,
                estado_fisico="APTO_VENTA"
            )
        ]
    )

    ticket_resp = procesar_devolucion_pos(
        db=db,
        id_cajero=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        cajero_nombre="Alberto Delgado",
        dev_in=payload
    )

    # 1. Comprobante de reembolso en efectivo
    assert ticket_resp.tipo_resolucion == "REEMBOLSO_EFECTIVO"
    assert ticket_resp.total_devuelto == 250.00
    assert ticket_resp.diferencia_cobrada == 0.00
    assert ticket_resp.nro_devolucion.startswith("DEV-")

    # 2. Verificar que la prenda volvió al inventario
    db.refresh(inv)
    assert inv.stock_fisico == stock_fisico_antes + 1
    assert inv.stock_disponible == stock_disponible_antes + 1

    # 3. Asiento Kardex inmutable
    kardex_reingreso = db.query(KardexMovimiento).filter(
        KardexMovimiento.referencia_documento.ilike(f"%{ticket_resp.nro_devolucion}%"),
        KardexMovimiento.tipo_movimiento == "DEVOLUCION_VENTA"
    ).first()
    assert kardex_reingreso is not None
    assert kardex_reingreso.cantidad == 1
    assert kardex_reingreso.costo_unitario_movimiento == inv.costo_promedio_ponderado


def test_cu25_reembolso_merma_no_disponible_para_venta(db, cajero_usuario, sucursal_activa):
    """
    CU25: Valida que si la prenda está DEFECTUOSA / MERMA:
    - Incrementa el stock_fisico para auditoría de almacén
    - NO incrementa el stock_disponible (protección contra ventas de ropa rota/con fallas)
    """
    prod = db.query(Producto).first()
    talla_test = "L"
    color_test = "Azul Noche"
    nro_ticket = f"POS-MERMA-{int(utc_now().timestamp())}"

    inv = db.query(Inventario).filter(
        Inventario.id_sucursal == sucursal_activa.id_sucursal,
        Inventario.id_producto == prod.id_producto,
        Inventario.talla == talla_test,
        Inventario.color == color_test
    ).first()

    if not inv:
        inv = Inventario(
            id_sucursal=sucursal_activa.id_sucursal,
            id_producto=prod.id_producto,
            talla=talla_test,
            color=color_test,
            stock_fisico=5,
            stock_reservado=0,
            stock_disponible=5,
            stock_minimo=2,
            ultimo_costo_compra=Decimal("95.00"),
            costo_promedio_ponderado=Decimal("95.00")
        )
        db.add(inv)
        db.commit()

    stock_fisico_antes = inv.stock_fisico
    stock_disponible_antes = inv.stock_disponible

    orden = OrdenVenta(
        id_usuario=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        numero_factura=nro_ticket,
        canal_venta="POS",
        modalidad_entrega="COMPRA_FISICA",
        nit_factura="0",
        razon_social_factura="Cliente Falla Confeccion",
        subtotal=Decimal("190.00"),
        total=Decimal("190.00"),
        estado_pago="PAGADO",
        estado_logistica="ENTREGADA",
        creado_en=utc_now() - timedelta(days=3)
    )
    db.add(orden)
    db.flush()

    det = OrdenDetalle(
        id_orden=orden.id_orden,
        id_producto=prod.id_producto,
        talla=talla_test,
        color=color_test,
        cantidad=1,
        precio_unitario=Decimal("190.00"),
        subtotal=Decimal("190.00")
    )
    db.add(det)
    db.commit()

    payload = DevolucionCreate(
        nro_ticket_original=nro_ticket,
        motivo="Costura descosida de fábrica (Merma)",
        tipo_resolucion="REEMBOLSO_EFECTIVO",
        items=[
            DevolucionItemInput(
                id_producto=prod.id_producto,
                talla=talla_test,
                color=color_test,
                cantidad=1,
                estado_fisico="DEFECTUOSO_MERMA"
            )
        ]
    )

    ticket_resp = procesar_devolucion_pos(
        db=db,
        id_cajero=cajero_usuario.id_usuario,
        id_sucursal=sucursal_activa.id_sucursal,
        cajero_nombre="Alberto Delgado",
        dev_in=payload
    )

    # 1. Total devuelto
    assert ticket_resp.total_devuelto == 190.00

    # 2. Stock físico sube para inventario de merma
    db.refresh(inv)
    assert inv.stock_fisico == stock_fisico_antes + 1

    # 3. Stock disponible NO debe subir porque la prenda está rota
    assert inv.stock_disponible == stock_disponible_antes

