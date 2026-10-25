# Plan de Implementación: Evolución FashionStore SaaS Multitenant, Offline-First e IA Generativa (Segundo Parcial)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolucionar el prototipo de FashionStore (desarrollado en el 1er Parcial bajo PUDS) hacia una plataforma funcional de software como servicio (**SaaS Multitenant**), dotada de resiliencia operativa **Offline-First** (PWA con IndexedDB en Web y SQLite en Móvil Flutter), motor de valuación de inventario con **Costo Promedio Ponderado (CPP)** inmutable, circuito de **cambios de prenda en dos tiempos**, compras exclusivas desde **Web Desktop**, y analítica avanzada con **Reportes Generativos en Lenguaje Natural** y Machine Learning, cubriendo formalmente los 20 Casos de Uso (CU01 al CU20) bajo la metodología **ICONIX**.

**Architecture:** Arquitectura limpia desacoplada en tres capas (Presentación, Negocio/Controladores BCE y Persistencia). El backend FastAPI maneja aislamiento lógico multitenant mediante `empresa_id` a nivel de fila y cola de sincronización transaccional idempotente. El frontend Web Angular opera como PWA instalable con Service Worker e IndexedDB local; la app móvil Flutter incorpora persistencia desconectada mediante SQLite relacional embebido.

**Tech Stack:** 
- Backend: Python 3.13, FastAPI 0.115, SQLAlchemy 2.0, PostgreSQL 16 (con fallback transparente a SQLite), Bcrypt, PyJWT, Stripe SDK, Scikit-learn (ML), ReportLab / OpenPyXL.
- Frontend Web: Angular 22 standalone, RxJS, PWA Service Worker, IndexedDB API, Stripe Elements, ZXing Scanner.
- Móvil: Flutter 3.47+, Dart 3.13+, Provider, `sqflite`, `flutter_secure_storage`, `speech_to_text`.
- Metodología y Modelado: ICONIX (UML 2.5+), Diagramas de Robustez BCE y Diagramas de Secuencia.

**Spec:** [documentacion/documento_parcial2.md](file:///c:/Users/User/Documents/2-2026/SI2/1erParcial/documentacion/documento_parcial2.md) y [Datos/Examen_Parcial_2_Sistemas_2_S2-2026.md](file:///c:/Users/User/Documents/2-2026/SI2/1erParcial/Datos/Examen_Parcial_2_Sistemas_2_S2-2026.md).

---

## Diagnóstico Técnico del Estado Actual del Código

Tras inspeccionar minuciosamente el código base existente en `prototipo/backend`, `prototipo/web` y `prototipo/movil`, se determina lo siguiente:

1. **Backend (`prototipo/backend`):**
   - Posee 25 casos de uso fundacionales implementados durante el 1er Parcial.
   - **Brechas a subsanar:**
     - Falta de modelos `Empresa`, `PlanSuscripcion` y `SuscripcionEmpresa`.
     - Falta de clave discriminadora `empresa_id` en las tablas operativas (`usuarios`, `sucursales`, `productos`, `inventarios`, `ordenes_venta`, etc.).
     - Falta de endpoint batch `/api/v1/offline/sincronizar` y tabla de auditoría `operaciones_offline_sync`.
     - Falta de separación formal del circuito de post-venta en dos comprobantes (`NotaDevolucion` y `NotaCambio`).
     - Falta de restricción estricta de canal Web Desktop para compras y aprovisionamiento (CU20).
     - Falta de endpoint para reportes generativos mediante IA en lenguaje natural (CU15) y dashboard con dataset sintético de 6 meses (CU17).

2. **Frontend Web (`prototipo/web`):**
   - Compila limpiamente con Angular 22 (`ng build` completado con éxito).
   - **Brechas a subsanar:**
     - Integración de Service Worker y Web App Manifest para PWA instalable.
     - Servicio de persistencia local en `IndexedDB` (`OfflineStorageService`) para almacenar catálogo offline y encolar transacciones sin red.
     - Vistas de administración de empresas y planes para el SuperAdmin.
     - Vista de cobro POS offline con indicador de estado de red (`Online` / `Offline`) y botón de sincronización diferida.
     - Módulo de chat / interfaz de prompts en lenguaje natural con soporte de micrófono para reportes IA.

3. **Móvil Flutter (`prototipo/movil`):**
   - Proyecto configurado con Flutter 3.47.1, Dart 3.13.1 y `flutter analyze` finalizado con **cero errores** (`No issues found!`).
   - **Brechas a subsanar:**
     - Declaración e inicialización del motor relacional embebido local **SQLite** (`sqflite` y `path_provider`).
     - Repositorio de base de datos local para precargar catálogo de indumentaria y generar tickets de reserva con UUID v4 temporal en modo desconectado.
     - Sincronización automática de tickets y órdenes pendientes al recuperar señal Wi-Fi/celular.
     - Soporte para incluir encabezado `X-Empresa-ID` en peticiones REST.

---

## Global Constraints

- **Aislamiento Multitenant:** Ninguna consulta SQL o endpoint operativo de una empresa puede acceder, modificar ni listar registros pertenecientes a otra empresa. Toda tabla de negocio debe incluir `empresa_id` y validarse contra el token JWT o cabecera `X-Empresa-ID`.
- **Persistencia Local Desconectada:** Las terminales Web deben utilizar `IndexedDB` y la aplicación Móvil debe utilizar `SQLite` (`sqflite`). Queda terminantemente prohibido depender de `localStorage` para transacciones complejas.
- **Identificadores UUID v4 Inmutables:** Toda transacción generada en modo offline (reserva o venta) debe originar un UUID v4 en el cliente antes de ser enviada al backend, garantizando idempotencia transaccional y evitando duplicidad de asientos contables.
- **Costo Promedio Ponderado Inmutable:** El recálculo del CPP debe efectuarse atómicamente tras cada recepción de compra a proveedores:
  $$CPP_{\text{nuevo}} = \frac{(\text{Stock}_{\text{actual}} \times CPP_{\text{actual}}) + (\text{Cantidad}_{\text{compra}} \times \text{Costo}_{\text{compra}})}{\text{Stock}_{\text{actual}} + \text{Cantidad}_{\text{compra}}}$$
- **Post-Venta en Dos Tiempos:** Toda gestión de cambio debe emitir forzosamente: 1) Nota de Devolución (ingreso físico, stock +1, reintegro de CPP histórico) y 2) Nota de Cambio (egreso físico, stock -1, liquidación de diferencial o vale en 30 días). Plazo máximo: 7 días hábiles.
- **Canal de Compras Restringido:** El CU20 (Compras y Aprovisionamiento) debe validarse estrictamente como accesible únicamente desde el canal Web Desktop.
- **Seguridad en Reportes Generativos:** Los reportes generativos mediante IA no deben ejecutar sentencias arbitrarias `INSERT/UPDATE/DELETE`. Solo se permiten consultas de lectura (`SELECT`) parametrizadas y encapsuladas bajo el filtro obligatorio `WHERE empresa_id = :empresa_id`.

---

## Review Focus

1. **Resistencia ante Concurrencia Offline:** Si dos terminales offline venden la última unidad en existencia de una misma prenda, el motor de sincronización backend debe resolver determinísticamente la primera transacción confirmada y rechazar/notificar quiebre de stock en la segunda sin corromper el kardex.
2. **Idempotencia de Sincronización:** Reenviar un lote de sincronización idéntico ante un reintento de red debe retornar `200 OK` informando que las operaciones ya fueron procesadas sin duplicar cobros ni movimientos.
3. **Restitución Exacta de CPP en Cambios:** Al registrar la Nota de Devolución, el costo que reingresa al inventario debe corresponder al CPP histórico de la fecha de la venta original, no al valor de venta al público.
4. **Degradación Elegante sin Internet:** Desconectar intencionalmente el cable de red o apagar el Wi-Fi en el navegador no debe arrojar pantallas en blanco ni congelar la aplicación, sino activar fluidamente el modo offline con badge visual.
5. **Aislamiento Criptográfico de Datos:** Intentar consultar datos de la Empresa B utilizando las credenciales de un Administrador de la Empresa A debe responder con error `403 Forbidden` inmediato.

---

## Plan de Tareas por Fases y Casos de Uso

### Fase 1: Capa de Datos y Arquitectura Base Multitenant (CU01 al CU05)

- [ ] **Tarea 1.1: Modelos de Datos SaaS y Claves Discriminadoras en Backend**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/p01_seguridad_acceso/tenants/models.py`
    - Modificar: `prototipo/backend/app/modules/p01_seguridad_acceso/auth/models.py`
    - Modificar: `prototipo/backend/app/modules/p02_estructura_operativa/sucursales/models.py`
    - Modificar: `prototipo/backend/app/modules/p03_catalogo_estilismo_ia/productos/models.py`
    - Modificar: `prototipo/backend/app/modules/p05_inventario_costos_analitica/inventario/models.py`
    - Modificar: `prototipo/backend/app/modules/p07_venta_digital_fidelizacion/ordenes/models.py`
  - **Acciones:**
    - Declarar entidades `Empresa` (`id_empresa`, `nombre_comercial`, `nit`, `dominio_slug`, `estado`), `PlanSuscripcion` (`id_plan`, `nombre`, `limite_sucursales`, `limite_usuarios`, `precio_mensual`, `soporta_ia`) y `SuscripcionEmpresa`.
    - Añadir columna `empresa_id` con clave foránea e índice a todas las tablas operativas.
    - Actualizar script de migración y seed con 2 empresas demo ("FashionStore Bolivia SRL" y "Textiles Elegance SA") y 2 planes ("Básico" y "Profesional").

- [ ] **Tarea 1.2: Middleware de Multitenancy y Enrutadores de Gestión de Empresas y Suscripciones**
  - **Archivos:**
    - Crear: `prototipo/backend/app/core/tenant_middleware.py`
    - Crear: `prototipo/backend/app/modules/p01_seguridad_acceso/tenants/router.py`
    - Crear: `prototipo/backend/app/modules/p01_seguridad_acceso/tenants/services.py`
    - Modificar: `prototipo/backend/app/core/dependencies.py`
    - Modificar: `prototipo/backend/app/main.py`
  - **Acciones:**
    - Implementar middleware e inyector de dependencias `get_current_tenant` que extraiga `empresa_id` del token JWT o de la cabecera `X-Empresa-ID`.
    - Endpoints para CU01 (CRUD Empresas), CU02 (CRUD Planes), CU03 (Suscripción de Empresa), CU04 (Login Multitenant) y CU05 (Roles por Empresa).
    - Tests de aislamiento: verificar que un usuario de Empresa 1 recibe `403` al intentar consultar recursos de Empresa 2.

- [ ] **Tarea 1.3: Vistas Web Angular para SuperAdmin y Administrador de Empresa**
  - **Archivos:**
    - Crear: `prototipo/web/src/app/pages/p01_seguridad_acceso/admin-empresas/`
    - Crear: `prototipo/web/src/app/pages/p01_seguridad_acceso/admin-planes/`
    - Modificar: `prototipo/web/src/app/core/services/auth.service.ts`
    - Modificar: `prototipo/web/src/app/app.routes.ts`
  - **Acciones:**
    - Desarrollar tabla de empresas con badges de suscripción y botones de activación/bloqueo.
    - Selector contextual de empresa para usuarios administradores.

---

### Fase 2: Catálogo Avanzado, Aprovisionamiento Desktop y CPP (CU06, CU07, CU19, CU20)

- [ ] **Tarea 2.1: Atributos Textiles Avanzados (Medidas en cm, Hex Compuestos y Fichas)**
  - **Archivos:**
    - Modificar: `prototipo/backend/app/modules/p03_catalogo_estilismo_ia/productos/models.py`
    - Modificar: `prototipo/backend/app/modules/p03_catalogo_estilismo_ia/productos/schemas.py`
    - Modificar: `prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/`
  - **Acciones:**
    - Incorporar campos `medidas_antropometricas` (JSON con contorno de pecho, cintura, cadera y largo de manga en cm), `color_hex_secundario` y `composicion_textil` hipoalergénica.
    - Renderizar en catálogo web y móvil la guía interactiva de medidas para reducir devoluciones por talla.

- [ ] **Tarea 2.2: Aprovisionamiento Exclusivo Web Desktop y Recálculo Inmutable de CPP**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/p04_aprovisionamiento_proveedores/compras/`
    - Modificar: `prototipo/backend/app/modules/p05_inventario_costos_analitica/inventario/services.py`
    - Modificar: `prototipo/web/src/app/pages/p04_aprovisionamiento_proveedores/`
  - **Acciones:**
    - Implementar CU20: Crear orden de compra a proveedores textiles exclusivamente validando `canal == 'WEB_DESKTOP'`.
    - Ejecutar atómicamente la recepción de mercadería actualizando el stock y recalculando el CPP según la fórmula matemática inmutable.
    - Registrar asiento en `kardex_movimientos` con tipo `ENTRADA_COMPRA` y referencia de factura del proveedor.

- [ ] **Tarea 2.3: Motor de Reglas Comerciales: Descuentos al por Mayor y Liquidación Estacional**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/p07_venta_digital_fidelizacion/ordenes/pricing_rules.py`
    - Modificar: `prototipo/backend/app/modules/p07_venta_digital_fidelizacion/ordenes/services.py`
  - **Acciones:**
    - Implementar CU19: Aplicación automática de precio mayorista cuando la cantidad de prendas sea $\ge 3$.
    - Descuentos de liquidación estacional configurables (30%, 40% y 60%) para colecciones anteriores.

---

### Fase 3: Arquitectura Offline-First y Sincronización Idempotente (CU08 al CU12)

- [ ] **Tarea 3.1: Backend - Endpoints de Catálogo Desconectado y Recepción de Lotes Sincronizados**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/offline_sync/models.py`
    - Crear: `prototipo/backend/app/modules/offline_sync/router.py`
    - Crear: `prototipo/backend/app/modules/offline_sync/services.py`
    - Modificar: `prototipo/backend/app/main.py`
  - **Acciones:**
    - Endpoint `GET /api/v1/offline/catalogo-snapshot`: Retorna catálogo liviano de prendas con stock disponible por sucursal para precarga local.
    - Endpoint `POST /api/v1/offline/sincronizar`: Recibe lista de operaciones pendientes (ventas de mostrador y reservas), valida UUID v4 inmutable, verifica stock, ejecuta transacciones atómicas y reporta bitácora de éxito / conflictos.

- [ ] **Tarea 3.2: Frontend Web - PWA con Service Worker, IndexedDB y Pantalla POS Offline**
  - **Archivos:**
    - Crear: `prototipo/web/src/manifest.webmanifest`
    - Crear: `prototipo/web/src/app/core/services/offline-storage.service.ts`
    - Crear: `prototipo/web/src/app/core/services/sync-manager.service.ts`
    - Modificar: `prototipo/web/src/app/pages/p08_punto_venta_pos/pos/pos.component.ts`
    - Modificar: `prototipo/web/src/app/layout/`
  - **Acciones:**
    - Configurar Web App Manifest e instalar Service Worker para cacheo de assets estáticos (CSS, JS, iconos).
    - Desarrollar `OfflineStorageService` sobre **IndexedDB** con almacenes `catalogo_local`, `ventas_offline`, `reservas_offline` y `sync_queue`.
    - Detección reactiva de conectividad (`window.addEventListener('online'/'offline')`) mostrando badge visual.
    - En POS: permitir cobro de contado en efectivo sin internet, generar recibo con UUID v4 y encolar la operación. Al reconectar, disparar sincronización y mostrar diálogo con resumen.

- [ ] **Tarea 3.3: Móvil Flutter - Persistencia Local SQLite, Catálogo Desconectado y Tickets Offline**
  - **Archivos:**
    - Modificar: `prototipo/movil/pubspec.yaml` (agregar `sqflite: ^2.4.4`, `path_provider: ^2.1.2`, `uuid: ^4.3.3`)
    - Crear: `prototipo/movil/lib/core/services/local_database_service.dart`
    - Crear: `prototipo/movil/lib/core/services/offline_sync_service.dart`
    - Modificar: `prototipo/movil/lib/modules/p03_catalogo_estilismo_ia/catalogo/views/catalogo_screen.dart`
    - Modificar: `prototipo/movil/lib/modules/p06_reservas_presenciales/reservas/views/crear_reserva_screen.dart`
  - **Acciones:**
    - Inicializar base de datos SQLite embebida `fashionstore_offline.db`.
    - Almacenar snapshot del catálogo y prendas favoritas en tablas locales SQLite.
    - Permitir crear apartados/reservas sin conexión a internet, generando ticket con QR basado en UUID v4 local (vigencia 2 horas).
    - Al detectar conectividad, enviar cola de operaciones pendientes al backend.

---

### Fase 4: Post-Venta en Dos Tiempos, Traspasos y Stripe Sandbox (CU13, CU14, CU18)

- [ ] **Tarea 4.1: Circuito Logístico de Cambios en Dos Tiempos (Nota de Devolución + Nota de Cambio)**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/p08_punto_venta_pos/postventa/models.py`
    - Crear: `prototipo/backend/app/modules/p08_punto_venta_pos/postventa/services.py`
    - Crear: `prototipo/backend/app/modules/p08_punto_venta_pos/postventa/router.py`
    - Modificar: `prototipo/web/src/app/pages/p08_punto_venta_pos/`
  - **Acciones:**
    - Implementar CU13 respetando estrictamente las directrices de la docente:
      1. **Paso 1 (Nota de Devolución):** Validación de plazo (máximo 7 días hábiles desde la venta). Reingreso de la prenda al stock de la sucursal y reintegro del CPP histórico al kardex.
      2. **Paso 2 (Nota de Cambio):** Egreso de la nueva prenda seleccionada, descuento de existencias y liquidación de diferencial de precio (si la nueva prenda es de mayor valor, cobro en efectivo o enlace Stripe Sandbox; si es menor o igual, emisión de vale o devolución monetaria en 30 días).

- [ ] **Tarea 4.2: Traspasos Inter-Sucursales de Inventario**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/p05_inventario_costos_analitica/traspasos/`
    - Modificar: `prototipo/web/src/app/pages/p05_inventario_costos_analitica/`
  - **Acciones:**
    - Implementar CU14: Transferencia controlada entre sucursales de una misma empresa (`SOLICITADO` $\rightarrow$ `EN_TRANSITO` $\rightarrow$ `RECIBIDO`).
    - Descuento en sucursal remitente e incremento atómico en sucursal receptora con recálculo de CPP si aplican costos logísticos de flete.

- [ ] **Tarea 4.3: Pasarela Stripe Sandbox para Liquidación de Diferenciales de Cambio**
  - **Archivos:**
    - Modificar: `prototipo/backend/app/modules/p09_procesamiento_pagos/pagos/services.py`
    - Modificar: `prototipo/web/src/app/pages/p08_punto_venta_pos/`
  - **Acciones:**
    - Implementar CU18: Creación de sesión de pago Stripe Sandbox o PaymentIntent para cobro del diferencial exacto generado en la Nota de Cambio.

---

### Fase 5: Inteligencia Artificial Generativa y Analítica con Machine Learning (CU15, CU16, CU17)

- [ ] **Tarea 5.1: Asistente de Reportes Generativos en Lenguaje Natural (Texto y Voz)**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/ia_analytics/generative_reports.py`
    - Crear: `prototipo/backend/app/modules/ia_analytics/router.py`
    - Crear: `prototipo/web/src/app/pages/ia_analytics/reportes-generativos/`
  - **Acciones:**
    - Implementar CU15: Motor de NLP que interpreta prompts en lenguaje natural (ej. *"¿Cuáles son las 5 camisas más vendidas en la sucursal Equipetrol en los últimos 30 días?"*).
    - Traducción segura a SQL parametrizado, forzando la cláusula inquebrantable `WHERE empresa_id = :tenant_id`.
    - Ejecución de la consulta y síntesis ejecutiva de hallazgos en lenguaje natural con gráficos automáticos.
    - Soporte para entrada por voz mediante la API de reconocimiento de voz del navegador.

- [ ] **Tarea 5.2: Motor de Exportación a Excel y PDF**
  - **Archivos:**
    - Crear: `prototipo/backend/app/modules/ia_analytics/export_service.py`
  - **Acciones:**
    - Implementar CU16: Exportación de reportes generados a hojas de cálculo Excel (`.xlsx` con formato condicional y fórmulas) y documentos ejecutivos PDF (`.pdf` con membrete corporativo y tablas formateadas).

- [ ] **Tarea 5.3: Pipeline de Datos Sintéticos (6 Meses) y Dashboard Predictivo con Machine Learning**
  - **Archivos:**
    - Crear: `prototipo/backend/app/scripts/generate_synthetic_ml_data.py`
    - Crear: `prototipo/backend/app/modules/ia_analytics/ml_models.py`
    - Crear: `prototipo/web/src/app/pages/ia_analytics/dashboard-ml/`
  - **Acciones:**
    - Implementar CU17: Script que genera 6 meses de transacciones realistas con estacionalidad de prendas y picos de venta.
    - Modelo Supervisado: Regresión lineal / Random Forest para predecir la demanda semanal de prendas por sucursal y recomendar órdenes de compra preventivas.
    - Modelo No Supervisado: K-Means para segmentar clientes en 3 perfiles (Ejecutivo, Casual, Ocasional) y Isolation Forest para detectar anomalías en mermas de inventario.
    - Renderizar visualizaciones interactivas en el dashboard gerencial.

---

### Fase 6: Pruebas de Aceptación, Validación y Verificación Integral (CU01 al CU20)

- [ ] **Tarea 6.1: Suite Automatizada de Pruebas Pytest para los 20 Casos de Uso**
  - **Archivos:**
    - Crear: `prototipo/backend/tests/test_cu01_cu05_tenants.py`
    - Crear: `prototipo/backend/tests/test_cu08_cu12_offline_sync.py`
    - Crear: `prototipo/backend/tests/test_cu13_postventa_dos_tiempos.py`
    - Crear: `prototipo/backend/tests/test_cu15_ia_reportes.py`
    - Crear: `prototipo/backend/tests/test_cu20_aprovisionamiento_desktop.py`
  - **Acciones:**
    - Ejecutar suite de pruebas con `python -m pytest tests/` certificando el paso del 100% de las pruebas con resultado satisfactorio.

- [ ] **Tarea 6.2: Verificación de Integración End-to-End y Compilación de Producción**
  - **Acciones:**
    - Compilar frontend Angular: `npm run build` en `prototipo/web` verificando 0 advertencias críticas.
    - Analizar app móvil Flutter: `flutter analyze` en `prototipo/movil` verificando `No issues found!`.
    - Probar arranque unificado del backend y frontend estático sirviendo en `http://localhost:8000/app/`.

---

## Matriz de Trazabilidad y Casos de Uso (CU01 – CU20)

| Caso de Uso | Denominación Oficial | Capa Principal | Componentes Involucrados |
| :--- | :--- | :--- | :--- |
| **CU01** | Gestionar Empresas (Tenants) | Backend / Web | `Empresa`, `tenant_middleware`, `AdminEmpresasComponent` |
| **CU02** | Gestionar Planes de Suscripción | Backend / Web | `PlanSuscripcion`, `AdminPlanesComponent` |
| **CU03** | Gestionar Suscripción de Empresa | Backend / Web | `SuscripcionEmpresa`, Stripe Checkout suscripciones |
| **CU04** | Autenticar Usuario Multitenant | Backend / Web / Móvil | JWT con payload `empresa_id`, `rol`, RBAC |
| **CU05** | Gestionar Usuarios y Roles por Empresa | Backend / Web | `Usuario`, aislamiento por `empresa_id` |
| **CU06** | Gestionar Productos y Atributos Textiles Avanzados | Backend / Web / Móvil | `Producto`, `medidas_antropometricas`, Hex, Composición |
| **CU07** | Gestionar Inventario Multi-Sucursal y CPP | Backend / Web | `Inventario`, `kardex_movimientos`, Recálculo inmutable |
| **CU08** | Descargar y Consultar Catálogo Offline | Web PWA / Móvil | `IndexedDB` (Web) / `SQLite` (Flutter) |
| **CU09** | Registrar Reserva Presencial Sin Conexión | Móvil / Web | Generación de ticket QR con UUID v4 local |
| **CU10** | Registrar Venta POS de Contado Sin Conexión | Web PWA | Cobro efectivo offline, recibo hash SHA-256 |
| **CU11** | Consultar y Auditar Operaciones Locales Pendientes | Web / Móvil | Diálogo de auditoría de cola de sincronización |
| **CU12** | Sincronizar Operaciones Pendientes | Backend / Web / Móvil | Endpoint batch `/offline/sincronizar`, idempotencia |
| **CU13** | Gestionar Cambio de Prenda en Dos Tiempos | Backend / Web POS | Nota de Devolución + Nota de Cambio (7 días hábiles) |
| **CU14** | Gestionar Traspaso Inter-Sucursal | Backend / Web | Traspasos entre tiendas con control de estados |
| **CU15** | Solicitar Reporte Generativo con IA (Texto / Voz) | Backend / Web | Motor NLP $\rightarrow$ SQL seguro parametrizado |
| **CU16** | Exportar Reportes Analíticos a Excel / PDF | Backend / Web | OpenPyXL (`.xlsx`) y ReportLab (`.pdf`) |
| **CU17** | Gestionar Dashboard Analítico con Machine Learning | Backend / Web | Dataset sintético 6 meses, Scikit-learn (Regresión/K-Means) |
| **CU18** | Gestionar Pasarela de Pagos Stripe Sandbox | Backend / Web | Stripe PaymentIntent para saldos diferenciales |
| **CU19** | Gestionar Ofertas de Liquidación y Precios por Mayor | Backend / Web / Móvil | Reglas mayoristas ($\ge 3$ uds) y liquidación estacional |
| **CU20** | Gestionar Compras y Aprovisionamiento Web Desktop | Backend / Web | Canal exclusivo Web Desktop, recálculo atómico de CPP |
