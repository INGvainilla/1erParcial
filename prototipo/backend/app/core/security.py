# -*- coding: utf-8 -*-
"""
Capa de Seguridad Criptográfica y Autenticación RBAC
Implementa hashing Bcrypt, generación de tokens JWT y generación criptográfica de OTPs.
"""
import secrets
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Genera hash Bcrypt seguro con factor de coste balanceado (cost factor 12)"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash almacenado"""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Genera un token JWT firmado con claims de usuario, rol y tiempo de expiración"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decodifica y valida un token JWT. Retorna el payload de claims o None si es inválido/expirado"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def generate_otp_code() -> str:
    """Genera un código numérico criptográficamente seguro de 6 dígitos para recuperación (CU03)"""
    # Rango de 100000 a 999999
    code = secrets.randbelow(900000) + 100000
    return str(code)
