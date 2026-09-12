---
name: Implementación de CU14 - Procesar Compra Digital y Checkout
description: Instrucciones detalladas para implementar el Caso de Uso 14 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU14 (Procesar Compra Digital y Checkout)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 14: Procesar Compra Digital y Checkout**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que el carrito de compras (CU13) ya está completamente funcional y que las tablas `ordenes_venta` y `ordenes_detalle` existen en la base de datos PostgreSQL.

---

## 1. Contexto del Caso de Uso (CU14)

- **Actor:** Cliente (Autenticado).
- **Objetivo:** Formalizar la intención de compra trasladando los ítems del carrito a una "Orden de Venta", definiendo la logística de entrega y los datos de facturación.
- **Flujo:** 
  1. El cliente inicia el proceso de Checkout desde el Carrito.
  2. Selecciona la Modalidad de Entrega (Retiro en Tienda o Delivery).
  3. Ingresa datos de Facturación (NIT / Carnet y Nombre).
  4. Confirma la orden.
  5. El sistema genera la Orden de Venta en estado `PENDIENTE_PAGO` y vacía el carrito.

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Modelos Pydantic (Schemas)
Crear en `schemas/orden.py`:
- `OrdenCreateRequest`: Recibe `modalidad_entrega` (enum: 'DELIVERY', 'RETIRO_TIENDA'), `id_sucursal` (si es retiro), `direccion_envio` (si es delivery), y datos de facturación (`nit`, `razon_social`).
- `OrdenResponse`: Devuelve todos los datos de la orden generada, incluyendo el `id_orden`, `subtotal`, `costo_envio` y `total` a cobrar.

### 2.2 Capa de Servicio / Lógica de Negocio (`services/orden_service.py`)
Implementar la función principal `crear_orden_desde_carrito`:
1. **Recuperar Carrito:** Obtener todos los ítems actuales del carrito del usuario. Si está vacío, lanzar error.
2. **Validación de Stock (Doble Check):** Volver a verificar atómicamente que exista stock físico real para cubrir toda la orden (previniendo concurrencia).
3. **Cálculo de Envíos:** Si la modalidad es `DELIVERY`, invocar temporalmente a la lógica de tarifas (o establecer tarifa base) para sumar el `costo_envio` al `subtotal`. Si es `RETIRO_TIENDA`, `costo_envio = 0`.
4. **Inserción Transaccional:** 
   - Crear el registro padre en la tabla `ordenes_venta`.
   - Iterar el carrito e insertar cada producto en `ordenes_detalle`.
   - **Crucial:** Eliminar (vaciar) todos los ítems del carrito de ese usuario.
5. **Retorno:** Devolver el `id_orden` generado y cambiar su estado de pago inicial a `PENDIENTE`.

### 2.3 Controladores / Routers (`routers/ordenes.py`)
Crear el endpoint principal:
- **POST** `/api/v1/ordenes/checkout`: Transforma el carrito del usuario logueado (JWT) en una Orden de Venta.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Manejo del Flujo de Checkout
- **Vista principal:** `checkout.component.html`
- **Diseño UI (Premium):** 
  - Utilizar un componente **Stepper** o Wizard (ej. Angular Material Stepper) que divida el proceso visualmente para no abrumar al usuario.
  - El diseño a la derecha (o en sidebar) debe mostrar persistentemente el "Resumen del Pedido" (ítems, subtotal, costo de envío y Total).

### 3.2 Pasos del Stepper
1. **Paso 1: Entrega:** 
   - *Radio buttons* grandes para elegir "Retiro en Tienda" o "Envío a Domicilio".
   - Si elige tienda: Mostrar un selector visual (Dropdown) con las sucursales disponibles.
   - Si elige envío: Mostrar formulario para ingresar la dirección de entrega (o seleccionar una guardada).
2. **Paso 2: Facturación:** 
   - Formulario simple: `NIT/CI` y `Razón Social / Nombre`.
3. **Paso 3: Confirmación:** 
   - Resumen visual completo.
   - Botón principal de CTA (Call to Action): **"Confirmar y Proceder al Pago"**.

### 3.3 Lógica Angular (`checkout.service.ts`)
- Al presionar el CTA, el componente compila los datos del Stepper y envía la petición HTTP POST.
- Si el backend responde `201 Created` (Éxito), se captura el `id_orden` retornado.
- Inmediatamente usar el Router de Angular para redirigir al usuario al módulo de pagos (CU16): `router.navigate(['/pagos', id_orden])`.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU14, se deben cumplir las siguientes pruebas de caja negra:
1. **Carrito Vacío:** Si el cliente intenta ir a la URL de checkout sin tener ítems en el carrito, el sistema (Guardia de rutas o backend) lo debe redirigir al catálogo con un error "Tu carrito está vacío".
2. **Creación Exitosa:** Al completar los datos y elegir Retiro en Tienda, la orden se guarda en BD, el `costo_envio` es `0.00`, y el carrito del usuario se vacía (se borran sus ítems de la BD/Sesión).
3. **Persistencia Transaccional:** Se debe comprobar que si al guardar la orden ocurre un error (ej. se cae la BD al insertar el detalle 3), no se cree una orden "huérfana" ni se vacíe el carrito prematuramente. (Probar Rollbacks).
