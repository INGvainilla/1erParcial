---
name: Implementación de CU16 - Procesar Pago con Pasarela Electrónica
description: Instrucciones detalladas para implementar el Caso de Uso 16 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU16 (Procesar Pago con Pasarela Electrónica)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 16: Procesar Pago con Pasarela Electrónica (Ej. Stripe / PayPal)**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que la orden de venta ya ha sido generada en BD (CU14 completado) y se encuentra en estado `PENDIENTE_PAGO`. Además, se deben tener credenciales (API Keys) de prueba/sandbox configuradas en las variables de entorno (`.env`).

---

## 1. Contexto del Caso de Uso (CU16)

- **Actores:** Cliente (quien paga), Pasarela Externa (Stripe/PayPal, quien procesa).
- **Objetivo:** Efectuar el cobro digital de una orden de venta de manera segura, sin almacenar los números de tarjeta en nuestra base de datos, cumpliendo con los estándares PCI y confirmando el pago vía Webhook.
- **Flujo:** 
  1. El cliente entra a la pantalla de pago de su orden.
  2. Ingresa los datos de su tarjeta (o PayPal).
  3. El Frontend tokeniza los datos y los envía a Stripe/PayPal.
  4. La pasarela intenta el cobro (puede requerir verificación 3D Secure).
  5. La pasarela emite una notificación asíncrona (Webhook) al Backend.
  6. El Backend recibe el Webhook, marca la orden como `PAGADA` y actualiza la logística si corresponde.

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Dependencias Requeridas
Instalar el SDK de Stripe (o el elegido):
```bash
pip install stripe
```

### 2.2 Variables de Entorno (`.env`)
Asegurarse de cargar las siguientes variables (usando las credenciales proporcionadas para el entorno de prueba):
- `STRIPE_SECRET_KEY=sk_test_51UEsz81HD8WYieY54Eoz9aGdj05qbsEnEbLOISaxEf5TF2E6RWswKA3lsGO0Au0YVodJ0JOqbRElxv5GUlgwcYHY00LRGUdXFK`
- `STRIPE_WEBHOOK_SECRET` (Este valor se obtiene al crear el endpoint del webhook en el dashboard de Stripe)

### 2.3 Capa de Servicio / Lógica de Negocio (`services/pago_service.py`)
Implementar:
1. **Crear Intención de Pago (Payment Intent):**
   - Recibe el `id_orden`. Busca la orden en BD para obtener el `total` (Stripe requiere que el monto esté en centavos, multiplicar por 100).
   - Llama a `stripe.PaymentIntent.create()`.
   - Devuelve el `client_secret` necesario para que el Frontend complete el pago.
2. **Procesar Webhook Asíncrono:**
   - Función que recibe el evento crudo de Stripe.
   - Verifica la firma criptográfica usando `STRIPE_WEBHOOK_SECRET`.
   - Si el evento es `payment_intent.succeeded`, extraer el ID de la orden (pasado en los metadatos) y actualizar su estado a `PAGADO`. Generar el registro en la tabla `transacciones_pago`.

### 2.4 Controladores / Routers (`routers/pagos.py`)
Crear los endpoints:
- **POST** `/api/v1/pagos/intencion`: Recibe `{ "id_orden": X }`, protegido por JWT del Cliente. Devuelve el `client_secret`.
- **POST** `/api/v1/pagos/webhook/stripe`: Endpoint **público** (sin JWT) que recibe los webhooks. Debe leer el body crudo (`Request.body()`) para verificar la firma de Stripe.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Dependencias Requeridas
Instalar la librería oficial de Stripe para Angular/JS:
```bash
npm install @stripe/stripe-js
```

### 3.2 Componente de Pago (Checkout Integrado)
- **Vista:** `pago-orden.component.html`
- **Lógica (`pago-orden.component.ts`):** 
  1. Al cargar la ruta (`/pagos/:id_orden`), solicitar al backend la información de la orden y el `client_secret` llamando a `/api/v1/pagos/intencion`.
  2. Inicializar Stripe Elements inyectando la **llave pública de prueba**:
     `const stripe = await loadStripe('pk_test_51UEsz81HD8WYieY5OVqcN7AqDcwmlIpf9ClUu7VzfdPDigt5FgbaTPuk8cErY6ySu3CXc8U0r7SY2UINr0e3AMyg00LCwwrfgN');`
  3. Montar el elemento de tarjeta seguro (Stripe Card Element) en un `div` contenedor.

### 3.3 Procesamiento (Submit)
- Al presionar el botón "Pagar Total: $XX.XX":
  1. Mostrar un spinner/loader en todo el botón para evitar doble clic.
  2. Llamar a `stripe.confirmCardPayment(client_secret, { payment_method: ... })`.
  3. Stripe maneja internamente la verificación 3D Secure (pantalla emergente del banco si es requerida).
  4. Si la promesa retorna éxito, mostrar pantalla verde de "¡Pago Exitoso!" e invitar al usuario a ver sus pedidos.
  5. Si retorna error (ej. fondos insuficientes), mostrar el mensaje proporcionado por Stripe en un cuadro rojo.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU16, se deben cumplir las siguientes pruebas de caja negra:
1. **Cobro Exitoso:** Usar la tarjeta de prueba "4242 4242..." de Stripe. El pago debe ser exitoso en Frontend, y al mismo tiempo, el Backend debe recibir el webhook y actualizar la BD marcando la orden como `PAGADO`.
2. **Rechazo (Fondos Insuficientes):** Usar la tarjeta de prueba para "Fondos Insuficientes". El Frontend debe mostrar el error exacto y no debe actualizarse la orden en BD.
3. **Seguridad del Webhook:** Intentar enviar un POST falso a `/api/v1/pagos/webhook/stripe` usando Postman. El backend debe rechazarlo con un error `400 Bad Request` indicando "Invalid signature" (Firma inválida).
4. **Cero Datos Sensibles:** Comprobar en consola del Frontend y en registros del Backend que **jamás** transitan los 16 dígitos de la tarjeta ni el CVV por la red hacia nuestro backend (solo hacia los servidores de Stripe).
