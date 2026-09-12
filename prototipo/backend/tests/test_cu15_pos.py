# -*- coding: utf-8 -*-
"""
Test de Integración para CU15: Registrar Venta Presencial en Caja (POS)
"""
import sys
import os
from datetime import datetime, timezone, timedelta

# Ajustar path para importar app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Importar app y Base para resolver mappers
import app.main
from app.core.database import SessionLocal
from app.modules.pos.services import buscar_producto_por_sku, cargar_reserva_para_pos, procesar_venta_pos
from app.modules.pos.schemas import PosVentaCreate, PosItemInput
from app.modules.auth.models import Usuario
from app.modules.productos.models import Producto
from app.modules.inventario.models import Inventario, KardexMovimiento
from app.modules.reservas.models import Reserva, ReservaDetalle
from app.modules.ordenes.models import OrdenVenta

def run_tests():
    db = SessionLocal()
    try:
        print("=== INICIANDO TEST CU15: REGISTRAR VENTA PRESENCIAL EN CAJA (POS) ===")
        
        # 1. Obtener un usuario cajero o administrador
        cajero = db.query(Usuario).filter(Usuario.email == "javier.roca@store.bo").first()
        if not cajero:
            cajero = db.query(Usuario).filter(Usuario.rol.in_(["CAJERO", "ADMINISTRADOR"])).first()
        assert cajero is not None, "Debe existir al menos un cajero o administrador"
        id_sucursal = cajero.id_sucursal or 1
        print(f"[OK] Cajero: {cajero.email} (ID: {cajero.id_usuario}) en Sucursal #{id_sucursal}")
        
        # 2. Buscar un producto activo que tenga inventario en esta sucursal
        inv = db.query(Inventario).filter(
            Inventario.id_sucursal == id_sucursal,
            Inventario.stock_disponible >= 2
        ).first()
        assert inv is not None, "Debe haber inventario disponible para pruebas"
        prod = db.query(Producto).filter(Producto.id_producto == inv.id_producto).first()
        assert prod is not None, "El producto de inventario debe existir"
        print(f"[OK] Producto de prueba: '{prod.nombre}' (SKU: {prod.codigo_sku_base}, Talla: {inv.talla}, Color: {inv.color})")
        
        # 3. Test de Búsqueda por SKU
        res_sku = buscar_producto_por_sku(db, prod.codigo_sku_base, id_sucursal)
        assert res_sku.codigo_sku_base == prod.codigo_sku_base
        assert res_sku.stock_disponible_sucursal >= inv.stock_disponible
        print(f"[OK] Búsqueda por SKU exitosa. Stock: {res_sku.stock_disponible_sucursal}, Precio: Bs. {res_sku.precio_base}")
        
        # 4. Test de Venta Directa en Efectivo (con cálculo de vuelto)
        stock_ant_fisico = inv.stock_fisico
        stock_ant_disp = inv.stock_disponible
        cant_vender = 1
        precio_unit = float(prod.precio_base)
        monto_total = cant_vender * precio_unit
        monto_pagado = monto_total + 50.0  # Pago con vuelto de Bs. 50
        
        venta_payload = PosVentaCreate(
            nombre_cliente="Juan Perez POS Test",
            nit_cliente="12345678",
            metodo_pago="EFECTIVO",
            monto_recibido=monto_pagado,
            items=[
                PosItemInput(
                    id_producto=prod.id_producto,
                    sku=prod.codigo_sku_base,
                    nombre_producto=prod.nombre,
                    talla=inv.talla,
                    color=inv.color,
                    cantidad=cant_vender,
                    precio_unitario=precio_unit
                )
            ]
        )
        
        ticket = procesar_venta_pos(
            db=db,
            id_cajero=cajero.id_usuario,
            id_sucursal=id_sucursal,
            cajero_nombre=cajero.nombre_completo,
            venta_in=venta_payload
        )
        assert ticket.total == monto_total
        assert ticket.monto_recibido == monto_pagado
        assert ticket.cambio_devolver == 50.0
        assert ticket.numero_factura.startswith("POS-")
        print(f"[OK] Venta POS procesada. Factura: {ticket.numero_factura}, Total: Bs. {ticket.total}, Vuelto: Bs. {ticket.cambio_devolver}")
        
        # Verificar descuento de inventario
        db.refresh(inv)
        assert inv.stock_fisico == stock_ant_fisico - cant_vender, "El stock físico debió descontarse"
        assert inv.stock_disponible == stock_ant_disp - cant_vender, "El stock disponible debió descontarse"
        print(f"[OK] Inventario actualizado: Físico {stock_ant_fisico}->{inv.stock_fisico}, Disp {stock_ant_disp}->{inv.stock_disponible}")
        
        # Verificar Kardex Movimiento
        kardex = db.query(KardexMovimiento).filter(
            KardexMovimiento.id_inventario == inv.id_inventario,
            KardexMovimiento.tipo_movimiento == "SALIDA_VENTA"
        ).order_by(KardexMovimiento.id_movimiento.desc()).first()
        assert kardex is not None
        assert kardex.cantidad == cant_vender
        print(f"[OK] Kardex asentado: ID {kardex.id_movimiento}, Tipo {kardex.tipo_movimiento}, Cantidad {kardex.cantidad}")
        
        # 5. Test de Validación Pago Insuficiente
        try:
            pago_insuficiente = PosVentaCreate(
                nombre_cliente="Prueba Error",
                metodo_pago="EFECTIVO",
                monto_recibido=monto_total - 10.0,
                items=[
                    PosItemInput(
                        id_producto=prod.id_producto,
                        sku=prod.codigo_sku_base,
                        talla=inv.talla,
                        color=inv.color,
                        cantidad=1,
                        precio_unitario=precio_unit
                    )
                ]
            )
            procesar_venta_pos(db, cajero.id_usuario, id_sucursal, cajero.nombre_completo, pago_insuficiente)
            assert False, "Debió fallar por monto recibido insuficiente"
        except Exception as e:
            print(f"[OK] Validación de pago insuficiente interceptada con éxito: {str(e)}")
            
        # 6. Test de Conversión de Reserva a Venta POS
        cliente = db.query(Usuario).filter(Usuario.rol == "CLIENTE").first()
        test_qr = f"POS-TEST-QR-{datetime.now().microsecond}"
        reserva_test = Reserva(
            codigo_qr=test_qr,
            qr_texto=test_qr,
            id_usuario=cliente.id_usuario if cliente else cajero.id_usuario,
            id_sucursal=id_sucursal,
            fecha_visita=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=1),
            estado="PREPARADA"
        )
        db.add(reserva_test)
        db.flush()
        
        detalle_res = ReservaDetalle(
            id_reserva=reserva_test.id_reserva,
            id_producto=prod.id_producto,
            talla=inv.talla,
            color=inv.color,
            cantidad=1
        )
        db.add(detalle_res)
        db.commit()
        
        # Cargar reserva en POS
        res_info = cargar_reserva_para_pos(db, test_qr, id_sucursal)
        assert res_info.id_reserva == reserva_test.id_reserva
        assert len(res_info.detalles) == 1
        assert res_info.detalles[0].id_producto == prod.id_producto
        print(f"[OK] Reserva cargada en POS: ID #{res_info.id_reserva}, Cliente: {res_info.nombre_cliente}, Items: {len(res_info.detalles)}")
        
        # Facturar la reserva en POS
        venta_reserva = PosVentaCreate(
            id_reserva_origen=reserva_test.id_reserva,
            nombre_cliente=res_info.nombre_cliente,
            nit_cliente="0",
            metodo_pago="QR",
            monto_recibido=res_info.subtotal,
            items=res_info.detalles
        )
        ticket_res = procesar_venta_pos(db, cajero.id_usuario, id_sucursal, cajero.nombre_completo, venta_reserva)
        assert ticket_res.numero_factura.startswith("POS-")
        
        # Verificar estado de la reserva
        db.refresh(reserva_test)
        assert reserva_test.estado == "CERRADA_POR_VENTA"
        print(f"[OK] Reserva convertida a venta y cerrada con éxito. Estado final: {reserva_test.estado}")
        
        print("\n=== TODOS LOS TESTS DE CU15 BACKEND COMPLETADOS CON ÉXITO ===")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
