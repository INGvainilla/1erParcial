# 🚀 Guía Rápida: Comandos para Ejecutar el Entorno Web y Pruebas

> **FashionStore — Ciclo 1 (SI2 2-2026)**  
> **Ubicación del proyecto:** `c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial`  
> *Nota: Como ya tienes todas las dependencias instaladas (`venv` y `node_modules`), sigue los pasos a continuación.*

---

## ⚡ 1. Opción Recomendada: Modo Desarrollo (Hot-Reload)

Permite ver cambios en tiempo real tanto en el backend como en el frontend web.

### Terminal 1: Servidor Backend (FastAPI)
Abre una terminal PowerShell o CMD y ejecuta:

```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\backend
.\venv\Scripts\activate
python run.py
```
* **URL Backend API:** `http://localhost:8000`
* **Swagger Interactivo (OpenAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Terminal 2: Servidor Web Frontend (Angular)
Abre una **segunda** terminal PowerShell o CMD y ejecuta:

```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\web
npm start
```
* **URL Aplicación Web:** [http://localhost:4200](http://localhost:4200)

> Al abrir `http://localhost:4200`, serás redirigido automáticamente a `/catalogo` para comenzar a interactuar con el sistema.

---

## 📦 2. Opción Alternativa: Modo Unificado (1 Sola Terminal o Doble Clic)

FastAPI ya tiene compilada la aplicación web en `web_dist`. Puedes levantar todo con un solo comando o archivo:

### Opción con archivo .bat:
Simplemente haz doble clic en:
* `iniciar_sistema.bat` (en la raíz del proyecto)

### O desde la Terminal:
```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\backend
.\venv\Scripts\activate
python run.py
```
* **Acceso Web:** [http://localhost:8000/app/](http://localhost:8000/app/) o [http://localhost:8000/](http://localhost:8000/)

> 💡 **Nota si modificas código frontend en este modo:**  
> Ejecuta `prototipo\construir_frontend.bat` o:
> ```powershell
> cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\web
> npm run build
> xcopy /E /Y "dist\web_app\browser\*" "..\backend\web_dist\"
> ```

---

## 🧪 3. Comandos para Ejecutar Pruebas

### A. Pruebas Automatizadas de Backend (Pytest)
Ejecuta la suite completa de 11 Casos de Prueba (TC01 - TC11):

```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\backend
.\venv\Scripts\activate
python -m pytest tests/test_ciclo1_api.py -v
```

### B. Reinicio y Población de Datos Semilla (Seed Data)
Si hiciste pruebas y quieres restablecer la base de datos a su estado original limpio:

```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\backend
.\venv\Scripts\activate
python app/scripts/seed_data.py --reset
```

### C. Pruebas Unitarias de Frontend Angular
Para ejecutar las pruebas del cliente web:

```powershell
cd c:\Users\mujic\Desktop\1erParcial-SI2\1erParcial\prototipo\web
npm test
```

---

## 👥 4. Credenciales de Prueba por Rol (RBAC)

Contraseña universal para todas las cuentas de prueba: **`Admin123*`**

| Rol | Correo Electrónico | Contraseña | Estado | Módulos para Probar |
| :--- | :--- | :--- | :---: | :--- |
| **Administrador** | `alberto.delgado@store.bo` | `Admin123*` | `ACTIVO` | Dashboard, Usuarios (CU04), Sucursales (CU05), Productos (CU06), Temporadas (CU07), Proveedores (CU08), Inventario (CU09), Catálogo. |
| **Administrador** | `andy.mujica@store.bo` | `Admin123*` | `ACTIVO` | Mismos permisos completos de Administrador. |
| **Encargado de Sucursal** | `carlos.morales@store.bo` | `Admin123*` | `ACTIVO` | Inventario local de sucursal, recepción de stock y catálogo. |
| **Logística** | `mateo.logistica@store.bo` | `Admin123*` | `ACTIVO` | Directorio de proveedores textiles, compras e inventario central. |
| **Cajero (Para Desbloqueo CU04)** | `javier.roca@store.bo` | `Admin123*` | `BLOQUEADO` | Prueba ingresar con esta cuenta (fallará por bloqueo). Luego entra como Administrador y desbloquéala con un clic en la vista de Usuarios. |
| **Cliente** | `rodrigo.cliente@gmail.com` | `Admin123*` | `ACTIVO` | Catálogo omnicanal, probador virtual, reservas y recuperación de contraseña OTP (**Código OTP:** `482915`). |
| **Público / Anónimo** | *(Sin iniciar sesión)* | — | `ANÓNIMO` | Catálogo de prendas, visualizador, selección de sucursal y registro de cuenta. |

---

## 📋 5. Resumen de Puertos y Enlaces Rápidos

* 🌐 **Frontend Angular (Dev):** [http://localhost:4200](http://localhost:4200)
* 🚀 **Backend FastAPI:** [http://localhost:8000](http://localhost:8000)
* 📖 **Documentación Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
* 🩺 **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
