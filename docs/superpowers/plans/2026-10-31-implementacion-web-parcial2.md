# Plan de Implementación Web y Pruebas E2E — FashionStore SaaS Parcial 2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar y validar integralmente en el código la plataforma Web (Frontend Angular PWA + Backend FastAPI) para los 20 casos de uso nucleares (CU01 al CU20), asegurando tanto la validación interna (tests unitarios/integración en backend con pytest) como la validación visual y funcional en la interfaz de usuario en base a los diagramas de secuencia ICONIX.

**Architecture:** Arquitectura limpia desacoplada en 3 capas (Boundary `UI_`, Control `CTR_`, Entity `CE_`). Backend FastAPI con base de datos compartida y aislamiento lógico por `tenant_id`, motor de inmutabilidad de Kardex (CPP), endpoint de sincronización idempotente con UUID v4 (`X-Idempotency-Key`), pasarela Stripe Sandbox y parser seguro de SQL para IA. Frontend Angular 22 modular con persistencia offline en IndexedDB, guards RBAC multitenant y componentes responsivos para terminal POS y consola gerencial.

**Tech Stack:** 
- Backend: Python 3.13, FastAPI 0.115, SQLAlchemy, PostgreSQL 15 / SQLite, Pytest, Pydantic v2.
- Frontend: Angular 22, TypeScript 5.4, RxJS, IndexedDB (Dexie/API nativa), CSS3/Tailwind, Stripe JS.
- Especificación: [`documentacion/documento_parcial2.md`](file:///c:/Users/User/Documents/2-2026/SI2/1erParcial/documentacion/documento_parcial2.md) (Diagramas de secuencia en líneas 3947–4986; Fichas de prueba de aceptación en líneas 10560–11075).

## Global Constraints

- Aislamiento estricto multitenant: ninguna consulta o mutación puede operar sin `tenant_id` validado en sesión o JWT.
- Regla inmutable de Kardex: la tabla `movimientos_kardex` opera en modo append-only; el Costo Promedio Ponderado (CPP) se calcula con fórmula matemática exacta con 2 decimales.
- Circuito de postventa en 2 tiempos: Nota de Devolución obligatoria (reingreso a costo histórico dentro de 7 días hábiles) seguida de Nota de Cambio y liquidación de diferencial.
- Resiliencia offline e idempotencia: toda transacción offline genera UUID v4 inmutable en el cliente y se sincroniza con cabecera `X-Idempotency-Key`.
- Restricción Web Desktop (CU20): acceso exclusivo a compras/aprovisionamiento desde pantallas >= 768px y User-Agent no móvil.

## Review Focus

1. **Fuga multitenant:** Un usuario autenticado con tenant A intenta consultar productos o emitir ventas con `sucursal_id` del tenant B (debe retornar 403 Forbidden o 404).
2. **Sobreventa en contingencia offline:** Múltiples ventas del mismo ítem en modo offline que superen el stock real al sincronizar (el backend resuelve confirmando por orden de llegada y notificando discrepancia sin colapsar la base de datos).
3. **Idempotencia repetida:** El cajero envía 3 veces la misma venta offline con idéntico UUID v4 ante una red inestable (el backend responde 200 OK idempotente sin duplicar filas en `ventas` ni en `movimientos_kardex`).
4. **Devolución fuera de plazo:** Intento de cambio de prenda pasados los 7 días hábiles (el validador de negocio rechaza la emisión con error HTTP 422).
5. **Intento móvil en aprovisionamiento:** Acceso a `/compras/nuevo` simulando dispositivo móvil (FastAPI y Angular interceptan y bloquean con HTTP 403 y pantalla de advertencia).

---

## Tareas de Implementación y Validación

### Task 1: Gobernanza SaaS Multitenant y Seguridad (CU01, CU02, CU03, CU04, CU05)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/p01_seguridad_acceso/tenants/router.py`
  - `prototipo/backend/app/modules/p01_seguridad_acceso/tenants/service.py`
  - `prototipo/backend/app/modules/p01_seguridad_acceso/auth/router.py`
  - `prototipo/backend/tests/test_cu01_cu05_saas.py`
- Frontend:
  - `prototipo/web/src/app/pages/p01_seguridad_acceso/tenants/tenants.component.ts`
  - `prototipo/web/src/app/pages/p01_seguridad_acceso/tenants/tenants.component.html`
  - `prototipo/web/src/app/pages/p01_seguridad_acceso/login/login.component.ts`
  - `prototipo/web/src/app/pages/p01_seguridad_acceso/usuarios/usuarios.component.ts`

**Interfaces:**
- Consume: `POST /api/auth/login`, `GET /api/tenants`, `POST /api/tenants`, `POST /api/tenants/{id}/renovar`.
- Produce: Tokens JWT con claims `{tenant_id, sub, rol, exp}`, control de límites de plan y estado de suscripción.

- [ ] **Paso 1.1: Escribir test backend para ciclo SaaS (CU01 al CU05)**
  Crear `tests/test_cu01_cu05_saas.py` verificando creación de tenant, planes, bloqueo por suscripción vencida y gestión de usuarios RBAC.
- [ ] **Paso 1.2: Ejecutar test backend y validar comportamiento**
  Comando: `python -m pytest tests/test_cu01_cu05_saas.py -v`.
- [ ] **Paso 1.3: Refinar vista frontend de Tenants y Planes (CU01, CU02, CU03)**
  Asegurar que la pantalla `tenants.component.html` renderice la tabla de empresas, modal de alta de tenant con validación de NIT, selector de plan y modal de renovación.
- [ ] **Paso 1.4: Refinar vista de Login y Usuarios (CU04, CU05)**
  Garantizar mensaje visual claro ante cuenta suspendida o plan vencido y tabla de usuarios con cupo de sucursales.

---

### Task 2: Catálogo Textil Paramétrico y Kardex CPP Inmutable (CU06, CU07)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/p03_catalogo_estilismo_ia/catalogo/router.py`
  - `prototipo/backend/app/modules/p05_inventario_costos_analitica/inventario/service.py`
  - `prototipo/backend/app/modules/p05_inventario_costos_analitica/inventario/router.py`
  - `prototipo/backend/tests/test_cu06_cu07_kardex_cpp.py`
- Frontend:
  - `prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/productos/productos.component.ts`
  - `prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/productos/productos.component.html`
  - `prototipo/web/src/app/pages/p05_inventario_costos_analitica/inventario/inventario.component.ts`

**Interfaces:**
- Consume: `POST /api/productos`, `POST /api/inventario/movimientos`, `GET /api/inventario/kardex/{variante_id}`.
- Produce: Registro inmutable en `movimientos_kardex`, recálculo matemático de CPP con 2 decimales y generación de SKU por talla/color.

- [ ] **Paso 2.1: Escribir test de propiedades para CPP inmutable y fichas textiles**
  Verificar que entradas sucesivas calculen exactamente el promedio ponderado y que intentos de modificación fallen.
- [ ] **Paso 2.2: Ejecutar test backend**
  Comando: `python -m pytest tests/test_cu06_cu07_kardex_cpp.py -v`.
- [ ] **Paso 2.3: Ajustar formulario de Ficha Técnica Textil en Frontend (CU06)**
  Visualización de medidas en cm (pecho, cintura, largo), paleta hexadecimal y generación de variantes.
- [ ] **Paso 2.4: Ajustar vista de Kardex e Inventarios Multi-Sucursal (CU07)**
  Tabla de movimientos de kardex con saldo físico, costo unitario y saldo valorado en bolivianos.

---

### Task 3: Terminal POS Offline-First e Idempotencia UUID v4 (CU08, CU09, CU10, CU11, CU12)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/pos/sync_router.py`
  - `prototipo/backend/tests/test_cu08_cu12_offline_sync.py`
- Frontend:
  - `prototipo/web/src/app/core/services/offline-storage.service.ts`
  - `prototipo/web/src/app/pages/p08_punto_venta_pos/pos/pos-terminal.component.ts`
  - `prototipo/web/src/app/pages/p08_punto_venta_pos/pos/pos-terminal.component.html`
  - `prototipo/web/src/app/pages/p06_reservas_presenciales/reservas/reserva-crear/reserva-crear.ts`

**Interfaces:**
- Consume: `GET /api/sync/catalogo-offline`, `POST /api/sync/operacion` con cabecera `X-Idempotency-Key`.
- Produce: Almacenamiento local IndexedDB de catálogo, generación de UUID v4 en ventas/reservas desconectadas y purga de cola al sincronizar.

- [ ] **Paso 3.1: Escribir tests de sincronización idempotente con UUID v4**
  Comprobar que ante peticiones duplicadas el backend retorne el mismo resultado sin registrar dos ventas.
- [ ] **Paso 3.2: Ejecutar test backend**
  Comando: `python -m pytest tests/test_cu08_cu12_offline_sync.py -v`.
- [ ] **Paso 3.3: Implementar/actualizar OfflineStorageService en Angular**
  Soporte para almacenar en IndexedDB: catálogo, stock local y cola de `operaciones_offline`.
- [ ] **Paso 3.4: Adaptar PosTerminalComponent para modo desconectado**
  Indicador visual "Modo Offline Activo", cobro en efectivo, asignación de UUID e impresión de comprobante de contingencia.
- [ ] **Paso 3.5: Bandeja de Operaciones Locales Pendientes (CU11) y botón de sincronización masiva (CU12)**

---

### Task 4: Postventa y Pasarela Stripe: Cambio en Dos Tiempos (CU13, CU18)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/pos/cambios_router.py`
  - `prototipo/backend/app/modules/p09_procesamiento_pagos/pagos/router.py`
  - `prototipo/backend/tests/test_cu13_cu18_postventa_stripe.py`
- Frontend:
  - `prototipo/web/src/app/pages/p08_punto_venta_pos/cambios/cambio-prenda.component.ts`
  - `prototipo/web/src/app/pages/p08_punto_venta_pos/cambios/cambio-prenda.component.html`
  - `prototipo/web/src/app/pages/p09_procesamiento_pagos/pagos/pago-orden.component.ts`

**Interfaces:**
- Consume: `POST /api/cambios/iniciar`, `POST /api/cambios/despacho`, `POST /api/pagos/crear-intent`.
- Produce: Nota de Devolución (+stock al CPP original de venta), Nota de Cambio (-stock) y PaymentIntent Stripe.

- [ ] **Paso 4.1: Test de validación de 7 días hábiles y flujo secuencial de 2 notas**
  Asegurar que el sistema rechace devoluciones después del día 7 y registre el reingreso al costo histórico.
- [ ] **Paso 4.2: Ejecutar test backend**
  Comando: `python -m pytest tests/test_cu13_cu18_postventa_stripe.py -v`.
- [ ] **Paso 4.3: Vista interactiva de Cambio de Prenda en Frontend (CU13)**
  Búsqueda de factura original, selección de prenda a devolver, selección de nueva prenda, cálculo automático del saldo diferencial y cobro en pasarela Stripe Sandbox (CU18).

---

### Task 5: Traspasos Inter-Sucursal y Compras Exclusivas Web Desktop (CU14, CU20)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/p05_inventario_costos_analitica/traspasos/router.py`
  - `prototipo/backend/app/modules/p04_aprovisionamiento_proveedores/proveedores/router.py`
  - `prototipo/backend/tests/test_cu14_cu20_traspasos_compras.py`
- Frontend:
  - `prototipo/web/src/app/pages/p05_inventario_costos_analitica/traspasos/traspasos.component.ts`
  - `prototipo/web/src/app/pages/p04_aprovisionamiento_proveedores/proveedores/proveedores.component.ts`
  - `prototipo/web/src/app/core/guards/desktop-only.guard.ts`

**Interfaces:**
- Consume: `POST /api/traspasos`, `PUT /api/traspasos/{id}/recibir`, `POST /api/compras`.
- Produce: Manejo de stock "En Tránsito", middleware de bloqueo User-Agent/ancho de pantalla < 768px.

- [ ] **Paso 5.1: Test de middleware de detección de dispositivo móvil para compras (CU20)**
  Comprobar respuesta 403 ante User-Agent móvil en aprovisionamiento.
- [ ] **Paso 5.2: Test de ciclo de traspaso inter-sucursal (CU14)**
  Comprobar descuento en origen, retención en tránsito y alta en destino.
- [ ] **Paso 5.3: Implementar DesktopOnlyGuard en Angular y formulario de compras**
  Bloquear la ruta en clientes móviles y habilitar la interfaz completa en pantallas de escritorio.
- [ ] **Paso 5.4: Interfaz de Traspasos Inter-Sucursales en Frontend**
  Seguimiento de guías de remisión y botón de confirmación de recepción física.

---

### Task 6: Analítica, Liquidación Estacional/Mayorista y Reportes con IA (CU15, CU16, CU17, CU19)

**Archivos:**
- Backend:
  - `prototipo/backend/app/modules/p05_inventario_costos_analitica/dashboard/router.py`
  - `prototipo/backend/app/modules/p03_catalogo_estilismo_ia/asistente_ia/router.py`
  - `prototipo/backend/tests/test_cu15_cu19_analitica_ia.py`
- Frontend:
  - `prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/asistente-ia/asistente-ia.component.ts`
  - `prototipo/web/src/app/pages/p05_inventario_costos_analitica/dashboard/dashboard.component.ts`
  - `prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/catalogo/catalogo.component.ts`

**Interfaces:**
- Consume: `POST /api/reportes-ia/query`, `GET /api/ml/prevision`, `GET /api/reportes/exportar/{formato}`.
- Produce: SQL AST sanitizado con filtro `tenant_id`, cálculo automático de tarifa mayorista (>=3 unidades) y archivos XLSX/PDF.

- [ ] **Paso 6.1: Test de seguridad AST para consultas de IA y cálculo mayorista**
  Validar que prompts destructivos se neutralicen y que pedidos >= 3 unidades apliquen tarifa bonificada.
- [ ] **Paso 6.2: Ejecutar test backend**
  Comando: `python -m pytest tests/test_cu15_cu19_analitica_ia.py -v`.
- [ ] **Paso 6.3: Componente de Asistente de Reportes con IA (CU15)**
  Entrada de texto en lenguaje natural y renderizado de gráficos de barras dinámicos.
- [ ] **Paso 6.4: Exportación de Reportes a Excel y PDF (CU16)**
  Botones de descarga y formateo de tablas contables.
- [ ] **Paso 6.5: Dashboard Predictivo con Machine Learning (CU17)**
  Visualización de tendencias estacionales y proyección a 6 meses.
- [ ] **Paso 6.6: Carrito de Compras con descuentos de liquidación y tarifa mayorista (CU19)**

---

### Task 7: Verificación Integral End-to-End y Suite de Pruebas de Aceptación

**Archivos:**
- `prototipo/backend/tests/test_acceptance_all_20_cus.py`
- `prototipo/web/src/app/pages/**`

- [ ] **Paso 7.1: Ejecutar la suite completa de pruebas en backend**
  Verificar que todos los tests pasen al 100%:
  `python -m pytest prototipo/backend/tests/ -v`.
- [ ] **Paso 7.2: Compilar el frontend Angular en modo producción**
  `cd prototipo/web && npm run build`.
- [ ] **Paso 7.3: Iniciar el servidor backend y el servidor web para validación en vivo**
  Verificar la disponibilidad en navegador y corroborar la correspondencia visual con los mockups generados en `diagramas/imagenes_pruebas/`.

