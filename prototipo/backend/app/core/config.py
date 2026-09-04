# -*- coding: utf-8 -*-
"""
Configuración Global del Sistema FashionStore (Backend Ciclo 1)
Implementa las variables de entorno, llaves criptográficas JWT y conexión a base de datos.
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Identificación del Proyecto
    PROJECT_NAME: str = "FashionStore API - Ciclo 1"
    PROJECT_VERSION: str = "1.0.0"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad y Tokens JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fashionstore_super_secret_jwt_key_2026_si2_umsa")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Parámetros de Seguridad RBAC y OTP (B4.txt y documento.md)
    MAX_LOGIN_ATTEMPTS: int = 5                  # Bloqueo tras 5 intentos fallidos
    ACCOUNT_LOCK_MINUTES: int = 30               # Duración de bloqueo preventivo
    OTP_EXPIRE_MINUTES: int = 15                 # Vigencia máxima del código OTP
    MAX_OTP_ATTEMPTS: int = 3                    # Máximo intentos errados de OTP antes de revocarlo
    
    # Conexión a Base de Datos (PostgreSQL principal con fallback automático a SQLite)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "fashionstore_db")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def SQLITE_URL(self) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return f"sqlite:///{os.path.join(base_dir, 'fashionstore_local.db')}"

    class Config:
        case_sensitive = True

settings = Settings()
