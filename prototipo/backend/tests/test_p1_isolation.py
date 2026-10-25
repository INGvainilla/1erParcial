# -*- coding: utf-8 -*-
"""
Pruebas de Aislamiento Multitenant Estricto (Fase 2 - CU01, CU05, CU06, CU07)
Verifica que las barreras lógicas por tenant rechacen con 403/404 cualquier intento
de cruce de datos no autorizado entre Empresa 1 y Empresa 2.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert resp.status_code == 200, f"Fallo al autenticar {email}: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def tokens():
    return {
        "admin_t1": get_token("alberto.delgado@store.bo", "Admin123*"),
        "admin_t2": get_token("admin@elegance.bo", "Elegance123*"),
        "superadmin": get_token("superadmin@fashionstore.bo", "SuperAdmin123*")
    }


@pytest.fixture(scope="module")
def fixture_resources():
    db = SessionLocal()
    try:
        # Empresa 1: Sucursal y Producto
        suc_t1 = db.query(Sucursal).filter(Sucursal.id_empresa == 1).first()
        prod_t1 = db.query(Producto).filter(Producto.id_empresa == 1).first()
        user_t1 = db.query(Usuario).filter(Usuario.id_empresa == 1, Usuario.rol != "SUPER_ADMIN").first()
        inv_t1 = db.query(Inventario).filter(Inventario.id_empresa == 1).first()

        # Empresa 2: Sucursal y Producto
        suc_t2 = db.query(Sucursal).filter(Sucursal.id_empresa == 2).first()
        if not suc_t2:
            suc_t2 = Sucursal(
                id_empresa=2,
                id_ciudad=1,
                nombre_sucursal="Sucursal Piloto Elegance",
                direccion="Av. San Martín #200",
                latitud=-17.78,
                longitud=-63.18,
                capacidad_probadores=3,
                horario_apertura="09:00",
                horario_cierre="21:00",
                estado="OPERATIVA"
            )
            db.add(suc_t2)
            db.commit()
            db.refresh(suc_t2)

        prod_t2 = db.query(Producto).filter(Producto.id_empresa == 2).first()
        if not prod_t2:
            prod_t2 = Producto(
                id_empresa=2,
                codigo_sku_base="TRAJE-SLIM-ELEGANCE",
                nombre="Traje Slim Elegance",
                precio_base=850.00,
                id_categoria=1,
                id_marca=1,
                estado="PUBLICADO"
            )
            db.add(prod_t2)
            db.commit()
            db.refresh(prod_t2)

        user_t2 = db.query(Usuario).filter(Usuario.id_empresa == 2).first()

        inv_t2 = db.query(Inventario).filter(Inventario.id_empresa == 2).first()
        if not inv_t2:
            inv_t2 = Inventario(
                id_empresa=2,
                id_sucursal=suc_t2.id_sucursal,
                id_producto=prod_t2.id_producto,
                talla="M",
                color="Negro",
                stock_fisico=20,
                stock_reservado=0,
                stock_disponible=20,
                stock_minimo=5,
                ultimo_costo_compra=300.00,
                costo_promedio_ponderado=300.00
            )
            db.add(inv_t2)
            db.commit()
            db.refresh(inv_t2)

        return {
            "suc_t1_id": suc_t1.id_sucursal if suc_t1 else 1,
            "prod_t1_id": prod_t1.id_producto if prod_t1 else 1,
            "user_t1_id": user_t1.id_usuario if user_t1 else 1,
            "inv_t1_id": inv_t1.id_inventario if inv_t1 else 1,
            "suc_t2_id": suc_t2.id_sucursal,
            "prod_t2_id": prod_t2.id_producto,
            "user_t2_id": user_t2.id_usuario,
            "inv_t2_id": inv_t2.id_inventario
        }
    finally:
        db.close()


# ==============================================================================
# 1. AISLAMIENTO EN INVENTARIO (CU07)
# ==============================================================================
def test_stock_cross_tenant_forbidden(tokens):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}
    # Admin de Empresa 1 solicita explícitamente id_empresa=2 -> 403 Forbidden
    resp = client.get("/api/v1/inventario/stock?id_empresa=2", headers=headers_t1)
    assert resp.status_code == 403

    # SuperAdmin puede consultar cualquier empresa
    headers_sa = {"Authorization": f"Bearer {tokens['superadmin']}"}
    resp_sa = client.get("/api/v1/inventario/stock?id_empresa=2", headers=headers_sa)
    assert resp_sa.status_code == 200


def test_entrada_lote_cross_tenant_forbidden(tokens, fixture_resources):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}

    # Admin T1 intenta registrar entrada en sucursal de T2 -> 403
    payload_bad_sucursal = {
        "id_sucursal": fixture_resources["suc_t2_id"],
        "id_producto": fixture_resources["prod_t1_id"],
        "talla": "M",
        "color": "Azul",
        "cantidad_recibida": 5,
        "costo_unitario_compra": 100.00
    }
    resp = client.post("/api/v1/inventario/entradas", json=payload_bad_sucursal, headers=headers_t1)
    assert resp.status_code == 403

    # Admin T1 intenta registrar entrada con producto de T2 -> 403
    payload_bad_prod = {
        "id_sucursal": fixture_resources["suc_t1_id"],
        "id_producto": fixture_resources["prod_t2_id"],
        "talla": "M",
        "color": "Negro",
        "cantidad_recibida": 5,
        "costo_unitario_compra": 100.00
    }
    resp = client.post("/api/v1/inventario/entradas", json=payload_bad_prod, headers=headers_t1)
    assert resp.status_code == 403


def test_kardex_cross_tenant_forbidden(tokens, fixture_resources):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}
    # Admin T1 intenta consultar kardex de un inventario de T2 -> 403
    resp = client.get(
        f"/api/v1/inventario/kardex?id_inventario={fixture_resources['inv_t2_id']}",
        headers=headers_t1
    )
    assert resp.status_code == 403


# ==============================================================================
# 2. AISLAMIENTO EN SUCURSALES (CU05)
# ==============================================================================
def test_sucursales_cross_tenant_isolation(tokens, fixture_resources):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}
    headers_t2 = {"Authorization": f"Bearer {tokens['admin_t2']}"}

    # Admin T1 consultando sucursal individual de T2 -> 403
    resp = client.get(f"/api/v1/sucursales/{fixture_resources['suc_t2_id']}", headers=headers_t1)
    assert resp.status_code == 403

    # Admin T1 intentando modificar sucursal de T2 -> 403
    resp_mod = client.put(
        f"/api/v1/sucursales/{fixture_resources['suc_t2_id']}",
        json={"nombre_sucursal": "Hackeada"},
        headers=headers_t1
    )
    assert resp_mod.status_code == 403

    # Listado autenticado de T1 solo contiene sucursales de T1
    resp_list = client.get("/api/v1/sucursales", headers=headers_t1)
    assert resp_list.status_code == 200
    for suc in resp_list.json():
        assert suc.get("id_empresa") == 1 or suc.get("id_empresa") is None


# ==============================================================================
# 3. AISLAMIENTO EN PRODUCTOS (CU06)
# ==============================================================================
def test_productos_cross_tenant_isolation(tokens, fixture_resources):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}

    # Admin T1 consultando producto de T2 -> 403
    resp = client.get(f"/api/v1/productos/{fixture_resources['prod_t2_id']}", headers=headers_t1)
    assert resp.status_code == 403

    # Admin T1 intentando modificar producto de T2 -> 403
    resp_mod = client.put(
        f"/api/v1/productos/{fixture_resources['prod_t2_id']}",
        json={"nombre": "Producto Interceptado"},
        headers=headers_t1
    )
    assert resp_mod.status_code == 403


# ==============================================================================
# 4. AISLAMIENTO EN USUARIOS (CU05)
# ==============================================================================
def test_usuarios_cross_tenant_isolation(tokens, fixture_resources):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}

    # Admin T1 intentando modificar usuario de T2 -> 403
    resp_mod = client.put(
        f"/api/v1/usuarios/{fixture_resources['user_t2_id']}",
        json={"nombre_completo": "Intruso"},
        headers=headers_t1
    )
    assert resp_mod.status_code == 403

    # Admin T1 intentando bloquear usuario de T2 -> 403
    resp_block = client.put(
        f"/api/v1/usuarios/{fixture_resources['user_t2_id']}/bloquear",
        headers=headers_t1
    )
    assert resp_block.status_code == 403

    # Admin T1 intentando desbloquear usuario de T2 -> 403
    resp_unblock = client.put(
        f"/api/v1/usuarios/{fixture_resources['user_t2_id']}/desbloquear",
        headers=headers_t1
    )
    assert resp_unblock.status_code == 403


# ==============================================================================
# 5. GOBERNANZA DE EMPRESAS Y PRIVILEGIOS DE SUPER_ADMIN (CU01)
# ==============================================================================
def test_empresa_governance_restrictions(tokens):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}
    headers_sa = {"Authorization": f"Bearer {tokens['superadmin']}"}

    # Admin T1 intentando cambiar estado o presupuesto de su empresa -> 403
    resp_estado = client.put(
        "/api/v1/tenants/empresas/1",
        json={"estado": "SUSPENDIDA"},
        headers=headers_t1
    )
    assert resp_estado.status_code == 403

    resp_presupuesto = client.put(
        "/api/v1/tenants/empresas/1",
        json={"presupuesto_disponible": 999999.00},
        headers=headers_t1
    )
    assert resp_presupuesto.status_code == 403

    # Admin T1 intentando acceder a PATCH /estado -> 403 (solo SuperAdmin)
    resp_patch_forbidden = client.patch(
        "/api/v1/tenants/empresas/1/estado",
        json={"estado": "ACTIVA"},
        headers=headers_t1
    )
    assert resp_patch_forbidden.status_code == 403

    # SuperAdmin ejecuta PATCH /estado exitosamente
    resp_patch_ok = client.patch(
        "/api/v1/tenants/empresas/1/estado",
        json={"estado": "ACTIVA"},
        headers=headers_sa
    )
    assert resp_patch_ok.status_code == 200
    assert resp_patch_ok.json()["estado"] == "ACTIVA"
