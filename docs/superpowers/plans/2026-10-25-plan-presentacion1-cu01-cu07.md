# Plan de Implementación — Presentación 1 (CU01 – CU07) sin romper lo existente

> **Fecha de auditoría:** 2026-10-25. **Alcance:** solo CU01–CU07. CU08–CU20 quedan fuera (ver §8).
> **Reemplaza en la práctica** a [2026-10-25-plan-implementacion-parcial2.md](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/docs/superpowers/plans/2026-10-25-plan-implementacion-parcial2.md) para esta entrega. Ese archivo **no se modifica**: parte de que no existe nada (rutas `c:\Users\User\...`, "falta Empresa/Plan/Suscripción"), y hoy eso ya está implementado.

---

## 1. Estado real del código (auditado, no supuesto)

El commit `d282698` ya implementó CU01–CU07. Este plan **no construye desde cero**: cierra brechas, endurece y alinea con el enunciado y con el documento.

**Línea base medida** (copia aislada del backend, esquema migrado, `python -m pytest tests`):

| Resultado | Detalle |
| :-- | :-- |
| **31 pasan / 2 fallan** | Los 7 tests de [test_cu01_cu07_multitenant.py](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/tests/test_cu01_cu07_multitenant.py) pasan. |
| Fallo conocido 1 | `test_cu22_obtener_clima_local`: depende del clima real (`19.4 >= 25.0`). No es de CU01–07. |
| Fallo conocido 2 | `test_cu25_consultar_ticket_dentro_de_plazo`: la orden semilla (16-sep) ya pasó los 14 días. No es de CU01–07. |
| **Sobre el repo tal cual** | La suite **falla desde el primer test**: `no such column: usuarios.id_empresa` (ver F1). |

### Matriz CU01–CU07: qué hay y qué falta

| CU | Ya existe | Brechas verificadas contra el enunciado (§9) |
| :-- | :-- | :-- |
| **CU01 Empresas** | CRUD, NIT y slug únicos, admin inicial, UI [tenants.component.ts](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/web/src/app/pages/p01_seguridad_acceso/tenants/tenants.component.ts) | El **ADMINISTRADOR de una empresa puede hacer `PUT` con `estado` y `presupuesto_disponible`** (se reactiva solo). `estado` es texto libre, sin enum. No hay activar/bloquear dedicado. |
| **CU02 Planes** | CRUD, seed Básico/Profesional | Seed Pro = **5** sucursales; el enunciado dice **10**. `max_sucursales`, `max_usuarios` y `permite_reportes_ia` **nunca se hacen cumplir** en ningún endpoint. |
| **CU03 Suscripción** | Contratar/renovar, consultar activa | La vigencia **no se valida** (una `ACTIVA` vencida sigue activa). No hay **cambiar de plan** real (renovar con otro plan deja el anterior como `RENOVADA` y arranca en su fecha final). No se restringen operaciones por suscripción ni se verifican límites. |
| **CU04 Login multitenant** | JWT con `id_empresa`, `nombre_empresa`, bloqueo a 5 intentos | **Puerta trasera** en [auth/service.py:85-87](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/app/modules/p01_seguridad_acceso/auth/service.py#L85-L87) (`rodrigo.cliente@gmail.com` entra con `Admin123*`). Empresa `SUSPENDIDA` o suscripción vencida **no bloquea** el acceso. [`get_tenant_id`](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/app/core/dependencies.py#L76-L92) existe pero **ningún router lo usa**. |
| **CU05 Usuarios/roles** | Listar y crear con `id_empresa` del admin | `PUT /usuarios/{id}`, `/bloquear`, `/desbloquear` **no validan tenant**: un admin de A puede editar usuarios de B. Límite de usuarios no aplicado. |
| **CU06 Productos textiles** | Campos `medidas_antropometricas`, `composicion_textil`, `codigo_hex_secundario`; seed con medidas en cm | **UI web sin esos campos** ([productos.component.ts](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/productos/productos.component.ts) y catálogo: 0 referencias). `POST /productos` toma `id_empresa` **del body** (suplantable). `GET/PUT` por id sin tenant. El JSON de medidas no se valida. |
| **CU07 Inventario + CPP** | Fórmula CPP correcta con `Decimal`, kardex, test | `GET /inventario/stock` es **público** y expone costos/CPP con `id_empresa` **opcional por query**. `POST /entradas` y `GET /kardex` **no validan que sucursal/producto sean del tenant**. Lectura-modificación-escritura **sin bloqueo de fila**. |

### Hallazgo de infraestructura que rompe todo (F1)

- [main.py:57-73](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/app/main.py#L57-L73) y el seed usan `ADD COLUMN IF NOT EXISTS`, que **solo existe en PostgreSQL**. En SQLite falla y el `except: pass` lo oculta.
- El `.db` **versionado** en git tiene esquema viejo (`usuarios` sin `id_empresa`; `empresas`/`planes`/`suscripciones` vacías).
- `seed_parcial2_tenants.py` **no se invoca desde ningún lado** (ni startup, ni Dockerfile, ni `render.yaml`, ni INSTRUCCIONES). Una BD nueva arranca **sin empresas, sin planes y sin superadmin**.
- Los tests **escriben en el `.db` versionado** (git lo muestra modificado tras correrlos).

### Otros riesgos de seguridad detectados

- Contraseña de aplicación de Gmail y llaves Stripe de prueba (`sk_test_`) están **versionadas en 5 archivos**, no solo en [config.py:44,48-49](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/app/core/config.py#L44-L49): `config.py`, el `.db` versionado, `fashionstore_seed.sql`, `tests/test_cu17_config_pagos.py` y `render.yaml`. Moverlas a `.env` **no las protege**: ya están en el historial de git. La medida real es **rotarlas** (la de Gmail es la sensible; las Stripe son de modo prueba).

---

## 2. Reglas para no romper nada (compuertas)

| # | Compuerta | Cómo se cumple |
| :-- | :-- | :-- |
| **G1** | Punto de retorno | `git tag pre-presentacion1` y rama `feat/p1-cu01-cu07` antes de tocar nada. |
| **G2** | No contaminar datos | Tests corren sobre **copia temporal** del `.db` (F0.2). El `.db` versionado deja de modificarse. |
| **G3** | Sin regresiones | Tras **cada** tarea: suite completa. Debe haber ≥ 31 pasan y solo los 2 fallos conocidos. Cualquier otro rojo bloquea. |
| **G4** | Solo aditivo | Módulos nuevos; **sin renombrar rutas ni campos de respuesta**. Todo cambio de comportamiento está en la tabla de §5. |
| **G5** | Migraciones idempotentes | Se ejecutan dos veces seguidas en SQLite **y** PostgreSQL sin error ni duplicados. |
| **G6** | Frontend al final | `web_dist/` se regenera **una sola vez** (F6) y en commit aparte. Render sirve ese build embebido. |
| **G7** | Un commit por tarea | Revertir una tarea no afecta a las demás. |
| **G8** | Credenciales estables | Se conservan los usuarios semilla y sus claves (`superadmin@fashionstore.bo`, `alberto.delgado@store.bo`, `admin@elegance.bo`). |

---

## 3. Fases

Tamaños: **S** < 1 h · **M** 1–3 h · **L** > 3 h. Prioridad: **P0** bloquea la entrega · **P1** exigido por el enunciado · **P2** deseable.

### F0 — Red de seguridad (S, P0) — sin cambiar comportamiento

- [ ] **0.1** `git tag pre-presentacion1` + rama `feat/p1-cu01-cu07`.
- [ ] **0.2 Aislar datos de prueba.** En [config.py](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/app/core/config.py) hacer que `SQLITE_URL` respete `FASHIONSTORE_SQLITE_PATH` (por defecto igual que hoy). En [conftest.py](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/backend/tests/conftest.py), **antes de importar `app`**, copiar el `.db` a un temporal y apuntar la variable ahí (solo si no hay `DATABASE_URL`).
  - *Aceptación:* correr la suite deja `git status` limpio.
- [ ] **0.3** Registrar la línea base (31/2) en el PR.
- [ ] **0.4 (P2, requiere tu OK)** Dejar de depender de fecha/clima en los 2 tests conocidos (clima: simular; ticket: crear orden reciente en el propio test). No se tocan hasta que lo confirmes.

### F1 — Migraciones confiables y arranque idempotente (M, P0)

- [ ] **1.1** Crear `app/core/migrations.py` con `ensure_columns()` basado en `sqlalchemy.inspect` (portable PG/SQLite). Sustituye los bloques `try/except: pass` de `main.py` y del seed; **registra** cualquier fallo en vez de ocultarlo.
- [ ] **1.2** Crear `app/scripts/bootstrap_tenants.py` con `bootstrap_tenants(db)` **idempotente** (planes, 2 empresas, suscripciones, superadmin, vinculación de datos huérfanos a la empresa 1, medidas/composición). `seed_parcial2_tenants.py` queda como envoltorio delgado para no romper el uso por CLI.
- [ ] **1.3** Llamarlo desde `startup_event`, **después** de migrar y **sin** depender de "no hay usuarios".
- [ ] **1.4 Alinear planes con el enunciado §9.4:** Básico 2 sucursales / Profesional **10**. Reconciliar solo si el plan existente aún tiene los valores semilla antiguos (5), para no pisar cambios manuales.
- **Aceptación**
  - BD SQLite vacía, BD PostgreSQL vacía y el `.db` viejo versionado arrancan sin `no such column`.
  - `GET /api/v1/tenants/planes` devuelve 2 planes; login de superadmin y de admin de cada empresa funciona.
  - Ejecutar `bootstrap_tenants` dos veces deja los mismos conteos.
- **Tests nuevos:** `tests/test_p1_bootstrap.py` (idempotencia; esquema viejo → columnas agregadas; datos huérfanos → empresa 1).

### F2 — Aislamiento multitenant real (L, P0) — exigido por RNF02 y §9.6

Nuevo `app/core/tenancy.py` (aditivo): `resolver_empresa(user, id_empresa=None)`, `exigir_mismo_tenant(user, id_empresa_recurso)` → **403**, `filtrar_por_tenant(query, Modelo, id_empresa)`. `SUPER_ADMIN` puede indicar `id_empresa`; el resto queda atado al suyo.

- [ ] **2.1 Inventario (CU07):**
  - `GET /inventario/stock` pasa a requerir token; ignora `id_empresa` del cliente salvo superadmin. Consumidores verificados: solo [fashion-api.service.ts:186](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/web/src/app/core/services/fashion-api.service.ts#L186) (panel staff) y un test.
  - `POST /entradas` y `GET /kardex`: validar que sucursal, producto e inventario pertenezcan al tenant del usuario.
  - Bloqueo de fila (`with_for_update()`) en el recálculo de CPP para evitar pérdidas de actualización.
- [ ] **2.2 Sucursales (CU05/§9.3):** asignar `id_empresa` al crear; listar/obtener/editar solo del tenant.
- [ ] **2.3 Productos (CU06):** `id_empresa` sale del usuario autenticado, **no del body**; `PUT` y `GET` por id con verificación de tenant. El SKU **sigue siendo único global** (así está el constraint hoy); pasarlo a único por empresa exige migración de índice y queda como P2 (ver D7).
- [ ] **2.4 Usuarios (CU05):** `PUT`, `bloquear`, `desbloquear` verifican que el objetivo sea del mismo tenant.
- [ ] **2.5 Empresas (CU01):** el admin de empresa **no puede** modificar `estado` ni `presupuesto_disponible` (solo `SUPER_ADMIN`). `estado` pasa a enum validado. Nuevo `PATCH /tenants/empresas/{id}/estado` solo superadmin.
- [ ] **2.6 Catálogo público:** **sin cambios por defecto** (la web y el móvil de clientes no envían tenant). Se agrega filtro opcional `?empresa=<slug>`. Ver decisión D1.
- **Aceptación (los 5 puntos del "Review Focus" aplicables a CU01–07):** con token de la Empresa B, **toda** operación sobre un recurso de la Empresa A responde **403/404** (stock, kardex, entrada, sucursal, producto, usuario, empresa).
- **Tests nuevos:** `tests/test_p1_isolation.py`, parametrizado por endpoint, con admin de empresa 1 vs recursos de empresa 2 y viceversa. Se actualiza **a propósito** la primera llamada de `test_cu07` (envía token).

### F3 — Reglas de plan y suscripción (L, P1) — exigido por enunciado §9.3–9.5

Nuevo `app/core/subscription.py`.

- [ ] **3.1 Vigencia:** `obtener_suscripcion_activa` considera `fecha_vencimiento`; si ya pasó, marca `VENCIDA` (perezoso al consultar, sin cron).
- [ ] **3.2 Dependencia `exigir_suscripcion_vigente`:** empresa `ACTIVA` y suscripción vigente; si no, **403** con código `SUSCRIPCION_NO_VIGENTE`. Se aplica a **escrituras operativas** (sucursales, usuarios, productos, inventario). **No** se aplica a login, `/tenants/*` ni lectura, para que el admin pueda entrar a ver el aviso y renovar. `SUPER_ADMIN` exento.
- [ ] **3.3 Límites:** crear sucursal ≥ `max_sucursales` → **409** `LIMITE_PLAN_SUCURSALES`; crear usuario de staff ≥ `max_usuarios` → **409** `LIMITE_PLAN_USUARIOS`. Los `CLIENTE` auto-registrados **no cuentan** (ver D3).
- [ ] **3.4 Cambiar de plan:** `POST /tenants/suscripciones/cambiar-plan`. Efecto inmediato, la anterior pasa a `CAMBIADA`. **Bajar de plan se rechaza** (409) si el uso actual excede el nuevo límite.
- [ ] **3.5 Capacidades:** `GET /tenants/empresas/{id}/capacidades` → `{vigente, dias_restantes, sucursales:{usadas,max}, usuarios:{usadas,max}, reportes_ia, ml_dashboard, offline}`. Lo consumen la UI y, más adelante, CU15.
- [ ] **3.6** Quitar la **puerta trasera** de login (`rodrigo.cliente@gmail.com`) tras tu confirmación (D2).
- **Tests nuevos:** `tests/test_p1_plan_limits.py` (vencida → 403 en escritura y OK en lectura; sucursal #3 en Básico → 409; bajar de plan con exceso → 409; superadmin exento).

### F4 — UI de CU06 y contexto de tenant (M, P1)

- [ ] **4.1** [productos.component.ts](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/web/src/app/pages/p03_catalogo_estilismo_ia/productos/productos.component.ts): campos de **medidas en cm por talla**, **color secundario (hex)** y **composición textil**.
- [ ] **4.2** Catálogo: **guía de medidas** visible en el detalle de prenda y marca de composición/hipoalergénico.
- [ ] **4.3** Barra/sidebar: mostrar **empresa**, **plan** y **días restantes** (usa 3.5); aviso si la suscripción está por vencer o vencida.
- [ ] **4.4** Manejar `403 SUSCRIPCION_NO_VIGENTE` y `409 LIMITE_PLAN_*` con mensajes claros (no pantalla en blanco).
- **Aceptación:** crear un producto con medidas, hex secundario y composición desde la UI y verlo en el catálogo; el límite de plan se muestra como mensaje, no como error genérico.

### F5 — Documento ICONIX coherente con el código (M, P0 para la entrega) — RNF12

El documento ([documento_parcial2.md](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/documentacion/documento_parcial2.md)) describe un modelo que **no coincide** con lo implementado. La cátedra exige que UML y código sean coherentes. Decisión recomendada: **adaptar el documento al código** (cambiar claves primarias sería riesgoso y no aporta).

| Tema | Documento dice | Código real |
| :-- | :-- | :-- |
| PK empresa/suscripción | UUID | `Integer` autoincremental |
| Empresa | `nit_identificacion`, `subdominio`, `estado_empresa` (ACTIVA/SUSPENDIDA/INACTIVA) | `nit`, `dominio_slug`, `estado` (ACTIVA/SUSPENDIDA/VENCIDA), + `nombre_comercial`, `presupuesto_disponible`, `schema_name` |
| Plan | `codigo_plan`, `costo_mensual`, `limite_sucursales`, `limite_usuarios`, `acceso_ia_generativa`, `acceso_machine_learning` | `codigo`, `precio_mensual`, `max_sucursales`, `max_usuarios`, `permite_reportes_ia`, `permite_ml_dashboard`, `soporta_offline`, `estado`, `descripcion` |
| Suscripción | estados ACTIVA/VENCIDA/SUSPENDIDA | + `CANCELADA`, `CAMBIADA`; `auto_renovar`, ids Stripe |
| Usuario | `tenant_id`; rol `ADMIN_EMPRESA` | `id_empresa`; rol `ADMINISTRADOR` (+ `LOGISTICA`, `PROVEEDOR`) |
| Planes | Básico / Profesional / Enterprise | Básico / Profesional (Enterprise solo si se crea) |
| Inventario | `inventario_sucursal`, `movimientos_kardex`, CPP `Decimal(12,4)` | `inventario`, `kardex_movimientos`, CPP `Numeric(10,2)` |
| Textil | `variantes.talla_cm_json`, `es_hipoalergenico` | `productos.medidas_antropometricas` (JSON texto) + `producto_tallas.medidas_cm`; `composicion_textil` |
| SKU | `sku` único **por tenant** | `codigo_sku_base` único **global** |

- [ ] **5.1** Corregir §1.5.1.1–1.5.1.3, diccionario de datos, diagramas de clases/ER (etiquetas) y fichas de CU01–CU07.
- [ ] **5.2** Fichas de **prueba de aceptación (DDT)** de CU01–07 con resultados reales de la suite nueva y capturas de la UI.
- [ ] **5.3** Anexar la línea de tiempo: qué se entrega en esta presentación y qué queda para las siguientes.
- ⚠ Los diagramas de Enterprise Architect (`diagramas/*.eapx`) son binarios: los nombres de atributos hay que cambiarlos **a mano en EA**; el plan solo entrega la tabla anterior como guía.

### F6 — Verificación final y build de producción (M, P0)

- [ ] **6.1** Suite completa: solo los 2 fallos conocidos (o 0 si se aprobó F0.4).
- [ ] **6.2** Prueba de humo de [F1] en BD **vacía** y con `.db` viejo.
- [ ] **6.3** `npm run build` en `prototipo/web` sin errores → copiar a `backend/web_dist` (usa [construir_frontend.bat](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/construir_frontend.bat)) → commit **aparte**.
- [ ] **6.4** Arrancar `run.py` y recorrer en navegador: login superadmin → empresas/planes/suscripción → login admin Empresa 1 → producto textil → entrada de lote y CPP → intento cruzado Empresa 2 (debe fallar).
- [ ] **6.5** Actualizar [INSTRUCCIONES_EJECUCION.md](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/INSTRUCCIONES_EJECUCION.md) con credenciales y flujo de demostración.

---

## 4. Matriz de pruebas (nuevas + existentes)

| Archivo | Cubre | Estado |
| :-- | :-- | :-- |
| `test_cu01_cu07_multitenant.py` | Flujo feliz CU01–07 | Existe (se ajusta 1 llamada en F2.1) |
| `test_p1_bootstrap.py` | Idempotencia, esquema viejo | Nuevo |
| `test_p1_isolation.py` | 403/404 cruzado en stock, kardex, entrada, sucursal, producto, usuario, empresa | Nuevo |
| `test_p1_plan_limits.py` | Vigencia, límites, cambio de plan, exención superadmin | Nuevo |
| `test_p1_cpp_properties.py` | CPP con varios lotes en secuencia, redondeo `ROUND_HALF_UP`, entrada con costo ≤ 0 rechazada, no cambia con otro tenant | Nuevo |
| `test_ciclo1_api.py`, `test_ciclo3_api.py`, `test_cu15…cu25*` | Regresión del 1er parcial | Existen; **no se modifican** (salvo F0.4 con tu OK) |

---

## 5. Cambios de comportamiento intencionales (todo lo demás es aditivo)

| # | Cambio | Quién podría notarlo | Mitigación |
| :-- | :-- | :-- | :-- |
| 1 | `GET /inventario/stock` exige token y ya no acepta `id_empresa` ajeno | Panel de inventario web (ya envía token), 1 test | Verificado en §3 F2.1; se actualiza el test |
| 2 | Admin de empresa no puede cambiar `estado`/`presupuesto` | Pantalla [tenants](file:///c:/Users/mujic/Desktop/2doParcia/1erParcial/prototipo/web/src/app/app.routes.ts#L49): su ruta usa `adminGuard` (`auth.isAdmin()`), **no** restringe a superadmin | Verificar si `isAdmin()` incluye al admin de empresa; si es así, ocultar/deshabilitar esos campos para él en F4 |
| 3 | Escrituras operativas con suscripción vencida → 403 | Datos semilla con fechas vencidas | Seed deja a ambas empresas vigentes |
| 4 | Sucursal/usuario sobre el límite → 409 | Demos que creen más de 2 sucursales en Básico | Empresa 1 es **Profesional**; Empresa 2 (Básico) sirve para demostrar el límite |
| 5 | Plan Profesional 5 → 10 sucursales | Ninguno | Reconciliación condicionada |
| 6 | Se elimina la puerta trasera de login | Demo con esa cuenta | D2 |

---

## 6. Decisiones que necesito de ti

| # | Pregunta | Propuesta por defecto |
| :-- | :-- | :-- |
| **D1** | Catálogo público sin sesión: ¿qué empresa ve el cliente? | Sin cambios hoy (muestra todo) + filtro opcional `?empresa=slug`. Alternativa: fijar la empresa 1. |
| **D2** | ¿Elimino la puerta trasera `rodrigo.cliente@gmail.com`? ¿Esa cuenta se usa en alguna demo? | Eliminar y resembrar esa cuenta con clave normal. |
| **D3** | ¿Los `CLIENTE` cuentan para `max_usuarios`? | No cuentan: el límite aplica a personal (admin, encargado, cajero, logística). |
| **D4** | Credenciales commiteadas (Gmail y Stripe): ¿las muevo a `.env` y las rotas tú? | Orden seguro: (1) crear `backend/.env` local (ya está en `.gitignore`) con tus valores actuales; (2) quitar los valores por defecto de `config.py`, `render.yaml` y el test; (3) **tú rotas** Gmail y Stripe y actualizas `.env` y las variables de Render. El `.db` y el `.sql` históricos seguirán conteniendo las claves viejas: por eso la rotación es obligatoria. |
| **D5** | ¿Corrijo los 2 tests frágiles (clima y fecha del ticket) para tener suite 100 % verde? | Sí, en un commit aparte (F0.4). |
| **D6** | ¿Con qué corte entregamos **hoy** (25-oct)? | **Mínimo hoy:** F0 + F1 + F2 + F5 + F6.1. **Antes del 1-nov:** F3 + F4 + F6 completo. |
| **D7** | SKU: ¿lo dejamos único global (código y documento coherentes) o lo pasamos a único por empresa? | Dejar global y documentarlo; pasarlo a por-empresa es una migración de índice que no aporta a la demo. |

---

## 7. Orden de ejecución recomendado

```
F0 → F1 → F2 → (F5 en paralelo, es documento) → F3 → F4 → F6
```

Cada flecha pasa por la compuerta G3 (suite sin regresiones). F2 y F3 son las de mayor riesgo; por eso se hacen sobre la red de seguridad de F0 y F1.

---

## 8. Fuera de alcance de esta presentación

CU08–CU20: PWA/Service Worker/IndexedDB, SQLite en Flutter, sincronización offline, cambios de prenda en dos tiempos, traspasos, Stripe de diferenciales, reportes generativos, exportación y ML. **No se toca ningún archivo de esos módulos.** `p07`, `p08`, `p09`, `p10` y `ia_recomendaciones` se mantienen intactos (salvo el uso del helper de tenant si algún día se decide).
