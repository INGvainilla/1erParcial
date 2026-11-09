# -*- coding: utf-8 -*-
"""
Tests automatizados para:
- CU21: Gestionar Bitácora y Auditoría de Accesos Multitenant
- CU22: Gestionar Respaldo y Restauración de Base de Datos Multitenant
"""
import pytest
import os
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.auth.models import Usuario, BitacoraAcceso
from app.modules.p01_seguridad_acceso.backups.models import RespaldoTenant
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture
def admin_t1_user():
    db = SessionLocal()
    admin = db.query(Usuario).filter(Usuario.rol == "ADMIN_EMPRESA", Usuario.id_empresa == 1).first()
    if not admin:
        admin = Usuario(
            nombres="Admin",
            apellidos="Tenant Uno",
            email="admin.t1@fashionstore.bo",
            password_hash=get_password_hash("Admin123*"),
            rol="ADMIN_EMPRESA",
            id_empresa=1,
            estado_cuenta="ACTIVO"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    data = {
        "id_usuario": admin.id_usuario,
        "email": admin.email,
        "id_empresa": 1,
        "rol": admin.rol,
        "token": create_access_token({
            "sub": str(admin.id_usuario),
            "id_usuario": admin.id_usuario,
            "rol": admin.rol,
            "id_empresa": 1,
            "email": admin.email
        })
    }
    db.close()
    return data

@pytest.fixture
def admin_t2_user():
    db = SessionLocal()
    admin = db.query(Usuario).filter(Usuario.rol == "ADMIN_EMPRESA", Usuario.id_empresa == 2).first()
    if not admin:
        admin = Usuario(
            nombres="Admin",
            apellidos="Tenant Dos",
            email="admin.t2@fashionstore.bo",
            password_hash=get_password_hash("Admin123*"),
            rol="ADMIN_EMPRESA",
            id_empresa=2,
            estado_cuenta="ACTIVO"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    data = {
        "id_usuario": admin.id_usuario,
        "email": admin.email,
        "id_empresa": 2,
        "rol": admin.rol,
        "token": create_access_token({
            "sub": str(admin.id_usuario),
            "id_usuario": admin.id_usuario,
            "rol": admin.rol,
            "id_empresa": 2,
            "email": admin.email
        })
    }
    db.close()
    return data

@pytest.fixture
def superadmin_user():
    db = SessionLocal()
    sa = db.query(Usuario).filter(Usuario.rol == "SUPER_ADMIN").first()
    if not sa:
        sa = Usuario(
            nombres="Super",
            apellidos="Admin",
            email="superadmin@fashionstore.bo",
            password_hash=get_password_hash("SuperAdmin123*"),
            rol="SUPER_ADMIN",
            id_empresa=None,
            estado_cuenta="ACTIVO"
        )
        db.add(sa)
        db.commit()
        db.refresh(sa)
    data = {
        "id_usuario": sa.id_usuario,
        "email": sa.email,
        "rol": "SUPER_ADMIN",
        "token": create_access_token({
            "sub": str(sa.id_usuario),
            "id_usuario": sa.id_usuario,
            "rol": "SUPER_ADMIN",
            "id_empresa": None,
            "email": sa.email
        })
    }
    db.close()
    return data


# ==============================================================================
# CU21: AUDITORÍA Y BITÁCORA MULTITENANT
# ==============================================================================

def test_cu21_eventos_aislamiento_tenant(admin_t1_user, admin_t2_user, superadmin_user):
    """Verifica que el admin tenant sólo ve eventos de su empresa y super admin ve todo"""
    db = SessionLocal()
    ev1 = BitacoraAcceso(
        id_usuario=admin_t1_user["id_usuario"],
        id_empresa=1,
        tipo_evento="LOGIN_EXITOSO",
        email_intento=admin_t1_user["email"],
        ip_origen="192.168.1.10",
        exitoso=True
    )
    ev2 = BitacoraAcceso(
        id_usuario=admin_t2_user["id_usuario"],
        id_empresa=2,
        tipo_evento="LOGIN_EXITOSO",
        email_intento=admin_t2_user["email"],
        ip_origen="192.168.1.20",
        exitoso=True
    )
    db.add_all([ev1, ev2])
    db.commit()
    db.close()

    # Consulta como Admin Tenant 1
    headers_t1 = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    resp_t1 = client.get("/api/v1/auditoria/eventos", headers=headers_t1)
    assert resp_t1.status_code == 200
    eventos_t1 = resp_t1.json()
    assert isinstance(eventos_t1, list)
    assert all(e["id_empresa"] == 1 for e in eventos_t1 if e["id_empresa"] is not None)

    # Consulta como Super Admin
    headers_sa = {"Authorization": f"Bearer {superadmin_user['token']}"}
    resp_sa = client.get("/api/v1/auditoria/eventos", headers=headers_sa)
    assert resp_sa.status_code == 200
    eventos_sa = resp_sa.json()
    assert len(eventos_sa) >= 2


def test_cu21_metricas_seguridad_y_fuerza_bruta(admin_t1_user):
    """Verifica métricas de seguridad 24h y detección de sospecha de fuerza bruta"""
    db = SessionLocal()
    for i in range(4):
        db.add(BitacoraAcceso(
            id_usuario=None,
            id_empresa=1,
            tipo_evento="LOGIN_FALLIDO",
            email_intento="ataque@tenant1.bo",
            ip_origen="203.0.113.42",
            exitoso=False
        ))
    db.commit()
    db.close()

    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    resp = client.get("/api/v1/auditoria/metricas", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_accesos_24h"] >= 4
    assert data["total_fallidos_24h"] >= 4
    assert len(data["ips_sospechosas"]) >= 1
    assert any(sos["ip"] == "203.0.113.42" for sos in data["ips_sospechosas"])


def test_cu21_desbloqueo_cuenta(admin_t1_user):
    """Verifica el flujo de listar cuentas bloqueadas y desbloquearlas"""
    db = SessionLocal()
    email_bloq = f"victima.bloq.{os.urandom(3).hex()}@tenant1.bo"
    user_bloq = Usuario(
        nombres="Victima",
        apellidos="Bloqueada",
        email=email_bloq,
        password_hash=get_password_hash("Pass123*"),
        rol="CAJERO",
        id_empresa=1,
        estado_cuenta="BLOQUEADO",
        intentos_fallidos=5
    )
    db.add(user_bloq)
    db.commit()
    db.refresh(user_bloq)
    user_id = user_bloq.id_usuario
    db.close()

    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    # Listar bloqueadas
    resp_list = client.get("/api/v1/auditoria/cuentas-bloqueadas", headers=headers)
    assert resp_list.status_code == 200
    bloqueadas = resp_list.json()
    assert any(u["id_usuario"] == user_id for u in bloqueadas)

    # Desbloquear
    resp_unlock = client.post(f"/api/v1/auditoria/desbloquear-cuenta/{user_id}", headers=headers)
    assert resp_unlock.status_code == 200
    assert resp_unlock.json()["estado_cuenta"] == "ACTIVO"

    # Verificar en BD que los intentos fallidos se resetearon a 0
    db = SessionLocal()
    u_updated = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    assert u_updated.intentos_fallidos == 0
    assert u_updated.estado_cuenta == "ACTIVO"
    db.close()


def test_cu21_exportar_csv_con_sha256(admin_t1_user):
    """Verifica exportación CSV con cabeceras de integridad SHA-256"""
    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    resp = client.get("/api/v1/auditoria/exportar?formato=csv", headers=headers)
    assert resp.status_code == 200
    assert "x-checksum-sha256" in resp.headers
    sha_header = resp.headers["x-checksum-sha256"]
    assert len(sha_header) == 64
    content = resp.content
    calc_sha = hashlib.sha256(content).hexdigest()
    assert sha_header == calc_sha


# ==============================================================================
# CU22: RESPALDOS Y RESTAURACIÓN MULTITENANT
# ==============================================================================

def test_cu22_generar_snapshot_tenant(admin_t1_user):
    """Verifica generación de snapshot .json.gz con checksum SHA-256"""
    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    payload = {"tablas_alcance": None, "comentario": "Snapshot de prueba"}
    resp = client.post("/api/v1/backups/snapshot", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["estado"] == "COMPLETADO"
    assert len(data["checksum_sha256"]) == 64
    assert data["id_empresa"] == 1
    assert data["nombre_archivo"].endswith(".json.gz")
    assert data["tamano_bytes"] > 0


def test_cu22_verificar_integridad_checksum(admin_t1_user):
    """Verifica la comprobación criptográfica del snapshot contra disco"""
    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    # 1. Crear snapshot
    resp_create = client.post("/api/v1/backups/snapshot", json={"tablas_alcance": None}, headers=headers)
    assert resp_create.status_code in (200, 201)
    respaldo_id = resp_create.json()["id_respaldo"]

    # 2. Verificar integridad
    resp_check = client.post(f"/api/v1/backups/{respaldo_id}/verificar-integridad", headers=headers)
    assert resp_check.status_code == 200
    data = resp_check.json()
    assert data["integro"] is True
    assert data["checksum_registrado"] == data["checksum_calculado"]


def test_cu22_aislamiento_descarga_entre_tenants(admin_t1_user, admin_t2_user):
    """Verifica que el Tenant 2 no pueda descargar un snapshot perteneciente al Tenant 1"""
    # 1. Tenant 1 crea snapshot
    headers_t1 = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    resp_create = client.post("/api/v1/backups/snapshot", json={"tablas_alcance": None}, headers=headers_t1)
    assert resp_create.status_code in (200, 201)
    respaldo_id = resp_create.json()["id_respaldo"]

    # 2. Tenant 2 intenta descargarlo -> debe arrojar 403 Forbidden
    headers_t2 = {"Authorization": f"Bearer {admin_t2_user['token']}"}
    resp_descarga = client.get(f"/api/v1/backups/{respaldo_id}/descargar", headers=headers_t2)
    assert resp_descarga.status_code == 403


def test_cu22_super_admin_wal_backup(superadmin_user):
    """Verifica que Super Admin pueda disparar snapshot WAL / PITR de infraestructura"""
    headers = {"Authorization": f"Bearer {superadmin_user['token']}"}
    resp = client.post("/api/v1/backups/global-wal", headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["estado"] in ("COMPLETADO", "EXITOSO")
    assert data["cluster_id"] == "cluster-render-pg15"
    assert data["tipo_respaldo"] in ("INFRAESTRUCTURA_WAL_PITR", "WAL_PITR_INFRAESTRUCTURA")


def test_cu22_programar_respaldo_automatico_fecha_hora(admin_t1_user, superadmin_user):
    """Verifica que un admin de tenant y super admin puedan programar respaldos eligiendo fecha y hora"""
    headers_t1 = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    from datetime import datetime, timezone, timedelta
    fecha_futura = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()

    # 1. Admin de Tenant programa para su propio tenant
    payload_t1 = {
        "nombre": "Backup Nocturno Tenant 1",
        "fecha_hora_programada": fecha_futura,
        "frecuencia": "DIARIO",
        "hora_ejecucion": "03:30",
        "tablas_alcance": ["sucursales", "productos"]
    }
    resp_t1 = client.post("/api/v1/backups/programaciones", json=payload_t1, headers=headers_t1)
    assert resp_t1.status_code in (200, 201)
    data_t1 = resp_t1.json()
    assert data_t1["id_empresa"] == 1
    assert data_t1["frecuencia"] == "DIARIO"
    assert data_t1["hora_ejecucion"] == "03:30"
    assert data_t1["activo"] is True
    assert data_t1["estado"] == "PROGRAMADO"
    id_prog = data_t1["id_programacion"]

    # 2. Listar programaciones del tenant
    resp_list = client.get("/api/v1/backups/programaciones", headers=headers_t1)
    assert resp_list.status_code == 200
    programaciones = resp_list.json()
    assert any(p["id_programacion"] == id_prog for p in programaciones)

    # 3. Super Admin puede programar para otro tenant (Tenant 2)
    headers_sa = {"Authorization": f"Bearer {superadmin_user['token']}"}
    payload_sa = {
        "id_empresa": 2,
        "nombre": "Backup Mensual Tenant 2 por SuperAdmin",
        "fecha_hora_programada": fecha_futura,
        "frecuencia": "MENSUAL",
        "hora_ejecucion": "01:00"
    }
    resp_sa = client.post("/api/v1/backups/programaciones", json=payload_sa, headers=headers_sa)
    assert resp_sa.status_code in (200, 201)
    assert resp_sa.json()["id_empresa"] == 2


def test_cu22_ejecutar_programacion_respaldo(admin_t1_user):
    """Verifica la ejecución forzada inmediata de una política de respaldo programada"""
    headers = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    from datetime import datetime, timezone, timedelta
    fecha_futura = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

    # 1. Crear programación
    payload = {
        "nombre": "Backup para Ejecución Inmediata",
        "fecha_hora_programada": fecha_futura,
        "frecuencia": "UNA_VEZ",
        "hora_ejecucion": "04:00"
    }
    resp_prog = client.post("/api/v1/backups/programaciones", json=payload, headers=headers)
    assert resp_prog.status_code in (200, 201)
    id_prog = resp_prog.json()["id_programacion"]

    # 2. Ejecutar inmediatamente
    resp_exec = client.post(f"/api/v1/backups/programaciones/{id_prog}/ejecutar", headers=headers)
    assert resp_exec.status_code in (200, 201)
    snap = resp_exec.json()
    assert snap["id_empresa"] == 1
    assert snap["estado"] == "COMPLETADO"
    assert snap["total_registros"] >= 0


def test_cu22_restaurar_snapshot_tenant(admin_t1_user, admin_t2_user):
    """Verifica restauración de un snapshot y que Tenant 2 no pueda restaurar el de Tenant 1"""
    headers_t1 = {"Authorization": f"Bearer {admin_t1_user['token']}"}
    headers_t2 = {"Authorization": f"Bearer {admin_t2_user['token']}"}

    # 1. Tenant 1 genera snapshot
    resp_snap = client.post("/api/v1/backups/snapshot", json={"tablas_alcance": ["sucursales"]}, headers=headers_t1)
    assert resp_snap.status_code in (200, 201)
    id_respaldo = resp_snap.json()["id_respaldo"]

    # 2. Tenant 2 intenta restaurarlo -> Denegado 403
    resp_bad = client.post(f"/api/v1/backups/{id_respaldo}/restaurar", json={"confirmar": True}, headers=headers_t2)
    assert resp_bad.status_code == 403

    # 3. Tenant 1 restaura su propio snapshot -> 200 OK
    resp_restaurar = client.post(f"/api/v1/backups/{id_respaldo}/restaurar", json={"confirmar": True}, headers=headers_t1)
    assert resp_restaurar.status_code == 200
    res_data = resp_restaurar.json()
    assert res_data["exitoso"] is True
    assert res_data["id_empresa"] == 1
    assert "sucursales" in res_data["tablas_restauradas"]
