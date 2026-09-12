---
name: Implementación de CU15 - Registrar Venta Presencial en Caja (POS)
description: Instrucciones detalladas para implementar el Caso de Uso 15 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU15 (Registrar Venta Presencial en Caja POS)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 15: Registrar Venta Presencial en Caja (POS)**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que las tablas de facturación (`ordenes_venta`, `ordenes_detalle`, y las de inventario físico de la sucursal) ya existen. Además, se asume que las terminales físicas y lectores de códigos de barras actúan como emuladores de teclado (HID).

---

## 1. Contexto del Caso de Uso (CU15)

- **Actor:** Cajero de Sucursal (Requiere estar asignado a una caja/sucursal específica).
- **Objetivo:** Registrar una venta directa en mostrador, añadir productos mediante código de barras o texto, convertir reservas previas en ventas finales, y emitir el ticket o factura electrónica.
- **Flujo:** 
  1. El cajero abre la terminal de venta.
  2. Escanea productos físicos o ingresa el código de una reserva.
  3. Selecciona medio de pago rápido (Ej. Efectivo) e ingresa el monto recibido.
  4. El sistema cobra, baja inventario y genera el comprobante a imprimir.

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Modelos Pydantic (Schemas)
Crear en `schemas/pos.py`:
- `PosVentaCreate`: Recibe `nit_cliente`, `nombre_cliente`, `metodo_pago` (EFECTIVO, TARJETA_POS, QR_LOCAL), monto_recibido y una lista de ítems (`sku`, `cantidad`).
- `PosReservaLoad`: Recibe el `codigo_qr` alfanumérico para jalar una reserva.
- `PosTicketResponse`: Retorna los datos de la factura generada y el cálculo del `cambio_devolver`.

### 2.2 Capa de Servicio / Lógica de Negocio (`services/pos_service.py`)
Implementar las funciones de caja:
1. **Buscar Producto (SKU/Barras):** Buscar rápido un producto por su SKU y retornar sus datos para añadirlo al ticket virtual en pantalla.
2. **Cargar Reserva:** Buscar una reserva en estado `ATENDIDA` o `PREPARADA`, retornar sus prendas y marcarla internamente para que pase a estado `CERRADA_POR_VENTA` al confirmar el pago.
3. **Procesar Venta POS:** 
   - Crear registro en `ordenes_venta` con canal `POS`.
   - Crear `ordenes_detalle`.
   - **Manejo de Stock (Kardex):** Registrar inmediatamente el asiento de salida física (baja de inventario) en la sucursal del cajero logueado.
   - Calcular si `monto_recibido >= total`. Retornar el `cambio_devolver`.

### 2.3 Controladores / Routers (`routers/pos.py`)
Crear los endpoints (Asociados al token JWT del rol `CAJERO`):
- **GET** `/api/v1/pos/productos/{sku}`: Para el lector de códigos de barras.
- **GET** `/api/v1/pos/reservas/{codigo_qr}`: Para jalar datos de la reserva al ticket.
- **POST** `/api/v1/pos/venta`: Confirma la venta física, descuenta stock y retorna ticket.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Diseño UI de Caja Registradora (POS UI)
- **Vista principal:** `pos-terminal.component.html`
- **Layout Profesional:**
  - **Lado Izquierdo (60%):** Buscador/Lector principal. Grilla de acceso rápido con las prendas más vendidas o categorías (Grid de botones grandes). Botón especial: "Cargar Reserva".
  - **Lado Derecho (40%):** "Ticket Virtual" tipo ticketera. Lista apilada de productos con cantidad, precio unitario y botón de basura (🗑️) para borrar. Al final, un área de Totales en fuente grande.

### 3.2 Lógica de Lectura y Búsqueda
- **Servicio:** `pos.service.ts`
- **Lector de barras:** Mantener un `input` siempre con "foco" (`autofocus`) para que el lector de códigos de barras hardware dispare la búsqueda al backend automáticamente (aprovechando que los lectores envían la tecla `ENTER` al final del escaneo).

### 3.3 Modal de Pago Rápido
- Al presionar **"Cobrar (F12)"**: Abrir un Modal (Dialog).
- Mostrar 3 botones grandes: `EFECTIVO`, `TARJETA (POS Físico)`, `QR Local`.
- **Si es efectivo:** Mostrar un input (con teclado numérico gigante en pantalla touch) para ingresar "Efectivo Recibido".
- **Cálculo de Cambio:** Mostrar dinámicamente en el modal: `Cambio: $XX.XX`.
- Botón final de "Confirmar e Imprimir".

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU15, se deben cumplir las siguientes pruebas de caja negra:
1. **Lector Automático:** Escanear un SKU con un lector USB físico añade instantáneamente la prenda al panel derecho y suma el precio al total. Escanear 2 veces el mismo SKU sube la cantidad a 2 en la misma línea.
2. **Conversión de Reserva:** El cajero ingresa el código de una reserva. Todos los ítems reservados aparecen en el ticket virtual. Al cobrar, el sistema baja el stock y cierra la reserva (evita doble venta).
3. **Validación de Pago:** Si el total es 200, y el cajero selecciona EFECTIVO pero tipea 150 en "Monto Recibido", el botón de "Confirmar Venta" debe deshabilitarse o arrojar error.
4. **Respuesta Rápida:** La venta debe procesarse y retornar el ticket en menos de 1 segundo para no retrasar la fila en tienda.
