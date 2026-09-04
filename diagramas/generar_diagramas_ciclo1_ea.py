"""
========================================================================================
SCRIPT DE AUTOMATIZACIÓN PARA ENTERPRISE ARCHITECT (UML 2.5+) - CICLO 1 (10 CASOS DE USO)
Proyecto: FashionStore - Sistemas de Información II (SI2 - 2-2026)
Docente: MSc. Ing. Angélica Garzón Cuéllar
Integrantes: Alberto Delgado & Andy Mujica
Propósito: Modelado programático exhaustivo en Enterprise Architect de los 10 Casos de Uso
           del Ciclo 1 en sus carpetas oficiales:
           1. diagramas de casos de uso (Paquetes de CU + CU01 al CU10 con includes/extends)
           2. diagramas de comunicacion (10 Diagramas de Comunicación con Boundary, Control, Entity)
           3. diagramas de clases y paquetes (Clases de Análisis BCE y Dependencias de Paquetes)
           4. diagramas de arquitectura y diseno (Lógica 4 capas, Despliegue, Secuencias, Estados, Navegación, ER)
Archivo Destino: diagramas1erParcial.eapx
========================================================================================
"""

import os
import win32com.client

EAPX_PATH = os.path.abspath(r"c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\diagramas\diagramas1erParcial.eapx")

def get_or_create_pkg(parent, name):
    """Obtiene o crea una carpeta / paquete en EA"""
    for i in range(parent.Packages.Count):
        p = parent.Packages.GetAt(i)
        if p.Name.lower() == name.lower():
            return p
    pkg = parent.Packages.AddNew(name, "")
    pkg.Update()
    parent.Packages.Refresh()
    return pkg

def clean_pkg_contents(pkg):
    """Limpia diagramas y elementos previos para una regeneración limpia"""
    for i in range(pkg.Diagrams.Count - 1, -1, -1):
        pkg.Diagrams.Delete(i)
    for i in range(pkg.Elements.Count - 1, -1, -1):
        pkg.Elements.Delete(i)
    pkg.Diagrams.Refresh()
    pkg.Elements.Refresh()
    pkg.Update()

def add_elem(pkg, diag, name, elem_type, x, y, width=160, height=60, stereotype=""):
    """Crea un elemento y lo sitúa en el diagrama"""
    elem = pkg.Elements.AddNew(name, elem_type)
    if stereotype:
        elem.Stereotype = stereotype
    elem.Update()
    
    half_w = width // 2
    d_obj = diag.DiagramObjects.AddNew(f"l={x-half_w};r={x+half_w};t={y};b={y-height}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Update()
    return elem

def connect(orig, dest, conn_type="Association", name="", stereotype="", subtype=""):
    """Crea un conector entre dos elementos"""
    conn = orig.Connectors.AddNew(name, conn_type)
    conn.SupplierID = dest.ElementID
    if stereotype:
        conn.Stereotype = stereotype
    if subtype:
        conn.Subtype = subtype
    if name:
        conn.Name = name
    conn.Update()
    return conn

def construir_todo():
    print(f"Abriendo repositorio EA: {EAPX_PATH}")
    repo = win32com.client.Dispatch("EA.Repository")
    if not repo.OpenFile(EAPX_PATH):
        print("Error: No se pudo abrir diagramas1erParcial.eapx")
        return False

    try:
        model = repo.Models.GetAt(0)
        print(f"Modelo raíz: '{model.Name}'")

        # ==============================================================================
        # 1. CARPETA: diagramas de casos de uso (11 DIAGRAMAS: PAQUETES + CU01 A CU10)
        # ==============================================================================
        print("\n=======================================================")
        print("1. CARPETA: diagramas de casos de uso (10 Casos de Uso)")
        print("=======================================================")
        pkg_cu = get_or_create_pkg(model, "diagramas de casos de uso")
        clean_pkg_contents(pkg_cu)

        # --- 1.1 Diagrama de Paquetes de Casos de Uso ---
        d_pkg_cu = pkg_cu.Diagrams.AddNew("Paquetes_Casos_de_Uso_Ciclo1", "Package")
        d_pkg_cu.Notes = "Estructura modular de paquetes de casos de uso para el Ciclo 1 (10 Casos de Uso)."
        d_pkg_cu.Update()

        p1 = add_elem(pkg_cu, d_pkg_cu, "Paquete 1: Seguridad y Acceso (RBAC)\n[CU01, CU02, CU03, CU04]", "Package", 200, -80, 240, 80)
        p2 = add_elem(pkg_cu, d_pkg_cu, "Paquete 2: Estructura Sucursales\n[CU05]", "Package", 540, -80, 220, 80)
        p3 = add_elem(pkg_cu, d_pkg_cu, "Paquete 3: Catálogo y Moda\n[CU06, CU07, CU10]", "Package", 200, -230, 240, 80)
        p4 = add_elem(pkg_cu, d_pkg_cu, "Paquete 4: Proveedores Textiles\n[CU08]", "Package", 540, -230, 220, 80)
        p5 = add_elem(pkg_cu, d_pkg_cu, "Paquete 5: Inventario y CPP\n[CU09]", "Package", 370, -380, 240, 80)

        connect(p2, p1, "Dependency", "", "use")
        connect(p3, p1, "Dependency", "", "use")
        connect(p4, p1, "Dependency", "", "use")
        connect(p5, p1, "Dependency", "", "use")
        connect(p5, p2, "Dependency", "", "use")
        connect(p5, p3, "Dependency", "", "use")
        connect(p5, p4, "Dependency", "", "use")
        connect(p3, p5, "Dependency", "consulta stock", "use")
        d_pkg_cu.DiagramObjects.Refresh()
        d_pkg_cu.Update()
        repo.SaveDiagram(d_pkg_cu.DiagramID)
        print("  -> Paquetes_Casos_de_Uso_Ciclo1 guardado.")

        # --- 1.2 CU01: Autenticar Usuario RBAC ---
        d_cu1 = pkg_cu.Diagrams.AddNew("CU01_Autenticar_Usuario_RBAC", "Use Case")
        d_cu1.Update()
        act_user = add_elem(pkg_cu, d_cu1, "Usuario del Sistema", "Actor", 100, -180, 70, 90)
        uc1_main = add_elem(pkg_cu, d_cu1, "CU01: Autenticar Usuario\n(Login RBAC)", "UseCase", 320, -180, 180, 60)
        uc1_hash = add_elem(pkg_cu, d_cu1, "Validar Credenciales\nHash Bcrypt", "UseCase", 580, -90, 160, 55)
        uc1_token = add_elem(pkg_cu, d_cu1, "Generar Token JWT\ncon Rol Asignado", "UseCase", 580, -180, 160, 55)
        uc1_bita = add_elem(pkg_cu, d_cu1, "Registrar Bitácora\nde Accesos", "UseCase", 580, -270, 160, 55)
        uc1_bloq = add_elem(pkg_cu, d_cu1, "Bloquear Cuenta\n(5 Intentos Fallidos)", "UseCase", 320, -320, 160, 55)

        connect(act_user, uc1_main, "Association")
        connect(uc1_main, uc1_hash, "UseCase", "", "include")
        connect(uc1_main, uc1_token, "UseCase", "", "include")
        connect(uc1_main, uc1_bita, "UseCase", "", "include")
        connect(uc1_main, uc1_bloq, "UseCase", "", "extend")
        d_cu1.DiagramObjects.Refresh()
        d_cu1.Update()
        repo.SaveDiagram(d_cu1.DiagramID)
        print("  -> CU01_Autenticar_Usuario_RBAC guardado.")

        # --- 1.3 CU02: Registrar Cliente ---
        d_cu2 = pkg_cu.Diagrams.AddNew("CU02_Registrar_Cliente_SignUp", "Use Case")
        d_cu2.Update()
        act_cli_reg = add_elem(pkg_cu, d_cu2, "Cliente No Autenticado", "Actor", 100, -160, 70, 90)
        uc2_main = add_elem(pkg_cu, d_cu2, "CU02: Registrarse en\nFashionStore (Sign Up)", "UseCase", 330, -160, 190, 60)
        uc2_val = add_elem(pkg_cu, d_cu2, "Validar Formato Correo\ny Teléfono Único", "UseCase", 600, -90, 170, 55)
        uc2_pwd = add_elem(pkg_cu, d_cu2, "Validar Robustez Clave\ny Cifrar con Bcrypt", "UseCase", 600, -160, 170, 55)
        uc2_mail = add_elem(pkg_cu, d_cu2, "Enviar Correo de\nBienvenida", "UseCase", 600, -230, 170, 55)

        connect(act_cli_reg, uc2_main, "Association")
        connect(uc2_main, uc2_val, "UseCase", "", "include")
        connect(uc2_main, uc2_pwd, "UseCase", "", "include")
        connect(uc2_main, uc2_mail, "UseCase", "", "include")
        d_cu2.DiagramObjects.Refresh()
        d_cu2.Update()
        repo.SaveDiagram(d_cu2.DiagramID)
        print("  -> CU02_Registrar_Cliente_SignUp guardado.")

        # --- 1.4 CU03: Recuperar Contraseña OTP ---
        d_cu3 = pkg_cu.Diagrams.AddNew("CU03_Recuperar_Contrasena_OTP", "Use Case")
        d_cu3.Update()
        act_user_rec = add_elem(pkg_cu, d_cu3, "Usuario del Sistema", "Actor", 100, -160, 70, 90)
        uc3_main = add_elem(pkg_cu, d_cu3, "CU03: Recuperar Contraseña\n(Token OTP)", "UseCase", 330, -160, 190, 60)
        uc3_gen = add_elem(pkg_cu, d_cu3, "Generar Código OTP\n(6 Dígitos - 15 min)", "UseCase", 600, -80, 170, 55)
        uc3_mail = add_elem(pkg_cu, d_cu3, "Enviar Correo con\nCódigo OTP", "UseCase", 600, -150, 170, 55)
        uc3_val = add_elem(pkg_cu, d_cu3, "Validar OTP y Actualizar\nHash Contraseña", "UseCase", 600, -220, 170, 55)
        uc3_inv = add_elem(pkg_cu, d_cu3, "Invalidar Token tras\n3 Intentos Errados", "UseCase", 330, -280, 170, 55)

        connect(act_user_rec, uc3_main, "Association")
        connect(uc3_main, uc3_gen, "UseCase", "", "include")
        connect(uc3_main, uc3_mail, "UseCase", "", "include")
        connect(uc3_main, uc3_val, "UseCase", "", "include")
        connect(uc3_main, uc3_inv, "UseCase", "", "extend")
        d_cu3.DiagramObjects.Refresh()
        d_cu3.Update()
        repo.SaveDiagram(d_cu3.DiagramID)
        print("  -> CU03_Recuperar_Contrasena_OTP guardado.")

        # --- 1.5 CU04: Gestionar Usuarios y Roles ---
        d_cu4 = pkg_cu.Diagrams.AddNew("CU04_Gestionar_Usuarios_Roles_RBAC", "Use Case")
        d_cu4.Update()
        act_adm = add_elem(pkg_cu, d_cu4, "Administrador General", "Actor", 100, -180, 80, 90)
        uc4_main = add_elem(pkg_cu, d_cu4, "CU04: Gestionar Usuarios\ny Roles (RBAC)", "UseCase", 340, -180, 190, 60)
        uc4_crear = add_elem(pkg_cu, d_cu4, "Registrar Empleado\n(Encargado/Cajero/Logística)", "UseCase", 610, -80, 180, 55)
        uc4_rol = add_elem(pkg_cu, d_cu4, "Asignar Rol y Sucursal\nde Trabajo", "UseCase", 830, -80, 170, 55)
        uc4_desb = add_elem(pkg_cu, d_cu4, "Desbloquear Cuenta\nBloqueada por Fallos", "UseCase", 610, -160, 170, 55)
        uc4_baja = add_elem(pkg_cu, d_cu4, "Inactivar / Dar de Baja\nCuenta de Usuario", "UseCase", 610, -240, 170, 55)

        connect(act_adm, uc4_main, "Association")
        connect(uc4_main, uc4_crear, "UseCase", "", "extend")
        connect(uc4_crear, uc4_rol, "UseCase", "", "include")
        connect(uc4_main, uc4_desb, "UseCase", "", "extend")
        connect(uc4_main, uc4_baja, "UseCase", "", "extend")
        d_cu4.DiagramObjects.Refresh()
        d_cu4.Update()
        repo.SaveDiagram(d_cu4.DiagramID)
        print("  -> CU04_Gestionar_Usuarios_Roles_RBAC guardado.")

        # --- 1.6 CU05: Gestionar Ciudades y Sucursales ---
        d_cu5 = pkg_cu.Diagrams.AddNew("CU05_Gestionar_Ciudades_Sucursales", "Use Case")
        d_cu5.Update()
        act_adm5 = add_elem(pkg_cu, d_cu5, "Administrador General", "Actor", 100, -160, 80, 90)
        uc5_main = add_elem(pkg_cu, d_cu5, "CU05: Gestionar Ciudades\ny Sucursales", "UseCase", 320, -160, 180, 60)
        uc5_suc = add_elem(pkg_cu, d_cu5, "Registrar Nueva Sucursal\ncon Coordenadas GPS", "UseCase", 580, -90, 170, 55)
        uc5_prob = add_elem(pkg_cu, d_cu5, "Parametrizar Capacidad\nde Probadores Físicos", "UseCase", 800, -90, 170, 55)
        uc5_est = add_elem(pkg_cu, d_cu5, "Actualizar Estado Operativo\nde Sucursal", "UseCase", 580, -180, 170, 55)

        connect(act_adm5, uc5_main, "Association")
        connect(uc5_main, uc5_suc, "UseCase", "", "extend")
        connect(uc5_suc, uc5_prob, "UseCase", "", "include")
        connect(uc5_main, uc5_est, "UseCase", "", "extend")
        d_cu5.DiagramObjects.Refresh()
        d_cu5.Update()
        repo.SaveDiagram(d_cu5.DiagramID)
        print("  -> CU05_Gestionar_Ciudades_Sucursales guardado.")

        # --- 1.7 CU06: Gestionar Productos y Atributos ---
        d_cu6 = pkg_cu.Diagrams.AddNew("CU06_Gestionar_Productos_Atributos_Moda", "Use Case")
        d_cu6.Update()
        act_adm6 = add_elem(pkg_cu, d_cu6, "Administrador General", "Actor", 100, -180, 80, 90)
        uc6_main = add_elem(pkg_cu, d_cu6, "CU06: Gestionar Productos\nde Moda Masculina", "UseCase", 330, -180, 180, 60)
        uc6_alta = add_elem(pkg_cu, d_cu6, "Registrar Prenda con\nSKU Base Único", "UseCase", 590, -80, 170, 55)
        uc6_col = add_elem(pkg_cu, d_cu6, "Asociar Paleta de Colores\nMultivaluados (HEX)", "UseCase", 820, -50, 170, 55)
        uc6_tal = add_elem(pkg_cu, d_cu6, "Asignar Rango de\nTallas Disponibles", "UseCase", 820, -120, 170, 55)
        uc6_3d = add_elem(pkg_cu, d_cu6, "Vincular Modelo 3D (GLB)\npara Vestidor RA", "UseCase", 590, -190, 170, 55)

        connect(act_adm6, uc6_main, "Association")
        connect(uc6_main, uc6_alta, "UseCase", "", "extend")
        connect(uc6_alta, uc6_col, "UseCase", "", "include")
        connect(uc6_alta, uc6_tal, "UseCase", "", "include")
        connect(uc6_main, uc6_3d, "UseCase", "", "extend")
        d_cu6.DiagramObjects.Refresh()
        d_cu6.Update()
        repo.SaveDiagram(d_cu6.DiagramID)
        print("  -> CU06_Gestionar_Productos_Atributos_Moda guardado.")

        # --- 1.8 CU07: Gestionar Temporadas y Colecciones ---
        d_cu7 = pkg_cu.Diagrams.AddNew("CU07_Gestionar_Temporadas_Colecciones", "Use Case")
        d_cu7.Update()
        act_adm7 = add_elem(pkg_cu, d_cu7, "Administrador General", "Actor", 100, -160, 80, 90)
        uc7_main = add_elem(pkg_cu, d_cu7, "CU07: Gestionar Temporadas\ny Colecciones", "UseCase", 320, -160, 180, 60)
        uc7_crear = add_elem(pkg_cu, d_cu7, "Definir Campaña Estacional\n(Fechas Inicio y Fin)", "UseCase", 580, -90, 170, 55)
        uc7_asoc = add_elem(pkg_cu, d_cu7, "Asociar Prendas a la\nTemporada Comercial", "UseCase", 800, -90, 170, 55)
        uc7_liq = add_elem(pkg_cu, d_cu7, "Activar Liquidación y\nDescuentos de Campaña", "UseCase", 580, -180, 170, 55)

        connect(act_adm7, uc7_main, "Association")
        connect(uc7_main, uc7_crear, "UseCase", "", "extend")
        connect(uc7_crear, uc7_asoc, "UseCase", "", "include")
        connect(uc7_main, uc7_liq, "UseCase", "", "extend")
        d_cu7.DiagramObjects.Refresh()
        d_cu7.Update()
        repo.SaveDiagram(d_cu7.DiagramID)
        print("  -> CU07_Gestionar_Temporadas_Colecciones guardado.")

        # --- 1.9 CU08: Gestionar Proveedores Textiles ---
        d_cu8 = pkg_cu.Diagrams.AddNew("CU08_Gestionar_Proveedores_Textiles", "Use Case")
        d_cu8.Update()
        act_prov = add_elem(pkg_cu, d_cu8, "Administrador / Logística", "Actor", 100, -180, 80, 90)
        uc8_main = add_elem(pkg_cu, d_cu8, "CU08: Gestionar Proveedores", "UseCase", 320, -180, 180, 60)
        uc8_reg = add_elem(pkg_cu, d_cu8, "Registrar Proveedor\ncon NIT Único", "UseCase", 580, -90, 160, 55)
        uc8_lin = add_elem(pkg_cu, d_cu8, "Vincular Líneas Textiles\ny Términos Comerciales", "UseCase", 800, -90, 170, 55)
        uc8_hist = add_elem(pkg_cu, d_cu8, "Consultar Historial\nde Abastecimiento", "UseCase", 580, -180, 160, 55)

        connect(act_prov, uc8_main, "Association")
        connect(uc8_main, uc8_reg, "UseCase", "", "extend")
        connect(uc8_reg, uc8_lin, "UseCase", "", "include")
        connect(uc8_main, uc8_hist, "UseCase", "", "extend")
        d_cu8.DiagramObjects.Refresh()
        d_cu8.Update()
        repo.SaveDiagram(d_cu8.DiagramID)
        print("  -> CU08_Gestionar_Proveedores_Textiles guardado.")

        # --- 1.10 CU09: Gestionar Inventario y Costos (CPP) ---
        d_cu9 = pkg_cu.Diagrams.AddNew("CU09_Gestionar_Inventario_Costos_CPP", "Use Case")
        d_cu9.Update()
        act_log = add_elem(pkg_cu, d_cu9, "Personal de Logística\n/ Encargado", "Actor", 100, -200, 80, 90)
        uc9_main = add_elem(pkg_cu, d_cu9, "CU09: Gestionar Inventario\nMulti-Sucursal", "UseCase", 320, -180, 180, 60)
        uc9_ent = add_elem(pkg_cu, d_cu9, "Registrar Entrada de Lote\npor Compra", "UseCase", 580, -100, 170, 55)
        uc9_ucost = add_elem(pkg_cu, d_cu9, "Guardar Último Costo\nUnitario de Compra", "UseCase", 820, -60, 170, 55)
        uc9_cpp = add_elem(pkg_cu, d_cu9, "Calcular Costo Promedio\nPonderado (CPP)", "UseCase", 820, -140, 170, 55)
        uc9_kard = add_elem(pkg_cu, d_cu9, "Consultar Existencias\ny Kardex de Sucursal", "UseCase", 580, -190, 170, 55)
        uc9_alert = add_elem(pkg_cu, d_cu9, "Alertar Quiebre de Stock\n(Stock < Mínimo)", "UseCase", 320, -310, 170, 55)

        connect(act_log, uc9_main, "Association")
        connect(uc9_main, uc9_ent, "UseCase", "", "extend")
        connect(uc9_ent, uc9_ucost, "UseCase", "", "include")
        connect(uc9_ent, uc9_cpp, "UseCase", "", "include")
        connect(uc9_main, uc9_kard, "UseCase", "", "extend")
        connect(uc9_main, uc9_alert, "UseCase", "", "extend")
        d_cu9.DiagramObjects.Refresh()
        d_cu9.Update()
        repo.SaveDiagram(d_cu9.DiagramID)
        print("  -> CU09_Gestionar_Inventario_Costos_CPP guardado.")

        # --- 1.11 CU10: Consultar Catálogo y Disponibilidad ---
        d_cu10 = pkg_cu.Diagrams.AddNew("CU10_Consultar_Catalogo_Disponibilidad", "Use Case")
        d_cu10.Update()
        act_cli = add_elem(pkg_cu, d_cu10, "Cliente (Web/Móvil)", "Actor", 100, -140, 70, 90)
        act_emp = add_elem(pkg_cu, d_cu10, "Encargado de Tienda", "Actor", 100, -280, 70, 90)
        uc10_main = add_elem(pkg_cu, d_cu10, "CU10: Consultar Catálogo\ny Disponibilidad", "UseCase", 330, -200, 180, 60)
        uc10_filt = add_elem(pkg_cu, d_cu10, "Filtrar por Talla, Color,\nTemporada y Precio", "UseCase", 590, -100, 170, 55)
        uc10_disp = add_elem(pkg_cu, d_cu10, "Verificar Stock en Tiempo\nReal por Sucursal", "UseCase", 590, -180, 170, 55)
        uc10_fich = add_elem(pkg_cu, d_cu10, "Visualizar Ficha Técnica\ny Galería de Fotos", "UseCase", 590, -260, 170, 55)

        connect(act_cli, uc10_main, "Association")
        connect(act_emp, uc10_main, "Association")
        connect(uc10_main, uc10_filt, "UseCase", "", "include")
        connect(uc10_main, uc10_disp, "UseCase", "", "include")
        connect(uc10_main, uc10_fich, "UseCase", "", "include")
        d_cu10.DiagramObjects.Refresh()
        d_cu10.Update()
        repo.SaveDiagram(d_cu10.DiagramID)
        print("  -> CU10_Consultar_Catalogo_Disponibilidad guardado.")

        # ==============================================================================
        # 2. CARPETA: diagramas de comunicacion (10 DIAGRAMAS COMPLETOS)
        # ==============================================================================
        print("\n=======================================================")
        print("2. CARPETA: diagramas de comunicacion (10 Diagramas)")
        print("=======================================================")
        pkg_com = get_or_create_pkg(model, "diagramas de comunicacion")
        clean_pkg_contents(pkg_com)

        com_configs = [
            ("Com_CU01_Autenticar_Usuario", "Usuario", "ILoginBoundary", "AutenticacionControl", [("UsuarioEntity", "1.2: buscarPorEmail()"), ("BitacoraEntity", "1.6: registrarAcceso()")]),
            ("Com_CU02_Registrar_Cliente", "Cliente", "IRegistroBoundary", "RegistroClienteControl", [("UsuarioEntity", "1.2: verificarEmail() / 1.5: crearUsuario()"), ("EmailService", "1.7: despacharBienvenida()")]),
            ("Com_CU03_Recuperar_Contrasena", "Usuario", "IRecuperarClaveBoundary", "RecuperacionControl", [("UsuarioEntity", "1.2: buscarEmail() / 2.5: updateHash()"), ("TokenOtpEntity", "1.5: registrarOtp() / 2.2: validarOtp()"), ("EmailService", "1.7: enviarCorreoOtp()")]),
            ("Com_CU04_Gestionar_Usuarios_Roles", "Administrador", "IGestionUsuariosBoundary", "UsuarioAdminControl", [("UsuarioEntity", "1.4: persistirEmpleado() / 2.2: desbloquear()"), ("SucursalEntity", "1.2: verificarSucursal()"), ("BitacoraEntity", "1.6: registrarAuditoria()")]),
            ("Com_CU05_Gestionar_Sucursales", "Administrador", "ISucursalBoundary", "SucursalControl", [("CiudadEntity", "1.2: verificarCiudadActiva()"), ("SucursalEntity", "1.4: crearSucursal()")]),
            ("Com_CU06_Gestionar_Productos", "Administrador", "IProductoBoundary", "ProductoControl", [("ProductoEntity", "1.2: crearProductoBase()"), ("ColorEntity", "1.5: asociarColores()"), ("TallaEntity", "1.6: asociarTallas()")]),
            ("Com_CU07_Gestionar_Temporadas", "Administrador", "ITemporadaBoundary", "TemporadaControl", [("TemporadaEntity", "1.3: crearTemporada()"), ("ProductoEntity", "1.5: asociarProductos()")]),
            ("Com_CU08_Gestionar_Proveedores", "PersonalLogistica", "IProveedorBoundary", "ProveedorControl", [("ProveedorEntity", "1.2: verificarNitUnico() / 1.4: crearProveedor()")]),
            ("Com_CU09_Gestionar_Inventario_CPP", "PersonalLogistica", "IInventarioBoundary", "InventarioControl", [("InventarioEntity", "1.2: getStockCpp() / 1.5: updateStockYCpp()"), ("KardexEntity", "1.6: asentarMovimientoKardex()")]),
            ("Com_CU10_Consultar_Catalogo", "Cliente", "ICatalogoBoundary", "CatalogoControl", [("ProductoEntity", "1.2: buscarPrendasFiltradas()"), ("InventarioEntity", "1.4: consultarStockSucursal()")])
        ]

        for diag_name, actor_name, bnd_name, ctrl_name, entities in com_configs:
            d_com = pkg_com.Diagrams.AddNew(diag_name, "Communication")
            d_com.Update()

            act_elem = add_elem(pkg_com, d_com, actor_name, "Actor", 80, -180, 70, 80)
            bnd_elem = add_elem(pkg_com, d_com, bnd_name, "Boundary", 280, -180, 160, 60)
            ctrl_elem = add_elem(pkg_com, d_com, ctrl_name, "Control", 530, -180, 170, 60)

            connect(act_elem, bnd_elem, "Association", "1: interactúa")
            connect(bnd_elem, ctrl_elem, "Association", "1.1: invoca servicio")

            y_ent = -100
            for ent_name, msg in entities:
                ent_elem = add_elem(pkg_com, d_com, ent_name, "Entity", 800, y_ent, 160, 60)
                connect(ctrl_elem, ent_elem, "Association", msg)
                y_ent -= 100

            d_com.DiagramObjects.Refresh()
            d_com.Update()
            repo.SaveDiagram(d_com.DiagramID)
            print(f"  -> {diag_name} guardado.")

        # ==============================================================================
        # 3. CARPETA: diagramas de clases y paquetes (COMPLETO CON LOS 10 CASOS DE USO)
        # ==============================================================================
        print("\n=======================================================")
        print("3. CARPETA: diagramas de clases y paquetes")
        print("=======================================================")
        pkg_cls = get_or_create_pkg(model, "diagramas de clases y paquetes")
        clean_pkg_contents(pkg_cls)

        # --- 3.1 Diagrama de Clases de Análisis Consolidado (B4.txt) ---
        d_cls = pkg_cls.Diagrams.AddNew("Analisis_Clases_Consolidado_BCE", "Logical")
        d_cls.Notes = "Clases de análisis: Boundary (interfaz), Control (lógica sin atributos según B4.txt), Entity (datos) para los 10 Casos de Uso."
        d_cls.Update()

        # Boundaries (10 Clases)
        b1 = add_elem(pkg_cls, d_cls, "ILoginBoundary\n(CU01)", "Class", 140, -50, 150, 60, "boundary")
        b2 = add_elem(pkg_cls, d_cls, "IRegistroBoundary\n(CU02)", "Class", 140, -130, 150, 60, "boundary")
        b3 = add_elem(pkg_cls, d_cls, "IRecuperarClaveBoundary\n(CU03)", "Class", 140, -210, 150, 60, "boundary")
        b4 = add_elem(pkg_cls, d_cls, "IGestionUsuariosBoundary\n(CU04)", "Class", 140, -290, 150, 60, "boundary")
        b5 = add_elem(pkg_cls, d_cls, "ISucursalBoundary\n(CU05)", "Class", 140, -370, 150, 60, "boundary")
        b6 = add_elem(pkg_cls, d_cls, "IProductoBoundary\n(CU06)", "Class", 140, -450, 150, 60, "boundary")
        b7 = add_elem(pkg_cls, d_cls, "ITemporadaBoundary\n(CU07)", "Class", 140, -530, 150, 60, "boundary")
        b8 = add_elem(pkg_cls, d_cls, "IProveedorBoundary\n(CU08)", "Class", 140, -610, 150, 60, "boundary")
        b9 = add_elem(pkg_cls, d_cls, "IInventarioBoundary\n(CU09)", "Class", 140, -690, 150, 60, "boundary")
        b10 = add_elem(pkg_cls, d_cls, "ICatalogoBoundary\n(CU10)", "Class", 140, -770, 150, 60, "boundary")

        # Controls (Sin atributos - B4.txt) (10 Clases)
        c1 = add_elem(pkg_cls, d_cls, "AutenticacionControl\n(CU01)", "Class", 420, -50, 170, 60, "control")
        c2 = add_elem(pkg_cls, d_cls, "RegistroClienteControl\n(CU02)", "Class", 420, -130, 170, 60, "control")
        c3 = add_elem(pkg_cls, d_cls, "RecuperacionControl\n(CU03)", "Class", 420, -210, 170, 60, "control")
        c4 = add_elem(pkg_cls, d_cls, "UsuarioAdminControl\n(CU04)", "Class", 420, -290, 170, 60, "control")
        c5 = add_elem(pkg_cls, d_cls, "SucursalControl\n(CU05)", "Class", 420, -370, 170, 60, "control")
        c6 = add_elem(pkg_cls, d_cls, "ProductoControl\n(CU06)", "Class", 420, -450, 170, 60, "control")
        c7 = add_elem(pkg_cls, d_cls, "TemporadaControl\n(CU07)", "Class", 420, -530, 170, 60, "control")
        c8 = add_elem(pkg_cls, d_cls, "ProveedorControl\n(CU08)", "Class", 420, -610, 170, 60, "control")
        c9 = add_elem(pkg_cls, d_cls, "InventarioControl\n(CU09)", "Class", 420, -690, 170, 60, "control")
        c10 = add_elem(pkg_cls, d_cls, "CatalogoControl\n(CU10)", "Class", 420, -770, 170, 60, "control")

        # Entities (Clases de Dominio Persistente)
        e1 = add_elem(pkg_cls, d_cls, "UsuarioEntity", "Class", 720, -70, 160, 65, "entity")
        e2 = add_elem(pkg_cls, d_cls, "TokenOtpEntity", "Class", 720, -160, 160, 65, "entity")
        e3 = add_elem(pkg_cls, d_cls, "CiudadEntity", "Class", 720, -250, 160, 65, "entity")
        e4 = add_elem(pkg_cls, d_cls, "SucursalEntity", "Class", 720, -340, 160, 65, "entity")
        e5 = add_elem(pkg_cls, d_cls, "ProductoEntity", "Class", 720, -430, 160, 65, "entity")
        e6 = add_elem(pkg_cls, d_cls, "TemporadaEntity", "Class", 720, -520, 160, 65, "entity")
        e7 = add_elem(pkg_cls, d_cls, "ProveedorEntity", "Class", 720, -600, 160, 65, "entity")
        e8 = add_elem(pkg_cls, d_cls, "InventarioEntity", "Class", 720, -690, 160, 65, "entity")
        e9 = add_elem(pkg_cls, d_cls, "KardexEntity", "Class", 720, -780, 160, 65, "entity")

        # Invocaciones Boundary -> Control
        connect(b1, c1, "Dependency")
        connect(b2, c2, "Dependency")
        connect(b3, c3, "Dependency")
        connect(b4, c4, "Dependency")
        connect(b5, c5, "Dependency")
        connect(b6, c6, "Dependency")
        connect(b7, c7, "Dependency")
        connect(b8, c8, "Dependency")
        connect(b9, c9, "Dependency")
        connect(b10, c10, "Dependency")

        # Operaciones Control -> Entity
        connect(c1, e1, "Dependency")
        connect(c2, e1, "Dependency")
        connect(c3, e2, "Dependency")
        connect(c3, e1, "Dependency")
        connect(c4, e1, "Dependency")
        connect(c4, e4, "Dependency")
        connect(c5, e4, "Dependency")
        connect(c5, e3, "Dependency")
        connect(c6, e5, "Dependency")
        connect(c7, e6, "Dependency")
        connect(c7, e5, "Dependency")
        connect(c8, e7, "Dependency")
        connect(c9, e8, "Dependency")
        connect(c9, e9, "Dependency")
        connect(c9, e5, "Dependency")
        connect(c10, e5, "Dependency")
        connect(c10, e8, "Dependency")

        d_cls.DiagramObjects.Refresh()
        d_cls.Update()
        repo.SaveDiagram(d_cls.DiagramID)
        print("  -> Analisis_Clases_Consolidado_BCE (10 CUs) guardado.")

        # --- 3.2 Diagrama de Análisis de Paquetes y Dependencias ---
        d_pkg_dep = pkg_cls.Diagrams.AddNew("Analisis_Paquetes_Dependencias", "Package")
        d_pkg_dep.Update()

        pkg_seg = add_elem(pkg_cls, d_pkg_dep, "Seguridad (RBAC y Cuentas)\n[Autenticacion, Registro, OTP, Admin]", "Package", 180, -80, 220, 80)
        pkg_suc = add_elem(pkg_cls, d_pkg_dep, "Sucursales y Ciudades\n[Sucursales, Ciudades, Probadores]", "Package", 480, -80, 200, 80)
        pkg_cat = add_elem(pkg_cls, d_pkg_dep, "Productos y Catálogo\n[Prendas, Tallas, Colores, Temporadas]", "Package", 180, -240, 220, 80)
        pkg_inv = add_elem(pkg_cls, d_pkg_dep, "Inventario y Costos (CPP)\n[Existencias, CPP, Kardex]", "Package", 480, -240, 200, 80)
        pkg_prv = add_elem(pkg_cls, d_pkg_dep, "Proveedores Textiles\n[Directorio, NIT, Términos]", "Package", 330, -380, 200, 80)

        connect(pkg_suc, pkg_seg, "Dependency", "autentica")
        connect(pkg_cat, pkg_seg, "Dependency", "autoriza")
        connect(pkg_inv, pkg_seg, "Dependency", "audita")
        connect(pkg_inv, pkg_suc, "Dependency", "almacena")
        connect(pkg_inv, pkg_cat, "Dependency", "controla stock")
        connect(pkg_inv, pkg_prv, "Dependency", "asienta compras")
        connect(pkg_cat, pkg_inv, "Dependency", "consulta stock")

        d_pkg_dep.DiagramObjects.Refresh()
        d_pkg_dep.Update()
        repo.SaveDiagram(d_pkg_dep.DiagramID)
        print("  -> Analisis_Paquetes_Dependencias guardado.")

        # ==============================================================================
        # 4. CARPETA: diagramas de arquitectura y diseno (ENRIQUECIDO CON 10 CUS)
        # ==============================================================================
        print("\n=======================================================")
        print("4. CARPETA: diagramas de arquitectura y diseno")
        print("=======================================================")
        pkg_arq = get_or_create_pkg(model, "diagramas de arquitectura y diseno")
        clean_pkg_contents(pkg_arq)

        # --- 4.1 Diseño Lógico en 4 Capas UML ---
        d_capas = pkg_arq.Diagrams.AddNew("Diseno_Arquitectura_Logica_4Capas", "Package")
        d_capas.Update()
        capa1 = add_elem(pkg_arq, d_capas, "1. Capa Específica Aplicación\n(Angular 17+ / Flutter 3.x)", "Package", 320, -60, 320, 70)
        capa2 = add_elem(pkg_arq, d_capas, "2. Capa Intermedia (Servicios)\n(FastAPI Routers & Middleware JWT)", "Package", 320, -170, 320, 70)
        capa3 = add_elem(pkg_arq, d_capas, "3. Capa General (Lógica Dominio)\n(AuthService, InventarioService, Algoritmo CPP)", "Package", 320, -280, 320, 70)
        capa4 = add_elem(pkg_arq, d_capas, "4. Capa Software de Sistema\n(SQLAlchemy / PostgreSQL 15+ / Mail SMTP)", "Package", 320, -390, 320, 70)

        connect(capa1, capa2, "Dependency", "HTTPS / REST")
        connect(capa2, capa3, "Dependency", "Controladores")
        connect(capa3, capa4, "Dependency", "Transacciones ACID")
        d_capas.DiagramObjects.Refresh()
        d_capas.Update()
        repo.SaveDiagram(d_capas.DiagramID)
        print("  -> Diseno_Arquitectura_Logica_4Capas guardado.")

        # --- 4.2 Diseño Físico: Diagrama de Despliegue ---
        d_desp = pkg_arq.Diagrams.AddNew("Diseno_Arquitectura_Fisica_Despliegue", "Deployment")
        d_desp.Update()
        node_movil = add_elem(pkg_arq, d_desp, "Dispositivo Móvil\n(Android / iOS Flutter)", "Node", 150, -80, 180, 90)
        node_desk = add_elem(pkg_arq, d_desp, "Estación PC / Navegador\n(Angular Web Responsiva)", "Node", 150, -220, 180, 90)
        node_cloud = add_elem(pkg_arq, d_desp, "Servidor Backend Cloud\n(FastAPI Docker en Linux)", "Node", 450, -150, 200, 100)
        node_db = add_elem(pkg_arq, d_desp, "Servidor PostgreSQL 15+\n(Instancia Cloud ACID)", "Node", 750, -150, 190, 90)
        node_smtp = add_elem(pkg_arq, d_desp, "Servicio SMTP Transaccional\n(Envío de Códigos OTP)", "Node", 450, -310, 200, 80)

        connect(node_movil, node_cloud, "Association", "HTTPS (443)")
        connect(node_desk, node_cloud, "Association", "HTTPS (443)")
        connect(node_cloud, node_db, "Association", "TCP/IP (5432)")
        connect(node_cloud, node_smtp, "Association", "SMTP/TLS (587)")
        d_desp.DiagramObjects.Refresh()
        d_desp.Update()
        repo.SaveDiagram(d_desp.DiagramID)
        print("  -> Diseno_Arquitectura_Fisica_Despliegue guardado.")

        # --- 4.3 Diagrama de Secuencia: Recuperación OTP (CU03) ---
        d_sec_otp = pkg_arq.Diagrams.AddNew("Diseno_Secuencia_Recuperacion_OTP", "Sequence")
        d_sec_otp.Notes = "Diagrama de secuencia con operador alt para validación de OTP y cambio de contraseña."
        d_sec_otp.Update()
        s_usr = add_elem(pkg_arq, d_sec_otp, "Usuario", "Actor", 80, -40, 70, 70)
        s_ui_otp = add_elem(pkg_arq, d_sec_otp, "IRecuperarClaveUI", "Boundary", 240, -40, 130, 60)
        s_ctrl_otp = add_elem(pkg_arq, d_sec_otp, "RecuperacionCtrl", "Control", 420, -40, 130, 60)
        s_tok_otp = add_elem(pkg_arq, d_sec_otp, "TokenOtpEntity", "Entity", 600, -40, 120, 60)
        s_db_otp = add_elem(pkg_arq, d_sec_otp, "PostgreSQL", "Entity", 760, -40, 110, 60)

        connect(s_usr, s_ui_otp, "Sequence", "1: ingresarEmail(email)")
        connect(s_ui_otp, s_ctrl_otp, "Sequence", "2: solicitarOtp(email)")
        connect(s_ctrl_otp, s_tok_otp, "Sequence", "3: crearTokenOtp(hash, exp)")
        connect(s_tok_otp, s_db_otp, "Sequence", "4: INSERT token")
        connect(s_usr, s_ui_otp, "Sequence", "5: ingresarOtpYClave(otp, nuevaClave)")
        connect(s_ui_otp, s_ctrl_otp, "Sequence", "6: validarYRestablecer(otp, clave)")
        connect(s_ctrl_otp, s_db_otp, "Sequence", "7: UPDATE password_hash")
        d_sec_otp.DiagramObjects.Refresh()
        d_sec_otp.Update()
        repo.SaveDiagram(d_sec_otp.DiagramID)
        print("  -> Diseno_Secuencia_Recuperacion_OTP guardado.")

        # --- 4.4 Diagrama de Secuencia: Transacción Inventario y CPP (CU09) ---
        d_sec_inv = pkg_arq.Diagrams.AddNew("Diseno_Secuencia_Entrada_Inventario_CPP", "Sequence")
        d_sec_inv.Notes = "Secuencia de recálculo transaccional de CPP y asiento en Kardex."
        d_sec_inv.Update()
        s_log = add_elem(pkg_arq, d_sec_inv, "PersonalLogistica", "Actor", 80, -40, 70, 70)
        s_ui_inv = add_elem(pkg_arq, d_sec_inv, "IInventarioUI", "Boundary", 240, -40, 120, 60)
        s_ctrl_inv = add_elem(pkg_arq, d_sec_inv, "InventarioCtrl", "Control", 420, -40, 120, 60)
        s_ent_inv = add_elem(pkg_arq, d_sec_inv, "InventarioEntity", "Entity", 600, -40, 120, 60)
        s_krd_inv = add_elem(pkg_arq, d_sec_inv, "KardexEntity", "Entity", 760, -40, 110, 60)

        connect(s_log, s_ui_inv, "Sequence", "1: ingresarLote(suc, prod, cant, costo)")
        connect(s_ui_inv, s_ctrl_inv, "Sequence", "2: procesarEntrada(datos)")
        connect(s_ctrl_inv, s_ent_inv, "Sequence", "3: getStockCpp()")
        connect(s_ctrl_inv, s_ctrl_inv, "Sequence", "4: recalcularCPP(formula)")
        connect(s_ctrl_inv, s_ent_inv, "Sequence", "5: updateStockYCostos(nuevoStock, cpp)")
        connect(s_ctrl_inv, s_krd_inv, "Sequence", "6: asentarMovimientoKardex()")
        d_sec_inv.DiagramObjects.Refresh()
        d_sec_inv.Update()
        repo.SaveDiagram(d_sec_inv.DiagramID)
        print("  -> Diseno_Secuencia_Entrada_Inventario_CPP guardado.")

        # --- 4.5 Diagrama de Tiempo ---
        d_time = pkg_arq.Diagrams.AddNew("Diseno_Tiempo_Inventario_CPP", "Timing")
        d_time.Notes = "Evolución temporal del stock y variación del CPP frente a compras y ventas."
        d_time.Update()
        t_stock = add_elem(pkg_arq, d_time, "Nivel_Stock_Fisico", "Class", 200, -100, 180, 60)
        t_cpp = add_elem(pkg_arq, d_time, "Valuacion_CPP_Bs", "Class", 450, -100, 180, 60)
        d_time.DiagramObjects.Refresh()
        d_time.Update()
        repo.SaveDiagram(d_time.DiagramID)
        print("  -> Diseno_Tiempo_Inventario_CPP guardado.")

        # --- 4.6 Diagrama de Estados: Seguridad y Cuenta de Usuario ---
        d_est_usr = pkg_arq.Diagrams.AddNew("Diseno_Estado_Seguridad_Usuario_OTP", "Statechart")
        d_est_usr.Update()
        st_u_init = add_elem(pkg_arq, d_est_usr, "", "StateNode", 80, -150, 24, 24)
        st_u_init.Subtype = 100
        st_u_init.Update()

        st_u_act = add_elem(pkg_arq, d_est_usr, "Activo_Operativo", "State", 240, -150, 140, 50)
        st_u_bloq = add_elem(pkg_arq, d_est_usr, "Bloqueado_Por_Intentos", "State", 480, -150, 160, 50)
        st_u_inac = add_elem(pkg_arq, d_est_usr, "Inactivo_Admin", "State", 240, -280, 140, 50)
        st_u_otp = add_elem(pkg_arq, d_est_usr, "OTP_Solicitado_15min", "State", 720, -150, 160, 50)

        connect(st_u_init, st_u_act, "StateFlow", "crearCuenta()")
        connect(st_u_act, st_u_bloq, "StateFlow", "5to intento fallido")
        connect(st_u_bloq, st_u_act, "StateFlow", "desbloqueoAdmin()")
        connect(st_u_bloq, st_u_otp, "StateFlow", "solicitarRecuperacion()")
        connect(st_u_otp, st_u_act, "StateFlow", "otpValidoYClaveNueva()")
        connect(st_u_act, st_u_inac, "StateFlow", "bajaAdmin()")
        connect(st_u_inac, st_u_act, "StateFlow", "reactivarAdmin()")

        d_est_usr.DiagramObjects.Refresh()
        d_est_usr.Update()
        repo.SaveDiagram(d_est_usr.DiagramID)
        print("  -> Diseno_Estado_Seguridad_Usuario_OTP guardado.")

        # --- 4.7 Diagrama de Estados: Producto e Inventario ---
        d_est = pkg_arq.Diagrams.AddNew("Diseno_Estado_Producto_Inventario", "Statechart")
        d_est.Update()
        st_init = add_elem(pkg_arq, d_est, "", "StateNode", 80, -150, 24, 24)
        st_init.Subtype = 100
        st_init.Update()

        st_borr = add_elem(pkg_arq, d_est, "Borrador", "State", 220, -150, 120, 50)
        st_pub = add_elem(pkg_arq, d_est, "Publicado", "State", 400, -150, 120, 50)
        st_disp = add_elem(pkg_arq, d_est, "ConStockDisponible", "State", 600, -100, 150, 50)
        st_crit = add_elem(pkg_arq, d_est, "StockCritico", "State", 600, -200, 150, 50)
        st_agot = add_elem(pkg_arq, d_est, "Agotado", "State", 600, -300, 150, 50)
        st_liq = add_elem(pkg_arq, d_est, "EnLiquidacion", "State", 400, -300, 120, 50)
        st_desc = add_elem(pkg_arq, d_est, "Descatalogado", "State", 220, -300, 120, 50)
        st_fin = add_elem(pkg_arq, d_est, "", "StateNode", 80, -300, 26, 26)
        st_fin.Subtype = 101
        st_fin.Update()

        connect(st_init, st_borr, "StateFlow")
        connect(st_borr, st_pub, "StateFlow", "aprobarCatalogo()")
        connect(st_pub, st_disp, "StateFlow", "conStock")
        connect(st_disp, st_crit, "StateFlow", "stock <= stockMin")
        connect(st_crit, st_agot, "StateFlow", "stock == 0")
        connect(st_agot, st_disp, "StateFlow", "recibirLote()")
        connect(st_pub, st_liq, "StateFlow", "finTemporada()")
        connect(st_liq, st_desc, "StateFlow", "retirarLinea()")
        connect(st_desc, st_fin, "StateFlow")
        d_est.DiagramObjects.Refresh()
        d_est.Update()
        repo.SaveDiagram(d_est.DiagramID)
        print("  -> Diseno_Estado_Producto_Inventario guardado.")

        # --- 4.8 Diagrama de Navegación del Sistema (Con Temporadas y Proveedores) ---
        d_nav = pkg_arq.Diagrams.AddNew("Diseno_Navegacion_Sistema", "Statechart")
        d_nav.Notes = "Flujo de navegación entre vistas web y móviles para el Ciclo 1 con los 10 módulos."
        d_nav.Update()
        nav_login = add_elem(pkg_arq, d_nav, "Vista_Login\n(/login)", "State", 180, -100, 130, 55)
        nav_reg = add_elem(pkg_arq, d_nav, "Vista_Registro\n(/registro)", "State", 180, -20, 130, 50)
        nav_olv = add_elem(pkg_arq, d_nav, "Vista_Olvido_OTP\n(/recuperar-password)", "State", 180, -180, 150, 50)
        nav_dash = add_elem(pkg_arq, d_nav, "Vista_Dashboard\n(/dashboard)", "State", 420, -100, 140, 55)
        nav_usr = add_elem(pkg_arq, d_nav, "Vista_Usuarios\n(/admin/usuarios)", "State", 640, -20, 150, 45)
        nav_suc = add_elem(pkg_arq, d_nav, "Vista_Sucursales\n(/sucursales)", "State", 640, -70, 140, 45)
        nav_prod = add_elem(pkg_arq, d_nav, "Vista_Productos\n(/productos)", "State", 640, -120, 140, 45)
        nav_temp = add_elem(pkg_arq, d_nav, "Vista_Temporadas\n(/temporadas)", "State", 640, -170, 140, 45)
        nav_prov = add_elem(pkg_arq, d_nav, "Vista_Proveedores\n(/proveedores)", "State", 640, -220, 140, 45)
        nav_inv = add_elem(pkg_arq, d_nav, "Vista_Inventario\n(/inventario)", "State", 640, -270, 140, 45)
        nav_cat = add_elem(pkg_arq, d_nav, "Vista_Catalogo\n(/catalogo)", "State", 420, -280, 140, 55)
        nav_det = add_elem(pkg_arq, d_nav, "Vista_DetallePrenda\n(/prenda/:id)", "State", 640, -330, 140, 50)

        connect(nav_login, nav_reg, "StateFlow", "crearCuenta")
        connect(nav_reg, nav_cat, "StateFlow", "autoLogin")
        connect(nav_login, nav_olv, "StateFlow", "olvidoClave")
        connect(nav_olv, nav_login, "StateFlow", "claveRestablecida")
        connect(nav_login, nav_dash, "StateFlow", "loginOK [Admin/Staff]")
        connect(nav_login, nav_cat, "StateFlow", "loginOK [Cliente]")
        connect(nav_dash, nav_usr, "StateFlow", "irAUsuarios [Solo Admin]")
        connect(nav_dash, nav_suc, "StateFlow", "irASucursales")
        connect(nav_dash, nav_prod, "StateFlow", "irAProductos")
        connect(nav_dash, nav_temp, "StateFlow", "irATemporadas")
        connect(nav_dash, nav_prov, "StateFlow", "irAProveedores")
        connect(nav_dash, nav_inv, "StateFlow", "irAInventario")
        connect(nav_cat, nav_det, "StateFlow", "seleccionarPrenda")
        connect(nav_det, nav_cat, "StateFlow", "volver")
        d_nav.DiagramObjects.Refresh()
        d_nav.Update()
        repo.SaveDiagram(d_nav.DiagramID)
        print("  -> Diseno_Navegacion_Sistema guardado.")

        # --- 4.9 Diseño Lógico de Datos (ER / Clases Persistentes) ---
        d_er = pkg_arq.Diagrams.AddNew("Diseno_Datos_Logico_ER", "Logical")
        d_er.Update()

        er_ciud = add_elem(pkg_arq, d_er, "ciudades", "Class", 150, -60, 130, 60, "table")
        er_suc = add_elem(pkg_arq, d_er, "sucursales", "Class", 350, -60, 140, 70, "table")
        er_usr = add_elem(pkg_arq, d_er, "usuarios", "Class", 550, -60, 140, 70, "table")
        er_tok = add_elem(pkg_arq, d_er, "tokens_recuperacion", "Class", 760, -60, 150, 70, "table")

        er_cat = add_elem(pkg_arq, d_er, "categorias", "Class", 150, -180, 130, 60, "table")
        er_mar = add_elem(pkg_arq, d_er, "marcas", "Class", 150, -260, 130, 60, "table")
        er_temp = add_elem(pkg_arq, d_er, "temporadas", "Class", 150, -340, 130, 60, "table")
        er_prod = add_elem(pkg_arq, d_er, "productos", "Class", 350, -240, 150, 80, "table")
        er_col = add_elem(pkg_arq, d_er, "producto_colores", "Class", 550, -200, 140, 60, "table")
        er_tal = add_elem(pkg_arq, d_er, "producto_tallas", "Class", 550, -280, 140, 60, "table")

        er_prov = add_elem(pkg_arq, d_er, "proveedores", "Class", 150, -440, 130, 60, "table")
        er_inv = add_elem(pkg_arq, d_er, "inventario", "Class", 350, -440, 150, 80, "table")
        er_krd = add_elem(pkg_arq, d_er, "kardex_movimientos", "Class", 550, -440, 150, 70, "table")

        connect(er_ciud, er_suc, "Association", "1..*")
        connect(er_suc, er_usr, "Association", "0..*")
        connect(er_usr, er_tok, "Association", "1..*")
        connect(er_cat, er_prod, "Association", "1..*")
        connect(er_mar, er_prod, "Association", "1..*")
        connect(er_temp, er_prod, "Association", "1..*")
        connect(er_prod, er_col, "Association", "1..*")
        connect(er_prod, er_tal, "Association", "1..*")
        connect(er_prov, er_prod, "Association", "1..*")
        connect(er_suc, er_inv, "Association", "1..*")
        connect(er_prod, er_inv, "Association", "1..*")
        connect(er_inv, er_krd, "Association", "1..*")

        d_er.DiagramObjects.Refresh()
        d_er.Update()
        repo.SaveDiagram(d_er.DiagramID)
        print("  -> Diseno_Datos_Logico_ER guardado.")

        print("\n=======================================================")
        print("REGENERACIÓN Y CONSTRUCCIÓN COMPLETADA EXITOSAMENTE")
        print("=======================================================")

    finally:
        repo.CloseFile()
        print("Repositorio EA cerrado correctamente.")

if __name__ == "__main__":
    construir_todo()
