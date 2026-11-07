# -*- coding: utf-8 -*-
"""
Módulo de Compras y Aprovisionamiento (CU20) con Restricción Exclusiva Desktop.
Por diseño arquitectónico (CU20), este módulo solo está habilitado para terminales Web Desktop
con pantallas >= 768px y User-Agent de escritorio, bloqueando clientes móviles.
Incluye ciclo completo: EMITIDA -> AUTORIZADA -> RECEPCIONADA_CONFORME (con recálculo CPP y Kardex).
"""
import json
import re
import uuid
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p01_seguridad_acceso.tenants.models import Empresa
from app.modules.p05_inventario_costos_analitica.inventario.service import InventarioControl
from app.modules.p05_inventario_costos_analitica.inventario.schemas import EntradaLoteCreate

router = APIRouter(prefix="/compras", tags=["Aprovisionamiento y Compras Desktop-Only (CU20)"])

MOBILE_REGEX = re.compile(r"Mobile|Android|iPhone|iPad|webOS|BlackBerry|IEMobile|Opera Mini", re.IGNORECASE)
ROLES_AUTORIZADOS_COMPRAS = {"SUPER_ADMIN", "ADMINISTRADOR", "ADMIN_EMPRESA", "ENCARGADO_SUCURSAL", "LOGISTICA"}


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


def verificar_rol_compras(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol not in ROLES_AUTORIZADOS_COMPRAS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso Restringido (CU20): Su rol '{current_user.rol}' no posee privilegios administrativos o de compras para esta operación."
        )
    return current_user


class ItemCompra(BaseModel):
    id_producto: int
    talla: str
    color: str = "Blanco"
    cantidad: int = Field(..., gt=0)
    costo_unitario: float = Field(..., gt=0.0)


class OrdenCompraCreate(BaseModel):
    id_proveedor: int
    id_sucursal_destino: int
    items: List[ItemCompra]
    observaciones: Optional[str] = None


class ItemRecepcion(BaseModel):
    id_producto: int
    talla: str
    color: str = "Blanco"
    cantidad_recibida: int = Field(..., ge=0)
    costo_unitario: Optional[float] = None


class RecepcionOrdenCompraIn(BaseModel):
    nro_factura: str = Field(..., min_length=1)
    items_recibidos: Optional[List[ItemRecepcion]] = None
    observaciones: Optional[str] = None


@router.post("", summary="CU20: Emitir Orden de Compra (Exclusivo Web Desktop)", dependencies=[Depends(verificar_cliente_desktop)])
def emitir_orden_compra(
    orden_in: OrdenCompraCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_rol_compras)
):
    id_empresa = current_user.id_empresa or 1
    monto_total = sum(it.cantidad * it.costo_unitario for it in orden_in.items)
    subtotal = round(monto_total, 2)
    iva = round(subtotal * 0.13, 2)
    total_con_iva = round(subtotal + iva, 2)
    cod_orden = f"OC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

    detalles_json = json.dumps([it.model_dump() for it in orden_in.items])
    ua = request.headers.get("user-agent", "Desktop-Browser")
    client_ip = request.client.host if request.client else "127.0.0.1"

    insert_sql = text("""
        INSERT INTO ordenes_compra_desktop
        (codigo_orden, id_empresa, id_proveedor, id_sucursal_destino, id_usuario, monto_total, subtotal, iva, total_con_iva, estado, user_agent, ip_origen, detalles_json, observaciones)
        VALUES (:cod, :id_emp, :id_prov, :id_suc, :id_usr, :total, :sub, :iva, :tot_iva, 'EMITIDA', :ua, :ip, :detalles, :obs)
        RETURNING id_orden_compra, codigo_orden, monto_total, estado, fecha_emision
    """)
    res = db.execute(insert_sql, {
        "cod": cod_orden,
        "id_emp": id_empresa,
        "id_prov": orden_in.id_proveedor,
        "id_suc": orden_in.id_sucursal_destino,
        "id_usr": current_user.id_usuario,
        "total": monto_total,
        "sub": subtotal,
        "iva": iva,
        "tot_iva": total_con_iva,
        "ua": ua[:250],
        "ip": client_ip,
        "detalles": detalles_json,
        "obs": orden_in.observaciones or ""
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


@router.post("/{id_orden_compra}/autorizar", summary="CU20: Autorizar Orden de Compra y Validar Presupuesto", dependencies=[Depends(verificar_cliente_desktop)])
def autorizar_orden_compra(
    id_orden_compra: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_rol_compras)
):
    id_empresa = current_user.id_empresa or 1
    query = text("""
        SELECT id_orden_compra, codigo_orden, id_empresa, monto_total, estado
        FROM ordenes_compra_desktop
        WHERE id_orden_compra = :id AND id_empresa = :emp_id
    """)
    orden = db.execute(query, {"id": id_orden_compra, "emp_id": id_empresa}).mappings().first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de compra no encontrada.")

    if orden["estado"] != "EMITIDA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden se encuentra en estado '{orden['estado']}' y no puede ser autorizada."
        )

    # Validar presupuesto de la empresa
    empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    monto_total = Decimal(str(orden["monto_total"]))
    if empresa and empresa.presupuesto_disponible is not None:
        if empresa.presupuesto_disponible < monto_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Presupuesto insuficiente: La empresa cuenta con Bs. {empresa.presupuesto_disponible:.2f} y la orden requiere Bs. {monto_total:.2f}."
            )
        empresa.presupuesto_disponible = empresa.presupuesto_disponible - monto_total

    # Actualizar estado a AUTORIZADA
    update_sql = text("""
        UPDATE ordenes_compra_desktop
        SET estado = 'AUTORIZADA',
            fecha_aprobacion = :now,
            id_usuario_aprueba = :usr
        WHERE id_orden_compra = :id
    """)
    db.execute(update_sql, {
        "now": datetime.utcnow(),
        "usr": current_user.id_usuario,
        "id": id_orden_compra
    })
    db.commit()

    return {
        "id_orden_compra": orden["id_orden_compra"],
        "codigo_orden": orden["codigo_orden"],
        "estado": "AUTORIZADA",
        "monto_total": float(orden["monto_total"]),
        "presupuesto_restante": float(empresa.presupuesto_disponible) if empresa and empresa.presupuesto_disponible is not None else None,
        "mensaje": "Orden de compra debidamente autorizada contra el presupuesto institucional."
    }


@router.post("/{id_orden_compra}/recepcionar", summary="CU20: Recepcionar Lote, Recalcular CPP e Ingresar a Kardex", dependencies=[Depends(verificar_cliente_desktop)])
def recepcionar_orden_compra(
    id_orden_compra: int,
    recepcion_in: RecepcionOrdenCompraIn,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_rol_compras)
):
    id_empresa = current_user.id_empresa or 1
    query = text("""
        SELECT id_orden_compra, codigo_orden, id_empresa, id_sucursal_destino, monto_total, estado, detalles_json
        FROM ordenes_compra_desktop
        WHERE id_orden_compra = :id AND id_empresa = :emp_id
    """)
    orden = db.execute(query, {"id": id_orden_compra, "emp_id": id_empresa}).mappings().first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de compra no encontrada.")

    if orden["estado"] in ["RECEPCIONADA_CONFORME", "RECEPCIONADA_CON_DISCREPANCIA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden ya fue recepcionada con estado '{orden['estado']}'."
        )

    if orden["estado"] not in ["EMITIDA", "AUTORIZADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede recepcionar una orden en estado '{orden['estado']}'."
        )

    items_ordenados = json.loads(orden["detalles_json"]) if orden["detalles_json"] else []
    
    # Mapear ítems recibidos
    recibidos_dict = {}
    if recepcion_in.items_recibidos:
        for r_item in recepcion_in.items_recibidos:
            key = (r_item.id_producto, r_item.talla.strip().upper(), (r_item.color or "Blanco").strip())
            recibidos_dict[key] = r_item
    else:
        # Si no se especifica lista diferenciada, se asume recepción total conforme a lo emitido
        for o_item in items_ordenados:
            key = (o_item["id_producto"], o_item["talla"].strip().upper(), (o_item.get("color") or "Blanco").strip())
            recibidos_dict[key] = ItemRecepcion(
                id_producto=o_item["id_producto"],
                talla=o_item["talla"],
                color=o_item.get("color") or "Blanco",
                cantidad_recibida=o_item["cantidad"],
                costo_unitario=o_item["costo_unitario"]
            )

    discrepancias = []
    items_procesados = []

    for o_item in items_ordenados:
        key = (o_item["id_producto"], o_item["talla"].strip().upper(), (o_item.get("color") or "Blanco").strip())
        recibido = recibidos_dict.get(key)
        cant_recibida = recibido.cantidad_recibida if recibido else 0
        costo_unit = recibido.costo_unitario if (recibido and recibido.costo_unitario) else o_item["costo_unitario"]

        if cant_recibida != o_item["cantidad"]:
            discrepancias.append({
                "id_producto": o_item["id_producto"],
                "talla": o_item["talla"],
                "color": o_item.get("color") or "Blanco",
                "cantidad_pedida": o_item["cantidad"],
                "cantidad_recibida": cant_recibida,
                "diferencia": cant_recibida - o_item["cantidad"]
            })

        if cant_recibida > 0:
            # Procesar ingreso a inventario con recálculo Half-Up de CPP y Kardex
            lote_dto = EntradaLoteCreate(
                id_sucursal=orden["id_sucursal_destino"],
                id_producto=o_item["id_producto"],
                talla=o_item["talla"],
                color=o_item.get("color") or "Blanco",
                cantidad_recibida=cant_recibida,
                costo_unitario_compra=Decimal(str(costo_unit)),
                numero_factura=f"OC-{orden['codigo_orden']} | FACT-{recepcion_in.nro_factura.strip()}"
            )
            kardex_res = InventarioControl.procesar_entrada_mercaderia(db, lote_dto, current_user=current_user)
            items_procesados.append({
                "id_producto": o_item["id_producto"],
                "talla": o_item["talla"],
                "cantidad_ingresada": cant_recibida,
                "nuevo_stock_resultante": kardex_res.saldo_cantidad_resultante,
                "nuevo_cpp_resultante": float(kardex_res.saldo_cpp_resultante)
            })

    estado_final = "RECEPCIONADA_CON_DISCREPANCIA" if discrepancias else "RECEPCIONADA_CONFORME"
    discrepancias_json = json.dumps(discrepancias) if discrepancias else None

    update_sql = text("""
        UPDATE ordenes_compra_desktop
        SET estado = :estado,
            nro_factura = :factura,
            fecha_recepcion = :now,
            id_usuario_recepcion = :usr,
            discrepancias_json = :disc
        WHERE id_orden_compra = :id
    """)
    db.execute(update_sql, {
        "estado": estado_final,
        "factura": recepcion_in.nro_factura.strip(),
        "now": datetime.utcnow(),
        "usr": current_user.id_usuario,
        "disc": discrepancias_json,
        "id": id_orden_compra
    })
    db.commit()

    return {
        "id_orden_compra": orden["id_orden_compra"],
        "codigo_orden": orden["codigo_orden"],
        "estado": estado_final,
        "nro_factura": recepcion_in.nro_factura.strip(),
        "tiene_discrepancias": bool(discrepancias),
        "discrepancias": discrepancias,
        "items_ingresados_kardex": items_procesados,
        "mensaje": f"Mercadería recepcionada bajo estado '{estado_final}'. Stock y CPP actualizados en Kardex."
    }


@router.get("", summary="Listar Órdenes de Compra", dependencies=[Depends(verificar_cliente_desktop)])
def listar_ordenes_compra(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_rol_compras)
):
    id_empresa = current_user.id_empresa or 1
    query = text("""
        SELECT oc.id_orden_compra, oc.codigo_orden, oc.id_proveedor, p.razon_social as nombre_proveedor,
               oc.id_sucursal_destino, s.nombre_sucursal, oc.monto_total, oc.estado,
               oc.nro_factura, oc.detalles_json, oc.fecha_emision, oc.fecha_aprobacion, oc.fecha_recepcion,
               oc.discrepancias_json
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
            "nro_factura": r["nro_factura"],
            "items": json.loads(r["detalles_json"]) if r["detalles_json"] else [],
            "discrepancias": json.loads(r["discrepancias_json"]) if r["discrepancias_json"] else [],
            "fecha_emision": str(r["fecha_emision"]) if r["fecha_emision"] else None,
            "fecha_aprobacion": str(r["fecha_aprobacion"]) if r["fecha_aprobacion"] else None,
            "fecha_recepcion": str(r["fecha_recepcion"]) if r["fecha_recepcion"] else None
        })
    return result

