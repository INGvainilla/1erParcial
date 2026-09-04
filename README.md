# FashionStore — Plataforma Inteligente de Comercio Electrónico Omnicanal

> **Sistemas de Información II (SI2) — Semestre 2-2026**  
> **Docente:** MSc. Ing. Angélica Garzón Cuéllar  
> **Metodología:** Proceso Unificado de Desarrollo de Software (PUDS) — UML 2.5+  
> **Integrantes del Equipo:**  
> * Alberto Delgado (Desarrollador Full Stack)  
> * Andy Mujica (Desarrollador Full Stack)  

---

## ⚡ Guía Rápida de Ejecución

Para consultar el manual completo con capturas de pantalla, explicaciones de arquitectura y casos de prueba, revise:
👉 **[INSTRUCCIONES_EJECUCION.md](file:///c:/Users/User/Documents/2-2026/SI2/1erPARCIAL/INSTRUCCIONES_EJECUCION.md)**

A continuación se resumen los comandos esenciales para levantar los tres componentes (Backend, Web y Móvil):

---

### 1. Backend (FastAPI + PostgreSQL / SQLite)

```powershell
# 1. Navegar a la carpeta backend
cd prototipo\backend

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Poblar datos semilla (usuarios, tiendas GPS, catálogo e inventario CPP)
python app\scripts\seed_data.py

# 4. Iniciar servidor FastAPI
python run.py
```
* **API Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **API ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Web (SPA Glassmorphism)

El backend de FastAPI ya sirve el frontend web automáticamente:
👉 Ingrese directamente en su navegador a: **[http://localhost:8000/](http://localhost:8000/)**

*(Opcional: Si desea ejecutarlo en un servidor HTTP independiente en el puerto 3000):*
```powershell
cd prototipo\web
python -m http.server 3000
# Abrir http://localhost:3000 en el navegador
```

---

### 3. Aplicación Móvil (Flutter 3.x / Dart)

```powershell
# 1. Navegar a la carpeta móvil
cd prototipo\movil

# 2. Obtener paquetes y dependencias
flutter pub get

# 3. Ejecutar según el dispositivo:
# Para Windows Desktop:
flutter run -d windows

# Para Navegador Web (Chrome):
flutter run -d chrome

# Para Emulador Android o dispositivo conectado:
flutter run
```
> **Nota de red:** Para emulador Android oficial se utiliza `http://10.0.2.2:8000/api/v1` (configurado por defecto en `lib/core/constants/api_constants.dart`). Para Windows desktop o web se usa `http://localhost:8000/api/v1`.

---

### 4. Pruebas Automatizadas (Pytest)

Ejecución de los 11 escenarios formales de prueba de caja negra (TC01 - TC11):
```powershell
cd prototipo\backend
python -m pytest tests\test_ciclo1_api.py -v
```

---

### 5. Credenciales de Demostración

Contraseña para todas las cuentas: **`Admin123*`**

* **Administrador:** `alberto.delgado@store.bo`
* **Administrador:** `andy.mujica@store.bo`
* **Encargado Sucursal:** `carlos.morales@store.bo`
* **Cajero (Bloqueado preventivamente para prueba de desbloqueo):** `javier.roca@store.bo`
* **Logística:** `mateo.logistica@store.bo`
* **Cliente:** `rodrigo.cliente@gmail.com` (Código OTP de recuperación: `482915`)
