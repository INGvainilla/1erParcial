# Plan: Portar App Web Angular → App Móvil Flutter (Ciclo 1 + Ciclo 2 Completo)

## Contexto

La aplicación web Angular (`prototipo/web`) implementa 18 Casos de Uso (CU01–CU18) con 18 pantallas, 5 roles RBAC, 9 servicios de API, y conecta al backend FastAPI (`prototipo/backend`) en `http://localhost:8000/api/v1`. La app móvil Flutter (`prototipo/movil`) actualmente solo tiene **5 pantallas** (Login, Registro, OTP, Catálogo, Detalle Prenda) cubriendo CU01–CU03 y CU10 parcialmente.

**Objetivo**: Crear una app Flutter **completamente funcional** con la misma funcionalidad, roles, y experiencia del web, reutilizando el mismo backend sin modificaciones.

---

## Estado Actual del Proyecto Móvil

| Componente | Estado |
|:---|:---|
| Flutter 3.47.1, Dart 3.13.1 | ✅ Instalado |
| `pubspec.yaml` | Solo `http`, `flutter_secure_storage`, `google_fonts`, `provider` |
| `lib/core/` | `api_constants.dart` (solo 6 endpoints), `app_theme.dart` (básico) |
| `lib/modules/auth/` | `login_screen.dart`, `registro_screen.dart`, `otp_screen.dart` |
| `lib/modules/catalogo/` | `catalogo_screen.dart`, `detalle_prenda_screen.dart` |
| **Módulos faltantes** | Carrito, Reservas, Checkout, Pagos, POS, Dashboard, Usuarios, Sucursales, Productos, Temporadas, Proveedores, Inventario, Logística, Tracking, Admin Pagos, Escáner QR |

---

## Arquitectura Flutter Propuesta

```
lib/
├── main.dart                         # App entry, MultiProvider, routing
├── core/
│   ├── constants/api_constants.dart   # Todos los endpoints (actualizado)
│   ├── theme/app_theme.dart           # Dark theme premium (actualizado)
│   ├── models/                        # Modelos Dart tipados
│   │   ├── usuario.dart
│   │   ├── sucursal.dart
│   │   ├── producto.dart
│   │   ├── catalogo_item.dart
│   │   ├── carrito.dart
│   │   ├── reserva.dart
│   │   ├── orden.dart
│   │   ├── pago.dart
│   │   └── logistica.dart
│   ├── services/                      # Servicios HTTP (equivalentes a los 9 del web)
│   │   ├── api_service.dart           # HTTP base con interceptor de token
│   │   ├── auth_service.dart          # CU01, CU02, CU03
│   │   ├── fashion_api_service.dart   # CU04–CU10 (CRUD)
│   │   ├── carrito_service.dart       # CU13
│   │   ├── checkout_service.dart      # CU14
│   │   ├── reservas_service.dart      # CU11, CU12
│   │   ├── pagos_service.dart         # CU16
│   │   ├── pos_service.dart           # CU15
│   │   ├── logistica_service.dart     # CU18
│   │   └── pago_config_service.dart   # CU17
│   ├── providers/                     # ChangeNotifier providers
│   │   ├── auth_provider.dart         # Estado de sesión, roles RBAC
│   │   └── carrito_provider.dart      # Estado reactivo del carrito
│   └── widgets/                       # Widgets reutilizables
│       ├── custom_drawer.dart         # Navegación lateral con RBAC
│       ├── bottom_nav_bar.dart        # Barra inferior contextual
│       └── toast_widget.dart          # Snackbar estilizado
├── modules/
│   ├── auth/views/                    # CU01, CU02, CU03 (ya existen, actualizar)
│   │   ├── login_screen.dart
│   │   ├── registro_screen.dart
│   │   └── otp_screen.dart
│   ├── catalogo/views/                # CU10 (ya existen, agregar carrito)
│   │   ├── catalogo_screen.dart
│   │   └── detalle_prenda_screen.dart
│   ├── carrito/views/                 # CU13 [NUEVO]
│   │   └── carrito_screen.dart
│   ├── reservas/views/                # CU11, CU12 [NUEVO]
│   │   ├── crear_reserva_screen.dart
│   │   └── mis_tickets_screen.dart
│   ├── checkout/views/                # CU14 [NUEVO]
│   │   ├── checkout_screen.dart
│   │   └── confirmacion_screen.dart
│   ├── pagos/views/                   # CU16 [NUEVO]
│   │   └── pago_orden_screen.dart
│   ├── dashboard/views/               # Panel Admin [NUEVO]
│   │   └── dashboard_screen.dart
│   ├── usuarios/views/                # CU04 [NUEVO]
│   │   └── usuarios_screen.dart
│   ├── sucursales/views/              # CU05 [NUEVO]
│   │   └── sucursales_screen.dart
│   ├── productos/views/               # CU06 [NUEVO]
│   │   └── productos_screen.dart
│   ├── temporadas/views/              # CU07 [NUEVO]
│   │   └── temporadas_screen.dart
│   ├── proveedores/views/             # CU08 [NUEVO]
│   │   └── proveedores_screen.dart
│   ├── inventario/views/              # CU09 [NUEVO]
│   │   └── inventario_screen.dart
│   ├── pos/views/                     # CU15 [NUEVO]
│   │   └── pos_terminal_screen.dart
│   ├── admin_pagos/views/             # CU17 [NUEVO]
│   │   └── admin_pagos_screen.dart
│   ├── logistica/views/               # CU18 [NUEVO]
│   │   └── logistica_screen.dart
│   ├── tracking/views/                # CU18 tracking [NUEVO]
│   │   └── tracking_screen.dart
│   └── encargado/views/               # CU12 Encargado [NUEVO]
│       ├── reservas_dia_screen.dart
│       └── escaner_qr_screen.dart
```

---

## Dependencias a Agregar en `pubspec.yaml`

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  flutter_secure_storage: ^9.0.0
  google_fonts: ^6.1.0
  provider: ^6.1.1
  # NUEVAS:
  intl: ^0.19.0              # Formateo de fechas y moneda
  qr_flutter: ^4.1.0         # Generar QR para reservas (CU11)
  mobile_scanner: ^6.0.0     # Escanear QR (CU12)
  cached_network_image: ^3.4.0  # Imágenes cacheadas del catálogo
  shimmer: ^3.0.0             # Loading skeletons premium
  flutter_slidable: ^3.1.0   # Swipe actions en listas
  url_launcher: ^6.3.0       # Abrir URLs externas
```

---

## Roles y Navegación RBAC (Idéntico al Web)

| Rol | Pantallas Permitidas |
|:---|:---|
| **Invitado** (sin login) | Catálogo, Login, Registro, OTP |
| **CLIENTE** | Catálogo, Reservar Prenda, Mis Tickets QR, Carrito/Bolsa, Checkout, Pago, Tracking |
| **ADMINISTRADOR** | Todo: Dashboard, Usuarios, Sucursales, Productos, Temporadas, Proveedores, Inventario, Reservas Encargado, Escáner QR, POS, Admin Pagos, Logística + todo de Cliente |
| **ENCARGADO_SUCURSAL** | POS, Reservas del Día, Escáner QR, Inventario (su sucursal), Sucursales, Productos |
| **CAJERO** | POS, Catálogo (consulta precios) |
| **LOGISTICA** | Inventario (entradas), Proveedores, Productos (consulta), Logística/Despacho |

---

## Cambios Propuestos (Desglose por Componente)

---

### 1. Infraestructura Core

#### [MODIFY] `pubspec.yaml`
Agregar las 7 nuevas dependencias listadas arriba.

#### [MODIFY] `lib/core/constants/api_constants.dart`
Ampliar con todos los endpoints faltantes: `/carrito`, `/reservas`, `/ordenes`, `/pagos`, `/pos`, `/logistica`, `/configuracion/pagos`, `/dashboard/metricas`, `/usuarios`, `/productos`, `/temporadas`, `/proveedores`, `/inventario`.

#### [MODIFY] `lib/core/theme/app_theme.dart`
Expandir el tema oscuro premium para que sea idéntico al web: Google Fonts Outfit/Inter, gradientes accent, colores de roles, estilos de Cards glassmorphism.

---

### 2. Modelos Dart Tipados (9 archivos nuevos)

#### [NEW] `lib/core/models/usuario.dart`
Clases `Usuario`, `LoginResponse` con factory `fromJson`.

#### [NEW] `lib/core/models/sucursal.dart`
Clases `Ciudad`, `Sucursal` con factory `fromJson`.

#### [NEW] `lib/core/models/producto.dart`
Clases `Categoria`, `Marca`, `ColorVariante`, `TallaVariante`, `Producto`, `Temporada`, `Proveedor`.

#### [NEW] `lib/core/models/catalogo_item.dart`
Clases `CatalogoItem`, `StockSucursalItem`, `InventarioVarianteItem`.

#### [NEW] `lib/core/models/carrito.dart`
Clases `CarritoItem`, `CarritoData`.

#### [NEW] `lib/core/models/reserva.dart`
Clases `ReservaCreate`, `ReservaResponse`, `ReservaDetalle`.

#### [NEW] `lib/core/models/orden.dart`
Clases `OrdenCreateRequest`, `OrdenData`, `OrdenDetalleItem`.

#### [NEW] `lib/core/models/pago.dart`
Clases `IntencionPagoResponse`, `TransaccionResponse`, `MetodoPagoConfig`.

#### [NEW] `lib/core/models/logistica.dart`
Clases `OrdenLogistica`, `TrackingOrden`, `TrackingPaso`, `PrendaEmpaque`.

---

### 3. Servicios HTTP (10 archivos: 1 base + 9 de negocio)

#### [NEW] `lib/core/services/api_service.dart`
Clase base para todas las peticiones HTTP con:
- Token JWT automático en headers (`Bearer $token`)
- Base URL configurable (emulador `10.0.2.2:8000`, dispositivo real IP local)
- Métodos `get()`, `post()`, `put()`, `patch()`, `delete()` tipados

#### [MODIFY → REWRITE] `lib/core/services/auth_service.dart`
Port 1:1 del web `auth.service.ts`: login, registro, solicitar OTP, verificar OTP, logout. Guardar token en `flutter_secure_storage`.

#### [NEW] `lib/core/services/fashion_api_service.dart`
Port 1:1 del web `fashion-api.service.ts`: CRUD de Usuarios, Sucursales, Ciudades, Productos, Categorías, Marcas, Temporadas, Proveedores, Inventario, Kardex, Catálogo, Dashboard.

#### [NEW] `lib/core/services/carrito_service.dart`
Port 1:1 del web `carrito.service.ts`: cargarCarrito, agregarItem, actualizarCantidad, eliminarItem, vaciarCarrito.

#### [NEW] `lib/core/services/reservas_service.dart`
Port de la API de reservas del web: crearReserva, listarMisReservas, obtenerReservaPorId.

#### [NEW] `lib/core/services/checkout_service.dart`
Port 1:1 del web `checkout.service.ts`: procesarCheckout, obtenerOrden.

#### [NEW] `lib/core/services/pagos_service.dart`
Port 1:1 del web `pagos.service.ts`: crearIntencionPago, confirmarPago, obtenerTransaccionOrden.

#### [NEW] `lib/core/services/pos_service.dart`
Port 1:1 del web `pos.service.ts`: lookupProducto, lookupReserva, procesarVenta.

#### [NEW] `lib/core/services/logistica_service.dart`
Port 1:1 del web `logistica.service.ts`: getOrdenes, asignarRepartidor, cambiarEstado, getTracking, calcularTarifa.

#### [NEW] `lib/core/services/pago_config_service.dart`
Port 1:1 del web `pago-config.service.ts`: getMetodos, getMetodosActivos, actualizarMetodo.

---

### 4. Providers (Estado Reactivo)

#### [NEW] `lib/core/providers/auth_provider.dart`
`ChangeNotifier` que encapsula `AuthService` con:
- Estado: `currentUser`, `token`, `isAuthenticated`, `isLoading`
- Métodos RBAC: `isAdmin()`, `isManager()`, `isCashier()`, `isLogistics()`, `isClient()`
- Persistencia del token en `flutter_secure_storage`
- Auto-load al iniciar la app

#### [NEW] `lib/core/providers/carrito_provider.dart`
`ChangeNotifier` que encapsula `CarritoService` con:
- Estado reactivo: `items`, `totalItems`, `totalGeneral`, `isLoading`
- Métodos: `cargarCarrito()`, `agregarItem()`, `actualizarCantidad()`, `eliminarItem()`, `vaciarCarrito()`

---

### 5. Widgets Reutilizables

#### [NEW] `lib/core/widgets/custom_drawer.dart`
Drawer lateral con la misma estructura de navegación RBAC del web sidebar:
- Secciones: "Tienda Digital", "Administración Central", "Operaciones de Tienda", "Almacén", "POS", "Zona Clientes"
- Mostrar/ocultar secciones según rol del usuario
- Footer con información del usuario activo y botón de logout
- Mismo estilo dark mode premium

#### [NEW] `lib/core/widgets/bottom_nav_bar.dart`
Bottom navigation con 4–5 tabs contextuales según rol (equivalente al `mobile-bottom-bar` del web responsivo).

#### [NEW] `lib/core/widgets/toast_widget.dart`
Helper para mostrar SnackBars estilizados (éxito verde, error rojo, info azul).

---

### 6. Pantallas (18+ screens)

#### [MODIFY] `lib/modules/auth/views/login_screen.dart`
- Actualizar para usar `AuthProvider` y `Navigator.pushReplacementNamed`
- Agregar "recordar sesión" toggle
- Redirigir al catálogo con el Drawer completo

#### [MODIFY] `lib/modules/auth/views/registro_screen.dart`
- Conectar con `AuthProvider.register()`

#### [MODIFY] `lib/modules/auth/views/otp_screen.dart`
- Conectar con `AuthProvider.requestOtp()` y `resetPasswordOtp()`

#### [MODIFY] `lib/modules/catalogo/views/catalogo_screen.dart`
- Agregar filtros: categoría, marca, temporada, talla, sucursal
- Grid de 2 columnas (estilo Zara)
- Botón "Agregar al Carrito" y "Reservar" en cada tarjeta
- Search bar con debounce
- FAB de carrito con badge

#### [MODIFY] `lib/modules/catalogo/views/detalle_prenda_screen.dart`
- Selector de color/talla interactivo
- Botones: "Agregar a Bolsa" y "Reservar en Tienda"
- Mostrar disponibilidad por sucursal

#### [NEW] `lib/modules/carrito/views/carrito_screen.dart` (CU13)
- Lista de ítems con imagen, nombre, talla, color, precio
- Control de cantidad (+/-)
- Swipe-to-delete
- Resumen de totales
- Botón "Proceder al Checkout"
- Botón "Vaciar Carrito"

#### [NEW] `lib/modules/reservas/views/crear_reserva_screen.dart` (CU11)
- Formulario: selección de sucursal, fecha, prendas, tallas, colores, cantidades
- Botón "Confirmar Reserva"
- Mostrar QR resultante

#### [NEW] `lib/modules/reservas/views/mis_tickets_screen.dart` (CU11)
- Lista de reservas del usuario con QR code renderizado (`qr_flutter`)
- Estado de cada reserva con badges de colores
- Pull-to-refresh

#### [NEW] `lib/modules/checkout/views/checkout_screen.dart` (CU14)
- Stepper wizard: Modalidad de Entrega → Facturación → Revisión
- Selector: Retiro en Tienda vs. Delivery
- Formulario de NIT y Razón Social
- Resumen de pedido con desglose

#### [NEW] `lib/modules/checkout/views/confirmacion_screen.dart` (CU14)
- Resumen de la orden generada
- Botón "Proceder al Pago"
- Número de factura

#### [NEW] `lib/modules/pagos/views/pago_orden_screen.dart` (CU16)
- Pantalla de pago simulado (sin Stripe Elements nativo, confirmación directa)
- Estado del pago: Pendiente → Pagado
- Botón "Confirmar Pago"

#### [NEW] `lib/modules/dashboard/views/dashboard_screen.dart` (Admin)
- Métricas KPIs (total usuarios, ventas, reservas, productos)
- Cards de resumen con iconos

#### [NEW] `lib/modules/usuarios/views/usuarios_screen.dart` (CU04)
- Lista de usuarios con rol y estado
- Crear, editar, desbloquear usuarios
- Cambio de rol con dialog

#### [NEW] `lib/modules/sucursales/views/sucursales_screen.dart` (CU05)
- Lista de sucursales con ciudad, GPS, capacidad probadores
- Crear sucursal con mapa/coordenadas

#### [NEW] `lib/modules/productos/views/productos_screen.dart` (CU06)
- Lista de productos con SKU, categoría, marca, temporada
- Crear producto con colores HEX y tallas

#### [NEW] `lib/modules/temporadas/views/temporadas_screen.dart` (CU07)
- Lista de temporadas con fecha inicio/fin y descuento
- Crear temporada

#### [NEW] `lib/modules/proveedores/views/proveedores_screen.dart` (CU08)
- Lista de proveedores con NIT, razón social, estado
- Crear proveedor

#### [NEW] `lib/modules/inventario/views/inventario_screen.dart` (CU09)
- Stock por sucursal con CPP
- Registro de entrada de mercadería
- Visor de Kardex

#### [NEW] `lib/modules/pos/views/pos_terminal_screen.dart` (CU15)
- Búsqueda de producto por SKU
- Lista de ítems del ticket
- Selección de método de pago (Efectivo/Tarjeta/QR)
- Cálculo de cambio
- Ticket de venta resultante

#### [NEW] `lib/modules/admin_pagos/views/admin_pagos_screen.dart` (CU17)
- Lista de métodos de pago configurables
- Toggle activo/inactivo
- Edición de credenciales

#### [NEW] `lib/modules/logistica/views/logistica_screen.dart` (CU18)
- Tablero de órdenes por estado logístico
- Asignar repartidor
- Cambiar estado (FSM: PENDIENTE → EN_PREPARACIÓN → EN_CAMINO → ENTREGADO)

#### [NEW] `lib/modules/tracking/views/tracking_screen.dart` (CU18)
- Timeline vertical de progreso
- Datos del repartidor
- Detalle de prendas

#### [NEW] `lib/modules/encargado/views/reservas_dia_screen.dart` (CU12)
- Lista de reservas del día en la sucursal
- Cambio de estado de reservas

#### [NEW] `lib/modules/encargado/views/escaner_qr_screen.dart` (CU12)
- Cámara con `mobile_scanner` para leer QR
- Validación de reserva contra backend
- Mostrar datos del cliente y prendas reservadas

---

### 7. Actualización de `main.dart`

- `MultiProvider` con `AuthProvider` y `CarritoProvider`
- Routing con `MaterialApp` usando `routes:` named routes para todas las pantallas
- Splash screen que verifica token guardado y redirige automáticamente
- Tema dark premium con Google Fonts

---

## Verificación

### Automatizada
```bash
cd prototipo/movil
flutter pub get
flutter analyze
flutter build apk --debug     # Verificar compilación
```

### Manual
1. Ejecutar con `flutter run` conectando al backend en `http://10.0.2.2:8000` (emulador) o IP local (dispositivo)
2. Probar login con credenciales: `alberto.delgado@store.bo` / `Admin123*` (ADMINISTRADOR)
3. Navegar por todas las pantallas según rol
4. Verificar: Catálogo con filtros, Carrito (agregar/quitar), Reserva con QR, Checkout wizard, POS, Dashboard métricas, Inventario/Kardex, Logística FSM

---

## Open Questions

> [!IMPORTANT]
> **¿Deseas que la app Flutter se ejecute en un emulador Android o en Chrome (flutter run -d chrome)?** El emulador usa `10.0.2.2` para conectar al localhost, mientras que Chrome usa `localhost` directamente.

> [!NOTE]
> El módulo de pagos CU16 en la web usa Stripe Elements (JavaScript). En Flutter no se puede usar Stripe Elements directamente. La implementación móvil usará un **flujo de confirmación simulado** (mismo endpoint `/pagos/confirmar` del backend), sin formulario de tarjeta nativo. Esto es consistente con el enfoque de prototipo.
