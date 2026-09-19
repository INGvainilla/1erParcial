# -*- coding: utf-8 -*-
"""
Suite de Pruebas Automatizadas para Ciclo 3 (CU19, CU20, CU21, CU22, CU23)
FashionStore - Módulos de Innovación: RA, Gamificación, IA Contextual y Búsqueda por Voz.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.modules.auth.models import Usuario
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)


@pytest.fixture
def auth_cliente_token():
    """Genera token JWT para un usuario con rol CLIENTE"""
    db = SessionLocal()
    cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE").first()
    if not cliente:
        cliente = Usuario(
            nombres="Carlos",
            apellidos="Mendoza",
            email="carlos.mendoza.test@store.bo",
            password_hash=get_password_hash("Cliente123*"),
            rol="CLIENTE",
            estado_cuenta="ACTIVO"
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)

    token = create_access_token({
        "sub": str(cliente.id_usuario),
        "id_usuario": cliente.id_usuario,
        "rol": cliente.rol,
        "nombres": cliente.nombres,
        "apellidos": cliente.apellidos
    })
    db.close()
    return token


# =============================================================================
# CU21: Fidelización Gamificada
# =============================================================================
def test_cu21_obtener_perfil_gamificacion(auth_cliente_token):
    """Valida obtención del perfil gamificado con puntos de bienvenida e insignias"""
    response = client.get(
        "/api/v1/gamificacion/perfil",
        headers={"Authorization": f"Bearer {auth_cliente_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "puntos_actuales" in data
    assert data["puntos_actuales"] >= 100
    assert data["nivel"] in ["BRONCE", "PLATA", "ORO", "DIAMANTE"]
    assert "progreso_nivel_pct" in data
    assert "insignias" in data
    assert len(data["insignias"]) >= 4


def test_cu21_bono_accion_probar_ra(auth_cliente_token):
    """Valida otorgamiento de +25 puntos e insignia por usar el Vestidor Virtual RA (CU19/CU21)"""
    # 1. Perfil previo
    r_prev = client.get("/api/v1/gamificacion/perfil", headers={"Authorization": f"Bearer {auth_cliente_token}"})
    puntos_antes = r_prev.json()["puntos_actuales"]

    # 2. Registrar acción PROBAR_RA
    response = client.post(
        "/api/v1/gamificacion/bono-accion",
        json={"accion": "PROBAR_RA"},
        headers={"Authorization": f"Bearer {auth_cliente_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert data["puntos_otorgados"] == 25
    assert data["puntos_actuales"] == puntos_antes + 25

    # 3. Validar insignia 'Visionario 3D' desbloqueada
    r_post = client.get("/api/v1/gamificacion/perfil", headers={"Authorization": f"Bearer {auth_cliente_token}"})
    insignias = {ins["id"]: ins["desbloqueada"] for ins in r_post.json()["insignias"]}
    assert insignias.get("vestidor_3d") is True


def test_cu21_listar_y_canjear_recompensa(auth_cliente_token):
    """Valida catálogo de recompensas y flujo de canje de puntos"""
    # 1. Listar recompensas
    r_list = client.get("/api/v1/gamificacion/recompensas", headers={"Authorization": f"Bearer {auth_cliente_token}"})
    assert r_list.status_code == 200
    recompensas = r_list.json()
    assert len(recompensas) >= 3

    # 2. Otorgar puntos suficientes para canjear si fuera necesario
    for _ in range(8):
        client.post(
            "/api/v1/gamificacion/bono-accion",
            json={"accion": "PROBAR_RA"},
            headers={"Authorization": f"Bearer {auth_cliente_token}"}
        )

    # 3. Canjear recompensa de 150 puntos (ENVIO_FREE)
    r_canje = client.post(
        "/api/v1/gamificacion/canjear",
        json={"codigo_recompensa": "ENVIO_FREE"},
        headers={"Authorization": f"Bearer {auth_cliente_token}"}
    )
    assert r_canje.status_code == 200
    res_canje = r_canje.json()
    assert res_canje["exito"] is True
    assert "FS-ENVIO_FREE-" in res_canje["codigo_cupon"]


# =============================================================================
# CU22: Recomendaciones Contextuales de IA
# =============================================================================
def test_cu22_obtener_clima_local():
    """Valida detección de clima y pautas textiles inteligentes para Santa Cruz y La Paz"""
    r_scz = client.get("/api/v1/recomendaciones/clima?ciudad=Santa Cruz")
    assert r_scz.status_code == 200
    d_scz = r_scz.json()
    assert d_scz["temperatura_c"] >= 25.0
    assert "lino" in d_scz["recomendacion_textil"].lower()

    r_lpz = client.get("/api/v1/recomendaciones/clima?ciudad=La Paz")
    assert r_lpz.status_code == 200
    d_lpz = r_lpz.json()
    assert d_lpz["temperatura_c"] <= 18.0
    assert "blazers" in d_lpz["recomendacion_textil"].lower() or "lana" in d_lpz["recomendacion_textil"].lower()


def test_cu22_generar_outfits_contextuales():
    """Valida síntesis de combinaciones inteligentes completas con afinidad y colorimetría"""
    response = client.get("/api/v1/recomendaciones/outfits?ciudad=Santa Cruz&ocasion=TODAS")
    assert response.status_code == 200
    data = response.json()
    assert data["total_outfits"] >= 1
    primer_outfit = data["outfits_recomendados"][0]
    assert "titulo" in primer_outfit
    assert "regla_colorimetria" in primer_outfit
    assert "analisis_estilista_ia" in primer_outfit
    assert len(primer_outfit["prendas"]) >= 2
    assert primer_outfit["precio_total_final"] > 0


# =============================================================================
# CU23: Búsqueda por Voz Semántica
# =============================================================================
def test_cu23_busqueda_voz_semantica_formal():
    """Valida procesamiento NLP semántico de solicitud en lenguaje natural para evento formal"""
    response = client.post(
        "/api/v1/recomendaciones/busqueda-voz",
        json={"consulta_voz": "necesito un terno o traje azul marino elegante para una boda"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_encontrados"] >= 1
    assert "formal" in data["intencion_detectada"].lower() or "indumentaria" in data["intencion_detectada"].lower()
    
    # Comprobar que entre las primeras sugerencias hay trajes o blazers
    nombres = [p["nombre"].lower() for p in data["prendas_sugeridas"][:3]]
    assert any("traje" in n or "blazer" in n or "oxford" in n for n in nombres)


def test_cu23_busqueda_voz_semantica_calor_lino():
    """Valida procesamiento NLP semántico para búsqueda de ropa fresca de lino"""
    response = client.post(
        "/api/v1/recomendaciones/busqueda-voz",
        json={"consulta_voz": "camisa fresca de lino para el calor"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_encontrados"] >= 1
    top_prenda = data["prendas_sugeridas"][0]
    assert "lino" in top_prenda["nombre"].lower() or "camisa" in top_prenda["nombre"].lower()
