# -*- coding: utf-8 -*-
"""
Módulo de Compras y Aprovisionamiento (CU20) con Restricción Exclusiva Desktop.
Por diseño arquitectónico (CU20), este módulo solo está habilitado para terminales Web Desktop
con pantallas >= 768px y User-Agent de escritorio, bloqueando clientes móviles.
"""
import json
import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario

router = APIRouter(prefix="/compras", tags=["Aprovisionamiento y Compras Desktop-Only (CU20)"])

MOBILE_REGEX = re.compile(r"Mobile|Android|iPhone|iPad|webOS|BlackBerry|IEMobile|Opera Mini", re.IGNORECASE)


def verificar_cliente_desktop(
    request: Request,
    user_agent: Optional[str] = Header(None),
    x_viewport_width: Optional[int] = Header(None)
):
    ua = user_agent or request.headers.get("user-agent", "")
    if MOBILE_REGEX.search(ua):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso Restringido (CU20): El módulo de Compras y Aprovisionamiento es exclusivo para la plataforma Web Desktop. Se detectó un dispositivo móvil."
        )

    if x_viewport_width is not None and x_viewport_width < 768:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso Restringido (CU20): La resolución de pantalla ({x_viewport_width}px) no cumple con el ancho mínimo requerido de 768px para gestión de compras de escritorio."
        )


class ItemCompra(BaseModel):
    id_producto: int
    talla: str
    color: str = "ESTANDAR"
    cantidad: int = Field(..., gt=0)
    costo_unitario: float = Field(..., gt=0.0)


class OrdenCompraCreate(BaseModel):
    id_proveedor: int
    id_sucursal_destino: int
    items: List[ItemCompra]
    observaciones: Optional[str] = None


@router.post("", summary="CU20: Emitir Orden de Compra (Exclusivo Web Desktop)", dependencies=[Depends(verificar_cliente_desktop)])
def emitir_orden_compra(
    orden_in: OrdenCompraCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    id_empresa = current_user.id_empresa or 1
    monto_total = sum(it.cantidad * it.costo_unitario for it in orden_in.items)
    cod_orden = f"OC-{datetime.utcnow().strftime('%Y%m%d')}-{datetime.utcnow().strftime('%H%M%S')}"

    detalles_json = json.dumps([it.model_dump() for it in orden_in.items])
    ua = request.headers.get("user-agent", "Desktop-Browser")
    client_ip = request.client.host if request.client else "127.0.0.1"

    insert_sql = text("""
        INSERT INTO ordenes_compra_desktop
        (codigo_orden, id_empresa, id_proveedor, id_sucursal_destino, monto_total, estado, user_agent, ip_origen, detalles_json)
        VALUES (:cod, :id_emp, :id_prov, :id_suc, :total, 'EMITIDA', :ua, :ip, :detalles)
        RETURNING id_orden_compra, codigo_orden, monto_total, estado, fecha_emision
    """)
    res = db.execute(insert_sql, {
        "cod": cod_orden,
        "id_emp": id_empresa,
        "id_prov": orden_in.id_proveedor,
        "id_suc": orden_in.id_sucursal_destino,
        "total": monto_total,
        "ua": ua[:250],
        "ip": client_ip,
        "detalles": detalles_json
    }).mappings().first()

    db.commit()

    return {
        "id_orden_compra": res["id_orden_compra"],
        "codigo_orden": res["codigo_orden"],
        "monto_total": float(res["monto_total"]),
        "estado": res["estado"],
        "fecha_emision": str(res["fecha_emision"]),
        "mensaje": "Orden de compra emitida exitosamente bajo plataforma Web Desktop."
    }


@router.get("", summary="Listar Órdenes de Compra", dependencies=[Depends(verificar_cliente_desktop)])
def listar_ordenes_compra(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    id_empresa = current_user.id_empresa or 1
    query = text("""
        SELECT oc.id_orden_compra, oc.codigo_orden, oc.id_proveedor, p.razon_social as nombre_proveedor,
               oc.id_sucursal_destino, s.nombre_sucursal, oc.monto_total, oc.estado,
               oc.detalles_json, oc.fecha_emision
        FROM ordenes_compra_desktop oc
        LEFT JOIN proveedores p ON oc.id_proveedor = p.id_proveedor
        LEFT JOIN sucursales s ON oc.id_sucursal_destino = s.id_sucursal
        WHERE oc.id_empresa = :emp_id
        ORDER BY oc.id_orden_compra DESC
    """)
    rows = db.execute(query, {"emp_id": id_empresa}).mappings().all()

    result = []
    for r in rows:
        result.append({
            "id_orden_compra": r["id_orden_compra"],
            "codigo_orden": r["codigo_orden"],
            "proveedor": r["nombre_proveedor"] or f"Proveedor #{r['id_proveedor']}",
            "sucursal": r["nombre_sucursal"] or f"Sucursal #{r['id_sucursal_destino']}",
            "monto_total": float(r["monto_total"]),
            "estado": r["estado"],
            "items": json.loads(r["detalles_json"]) if r["detalles_json"] else [],
            "fecha_emision": str(r["fecha_emision"])
        })
    return result

