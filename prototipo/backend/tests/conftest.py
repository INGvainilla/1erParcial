# -*- coding: utf-8 -*-
"""
Fixtures compartidos de Pytest para la suite de pruebas de FashionStore.
"""
import pytest
from app.core.database import SessionLocal
from app.modules.auth.models import Usuario
from app.core.security import get_password_hash, create_access_token


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
