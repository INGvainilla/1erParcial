---
name: Implementación de CU17 - Gestionar Tipos y Medios de Cobro
description: Instrucciones detalladas para implementar el Caso de Uso 17 (Frontend en Angular y Backend en FastAPI), asumiendo que la base de datos ya está implementada.
---

# Skill: Implementación de CU17 (Gestionar Tipos y Medios de Cobro)

Esta guía define los pasos exactos y requerimientos para que un desarrollador o agente de IA codifique el **Caso de Uso 17: Gestionar Tipos y Medios de Cobro**. 

**PRECONDICIÓN IMPORTANTE:** Se asume que existe una tabla de configuraciones o `metodos_pago` en la base de datos que permite almacenar el estado (Activo/Inactivo) y parámetros (Tokens, API Keys) de cada medio de cobro.

---

## 1. Contexto del Caso de Uso (CU17)

- **Actor:** Administrador General.
- **Objetivo:** Activar, desactivar y parametrizar los diferentes canales por los cuales la empresa recauda dinero (Efectivo en Caja, Terminales POS, Stripe/PayPal online y Códigos QR interoperables del BCB).
- **Flujo:** 
  1. El Administrador accede al panel de Configuración de Pagos.
  2. Visualiza el estado actual de todos los métodos habilitados.
  3. Puede encender/apagar métodos (Ej. Apagar pagos con Tarjeta temporalmente por mantenimiento).
  4. Puede actualizar las credenciales (API Keys, Secretos) requeridas para la pasarela electrónica o integradores de QR (Libélula, Multipago, etc.).

---

## 2. Implementación Backend (FastAPI - Python)

### 2.1 Modelos Pydantic (Schemas)
Crear en `schemas/pago_config.py`:
- `MetodoPagoUpdate`: Recibe `estado` (boolean) y `credenciales` (diccionario o JSON con las llaves, si aplica).
- `MetodoPagoResponse`: Devuelve `id`, `nombre`, `tipo` (Fisico/Digital), `estado` y una versión enmascarada de las credenciales (ej. `sk_test_***1234`).

### 2.2 Capa de Servicio / Lógica de Negocio (`services/pago_config_service.py`)
Implementar:
1. **Listar Métodos:** Devolver todos los métodos de pago registrados en la DB. Para seguridad, enmascarar contraseñas/secrets antes de enviarlos al Frontend.
2. **Actualizar Método:** 
   - Cambiar el estado (Activo/Inactivo).
   - Si se reciben nuevas credenciales, **encriptarlas** o guardarlas de manera segura antes de persistirlas en la BD (nunca guardar tokens en texto plano si son sensibles, o depender del `.env` si la arquitectura lo dicta; aunque una arquitectura multi-tenant los guardaría cifrados en BD).

### 2.3 Controladores / Routers (`routers/config_pagos.py`)
Crear los endpoints (Asociados al token JWT del rol `ADMINISTRADOR`):
- **GET** `/api/v1/configuracion/pagos`: Lista de métodos y estados.
- **PATCH** `/api/v1/configuracion/pagos/{id_metodo}`: Actualiza un método específico.

---

## 3. Implementación Frontend (Angular 17+)

### 3.1 Panel Administrativo (Configuración)
- **Vista principal:** `admin-pagos-config.component.html`
- **Diseño UI (Premium):** 
  - Usar un diseño de tarjetas (Cards) iterables. Una tarjeta para "Efectivo", otra para "Tarjeta (Física)", otra para "Stripe/PayPal (Online)", y otra para "QR Interoperable".
  - Usar un **Toggle Switch** (Interruptor tipo iOS/Material) grande y claro para Activar/Desactivar.
  - Al lado o debajo, un botón de ⚙️ Configurar (si el método requiere API Keys).

### 3.2 Modal de Parametrización
- Al hacer clic en ⚙️ Configurar (Ej. para Stripe):
  - Abrir un modal con un formulario reactivo.
  - Campos: `Public Key`, `Secret Key`, `Webhook Secret`.
  - Los campos deben comportarse como tipo `password` por defecto, con un icono de 👁️ (ojo) para revelar el texto si el admin lo desea editar.

### 3.3 Interacción con el API
- **Servicio:** `pago-config.service.ts`.
- Al cambiar el Toggle Switch, realizar inmediatamente la petición `PATCH` al backend. Mostrar un mensaje flotante (Toast) confirmando que "El método ha sido actualizado".
- Si el backend rechaza, devolver el Toggle visualmente a su estado original.

---

## 4. Criterios de Aceptación (Testing)

Para dar por terminado este CU17, se deben cumplir las siguientes pruebas de caja fuerte (Admin):
1. **Encender/Apagar:** El administrador desactiva el pago con "Stripe (Online)". Al intentar hacer un checkout web (como Cliente en el CU14/CU16), el sistema no debe mostrar la opción de tarjeta de crédito/débito.
2. **Encriptación visual:** Al cargar la pantalla de configuración, las llaves secretas existentes (como el `Secret Key` de Stripe) se deben mostrar enmascaradas (ej. `************************A3f`).
3. **Persistencia:** Si el administrador cambia una llave API y guarda, el backend la actualiza correctamente y los pagos subsiguientes (CU16) utilizan la nueva llave sin necesidad de reiniciar el servidor.
