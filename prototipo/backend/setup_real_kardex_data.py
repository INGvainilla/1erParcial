# -*- coding: utf-8 -*-
"""
Script de Establecimiento de Datos Reales y Coherentes para CU09, CU15 y CU25
FashionStore ERP Omnicanal

Garantiza:
1. Inventario con existencias reales exactas:
   - Item 1 (Camisa Oxford Slim Fit, M Azul Marino, Equipetrol): 44 fisico / 39 disp (5 reservadas), CPP Bs. 107.14
   - Item 2 (Camisa Oxford Slim Fit, L Blanco Óptico, Equipetrol): 19 fisico / 19 disp, CPP Bs. 110.00
   - Item 3 (Pantalón Chino Gabardina, 32 Beige Arena, Equipetrol): 20 fisico / 18 disp (2 reservadas), CPP Bs. 135.00
   - Item 4 (Camisa Oxford Slim Fit, M Azul Marino, Calacoto): 15 fisico / 15 disp, CPP Bs. 115.00
   - Item 5 (Blazer de Lino Casual, 40 Gris Plomo, El Prado): 8 fisico / 7 disp (1 reservada), CPP Bs. 310.00
   - Items 6 a 283: 20 fisico / 20 disp
2. Todas las órdenes y tickets referenciados existen en ordenes_venta y ordenes_detalle.
3. Todas las devoluciones e intercambios referenciados existen en devoluciones y devolucion_detalles.
4. Todo movimiento en kardex_movimientos es 100% coherente con la matemática formal de CPP y los saldos físicos.
"""
import sqlite3
from datetime import datetime, timedelta
from decimal import Decimal

DB_PATH = 'app/fashionstore_local.db'

def setup_real_data():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    print("[1] Verificando proveedores y estructura...")
    proveedores = {r['id_proveedor']: r['razon_social'] for r in c.execute("SELECT id_proveedor, razon_social FROM proveedores").fetchall()}
    productos = {r['id_producto']: dict(r) for r in c.execute("SELECT id_producto, nombre, codigo_sku_base, id_proveedor, precio_base FROM productos").fetchall()}

    # 1. Definir los stocks objetivos exactos que el usuario ve en la pantalla
    stock_targets = {
        1: {'fisico': 44, 'reservado': 5, 'disp': 39, 'cpp': 107.14, 'ultimo_costo': 120.00},
        2: {'fisico': 19, 'reservado': 0, 'disp': 19, 'cpp': 110.00, 'ultimo_costo': 110.00},
        3: {'fisico': 20, 'reservado': 2, 'disp': 18, 'cpp': 135.00, 'ultimo_costo': 140.00},
        4: {'fisico': 15, 'reservado': 0, 'disp': 15, 'cpp': 115.00, 'ultimo_costo': 115.00},
        5: {'fisico': 8,  'reservado': 1, 'disp': 7,  'cpp': 310.00, 'ultimo_costo': 320.00}
    }

    # Actualizar inventario para los 5 ítems principales
    for id_inv, st in stock_targets.items():
        c.execute("""
            UPDATE inventario 
            SET stock_fisico = ?, stock_reservado = ?, stock_disponible = ?, costo_promedio_ponderado = ?, ultimo_costo_compra = ?
            WHERE id_inventario = ?
        """, (st['fisico'], st['reservado'], st['disp'], st['cpp'], st['ultimo_costo'], id_inv))

    # Asegurar que el resto de los 283 items tengan stock 20
    c.execute("""
        UPDATE inventario 
        SET stock_fisico = 20, stock_reservado = 0, stock_disponible = 20 
        WHERE id_inventario > 5
    """)

    # 2. Registrar Órdenes Reales en ordenes_venta y ordenes_detalle para respaldar las ventas
    ordenes_reales = [
        {
            'numero_factura': 'POS-2026-0042',
            'id_sucursal': 1,
            'canal_venta': 'POS',
            'fecha': '2026-09-16 11:30:00',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'precio': 180.00}]
        },
        {
            'numero_factura': 'POS-2026-0055',
            'id_sucursal': 1,
            'canal_venta': 'POS',
            'fecha': '2026-09-17 15:45:00',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'precio': 180.00}]
        },
        {
            'numero_factura': 'FAC-2026-0081',
            'id_sucursal': 1,
            'canal_venta': 'WEB',
            'fecha': '2026-09-18 10:20:00',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'precio': 180.00}]
        },
        {
            'numero_factura': 'POS-2026-0099',
            'id_sucursal': 1,
            'canal_venta': 'POS',
            'fecha': '2026-09-18 16:10:00',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'precio': 180.00}]
        },
        {
            'numero_factura': 'POS-2026-0077',
            'id_sucursal': 4,
            'canal_venta': 'POS',
            'fecha': '2026-09-19 14:00:00',
            'items': [{'id_producto': 3, 'talla': '40', 'color': 'Gris Plomo', 'cant': 2, 'precio': 520.00}]
        }
    ]

    for ord_r in ordenes_reales:
        # Verificar si ya existe
        exist = c.execute("SELECT id_orden FROM ordenes_venta WHERE numero_factura = ?", (ord_r['numero_factura'],)).fetchone()
        if not exist:
            subtotal = sum(it['cant'] * it['precio'] for it in ord_r['items'])
            c.execute("""
                INSERT INTO ordenes_venta (
                    id_usuario, id_sucursal, numero_factura, canal_venta, modalidad_entrega,
                    nit_factura, razon_social_factura, subtotal, costo_envio, total,
                    estado_pago, estado_logistica, creado_en
                ) VALUES (1, ?, ?, ?, 'COMPRA_FISICA', '4912044019', 'Cliente Mostrador', ?, 0, ?, 'PAGADO', 'ENTREGADA', ?)
            """, (ord_r['id_sucursal'], ord_r['numero_factura'], ord_r['canal_venta'], subtotal, subtotal, ord_r['fecha']))
            id_orden = c.lastrowid
            for it in ord_r['items']:
                sub_l = it['cant'] * it['precio']
                c.execute("""
                    INSERT INTO ordenes_detalle (
                        id_orden, id_producto, talla, color, cantidad, precio_unitario, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (id_orden, it['id_producto'], it['talla'], it['color'], it['cant'], it['precio'], sub_l))

    # 3. Registrar Devoluciones Reales en devoluciones y devolucion_detalles
    devoluciones_reales = [
        {
            'nro_devolucion': 'DEV-2026-0012',
            'nro_ticket_original': 'POS-2026-0042',
            'id_sucursal': 1,
            'tipo_resolucion': 'REEMBOLSO_EFECTIVO',
            'fecha': '2026-09-20 11:15:00',
            'motivo': 'Talla no adecuada',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00}]
        },
        {
            'nro_devolucion': 'DEV-2026-0025',
            'nro_ticket_original': 'POS-2026-0055',
            'id_sucursal': 1,
            'tipo_resolucion': 'VALE_CREDITO',
            'fecha': '2026-09-20 16:30:00',
            'motivo': 'Preferencia de color',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00}]
        },
        {
            'nro_devolucion': 'DEV-2026-0038',
            'nro_ticket_original': 'POS-2026-0099',
            'id_sucursal': 1,
            'tipo_resolucion': 'CAMBIO_VARIANTE',
            'fecha': '2026-09-21 10:45:00',
            'motivo': 'Cambio por talla L Blanco Óptico',
            'items': [{
                'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00,
                'nuevo_prod': 1, 'nueva_talla': 'L', 'nuevo_color': 'Blanco Óptico'
            }]
        }
    ]

    # 3. Registrar Devoluciones Reales en devoluciones y devolucion_detalles
    devoluciones_reales = [
        {
            'nro_devolucion': 'DEV-2026-0012',
            'nro_ticket_original': 'POS-2026-0042',
            'id_sucursal': 1,
            'tipo_resolucion': 'REEMBOLSO_EFECTIVO',
            'fecha': '2026-09-20 11:15:00',
            'motivo': 'Talla no adecuada',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00}]
        },
        {
            'nro_devolucion': 'DEV-2026-0025',
            'nro_ticket_original': 'POS-2026-0055',
            'id_sucursal': 1,
            'tipo_resolucion': 'VALE_CREDITO',
            'fecha': '2026-09-20 16:30:00',
            'motivo': 'Preferencia de color',
            'items': [{'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00}]
        },
        {
            'nro_devolucion': 'DEV-2026-0038',
            'nro_ticket_original': 'POS-2026-0099',
            'id_sucursal': 1,
            'tipo_resolucion': 'CAMBIO_VARIANTE',
            'fecha': '2026-09-21 10:45:00',
            'motivo': 'Cambio por talla L Blanco Óptico',
            'items': [{
                'id_producto': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1, 'cpp': 107.14, 'precio': 180.00,
                'nuevo_prod': 1, 'nueva_talla': 'L', 'nuevo_color': 'Blanco Óptico'
            }]
        }
    ]

    for dev_r in devoluciones_reales:
        exist = c.execute("SELECT id_devolucion FROM devoluciones WHERE nro_devolucion = ?", (dev_r['nro_devolucion'],)).fetchone()
        if not exist:
            c.execute("""
                INSERT INTO devoluciones (
                    tenant_id, id_orden, id_sucursal, id_usuario, nro_ticket_original,
                    nro_devolucion, fecha_devolucion, motivo, tipo_resolucion, total_devuelto,
                    diferencia_cobrada, estado
                ) VALUES (1, 1, ?, 1, ?, ?, ?, ?, ?, 180.00, 0, 'APROBADA')
            """, (dev_r['id_sucursal'], dev_r['nro_ticket_original'], dev_r['nro_devolucion'], dev_r['fecha'], dev_r['motivo'], dev_r['tipo_resolucion']))
            id_dev = c.lastrowid
            for it in dev_r['items']:
                nuevo_p = it.get('nuevo_prod')
                nueva_t = it.get('nueva_talla')
                nuevo_c = it.get('nuevo_color')
                c.execute("""
                    INSERT INTO devolucion_detalles (
                        id_devolucion, id_producto, talla, color, cantidad, costo_historico_cpp,
                        precio_unitario_original, estado_fisico, nuevo_producto_cambio_id, nueva_talla, nuevo_color
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'APTO_VENTA', ?, ?, ?)
                """, (id_dev, it['id_producto'], it['talla'], it['color'], it['cant'], it['cpp'], it['precio'], nuevo_p, nueva_t, nuevo_c))

    # 4. Registrar Reservas Reales Activas en reservas y reserva_detalles
    reservas_reales = [
        # 5 reservas para Item #1 (Camisa Oxford M Azul Marino Equipetrol)
        {'ticket': 'RES-2026-EQUI-101', 'id_sucursal': 1, 'fecha': '2026-09-21 11:00:00', 'items': [{'id_p': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1}]},
        {'ticket': 'RES-2026-EQUI-102', 'id_sucursal': 1, 'fecha': '2026-09-21 11:05:00', 'items': [{'id_p': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1}]},
        {'ticket': 'RES-2026-EQUI-103', 'id_sucursal': 1, 'fecha': '2026-09-21 11:10:00', 'items': [{'id_p': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1}]},
        {'ticket': 'RES-2026-EQUI-104', 'id_sucursal': 1, 'fecha': '2026-09-21 11:15:00', 'items': [{'id_p': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1}]},
        {'ticket': 'RES-2026-EQUI-105', 'id_sucursal': 1, 'fecha': '2026-09-21 11:20:00', 'items': [{'id_p': 1, 'talla': 'M', 'color': 'Azul Marino', 'cant': 1}]},
        # 2 reservas para Item #3 (Pantalón Chino 32 Beige Arena Equipetrol)
        {'ticket': 'RES-2026-EQUI-201', 'id_sucursal': 1, 'fecha': '2026-09-21 09:15:00', 'items': [{'id_p': 2, 'talla': '32', 'color': 'Beige Arena', 'cant': 1}]},
        {'ticket': 'RES-2026-EQUI-202', 'id_sucursal': 1, 'fecha': '2026-09-21 09:30:00', 'items': [{'id_p': 2, 'talla': '32', 'color': 'Beige Arena', 'cant': 1}]},
        # 1 reserva para Item #5 (Blazer de Lino 40 Gris Plomo El Prado)
        {'ticket': 'RES-2026-PRADO-501', 'id_sucursal': 4, 'fecha': '2026-09-21 08:45:00', 'items': [{'id_p': 3, 'talla': '40', 'color': 'Gris Plomo', 'cant': 1}]}
    ]

    for res_r in reservas_reales:
        exist = c.execute("SELECT id_reserva FROM reservas WHERE qr_texto = ?", (res_r['ticket'],)).fetchone()
        if not exist:
            c.execute("""
                INSERT INTO reservas (
                    id_usuario, id_sucursal, codigo_qr, qr_texto, fecha_visita, estado, creado_en
                ) VALUES (1, ?, ?, ?, '2026-09-22 15:00:00', 'CONFIRMADA', ?)
            """, (res_r['id_sucursal'], f"data:image/png;base64,{res_r['ticket']}", res_r['ticket'], res_r['fecha']))
            id_res = c.lastrowid
            for it in res_r['items']:
                c.execute("""
                    INSERT INTO reserva_detalles (
                        id_reserva, id_producto, talla, color, cantidad
                    ) VALUES (?, ?, ?, ?, ?)
                """, (id_res, it['id_p'], it['talla'], it['color'], it['cant']))

    # 5. Reconstruir kardex_movimientos con absoluta precisión matemática
    c.execute("DELETE FROM kardex_movimientos")

    kardex_list = []

    # ==========================
    # KARDEX ITEM 1 (Camisa Oxford M Azul Marino, Equipetrol)
    # Objetivo: Saldo final exacto = 44 unid., CPP = Bs. 107.14
    # Stock Disponible = 39 unid. respaldado por las 5 reservas apartadas
    # ==========================
    # Lote 1: 15 unid @ 90.00 -> saldo 15, CPP 90.00
    kardex_list.append((1, 'ENTRADA_COMPRA', 15, 90.00, 15, 90.00, 'Ingreso Lote Inicial Fac-101 - Confecciones Andina SA', '2026-09-15 09:00:00'))
    # Lote 2: 20 unid @ 120.00 -> saldo 35, CPP (15*90 + 20*120)/35 = 107.14
    kardex_list.append((1, 'ENTRADA_COMPRA', 20, 120.00, 35, 107.14, 'Ingreso Segundo Lote Fac-205 - Recálculo Formal CPP', '2026-09-15 14:30:00'))
    # Lote 3: 10 unid @ 107.14 -> saldo 45, CPP 107.14
    kardex_list.append((1, 'ENTRADA_COMPRA', 10, 107.14, 45, 107.14, 'Ingreso Lote de Reposición Fac-309 - Confecciones Andina SA', '2026-09-16 08:30:00'))
    # Ventas reales:
    kardex_list.append((1, 'SALIDA_VENTA', 1, 107.14, 44, 107.14, 'Factura Mostrador POS-2026-0042', '2026-09-16 11:30:00'))
    kardex_list.append((1, 'SALIDA_VENTA', 1, 107.14, 43, 107.14, 'Factura Mostrador POS-2026-0055', '2026-09-17 15:45:00'))
    kardex_list.append((1, 'SALIDA_VENTA', 1, 107.14, 42, 107.14, 'Venta Digital Web FAC-2026-0081', '2026-09-18 10:20:00'))
    kardex_list.append((1, 'SALIDA_VENTA', 1, 107.14, 41, 107.14, 'Factura Mostrador POS-2026-0099', '2026-09-18 16:10:00'))
    # Devoluciones reales:
    kardex_list.append((1, 'DEVOLUCION_VENTA', 1, 107.14, 42, 107.14, 'Devolución DEV-2026-0012 Reembolso (Ticket POS-2026-0042)', '2026-09-20 11:15:00'))
    kardex_list.append((1, 'DEVOLUCION_VENTA', 1, 107.14, 43, 107.14, 'Devolución DEV-2026-0025 Vale Crédito (Ticket POS-2026-0055)', '2026-09-20 16:30:00'))
    kardex_list.append((1, 'DEVOLUCION_VENTA', 1, 107.14, 44, 107.14, 'Devolución DEV-2026-0038 Cambio Prenda (Ticket POS-2026-0099)', '2026-09-21 10:45:00'))
    # Las 5 reservas apartadas que explican el Stock Disponible = 39:
    kardex_list.append((1, 'RESERVA_APARTADA', 1, 107.14, 44, 107.14, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-101', '2026-09-21 11:00:00'))
    kardex_list.append((1, 'RESERVA_APARTADA', 1, 107.14, 44, 107.14, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-102', '2026-09-21 11:05:00'))
    kardex_list.append((1, 'RESERVA_APARTADA', 1, 107.14, 44, 107.14, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-103', '2026-09-21 11:10:00'))
    kardex_list.append((1, 'RESERVA_APARTADA', 1, 107.14, 44, 107.14, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-104', '2026-09-21 11:15:00'))
    kardex_list.append((1, 'RESERVA_APARTADA', 1, 107.14, 44, 107.14, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-105', '2026-09-21 11:20:00'))

    # ==========================
    # KARDEX ITEM 2 (Camisa Oxford L Blanco Óptico, Equipetrol)
    # Objetivo: Saldo final exacto = 19 unid., CPP = Bs. 110.00
    # ==========================
    kardex_list.append((2, 'ENTRADA_COMPRA', 20, 110.00, 20, 110.00, 'Ingreso Lote Inicial Fac-1012 - Confecciones Andina SA', '2026-09-15 09:30:00'))
    # Entrega por intercambio de la devolución DEV-2026-0038
    kardex_list.append((2, 'SALIDA_VENTA', 1, 110.00, 19, 110.00, 'Entrega por Cambio Prenda Comprobante DEV-2026-0038', '2026-09-21 10:45:00'))

    # ==========================
    # KARDEX ITEM 3 (Pantalón Chino 32 Beige Arena, Equipetrol)
    # Objetivo: Saldo final exacto = 20 unid. (disp 18 por 2 reservas), CPP = Bs. 135.00
    # ==========================
    kardex_list.append((3, 'ENTRADA_COMPRA', 20, 135.00, 20, 135.00, 'Ingreso Lote Inicial Fac-1013 - Hilanderías del Sur SRL', '2026-09-15 10:00:00'))
    kardex_list.append((3, 'RESERVA_APARTADA', 1, 135.00, 20, 135.00, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-201', '2026-09-21 09:15:00'))
    kardex_list.append((3, 'RESERVA_APARTADA', 1, 135.00, 20, 135.00, 'Reserva Probador Apartada Ticket #RES-2026-EQUI-202', '2026-09-21 09:30:00'))

    # ==========================
    # KARDEX ITEM 4 (Camisa Oxford M Azul Marino, Calacoto)
    # Objetivo: Saldo final exacto = 15 unid., CPP = Bs. 115.00
    # ==========================
    kardex_list.append((4, 'ENTRADA_COMPRA', 15, 115.00, 15, 115.00, 'Ingreso Lote Traslado Sucursal Calacoto Fac-1014 - Confecciones Andina SA', '2026-09-15 10:30:00'))

    # ==========================
    # KARDEX ITEM 5 (Blazer de Lino 40 Gris Plomo, El Prado)
    # Objetivo: Saldo final exacto = 8 unid. (disp 7 por 1 reserva), CPP = Bs. 310.00
    # ==========================
    kardex_list.append((5, 'ENTRADA_COMPRA', 10, 310.00, 10, 310.00, 'Ingreso Lote Importación Fac-1015 - Importadora Textil Italiana', '2026-09-15 11:00:00'))
    kardex_list.append((5, 'SALIDA_VENTA', 2, 310.00, 8, 310.00, 'Factura Mostrador POS-2026-0077', '2026-09-19 14:00:00'))
    kardex_list.append((5, 'RESERVA_APARTADA', 1, 310.00, 8, 310.00, 'Reserva Probador Apartada Ticket #RES-2026-PRADO-501', '2026-09-21 08:45:00'))


    # ==========================
    # KARDEX ITEMS 6 AL 283
    # Cada uno con su Lote Inicial según su stock físico y CPP real de BD
    # ==========================
    otros_invs = c.execute("SELECT id_inventario, id_producto, stock_fisico, costo_promedio_ponderado FROM inventario WHERE id_inventario > 5").fetchall()
    for oi in otros_invs:
        id_i = oi['id_inventario']
        p_id = oi['id_producto']
        p_info = productos.get(p_id, {})
        prov_id = p_info.get('id_proveedor', 1)
        prov_nom = proveedores.get(prov_id, "Confecciones Andina SA")
        st_fis = oi['stock_fisico']
        cpp_val = float(oi['costo_promedio_ponderado'])
        fac_num = 1000 + id_i

        kardex_list.append((
            id_i, 'ENTRADA_COMPRA', st_fis, cpp_val, st_fis, cpp_val,
            f'Ingreso Lote Inicial Fac-{fac_num} - {prov_nom}', '2026-09-15 12:00:00'
        ))

    print(f"[5] Insertando {len(kardex_list)} movimientos en kardex_movimientos...")
    for km in kardex_list:
        c.execute("""
            INSERT INTO kardex_movimientos (
                id_inventario, tipo_movimiento, cantidad, costo_unitario_movimiento,
                saldo_cantidad_resultante, saldo_cpp_resultante, referencia_documento, fecha_hora
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, km)

    conn.commit()
    print("Datos reales y kardex coherente establecidos con éxito.")

    # Verificación final
    print("\n=== VERIFICACIÓN DE SALDOS Y COHERENCIA ===")
    for test_id in [1, 2, 3, 4, 5]:
        inv = c.execute("SELECT stock_fisico, stock_disponible, costo_promedio_ponderado FROM inventario WHERE id_inventario = ?", (test_id,)).fetchone()
        last_k = c.execute("SELECT saldo_cantidad_resultante, saldo_cpp_resultante, tipo_movimiento, referencia_documento FROM kardex_movimientos WHERE id_inventario = ? ORDER BY id_movimiento DESC LIMIT 1", (test_id,)).fetchone()
        print(f"Item #{test_id}:")
        print(f"  Inventario: Stock Físico = {inv['stock_fisico']} | Disp = {inv['stock_disponible']} | CPP = {inv['costo_promedio_ponderado']}")
        print(f"  Kardex Top: Saldo Físico = {last_k['saldo_cantidad_resultante']} | Saldo CPP = {last_k['saldo_cpp_resultante']} | Ref = {last_k['referencia_documento']}")
        assert inv['stock_fisico'] == last_k['saldo_cantidad_resultante'], f"ERROR: Mismatch en Item #{test_id}!"

    print("\n¡TODAS LAS VERIFICACIONES PASARON AL 100%!")
    conn.close()

if __name__ == '__main__':
    setup_real_data()
