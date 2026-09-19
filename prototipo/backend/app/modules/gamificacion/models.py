# -*- coding: utf-8 -*-
"""
Modelos de Dominio y Persistencia: Fidelización Gamificada (M16 - CU21)
Gestión de puntos, progresión en niveles (Bronce a Diamante), insignias y canjes.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
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
    puntos_actuales = Column(Integer, nullable=False, default=100)  # 100 puntos de bienvenida
    puntos_historicos = Column(Integer, nullable=False, default=100)
    nivel = Column(String(30), nullable=False, default="BRONCE")  # BRONCE, PLATA, ORO, DIAMANTE
    insignias_json = Column(Text, nullable=False, default="[]")  # JSON string con identificadores
    beneficios_canjeados_json = Column(Text, nullable=False, default="[]")
    actualizado_en = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relación
    usuario = relationship("Usuario", foreign_keys=[id_usuario])
