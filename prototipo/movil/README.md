# FashionStore Mobile - Aplicación Móvil (Ciclo 1)

Aplicación móvil nativa multiplataforma desarrollada en **Flutter 3.x / Dart** conforme al documento oficial de especificación (`documento.md`) para la materia **Sistemas de Información II (2-2026)**.

## Integrantes del Equipo de Desarrollo
* **Alberto Delgado** (Desarrollador Full Stack)
* **Andy Mujica** (Desarrollador Full Stack)

---

## Casos de Uso Implementados (Ciclo 1)
* **CU01**: Inicio de Sesión seguro con control de acceso basado en roles (RBAC) y feedback de bloqueo preventivo tras 5 intentos fallidos (`lib/modules/auth/views/login_screen.dart`).
* **CU02**: Auto-registro de clientes con cifrado de contraseñas (`lib/modules/auth/views/registro_screen.dart`).
* **CU03**: Recuperación de contraseñas mediante token OTP criptográfico de 6 dígitos con ventana de validez de 15 minutos (`lib/modules/auth/views/otp_screen.dart`).
* **CU06**: Visualización de ficha técnica de productos con paleta normalizada de colores en código HEX, tallas y soporte para modelos 3D / Realidad Aumentada (`lib/modules/catalogo/views/detalle_prenda_screen.dart`).
* **CU10**: Catálogo digital omnicanal con buscador, filtros y consulta de disponibilidad de existencias físicas en tiempo real por sucursal (`lib/modules/catalogo/views/catalogo_screen.dart`).

---

## Estructura de Directorios
```
prototipo/movil/
├── lib/
│   ├── core/
│   │   ├── constants/api_constants.dart   # Endpoints hacia FastAPI (http://localhost:8000/api/v1)
│   │   └── theme/app_theme.dart          # Paleta Dark Mode y tipografía
│   ├── modules/
│   │   ├── auth/
│   │   │   └── views/
│   │   │       ├── login_screen.dart      # CU01: Login RBAC
│   │   │       ├── registro_screen.dart   # CU02: Auto-registro
│   │   │       └── otp_screen.dart        # CU03: Recuperación OTP
│   │   └── catalogo/
│   │       └── views/
│   │           ├── catalogo_screen.dart   # CU10: Catálogo omnicanal
│   │           └── detalle_prenda_screen.dart # CU06 / CU10: Ficha y tiendas
│   └── main.dart                          # Punto de entrada de la app
└── pubspec.yaml                           # Dependencias Flutter
```

---

## Instrucciones de Ejecución
1. Asegúrese de que el backend FastAPI esté ejecutándose en el puerto 8000:
   ```bash
   cd ../backend
   python run.py
   ```
2. Ejecute la aplicación en el emulador o dispositivo:
   ```bash
   flutter pub get
   flutter run
   ```
   * *Nota para emulador Android*: En `lib/core/constants/api_constants.dart`, se utiliza `http://10.0.2.2:8000/api/v1` para conectar al localhost del host.
