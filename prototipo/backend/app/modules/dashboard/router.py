# -*- coding: utf-8 -*-
"""
Módulo de Métricas y Panel de Control Ejecutivo (Dashboard)
Agregación de KPIs en tiempo real de la base de datos para Ciclo 1 y Ciclo 2.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List

import app.modules.auth.models
import app.modules.sucursales.models
import app.modules.proveedores.models
import app.modules.temporadas.models
import app.modules.productos.models
import app.modules.inventario.models
import app.modules.reservas.models
import app.modules.carrito.models
import app.modules.ordenes.models
import app.modules.pagos.models

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.modules.auth.models import Usuario
from app.modules.productos.models import Producto
from app.modules.sucursales.models import Sucursal
from app.modules.inventario.models import Inventario
from app.modules.reservas.models import Reserva
from app.modules.ordenes.models import OrdenVenta
from app.modules.pagos.models import MetodoPagoConfig
from app.core.config import settings

router = APIRouter(
    prefix="/dashboard",
    tags=["Panel de Control y Métricas Ejecutivas (Dashboard)"]
)

@router.get(
    "/metricas",
    status_code=status.HTTP_200_OK,
    summary="Obtener Métricas y KPIs Consolidados del Sistema (Ciclo 1 y 2)"
)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR", "ENCARGADO_SUCURSAL", "LOGISTICA", "CAJERO"]))
) -> Dict[str, Any]:
    """
    Retorna los KPIs ejecutivos consolidados en tiempo real:
    - Ventas totales facturadas y recaudadas (Bs.)
    - Órdenes por canal (Online vs POS)
    - Reservas de probador activas
    - Despachos y entregas en curso
    - Stock total y prendas en catálogo
    - Sucursales y canales de recaudación
    - Transacciones y reservas recientes
    """
    # 1. KPIs Financieros y Comerciales
    total_ventas_pagadas = db.query(func.sum(OrdenVenta.total)).filter(
        OrdenVenta.estado_pago == "PAGADO"
    ).scalar() or 0.0

    total_ordenes = db.query(OrdenVenta).count()
    ordenes_pagadas = db.query(OrdenVenta).filter(OrdenVenta.estado_pago == "PAGADO").count()
    ordenes_pendientes = db.query(OrdenVenta).filter(OrdenVenta.estado_pago == "PENDIENTE").count()

    # Canal Online vs POS
    ventas_pos = db.query(OrdenVenta).filter(
        (OrdenVenta.canal_venta == "POS") | (OrdenVenta.numero_factura.like("POS%"))
    ).count()
    ventas_online = max(0, total_ordenes - ventas_pos)

    # 2. Reservas de Probador (CU11 / CU12)
    total_reservas = db.query(Reserva).count()
    reservas_pendientes = db.query(Reserva).filter(Reserva.estado == "PENDIENTE").count()
    reservas_confirmadas = db.query(Reserva).filter(Reserva.estado == "CONFIRMADA").count()

    # 3. Logística y Despacho (CU18)
    despachos_activos = db.query(OrdenVenta).filter(
        OrdenVenta.estado_logistica.in_(["PREPARACION", "LISTO_DESPACHO", "EN_TRANSITO"])
    ).count()
    entregadas = db.query(OrdenVenta).filter(OrdenVenta.estado_logistica == "ENTREGADA").count()

    # 4. Catálogo, Inventario y Sucursales (CU05, CU06, CU09)
    total_productos = db.query(Producto).count()
    total_sucursales = db.query(Sucursal).count()
    stock_total = db.query(func.sum(Inventario.stock_fisico)).scalar() or 0
    total_usuarios = db.query(Usuario).count()

    # 5. Medios de Cobro (CU17)
    total_medios_pago = db.query(MetodoPagoConfig).count()
    medios_activos = db.query(MetodoPagoConfig).filter(MetodoPagoConfig.activo == True).count()

    # 6. Últimas 5 Órdenes de Venta
    ultimas_ordenes_raw = db.query(OrdenVenta).order_by(OrdenVenta.id_orden.desc()).limit(5).all()
    ultimas_ordenes = []
    for o in ultimas_ordenes_raw:
        canal = "POS Mostrador" if (o.canal_venta == "POS") or (o.numero_factura and o.numero_factura.startswith("POS")) else "Online Digital"
        ultimas_ordenes.append({
            "id_orden": o.id_orden,
            "numero_factura": o.numero_factura or f"ORD-{o.id_orden}",
            "cliente": o.razon_social_factura or (f"{o.usuario.nombres} {o.usuario.apellidos}" if o.usuario else "Cliente Mostrador"),
            "total": float(o.total),
            "estado_pago": o.estado_pago,
            "estado_logistica": o.estado_logistica,
            "canal": canal,
            "fecha": o.creado_en.strftime("%d/%m/%Y %H:%M") if o.creado_en else ""
        })

    # 7. Últimas 5 Reservas
    ultimas_reservas_raw = db.query(Reserva).order_by(Reserva.id_reserva.desc()).limit(5).all()
    ultimas_reservas = []
    for r in ultimas_reservas_raw:
        ultimas_reservas.append({
            "id_reserva": r.id_reserva,
            "codigo_reserva": r.qr_texto or f"RES-{r.id_reserva:04d}",
            "cliente": f"{r.usuario.nombres} {r.usuario.apellidos}" if r.usuario else "Cliente",
            "sucursal": r.sucursal.nombre_sucursal if r.sucursal else "Sucursal Central",
            "estado": r.estado,
            "fecha": r.fecha_visita.strftime("%d/%m/%Y %H:%M") if r.fecha_visita else (r.creado_en.strftime("%d/%m/%Y %H:%M") if r.creado_en else "")
        })

    return {
        "kpis": {
            "ventas_totales_bs": round(float(total_ventas_pagadas), 2),
            "total_ordenes": total_ordenes,
            "ordenes_pagadas": ordenes_pagadas,
            "ordenes_pendientes": ordenes_pendientes,
            "total_reservas": total_reservas,
            "reservas_pendientes": reservas_pendientes,
            "reservas_confirmadas": reservas_confirmadas,
            "despachos_activos": despachos_activos,
            "entregadas": entregadas,
            "total_productos": total_productos,
            "total_sucursales": total_sucursales,
            "stock_total": int(stock_total),
            "total_usuarios": total_usuarios,
            "total_medios_pago": total_medios_pago,
            "medios_activos": medios_activos
        },
        "distribucion_canales": {
            "online": ventas_online,
            "pos": ventas_pos
        },
        "ultimas_ordenes": ultimas_ordenes,
        "ultimas_reservas": ultimas_reservas,
        "servicios_estado": {
            "api_version": settings.VERSION,
            "fastapi_status": "ONLINE",
            "database_status": "ONLINE (Conectada)",
            "stripe_status": "CONFIGURADO (Sandbox)",
            "delivery_status": "OPERATIVO (Haversine)"
        }
    }
