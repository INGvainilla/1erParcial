# -*- coding: utf-8 -*-
"""
Tests automatizados para Modo Offline y Sincronización Idempotente con UUID v4 (CU08, CU11, CU12).
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_token():
    resp = client.post("/api/v1/auth/login", json={
        "email": "superadmin@fashionstore.bo",
        "password": "SuperAdmin123*"
    })
    if resp.status_code != 200:
        resp = client.post("/api/v1/auth/login", json={
            "email": "alberto.delgado@store.bo",
            "password": "Admin123*"
        })
    assert resp.status_code == 200, f"Login error: {resp.text}"
    return resp.json()["access_token"]


def test_cu08_descargar_catalogo_offline():
    """CU08: Verificar descarga de catálogo para caché local IndexedDB/SQLite"""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/sync/catalogo-offline?id_sucursal=1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "prendas" in data
    assert "version_offline" in data
    assert isinstance(data["prendas"], list)
    if data["prendas"]:
        item = data["prendas"][0]
        assert "sku" in item
        assert "tallas_variantes" in item


def test_cu12_sincronizacion_idempotente_uuid():
    """CU12: Validar recepción de transacción offline y respuesta idempotente sin duplicar"""
    token = get_auth_token()
    test_uuid = str(uuid.uuid4())
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Idempotency-Key": test_uuid
    }
    payload = {
        "uuid_operacion": test_uuid,
        "tipo_operacion": "VENTA_POS",
        "id_sucursal": 1,
        "payload": {
            "cliente": "Consumidor Final Offline",
            "monto_total": 150.00,
            "metodo_pago": "EFECTIVO",
            "items": []
        },
        "fecha_local": "2026-10-31T20:30:00"
    }

    # 1. Primer envío
    res1 = client.post("/api/v1/sync/operacion", json=payload, headers=headers)
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["status"] == "CONFIRMADA"
    assert d1["uuid_operacion"] == test_uuid

    # 2. Segundo envío (Mismo UUID -> Idempotente)
    res2 = client.post("/api/v1/sync/operacion", json=payload, headers=headers)
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["status"] == "CONFIRMADA"
    assert d2["uuid_operacion"] == test_uuid
    assert "Idempotente" in d2["mensaje"]


def test_cu11_consultar_operaciones_locales():
    """CU11: Consultar auditoría de operaciones sincronizadas"""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/sync/operaciones-locales", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
