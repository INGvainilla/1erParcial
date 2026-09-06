# -*- coding: utf-8 -*-
"""
Configuración Global del Sistema FashionStore (Backend Ciclo 1)
Implementa las variables de entorno, llaves criptográficas JWT y conexión a base de datos.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_env_path = os.path.join(_backend_dir, ".env")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_path if os.path.exists(_env_path) else None,
        env_file_encoding="utf-8",
        extra="allow",
        case_sensitive=False
    )

    # Identificación del Proyecto
    PROJECT_NAME: str = "FashionStore API - Ciclo 1"
    PROJECT_VERSION: str = "1.0.0"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad y Tokens JWT
    SECRET_KEY: str = "fashionstore_super_secret_jwt_key_2026_si2_umsa"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Parámetros de Seguridad RBAC y OTP (B4.txt y documento.md)
    MAX_LOGIN_ATTEMPTS: int = 5                  # Bloqueo tras 5 intentos fallidos
    ACCOUNT_LOCK_MINUTES: int = 30               # Duración de bloqueo preventivo
    OTP_EXPIRE_MINUTES: int = 15                 # Vigencia máxima del código OTP
    MAX_OTP_ATTEMPTS: int = 3                    # Máximo intentos errados de OTP antes de revocarlo

    # Configuración de Correo Electrónico SMTP (Gmail - CU03)
    EMAIL_BACKEND: str = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USE_TLS: bool = True
    EMAIL_HOST_USER: str = "mrgrueso2005@gmail.com"
    EMAIL_HOST_PASSWORD: str = "plwx ztda stmt qxeu"
    DEFAULT_FROM_EMAIL: str = "SIGEPSI <mrgrueso2005@gmail.com>"
    
    # Conexión a Base de Datos (PostgreSQL principal con fallback automático a SQLite)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "fashionstore_db"
    
    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        if self.POSTGRES_PASSWORD:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return f"postgresql://{self.POSTGRES_USER}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def SQLITE_URL(self) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return f"sqlite:///{os.path.join(base_dir, 'fashionstore_local.db')}"

settings = Settings()

