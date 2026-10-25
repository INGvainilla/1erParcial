# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Plataforma SaaS Multitenant y Suscripciones (CU01, CU02, CU03)
Coherencia con Sección 2.3, Sección 3.3 (DDL PostgreSQL / SQLite) del 2do Parcial.
"""
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PlanSuscripcion(Base):
    """
    Entidad PlanSuscripcion (CU02):
    Define los límites operativos, funcionalidades y costo mensual de cada nivel de servicio.
    """
    __tablename__ = "planes_suscripcion"

    id_plan = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)  # Ej. "Básico", "Profesional", "Enterprise"
    codigo = Column(String(30), unique=True, nullable=False)  # Ej. "PLAN_BASICO", "PLAN_PRO"
    max_sucursales = Column(Integer, nullable=False, default=2)
    max_usuarios = Column(Integer, nullable=False, default=10)
    permite_reportes_ia = Column(Boolean, nullable=False, default=False)
    permite_ml_dashboard = Column(Boolean, nullable=False, default=False)
    soporta_offline = Column(Boolean, nullable=False, default=True)
    precio_mensual = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    estado = Column(String(20), nullable=False, default="ACTIVO")  # ACTIVO, INACTIVO
    descripcion = Column(Text, nullable=True)
    creado_en = Column(DateTime, default=utc_now)

    # Relaciones
    suscripciones = relationship("SuscripcionEmpresa", back_populates="plan")


class Empresa(Base):
    """
    Entidad Empresa / Tenant (CU01):
    Representa a cada organización contratante independiente en la arquitectura SaaS Multitenant.
    """
    __tablename__ = "empresas"

    id_empresa = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nit = Column(String(30), unique=True, index=True, nullable=False)
    razon_social = Column(String(150), nullable=False)
    nombre_comercial = Column(String(100), nullable=False)
    dominio_slug = Column(String(63), unique=True, index=True, nullable=False)  # Ej. "fashionstore-scz"
    schema_name = Column(String(63), unique=True, nullable=True)
    email_contacto = Column(String(100), nullable=False)
    telefono = Column(String(30), nullable=True)
    direccion = Column(String(200), nullable=True)
    logo_url = Column(String(255), nullable=True)
    presupuesto_disponible = Column(Numeric(12, 2), nullable=False, default=Decimal("50000.00"))
    estado = Column(String(20), nullable=False, default="ACTIVA")  # ACTIVA, SUSPENDIDA, VENCIDA
    creado_en = Column(DateTime, default=utc_now)
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relaciones
    suscripciones = relationship("SuscripcionEmpresa", back_populates="empresa", cascade="all, delete-orphan")
    usuarios = relationship("Usuario", back_populates="empresa")
    sucursales = relationship("Sucursal", back_populates="empresa")
    productos = relationship("Producto", back_populates="empresa")


class SuscripcionEmpresa(Base):
    """
    Entidad Suscripción (CU03):
    Gobierna el periodo de vigencia, estado y vinculación del plan contratado por cada empresa.
    """
    __tablename__ = "suscripciones"

    id_suscripcion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_empresa = Column(Integer, ForeignKey("empresas.id_empresa", ondelete="CASCADE"), nullable=False, index=True)
    id_plan = Column(Integer, ForeignKey("planes_suscripcion.id_plan", ondelete="RESTRICT"), nullable=False)
    fecha_inicio = Column(Date, nullable=False, default=date.today)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(String(20), nullable=False, default="ACTIVA")  # ACTIVA, VENCIDA, CANCELADA
    stripe_subscription_id = Column(String(100), nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    auto_renovar = Column(Boolean, nullable=False, default=True)
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relaciones
    empresa = relationship("Empresa", back_populates="suscripciones")
    plan = relationship("PlanSuscripcion", back_populates="suscripciones")
