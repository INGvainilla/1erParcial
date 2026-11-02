# -*- coding: utf-8 -*-
"""
Enrutador REST FastAPI para Sincronización Transaccional Offline-First (CU08, CU11, CU12).
Soporta persistencia idempotente con UUID v4 y cabecera X-Idempotency-Key.
Compatible tanto con SQLite local como PostgreSQL.
"""
import json
import hashlib
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.p01_seguridad_acceso.auth.models import Usuario

router = APIRouter(prefix="/sync", tags=["Offline-First & Sincronización Idempotente (CU08, CU11, CU12)"])


# --- Schemas ---
class OperacionOfflineIn(BaseModel):
    uuid_operacion: str = Field(..., description="UUID v4 generado en cliente")
    tipo_operacion: str = Field(..., description="VENTA_POS, RESERVA, etc.")
    id_sucursal: int
    payload: Dict[str, Any]
    fecha_local: Optional[str] = None


class OperacionSyncResponse(BaseModel):
    status: str
    mensaje: str
    uuid_operacion: str
    id_operacion: Optional[int] = None
    fecha_sincronizacion: str


# --- Endpoints ---

@router.get("/catalogo-offline", summary="CU08: Descargar Catálogo Textil para Modo Offline")
def descargar_catalogo_offline(
    id_sucursal: Optional[int] = Query(None, description="ID de la sucursal asignada"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    CU08: Provee un conjunto estructurado y liviano con todos los productos,
    variantes de tallas/colores, composición textil y stock de la sucursal para
    que el cliente PWA (IndexedDB) y Móvil (SQLite) lo almacenen en caché local.
    """
    id_empresa = current_user.id_empresa or 1
    id_suc = id_sucursal or current_user.id_sucursal or 1

    query_prods = text("""
        SELECT 
            p.id_producto, p.codigo_sku_base, p.nombre, p.descripcion, 
            p.precio_base, p.composicion_textil, p.medidas_antropometricas,
            c.nombre_categoria, m.nombre_marca
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN marcas m ON p.id_marca = m.id_marca
        WHERE (p.id_empresa = :empresa_id OR p.id_empresa IS NULL)
        ORDER BY p.id_producto
    """)
    prods = db.execute(query_prods, {"empresa_id": id_empresa}).mappings().all()

    query_tallas = text("""
        SELECT pt.id_talla, pt.id_producto, pt.talla, pt.precio, pt.medidas_cm,
               COALESCE(i.stock_disponible, 0) as stock_disponible
        FROM producto_tallas pt
        LEFT JOIN inventario i ON i.id_producto = pt.id_producto AND i.talla = pt.talla AND i.id_sucursal = :sucursal_id
    """)
    tallas = db.execute(query_tallas, {"sucursal_id": id_suc}).mappings().all()

    tallas_por_prod = {}
    for t in tallas:
        p_id = t["id_producto"]
        if p_id not in tallas_por_prod:
            tallas_por_prod[p_id] = []
        tallas_por_prod[p_id].append({
            "id_talla": t["id_talla"],
            "talla": t["talla"],
            "precio": float(t["precio"]) if t["precio"] else 0.0,
            "medidas_cm": t["medidas_cm"],
            "stock_disponible": t["stock_disponible"]
        })

    catalogo_items = []
    for p in prods:
        p_id = p["id_producto"]
        catalogo_items.append({
            "id_producto": p_id,
            "sku": p["codigo_sku_base"],
            "nombre": p["nombre"],
            "descripcion": p["descripcion"],
            "precio_base": float(p["precio_base"]) if p["precio_base"] else 0.0,
            "categoria": p["nombre_categoria"],
            "marca": p["nombre_marca"],
            "composicion": p["composicion_textil"],
            "medidas_antropometricas": p["medidas_antropometricas"],
            "tallas_variantes": tallas_por_prod.get(p_id, [])
        })

    return {
        "id_empresa": id_empresa,
        "id_sucursal": id_suc,
        "version_offline": datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        "total_prendas": len(catalogo_items),
        "prendas": catalogo_items
    }


@router.post("/operacion", response_model=OperacionSyncResponse, summary="CU12: Sincronización Idempotente con UUID v4")
def sincronizar_operacion_offline(
    operacion: OperacionOfflineIn,
    x_idempotency_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    CU12: Recibe una transacción realizada en modo desconectado.
    Garantiza idempotencia absoluta: si la clave UUID ya fue procesada,
    devuelve la confirmación existente sin duplicar inventario ni transacciones.
    """
    uuid_key = x_idempotency_key or operacion.uuid_operacion
    id_empresa = current_user.id_empresa or 1

    # 1. Comprobar existencia previa (Idempotencia)
    check_sql = text("SELECT id_operacion, estado_sync, fecha_sincronizacion FROM operaciones_offline_sync WHERE uuid_operacion = :uuid")
    existente = db.execute(check_sql, {"uuid": uuid_key}).mappings().first()

    if existente:
        return OperacionSyncResponse(
            status="CONFIRMADA",
            mensaje="Operación procesada previamente (Respuesta Idempotente).",
            uuid_operacion=uuid_key,
            id_operacion=existente["id_operacion"],
            fecha_sincronizacion=str(existente["fecha_sincronizacion"])
        )

    # 2. Procesar nueva transacción
    payload_str = json.dumps(operacion.payload)
    hash_payload = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

    # Si es venta POS, descontar stock de sucursal de manera portable
    if operacion.tipo_operacion == "VENTA_POS":
        detalles = operacion.payload.get("items", [])
        for item in detalles:
            id_prod = item.get("id_producto")
            talla = item.get("talla")
            cantidad = item.get("cantidad", 1)
            if id_prod and talla:
                db.execute(text("""
                    UPDATE inventario 
                    SET stock_fisico = CASE WHEN stock_fisico - :cant < 0 THEN 0 ELSE stock_fisico - :cant END,
                        stock_disponible = CASE WHEN stock_disponible - :cant < 0 THEN 0 ELSE stock_disponible - :cant END
                    WHERE id_producto = :id_prod AND talla = :talla AND id_sucursal = :id_suc
                """), {"cant": cantidad, "id_prod": id_prod, "talla": talla, "id_suc": operacion.id_sucursal})

    # 3. Guardar registro en operaciones_offline_sync de forma 100% portable (SQLite y PostgreSQL)
    insert_sql = text("""
        INSERT INTO operaciones_offline_sync 
        (uuid_operacion, id_empresa, id_sucursal, tipo_operacion, payload_json, hash_sha256, estado_sync, fecha_sincronizacion)
        VALUES (:uuid, :empresa_id, :sucursal_id, :tipo, :payload, :hash, 'CONFIRMADA', CURRENT_TIMESTAMP)
    """)
    db.execute(insert_sql, {
        "uuid": uuid_key,
        "empresa_id": id_empresa,
        "sucursal_id": operacion.id_sucursal,
        "tipo": operacion.tipo_operacion,
        "payload": payload_str,
        "hash": hash_payload
    })
    db.commit()

    res = db.execute(
        text("SELECT id_operacion, fecha_sincronizacion FROM operaciones_offline_sync WHERE uuid_operacion = :uuid"),
        {"uuid": uuid_key}
    ).mappings().first()

    return OperacionSyncResponse(
        status="CONFIRMADA",
        mensaje="Transacción offline sincronizada exitosamente en base de datos central.",
        uuid_operacion=uuid_key,
        id_operacion=res["id_operacion"] if res else None,
        fecha_sincronizacion=str(res["fecha_sincronizacion"]) if res else datetime.utcnow().isoformat()
    )


@router.get("/operaciones-locales", summary="CU11: Auditoría de Operaciones Locales Pendientes")
def consultar_operaciones_locales(
    id_sucursal: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    CU11: Permite auditar y monitorear todas las transacciones procesadas fuera de línea.
    """
    id_empresa = current_user.id_empresa or 1
    params: Dict[str, Any] = {"empresa_id": id_empresa}
    sql = "SELECT id_operacion, uuid_operacion, id_sucursal, tipo_operacion, estado_sync, fecha_sincronizacion FROM operaciones_offline_sync WHERE id_empresa = :empresa_id"

    if id_sucursal:
        sql += " AND id_sucursal = :sucursal_id"
        params["sucursal_id"] = id_sucursal

    sql += " ORDER BY id_operacion DESC LIMIT 50"

    registros = db.execute(text(sql), params).mappings().all()
    return list(registros)
