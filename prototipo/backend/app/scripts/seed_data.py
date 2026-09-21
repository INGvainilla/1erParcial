# -*- coding: utf-8 -*-
"""
Script de Población de Datos Semilla para FashionStore (Ciclo 1)
Ejecuta la inserción ordenada de ciudades, sucursales, usuarios RBAC con Bcrypt,
proveedores, temporadas, categorías, marcas, productos con tallas/colores HEX,
e inventario multi-sucursal valuado por Costo Promedio Ponderado (CPP) y Kardex.
"""
import sys
import os
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# Asegurar path de importación
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.modules.p02_estructura_operativa.sucursales.models import Ciudad, Sucursal
from app.modules.p01_seguridad_acceso.auth.models import Usuario, TokenRecuperacion, BitacoraAcceso
from app.modules.p04_aprovisionamiento_proveedores.proveedores.models import Proveedor
from app.modules.p03_catalogo_estilismo_ia.temporadas.models import Temporada
from app.modules.p03_catalogo_estilismo_ia.productos.models import Categoria, Marca, Producto, ProductoColor, ProductoTalla
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.p08_punto_venta_pos.pos.models import Devolucion, DevolucionDetalle

def reset_database(db):
    print("Limpiando datos y tablas para siembra limpia...")
    for model in [
        DevolucionDetalle, Devolucion, OrdenDetalle, OrdenVenta,
        KardexMovimiento, Inventario, ProductoColor, ProductoTalla, Producto,
        Marca, Categoria, Temporada, Proveedor, TokenRecuperacion,
        BitacoraAcceso, Usuario, Sucursal, Ciudad
    ]:
        try:
            db.query(model).delete()
        except Exception:
            db.rollback()
    db.commit()
    print("Tablas limpiadas exitosamente.")

def seed_database(force_reset: bool = False):
    print("Iniciando creación de tablas y siembra de datos semilla...")
    # Autocorrección y migración preventiva si la tabla ya existía sin la columna precio
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);"))
            conn.commit()
    except Exception:
        pass

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Si se solicita reset o se pasa el argumento --reset
        if force_reset or "--reset" in sys.argv or "-r" in sys.argv:
            reset_database(db)
        elif db.query(Usuario).first():
            print("La base de datos ya contiene datos. Usa '--reset' si deseas forzar la siembra limpia.")
            return

        # 1. Ciudades
        print("Insertando Ciudades de Bolivia...")
        c_scz = Ciudad(nombre_ciudad="Santa Cruz de la Sierra", departamento="Santa Cruz")
        c_lpz = Ciudad(nombre_ciudad="La Paz", departamento="La Paz")
        c_cba = Ciudad(nombre_ciudad="Cochabamba", departamento="Cochabamba")
        db.add_all([c_scz, c_lpz, c_cba])
        db.flush()

        # 2. Sucursales
        print("Insertando Sucursales físicas con coordenadas GPS...")
        s_equi = Sucursal(
            id_ciudad=c_scz.id_ciudad,
            nombre_sucursal="Sucursal Equipetrol",
            direccion="Av. San Martín #450, entre 3er y 4to anillo",
            latitud=Decimal("-17.76823000"),
            longitud=Decimal("-63.18342000"),
            telefono="3-3445566",
            capacidad_probadores=6,
            horario_apertura="09:00",
            horario_cierre="21:00",
            estado="OPERATIVA"
        )
        s_cent = Sucursal(
            id_ciudad=c_scz.id_ciudad,
            nombre_sucursal="Sucursal Centro",
            direccion="Calle 21 de Mayo esq. Ayacucho",
            latitud=Decimal("-17.78312000"),
            longitud=Decimal("-63.18210000"),
            telefono="3-3332211",
            capacidad_probadores=4,
            horario_apertura="09:00",
            horario_cierre="20:00",
            estado="OPERATIVA"
        )
        s_cala = Sucursal(
            id_ciudad=c_lpz.id_ciudad,
            nombre_sucursal="Sucursal Calacoto",
            direccion="Av. Ballivián #1200, Calle 18",
            latitud=Decimal("-16.53982000"),
            longitud=Decimal("-68.08921000"),
            telefono="2-2778899",
            capacidad_probadores=5,
            horario_apertura="09:30",
            horario_cierre="21:00",
            estado="OPERATIVA"
        )
        s_prad = Sucursal(
            id_ciudad=c_cba.id_ciudad,
            nombre_sucursal="Sucursal El Prado",
            direccion="Av. Ballivián #600, El Prado",
            latitud=Decimal("-17.38921000"),
            longitud=Decimal("-66.15672000"),
            telefono="4-4223344",
            capacidad_probadores=4,
            horario_apertura="09:00",
            horario_cierre="20:30",
            estado="OPERATIVA"
        )
        db.add_all([s_equi, s_cent, s_cala, s_prad])
        db.flush()

        # 3. Usuarios del Sistema (Contraseña compartida: 'Admin123*' cifrada con Bcrypt)
        print("Insertando Usuarios con roles RBAC (Alberto Delgado, Andy Mujica, etc.)...")
        pw_hash = get_password_hash("Admin123*")

        u_alberto = Usuario(
            email="alberto.delgado@store.bo",
            password_hash=pw_hash,
            nombres="Alberto",
            apellidos="Delgado",
            rol="ADMINISTRADOR",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        u_andy = Usuario(
            email="andy.mujica@store.bo",
            password_hash=pw_hash,
            nombres="Andy",
            apellidos="Mujica",
            rol="ADMINISTRADOR",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        u_carlos = Usuario(
            id_sucursal=s_equi.id_sucursal,
            email="carlos.morales@store.bo",
            password_hash=pw_hash,
            nombres="Carlos",
            apellidos="Morales",
            rol="ENCARGADO_SUCURSAL",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        u_javier = Usuario(
            id_sucursal=s_equi.id_sucursal,
            email="javier.roca@store.bo",
            password_hash=pw_hash,
            nombres="Javier",
            apellidos="Roca",
            rol="CAJERO",
            estado_cuenta="BLOQUEADO_POR_INTENTOS",
            intentos_fallidos=5,
            bloqueado_hasta=utc_now() + timedelta(minutes=30)
        )
        u_mateo = Usuario(
            email="mateo.logistica@store.bo",
            password_hash=pw_hash,
            nombres="Mateo",
            apellidos="Suarez",
            rol="LOGISTICA",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        u_rodrigo = Usuario(
            email="rodrigo.cliente@gmail.com",
            password_hash=pw_hash,
            nombres="Rodrigo",
            apellidos="Paz",
            rol="CLIENTE",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        db.add_all([u_alberto, u_andy, u_carlos, u_javier, u_mateo, u_rodrigo])
        db.flush()

        # Semilla OTP para Rodrigo
        otp_hash = get_password_hash("482915")
        token_otp = TokenRecuperacion(
            id_usuario=u_rodrigo.id_usuario,
            codigo_otp_hash=otp_hash,
            expiracion=utc_now() + timedelta(minutes=15),
            utilizado=False,
            intentos_verificacion=0
        )
        db.add(token_otp)

        # 4. Proveedores Textiles
        print("Insertando Proveedores Textiles con NIT...")
        p_andina = Proveedor(
            nit_identificacion="1028392019",
            razon_social="Confecciones Andina SA",
            contacto_nombre="Juan Paredes",
            telefono="+591 70012345",
            email="ventas@andina.com.bo",
            terminos_pago="CREDITO_30_DIAS",
            estado="ACTIVO"
        )
        p_hilasur = Proveedor(
            nit_identificacion="9038472011",
            razon_social="Hilanderías del Sur SRL",
            contacto_nombre="Marcos Vaca",
            telefono="+591 71098765",
            email="contacto@hilasur.bo",
            terminos_pago="CONTADO",
            estado="ACTIVO"
        )
        p_italiana = Proveedor(
            nit_identificacion="3829104018",
            razon_social="Importadora Textil Italiana",
            contacto_nombre="Gianluca Rossi",
            telefono="+591 72055443",
            email="grossi@textilitaliana.com",
            terminos_pago="CREDITO_60_DIAS",
            estado="ACTIVO"
        )
        db.add_all([p_andina, p_hilasur, p_italiana])
        db.flush()

        # 5. Temporadas Comerciales
        print("Insertando Temporadas y Colecciones...")
        t_ss26 = Temporada(
            codigo_campana="SS-2026",
            nombre_temporada="Primavera - Verano 2026",
            fecha_inicio=date(2026, 8, 1),
            fecha_fin=date(2027, 1, 31),
            descuento_liquidacion=Decimal("0.00"),
            estado="VIGENTE"
        )
        t_fw26 = Temporada(
            codigo_campana="FW-2026",
            nombre_temporada="Otoño - Invierno 2026",
            fecha_inicio=date(2026, 2, 1),
            fecha_fin=date(2026, 7, 31),
            descuento_liquidacion=Decimal("25.00"),
            estado="LIQUIDACION"
        )
        db.add_all([t_ss26, t_fw26])
        db.flush()

        # 6. Categorías y Marcas
        print("Insertando Categorías y Marcas...")
        cat_camisas = Categoria(nombre_categoria="Camisas Formales", descripcion="Camisas ejecutivas y de vestir en algodón peinado y lino")
        cat_pantalones = Categoria(nombre_categoria="Pantalones Casuales", descripcion="Pantalones estilo chino, gabardina y corte clásico")
        cat_trajes = Categoria(nombre_categoria="Trajes y Blazers", descripcion="Sacos, chaquetas y trajes de dos piezas en lana fría")
        cat_calzado = Categoria(nombre_categoria="Calzado Ejecutivo", descripcion="Zapatos Oxford, Derby y mocasines de cuero legítimo")
        db.add_all([cat_camisas, cat_pantalones, cat_trajes, cat_calzado])

        m_oxford = Marca(nombre_marca="Oxford Heritage")
        m_urban = Marca(nombre_marca="Urban Tailor")
        m_sartorial = Marca(nombre_marca="Sartorial Milano")
        m_bocaccio = Marca(nombre_marca="Bocaccio Leather")
        db.add_all([m_oxford, m_urban, m_sartorial, m_bocaccio])
        db.flush()

        # 7. Productos
        print("Insertando Productos de Moda Masculina...")
        prod_camisa = Producto(
            id_categoria=cat_camisas.id_categoria,
            id_marca=m_oxford.id_marca,
            id_temporada=t_ss26.id_temporada,
            id_proveedor=p_andina.id_proveedor,
            codigo_sku_base="SHIRT-SLIM-001",
            nombre="Camisa Oxford Slim Fit",
            descripcion="Camisa de corte entallado en 100% algodón egipcio, cuello italiano y botones nacarados",
            precio_base=Decimal("280.00"),
            imagen_principal="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/shirt_oxford_slim.glb",
            estado="PUBLICADO"
        )
        prod_pant = Producto(
            id_categoria=cat_pantalones.id_categoria,
            id_marca=m_urban.id_marca,
            id_temporada=t_ss26.id_temporada,
            id_proveedor=p_hilasur.id_proveedor,
            codigo_sku_base="PANT-CHINO-002",
            nombre="Pantalón Chino Gabardina",
            descripcion="Pantalón casual de gabardina elastizada con bolsillos traseros tipo ojal y pretina reforzada",
            precio_base=Decimal("320.00"),
            imagen_principal="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/pant_chino_gab.glb",
            estado="PUBLICADO"
        )
        prod_blazer = Producto(
            id_categoria=cat_trajes.id_categoria,
            id_marca=m_sartorial.id_marca,
            id_temporada=t_fw26.id_temporada,
            id_proveedor=p_italiana.id_proveedor,
            codigo_sku_base="BLAZ-LINO-003",
            nombre="Blazer de Lino Casual",
            descripcion="Chaqueta ligera desestructurada de lino italiano ideal para eventos formales y cócteles",
            precio_base=Decimal("650.00"),
            imagen_principal="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/blazer_lino_casual.glb",
            estado="PUBLICADO"
        )
        prod_zapato = Producto(
            id_categoria=cat_calzado.id_categoria,
            id_marca=m_bocaccio.id_marca,
            id_temporada=t_fw26.id_temporada,
            id_proveedor=p_italiana.id_proveedor,
            codigo_sku_base="SHOE-OXFD-004",
            nombre="Zapato Oxford Cap-Toe Cuero Genuino",
            descripcion="Calzado formal artesanal en cuero vacuno plena flor con suela de cuero cosida Goodyear Welted",
            precio_base=Decimal("540.00"),
            imagen_principal="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/oxford_shoes.glb",
            estado="PUBLICADO"
        )
        prod_traje = Producto(
            id_categoria=cat_trajes.id_categoria,
            id_marca=m_sartorial.id_marca,
            id_temporada=t_ss26.id_temporada,
            id_proveedor=p_andina.id_proveedor,
            codigo_sku_base="SUIT-SLIM-005",
            nombre="Traje Ejecutivo Slim Fit 2 Piezas",
            descripcion="Conjunto formal de saco y pantalón entallado en lana fría super 120s para ocasiones de gala y corporativas",
            precio_base=Decimal("980.00"),
            imagen_principal="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/suit_executive.glb",
            estado="PUBLICADO"
        )
        prod_mocasines = Producto(
            id_categoria=cat_calzado.id_categoria,
            id_marca=m_bocaccio.id_marca,
            id_temporada=t_ss26.id_temporada,
            id_proveedor=p_hilasur.id_proveedor,
            codigo_sku_base="MOCA-LOAF-006",
            nombre="Mocasín Náutico Confort de Cuero",
            descripcion="Mocasín sin cordones de cuero gamuzado ultra flexible con plantilla ortopédica acolchada",
            precio_base=Decimal("460.00"),
            imagen_principal="https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/mocasines.glb",
            estado="PUBLICADO"
        )
        prod_camisa_lino = Producto(
            id_categoria=cat_camisas.id_categoria,
            id_marca=m_oxford.id_marca,
            id_temporada=t_ss26.id_temporada,
            id_proveedor=p_andina.id_proveedor,
            codigo_sku_base="SHIRT-LINO-007",
            nombre="Camisa de Lino Cuello Mao Italiana",
            descripcion="Camisa veraniega fresca en 100% lino natural lavado con cuello oriental y botones madera",
            precio_base=Decimal("310.00"),
            imagen_principal="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
            modelo_3d_glb="https://assets.fashionstore.bo/models/shirt_lino_mao.glb",
            estado="PUBLICADO"
        )
        db.add_all([prod_camisa, prod_pant, prod_blazer, prod_zapato, prod_traje, prod_mocasines, prod_camisa_lino])
        db.flush()

        # 8. Colores HEX Multivaluados
        print("Insertando Colores normalizados con código HEX...")
        colores_data = [
            (prod_camisa.id_producto, "Azul Marino", "#000080"),
            (prod_camisa.id_producto, "Blanco Óptico", "#FFFFFF"),
            (prod_camisa.id_producto, "Celeste Cielo", "#87CEEB"),
            (prod_pant.id_producto, "Beige Arena", "#F5F5DC"),
            (prod_pant.id_producto, "Azul Noche", "#191970"),
            (prod_pant.id_producto, "Verde Oliva", "#556B2F"),
            (prod_blazer.id_producto, "Azul Cobalto", "#0047AB"),
            (prod_blazer.id_producto, "Gris Plomo", "#708090"),
            (prod_zapato.id_producto, "Negro Clásico", "#1A1A1A"),
            (prod_zapato.id_producto, "Marrón Suizo", "#5C4033"),
            (prod_zapato.id_producto, "Cognac", "#9E4714"),
            (prod_traje.id_producto, "Azul Noche", "#191970"),
            (prod_traje.id_producto, "Gris Marengo", "#4A4E69"),
            (prod_mocasines.id_producto, "Azul Marino", "#000080"),
            (prod_mocasines.id_producto, "Tabaco", "#6F4E37"),
            (prod_camisa_lino.id_producto, "Blanco Puro", "#FFFFFF"),
            (prod_camisa_lino.id_producto, "Verde Salvia", "#8A9A5B"),
            (prod_camisa_lino.id_producto, "Celeste Pastel", "#B0E0E6")
        ]
        for p_id, col_nom, hex_code in colores_data:
            db.add(ProductoColor(id_producto=p_id, color_nombre=col_nom, codigo_hex=hex_code))

        # 9. Tallas Normalizadas
        print("Insertando Tallas normalizadas...")
        tallas_data = [
            (prod_camisa.id_producto, ["S", "M", "L", "XL"]),
            (prod_pant.id_producto, ["30", "32", "34", "36"]),
            (prod_blazer.id_producto, ["38", "40", "42"]),
            (prod_zapato.id_producto, ["39", "40", "41", "42"]),
            (prod_traje.id_producto, ["38", "40", "42", "44"]),
            (prod_mocasines.id_producto, ["39", "40", "41", "42"]),
            (prod_camisa_lino.id_producto, ["S", "M", "L", "XL"])
        ]
        for p_id, tallas_list in tallas_data:
            for t in tallas_list:
                db.add(ProductoTalla(id_producto=p_id, talla=t))

        db.flush()

        # 10. Inventario Multi-Sucursal y Kardex con Costo Promedio Ponderado (CPP)
        print("Insertando Inventario con recálculo de Costo Promedio Ponderado (CPP)...")
        # Ejemplo demostrativo formal:
        # Camisa Oxford Slim Fit (Talla M, Azul Marino) en Sucursal Equipetrol:
        # Lote 1: 15 unidades a 90 Bs = 1350 Bs
        # Lote 2: 20 unidades a 120 Bs = 2400 Bs
        # Total: 35 unidades | Costo: 3750 Bs | CPP = 3750 / 35 = 107.14 Bs | Último Costo = 120.00 Bs
        inv1 = Inventario(
            id_sucursal=s_equi.id_sucursal,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            stock_fisico=35,
            stock_reservado=5,
            stock_disponible=30,
            stock_minimo=10,
            ultimo_costo_compra=Decimal("120.00"),
            costo_promedio_ponderado=Decimal("107.14")
        )
        inv2 = Inventario(
            id_sucursal=s_equi.id_sucursal,
            id_producto=prod_camisa.id_producto,
            talla="L",
            color="Blanco Óptico",
            stock_fisico=25,
            stock_reservado=0,
            stock_disponible=25,
            stock_minimo=5,
            ultimo_costo_compra=Decimal("110.00"),
            costo_promedio_ponderado=Decimal("110.00")
        )
        inv3 = Inventario(
            id_sucursal=s_equi.id_sucursal,
            id_producto=prod_pant.id_producto,
            talla="32",
            color="Beige Arena",
            stock_fisico=20,
            stock_reservado=2,
            stock_disponible=18,
            stock_minimo=5,
            ultimo_costo_compra=Decimal("140.00"),
            costo_promedio_ponderado=Decimal("135.00")
        )
        inv4 = Inventario(
            id_sucursal=s_cala.id_sucursal,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            stock_fisico=15,
            stock_reservado=0,
            stock_disponible=15,
            stock_minimo=5,
            ultimo_costo_compra=Decimal("115.00"),
            costo_promedio_ponderado=Decimal("115.00")
        )
        inv5 = Inventario(
            id_sucursal=s_prad.id_sucursal,
            id_producto=prod_blazer.id_producto,
            talla="40",
            color="Gris Plomo",
            stock_fisico=8,
            stock_reservado=1,
            stock_disponible=7,
            stock_minimo=2,
            ultimo_costo_compra=Decimal("320.00"),
            costo_promedio_ponderado=Decimal("310.00")
        )
        db.add_all([inv1, inv2, inv3, inv4, inv5])
        db.flush()

        # Generar inventario omnicanal para todas las combinaciones de producto/talla/color en todas las sucursales
        print("Poblando stock completo multi-sucursal para todas las tallas y colores...")
        combinaciones_existentes = {
            (inv1.id_sucursal, inv1.id_producto, inv1.talla, inv1.color),
            (inv2.id_sucursal, inv2.id_producto, inv2.talla, inv2.color),
            (inv3.id_sucursal, inv3.id_producto, inv3.talla, inv3.color),
            (inv4.id_sucursal, inv4.id_producto, inv4.talla, inv4.color),
            (inv5.id_sucursal, inv5.id_producto, inv5.talla, inv5.color),
        }
        
        sucursales_todas = [s_equi, s_cent, s_cala, s_prad]
        prods_info = [
            (prod_camisa, ["S", "M", "L", "XL"], ["Azul Marino", "Blanco Óptico", "Celeste Cielo"], Decimal("110.00")),
            (prod_pant, ["30", "32", "34", "36"], ["Beige Arena", "Azul Noche", "Verde Oliva"], Decimal("130.00")),
            (prod_blazer, ["38", "40", "42"], ["Azul Cobalto", "Gris Plomo"], Decimal("280.00")),
            (prod_zapato, ["39", "40", "41", "42"], ["Negro Clásico", "Marrón Suizo", "Cognac"], Decimal("250.00")),
            (prod_traje, ["38", "40", "42", "44"], ["Azul Noche", "Gris Marengo"], Decimal("420.00")),
            (prod_mocasines, ["39", "40", "41", "42"], ["Azul Marino", "Tabaco"], Decimal("210.00")),
            (prod_camisa_lino, ["S", "M", "L", "XL"], ["Blanco Puro", "Verde Salvia", "Celeste Pastel"], Decimal("125.00"))
        ]

        def calcular_costo_talla(costo_base: Decimal, talla: str) -> Decimal:
            factores = {
                "S": Decimal("0.90"), "M": Decimal("1.00"), "L": Decimal("1.10"), "XL": Decimal("1.20"), "XXL": Decimal("1.30"),
                "30": Decimal("0.92"), "32": Decimal("1.00"), "34": Decimal("1.08"), "36": Decimal("1.18"),
                "38": Decimal("0.92"), "40": Decimal("1.00"), "42": Decimal("1.08"), "44": Decimal("1.18"),
                "39": Decimal("0.94"), "41": Decimal("1.06")
            }
            factor = factores.get(talla.upper(), Decimal("1.00"))
            return (costo_base * factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        nuevos_invs = []
        for suc in sucursales_todas:
            for p, tallas_l, cols_l, costo in prods_info:
                for t in tallas_l:
                    costo_talla = calcular_costo_talla(costo, t)
                    for c in cols_l:
                        key = (suc.id_sucursal, p.id_producto, t, c)
                        if key not in combinaciones_existentes:
                            inv_item = Inventario(
                                id_sucursal=suc.id_sucursal,
                                id_producto=p.id_producto,
                                talla=t,
                                color=c,
                                stock_fisico=20,
                                stock_reservado=0,
                                stock_disponible=20,
                                stock_minimo=5,
                                ultimo_costo_compra=costo_talla,
                                costo_promedio_ponderado=costo_talla
                            )
                            nuevos_invs.append(inv_item)
                            combinaciones_existentes.add(key)
        
        if nuevos_invs:
            db.add_all(nuevos_invs)
            db.flush()

        # Asientos de Kardex inmutable
        k1 = KardexMovimiento(
            id_inventario=inv1.id_inventario,
            tipo_movimiento="ENTRADA_COMPRA",
            cantidad=15,
            costo_unitario_movimiento=Decimal("90.00"),
            saldo_cantidad_resultante=15,
            saldo_cpp_resultante=Decimal("90.00"),
            referencia_documento="Ingreso Lote Inicial Fac-101"
        )
        k2 = KardexMovimiento(
            id_inventario=inv1.id_inventario,
            tipo_movimiento="ENTRADA_COMPRA",
            cantidad=20,
            costo_unitario_movimiento=Decimal("120.00"),
            saldo_cantidad_resultante=35,
            saldo_cpp_resultante=Decimal("107.14"),
            referencia_documento="Ingreso Segundo Lote Fac-205 - Recálculo CPP"
        )
        db.add_all([k1, k2])
        
        # Asientos iniciales de recepción de lote para todas las demás variantes
        k_otros = []
        for inv_i in nuevos_invs:
            k_otros.append(
                KardexMovimiento(
                    id_inventario=inv_i.id_inventario,
                    tipo_movimiento="ENTRADA_COMPRA",
                    cantidad=inv_i.stock_fisico,
                    costo_unitario_movimiento=inv_i.costo_promedio_ponderado,
                    saldo_cantidad_resultante=inv_i.stock_fisico,
                    saldo_cpp_resultante=inv_i.costo_promedio_ponderado,
                    referencia_documento=f"Ingreso Lote Inicial Fac-10{inv_i.id_inventario % 90 + 10} - Proveedor Oficial"
                )
            )
        if k_otros:
            db.add_all(k_otros)
        db.flush()

        # 11. Orden de Venta POS de Prueba para CU25 (Devolución dentro del plazo de 14 días)
        fecha_hace_5_dias = utc_now() - timedelta(days=5)
        orden_pos_demo = OrdenVenta(
            id_usuario=u_javier.id_usuario,
            id_sucursal=s_equi.id_sucursal,
            numero_factura="POS-2026-0042",
            canal_venta="POS",
            modalidad_entrega="COMPRA_FISICA",
            nit_factura="4912044019",
            razon_social_factura="Carlos Mendoza",
            subtotal=Decimal("180.00"),
            costo_envio=Decimal("0.00"),
            total=Decimal("180.00"),
            estado_pago="PAGADO",
            estado_logistica="ENTREGADA",
            creado_en=fecha_hace_5_dias
        )
        db.add(orden_pos_demo)
        db.flush()

        det_demo = OrdenDetalle(
            id_orden=orden_pos_demo.id_orden,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            cantidad=1,
            precio_unitario=Decimal("180.00"),
            subtotal=Decimal("180.00")
        )
        db.add(det_demo)

        # Asiento Kardex por la venta demo
        k_salida_demo = KardexMovimiento(
            id_inventario=inv1.id_inventario,
            tipo_movimiento="SALIDA_VENTA",
            cantidad=1,
            costo_unitario_movimiento=Decimal("107.14"),
            saldo_cantidad_resultante=inv1.stock_fisico,
            saldo_cpp_resultante=Decimal("107.14"),
            referencia_documento=f"Factura Mostrador {orden_pos_demo.numero_factura}",
            fecha_hora=fecha_hace_5_dias
        )
        db.add(k_salida_demo)


        db.commit()
        print("¡Siembra de datos semilla completada con éxito!")

    except Exception as e:
        db.rollback()
        print(f"Error al sembrar datos: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
