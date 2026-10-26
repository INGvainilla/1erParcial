# -*- coding: utf-8 -*-
"""
Pruebas de Reglas de Plan y Límites de Suscripción (Fase 3 - CU01, CU02, CU03, CU05)
Valida vigencia temporal perezosa, cuotas operativas (409) y prevención de downgrade inválido.
"""
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.tenants.models import PlanSuscripcion, SuscripcionEmpresa
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal, Ciudad

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


def _get_or_create_ciudad(db):
    ciudad = db.query(Ciudad).first()
    if not ciudad:
        ciudad = Ciudad(nombre_ciudad="Santa Cruz", departamento="Santa Cruz")
        db.add(ciudad)
        db.commit()
        db.refresh(ciudad)
    return ciudad.id_ciudad


def test_consultar_capacidades_tenant(tokens):
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}
    resp = client.get("/api/v1/tenants/empresas/1/capacidades", headers=headers_t1)
    assert resp.status_code == 200
    data = resp.json()
    assert data["vigente"] is True
    assert "dias_restantes" in data
    assert "sucursales" in data
    assert "usuarios" in data
    assert data["sucursales"]["max"] == 10  # Plan Pro
    assert data["usuarios"]["max"] == 25


def test_limite_max_sucursales_plan_basico(tokens):
    # Empresa 2 tiene Plan Básico (máximo 2 sucursales)
    headers_t2 = {"Authorization": f"Bearer {tokens['admin_t2']}"}

    # Asegurar que la Empresa 2 ya tenga 2 sucursales en la BD
    db = SessionLocal()
    try:
        id_ciudad = _get_or_create_ciudad(db)
        cant_actual = db.query(Sucursal).filter(
            Sucursal.id_empresa == 2,
            Sucursal.estado != "CERRADA"
        ).count()
        while cant_actual < 2:
            cant_actual += 1
            nueva_s = Sucursal(
                id_empresa=2,
                id_ciudad=id_ciudad,
                nombre_sucursal=f"Sucursal Extra E2 #{cant_actual}",
                direccion="Calle Falsa 123",
                latitud=-17.78,
                longitud=-63.18,
                capacidad_probadores=2,
                horario_apertura="09:00",
                horario_cierre="21:00",
                estado="OPERATIVA"
            )
            db.add(nueva_s)
        db.commit()
    finally:
        db.close()

    # Intentar crear una 3ra sucursal con el admin de Empresa 2 -> 409 Conflict
    payload = {
        "id_ciudad": id_ciudad,
        "nombre_sucursal": "Sucursal Prohibida 3",
        "direccion": "Av. Exceso de Cuota #999",
        "latitud": -17.7800,
        "longitud": -63.1800,
        "capacidad_probadores": 2,
        "horario_apertura": "09:00",
        "horario_cierre": "21:00",
        "estado": "OPERATIVA"
    }
    resp = client.post("/api/v1/sucursales", json=payload, headers=headers_t2)
    assert resp.status_code == 409
    assert "LIMITE_PLAN_SUCURSALES" in resp.json()["detail"]


def test_downgrade_rechazado_por_exceso_de_uso(tokens):
    # Empresa 1 tiene múltiples sucursales y usuarios
    headers_t1 = {"Authorization": f"Bearer {tokens['admin_t1']}"}

    # Buscar el id del plan básico (que tiene límite de 2 sucursales)
    db = SessionLocal()
    try:
        id_ciudad = _get_or_create_ciudad(db)
        plan_basico = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_BASICO").first()
        id_basico = plan_basico.id_plan
        # Asegurar que Empresa 1 tenga al menos 3 sucursales
        cant_t1 = db.query(Sucursal).filter(Sucursal.id_empresa == 1, Sucursal.estado != "CERRADA").count()
        if cant_t1 < 3:
            s_extra = Sucursal(
                id_empresa=1,
                id_ciudad=id_ciudad,
                nombre_sucursal="Sucursal Test Cuota",
                direccion="Av. Central #333",
                latitud=-17.78,
                longitud=-63.18,
                capacidad_probadores=2,
                horario_apertura="09:00",
                horario_cierre="21:00",
                estado="OPERATIVA"
            )
            db.add(s_extra)
            db.commit()
    finally:
        db.close()

    # Intentar bajar de plan a Básico cuando Empresa 1 tiene más de 2 sucursales -> 409
    resp = client.post(
        "/api/v1/tenants/suscripciones/cambiar-plan",
        json={"id_empresa": 1, "id_plan": id_basico},
        headers=headers_t1
    )
    assert resp.status_code == 409
    assert "No es posible cambiar al plan" in resp.json()["detail"]


def test_suscripcion_vencida_bloquea_escritura_permite_lectura(tokens):
    db = SessionLocal()
    try:
        # Forzar vencimiento de la suscripción de Empresa 2
        susc_t2 = db.query(SuscripcionEmpresa).filter(
            SuscripcionEmpresa.id_empresa == 2,
            SuscripcionEmpresa.estado == "ACTIVA"
        ).first()
        if susc_t2:
            susc_t2.fecha_vencimiento = date.today() - timedelta(days=5)
            db.commit()
    finally:
        db.close()

    headers_t2 = {"Authorization": f"Bearer {tokens['admin_t2']}"}

    # Lectura sigue funcionando OK (para que el admin pueda ver su cuenta y catálogo)
    resp_read = client.get("/api/v1/sucursales", headers=headers_t2)
    assert resp_read.status_code == 200

    # Escritura operativa queda bloqueada con 403 SUSCRIPCION_NO_VIGENTE
    payload_prod = {
        "codigo_sku_base": "PRENDA-BLOQUEADA-EXP",
        "nombre": "Prenda Suscripcion Vencida",
        "precio_base": 120.00,
        "id_categoria": 1,
        "id_marca": 1,
        "colores": [{"color_nombre": "Blanco", "codigo_hex": "#FFFFFF"}],
        "tallas": ["M"]
    }
    resp_write = client.post("/api/v1/productos", json=payload_prod, headers=headers_t2)
    assert resp_write.status_code == 403
    assert "SUSCRIPCION_NO_VIGENTE" in resp_write.json()["detail"]

    # Restaurar suscripción de Empresa 2 para no afectar otros tests
    db = SessionLocal()
    try:
        susc_restaurar = db.query(SuscripcionEmpresa).filter(SuscripcionEmpresa.id_empresa == 2).first()
        if susc_restaurar:
            susc_restaurar.estado = "ACTIVA"
            susc_restaurar.fecha_vencimiento = date.today() + timedelta(days=60)
            db.commit()
    finally:
        db.close()
