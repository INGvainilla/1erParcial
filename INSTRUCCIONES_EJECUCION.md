# 🚀 Guía Oficial de Ejecución del Proyecto FashionStore (Ciclo 1)

**Plataforma Inteligente de Comercio Electrónico para Tienda de Ropa Masculina con Vestidores Virtuales vía Realidad Aumentada**

* **Materia:** Sistemas de Información II (SI2) — Semestre 2-2026  
* **Docente:** MSc. Ing. Angélica Garzón Cuéllar  
* **Metodología:** Proceso Unificado de Desarrollo de Software (PUDS) — UML 2.5+  
* **Equipo de Desarrollo:**
  * **Alberto Delgado** (Desarrollador Full Stack)
  * **Andy Mujica** (Desarrollador Full Stack)

---

## 📋 Tabla de Contenidos
1. [Arquitectura Tecnológica del Proyecto](#-arquitectura-tecnológica-del-proyecto)
2. [Estructura del Repositorio](#-estructura-del-repositorio)
3. [Requisitos Previos del Sistema](#-requisitos-previos-del-sistema)
4. [Fase 1: Configuración y Base de Datos](#-fase-1-configuración-y-base-de-datos)
5. [Fase 2: Ejecución del Backend (FastAPI)](#-fase-2-ejecución-del-backend-fastapi)
6. [Fase 3: Ejecución del Frontend Web (Angular)](#-fase-3-ejecución-del-frontend-web-angular)
7. [Fase 4: Ejecución de la Aplicación Móvil (Flutter)](#-fase-4-ejecución-de-la-aplicación-móvil-flutter)
8. [Fase 5: Pruebas Automatizadas de Aceptación (Pytest)](#-fase-5-pruebas-automatizadas-de-aceptación-pytest)
9. [Credenciales, Roles RBAC y Matriz de Acceso](#-credenciales-roles-rbac-y-matriz-de-acceso)
10. [Solución de Problemas Frecuentes (FAQ)](#-solución-de-problemas-frecuentes-faq)

---

## 🏗 Arquitectura Tecnológica del Proyecto

| Capa | Tecnología | Características Clave |
| :--- | :--- | :--- |
| **Backend API** | Python 3.10+ / FastAPI / Uvicorn | Arquitectura modular en 3 capas (Router, Service, Repository/Model), SQLAlchemy 2.0 con carga impaciente optimizada (`joinedload`), JWT Tokens (HS256), Bcrypt, OpenAPI / Swagger UI interactivo. |
| **Base de Datos** | PostgreSQL 15+ (con Fallback a SQLite) | Soporte para PostgreSQL (`fashionstore_db`). Si el servicio no está disponible o falla la autenticación, el sistema conmuta automáticamente y sin errores a SQLite local (`fashionstore_local.db`). |
| **Frontend Web** | Angular (TypeScript / Standalone Components) | Single Page Application (SPA) responsiva, diseño Dark Glassmorphism, guardas de ruta funcionales por rol (`adminGuard`, `staffGuard`, `inventarioGuard`, `proveedoresGuard`), notificaciones Toast reactivas y visualizador de probador virtual. |
| **Aplicación Móvil** | Flutter 3.x / Dart | Multiplataforma (Android, Web, Windows Desktop, iOS), arquitectura en capas, consumo asíncrono de API REST, catálogo omnicanal y almacenamiento seguro de sesión. |

---

## 📁 Estructura del Repositorio

```
1erPARCIAL/
├── Datos/                          # Enunciados oficiales, transcripciones y especificaciones de CU
├── diagramas/                      # Diagramas UML 2.5+ (Casos de Uso, Clases, Comunicación, etc.)
├── documentacion/                  # Documentación metodológica PUDS (documento.md)
├── prototipo/
│   ├── backend/                    # Servidor API FastAPI
│   │   ├── app/
│   │   │   ├── core/               # Configuración global, base de datos, seguridad JWT/Bcrypt
│   │   │   ├── modules/            # Módulos: auth, usuarios, sucursales, productos, inventario, etc.
│   │   │   └── scripts/            # Script de población semilla (seed_data.py)
│   │   ├── tests/                  # Suite de pruebas automatizadas (test_ciclo1_api.py)
│   │   ├── requirements.txt        # Dependencias Python
│   │   └── run.py                  # Script de arranque del servidor Uvicorn
│   ├── web/                        # Frontend Web SPA (Angular)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/           # Servicios (Auth, API, Toast), guards RBAC, modelos tipados
│   │   │   │   ├── layout/         # Barra lateral reactiva según rol autenticado
│   │   │   │   ├── pages/          # Vistas: Catálogo, Dashboard, Usuarios, Sucursales, etc.
│   │   │   │   └── shared/         # Componentes compartidos (Toasts, alertas)
│   │   │   ├── index.html          # HTML principal
│   │   │   └── styles.css          # Sistema de diseño global Dark Glassmorphism
│   │   ├── angular.json            # Configuración de compilación Angular
│   │   └── package.json            # Dependencias npm (@angular/core, rxjs, etc.)
│   └── movil/                      # Aplicación Móvil nativa Flutter
│       ├── lib/                    # Código fuente Dart (core, modules, views, main.dart)
│       ├── pubspec.yaml            # Dependencias Flutter
│       └── README.md               # Guía específica del cliente móvil
├── INSTRUCCIONES_EJECUCION.md      # Este archivo de guía oficial
└── README.md                       # Documentación principal del repositorio
```

---

## ⚙ Requisitos Previos del Sistema

Asegúrese de contar con las siguientes herramientas instaladas en su entorno:

* **Python:** Versión 3.10 o superior (`python --version`).
* **Node.js & npm:** Node.js versión 18.x, 20.x o superior y npm (`node -v` y `npm -v`) para el frontend web Angular.
* **Flutter SDK:** Versión 3.x o superior (`flutter --version`) para compilar la aplicación móvil.
* **PostgreSQL (Opcional):** Versión 14, 15, 16, 17 o 18. *Si no tiene PostgreSQL activo, el sistema conmuta a SQLite automáticamente.*
* **Navegador Web:** Google Chrome, Microsoft Edge, Mozilla Firefox o Safari.

---

## 🗄 Fase 1: Configuración y Base de Datos

### 1.1 Conexión a Base de Datos
Por defecto, la aplicación intenta conectarse a **PostgreSQL** con los siguientes parámetros estándar configurados en `app/core/config.py`:
* **Host:** `localhost`
* **Puerto:** `5432`
* **Base de datos:** `fashionstore_db`
* **Usuario:** `postgres`
* **Contraseña:** `password`

> **Nota:** Si utiliza credenciales diferentes de PostgreSQL, puede definir variables de entorno en su terminal:
> ```powershell
> $env:POSTGRES_USER="postgres"
> $env:POSTGRES_PASSWORD="tu_password"
> $env:POSTGRES_DB="fashionstore_db"
> ```
> 💡 **Fallback Transparente a SQLite:** Si PostgreSQL no se encuentra en ejecución o la base de datos no existe, el sistema detecta la situación y levanta automáticamente una base de datos local SQLite (`fashionstore_local.db`) en `prototipo/backend/app/` con todas las tablas creadas.

---

### 1.2 Instalación de Dependencias del Backend

Abra una terminal (PowerShell o CMD) y navegue a la carpeta del backend:

```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\backend
```

*(Opcional pero recomendado)* Cree y active un entorno virtual:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Instale las dependencias necesarias:
```powershell
pip install -r requirements.txt
```

---

### 1.3 Población de Datos Semilla (Seed Data)

Ejecute el script que crea las tablas relacionales y siembra los datos iniciales (ciudades, sucursales físicas con coordenadas GPS y probadores, usuarios con roles RBAC, marcas, categorías, productos con códigos de color HEX y tallas, e inventario valorado por Costo Promedio Ponderado):

```powershell
# Siembra inicial estándar (omite si ya existen datos)
python app/scripts/seed_data.py

# O siembra forzada limpia (purga duplicados acumulados de pruebas y restaura el estado oficial)
python app/scripts/seed_data.py --reset
```

*Salida esperada:*
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
✅ ¡Siembra de datos semilla completada exitosamente!
```

---

## ⚡ Fase 2: Ejecución del Backend (FastAPI)

Desde la carpeta `prototipo/backend`, inicie el servidor de desarrollo:

```powershell
python run.py
```

*(O alternativamente con uvicorn directo):*
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

El servidor estará escuchando en **`http://localhost:8000`**.

### 🔗 Puntos de Acceso Clave del Backend:
* **Swagger UI (Documentación Interactiva OpenAPI):**  
  👉 [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc (Documentación Técnica):**  
  👉 [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check del Sistema:**  
  👉 [http://localhost:8000/health](http://localhost:8000/health)
* **Frontend Web Integrado:**  
  👉 [http://localhost:8000/app/](http://localhost:8000/app/) (o [http://localhost:8000/](http://localhost:8000/))

---

## 🌐 Fase 3: Ejecución del Frontend Web (Angular)

El frontend web es una Single Page Application (SPA) en **Angular** con arquitectura de componentes standalone, sistema de diseño Glassmorphism y segmentación estricta por roles.

### Opción A: Modo Desarrollo con Angular CLI (Recomendado)

1. Abra una terminal y navegue a la carpeta web:
   ```powershell
   cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\web
   ```
2. Instale las dependencias npm (solo la primera vez):
   ```powershell
   npm install
   ```
3. Inicie el servidor de desarrollo con recarga en vivo (hot-reload):
   ```powershell
   npm start
   ```
4. Abra su navegador en: **`http://localhost:4200`**

> **Nota:** La aplicación redirige automáticamente la ruta raíz (`/`) a `/catalogo`, garantizando que los visitantes y clientes vean de inmediato las prendas disponibles.

---

### Opción B: Servido Directamente desde el Backend FastAPI

Si desea ejecutar el sistema completo en un solo puerto (`http://localhost:8000`):

1. Compile la aplicación Angular para producción:
   ```powershell
   cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\web
   npm run build
   ```
2. El bundle optimizado se generará en `prototipo/web/dist/web_app`.
3. Inicie el backend (`python run.py` en `prototipo/backend`).
4. Abra su navegador en: **`http://localhost:8000/`** (el servidor redirige a `/app/` donde se sirve la aplicación compilada).

---

## 📱 Fase 4: Ejecución de la Aplicación Móvil (Flutter)

La aplicación móvil permite a los clientes explorar el catálogo omnicanal, consultar existencias por sucursal física, ver especificaciones de prenda con colores HEX y autenticarse con RBAC / OTP.

### 4.1 Preparar Dependencias
Abra una nueva terminal y navegue a la carpeta `prototipo/movil`:

```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\movil
flutter pub get
```

### 4.2 Configuración de la URL del Backend según el Dispositivo
Abra el archivo `lib/core/constants/api_constants.dart` y verifique la variable `baseUrl`:

```dart
class ApiConstants {
  // Configuración según entorno de ejecución:
  // 1. Emulador Android oficial:
  static const String baseUrl = "http://10.0.2.2:8000/api/v1";

  // 2. Windows Desktop o Chrome Web o Simulador iOS:
  // static const String baseUrl = "http://localhost:8000/api/v1";

  // 3. Dispositivo móvil físico conectado por Wi-Fi (reemplace con la IP local de su PC):
  // static const String baseUrl = "http://192.168.1.50:8000/api/v1";
```

### 4.3 Comandos de Ejecución

Verifique los dispositivos disponibles en su equipo:
```powershell
flutter devices
```

Ejecute la app en la plataforma de su preferencia:

#### Para Windows Desktop (Nativo):
> Recuerde cambiar `baseUrl` en `api_constants.dart` a `http://localhost:8000/api/v1`.
```powershell
flutter run -d windows
```

#### Para Navegador Web (Chrome):
> Recuerde cambiar `baseUrl` en `api_constants.dart` a `http://localhost:8000/api/v1`.
```powershell
flutter run -d chrome
```

#### Para Emulador Android o Dispositivo Físico:
```powershell
flutter run
```

---

## 🧪 Fase 5: Pruebas Automatizadas de Aceptación (Pytest)

El proyecto cuenta con una suite integral de **11 pruebas automatizadas de integración y aceptación** (`TC01` al `TC11`), validadas de acuerdo con la sección de pruebas de caja negra de la metodología PUDS:

* **TC01:** Login RBAC Válido de Administrador (Emisión de JWT con claims de rol).
* **TC02:** Bloqueo preventivo de cuenta tras 5 intentos fallidos consecutivos (`CU01`).
* **TC03:** Auto-registro de nuevo cliente con rol por defecto `CLIENTE` (`CU02`).
* **TC04:** Flujo criptográfico de recuperación de contraseña con token OTP de 6 dígitos con ventana de 15 min (`CU03`).
* **TC05:** Desbloqueo administrativo de cuentas bloqueadas por rol `ADMINISTRADOR` (`CU04`).
* **TC06:** Registro de sucursal física con validación de coordenadas GPS y probadores (`CU05`).
* **TC07:** Alta de prenda de vestir con atributos de moda (SKU único, colores HEX, tallas) (`CU06`).
* **TC08:** Gestión de temporadas comerciales y colecciones estacionales (SS / FW) (`CU07`).
* **TC09:** Registro de proveedor textil con validación de unicidad de NIT (`CU08`).
* **TC10:** Valuación matemática de inventario mediante Costo Promedio Ponderado (CPP) (`CU09`).
* **TC11:** Consulta omnicanal de catálogo y disponibilidad física en tiempo real por sucursal (`CU10`).

### Ejecutar las Pruebas:

Desde la carpeta `prototipo/backend`:

```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\backend
python -m pytest tests/test_ciclo1_api.py -v
```

*Salida de ejecución real:*
```text
tests/test_ciclo1_api.py::test_tc01_login_rbac_administrador_valido PASSED [  9%]
tests/test_ciclo1_api.py::test_tc02_login_bloqueo_preventivo_5_intentos PASSED [ 18%]
tests/test_ciclo1_api.py::test_tc03_autoregistro_cliente_nuevo PASSED    [ 27%]
tests/test_ciclo1_api.py::test_tc04_recuperacion_password_otp_6_digitos PASSED [ 36%]
tests/test_ciclo1_api.py::test_tc05_desbloqueo_administrativo_cajero PASSED [ 45%]
tests/test_ciclo1_api.py::test_tc06_alta_sucursal_gps_probadores PASSED  [ 54%]
tests/test_ciclo1_api.py::test_tc07_alta_producto_con_colores_hex_y_tallas PASSED [ 63%]
tests/test_ciclo1_api.py::test_tc08_temporada_campana_estacional PASSED  [ 72%]
tests/test_ciclo1_api.py::test_tc09_proveedor_unicidad_nit PASSED        [ 81%]
tests/test_ciclo1_api.py::test_tc10_recalculo_matematico_cpp PASSED      [ 90%]
tests/test_ciclo1_api.py::test_tc11_catalogo_omnicanal_y_disponibilidad_sucursal PASSED [100%]

====================== 11 passed in 16.24s =======================
```

---

## 👥 Credenciales, Roles RBAC y Matriz de Acceso

Todos los usuarios de prueba tienen la contraseña predeterminada: **`Admin123*`**

### Matriz de Usuarios Semilla (Seed Data)

| Rol RBAC | Correo Electrónico | Contraseña | Estado Inicial | Módulos y Permisos Visibles |
| :--- | :--- | :--- | :---: | :--- |
| **ADMINISTRADOR** | `alberto.delgado@store.bo` | `Admin123*` | `ACTIVO` | **Acceso total:** Dashboard Ejecutivo, Gestión de Usuarios (CU04), Alta de Sucursales (CU05), Prendas (CU06), Temporadas (CU07), Proveedores (CU08), Inventario/Kardex (CU09) y Catálogo (CU10). |
| **ADMINISTRADOR** | `andy.mujica@store.bo` | `Admin123*` | `ACTIVO` | **Acceso total:** Mismos privilegios de administración global y auditoría. |
| **ENCARGADO DE SUCURSAL** | `carlos.morales@store.bo` | `Admin123*` | `ACTIVO` | **Operativo Tienda:** Inventario físico de sucursal, registro de entradas de mercadería y consulta de catálogo omnicanal. *(No ve Dashboard ni Gestión de Usuarios).* |
| **LOGÍSTICA** | `mateo.logistica@store.bo` | `Admin123*` | `ACTIVO` | **Abastecimiento Central:** Directorio de proveedores textiles (CU08), gestión de inventario multi-sucursal y recepción de compras. *(No ve Dashboard ni Usuarios).* |
| **CAJERO** | `javier.roca@store.bo` | `Admin123*` | `BLOQUEADO` | **Caso de Prueba CU04:** Cuenta configurada como bloqueada intencionalmente para demostrar el desbloqueo administrativo en un solo clic desde el panel de Usuarios. |
| **CLIENTE** | `rodrigo.cliente@gmail.com` | `Admin123*` | `ACTIVO` | **E-Commerce:** Catálogo omnicanal con stock por sucursal, probador virtual 3D, y recuperación de clave OTP (Código OTP sembrado: `482915`). *(No tiene acceso a rutas administrativas).* |
| **VISITANTE (Sin login)** | *(Público)* | — | `ANÓNIMO` | Acceso directo a `/catalogo`, visualización de prendas, filtros por sucursal física, probador y pantalla de Login/Auto-registro. |

---

## ❓ Solución de Problemas Frecuentes (FAQ)

### 1. ¿Qué hago si no tengo PostgreSQL instalado o el servicio está detenido?
No necesita instalar nada adicional. El backend incluye un mecanismo de detección autónoma de errores de conexión. Si PostgreSQL no responde, el sistema emitirá una advertencia y cargará inmediatamente la base de datos local SQLite:
```text
[DATABASE] Advertencia: No se pudo conectar a PostgreSQL (...). Usando SQLite de respaldo.
```
Todo el sistema (FastAPI, Web Angular y Móvil) continuará operando normalmente.

### 2. ¿Por qué un usuario cliente o visitante no ve el Dashboard o los botones de agregar productos?
El sistema cuenta con un control de acceso basado en roles (**RBAC**) estricto:
- **Ruta raíz (`/`):** Dirige automáticamente al Catálogo Digital Omnicanal.
- **Rutas `/dashboard`, `/usuarios`, `/temporadas`:** Están protegidas por la guarda `adminGuard`. Si un cliente o usuario no autorizado intenta ingresar por URL, es redirigido de forma segura al catálogo.
- **Menú lateral y botones de acción (`+ Nuevo`):** Solo se renderizan en el navegador si el usuario activo cuenta con el rol requerido (`auth.isAdmin()`, `auth.isLogistics()`, etc.).

### 3. Error al ejecutar las pruebas: `ModuleNotFoundError: No module named 'app'`
Asegúrese de ejecutar las pruebas anteponiendo `python -m pytest`:
```powershell
python -m pytest tests/test_ciclo1_api.py -v
```
Esto garantiza que la raíz de `prototipo/backend` se añada correctamente al `sys.path` de Python.

### 4. La aplicación móvil en emulador no conecta con el backend
* Verifique que en `lib/core/constants/api_constants.dart` la URL sea:
  `http://10.0.2.2:8000/api/v1` (la dirección IP especial que usa el emulador Android oficial para acceder al localhost de su máquina).
* Si ejecuta en un teléfono físico por Wi-Fi, cambie `10.0.2.2` por la IP local de su computadora (ej. `http://192.168.1.15:8000/api/v1`).
* Si ejecuta en Windows Desktop o Chrome, use `http://localhost:8000/api/v1`.

### 5. Política de ejecución de scripts de PowerShell (`Activate.ps1`)
Si al intentar activar el entorno virtual recibe un error de `ExecutionPolicy`:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

---

*Desarrollado para la materia Sistemas de Información II (SI2) — Semestre 2-2026*  
*Docente: MSc. Ing. Angélica Garzón Cuéllar*  
*Integrantes: Alberto Delgado & Andy Mujica*
