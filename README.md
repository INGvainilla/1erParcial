# FashionStore - Plataforma E-Commerce Omnicanal
## Ciclo 1: Fundamentos y Módulos Base (Sistemas de Información II - 2-2026)

**Autores:** Alberto Delgado & Andy Mujica  
**Docente:** MSc. Ing. Angélica Garzón Cuéllar  
**Metodología:** Proceso Unificado de Desarrollo de Software (PUDS)  
**Estándar de Modelado:** UML 2.5+  

---

## 🚀 Descripción del Proyecto

FashionStore es una plataforma inteligente de comercio electrónico omnicanal orientada a la moda masculina, integrando vestidores virtuales, catálogos en 3D/RA y gestión empresarial centralizada.

### Casos de Uso Implementados (Ciclo 1)
- **CU01**: Autenticar Usuario y Control de Acceso (RBAC con roles Administrador, Supervisor, Encargado, Vendedor, Cliente).
- **CU02**: Registrar Cliente (Auto-registro con asignación automática de rol Cliente).
- **CU03**: Recuperar Contraseña (Token OTP de 6 dígitos con expiración de 15 min y envío real vía SMTP Gmail).
- **CU04**: Gestionar Usuarios y Roles (Alta/Edición/Bloqueo/Desbloqueo de cuentas y reasignación de sucursales).
- **CU05**: Gestionar Ciudades y Sucursales Físicas (Geolocalización GPS y capacidad de probadores).
- **CU06**: Gestionar Catálogo de Productos y Atributos de Moda (SKU único, colores HEX, tallas S/M/L/XL, imágenes de alta resolución).
- **CU07**: Gestionar Temporadas y Colecciones (Primavera-Verano / Otoño-Invierno y porcentajes de descuento).
- **CU08**: Gestionar Proveedores Textiles (NIT único, plazos comerciales y contacto).
- **CU09**: Gestionar Inventario Multi-Sucursal y Costos Ponderados (Recálculo matemático de Costo Promedio Ponderado - CPP y trazabilidad en Kardex).
- **CU10**: Consultar Catálogo y Disponibilidad por Sucursal (Búsqueda omnicanal en tiempo real).

---

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 19 (Standalone Components, TypeScript, CSS3 moderno, FontAwesome, HashLocationStrategy).
- **Backend:** FastAPI (Python 3.11), Pydantic v2, SQLAlchemy ORM, Uvicorn, Passlib (Bcrypt), PyJWT.
- **Base de Datos:** PostgreSQL (en producción) / SQLite (entorno local).
- **Contenedorización:** Docker Multi-stage (Node.js 20 + Python 3.11).

---

## 🌐 Despliegue en la Nube (Render / Railway)

El repositorio está completamente configurado para despliegue continuo con un solo clic a través de Docker multi-stage.

### Variables de Entorno Requeridas en la Nube
| Variable | Descripción | Valor por defecto / Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto HTTP expuesto por la plataforma | `8000` (o asignado automáticamente) |
| `SECRET_KEY` | Clave criptográfica para firmas JWT | Cadena aleatoria segura |
| `DATABASE_URL` | URL de conexión PostgreSQL (opcional) | Si no se define, usa SQLite integrado |
| `EMAIL_HOST_USER` | Correo emisor SMTP para OTP | `mrgrueso2005@gmail.com` |
| `EMAIL_HOST_PASSWORD`| Contraseña de aplicación Gmail | `plwx ztda stmt qxeu` |
| `DEFAULT_FROM_EMAIL`| Remitente de correos | `SIGEPSI <mrgrueso2005@gmail.com>` |

---

## 🔑 Credenciales de Prueba (Datos Semilla Oficiales)

Al arrancar la aplicación por primera vez en cualquier entorno, la base de datos se siembra automáticamente:

| Rol | Correo Electrónico | Contraseña | Sucursal Asignada |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@fashionstore.bo` | `Admin123*` | Sede Central Santa Cruz |
| **Supervisor** | `supervisor@fashionstore.bo` | `Supervisor123*` | Mall Las Brisas SCZ |
| **Encargado Inventario**| `inventario@fashionstore.bo` | `Inventario123*` | Sucursal San Miguel LPZ |
| **Vendedor** | `vendedor@fashionstore.bo` | `Vendedor123*` | Sucursal Prado CBBA |
| **Cliente Frecuente** | `cliente@fashionstore.bo` | `Cliente123*` | Cliente Web Omnicanal |
