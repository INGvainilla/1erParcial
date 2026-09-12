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

from app.modules.pos.schemas import (
    PosItemInput, PosVentaCreate, PosProductoLookupResponse,
    PosReservaLoadResponse, PosTicketResponse, PosTicketDetalle
)
from app.modules.productos.models import Producto
from app.modules.inventario.models import Inventario, KardexMovimiento
from app.modules.reservas.models import Reserva, ReservaDetalle
from app.modules.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.sucursales.models import Sucursal


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
