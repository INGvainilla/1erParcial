# -*- coding: utf-8 -*-
"""
Tests automatizados para CU14 (Traspasos Inter-Sucursales) y CU20 (Aprovisionamiento Exclusivo Web Desktop).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto

client = TestClient(app)


@pytest.fixture(scope="module")
def admin_headers():
    db = SessionLocal()
    admin = db.query(Usuario).filter(Usuario.id_empresa == 1, Usuario.rol.in_(["ADMIN_EMPRESA", "ADMINISTRADOR"]), Usuario.estado_cuenta == "ACTIVO").first()
    if not admin:
        admin = db.query(Usuario).filter(Usuario.rol.in_(["ADMIN_EMPRESA", "ADMINISTRADOR"]), Usuario.estado_cuenta == "ACTIVO").first()
    if not admin:
        admin = db.query(Usuario).filter(Usuario.estado_cuenta == "ACTIVO").first()
    assert admin is not None
    token = create_access_token({"sub": str(admin.id_usuario), "tenant_id": admin.id_empresa or 1, "rol": "ADMINISTRADOR"})
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def sucursales_setup():
    db = SessionLocal()
    sucursales = db.query(Sucursal).filter(Sucursal.estado == "OPERATIVA").all()
    if len(sucursales) < 2:
        # Create secondary branch if needed
        s2 = Sucursal(
            id_empresa=1,
            nombre_sucursal="Sucursal Sur San Miguel",
            codigo_sucursal="SUC-SUR-02",
            direccion="Calle 21 de Calacoto",
            telefono="2789123",
            id_ciudad=1,
            estado="OPERATIVA",
            capacidad_probadores=3
        )
        db.add(s2)
        db.commit()
        db.refresh(s2)
        sucursales = db.query(Sucursal).all()
    s_orig = sucursales[0]
    s_dest = sucursales[1]

    # Asegurar producto e inventario en origen
    inv = db.query(Inventario).filter(Inventario.id_sucursal == s_orig.id_sucursal, Inventario.stock_disponible >= 5).first()
    if not inv:
        prod = db.query(Producto).first()
        inv = Inventario(
            id_empresa=1,
            id_sucursal=s_orig.id_sucursal,
            id_producto=prod.id_producto if prod else 1,
            talla="M",
            color="Negro",
            stock_fisico=20,
            stock_disponible=20,
            stock_reservado=0,
            stock_minimo=2,
            costo_promedio_ponderado=45.0
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)

    db.close()
    return s_orig.id_sucursal, s_dest.id_sucursal, inv.id_producto, inv.talla


def test_cu14_ciclo_traspaso_inter_sucursal(admin_headers, sucursales_setup):
    """CU14: Iniciar traspaso, verificar estado EN_TRANSITO y recepción en destino"""
    s_orig, s_dest, id_prod, talla = sucursales_setup

    payload_traspaso = {
        "id_sucursal_origen": s_orig,
        "id_sucursal_destino": s_dest,
        "items": [
            {
                "id_producto": id_prod,
                "talla": talla,
                "color": "Negro",
                "cantidad": 2
            }
        ],
        "observaciones": "Reabastecimiento de urgencia para temporada alta"
    }

    # 1. Crear traspaso
    resp = client.post("/api/v1/traspasos", json=payload_traspaso, headers=admin_headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["estado"] == "EN_TRANSITO"
    id_traspaso = data["id_traspaso"]

    # 2. Confirmar recepción en destino
    resp_rx = client.post(f"/api/v1/traspasos/{id_traspaso}/recibir", headers=admin_headers)
    assert resp_rx.status_code == 200, resp_rx.text
    data_rx = resp_rx.json()
    assert data_rx["status"] == "RECIBIDO"

    # 3. Listar traspasos
    resp_list = client.get("/api/v1/traspasos", headers=admin_headers)
    assert resp_list.status_code == 200
    traspasos = resp_list.json()
    assert any(t["id_traspaso"] == id_traspaso for t in traspasos)


def test_cu20_bloqueo_movil_aprovisionamiento(admin_headers):
    """CU20: Rechazar intento de aprovisionamiento si el User-Agent es móvil o pantalla < 768px"""
    payload_compra = {
        "id_proveedor": 1,
        "id_sucursal_destino": 1,
        "items": [
            {
                "id_producto": 1,
                "talla": "M",
                "color": "Azul",
                "cantidad": 50,
                "costo_unitario": 35.0
            }
        ]
    }

    # Caso A: User-Agent Móvil (Android)
    headers_mobile = {
        **admin_headers,
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
    }
    resp_mobile = client.post("/api/v1/compras", json=payload_compra, headers=headers_mobile)
    assert resp_mobile.status_code == 403
    assert "Acceso Restringido (CU20)" in resp_mobile.json()["detail"]

    # Caso B: Viewport móvil (< 768px)
    headers_small_screen = {
        **admin_headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "X-Viewport-Width": "480"
    }
    resp_screen = client.post("/api/v1/compras", json=payload_compra, headers=headers_small_screen)
    assert resp_screen.status_code == 403
    assert "768px" in resp_screen.json()["detail"]


def test_cu20_emision_exitosa_desktop(admin_headers):
    """CU20: Emitir orden de compra exitosamente desde navegador Desktop (>= 768px)"""
    payload_compra = {
        "id_proveedor": 1,
        "id_sucursal_destino": 1,
        "items": [
            {
                "id_producto": 1,
                "talla": "M",
                "color": "Blanco",
                "cantidad": 30,
                "costo_unitario": 40.0
            }
        ]
    }

    headers_desktop = {
        **admin_headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-Viewport-Width": "1440"
    }

    resp = client.post("/api/v1/compras", json=payload_compra, headers=headers_desktop)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["estado"] == "EMITIDA"
    assert data["monto_total"] == 1200.0

    # Listar órdenes desde Desktop
    resp_list = client.get("/api/v1/compras", headers=headers_desktop)
    assert resp_list.status_code == 200
    assert len(resp_list.json()) > 0


def test_cu20_rechazo_rol_no_autorizado():
    """CU20: Bloquear usuario con rol no autorizado (ej. CLIENTE) con HTTP 403"""
    db = SessionLocal()
    cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE", Usuario.estado_cuenta == "ACTIVO").first()
    if not cliente:
        cliente = Usuario(
            id_empresa=1,
            nombres="Cliente",
            apellidos="Prueba",
            email="cliente_test_cu20@fashionstore.test",
            password_hash="fakehash",
            rol="CLIENTE",
            estado_cuenta="ACTIVO"
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
    user_id = cliente.id_usuario
    tenant_id = cliente.id_empresa or 1
    db.close()

    token_cliente = create_access_token({"sub": str(user_id), "tenant_id": tenant_id, "rol": "CLIENTE"})
    headers = {
        "Authorization": f"Bearer {token_cliente}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "X-Viewport-Width": "1280"
    }
    resp = client.get("/api/v1/compras", headers=headers)
    assert resp.status_code == 403
    assert "Acceso Restringido (CU20)" in resp.json()["detail"]


def test_cu20_ciclo_completo_autorizar_y_recepcionar(admin_headers):
    """CU20: Flujo end-to-end de Compra: Emitir -> Autorizar (deduciendo presupuesto) -> Recepcionar (ingreso a Kardex y recálculo CPP)"""
    db = SessionLocal()
    admin = db.query(Usuario).filter(Usuario.id_empresa == 1, Usuario.rol.in_(["ADMIN_EMPRESA", "ADMINISTRADOR"]), Usuario.estado_cuenta == "ACTIVO").first()
    empresa_id = admin.id_empresa if admin else 1
    sucursal = db.query(Sucursal).filter(Sucursal.id_empresa == empresa_id, Sucursal.estado == "OPERATIVA").first() or db.query(Sucursal).filter(Sucursal.id_empresa == empresa_id).first()
    id_sucursal = sucursal.id_sucursal if sucursal else 55
    prod = db.query(Producto).filter(Producto.id_empresa == empresa_id).first() or db.query(Producto).first()
    id_prod = prod.id_producto if prod else 64
    db.close()

    headers_desktop = {
        **admin_headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-Viewport-Width": "1440"
    }

    # 1. Emitir Orden
    payload = {
        "id_proveedor": 1,
        "id_sucursal_destino": id_sucursal,
        "items": [
            {
                "id_producto": id_prod,
                "talla": "XL",
                "color": "Blanco",
                "cantidad": 10,
                "costo_unitario": 50.0
            }
        ]
    }
    resp_emision = client.post("/api/v1/compras", json=payload, headers=headers_desktop)
    assert resp_emision.status_code == 200, resp_emision.text
    id_orden = resp_emision.json()["id_orden_compra"]
    assert resp_emision.json()["estado"] == "EMITIDA"

    # 2. Autorizar Orden
    resp_aut = client.post(f"/api/v1/compras/{id_orden}/autorizar", headers=headers_desktop)
    assert resp_aut.status_code == 200, resp_aut.text
    assert resp_aut.json()["estado"] == "AUTORIZADA"

    # 3. Recepcionar Orden
    payload_recepcion = {
        "nro_factura": "FAC-TEST-77890"
    }
    resp_rx = client.post(f"/api/v1/compras/{id_orden}/recepcionar", json=payload_recepcion, headers=headers_desktop)
    assert resp_rx.status_code == 200, resp_rx.text
    data_rx = resp_rx.json()
    assert data_rx["estado"] == "RECEPCIONADA_CONFORME"
    assert len(data_rx["items_ingresados_kardex"]) == 1
    assert data_rx["items_ingresados_kardex"][0]["cantidad_ingresada"] == 10

    # 4. Verificar estado final en listado
    resp_list = client.get("/api/v1/compras", headers=headers_desktop)
    assert resp_list.status_code == 200
    orden_encontrada = next((o for o in resp_list.json() if o["id_orden_compra"] == id_orden), None)
    assert orden_encontrada is not None
    assert orden_encontrada["estado"] == "RECEPCIONADA_CONFORME"
    assert orden_encontrada["nro_factura"] == "FAC-TEST-77890"

