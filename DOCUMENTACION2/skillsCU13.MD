---
name: Implementación de CU13 - Administrar Carrito de Compras Omnicanal
description: Instrucciones detalladas para implementar el Caso de Uso 13 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU13 (Administrar Carrito de Compras Omnicanal)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 13: Administrar Carrito de Compras Omnicanal**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que el esquema de base de datos de productos e inventarios (Ciclo 1) está implementado. El carrito puede persistirse en base de datos (tabla `carritos` o `sesiones`) o manejarse en memoria temporal / Redis dependiendo de la arquitectura de sesión elegida.

---

## 1. Contexto del Caso de Uso (CU13)

- **Actor:** Cliente (Autenticado o Invitado, preferiblemente autenticado).
- **Objetivo:** Permitir al cliente agregar productos de interés, modificar cantidades y ver el cálculo dinámico de subtotales y totales antes de proceder al pago.
- **Flujo:** 
  1. El cliente navega por el catálogo y presiona "Agregar al Carrito".
  2. El sistema valida stock global disponible de la prenda elegida (talla/color).
  3. El cliente abre el carrito para revisar o cambiar cantidades.
  4. El sistema recalcula totales automáticamente considerando precios unitarios (CPP o Precio de Venta fijado).

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Dependencias Requeridas
No se requieren dependencias externas adicionales, más allá de la conexión a DB. Si se opta por almacenamiento temporal de carritos, se puede requerir `redis`.

### 2.2 Modelos Pydantic (Schemas)
Crear/actualizar en `schemas/carrito.py`:
- `CarritoItemAdd`: Recibe `id_producto`, `talla`, `color` y `cantidad`.
- `CarritoItemUpdate`: Recibe la nueva `cantidad`.
- `CarritoResponse`: Devuelve la lista de ítems detallados (con nombre, imagen, precio_unitario, subtotal) y el `total_general`.

### 2.3 Capa de Servicio / Lógica de Negocio (`services/carrito_service.py`)
Implementar las siguientes funciones:
1. **Validación Atómica de Existencias:** Antes de añadir o sumar cantidad a un ítem, verificar que la sumatoria del stock en *todas las sucursales* o en el *almacén central* (dependiendo de la regla de negocio para envíos) sea mayor o igual a la cantidad solicitada.
2. **Agregar/Quitar Ítems:** Función para añadir un producto al carrito del usuario (o crear el carrito si no existe).
3. **Cálculo de Totales:** Recalcular dinámicamente `subtotal = precio_unitario * cantidad` para cada ítem y la sumatoria global del carrito cada vez que haya un cambio.

### 2.4 Controladores / Routers (`routers/carritos.py`)
Crear los endpoints (Asociados al token JWT del `CLIENTE`):
- **GET** `/api/v1/carrito`: Retorna el estado actual del carrito y totales.
- **POST** `/api/v1/carrito/items`: Añade un nuevo producto. (Retorna 400 si no hay stock).
- **PATCH** `/api/v1/carrito/items/{id_item}`: Actualiza la cantidad de un ítem existente.
- **DELETE** `/api/v1/carrito/items/{id_item}`: Remueve un producto del carrito.
- **DELETE** `/api/v1/carrito`: Vacía completamente el carrito.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Manejo de Estado (State Management)
- **Servicio:** `carrito.service.ts`
- **Técnica:** Utilizar `BehaviorSubject` o **Signals** (Angular 17+) para mantener el estado reactivo del carrito en toda la aplicación. El contador del carrito en el navbar (ej. 🛒 (3)) debe actualizarse automáticamente.

### 3.2 Componente Carrito Lateral (Offcanvas / Sidebar)
- **Vista:** `carrito-sidebar.component.html`
- **Diseño UI (Premium):** 
  - Un panel lateral deslizable (drawer) de diseño limpio.
  - Lista de productos con pequeña miniatura de la prenda, nombre, talla elegida y color.
  - Controles de cantidad: Botones `[ - ] [ 1 ] [ + ]`.
  - Animaciones suaves (transiciones CSS) al añadir o remover un ítem.
  - Botón principal de llamada a la acción (CTA): "Ir al Checkout / Proceder al Pago".

### 3.3 Validaciones en Tiempo Real
- Al presionar `[ + ]`, hacer la petición `PATCH` al backend. Si el backend retorna error de stock, mostrar la advertencia y devolver el contador visual al valor anterior.
- Mostrar indicador de carga (spinner miniatura) en los botones de cantidad mientras el backend recalcula los totales.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU13, se deben cumplir las siguientes pruebas de caja negra:
1. **Adición Simple:** El cliente agrega un producto al carrito, el contador del navbar sube a 1, y el panel lateral muestra el ítem con el subtotal correcto.
2. **Límite de Stock:** Un cliente intenta agregar 5 unidades de un pantalón del cual solo quedan 3 en la base de datos. El sistema bloquea el aumento en la 4ta unidad y muestra un mensaje ("Stock máximo alcanzado").
3. **Persistencia (Si aplica):** El cliente agrega ítems, cierra la pestaña del navegador, vuelve a entrar, y su carrito recupera los productos (ya sea vía BD o LocalStorage/Session).
4. **Borrado y Cálculos:** El cliente elimina un producto; el total general se recalcula instantáneamente de forma correcta sin necesidad de recargar toda la página web.
