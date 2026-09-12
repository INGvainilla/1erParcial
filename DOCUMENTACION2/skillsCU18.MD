---
name: Implementación de CU18 - Gestionar Despacho y Logística de Delivery
description: Instrucciones detalladas para implementar el Caso de Uso 18 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU18 (Gestionar Despacho y Logística de Delivery)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 18: Gestionar Despacho y Logística de Delivery**. 

**PRECONDICIÓN IMPORTANTE:** Las órdenes de venta (CU14) con modalidad `DELIVERY` ya existen en la base de datos, con el estado de pago en `PAGADO` (CU16). Se asume que las sucursales y las direcciones de clientes cuentan con coordenadas geográficas (Latitud, Longitud).

---

## 1. Contexto del Caso de Uso (CU18)

- **Actores:** Personal de Logística, Empresa de Delivery (Repartidor).
- **Objetivo:** Orquestar el ciclo de vida completo de un envío a domicilio, desde el cálculo inicial del costo, el empaquetado, la asignación a un repartidor, hasta la entrega final al cliente.
- **Flujo Central:** 
  1. (Durante Checkout) El sistema calcula la tarifa usando la fórmula de Haversine.
  2. Logística visualiza las órdenes pagadas y las empaca (`LISTO_DESPACHO`).
  3. Logística asigna la orden a un repartidor.
  4. El repartidor la recoge (`EN_TRANSITO`).
  5. El repartidor confirma la entrega en destino (`ENTREGADA`).

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Utilidades Geográficas (`utils/geo.py`)
Implementar la **Fórmula de Haversine** en Python pura para calcular distancias en línea recta entre dos coordenadas GPS (Lat/Lon):
```python
import math
def calcular_distancia_haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Radio de la Tierra en Km
    # ... (Convertir a radianes y aplicar fórmula) ...
    return distancia_en_km
```

### 2.2 Modelos Pydantic (Schemas)
Crear en `schemas/logistica.py`:
- `AsignarRepartidorRequest`: Recibe `id_orden` y `id_repartidor`.
- `CambioEstadoLogistica`: Recibe el nuevo estado (enum: `PREPARACION`, `LISTO_DESPACHO`, `EN_TRANSITO`, `ENTREGADA`).

### 2.3 Capa de Servicio / Lógica de Negocio (`services/logistica_service.py`)
1. **Listar Órdenes para Delivery:** Retornar todas las órdenes donde `modalidad_entrega == 'DELIVERY'` y `estado_pago == 'PAGADO'`.
2. **Máquina de Estados de Logística:** Crear una función estricta que actualice el campo `estado_logistica` en la tabla `ordenes_venta`. Solo permitir transiciones lógicas (ej. No se puede pasar de `CREADA` a `ENTREGADA` saltándose `EN_TRANSITO`).
3. **Asignación:** Guardar el identificador del repartidor asignado a la orden (puede requerir añadir una columna `id_repartidor` a `ordenes_venta` o crear una tabla intermedia).

### 2.4 Controladores / Routers (`routers/logistica.py`)
- **GET** `/api/v1/logistica/ordenes`: Retorna órdenes pendientes de despacho. (Requiere JWT `LOGISTICA`).
- **POST** `/api/v1/logistica/ordenes/{id_orden}/asignar`: Asigna a un repartidor.
- **PATCH** `/api/v1/logistica/ordenes/{id_orden}/estado`: Avanza el estado del envío. (Usado por Logística y por el Repartidor/Empresa Externa).

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Tablero de Despachos (Dashboard)
- **Vista principal:** `logistica-dashboard.component.html`
- **Diseño UI (Premium):** 
  - Usar un **Tablero Kanban** (drag and drop con `@angular/cdk/drag-drop`).
  - Columnas: "Por Empacar", "Listas para Despacho", "En Tránsito".
  - Cada tarjeta debe mostrar: ID Orden, Ciudad/Zona destino, Distancia estimada (Km), y botón para expandir detalles (prendas a empacar).

### 3.2 Modal de Asignación de Repartidor
- Al mover una tarjeta de "Listas para Despacho" hacia "En Tránsito" (o al presionar un botón "Asignar"):
  - Abrir un cuadro de diálogo listando los repartidores disponibles (o agencias de courier).
  - Al seleccionar uno, disparar el endpoint `POST /asignar`.

### 3.3 Vista del Cliente (Tracking)
- **Vista:** `tracking.component.html` (En el portal de Cliente).
- **Diseño:** Mostrar una barra de progreso visual (Stepper horizontal) con iconos de check: 
  `Pagado ✓` ---> `Empacando ✓` ---> `En Camino (Moto en movimiento)` ---> `Entregado`.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU18, se deben cumplir las siguientes pruebas de caja negra:
1. **Cálculo Haversine:** Crear una orden de prueba usando la Lat/Lon de la Tienda A y la Lat/Lon de una casa a 5 km de distancia. El backend debe calcular ~5km y aplicarle el costo por kilómetro parametrizado.
2. **Drag & Drop Kanban:** El operador de logística debe poder arrastrar una orden visualmente a la columna "Listo para despacho", lo cual debe invocar al backend y guardar el estado sin refrescar la página.
3. **Transición Estricta:** Si alguien intenta llamar al API para cambiar el estado de `CREADA` directamente a `ENTREGADA`, el sistema debe devolver un error HTTP `409 Conflict` (State transition not allowed).
4. **Visibilidad del Cliente:** Al cambiar el estado a `EN_TRANSITO` en logística, el cliente (si está en la vista de Tracking) debe ver el cambio reflejado en su barra de estado (idealmente usando Server Sent Events, WebSockets, o short-polling).
