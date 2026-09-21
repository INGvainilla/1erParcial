# -*- coding: utf-8 -*-
"""
Lógica de Negocio y Transaccionalidad de Caja POS (CU15 - M13)
Manejo de stock en sucursal, asientos en Kardex, emisión de factura y cierre de reservas.
"""
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from fastapi import HTTPException, status

from app.modules.p08_punto_venta_pos.pos.schemas import (
    PosItemInput, PosVentaCreate, PosProductoLookupResponse,
    PosReservaLoadResponse, PosTicketResponse, PosTicketDetalle,
    TicketItemLookup, TicketConsultaResponse, DevolucionCreate, DevolucionTicketResponse
)
from app.modules.p08_punto_venta_pos.pos.models import Devolucion, DevolucionDetalle
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p06_reservas_presenciales.reservas.models import Reserva, ReservaDetalle
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p09_procesamiento_pagos.pagos.models import MetodoPagoConfig


def buscar_producto_por_sku(db: Session, sku: str, id_sucursal: int) -> PosProductoLookupResponse:
    """
    CU15: Búsqueda ágil de producto por código de barras / SKU base para la terminal POS.
    Calcula el stock disponible en la sucursal del cajero.
    """
    clean_sku = sku.strip()
    query = db.query(Producto).options(
        joinedload(Producto.tallas),
        joinedload(Producto.colores)
    )

    conds = [Producto.codigo_sku_base.ilike(clean_sku)]
    if clean_sku.isdigit():
        conds.append(Producto.id_producto == int(clean_sku))

    producto = query.filter(or_(*conds)).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con código/SKU '{sku}' no encontrado en el catálogo."
        )

    # Stock disponible en la sucursal actual
    stock_sucursal = db.query(func.coalesce(func.sum(Inventario.stock_disponible), 0)).filter(
        Inventario.id_producto == producto.id_producto,
        Inventario.id_sucursal == id_sucursal
    ).scalar() or 0

    tallas_list = [t.talla for t in (producto.tallas or [])]
    colores_list = [c.color_nombre for c in (producto.colores or [])]

    # Si no tiene tallas asociadas, extraer de inventario
    if not tallas_list:
        inv_tallas = db.query(Inventario.talla).filter(
            Inventario.id_producto == producto.id_producto,
            Inventario.id_sucursal == id_sucursal
        ).distinct().all()
        tallas_list = [t[0] for t in inv_tallas] or ["M"]

    if not colores_list:
        inv_colores = db.query(Inventario.color).filter(
            Inventario.id_producto == producto.id_producto,
            Inventario.id_sucursal == id_sucursal
        ).distinct().all()
        colores_list = [c[0] for c in inv_colores] or ["Único"]

    return PosProductoLookupResponse(
        id_producto=producto.id_producto,
        codigo_sku_base=producto.codigo_sku_base,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio_base=float(producto.precio_base),
        imagen_principal=producto.imagen_principal,
        tallas=tallas_list,
        colores=colores_list,
        stock_disponible_sucursal=int(stock_sucursal)
    )


def cargar_reserva_para_pos(db: Session, codigo_qr: str, id_sucursal: int) -> PosReservaLoadResponse:
    """
    CU15: Convierte una reserva presencial en un ticket de venta en mostrador.
    Verifica que la reserva pertenezca a la sucursal y no esté ya cerrada/cancelada.
    """
    clean_code = codigo_qr.strip()
    if clean_code.startswith("#"):
        clean_code = clean_code[1:].strip()

    conds = [
        Reserva.qr_texto == clean_code,
        Reserva.codigo_qr == clean_code
    ]
    if clean_code.isdigit():
        conds.append(Reserva.id_reserva == int(clean_code))

    reserva = db.query(Reserva).options(
        joinedload(Reserva.detalles).joinedload(ReservaDetalle.producto),
        joinedload(Reserva.usuario)
    ).filter(or_(*conds)).first()

    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reserva con código '{codigo_qr}' no encontrada."
        )

    if reserva.id_sucursal != id_sucursal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Esta reserva fue programada en otra sucursal (#{reserva.id_sucursal})."
        )

    if reserva.estado in ["CANCELADA", "CERRADA_POR_VENTA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La reserva ya no está disponible (Estado actual: {reserva.estado})."
        )

    items_pos = []
    subtotal_acum = 0.0

    for d in reserva.detalles:
        p_unit = float(d.producto.precio_base if d.producto else 100.0)
        sub = round(p_unit * d.cantidad, 2)
        subtotal_acum += sub

        items_pos.append(
            PosItemInput(
                id_producto=d.id_producto,
                sku=d.producto.codigo_sku_base if d.producto else f"SKU-{d.id_producto}",
                nombre_producto=d.producto.nombre if d.producto else f"Prenda #{d.id_producto}",
                talla=d.talla,
                color=d.color,
                cantidad=d.cantidad,
                precio_unitario=p_unit
            )
        )

    nombre_cli = f"{reserva.usuario.nombres} {reserva.usuario.apellidos}" if reserva.usuario else "Cliente Reserva"

    return PosReservaLoadResponse(
        id_reserva=reserva.id_reserva,
        qr_texto=reserva.qr_texto,
        nombre_cliente=nombre_cli,
        nit_cliente="0",
        estado=reserva.estado,
        detalles=items_pos,
        subtotal=round(subtotal_acum, 2)
    )


def procesar_venta_pos(
    db: Session,
    id_cajero: int,
    id_sucursal: int,
    cajero_nombre: str,
    venta_in: PosVentaCreate
) -> PosTicketResponse:
    """
    CU15: Ejecuta la transacción de venta directa en mostrador:
    - Valida cobro y cambio.
    - Descuenta stock físico de la sucursal y asienta en Kardex (SALIDA_VENTA).
    - Cierra reserva previa si existía.
    - Emite OrdenVenta en estado PAGADO / ENTREGADA.
    """
    sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == id_sucursal).first()
    if not sucursal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sucursal de caja no configurada."
        )

    # 1. Calcular total de la venta
    subtotal_total = sum(round(it.precio_unitario * it.cantidad, 2) for it in venta_in.items)
    subtotal_total = round(subtotal_total, 2)

    metodo = venta_in.metodo_pago.strip().upper()
    codigo_cfg = "EFECTIVO" if metodo == "EFECTIVO" else ("TARJETA_POS" if "TARJETA" in metodo else "QR_BCB")
    metodo_cfg = db.query(MetodoPagoConfig).filter(MetodoPagoConfig.codigo == codigo_cfg).first()
    if metodo_cfg and not metodo_cfg.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El método de cobro '{metodo_cfg.nombre}' se encuentra actualmente deshabilitado por administración."
        )

    if metodo == "EFECTIVO":
        if venta_in.monto_recibido < subtotal_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El efectivo recibido (Bs. {venta_in.monto_recibido:.2f}) es inferior al total de la venta (Bs. {subtotal_total:.2f})."
            )
        cambio = round(venta_in.monto_recibido - subtotal_total, 2)
    else:
        cambio = 0.0

    correlativo_fac = f"POS-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"

    # 2. Transacción Atómica
    try:
        detalles_ticket = []
        detalles_orden = []

        for item in venta_in.items:
            # Buscar el registro de inventario físico en ESTA sucursal
            inv = db.query(Inventario).filter(
                Inventario.id_sucursal == id_sucursal,
                Inventario.id_producto == item.id_producto,
                Inventario.talla == item.talla,
                Inventario.color == item.color
            ).first()

            if not inv or inv.stock_disponible < item.cantidad:
                disp = inv.stock_disponible if inv else 0
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock físico insuficiente en esta sucursal para '{item.nombre_producto or item.sku}' ({item.talla}/{item.color}). Disponibles: {disp}, Solicitados: {item.cantidad}."
                )

            # Descontar existencias físicas y disponibles en la sucursal
            inv.stock_disponible -= item.cantidad
            inv.stock_fisico -= item.cantidad

            # Registrar asiento inmutable en Kardex (CU09 / CU15)
            kardex = KardexMovimiento(
                id_inventario=inv.id_inventario,
                tipo_movimiento="SALIDA_VENTA",
                cantidad=item.cantidad,
                costo_unitario_movimiento=inv.costo_promedio_ponderado,
                saldo_cantidad_resultante=inv.stock_disponible,
                saldo_cpp_resultante=inv.costo_promedio_ponderado,
                referencia_documento=f"Factura Mostrador {correlativo_fac}"
            )
            db.add(kardex)

            sub_linea = round(item.precio_unitario * item.cantidad, 2)
            detalles_ticket.append(
                PosTicketDetalle(
                    nombre_producto=item.nombre_producto or f"Prenda #{item.id_producto}",
                    codigo_sku_base=item.sku,
                    talla=item.talla,
                    color=item.color,
                    cantidad=item.cantidad,
                    precio_unitario=item.precio_unitario,
                    subtotal=sub_linea
                )
            )

            detalles_orden.append({
                "id_producto": item.id_producto,
                "talla": item.talla,
                "color": item.color,
                "cantidad": item.cantidad,
                "precio_unitario": Decimal(str(item.precio_unitario)),
                "subtotal": Decimal(str(sub_linea))
            })

        # Si vino de una reserva, actualizar su estado a CERRADA_POR_VENTA
        if venta_in.id_reserva_origen:
            reserva = db.query(Reserva).filter(Reserva.id_reserva == venta_in.id_reserva_origen).first()
            if reserva:
                reserva.estado = "CERRADA_POR_VENTA"

        # Crear OrdenVenta oficial en base de datos
        orden = OrdenVenta(
            id_usuario=id_cajero,
            id_sucursal=id_sucursal,
            numero_factura=correlativo_fac,
            canal_venta="POS",
            modalidad_entrega="COMPRA_FISICA",
            nit_factura=venta_in.nit_cliente.strip() or "0",
            razon_social_factura=venta_in.nombre_cliente.strip() or "Cliente Mostrador",
            subtotal=Decimal(str(subtotal_total)),
            costo_envio=Decimal("0.00"),
            total=Decimal(str(subtotal_total)),
            estado_pago="PAGADO",
            estado_logistica="ENTREGADA"
        )
        db.add(orden)
        db.flush()

        for d in detalles_orden:
            db.add(
                OrdenDetalle(
                    id_orden=orden.id_orden,
                    id_producto=d["id_producto"],
                    talla=d["talla"],
                    color=d["color"],
                    cantidad=d["cantidad"],
                    precio_unitario=d["precio_unitario"],
                    subtotal=d["subtotal"]
                )
            )

        db.commit()

        return PosTicketResponse(
            id_orden=orden.id_orden,
            numero_factura=correlativo_fac,
            id_sucursal=id_sucursal,
            nombre_sucursal=sucursal.nombre_sucursal,
            direccion_sucursal=sucursal.direccion,
            fecha_hora=datetime.now(timezone.utc).replace(tzinfo=None),
            nit_cliente=orden.nit_factura,
            nombre_cliente=orden.razon_social_factura,
            metodo_pago=metodo,
            subtotal=subtotal_total,
            total=subtotal_total,
            monto_recibido=venta_in.monto_recibido if metodo == "EFECTIVO" else subtotal_total,
            cambio_devolver=cambio,
            cajero_nombre=cajero_nombre,
            detalles=detalles_ticket
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la venta en caja: {str(e)}"
        )


# ============================================================================
# SERVICIOS CU25: Gestionar Devolución y Cambio de Prendas
# ============================================================================

def consultar_ticket_para_devolucion(db: Session, nro_ticket: str) -> TicketConsultaResponse:
    """
    CU25: Consulta una venta original por número de factura o ID de orden.
    Valida la ventana de 14 días calendario conforme a políticas de la tienda,
    calcula días transcurridos y recupera las prendas con sus CPP históricos.
    """
    clean = nro_ticket.strip()
    conds = [
        OrdenVenta.numero_factura.ilike(clean),
        OrdenVenta.numero_factura.ilike(f"%{clean}%")
    ]
    if clean.isdigit():
        conds.append(OrdenVenta.id_orden == int(clean))

    orden = db.query(OrdenVenta).options(
        joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
    ).filter(or_(*conds)).first()

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket o factura '{nro_ticket}' no encontrado en el sistema."
        )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    fecha_emision = orden.creado_en or now
    dias_transcurridos = max(0, (now - fecha_emision).days)
    es_valido = dias_transcurridos <= 14

    if es_valido:
        mensaje_plazo = f"Dentro de plazo: {dias_transcurridos} días transcurridos (Máximo 14 días permitidos)."
    else:
        mensaje_plazo = f"Plazo de devolución vencido ({dias_transcurridos} días transcurridos. Máximo 14 días permitidos por política de la tienda)."

    items_result = []
    for d in (orden.detalles or []):
        prod = d.producto
        # Obtener CPP histórico de inventario
        inv = db.query(Inventario).filter(
            Inventario.id_producto == d.id_producto,
            Inventario.talla == d.talla,
            Inventario.color == d.color
        ).first()
        cpp_hist = float(inv.costo_promedio_ponderado) if inv else 107.14

        items_result.append(
            TicketItemLookup(
                id_producto=d.id_producto,
                nombre_producto=prod.nombre if prod else f"Prenda #{d.id_producto}",
                codigo_sku_base=prod.codigo_sku_base if prod else f"SKU-{d.id_producto}",
                talla=d.talla,
                color=d.color,
                cantidad=d.cantidad,
                precio_unitario=float(d.precio_unitario),
                subtotal=float(d.subtotal),
                costo_historico_cpp=cpp_hist,
                imagen_principal=prod.imagen_principal if prod else None
            )
        )

    return TicketConsultaResponse(
        id_orden=orden.id_orden,
        numero_factura=orden.numero_factura or f"POS-ORDEN-{orden.id_orden}",
        fecha_emision=fecha_emision,
        nombre_cliente=orden.razon_social_factura or "Cliente Mostrador",
        nit_cliente=orden.nit_factura or "0",
        total=float(orden.total),
        dias_transcurridos=dias_transcurridos,
        es_valido_14_dias=es_valido,
        mensaje_plazo=mensaje_plazo,
        items=items_result
    )


def procesar_devolucion_pos(
    db: Session,
    id_cajero: int,
    id_sucursal: int,
    cajero_nombre: str,
    dev_in: DevolucionCreate
) -> DevolucionTicketResponse:
    """
    CU25: Procesa la devolución o cambio de prendas en mostrador:
    - Valida que la venta original no exceda el límite de 14 días calendario.
    - Evalúa inspección física (APTO_VENTA vs DEFECTUOSO_MERMA).
    - Asienta reingreso inmutable al Kardex valorado al CPP histórico (DEVOLUCION_VENTA).
    - Liquida la compensación: CAMBIO_VARIANTE (ajuste factor de talla), VALE_CREDITO o REEMBOLSO.
    - Emite comprobante fiscal oficial de devolución.
    """
    clean = dev_in.nro_ticket_original.strip()
    conds = [
        OrdenVenta.numero_factura.ilike(clean),
        OrdenVenta.numero_factura.ilike(f"%{clean}%")
    ]
    if clean.isdigit():
        conds.append(OrdenVenta.id_orden == int(clean))

    orden = db.query(OrdenVenta).options(
        joinedload(OrdenVenta.detalles).joinedload(OrdenDetalle.producto)
    ).filter(or_(*conds)).first()

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket fiscal original '{dev_in.nro_ticket_original}' no encontrado."
        )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    fecha_emision = orden.creado_en or now
    dias_transcurridos = max(0, (now - fecha_emision).days)
    if dias_transcurridos > 14:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plazo de devolución vencido ({dias_transcurridos} días transcurridos. Máximo 14 días permitidos por política de la tienda)."
        )

    sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == id_sucursal).first()
    suc_nombre = sucursal.nombre_sucursal if sucursal else "Sucursal Equipetrol"

    correlativo_dev = f"DEV-{now.year}-{uuid.uuid4().hex[:6].upper()}"

    total_devuelto = Decimal("0.00")
    items_devueltos_info = []
    detalles_db = []

    try:
        for it in dev_in.items:
            det_orig = next(
                (d for d in orden.detalles if d.id_producto == it.id_producto and d.talla == it.talla),
                None
            )
            if not det_orig:
                det_orig = next((d for d in orden.detalles if d.id_producto == it.id_producto), None)

            precio_unit = det_orig.precio_unitario if det_orig else Decimal("100.00")
            sub_dev = round(precio_unit * it.cantidad, 2)
            total_devuelto += sub_dev

            # Buscar inventario en la sucursal actual
            inv = db.query(Inventario).filter(
                Inventario.id_sucursal == id_sucursal,
                Inventario.id_producto == it.id_producto,
                Inventario.talla == it.talla,
                Inventario.color == it.color
            ).first()

            if not inv:
                # Si no existe registro específico para ese color/talla en esta sucursal, buscar variante base
                inv = db.query(Inventario).filter(
                    Inventario.id_sucursal == id_sucursal,
                    Inventario.id_producto == it.id_producto
                ).first()

            costo_cpp = inv.costo_promedio_ponderado if inv else Decimal("107.14")

            # Reingreso de stock según estado físico
            if it.estado_fisico == "APTO_VENTA":
                if inv:
                    inv.stock_disponible += it.cantidad
                    inv.stock_fisico += it.cantidad
            else:
                # Defectuoso / Merma: se incrementa físico pero se aisla de disponible
                if inv:
                    inv.stock_fisico += it.cantidad

            # Asiento inmutable en Kardex (CU09 / CU25)
            kardex = KardexMovimiento(
                id_inventario=inv.id_inventario if inv else 1,
                tipo_movimiento="DEVOLUCION_VENTA",
                cantidad=it.cantidad,
                costo_unitario_movimiento=costo_cpp,
                saldo_cantidad_resultante=inv.stock_disponible if inv else it.cantidad,
                saldo_cpp_resultante=costo_cpp,
                referencia_documento=f"Devolución {correlativo_dev} (Ticket {orden.numero_factura})"
            )
            db.add(kardex)

            prod = db.query(Producto).filter(Producto.id_producto == it.id_producto).first()
            nombre_prod = prod.nombre if prod else f"Prenda #{it.id_producto}"
            sku_prod = prod.codigo_sku_base if prod else f"SKU-{it.id_producto}"

            items_devueltos_info.append({
                "id_producto": it.id_producto,
                "nombre_producto": nombre_prod,
                "sku": sku_prod,
                "talla": it.talla,
                "color": it.color,
                "cantidad": it.cantidad,
                "precio_unitario": float(precio_unit),
                "subtotal": float(sub_dev),
                "estado_fisico": it.estado_fisico,
                "costo_historico_cpp": float(costo_cpp)
            })

            detalles_db.append(
                DevolucionDetalle(
                    id_producto=it.id_producto,
                    talla=it.talla,
                    color=it.color,
                    cantidad=it.cantidad,
                    costo_historico_cpp=costo_cpp,
                    precio_unitario_original=precio_unit,
                    estado_fisico=it.estado_fisico,
                    nuevo_producto_cambio_id=dev_in.cambio_info.nuevo_producto_id if dev_in.cambio_info else None,
                    nueva_talla=dev_in.cambio_info.nueva_talla if dev_in.cambio_info else None,
                    nuevo_color=dev_in.cambio_info.nuevo_color if dev_in.cambio_info else None
                )
            )

        diferencia_cobrada = Decimal("0.00")
        codigo_vale = None
        item_nuevo_info = None

        # 3. Resolución: Cambio, Vale o Reembolso
        if dev_in.tipo_resolucion == "CAMBIO_VARIANTE":
            if not dev_in.cambio_info:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Debe especificar la información de la prenda de cambio."
                )
            ci = dev_in.cambio_info
            nuevo_prod = db.query(Producto).filter(Producto.id_producto == ci.nuevo_producto_id).first()
            if not nuevo_prod:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Prenda de cambio #{ci.nuevo_producto_id} no encontrada en catálogo."
                )

            inv_nuevo = db.query(Inventario).filter(
                Inventario.id_sucursal == id_sucursal,
                Inventario.id_producto == ci.nuevo_producto_id,
                Inventario.talla == ci.nueva_talla,
                Inventario.color == ci.nuevo_color
            ).first()

            if not inv_nuevo:
                inv_nuevo = db.query(Inventario).filter(
                    Inventario.id_sucursal == id_sucursal,
                    Inventario.id_producto == ci.nuevo_producto_id
                ).first()

            if not inv_nuevo or inv_nuevo.stock_disponible < ci.nueva_cantidad:
                disp = inv_nuevo.stock_disponible if inv_nuevo else 0
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para la nueva prenda ({ci.nueva_talla}/{ci.nuevo_color}). Disponibles: {disp}, Solicitados: {ci.nueva_cantidad}."
                )

            # Descontar stock de la nueva prenda
            inv_nuevo.stock_disponible -= ci.nueva_cantidad
            inv_nuevo.stock_fisico -= ci.nueva_cantidad

            # Asiento Kardex salida de la nueva prenda
            kardex_salida = KardexMovimiento(
                id_inventario=inv_nuevo.id_inventario,
                tipo_movimiento="SALIDA_VENTA",
                cantidad=ci.nueva_cantidad,
                costo_unitario_movimiento=inv_nuevo.costo_promedio_ponderado,
                saldo_cantidad_resultante=inv_nuevo.stock_disponible,
                saldo_cpp_resultante=inv_nuevo.costo_promedio_ponderado,
                referencia_documento=f"Entrega por Cambio Prenda Comprobante {correlativo_dev}"
            )
            db.add(kardex_salida)

            # Matriz de factor de precios por talla (+5% en Talla L, +10% en XL)
            factores_talla = {
                "S": Decimal("0.95"),
                "M": Decimal("1.00"),
                "L": Decimal("1.05"),
                "XL": Decimal("1.10"),
                "XXL": Decimal("1.15")
            }
            factor = factores_talla.get(ci.nueva_talla.upper(), Decimal("1.00"))
            precio_nuevo_unit = round(nuevo_prod.precio_base * factor, 2)
            total_nuevo = round(precio_nuevo_unit * ci.nueva_cantidad, 2)
            diferencia_cobrada = round(total_nuevo - total_devuelto, 2)

            item_nuevo_info = {
                "id_producto": nuevo_prod.id_producto,
                "nombre_producto": nuevo_prod.nombre,
                "sku": nuevo_prod.codigo_sku_base,
                "talla": ci.nueva_talla,
                "color": ci.nuevo_color,
                "cantidad": ci.nueva_cantidad,
                "factor_talla": float(factor),
                "precio_unitario": float(precio_nuevo_unit),
                "total_nuevo": float(total_nuevo)
            }

        elif dev_in.tipo_resolucion == "VALE_CREDITO":
            codigo_vale = f"VALE-FS-{uuid.uuid4().hex[:8].upper()}"
            diferencia_cobrada = Decimal("0.00")

        elif dev_in.tipo_resolucion in ["REEMBOLSO_EFECTIVO", "REEMBOLSO_STRIPE"]:
            diferencia_cobrada = Decimal("0.00")

        # 4. Registrar cabecera Devolucion en BD
        devolucion_db = Devolucion(
            tenant_id="fashionstore_scz",
            id_orden=orden.id_orden,
            id_sucursal=id_sucursal,
            id_usuario=id_cajero,
            nro_ticket_original=orden.numero_factura or dev_in.nro_ticket_original,
            nro_devolucion=correlativo_dev,
            fecha_devolucion=now,
            motivo=dev_in.motivo,
            tipo_resolucion=dev_in.tipo_resolucion,
            total_devuelto=total_devuelto,
            diferencia_cobrada=diferencia_cobrada,
            codigo_vale=codigo_vale,
            estado="COMPLETADA"
        )
        db.add(devolucion_db)
        db.flush()

        for det in detalles_db:
            det.id_devolucion = devolucion_db.id_devolucion
            db.add(det)

        db.commit()

        return DevolucionTicketResponse(
            id_devolucion=devolucion_db.id_devolucion,
            nro_devolucion=correlativo_dev,
            nro_ticket_original=orden.numero_factura or dev_in.nro_ticket_original,
            fecha_hora=now,
            sucursal_nombre=suc_nombre,
            cajero_nombre=cajero_nombre,
            cliente_nombre=orden.razon_social_factura or "Cliente Mostrador",
            motivo=dev_in.motivo,
            tipo_resolucion=dev_in.tipo_resolucion,
            total_devuelto=float(total_devuelto),
            diferencia_cobrada=float(diferencia_cobrada),
            codigo_vale=codigo_vale,
            mensaje_kardex="Reingreso inmutable al Kardex asentado al CPP histórico (DEVOLUCION_VENTA)",
            items_devueltos=items_devueltos_info,
            item_nuevo_entregado=item_nuevo_info
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la devolución en mostrador: {str(e)}"
        )
