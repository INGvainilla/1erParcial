# -*- coding: utf-8 -*-
"""
Test de Integración para CU17: Gestionar Tipos y Medios de Cobro
"""
import sys
import os
import stripe

# Ajustar path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Importar app para resolver modelos y mappers
import app.main
from app.core.database import SessionLocal
from app.modules.pagos.models import MetodoPagoConfig
from app.modules.pagos.schemas import MetodoPagoUpdate
from app.modules.pagos.services import (
    asegurar_metodos_pago_semilla,
    listar_metodos_pago,
    listar_metodos_pago_publicos,
    actualizar_metodo_pago
)

def run_tests():
    db = SessionLocal()
    try:
        print("=== INICIANDO TEST CU17: GESTIONAR TIPOS Y MEDIOS DE COBRO ===")

        # 1. Test: Semilla y Auto-inicialización idempotente
        asegurar_metodos_pago_semilla(db)
        total_metodos = db.query(MetodoPagoConfig).count()
        assert total_metodos >= 4, f"Se esperaban al menos 4 métodos base, encontrados: {total_metodos}"
        print(f"[OK] Métodos base inicializados en BD: {total_metodos} canales de cobro")

        # 2. Test: Listar métodos y validar enmascaramiento de seguridad (PCI)
        metodos = listar_metodos_pago(db)
        codigos = [m.codigo for m in metodos]
        assert "EFECTIVO" in codigos
        assert "TARJETA_POS" in codigos
        assert "STRIPE" in codigos
        assert "QR_BCB" in codigos

        metodo_stripe = next(m for m in metodos if m.codigo == "STRIPE")
        assert metodo_stripe.requiere_credenciales is True
        secret_enmascarado = metodo_stripe.credenciales_enmascaradas.get("secret_key", "")
        assert "****" in secret_enmascarado, f"La clave secreta debe estar enmascarada: {secret_enmascarado}"
        assert not secret_enmascarado.startswith("sk_test_51UEsz81HD8WYieY54Eoz9aGdj05qbsEnEbLOISaxEf5TF2E6RWswKA3lsGO0Au0YVodJ0JOqbRElxv5GUlgwcYHY00LRGUdXFK"), "No debe exponerse en texto plano"
        print(f"[OK] Enmascaramiento seguro validado: '{secret_enmascarado}'")

        # 3. Test: Activar / Desactivar (Toggle Switch)
        id_stripe = metodo_stripe.id_metodo
        estado_original = metodo_stripe.activo

        # Desactivar
        res_desactivado = actualizar_metodo_pago(db, id_stripe, MetodoPagoUpdate(activo=False))
        assert res_desactivado.activo is False
        db_metodo = db.query(MetodoPagoConfig).filter(MetodoPagoConfig.id_metodo == id_stripe).first()
        assert db_metodo.activo is False
        print(f"[OK] Toggle Switch desactivado con éxito para #{id_stripe} ({db_metodo.codigo})")

        # Verificar que ya no aparece en el listado de públicos activos
        activos_publicos = listar_metodos_pago_publicos(db)
        assert not any(m.codigo == "STRIPE" for m in activos_publicos)
        print("[OK] Endpoint público confirma exclusión de método inactivo para Checkout")

        # Reactivar
        res_activado = actualizar_metodo_pago(db, id_stripe, MetodoPagoUpdate(activo=True))
        assert res_activado.activo is True
        print(f"[OK] Toggle Switch reactivado con éxito para #{id_stripe}")

        # 4. Test: Parametrización y Actualización de Credenciales en Caliente
        nueva_key = "sk_test_51UEsz81HD8WYieY54Eoz9aGdj05qbsEnEbLOISaxEf5TF2E6RWswKA3lsGO0Au0YVodJ0JOqbRElxv5GUlgwcYHY00LRGUdXFK"
        res_creds = actualizar_metodo_pago(
            db=db,
            id_metodo=id_stripe,
            update_data=MetodoPagoUpdate(
                credenciales={
                    "secret_key": nueva_key,
                    "publishable_key": "pk_test_updated_cu17"
                }
            )
        )
        assert res_creds.credenciales_enmascaradas.get("publishable_key") is not None
        assert stripe.api_key == nueva_key, "La librería stripe.api_key debe actualizarse en tiempo real"
        print(f"[OK] Propagación de credenciales en caliente verificada: stripe.api_key actualizado dinámicamente")

        # 5. Test: Modificación de otro método (Terminal POS)
        metodo_pos = next(m for m in metodos if m.codigo == "TARJETA_POS")
        res_pos = actualizar_metodo_pago(
            db=db,
            id_metodo=metodo_pos.id_metodo,
            update_data=MetodoPagoUpdate(
                credenciales={"terminal_id": "POS-DATAFAST-999"}
            )
        )
        assert res_pos.id_metodo == metodo_pos.id_metodo
        print(f"[OK] Terminal POS parametrizado con éxito: ID #{metodo_pos.id_metodo}")

        print("\n=== TODOS LOS TESTS DE CU17 BACKEND COMPLETADOS CON ÉXITO ===")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
