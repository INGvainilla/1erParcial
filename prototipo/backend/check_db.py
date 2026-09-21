import sqlite3

conn = sqlite3.connect('app/fashionstore_local.db')
c = conn.cursor()

tables = [t[0] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)

print("\n=== ALL KARDEX MOVEMENTS (30 rows) ===")
for r in c.execute("SELECT id_movimiento, id_inventario, fecha_hora, tipo_movimiento, cantidad, costo_unitario_movimiento, saldo_cantidad_resultante, saldo_cpp_resultante, referencia_documento FROM kardex_movimientos ORDER BY id_inventario, id_movimiento"):
    print(r)

print("\n=== ALL ORDERS AND DETAILS ===")
for r in c.execute("""
    SELECT o.id_orden, o.numero_factura, o.id_sucursal, o.canal_venta, o.estado_pago, o.creado_en, 
           d.id_producto, d.talla, d.color, d.cantidad, d.precio_unitario
    FROM ordenes_venta o
    LEFT JOIN ordenes_detalle d ON o.id_orden = d.id_orden
    ORDER BY o.id_orden ASC
"""):
    print(r)




