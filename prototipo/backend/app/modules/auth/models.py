# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Seguridad, Usuarios y Recuperación OTP (M01 - CU01, CU02, CU03, CU04)
Coherencia estricta con Sección 2.3 (Clases Entidad) y Sección 3.3 (Diseño de Datos).
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Usuario(Base):
    """
    Entidad Usuario (UsuarioEntity):
    Centraliza el control de acceso basado en roles (RBAC) y estados de seguridad.
    """
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal", ondelete="SET NULL"), nullable=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(120), nullable=False)
    telefono = Column(String(30), nullable=True)
    rol = Column(String(30), nullable=False, default="CLIENTE")  # ADMINISTRADOR, ENCARGADO_SUCURSAL, CAJERO, LOGISTICA, CLIENTE, PROVEEDOR
    estado_cuenta = Column(String(30), nullable=False, default="ACTIVO")  # ACTIVO, INACTIVO, BLOQUEADO_POR_INTENTOS
    intentos_fallidos = Column(Integer, nullable=False, default=0)
    bloqueado_hasta = Column(DateTime, nullable=True)
    ultimo_acceso = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, default=utc_now)

    # Propiedad de conveniencia para esquemas DTO
    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}".strip()

    # Relaciones
    tokens_otp = relationship("TokenRecuperacion", back_populates="usuario", cascade="all, delete-orphan")
    bitacoras = relationship("BitacoraAcceso", back_populates="usuario")
    sucursal = relationship("Sucursal", back_populates="usuarios", foreign_keys=[id_sucursal])


class TokenRecuperacion(Base):
    """
    Entidad Token OTP (TokenOtpEntity):
    Gestiona el ciclo de vida efímero (15 minutos) de los códigos de recuperación (CU03).
    """
    __tablename__ = "tokens_recuperacion"

    id_token = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    codigo_otp_hash = Column(String(120), nullable=False)
    expiracion = Column(DateTime, nullable=False)
    utilizado = Column(Boolean, nullable=False, default=False)
    intentos_verificacion = Column(Integer, nullable=False, default=0)
    fecha_creacion = Column(DateTime, default=utc_now)

    usuario = relationship("Usuario", back_populates="tokens_otp")


class BitacoraAcceso(Base):
    """
    Entidad Bitácora (BitacoraEntity):
    Registro inmutable de auditoría de seguridad y eventos de acceso (CU01).
    """
    __tablename__ = "bitacora_accesos"

    id_bitacora = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    ip_origen = Column(String(45), nullable=False, default="127.0.0.1")
    user_agent = Column(String(255), nullable=True)
    exitoso = Column(Boolean, nullable=False, default=True)
    motivo = Column(String(100), nullable=True)
    fecha_hora = Column(DateTime, default=utc_now)

    usuario = relationship("Usuario", back_populates="bitacoras")
