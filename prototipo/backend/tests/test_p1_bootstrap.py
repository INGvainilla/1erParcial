# -*- coding: utf-8 -*-
"""
Pruebas Automatizadas de Bootstrap e Idempotencia (Fase 1 - Presentación 1)
Verifica que ensure_columns y bootstrap_tenants sean completamente idempotentes,
que no dupliquen entidades y que los planes se configuren según el enunciado:
Plan Básico: max_sucursales=2
Plan Profesional: max_sucursales=10
"""
import pytest
from app.core.database import SessionLocal, engine
from app.core.migrations import ensure_columns
from app.scripts.bootstrap_tenants import bootstrap_tenants
from app.modules.p01_seguridad_acceso.tenants.models import Empresa, PlanSuscripcion, SuscripcionEmpresa
from app.modules.p01_seguridad_acceso.auth.models import Usuario


def test_f1_bootstrap_idempotente():
    db = SessionLocal()
    try:
        # 1. Contar entidades antes
        cant_planes_ant = db.query(PlanSuscripcion).count()
        cant_empresas_ant = db.query(Empresa).count()
        cant_susc_ant = db.query(SuscripcionEmpresa).count()
        cant_usuarios_ant = db.query(Usuario).count()

        # 2. Ejecutar bootstrap nuevamente
        resumen = bootstrap_tenants(db=db)

        # 3. Validar que no se crearon duplicados
        assert db.query(PlanSuscripcion).count() == cant_planes_ant
        assert db.query(Empresa).count() == cant_empresas_ant
        assert db.query(SuscripcionEmpresa).count() == cant_susc_ant
        assert db.query(Usuario).count() == cant_usuarios_ant

        # 4. Validar configuración formal de planes según Sección 9.4 del examen
        plan_basico = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_BASICO").first()
        assert plan_basico is not None
        assert plan_basico.max_sucursales == 2

        plan_pro = db.query(PlanSuscripcion).filter(PlanSuscripcion.codigo == "PLAN_PRO").first()
        assert plan_pro is not None
        assert plan_pro.max_sucursales == 10  # Enunciado exige hasta 10 sucursales para Profesional

        # 5. Validar que superadmin existe y no tiene restricción de empresa
        superadmin = db.query(Usuario).filter(Usuario.email == "superadmin@fashionstore.bo").first()
        assert superadmin is not None
        assert superadmin.rol == "SUPER_ADMIN"
        assert superadmin.id_empresa is None

        # 6. Validar que admin de Empresa 2 existe
        admin_e2 = db.query(Usuario).filter(Usuario.email == "admin@elegance.bo").first()
        assert admin_e2 is not None
        assert admin_e2.id_empresa == 2
    finally:
        db.close()


def test_f1_ensure_columns_idempotente():
    # Ejecutar ensure_columns sobre el motor actual no debe arrojar excepciones
    # y debe retornar lista vacía porque todas las columnas ya fueron aseguradas
    cambios = ensure_columns(engine)
    assert isinstance(cambios, list)
    # Ninguna columna faltaba porque ya se aplicaron
    assert len(cambios) == 0
