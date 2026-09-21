# -*- coding: utf-8 -*-
"""
Fixtures compartidos de Pytest para la suite de pruebas de FashionStore.
"""
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
