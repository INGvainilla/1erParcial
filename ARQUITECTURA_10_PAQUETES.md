# ARQUITECTURA OFICIAL EN 10 PAQUETES (PUDS / UML 2.5+)
**Plataforma Omnicanal FashionStore** — Sistemas de Información II (SI2)

Conforme a la metodología PUDS y a la directriz arquitectónica de alta cohesión y bajo acoplamiento, tanto el **Backend** (`FastAPI`) como el **Frontend** (`Angular 19`) están estructurados físicamente en **exactamente 10 carpetas de paquetes principales**.

---

## 1. Mapeo de los 10 Paquetes Arquitectónicos

| Nro. | Paquete Oficial | Casos de Uso Contenidos | Carpeta Backend (`app/modules/`) | Carpeta Frontend (`src/app/pages/`) |
|:---:|:---|:---:|:---|:---|
| **P01** | **Seguridad y Acceso (RBAC)** | CU01, CU02, CU03, CU04 | `p01_seguridad_acceso/` | `p01_seguridad_acceso/` |
| **P02** | **Estructura Operativa (Sucursales)** | CU05 | `p02_estructura_operativa/` | `p02_estructura_operativa/` |
| **P03** | **Catálogo, Estilismo e IA** | CU06, CU07, CU10, CU19, CU20, CU22, CU23 | `p03_catalogo_estilismo_ia/` | `p03_catalogo_estilismo_ia/` |
| **P04** | **Aprovisionamiento y Proveedores** | CU08 | `p04_aprovisionamiento_proveedores/` | `p04_aprovisionamiento_proveedores/` |
| **P05** | **Inventario, Costos (CPP) y Analítica** | CU09, CU24 | `p05_inventario_costos_analitica/` | `p05_inventario_costos_analitica/` |
| **P06** | **Reservas Presenciales** | CU11, CU12 | `p06_reservas_presenciales/` | `p06_reservas_presenciales/` |
| **P07** | **Venta Digital, Carrito y Fidelización** | CU13, CU14, CU21 | `p07_venta_digital_fidelizacion/` | `p07_venta_digital_fidelizacion/` |
| **P08** | **Punto de Venta POS** | CU15 | `p08_punto_venta_pos/` | `p08_punto_venta_pos/` |
| **P09** | **Procesamiento de Pagos** | CU16, CU17 | `p09_procesamiento_pagos/` | `p09_procesamiento_pagos/` |
| **P10** | **Logística y Delivery** | CU18 | `p10_logistica_delivery/` | `p10_logistica_delivery/` |

---

## 2. Estructura Física en Backend (`prototipo/backend/app/modules/`)

```text
app/modules/
├── p01_seguridad_acceso/
│   ├── auth/                       (CU01 Login, CU02 Registro, CU03 OTP)
│   └── usuarios/                   (CU04 Gestión de Usuarios y Roles)
├── p02_estructura_operativa/
│   └── sucursales/                 (CU05 Ciudades y Sucursales GPS)
├── p03_catalogo_estilismo_ia/
│   ├── catalogo/                   (CU10 Catálogo Omnicanal)
│   ├── productos/                  (CU06 Gestión de Prendas)
│   ├── temporadas/                 (CU07 Temporadas Comerciales)
│   └── ia_recomendaciones/         (CU19, CU20, CU22, CU23 Asistente IA, Clima y Voz)
├── p04_aprovisionamiento_proveedores/
│   └── proveedores/                (CU08 Proveedores Textiles)
├── p05_inventario_costos_analitica/
│   ├── inventario/                 (CU09 Inventario Multi-Sucursal y CPP)
│   └── dashboard/                  (CU24 Cuadros de Mando Ejecutivos)
├── p06_reservas_presenciales/
│   └── reservas/                   (CU11 Reservas, CU12 Atención y Escáner QR)
├── p07_venta_digital_fidelizacion/
│   ├── carrito/                    (CU13 Bolsa de Compras Persistente)
│   ├── ordenes/                    (CU14 Checkout Digital y Facturación)
│   └── gamificacion/               (CU21 Puntos, Niveles e Insignias)
├── p08_punto_venta_pos/
│   └── pos/                        (CU15 Facturación en Caja Mostrador)
├── p09_procesamiento_pagos/
│   └── pagos/                      (CU16 Stripe SDK, CU17 Medios de Cobro)
└── p10_logistica_delivery/
    └── logistica/                  (CU18 Fórmula Haversine y Tracking GPS)
```

---

## 3. Estructura Física en Frontend (`prototipo/web/src/app/pages/`)

```text
src/app/pages/
├── p01_seguridad_acceso/
│   ├── login/
│   └── usuarios/
├── p02_estructura_operativa/
│   └── sucursales/
├── p03_catalogo_estilismo_ia/
│   ├── asistente-ia/
│   ├── catalogo/
│   ├── comparador/
│   ├── productos/
│   └── temporadas/
├── p04_aprovisionamiento_proveedores/
│   └── proveedores/
├── p05_inventario_costos_analitica/
│   ├── dashboard/
│   └── inventario/
├── p06_reservas_presenciales/
│   ├── encargado-dashboard/
│   ├── escaner-qr/
│   └── reservas/
├── p07_venta_digital_fidelizacion/
│   ├── checkout/
│   └── recompensas/
├── p08_punto_venta_pos/
│   └── pos/
├── p09_procesamiento_pagos/
│   ├── admin-pagos/
│   └── pagos/
└── p10_logistica_delivery/
    ├── logistica/
    └── tracking/
```

---

## 4. Estado de Validación Técnica
- **Compilación Frontend Angular:** `npm run build` -> **Código de salida 0 (0 errores)**.
- **Batería de Pruebas Backend:** `pytest` -> **19 pruebas aprobadas (19 passed, 0 failed)**.
- **Persistencia y Base de Datos:** Metadatos SQLAlchemy y modelos ORM sincronizados sin duplicidad.
