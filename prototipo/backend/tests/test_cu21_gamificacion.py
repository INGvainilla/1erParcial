# -*- coding: utf-8 -*-
"""
Pruebas Automatizadas Integrales para CU21: Fidelización Gamificada (M16)
Valida base de datos, lógica de niveles, canjes, cupones y bitácora de auditoría.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cu21_flujo_integral_gamificacion(auth_cliente_token):
    headers = {"Authorization": f"Bearer {auth_cliente_token}"}

    # 1. Obtener Perfil Inicial
    res_perfil = client.get("/api/v1/gamificacion/perfil", headers=headers)
    assert res_perfil.status_code == 200
    perfil = res_perfil.json()
    assert perfil["nivel"] in ["BRONCE", "PLATA", "ORO", "DIAMANTE"]
    assert perfil["puntos_actuales"] >= 100
    assert "compras_equivalente_ascenso_bs" in perfil
    assert "insignias" in perfil
    assert len(perfil["insignias"]) >= 4

    puntos_iniciales = perfil["puntos_actuales"]

    # 2. Bonos por Acciones Interactivas (CU19 Vestidor RA y CU23 Voz)
    res_bono_ra = client.post(
        "/api/v1/gamificacion/bono-accion",
        json={"accion": "PROBAR_RA"},
        headers=headers
    )
    assert res_bono_ra.status_code == 200
    assert res_bono_ra.json()["puntos_otorgados"] == 25
    assert res_bono_ra.json()["puntos_actuales"] == puntos_iniciales + 25

    res_bono_voz = client.post(
        "/api/v1/gamificacion/bono-accion",
        json={"accion": "BUSQUEDA_VOZ"},
        headers=headers
    )
    assert res_bono_voz.status_code == 200
    assert res_bono_voz.json()["puntos_otorgados"] == 15

    # 3. Listar Catálogo de Recompensas
    res_recs = client.get("/api/v1/gamificacion/recompensas", headers=headers)
    assert res_recs.status_code == 200
    recompensas = res_recs.json()
    assert len(recompensas) >= 3
    codigos_rec = [r["codigo"] for r in recompensas]
    assert "ENVIO_FREE" in codigos_rec

    # 4. Otorgar puntos suficientes para el canje
    for _ in range(6):
        client.post(
            "/api/v1/gamificacion/bono-accion",
            json={"accion": "PROBAR_RA"},
            headers=headers
        )

    # 5. Canjear Recompensa (ENVIO_FREE por 150 pts)
    res_canje = client.post(
        "/api/v1/gamificacion/canjear",
        json={"codigo_recompensa": "ENVIO_FREE"},
        headers=headers
    )
    assert res_canje.status_code == 200
    canje_data = res_canje.json()
    assert canje_data["exito"] is True
    assert canje_data["codigo_cupon"] is not None
    assert "FS-ENVIO_FREE-" in canje_data["codigo_cupon"]
    cupon_generado = canje_data["codigo_cupon"]

    # 6. Consultar Mis Cupones Disponibles
    res_mis_cupones = client.get("/api/v1/gamificacion/mis-cupones", headers=headers)
    assert res_mis_cupones.status_code == 200
    cupones_list = res_mis_cupones.json()
    codigos_emitidos = [c["codigo_cupon"] for c in cupones_list]
    assert cupon_generado in codigos_emitidos

    # 7. Validar Cupón para Checkout
    res_val = client.post(
        "/api/v1/gamificacion/validar-cupon",
        json={"codigo_cupon": cupon_generado},
        headers=headers
    )
    assert res_val.status_code == 200
    val_data = res_val.json()
    assert val_data["valido"] is True
    assert val_data["tipo_beneficio"] == "ENVIO_GRATIS"

    # 8. Validar Cupón Inexistente
    res_inval = client.post(
        "/api/v1/gamificacion/validar-cupon",
        json={"codigo_cupon": "CUPON_FALSO_123"},
        headers=headers
    )
    assert res_inval.status_code == 200
    assert res_inval.json()["valido"] is False
