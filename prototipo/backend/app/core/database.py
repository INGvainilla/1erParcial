# -*- coding: utf-8 -*-
"""
Capa de Software de Sistema: Conexión y Gestión de Sesiones Relacionales (SQLAlchemy 2.0)
Soporta PostgreSQL principal y fallback local transparente.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Intentar conexión con PostgreSQL; si no estuviera disponible, usar SQLite local
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    # Probar conexión inmediata
    with engine.connect() as conn:
        print(" [DATABASE] Conectado exitosamente a PostgreSQL (fashionstore_db).")
except Exception as e:
    print(f" [DATABASE] Advertencia: No se pudo conectar a PostgreSQL ({e}). Usando SQLite de respaldo.")
    engine = create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Generador de sesiones de base de datos para inyección de dependencias en FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
