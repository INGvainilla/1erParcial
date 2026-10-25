# -*- coding: utf-8 -*-
"""
Fixtures compartidos de Pytest para la suite de pruebas de FashionStore.
"""
import os
import shutil
import tempfile

# --- Aislamiento de datos de prueba (F0.2) -----------------------------------
# Debe ejecutarse ANTES de importar cualquier módulo de `app`, porque el motor de
# base de datos se crea al importar. Si no hay PostgreSQL/DATABASE_URL ni una ruta
# explícita, se trabaja sobre una COPIA temporal del .db versionado.
if not os.getenv("DATABASE_URL") and not os.getenv("FASHIONSTORE_SQLITE_PATH"):
    _backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _origen = os.path.join(_backend_dir, "app", "fashionstore_local.db")
    _tmp_dir = tempfile.mkdtemp(prefix="fashionstore_tests_")
    _destino = os.path.join(_tmp_dir, "fashionstore_test.db")
    if os.path.exists(_origen):
        shutil.copy2(_origen, _destino)
    os.environ["FASHIONSTORE_SQLITE_PATH"] = _destino

import pytest
from app.core.database import SessionLocal
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.core.security import get_password_hash, create_access_token


@pytest.fixture
def auth_cliente_token():
    """Genera token JWT para un usuario con rol CLIENTE"""
    db = SessionLocal()
    cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE", Usuario.estado_cuenta == "ACTIVO").first()
    if not cliente:
        cliente = Usuario(
            nombres="Carlos",
            apellidos="Mendoza",
            email=f"carlos.mendoza.{int(get_password_hash('a')[:8], 16)}@store.bo",
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
