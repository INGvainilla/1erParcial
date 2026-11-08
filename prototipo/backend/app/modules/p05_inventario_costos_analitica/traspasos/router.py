# -*- coding: utf-8 -*-
"""
Módulo de Traspasos Inter-Sucursales (CU14).
Permite transferir stock entre sucursales de la misma empresa con trazabilidad:
- Descuento en origen
- Retención en estado 'EN_TRANSITO'
- Confirmación y acreditación en destino con doble asentamiento en Kardex.
Compatible con SQLite local y PostgreSQL.
"""
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario

router = APIRouter(prefix="/traspasos", tags=["Traspasos Inter-Sucursales (CU14)"])


class ItemTraspaso(BaseModel):
    id_producto: int
    talla: str
    color: str = "ESTANDAR"
    cantidad: int = Field(..., gt=0)


class TraspasoCreate(BaseModel):
    id_sucursal_origen: int
    id_sucursal_destino: int
    items: List[ItemTraspaso]
    observaciones: Optional[str] = None


@router.post("", summary="CU14: Iniciar Traspaso Inter-Sucursal")
def crear_traspaso(
    traspaso_in: TraspasoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    id_empresa = current_user.id_empresa or 1
    if traspaso_in.id_sucursal_origen == traspaso_in.id_sucursal_destino:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La sucursal origen y destino no pueden ser iguales."
        )

    # 1. Validar stock disponible en origen y descontar
    for item in traspaso_in.items:
        check_stock = text("""
            SELECT id_inventario, stock_disponible, costo_promedio_ponderado
            FROM inventario
            WHERE id_producto = :id_p AND talla = :talla AND id_sucursal = :id_s
        """)
        inv = db.execute(check_stock, {
            "id_p": item.id_producto,
            "talla": item.talla,
            "id_s": traspaso_in.id_sucursal_origen
        }).mappings().first()

        if not inv or inv["stock_disponible"] < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Stock insuficiente en origen para producto #{item.id_producto} talla {item.talla}. Disponible: {inv['stock_disponible'] if inv else 0}"
            )

        # Descontar stock en origen
        update_origen = text("""
            UPDATE inventario
            SET stock_disponible = stock_disponible - :cant,
                stock_fisico = stock_fisico - :cant,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id_inventario = :id_inv
        """)
        db.execute(update_origen, {"cant": item.cantidad, "id_inv": inv["id_inventario"]})

        # Registrar salida en kardex
        asentar_kardex = text("""
            INSERT INTO kardex_movimientos 
            (id_inventario, tipo_movimiento, cantidad, costo_unitario_movimiento, saldo_cantidad_resultante, saldo_cpp_resultante, referencia_documento, fecha_hora)
            VALUES (:id_inv, 'TRASPASO_SALIDA', :cant, :costo, :saldo, :costo, 'Traspaso a sucursal destino', CURRENT_TIMESTAMP)
        """)
        db.execute(asentar_kardex, {
            "id_inv": inv["id_inventario"],
            "cant": item.cantidad,
            "saldo": inv["stock_disponible"] - item.cantidad,
            "costo": inv["costo_promedio_ponderado"] or 0.0
        })

    # 2. Registrar en tabla de traspasos
    cod_traspaso = f"TRASP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    items_json = json.dumps([item.model_dump() for item in traspaso_in.items])

    insert_traspaso = text("""
        INSERT INTO traspasos_inter_sucursal
        (codigo_traspaso, id_empresa, id_sucursal_origen, id_sucursal_destino, id_usuario_solicita, estado, detalles_json, observaciones)
        VALUES (:cod, :id_emp, :orig, :dest, :id_u, 'EN_TRANSITO', :detalles, :obs)
    """)
    db.execute(insert_traspaso, {
        "cod": cod_traspaso,
        "id_emp": id_empresa,
        "orig": traspaso_in.id_sucursal_origen,
        "dest": traspaso_in.id_sucursal_destino,
        "id_u": current_user.id_usuario,
        "detalles": items_json,
        "obs": traspaso_in.observaciones
    })
    db.commit()

    res = db.execute(
        text("SELECT id_traspaso, codigo_traspaso, estado, fecha_solicitud FROM traspasos_inter_sucursal WHERE codigo_traspaso = :cod"),
        {"cod": cod_traspaso}
    ).mappings().first()

    return {
        "id_traspaso": res["id_traspaso"] if res else None,
        "codigo_traspaso": res["codigo_traspaso"] if res else cod_traspaso,
        "estado": res["estado"] if res else "EN_TRANSITO",
        "mensaje": "Traspaso registrado exitosamente en estado EN_TRANSITO",
        "items": traspaso_in.items
    }


@router.post("/{id_traspaso}/recibir", summary="CU14: Confirmar Recepción Física en Sucursal Destino")
def recibir_traspaso(
    id_traspaso: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    check_traspaso = text("""
        SELECT id_traspaso, codigo_traspaso, id_empresa, id_sucursal_destino, estado, detalles_json
        FROM traspasos_inter_sucursal
        WHERE id_traspaso = :id
    """)
    traspaso = db.execute(check_traspaso, {"id": id_traspaso}).mappings().first()

    if not traspaso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traspaso no encontrado.")

    if traspaso["estado"] != "EN_TRANSITO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El traspaso se encuentra en estado '{traspaso['estado']}', no puede ser recibido."
        )

    items = json.loads(traspaso["detalles_json"])

    for item in items:
        # Buscar o crear inventario en destino
        check_dest = text("""
            SELECT id_inventario, stock_disponible, costo_promedio_ponderado
            FROM inventario
            WHERE id_producto = :id_p AND talla = :talla AND id_sucursal = :id_s
        """)
        inv_dest = db.execute(check_dest, {
            "id_p": item["id_producto"],
            "talla": item["talla"],
            "id_s": traspaso["id_sucursal_destino"]
        }).mappings().first()

        if inv_dest:
            update_dest = text("""
                UPDATE inventario
                SET stock_disponible = stock_disponible + :cant,
                    stock_fisico = stock_fisico + :cant,
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id_inventario = :id_inv
            """)
            db.execute(update_dest, {"cant": item["cantidad"], "id_inv": inv_dest["id_inventario"]})
            id_inv_target = inv_dest["id_inventario"]
            saldo_nuevo = inv_dest["stock_disponible"] + item["cantidad"]
            costo = inv_dest["costo_promedio_ponderado"] or 0.0
        else:
            insert_dest = text("""
                INSERT INTO inventario (id_sucursal, id_producto, talla, color, stock_fisico, stock_reservado, stock_disponible, stock_minimo, ultimo_costo_compra, costo_promedio_ponderado, id_empresa)
                VALUES (:id_s, :id_p, :talla, :color, :cant, 0, :cant, 2, 50.0, 50.0, :id_emp)
            """)
            db.execute(insert_dest, {
                "id_s": traspaso["id_sucursal_destino"],
                "id_p": item["id_producto"],
                "talla": item["talla"],
                "color": item.get("color", "ESTANDAR"),
                "cant": item["cantidad"],
                "id_emp": traspaso["id_empresa"]
            })
            new_inv = db.execute(check_dest, {
                "id_p": item["id_producto"],
                "talla": item["talla"],
                "id_s": traspaso["id_sucursal_destino"]
            }).mappings().first()
            id_inv_target = new_inv["id_inventario"] if new_inv else 1
            saldo_nuevo = item["cantidad"]
            costo = 50.0

        # Asentar entrada en kardex destino
        asentar_kardex_in = text("""
            INSERT INTO kardex_movimientos 
            (id_inventario, tipo_movimiento, cantidad, costo_unitario_movimiento, saldo_cantidad_resultante, saldo_cpp_resultante, referencia_documento, fecha_hora)
            VALUES (:id_inv, 'TRASPASO_ENTRADA', :cant, :costo, :saldo, :costo, 'Recepción de traspaso inter-sucursal', CURRENT_TIMESTAMP)
        """)
        db.execute(asentar_kardex_in, {
            "id_inv": id_inv_target,
            "cant": item["cantidad"],
            "saldo": saldo_nuevo,
            "costo": costo
        })

    # Actualizar estado de traspaso
    update_traspaso = text("""
        UPDATE traspasos_inter_sucursal
        SET estado = 'RECIBIDO',
            id_usuario_recibe = :id_u,
            fecha_recepcion = CURRENT_TIMESTAMP
        WHERE id_traspaso = :id
    """)
    db.execute(update_traspaso, {"id": id_traspaso, "id_u": current_user.id_usuario})

    db.commit()

    return {
        "status": "RECIBIDO",
        "id_traspaso": id_traspaso,
        "codigo_traspaso": traspaso["codigo_traspaso"],
        "mensaje": "Stock acreditado exitosamente en sucursal destino y asentado en Kardex."
    }


@router.get("", summary="Listar Traspasos")
def listar_traspasos(
    id_empresa: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    emp_id = id_empresa if current_user.rol == "SUPER_ADMIN" and id_empresa else (current_user.id_empresa or 1)
    query = text("""
        SELECT t.id_traspaso, t.codigo_traspaso, t.id_sucursal_origen, t.id_sucursal_destino,
               so.nombre_sucursal as nombre_origen, sd.nombre_sucursal as nombre_destino,
               t.estado, t.detalles_json, t.fecha_solicitud, t.fecha_recepcion
        FROM traspasos_inter_sucursal t
        LEFT JOIN sucursales so ON t.id_sucursal_origen = so.id_sucursal
        LEFT JOIN sucursales sd ON t.id_sucursal_destino = sd.id_sucursal
        WHERE t.id_empresa = :emp_id
        ORDER BY t.id_traspaso DESC
    """)
    rows = db.execute(query, {"emp_id": emp_id}).mappings().all()

    result = []
    for r in rows:
        result.append({
            "id_traspaso": r["id_traspaso"],
            "codigo_traspaso": r["codigo_traspaso"],
            "id_sucursal_origen": r["id_sucursal_origen"],
            "nombre_origen": r["nombre_origen"],
            "id_sucursal_destino": r["id_sucursal_destino"],
            "nombre_destino": r["nombre_destino"],
            "estado": r["estado"],
            "items": json.loads(r["detalles_json"]) if r["detalles_json"] else [],
            "fecha_solicitud": str(r["fecha_solicitud"]),
            "fecha_recepcion": str(r["fecha_recepcion"]) if r["fecha_recepcion"] else None
        })
    return result
