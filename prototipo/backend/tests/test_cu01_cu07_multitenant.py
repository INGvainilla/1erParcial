# -*- coding: utf-8 -*-
"""
Suite de Pruebas Automatizadas de Integración: Casos de Uso CU01 al CU07
Metodología ICONIX - Arquitectura Multitenant SaaS & Offline-First (Segundo Parcial)

CU01: Gestionar Empresas (Tenants)
CU02: Gestionar Planes de Suscripción
CU03: Gestionar Suscripción de Empresa
CU04: Autenticar Usuario Multitenant
CU05: Gestionar Usuarios y Roles por Empresa
CU06: Gestionar Productos y Atributos Textiles Avanzados (cm, hex secundario, composición)
CU07: Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP)
"""
import json
import pytest
from decimal import Decimal, ROUND_HALF_UP
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.core.security import decode_access_token

client = TestClient(app)


# ==============================================================================
# HELPERS DE AUTENTICACIÓN
# ==============================================================================
def get_superadmin_token():
    resp = client.post("/api/v1/auth/login", json={
        "email": "superadmin@fashionstore.bo",
        "password": "SuperAdmin123*"
    })
    assert resp.status_code == 200, f"Error autenticando superadmin: {resp.text}"
    return resp.json()["access_token"]


def get_tenant1_admin_token():
    resp = client.post("/api/v1/auth/login", json={
        "email": "alberto.delgado@store.bo",
        "password": "Admin123*"
    })
    assert resp.status_code == 200, f"Error autenticando admin tenant 1: {resp.text}"
    return resp.json()["access_token"]


def get_tenant2_admin_token():
    # Asegurar que existe un usuario admin para tenant 2
    db = SessionLocal()
    u2 = db.query(Usuario).filter(Usuario.email == "admin@elegance.bo").first()
    if not u2:
        from app.core.security import get_password_hash
        u2 = Usuario(
            id_empresa=2,
            nombres="Carlos",
            apellidos="Elegance Admin",
            email="admin@elegance.bo",
            password_hash=get_password_hash("Elegance123*"),
            telefono="+591 71112233",
            rol="ADMINISTRADOR",
            estado_cuenta="ACTIVO"
        )
        db.add(u2)
        db.commit()
    db.close()

    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@elegance.bo",
        "password": "Elegance123*"
    })
    assert resp.status_code == 200, f"Error autenticando admin tenant 2: {resp.text}"
    return resp.json()["access_token"]


# ==============================================================================
# CU01: GESTIONAR EMPRESAS (TENANTS)
# ==============================================================================
def test_cu01_gestionar_empresas_tenants():
    super_token = get_superadmin_token()
    headers_super = {"Authorization": f"Bearer {super_token}"}

    # 1. Listar empresas como superadmin
    resp = client.get("/api/v1/tenants/empresas", headers=headers_super)
    assert resp.status_code == 200
    empresas = resp.json()
    assert len(empresas) >= 2
    nombres = [e["nombre_comercial"] for e in empresas]
    assert "FashionStore" in nombres

    # 2. Registrar nueva empresa como superadmin
    nit_random = f"99{len(empresas)}001122"
    payload_empresa = {
        "nit": nit_random,
        "razon_social": f"Corporacion Textil Andina {nit_random} S.A.",
        "nombre_comercial": f"Textiles Andina {nit_random}",
        "dominio_slug": f"textiles-andina-{nit_random}",
        "schema_name": f"tenant_andina_{nit_random}",
        "email_contacto": f"contacto@{nit_random}.bo",
        "telefono": "+591 2 2456789",
        "direccion": "Av. Mariscal Santa Cruz #1200",
        "presupuesto_disponible": 60000.00
    }
    resp_crear = client.post("/api/v1/tenants/empresas", json=payload_empresa, headers=headers_super)
    assert resp_crear.status_code == 201
    nueva_empresa = resp_crear.json()
    assert nueva_empresa["nit"] == nit_random
    assert nueva_empresa["estado"] == "ACTIVA"

    # 3. Validar restricción RBAC: Admin de tenant 1 no puede crear empresas
    tenant1_token = get_tenant1_admin_token()
    headers_tenant1 = {"Authorization": f"Bearer {tenant1_token}"}
    resp_prohibido = client.post("/api/v1/tenants/empresas", json=payload_empresa, headers=headers_tenant1)
    assert resp_prohibido.status_code == 403


# ==============================================================================
# CU02: GESTIONAR PLANES DE SUSCRIPCIÓN
# ==============================================================================
def test_cu02_gestionar_planes_suscripcion():
    super_token = get_superadmin_token()
    headers_super = {"Authorization": f"Bearer {super_token}"}

    # 1. Consultar planes existentes
    resp = client.get("/api/v1/tenants/planes")
    assert resp.status_code == 200
    planes = resp.json()
    assert len(planes) >= 2
    codigos = [p["codigo"] for p in planes]
    assert "PLAN_BASICO" in codigos
    assert "PLAN_PRO" in codigos

    # 2. Superadmin crea nuevo plan Enterprise
    codigo_plan = f"PLAN_CORP_{len(planes)}"
    payload_plan = {
        "nombre": f"Corporativo Ultra {len(planes)}",
        "codigo": codigo_plan,
        "max_sucursales": 20,
        "max_usuarios": 100,
        "permite_reportes_ia": True,
        "permite_ml_dashboard": True,
        "soporta_offline": True,
        "precio_mensual": 499.00,
        "descripcion": "Plan corporativo ilimitado para grandes cadenas departamentales."
    }
    resp_crear = client.post("/api/v1/tenants/planes", json=payload_plan, headers=headers_super)
    assert resp_crear.status_code == 201
    plan_creado = resp_crear.json()
    assert plan_creado["codigo"] == codigo_plan
    assert plan_creado["soporta_offline"] is True

    # 3. Tenant admin no puede crear planes
    tenant1_token = get_tenant1_admin_token()
    resp_prohibido = client.post("/api/v1/tenants/planes", json=payload_plan, headers={"Authorization": f"Bearer {tenant1_token}"})
    assert resp_prohibido.status_code == 403


# ==============================================================================
# CU03: GESTIONAR SUSCRIPCIÓN DE EMPRESA
# ==============================================================================
def test_cu03_gestionar_suscripcion_empresa():
    tenant1_token = get_tenant1_admin_token()
    headers_t1 = {"Authorization": f"Bearer {tenant1_token}"}

    # 1. Consultar suscripción activa de Empresa #1
    resp = client.get("/api/v1/tenants/empresas/1/suscripcion-activa", headers=headers_t1)
    assert resp.status_code == 200
    susc = resp.json()
    assert susc["id_empresa"] == 1
    assert susc["estado"] == "ACTIVA"
    assert "plan" in susc
    assert susc["plan"]["codigo"] == "PLAN_PRO"

    # 2. Aislamiento Multitenant: Admin de Tenant 2 no puede consultar suscripción de Empresa #1
    tenant2_token = get_tenant2_admin_token()
    headers_t2 = {"Authorization": f"Bearer {tenant2_token}"}
    resp_cross = client.get("/api/v1/tenants/empresas/1/suscripcion-activa", headers=headers_t2)
    assert resp_cross.status_code == 403


# ==============================================================================
# CU04: AUTENTICAR USUARIO MULTITENANT
# ==============================================================================
def test_cu04_autenticar_usuario_multitenant():
    # 1. Login superadmin global: id_empresa es None
    resp_super = client.post("/api/v1/auth/login", json={
        "email": "superadmin@fashionstore.bo",
        "password": "SuperAdmin123*"
    })
    assert resp_super.status_code == 200
    data_super = resp_super.json()
    assert data_super["rol"] == "SUPER_ADMIN"
    assert data_super["id_empresa"] is None

    # 2. Login tenant admin: token incluye id_empresa y nombre de la empresa
    resp_t1 = client.post("/api/v1/auth/login", json={
        "email": "alberto.delgado@store.bo",
        "password": "Admin123*"
    })
    assert resp_t1.status_code == 200
    data_t1 = resp_t1.json()
    assert data_t1["rol"] == "ADMINISTRADOR"
    assert data_t1["id_empresa"] == 1
    assert data_t1["nombre_empresa"] == "FashionStore"

    # 3. Verificar decodificación del JWT
    payload = decode_access_token(data_t1["access_token"])
    assert payload is not None
    assert payload.get("id_empresa") == 1

    # 4. Validar endpoint /api/v1/auth/me
    resp_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data_t1['access_token']}"})
    assert resp_me.status_code == 200
    me = resp_me.json()
    assert me["id_empresa"] == 1
    assert me["nombre_empresa"] == "FashionStore"


# ==============================================================================
# CU05: GESTIONAR USUARIOS Y ROLES POR EMPRESA
# ==============================================================================
def test_cu05_gestionar_usuarios_roles_por_empresa():
    tenant1_token = get_tenant1_admin_token()
    headers_t1 = {"Authorization": f"Bearer {tenant1_token}"}

    # 1. Listar usuarios: solo debe ver usuarios de su empresa (o compartidos)
    resp_list = client.get("/api/v1/usuarios/", headers=headers_t1)
    assert resp_list.status_code == 200
    usuarios = resp_list.json()
    for u in usuarios:
        assert u["id_empresa"] == 1 or u["id_empresa"] is None

    # 2. Registrar usuario de staff para su empresa
    rand_email = f"cajero.t1.{len(usuarios)}@store.bo"
    payload_user = {
        "nombre_completo": "Mateo Vargas",
        "email": rand_email,
        "password": "Password123*",
        "telefono": "+591 72223344",
        "rol": "CAJERO"
    }
    resp_crear = client.post("/api/v1/usuarios/", json=payload_user, headers=headers_t1)
    assert resp_crear.status_code == 201
    nuevo_cajero = resp_crear.json()
    assert nuevo_cajero["rol"] == "CAJERO"
    assert nuevo_cajero["id_empresa"] == 1


# ==============================================================================
# CU06: GESTIONAR PRODUCTOS Y ATRIBUTOS TEXTILES AVANZADOS
# ==============================================================================
def test_cu06_gestionar_productos_atributos_textiles_avanzados():
    # 1. Consultar productos del catálogo
    resp = client.get("/api/v1/productos/")
    assert resp.status_code == 200
    productos = resp.json()
    assert len(productos) > 0

    # 2. Validar atributos textiles en los productos
    assert any(p["composicion_textil"] is not None for p in productos)
    assert any("Algodón" in (p["composicion_textil"] or "") or "Lana" in (p["composicion_textil"] or "") for p in productos)

    # 3. Validar medidas antropométricas en cm (JSON)
    p = next((x for x in productos if x.get("medidas_antropometricas")), productos[0])
    assert p["medidas_antropometricas"] is not None
    medidas_dict = json.loads(p["medidas_antropometricas"])
    assert "M" in medidas_dict or "S" in medidas_dict or "40" in medidas_dict
    primera_talla = next(iter(medidas_dict.values()))
    assert "pecho_cm" in primera_talla
    assert "cintura_cm" in primera_talla
    assert "largo_cm" in primera_talla

    # 4. Validar colores y código hex secundario
    assert len(p["colores"]) > 0
    assert p["colores"][0]["codigo_hex"].startswith("#")

    # 5. Crear producto con medidas y composición textil completas
    super_token = get_superadmin_token()
    headers_super = {"Authorization": f"Bearer {super_token}"}
    sku_test = f"TRAJE-EXP-{len(productos)}"
    payload_prod = {
        "codigo_sku_base": sku_test,
        "nombre": "Traje Slim Fit Lana Merino y Seda",
        "descripcion": "Traje formal de alta confección textil con solapa en contraste.",
        "precio_base": 1250.00,
        "id_empresa": 1,
        "id_categoria": p["id_categoria"],
        "id_marca": p["id_marca"],
        "composicion_textil": "85% Lana Merino Super 120s, 15% Seda Mulberry",
        "medidas_antropometricas": json.dumps({
            "M": {"pecho_cm": 104, "cintura_cm": 88, "largo_cm": 75}
        }),
        "colores": [
            {
                "color_nombre": "Azul Marino / Solapa Negra",
                "codigo_hex": "#0F172A",
                "codigo_hex_secundario": "#000000"
            }
        ],
        "tallas": ["M", "L"]
    }
    resp_prod = client.post("/api/v1/productos/", json=payload_prod, headers=headers_super)
    assert resp_prod.status_code in [200, 201]
    prod_creado = resp_prod.json()
    assert prod_creado["codigo_sku_base"] == sku_test
    assert prod_creado["composicion_textil"] == payload_prod["composicion_textil"]
    assert prod_creado["colores"][0]["codigo_hex_secundario"] == "#000000"


# ==============================================================================
# CU07: GESTIONAR INVENTARIO MULTI-SUCURSAL Y COSTO PROMEDIO PONDERADO (CPP)
# ==============================================================================
def test_cu07_gestionar_inventario_kardex_cpp():
    tenant1_token = get_tenant1_admin_token()
    headers_t1 = {"Authorization": f"Bearer {tenant1_token}"}

    # 1. Consultar inventario multi-sucursal filtrado por tenant
    resp_inv = client.get("/api/v1/inventario/stock?id_empresa=1")
    assert resp_inv.status_code == 200
    items = resp_inv.json()
    assert len(items) > 0

    item_muestra = items[0]
    sucursal_id = item_muestra["id_sucursal"]
    producto_id = item_muestra["id_producto"]
    talla = item_muestra["talla"]
    color = item_muestra["color"]
    stock_anterior = item_muestra["stock_fisico"]
    cpp_anterior = Decimal(str(item_muestra["costo_promedio_ponderado"]))

    # 2. Registrar entrada de lote (recepción física)
    cant_ingreso = 10
    costo_unit_ingreso = Decimal("150.00")
    payload_lote = {
        "id_sucursal": sucursal_id,
        "id_producto": producto_id,
        "talla": talla,
        "color": color,
        "cantidad_recibida": cant_ingreso,
        "costo_unitario_compra": float(costo_unit_ingreso),
        "numero_factura": "FACT-LOTE-CPP-PARCIAL2"
    }

    resp_entrada = client.post("/api/v1/inventario/entradas", json=payload_lote, headers=headers_t1)
    assert resp_entrada.status_code == 201
    kardex_asiento = resp_entrada.json()

    # 3. Validar recálculo matemático formal del CPP:
    # CPP_esperado = [(Stock_ant * CPP_ant) + (Cant_ingreso * Costo_unit)] / (Stock_ant + Cant_ingreso)
    stock_total_esperado = stock_anterior + cant_ingreso
    inversion_ant = Decimal(str(stock_anterior)) * cpp_anterior
    inversion_nueva = Decimal(str(cant_ingreso)) * costo_unit_ingreso
    cpp_esperado_raw = (inversion_ant + inversion_nueva) / Decimal(str(stock_total_esperado))
    cpp_esperado = cpp_esperado_raw.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    assert kardex_asiento["saldo_cantidad_resultante"] == stock_total_esperado
    assert Decimal(str(kardex_asiento["saldo_cpp_resultante"])) == cpp_esperado
    assert kardex_asiento["tipo_movimiento"] == "ENTRADA_COMPRA"

    # 4. Consultar comprobante en Kardex
    resp_kardex = client.get(f"/api/v1/inventario/kardex?id_inventario={kardex_asiento['id_inventario']}", headers=headers_t1)
    assert resp_kardex.status_code == 200
    movimientos = resp_kardex.json()
    assert len(movimientos) > 0
    assert movimientos[0]["id_movimiento"] == kardex_asiento["id_movimiento"]
