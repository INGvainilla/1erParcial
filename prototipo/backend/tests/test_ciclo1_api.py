# -*- coding: utf-8 -*-
"""
Suite de Pruebas Automatizadas de Integración y Aceptación (Ciclo 1)
Valida los 10 Casos de Uso (CU01 al CU10) y los 11 Escenarios Formales (TC01 al TC11)
definidos en la Sección 5.1 (Tabla de Pruebas de Caja Negra) de documento.md.
"""
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.modules.auth.models import Usuario, TokenRecuperacion
from app.core.security import get_password_hash

client = TestClient(app)

# Helper para autenticación de admin
def get_admin_token():
    resp = client.post("/api/v1/auth/login", json={
        "email": "alberto.delgado@store.bo",
        "password": "Admin123*"
    })
    assert resp.status_code == 200, f"No se pudo autenticar al admin: {resp.text}"
    return resp.json()["access_token"]

# =============================================================================
# TC01: CU01 - Login RBAC Válido de Administrador
# =============================================================================
def test_tc01_login_rbac_administrador_valido():
    """
    TC01: Autenticación válida de Administrador (Alberto Delgado)
    Esperado: Token JWT emitido con claims de rol ADMINISTRADOR, HTTP 200.
    """
    response = client.post("/api/v1/auth/login", json={
        "email": "alberto.delgado@store.bo",
        "password": "Admin123*"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["rol"] == "ADMINISTRADOR"
    assert data["nombre_completo"] == "Alberto Delgado"

# =============================================================================
# TC02: CU01 - Bloqueo Preventivo tras 5 Intentos Fallidos
# =============================================================================
def test_tc02_login_bloqueo_preventivo_5_intentos():
    """
    TC02: Bloqueo preventivo tras 5 intentos fallidos
    Esperado: HTTP 401 en intentos 1 a 4; en 5to intento cuenta pasa a BLOQUEADO_POR_INTENTOS.
    """
    test_email = "test.bloqueo@store.bo"
    # Crear o resetear usuario de prueba
    db = SessionLocal()
    u = db.query(Usuario).filter(Usuario.email == test_email).first()
    if not u:
        u = Usuario(
            email=test_email,
            password_hash=get_password_hash("PasswordSeguro123*"),
            nombres="Prueba",
            apellidos="Bloqueo",
            rol="CLIENTE",
            estado_cuenta="ACTIVO",
            intentos_fallidos=0
        )
        db.add(u)
    else:
        u.estado_cuenta = "ACTIVO"
        u.intentos_fallidos = 0
        u.bloqueado_hasta = None
    db.commit()
    db.close()

    # Ejecutar 4 intentos fallidos
    for i in range(1, 5):
        resp = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "ClaveIncorrecta*"
        })
        assert resp.status_code == 401
        assert "intento(s)" in resp.json()["detail"]

    # 5to intento: Provoca bloqueo
    resp_5 = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "ClaveIncorrecta*"
    })
    assert resp_5.status_code == 403
    assert "bloqueada preventivamente" in resp_5.json()["detail"]

    # Verificar estado en BD
    db = SessionLocal()
    u_db = db.query(Usuario).filter(Usuario.email == test_email).first()
    assert u_db.estado_cuenta == "BLOQUEADO_POR_INTENTOS"
    assert u_db.intentos_fallidos >= 5
    db.close()

# =============================================================================
# TC03: CU02 - Auto-registro de Cliente
# =============================================================================
def test_tc03_autoregistro_cliente_nuevo():
    """
    TC03: Alta autoservicio de cliente con contraseña segura
    Esperado: Usuario persistido con rol CLIENTE, hash Bcrypt en BD, token JWT emitido.
    """
    nuevo_email = f"carlos.nuevo.{int(pytest.importorskip('time').time())}@gmail.com"
    resp = client.post("/api/v1/auth/registro", json={
        "nombres": "Carlos",
        "apellidos": "Santistevan",
        "email": nuevo_email,
        "password": "Fashion2026*",
        "telefono": "+591 79988776"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["rol"] == "CLIENTE"
    assert "Carlos" in data["nombre_completo"]

    # Validar en BD que no se guarde en texto plano
    db = SessionLocal()
    u = db.query(Usuario).filter(Usuario.email == nuevo_email).first()
    assert u is not None
    assert u.password_hash != "Fashion2026*"
    assert u.password_hash.startswith("$2b$")
    db.close()

# =============================================================================
# TC04: CU03 - Recuperación de Contraseña vía Token OTP de 6 Dígitos
# =============================================================================
def test_tc04_recuperacion_password_otp_6_digitos():
    """
    TC04: Restablecimiento de clave con código OTP de 6 dígitos
    Esperado: Generación de OTP criptográfico, validación, clave cambiada y cuenta reactivada.
    """
    email_target = "rodrigo.cliente@gmail.com"
    nueva_clave = "NuevaPassword2026*"

    # 1. Solicitar OTP
    resp_solicitud = client.post("/api/v1/auth/recuperar-password/solicitar", json={
        "email": email_target
    })
    assert resp_solicitud.status_code == 200

    # Recuperar código OTP generado en BD para simular el canal de correo
    db = SessionLocal()
    u = db.query(Usuario).filter(Usuario.email == email_target).first()
    token_record = db.query(TokenRecuperacion).filter(
        TokenRecuperacion.id_usuario == u.id_usuario,
        TokenRecuperacion.utilizado == False
    ).order_by(TokenRecuperacion.id_token.desc()).first()
    assert token_record is not None
    db.close()

    # Forzar un OTP conocido de 6 dígitos para probar el endpoint
    db = SessionLocal()
    token_record = db.query(TokenRecuperacion).filter(TokenRecuperacion.id_token == token_record.id_token).first()
    codigo_simulado = "789123"
    token_record.codigo_otp_hash = get_password_hash(codigo_simulado)
    db.commit()
    db.close()

    # 2. Enviar verificación y nueva contraseña
    resp_reset = client.post("/api/v1/auth/recuperar-password/verificar", json={
        "email": email_target,
        "codigo_otp": codigo_simulado,
        "nueva_password": nueva_clave
    })
    assert resp_reset.status_code == 200
    assert "exitosamente" in resp_reset.json()["mensaje"]

    # 3. Probar login con la nueva contraseña
    resp_login = client.post("/api/v1/auth/login", json={
        "email": email_target,
        "password": nueva_clave
    })
    assert resp_login.status_code == 200

# =============================================================================
# TC05: CU04 - Desbloqueo Administrativo de Cuentas
# =============================================================================
def test_tc05_desbloqueo_administrativo_cajero():
    """
    TC05: Desbloqueo administrativo de cuenta bloqueada (Javier Roca - Cajero)
    Esperado: estado_cuenta = 'ACTIVO', intentos_fallidos = 0, bloqueado_hasta = None.
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    cajero = db.query(Usuario).filter(Usuario.email == "javier.roca@store.bo").first()
    id_cajero = cajero.id_usuario
    # Asegurar que esté bloqueado antes de la prueba
    cajero.estado_cuenta = "BLOQUEADO_POR_INTENTOS"
    cajero.intentos_fallidos = 5
    db.commit()
    db.close()

    resp = client.put(f"/api/v1/usuarios/{id_cajero}/desbloquear", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["estado_cuenta"] == "ACTIVO"
    assert data["intentos_fallidos"] == 0

    # Intentar login como cajero ahora desbloqueado
    resp_login = client.post("/api/v1/auth/login", json={
        "email": "javier.roca@store.bo",
        "password": "Admin123*"
    })
    assert resp_login.status_code == 200
    assert resp_login.json()["rol"] == "CAJERO"

# =============================================================================
# TC06: CU05 - Alta de Sucursal con Coordenadas GPS y Probadores
# =============================================================================
def test_tc06_alta_sucursal_gps_probadores():
    """
    TC06: Alta de sucursal física con coordenadas GPS válidas y probadores
    Esperado: Sucursal persistida, HTTP 201, lat/lon validados, probadores >= 1.
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Obtener una ciudad existente
    db = SessionLocal()
    from app.modules.sucursales.models import Ciudad
    ciudad = db.query(Ciudad).first()
    id_ciudad = ciudad.id_ciudad
    db.close()

    payload = {
        "id_ciudad": id_ciudad,
        "nombre_sucursal": "Sucursal Ventura Mall Test",
        "direccion": "4to Anillo esq. Av. San Martín, Centro Comercial Ventura",
        "latitud": -17.75512000,
        "longitud": -63.19784000,
        "telefono": "3-3889900",
        "capacidad_probadores": 8,
        "horario_apertura": "10:00",
        "horario_cierre": "22:00",
        "estado": "OPERATIVA"
    }

    resp = client.post("/api/v1/sucursales", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["nombre_sucursal"] == "Sucursal Ventura Mall Test"
    assert data["capacidad_probadores"] == 8
    assert float(data["latitud"]) == pytest.approx(-17.75512000, abs=1e-5)

# =============================================================================
# TC07: CU06 - Alta de Prenda con Tallas y Colores HEX Multivaluados
# =============================================================================
def test_tc07_alta_producto_con_colores_hex_y_tallas():
    """
    TC07: Alta de prenda masculina con colores HEX multivaluados y tallas normalizadas
    Esperado: Registro en productos y persistencia en producto_colores y producto_tallas.
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    from app.modules.productos.models import Categoria, Marca
    cat = db.query(Categoria).first()
    mrc = db.query(Marca).first()
    db.close()

    sku_test = f"POLO-LUX-{int(pytest.importorskip('time').time())}"
    payload = {
        "codigo_sku_base": sku_test,
        "nombre": "Chomba Polo Piqué Pima",
        "descripcion": "Polo premium confeccionado en algodón Pima peruano con botones nacarados",
        "precio_base": 195.50,
        "id_categoria": cat.id_categoria,
        "id_marca": mrc.id_marca,
        "imagen_principal": "https://assets.fashionstore.bo/images/polo_pima.jpg",
        "modelo_3d_glb": "https://assets.fashionstore.bo/models/polo_pima.glb",
        "colores": [
            {"color_nombre": "Negro Azabache", "codigo_hex": "#000000"},
            {"color_nombre": "Blanco Puro", "codigo_hex": "#FFFFFF"}
        ],
        "tallas": ["S", "M", "L", "XL"]
    }

    resp = client.post("/api/v1/productos", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["codigo_sku_base"] == sku_test
    assert len(data["colores"]) == 2
    assert len(data["tallas"]) == 4
    assert data["colores"][0]["codigo_hex"] in ["#000000", "#FFFFFF"]

# =============================================================================
# TC08: CU07 - Temporadas Comerciales y Campañas Estacionales
# =============================================================================
def test_tc08_temporada_campana_estacional():
    """
    TC08: Calendarización y programación de temporada estacional
    Esperado: Temporada creada con rango válido (inicio < fin) y estado VIGENTE.
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    cod_temp = f"CRUISER-{int(pytest.importorskip('time').time())}"
    payload = {
        "codigo_campana": cod_temp,
        "nombre_temporada": "Colección Crucero 2026",
        "fecha_inicio": "2026-11-01",
        "fecha_fin": "2027-02-28",
        "descuento_liquidacion": 0.00,
        "estado": "VIGENTE"
    }

    resp = client.post("/api/v1/temporadas", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["codigo_campana"] == cod_temp
    assert data["estado"] == "VIGENTE"

# =============================================================================
# TC09: CU08 - Proveedores: Validación de Unicidad de NIT
# =============================================================================
def test_tc09_proveedor_unicidad_nit():
    """
    TC09: Validación de unicidad de NIT tributario de proveedor
    Esperado: HTTP 400 Bad Request si el NIT ya existe.
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "nit_identificacion": "1028392019",  # NIT ya registrado en seed (Confecciones Andina SA)
        "razon_social": "Empresa Falsa Duplicada SRL",
        "contacto_nombre": "Test Duplicado",
        "telefono": "+591 78877665",
        "email": "duplicado@proveedor.bo",
        "terminos_pago": "CONTADO",
        "estado": "ACTIVO"
    }

    resp = client.post("/api/v1/proveedores", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "ya está registrado" in resp.json()["detail"]

# =============================================================================
# TC10: CU09 - Inventario: Recálculo Matemático de Costo Promedio Ponderado (CPP)
# =============================================================================
def test_tc10_recalculo_matematico_cpp():
    """
    TC10: Recálculo matemático de Costo Promedio Ponderado (CPP)
    Demostración formal:
    Lote 1: 15 uds @ 90.00 Bs = 1350.00 Bs
    Lote 2: 20 uds @ 120.00 Bs = 2400.00 Bs
    Total: 35 uds, Inversión: 3750.00 Bs
    CPP = 3750 / 35 = 107.1428... -> 107.14 Bs
    """
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    from app.modules.sucursales.models import Sucursal
    from app.modules.productos.models import Producto
    from app.modules.inventario.models import Inventario
    
    suc = db.query(Sucursal).first()
    prod = db.query(Producto).first()
    id_sucursal = suc.id_sucursal
    id_producto = prod.id_producto
    
    # Limpiar inventario previo de la variante específica para el test
    test_talla = "XL-TEST"
    test_color = "Azul Real"
    db.query(Inventario).filter(
        Inventario.id_sucursal == id_sucursal,
        Inventario.id_producto == id_producto,
        Inventario.talla == test_talla,
        Inventario.color == test_color
    ).delete()
    db.commit()
    db.close()

    # Paso 1: Ingreso Lote 1 (15 unidades a 90 Bs)
    lote1 = {
        "id_sucursal": id_sucursal,
        "id_producto": id_producto,
        "talla": test_talla,
        "color": test_color,
        "cantidad_recibida": 15,
        "costo_unitario_compra": 90.00,
        "numero_factura": "FAC-TEST-001"
    }
    resp1 = client.post("/api/v1/inventario/entradas", json=lote1, headers=headers)
    assert resp1.status_code == 201
    kardex1 = resp1.json()
    assert kardex1["saldo_cantidad_resultante"] == 15
    assert float(kardex1["saldo_cpp_resultante"]) == 90.00

    # Paso 2: Ingreso Lote 2 (20 unidades a 120 Bs)
    lote2 = {
        "id_sucursal": id_sucursal,
        "id_producto": id_producto,
        "talla": test_talla,
        "color": test_color,
        "cantidad_recibida": 20,
        "costo_unitario_compra": 120.00,
        "numero_factura": "FAC-TEST-002"
    }
    resp2 = client.post("/api/v1/inventario/entradas", json=lote2, headers=headers)
    assert resp2.status_code == 201
    kardex2 = resp2.json()

    # Validación formal del algoritmo CPP
    assert kardex2["saldo_cantidad_resultante"] == 35
    assert float(kardex2["saldo_cpp_resultante"]) == 107.14

# =============================================================================
# TC11: CU10 - Catálogo Omnicanal y Disponibilidad Física por Sucursal
# =============================================================================
def test_tc11_catalogo_omnicanal_y_disponibilidad_sucursal():
    """
    TC11: Consulta de catálogo y disponibilidad en tiempo real en tiendas físicas
    Esperado: Retorno de prendas con stock total y desglose geográfico por sucursal.
    """
    resp = client.get("/api/v1/catalogo")
    assert resp.status_code == 200
    prendas = resp.json()
    assert len(prendas) > 0

    primera_prenda = prendas[0]
    id_producto = primera_prenda["id_producto"]

    # Consultar disponibilidad en sucursales
    resp_disp = client.get(f"/api/v1/catalogo/{id_producto}/disponibilidad-sucursales")
    assert resp_disp.status_code == 200
    data_disp = resp_disp.json()
    assert "sucursales" in data_disp
    assert len(data_disp["sucursales"]) > 0
    # Validar que cada sucursal incluya nombre, dirección, coordenadas y stock
    primera_suc = data_disp["sucursales"][0]
    assert "nombre_sucursal" in primera_suc
    assert "stock_disponible" in primera_suc
    assert "latitud" in primera_suc
    assert "longitud" in primera_suc
