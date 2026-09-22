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

import json
from sqlalchemy import text
from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.modules.p02_estructura_operativa.sucursales.models import Ciudad, Sucursal
from app.modules.p01_seguridad_acceso.auth.models import Usuario, TokenRecuperacion, BitacoraAcceso
from app.modules.p04_aprovisionamiento_proveedores.proveedores.models import Proveedor
from app.modules.p03_catalogo_estilismo_ia.temporadas.models import Temporada
from app.modules.p03_catalogo_estilismo_ia.productos.models import Categoria, Marca, Producto, ProductoColor, ProductoTalla
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p06_reservas_presenciales.reservas.models import Reserva, ReservaDetalle
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta, OrdenDetalle
from app.modules.p07_venta_digital_fidelizacion.gamificacion.models import GamificacionPerfil, RecompensaCatalogo, CuponFidelizacion
from app.modules.p08_punto_venta_pos.pos.models import Devolucion, DevolucionDetalle
from app.modules.p09_procesamiento_pagos.pagos.models import MetodoPagoConfig

def reset_database(db):
    print("Limpiando datos y tablas para siembra limpia...")
    for model in [
        DevolucionDetalle, Devolucion, CuponFidelizacion, RecompensaCatalogo,
        GamificacionPerfil, ReservaDetalle, Reserva, MetodoPagoConfig,
        OrdenDetalle, OrdenVenta, KardexMovimiento, Inventario,
        ProductoColor, ProductoTalla, Producto, Marca, Categoria,
        Temporada, Proveedor, TokenRecuperacion, BitacoraAcceso,
        Usuario, Sucursal, Ciudad
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

    # 0. Comprobar si existe el volcado SQL oficial y estamos usando SQLite (Restauración Instantánea Idéntica)
    sql_dump_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "fashionstore_seed.sql"))
    is_sqlite = "sqlite" in str(engine.url)

    db_check = SessionLocal()
    has_data = False
    try:
        has_data = db_check.query(Usuario).first() is not None
    except Exception:
        has_data = False
    finally:
        db_check.close()

    is_requested_reset = force_reset or "--reset" in sys.argv or "-r" in sys.argv

    if (is_requested_reset or not has_data) and os.path.exists(sql_dump_path) and is_sqlite:
        try:
            print(f" [SEED] Restaurando base de datos oficial completa desde {sql_dump_path}...")
            raw_conn = engine.raw_connection()
            driver_conn = raw_conn.driver_connection
            with open(sql_dump_path, "r", encoding="utf-8") as f:
                driver_conn.executescript(f.read())
            raw_conn.commit()
            raw_conn.close()
            print(" [SEED] ¡Base de datos oficial (28 tablas, 25 CU) restaurada con éxito desde volcado oficial!")
            return
        except Exception as e_sql:
            print(f" [SEED] Advertencia al restaurar volcado SQL ({e_sql}). Continuando con siembra procedural...")

    db = SessionLocal()

    try:
        # Si se solicita reset o se pasa el argumento --reset
        if is_requested_reset:
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

        # 9. Tallas Normalizadas con Precios por Talla (CU06 / CU10 / CU20)
        print("Insertando Tallas normalizadas con precios individuales...")
        tallas_data = [
            # Camisa Oxford Slim Fit (Base 280.00)
            (prod_camisa.id_producto, "S", Decimal("266.00")),
            (prod_camisa.id_producto, "M", Decimal("280.00")),
            (prod_camisa.id_producto, "L", Decimal("294.00")),
            (prod_camisa.id_producto, "XL", Decimal("308.00")),
            # Pantalón Chino Gabardina (Base 320.00)
            (prod_pant.id_producto, "30", Decimal("304.00")),
            (prod_pant.id_producto, "32", Decimal("320.00")),
            (prod_pant.id_producto, "34", Decimal("336.00")),
            (prod_pant.id_producto, "36", Decimal("352.00")),
            # Blazer de Lino Casual (Base 650.00)
            (prod_blazer.id_producto, "38", Decimal("617.50")),
            (prod_blazer.id_producto, "40", Decimal("650.00")),
            (prod_blazer.id_producto, "42", Decimal("682.50")),
            # Zapato Oxford Cap-Toe Cuero (Base 540.00)
            (prod_zapato.id_producto, "39", Decimal("513.00")),
            (prod_zapato.id_producto, "40", Decimal("540.00")),
            (prod_zapato.id_producto, "41", Decimal("567.00")),
            (prod_zapato.id_producto, "42", Decimal("567.00")),
            # Traje Ejecutivo Slim Fit 2 Piezas (Base 980.00)
            (prod_traje.id_producto, "38", Decimal("931.00")),
            (prod_traje.id_producto, "40", Decimal("980.00")),
            (prod_traje.id_producto, "42", Decimal("1029.00")),
            (prod_traje.id_producto, "44", Decimal("1078.00")),
            # Mocasín Náutico Confort (Base 460.00)
            (prod_mocasines.id_producto, "39", Decimal("437.00")),
            (prod_mocasines.id_producto, "40", Decimal("460.00")),
            (prod_mocasines.id_producto, "41", Decimal("483.00")),
            (prod_mocasines.id_producto, "42", Decimal("483.00")),
            # Camisa de Lino Cuello Mao Italiana (Base 310.00)
            (prod_camisa_lino.id_producto, "S", Decimal("294.50")),
            (prod_camisa_lino.id_producto, "M", Decimal("310.00")),
            (prod_camisa_lino.id_producto, "L", Decimal("325.50")),
            (prod_camisa_lino.id_producto, "XL", Decimal("341.00")),
        ]
        for p_id, t, p_val in tallas_data:
            db.add(ProductoTalla(id_producto=p_id, talla=t, precio=p_val))

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
        db.flush()

        # 12. Métodos de Pago Omnicanal (CU16 / CU17)
        print("Insertando Métodos de Pago Omnicanal...")
        m_efectivo = MetodoPagoConfig(
            codigo="EFECTIVO",
            nombre="Efectivo en Caja Mostrador",
            tipo="FISICO",
            descripcion="Cobro presencial en billetes y monedas con cálculo automático de vuelto en sucursales.",
            icono="fa-money-bill-wave",
            activo=True,
            requiere_credenciales=False,
            credenciales_json="{}"
        )
        m_pos = MetodoPagoConfig(
            codigo="TARJETA_POS",
            nombre="Terminal POS / Tarjeta Física",
            tipo="FISICO",
            descripcion="Cobro presencial con tarjetas Visa/Mastercard mediante datafast / terminal PinPad inalámbrico.",
            icono="fa-credit-card",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "terminal_id": "POS-DATAFAST-001",
                "banco_adquirente": "Banco Mercantil Santa Cruz"
            })
        )
        m_stripe = MetodoPagoConfig(
            codigo="STRIPE",
            nombre="Pasarela Digital Stripe (Online)",
            tipo="DIGITAL",
            descripcion="Cobro internacional en línea con tarjetas de crédito/débito, 3D Secure y tokenización PCI-DSS.",
            icono="fa-stripe",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
                "secret_key": settings.STRIPE_SECRET_KEY,
                "webhook_secret": settings.STRIPE_WEBHOOK_SECRET
            })
        )
        m_qr = MetodoPagoConfig(
            codigo="QR_BCB",
            nombre="Código QR Simple BCB Interoperable",
            tipo="OMNICANAL",
            descripcion="Cobros instantáneos mediante códigos QR bajo el estándar interoperable del Banco Central de Bolivia.",
            icono="fa-qrcode",
            activo=True,
            requiere_credenciales=True,
            credenciales_json=json.dumps({
                "banco_origen": "Banco Central de Bolivia",
                "cuenta_recaudacion": "1000004928190",
                "comercio_id": "FASHIONSTORE-BO"
            })
        )
        db.add_all([m_efectivo, m_pos, m_stripe, m_qr])
        db.flush()

        # 13. Gamificación y Fidelización (CU21)
        print("Insertando Catálogo de Recompensas y Perfil VIP de Fidelización...")
        recompensas = [
            RecompensaCatalogo(
                codigo="ENVIO_FREE",
                titulo="Cupón Envío Gratis a Domicilio",
                descripcion="Cubre el costo de entrega express en Santa Cruz, La Paz y Cochabamba.",
                costo_puntos=150,
                descuento_monto=Decimal("25.00"),
                categoria="DELIVERY",
                icono="local_shipping",
                activo=True
            ),
            RecompensaCatalogo(
                codigo="CUPON_25BS",
                titulo="Bono Descuento Bs. 25 en Catálogo",
                descripcion="Válido para compras mayores a Bs. 150 en toda la colección.",
                costo_puntos=200,
                descuento_monto=Decimal("25.00"),
                categoria="CUPON",
                icono="confirmation_number",
                activo=True
            ),
            RecompensaCatalogo(
                codigo="DESC_50BS",
                titulo="Vale de Compra Bs. 50 Colección 2026",
                descripcion="Aplicable en prendas seleccionadas de las temporadas SS y FW.",
                costo_puntos=300,
                descuento_monto=Decimal("50.00"),
                categoria="CUPON",
                icono="stars",
                activo=True
            ),
            RecompensaCatalogo(
                codigo="ACCESO_VIP_SHOWROOM",
                titulo="Pase Exclusivo Lanzamiento Gala",
                descripcion="Acceso prioritario a desfiles de temporada y preventa privada.",
                costo_puntos=500,
                descuento_monto=Decimal("0.00"),
                categoria="EXPERIENCIA",
                icono="workspace_premium",
                activo=True
            ),
            RecompensaCatalogo(
                codigo="DESCUENTO_100BS",
                titulo="Vale Élite Bs. 100 en Trajes Ejecutivos",
                descripcion="Exclusivo para blazers y trajes completos de alta sastrería.",
                costo_puntos=600,
                descuento_monto=Decimal("100.00"),
                categoria="CUPON",
                icono="military_tech",
                activo=True
            )
        ]
        db.add_all(recompensas)
        db.flush()

        perfil_rodrigo = GamificacionPerfil(
            id_usuario=u_rodrigo.id_usuario,
            tenant_id="fashionstore_scz",
            puntos_actuales=2970,
            puntos_historicos=6620,
            nivel="DIAMANTE",
            insignias_json=json.dumps([
                "vestidor_3d", "cliente_distinguido", "explorador_voz",
                "coleccionista_elite", "reserva_boutique", "primer_pedido"
            ]),
            beneficios_canjeados_json=json.dumps([
                {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-C92D9C", "costo": 150, "descuento_monto": 25.0},
                {"codigo_recompensa": "CUPON_25BS", "cupon": "FS-CUPON_25BS-420119", "costo": 200, "descuento_monto": 25.0},
                {"codigo_recompensa": "DESC_50BS", "cupon": "FS-DESC_50BS-7806B4", "costo": 300, "descuento_monto": 50.0}
            ])
        )
        db.add(perfil_rodrigo)
        db.flush()

        cupon1 = CuponFidelizacion(
            id_usuario=u_rodrigo.id_usuario,
            codigo_cupon="FS-ENVIO_FREE-C92D9C",
            monto_descuento=Decimal("25.00"),
            tipo_beneficio="ENVIO_GRATIS",
            utilizado=False,
            fecha_emision=utc_now() - timedelta(days=2),
            fecha_expiracion=utc_now() + timedelta(days=28)
        )
        cupon2 = CuponFidelizacion(
            id_usuario=u_rodrigo.id_usuario,
            codigo_cupon="FS-ENVIO_FREE-61EC39",
            monto_descuento=Decimal("25.00"),
            tipo_beneficio="ENVIO_GRATIS",
            utilizado=False,
            fecha_emision=utc_now() - timedelta(days=2),
            fecha_expiracion=utc_now() + timedelta(days=28)
        )
        cupon3 = CuponFidelizacion(
            id_usuario=u_rodrigo.id_usuario,
            codigo_cupon="FS-DESC_50BS-7806B4",
            monto_descuento=Decimal("50.00"),
            tipo_beneficio="DESCUENTO_MONTO",
            utilizado=False,
            fecha_emision=utc_now() - timedelta(days=1),
            fecha_expiracion=utc_now() + timedelta(days=29)
        )
        db.add_all([cupon1, cupon2, cupon3])
        db.flush()

        # 14. Reservas de Probador Inteligente (CU11 / CU12 / CU13)
        print("Insertando Reservas de Probador con Códigos QR...")
        res1 = Reserva(
            id_usuario=u_rodrigo.id_usuario,
            id_sucursal=s_equi.id_sucursal,
            codigo_qr="data:image/png;base64,RES-2026-EQUI-101",
            qr_texto="RES-2026-EQUI-101",
            fecha_visita=utc_now() + timedelta(days=1, hours=2),
            estado="CONFIRMADA"
        )
        db.add(res1)
        db.flush()
        db.add(ReservaDetalle(
            id_reserva=res1.id_reserva,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            cantidad=1
        ))

        res2 = Reserva(
            id_usuario=u_rodrigo.id_usuario,
            id_sucursal=s_equi.id_sucursal,
            codigo_qr="data:image/png;base64,RES-2026-EQUI-201",
            qr_texto="RES-2026-EQUI-201",
            fecha_visita=utc_now() - timedelta(days=1),
            estado="ATENDIDA"
        )
        db.add(res2)
        db.flush()
        db.add(ReservaDetalle(
            id_reserva=res2.id_reserva,
            id_producto=prod_pant.id_producto,
            talla="32",
            color="Beige Arena",
            cantidad=1
        ))
        db.flush()

        # 15. Órdenes Digitales y Tracking Delivery (CU14 / CU18)
        print("Insertando Órdenes Digitales con Tracking...")
        orden_web1 = OrdenVenta(
            id_usuario=u_rodrigo.id_usuario,
            id_sucursal=s_equi.id_sucursal,
            numero_factura="FAC-2026-0081",
            canal_venta="WEB",
            modalidad_entrega="DELIVERY",
            nit_factura="1028394015",
            razon_social_factura="Rodrigo Paz",
            subtotal=Decimal("280.00"),
            costo_envio=Decimal("20.00"),
            total=Decimal("300.00"),
            estado_pago="PAGADO",
            estado_logistica="EN_CAMINO",
            creado_en=utc_now() - timedelta(hours=3)
        )
        db.add(orden_web1)
        db.flush()
        db.add(OrdenDetalle(
            id_orden=orden_web1.id_orden,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            cantidad=1,
            precio_unitario=Decimal("280.00"),
            subtotal=Decimal("280.00")
        ))

        orden_web2 = OrdenVenta(
            id_usuario=u_rodrigo.id_usuario,
            id_sucursal=s_equi.id_sucursal,
            numero_factura="FAC-2026-0095",
            canal_venta="APP",
            modalidad_entrega="DELIVERY",
            nit_factura="1028394015",
            razon_social_factura="Rodrigo Paz",
            subtotal=Decimal("980.00"),
            costo_envio=Decimal("0.00"),
            total=Decimal("980.00"),
            estado_pago="PAGADO",
            estado_logistica="ENTREGADA",
            creado_en=utc_now() - timedelta(days=2)
        )
        db.add(orden_web2)
        db.flush()
        db.add(OrdenDetalle(
            id_orden=orden_web2.id_orden,
            id_producto=prod_traje.id_producto,
            talla="40",
            color="Azul Noche",
            cantidad=1,
            precio_unitario=Decimal("980.00"),
            subtotal=Decimal("980.00")
        ))
        db.flush()

        # 16. Devoluciones y Cambios de Prenda (CU25)
        print("Insertando Devoluciones y Cambios de Prenda...")
        dev1 = Devolucion(
            tenant_id="fashionstore_scz",
            id_orden=orden_pos_demo.id_orden,
            id_sucursal=s_equi.id_sucursal,
            id_usuario=u_javier.id_usuario,
            nro_ticket_original=orden_pos_demo.numero_factura,
            nro_devolucion="DEV-2026-0012",
            fecha_devolucion=utc_now() - timedelta(days=1),
            motivo="Talla no adecuada",
            tipo_resolucion="REEMBOLSO_EFECTIVO",
            total_devuelto=Decimal("180.00"),
            diferencia_cobrada=Decimal("0.00"),
            estado="APROBADA"
        )
        db.add(dev1)
        db.flush()
        db.add(DevolucionDetalle(
            id_devolucion=dev1.id_devolucion,
            id_producto=prod_camisa.id_producto,
            talla="M",
            color="Azul Marino",
            cantidad=1,
            costo_historico_cpp=Decimal("107.14"),
            precio_unitario_original=Decimal("180.00"),
            estado_fisico="APTO_VENTA"
        ))
        db.flush()

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
