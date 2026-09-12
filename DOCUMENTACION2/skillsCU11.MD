---
name: Implementación de CU11 - Solicitar Reserva de Prendas en Sucursal
description: Instrucciones detalladas para implementar el Caso de Uso 11 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU11 (Solicitar Reserva de Prendas en Sucursal)

Esta "skill" o guía de implementación define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 11: Solicitar Reserva de Prendas en Sucursal**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que el esquema de base de datos (PostgreSQL) ya se encuentra **totalmente implementado**, incluyendo las tablas `reservas` y `reserva_detalles` creadas en el script DDL del Ciclo 2.

---

## 1. Contexto del Caso de Uso (CU11)

- **Actor:** Cliente (Autenticado).
- **Objetivo:** Permitir al cliente preseleccionar prendas del catálogo, seleccionar una sucursal física, elegir fecha/hora de visita y generar un Ticket QR de reserva.
- **Flujo:** 
  1. Cliente navega con prendas preseleccionadas.
  2. Elige Sucursal + Fecha y Hora.
  3. El sistema valida disponibilidad física.
  4. Confirma reserva y recibe un QR único.

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Dependencias Requeridas
Asegurarse de tener instalada la librería para la generación de códigos QR:
```bash
pip install qrcode[pil]
```

### 2.2 Modelos Pydantic (Schemas)
Crear los esquemas de validación en `schemas/reserva.py`:
- `ReservaCreate`: Recibe `id_sucursal`, `fecha_visita` y una lista de `ReservaDetalleCreate` (id_producto, talla, color, cantidad).
- `ReservaResponse`: Devuelve todos los datos incluyendo el `codigo_qr` (como string base64 o URL de la imagen generada) y el `estado` (PENDIENTE).

### 2.3 Capa de Servicio / Lógica de Negocio (`services/reserva_service.py`)
Implementar la función `crear_reserva`:
1. **Validación de Stock:** Verificar en la base de datos (tabla de inventario por sucursal) que existan las cantidades solicitadas para esa `talla` y `color` en la sucursal elegida.
2. **Reserva de Stock:** Descontar temporalmente el stock disponible (o marcarlo como comprometido).
3. **Generación de QR:** 
   - Generar un string único (ej. UUID + ID de usuario + Timestamp).
   - Usar la librería `qrcode` para generar una imagen.
   - Convertir la imagen a Base64 para enviarla al Frontend, o guardarla en un bucket (S3/Local) y devolver la URL.
4. **Inserción DB:** Insertar el registro principal en `reservas` y los ítems en `reserva_detalles`.

### 2.4 Controladores / Routers (`routers/reservas.py`)
Crear el endpoint:
- **POST** `/api/v1/reservas`
- **Autenticación:** Requiere token JWT (Usuario con rol `CLIENTE`).
- **Respuesta HTTP:** 201 Created si es exitoso, 400 Bad Request si no hay stock en la sucursal.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Servicios (`reserva.service.ts`)
- Implementar la llamada HTTP POST a `/api/v1/reservas`.
- Pasar el token JWT en las cabeceras (usualmente manejado por un HttpInterceptor).

### 3.2 Componente de Selección (Wizard Paso 1)
- **Vista:** `reserva-crear.component.html`
- **Lógica:** Mostrar selector de Sucursales (consumiendo endpoint de sucursales). Usar un selector de Fecha y Hora nativo o librería (ej. Angular Material Datepicker).
- Mostrar el resumen de las prendas a reservar con sus tallas y colores.

### 3.3 Manejo de Errores
- Si el backend responde `400 Bad Request` por falta de stock, mostrar un `SnackBar` o alerta indicando: *"Lo sentimos, una de las prendas no tiene stock físico en la sucursal seleccionada para esa talla/color."*

### 3.4 Componente de Confirmación (Wizard Paso 2 - El Ticket QR)
- **Vista:** `reserva-ticket.component.html`
- **Diseño UI (Premium):** 
  - Renderizar una tarjeta (Card) con estilo moderno (Glassmorphism o bordes suaves) simulando un "Pase de Abordaje" o Ticket de evento.
  - Mostrar la imagen del QR de forma prominente en el centro.
  - Mostrar detalles debajo: Fecha, Hora, Sucursal y Lista de prendas.
  - Botón: "Descargar Ticket" o "Guardar en Galería".

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU11, se deben cumplir las siguientes pruebas de caja negra:
1. **Exito:** Un cliente con sesión iniciada elige una sucursal con stock, el sistema crea la reserva y le muestra un QR en pantalla. La base de datos refleja la reserva en estado `PENDIENTE`.
2. **Falla de Stock:** El cliente intenta reservar 2 camisas talla M, pero la sucursal solo tiene 1 física. El sistema aborta y alerta al usuario.
3. **Persistencia:** Al recargar la aplicación e ir a "Mis Reservas", el cliente debe poder ver su Ticket QR nuevamente.
