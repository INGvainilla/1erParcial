---
name: Implementación de CU12 - Preparar y Atender Reserva Presencial
description: Instrucciones detalladas para implementar el Caso de Uso 12 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU12 (Preparar y Atender Reserva Presencial)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 12: Preparar y Atender Reserva Presencial**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que el esquema de base de datos (PostgreSQL) ya se encuentra totalmente implementado (tablas `reservas` y `reserva_detalles`) y que el CU11 (Creación de reservas) ya está operativo.

---

## 1. Contexto del Caso de Uso (CU12)

- **Actor:** Encargado de Sucursal.
- **Objetivo:** Visualizar las reservas agendadas para su sucursal física, preparar físicamente las prendas (llevarlas a un probador) y atender al cliente marcando su llegada mediante el escaneo de su Ticket QR.
- **Flujo:** 
  1. El encargado entra al panel y ve las reservas en estado `PENDIENTE`.
  2. Aparta la ropa y cambia el estado a `PREPARADA`.
  3. El cliente llega a la tienda y muestra su código QR.
  4. El encargado escanea el QR.
  5. El sistema valida el QR y cambia el estado a `ATENDIDA`.

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Dependencias Requeridas
No se requieren dependencias externas adicionales, pero asegurar manejo de fechas para filtrar reservas del día.

### 2.2 Modelos Pydantic (Schemas)
Crear/actualizar en `schemas/reserva.py`:
- `ReservaListResponse`: Devuelve la lista de reservas con datos del cliente y los ítems.
- `ReservaEstadoUpdate`: Recibe el nuevo `estado` (ej. 'PREPARADA').
- `ReservaQrScanRequest`: Recibe el string del `codigo_qr` escaneado.

### 2.3 Capa de Servicio / Lógica de Negocio (`services/reserva_service.py`)
Implementar las siguientes funciones:
1. **Listar Reservas por Sucursal:** Filtrar reservas por `id_sucursal` del Encargado logueado y por `fecha_visita` (reservas del día de hoy) ordenadas por hora.
2. **Actualizar Estado a Preparada:** Función para cambiar el estado de `PENDIENTE` a `PREPARADA`.
3. **Validar y Atender QR:** 
   - Buscar el registro de la reserva cuyo `codigo_qr` coincida con el recibido.
   - Verificar que corresponda a la sucursal del Encargado actual.
   - Cambiar el estado de `PREPARADA` (o `PENDIENTE`) a `ATENDIDA`.

### 2.4 Controladores / Routers (`routers/encargados.py` o `routers/reservas.py`)
Crear los endpoints (Todos requieren token JWT de rol `ENCARGADO_SUCURSAL`):
- **GET** `/api/v1/sucursal/reservas/hoy`: Retorna la lista de reservas del día.
- **PATCH** `/api/v1/reservas/{id_reserva}/estado`: Actualiza estado manual a PREPARADA.
- **POST** `/api/v1/reservas/escanear-qr`: Recibe el string del QR y devuelve 200 OK con los datos de la reserva si es válido (cambia a ATENDIDA).

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Servicios (`encargado.service.ts`)
- Consumir endpoints del backend pasando el token JWT en las cabeceras.

### 3.2 Tablero de Gestión (Dashboard de Tienda)
- **Vista:** `encargado-dashboard.component.html`
- **Diseño UI (Premium):** 
  - Usar un diseño de **Tablero Kanban** o lista interactiva dividida en columnas: "Pendientes", "Preparadas en Probador", "Atendidas".
  - Cada tarjeta debe mostrar: Nombre del Cliente, Hora de visita, y un botón "Ver Prendas".

### 3.3 Integración de Escáner QR
- **Vista:** `escaner-qr.component.html`
- **Lógica:** 
  - Integrar una librería de escaneo QR (ej. `@zxing/ngx-scanner` o `html5-qrcode`).
  - Habilitar acceso a la cámara web o del dispositivo móvil del encargado.
  - Al detectar el código, enviar el string automáticamente al endpoint `POST /api/v1/reservas/escanear-qr`.
- **Manejo de Errores:** Mostrar mensaje claro si el QR es inválido, si ya fue atendido, o si corresponde a otra sucursal.
- **Flujo Alternativo:** Proveer un campo de texto para que el encargado pueda ingresar el código alfanumérico manualmente en caso de que la cámara falle.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU12, se deben cumplir las siguientes pruebas de caja negra:
1. **Listado Correcto:** Un Encargado de la Sucursal A inicia sesión y solo ve reservas de la Sucursal A correspondientes al día de hoy.
2. **Actualización de Estado:** El encargado marca una reserva como `PREPARADA`. Al refrescar la página, el cambio persiste.
3. **Escaneo Exitoso:** El encargado escanea un QR válido. El sistema muestra un mensaje de éxito ("¡Cliente Validado!"), muestra las prendas a entregar en el probador y la reserva pasa a estado `ATENDIDA`.
4. **Validación Antifraude:** El encargado escanea un QR que pertenece a la Sucursal B. El sistema arroja error `403 Forbidden` e indica "El código pertenece a otra sucursal".
