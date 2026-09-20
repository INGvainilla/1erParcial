# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Fidelización Gamificada (M16 - CU21)
Gestión de puntos, progresión en niveles (Bronce a Diamante), insignias y canjes.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class GamificacionPerfil(Base):
    """
    Entidad Perfil de Gamificación (GamificacionPerfilEntity):
    Rastrea el nivel jerárquico del cliente, saldo de puntos y logros desbloqueados.
    """
    __tablename__ = "gamificacion_perfiles"

    id_perfil = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), unique=True, nullable=False)
    tenant_id = Column(String(50), nullable=False, default="fashionstore_scz")
    puntos_actuales = Column(Integer, nullable=False, default=100)  # 100 puntos de bienvenida
    puntos_historicos = Column(Integer, nullable=False, default=100)
    nivel = Column(String(30), nullable=False, default="BRONCE")  # BRONCE, PLATA, ORO, DIAMANTE
    insignias_json = Column(Text, nullable=False, default="[]")  # JSON string con identificadores
    beneficios_canjeados_json = Column(Text, nullable=False, default="[]")
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relación
    usuario = relationship("Usuario", foreign_keys=[id_usuario])


class RecompensaCatalogo(Base):
    """
    Entidad Catálogo de Recompensas (RecompensaCatalogoEntity):
    Catálogo de beneficios y cupones canjeables con su costo en puntos.
    """
    __tablename__ = "recompensas_catalogo"

    id_recompensa = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(50), unique=True, nullable=False)
    tenant_id = Column(String(50), nullable=False, default="fashionstore_scz")
    titulo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    costo_puntos = Column(Integer, nullable=False)
    descuento_monto = Column(Numeric(10, 2), nullable=False, default=0.00)
    categoria = Column(String(50), nullable=False, default="CUPON")
    icono = Column(String(50), nullable=False, default="local_offer")
    activo = Column(Boolean, nullable=False, default=True)


class CuponFidelizacion(Base):
    """
    Entidad Cupones Emitidos (CuponEntity):
    Cupones alfanuméricos individuales generados tras el canje de puntos de fidelización.
    """
    __tablename__ = "cupones_fidelizacion"

    id_cupon = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    codigo_cupon = Column(String(50), unique=True, nullable=False)
    monto_descuento = Column(Numeric(10, 2), nullable=False, default=0.00)
    tipo_beneficio = Column(String(50), nullable=False, default="DESCUENTO_MONTO")
    utilizado = Column(Boolean, nullable=False, default=False)
    fecha_emision = Column(DateTime, default=utc_now)
    fecha_expiracion = Column(DateTime, nullable=False)

    usuario = relationship("Usuario", foreign_keys=[id_usuario])


class BitacoraAuditoria(Base):
    """
    Entidad Bitácora de Auditoría (BitacoraAuditoriaEntity):
    Asientos inmutables de auditoría con zona horaria local (-04:00).
    """
    __tablename__ = "bitacora_auditoria"

    id_auditoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    accion = Column(String(100), nullable=False)
    ip_cliente = Column(String(45), nullable=False, default="127.0.0.1")
    fecha_hora_local = Column(DateTime, default=utc_now)
    metadatos_json = Column(Text, default="{}")

    usuario = relationship("Usuario", foreign_keys=[id_usuario])

