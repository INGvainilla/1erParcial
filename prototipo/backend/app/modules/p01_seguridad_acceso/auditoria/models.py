# -*- coding: utf-8 -*-
"""
Modelos de datos para CU21: Gestionar Bitácora y Auditoría de Accesos Multitenant.
Reexporta y tipa la entidad BitacoraAcceso.
"""
from app.modules.p01_seguridad_acceso.auth.models import BitacoraAcceso, Usuario

__all__ = ["BitacoraAcceso", "Usuario"]

