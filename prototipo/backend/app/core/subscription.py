# -*- coding: utf-8 -*-
"""
Motor de Reglas de Planes y Suscripciones SaaS (CU01, CU02, CU03, CU05)
Enfuerza vigencia temporal, límites de sucursales/usuarios y control de downgrade (Sección 9.3-9.5).
"""
from datetime import date, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.tenants.models import Empresa, PlanSuscripcion, SuscripcionEmpresa
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal


def obtener_suscripcion_vigente(db: Session, id_empresa: int) -> Optional[SuscripcionEmpresa]:
    """
    Recupera la suscripción activa evaluando de forma perezosa la fecha de vencimiento.
    Si ya expiró, transiciona su estado a VENCIDA automáticamente sin requerir cron.
    """
    susc = db.query(SuscripcionEmpresa).filter(
        SuscripcionEmpresa.id_empresa == id_empresa,
        SuscripcionEmpresa.estado == "ACTIVA"
    ).order_by(SuscripcionEmpresa.fecha_vencimiento.desc()).first()

    if not susc:
        return None

    if susc.fecha_vencimiento < date.today():
        susc.estado = "VENCIDA"
        db.commit()
        db.refresh(susc)
        return None

    return susc


def exigir_suscripcion_vigente(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependencia de seguridad que bloquea operaciones de escritura si la empresa
    no está ACTIVA o su suscripción no está vigente (responde 403 SUSCRIPCION_NO_VIGENTE).
    SUPER_ADMIN queda exento.
    """
    if current_user.rol == "SUPER_ADMIN":
        return current_user

    if not current_user.id_empresa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SUSCRIPCION_NO_VIGENTE: El usuario no cuenta con empresa asignada."
        )

    empresa = db.query(Empresa).filter(Empresa.id_empresa == current_user.id_empresa).first()
    if not empresa or empresa.estado != "ACTIVA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SUSCRIPCION_NO_VIGENTE: La empresa se encuentra suspendida o inactiva."
        )

    susc = obtener_suscripcion_vigente(db, current_user.id_empresa)
    if not susc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SUSCRIPCION_NO_VIGENTE: La suscripción de la empresa ha vencido o no existe."
        )

    return current_user


def verificar_limite_sucursales(db: Session, id_empresa: int) -> None:
    """
    Valida la cuota máxima de sucursales físicas según el plan contratado.
    Lanza 409 LIMITE_PLAN_SUCURSALES si se excede la capacidad.
    """
    susc = obtener_suscripcion_vigente(db, id_empresa)
    if not susc or not susc.plan:
        return

    cant_actual = db.query(Sucursal).filter(
        Sucursal.id_empresa == id_empresa,
        Sucursal.estado != "CERRADA"
    ).count()

    if cant_actual >= susc.plan.max_sucursales:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"LIMITE_PLAN_SUCURSALES: Su plan '{susc.plan.nombre}' permite un máximo de {susc.plan.max_sucursales} sucursales. Uso actual: {cant_actual}."
        )


def verificar_limite_usuarios(db: Session, id_empresa: int, rol: str) -> None:
    """
    Valida la cuota de usuarios de staff (admin, encargado, cajero, logística).
    Los clientes auto-registrados no computan contra este límite.
    Lanza 409 LIMITE_PLAN_USUARIOS si se supera la cuota.
    """
    if rol.upper() == "CLIENTE":
        return

    susc = obtener_suscripcion_vigente(db, id_empresa)
    if not susc or not susc.plan:
        return

    cant_staff = db.query(Usuario).filter(
        Usuario.id_empresa == id_empresa,
        Usuario.rol.in_(["ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA"]),
        Usuario.estado_cuenta == "ACTIVO"
    ).count()

    if cant_staff >= susc.plan.max_usuarios:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"LIMITE_PLAN_USUARIOS: Su plan '{susc.plan.nombre}' permite un máximo de {susc.plan.max_usuarios} empleados activos. Uso actual: {cant_staff}."
        )


def cambiar_plan(db: Session, id_empresa: int, id_nuevo_plan: int) -> SuscripcionEmpresa:
    """
    Efectúa cambio de plan de suscripción inmediato.
    Rechaza el downgrade con 409 si el uso actual supera las capacidades del nuevo plan.
    """
    nuevo_plan = db.query(PlanSuscripcion).filter(PlanSuscripcion.id_plan == id_nuevo_plan).first()
    if not nuevo_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan con ID {id_nuevo_plan} no encontrado."
        )

    # Validar cuota de sucursales activas contra nuevo plan
    cant_sucursales = db.query(Sucursal).filter(
        Sucursal.id_empresa == id_empresa,
        Sucursal.estado != "CERRADA"
    ).count()
    if cant_sucursales > nuevo_plan.max_sucursales:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"No es posible cambiar al plan '{nuevo_plan.nombre}': posee {cant_sucursales} sucursales activas y el límite del nuevo plan es {nuevo_plan.max_sucursales}."
        )

    # Validar cuota de empleados activos contra nuevo plan
    cant_staff = db.query(Usuario).filter(
        Usuario.id_empresa == id_empresa,
        Usuario.rol.in_(["ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA"]),
        Usuario.estado_cuenta == "ACTIVO"
    ).count()
    if cant_staff > nuevo_plan.max_usuarios:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"No es posible cambiar al plan '{nuevo_plan.nombre}': posee {cant_staff} empleados activos y el límite del nuevo plan es {nuevo_plan.max_usuarios}."
        )

    # Transicionar suscripciones activas previas a CAMBIADA
    db.query(SuscripcionEmpresa).filter(
        SuscripcionEmpresa.id_empresa == id_empresa,
        SuscripcionEmpresa.estado == "ACTIVA"
    ).update({"estado": "CAMBIADA"})

    nueva_suscripcion = SuscripcionEmpresa(
        id_empresa=id_empresa,
        id_plan=nuevo_plan.id_plan,
        fecha_inicio=date.today(),
        fecha_vencimiento=date.today() + timedelta(days=30),
        estado="ACTIVA",
        auto_renovar=True
    )
    db.add(nueva_suscripcion)
    db.commit()
    db.refresh(nueva_suscripcion)
    return nueva_suscripcion


def obtener_capacidades(db: Session, id_empresa: int) -> Dict[str, Any]:
    """
    Retorna el estado operativo, días restantes y consumo de cuotas del tenant.
    """
    susc = obtener_suscripcion_vigente(db, id_empresa)
    dias_restantes = (susc.fecha_vencimiento - date.today()).days if susc else 0
    if dias_restantes < 0:
        dias_restantes = 0

    cant_sucursales = db.query(Sucursal).filter(
        Sucursal.id_empresa == id_empresa,
        Sucursal.estado != "CERRADA"
    ).count()

    cant_staff = db.query(Usuario).filter(
        Usuario.id_empresa == id_empresa,
        Usuario.rol.in_(["ADMINISTRADOR", "ENCARGADO_SUCURSAL", "CAJERO", "LOGISTICA"]),
        Usuario.estado_cuenta == "ACTIVO"
    ).count()

    plan = susc.plan if susc else None
    return {
        "vigente": susc is not None,
        "dias_restantes": dias_restantes,
        "fecha_vencimiento": susc.fecha_vencimiento if susc else None,
        "plan_nombre": plan.nombre if plan else "Sin Plan",
        "plan_codigo": plan.codigo if plan else None,
        "sucursales": {
            "usadas": cant_sucursales,
            "max": plan.max_sucursales if plan else 0
        },
        "usuarios": {
            "usadas": cant_staff,
            "max": plan.max_usuarios if plan else 0
        },
        "permite_reportes_ia": plan.permite_reportes_ia if plan else False,
        "permite_ml_dashboard": plan.permite_ml_dashboard if plan else False,
        "soporta_offline": plan.soporta_offline if plan else False
    }
