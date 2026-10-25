"""
Pruebas de propiedades matemáticas y reglas de negocio para el Costo Promedio Ponderado (CPP)
y movimientos de Kardex (CU07 / RNF / Métricas contables).
"""
import pytest
import json
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.scripts.bootstrap_tenants import bootstrap_tenants
from app.modules.p01_seguridad_acceso.tenants.models import Empresa
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, Categoria, Marca

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_tenants():
    db = SessionLocal()
    try:
        bootstrap_tenants(db)
    finally:
        db.close()


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Error login {email}: {res.text}"
    return res.json()["access_token"]


def test_cpp_secuencia_lotes_y_ponderacion():
    """Valida la progresión exacta de CPP a través de múltiples lotes entrantes."""
    token = get_token("alberto.delgado@store.bo", "Admin123*")
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    cat = db.query(Categoria).first()
    marca = db.query(Marca).first()
    sucursal = db.query(Sucursal).filter(Sucursal.id_empresa == 1, Sucursal.estado == "OPERATIVA").first()
    suc_id = sucursal.id_sucursal
    id_cat = cat.id_categoria if cat else 1
    id_marca = marca.id_marca if marca else 1
    db.close()

    # 1. Crear producto exclusivo para este test
    prod_payload = {
        "codigo_sku_base": "CPP-TEST-SEQ-001",
        "nombre": "Camisa Oxford CPP",
        "precio_base": 200.0,
        "id_categoria": id_cat,
        "id_marca": id_marca,
        "colores": [{"color_nombre": "Azul Marino", "codigo_hex": "#000080"}],
        "tallas": ["M"]
    }
    r_prod = client.post("/api/v1/productos/", json=prod_payload, headers=headers)
    assert r_prod.status_code in [200, 201], f"Error crear prod: {r_prod.text}"
    prod_id = r_prod.json()["id_producto"]

    # Lote 1: 10 unidades a Bs. 100.00 -> CPP = 100.00, Stock = 10
    lote1 = {
        "id_sucursal": suc_id,
        "id_producto": prod_id,
        "talla": "M",
        "color": "Azul Marino",
        "cantidad_recibida": 10,
        "costo_unitario_compra": 100.00,
        "numero_factura": "FACT-CPP-01"
    }
    r1 = client.post("/api/v1/inventario/entradas", json=lote1, headers=headers)
    assert r1.status_code in [200, 201], f"Error lote 1: {r1.text}"
    d1 = r1.json()
    assert d1["saldo_cantidad_resultante"] == 10
    assert float(d1["saldo_cpp_resultante"]) == 100.00

    # Lote 2: 10 unidades a Bs. 150.00 -> CPP = (10*100 + 10*150) / 20 = 2500 / 20 = 125.00
    lote2 = {
        "id_sucursal": suc_id,
        "id_producto": prod_id,
        "talla": "M",
        "color": "Azul Marino",
        "cantidad_recibida": 10,
        "costo_unitario_compra": 150.00,
        "numero_factura": "FACT-CPP-02"
    }
    r2 = client.post("/api/v1/inventario/entradas", json=lote2, headers=headers)
    assert r2.status_code in [200, 201], f"Error lote 2: {r2.text}"
    d2 = r2.json()
    assert d2["saldo_cantidad_resultante"] == 20
    assert float(d2["saldo_cpp_resultante"]) == 125.00

    # Lote 3: 5 unidades a Bs. 200.00 -> CPP = (20*125 + 5*200) / 25 = 3500 / 25 = 140.00
    lote3 = {
        "id_sucursal": suc_id,
        "id_producto": prod_id,
        "talla": "M",
        "color": "Azul Marino",
        "cantidad_recibida": 5,
        "costo_unitario_compra": 200.00,
        "numero_factura": "FACT-CPP-03"
    }
    r3 = client.post("/api/v1/inventario/entradas", json=lote3, headers=headers)
    assert r3.status_code in [200, 201], f"Error lote 3: {r3.text}"
    d3 = r3.json()
    assert d3["saldo_cantidad_resultante"] == 25
    assert float(d3["saldo_cpp_resultante"]) == 140.00

    # Verificar kardex histórico de movimientos
    r_kardex = client.get(f"/api/v1/inventario/kardex?id_inventario={d1['id_inventario']}", headers=headers)
    assert r_kardex.status_code == 200
    k_movs = r_kardex.json()
    assert len(k_movs) == 3
    # Comprobar orden cronológico descendente y consistencia
    assert float(k_movs[0]["saldo_cpp_resultante"]) == 140.0
    assert float(k_movs[1]["saldo_cpp_resultante"]) == 125.0
    assert float(k_movs[2]["saldo_cpp_resultante"]) == 100.0


def test_cpp_redondeo_half_up():
    """Valida que el redondeo contable sea estrictamente ROUND_HALF_UP a dos decimales."""
    token = get_token("alberto.delgado@store.bo", "Admin123*")
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    cat = db.query(Categoria).first()
    marca = db.query(Marca).first()
    sucursal = db.query(Sucursal).filter(Sucursal.id_empresa == 1, Sucursal.estado == "OPERATIVA").first()
    suc_id = sucursal.id_sucursal
    id_cat = cat.id_categoria if cat else 1
    id_marca = marca.id_marca if marca else 1
    db.close()

    prod_payload = {
        "codigo_sku_base": "CPP-TEST-ROUND-002",
        "nombre": "Pantalón Chino Rounding",
        "precio_base": 180.0,
        "id_categoria": id_cat,
        "id_marca": id_marca,
        "colores": [{"color_nombre": "Beige", "codigo_hex": "#F5F5DC"}],
        "tallas": ["32"]
    }
    r_prod = client.post("/api/v1/productos/", json=prod_payload, headers=headers)
    assert r_prod.status_code in [200, 201], f"Error crear prod: {r_prod.text}"
    prod_id = r_prod.json()["id_producto"]

    # Base: 10 unidades a 10.00 = 100.00
    r_base = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "32", "color": "Beige",
        "cantidad_recibida": 10, "costo_unitario_compra": 10.00
    }, headers=headers)
    assert r_base.status_code in [200, 201]

    # 1 unidad a 10.06 -> Total: 110.06 / 11 = 10.005454... Con ROUND_HALF_UP redondea a 10.01
    r_up = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "32", "color": "Beige",
        "cantidad_recibida": 1, "costo_unitario_compra": 10.06
    }, headers=headers)
    assert r_up.status_code in [200, 201]
    assert float(r_up.json()["saldo_cpp_resultante"]) == 10.01


def test_entrada_costo_o_cantidad_invalida_rechazada():
    """Valida rechazo con HTTP 400 o 422 para costos <= 0 o cantidades <= 0."""
    token = get_token("alberto.delgado@store.bo", "Admin123*")
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    sucursal = db.query(Sucursal).filter(Sucursal.id_empresa == 1, Sucursal.estado == "OPERATIVA").first()
    prod = db.query(Producto).filter(Producto.id_empresa == 1).first()
    suc_id = sucursal.id_sucursal
    prod_id = prod.id_producto
    db.close()

    # Costo 0.00
    r_costo_cero = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "M", "color": "Azul",
        "cantidad_recibida": 5, "costo_unitario_compra": 0.00
    }, headers=headers)
    assert r_costo_cero.status_code in [400, 422]

    # Costo negativo
    r_costo_neg = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "M", "color": "Azul",
        "cantidad_recibida": 5, "costo_unitario_compra": -15.50
    }, headers=headers)
    assert r_costo_neg.status_code in [400, 422]

    # Cantidad 0
    r_cant_cero = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "M", "color": "Azul",
        "cantidad_recibida": 0, "costo_unitario_compra": 50.00
    }, headers=headers)
    assert r_cant_cero.status_code in [400, 422]

    # Cantidad negativa
    r_cant_neg = client.post("/api/v1/inventario/entradas", json={
        "id_sucursal": suc_id, "id_producto": prod_id, "talla": "M", "color": "Azul",
        "cantidad_recibida": -10, "costo_unitario_compra": 50.00
    }, headers=headers)
    assert r_cant_neg.status_code in [400, 422]
