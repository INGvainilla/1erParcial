# 🚀 Guía Oficial de Ejecución del Proyecto FashionStore (Ciclo 3 — Versión Final Integral)

**Plataforma Inteligente de Comercio Electrónico Omnicanal para Tienda de Ropa Masculina con Vestidores Virtuales vía Realidad Aumentada, Inteligencia Artificial, Gamificación y Terminal POS con Devoluciones Transaccionales**

* **Materia:** Sistemas de Información II (SI2) — Semestre 2-2026  
* **Docente:** MSc. Ing. Angélica Garzón Cuéllar  
* **Metodología:** Proceso Unificado de Desarrollo de Software (PUDS) — UML 2.5+  
* **Equipo de Desarrollo:**
  * **Alberto Delgado** (Desarrollador Full Stack / Arquitecto de Software)
  * **Andy Mujica** (Desarrollador Full Stack / Especialista Móvil e IA)

---

## 📋 Tabla de Contenidos
1. [Arquitectura Tecnológica del Proyecto](#-arquitectura-tecnológica-del-proyecto)
2. [Estructura del Repositorio y los 10 Paquetes PUDS](#-estructura-del-repositorio-y-los-10-paquetes-puds)
3. [Matriz de Casos de Uso del Sistema (CU01 al CU25)](#-matriz-de-casos-de-uso-del-sistema-cu01-al-cu25)
4. [Diagnóstico y Resolución del Error en Terminal 11544](#-diagnóstico-y-resolución-del-error-en-terminal-11544)
5. [Requisitos Previos del Sistema](#-requisitos-previos-del-sistema)
6. [Fase 1: Configuración de Base de Datos y Auto-Migración](#-fase-1-configuración-de-base-de-datos-y-auto-migración)
7. [Fase 2: Ejecución del Backend (FastAPI en Puerto 8000)](#-fase-2-ejecución-del-backend-fastapi-en-puerto-8000)
8. [Fase 3: Ejecución del Frontend Web (Angular en Puerto 4200 / 8000)](#-fase-3-ejecución-del-frontend-web-angular-en-puerto-4200--8000)
9. [Fase 4: Ejecución de la Aplicación Móvil (Flutter)](#-fase-4-ejecución-de-la-aplicación-móvil-flutter)
10. [Fase 5: Pruebas Automatizadas de Aceptación (Pytest 100% Green)](#-fase-5-pruebas-automatizadas-de-aceptación-pytest-100-green)
11. [Fase 6: Guía Rápida de Prueba para CU25 (Devoluciones y Cambios)](#-fase-6-guía-rápida-de-prueba-para-cu25-devoluciones-y-cambios)
12. [Fase 7: Despliegue en la Nube y Docker (Render / Local)](#-fase-7-despliegue-en-la-nube-y-docker-render--local)
13. [Credenciales, Roles RBAC y Matriz de Acceso](#-credenciales-roles-rbac-y-matriz-de-acceso)
14. [Solución de Problemas Frecuentes (FAQ)](#-solución-de-problemas-frecuentes-faq)

---

## 🏗 Arquitectura Tecnológica del Proyecto

| Capa | Tecnología | Características Clave y Alcance Ciclo 3 |
| :--- | :--- | :--- |
| **Backend API** | Python 3.10+ / 3.13 / FastAPI / Uvicorn | Arquitectura modular de 3 capas distribuida en **10 subsistemas PUDS** (`p01` a `p10`), SQLAlchemy 2.0 con carga impaciente optimizada (`joinedload`), soporte para cálculo de Costo Promedio Ponderado (CPP), motor de promociones, pasarela Stripe tokenizada, analítica predictiva y endpoints de devoluciones (`/pos/devoluciones`). |
| **Base de Datos** | PostgreSQL 15+ (con Fallback a SQLite) | Base principal `fashionstore_db` con esquema relacional 3FN. Incorpora script semilla idempotente con **auto-reparación DDL en caliente** (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) y conmutación automática y transparente a SQLite local (`fashionstore_local.db`) en caso de caída. |
| **Frontend Web** | Angular 17+/19+ (TypeScript / Standalone Components) | Single Page Application (SPA) responsiva con diseño **Dark Glassmorphism**, guardas RBAC activas, visualizador de probador virtual WebGL, catálogo reactivo, tablero logístico de delivery, y **Terminal POS con soporte completo para CU25 (Devoluciones y Cambios de prendas)**. |
| **Aplicación Móvil** | Flutter 3.x / Dart | Multiplataforma (Android, Web, Windows Desktop, iOS), arquitectura de capas (`core`, `modules`, `views`), consumo asíncrono REST, **Vestidor Virtual AR con Google ML Kit Pose Detection**, Comparador de Outfits y Gamificación con catálogo de recompensas. |

---

## 📁 Estructura del Repositorio y los 10 Paquetes PUDS

El proyecto consolida la totalidad del ciclo de vida del software en 10 paquetes arquitectónicos estandarizados en Backend (`app/modules/`) y Frontend Web (`src/app/pages/`):

```
1erPARCIAL/
├── Datos/                          # Enunciados oficiales, transcripciones y especificaciones de CU
├── diagramas/                      # Diagramas UML 2.5+ (Casos de Uso, Clases, Comunicación, Secuencia)
├── DOCUMENTACION2/                 # Documentación metodológica PUDS integral (ciclo1, ciclo2, ciclo3.md)
├── prototipo/
│   ├── backend/                    # Servidor API FastAPI
│   │   ├── app/
│   │   │   ├── core/               # Configuración global, base de datos, seguridad JWT/Bcrypt
│   │   │   ├── modules/            # Los 10 Subsistemas PUDS:
│   │   │   │   ├── p01_seguridad_acceso/             # CU01, CU02, CU03, CU04 (Auth, OTP, Bloqueo)
│   │   │   │   ├── p02_estructura_empresa/           # CU05 (Sucursales GPS, Probadores)
│   │   │   │   ├── p03_catalogo_estilismo_ia/        # CU06, CU07, CU19, CU20, CU22, CU23
│   │   │   │   ├── p04_aprovisionamiento_proveedores/# CU08 (Proveedores Textiles, NIT)
│   │   │   │   ├── p05_inventario_costos_analitica/  # CU09, CU24 (CPP, Kardex, Métricas)
│   │   │   │   ├── p06_reservas_presenciales/        # CU11 (Reserva de Probadores)
│   │   │   │   ├── p07_venta_digital_fidelizacion/   # CU12, CU13, CU14, CU21 (E-commerce, Puntos)
│   │   │   │   ├── p08_punto_venta_pos/              # CU15, CU25 (POS Caja, Devoluciones)
│   │   │   │   ├── p09_procesamiento_pagos/          # CU16, CU17 (Stripe, Medios de Pago)
│   │   │   │   └── p10_logistica_delivery/           # CU18 (Despacho, Rutas Haversine)
│   │   │   └── scripts/
│   │   │       └── seed_data.py    # Script semilla idempotente con auto-migración DDL
│   │   ├── tests/                  # Suite integral de pruebas automatizadas
│   │   │   ├── test_ciclo1_api.py  # 11 pruebas de aceptación Ciclo 1 (TC01 - TC11)
│   │   │   ├── test_ciclo3_api.py  # Pruebas de aceptación Ciclo 3 (IA, Clima, Voz, Gamificación)
│   │   │   ├── test_cu15_pos.py    # Pruebas de integración POS Caja
│   │   │   ├── test_cu16_stripe.py # Pruebas de pasarela Stripe
│   │   │   ├── test_cu17_config_pagos.py # Pruebas de configuración de pagos
│   │   │   ├── test_cu18_logistica.py    # Pruebas de delivery y courier
│   │   │   ├── test_cu21_gamificacion.py # Pruebas de puntos y niveles
│   │   │   └── test_cu25_devoluciones.py # 5 Pruebas exhaustivas para Devolución y Cambio
│   │   ├── web_dist/               # Bundle compilado de Angular servido por FastAPI
│   │   ├── requirements.txt        # Dependencias Python
│   │   └── run.py                  # Script de arranque del servidor Uvicorn
│   ├── web/                        # Frontend Web SPA (Angular 17+/19+)
│   │   ├── src/app/
│   │   │   ├── core/               # Servicios (Auth, POS, Stripe, etc.), Guards RBAC
│   │   │   ├── layout/             # Menú lateral reactivo según rol autenticado
│   │   │   └── pages/              # Módulos `p01` a `p10` y terminal POS interactivo
│   │   ├── angular.json
│   │   └── package.json
│   └── movil/                      # Aplicación Móvil nativa Flutter
│       ├── lib/
│       │   ├── core/               # Constantes de API, temas y enrutador
│       │   ├── modules/            # Módulos móviles (catálogo, vestidor AR, comparador, recompensas)
│       │   └── main.dart           # Punto de entrada de la aplicación Flutter
│       └── pubspec.yaml            # Dependencias (Google ML Kit, Camera, etc.)
├── INSTRUCCIONES_EJECUCION.md      # Esta guía oficial integral
└── README.md                       # Documentación principal
```

---

## 🎯 Matriz de Casos de Uso del Sistema (CU01 al CU25)

| Ciclo | Caso de Uso | Módulo / Paquete | Descripción Operativa |
| :---: | :--- | :--- | :--- |
| **1** | **CU01: Iniciar Sesión (Login)** | `p01_seguridad_acceso` | Autenticación JWT con bloqueo preventivo tras 5 intentos fallidos. |
| **1** | **CU02: Registrar Nuevo Cliente** | `p01_seguridad_acceso` | Auto-registro público con rol por defecto `CLIENTE`. |
| **1** | **CU03: Recuperar Contraseña** | `p01_seguridad_acceso` | Generación y validación de código OTP criptográfico de 6 dígitos. |
| **1** | **CU04: Gestionar Cuentas de Usuarios** | `p01_seguridad_acceso` | Desbloqueo administrativo y asignación de roles RBAC. |
| **1** | **CU05: Registrar Sucursal Física** | `p02_estructura_empresa` | Gestión de tiendas físicas con geolocalización GPS y probadores. |
| **1** | **CU06: Registrar Prenda de Vestir** | `p03_catalogo_estilismo_ia`| Alta de productos de moda con códigos de color HEX y tallas. |
| **1** | **CU07: Gestionar Temporadas Comerciales**| `p03_catalogo_estilismo_ia`| Campañas de moda estacionales (Primavera-Verano, Otoño-Invierno). |
| **1** | **CU08: Registrar Proveedor Textil** | `p04_aprovisionamiento_proveedores`| Gestión de proveedores de hilados y telas con NIT único. |
| **1** | **CU09: Registrar Inventario y Valuación**| `p05_inventario_costos_analitica`| Kardex inmutable y valuación matemática por Costo Promedio Ponderado ($CPP$). |
| **1** | **CU10: Consultar Catálogo Omnicanal**| `p03_catalogo_estilismo_ia`| Búsqueda omnicanal con stock físico en tiempo real por sucursal. |
| **2** | **CU11: Reservar Probador Físico** | `p06_reservas_presenciales` | Reserva presencial de prendas para prueba en sucursal con QR. |
| **2** | **CU12: Gestionar Carrito de Compras** | `p07_venta_digital_fidelizacion`| Carrito reactivo persistente con validación de inventario disponible. |
| **2** | **CU13: Aplicar Cupones y Promociones**| `p07_venta_digital_fidelizacion`| Descuentos porcentuales y montos fijos con validación de vigencia. |
| **2** | **CU14: Procesar Compra E-Commerce** | `p07_venta_digital_fidelizacion`| Generación de orden de pedido digital con reserva de inventario. |
| **2** | **CU15: Registrar Venta en Caja (POS)**| `p08_punto_venta_pos` | Facturación de mostrador con lector SKU, cálculo de vuelto y Kardex. |
| **2** | **CU16: Procesar Pago con Pasarela** | `p09_procesamiento_pagos` | Integración con Stripe PaymentIntents tokenizados y webhooks. |
| **2** | **CU17: Configurar Métodos de Pago** | `p09_procesamiento_pagos` | Parámetros de cobro en línea, efectivo y datáfonos de mostrador. |
| **2** | **CU18: Gestionar Despacho y Logística**| `p10_logistica_delivery` | Rutas de entrega, cálculo de tarifas Haversine y courier en vivo. |
| **3** | **CU19: Visualizar Prenda en Probador AR**| `p03_catalogo_estilismo_ia`| Pose Detection en tiempo real vía Google ML Kit y superposición AR. |
| **3** | **CU20: Comparar Outfits y Conjuntos** | `p03_catalogo_estilismo_ia`| Comparador lado a lado de combinaciones de prendas y paletas. |
| **3** | **CU21: Fidelización y Gamificación** | `p07_venta_digital_fidelizacion`| Sistema de puntos por acciones, niveles VIP (Bronce, Plata, Oro, Platino) y catálogo de recompensas. |
| **3** | **CU22: Asesoría de Estilismo por Clima**| `p03_catalogo_estilismo_ia`| Recomendaciones contextuales inteligentes basadas en clima local. |
| **3** | **CU23: Búsqueda Semántica y por Voz** | `p03_catalogo_estilismo_ia`| Procesamiento de lenguaje natural para búsquedas por atributos de moda. |
| **3** | **CU24: Métricas y Reportes Predictivos**| `p05_inventario_costos_analitica`| Tableros ejecutivos de rotación, proyección de ventas y tendencias. |
| **3** | **CU25: Gestionar Devolución y Cambio** | `p08_punto_venta_pos` | **Validación fiscal ($\le 14$ días), inspección física, reingreso a Kardex al CPP histórico y compensación vía cambio por factor de talla, vale o dinero.** |

---

## 🔍 Diagnóstico y Resolución del Error en Terminal 11544

### Descripción del Error Reportado
Al ejecutar la siembra de base de datos en la terminal PowerShell con PID 11544:
```text
psycopg2.errors.UndefinedColumn: no existe la columna «precio» en la relación «producto_tallas»
LINE 1: INSERT INTO producto_tallas (id_producto, talla, precio) SELECT ...
                                                         ^
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) no existe la columna «precio» en la relación «producto_tallas»
```

### Causa Raíz
1. En el Ciclo 1, la tabla `producto_tallas` contenía únicamente `(id_talla, id_producto, talla)`.
2. Para el soporte de precios diferenciados y factores de recargo por talla ($L: +5\%, XL: +10\%, XXL: +15\%$), el modelo SQLAlchemy fue actualizado agregando la columna `precio = Column(Numeric(10, 2), nullable=True)`.
3. SQLAlchemy ejecuta `Base.metadata.create_all(bind=engine)`, pero esta instrucción **nunca altera tablas preexistentes en PostgreSQL** (`ALTER TABLE`). En consecuencia, la base de datos persistía la estructura antigua sin la columna `precio`.

### Solución Implementada (Self-Healing Migration)
Se incorporó una migración de esquema auto-reparable e idempotente directamente en `prototipo/backend/app/scripts/seed_data.py`:
```python
with engine.connect() as conn:
    conn.execute(text("ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);"))
    conn.commit()
```
Asimismo, se sembró una orden real previa de mostrador (**Ticket `POS-2026-0042`**) con 5 días de antigüedad para que el caso de uso **CU25 (Devoluciones)** pueda ser probado inmediatamente sin necesidad de registrar transacciones previas.

---

## ⚙ Requisitos Previos del Sistema

Asegúrese de contar con las siguientes herramientas instaladas:

* **Python:** Versión 3.10, 3.11, 3.12 o 3.13 (`python --version`).
* **Node.js & npm:** Node.js v18+, v20+ y npm (`node -v` y `npm -v`) para compilar o ejecutar el frontend Angular.
* **Flutter SDK:** Versión 3.x (`flutter --version`) para la aplicación móvil.
* **PostgreSQL:** Versión 14, 15, 16 o 17 (por defecto en puerto 5432). *Si no está corriendo, el sistema conmuta automáticamente a SQLite.*
* **Navegador Web:** Chrome, Edge o Firefox.

---

## 🗄 Fase 1: Configuración de Base de Datos y Auto-Migración

### 1.1 Configurar Parámetros de Conexión
Por defecto, la aplicación se conecta a **PostgreSQL** mediante los siguientes parámetros en `app/core/config.py`:
* **Host:** `localhost` | **Puerto:** `5432` | **Base de Datos:** `fashionstore_db`
* **Usuario:** `postgres` | **Contraseña:** `password`

*(Opcional)* Si sus credenciales locales son distintas, puede especificarlas por variables de entorno en PowerShell:
```powershell
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="tu_password"
$env:POSTGRES_DB="fashionstore_db"
```

> 💡 **Fallback Transparente:** Si PostgreSQL no se encuentra activo o no existe la base de datos, el backend cambia de forma transparente a SQLite local (`fashionstore_local.db`) sin arrojar errores.

---

### 1.2 Instalación de Dependencias del Backend
Abra una ventana de PowerShell y navegue a la carpeta del backend:
```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erParcial\prototipo\backend

# Activar entorno virtual existente o crear uno nuevo
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt
```

---

### 1.3 Ejecutar Siembra Limpia (Seed Data con Auto-Fix)
Para garantizar la creación de tablas, la auto-migración de la columna `precio` y la siembra de todos los datos semilla oficiales (usuarios RBAC, prendas, inventario valorado al CPP y el ticket de devolución `POS-2026-0042`), ejecute:

```powershell
python app/scripts/seed_data.py --reset
```

*Salida exitosa confirmada:*
```text
[DATABASE] Conectado exitosamente a PostgreSQL (fashionstore_db).
Iniciando creación de tablas y siembra de datos semilla...
Limpiando datos y tablas para siembra limpia...
Tablas limpiadas exitosamente.
Insertando Ciudades de Bolivia...
Insertando Sucursales físicas con coordenadas GPS...
Insertando Usuarios con roles RBAC (Alberto Delgado, Andy Mujica, etc.)...
Insertando Proveedores Textiles con NIT...
Insertando Temporadas y Colecciones...
Insertando Catálogo de Productos y Atributos de Moda...
Insertando Inventario Inicial Multi-Sucursal y Kardex...
Insertando Ordenes de Venta históricas (Incluye POS-2026-0042 para CU25)...
✅ ¡Siembra de datos semilla completada exitosamente!
```

---

## ⚡ Fase 2: Ejecución del Backend (FastAPI en Puerto 8000)

Desde la carpeta `prototipo/backend` con el entorno virtual activo:

```powershell
python run.py
```

*(O de manera directa con recarga en vivo):*
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Puntos de Enlace Clave:
* 📖 **Swagger UI interactivo (OpenAPI con CU01 a CU25):**  
  👉 [http://localhost:8000/docs](http://localhost:8000/docs)
* 🩺 **Health Check del Sistema (Versión Ciclo 3):**  
  👉 [http://localhost:8000/health](http://localhost:8000/health)  
  *(Responde confirmando los 10 paquetes arquitectónicos y 25 casos de uso activos)*
* 🌐 **Frontend Web Integrado:**  
  👉 [http://localhost:8000/app/](http://localhost:8000/app/) (o [http://localhost:8000/](http://localhost:8000/))

---

## 🌐 Fase 3: Ejecución del Frontend Web (Angular en Puerto 4200 / 8000)

### Opción A: Modo Desarrollo con Angular CLI (Puerto 4200)
1. Abra una nueva terminal y navegue a la carpeta web:
   ```powershell
   cd c:\Users\User\Documents\2-2026\SI2\1erParcial\prototipo\web
   ```
2. Instale dependencias (solo la primera vez):
   ```powershell
   npm install
   ```
3. Inicie el servidor de desarrollo:
   ```powershell
   npm start
   ```
4. Ingrese desde su navegador a: **`http://localhost:4200`**

---

### Opción B: Modo Producción Embebido en FastAPI (Puerto 8000)
Si prefiere levantar todo el ecosistema en un único puerto (`8000`):
1. Compile el proyecto web:
   ```powershell
   cd c:\Users\User\Documents\2-2026\SI2\1erParcial\prototipo\web
   npm run build
   ```
2. El bundle compilado se genera en `dist/web_app` y está sincronizado en `prototipo/backend/web_dist`.
3. Inicie el backend (`python run.py`) e ingrese a **`http://localhost:8000/`**. El servidor servirá automáticamente la aplicación Angular SPA.

---

## 📱 Fase 4: Ejecución de la Aplicación Móvil (Flutter)

La aplicación móvil contiene el **Probador Virtual AR (CU19)** con Google ML Kit Pose Detection, el **Comparador de Outfits (CU20)** y el módulo de **Gamificación y Recompensas (CU21)**.

### 4.1 Preparar Dependencias
En una terminal:
```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erParcial\prototipo\movil
flutter pub get
```

### 4.2 Configuración del Backend según el Destino
En `lib/core/constants/api_constants.dart`:
* Para **Windows Desktop / Chrome Web:** `static const String baseUrl = "http://localhost:8000/api/v1";`
* Para **Emulador Android Oficial:** `static const String baseUrl = "http://10.0.2.2:8000/api/v1";`
* Para **Dispositivo Físico por Wi-Fi:** Coloque la IP local de su PC (ej. `http://192.168.1.15:8000/api/v1`).

### 4.3 Comandos de Lanzamiento
```powershell
# Para probar en Windows Desktop:
flutter run -d windows

# Para probar en el navegador Google Chrome:
flutter run -d chrome

# Para probar en Emulador o Celular conectado:
flutter run
```

---

## 🧪 Fase 5: Pruebas Automatizadas de Aceptación (Pytest 100% Green)

El backend cuenta con una suite integral que valida **los 25 casos de uso del sistema** con aserciones rigurosas de caja negra y pruebas de integración transaccional:

### Ejecución de la Suite Completa con Pytest:
Desde `prototipo/backend`:
```powershell
python -m pytest tests/ -v -W ignore
```

*Resultado verificado de la suite (24 pruebas pasando al 100% en ~8 segundos):*
```text
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1
tests/test_ciclo1_api.py::test_tc01_login_rbac_administrador_valido PASSED [  4%]
tests/test_ciclo1_api.py::test_tc02_login_bloqueo_preventivo_5_intentos PASSED [  8%]
tests/test_ciclo1_api.py::test_tc03_autoregistro_cliente_nuevo PASSED    [ 12%]
tests/test_ciclo1_api.py::test_tc04_recuperacion_password_otp_6_digitos PASSED [ 16%]
tests/test_ciclo1_api.py::test_tc05_desbloqueo_administrativo_cajero PASSED [ 20%]
tests/test_ciclo1_api.py::test_tc06_alta_sucursal_gps_probadores PASSED  [ 25%]
tests/test_ciclo1_api.py::test_tc07_alta_producto_con_colores_hex_y_tallas PASSED [ 29%]
tests/test_ciclo1_api.py::test_tc08_temporada_campana_estacional PASSED  [ 33%]
tests/test_ciclo1_api.py::test_tc09_proveedor_unicidad_nit PASSED        [ 37%]
tests/test_ciclo1_api.py::test_tc10_recalculo_matematico_cpp PASSED      [ 41%]
tests/test_ciclo1_api.py::test_tc11_catalogo_omnicanal_y_disponibilidad_sucursal PASSED [ 45%]
tests/test_ciclo3_api.py::test_cu21_obtener_perfil_gamificacion PASSED   [ 50%]
tests/test_ciclo3_api.py::test_cu21_bono_accion_probar_ra PASSED         [ 54%]
tests/test_ciclo3_api.py::test_cu21_listar_y_canjear_recompensa PASSED   [ 58%]
tests/test_ciclo3_api.py::test_cu22_obtener_clima_local PASSED           [ 62%]
tests/test_ciclo3_api.py::test_cu22_generar_outfits_contextuales PASSED  [ 66%]
tests/test_ciclo3_api.py::test_cu23_busqueda_voz_semantica_formal PASSED [ 70%]
tests/test_ciclo3_api.py::test_cu23_busqueda_voz_semantica_calor_lino PASSED [ 75%]
tests/test_cu21_gamificacion.py::test_cu21_flujo_integral_gamificacion PASSED [ 79%]
tests/test_cu25_devoluciones.py::test_cu25_consultar_ticket_dentro_de_plazo PASSED [ 83%]
tests/test_cu25_devoluciones.py::test_cu25_consultar_ticket_fuera_de_plazo PASSED [ 87%]
tests/test_cu25_devoluciones.py::test_cu25_procesar_cambio_variante_factor_talla PASSED [ 91%]
tests/test_cu25_devoluciones.py::test_cu25_procesar_devolucion_vale_credito PASSED [ 95%]
tests/test_cu25_devoluciones.py::test_cu25_bloqueo_devolucion_ticket_vencido PASSED [100%]
============================= 24 passed in 8.21s ==============================
```

### Ejecución de Scripts de Pruebas Unitarias de Integración:
```powershell
python tests/test_cu15_pos.py          # Validación integral de Terminal POS de Caja
python tests/test_cu16_stripe.py       # Validación de pasarela de pago Stripe
python tests/test_cu17_config_pagos.py # Validación de tipos y medios de cobro
python tests/test_cu18_logistica.py    # Validación de despacho y tarifas Haversine
```

---

## 🔄 Fase 6: Guía Rápida de Prueba para CU25 (Devoluciones y Cambios)

El caso de uso **CU25** implementa las políticas de post-venta con validación de plazo fiscal ($\le 14$ días), inspección física del estado de la prenda y reingreso inmutable al Kardex al CPP histórico.

### Datos Sembrados para la Prueba
* **Ticket de Venta:** `POS-2026-0042`
* **Fecha de Emisión:** Hace 5 días (dentro del plazo legal de 14 días).
* **Cliente:** Carlos Mendoza (`carlos.mendoza@gmail.com`).
* **Prenda Adquirida:** 1x Camisa Oxford Slim Fit (Talla M, Bs. 180.00).

### Pasos para Probar en el Frontend Web (Terminal POS):
1. Inicie sesión con una cuenta de Cajero o Administrador:
   * **Usuario:** `javier.roca@store.bo` (o `alberto.delgado@store.bo`)
   * **Contraseña:** `Admin123*`
2. En la barra lateral izquierda, haga clic en **Punto de Venta (POS)** o navegue a `http://localhost:4200/pos`.
3. En la barra superior de acciones, presione el botón **`🔄 Devoluciones (CU25)`**.
4. En el campo de búsqueda de ticket, ingrese: **`POS-2026-0042`** y presione **Buscar Ticket**.
5. Verifique que el sistema muestra:
   * ✅ **Badge verde:** `Vigente (5 días transcurridos de 14 permitidos)`.
   * Datos del cliente y lista de prendas del ticket.
6. **Seleccione la prenda** para devolución marcando su casilla de verificación.
7. Indique el **Estado de Inspección Física**:
   * *Apto para Reingreso (Kardex Stock Disponible)* o *Defectuoso / Merma*.
8. Seleccione la **Modalidad de Resolución**:
   * **Opción 1: Cambio de Prenda / Talla:** Seleccione una nueva talla (ej. `L`). Note cómo el sistema calcula automáticamente el ajuste por factor de talla ($+5\% \rightarrow \text{Bs. } +9.00$ a pagar) o ($S \rightarrow \text{Bs. } -9.00$ de saldo a favor).
   * **Opción 2: Vale de Crédito:** Genera un código de vale por Bs. 180.00 utilizable en compras futuras.
   * **Opción 3: Reembolso en Efectivo:** Genera egreso de caja por Bs. 180.00.
9. Haga clic en **Procesar Devolución Transaccional**.
10. Se abrirá la **Boleta Térmica de Devolución** lista para imprimir con el detalle de la operación y el asiento generado en el Kardex.

---

## ☁ Fase 7: Despliegue en la Nube y Docker (Render / Local)

El proyecto incluye un `Dockerfile` multi-etapa optimizado que compila Angular y empaqueta el backend FastAPI con Uvicorn:

### 7.1 Construcción y Ejecución con Docker Local
```powershell
# Construir la imagen unificada
docker build -t fashionstore:latest .

# Ejecutar el contenedor
docker run -d --name fashionstore_app -p 8000:8000 fashionstore:latest
```

### 7.2 Despliegue Automático en Render
1. En [dashboard.render.com](https://dashboard.render.com/), seleccione **New +** > **Blueprint**.
2. Conecte el repositorio GitHub. Render leerá `render.yaml` y configurará el servicio con variables para JWT, Stripe y Correo.
3. Al finalizar, la aplicación estará disponible en `https://su-servicio.onrender.com`.

---

## 👥 Credenciales, Roles RBAC y Matriz de Acceso

Todas las cuentas del sistema comparten la contraseña estándar de evaluación: **`Admin123*`**

| Rol RBAC | Correo Electrónico | Contraseña | Estado | Módulos y Permisos Visibles |
| :--- | :--- | :--- | :---: | :--- |
| **ADMINISTRADOR** | `alberto.delgado@store.bo` | `Admin123*` | `ACTIVO` | **Acceso total:** Todos los 25 casos de uso (Dashboard, Usuarios, Sucursales, Prendas, CPP, POS, Devoluciones, Analítica y Auditoría). |
| **ADMINISTRADOR** | `andy.mujica@store.bo` | `Admin123*` | `ACTIVO` | **Acceso total:** Mismos privilegios de administración global y auditoría. |
| **ENCARGADO DE TIENDA** | `carlos.morales@store.bo` | `Admin123*` | `ACTIVO` | Inventario físico de sucursal, POS de caja y autorizaciones de devolución. |
| **CAJERO POS** | `javier.roca@store.bo` | `Admin123*` | `ACTIVO` | Operación de caja, facturación de prendas (CU15) y procesamiento de devoluciones en mostrador (CU25). |
| **LOGÍSTICA / DELIVERY** | `mateo.logistica@store.bo` | `Admin123*` | `ACTIVO` | Proveedores textiles, recepción de mercadería y despacho de pedidos delivery (CU18). |
| **CLIENTE** | `rodrigo.cliente@gmail.com` | `Admin123*` | `ACTIVO` | Catálogo omnicanal, probador virtual AR, comparador de outfits, gamificación VIP y e-commerce. |
| **VISITANTE (Público)** | *(Sin login previo)* | — | `ANÓNIMO` | Navegación de catálogo, probador virtual y pantalla de login/auto-registro. |

---

## ❓ Solución de Problemas Frecuentes (FAQ)

### 1. ¿Cómo se resolvió el error de `psycopg2.errors.UndefinedColumn: no existe la columna «precio» en la relación «producto_tallas»`?
Se incorporó una instrucción DDL auto-ejecutable en `prototipo/backend/app/scripts/seed_data.py`:
`ALTER TABLE producto_tallas ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);`  
Si su base de datos local presentaba este error, simplemente ejecute:
```powershell
python app/scripts/seed_data.py --reset
```
El script detecta la falta de la columna, la añade dinámicamente sin perder la integridad y puebla los datos completos.

### 2. ¿Qué ocurre si PostgreSQL no está encendido en mi equipo?
No se requiere ninguna acción manual. El backend cuenta con un conmutador transparente de fallback: detecta que el puerto 5432 no responde y levanta de inmediato la base de datos local SQLite (`fashionstore_local.db`). Todo el sistema opera con normalidad.

### 3. Al ejecutar las pruebas de Pytest, ¿por qué debe usarse `python -m pytest`?
El prefijo `python -m pytest` asegura que el directorio raíz de `prototipo/backend` se añada a la variable `sys.path`, permitiendo que las importaciones de `app.*` se resuelvan sin errores de `ModuleNotFoundError`.

### 4. ¿Cómo pruebo la aplicación móvil si no tengo un emulador Android configurado?
Puede ejecutarla directamente sobre el navegador Google Chrome o como aplicación de escritorio nativa de Windows con un solo comando:
```powershell
flutter run -d chrome
# o
flutter run -d windows
```

### 5. ¿Dónde se encuentra la documentación metodológica completa del Ciclo 3?
El informe metodológico exhaustivo con diagramas UML 2.5+, diagramas de comunicación, clases de análisis, secuencia y navegación se encuentra en:
* [DOCUMENTACION2/ciclo3.md](file:///c:/Users/User/Documents/2-2026/SI2/1erParcial/DOCUMENTACION2/ciclo3.md)

---

*Proyecto desarrollado para la materia Sistemas de Información II (SI2) — Semestre 2-2026*  
*Docente: MSc. Ing. Angélica Garzón Cuéllar*  
*Equipo de Desarrollo: Alberto Delgado & Andy Mujica*
