"""
========================================================================================
SCRIPT DE AUTOMATIZACIÓN PARA ENTERPRISE ARCHITECT (UML 2.5+)
Proyecto: FashionStore - Sistemas de Información II (SI2)
Propósito: Creación programática de la carpeta 'diagramas de actividades' y modelado
           de los 6 Diagramas de Actividad del Modelo de Negocio con Swimlanes y flujos.
Archivo Destino: diagramas1erParcial.eapx
========================================================================================
"""

import sys
import os
import win32com.client

EAPX_PATH = os.path.abspath(r"c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\diagramas\diagramas1erParcial.eapx")

def crear_nodo_inicial(pkg, diag, x, y):
    """Crea un nodo inicial (InitialNode) en EA"""
    elem = pkg.Elements.AddNew("", "StateNode")
    elem.Subtype = 100
    elem.Update()
    
    d_obj = diag.DiagramObjects.AddNew(f"l={x-12};r={x+12};t={y};b={y-24}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Update()
    return elem

def crear_nodo_final(pkg, diag, x, y):
    """Crea un nodo final de actividad (ActivityFinal) en EA"""
    elem = pkg.Elements.AddNew("", "StateNode")
    elem.Subtype = 101
    elem.Update()
    
    d_obj = diag.DiagramObjects.AddNew(f"l={x-14};r={x+14};t={y};b={y-28}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Update()
    return elem

def crear_decision(pkg, diag, nombre, x, y):
    """Crea un nodo de decisión (Decision) en EA"""
    elem = pkg.Elements.AddNew(nombre, "Decision")
    elem.Update()
    
    d_obj = diag.DiagramObjects.AddNew(f"l={x-25};r={x+25};t={y};b={y-40}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Update()
    return elem

def crear_accion(pkg, diag, nombre, x, y, width=190, height=50):
    """Crea una acción de actividad (Action) en EA"""
    elem = pkg.Elements.AddNew(nombre, "Action")
    elem.Update()
    
    half_w = width // 2
    d_obj = diag.DiagramObjects.AddNew(f"l={x-half_w};r={x+half_w};t={y};b={y-height}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Update()
    return elem

def crear_particion(pkg, diag, nombre, left, right, top=-30, bottom=-1700):
    """Crea una partición / calle de actividad (ActivityPartition / Swimlane)"""
    elem = pkg.Elements.AddNew(nombre, "ActivityPartition")
    elem.Update()
    
    d_obj = diag.DiagramObjects.AddNew(f"l={left};r={right};t={top};b={bottom}", "")
    d_obj.ElementID = elem.ElementID
    d_obj.Sequence = 1  # Mantener al fondo
    d_obj.Update()
    return elem

def conectar(origen, destino, guardia=""):
    """Crea un flujo de control (ControlFlow) entre dos elementos en EA"""
    conn = origen.Connectors.AddNew(guardia, "ControlFlow")
    conn.SupplierID = destino.ElementID
    if guardia:
        conn.TransitionGuard = guardia
        conn.Name = guardia
    conn.Update()
    return conn

def construir_diagramas():
    print(f"Abriendo repositorio EA: {EAPX_PATH}")
    repo = win32com.client.Dispatch("EA.Repository")
    if not repo.OpenFile(EAPX_PATH):
        print("Error: No se pudo abrir el archivo .eapx")
        return False

    try:
        model = repo.Models.GetAt(0)
        print(f"Modelo raíz detectado: '{model.Name}'")

        # 1. Crear o reutilizar la carpeta 'diagramas de actividades'
        pkg_name = "diagramas de actividades"
        act_pkg = None
        for i in range(model.Packages.Count):
            p = model.Packages.GetAt(i)
            if p.Name.lower() == pkg_name.lower():
                act_pkg = p
                print(f"Carpeta existente encontrada: '{act_pkg.Name}' (ID: {act_pkg.PackageID})")
                break

        if act_pkg is None:
            act_pkg = model.Packages.AddNew(pkg_name, "")
            act_pkg.Update()
            model.Packages.Refresh()
            print(f"Carpeta creada exitosamente: '{act_pkg.Name}' (ID: {act_pkg.PackageID})")

        # ==============================================================================
        # DIAGRAMA 1: Abastecimiento y Recepción con Costo Promedio Ponderado
        # ==============================================================================
        print("\n--> Generando Diagrama 1: Abastecimiento y Recepción (CPP)...")
        d1 = act_pkg.Diagrams.AddNew("M1_Abastecimiento_Recepcion_CPP", "Activity")
        d1.Notes = "Macroproceso de compras a proveedores, recepción física y cálculo del Costo Promedio Ponderado."
        d1.Update()

        # Swimlanes
        crear_particion(act_pkg, d1, "Personal de Logística / Almacén", 50, 330, -30, -1450)
        crear_particion(act_pkg, d1, "Proveedor", 350, 630, -30, -1450)
        crear_particion(act_pkg, d1, "Sistema FashionStore", 650, 950, -30, -1450)

        # Nodos
        init1 = crear_nodo_inicial(act_pkg, d1, 190, -70)
        a1_1 = crear_accion(act_pkg, d1, "Analizar umbrales mínimos\nde stock por temporada", 190, -140)
        a1_2 = crear_accion(act_pkg, d1, "Generar Orden de Compra\nformal al Proveedor", 190, -230)
        
        a1_3 = crear_accion(act_pkg, d1, "Procesar orden y\nalistar prendas en fábrica", 490, -320)
        a1_4 = crear_accion(act_pkg, d1, "Despachar lote con\nGuía de Remisión y Factura", 490, -410)
        
        a1_5 = crear_accion(act_pkg, d1, "Recepcionar lote físico\nde prendas en almacén", 190, -500)
        dec1_1 = crear_decision(act_pkg, d1, "¿Mercadería conforme?", 190, -590)
        
        a1_rechazo = crear_accion(act_pkg, d1, "Rechazar lote y emitir\nreclamo de no conformidad", 120, -680, 140, 50)
        fin1_rechazo = crear_nodo_final(act_pkg, d1, 120, -770)

        a1_6 = crear_accion(act_pkg, d1, "Registrar ingreso formal\nde prendas en el sistema", 250, -680, 140, 50)
        a1_7 = crear_accion(act_pkg, d1, "Almacenar Último Costo\nUnitario del lote", 800, -770)
        a1_8 = crear_accion(act_pkg, d1, "Recalcular Costo Promedio\nPonderado (CPP)", 800, -860)
        a1_9 = crear_accion(act_pkg, d1, "Registrar movimiento de\nentrada en Kardex", 800, -950)
        a1_10 = crear_accion(act_pkg, d1, "Incrementar stock físico\ndisponible por sucursal", 800, -1040)
        a1_11 = crear_accion(act_pkg, d1, "Emitir confirmación de\ninventario actualizado", 800, -1130)
        fin1_exito = crear_nodo_final(act_pkg, d1, 800, -1220)

        # Conexiones
        conectar(init1, a1_1)
        conectar(a1_1, a1_2)
        conectar(a1_2, a1_3)
        conectar(a1_3, a1_4)
        conectar(a1_4, a1_5)
        conectar(a1_5, dec1_1)
        conectar(dec1_1, a1_rechazo, "[No Conforme]")
        conectar(a1_rechazo, fin1_rechazo)
        conectar(dec1_1, a1_6, "[Conforme]")
        conectar(a1_6, a1_7)
        conectar(a1_7, a1_8)
        conectar(a1_8, a1_9)
        conectar(a1_9, a1_10)
        conectar(a1_10, a1_11)
        conectar(a1_11, fin1_exito)

        d1.DiagramObjects.Refresh()
        d1.Update()
        repo.SaveDiagram(d1.DiagramID)
        print("Diagrama 1 guardado con éxito.")

        # ==============================================================================
        # DIAGRAMA 2: Reserva Omnicanal y Prueba Presencial en Sucursal
        # ==============================================================================
        print("\n--> Generando Diagrama 2: Reserva Omnicanal y Prueba Presencial...")
        d2 = act_pkg.Diagrams.AddNew("M2_Reserva_Omnicanal_Prueba_Sucursal", "Activity")
        d2.Notes = "Proceso de reserva digital de prendas y atención presencial con vestidores reservados."
        d2.Update()

        crear_particion(act_pkg, d2, "Cliente", 50, 330, -30, -1700)
        crear_particion(act_pkg, d2, "Sistema FashionStore", 350, 650, -30, -1700)
        crear_particion(act_pkg, d2, "Encargado de Sucursal", 670, 970, -30, -1700)

        init2 = crear_nodo_inicial(act_pkg, d2, 190, -70)
        a2_1 = crear_accion(act_pkg, d2, "Consultar catálogo y\nfiltrar prendas por sucursal", 190, -140)
        a2_2 = crear_accion(act_pkg, d2, "Seleccionar múltiples prendas\n(tallas y colores)", 190, -230)
        a2_3 = crear_accion(act_pkg, d2, "Elegir sucursal física,\nfecha y hora de visita", 190, -320)
        
        a2_4 = crear_accion(act_pkg, d2, "Bloquear stock temporalmente\ncomo 'Reservado'", 500, -410)
        a2_5 = crear_accion(act_pkg, d2, "Generar ticket digital con\ncódigo QR de reserva", 500, -500)
        a2_6 = crear_accion(act_pkg, d2, "Notificar reserva al panel\nde la sucursal de destino", 500, -590)

        a2_7 = crear_accion(act_pkg, d2, "Apartar prendas de perchas\ny plancharlas", 820, -680)
        a2_8 = crear_accion(act_pkg, d2, "Disponer prendas en vestidor\nexclusivo asignado", 820, -770)

        a2_9 = crear_accion(act_pkg, d2, "Acudir a la sucursal en\nel horario programado", 190, -860)
        a2_10 = crear_accion(act_pkg, d2, "Escanear código QR y\nconfirmar asistencia", 820, -950)
        a2_11 = crear_accion(act_pkg, d2, "Probarse las prendas en el\nprobador asignado", 190, -1040)
        
        dec2_1 = crear_decision(act_pkg, d2, "¿Decide comprar prendas?", 190, -1130)
        a2_compra = crear_accion(act_pkg, d2, "Llevar prendas elegidas\na caja para pagar", 120, -1220, 140, 50)
        a2_descarta = crear_accion(act_pkg, d2, "Descartar y devolver\ntodas las prendas", 260, -1220, 140, 50)

        a2_libera = crear_accion(act_pkg, d2, "Liberar stock reservado\na stock disponible", 500, -1310)
        fin2 = crear_nodo_final(act_pkg, d2, 500, -1400)

        conectar(init2, a2_1)
        conectar(a2_1, a2_2)
        conectar(a2_2, a2_3)
        conectar(a2_3, a2_4)
        conectar(a2_4, a2_5)
        conectar(a2_5, a2_6)
        conectar(a2_6, a2_7)
        conectar(a2_7, a2_8)
        conectar(a2_8, a2_9)
        conectar(a2_9, a2_10)
        conectar(a2_10, a2_11)
        conectar(a2_11, dec2_1)
        conectar(dec2_1, a2_compra, "[Sí, compra prendas]")
        conectar(dec2_1, a2_descarta, "[No, descarta todo]")
        conectar(a2_compra, a2_libera)
        conectar(a2_descarta, a2_libera)
        conectar(a2_libera, fin2)

        d2.DiagramObjects.Refresh()
        d2.Update()
        repo.SaveDiagram(d2.DiagramID)
        print("Diagrama 2 guardado con éxito.")

        # ==============================================================================
        # DIAGRAMA 3: Venta Presencial en Punto de Venta (POS)
        # ==============================================================================
        print("\n--> Generando Diagrama 3: Venta Presencial en POS...")
        d3 = act_pkg.Diagrams.AddNew("M3_Venta_Presencial_POS", "Activity")
        d3.Notes = "Flujo transaccional en caja registradora de sucursal física."
        d3.Update()

        crear_particion(act_pkg, d3, "Cajero de Sucursal", 50, 330, -30, -1650)
        crear_particion(act_pkg, d3, "Cliente", 350, 630, -30, -1650)
        crear_particion(act_pkg, d3, "Sistema FashionStore POS", 650, 950, -30, -1650)

        init3 = crear_nodo_inicial(act_pkg, d3, 190, -70)
        a3_1 = crear_accion(act_pkg, d3, "Abrir nueva transacción\nen el sistema POS", 190, -140)
        a3_2 = crear_accion(act_pkg, d3, "Presentar prendas en mostrador\n(o código de reserva)", 490, -230)
        a3_3 = crear_accion(act_pkg, d3, "Escanear código de barras\no ingresar SKU", 190, -320)
        
        dec3_1 = crear_decision(act_pkg, d3, "¿Solicita factura con NIT?", 190, -410)
        a3_id = crear_accion(act_pkg, d3, "Ingresar CI / NIT y correo\npara puntos y factura", 120, -500, 140, 50)
        a3_anon = crear_accion(act_pkg, d3, "Registrar como 'Consumidor\nFinal / Sin Nombre'", 260, -500, 140, 50)

        a3_cobro = crear_accion(act_pkg, d3, "Seleccionar medio de cobro\n(Efectivo, Tarjeta, QR)", 190, -590)
        a3_paga = crear_accion(act_pkg, d3, "Realizar el pago según\nmodalidad elegida", 490, -680)
        a3_proc = crear_accion(act_pkg, d3, "Procesar cobro físico o\nescanear comprobante QR", 190, -770)

        a3_val = crear_accion(act_pkg, d3, "Validar confirmación y\ncuadre de la transacción", 800, -860)
        a3_stock = crear_accion(act_pkg, d3, "Descontar stock físico\ndefinitivamente en sucursal", 800, -950)
        a3_pts = crear_accion(act_pkg, d3, "Asignar puntos de fidelización\na la cuenta del cliente", 800, -1040)
        a3_comp = crear_accion(act_pkg, d3, "Generar comprobante fiscal\ne imprimir ticket", 800, -1130)

        a3_entrega = crear_accion(act_pkg, d3, "Entregar prendas embolsadas\ny comprobante impreso", 190, -1220)
        a3_recibe = crear_accion(act_pkg, d3, "Recibir prendas adquiridas\ny constancia de compra", 490, -1310)
        fin3 = crear_nodo_final(act_pkg, d3, 490, -1400)

        conectar(init3, a3_1)
        conectar(a3_1, a3_2)
        conectar(a3_2, a3_3)
        conectar(a3_3, dec3_1)
        conectar(dec3_1, a3_id, "[Sí, con datos]")
        conectar(dec3_1, a3_anon, "[No, sin datos]")
        conectar(a3_id, a3_cobro)
        conectar(a3_anon, a3_cobro)
        conectar(a3_cobro, a3_paga)
        conectar(a3_paga, a3_proc)
        conectar(a3_proc, a3_val)
        conectar(a3_val, a3_stock)
        conectar(a3_stock, a3_pts)
        conectar(a3_pts, a3_comp)
        conectar(a3_comp, a3_entrega)
        conectar(a3_entrega, a3_recibe)
        conectar(a3_recibe, fin3)

        d3.DiagramObjects.Refresh()
        d3.Update()
        repo.SaveDiagram(d3.DiagramID)
        print("Diagrama 3 guardado con éxito.")

        # ==============================================================================
        # DIAGRAMA 4: Venta Digital y Despacho con Pasarela de Pago
        # ==============================================================================
        print("\n--> Generando Diagrama 4: Venta Digital y Despacho...")
        d4 = act_pkg.Diagrams.AddNew("M4_Venta_Digital_Pasarela_Delivery", "Activity")
        d4.Notes = "Checkout digital mediante Stripe/PayPal y logística de última milla."
        d4.Update()

        crear_particion(act_pkg, d4, "Cliente Digital", 50, 310, -30, -1700)
        crear_particion(act_pkg, d4, "Sistema FashionStore Web/App", 330, 600, -30, -1700)
        crear_particion(act_pkg, d4, "Pasarela Externa (Stripe / PayPal)", 620, 890, -30, -1700)
        crear_particion(act_pkg, d4, "Empresa de Delivery", 910, 1180, -30, -1700)

        init4 = crear_nodo_inicial(act_pkg, d4, 180, -70)
        a4_1 = crear_accion(act_pkg, d4, "Agregar prendas al carrito\ndesde web o app móvil", 180, -140)
        a4_2 = crear_accion(act_pkg, d4, "Iniciar checkout e ingresar\ndomicilio de entrega", 180, -230)
        
        a4_3 = crear_accion(act_pkg, d4, "Calcular tarifa de envío por\nHaversine y peso volumétrico", 465, -320)
        a4_4 = crear_accion(act_pkg, d4, "Seleccionar método de pago\n(Tarjeta o PayPal)", 180, -410)
        a4_5 = crear_accion(act_pkg, d4, "Ingresar credenciales en\nformulario tokenizado seguro", 180, -500)

        a4_6 = crear_accion(act_pkg, d4, "Enviar token de cobro a la\npasarela de pagos", 465, -590)
        a4_7 = crear_accion(act_pkg, d4, "Validar fondos y ejecutar\nprotocolo 3D Secure", 755, -680)
        a4_8 = crear_accion(act_pkg, d4, "Aprobar cobro y emitir\nevento Webhook asíncrono", 755, -770)

        a4_9 = crear_accion(act_pkg, d4, "Verificar firma de Webhook\ny confirmar pago", 465, -860)
        a4_10 = crear_accion(act_pkg, d4, "Crear Orden de Venta y\ndescontar existencias", 465, -950)
        a4_11 = crear_accion(act_pkg, d4, "Asignar pedido al servicio\nde delivery de última milla", 465, -1040)

        a4_12 = crear_accion(act_pkg, d4, "Recolectar paquete empaquetado\nen la sucursal origen", 1045, -1130)
        a4_13 = crear_accion(act_pkg, d4, "Trasladar pedido y notificar\nruta en tiempo real", 1045, -1220)
        a4_14 = crear_accion(act_pkg, d4, "Recibir paquete en domicilio\ny entregar código OTP", 180, -1310)
        a4_15 = crear_accion(act_pkg, d4, "Validar código OTP y registrar\nentrega completada", 1045, -1400)
        fin4 = crear_nodo_final(act_pkg, d4, 1045, -1490)

        conectar(init4, a4_1)
        conectar(a4_1, a4_2)
        conectar(a4_2, a4_3)
        conectar(a4_3, a4_4)
        conectar(a4_4, a4_5)
        conectar(a4_5, a4_6)
        conectar(a4_6, a4_7)
        conectar(a4_7, a4_8)
        conectar(a4_8, a4_9)
        conectar(a4_9, a4_10)
        conectar(a4_10, a4_11)
        conectar(a4_11, a4_12)
        conectar(a4_12, a4_13)
        conectar(a4_13, a4_14)
        conectar(a4_14, a4_15)
        conectar(a4_15, fin4)

        d4.DiagramObjects.Refresh()
        d4.Update()
        repo.SaveDiagram(d4.DiagramID)
        print("Diagrama 4 guardado con éxito.")

        # ==============================================================================
        # DIAGRAMA 5: Experiencia Inteligente (Vestidor RA + IA Contextual + Comparador)
        # ==============================================================================
        print("\n--> Generando Diagrama 5: Experiencia Inteligente (RA + IA)...")
        d5 = act_pkg.Diagrams.AddNew("M5_Experiencia_Inteligente_RA_IA", "Activity")
        d5.Notes = "Vestidor virtual con realidad aumentada y asesoría de estilo con IA basada en clima."
        d5.Update()

        crear_particion(act_pkg, d5, "Cliente Móvil", 50, 310, -30, -1700)
        crear_particion(act_pkg, d5, "Módulo Realidad Aumentada", 330, 600, -30, -1700)
        crear_particion(act_pkg, d5, "Asistente IA Contextual", 620, 890, -30, -1700)
        crear_particion(act_pkg, d5, "Comparador de Outfits", 910, 1180, -30, -1700)

        init5 = crear_nodo_inicial(act_pkg, d5, 180, -70)
        a5_1 = crear_accion(act_pkg, d5, "Iniciar aplicación móvil\nFashionStore", 180, -140)
        a5_2 = crear_accion(act_pkg, d5, "Seleccionar prenda y presionar\n'Vestidor Virtual RA'", 180, -230)
        a5_3 = crear_accion(act_pkg, d5, "Apuntar cámara hacia el\ncuerpo del usuario", 180, -320)

        a5_4 = crear_accion(act_pkg, d5, "Detectar proporciones anatómicas\n(ARCore / ML Kit)", 465, -410)
        a5_5 = crear_accion(act_pkg, d5, "Superponer modelo 3D de la\nprenda sobre la silueta", 465, -500)

        a5_6 = crear_accion(act_pkg, d5, "Evaluar calce y alternar\ncolores y texturas en vivo", 180, -590)
        a5_7 = crear_accion(act_pkg, d5, "Solicitar sugerencia de outfit\npor voz o texto", 180, -680)

        a5_8 = crear_accion(act_pkg, d5, "Obtener temperatura y clima\nactual (OpenWeatherMap)", 755, -770)
        a5_9 = crear_accion(act_pkg, d5, "Recuperar historial, colorimetría\ny stock disponible", 755, -860)
        a5_10 = crear_accion(act_pkg, d5, "Sintetizar prompt: Clima +\nOcasión + Stock Real", 755, -950)
        a5_11 = crear_accion(act_pkg, d5, "Generar combinaciones con\nmodelo cognitivo (OpenAI/Gemini)", 755, -1040)

        a5_12 = crear_accion(act_pkg, d5, "Visualizar combinación de\noutfit contextual recomendado", 180, -1130)
        a5_13 = crear_accion(act_pkg, d5, "Enviar combinaciones al\nComparador de Outfits", 180, -1220)

        a5_14 = crear_accion(act_pkg, d5, "Contrastar hasta 3 combinaciones\nlado a lado con precios", 1045, -1310)
        a5_15 = crear_accion(act_pkg, d5, "Seleccionar outfit preferido\npara compra o reserva", 180, -1400)
        fin5 = crear_nodo_final(act_pkg, d5, 180, -1490)

        conectar(init5, a5_1)
        conectar(a5_1, a5_2)
        conectar(a5_2, a5_3)
        conectar(a5_3, a5_4)
        conectar(a5_4, a5_5)
        conectar(a5_5, a5_6)
        conectar(a5_6, a5_7)
        conectar(a5_7, a5_8)
        conectar(a5_8, a5_9)
        conectar(a5_9, a5_10)
        conectar(a5_10, a5_11)
        conectar(a5_11, a5_12)
        conectar(a5_12, a5_13)
        conectar(a5_13, a5_14)
        conectar(a5_14, a5_15)
        conectar(a5_15, fin5)

        d5.DiagramObjects.Refresh()
        d5.Update()
        repo.SaveDiagram(d5.DiagramID)
        print("Diagrama 5 guardado con éxito.")

        # ==============================================================================
        # DIAGRAMA 6: Programa de Fidelización Gamificado
        # ==============================================================================
        print("\n--> Generando Diagrama 6: Fidelización Gamificada...")
        d6 = act_pkg.Diagrams.AddNew("M6_Fidelizacion_Gamificada", "Activity")
        d6.Notes = "Acumulación de puntos, niveles (Bronce a Diamante), insignias y canje."
        d6.Update()

        crear_particion(act_pkg, d6, "Cliente Registrado", 50, 400, -30, -1500)
        crear_particion(act_pkg, d6, "Motor de Gamificación FashionStore", 430, 800, -30, -1500)

        init6 = crear_nodo_inicial(act_pkg, d6, 225, -70)
        a6_1 = crear_accion(act_pkg, d6, "Concretar compra presencial\no digital en FashionStore", 225, -140)

        a6_2 = crear_accion(act_pkg, d6, "Calcular puntos ganados\n(1 punto por cada 10 Bs)", 615, -230)
        a6_3 = crear_accion(act_pkg, d6, "Acreditar puntos al balance\nde fidelización del cliente", 615, -320)

        a6_4 = crear_accion(act_pkg, d6, "Recibir notificación de\npuntos acumulados", 225, -410)
        a6_5 = crear_accion(act_pkg, d6, "Consultar saldo, nivel e\ninsignias en app/web", 225, -500)

        dec6_1 = crear_decision(act_pkg, d6, "¿Alcanza puntaje para\nsiguiente nivel?", 615, -590)
        a6_sube = crear_accion(act_pkg, d6, "Promover a nivel superior\n(Plata, Oro, Diamante)", 520, -680, 160, 50)
        a6_mantiene = crear_accion(act_pkg, d6, "Mantener nivel y calcular\npuntos faltantes", 710, -680, 160, 50)

        a6_insignia = crear_accion(act_pkg, d6, "Desbloquear descuento permanente\ne insignia digital por logro", 520, -770, 170, 50)

        a6_canje = crear_accion(act_pkg, d6, "Aplicar puntos acumulados como\ndescuento en el checkout", 225, -860)
        a6_rebaja = crear_accion(act_pkg, d6, "Rebajar importe en dinero real\ndel total de la nueva compra", 615, -950)
        a6_actualiza = crear_accion(act_pkg, d6, "Deducir puntos canjeados\ndel saldo disponible", 615, -1040)
        fin6 = crear_nodo_final(act_pkg, d6, 615, -1130)

        conectar(init6, a6_1)
        conectar(a6_1, a6_2)
        conectar(a6_2, a6_3)
        conectar(a6_3, a6_4)
        conectar(a6_4, a6_5)
        conectar(a6_5, dec6_1)
        conectar(dec6_1, a6_sube, "[Sí, asciende]")
        conectar(dec6_1, a6_mantiene, "[No, progreso]")
        conectar(a6_sube, a6_insignia)
        conectar(a6_insignia, a6_canje)
        conectar(a6_mantiene, a6_canje)
        conectar(a6_canje, a6_rebaja)
        conectar(a6_rebaja, a6_actualiza)
        conectar(a6_actualiza, fin6)

        d6.DiagramObjects.Refresh()
        d6.Update()
        repo.SaveDiagram(d6.DiagramID)
        print("Diagrama 6 guardado con éxito.")

        act_pkg.Packages.Refresh()
        act_pkg.Diagrams.Refresh()
        act_pkg.Elements.Refresh()
        model.Packages.Refresh()

        print("\n=======================================================")
        print("¡TODOS LOS 6 DIAGRAMAS FUERON CREADOS EXITOSAMENTE!")
        print(f"Ubicación en EA: Model -> {pkg_name}")
        print("=======================================================")
        return True

    except Exception as e:
        import traceback
        print("Error durante la generación:")
        traceback.print_exc()
        return False
    finally:
        repo.CloseFile()
        repo.Exit()
        print("Repositorio EA cerrado limpiamente.")

if __name__ == "__main__":
    construir_diagramas()
