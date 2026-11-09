# -*- coding: utf-8 -*-
"""
Siembra exhaustiva de datos operacionales para todos los Tenants del Parcial 2.
Garantiza coherencia total entre:
- ordenes_venta
- ordenes_detalle
- inventario & kardex_movimientos (CPP exacto)
- devoluciones & devolucion_detalles (CU25)
- reservas & reserva_detalles (CU09/CU11/CU12)
- traspasos_inter_sucursal (CU14)
- ordenes_compra_desktop (CU20)
- bitacora_accesos (CU21)
"""
import json
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import text

# Registro completo de modelos SQLAlchemy
import app.modules.p01_seguridad_acceso.tenants.models
import app.modules.p01_seguridad_acceso.auth.models
import app.modules.p02_estructura_operativa.sucursales.models
import app.modules.p03_catalogo_estilismo_ia.productos.models
import app.modules.p03_catalogo_estilismo_ia.temporadas.models
import app.modules.p04_aprovisionamiento_proveedores.proveedores.models
import app.modules.p05_inventario_costos_analitica.inventario.models
import app.modules.p06_reservas_presenciales.reservas.models
import app.modules.p07_venta_digital_fidelizacion.carrito.models
import app.modules.p07_venta_digital_fidelizacion.ordenes.models
import app.modules.p07_venta_digital_fidelizacion.gamificacion.models
import app.modules.p08_punto_venta_pos.pos.models
import app.modules.p09_procesamiento_pagos.pagos.models

from app.core.database import SessionLocal, engine
from app.modules.p01_seguridad_acceso.tenants.models import Empresa
from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, ProductoColor, ProductoTalla
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p06_reservas_presenciales.reservas.models import Reserva, ReservaDetalle
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.p08_punto_venta_pos.pos.models import Devolucion, DevolucionDetalle
from app.modules.p01_seguridad_acceso.auditoria.models import BitacoraAcceso


CLIENTES_BOLIVIA = [
    ("Mauricio Añez Cuéllar", "1028374019", "Av. Banzer #340, Santa Cruz", "+591 76012345"),
    ("Gabriela Torrico Morales", "8374920015", "Calle 21 de Calacoto #550, La Paz", "+591 71098765"),
    ("Rodrigo Banzer Suarez", "9382019011", "Av. América #120, Cochabamba", "+591 72054321"),
    ("Camila Roca Antelo", "7483920013", "Av. San Martín #890, Equipetrol", "+591 78065432"),
    ("Fernando Vaca Díez", "6382910014", "Calle España #220, Sucre", "+591 75019283"),
    ("Lucía Gutiérrez Prado", "5291039016", "Calle General Trigo #310, Tarija", "+591 77082910"),
    ("Alejandro Justiniano Pardo", "4102938018", "Av. Las Américas #400, Santa Cruz", "+591 73091827"),
    ("Valeria Montero Paz", "3019284012", "Calle Montenegro #770, San Miguel", "+591 74082736")
]

FECHAS_VENTAS = [
    datetime(2026, 8, 14, 11, 20),
    datetime(2026, 8, 26, 16, 45),
    datetime(2026, 9, 3, 10, 15),
    datetime(2026, 9, 12, 17, 30),
    datetime(2026, 9, 21, 14, 0),
    datetime(2026, 9, 29, 19, 10),
    datetime(2026, 10, 5, 12, 40),
    datetime(2026, 10, 14, 15, 20),
    datetime(2026, 10, 22, 18, 50),
    datetime(2026, 10, 28, 11, 0),
    datetime(2026, 10, 31, 20, 15),
    datetime(2026, 11, 2, 10, 30),
    datetime(2026, 11, 4, 16, 10),
    datetime(2026, 11, 6, 14, 45),
    datetime(2026, 11, 8, 18, 0)
]


def sembrar_operaciones_por_tenant(db: Session, id_empresa: int) -> dict:
    emp = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    if not emp:
        return {"error": f"Empresa #{id_empresa} no existe"}

    slug = emp.dominio_slug or f"tenant-{id_empresa}"
    nombre = emp.nombre_comercial or emp.razon_social

    # Obtener recursos del tenant
    sucursales = db.query(Sucursal).filter(Sucursal.id_empresa == id_empresa).all()
    if not sucursales:
        return {"empresa": nombre, "status": "Sin sucursales"}

    productos = db.query(Producto).filter(Producto.id_empresa == id_empresa).all()
    if not productos:
        return {"empresa": nombre, "status": "Sin productos"}

    usuarios = db.query(Usuario).filter(Usuario.id_empresa == id_empresa).all()
    usuario_principal = usuarios[0] if usuarios else None
    if not usuario_principal:
        return {"empresa": nombre, "status": "Sin usuarios"}

    cajero = next((u for u in usuarios if u.rol == "CAJERO"), usuario_principal)

    # 1. Asegurar inventario con stock físico y Kardex inicial
    items_inv = db.query(Inventario).filter(Inventario.id_empresa == id_empresa).all()
    kardex_creados = 0
    for inv in items_inv:
        # Kardex inicial de compra si no existe
        km_exist = db.query(KardexMovimiento).filter(
            KardexMovimiento.id_inventario == inv.id_inventario,
            KardexMovimiento.tipo_movimiento == "ENTRADA_COMPRA"
        ).first()
        if not km_exist:
            costo = inv.costo_promedio_ponderado or Decimal("120.00")
            stock_ini = inv.stock_fisico if inv.stock_fisico > 0 else 30
            inv.stock_fisico = stock_ini
            inv.stock_disponible = stock_ini - (inv.stock_reservado or 0)
            inv.costo_promedio_ponderado = costo
            inv.ultimo_costo_compra = costo

            db.add(KardexMovimiento(
                id_empresa=id_empresa,
                id_inventario=inv.id_inventario,
                tipo_movimiento="ENTRADA_COMPRA",
                cantidad=stock_ini,
                costo_unitario_movimiento=costo,
                saldo_cantidad_resultante=stock_ini,
                saldo_cpp_resultante=costo,
                referencia_documento=f"Recepción Lote Inicial LOTE-{slug[:4].upper()}-01",
                fecha_hora=datetime(2026, 8, 1, 9, 0)
            ))
            kardex_creados += 1

    db.commit()

    # 2. Generar órdenes reales si no tiene órdenes
    ordenes_count = db.query(OrdenVenta).filter(OrdenVenta.id_empresa == id_empresa).count()
    ordenes_creadas = 0
    devoluciones_creadas = 0

    if ordenes_count < 10:
        inv_list = db.query(Inventario).filter(Inventario.id_empresa == id_empresa).all()
        if not inv_list:
            inv_list = items_inv

        ordenes_creadas_objs = []
        for idx, f_venta in enumerate(FECHAS_VENTAS):
            cli = CLIENTES_BOLIVIA[idx % len(CLIENTES_BOLIVIA)]
            s_obj = sucursales[idx % len(sucursales)]
            es_pos = (idx % 3 != 0)  # 66% POS, 33% WEB
            canal = "POS" if es_pos else "WEB"
            metodo = "EFECTIVO" if (idx % 3 == 0) else ("TARJETA_STRIPE" if (idx % 3 == 1) else "QR")
            fac_correlativo = f"{'POS' if es_pos else 'FAC'}-{slug[:4].upper()}-{idx+101:04d}"

            # Seleccionar 1 o 2 items de inventario
            inv_sel = inv_list[idx % len(inv_list)]
            prod_sel = db.query(Producto).filter(Producto.id_producto == inv_sel.id_producto).first()
            if not prod_sel:
                continue

            precio_u = prod_sel.precio_base or Decimal("250.00")
            cant_item = 1 if idx % 4 != 0 else 2
            subtot = Decimal(str(precio_u * cant_item))
            costo_env = Decimal("0.00") if es_pos else Decimal("15.00")
            tot = subtot + costo_env

            nueva_orden = OrdenVenta(
                id_empresa=id_empresa,
                id_usuario=cajero.id_usuario if es_pos else usuario_principal.id_usuario,
                id_sucursal=s_obj.id_sucursal,
                numero_factura=fac_correlativo,
                canal_venta=canal,
                modalidad_entrega="COMPRA_FISICA" if es_pos else "DELIVERY",
                metodo_pago=metodo,
                direccion_envio=s_obj.direccion if es_pos else cli[2],
                telefono_contacto=cli[3],
                nit_factura=cli[1],
                razon_social_factura=cli[0],
                subtotal=subtot,
                costo_envio=costo_env,
                total=tot,
                estado_pago="PAGADO",
                estado_logistica="ENTREGADA",
                creado_en=f_venta
            )
            db.add(nueva_orden)
            db.flush()
            ordenes_creadas_objs.append(nueva_orden)
            ordenes_creadas += 1

            # Detalle de orden
            db.add(OrdenDetalle(
                id_orden=nueva_orden.id_orden,
                id_producto=prod_sel.id_producto,
                talla=inv_sel.talla or "M",
                color=inv_sel.color or "Estándar",
                cantidad=cant_item,
                precio_unitario=precio_u,
                subtotal=subtot
            ))

            # Descuento en inventario y movimiento Kardex
            if inv_sel.stock_fisico > cant_item:
                inv_sel.stock_fisico -= cant_item
                inv_sel.stock_disponible = inv_sel.stock_fisico - (inv_sel.stock_reservado or 0)
                db.add(KardexMovimiento(
                    id_empresa=id_empresa,
                    id_inventario=inv_sel.id_inventario,
                    tipo_movimiento="SALIDA_VENTA",
                    cantidad=cant_item,
                    costo_unitario_movimiento=inv_sel.costo_promedio_ponderado,
                    saldo_cantidad_resultante=inv_sel.stock_fisico,
                    saldo_cpp_resultante=inv_sel.costo_promedio_ponderado,
                    referencia_documento=f"Venta Mostrador {fac_correlativo}",
                    fecha_hora=f_venta + timedelta(minutes=5)
                ))
                kardex_creados += 1

        db.commit()

        # 3. Generar 2 devoluciones de prueba (CU25)
        pos_orders = [o for o in ordenes_creadas_objs if o.canal_venta == "POS"]
        if len(pos_orders) >= 2:
            # Devolución 1: CAMBIO_VARIANTE
            ord1 = pos_orders[0]
            det1 = db.query(OrdenDetalle).filter(OrdenDetalle.id_orden == ord1.id_orden).first()
            if det1:
                dev1 = Devolucion(
                    id_empresa=id_empresa,
                    tenant_id=slug,
                    id_orden=ord1.id_orden,
                    id_sucursal=ord1.id_sucursal,
                    id_usuario=cajero.id_usuario,
                    nro_ticket_original=ord1.numero_factura,
                    nro_devolucion=f"DEV-{slug[:4].upper()}-0001",
                    fecha_devolucion=ord1.creado_en + timedelta(days=2),
                    motivo="Cambio de talla por ajuste holgado en hombros",
                    tipo_resolucion="CAMBIO_VARIANTE",
                    total_devuelto=Decimal("0.00"),
                    diferencia_cobrada=Decimal("0.00"),
                    codigo_vale=None,
                    estado="COMPLETADA"
                )
                db.add(dev1)
                db.flush()
                db.add(DevolucionDetalle(
                    id_devolucion=dev1.id_devolucion,
                    id_producto=det1.id_producto,
                    talla=det1.talla,
                    color=det1.color,
                    cantidad=1,
                    costo_historico_cpp=Decimal("120.00"),
                    precio_unitario_original=det1.precio_unitario
                ))
                devoluciones_creadas += 1

            # Devolución 2: VALE_CREDITO
            ord2 = pos_orders[1]
            det2 = db.query(OrdenDetalle).filter(OrdenDetalle.id_orden == ord2.id_orden).first()
            if det2:
                dev2 = Devolucion(
                    id_empresa=id_empresa,
                    tenant_id=slug,
                    id_orden=ord2.id_orden,
                    id_sucursal=ord2.id_sucursal,
                    id_usuario=cajero.id_usuario,
                    nro_ticket_original=ord2.numero_factura,
                    nro_devolucion=f"DEV-{slug[:4].upper()}-0002",
                    fecha_devolucion=ord2.creado_en + timedelta(days=3),
                    motivo="Preferencia por otra colección textil de temporada",
                    tipo_resolucion="VALE_CREDITO",
                    total_devuelto=det2.subtotal,
                    diferencia_cobrada=Decimal("0.00"),
                    codigo_vale=f"VALE-{slug[:4].upper()}-9902",
                    estado="COMPLETADA"
                )
                db.add(dev2)
                db.flush()
                db.add(DevolucionDetalle(
                    id_devolucion=dev2.id_devolucion,
                    id_producto=det2.id_producto,
                    talla=det2.talla,
                    color=det2.color,
                    cantidad=1,
                    costo_historico_cpp=Decimal("120.00"),
                    precio_unitario_original=det2.precio_unitario
                ))
                devoluciones_creadas += 1

            db.commit()

    # 4. Generar Reservas de Probador VIP (CU09/CU11/CU12)
    res_count = db.query(Reserva).filter(Reserva.id_empresa == id_empresa).count()
    reservas_creadas = 0
    if res_count < 3:
        for idx in range(3):
            s_obj = sucursales[idx % len(sucursales)]
            prod_sel = productos[idx % len(productos)]
            ticket_code = f"QR-{slug[:4].upper()}-{idx+10:03d}-{uuid.uuid4().hex[:6].upper()}"
            r_estado = "CONFIRMADA" if idx == 0 else ("PENDIENTE" if idx == 1 else "CERRADA_POR_VENTA")

            res = Reserva(
                id_empresa=id_empresa,
                id_usuario=usuario_principal.id_usuario,
                id_sucursal=s_obj.id_sucursal,
                codigo_qr=f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><text>{ticket_code}</text></svg>",
                qr_texto=ticket_code,
                fecha_visita=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=idx+1, hours=3),
                estado=r_estado
            )
            db.add(res)
            db.flush()
            db.add(ReservaDetalle(
                id_reserva=res.id_reserva,
                id_producto=prod_sel.id_producto,
                talla="M",
                color="Estándar",
                cantidad=1
            ))
            reservas_creadas += 1
        db.commit()

    # 5. Generar Traspasos Inter-Sucursal si tiene >= 2 sucursales (CU14)
    traspasos_creados = 0
    if len(sucursales) >= 2:
        with engine.begin() as conn:
            t_count = conn.execute(text("SELECT count(*) FROM traspasos_inter_sucursal WHERE id_empresa = :e"), {"e": id_empresa}).scalar()
            if t_count < 2:
                prod_sel = productos[0]
                cod1 = f"TRASP-{slug[:4].upper()}-0001"
                payload = json.dumps([{"id_producto": prod_sel.id_producto, "nombre": prod_sel.nombre, "talla": "M", "color": "Estándar", "cantidad": 5}])
                conn.execute(text("""
                    INSERT INTO traspasos_inter_sucursal (
                        codigo_traspaso, id_empresa, id_sucursal_origen, id_sucursal_destino,
                        id_usuario_solicita, id_usuario_recibe, estado, detalles_json, observaciones, fecha_solicitud
                    ) VALUES (
                        :cod, :emp, :org, :dst, :sol, :rec, 'COMPLETADO', :det, 'Rebalanceo de stock de fin de semana', :fec
                    ) ON CONFLICT (codigo_traspaso) DO NOTHING
                """), {
                    "cod": cod1, "emp": id_empresa, "org": sucursales[0].id_sucursal, "dst": sucursales[1].id_sucursal,
                    "sol": usuario_principal.id_usuario, "rec": cajero.id_usuario, "det": payload,
                    "fec": datetime(2026, 10, 20, 14, 0)
                })
                traspasos_creados += 1

    # 6. Generar Órdenes de Compra Desktop Aprovisionamiento (CU20)
    compras_creadas = 0
    with engine.begin() as conn:
        oc_count = conn.execute(text("SELECT count(*) FROM ordenes_compra_desktop WHERE id_empresa = :e"), {"e": id_empresa}).scalar()
        if oc_count < 2:
            prod_sel = productos[0]
            cod_oc = f"OC-{slug[:4].upper()}-0001"
            items_oc = json.dumps([{
                "id_producto": prod_sel.id_producto,
                "nombre_producto": prod_sel.nombre,
                "talla": "M",
                "color": "Estándar",
                "cantidad": 50,
                "costo_unitario": 85.00,
                "subtotal": 4250.00
            }])
            conn.execute(text("""
                INSERT INTO ordenes_compra_desktop (
                    codigo_orden, id_empresa, id_proveedor, id_sucursal_destino, id_usuario,
                    monto_total, subtotal, iva, total_con_iva, estado, detalles_json, observaciones, fecha_emision
                ) VALUES (
                    :cod, :emp, 1, :suc, :usr, 4802.50, 4250.00, 552.50, 4802.50, 'RECEPCIONADA', :items,
                    'Aprovisionamiento inicial de temporada textil', :fec
                ) ON CONFLICT (codigo_orden) DO NOTHING
            """), {
                "cod": cod_oc, "emp": id_empresa, "suc": sucursales[0].id_sucursal, "usr": usuario_principal.id_usuario,
                "items": items_oc, "fec": datetime(2026, 8, 5, 10, 0)
            })
            compras_creadas += 1

    # 7. Generar Bitácora de Accesos (CU21)
    bitacora_creados = 0
    b_count = db.query(BitacoraAcceso).filter(BitacoraAcceso.id_empresa == id_empresa).count()
    if b_count < 5:
        for idx in range(6):
            u_sel = usuario_principal if idx % 2 == 0 else cajero
            f_acc = datetime(2026, 11, 8, 8, 30) + timedelta(hours=idx)
            db.add(BitacoraAcceso(
                id_empresa=id_empresa,
                id_usuario=u_sel.id_usuario,
                email_intento=u_sel.email,
                ip_origen="190.181.45.12" if idx % 2 == 0 else "127.0.0.1",
                user_agent="FashionStore Commercial Web Portal",
                tipo_evento="LOGIN_EXITOSO" if idx < 4 else "ACCESO_SISTEMA",
                exitoso=True,
                motivo="Credenciales válidas" if idx < 4 else "Token renovado",
                detalles_json=f'{{"detalle": "Ingreso autorizado {u_sel.rol} - {emp.nombre_comercial}"}}',
                fecha_hora=f_acc
            ))
            bitacora_creados += 1
        db.commit()

    return {
        "empresa": nombre,
        "id_empresa": id_empresa,
        "ordenes_creadas": ordenes_creadas,
        "kardex_creados": kardex_creados,
        "devoluciones_creadas": devoluciones_creadas,
        "reservas_creadas": reservas_creadas,
        "traspasos_creados": traspasos_creados,
        "compras_creadas": compras_creadas,
        "bitacora_creados": bitacora_creados
    }


def ejecutar_siembra_completa():
    print("=" * 60)
    print(" INICIANDO SIEMBRA COMPLETA MULTITENANT (PARCIAL 2)")
    print("=" * 60)
    db = SessionLocal()
    try:
        tenants = db.query(Empresa).filter(Empresa.id_empresa.in_([2, 32, 33, 34, 35])).all()
        for t in tenants:
            res = sembrar_operaciones_por_tenant(db, t.id_empresa)
            print(f"[*] Tenant #{t.id_empresa} ({t.nombre_comercial}): {res}")
    finally:
        db.close()
    print("=" * 60)
    print(" SIEMBRA COMPLETA MULTITENANT FINALIZADA CON ÉXITO")
    print("=" * 60)


if __name__ == "__main__":
    ejecutar_siembra_completa()
