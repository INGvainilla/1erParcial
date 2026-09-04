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
6. [Fase 3: Ejecución del Frontend Web](#-fase-3-ejecución-del-frontend-web)
7. [Fase 4: Ejecución de la Aplicación Móvil (Flutter)](#-fase-4-ejecución-de-la-aplicación-móvil-flutter)
8. [Fase 5: Pruebas Automatizadas de Aceptación (Pytest)](#-fase-5-pruebas-automatizadas-de-aceptación-pytest)
9. [Credenciales y Datos de Prueba (Seed Data)](#-credenciales-y-datos-de-prueba-seed-data)
10. [Solución de Problemas Frecuentes (FAQ)](#-solución-de-problemas-frecuentes-faq)

---

## 🏗 Arquitectura Tecnológica del Proyecto

| Capa | Tecnología | Características Clave |
| :--- | :--- | :--- |
| **Backend API** | Python 3.10+ / FastAPI / Uvicorn | Arquitectura modular, SQLAlchemy 2.0, JWT Tokens (HS256), Bcrypt, OpenAPI / Swagger UI interactivo. |
| **Base de Datos** | PostgreSQL 15+ (con Fallback a SQLite) | Soporte para PostgreSQL (`fashionstore_db`). Si el servicio no está disponible, el sistema conmuta automáticamente y sin errores a SQLite local (`fashionstore_local.db`). |
| **Frontend Web** | HTML5 / CSS3 / Vanilla JS Modular | Single Page Application (SPA) responsiva, diseño Dark Glassmorphism, integración total con REST API vía `fetch`, notificaciones Toast reactivas. |
| **Aplicación Móvil** | Flutter 3.x / Dart | Multiplataforma (Android, Web, Windows Desktop, iOS), arquitectura de capas, consumo asíncrono de API REST, almacenamiento seguro de sesión. |

---

## 📁 Estructura del Repositorio

```
1erPARCIAL/
├── Datos/                          # Enunciados oficiales, transcripciones y especificaciones de CU
├── diagramas/                      # Diagramas UML 2.5+ (Casos de Uso, Clases, Secuencia, etc.)
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
│   ├── web/                        # Frontend Web SPA
│   │   ├── css/                    # Estilos modernos Glassmorphism
│   │   ├── js/                     # Módulos JavaScript (api.js, auth.js, catalogo.js, inventario.js, etc.)
│   │   └── index.html              # Interfaz de usuario interactiva
│   └── movil/                      # Aplicación Móvil nativa Flutter
│       ├── lib/                    # Código fuente Dart (core, modules, views, main.dart)
│       ├── pubspec.yaml            # Dependencias Flutter
│       └── README.md               # Guía específica del cliente móvil
├── INSTRUCCIONES_EJECUCION.md      # Este archivo de guía
└── README.md                       # Documentación principal del repositorio
```

---

## ⚙ Requisitos Previos del Sistema

Asegúrese de contar con las siguientes herramientas instaladas en su entorno:

* **Python:** Versión 3.10 o superior (`python --version`).
* **Flutter SDK:** Versión 3.x o superior (`flutter --version`) para compilar la aplicación móvil.
* **PostgreSQL (Opcional):** Versión 14, 15, 16, 17 o 18. *Si no tiene PostgreSQL instalado o activo, el sistema usa SQLite de forma 100% autónoma sin requerir ninguna acción adicional.*
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

> **Nota:** Si utiliza credenciales diferentes de PostgreSQL, puede definir las variables de entorno correspondientes antes de iniciar o usar un archivo `.env`:
> ```powershell
> $env:POSTGRES_USER="postgres"
> $env:POSTGRES_PASSWORD="tu_password"
> $env:POSTGRES_DB="fashionstore_db"
> ```
> 💡 **Fallback Transparente a SQLite:** Si PostgreSQL no se encuentra en ejecución o la base de datos no existe, el sistema detecta automáticamente la situación y levanta una base de datos local SQLite (`fashionstore_local.db`) en la carpeta `prototipo/backend/app/` con todas las tablas creadas.

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

Ejecute el script que crea las tablas relacionales y siembra los datos iniciales (ciudades, sucursales con coordenadas GPS, usuarios RBAC, marcas, categorías, productos con códigos de color HEX y tallas, e inventario valorado por Costo Promedio Ponderado):

```powershell
python app/scripts/seed_data.py
```

*Salida esperada:*
```text
[DATABASE] Conectado exitosamente a PostgreSQL (fashionstore_db).
Iniciando creación de tablas y siembra de datos semilla...
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

## 🌐 Fase 3: Ejecución del Frontend Web

El frontend web es una aplicación interactiva (Single Page Application) que se comunica directamente con la API REST.

Tiene dos formas sencillas de ejecutarlo:

### Opción A (Recomendada: Directa a través del Backend)
El backend FastAPI ya monta automáticamente la carpeta `prototipo/web` como directorio estático. Simplemente asegúrese de que el backend esté corriendo y abra en su navegador:

👉 **[http://localhost:8000/](http://localhost:8000/)** (redirige a `/app/`)

### Opción B (Servidor Web Independiente)
Si prefiere ejecutar el frontend en un servidor separado (por ejemplo, en el puerto 3000 o 5500):

1. Abra una nueva terminal y navegue a la carpeta web:
   ```powershell
   cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\web
   ```
2. Inicie un servidor HTTP con Python:
   ```powershell
   python -m http.server 3000
   ```
3. Abra su navegador en: **`http://localhost:3000`**

> El archivo `js/api.js` ya cuenta con la URL base apuntando a `http://localhost:8000/api/v1` y el backend tiene CORS habilitado para todos los orígenes (`*`).

---

## 📱 Fase 4: Ejecución de la Aplicación Móvil (Flutter)

La aplicación móvil permite a los clientes explorar el catálogo omnicanal, consultar disponibilidad por sucursal física, ver especificaciones de prenda con colores HEX y autenticarse con RBAC / OTP.

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

* **TC01:** Login RBAC Válido de Administrador (Emisión de JWT).
* **TC02:** Bloqueo preventivo de cuenta tras 5 intentos fallidos consecutivos.
* **TC03:** Auto-registro de nuevo cliente con rol por defecto `CLIENTE`.
* **TC04:** Flujo criptográfico de recuperación de contraseña con token OTP de 6 dígitos (15 min).
* **TC05:** Desbloqueo administrativo de cuentas bloqueadas por rol `ADMINISTRADOR`.
* **TC06:** Registro de sucursal con validación de coordenadas GPS y probadores físicos.
* **TC07:** Alta de prenda de vestir con atributos de moda (SKU único, colores HEX, tallas).
* **TC08:** Gestión de temporadas comerciales y colecciones estacionales (SS / FW).
* **TC09:** Registro de proveedor textil con validación de unicidad de NIT.
* **TC10:** Valuación matemática de inventario mediante Costo Promedio Ponderado (CPP).
* **TC11:** Consulta omnicanal de catálogo y disponibilidad física en tiempo real por sucursal.

### Ejecutar las Pruebas:

Desde la carpeta `prototipo/backend`:

```powershell
cd c:\Users\User\Documents\2-2026\SI2\1erPARCIAL\prototipo\backend
python -m pytest tests/test_ciclo1_api.py -v
```

*Resultado esperado:*
```text
tests/test_ciclo1_api.py::test_tc01_login_rbac_administrador_valido PASSED
tests/test_ciclo1_api.py::test_tc02_login_bloqueo_preventivo_5_intentos PASSED
tests/test_ciclo1_api.py::test_tc03_autoregistro_cliente_nuevo PASSED
tests/test_ciclo1_api.py::test_tc04_recuperacion_password_otp_6_digitos PASSED
tests/test_ciclo1_api.py::test_tc05_desbloqueo_administrativo_cajero PASSED
tests/test_ciclo1_api.py::test_tc06_alta_sucursal_gps_probadores PASSED
tests/test_ciclo1_api.py::test_tc07_alta_producto_con_colores_hex_y_tallas PASSED
tests/test_ciclo1_api.py::test_tc08_temporada_campana_estacional PASSED
tests/test_ciclo1_api.py::test_tc09_proveedor_unicidad_nit PASSED
tests/test_ciclo1_api.py::test_tc10_recalculo_matematico_cpp PASSED
tests/test_ciclo1_api.py::test_tc11_catalogo_omnicanal_disponibilidad_sucursal PASSED

======================= 11 passed in 7.19s =======================
```

---

## 👥 Credenciales y Datos de Prueba (Seed Data)

Todos los usuarios de prueba tienen la contraseña predeterminada: **`Admin123*`**

| Rol | Correo Electrónico | Contraseña | Estado Inicial | Propósito en la Demostración |
| :--- | :--- | :--- | :---: | :--- |
| **ADMINISTRADOR** | `alberto.delgado@store.bo` | `Admin123*` | `ACTIVO` | Acceso total a todos los módulos y gestión RBAC. |
| **ADMINISTRADOR** | `andy.mujica@store.bo` | `Admin123*` | `ACTIVO` | Acceso total a todos los módulos y gestión RBAC. |
| **ENCARGADO DE SUCURSAL** | `carlos.morales@store.bo` | `Admin123*` | `ACTIVO` | Gestión de inventario, stock y sucursal Equipetrol. |
| **CAJERO** | `javier.roca@store.bo` | `Admin123*` | `BLOQUEADO` | Permite demostrar el **Caso de Uso CU04** (Desbloqueo administrativo por un admin). |
| **LOGÍSTICA** | `mateo.logistica@store.bo` | `Admin123*` | `ACTIVO` | Consulta de inventario centralizado y proveedores. |
| **CLIENTE** | `rodrigo.cliente@gmail.com` | `Admin123*` | `ACTIVO` | Cuenta para compra en línea y prueba de OTP (Código OTP sembrado: `482915`). |

---

## ❓ Solución de Problemas Frecuentes (FAQ)

### 1. ¿Qué hago si no tengo PostgreSQL instalado o el servicio está detenido?
No necesita instalar nada extra. El backend incluye un mecanismo de detección automática de errores de conexión. Si PostgreSQL no responde, el sistema emitirá una advertencia y cargará inmediatamente la base de datos local SQLite:
```text
[DATABASE] Advertencia: No se pudo conectar a PostgreSQL (...). Usando SQLite de respaldo.
```
Todo el sistema (FastAPI, Web y Móvil) funcionará con total normalidad.

### 2. Error al ejecutar las pruebas: `ModuleNotFoundError: No module named 'app'`
Asegúrese de ejecutar las pruebas anteponiendo `python -m pytest`:
```powershell
python -m pytest tests/test_ciclo1_api.py -v
```
Esto garantiza que la raíz de `prototipo/backend` se añada correctamente al `sys.path` de Python.

### 3. La aplicación móvil en emulador no conecta con el backend
* Verifique que en `lib/core/constants/api_constants.dart` la URL sea:
  `http://10.0.2.2:8000/api/v1` (la dirección IP especial que usa el emulador Android de Google para acceder al localhost de la máquina anfitriona).
* Si ejecuta en dispositivo físico, conecte su celular a la misma red Wi-Fi que su PC y reemplace `10.0.2.2` con la IP local de su computadora (ej. `http://192.168.1.15:8000/api/v1`).
* Si ejecuta en Windows Desktop o Chrome, use `http://localhost:8000/api/v1`.

### 4. Política de ejecución de scripts de PowerShell (`Activate.ps1`)
Si al intentar activar el entorno virtual recibe un error de `ExecutionPolicy`:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

---

*Desarrollado para la materia Sistemas de Información II (SI2) — Semestre 2-2026*  
*Docente: MSc. Ing. Angélica Garzón Cuéllar*  
*Integrantes: Alberto Delgado & Andy Mujica*
