# PLATAFORMA INTELIGENTE DE COMERCIO ELECTRÓNICO PARA TIENDA DE ROPA MASCULINA CON VESTIDORES VIRTUALES VÍA REALIDAD AUMENTADA

## **FashionStore**

**Materia:** Sistemas de Información II (SI2)  
**Semestre:** 2-2026  
**Docente:** MSc. Ing. Angélica Garzón Cuéllar  
**Metodología:** Proceso Unificado de Desarrollo de Software (PUDS) — UML 2.5+  
**Proyecto:** Plataforma E-Commerce Omnicanal Multi-Sucursal para Ropa Masculina

**Integrantes del equipo de desarrollo:**

| Nro. | Nombre completo | Rol | Responsabilidades Principales |
|:---:|:---|:---:|:---|
| 1 | **Alberto Delgado** | Desarrollador Full Stack | Arquitectura Backend FastAPI, Base de Datos PostgreSQL, Módulos de Autenticación RBAC, Inventario/Costos, Venta Digital, Pasarela de Pago, Vestidor Virtual RA, Fidelización |
| 2 | **Andy Mujica** | Desarrollador Full Stack | Frontend Web Angular, Aplicación Móvil Flutter, Módulos de Sucursales, Catálogo, Comparador de Outfits, Reservas, POS Presencial, Asistente IA Contextual, Compras |

---

# 1) Perfil

## 1.1 Introducción

El comercio electrónico (e-commerce) ha redefinido las dinámicas del comercio minorista global, convirtiéndose en un canal indispensable de competitividad, escalabilidad y generación de valor. En el sector de la moda y la indumentaria, los canales digitales experimentan tasas de expansión vertiginosas; dentro de este segmento, el mercado de la moda masculina ha adquirido un protagonismo sin precedentes. El consumidor masculino contemporáneo exige eficiencia, inmediatez, precisión en las especificaciones del producto y una experiencia de compra personalizada que optimice su tiempo y reduzca la fricción en la toma de decisiones.

A pesar de esta acelerada evolución tecnológica, el sector de tiendas de ropa física en nuestro medio enfrenta serias barreras operativas y estructurales al intentar insertarse en la economía digital. La problemática más crítica radica en la **brecha experiencial** existente entre el entorno físico y el entorno digital: el cliente que compra por internet no tiene la posibilidad de palpar los textiles, apreciar los acabados ni verificar el calce y la talla anatómica de las prendas. Esta incertidumbre produce tasas alarmantes de devolución de mercadería (que en la industria textil internacional oscilan entre el 25% y el 35%), carritos de compra abandonados y una erosión constante de la confianza del consumidor hacia las marcas locales.

Simultáneamente, las cadenas minoristas que operan con múltiples sucursales distribuidas en diversas ciudades del país padecen de una marcada fragmentación en la gestión de sus inventarios. La inexistencia de una sincronización centralizada en tiempo real provoca quiebres de existencias (rotura de stock en una sucursal mientras otra acumula sobrestock obsoleto), costos logísticos descontrolados e incapacidad para brindar respuestas inmediatas sobre la disponibilidad de tallas y colores específicos. A ello se suma la ausencia de sistemas rigurosos de valuación de inventario fundamentados en el **costo promedio ponderado**, lo que distorsiona los márgenes reales de ganancia y la rentabilidad financiera del negocio.

Para dar una respuesta integral, innovadora y sostenible a esta problemática, se concibe y diseña **FashionStore**: una plataforma inteligente de comercio electrónico omnicanal para tiendas de ropa masculina, estructurada bajo una arquitectura moderna cliente-servidor basada en microservicios desacoplados. FashionStore conecta de manera sinérgica la presencia digital (web responsiva y aplicación móvil nativa multiplataforma) con la infraestructura física de las tiendas, permitiendo a los clientes no solo adquirir prendas en línea o en puntos de venta físicos (POS), sino también gestionar reservas anticipadas para probarse las prendas presencialmente en sucursales seleccionadas.

Para superar la brecha digital y elevar sustancialmente la competitividad comercial, FashionStore incorpora tres pilares tecnológicos diferenciadores:
1. **Vestidores Virtuales basados en Realidad Aumentada (RA)**: Mediante la cámara del dispositivo móvil, el usuario puede proyectar las prendas tridimensionalmente sobre su silueta en tiempo real, facilitando la visualización del calce y estilo.
2. **Asistente de Estilo con Inteligencia Artificial Contextual**: Un motor cognitivo que genera sugerencias personalizadas de combinaciones y atuendos completos (outfits) analizando variables en tiempo real: condiciones meteorológicas de la ciudad del usuario (vía API de clima), historial transaccional, preferencias estilísticas, temporadas comerciales y análisis cromático/colorimetría.
3. **Sistema de Fidelización Gamificado y Comparador de Outfits**: Un esquema de retención de clientes apoyado en dinámicas de juego (puntos acumulables, niveles Bronce/Plata/Oro/Diamante, insignias por hitos y canje de beneficios) junto con una herramienta interactiva que permite contrastar simultáneamente hasta tres combinaciones de ropa en pantalla.

El desarrollo del proyecto se fundamenta con estricto apego en el **Proceso Unificado de Desarrollo de Software (PUDS)** y el lenguaje de modelado estandarizado **UML versión 2.5+**, garantizando un proceso disciplinado, dirigido por casos de uso, centrado en la arquitectura, e iterativo e incremental a lo largo de tres ciclos evolutivos de desarrollo.

---

## 1.2 Objetivo General

Desarrollar e implementar **FashionStore**, una plataforma inteligente de comercio electrónico omnicanal para una cadena de tiendas de ropa masculina con presencia multi-sucursal, que integre de forma centralizada la venta digital (web y móvil), el punto de venta presencial (POS), la reserva física de prendas, el control de inventarios multi-sucursal con valuación por costo unitario y costo promedio ponderado, pagos electrónicos mediante pasarelas seguras, vestidores virtuales con realidad aumentada, asistencia de estilo mediante inteligencia artificial contextual, un sistema de fidelización gamificado y un comparador interactivo de outfits, aplicando con rigor metodológico el Proceso Unificado de Desarrollo de Software (PUDS) y el modelado estándar UML 2.5+, con despliegue operativo en infraestructura de nube accesible públicamente.

---

## 1.3 Objetivos Específicos

1. **Analizar y delimitar formalmente los requisitos funcionales y no funcionales** del sistema mediante técnicas rigurosas de ingeniería de software, definiendo el alcance técnico y las prioridades de cada iteración dentro del marco metodológico del PUDS.
2. **Implementar el subsistema de seguridad, autenticación y autorización basado en roles (RBAC)**, garantizando el acceso restringido y segregado según perfiles (Administrador, Encargado de Sucursal, Cajero, Personal de Logística, Cliente), cifrado de contraseñas mediante hashing seguro (`bcrypt`), gestión de sesiones con tokens JWT y auditoría de accesos.
3. **Administrar de manera integral el catálogo de indumentaria masculina**, permitiendo la gestión parametrizada de categorías, subcategorías, marcas, modelos, tallas estandarizadas, colores como atributos multivaluados, fichas técnicas, galerías fotográficas y vinculación con temporadas comerciales.
4. **Gestionar la estructura geográfica y operativa multi-sucursal**, administrando ciudades, sucursales físicas, geolocalización, capacidades operativas, horarios de atención y asignación de personal responsable.
5. **Implementar el motor de consulta de disponibilidad de existencias en tiempo real**, permitiendo a clientes y operadores verificar con exactitud el stock por sucursal, producto, talla y color.
6. **Desarrollar el módulo de reservas anticipadas de prendas en tienda física**, habilitando al cliente para preseleccionar múltiples prendas en diversas variantes, seleccionar la sucursal de destino y programar un horario aproximado de visita para la prueba presencial.
7. **Automatizar el flujo de trabajo de atención y preparación de reservas en sucursal**, notificando en tiempo real al encargado de tienda para el apartado físico previo de las prendas y el registro de la atención del cliente.
8. **Diseñar e integrar el vestidor virtual con Realidad Aumentada (RA)** en la aplicación móvil Flutter, aprovechando capacidades de renderizado y visión artificial para superponer prendas virtuales sobre la imagen en directo del usuario.
9. **Construir el comparador visual inteligente de outfits**, que permita al cliente yuxtaponer hasta tres combinaciones de prendas lado a lado en una sola vista, calculando automáticamente costos parciales, descuentos aplicables y montos totales consolidados.
10. **Implementar la pasarela de comercio electrónico omnicanal** con carrito de compras sincronizado, validación estricta de existencias con bloqueos temporales anti-colisión y proceso de checkout fluido tanto en la plataforma web (Angular) como en la app móvil (Flutter).
11. **Desarrollar el punto de venta presencial (POS)** para el personal de caja en sucursales físicas, permitiendo la búsqueda ágil de productos, lectura de códigos de barras, selección de métodos de pago físico y digital, y emisión de comprobantes de venta válidos.
12. **Integrar pasarelas de pago electrónico internacionales (Stripe y PayPal en modo Sandbox)** y pasarelas de pago nacionales con soporte para Códigos QR interoperables y tarjetas de crédito/débito bajo estándares seguros de comunicación.
13. **Desarrollar el motor de control de inventarios multi-sucursal con doble valuación de costos**: registrando en cada ingreso el costo unitario de adquisición del lote y recalculando matemáticamente el **costo promedio ponderado** para una correcta gestión contable y determinación precisa de márgenes de utilidad.
14. **Gestionar las relaciones con proveedores y el aprovisionamiento de mercadería**, administrando órdenes de compra, contratos, recepciones físicas de inventario y asociación a colecciones y temporadas comerciales (primavera-verano, otoño-invierno, escolar, promociones).
15. **Implementar el sistema de fidelización de clientes mediante gamificación**, otorgando puntos por transacciones efectivas, estructurando niveles de membresía jerárquicos (Bronce, Plata, Oro, Diamante), concediendo insignias digitales por hitos de compra y habilitando el canje de puntos por descuentos directos.
16. **Incorporar un Asistente de Estilo con Inteligencia Artificial Contextual**, que recomiende atuendos personalizados analizando en tiempo real la temperatura y clima local del usuario (vía API meteorológica externa), su historial de compras, su paleta de colorimetría y la disponibilidad de prendas en stock.
17. **Integrar interfaces por comandos de voz asistidos por IA** en la aplicación móvil, facilitando la búsqueda inteligente de prendas en lenguaje natural y la generación verbal de reportes ejecutivos para el administrador.
18. **Construir módulos analíticos y cuadros de mando (dashboards)** para soporte en la toma de decisiones empresariales, consolidando indicadores de rendimiento (KPIs), ventas por sucursal, rotación de inventarios, rentabilidad y productos de mayor demanda.
19. **Desplegar la solución informática en infraestructura de nube pública** (Render / Railway / Supabase / AWS), garantizando alta disponibilidad, seguridad HTTPS/TLS y acceso público inmediato mediante URL y código QR para su evaluación formal.

---

## 1.4 Descripción del Problema

### 1.4.1 Contexto Global y Regional del Comercio Minorista de Moda Masculina

El comercio minorista de prendas de vestir (*apparel retail*) representa uno de los sectores económicos más dinámicos y competitivos a nivel global. Históricamente caracterizado por un modelo de comercialización eminentemente físico —donde la interacción táctil con los tejidos, la verificación presencial del corte y la prueba en probadores constituían el núcleo del proceso de compra—, el sector ha experimentado una metamorfosis irreversible acelerada por la digitalización de los consumidores y la masificación de los teléfonos inteligentes.

En el mercado específico de la moda masculina, las tendencias de consumo han evolucionado hacia un patrón distintivo: el comprador masculino contemporáneo valora por encima de todo la **practicidad, la optimización del tiempo, la claridad en la información y la coherencia del estilo**. A diferencia de otros segmentos donde la compra responde predominantemente a impulsos o recreación prolongada, el público masculino busca resolver una necesidad concreta de vestimenta (para el entorno laboral, ocasiones formales, actividades deportivas o estilo urbano) de manera rápida y sin complicaciones. 

Sin embargo, en el contexto de Bolivia y la región latinoamericana, el comercio de moda masculina se encuentra atrapado en una profunda encrucijada estructural. Por una parte, los negocios tradicionales continúan operando con procesos manuales o sistemas de información aislados que carecen de conectividad entre sus puntos de venta. Por otra parte, aquellos comercios que han intentado incursionar en el comercio electrónico lo han hecho a través de canales precarios e improvisados —como catálogos estáticos en redes sociales (Facebook Marketplace, WhatsApp, Instagram)— o mediante la adopción de plataformas genéricas no adaptadas a la realidad operativa del país. Esta situación genera un conjunto de problemáticas críticas que se analizan detalladamente a continuación.

---

### 1.4.2 Diagnóstico de la Situación Actual y Problemáticas Críticas

#### A. La Brecha Experiencial entre el Entorno Digital y el Físico: El Dilema del Calce y la Crisis de Devoluciones
El principal obstáculo que inhibe la conversión en las tiendas de ropa digital es la imposibilidad física de probarse las prendas antes del pago. Las tablas de tallas tradicionales (S, M, L, XL) carecen de uniformidad entre fabricantes, marcas y líneas de confección: un pantalón talla 32 de corte *Slim Fit* de una marca importada difiere notablemente de un modelo equivalente de corte clásico o confección nacional.

Esta incertidumbre dimensional genera una barrera psicológica en el cliente, quien ante la duda opta por desistir de la compra en línea, recurrir a compras presenciales con alta pérdida de tiempo, o incurrir en la práctica del *bracket-ordering* (adquirir deliberadamente dos o tres tallas de la misma prenda para quedarse con una y devolver el resto). En la industria de la moda a nivel internacional, las ventas en línea registran tasas de devolución superiores al **30%**, mientras que en las tiendas físicas difícilmente alcanzan el **8% al 10%**. Cada devolución representa un impacto financiero severo: costos de reenvío y logística inversa, reacondicionamiento de prendas, deterioro del empaque y pérdida del costo de oportunidad por stock inmovilizado durante el proceso de restitución.

#### B. Desarticulación y Silos de Información en la Gestión de Inventarios Multi-Sucursal
Las cadenas de tiendas de ropa que operan en múltiples ciudades (como Santa Cruz de la Sierra, La Paz y Cochabamba) y con diversas sucursales urbanas sufren de una severa desconexión informativa. Frecuentemente, el inventario es controlado de manera fragmentada: cada tienda física cuenta con su propio cuaderno de registro, una hoja de cálculo local o un sistema monofásico desconectado de la central.

Esta falta de visibilidad en tiempo real produce dos fenómenos igualmente perjudiciales:
1. **Quiebre o rotura de stock (*Stockouts*)**: Un cliente acude a una sucursal buscando una camisa ejecutiva blanca en talla M y se le informa que el producto está agotado, perdiendo la venta de inmediato porque el personal desconoce si en la sucursal de otra zona de la ciudad existen unidades disponibles.
2. **Sobrestock y obsolescencia estacional**: En una sucursal se acumulan decenas de unidades de prendas de temporada fría que no rotan, mientras en otra sucursal de una ciudad de clima templado o frío existe sobredemanda insatisfecha. La falta de un sistema centralizado impide planificar traslados y transferencias inter-sucursales oportunas antes de que la temporada comercial culmine y la mercadería deba liquidarse con pérdidas.

#### C. Distorsión Contable y Ausencia de Valuación por Costo Promedio Ponderado
La adquisición de prendas de vestir está sujeta a una alta variabilidad de costos de adquisición. Las cadenas compran lotes sucesivos de un mismo producto en diferentes periodos del año; los costos unitarios fluctúan drásticamente debido a variaciones cambiarias de divisas, fletes de importación, volumen negociado con el proveedor, aranceles aduaneros y fluctuaciones inflacionarias.

La gran mayoría de los sistemas comerciales básicos registra el inventario utilizando únicamente el **último costo unitario de compra**. Esta simplificación contable es nefasta para la salud financiera de la empresa:
- Si el último lote de 50 camisas se adquirió a un precio mayor (ej. 120 Bs) debido a un aumento transitorio de transporte, y aún existían en bodega 150 camisas compradas a 80 Bs, registrar todo el inventario a 120 Bs sobrevalora artificialmente el activo y distorsiona el margen de utilidad.
- Por el contrario, si se adquirió un lote de liquidación a menor precio, se subvalora el inventario existente.
- Además, en el marco tributario boliviano, las operaciones comerciales formales deben considerar el crédito y débito fiscal del Impuesto al Valor Agregado (IVA - 13%) y el Impuesto a las Transacciones (IT - 3%), totalizando una carga impositiva formal que exige conocer con exactitud matemática el **costo promedio ponderado** del inventario para determinar con rigor la utilidad operativa neta y cumplir con las regulaciones de auditoría.

#### D. Ineficiencia en la Dinámica de Compra Presencial y Falta de Mecanismos de Reserva Previa
Cuando un cliente decide visitar una tienda física, el proceso tradicional de atención está plagado de fricciones. El cliente debe buscar manualmente entre perchas y anaqueles saturados, solicitar la intervención de un vendedor para consultar si hay stock en bodega, esperar a que el encargado revise depósitos desordenados y, si tiene éxito, esperar turno frente a probadores colapsados en horas pico. Si la prenda no calza adecuadamente, el ciclo de búsqueda debe repetirse desde cero.

Este flujo arcaico genera agotamiento en el consumidor, saturación en las salas de venta y un bajo índice de conversión por metro cuadrado de tienda. No existe un puente tecnológico que permita al cliente explorar digitalmente el catálogo desde su hogar o teléfono, seleccionar las prendas exactas que desea probarse, y **generar una reserva anticipada** para una sucursal específica con fecha y hora programadas, de modo que al llegar a la tienda el personal ya tenga las prendas apartadas, planchadas y listas en el probador asignado.

#### E. Ausencia de Personalización, Inteligencia Contextual y Fidelización del Cliente
El comercio minorista tradicional trata a todos los clientes bajo un estándar homogéneo. El comprador promedio se enfrenta a catálogos masivos y genéricos con cientos de prendas sin ningún tipo de curaduría adaptada a su contextura, estilo de vida, entorno geográfico o preferencias cromáticas.

Asimismo, no se aprovechan las condiciones de contexto dinámico: no tiene sentido recomendar parkas pesadas de lana a un cliente ubicado en una ciudad de clima tropical en pleno verano, ni trajes de lino claro en un día lluvioso de invierno. De igual forma, las empresas carecen de esquemas estructurados de **Fidelización y Gestión de Relaciones con el Cliente (CRM)**. Los clientes fieles que realizan compras recurrentes reciben exactamente el mismo trato y precios que un visitante esporádico, desaprovechando las mecánicas de gamificación (acumulación de puntos por compras, niveles de membresía con privilegios escalonados e incentivos de recompra) que han demostrado elevar el valor de vida del cliente (*Customer Lifetime Value - CLV*) en más del 40%.

#### F. Desconexión Transaccional y Dispersión de Métodos de Pago
Por último, el ecosistema transaccional se encuentra fragmentado. En el canal físico, las cajas registradoras suelen operar de espaldas al sistema digital, con terminales de cobro independientes que requieren doble captura manual de datos. En el canal digital, existe desconfianza hacia los pagos con tarjeta de crédito en línea por temor a fraudes informáticos, y los métodos locales emergentes (como el Código QR Interoperable impulsado por el Banco Central de Bolivia) carecen frecuentemente de automatización e integración directa vía webhooks con las plataformas web y móviles, exigiendo que el usuario envíe una captura de pantalla por WhatsApp para que un operador verifique manualmente el depósito.

---

### 1.4.3 Matriz de Análisis Causa-Efecto (Diagrama de Ishikawa)

Para estructurar formalmente las causas raíz que originan la ineficiencia, pérdida de clientes y altos costos operativos en el negocio de moda masculina, se presenta la siguiente matriz analítica basada en las 5 dimensiones fundamentales de la ingeniería de procesos (Métodos, Tecnología, Personal, Materiales/Inventario y Clientes):

| Dimensión | Causa Raíz Primaria | Efecto Directo en la Operación | Consecuencia Final para el Negocio |
|:---|:---|:---|:---|
| **Métodos y Procesos** | Ausencia de flujos de reserva anticipada de prendas por sucursal. | Clientes insatisfechos por desabastecimiento presencial y colapso de probadores. | Abandono de la tienda física y pérdida irreversible de ventas potenciales. |
| **Métodos y Procesos** | Registro de inventario limitado al último costo unitario de compra. | Distorsión del valor real del activo e inexactitud en el cálculo del margen de utilidad. | Incumplimiento contable-tributario y toma de decisiones financieras erróneas. |
| **Tecnología y Sistemas** | Falta de herramientas virtuales de verificación de calce y prueba de prendas. | Incertidumbre dimensional del cliente al adquirir prendas en la plataforma digital. | Tasa de devoluciones superior al 30% y saturación logística de post-venta. |
| **Tecnología y Sistemas** | Dispersión de sistemas no integrados entre tienda web, app móvil y cajas POS. | Desincronización de existencias y desfase de inventario tras ventas concurrentes. | Venta de productos sin stock real (*overselling*) y descontento del cliente. |
| **Inventario y Stock** | Gestión aislada por sucursal sin visibilidad geográfica consolidada. | Desbalance de existencias: acumulación de sobrestock en sucursal A y quiebres en sucursal B. | Pérdida de rentabilidad por liquidaciones forzosas y costos innecesarios de almacenamiento. |
| **Personal y Atención** | Atención reactiva sin conocimiento previo de las preferencias o reservas del cliente. | Tiempos de atención prolongados en tienda y búsqueda manual en bodegas. | Baja productividad del personal de sala de ventas y congestión en sucursales. |
| **Cliente y Mercado** | Catálogos estáticos no personalizados y carencia de programas de fidelización estructurados. | Experiencia de compra impersonal y ausencia de incentivos de recurrencia. | Alta tasa de deserción hacia competidores y bajo valor de vida del cliente (*CLV*). |

---

### 1.4.4 Impacto y Consecuencias de la Inacción

Si una cadena de indumentaria masculina decide posponer la modernización integral de sus sistemas y procesos, las repercusiones a corto y mediano plazo amenazan la viabilidad misma de la organización:

1. **Erosión Progresiva de Márgenes Financieros**: La combinación de devoluciones masivas en el canal digital (con fletes inversos absorbidos por el comercio) junto a márgenes distorsionados por valuaciones empíricas de inventario destruyen la rentabilidad neta.
2. **Obsolescencia Acelerada del Stock**: La ropa masculina responde a ciclos de temporada rígidos. La mercadería que no rota oportunamente por falta de visibilidad multi-sucursal se devalúa drásticamente, obligando a remates por debajo del costo promedio de adquisición.
3. **Pérdida de Posicionamiento ante Competidores Nativos Digitales**: Los nuevos actores del mercado que implementan plataformas omnicanales, pagos ágiles y entregas rápidas capturan con celeridad al segmento de clientes masculinos jóvenes y profesionales, caracterizados por su alto poder adquisitivo y poca tolerancia a la ineficiencia.
4. **Degradación de la Imagen de Marca**: Vender en línea prendas que luego se revelan sin stock en bodega, o entregar tallas incompatibles que frustran las expectativas del comprador, socava la credibilidad corporativa en redes sociales y entornos digitales.

---

### 1.4.5 Formulación de la Solución Integral con FashionStore

Frente a este escenario complejo, **FashionStore** se formula como una solución tecnológica transformadora y omnicanal, diseñada específicamente para cerrar la brecha físico-digital en la moda masculina mediante:

- **Convergencia Omnicanal**: Unificación de la tienda web responsiva (Angular), la aplicación móvil interactiva (Flutter) y los puntos de venta presenciales (POS) bajo un único backend centralizado (FastAPI) con base de datos unificada (PostgreSQL).
- **Control Riguroso de Inventarios Multi-Sucursal**: Sincronización atómica de existencias, control de transferencias y cálculo automático del **costo promedio ponderado** tras cada recepción de compra a proveedores.
- **Flujo Innovador de Reserva Presencial**: Habilitación del servicio de apartado digital de prendas con fecha y hora programadas, permitiendo que el cliente acuda a la sucursal seleccionada a vivir una experiencia ágil de prueba física.
- **Reducción Drástica de Devoluciones mediante Realidad Aumentada**: Implementación del vestidor virtual interactivo sobre dispositivos móviles, dotando al usuario de certezas visuales respecto al calce, caída y textura del producto.
- **Personalización Extrema con IA Contextual**: Algoritmos de recomendación capaces de sintetizar clima meteorológico local, colorimetría y preferencias personales en atuendos coordinados.
- **Gamificación Comercial**: Mecánicas de fidelización que transforman cada compra en puntos, ascensos de nivel jerárquico y descuentos exclusivos, maximizando la retención de clientes.

---

## 1.5 Alcance

### 1.5.1 Módulos del Sistema

A continuación se detalla exhaustivamente cada uno de los **19 módulos funcionales** que conforman la plataforma FashionStore. Cada especificación define la descripción operativa orientada al control de acceso basado en roles (RBAC), la segregación de responsabilidades, la estructura de datos clave (con identificadores, tipos de datos, hashes de seguridad y restricciones de integridad) y las funcionalidades clave correspondientes.

---

#### 1.5.1.1 Módulo M01: Autenticación, Autorización y Seguridad (RBAC)
**Descripción General:**  
Permite gestionar el acceso seguro y controlado a la plataforma mediante un esquema estricto de Control de Acceso Basado en Roles (RBAC). Cada usuario que interactúa con FashionStore (Administrador, Encargado de Sucursal, Cajero, Personal de Logística/Inventario, Cliente o Proveedor) accede exclusivamente a las vistas, endpoints y operaciones autorizadas para su perfil específico. Implementa mecanismos de alta seguridad informática, garantizando la confidencialidad, integridad y no repudio de la información transaccional.

**Datos principales:**
- `id_usuario`: Entero autoincremental (PK).
- `nombres` y `apellidos`: Cadenas alfanuméricas (obligatorias).
- `email`: Cadena alfanumérica única (Unique Constraint, indexado para búsquedas rápidas de autenticación).
- `password_hash`: Cadena alfanumérica de 60 caracteres generada mediante algoritmo criptográfico `bcrypt` con factor de coste balanceado (nunca se almacena texto en claro).
- `rol`: Enumerador tipado (`ADMINISTRADOR`, `ENCARGADO_SUCURSAL`, `CAJERO`, `LOGISTICA`, `CLIENTE`, `PROVEEDOR`).
- `estado_cuenta`: Enumerador tipado (`ACTIVO`, `INACTIVO`, `BLOQUEADO_POR_INTENTOS`, `PENDIENTE_VERIFICACION`).
- `intentos_fallidos`: Entero corto (contador acumulativo de intentos consecutivos de inicio de sesión erróneos).
- `ultimo_acceso`: Timestamp de fecha y hora exacta del último login exitoso.
- `token_jwt`: Token web JSON firmado con clave asimétrica RSA/HMAC conteniendo claims de identidad y expiración configurable (60 minutos para web, 30 días para móvil mediante refresh token).
- `id_sucursal_asignada`: Entero (FK opcional, vincula al empleado con una sucursal física determinada).

**Funcionalidades clave:**
- Inicio de sesión seguro con validación estricta de credenciales hash y emisión de tokens JWT.
- Cierre de sesión con invalidación y revocación inmediata de tokens en lista de exclusión (Blacklist en memoria/Redis).
- Bloqueo preventivo y automático de la cuenta tras 5 intentos fallidos consecutivos de autenticación.
- Recuperación automatizada de contraseña mediante generación de tokens de un solo uso (OTP) temporizados enviados al correo electrónico registrado.
- Cambio de contraseña por el propio usuario con validación estricta de robustez (mínimo 8 caracteres, combinación de mayúsculas, minúsculas, números y símbolos especiales).
- Gestión y mantenimiento de perfiles y asignación de roles por parte del Administrador General.
- Registro en bitácora de auditoría de cada intento de acceso (login/logout, IP de origen, User-Agent, fecha/hora y resultado).

---

#### 1.5.1.2 Módulo M02: Gestión de Sucursales y Ciudades
**Descripción General:**  
Administra la estructura física, geográfica y organizacional de la cadena de tiendas de indumentaria. Permite definir las ciudades de cobertura y las diferentes sucursales habilitadas en cada territorio, estableciendo su localización geográfica precisa, capacidades de atención, números de contacto y personal asignado, sirviendo como eje espacial para el inventario, las reservas presenciales y los despachos.

**Datos principales:**
- `id_sucursal`: Entero autoincremental (PK).
- `id_ciudad`: Entero (FK hacia la tabla `Ciudades`).
- `nombre_sucursal`: Cadena alfanumérica (ej. "Sucursal Equipetrol", "Sucursal Calacoto").
- `direccion_fisica`: Texto descriptivo de la ubicación y referencias viales.
- `latitud` y `longitud`: Valores de precisión decimal (GPS) para geolocalización y cálculo de distancias.
- `telefono_contacto`: Cadena numérica.
- `horario_apertura` y `horario_cierre`: Formato Time (ej. 09:00:00 a 21:00:00).
- `capacidad_probadores`: Entero (número de vestidores físicos disponibles para atención concurrente de reservas).
- `estado_operativo`: Enumerador tipado (`OPERATIVA`, `EN_MANTENIMIENTO`, `CERRADA_TEMPORALMENTE`).

**Funcionalidades clave:**
- Registro, modificación, baja lógica y consulta detallada de ciudades y regiones de cobertura.
- CRUD completo de sucursales físicas con registro georreferenciado (latitud/longitud).
- Asignación de encargados de tienda y personal operativo a sucursales específicas.
- Parametrización de días laborables, feriados y franjas horarias de atención para reservas presenciales.
- Consulta interactiva y pública de sucursales cercanas para el cliente desde la app móvil o web mediante geolocalización.
- Habilitación o inhabilitación temporal de sucursales para recepción de pedidos o reservas.

---

#### 1.5.1.3 Módulo M03: Gestión de Productos, Categorías y Atributos
**Descripción General:**  
Centraliza la administración del catálogo de prendas de vestir masculinas. Gestiona de forma desacoplada las categorías (camisas, trajes, pantalones, calzado, accesorios), marcas comerciales, modelos, colecciones y los atributos intrínsecos de cada prenda, destacando el manejo de colores como atributos multivaluados y tallas normalizadas, junto con la gestión multimedia de imágenes en alta definición.

**Datos principales:**
- `id_producto`: Entero autoincremental (PK).
- `codigo_sku_base`: Cadena alfanumérica única estandarizada (ej. "SHIRT-SLIM-001").
- `nombre`: Cadena alfanumérica (ej. "Camisa Oxford Slim Fit").
- `descripcion`: Texto detallado con especificaciones textiles, composición de tela y cuidados.
- `id_categoria`: Entero (FK hacia `Categorias`).
- `id_marca`: Entero (FK hacia `Marcas`).
- `precio_venta_base`: Decimal con dos dígitos de precisión (monto estándar en moneda nacional).
- `genero`: Enumerador fijado en `MASCULINO`.
- `tallas_disponibles`: Arreglo / relación relacional normalizada (`S`, `M`, `L`, `XL`, `XXL`, `38`, `40`, `42`).
- `colores_multivaluados`: Arreglo estructurado de colores con nombre comercial y código hexadecimal (ej. `[{"nombre": "Azul Marino", "hex": "#000080"}, {"nombre": "Blanco", "hex": "#FFFFFF"}]`).
- `imagenes_url`: Arreglo de URLs hacia repositorio de almacenamiento en la nube (S3/Cloudinary).
- `estado_publicacion`: Enumerador (`BORRADOR`, `PUBLICADO`, `DESCATALOGADO`).

**Funcionalidades clave:**
- Registro y actualización de fichas técnicas de prendas con validación de código SKU único.
- Gestión taxonómica de categorías y subcategorías jerárquicas de indumentaria masculina.
- Configuración de tallas y asignación de paletas de colores multivaluados con código visual Hexadecimal.
- Carga múltiple y optimización de imágenes de productos para web y móvil (vistas frontal, dorsal y detalle).
- Activación, suspensión y descatalogación de productos del catálogo público.
- Vinculación de productos con modelos 3D y texturas para el vestidor virtual en Realidad Aumentada.

---

#### 1.5.1.4 Módulo M04: Gestión de Temporadas y Colecciones
**Descripción General:**  
Permite planificar, organizar y calendarizar las campañas comerciales de la moda masculina. Clasifica los productos dentro de colecciones estacionales (Primavera-Verano, Otoño-Invierno, Temporada Escolar/Universitaria, Black Friday, Ediciones Especiales de Gala), facilitando la rotación estratégica del inventario, la aplicación de políticas de precios diferenciadas y la alimentación de datos contextuales al motor de Inteligencia Artificial.

**Datos principales:**
- `id_temporada`: Entero autoincremental (PK).
- `nombre_temporada`: Cadena alfanumérica (ej. "Primavera - Verano 2026", "Línea Ejecutiva Invierno").
- `codigo_campaña`: Cadena alfanumérica única (ej. "SS-2026").
- `fecha_inicio`: Fecha de lanzamiento oficial de la temporada.
- `fecha_fin`: Fecha de cierre y liquidación de temporada.
- `descripcion`: Texto explicativo de la línea conceptual de la colección.
- `estado_temporada`: Enumerador tipado (`PLANIFICADA`, `VIGENTE`, `EN_LIQUIDACION`, `FINALIZADA`).
- `descuento_liquidacion_sugerido`: Porcentaje numérico aplicable al fin de temporada.

**Funcionalidades clave:**
- Creación, modificación y cierre formal de temporadas y colecciones comerciales.
- Asociación masiva o individual de productos del catálogo a una o múltiples temporadas.
- Activación automatizada de promociones y descuentos por cambio de temporada comercial.
- Segmentación de colecciones para campañas de marketing y recomendaciones personalizadas por IA.
- Reporte comparativo de ventas y rentabilidad entre colecciones históricas.

---

#### 1.5.1.5 Módulo M05: Gestión de Proveedores y Abastecimiento
**Descripción General:**  
Administra la cadena de suministro y aprovisionamiento de mercadería. Gestiona la información jurídica, comercial y crediticia de los proveedores nacionales e internacionales que confeccionan y distribuyen las prendas de vestir, controlando el catálogo de productos suministrados, condiciones de entrega, plazos de crédito y contratos comerciales.

**Datos principales:**
- `id_proveedor`: Entero autoincremental (PK).
- `razon_social`: Cadena alfanumérica oficial.
- `nit_o_identificacion`: Cadena alfanumérica única (Número de Identificación Tributaria).
- `nombre_contacto`: Cadena alfanumérica del ejecutivo de cuentas.
- `telefono` y `email`: Datos de contacto directo.
- `direccion_sede`: Texto físico y país/ciudad de origen.
- `terminos_pago`: Enumerador (`CONTADO`, `CREDITO_30_DIAS`, `CREDITO_60_DIAS`, `CONSIGNACION`).
- `estado`: Enumerador (`ACTIVO`, `INACTIVO`, `OBSERVADO`).

**Funcionalidades clave:**
- Registro de proveedores con validación de identificación tributaria y datos comerciales.
- Vinculación de proveedores con líneas de productos y categorías textiles autorizadas.
- Registro y seguimiento de órdenes de compra con detalle de cantidades y precios acordados.
- Evaluación de cumplimiento en tiempos de entrega y control de calidad de lotes recibidos.
- Consulta de historial consolidado de compras y pagos por proveedor.

---

#### 1.5.1.6 Módulo M06: Gestión de Inventario Multi-Sucursal y Costos Ponderados
**Descripción General:**  
Constituye el núcleo logístico y financiero de FashionStore. Controla en tiempo real las existencias físicas de cada variante de producto (producto, talla, color) en cada una de las sucursales de la cadena. Implementa de manera estricta el algoritmo de **Costo Promedio Ponderado** tras cada entrada de mercadería por compra, almacenando paralelamente el **último costo unitario de adquisición** de acuerdo con las especificaciones académicas del proyecto. Registra la trazabilidad completa de transferencias inter-sucursales, mermas y ajustes de inventario.

**Datos principales:**
- `id_inventario`: Entero autoincremental (PK).
- `id_sucursal`: Entero (FK hacia `Sucursales`).
- `id_producto`: Entero (FK hacia `Productos`).
- `talla`: Cadena normalizada (ej. "M", "42").
- `color`: Cadena del color específico (ej. "Azul Marino").
- `stock_fisico`: Entero (cantidad física existente en la tienda).
- `stock_reservado`: Entero (cantidad apartada temporalmente para clientes con reservas presenciales vigentes).
- `stock_disponible`: Entero calculado (`stock_fisico - stock_reservado`).
- `stock_minimo`: Entero (umbral de reorden para alertas de desabastecimiento).
- `stock_maximo`: Entero (límite de almacenamiento físico en la sucursal).
- `ultimo_costo_unitario`: Decimal(10,2) (valor unitario pagado en el lote de compra más reciente).
- `costo_promedio_ponderado`: Decimal(10,2) (recalculado matemáticamente según: $CPP_{nuevo} = \frac{(Stock_{anterior} \times CPP_{anterior}) + (Cant_{ingreso} \times Costo_{ingreso})}{Stock_{anterior} + Cant_{ingreso}}$).
- `ubicacion_almacen`: Cadena descriptiva (ej. "Estante B, Percha 4").

**Funcionalidades clave:**
- Control de existencias por variante de producto segregado por cada sucursal de la empresa.
- Actualización atómica del inventario y bloqueo temporal durante transacciones concurrentes de compra o reserva.
- Cálculo matemático automático del Costo Promedio Ponderado y registro del Último Costo Unitario en cada recepción.
- Solicitud, autorización, despacho y recepción de transferencias de prendas entre sucursales.
- Generación de alertas automáticas al encargado de tienda cuando el stock cruza el umbral mínimo configurado.
- Registro de bitácora inmutable de movimientos de kardex (entradas, salidas, ajustes por merma y transferencias) con fecha, hora, responsable y justificación.

---

#### 1.5.1.7 Módulo M07: Catálogo Digital Omnicanal (Web y Móvil)
**Descripción General:**  
Expone el portafolio de prendas de vestir masculinas a través de la plataforma web responsiva (Angular) y la aplicación móvil nativa (Flutter). Proporciona a los clientes y visitantes una experiencia de navegación sumamente rápida, fluida y visualmente atractiva, con capacidades de búsqueda predictiva, filtros multifacéticos en tiempo real y verificación inmediata de disponibilidad de stock por sucursal física.

**Datos principales:**
- Parámetros de consulta y filtrado: Categoría, Rango de Precios, Talla, Color, Temporada, Marca, Ciudad y Sucursal.
- Esquema de serialización JSON enriquecido: SKU, nombre, descripción formateada, galería multimedia, variantes de talla/color, disponibilidad en sucursal y atributos de compatibilidad con realidad aumentada.
- Índices de base de datos relacionales y full-text search para optimización de tiempos de respuesta (< 2 segundos).

**Funcionalidades clave:**
- Visualización jerárquica del catálogo de moda masculina con paginación optimizada e infinitescroll.
- Filtrado multidimensional combinando simultáneamente temporada, talla, color, marca y precio.
- Selector interactivo de sucursal con consulta inmediata de existencias por talla y color específico.
- Ficha detallada de prenda con guía de tallas anatómicas masculinas y recomendaciones de cuidado textil.
- Funcionalidad de marcado y gestión de lista de prendas favoritas (*Wishlist*) sincronizada entre web y app móvil.

---

#### 1.5.1.8 Módulo M08: Vestidor Virtual con Realidad Aumentada (RA)
**Descripción General:**  
Implementa el probador virtual tridimensional mediante tecnología de Realidad Aumentada sobre la aplicación móvil Flutter. Mediante la cámara del smartphone del usuario, el sistema superpone modelos 3D y texturas hiperrealistas de prendas masculinas sobre la silueta del cliente en tiempo real, permitiéndole evaluar la caída, el tamaño proporcional y la armonía visual antes de tomar la decisión de reserva o compra.

**Datos principales:**
- `id_recurso_ra`: Entero autoincremental (PK).
- `id_producto`: Entero (FK hacia `Productos`).
- `modelo_3d_url`: Cadena URI apuntando al archivo tridimensional optimizado (`.glb` / `.gltf`).
- `texturas_url`: Mapeo JSON de texturas diferenciadas por color de prenda.
- `puntos_anclaje_corporal`: Configuración JSON de mapeo anatómico (hombros, torso, cadera, cuello).
- `escala_referencia`: Factor numérico decimal de calibración de proporciones anatómicas.

**Funcionalidades clave:**
- Detección de silueta humana y extremidades mediante visión artificial (ARCore / ML Kit).
- Proyección tridimensional en tiempo real de chaquetas, camisas, blazers y camisetas sobre el cuerpo del usuario.
- Cambio dinámico de color y textura de la prenda proyectada sin interrumpir la transmisión de la cámara.
- Captura fotográfica del outfit proyectado con opción de guardado local o compartición en redes sociales.
- Integración directa desde la vista de Realidad Aumentada hacia el Carrito de Compras o el Flujo de Reserva.

---

#### 1.5.1.9 Módulo M09: Comparador Inteligente de Outfits
**Descripción General:**  
Herramienta de análisis visual y estilístico que permite al cliente contrastar de manera interactiva hasta tres combinaciones completas de ropa masculina (*outfits*) lado a lado en una sola pantalla. El módulo desglosa visualmente cada combinación (prenda superior, prenda inferior, calzado y accesorios), calcula los subtotales, compara los precios de cada conjunto y visualiza los beneficios de fidelización o descuentos aplicables a cada alternativa.

**Datos principales:**
- `id_comparacion`: Entero autoincremental (PK o identificador de sesión local).
- `id_cliente`: Entero (FK opcional, almacenable en perfil).
- `outfit_1`, `outfit_2`, `outfit_3`: Estructuras JSON compuestas conteniendo: lista de SKUs de prendas seleccionadas, tallas, colores elegidos, precio unitario de cada una y monto acumulado.
- `total_outfit_1`, `total_outfit_2`, `total_outfit_3`: Montos decimales calculados.
- `fecha_comparacion`: Timestamp.

**Funcionalidades clave:**
- Interfaz interactiva de arrastrar y soltar (*drag & drop*) o selección rápida para ensamblar hasta tres combinaciones.
- Visualización paralela lado a lado de las tres combinaciones con detalles de precio, color y disponibilidad.
- Cálculo automático y comparativo del costo total de cada outfit, indicando la opción más económica y la de mejor valoración.
- Reemplazo dinámico de componentes individuales (ej. sustituir una camisa formal por una casual y observar el cambio de precio global).
- Botón de acción directa para transferir el outfit ganador íntegramente al carrito de compras o a una reserva presencial.

---

#### 1.5.1.10 Módulo M10: Sistema de Reservas de Prendas en Sucursal
**Descripción General:**  
Regula el proceso omnicanal mediante el cual un cliente preselecciona un lote de prendas desde la plataforma digital para probárselas físicamente en una sucursal determinada. El sistema reserva el stock temporalmente para evitar que se venda a terceros, genera un código de reserva único con código QR, y notifica inmediatamente a la sucursal de destino para que el encargado prepare y ordene las prendas en un probador asignado.

**Datos principales:**
- `id_reserva`: Entero autoincremental (PK).
- `codigo_reserva`: Cadena alfanumérica única de 8 caracteres (ej. "RSV-2026-X8K").
- `id_cliente`: Entero (FK hacia `Clientes`).
- `id_sucursal`: Entero (FK hacia `Sucursales`).
- `fecha_reserva`: Fecha en que fue emitida la solicitud.
- `fecha_programada_visita`: Fecha y hora fijada por el cliente para acudir a la tienda.
- `hora_limite_vigencia`: Timestamp en el que la reserva expira y el stock reservado se libera automáticamente si el cliente no se presenta.
- `estado_reserva`: Enumerador tipado (`PENDIENTE_PREPARACION`, `PREPARADA_EN_SUCURSAL`, `CLIENTE_PRESENTE`, `CONCRETADA_VENTA`, `CANCELADA_POR_CLIENTE`, `EXPIRADA`).
- `items_reserva`: Tabla detalle con: `id_producto`, `talla`, `color`, `cantidad`, `precio_al_momento`.

**Funcionalidades clave:**
- Generación de reservas multi-prenda indicando sucursal, fecha y rango de hora de visita presencial.
- Bloqueo atómico temporal del inventario disponible de la sucursal asignada durante la vigencia de la reserva.
- Generación de comprobante digital de reserva con código QR escaneable por el personal de tienda.
- Notificación en tiempo real y panel de control para que el Encargado de Sucursal marque la reserva como "Preparada en Percha/Probador".
- Confirmación de llegada del cliente mediante lectura del QR de la reserva y transición de estados del proceso.
- Liberación automática del stock inmovilizado mediante tarea programada si la reserva vence sin asistencia del cliente.

---

#### 1.5.1.11 Módulo M11: Carrito de Compras Omnicanal
**Descripción General:**  
Gestiona el almacenamiento temporal y la persistencia de las prendas seleccionadas por el cliente para su adquisición digital. Opera de manera sincronizada entre la versión web y la aplicación móvil para usuarios autenticados, o mediante almacenamiento local seguro para invitados. Realiza validaciones dinámicas de existencias, cálculo automatizado de subtotales, impuestos y aplicación de promociones o descuentos de fidelización.

**Datos principales:**
- `id_carrito`: Entero autoincremental (PK).
- `id_cliente`: Entero (FK hacia `Clientes`, nulo para carritos anónimos gestionados por UUID de sesión).
- `items_carrito`: Estructura detalle con: `id_producto`, `talla`, `color`, `cantidad`, `precio_unitario`, `id_sucursal_despacho`.
- `subtotal`: Decimal(10,2).
- `monto_descuento`: Decimal(10,2).
- `monto_total`: Decimal(10,2).
- `fecha_ultima_actualizacion`: Timestamp.

**Funcionalidades clave:**
- Incorporación, edición de cantidades y remoción de prendas con validación instantánea de disponibilidad en stock.
- Persistencia del carrito en base de datos para usuarios registrados, permitiendo iniciar la selección en la app móvil y finalizarla en la web.
- Cálculo automático de importes, subtotales, descuentos promocionales y costo de envío según la modalidad elegida.
- Detección de variaciones de stock o precio antes de avanzar a la pasarela de pago.
- Vaciado automático o conversión directa del carrito en una Orden de Venta formal.

---

#### 1.5.1.12 Módulo M12: Venta Digital y Checkout
**Descripción General:**  
Controla el flujo completo de formalización de la compra en los canales digitales (web y móvil). Gestiona la selección del método de entrega (envío a domicilio o retiro gratuito en sucursal física - *Click & Collect*), la captura de datos fiscales para la facturación, la confirmación de la transacción con la pasarela de pagos y la emisión del comprobante digital de compra.

**Datos principales:**
- `id_orden_venta`: Entero autoincremental (PK).
- `numero_factura_o_nota`: Cadena alfanumérica única (ej. "FACT-DIG-00452").
- `id_cliente`: Entero (FK hacia `Clientes`).
- `tipo_entrega`: Enumerador (`RETIRO_EN_SUCURSAL`, `DELIVERY_A_DOMICILIO`).
- `id_sucursal_retiro`: Entero (FK opcional hacia `Sucursales` en caso de retiro presencial).
- `direccion_envio`: Texto descriptivo estructurado en caso de delivery a domicilio.
- `monto_subtotal`: Decimal(10,2).
- `costo_envio`: Decimal(10,2).
- `descuento_aplicado`: Decimal(10,2).
- `monto_total_pagado`: Decimal(10,2).
- `estado_orden`: Enumerador (`PENDIENTE_PAGO`, `PAGADO_CONFIRMADO`, `EN_PREPARACION`, `EN_CAMINO`, `ENTREGADO`, `ANULADO`).
- `id_transaccion_pago`: Cadena (identificador devuelto por la pasarela de pagos).
- `fecha_hora_venta`: Timestamp de formalización.

**Funcionalidades clave:**
- Asistente de Checkout de pasos secuenciales: Selección de Entrega -> Datos de Facturación -> Pago -> Confirmación.
- Validación final de inventario con bloqueo transaccional atómico antes de invocar la pasarela de cobro.
- Descuento definitivo e inmediato del stock en la sucursal de despacho tras la confirmación exitosa del pago.
- Generación de comprobante digital de venta en formato PDF descargable y envío automatizado al correo del cliente.
- Consulta y seguimiento del estado de la orden en tiempo real por parte del cliente (*Tracking*).

---

#### 1.5.1.13 Módulo M13: Punto de Venta Presencial (POS)
**Descripción General:**  
Módulo web operativo diseñado para los cajeros de las sucursales físicas. Optimizado para pantallas táctiles y teclado numérico rápido, permite registrar ventas directas de mostrador a clientes que acuden a la tienda, leer códigos de barras, asociar clientes registrados para otorgarles puntos o registrar ventas a clientes de paso (consumidor final), procesar cobros mixtos y emitir comprobantes de venta físicos de forma inmediata.

**Datos principales:**
- `id_venta_pos`: Entero autoincremental (PK).
- `id_sucursal`: Entero (FK hacia `Sucursales`).
- `id_cajero`: Entero (FK hacia `Usuarios`).
- `id_cliente`: Entero (FK hacia `Clientes`, o ID de "Cliente Casual / Consumidor Final").
- `numero_ticket`: Cadena única consecutiva de la caja física.
- `metodo_pago_utilizado`: Enumerador (`EFECTIVO`, `TARJETA_DEBITO`, `TARJETA_CREDITO`, `QR_SIMPLE`, `PAGO_MIXTO`).
- `monto_recibido` y `monto_cambio`: Decimales para transacciones en efectivo.
- `total_venta`: Decimal(10,2).
- `fecha_hora_transaccion`: Timestamp de emisión en caja.

**Funcionalidades clave:**
- Búsqueda veloz de prendas mediante lectura de código de barras o teclado predictivo por SKU.
- Conversión inmediata de una reserva física previa en una venta POS definitiva con un solo clic.
- Registro de ventas con identificación de cliente para asignación de puntos de fidelización o emisión a consumidor final.
- Soporte para cobros combinados o fraccionados (ej. parte en efectivo y parte con código QR o tarjeta).
- Actualización en tiempo real del inventario físico de la sucursal y registro del movimiento contable en caja.
- Cierre y arqueo de caja por turno de trabajo con consolidación de ventas por método de pago.

---

#### 1.5.1.14 Módulo M14: Pasarela de Pagos Electrónicos (Stripe / PayPal)
**Descripción General:**  
Proporciona la infraestructura de cobro digital para ventas en línea, integrando APIs estandarizadas de pasarelas internacionales de pago (Stripe y PayPal) operando en entornos de prueba (*Sandbox*) conforme a las restricciones del examen. Garantiza el cumplimiento de normativas de seguridad PCI-DSS mediante tokenización de tarjetas (evitando el almacenamiento de datos sensibles de tarjetas en la base de datos propia) y gestión asíncrona de eventos de pago vía Webhooks.

**Datos principales:**
- `id_transaccion`: Entero autoincremental (PK).
- `pasarela`: Enumerador (`STRIPE`, `PAYPAL`).
- `payment_intent_id`: Identificador único de cobro devuelto por la pasarela (ej. `pi_3MtwLwLkdIwHu7ix28a3tqPa`).
- `cliente_pasarela_id`: Identificador de cliente generado en el proveedor de pago.
- `monto_transaccion`: Decimal(10,2).
- `moneda`: Cadena ISO (`USD`, `BOB`).
- `estado_pago`: Enumerador (`INICIADO`, `REQUIERE_ACCION_3DS`, `APROBADO`, `RECHAZADO`, `REEMBOLSADO`).
- `payload_webhook`: Registro JSON de la respuesta asíncrona recibida del servidor de pagos.
- `fecha_creacion`: Timestamp.

**Funcionalidades clave:**
- Creación de intenciones de pago (*PaymentIntents*) seguras con verificación 3D Secure contra fraudes.
- Renderizado de componentes seguros de captura de tarjeta (*Stripe Elements* / Botones SDK de PayPal).
- Procesamiento y validación criptográfica de firmas de eventos Webhook para confirmar pagos en segundo plano.
- Manejo de reintentos y notificaciones de error ante transacciones denegadas o fondos insuficientes.
- Soporte para reembolsos directos hacia la pasarela en caso de cancelaciones autorizadas.

---

#### 1.5.1.15 Módulo M15: Gestión de Tipos y Métodos de Pago
**Descripción General:**  
Centraliza la administración de los diferentes medios de pago admitidos en FashionStore tanto para ventas presenciales en tiendas físicas como para compras en los canales digitales. Controla los parámetros operativos, recargos, comisiones, cuentas bancarias de destino y la habilitación del mecanismo de pago por Código QR Interoperable (norma BCB / QR Simple), garantizando el cuadre de ingresos y la conciliación contable.

**Datos principales:**
- `id_tipo_pago`: Entero autoincremental (PK).
- `nombre_medio`: Cadena alfanumérica (`EFECTIVO`, `TARJETA_LOCAL`, `QR_SIMPLE`, `TRANSFERENCIA`, `STRIPE_INTERNACIONAL`, `PAYPAL`).
- `canal_aplicable`: Enumerador (`SOLO_PRESENCIAL`, `SOLO_DIGITAL`, `OMNICANAL`).
- `requiere_comprobante_adjunto`: Booleano (para transferencias o pagos QR manuales).
- `comision_porcentaje`: Decimal(5,2).
- `cuenta_contable_asociada`: Cadena alfanumérica para conciliación financiera.
- `estado_activo`: Booleano.

**Funcionalidades clave:**
- Parametrización y activación/desactivación de medios de cobro admitidos por canal de venta.
- Generación de códigos QR dinámicos con monto exacto y referencia única de orden para pagos inmediatos.
- Módulo de verificación y conciliación de transferencias bancarias para el personal de administración.
- Registro detallado del flujo monetario por cada tipo de cobro para arqueos y auditorías financieras.
- Reporte consolidado de comisiones deducidas por procesadores de pago externos.

---

#### 1.5.1.16 Módulo M16: Sistema de Fidelización Gamificado
**Descripción General:**  
Constituye uno de los tres componentes diferenciadores de FashionStore. Diseñado para maximizar la recurrencia de compra, retención de clientes y el valor de vida del cliente (*CLV*). Implementa dinámicas de juego basadas en la acumulación de puntos por compras realizadas, asignación automática de niveles de membresía jerárquicos (Bronce, Plata, Oro, Diamante) con beneficios y descuentos crecientes, otorgamiento de insignias digitales por hitos comerciales y un motor de canje de puntos por descuentos en futuras compras.

**Datos principales:**
- `id_fidelizacion`: Entero autoincremental (PK).
- `id_cliente`: Entero (FK única hacia `Clientes`).
- `puntos_actuales`: Entero acumulativo de puntos disponibles para canje.
- `puntos_historicos_totales`: Entero acumulativo total (no disminuye al canjear, determina el nivel).
- `nivel_membresia`: Enumerador tipado (`BRONCE`, `PLATA`, `ORO`, `DIAMANTE`).
- `porcentaje_descuento_nivel`: Decimal(5,2) (ej. Bronce: 0%, Plata: 5%, Oro: 10%, Diamante: 15%).
- `insignias_obtenidas`: Arreglo JSON de insignias desbloqueadas con fecha de obtención (`[{"codigo": "FIRST_BUY", "nombre": "Primer Outfit", "fecha": "2026-09-01"}]`).
- `fecha_ultimo_ascenso`: Timestamp de cambio de nivel.

**Funcionalidades clave:**
- Asignación automática de puntos tras confirmación de compras efectivas (ej. 1 punto por cada 10 Bs consumidos).
- Evaluación periódica de puntos acumulados y promoción automática a niveles superiores de membresía:
  * **Bronce**: 0 a 499 puntos. Beneficios: acceso al catálogo y vestidor virtual.
  * **Plata**: 500 a 1,499 puntos. Beneficios: 5% de descuento permanente y acceso prioritario a reservas.
  * **Oro**: 1,500 a 3,999 puntos. Beneficios: 10% de descuento permanente y asesoría de estilo personalizada.
  * **Diamante**: 4,000+ puntos. Beneficios: 15% de descuento permanente, envíos gratis y acceso a colecciones exclusivas.
- Asignación de insignias digitales por logros específicos (ej. "Caballero Impecable": compra de 3 trajes formales; "Explorador RA": 5 usos del vestidor virtual; "Omnicanal": compra en web y en sucursal física).
- Redención de puntos acumulados en el carrito de compras como saldo a favor en dinero real.
- Panel visual interactivo del perfil del cliente mostrando barra de progreso hacia el siguiente nivel e insignias ganadas.

---

#### 1.5.1.17 Módulo M17: Asistente de Estilo con IA Contextual y Comandos de Voz
**Descripción General:**  
Componente diferenciador de vanguardia que eleva la experiencia de usuario a un nivel de asesoría de imagen personalizada. Utiliza algoritmos de Inteligencia Artificial (integrados vía API externa, ej. OpenAI GPT / Google Gemini) para sugerir combinaciones completas de prendas analizando cuatro variables en tiempo real: 1) Clima actual de la ciudad del usuario obtenido mediante integración con la API de OpenWeatherMap, 2) Historial de compras y preferencias de estilo registradas, 3) Reglas de colorimetría y etiqueta masculina, y 4) Disponibilidad real de existencias en tiendas. Además, incorpora procesamiento de lenguaje natural (NLP) para permitir la búsqueda de prendas y la generación de reportes ejecutivos mediante comandos de voz en la app móvil.

**Datos principales:**
- `id_solicitud_ia`: Entero autoincremental (PK).
- `id_cliente`: Entero (FK hacia `Clientes`).
- `temperatura_clima`: Decimal(4,1) (°C devueltos por la API meteorológica).
- `condicion_clima`: Cadena (ej. "Lluvioso", "Soleado", "Nublado", "Frío intenso").
- `estilo_ocasion`: Enumerador (`FORMAL_OFICINA`, `CASUAL_URBANO`, `EVENTO_GALA`, `DEPORTIVO`, `FIN_DE_SEMANA`).
- `paleta_colorimetria`: Cadena asignada al perfil (ej. "Invierno Frío", "Otoño Cálido").
- `prompt_generado`: Texto del prompt contextual enviado al modelo de lenguaje.
- `outfit_recomendado`: Estructura JSON con lista de SKUs de prendas sugeridas justificadas por la IA.
- `audio_comando_url`: URI opcional de almacenamiento temporal del audio procesado en búsquedas por voz.

**Funcionalidades clave:**
- Consulta automatizada a la API del clima (OpenWeatherMap) según la geolocalización o ciudad seleccionada por el usuario.
- Generación de recomendaciones contextuales de atuendos completos (ej. "Para este día de 14°C y llovizna en La Paz, te sugerimos un abrigo de paño azul marino combinado con pantalón de gabardina plomo").
- Algoritmo de filtrado que cruza las recomendaciones de la IA exclusivamente con productos disponibles en stock activo.
- Módulo de búsqueda en catálogo por comando de voz en la app móvil (transcripción de audio a texto e interpretación de intención mediante NLP).
- Generación automatizada de resúmenes y reportes ejecutivos verbales para el administrador (ej. "Dime las ventas de trajes de hoy en Santa Cruz").

---

#### 1.5.1.18 Módulo M18: Reportes, Analítica y Dashboards Empresariales
**Descripción General:**  
Proporciona herramientas de inteligencia de negocios y analítica descriptiva para la alta gerencia y los encargados de tienda. Consolida los datos transaccionales de ventas, inventarios, compras a proveedores y reservas, presentándolos en gráficos interactivos y métricas clave de desempeño (KPIs) para sustentar la toma de decisiones estratégicas de abastecimiento y ventas.

**Datos principales:**
- Métricas consolidadas: Volumen total de ventas en moneda nacional, ticket promedio de compra, rotación de inventario por sucursal, índice de conversión de reservas en ventas efectivas, productos de mayor y menor rotación (*Top/Bottom 10*), margen de contribución bruto por categoría, y tasa de retención de clientes por nivel de fidelización.
- Filtros analíticos: Por rango de fechas, sucursal, categoría textil, temporada comercial y método de pago.

**Funcionalidades clave:**
- Cuadro de mando (Dashboard) gerencial en tiempo real con tarjetas de métricas e indicadores de rendimiento.
- Reporte analítico de rotación y valoración de existencias consolidando Costo Promedio Ponderado vs Último Costo de Compra.
- Gráficos comparativos de ventas presenciales en sucursales vs ventas en canal digital (web y móvil).
- Tasa de efectividad de reservas: porcentaje de reservas presenciales concretadas en compras reales en probador.
- Exportación de informes estructurados a formatos Excel (XLSX) y PDF para fines contables y de auditoría.

---

#### 1.5.1.19 Módulo M19: Logística de Envíos y Delivery
**Descripción General:**  
Administra la distribución física y entrega de pedidos en la modalidad de compra digital con despacho a domicilio. Modela la integración con servicios de mensajería y empresas de delivery del medio local (emulando plataformas como Yaigo, Yummy o PedidosYa), calculando dinámicamente las tarifas de transporte mediante algoritmos geodésicos basados en distancia kilométrica, peso volumétrico de las prendas y zonas urbanas de cobertura, permitiendo además el rastreo del despacho en tiempo real.

**Datos principales:**
- `id_envio`: Entero autoincremental (PK).
- `id_orden_venta`: Entero (FK hacia `OrdenesVenta`).
- `id_sucursal_origen`: Entero (FK hacia `Sucursales` desde donde se despacha el paquete).
- `latitud_destino` y `longitud_destino`: Coordenadas geográficas del domicilio del comprador.
- `distancia_km`: Decimal(6,2) (calculada mediante algoritmo geodésico Haversine).
- `peso_real_kg`: Decimal(5,2) (peso físico de las prendas seleccionadas).
- `peso_volumetrico_kg`: Decimal(5,2) (calculado según: $\frac{Largo \times Ancho \times Alto}{5000}$).
- `tarifa_envio`: Decimal(10,2) (monto final cobrado por el transporte).
- `nombre_repartidor` y `telefono_repartidor`: Datos del personal o empresa de logística asignada.
- `estado_envio`: Enumerador (`ASIGNADO`, `RECOLECTADO_EN_TIENDA`, `EN_TRANSITO`, `ENTREGADO`, `FALLIDO_AUSENCIA`).
- `codigo_seguimiento`: Cadena alfanumérica de rastreo público (Tracking).

**Funcionalidades clave:**
- Algoritmo automatizado de tarificación de envíos combinando tarifa base, costo por kilómetro y peso volumétrico del paquete.
- Asignación inteligente de la sucursal de origen más cercana al domicilio del cliente que posea el stock completo de la orden.
- Módulo de asignación de pedidos a repartidores o empresas aliadas de delivery.
- Rastreo en tiempo real del estado del despacho para el cliente desde la app móvil o sitio web.
- Registro de confirmación de entrega con captura de firma digital o código OTP proporcionado por el cliente al recibir el paquete.

---

### 1.5.2 Requisitos Funcionales

#### Requisitos Funcionales Base del Enunciado (RF01 – RF25)

| ID | Requisito Funcional | Módulo Asociado |
|:---|:---|:---:|
| **RF01** | El sistema deberá permitir registrar clientes con sus datos personales completos (nombres, apellidos, correo electrónico, teléfono, fecha de nacimiento y dirección). | M01 |
| **RF02** | El sistema deberá permitir gestionar usuarios y roles jerárquicos (Administrador, Encargado de Sucursal, Cajero, Personal de Logística, Cliente, Proveedor) con asignación granular de privilegios. | M01 |
| **RF03** | El sistema deberá administrar múltiples ciudades y sucursales físicas, incluyendo localización geográfica, horarios y capacidades operativas. | M02 |
| **RF04** | El sistema deberá permitir gestionar el catálogo de productos de indumentaria masculina con sus atributos: SKU, nombre, descripción, precio base, marca, modelo e imágenes. | M03 |
| **RF05** | El sistema deberá gestionar tallas normalizadas, colores (como atributos multivaluados con código Hexadecimal), categorías jerárquicas y temporadas comerciales. | M03 / M04 |
| **RF06** | El sistema deberá gestionar proveedores comerciales con su información fiscal, condiciones de pago y catálogo de prendas suministradas. | M05 |
| **RF07** | El cliente deberá poder consultar el catálogo de prendas de vestir desde la plataforma web y la aplicación móvil, con navegación fluida y fichas técnicas completas. | M07 |
| **RF08** | El cliente y los operadores deberán poder consultar la disponibilidad de stock de una prenda (talla y color) por sucursal en tiempo real. | M06 / M07 |
| **RF09** | El cliente deberá poder seleccionar múltiples prendas de diferentes tallas y colores para incorporarlas en una solicitud de reserva física. | M10 |
| **RF10** | El sistema deberá registrar y gestionar reservas de prendas, asociándolas a una sucursal física, fecha y horario programado de visita presencial. | M10 |
| **RF11** | El sistema deberá notificar en tiempo real las reservas a la sucursal correspondiente para que el encargado prepare y ordene las prendas en probadores. | M10 |
| **RF12** | El sistema deberá permitir consultar y actualizar el estado de una reserva (Pendiente, Preparada, Atendida, Concretada en Venta, Cancelada, Expirada). | M10 |
| **RF13** | La aplicación móvil deberá permitir utilizar el vestidor virtual mediante realidad aumentada para proyectar prendas sobre la silueta del cliente con la cámara. | M08 |
| **RF14** | El cliente deberá poder agregar productos al carrito de compras con validación atómica de existencias y cálculo dinámico de totales. | M11 |
| **RF15** | El cliente deberá poder completar compras digitales desde la plataforma web seleccionando método de pago y modalidad de entrega (retiro en tienda o envío). | M12 |
| **RF16** | El cliente deberá poder completar compras digitales desde la aplicación móvil con idénticas capacidades transaccionales que en el entorno web. | M12 |
| **RF17** | El cajero de sucursal deberá poder registrar ventas presenciales desde el punto de caja (POS), asociando prendas, cliente y emitiendo comprobantes. | M13 |
| **RF18** | El sistema deberá permitir cobros presenciales en punto de caja mediante efectivo, tarjetas de débito/crédito y códigos QR. | M13 / M15 |
| **RF19** | El sistema deberá integrar una pasarela de pago electrónico internacional (Stripe / PayPal en modo Sandbox) para compras digitales seguras. | M14 |
| **RF20** | El sistema deberá actualizar automáticamente el inventario tras cada venta (presencial o digital), descontando las existencias por sucursal, talla y color. | M06 |
| **RF21** | El sistema deberá controlar las existencias por sucursal, registrando el stock físico, stock reservado, stock mínimo, último costo unitario y costo promedio ponderado. | M06 |
| **RF22** | El sistema deberá registrar todos los movimientos de kardex de inventario (entradas por compra, salidas por venta, mermas y transferencias inter-sucursales). | M06 |
| **RF23** | El sistema deberá gestionar temporadas comerciales y colecciones de moda, permitiendo categorizar y filtrar las prendas de vestir asociadas. | M04 |
| **RF24** | El sistema deberá permitir generar reportes consolidados de ventas e inventario con filtros por sucursal, fechas, categorías y temporadas. | M18 |
| **RF25** | El sistema deberá proporcionar al menos una funcionalidad basada en inteligencia artificial orientada a la recomendación personalizada de prendas. | M17 |

---

#### Requisitos Funcionales Personalizados y Diferenciadores (RF26 – RF38)

| ID | Requisito Funcional | Módulo Asociado |
|:---|:---|:---:|
| **RF26** | El sistema deberá permitir al cliente comparar visualmente hasta tres combinaciones de ropa (outfits) lado a lado en pantalla con desglose de precios y descuentos. | M09 |
| **RF27** | El sistema deberá asignar automáticamente puntos de fidelización al cliente por cada compra formalizada, calculados en función del monto total pagado. | M16 |
| **RF28** | El sistema deberá gestionar niveles jerárquicos de fidelización (Bronce, Plata, Oro, Diamante) con políticas de descuentos crecientes por nivel. | M16 |
| **RF29** | El sistema deberá otorgar insignias y distinciones digitales al cliente por cumplimiento de hitos de compra y uso recurrente de la plataforma. | M16 |
| **RF30** | El sistema deberá permitir al cliente canjear puntos de fidelización acumulados por descuentos monetarios directos en el proceso de compra. | M16 |
| **RF31** | El Asistente de IA deberá recomendar outfits contextuales analizando en tiempo real la temperatura y condiciones climáticas de la ciudad del usuario vía API meteorológica. | M17 |
| **RF32** | El Asistente de IA deberá considerar el historial de compras previas, colorimetría y preferencias de estilo del cliente para afinar las recomendaciones. | M17 |
| **RF33** | La aplicación móvil deberá permitir realizar búsquedas de prendas en el catálogo y solicitar reportes de gestión mediante comandos de voz en lenguaje natural. | M17 |
| **RF34** | El sistema deberá calcular dinámicamente la tarifa de entrega a domicilio para compras digitales considerando distancia kilométrica, peso y volumen de la orden. | M19 |
| **RF35** | El sistema deberá registrar una bitácora inmutable de accesos y eventos de seguridad con información de usuario, dirección IP, dispositivo y fecha/hora. | M01 |
| **RF36** | El sistema deberá generar tableros de control ejecutivos (dashboards) con métricas en tiempo real de ventas, rotación de inventarios y retención de clientes. | M18 |
| **RF37** | El sistema deberá permitir la conversión directa e inmediata de una reserva física de prendas en una venta efectiva dentro del punto de caja POS. | M10 / M13 |
| **RF38** | El sistema deberá permitir al cliente consultar su panel de gamificación: saldo de puntos, nivel de membresía actual, barra de progreso e insignias obtenidas. | M16 |

---

### 1.5.3 Requisitos No Funcionales

| ID | Categoría | Especificación del Requisito No Funcional | Criterio de Verificación / Métrica |
|:---|:---|:---|:---|
| **RNF01** | **Seguridad** | Las contraseñas deberán ser almacenadas cifradas mediante algoritmo `bcrypt` con factor de coste $\ge 12$. Los tokens de sesión JWT deberán utilizar firmas criptográficas seguras. No se admitirá almacenamiento de contraseñas en texto plano ni de datos sensibles de tarjetas (cumplimiento normativo PCI-DSS). Toda la comunicación web y móvil deberá realizarse obligatoriamente mediante protocolo cifrado HTTPS/TLS 1.3. | Inspección de base de datos y auditoría de tráfico SSL/TLS. |
| **RNF02** | **Rendimiento** | Las consultas de búsqueda y filtrado en el catálogo digital deberán responder en un tiempo inferior a 2.5 segundos bajo condiciones normales de concurrencia. Las operaciones de cálculo de inventario y reservas atómicas no deberán exceder los 800 milisegundos. | Pruebas de estrés y benchmarking con Apache JMeter / k6. |
| **RNF03** | **Disponibilidad** | El sistema deberá estar desplegado en infraestructura de nube pública, garantizando un índice de disponibilidad operativa del 99% en régimen 24/7, permitiendo transacciones simultáneas desde clientes web y móviles. | Monitor de uptime en plataforma de nube (Railway / Render). |
| **RNF04** | **Escalabilidad** | La arquitectura del backend y la base de datos relacional PostgreSQL deberán permitir la incorporación de nuevas ciudades, sucursales físicas y categorías de productos sin requerir reestructuraciones en el esquema de datos ni refactorización de código fuente. | Pruebas de inserción masiva y diseño normalizado 3FN. |
| **RNF05** | **Usabilidad** | Las interfaces gráficas de usuario deberán ser completamente responsivas, adaptativas y ceñidas a los lineamientos de diseño moderno (Material Design en Angular y Flutter), garantizando una experiencia intuitiva tanto en pantallas de escritorio, tablets como smartphones. | Pruebas de usabilidad en múltiples resoluciones de pantalla. |
| **RNF06** | **Mantenibilidad** | El código fuente del backend y frontend deberá estructurarse en paquetes modulares desacoplados siguiendo los principios de diseño SOLID y arquitectura limpia (Clean Architecture / Capas), facilitando la localización de fallos, extensibilidad y pruebas unitarias. | Revisión de código y métricas de acoplamiento y cohesión. |
| **RNF07** | **Interoperabilidad** | El backend desarrollado con FastAPI deberá exponer la totalidad de sus servicios mediante una API REST estandarizada, documentada exhaustivamente mediante esquemas interactivos OpenAPI / Swagger UI. | Inspección de documentación Swagger en `/docs`. |
| **RNF08** | **Compatibilidad Multiplataforma** | La aplicación móvil desarrollada en Flutter/Dart deberá garantizar compilación y compatibilidad transparente para sistemas operativos móviles Android (versión 8.0+) e iOS (versión 13+). | Pruebas de ejecución en emuladores y dispositivos físicos. |
| **RNF09** | **Integridad Transaccional** | Todas las operaciones críticas de actualización de existencias, reservas y pagos deberán ejecutarse bajo el principio de transaccionalidad ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad) en la base de datos PostgreSQL, evitando anomalías por condiciones de carrera (*Race Conditions*). | Pruebas de concurrencia transaccional simultánea. |
| **RNF10** | **Despliegue en Nube** | Conforme a las restricciones académicas institucionales, el sistema no deberá operar en entorno local (*localhost*) durante las presentaciones y defensas, debiendo desplegarse de manera accesible al público en servidores en la nube con dominio público y código QR de acceso directo. | Validación de URL pública y lectura de código QR. |
| **RNF11** | **Trazabilidad y Auditoría** | El sistema deberá mantener un registro inmutable en base de datos de cada acción administrativa, modificación de inventario, cambio de precios y eventos de autenticación, registrando usuario, timestamp, IP y estado previo/posterior. | Consulta de tabla de auditoría en base de datos. |

---

### 1.5.4 Actores del Sistema

| Actor | Tipo | Plataforma de Acceso | Responsabilidades y Acciones Principales en el Sistema |
|:---|:---:|:---:|:---|
| **Cliente** | Humano / Externo | Web (Angular) + Móvil (Flutter) | Consulta catálogo, filtra por sucursal/temporada, utiliza el vestidor virtual con Realidad Aumentada, realiza reservas presenciales de prendas, adquiere productos mediante compra digital, utiliza el comparador de outfits, recibe recomendaciones contextuales de IA, acumula puntos de fidelización y canjea beneficios. |
| **Administrador General** | Humano / Interno | Web (Angular) | Control total del sistema: gestión de usuarios y asignación de roles (RBAC), alta de ciudades y sucursales, administración del catálogo de prendas, gestión de temporadas y colecciones, configuración de proveedores, consulta de inventario global consolidado, supervisión de dashboards y métricas de negocio. |
| **Encargado de Sucursal** | Humano / Interno | Web (Angular) | Recepción de reservas presenciales asignadas a su tienda, apartado físico de prendas en perchas y probadores, registro de la atención del cliente, control de disponibilidad local, solicitud y recepción de transferencias de inventario, y reporte de mermas. |
| **Cajero** | Humano / Interno | Web (Angular - Módulo POS) | Búsqueda rápida de productos por SKU o código de barras, conversión de reservas presenciales en ventas definitivas, procesamiento de cobros físicos y digitales (efectivo, tarjetas, QR), emisión de comprobantes de venta y cierre de turno de caja. |
| **Personal de Logística** | Humano / Interno | Web (Angular) | Registro de entradas de mercadería por compras a proveedores, verificación física de lotes, registro de costos unitarios y cálculo de costo promedio ponderado, preparación de pedidos digitales para delivery y despacho a repartidores. |
| **Proveedor** | Humano / Externo | Web (Angular - Portal Proveedor) | Consulta de órdenes de compra emitidas a su nombre, confirmación de disponibilidad de lotes, registro de información de nuevas líneas textiles y asociación a colecciones estacionales. |
| **Pasarela de Pagos (Stripe / PayPal)** | Sistema Externo / API | Servicio en la Nube | Procesamiento seguro de cobros digitales, tokenización de medios de pago, verificación de fondos, aprobación/rechazo de transacciones y emisión de eventos asíncronos vía Webhooks. |
| **Servicio de Inteligencia Artificial** | Sistema Externo / API | Servicio en la Nube (OpenAI / Gemini) | Procesamiento de solicitudes de recomendación de estilo en lenguaje natural, análisis de compatibilidad estética, interpretación de comandos de voz y generación de reportes gerenciales automatizados. |
| **Servicio Meteorológico (OpenWeatherMap)** | Sistema Externo / API | Servicio en la Nube | Provisión en tiempo real de datos de temperatura, precipitaciones y estado del clima según la ciudad geolocalizada del usuario para enriquecer las sugerencias del asistente de estilo. |

---

### 1.5.5 Planificación de Iteraciones (Ciclos de Desarrollo PUDS)

El proyecto se planifica rigurosamente en tres iteraciones evolutivas e incrementales dentro del Proceso Unificado de Desarrollo de Software:

```mermaid
gantt
    title Cronograma de Iteraciones del Proyecto FashionStore (Semestre 2-2026)
    dateFormat  YYYY-MM-DD
    section Iteración 1
    Fundamentos y Módulos Base          :active, it1, 2026-08-25, 2026-09-05
    Hito: Entrega #1 (Perfil + Base)    :milestone, m1, 2026-09-05, 0d
    section Iteración 2
    Transacciones y Procesos Centrales  :it2, 2026-09-06, 2026-09-13
    Hito: Entrega #2 (Comercio + POS)   :milestone, m2, 2026-09-13, 0d
    section Iteración 3
    Diferenciadores, IA y Cierre        :it3, 2026-09-14, 2026-09-20
    Hito: Entrega Final y Despliegue    :milestone, m3, 2026-09-20, 0d
    Defensa Final de Software           :milestone, def, 2026-09-22, 0d
```

- **Iteración 1 — Fundamentos, Seguridad y Catálogo Base (25/08/2026 – 05/09/2026):**
  * *Objetivo:* Establecer la arquitectura base del software, modelo de datos relacional, módulos de seguridad RBAC, gestión de sucursales, catálogo de prendas masculinas, temporadas comerciales, proveedores y control de inventario con costo unitario y costo promedio ponderado.
  * *Entregable:* Perfil formal del proyecto, Parte I - Fundamentación Teórica, Modelado de Negocio con diagramas de actividad, código backend y frontend desplegado en nube pública con QR de acceso.
- **Iteración 2 — Procesos Transaccionales, Reservas y Puntos de Venta (06/09/2026 – 13/09/2026):**
  * *Objetivo:* Implementar el flujo de reservas presenciales en tienda, el carrito de compras omnicanal, el punto de venta presencial (POS), la integración de pasarelas de pago electrónico (Stripe/PayPal Sandbox) y la actualización automática de inventarios post-venta.
  * *Entregable:* Documento actualizado con flujos de captura de requisitos, análisis y diseño de transacciones (diagramas de secuencia, estado y navegación), software operativo desplegado.
- **Iteración 3 — Diferenciadores Tecnológicos, Inteligencia Artificial y Cierre (14/09/2026 – 20/09/2026):**
  * *Objetivo:* Integrar el vestidor virtual con Realidad Aumentada en Flutter, el comparador interactivo de outfits, el sistema de fidelización gamificado, el asistente de estilo con IA contextual (clima + preferencias), búsqueda por voz y cuadros de mando analíticos.
  * *Entregable:* Documento maestro consolidado con los cinco flujos de trabajo PUDS completos, casos de prueba documentados, y defensa final del software el 22/09/2026.

---

### 1.5.6 Matriz de Funcionalidades por Plataforma

| Funcionalidad / Módulo | Web Administrativa y Tienda (Angular) | Aplicación Móvil Nativa (Flutter) |
|:---|:---:|:---:|
| Registro, inicio de sesión y recuperación de contraseña | ✅ | ✅ |
| Consulta de catálogo con filtros multidimensionales | ✅ | ✅ |
| Verificación de disponibilidad de stock por sucursal | ✅ | ✅ |
| Vestidor virtual interactivo con Realidad Aumentada (RA) | ❌ (Requiere sensores móviles) | ✅ |
| Comparador visual interactivo de outfits | ✅ | ✅ |
| Generación de reserva presencial de prendas con QR | ✅ | ✅ |
| Carrito de compras sincronizado y Checkout digital | ✅ | ✅ |
| Pago con tarjeta / PayPal / Stripe en línea | ✅ | ✅ |
| Punto de Venta Presencial (POS) para cajeros | ✅ | ❌ |
| Asistente de estilo con IA contextual (clima y colorimetría) | ✅ | ✅ |
| Búsqueda por comando de voz en lenguaje natural | ❌ | ✅ |
| Perfil de fidelización gamificada (puntos, nivel, insignias) | ✅ | ✅ |
| Gestión de sucursales, productos, categorías y proveedores | ✅ | ❌ |
| Control de inventario multi-sucursal y costos ponderados | ✅ | ❌ |
| Gestión y preparación de reservas presenciales (Encargado) | ✅ | ❌ |
| Tableros de control ejecutivos y reportes analíticos | ✅ | ❌ |

---

### 1.5.7 Restricciones y Limitaciones del Proyecto

1. **Prohibición de Frameworks E-Commerce Preconstruidos**: Queda terminantemente vetado el uso de soluciones empaquetadas como Shopify, WooCommerce, PrestaShop, Magento o similares. La totalidad del backend, lógica de negocio y frontends debe desarrollarse a medida.
2. **Despliegue Obligatorio en Nube Pública**: El sistema no debe operar en `localhost` durante presentaciones ni defensas; debe desplegarse con certificado SSL válido y accesibilidad vía URL pública y código QR.
3. **Plazo Estricto de Ejecución**: Plazo improrrogable de 4 semanas (25/08/2026 al 22/09/2026), demandando priorización estricta sobre un Producto Mínimo Viable (MVP) completamente robusto.
4. **Stack Tecnológico Homologado**: Backend en Python con FastAPI, Frontend Web en Angular, Aplicación Móvil en Flutter con Dart, y Base de Datos relacional en PostgreSQL.
5. **Estándar de Modelado UML 2.5+**: Todos los artefactos metodológicos deben ceñirse rigurosamente a las especificaciones formales de UML 2.5+.
6. **Entornos Sandbox para Pagos**: Las transacciones financieras electrónicas se procesarán en modo de prueba (*Sandbox*) sin cobros a tarjetas de crédito reales.

---

### 1.5.8 Herramientas y Stack Tecnológico de Desarrollo

| Capa / Dominio | Tecnología / Herramienta | Versión | Justificación Técnica de Selección |
|:---|:---|:---:|:---|
| **Backend** | Python + FastAPI | 3.11+ / 0.110+ | Alta velocidad de ejecución asíncrona (ASGI), generación nativa de esquemas OpenAPI/Swagger, validación tipada con Pydantic y excelente ecosistema para integración con IA. |
| **Frontend Web** | Angular + TypeScript | 17+ | Arquitectura robusta basada en componentes, inyección de dependencias, tipado estricto y alto rendimiento para sistemas de gestión administrativa y catálogos responsivos. |
| **Aplicación Móvil** | Flutter + Dart | 3.22+ | Desarrollo multiplataforma nativo (Android e iOS) desde un único código base, motor gráfico de alto rendimiento (Impeller/Skia) óptimo para Realidad Aumentada. |
| **Base de Datos** | PostgreSQL | 15+ | Sistema gestor relacional líder, soporte nativo de transacciones ACID, tipos de datos JSONB para estructuras dinámicas y excelente soporte geoespacial. |
| **Realidad Aumentada** | ARCore / Google ML Kit | Integrado en Flutter | Detección de planos y visión artificial para superposición de indumentaria tridimensional en tiempo real sobre smartphones. |
| **Inteligencia Artificial** | OpenAI API / Gemini API | Modelos 4o / 1.5 Flash | Inferencia rápida y precisa para procesamiento de lenguaje natural, recomendaciones contextuales y análisis semántico de comandos de voz. |
| **Pasarelas de Pago** | Stripe API & PayPal SDK | V3 / Sandbox | Estándares globales en pagos digitales, componentes seguros de checkout y soporte integral para webhooks asíncronos. |
| **Servicio Meteorológico**| OpenWeatherMap API | 2.5 One Call | Proveedor de datos climáticos mundiales en tiempo real por coordenadas geográficas o nombre de ciudad. |
| **Modelado UML** | Enterprise Architect / Draw.io | UML 2.5+ | Herramientas formales para la elaboración de diagramas de actividad, clases, secuencia, despliegue y navegación. |
| **Infraestructura Nube** | Render / Railway / Supabase | Cloud PaaS | Plataformas modernas para despliegue automatizado continuo (CI/CD) de servicios FastAPI, Angular y PostgreSQL con dominios HTTPS públicos. |

---

# Parte I - Fundamentación Teórica

## a) Comercio Electrónico (E-commerce)

### Conceptos Generales, Modelos de Negocio y Evolución
El comercio electrónico comprende la compra, venta, comercialización y distribución de bienes, servicios e información a través de redes telemáticas e internet. A lo largo de las últimas dos décadas, ha evolucionado desde los primeros catálogos estáticos en la web 1.0 hasta ecosistemas omnicanales hiperpersonalizados impulsados por inteligencia artificial y computación en la nube.

Dentro de los modelos de negocio tradicionales se distinguen:
- **B2C (Business-to-Consumer)**: Modelo en el cual una empresa comercializa bienes directamente al consumidor individual final. Es el modelo rector de FashionStore.
- **B2B (Business-to-Business)**: Transacciones comerciales entre empresas (ej. compras masivas de FashionStore a sus proveedores textiles).
- **C2C (Consumer-to-Consumer)**: Transacciones entre usuarios particulares mediadas por una plataforma (ej. mercados de subastas o segunda mano).
- **Omnicanalidad (Omnichannel Retail)**: Evolución del modelo tradicional multicanal que unifica de forma transparente la experiencia de compra en tiendas físicas, aplicaciones móviles, plataformas web y redes sociales, compartiendo una base de datos centralizada de inventario, clientes y precios.

---

### Análisis Comparativo como Usuario: Amazon, Alibaba y Shopify

| Dimensión de Análisis | Amazon | Alibaba | Shopify |
|:---|:---|:---|:---|
| **Modelo Principal** | B2C y Marketplace Global directo. | B2B internacional (Alibaba.com) y B2C/C2C (AliExpress/Taobao). | Plataforma SaaS que faculta a marcas independientes para operar sus propias tiendas D2C (Direct-to-Consumer). |
| **Experiencia de Navegación y Búsqueda** | Buscador predictivo extremadamente potente, filtros ultra-específicos, opiniones verificadas y algoritmo de sugerencias A9/Rufus. | Orientado a compras mayoristas: búsqueda por cotizaciones, pedido mínimo (MOQ), especificaciones de fábrica y muestras. | Depende del diseño de la marca particular; navegación limpia, minimalista y centrada en la identidad visual de la tienda. |
| **Experiencia en el Carrito y Checkout** | Compra en 1-Clic (*1-Click Checkout*), almacenamiento seguro de múltiples tarjetas y domicilios, envío Prime en 24h. | Negociación directa con proveedores (Trade Assurance), pago por cartas de crédito, transferencias bancarias o tarjetas. | Flujo ultra-optimizado mediante **Shop Pay**, permitiendo checkout en 1 paso con código SMS a nivel global. |
| **Políticas de Devolución y Post-Venta** | Política sumamente favorable al usuario con devoluciones automáticas en puntos de acopio sin costo adicional. | Mediación de disputas complejas; las devoluciones físicas internacionales suelen ser lentas y costosas. | Cada comerciante define sus propias políticas de garantía y devolución según su logística particular. |

---

### Análisis Comparativo como Desarrollador: Magento, PrestaShop y WooCommerce

Conforme a los requerimientos de la cátedra, a continuación se analizan las principales plataformas de software libre y código abierto utilizadas en la industria para implementar tiendas en línea:

| Dimensión Técnica | Magento (Adobe Commerce) | PrestaShop | WooCommerce |
|:---|:---|:---|:---|
| **Propósito y Alcance** | Plataforma empresarial de gran escala diseñada para multinacionales con catálogos masivos y alta concurrencia. | Solución intermedia orientada a pequeñas y medianas empresas (PyMEs) con catálogos medianos. | Plugin de comercio electrónico de código abierto desarrollado para transformar sitios WordPress en tiendas en línea. |
| **Arquitectura de Software** | Arquitectura modular altamente desacoplada en capas, basada en PHP y el framework Zend/Laminas. Soporta microservicios y GraphQL. | Basado en PHP bajo el framework Symfony; arquitectura clásica de componentes y módulos controladores. | Arquitectura basada en los hooks, actions y filters del núcleo de WordPress sobre PHP y MySQL. |
| **Ventajas Principales** | Escalabilidad extrema, gestión multi-tienda nativa, multi-moneda, soporte de inventarios multi-sucursal sumamente robusto. | Fácil de administrar para usuarios no técnicos, consumo moderado de recursos en servidor, amplio catálogo de módulos. | Despliegue sumamente veloz, costo de desarrollo inicial muy reducido, millones de temas y plugins compatibles en el ecosistema WordPress. |
| **Desventajas y Complejidad** | Curva de aprendizaje muy elevada, requiere servidores dedicados de alto rendimiento (mínimo 8GB RAM, Elasticsearch obligatorio). | Dependencia excesiva de módulos comerciales de pago para funciones clave; migraciones de versiones propensas a errores. | Pierde rendimiento y estabilidad ante bases de datos masivas (más de 20,000 productos o transacciones concurrentes intensas). |
| **Base de Datos** | MySQL / MariaDB (con tablas EAV - Entity Attribute Value que aumentan la complejidad relacional). | MySQL / MariaDB (diseño relacional clásico normalizado). | MySQL / MariaDB (utiliza las tablas `wp_posts` y `wp_postmeta`, lo que genera cuellos de botella en consultas complejas). |

> [!NOTE]
> **Conclusión para FashionStore:** Aunque estas plataformas ofrecen soluciones prefabricadas, la cátedra prohíbe explícitamente su empleo para garantizar que los estudiantes dominen el diseño desde las bases arquitectónicas mediante FastAPI, Angular, Flutter y PostgreSQL.

---

## b) Pasarelas de Pago

### Mecanismos de Pago en Línea
El comercio digital moderno exige la coexistencia de múltiples mecanismos transaccionales que equilibren conveniencia para el comprador y seguridad contra fraudes:
1. **Tarjetas de Débito y Crédito**: Siguen siendo el medio de mayor volumen global. La transacción involucra una cadena de actores: el cliente (tarjetahabiente), el banco emisor (*Issuing Bank*), la pasarela de pago (*Payment Gateway*), la red adquirente (Visa, Mastercard) y el banco receptor del comercio (*Acquiring Bank*). El estándar de seguridad internacional **PCI-DSS (Payment Card Industry Data Security Standard)** prohíbe taxativamente que los comercios almacenen el código CVV o el número de tarjeta (PAN) en texto plano, obligando a implementar procesos de **tokenización**.
2. **Códigos QR Interoperables (QR Simple / BCB)**: En el contexto boliviano, el Código QR se ha consolidado como el medio de pago electrónico más popular debido a su inmediatez y costo cero de comisiones directas al usuario. Opera bajo transferencias interbancarias automáticas coordinadas por la Cámara de Compensación y Liquidación (ACH).
3. **Transferencias Bancarias Tradicionales**: Mecanismo asíncrono donde el cliente transfiere fondos desde su banca móvil y remite una constancia física o digital al comercio para su posterior validación manual o conciliación vía API bancaria.

---

### Pasarela Nacional: LIBÉLULA
**Libélula** es una pasarela de pagos tecnológica boliviana desarrollada para resolver las complejidades del comercio electrónico local. 
- **Modo de Operación**: Actúa como un concentrador de pagos unificado, integrando en una sola API cobros mediante Códigos QR generados dinámicamente, tarjetas de débito/crédito locales e internacionales, billeteras móviles (Tigo Money) y cobranzas presenciales en redes de cobranza física (Farmacias, supermercados afiliados).
- **Integración Técnica**: Libélula proporciona un entorno de integración mediante APIs REST y bibliotecas cliente. Cuando una orden se genera en el e-commerce, el backend invoca el endpoint de Libélula transmitiendo monto, detalle y cliente; Libélula responde con un enlace a su pasarela segura o devuelve un código QR dinámico con vencimiento programado (ej. 15 minutos).
- **Confirmación por Webhooks**: Una vez que el tarjetahabiente o usuario escanea y confirma el pago en su aplicación bancaria, los servidores de Libélula emiten una petición HTTP POST asíncrona (*Webhook*) hacia el endpoint configurado en el backend de FashionStore, notificando el éxito de la transacción para que el sistema actualice el estado de la venta y descuente el inventario de manera atómica.

---

### Pasarelas Internacionales: STRIPE y PAYPAL
- **STRIPE**: Considerada el estándar de facto para desarrolladores de software a nivel global.
  * *Entorno Sandbox*: Ofrece un entorno de pruebas completo con números de tarjeta simulados para verificar casos de éxito, fondos insuficientes, tarjetas vencidas o validaciones de autenticación reforzada 3D Secure (SCA).
  * *Tokenización mediante Stripe Elements*: El formulario de tarjeta se renderiza dentro de un iframe seguro alojado en los servidores de Stripe. El backend del e-commerce nunca toca ni procesa los dígitos de la tarjeta; solo recibe un `payment_method_id` seguro.
  * *Manejo de Webhooks*: Stripe notifica eventos como `payment_intent.succeeded` o `payment_intent.payment_failed` mediante llamadas criptográficamente firmadas con un secreto compartido (*Webhook Secret*).
- **PAYPAL**: Pionero de los pagos electrónicos en internet.
  * *Entorno Sandbox*: Plataforma de desarrolladores que permite crear cuentas ficticias de compradores y vendedores con saldos virtuales para pruebas de checkout.
  * *Flujo de Integración*: Permite integrar botones inteligentes de pago (*PayPal Smart Payment Buttons*). El usuario es redirigido a una ventana emergente de PayPal donde autoriza la transacción con su saldo o tarjeta vinculada, y el flujo retorna al e-commerce mediante endpoints de captura (*capture payment*).

---

## c) Servicios de Delivery y Logística de Última Milla

### Operación del Delivery en Aplicaciones Urbanas (Yaigo, Yummy, PedidosYa)
La logística de última milla representa el eslabón final y más sensible del comercio digital. Plataformas como Yaigo, Yummy y PedidosYa operan bajo un modelo de economía colaborativa triangulada:
1. **El Comercio (FashionStore)**: Recibe la orden de compra digital, la valida y empaqueta las prendas en la sucursal física asignada para el despacho.
2. **El Repartidor / Conductor**: Recibe una notificación en su aplicación móvil con los datos de recolección en tienda y destino final del cliente, aceptando el viaje en función de su cercanía.
3. **El Cliente Final**: Visualiza en tiempo real sobre un mapa la localización geográfica del repartidor mediante GPS y recibe un código OTP de seguridad para validar la entrega física del paquete.

---

### Algoritmos y Variables de Cálculo de Tarifas de Envío
Para determinar el costo exacto del servicio de entrega a domicilio, los sistemas logísticos no aplican valores fijos, sino que emplean funciones matemáticas basadas en las siguientes variables clave:

1. **Distancia Geodésica ($D$)**: Calculada a partir de las coordenadas de latitud y longitud de la sucursal de despacho $(\phi_1, \lambda_1)$ y del domicilio del cliente $(\phi_2, \lambda_2)$ mediante la **Fórmula de Haversine**:
   $$\Delta \phi = \phi_2 - \phi_1, \quad \Delta \lambda = \lambda_2 - \lambda_1$$
   $$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
   $$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad D = R \cdot c \quad (R = 6371\text{ km})$$

2. **Peso Volumétrico ($P_v$)**: En la industria textil y de paquetería, prendas voluminosas (como abrigos pesados o parkas) ocupan espacio crítico en los vehículos de reparto aunque su peso real en kilogramos sea bajo. Se aplica el estándar IATA:
   $$P_v = \frac{\text{Largo (cm)} \times \text{Ancho (cm)} \times \text{Alto (cm)}}{5000}$$
   El peso facturable ($P_f$) corresponde al mayor valor entre el peso físico real ($P_r$) y el peso volumétrico ($P_v$):
   $$P_f = \max(P_r, P_v)$$

3. **Fórmula General de Tarificación Logística**:
   $$\text{Tarifa Final} = T_{\text{base}} + (D \times C_{\text{km}}) + (P_f \times C_{\text{peso}}) \times F_{\text{zona}} \times F_{\text{demanda}}$$
   Donde:
   - $T_{\text{base}}$: Tarifa base fija de arranque (ej. 10.00 Bs).
   - $C_{\text{km}}$: Costo por kilómetro recorrido (ej. 2.50 Bs/km).
   - $C_{\text{peso}}$: Recargo por kilogramo excedente (ej. 1.50 Bs/kg si $P_f > 2\text{ kg}$).
   - $F_{\text{zona}}$: Factor multiplicador según dificultad de acceso del cuadrante urbano (1.0 a 1.3).
   - $F_{\text{demanda}}$: Tarifa dinámica por condiciones meteorológicas adversas (lluvia) u horarios pico de congestión vehicular.

---

## d) Proceso Unificado de Desarrollo de Software (PUDS)

El PUDS (o RUP - *Rational Unified Process*) es un marco de trabajo de ingeniería de software disciplinado, estandarizado y ampliamente adoptado en la industria para el desarrollo de sistemas orientados a objetos.

### Características Esenciales
1. **Dirigido por Casos de Uso (*Use-Case Driven*)**: Los casos de uso son los artefactos primarios que guían todo el proceso de desarrollo. Definen el comportamiento esperado del sistema desde la óptica de los actores externos y sirven como hilo conductor transversal para el análisis, el diseño arquitectónico, la codificación en los controladores y la generación de casos de prueba.
2. **Centrado en la Arquitectura (*Architecture-Centric*)**: Establece tempranamente una arquitectura base sólida y extensible. Considera las diferentes vistas arquitectónicas (Vista Lógica, Vista de Implementación, Vista de Procesos, Vista de Despliegue y Vista de Casos de Uso — el modelo 4+1 vistas de Kruchten).
3. **Iterativo e Incremental (*Iterative and Incremental*)**: El proyecto se divide en ciclos o iteraciones temporales manejables. Cada iteración aborda un conjunto priorizado de casos de uso y culmina con una versión ejecutable y verificable del software desplegada en un entorno real.

---

### Fases del Ciclo de Vida PUDS
- **Fase de Inicio (*Inception*)**: Delimitación del alcance del proyecto, identificación de los actores principales, modelado de negocio preliminar, formulación de objetivos y viabilidad económica/técnica.
- **Fase de Elaboración (*Elaboration*)**: Mitigación de los principales riesgos técnicos, refinamiento de los casos de uso críticos, diseño de la arquitectura base del sistema y especificación del modelo de datos.
- **Fase de Construcción (*Construction*)**: Desarrollo masivo de los componentes de software, integración de módulos, codificación y pruebas unitarias de los requerimientos funcionales restantes.
- **Fase de Transición (*Transition*)**: Despliegue en el entorno productivo de nube, pruebas de aceptación con usuarios finales, capacitación y ajustes post-lanzamiento.

---

### Flujos de Trabajo Fundamentales (Disiplinas)
1. **Captura de Requisitos**: Identificación, estructuración y especificación detallada de Casos de Uso y Actores, diagramas con relaciones `<<include>>`, `<<extend>>` y prototipado de interfaces.
2. **Análisis**: Transformación de los requisitos en una estructura conceptual del sistema (clases de análisis: Interfaz, Control y Entidad).
3. **Diseño**: Definición de la arquitectura física (Despliegue) y lógica (Capas), diseño de interacción (Secuencia y Comunicación), diseño de comportamiento (Estados y Tiempo), diseño de navegación y diseño de base de datos relacional.
4. **Implementación**: Selección de plataforma y traducción del diseño en código ejecutable organizado en paquetes y microservicios.
5. **Pruebas**: Verificación funcional mediante pruebas de caja negra, pruebas de casos de uso e historias de usuario para garantizar la calidad del software.

---

## e) Lenguaje de Modelado Unificado (UML 2.5+)

UML es el lenguaje estándar adoptado por la OMG (*Object Management Group*) para visualizar, especificar, construir y documentar los artefactos de un sistema de software con enfoque orientado a objetos.

### Taxonomía de Diagramas en UML 2.5+
UML 2.5+ clasifica sus diagramas en dos grandes vertientes complementarias:

```
UML 2.5+
│
├── 1. Aspecto Estructural (Modelos Estáticos)
│   ├── Diagrama de Clases
│   ├── Diagrama de Paquetes
│   ├── Diagrama de Despliegue
│   ├── Diagrama de Componentes
│   ├── Diagrama de Objetos
│   └── Diagrama de Estructura Compuesta
│
└── 2. Aspecto Dinámico / Comportamiento (Modelos de Proceso e Interacción)
    ├── Diagrama de Actividad (Modelo de Negocio / Flujos de Trabajo)
    ├── Diagrama de Casos de Uso
    ├── Diagrama de Máquinas de Estado
    └── Diagramas de Interacción:
        ├── Diagrama de Secuencia
        ├── Diagrama de Comunicación
        ├── Diagrama de Tiempo
        └── Diagrama Global de Interacción
```

- **Diagrama de Actividad**: Es el artefacto principal para modelar el **Modelo de Negocio** y la lógica procedimental de los casos de uso. Representa flujos de control paso a paso, bifurcaciones de decisión, uniones y actividades concurrentes organizadas mediante **particiones o calles (*swimlanes*)** que identifican con precisión al actor responsable de cada acción.
- **Diagrama de Casos de Uso**: Representa los límites del sistema y la interacción funcional entre actores externos y servicios del software.
- **Diagrama de Secuencia y Comunicación**: Diagramas de interacción que enfatizan el orden cronológico del paso de mensajes entre objetos (Secuencia) o la organización estructural de los objetos colaboradores (Comunicación).
- **Diagrama de Despliegue**: Modela la topología física del hardware, nodos de ejecución en la nube, servidores web, servidores de bases de datos y los enlaces de red telemáticos que los interconectan.

---

# Modelado de Negocio (Business Modeling - Diagramas de Actividades de Macroprocesos)

## 2.1 Justificación del Modelo de Negocio en el PUDS

En la ingeniería de software profesional guiada por el PUDS, **antes de formular los requisitos de un sistema informático es imperativo comprender a cabalidad cómo opera el negocio en el mundo real**. Como enfatiza la cátedra en sus notas de clase (C6, B4), un desarrollador no puede programar un software a la medida de una organización si desconoce los flujos de trabajo, las responsabilidades de los empleados, los procedimientos de compra a proveedores, la mecánica contable del inventario y la interacción del cliente en las tiendas.

El **Modelo de Negocio** utiliza los **Diagramas de Actividad UML con calles/particiones (swimlanes)** para modelar los procesos operacionales de la empresa. Cada calle representa un actor o trabajador del negocio (Cliente, Encargado de Sucursal, Cajero, Almacén/Logística, Sistema Automatizado/Pasarela), permitiendo visualizar con absoluta claridad la secuencia de actividades, decisiones, bifurcaciones y el flujo de información que genera valor económico en la cadena de moda masculina FashionStore.

A continuación se presentan los diagramas de actividad UML correspondientes a los **seis macroprocesos de negocio medulares** de FashionStore:

---

## 2.2 Macroproceso 1: Gestión de Abastecimiento y Recepción con Costo Promedio Ponderado

Este proceso describe el ciclo mediante el cual la empresa adquiere lotes de prendas a proveedores por temporada comercial, recepciona la mercadería físicamente en sucursal o almacén central, y actualiza el inventario calculando matemáticamente el Costo Promedio Ponderado ($CPP$) y registrando el Último Costo Unitario.

```mermaid
stateDiagram-v2
    direction TB

    state "Personal de Logística / Almacén" as LaneLogistica {
        [*] --> IdentificarNecesidad: Analiza umbrales mínimos de stock por temporada
        IdentificarNecesidad --> EmitirOrdenCompra: Genera Orden de Compra formal al Proveedor
        state RecibirMercaderia as "Recepciona lote físico de prendas en almacén"
        state CotejarGuia as "¿La mercadería física coincide con factura y orden?"
        state RechazarLote as "Rechaza lote y emite reclamo de no conformidad"
        state RegistrarIngreso as "Registra ingreso formal de prendas en el sistema"
    }

    state "Proveedor" as LaneProveedor {
        EmitirOrdenCompra --> PrepararDespacho: Procesa orden y alista prendas
        PrepararDespacho --> EnviarLote: Despacha lote con Guía de Remisión y Factura
        EnviarLote --> RecibirMercaderia
    }

    state "Sistema FashionStore" as LaneSistema {
        RegistrarIngreso --> GuardarUltimoCosto: Almacena Último Costo Unitario del lote
        GuardarUltimoCosto --> CalcularCPP: Recalcula Costo Promedio Ponderado: (StockAnt*CPPAnt + Cant*Costo)/(StockTotal)
        CalcularCPP --> ActualizarKardex: Registra movimiento de entrada en Kardex de inventario
        ActualizarKardex --> IncrementarStock: Incrementa stock físico disponible por sucursal, talla y color
        IncrementarStock --> NotificarExito: Emite confirmación de inventario actualizado
    }

    CotejarGuia --> RechazarLote: No coincide / Defectuoso
    CotejarGuia --> RegistrarIngreso: Mercadería Conforme
    RecibirMercaderia --> CotejarGuia
    RechazarLote --> [*]
    NotificarExito --> [*]
```

---

## 2.3 Macroproceso 2: Reserva Omnicanal y Prueba Presencial en Sucursal

Modela el flujo mediante el cual un cliente explora el catálogo desde su móvil o web, reserva varias prendas en una sucursal física, el encargado de tienda prepara los probadores con anticipación, y el cliente acude a probarse las prendas para decidir su compra.

```mermaid
stateDiagram-v2
    direction TB

    state "Cliente" as LaneClienteReserva {
        [*] --> ExplorarCatalogo: Consulta catálogo y filtra por sucursal
        ExplorarCatalogo --> SeleccionarPrendas: Selecciona prendas (tallas y colores)
        SeleccionarPrendas --> SolicitarReserva: Elige sucursal física, fecha y hora de visita
        state AcudirTienda as "Acude a la sucursal en horario programado"
        state ProbarsePrendas as "Se prueba las prendas en el vestidor asignado"
        state DecisionCompra as "¿Desea comprar alguna de las prendas probadas?"
    }

    state "Sistema FashionStore" as LaneSistemaReserva {
        SolicitarReserva --> BloquearStockTemp: Bloquea stock temporalmente como 'Reservado'
        BloquearStockTemp --> GenerarTicketQR: Genera comprobante digital de reserva con código QR
        GenerarTicketQR --> AlertarSucursal: Notifica al panel del encargado de sucursal
        state VerificarQR as "Escanea código QR de la reserva y confirma asistencia"
        state LiberarNoCompradas as "Libera al stock disponible las prendas descartadas"
    }

    state "Encargado de Sucursal" as LaneEncargadoReserva {
        AlertarSucursal --> SepararPrendas: Retira prendas de perchas y las plancha
        SepararPrendas --> AsignarProbador: Dispone prendas en probador exclusivo para el cliente
        AsignarProbador --> EsperarCliente: Queda a la espera de la llegada del cliente
        EsperarCliente --> AcudirTienda
        AcudirTienda --> VerificarQR
        VerificarQR --> ProbarsePrendas
    }

    ProbarsePrendas --> DecisionCompra
    DecisionCompra --> IrCaja: Sí (Lleva prendas seleccionadas)
    DecisionCompra --> DevolverTodo: No (Descarta todas las prendas)
    DevolverTodo --> LiberarNoCompradas
    IrCaja --> LiberarNoCompradas
    LiberarNoCompradas --> [*]
```

---

## 2.4 Macroproceso 3: Venta Presencial en Punto de Venta (POS)

Modela el proceso transaccional en la caja registradora de la sucursal física, ya sea proveniente de una reserva presencial previa o de una compra directa de mostrador.

```mermaid
stateDiagram-v2
    direction TB

    state "Cajero de Sucursal" as LaneCajero {
        [*] --> IniciarVentaPOS: Abre nueva transacción en el sistema POS
        state EscanearItems as "Escanea código de barras o ingresa código de reserva"
        state SolicitarCliente as "¿Cliente solicita factura o acumulación de puntos?"
        state IdentificarCliente as "Ingresa CI / NIT y correo del cliente"
        state SeleccionarMedioCobro as "Selecciona método de cobro (Efectivo, Tarjeta, QR)"
        state ProcesarCobroFisico as "Recibe efectivo o desliza tarjeta en terminal bancario"
        state EntregarTicket as "Imprime comprobante fiscal y entrega prendas embolsadas"
    }

    state "Cliente" as LaneClientePOS {
        IniciarVentaPOS --> PresentarPrendas: Presenta prendas en mostrador de caja
        PresentarPrendas --> EscanearItems
        SolicitarCliente --> IdentificarCliente: Proporciona datos personales / CI
        SolicitarCliente --> VentaSinNombre: Indica 'Sin Nombre / Consumidor Final'
        SeleccionarMedioCobro --> RealizarPago: Efectúa el pago según modalidad elegida
        RealizarPago --> ProcesarCobroFisico
        EntregarTicket --> RecibirBolsa: Recibe compra y comprobante
    }

    state "Sistema FashionStore POS" as LaneSistemaPOS {
        EscanearItems --> SolicitarCliente
        VentaSinNombre --> SeleccionarMedioCobro
        IdentificarCliente --> SeleccionarMedioCobro
        ProcesarCobroFisico --> ValidarTransaccion: Confirma recepción satisfactoria del importe
        ValidarTransaccion --> DescontarStockPOS: Descuenta definitivamente el stock físico en sucursal
        DescontarStockPOS --> AsignarPuntosFidelidad: Asigna puntos de fidelización a la cuenta del cliente
        AsignarPuntosFidelidad --> GenerarComprobante: Genera comprobante fiscal de venta
        GenerarComprobante --> EntregarTicket
    }

    RecibirBolsa --> [*]
```

---

## 2.5 Macroproceso 4: Venta Digital y Despacho con Pasarela de Pago

Modela el flujo completo del comercio electrónico web y móvil, desde el carrito de compras, el procesamiento seguro con la pasarela de pagos, hasta la logística de despacho y entrega a domicilio.

```mermaid
stateDiagram-v2
    direction TB

    state "Cliente Digital" as LaneClienteOnline {
        [*] --> AgregarCarrito: Agrega prendas al carrito desde web o app móvil
        AgregarCarrito --> IniciarCheckout: Procede al checkout e ingresa domicilio de entrega
        state SeleccionarPago as "Selecciona pagar con Tarjeta (Stripe) o PayPal"
        state IngresarDatosTarjeta as "Ingresa datos en formulario seguro tokenizado"
        state RecibirPaquete as "Recibe paquete en domicilio y entrega código de confirmación"
    }

    state "Sistema FashionStore Web/App" as LaneSistemaOnline {
        IniciarCheckout --> CalcularTarifaEnvio: Calcula tarifa de delivery por Haversine y peso volumétrico
        CalcularTarifaEnvio --> SeleccionarPago
        IngresarDatosTarjeta --> EnviarTokenPasarela: Envía token de cobro a la pasarela de pago
        state RecibirWebhook as "Recibe evento Webhook de pago aprobado"
        state CrearOrdenVenta as "Crea Orden de Venta formal y descuenta stock en sucursal origen"
        state DespacharRepartidor as "Asigna pedido al servicio de delivery de última milla"
    }

    state "Pasarela Externa (Stripe / PayPal)" as LanePasarela {
        EnviarTokenPasarela --> ValidarFondos: Valida saldo y ejecuta verificación 3D Secure
        ValidarFondos --> EmitirResultado: Genera confirmación de cobro y emite Webhook HTTP POST
        EmitirResultado --> RecibirWebhook
    }

    state "Empresa de Delivery" as LaneDelivery {
        DespacharRepartidor --> RecolectarPaquete: Recolecta paquete empaquetado en la sucursal
        RecolectarPaquete --> TransportarDomicilio: Traslada pedido en motocicleta / vehículo
        TransportarDomicilio --> RecibirPaquete
        RecibirPaquete --> ConfirmarEntrega: Registra entrega completada en el sistema móvil
    }

    ConfirmarEntrega --> [*]
```

---

## 2.6 Macroproceso 5: Experiencia Inteligente (Vestidor Virtual RA + Asistente IA)

Modela la interacción diferenciadora del usuario al emplear la Realidad Aumentada para probarse prendas virtualmente y consultar sugerencias de atuendos contextualizados al clima local.

```mermaid
stateDiagram-v2
    direction TB

    state "Cliente Móvil" as LaneClienteIA {
        [*] --> AbrirAppMovil: Inicia aplicación móvil FashionStore
        state SeleccionarPrendaRA as "Selecciona prenda y presiona 'Vestidor Virtual RA'"
        state ActivarCamara as "Apunta la cámara de su teléfono hacia su cuerpo"
        state InteractuarRA as "Observa la prenda 3D proyectada y cambia de color/talla"
        state ConsultarAsistente as "Presiona botón de voz o texto: '¿Qué me recomiendas hoy?'"
        state RecibirOutfitIA as "Visualiza outfit recomendado adaptado al clima y colorimetría"
        state CompararOutfits as "Envía prendas al Comparador de Outfits lado a lado"
    }

    state "Módulo de Realidad Aumentada" as LaneModuloRA {
        ActivarCamara --> DetectarSilueta: Detecta proporciones anatómicas (ARCore / ML Kit)
        DetectarSilueta --> RenderizarModelo3D: Renderiza malla 3D de la prenda sobre el torso del cliente
        RenderizarModelo3D --> InteractuarRA
        InteractuarRA --> ConsultarAsistente
    }

    state "Asistente IA Contextual" as LaneMotorIA {
        ConsultarAsistente --> ConsultarClimaAPI: Invoca API de OpenWeatherMap con coordenadas del cliente
        ConsultarClimaAPI --> AnalizarHistorial: Recupera historial de compras y paleta cromática del usuario
        AnalizarHistorial --> GenerarPromptContextual: Sintetiza: Clima + Ocasión + Stock Disponible
        GenerarPromptContextual --> LlamarModeloIA: Realiza inferencia cognitiva (OpenAI / Gemini)
        LlamarModeloIA --> RecibirOutfitIA
    }

    state "Comparador de Outfits" as LaneComparador {
        RecibirOutfitIA --> CompararOutfits
        CompararOutfits --> EvaluarOpciones: Contrasta hasta 3 combinaciones con precios y estilos
        EvaluarOpciones --> ReservarOComprar: Selecciona el outfit preferido para compra o reserva
    }

    AbrirAppMovil --> SeleccionarPrendaRA
    SeleccionarPrendaRA --> ActivarCamara
    ReservarOComprar --> [*]
```

---

## 2.7 Macroproceso 6: Programa de Fidelización Gamificado

Modela el ciclo de fidelización y retención de clientes mediante gamificación: acumulación de puntos en cada compra, progresión a través de niveles jerárquicos (Bronce, Plata, Oro, Diamante), desbloqueo de insignias y canje de beneficios en dinero real.

```mermaid
stateDiagram-v2
    direction TB

    state "Cliente Registrado" as LaneClienteFiel {
        [*] --> FormalizarCompra: Concreta compra presencial o digital en FashionStore
        state NotificacionPuntos as "Recibe notificación: '+150 Puntos acumulados en tu cuenta'"
        state ConsultarDashboardFiel as "Accede a 'Mi Perfil de Fidelización' en web o app móvil"
        state EvaluarAscenso as "¿Alcanzó el puntaje requerido para el siguiente nivel?"
        state RedimirPuntos as "Aplica puntos acumulados como descuento en el checkout"
    }

    state "Motor de Gamificación FashionStore" as LaneMotorGamif {
        FormalizarCompra --> CalcularPuntosTransaccion: Calcula: Puntos = MontoPagado * FactorConversion
        CalcularPuntosTransaccion --> AcreditarPuntos: Acredita puntos a la cuenta del cliente
        AcreditarPuntos --> NotificacionPuntos
        NotificacionPuntos --> ConsultarDashboardFiel
        ConsultarDashboardFiel --> EvaluarAscenso
        EvaluarAscenso --> PromoverNivel: Sí (Promueve a nivel Plata, Oro o Diamante)
        EvaluarAscenso --> MantenerNivel: No (Muestra barra de progreso restante)
        PromoverNivel --> AsignarBeneficios: Desbloquea porcentaje de descuento permanente e insignia digital
        AsignarBeneficios --> RedimirPuntos
        MantenerNivel --> RedimirPuntos
        RedimirPuntos --> AplicarDescuentoVenta: Descuenta saldo canjeado del total de la nueva compra
        AplicarDescuentoVenta --> ActualizarSaldoPuntos: Resta los puntos canjeados del saldo disponible
    }

    ActualizarSaldoPuntos --> [*]
```


---

# Parte II - Proceso de Desarrollo (Ciclo 1: Fundamentos y Módulos Base)

En estricta conformidad con el marco de trabajo del **Proceso Unificado de Desarrollo de Software (PUDS)** y las directrices metodológicas de la cátedra de Sistemas de Información II, el desarrollo del sistema se ejecuta a través de sus cinco disciplinas fundamentales: **Captura de Requisitos, Análisis, Diseño, Implementación y Pruebas**.

Para este **Ciclo 1 (Iteración 1)**, el equipo de desarrollo (integrado por **Alberto Delgado** y **Andy Mujica**) aborda el núcleo arquitectónico y funcional del sistema: autenticación robusta mediante RBAC, auto-registro de clientes, recuperación autoservicio de contraseñas mediante tokens OTP, administración integral de usuarios y roles, administración geográfica y operativa de sucursales, catálogo especializado de indumentaria masculina con atributos multivaluados (tallas y colores normalizados con código Hex), gestión de temporadas comerciales, administración de proveedores, control de inventario con **Costo Unitario y Costo Promedio Ponderado ($CPP$)**, y consulta omnicanal del catálogo digital.

---

## 1. Flujo de Trabajo: Captura de Requisitos

### 1.1 Identificación de Casos de Uso y Actores

A partir del análisis exhaustivo del modelo de negocio y las necesidades operativas de FashionStore, se identifican formalmente los Casos de Uso que componen el sistema, vinculados con los actores que interactúan con cada servicio:

| Código CU | Nombre del Caso de Uso | Módulo Asociado | Actor(es) Principal(es) | Descripción Resumida |
|:---:|:---|:---:|:---|:---|
| **CU01** | Autenticar Usuario y Control de Acceso (RBAC) | M01 | Administrador, Encargado, Cajero, Logística, Cliente | Inicio de sesión seguro con credenciales hash bcrypt, emisión de tokens JWT, control granular de roles y auditoría de accesos. |
| **CU02** | Registrar Cliente (Auto-registro de Clientes) | M01 | Cliente no autenticado | Creación de cuenta de cliente por autoservicio en web/móvil con validación de contraseña segura, hash bcrypt y bienvenida. |
| **CU03** | Recuperar Contraseña (Token OTP de 6 Dígitos) | M01 | Usuario (Cualquier Rol) | Restablecimiento autoservicio de contraseña olvidada mediante envío y validación de código OTP temporal de 6 dígitos vía correo electrónico. |
| **CU04** | Gestionar Usuarios y Roles (RBAC y Desbloqueo) | M01 | Administrador General | Administración de personal interno, asignación de roles jerárquicos, asignación a sucursal y desbloqueo de cuentas bloqueadas por intentos. |
| **CU05** | Gestionar Ciudades y Sucursales | M02 | Administrador General | Administración geográfica y operativa de ciudades, sucursales físicas, georreferenciación GPS, horarios y capacidades de probadores. |
| **CU06** | Gestionar Productos y Atributos de Moda | M03 | Administrador General | CRUD de prendas de vestir masculinas, categorías, marcas, tallas normalizadas y colores multivaluados con código Hex. |
| **CU07** | Gestionar Temporadas y Colecciones | M04 | Administrador General | Calendarización y administración de campañas estacionales (Primavera-Verano, Otoño-Invierno, Escolar, Promociones). |
| **CU08** | Gestionar Proveedores Textiles | M05 | Administrador General, Logística | Registro y administración de empresas proveedoras, condiciones de pago, líneas de prendas y contratos de aprovisionamiento. |
| **CU09** | Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP) | M06 | Personal de Logística, Encargado Sucursal | Control de existencias por sucursal, registro de entradas con último costo unitario y recálculo matemático del Costo Promedio Ponderado (CPP). |
| **CU10** | Consultar Catálogo y Disponibilidad por Sucursal | M07 | Cliente, Encargado de Sucursal, Cajero | Exploración del catálogo omnicanal con filtros multidimensionales y consulta de existencias en tiempo real por tienda física. |
| **CU11** | Solicitar Reserva de Prendas en Sucursal | M10 | Cliente | Preselección de prendas, selección de sucursal física, programación de fecha/hora de visita y generación de ticket QR. *(Ciclo 2)* |
| **CU12** | Preparar y Atender Reserva Presencial | M10 | Encargado de Sucursal | Apartado físico de prendas reservadas en probadores asignados y confirmación de llegada del cliente mediante escaneo de QR. *(Ciclo 2)* |
| **CU13** | Administrar Carrito de Compras Omnicanal | M11 | Cliente | Incorporación, edición y cálculo automático de totales con validación atómica de existencias. *(Ciclo 2)* |
| **CU14** | Procesar Compra Digital y Checkout | M12 | Cliente | Formalización de compra en línea con selección de modalidad de entrega (retiro en tienda o delivery) y facturación. *(Ciclo 2)* |
| **CU15** | Registrar Venta Presencial en Caja (POS) | M13 | Cajero de Sucursal | Registro de venta en mostrador físico, lectura de códigos de barras, conversión de reservas en ventas y emisión de tickets. *(Ciclo 2)* |
| **CU16** | Procesar Pago con Pasarela Electrónica | M14 | Pasarela Externa (Stripe/PayPal), Cliente | Ejecución segura de cobro digital con verificación 3D Secure y confirmación asíncrona mediante Webhooks. *(Ciclo 2)* |
| **CU17** | Gestionar Tipos y Medios de Cobro | M15 | Administrador, Cajero | Parametrización de pagos en efectivo, tarjeta de débito/crédito y Códigos QR interoperables del BCB. *(Ciclo 2)* |
| **CU18** | Gestionar Despacho y Logística de Delivery | M19 | Personal de Logística, Empresa Delivery | Cálculo de tarifas por Haversine y peso volumétrico, asignación de repartidores y rastreo de envíos en tiempo real. *(Ciclo 2)* |
| **CU19** | Visualizar Prenda en Vestidor Virtual con RA | M08 | Cliente Móvil | Proyección tridimensional de prendas sobre la silueta del cliente mediante la cámara del smartphone usando ARCore. *(Ciclo 3)* |
| **CU20** | Comparar Outfits Lado a Lado | M09 | Cliente | Contrastación visual interactiva de hasta 3 combinaciones de ropa con desglose de precios individuales y totales. *(Ciclo 3)* |
| **CU21** | Gestionar Fidelización Gamificada | M16 | Cliente, Motor de Gamificación | Acumulación de puntos por compras, progresión en niveles jerárquicos (Bronce a Diamante), desbloqueo de insignias y canje. *(Ciclo 3)* |
| **CU22** | Solicitar Recomendación Contextual de IA | M17 | Cliente, Servicio de IA | Sugerencia inteligente de outfits completos considerando clima meteorológico local (API OpenWeatherMap), colorimetría e historial. *(Ciclo 3)* |
| **CU23** | Buscar Productos por Comandos de Voz | M17 | Cliente Móvil, Servicio de IA | Consulta de catálogo y solicitudes en lenguaje natural mediante transcripción de voz y procesamiento semántico NLP. *(Ciclo 3)* |
| **CU24** | Visualizar Cuadros de Mando y Dashboards | M18 | Administrador General | Consulta de indicadores clave de negocio (KPIs), ventas por tienda, rotación de stock y rentabilidad de colecciones. *(Ciclo 3)* |

---

### 1.2 Priorización de Casos de Uso

En consonancia con los principios del PUDS (mitigación temprana de riesgos arquitectónicos y entrega incremental de valor funcional), se establece la matriz de priorización multidimensional que define la asignación de Casos de Uso por cada ciclo de desarrollo:

| Código CU | Nombre del Caso de Uso | Valor de Negocio | Riesgo Técnico | Complejidad | Dependencias Previas | Asignación Iterativa |
|:---:|:---|:---:|:---:|:---:|:---|:---:|
| **CU01** | Autenticar Usuario y Control de Acceso (RBAC) | Muy Alto | Alto | Media | Ninguna | **Iteración 1 (Ciclo 1)** |
| **CU02** | Registrar Cliente (Auto-registro de Clientes) | Muy Alto | Medio | Media | Ninguna | **Iteración 1 (Ciclo 1)** |
| **CU03** | Recuperar Contraseña (Token OTP de 6 Dígitos) | Muy Alto | Alto | Media | CU01, CU02 | **Iteración 1 (Ciclo 1)** |
| **CU04** | Gestionar Usuarios y Roles (RBAC y Desbloqueo) | Alto | Medio | Media | CU01 | **Iteración 1 (Ciclo 1)** |
| **CU05** | Gestionar Ciudades y Sucursales | Muy Alto | Bajo | Baja | CU01 | **Iteración 1 (Ciclo 1)** |
| **CU06** | Gestionar Productos y Atributos de Moda | Muy Alto | Medio | Media | CU01 | **Iteración 1 (Ciclo 1)** |
| **CU07** | Gestionar Temporadas y Colecciones | Alto | Bajo | Baja | CU01 | **Iteración 1 (Ciclo 1)** |
| **CU08** | Gestionar Proveedores Textiles | Alto | Bajo | Baja | CU01 | **Iteración 1 (Ciclo 1)** |
| **CU09** | Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP) | Crítico | Muy Alto | Alta | CU05, CU06, CU08 | **Iteración 1 (Ciclo 1)** |
| **CU10** | Consultar Catálogo y Disponibilidad por Sucursal | Muy Alto | Medio | Media | CU05, CU06, CU09 | **Iteración 1 (Ciclo 1)** |
| **CU11** | Solicitar Reserva de Prendas en Sucursal | Alto | Medio | Media | CU09, CU10 | Iteración 2 (Ciclo 2) |
| **CU12** | Preparar y Atender Reserva Presencial | Alto | Medio | Media | CU11 | Iteración 2 (Ciclo 2) |
| **CU13** | Administrar Carrito de Compras Omnicanal | Alto | Medio | Media | CU09, CU10 | Iteración 2 (Ciclo 2) |
| **CU14** | Procesar Compra Digital y Checkout | Crítico | Alto | Alta | CU13, CU16 | Iteración 2 (Ciclo 2) |
| **CU15** | Registrar Venta Presencial en Caja (POS) | Crítico | Alto | Alta | CU09, CU10, CU17 | Iteración 2 (Ciclo 2) |
| **CU16** | Procesar Pago con Pasarela Electrónica | Crítico | Muy Alto | Alta | CU14 | Iteración 2 (Ciclo 2) |
| **CU17** | Gestionar Tipos y Medios de Cobro | Alto | Medio | Media | CU15 | Iteración 2 (Ciclo 2) |
| **CU18** | Gestionar Despacho y Logística de Delivery | Medio | Medio | Media | CU14 | Iteración 2 (Ciclo 2) |
| **CU19** | Visualizar Prenda en Vestidor Virtual con RA | Alto | Muy Alto | Alta | CU06, CU10 | Iteración 3 (Ciclo 3) |
| **CU20** | Comparar Outfits Lado a Lado | Medio | Medio | Media | CU10 | Iteración 3 (Ciclo 3) |
| **CU21** | Gestionar Fidelización Gamificada | Alto | Medio | Media | CU14, CU15 | Iteración 3 (Ciclo 3) |
| **CU22** | Solicitar Recomendación Contextual de IA | Alto | Muy Alto | Alta | CU10 | Iteración 3 (Ciclo 3) |
| **CU23** | Buscar Productos por Comandos de Voz | Medio | Alto | Media | CU10, CU22 | Iteración 3 (Ciclo 3) |
| **CU24** | Visualizar Cuadros de Mando y Dashboards | Alto | Medio | Media | CU09, CU14, CU15 | Iteración 3 (Ciclo 3) |

> [!IMPORTANT]
> **Casos de Uso Seleccionados para el Ciclo 1 (10 Casos de Uso Fundamentales):**  
> Se seleccionan los 10 Casos de Uso fundamentales (**CU01 al CU10**). Esta selección cubre de manera integral la seguridad y control de acceso (autenticación, auto-registro de clientes, recuperación autoservicio de contraseña por OTP y administración de usuarios/roles RBAC), junto con la gestión geográfica de sucursales, el catálogo textil parametrizado, temporadas comerciales, proveedores, control de inventarios multi-sucursal con **Costo Promedio Ponderado ($CPP$)** y consulta omnicanal de existencias en tiempo real.

---

### 1.3 Detalle de Casos de Uso y Prototipado de Interfaz de Usuario

Conforme a la estricta directriz de la cátedra expresada en clase (`B4.txt`, líneas 10 a 14), la especificación de cada caso de uso se organiza de manera uniforme bajo la siguiente secuencia obligatoria:
1. **Diseño del Caso de Uso en PlantUML (PlantText)** con sus estereotipos y relaciones (`<<include>>`, `<<extend>>`, herencia).
2. **Prototipo de Interfaz de Usuario (UI Wireframe)** detallado con todos sus componentes de pantalla, campos y acciones.
3. **Tabla Detalle del Caso de Uso** conteniendo la especificación formal del escenario principal, alternos, precondiciones y postcondiciones.

---

#### 1.3.1 Caso de Uso CU01: Autenticar Usuario y Control de Acceso (RBAC)

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Usuario del Sistema
(Admin, Encargado, Cajero,
Logística, Cliente)" as ActorUsuario

rectangle "FashionStore - Módulo de Autenticación (RBAC)" {
    usecase "CU01: Autenticar Usuario
(Iniciar Sesión)" as CU_Login
    usecase "Validar Credenciales
Hash Bcrypt" as CU_ValidarHash
    usecase "Bloquear Cuenta por
5 Intentos Fallidos" as CU_Bloqueo
    usecase "Generar Token JWT con
Rol Asignado" as CU_Token
    usecase "Registrar Auditoría en
Bitácora de Accesos" as CU_Bitacora
}

ActorUsuario --> CU_Login

CU_Login ..> CU_ValidarHash : <<include>>
CU_Login ..> CU_Token : <<include>>
CU_Login ..> CU_Bitacora : <<include>>
CU_Login <.. CU_Bloqueo : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore | Plataforma E-Commerce Omnicanal                  [ ES | EN ]   |
+--------------------------------------------------------------------------------+
|                                                                                |
|                        +------------------------------+                        |
|                        |       FASHIONSTORE           |                        |
|                        |    Elegancia Masculina       |                        |
|                        +------------------------------+                        |
|                        | INICIAR SESIÓN EN EL SISTEMA |                        |
|                        |                              |                        |
|                        | Correo Electrónico:          |                        |
|                        | [ alberto.delgado@store.bo ] |                        |
|                        |                              |                        |
|                        | Contraseña:                  |                        |
|                        | [ ****************** ] [Ver] |                        |
|                        |                              |                        |
|                        | [X] Recordar sesión (30 días)|                        |
|                        |                              |                        |
|                        |     [   INICIAR SESIÓN   ]   |                        |
|                        |                              |                        |
|                        | ¿Olvidaste tu contraseña?    |                        |
|                        | [Recuperar acceso vía email] |                        |
|                        |                              |                        |
|                        | ¿Eres nuevo en la tienda?    |                        |
|                        | [Registrarse como Cliente]   |                        |
|                        +------------------------------+                        |
|                        |  Estado: Conexión segura TLS |                        |
|                        +------------------------------+                        |
|                                                                                |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU01** |
| **Nombre** | **Autenticar Usuario y Control de Acceso (RBAC)** |
| **Actores** | Administrador, Encargado de Sucursal, Cajero, Personal de Logística, Cliente. |
| **Propósito** | Garantizar el acceso seguro, segregado y controlado a las funciones del sistema mediante credenciales válidas y expedición de tokens JWT firmados. |
| **Tipo** | Primario / Esencial. |
| **Precondiciones** | 1. El usuario debe poseer una cuenta previamente creada y activa (`estado_cuenta = 'ACTIVO'`).<br>2. El canal de comunicación debe encontrarse protegido bajo protocolo HTTPS/TLS. |
| **Postcondiciones** | 1. Se emite un token de sesión JWT con los claims de identidad y rol del usuario.<br>2. Se actualiza el timestamp de `ultimo_acceso` y se restablece a 0 el contador de intentos fallidos.<br>3. Se registra el evento en la tabla `bitacora_accesos` con IP, fecha/hora y User-Agent. |
| **Flujo Principal** | 1. El actor ingresa a la vista de login en la plataforma web o móvil.<br>2. El actor introduce su correo electrónico registrado y contraseña en texto plano.<br>3. El sistema valida el formato del correo y recupera el registro del usuario.<br>4. El sistema comprueba mediante el algoritmo `bcrypt.verify` si la contraseña coincide con el `password_hash` almacenado.<br>5. El sistema verifica que la cuenta no esté bloqueada ni inactiva.<br>6. El sistema genera el token JWT firmado con el rol correspondiente y tiempo de expiración.<br>7. El sistema registra el acceso exitoso en la bitácora de auditoría.<br>8. El sistema redirige al usuario a la vista principal según su perfil (Dashboard para Administrador, POS para Cajero, Reservas para Encargado, Catálogo para Cliente). |
| **Flujos Alternativos** | **4a. Contraseña incorrecta:**<br>1. El sistema incrementa en 1 el campo `intentos_fallidos`.<br>2. Si `intentos_fallidos >= 5`, el sistema cambia `estado_cuenta = 'BLOQUEADO_POR_INTENTOS'`, establece `bloqueado_hasta = NOW() + INTERVAL '30 MIN'` y registra alerta de seguridad.<br>3. El sistema muestra mensaje: *"Credenciales inválidas. Le quedan X intentos antes del bloqueo."*<br>**5a. Cuenta bloqueada:**<br>1. El sistema rechaza la autenticación informando: *"Cuenta bloqueada preventivamente. Restablezca su contraseña o contacte a soporte."* |

---

#### 1.3.2 Caso de Uso CU02: Registrar Cliente (Auto-registro de Clientes)

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Cliente No Autenticado
(Visitante Web / App Móvil)" as ActorCliente

rectangle "FashionStore - Registro Autoservicio" {
    usecase "CU02: Registrarse en
FashionStore (Sign Up)" as CU_Registro
    usecase "Validar Formato de
Correo y Teléfono" as CU_ValFormato
    usecase "Verificar Unicidad
de Correo Electrónico" as CU_Unicidad
    usecase "Cifrar Contraseña
con Bcrypt (Cost Factor 12)" as CU_Hash
    usecase "Enviar Correo
de Bienvenida" as CU_EmailBienvenida
}

ActorCliente --> CU_Registro

CU_Registro ..> CU_ValFormato : <<include>>
CU_Registro ..> CU_Unicidad : <<include>>
CU_Registro ..> CU_Hash : <<include>>
CU_Registro <.. CU_EmailBienvenida : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore | Elegancia Masculina                              [ Iniciar Sesión ]|
+--------------------------------------------------------------------------------+
|                                                                                |
|                        +----------------------------------------+              |
|                        |          CREAR NUEVA CUENTA            |              |
|                        | Únete al Club de Fidelización Fashion |              |
|                        +----------------------------------------+              |
|                        | Nombres:                               |              |
|                        | [ Carlos Andrés                      ] |              |
|                        | Apellidos:                             |              |
|                        | [ Mendoza Claros                     ] |              |
|                        | Correo Electrónico:                    |              |
|                        | [ carlos.mendoza@gmail.com           ] |              |
|                        | Celular / WhatsApp:                    |              |
|                        | [ +591 77012345                      ] |              |
|                        | Fecha de Nacimiento:                   |              |
|                        | [ 1995-04-18                         ] |              |
|                        | Contraseña:                            |              |
|                        | [ **************** ] [Mostrar]        |              |
|                        | Fortaleza: [======       ] Media       |              |
|                        | • Mínimo 8 caracteres, 1 mayús, 1 num  |              |
|                        | Confirmar Contraseña:                  |              |
|                        | [ **************** ] [Mostrar]        |              |
|                        | [X] Acepto Términos y Condiciones      |              |
|                        | [X] Deseo recibir promociones exclusiv.|              |
|                        |                                        |              |
|                        |   [    CREAR MI CUENTA FASHIONSTORE   ]|              |
|                        |                                        |              |
|                        | ¿Ya tienes una cuenta?                 |              |
|                        | [Inicia sesión aquí]                   |              |
|                        +----------------------------------------+              |
|                                                                                |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU02** |
| **Nombre** | **Registrar Cliente (Auto-registro de Clientes)** |
| **Actores** | Cliente no autenticado (Visitante Web / Móvil). |
| **Propósito** | Permitir que los nuevos clientes se auto-registren en la plataforma FashionStore para acceder al carrito, guardar preferencias, reservar probadores físicos y acumular puntos de fidelización. |
| **Tipo** | Primario / Autoservicio. |
| **Precondiciones** | El usuario debe encontrarse en la plataforma web o móvil sin sesión activa. |
| **Postcondiciones** | 1. Se crea un registro en `usuarios` con rol `CLIENTE` y `estado_cuenta = 'ACTIVO'`.<br>2. Se encripta la contraseña mediante `bcrypt` (factor de costo 12).<br>3. Se expide automáticamente un token JWT y se envía un correo transaccional de bienvenida. |
| **Flujo Principal** | 1. El visitante selecciona la opción *"Registrarse"* en la plataforma.<br>2. El sistema despliega el formulario de captura de datos personales y credenciales.<br>3. El cliente introduce nombres, apellidos, correo, teléfono y contraseña.<br>4. El sistema valida en tiempo real la fortaleza de la clave (mínimo 8 caracteres, al menos una mayúscula y un número).<br>5. El cliente presiona el botón *"Crear Mi Cuenta FashionStore"*.<br>6. El sistema verifica que el correo electrónico no exista previamente en la base de datos.<br>7. El sistema aplica el hash seguro `bcrypt` sobre la contraseña ingresada.<br>8. El sistema persiste el usuario en la base de datos con rol `CLIENTE` e inicializa sus puntos de fidelización en 0.<br>9. El sistema dispara el envío asíncrono del correo de bienvenida.<br>10. El sistema inicia la sesión automáticamente expidiendo el token JWT y redirige al catálogo. |
| **Flujos Alternativos** | **6a. Correo ya registrado:**<br>1. El sistema detecta duplicidad de correo electrónico.<br>2. El sistema muestra mensaje de error: *"El correo electrónico ya se encuentra registrado. ¿Desea iniciar sesión o recuperar su contraseña?"* con enlaces directos.<br>**4a. Contraseña insegura:**<br>1. El sistema deshabilita el envío e indica visualmente las reglas faltantes en la contraseña.<br>**3a. Contraseñas no coincidentes:**<br>1. El sistema advierte que los campos de confirmación no concuerdan e impide el envío. |

---

#### 1.3.3 Caso de Uso CU03: Recuperar Contraseña (Token OTP de 6 Dígitos)

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Usuario del Sistema
(Cliente, Empleado, Admin)" as ActorUsuario

rectangle "FashionStore - Recuperación de Acceso" {
    usecase "CU03: Recuperar Contraseña
(Restablecimiento)" as CU_Recuperar
    usecase "Generar Código OTP
Criptográfico (6 Dígitos)" as CU_GenOTP
    usecase "Despachar Correo con
Código OTP Temporal" as CU_EnviarOTP
    usecase "Validar OTP y Actualizar
Clave con Hash Bcrypt" as CU_ValidarClave
    usecase "Bloquear Código OTP
tras 3 Intentos Errados" as CU_BloqueoOTP
}

ActorUsuario --> CU_Recuperar

CU_Recuperar ..> CU_GenOTP : <<include>>
CU_Recuperar ..> CU_EnviarOTP : <<include>>
CU_Recuperar ..> CU_ValidarClave : <<include>>
CU_Recuperar <.. CU_BloqueoOTP : <<extend>>
@enduml
```

##### b) Prototipos de Interfaz de Usuario (UI Wireframe - Flujo de 2 Pantallas)

```text
========================= PANTALLA 1: SOLICITAR RECUPERACIÓN =========================
+--------------------------------------------------------------------------------+
|  FashionStore | Recuperación Segura de Contraseña                [ Volver al Login ]|
+--------------------------------------------------------------------------------+
|                                                                                |
|                        +----------------------------------------+              |
|                        |       ¿OLVIDASTE TU CONTRASEÑA?        |              |
|                        +----------------------------------------+              |
|                        | Ingresa tu correo electrónico registrado. Te           |
|                        | enviaremos un código de seguridad OTP de 6             |
|                        | dígitos válido por 15 minutos.                         |
|                        |                                                        |
|                        | Correo Electrónico:                                    |
|                        | [ alberto.delgado@store.bo           ]                 |
|                        |                                                        |
|                        |   [   ENVIAR CÓDIGO DE RECUPERACIÓN   ]                |
|                        |                                                        |
|                        | ¿Recordaste tu clave? [Regresar al Login]              |
|                        +----------------------------------------+              |
|                                                                                |
+--------------------------------------------------------------------------------+

===================== PANTALLA 2: VALIDAR OTP Y RESTABLECER CLAVE =====================
+--------------------------------------------------------------------------------+
|  FashionStore | Restablecer Contraseña                           [ Ayuda / Soporte ]|
+--------------------------------------------------------------------------------+
|                                                                                |
|                        +----------------------------------------+              |
|                        |       RESTABLECER TU CONTRASEÑA        |              |
|                        +----------------------------------------+              |
|                        | Hemos enviado un código a alberto.***@store.bo         |
|                        |                                                        |
|                        | Introduce el código OTP de 6 dígitos:                  |
|                        |      [_8_] [_4_] [_1_] [_9_] [_2_] [_0_]               |
|                        | Tiempo restante del código: (14:32 min)                |
|                        |                                                        |
|                        | Nueva Contraseña:                                      |
|                        | [ ****************** ] [Mostrar]                       |
|                        | Fortaleza: [============] Alta                         |
|                        |                                                        |
|                        | Confirmar Nueva Contraseña:                            |
|                        | [ ****************** ] [Mostrar]                       |
|                        |                                                        |
|                        |   [    RESTABLECER CONTRASEÑA AHORA   ]                |
|                        |                                                        |
|                        | ¿No recibiste el código? [Reenviar en 60s]             |
|                        +----------------------------------------+              |
|                                                                                |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU03** |
| **Nombre** | **Recuperar Contraseña (Token OTP de 6 Dígitos)** |
| **Actores** | Usuario del Sistema (Cliente, Administrador, Empleado). |
| **Propósito** | Permitir a cualquier usuario restablecer de manera autoservicio su contraseña olvidada mediante la generación y validación de un código criptográfico temporal (OTP) enviado a su correo electrónico. |
| **Tipo** | Secundario / Soporte y Seguridad. |
| **Precondiciones** | 1. El usuario debe haber registrado previamente su cuenta con un correo electrónico válido.<br>2. El servicio SMTP/transaccional debe encontrarse operativo. |
| **Postcondiciones** | 1. Se genera un código OTP numérico aleatorio de 6 dígitos con expiración de 15 minutos en `tokens_recuperacion`.<br>2. Tras la validación, se actualiza el `password_hash` del usuario en `usuarios` y se inhabilita el token OTP.<br>3. Si la cuenta estaba bloqueada por intentos fallidos, se desbloquea automáticamente (`estado_cuenta = 'ACTIVO'`, `intentos_fallidos = 0`). |
| **Flujo Principal** | 1. El usuario presiona *"¿Olvidaste tu contraseña?"* en la pantalla de autenticación.<br>2. El sistema despliega la pantalla de solicitud de correo.<br>3. El usuario ingresa su correo electrónico y presiona *"Enviar Código de Recuperación"*.<br>4. El sistema busca el correo en la base de datos.<br>5. El sistema genera un código numérico aleatorio criptoseguro de 6 dígitos con fecha de expiración fijada a `NOW() + 15 MIN`.<br>6. El sistema almacena el hash del OTP en `tokens_recuperacion` y despacha el correo electrónico con el código.<br>7. El sistema redirige a la pantalla de verificación de código OTP y nueva clave.<br>8. El usuario introduce el código OTP recibido y digita su nueva contraseña con confirmación.<br>9. El sistema valida que el OTP coincida, no haya expirado y no haya sido utilizado previamente.<br>10. El sistema cifra la nueva contraseña con `bcrypt` (factor 12) y actualiza el registro en `usuarios`.<br>11. El sistema marca el token OTP como utilizado (`utilizado = true`), limpia los contadores de intentos fallidos y desbloquea la cuenta.<br>12. El sistema muestra mensaje de confirmación: *"Contraseña actualizada exitosamente"* y redirige al login. |
| **Flujos Alternativos** | **4a. Correo no registrado:**<br>1. Por directriz de seguridad contra enumeración de cuentas (OWASP), el sistema responde genéricamente: *"Si el correo ingresado se encuentra registrado, le hemos enviado el código de verificación"*, sin revelar la inexistencia del usuario.<br>**9a. Código OTP erróneo:**<br>1. El sistema incrementa el contador de fallos del token.<br>2. Si supera 3 intentos errados, el token se invalida permanentemente y se exige solicitar uno nuevo.<br>**9b. Código OTP expirado (más de 15 minutos):**<br>1. El sistema informa: *"El código OTP ha expirado. Por favor solicite un nuevo código."* |

---

#### 1.3.4 Caso de Uso CU04: Gestionar Usuarios y Roles (RBAC y Desbloqueo)

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Administrador General" as ActorAdmin

rectangle "FashionStore - Administración de Personal (RBAC)" {
    usecase "CU04: Gestionar Usuarios
y Roles del Sistema" as CU_GestionUsuarios
    usecase "Asignar Rol Jerárquico
(Admin, Encargado, Cajero, Logística)" as CU_AsignarRol
    usecase "Vincular Usuario a
Sucursal Operativa" as CU_VincularSucursal
    usecase "Desbloquear Cuenta
Bloqueada por Intentos" as CU_Desbloquear
    usecase "Inactivar / Reactivar
Cuenta de Empleado" as CU_Inactivar
}

ActorAdmin --> CU_GestionUsuarios

CU_GestionUsuarios ..> CU_AsignarRol : <<include>>
CU_GestionUsuarios ..> CU_VincularSucursal : <<include>>
CU_GestionUsuarios <.. CU_Desbloquear : <<extend>>
CU_GestionUsuarios <.. CU_Inactivar : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore | Panel Administrador > Usuarios y Roles (RBAC)    [ Admin: Alberto ]|
+--------------------------------------------------------------------------------+
| [ + Nuevo Empleado ] [ Filtro Rol: Todos v ] [ Estado: Todos v ] [ Buscar... ] |
+--------------------------------------------------------------------------------+
| GESTIÓN DE PERSONAL Y CUENTAS                               Mostrando 12 usuarios|
|                                                                                |
| ID | Nombre Completo   | Correo Electrónico    | Rol       | Sucursal    | Estado  | Acciones           |
|----+-------------------+-----------------------+-----------+-------------+---------+--------------------|
| 01 | Alberto Delgado   | alberto.d@store.bo    | ADMIN     | Central SCZ | [ACTIVO]| [Editar] [Clave]   |
| 02 | Andy Mujica       | andy.m@store.bo       | ADMIN     | Central SCZ | [ACTIVO]| [Editar] [Clave]   |
| 03 | Mario Valdivia    | mario.v@store.bo      | ENCARGADO | Equipetrol  | [ACTIVO]| [Editar] [Pausar]  |
| 04 | Roberto Sucre     | roberto.s@store.bo    | CAJERO    | Calacoto LP | [BLOQ! ]| [*DESBLOQUEAR*]    |
| 05 | Javier Terceros   | javier.t@store.bo     | LOGISTICA | Almacén Cen | [ACTIVO]| [Editar] [Pausar]  |
| 06 | Carlos Mendoza    | carlos.m@gmail.com    | CLIENTE   | Omnicanal   | [ACTIVO]| [Ver Perfil]       |
+----+-------------------+-----------------------+-----------+-------------+---------+--------------------+
|                                                                                |
| MODAL: [ EDITAR USUARIO / ASIGNAR SUCURSAL Y ROL ]                             |
| +----------------------------------------------------------------------------+ |
| | Nombre: Roberto Sucre              Correo: roberto.s@store.bo              | |
| | Rol Jerárquico: [ Cajero de Sucursal                             v ]       | |
| | Sucursal Asignada: [ Sucursal Calacoto - La Paz                  v ]       | |
| | Estado de Cuenta: (•) Activo  ( ) Inactivo  ( ) Bloqueado por Intentos     | |
| | Contador de Intentos Fallidos: [ 5 ]  ->  [ RESTABLECER A 0 ]              | |
| |                                                                            | |
| |     [ GUARDAR CAMBIOS ]        [ CANCELAR ]        [ REENVIAR CLAVE ]      | |
| +----------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU04** |
| **Nombre** | **Gestionar Usuarios y Roles (RBAC y Desbloqueo)** |
| **Actores** | Administrador General. |
| **Propósito** | Gestionar los usuarios internos de la organización, asignar sus roles y sucursales físicas de desempeño, regular sus privilegios y realizar tareas de mantenimiento operativo (como el desbloqueo de cuentas bloqueadas por intentos fallidos). |
| **Tipo** | Primario / Administrativo. |
| **Precondiciones** | El usuario debe estar autenticado con rol `ADMINISTRADOR`. |
| **Postcondiciones** | Se persisten las modificaciones en la tabla `usuarios` y se asienta el registro de auditoría en `bitacora_accesos`. |
| **Flujo Principal** | 1. El Administrador accede a la opción *"Usuarios y Roles"* del menú administrativo.<br>2. El sistema recupera la lista paginada de usuarios con sus roles y sucursales.<br>3. El Administrador selecciona *"Nuevo Empleado"* o hace clic en *"Editar"* sobre un usuario existente.<br>4. El sistema presenta el formulario modal con los campos de perfil, selector de rol jerárquico y selector de sucursal física.<br>5. El Administrador asigna el rol correspondiente (`ADMINISTRADOR`, `ENCARGADO_SUCURSAL`, `CAJERO`, `LOGISTICA`) y vincula la sucursal.<br>6. El Administrador presiona *"Guardar Cambios"*.<br>7. El sistema valida los datos y persiste las modificaciones en la base de datos.<br>8. El sistema notifica la confirmación de la operación. |
| **Flujos Alternativos** | **3a. Desbloqueo de cuenta bloqueada por 5 intentos:**<br>1. El Administrador visualiza el badge de estado `[BLOQ! ]` en el usuario.<br>2. El Administrador presiona el botón directo *"Desbloquear"*.<br>3. El sistema resetea `intentos_fallidos = 0`, establece `estado_cuenta = 'ACTIVO'` y elimina la marca de tiempo `bloqueado_hasta`.<br>4. El sistema emite mensaje: *"Cuenta desbloqueada exitosamente. El usuario ya puede iniciar sesión."*<br>**3b. Baja / Inactivación de empleado:**<br>1. El Administrador selecciona cambiar estado a `INACTIVO`.<br>2. El sistema revoca de inmediato todos los tokens JWT emitidos para dicho usuario. |

---

#### 1.3.5 Caso de Uso CU05: Gestionar Ciudades y Sucursales

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Administrador General" as Admin

rectangle "FashionStore - Módulo de Sucursales" {
    usecase "CU05: Gestionar Ciudades
y Sucursales" as CU_Sucursales
    usecase "Registrar Nueva Sucursal
con Coordenadas GPS" as CU_RegSucursal
    usecase "Actualizar Horarios y
Capacidad de Probadores" as CU_ModSucursal
    usecase "Asignar Encargado
de Tienda" as CU_AsignarPersonal
    usecase "Geolocalizar Sucursal
en Mapa Interactivo" as CU_Mapa
    usecase "Inhabilitar Sucursal
Temporalmente" as CU_BajaLogica
}

Admin --> CU_Sucursales
CU_Sucursales <.. CU_RegSucursal : <<extend>>
CU_Sucursales <.. CU_ModSucursal : <<extend>>
CU_Sucursales <.. CU_BajaLogica : <<extend>>
CU_RegSucursal ..> CU_Mapa : <<include>>
CU_RegSucursal ..> CU_AsignarPersonal : <<include>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore ADMIN | Gestión de Sucursales y Cobertura         [ Admin: Andy ]|
+--------------------------------------------------------------------------------+
| [Dashboard] [Sucursales*] [Productos] [Temporadas] [Proveedores] [Inventario]  |
+--------------------------------------------------------------------------------+
| PANEL DE SUCURSALES FÍSICAS                     [ + Registrar Nueva Sucursal ] |
|                                                                                |
| Filtro Ciudad: [ Todas las Ciudades v ]   Estado: [ Operativas v ]  [Buscar]   |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | ID | Ciudad     | Nombre Sucursal      | Teléfono  | Probadores | Estado   |Acc| |
| +----+------------+----------------------+-----------+------------+----------+---+ |
| | 01 | Santa Cruz | Sucursal Equipetrol  | 3-3445566 | 6 vestidor | OPERATIVA|[E]| |
| | 02 | Santa Cruz | Sucursal Centro      | 3-3332211 | 4 vestidor | OPERATIVA|[E]| |
| | 03 | La Paz     | Sucursal Calacoto    | 2-2778899 | 5 vestidor | OPERATIVA|[E]| |
| | 04 | Cochabamba | Sucursal El Prado    | 4-4223344 | 4 vestidor | OPERATIVA|[E]| |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| FORMULARIO: REGISTRO / EDICIÓN DE SUCURSAL                                     |
| Ciudad: [ Santa Cruz v ]      Nombre: [ Sucursal Equipetrol                  ] |
| Dirección: [ Av. San Martín #450, entre 3er y 4to anillo                     ] |
| Latitud: [ -17.76823 ]   Longitud: [ -63.18342 ]   [ Ubicar en Mapa GPS ]      |
| Horario: [ 09:00 ] a [ 21:00 ]   Capacidad Probadores: [ 6 ]                   |
| Encargado Asignado: [ Carlos Morales (ID: 104) v ]   Estado: [ OPERATIVA v ]   |
|                                                                                |
|                   [ CANCELAR ]           [ GUARDAR SUCURSAL ]                  |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU05** |
| **Nombre** | **Gestionar Ciudades y Sucursales** |
| **Actores** | Administrador General. |
| **Propósito** | Crear, configurar, actualizar y georreferenciar las ciudades y sucursales físicas habilitadas para la venta presencial, almacenamiento de existencias y reservas de probadores. |
| **Tipo** | Secundario / Gestión Operativa. |
| **Precondiciones** | 1. El actor debe haberse autenticado exitosamente como Administrador General.<br>2. La ciudad de radicación debe encontrarse dada de alta en el sistema. |
| **Postcondiciones** | 1. La sucursal queda registrada en la base de datos con coordenadas geodésicas válidas.<br>2. La sucursal queda habilitada como nodo geográfico para asignación de inventario y reservas. |
| **Flujo Principal** | 1. El Administrador accede al panel de "Gestión de Sucursales".<br>2. El sistema lista las sucursales existentes con sus métricas clave.<br>3. El Administrador pulsa en "Registrar Nueva Sucursal".<br>4. El Administrador completa: ciudad, nombre comercial, dirección, coordenadas GPS, horarios de apertura/cierre y capacidad de probadores.<br>5. El Administrador asigna al Encargado de Sucursal responsable.<br>6. El sistema valida consistencia de datos y unicidad del nombre en la ciudad.<br>7. El sistema persiste la sucursal y notifica confirmación en pantalla. |
| **Flujos Alternativos** | **6a. Coordenadas fuera de rango:** El sistema notifica error de latitud/longitud e invita a seleccionar el punto en el mapa interactivo.<br>**6b. Encargado ya asignado:** El sistema advierte que el usuario ya es titular en otra tienda y solicita confirmación de reasignación. |

---

#### 1.3.6 Caso de Uso CU06: Gestionar Productos y Atributos de Moda

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Administrador General" as Admin

rectangle "FashionStore - Módulo de Catálogo y Prendas" {
    usecase "CU06: Gestionar Productos
de Indumentaria" as CU_Productos
    usecase "Registrar Ficha Técnica
y Código SKU" as CU_CrearPrenda
    usecase "Asignar Colores Multivaluados
(Nombre + Código Hex)" as CU_Colores
    usecase "Configurar Tallas Normalizadas
(S, M, L, XL, etc.)" as CU_Tallas
    usecase "Cargar Galería Multimedia
de Imágenes" as CU_Imagenes
    usecase "Vincular Modelo 3D para
Realidad Aumentada" as CU_RA
}

Admin --> CU_Productos
CU_Productos <.. CU_CrearPrenda : <<extend>>
CU_CrearPrenda ..> CU_Colores : <<include>>
CU_CrearPrenda ..> CU_Tallas : <<include>>
CU_CrearPrenda ..> CU_Imagenes : <<include>>
CU_CrearPrenda <.. CU_RA : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore ADMIN | Gestión de Catálogo de Prendas            [ Admin: Alberto]|
+--------------------------------------------------------------------------------+
| [Dashboard] [Sucursales] [Productos*] [Temporadas] [Proveedores] [Inventario]  |
+--------------------------------------------------------------------------------+
| CATÁLOGO DE PRENDAS MASCULINAS                     [ + Registrar Nueva Prenda ]|
| Filtro Categoría: [ Camisas v ]  Marca: [ Oxford Club v ]  Estado: [ Activo v ]|
|                                                                                |
| FICHA TÉCNICA DE PRODUCTO (NUEVO / EDICIÓN)                                    |
| Código SKU Base: [ SHIRT-SLIM-001       ]   Género: (•) Masculino              |
| Nombre Comercial: [ Camisa Oxford Clásica Slim Fit                           ] |
| Categoría: [ Camisas Formales v ]   Marca: [ Oxford Heritage v ]               |
| Precio de Venta Base (Bs): [ 280.00     ]   Temporada: [ Primavera-Verano v ]  |
| Descripción Textil:                                                            |
| [ Tejido 100% algodón egipcio peinado, cuello italiano, puño francés.      ]  |
|                                                                                |
| TALLAS DISPONIBLES: [X] S   [X] M   [X] L   [X] XL   [ ] XXL   [ ] 40  [ ] 42  |
|                                                                                |
| PALETA DE COLORES MULTIVALUADOS:                                               |
| +----------------------------------------------------------------------------+ |
| | Color Nombre   | Código HEX | Muestra Visual | Acción                       | |
| +----------------+------------+----------------+------------------------------+ |
| | Azul Marino    | #000080    | [   AZUL   ]   | [ Quitar ]                   | |
| | Blanco Óptico  | #FFFFFF    | [  BLANCO  ]   | [ Quitar ]                   | |
| | Celeste Cielo  | #87CEEB    | [ CELESTE  ]   | [ Quitar ]                   | |
| +----------------------------------------------------------------------------+ |
| [ + Agregar Color: Nombre [ Rosado Pálido ] Hex [ #FFC0CB ] [ Añadir ] ]       |
|                                                                                |
| RECURSOS MULTIMEDIA Y 3D:                                                      |
| Fotos: [ cam_azul.jpg ] [ cam_blanco.jpg ] [ cam_detalle.jpg ]  [ Subir ]      |
| Archivo 3D para RA: [ shirt_slim_001.glb ] (Formato GLB optimizado)            |
|                                                                                |
|                   [ CANCELAR ]               [ GUARDAR PRENDA ]                |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU06** |
| **Nombre** | **Gestionar Productos y Atributos de Moda** |
| **Actores** | Administrador General. |
| **Propósito** | Registrar y actualizar prendas de vestir masculinas con sus especificaciones técnicas, variantes de tallas, colores multivaluados con código visual y recursos multimedia para el vestidor virtual. |
| **Tipo** | Primario. |
| **Precondiciones** | La categoría y marca deben encontrarse registradas previamente en el sistema. |
| **Postcondiciones** | 1. El producto queda guardado con su código SKU base único.<br>2. Se generan las matrices relacionales de variantes (combinación producto-talla-color).<br>3. Las variantes quedan preparadas para recibir stock en el módulo de inventario. |
| **Flujo Principal** | 1. El Administrador accede al panel de productos y presiona "Registrar Nueva Prenda".<br>2. El sistema despliega el formulario con los campos taxonómicos.<br>3. El Administrador introduce el código SKU base, nombre comercial, descripción y precio de venta base.<br>4. El Administrador selecciona la categoría textil y la marca.<br>5. El Administrador tilda las tallas disponibles para el modelo.<br>6. El Administrador agrega la paleta de colores multivaluados indicando nombre comercial y código hexadecimal.<br>7. El Administrador sube las imágenes en alta definición y el modelo 3D (.glb).<br>8. El sistema valida la integridad de los datos y no duplicidad de SKU.<br>9. El sistema persiste el producto y sus variantes relacionales. |
| **Flujos Alternativos** | **8a. SKU duplicado:** El sistema rechaza la operación e indica que el código ya pertenece a otro artículo.<br>**8b. Archivo 3D inválido:** El sistema valida la cabecera del archivo binario y rechaza formatos distintos a .glb / .gltf. |

---

#### 1.3.7 Caso de Uso CU07: Gestionar Temporadas y Colecciones

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Administrador General" as Admin

rectangle "FashionStore - Módulo de Temporadas" {
    usecase "CU07: Gestionar Temporadas
y Colecciones" as CU_Temporadas
    usecase "Calendarizar Nueva Temporada
Comercial" as CU_CrearTemp
    usecase "Asociar Prendas a
Colección Estacional" as CU_Vincular
    usecase "Activar Descuentos de
Fin de Temporada" as CU_Descuento
    usecase "Cerrar y Liquidar
Temporada" as CU_Cierre
}

Admin --> CU_Temporadas
CU_Temporadas <.. CU_CrearTemp : <<extend>>
CU_Temporadas <.. CU_Vincular : <<extend>>
CU_Temporadas <.. CU_Descuento : <<extend>>
CU_Temporadas <.. CU_Cierre : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore ADMIN | Temporadas y Colecciones Comerciales      [ Admin: Andy ]|
+--------------------------------------------------------------------------------+
| [Dashboard] [Sucursales] [Productos] [Temporadas*] [Proveedores] [Inventario]  |
+--------------------------------------------------------------------------------+
| GESTIÓN DE TEMPORADAS Y CAMPAÑAS                 [ + Crear Nueva Temporada ]   |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Código  | Nombre Temporada         | Inicio     | Fin        | Estado      |Ac| |
| +---------+--------------------------+------------+------------+-------------+--+ |
| | SS-2026 | Primavera - Verano 2026  | 01/08/2026 | 31/01/2027 | VIGENTE     |[E] |
| | FW-2026 | Otoño - Invierno 2026    | 01/02/2026 | 31/07/2026 | LIQUIDACIÓN |[E] |
| | ESC-2026| Temporada Universitaria  | 15/01/2026 | 28/02/2026 | FINALIZADA  |[E] |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| CONFIGURACIÓN DE CAMPAÑA ESTACIONAL                                            |
| Código: [ SS-2026 ]   Nombre: [ Primavera - Verano 2026                      ] |
| Fechas: Desde [ 01/08/2026 ] Hasta [ 31/01/2027 ]   Estado: [ VIGENTE v ]      |
| Descuento Sugerido Liquidación: [ 20.00 ] %                                    |
|                                                                                |
| ASOCIACIÓN MASIVA DE PRENDAS A LA TEMPORADA:                                   |
| [Buscar prenda: Camisa lino...]   [ Marcar Todas ]   [ 45 prendas vinculadas ] |
|                                                                                |
|                   [ CANCELAR ]               [ GUARDAR CAMBIOS ]               |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU07** |
| **Nombre** | **Gestionar Temporadas y Colecciones** |
| **Actores** | Administrador General. |
| **Propósito** | Crear y estructurar temporadas comerciales anuales, vinculando lotes de prendas para análisis estacional de rotación y reglas de IA contextual. |
| **Tipo** | Secundario. |
| **Precondiciones** | El usuario debe poseer privilegios de Administrador. |
| **Postcondiciones** | Las prendas asociadas adquieren el identificador de temporada para alimentar los filtros del catálogo y el motor de IA. |
| **Flujo Principal** | 1. El Administrador accede al panel de "Temporadas y Colecciones".<br>2. El sistema muestra la lista de temporadas vigentes y concluidas.<br>3. El Administrador ingresa código, nombre y rango de fechas de inicio y fin.<br>4. El Administrador selecciona las categorías y productos que pertenecerán a la colección.<br>5. El sistema valida que la fecha de fin sea posterior a la de inicio.<br>6. El sistema actualiza la vinculación y recalcula el catálogo público. |
| **Flujos Alternativos** | **5a. Fechas inconsistentes:** El sistema emite alerta: *"La fecha de cierre debe ser posterior a la fecha de inicio de la temporada."* |

---

#### 1.3.8 Caso de Uso CU08: Gestionar Proveedores Textiles

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Administrador General
/ Encargado de Logística" as AdminLog

rectangle "FashionStore - Módulo de Proveedores" {
    usecase "CU08: Gestionar Proveedores" as CU_Proveedores
    usecase "Registrar Proveedor con NIT" as CU_CrearProv
    usecase "Vincular Líneas Textiles
y Catálogo Suministrado" as CU_Lineas
    usecase "Consultar Historial de Compras
y Cumplimiento" as CU_Historial
    usecase "Dar de Baja Lógica
por Incumplimiento" as CU_BajaProv
}

AdminLog --> CU_Proveedores
CU_Proveedores <.. CU_CrearProv : <<extend>>
CU_Proveedores <.. CU_Historial : <<extend>>
CU_Proveedores <.. CU_BajaProv : <<extend>>
CU_CrearProv ..> CU_Lineas : <<include>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore ADMIN | Padrón de Proveedores Textiles            [ Admin: Alberto]|
+--------------------------------------------------------------------------------+
| [Dashboard] [Sucursales] [Productos] [Temporadas] [Proveedores*] [Inventario]  |
+--------------------------------------------------------------------------------+
| PROVEEDORES REGISTRADOS                            [ + Registrar Proveedor ]   |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | ID | NIT / Tax ID | Razón Social          | Contacto      | Términos  |Est.|Ac| |
| +----+--------------+-----------------------+---------------+-----------+----+--+ |
| | 01 | 1028392019   | Confecciones Andina SA| Juan Paredes  | Crédito 30|ACT |[E| |
| | 02 | 9038472011   | Hilanderías del Sur   | Marcos Vaca   | Contado   |ACT |[E| |
| | 03 | 3829104018   | Importadora Textil SRL| Carlos Suárez | Crédito 60|ACT |[E| |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| FORMULARIO DE PROVEEDOR                                                        |
| NIT / Identificación: [ 1028392019        ]  Razón Social: [ Confecciones A...]|
| Contacto Comercial: [ Juan Paredes       ]  Teléfono: [ +591 70012345       ]  |
| Correo Electrónico: [ ventas@andina.com.bo] Dirección: [ P. Industrial M-4   ] |
| Términos Comerciales: [ Crédito a 30 Días v ]  Estado: [ ACTIVO v ]            |
|                                                                                |
|                   [ CANCELAR ]               [ GUARDAR PROVEEDOR ]             |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU08** |
| **Nombre** | **Gestionar Proveedores Textiles** |
| **Actores** | Administrador General, Personal de Logística. |
| **Propósito** | Administrar el catálogo de proveedores que abastecen mercadería textil a FashionStore para sustentar las órdenes de compra y el ingreso a almacén. |
| **Tipo** | Secundario / Soporte. |
| **Precondiciones** | Usuario con rol Administrador o Logística autenticado. |
| **Postcondiciones** | El proveedor queda disponible para ser seleccionado en los registros de compra y entrada de inventario. |
| **Flujo Principal** | 1. El usuario accede al menú de "Proveedores".<br>2. El sistema lista los proveedores activos.<br>3. El usuario pulsa "Registrar Proveedor" e ingresa NIT, Razón Social, teléfono, email y términos de pago.<br>4. El sistema valida que el NIT no exista previamente.<br>5. El sistema registra el proveedor y muestra mensaje de éxito. |
| **Flujos Alternativos** | **4a. NIT duplicado:** El sistema notifica: *"El NIT ingresado ya se encuentra registrado con la razón social X."* |

---

#### 1.3.9 Caso de Uso CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP)

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Personal de Logística
/ Encargado de Sucursal" as Logistica

rectangle "FashionStore - Módulo de Inventario y Costos" {
    usecase "CU09: Gestionar Inventario
Multi-Sucursal" as CU_Inventario
    usecase "Registrar Entrada de Lote
por Compra" as CU_Entrada
    usecase "Almacenar Último Costo
Unitario de Compra" as CU_UltimoCosto
    usecase "Calcular Costo Promedio
Ponderado (CPP)" as CU_CalcularCPP
    usecase "Consultar Existencias y
Kardex de Sucursal" as CU_Kardex
    usecase "Registrar Transferencia
Inter-Sucursales" as CU_Transferencia
    usecase "Alertar Quiebre de Stock
(Stock < Stock Mínimo)" as CU_Alerta
}

Logistica --> CU_Inventario
CU_Inventario <.. CU_Entrada : <<extend>>
CU_Inventario <.. CU_Kardex : <<extend>>
CU_Inventario <.. CU_Transferencia : <<extend>>

CU_Entrada ..> CU_UltimoCosto : <<include>>
CU_Entrada ..> CU_CalcularCPP : <<include>>
CU_Inventario <.. CU_Alerta : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore INVENTARIO | Control Multi-Sucursal y Costos     [ Logística: Andy ]|
+--------------------------------------------------------------------------------+
| [Dashboard] [Sucursales] [Productos] [Temporadas] [Proveedores] [Inventario*]  |
+--------------------------------------------------------------------------------+
| SUCURSAL: [ Sucursal Equipetrol (Santa Cruz) v ]     [ + Registrar Entrada ]   |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | SKU Base     | Prenda | Talla | Color  | Físico | Reserv| Disp | Últ.Cost| CPP | |
| +--------------+--------+-------+--------+--------+-------+------+---------+-----+ |
| | SHIRT-SL-001 | Camisa | M     | Azul   | 35 uds | 5 uds | 30 ud| 110 Bs  |98 Bs| |
| | SHIRT-SL-001 | Camisa | L     | Blanco | 20 uds | 2 uds | 18 ud| 110 Bs  |95 Bs| |
| | PANT-CH-002  | Pantal | 32    | Beige  | 15 uds | 0 uds | 15 ud| 140 Bs  |135Bs| |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| REGISTRO DE ENTRADA POR COMPRA A PROVEEDOR (RECEPCIÓN DE LOTE)                 |
| Sucursal Destino: [ Sucursal Equipetrol v ]   Proveedor: [ Confecciones Andina]|
| Prenda: [ Camisa Oxford Slim Fit v ]   Talla: [ M v ]   Color: [ Azul Marino v]|
| Cantidad Recibida: [ 20 ] unidades                                             |
| Costo Unitario Compra (Factura): [ 120.00 ] Bs                                 |
|                                                                                |
| CÁLCULO AUTOMATIZADO DE VALUACIÓN (B4.txt):                                    |
| * Stock Actual Previo: 15 unidades a CPP de 90.00 Bs (Inversión: 1,350.00 Bs)  |
| * Nuevo Lote: 20 unidades a 120.00 Bs (Inversión lote: 2,400.00 Bs)           |
| * Stock Total Resultante: 35 unidades                                          |
| * Nuevo Costo Promedio Ponderado (CPP): [ 107.14 ] Bs                          |
| * Último Costo Unitario Registrado: [ 120.00 ] Bs                              |
|                                                                                |
|                  [ CANCELAR ]              [ ASENTAR EN KARDEX ]               |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU09** |
| **Nombre** | **Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP)** |
| **Actores** | Personal de Logística, Encargado de Sucursal. |
| **Propósito** | Registrar ingresos de mercadería, controlar existencias físicas y disponibles por tienda, almacenar el último costo unitario y recalcular matemáticamente el Costo Promedio Ponderado para fines de valuación patrimonial y márgenes reales. |
| **Tipo** | Crítico / Núcleo Transaccional. |
| **Precondiciones** | El producto, talla, color, sucursal y proveedor deben existir en la base de datos. |
| **Postcondiciones** | 1. Se incrementa el stock físico y disponible de la variante en la sucursal.<br>2. Se asienta el último costo de compra.<br>3. Se actualiza el $CPP$.<br>4. Se registra el asiento inmutable en el Kardex de inventario. |
| **Flujo Principal** | 1. El usuario de Logística selecciona "Registrar Entrada de Mercadería".<br>2. Elige la sucursal receptora, el proveedor y el producto específico con su talla y color.<br>3. Ingresa la cantidad física del lote recibido y el costo unitario de adquisición de la factura.<br>4. El sistema recupera el stock actual y el CPP anterior de la variante en esa sucursal.<br>5. El sistema aplica la fórmula estandarizada:<br>$$CPP_{\text{nuevo}} = \frac{(Stock_{\text{ant}} \times CPP_{\text{ant}}) + (Cantidad_{\text{lote}} \times Costo_{\text{lote}})}{Stock_{\text{ant}} + Cantidad_{\text{lote}}}$$<br>6. El sistema muestra el recálculo al usuario para verificación.<br>7. El usuario confirma el asiento.<br>8. El sistema ejecuta una transacción ACID: actualiza tabla `inventario` y añade fila en `kardex_movimientos`. |
| **Flujos Alternativos** | **3a. Costo o cantidad cero/negativo:** El sistema bloquea el registro exigiendo valores estrictamente mayores a cero. |

---

#### 1.3.10 Caso de Uso CU10: Consultar Catálogo y Disponibilidad por Sucursal

##### a) Diseño del Caso de Uso (PlantUML)

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Cliente
(Web / Móvil)" as Cliente
actor "Encargado de Tienda
/ Cajero" as Empleado

rectangle "FashionStore - Catálogo Omnicanal" {
    usecase "CU10: Consultar Catálogo
y Disponibilidad" as CU_Catalogo
    usecase "Filtrar por Talla, Color,
Temporada y Precio" as CU_Filtros
    usecase "Verificar Stock en Tiempo
Real por Sucursal Física" as CU_Disponibilidad
    usecase "Visualizar Ficha Técnica
y Galería de Fotos" as CU_Ficha
    usecase "Marcar Prenda como
Favorita (Wishlist)" as CU_Wishlist
}

Cliente --> CU_Catalogo
Empleado --> CU_Catalogo

CU_Catalogo ..> CU_Filtros : <<include>>
CU_Catalogo ..> CU_Disponibilidad : <<include>>
CU_Catalogo ..> CU_Ficha : <<include>>
CU_Catalogo <.. CU_Wishlist : <<extend>>
@enduml
```

##### b) Prototipo de Interfaz de Usuario (UI Wireframe)

```text
+--------------------------------------------------------------------------------+
|  FashionStore | Colección Masculina 2026           [ Buscar prenda... ] [🛒 0] |
+--------------------------------------------------------------------------------+
| Filtros: [ Categorías v ] [ Talla: M v ] [ Color: Azul v ] [ Sucursal: Todas v ]|
+--------------------------------------------------------------------------------+
| CATÁLOGO DE PRENDAS                                 Mostrando 24 resultados    |
|                                                                                |
| +-------------------------+ +-------------------------+ +--------------------+ |
| | [ IMAGEN DE PRENDA ]    | | [ IMAGEN DE PRENDA ]    | | [ IMAGEN PRENDA ]  | |
| | Camisa Oxford Slim Fit  | | Pantalón Gabardina Chino| | Blazer Lino Casual | |
| | Marca: Oxford Heritage  | | Marca: Urban Tailor     | | Marca: Sartorial   | |
| | Precio: 280.00 Bs       | | Precio: 320.00 Bs       | | Precio: 650.00 Bs  | |
| | Tallas: [S] [M*] [L]    | | Tallas: [30] [32*] [34] | | Tallas: [40] [42*] | |
| | Colores: ( Azul ) (Blan)| | Colores: (Beige) (Negro)| | Colores: (Azul Mar)| |
| |                         | |                         | |                    | |
| | DISPONIBILIDAD TIENDAS: | | DISPONIBILIDAD TIENDAS: | | DISPONIBILIDAD:    | |
| | • Equipetrol: 30 uds    | | • Equipetrol: 15 uds    | | • Equipetrol: 4 uds| |
| | • Calacoto: 12 uds      | | • Calacoto: 0 uds (Agot)| | • Calacoto: 8 uds  | |
| | • El Prado: 8 uds       | | • El Prado: 6 uds       | | • El Prado: 2 uds  | |
| |                         | |                         | |                    | |
| | [ Probar en RA ]        | | [ Ver Detalles ]        | | [ Ver Detalles ]   | |
| | [ RESERVAR EN TIENDA ]  | | [ RESERVAR EN TIENDA ]  | | [ RESERVAR TIENDA] | |
| +-------------------------+ +-------------------------+ +--------------------+ |
+--------------------------------------------------------------------------------+
```

##### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle de la Especificación |
|:---|:---|
| **Identificador** | **CU10** |
| **Nombre** | **Consultar Catálogo y Disponibilidad por Sucursal** |
| **Actores** | Cliente (Web y Móvil), Encargado de Sucursal, Cajero. |
| **Propósito** | Permitir a los usuarios explorar las prendas, aplicar filtros cruzados y conocer con absoluta precisión en qué sucursales físicas existe stock de su talla y color elegido. |
| **Tipo** | Primario / Omnicanal. |
| **Precondiciones** | La plataforma web o app móvil debe tener acceso a la API pública de catálogo. |
| **Postcondiciones** | El cliente obtiene la lista de prendas con stock disponible en tiempo real para proceder a la reserva o compra digital. |
| **Flujo Principal** | 1. El usuario accede al catálogo de FashionStore.<br>2. El sistema recupera y pagina las prendas publicadas con sus imágenes y variantes.<br>3. El usuario aplica filtros (ej. Talla M, Color Azul, Sucursal Equipetrol).<br>4. El sistema ejecuta una consulta indexada y devuelve las prendas coincidentes con su stock por tienda.<br>5. El usuario selecciona una prenda para ver su ficha técnica completa y guía de medidas.<br>6. El sistema presenta opciones de acción (Probar en RA, Reservar para prueba presencial, o Añadir al carrito). |
| **Flujos Alternativos** | **4a. Sin stock en la sucursal seleccionada:** El sistema muestra la etiqueta *"Agotado en esta sucursal"* y resalta inmediatamente en cuáles otras tiendas de la ciudad sí existe stock disponible. |

---

### 1.4 Prototipado de Interfaz de Usuario (I.U.)

Conforme al programa metodológico del PUDS (`INDICE.txt`, punto 1.4) y la instrucción explícita impartida por la docente en clase (`B4.txt`, líneas 10 a 14), los prototipos de interfaz de usuario de alta fidelidad (UI Wireframes) se desarrollaron e integraron directamente en la especificación detallada de cada caso de uso en la sección 1.3 precedente, siguiendo la tríada estandarizada:
1. **Diseño del Caso de Uso (PlantUML)**
2. **Prototipo de Interfaz de Usuario (UI Wireframe)**
3. **Tabla Detalle del Caso de Uso**

A continuación se resume el inventario consolidado de las pantallas y prototipos elaborados para los 10 Casos de Uso del Ciclo 1:

| Código CU | Nombre del Caso de Uso | Vista / Pantalla Prototipada | Tipo de Interfaz | Componentes Clave de UI |
|:---:|:---|:---|:---:|:---|
| **CU01** | Autenticar Usuario (Login RBAC) | Vista Login | Web / Móvil | Inputs correo y contraseña con revelador `[Ver]`, selector de rol, checkbox sesión persistente, enlace a recuperación. |
| **CU02** | Registrar Cliente (Sign Up) | Vista Registro Cliente | Web / Móvil | Formulario de datos personales, celular WhatsApp, validador dinámico de fortaleza de contraseña, términos y condiciones. |
| **CU03** | Recuperar Contraseña (OTP) | Vista Solicitar OTP y Vista Restablecer Clave (2 pantallas) | Web / Móvil | Pantalla 1: Formulario de email. Pantalla 2: 6 cajas individuales de dígitos OTP `[_][_][_][_][_][_]`, cronómetro de 15:00 min y nueva clave. |
| **CU04** | Gestionar Usuarios y Roles | Dashboard Usuarios (RBAC) y Modal de Edición | Web Admin | Grilla de empleados con badges de estado `[ACTIVO]` / `[BLOQUEADO]`, dropdown de sucursales asignadas, botón directo `[DESBLOQUEAR]`. |
| **CU05** | Gestionar Ciudades y Sucursales | Vista Sucursales y Mapa | Web Admin | Formulario de georreferenciación GPS (Lat, Lon), selector de ciudad, control de capacidad de probadores y estado. |
| **CU06** | Gestionar Productos y Atributos | Ficha Técnica de Producto | Web Admin | Generador de SKU, selector multivaluado de colores con previsualización HEX, matriz de tallas normalizadas y carga de fotos. |
| **CU07** | Gestionar Temporadas | Panel Temporadas | Web Admin | Selector de campañas (SS, FW), calendarización con fechas de inicio/fin, toggle de activación de liquidación y porcentaje. |
| **CU08** | Gestionar Proveedores Textiles | Directorio de Proveedores | Web Admin | Validación de NIT tributario único, formulario de razón social, términos de pago (Contado/Crédito) y catálogo de líneas. |
| **CU09** | Gestionar Inventario y CPP | Asiento de Recepción y Kardex | Web Admin | Formulario de entrada por factura de compra, captura de último costo unitario y visualizador del nuevo Costo Promedio Ponderado ($CPP$). |
| **CU10** | Consultar Catálogo y Disponibilidad | Catálogo Omnicanal | Web / Móvil | Filtros cruzados por talla, color y sucursal, tarjetas de prenda con stock físico en tiempo real desglosado por tienda física. |

---

### 1.5 Estructurar Modelo de Casos de Uso

A fin de organizar modularmente los requerimientos del Ciclo 1 y evidenciar la cohesión funcional del software, se estructura el modelo de casos de uso organizado en **Paquetes de Casos de Uso**:

```plantuml
@startuml
skinparam packageStyle rectangle

package "Paquete 1: Seguridad y Acceso (RBAC)" as Pkg_Seguridad {
    usecase "CU01: Autenticar Usuario (Login)" as UC1
    usecase "CU02: Registrar Cliente (Sign Up)" as UC2
    usecase "CU03: Recuperar Contraseña (OTP)" as UC3
    usecase "CU04: Gestionar Usuarios y Roles" as UC4
}

package "Paquete 2: Estructura Operativa" as Pkg_Sucursales {
    usecase "CU05: Gestionar Sucursales y Ciudades" as UC5
}

package "Paquete 3: Catálogo y Moda Masculina" as Pkg_Catalogo {
    usecase "CU06: Gestionar Productos y Atributos" as UC6
    usecase "CU07: Gestionar Temporadas y Colecciones" as UC7
    usecase "CU10: Consultar Catálogo y Disponibilidad" as UC10
}

package "Paquete 4: Aprovisionamiento y Proveedores" as Pkg_Proveedores {
    usecase "CU08: Gestionar Proveedores Textiles" as UC8
}

package "Paquete 5: Inventario y Costos Ponderados" as Pkg_Inventario {
    usecase "CU09: Gestionar Inventario Multi-Sucursal" as UC9
    usecase "Calcular Costo Promedio (CPP)" as UC9_1
    usecase "Asentar en Kardex" as UC9_2
}

' Relaciones de dependencia y uso entre paquetes
Pkg_Sucursales ..> Pkg_Seguridad : <<use>>
Pkg_Catalogo ..> Pkg_Seguridad : <<use>>
Pkg_Proveedores ..> Pkg_Seguridad : <<use>>
Pkg_Inventario ..> Pkg_Seguridad : <<use>>

Pkg_Inventario ..> Pkg_Sucursales : <<use>>
Pkg_Inventario ..> Pkg_Catalogo : <<use>>
Pkg_Inventario ..> Pkg_Proveedores : <<use>>
Pkg_Catalogo ..> Pkg_Inventario : <<consulta stock>>
@enduml
```

---

## 2. Flujo de Trabajo: Análisis

### 2.1 Análisis de Arquitectura

El análisis arquitectónico del Ciclo 1 descompone el sistema en subsistemas y paquetes de análisis de alto nivel (`B4.txt`, líneas 22-28), formalizando la relación estricta entre paquetes y los 10 Casos de Uso desarrollados, aplicando los estereotipos de robustez de Ivar Jacobson:
- **Clases de Interfaz (`<<boundary>>`)**: Encargadas de la interacción y comunicación directa con los actores humanos y externos (formularios de entrada, pantallas interactivas y endpoints API REST). Poseen atributos de captura visual y métodos de interacción (eventos de usuario).
- **Clases de Control (`<<control>>`)**: Encargadas de orquestar la lógica de negocio, reglas algorítmicas, validaciones y transformaciones de dominio. Como subraya estrictamente la cátedra (`B4.txt`, línea 40), **las clases de control contienen exclusivamente métodos de negocio y NO poseen atributos propios**, operando directamente sobre las entidades de datos.
- **Clases de Entidad (`<<entity>>`)**: Representan la información persistente y los conceptos transaccionales del dominio (tablas, campos y registros de PostgreSQL).

A continuación se sintetiza la distribución de los 10 Casos de Uso en los 5 Paquetes de Análisis identificados para el Ciclo 1:

| Paquete de Análisis | Casos de Uso Contenidos | Actores Asociados | Responsabilidad Principal de Arquitectura |
|:---|:---|:---|:---|
| **Paquete 1: Seguridad y Acceso (RBAC)** | CU01, CU02, CU03, CU04 | Usuario, Cliente, Administrador | Autenticación criptográfica con Bcrypt, emisión de tokens JWT, alta autoservicio, recuperación con OTP de 6 dígitos y administración centralizada de cuentas. |
| **Paquete 2: Estructura Operativa (Sucursales)** | CU05 | Administrador General | Gestión geográfica multiciudad, georreferenciación GPS, control de probadores físicos y parametrización de horarios. |
| **Paquete 3: Catálogo y Moda Masculina** | CU06, CU07, CU10 | Administrador, Cliente, Encargado | Ficha técnica de prendas, atributos multivaluados (colores HEX y tallas), calendarización de temporadas (SS/FW) y catálogo público omnicanal. |
| **Paquete 4: Aprovisionamiento y Proveedores** | CU08 | Administrador, Personal Logística | Directorio comercial de proveedores textiles, validación de NIT tributario único y condiciones comerciales de suministro. |
| **Paquete 5: Inventario y Costos Ponderados** | CU09 | Personal Logística, Encargado | Recepción de lotes, existencias multi-sucursal, valuación matemática por Costo Promedio Ponderado ($CPP$) y Kardex inmutable. |

---

### 2.2 Analizar Casos de Uso (Diagramas de Comunicación UML)

A continuación se presentan los **Diagramas de Comunicación UML** para cada uno de los 10 Casos de Uso del Ciclo 1. Conforme a las directrices de la cátedra expresadas en clase (`B4.txt`), cada caso de uso se analiza de forma rigurosa modelando la colaboración entre la clase de interfaz (`<<boundary>>`), la clase de lógica (`<<control>>` sin atributos) y la clase de datos (`<<entity>>`), con mensajes numerados cronológicamente (`1`, `1.1`, `1.2`, etc.):

#### 2.2.1 Diagrama de Comunicación - CU01: Autenticar Usuario (RBAC)

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Usuario" as User
boundary ":ILoginBoundary" as UI
control ":AutenticacionControl" as Ctrl
entity ":UsuarioEntity" as UserEnt
entity ":BitacoraEntity" as BitacoraEnt

User -> UI : 1: Ingresar credenciales (email, password)
UI -> Ctrl : 1.1: solicitarAutenticacion(email, password)
Ctrl -> UserEnt : 1.2: buscarPorEmail(email)
UserEnt --> Ctrl : 1.3: retorna datos y password_hash
Ctrl -> Ctrl : 1.4: verificarBcrypt(password, password_hash)
Ctrl -> Ctrl : 1.5: generarTokenJWT(usuario_id, rol)
Ctrl -> BitacoraEnt : 1.6: registrarAcceso(usuario_id, ip, exitoso=true)
Ctrl --> UI : 1.7: retorna token JWT y perfil
UI --> User : 1.8: redirige al dashboard según rol
@enduml
```

#### 2.2.2 Diagrama de Comunicación - CU02: Registrar Cliente (Auto-registro)

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Cliente" as Cliente
boundary ":IRegistroBoundary" as UI
control ":RegistroClienteControl" as Ctrl
entity ":UsuarioEntity" as UserEnt
entity ":EmailService" as EmailEnt

Cliente -> UI : 1: Ingresar datos de registro (nombres, email, clave, tel)
UI -> Ctrl : 1.1: procesarRegistroCliente(dtoRegistro)
Ctrl -> UserEnt : 1.2: verificarEmailExistente(email)
UserEnt --> Ctrl : 1.3: retorna false (no registrado)
Ctrl -> Ctrl : 1.4: encriptarPasswordBcrypt(clave, factor=12)
Ctrl -> UserEnt : 1.5: crearUsuarioCliente(datos, hash)
UserEnt --> Ctrl : 1.6: retorna usuario_id
Ctrl -> EmailEnt : 1.7: despacharCorreoBienvenida(email, nombres)
Ctrl -> Ctrl : 1.8: generarTokenJWT(usuario_id, rol='CLIENTE')
Ctrl --> UI : 1.9: confirma registro y devuelve token de sesión
UI --> Cliente : 1.10: muestra bienvenida y redirige al catálogo
@enduml
```

#### 2.2.3 Diagrama de Comunicación - CU03: Recuperar Contraseña (Token OTP)

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Usuario" as User
boundary ":IRecuperarClaveBoundary" as UI
control ":RecuperacionControl" as Ctrl
entity ":UsuarioEntity" as UserEnt
entity ":TokenOtpEntity" as TokenEnt
entity ":EmailService" as EmailEnt

User -> UI : 1: Solicitar código para email ingresado
UI -> Ctrl : 1.1: solicitarOtpRecuperacion(email)
Ctrl -> UserEnt : 1.2: buscarPorEmail(email)
UserEnt --> Ctrl : 1.3: retorna usuario_id activo
Ctrl -> Ctrl : 1.4: generarCodigoOtp6Digitos()
Ctrl -> TokenEnt : 1.5: registrarTokenOtp(usuario_id, codigoOtp, exp=15min)
TokenEnt --> Ctrl : 1.6: confirma token persistido
Ctrl -> EmailEnt : 1.7: enviarCorreoConOtp(email, codigoOtp)
Ctrl --> UI : 1.8: solicitar ingreso de código OTP y nueva contraseña

User -> UI : 2: Ingresar código OTP y nueva clave
UI -> Ctrl : 2.1: restablecerPasswordConOtp(email, codigoOtp, nuevaClave)
Ctrl -> TokenEnt : 2.2: validarOtp(email, codigoOtp)
TokenEnt --> Ctrl : 2.3: confirma código válido y vigente
Ctrl -> Ctrl : 2.4: encriptarPasswordBcrypt(nuevaClave, factor=12)
Ctrl -> UserEnt : 2.5: actualizarPasswordHash(usuario_id, nuevoHash)
Ctrl -> UserEnt : 2.6: desbloquearCuentaSiAplica(usuario_id)
Ctrl -> TokenEnt : 2.7: marcarOtpUtilizado(token_id)
Ctrl --> UI : 2.8: confirma restablecimiento exitoso
UI --> User : 2.9: mensaje de éxito y redirección a login
@enduml
```

#### 2.2.4 Diagrama de Comunicación - CU04: Gestionar Usuarios y Roles (RBAC)

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Administrador" as Admin
boundary ":IGestionUsuariosBoundary" as UI
control ":UsuarioAdminControl" as Ctrl
entity ":UsuarioEntity" as UserEnt
entity ":SucursalEntity" as SucEnt
entity ":BitacoraEntity" as BitacoraEnt

Admin -> UI : 1: Solicitar alta/edición de usuario (datos, rol, sucursal)
UI -> Ctrl : 1.1: registrarOModificarUsuario(datosUsuario)
Ctrl -> SucEnt : 1.2: verificarSucursalActiva(sucursal_id)
SucEnt --> Ctrl : 1.3: confirma sucursal válida
Ctrl -> UserEnt : 1.4: persistirEmpleado(datosUsuario, rol, sucursal_id)
UserEnt --> Ctrl : 1.5: retorna confirmación
Ctrl -> BitacoraEnt : 1.6: registrarEventoAuditoria(admin_id, "MODIF_USUARIO")
Ctrl --> UI : 1.7: devuelve usuario actualizado
UI --> Admin : 1.8: renderiza grilla con cambios aplicados

Admin -> UI : 2: Clic en 'Desbloquear Cuenta'
UI -> Ctrl : 2.1: desbloquearCuentaUsuario(usuario_id)
Ctrl -> UserEnt : 2.2: resetearIntentosYEstado(usuario_id)
UserEnt --> Ctrl : 2.3: retorna ok (estado='ACTIVO', intentos=0)
Ctrl --> UI : 2.4: confirmación de cuenta desbloqueada
UI --> Admin : 2.5: actualiza badge a verde [ACTIVO]
@enduml
```

#### 2.2.5 Diagrama de Comunicación - CU05: Gestionar Sucursales y Ciudades

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Administrador" as Admin
boundary ":ISucursalBoundary" as UI
control ":SucursalControl" as Ctrl
entity ":CiudadEntity" as CiudadEnt
entity ":SucursalEntity" as SucursalEnt

Admin -> UI : 1: Ingresar datos sucursal (nombre, dir, lat, lon, probadores)
UI -> Ctrl : 1.1: registrarSucursal(datosSucursal)
Ctrl -> CiudadEnt : 1.2: verificarCiudadActiva(ciudad_id)
CiudadEnt --> Ctrl : 1.3: confirma ciudad válida
Ctrl -> SucursalEnt : 1.4: crearSucursal(datosValidados)
SucursalEnt --> Ctrl : 1.5: retorna sucursal_id generado
Ctrl --> UI : 1.6: confirmarExito("Sucursal registrada exitosamente")
UI --> Admin : 1.7: mostrar sucursal en grilla y mapa
@enduml
```

#### 2.2.6 Diagrama de Comunicación - CU06: Gestionar Productos y Atributos

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Administrador" as Admin
boundary ":IProductoBoundary" as UI
control ":ProductoControl" as Ctrl
entity ":ProductoEntity" as ProdEnt
entity ":ColorEntity" as ColorEnt
entity ":TallaEntity" as TallaEnt

Admin -> UI : 1: Enviar ficha técnica (SKU, nombre, tallas[], colores[])
UI -> Ctrl : 1.1: guardarProducto(datosProducto)
Ctrl -> ProdEnt : 1.2: validarSkuUnico(sku_base)
Ctrl -> ProdEnt : 1.3: crearProductoBase(sku, nombre, precio, categoria_id)
ProdEnt --> Ctrl : 1.4: retorna producto_id
Ctrl -> ColorEnt : 1.5: asociarColores(producto_id, colores_hex[])
Ctrl -> TallaEnt : 1.6: asociarTallas(producto_id, tallas_nom[])
Ctrl --> UI : 1.7: notificarProductoGuardado(producto_id)
UI --> Admin : 1.8: mostrar ficha confirmada con variantes
@enduml
```

#### 2.2.7 Diagrama de Comunicación - CU07: Gestionar Temporadas y Colecciones

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Administrador" as Admin
boundary ":ITemporadaBoundary" as UI
control ":TemporadaControl" as Ctrl
entity ":TemporadaEntity" as TempEnt
entity ":ProductoEntity" as ProdEnt

Admin -> UI : 1: Ingresar temporada (código, fechas, productos_ids[])
UI -> Ctrl : 1.1: programarTemporada(datosTemp, productos_ids)
Ctrl -> Ctrl : 1.2: validarRangoFechas(inicio, fin)
Ctrl -> TempEnt : 1.3: crearTemporada(datosValidados)
TempEnt --> Ctrl : 1.4: retorna temporada_id
Ctrl -> ProdEnt : 1.5: asociarProductosATemporada(temporada_id, productos_ids)
Ctrl --> UI : 1.6: confirmarTemporadaVigente()
UI --> Admin : 1.7: visualizar campaña estacional activada
@enduml
```

#### 2.2.8 Diagrama de Comunicación - CU08: Gestionar Proveedores Textiles

```plantuml
@startuml
skinparam actorStyle awesome

actor ":PersonalLogistica" as User
boundary ":IProveedorBoundary" as UI
control ":ProveedorControl" as Ctrl
entity ":ProveedorEntity" as ProvEnt

User -> UI : 1: Enviar datos proveedor (NIT, razón social, contacto)
UI -> Ctrl : 1.1: registrarProveedor(datosProv)
Ctrl -> ProvEnt : 1.2: verificarNitUnico(nit)
ProvEnt --> Ctrl : 1.3: confirma NIT disponible
Ctrl -> ProvEnt : 1.4: crearRegistroProveedor(datosProv)
ProvEnt --> Ctrl : 1.5: retorna proveedor_id
Ctrl --> UI : 1.6: confirmarAltaProveedor()
UI --> User : 1.7: mostrar proveedor en lista de abastecimiento
@enduml
```

#### 2.2.9 Diagrama de Comunicación - CU09: Gestionar Inventario y Costos (CPP)

```plantuml
@startuml
skinparam actorStyle awesome

actor ":PersonalLogistica" as User
boundary ":IInventarioBoundary" as UI
control ":InventarioControl" as Ctrl
entity ":InventarioEntity" as InvEnt
entity ":KardexEntity" as KardexEnt

User -> UI : 1: Registrar entrada de lote (sucursal_id, SKU, cant, costo_unit)
UI -> Ctrl : 1.1: procesarEntradaMercaderia(sucursal_id, SKU, cant, costo_unit)
Ctrl -> InvEnt : 1.2: obtenerExistenciasYCppActual(sucursal_id, SKU)
InvEnt --> Ctrl : 1.3: retorna (stock_ant, cpp_ant)
Ctrl -> Ctrl : 1.4: calcularCppNuevo(stock_ant, cpp_ant, cant, costo_unit)
Ctrl -> InvEnt : 1.5: actualizarStockYCostos(nuevo_stock, costo_unit, nuevo_cpp)
Ctrl -> KardexEnt : 1.6: asentarMovimientoEntrada(tipo="COMPRA", cant, costo_unit, nuevo_cpp)
Ctrl --> UI : 1.7: notificarInventarioActualizado(nuevo_stock, nuevo_cpp)
UI --> User : 1.8: mostrar comprobante de kardex con nuevo CPP
@enduml
```

#### 2.2.10 Diagrama de Comunicación - CU10: Consultar Catálogo y Disponibilidad

```plantuml
@startuml
skinparam actorStyle awesome

actor ":Cliente" as User
boundary ":ICatalogoBoundary" as UI
control ":CatalogoControl" as Ctrl
entity ":ProductoEntity" as ProdEnt
entity ":InventarioEntity" as InvEnt

User -> UI : 1: Seleccionar filtros (categoría, talla, color, sucursal)
UI -> Ctrl : 1.1: consultarPrendas(criteriosFiltro)
Ctrl -> ProdEnt : 1.2: buscarPrendasFiltradas(criterios)
ProdEnt --> Ctrl : 1.3: retorna lista de productos base
Ctrl -> InvEnt : 1.4: consultarStockPorSucursal(producto_ids, sucursal_id)
InvEnt --> Ctrl : 1.5: retorna existencias disponibles
Ctrl --> UI : 1.6: serializarRespuestaCatalogo(prendasConStock)
UI --> User : 1.7: renderizar cuadrícula con tarjetas de producto y stock
@enduml
```

---

### 2.3 Análisis de Clases

Conforme a la instrucción metodológica de la cátedra (`B4.txt`, líneas 38-40), el análisis de clases formaliza exhaustivamente las tres categorías de clases de robustez (BCE) con sus responsabilidades exactas para los **10 Casos de Uso del Ciclo 1**:
- **Clases de Interfaz (`<<boundary>>`)**: Poseen atributos de captura de datos visuales y métodos interactivos que reflejan las acciones y eventos del usuario (botones, selectores, clics).
- **Clases de Control (`<<control>>`)**: Contienen exclusivamente métodos de orquestación lógica del backend y **NO tienen atributos propios** (directriz taxativa de `B4.txt`).
- **Clases de Entidad (`<<entity>>`)**: Poseen tanto atributos de datos persistentes como métodos de encapsulamiento y consulta sobre la base de datos.

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle

package "Clases de Interfaz (Boundary)" {
    class ILoginBoundary <<boundary>> {
        - txtEmail: String
        - txtPassword: String
        - chkRecordar: Boolean
        + onClickIniciarSesion(): void
        + onClickRecuperarClave(): void
        + mostrarError(mensaje: String): void
    }

    class IRegistroBoundary <<boundary>> {
        - txtNombres: String
        - txtApellidos: String
        - txtEmail: String
        - txtTelefono: String
        - txtPassword: String
        + onClickRegistrar(): void
        + mostrarAlertaClaveDebil(): void
    }

    class IRecuperarClaveBoundary <<boundary>> {
        - txtEmail: String
        - txtCodigoOtp: String
        - txtNuevaPassword: String
        + onClickSolicitarOtp(): void
        + onClickRestablecerClave(): void
        + renderizarTiempoRestante(seg: Integer): void
    }

    class IGestionUsuariosBoundary <<boundary>> {
        - cmbRol: String
        - cmbSucursal: Integer
        - txtBuscar: String
        + onClickCrearEmpleado(): void
        + onClickDesbloquearCuenta(id: Integer): void
    }

    class ISucursalBoundary <<boundary>> {
        - txtNombreSucursal: String
        - cmbCiudad: Integer
        - txtDireccion: String
        - txtLatitud: Decimal
        - txtLongitud: Decimal
        - txtCapacidadProbadores: Integer
        + onClickGuardarSucursal(): void
        + onConsultarMapa(): void
    }

    class IProductoBoundary <<boundary>> {
        - txtSkuBase: String
        - txtNombrePrenda: String
        - cmbCategoria: Integer
        - cmbMarca: Integer
        - txtPrecioBase: Decimal
        - listColoresHex: List<String>
        - listTallas: List<String>
        + onClickGuardarPrenda(): void
        + onSubirFotos(): void
    }

    class ITemporadaBoundary <<boundary>> {
        - txtCodigoCampana: String
        - txtNombreTemporada: String
        - dtpFechaInicio: Date
        - dtpFechaFin: Date
        - txtDescuentoLiquidacion: Decimal
        + onClickGuardarTemporada(): void
        + onAsociarPrendas(): void
    }

    class IProveedorBoundary <<boundary>> {
        - txtNit: String
        - txtRazonSocial: String
        - txtContacto: String
        - txtTelefono: String
        - txtEmail: String
        - cmbTerminosPago: String
        + onClickGuardarProveedor(): void
        + onValidarNit(): void
    }

    class IInventarioBoundary <<boundary>> {
        - cmbSucursal: Integer
        - cmbProducto: Integer
        - txtTalla: String
        - txtColor: String
        - txtCantidadRecibida: Integer
        - txtCostoUnitario: Decimal
        + onClickGuardarEntrada(): void
        + onConsultarKardex(): void
        + renderizarNuevoCpp(cpp: Decimal): void
    }

    class ICatalogoBoundary <<boundary>> {
        - filtroCategoria: Integer
        - filtroTalla: String
        - filtroColor: String
        - filtroSucursal: Integer
        + onAplicarFiltros(): void
        + onSeleccionarPrenda(id: Integer): void
        + onVerificarDisponibilidadTienda(): void
    }
}

package "Clases de Control (Sin atributos - Directriz B4.txt)" {
    class AutenticacionControl <<control>> {
        + autenticarUsuario(email: String, clave: String): TokenDTO
        + validarHashBcrypt(clave: String, hash: String): Boolean
        + registrarBitacora(userId: Integer, ip: String, exito: Boolean): void
    }

    class RegistroClienteControl <<control>> {
        + procesarRegistro(dto: RegistroDTO): TokenDTO
        + validarComplejidadClave(clave: String): Boolean
        + enviarCorreoBienvenida(email: String, nombre: String): void
    }

    class RecuperacionControl <<control>> {
        + solicitarOtp(email: String): Boolean
        + generarCodigoOtpCripto(): String
        + validarOtpYRestablecer(email: String, otp: String, nuevaClave: String): Boolean
    }

    class UsuarioAdminControl <<control>> {
        + registrarEmpleado(dto: EmpleadoDTO): UsuarioDTO
        + asignarRolYSucursal(userId: Integer, rolId: String, sucId: Integer): void
        + desbloquearCuenta(usuarioId: Integer): void
    }

    class SucursalControl <<control>> {
        + registrarSucursal(dto: SucursalDTO): SucursalDTO
        + validarCoordenadasGps(lat: Decimal, lon: Decimal): Boolean
        + listarSucursalesPorCiudad(ciudadId: Integer): List<SucursalDTO>
    }

    class ProductoControl <<control>> {
        + registrarPrendaConAtributos(dto: ProductoDTO, colores: List, tallas: List): ProductoDTO
        + validarSkuUnico(sku: String): Boolean
        + asociarRecurso3D(productoId: Integer, glbUrl: String): void
    }

    class TemporadaControl <<control>> {
        + crearTemporada(dto: TemporadaDTO): TemporadaDTO
        + vincularPrendasCampana(temporadaId: Integer, productosIds: List): void
        + activarLiquidacion(temporadaId: Integer, pctDescuento: Decimal): void
    }

    class ProveedorControl <<control>> {
        + registrarProveedor(dto: ProveedorDTO): ProveedorDTO
        + validarNitUnico(nit: String): Boolean
        + actualizarTerminosComerciales(provId: Integer, terminos: String): void
    }

    class InventarioControl <<control>> {
        + procesarEntradaLote(sucursalId: Integer, sku: String, cant: Integer, costo: Decimal): ResumenKardexDTO
        + calcularCostoPromedioPonderado(stkAnt: Integer, cppAnt: Decimal, cant: Integer, costo: Decimal): Decimal
        + verificarStockMinimo(sucursalId: Integer, sku: String): Boolean
    }

    class CatalogoControl <<control>> {
        + consultarPrendasDisponibles(filtros: FiltroDTO): List<PrendaCatalogoDTO>
        + obtenerDetallePrendaConStock(productoId: Integer): PrendaDetalleDTO
        + obtenerDisponibilidadMultiSucursal(productoId: Integer, talla: String, color: String): List<StockSucursalDTO>
    }
}

package "Clases de Entidad (Entity)" {
    class UsuarioEntity <<entity>> {
        - id_usuario: Integer
        - id_sucursal: Integer
        - email: String
        - password_hash: String
        - rol: RolEnum
        - estado_cuenta: EstadoEnum
        - intentos_fallidos: Integer
        - bloqueado_hasta: Timestamp
        + buscarPorEmail(email: String): UsuarioEntity
        + actualizarIntentos(intentos: Integer): void
        + desbloquear(): void
    }

    class TokenOtpEntity <<entity>> {
        - id_token: Integer
        - id_usuario: Integer
        - codigo_otp_hash: String
        - expiracion: Timestamp
        - utilizado: Boolean
        - intentos_fallidos: Integer
        + registrarOtp(userId: Integer, otp: String): TokenOtpEntity
        + validarOtp(otp: String): Boolean
        + marcarUtilizado(): void
    }

    class CiudadEntity <<entity>> {
        - id_ciudad: Integer
        - nombre_ciudad: String
        - departamento: String
        + listarActivas(): List<CiudadEntity>
    }

    class SucursalEntity <<entity>> {
        - id_sucursal: Integer
        - id_ciudad: Integer
        - nombre_sucursal: String
        - direccion: String
        - latitud: Decimal
        - longitud: Decimal
        - capacidad_probadores: Integer
        + guardar(): void
        + buscarPorId(id: Integer): SucursalEntity
    }

    class ProductoEntity <<entity>> {
        - id_producto: Integer
        - id_categoria: Integer
        - id_marca: Integer
        - id_temporada: Integer
        - id_proveedor: Integer
        - codigo_sku_base: String
        - nombre: String
        - precio_base: Decimal
        + buscarPorCriterios(filtros: FiltroDTO): List<ProductoEntity>
        + guardar(): void
    }

    class CategoriaEntity <<entity>> {
        - id_categoria: Integer
        - nombre_categoria: String
    }

    class ColorEntity <<entity>> {
        - id_color: Integer
        - id_producto: Integer
        - color_nombre: String
        - codigo_hex: String
    }

    class TallaEntity <<entity>> {
        - id_talla: Integer
        - id_producto: Integer
        - talla: String
    }

    class TemporadaEntity <<entity>> {
        - id_temporada: Integer
        - codigo_campana: String
        - nombre_temporada: String
        - fecha_inicio: Date
        - fecha_fin: Date
        - descuento_liquidacion: Decimal
        + guardar(): void
    }

    class ProveedorEntity <<entity>> {
        - id_proveedor: Integer
        - nit_identificacion: String
        - razon_social: String
        - contacto_nombre: String
        - telefono: String
        - email: String
        + existeNit(nit: String): Boolean
        + guardar(): void
    }

    class InventarioEntity <<entity>> {
        - id_inventario: Integer
        - id_sucursal: Integer
        - id_producto: Integer
        - talla: String
        - color: String
        - stock_fisico: Integer
        - stock_reservado: Integer
        - ultimo_costo: Decimal
        - costo_promedio: Decimal
        + obtenerStock(sucId: Integer, prodId: Integer, talla: String, col: String): InventarioEntity
        + actualizarExistenciasYCostos(cant: Integer, uCosto: Decimal, nCpp: Decimal): void
    }

    class KardexEntity <<entity>> {
        - id_kardex: Integer
        - id_inventario: Integer
        - tipo_movimiento: String
        - cantidad: Integer
        - costo_unitario_mov: Decimal
        - saldo_cantidad: Integer
        - saldo_cpp: Decimal
        + asentarMovimiento(): void
    }
}

' Relaciones de colaboración entre capas BCE
ILoginBoundary ..> AutenticacionControl : invoca
AutenticacionControl ..> UsuarioEntity : manipula

IRegistroBoundary ..> RegistroClienteControl : invoca
RegistroClienteControl ..> UsuarioEntity : crea

IRecuperarClaveBoundary ..> RecuperacionControl : invoca
RecuperacionControl ..> TokenOtpEntity : consulta/valida
RecuperacionControl ..> UsuarioEntity : actualiza clave

IGestionUsuariosBoundary ..> UsuarioAdminControl : invoca
UsuarioAdminControl ..> UsuarioEntity : administra
UsuarioAdminControl ..> SucursalEntity : verifica

ISucursalBoundary ..> SucursalControl : invoca
SucursalControl ..> SucursalEntity : crea/edita
SucursalControl ..> CiudadEntity : valida

IProductoBoundary ..> ProductoControl : invoca
ProductoControl ..> ProductoEntity : crea/edita
ProductoControl ..> ColorEntity : asocia
ProductoControl ..> TallaEntity : asocia

ITemporadaBoundary ..> TemporadaControl : invoca
TemporadaControl ..> TemporadaEntity : crea
TemporadaControl ..> ProductoEntity : vincula

IProveedorBoundary ..> ProveedorControl : invoca
ProveedorControl ..> ProveedorEntity : valida/crea

IInventarioBoundary ..> InventarioControl : invoca
InventarioControl ..> InventarioEntity : actualiza stock/CPP
InventarioControl ..> KardexEntity : asienta movimiento
InventarioControl ..> ProductoEntity : consulta

ICatalogoBoundary ..> CatalogoControl : invoca
CatalogoControl ..> ProductoEntity : consulta
CatalogoControl ..> InventarioEntity : consulta stock en tiempo real
@enduml
```

---

### 2.4 Análisis de Paquetes

En el análisis de paquetes (`B4.txt`, líneas 42-44) se evalúa la arquitectura bajo dos métricas cardinales de la ingeniería de software:
1. **Acoplamiento**: Medida de interdependencia entre los módulos. Se busca un **bajo acoplamiento** para evitar que modificaciones en un subsistema provoquen fallos en cascada.
2. **Cohesión**: Medida de afinidad y fortaleza asociativa interna de los elementos de un paquete. Se procura una **alta cohesión funcional**, agrupando en cada paquete clases estrictamente orientadas a un mismo objetivo de negocio.

```plantuml
@startuml
package "Seguridad (RBAC y Cuentas)" as PkgSeg {
    class AutenticacionControl
    class RegistroClienteControl
    class RecuperacionControl
    class UsuarioAdminControl
    class UsuarioEntity
    class TokenOtpEntity
    class BitacoraEntity
}

package "Sucursales" as PkgSuc {
    class SucursalControl
    class SucursalEntity
    class CiudadEntity
}

package "Productos y Catálogo" as PkgProd {
    class CatalogoControl
    class ProductoControl
    class TemporadaControl
    class ProductoEntity
    class CategoriaEntity
    class ColorEntity
    class TemporadaEntity
}

package "Inventario y Costos" as PkgInv {
    class InventarioControl
    class InventarioEntity
    class KardexEntity
}

package "Proveedores" as PkgProv {
    class ProveedorControl
    class ProveedorEntity
}

' Relaciones de dependencia entre paquetes
PkgSuc ..> PkgSeg : autentica operador
PkgProd ..> PkgSeg : autoriza cambios
PkgProv ..> PkgSeg : autoriza gestión
PkgInv ..> PkgSeg : audita entradas

PkgInv ..> PkgSuc : almacena por sucursal
PkgInv ..> PkgProd : controla existencias de prendas
PkgInv ..> PkgProv : asienta compras

PkgProd ..> PkgInv : consulta stock en catálogo
@enduml
```

| Paquete de Análisis | Nivel de Cohesión | Nivel de Acoplamiento | Justificación Técnica de Diseño |
|:---|:---:|:---:|:---|
| **Seguridad (RBAC)** | **Alta (Funcional)** | **Bajo (Eferente: 0, Aferente: 4)** | Módulo núcleo completamente autónomo; provee tokens y validación de identidad a todos los demás paquetes sin depender de ellos. |
| **Sucursales** | **Alta (Datos/Operación)**| **Bajo (Eferente: 1, Aferente: 1)** | Gestiona la infraestructura física; solo depende de la seguridad para autorizaciones de edición. |
| **Productos y Catálogo** | **Alta (Dominio)** | **Medio (Eferente: 2, Aferente: 1)** | Agrupa la lógica de prendas, tallas, colores y temporadas; interactúa con inventario para disponibilizar existencias en el catálogo. |
| **Inventario y Costos** | **Muy Alta (Transaccional)**| **Controlado (Eferente: 4, Aferente: 1)** | Núcleo integrador logístico y financiero; conecta sucursales, productos y proveedores para la actualización del Kardex y CPP. |
| **Proveedores** | **Alta (Dominio)** | **Bajo (Eferente: 1, Aferente: 1)** | Maneja exclusivamente el padrón comercial y contratos de suministro. |

---

## 3. Flujo de Trabajo: Diseño

### 3.1 Diseño de Arquitectura

#### 3.1.1 Diseño Lógico de la Arquitectura (4 Capas UML)

Conforme a las explicaciones de cátedra (`B4.txt`, líneas 46-48), la arquitectura lógica del sistema FashionStore se estructura formalmente en **cuatro capas horizontales desacopladas**:

```plantuml
@startuml
skinparam packageStyle rectangle

package "1. Capa Específica de la Aplicación (Presentación)" as CapaPresentacion {
    component "Frontend Web (Angular 17+)
[SPA / TypeScript / Material]" as CompWeb
    component "Aplicación Móvil (Flutter 3.x)
[Dart / Android & iOS]" as CompMovil
}

package "2. Capa Intermedia (Servicios y API REST)" as CapaIntermedia {
    component "API Gateway / Routers FastAPI
[/auth, /sucursales, /productos, /inventario]" as CompRouters
    component "Middleware de Seguridad
[JWT Bearer / CORS / RateLimiter]" as CompMiddleware
}

package "3. Capa General (Lógica de Negocio y Dominio)" as CapaDominio {
    component "Servicios de Negocio (Python)
[InventarioService (CPP), AuthService,
CatalogoService, TemporadaService]" as CompServicios
    component "Modelos Pydantic (Validación DTO)
[ProductoSchema, EntradaLoteSchema, UserSchema]" as CompDTO
}

package "4. Capa Software de Sistema (Acceso a Datos y Persistencia)" as CapaDatos {
    component "ORM / Repositorios SQL
[SQLAlchemy 2.0 / Asyncpg / Pool Conexiones]" as CompORM
    database "PostgreSQL 15+
[Base de Datos Relacional ACID]" as CompBD
}

CapaPresentacion ..> CapaIntermedia : Peticiones HTTPS / JSON
CapaIntermedia ..> CapaDominio : Invocación de Controladores
CapaDominio ..> CapaDatos : Consultas y Transacciones ACID
@enduml
```

---

#### 3.1.2 Diseño Físico de la Arquitectura (Diagrama de Despliegue)

El diagrama de despliegue modela los nodos físicos y de nube donde residen los artefactos de software compilados, los enlaces telemáticos y protocolos de comunicación:

```plantuml
@startuml
skinparam nodeStyle rectangle

node "<<dispositivo>>
Smartphone del Cliente / Encargado" as NodeMovil {
    node "Sistema Operativo Android / iOS" {
        artifact "FashionStore App
(Flutter / Dart APK/IPA)" as ArtApp
    }
}

node "<<computadora>>
Estación Desktop / PC Cajero" as NodeDesktop {
    node "Navegador Web (Chrome, Edge)" {
        artifact "FashionStore Web SPA
(Angular 17+ Compilado)" as ArtWeb
    }
}

cloud "Infraestructura Cloud PaaS (Render / Railway)" as CloudBackend {
    node "<<servidor de aplicaciones>>
Contenedor Docker (Linux Debian)" as NodeAppServer {
        artifact "Backend API
(Python 3.11 + FastAPI + Uvicorn)" as ArtFastAPI
    }
    
    node "<<servidor de base de datos>>
Instancia PostgreSQL Gestionada" as NodeDBServer {
        database "fashionstore_db
(PostgreSQL 15+)" as DBPostgres
    }
}

cloud "Servicios Externos en Nube" as CloudExternos {
    node "<<servicio externo>>
OpenWeatherMap API" as NodeClima
    node "<<servicio externo>>
OpenAI / Gemini API" as NodeIA
}

NodeDesktop -- NodeAppServer : HTTPS / TLS 1.3 (Puerto 443)
NodeMovil -- NodeAppServer : HTTPS / TLS 1.3 (Puerto 443)
NodeAppServer -- NodeDBServer : Conexión TCP/IP (Puerto 5432 / SSL)
NodeAppServer -- NodeClima : HTTPS REST (JSON)
NodeAppServer -- NodeIA : HTTPS REST (JSON)
@enduml
```

---

### 3.2 Diseño de Casos de Uso

#### 3.2.1 Diagrama de Secuencia - Recuperación de Contraseña mediante Token OTP (CU03)

Modela la interacción asíncrona y segura para la solicitud, emisión y validación del código temporal OTP de 6 dígitos:

```plantuml
@startuml
actor "Usuario" as User
boundary "IRecuperarClaveBoundary" as UI
control "RecuperacionControl" as Ctrl
entity "UsuarioEntity" as UserEnt
entity "TokenOtpEntity" as TokenEnt
participant "MailService (SMTP/TLS)" as Mail
database "PostgreSQL" as DB

User -> UI : ingresarEmailParaRecuperar("alberto.delgado@store.bo")
activate UI

UI -> Ctrl : solicitarOtp(email)
activate Ctrl

Ctrl -> UserEnt : findByEmail(email)
activate UserEnt
UserEnt -> DB : SELECT * FROM usuarios WHERE email = ?
DB --> UserEnt : registroUsuario
UserEnt --> Ctrl : usuario
deactivate UserEnt

alt #LightCyan Usuario Encontrado y Activo
    Ctrl -> Ctrl : generarCodigoOtpCripto() [6 dígitos: '841920']
    Ctrl -> TokenEnt : createToken(usuario_id, otpHash, exp=NOW()+15m)
    activate TokenEnt
    TokenEnt -> DB : INSERT INTO tokens_recuperacion (...)
    DB --> TokenEnt : ok
    TokenEnt --> Ctrl : token_id
    deactivate TokenEnt
    
    Ctrl -> Mail : sendOtpEmail(email, "841920", exp=15)
    activate Mail
    Mail --> Ctrl : dispatch_ok
    deactivate Mail
    
    Ctrl --> UI : otpEnviadoExitosamente()
    UI --> User : mostrarPantallaIngresoOtp("Código enviado a tu correo")
else #LightYellow Usuario No Encontrado (Mitigación OWASP)
    Ctrl --> UI : respuestaGenericaSegura()
    UI --> User : mostrarPantallaIngresoOtp("Si el correo existe, el código fue enviado")
end
deactivate Ctrl

User -> UI : ingresarOtpYNuevaClave("841920", "NuevaClave2026*")
UI -> Ctrl : validarOtpYRestablecer(email, "841920", nuevaClave)
activate Ctrl

Ctrl -> TokenEnt : verifyOtp(usuario_id, "841920")
activate TokenEnt
TokenEnt -> DB : SELECT * FROM tokens_recuperacion WHERE ...
DB --> TokenEnt : tokenData
TokenEnt --> Ctrl : isValid = true, isExpired = false
deactivate TokenEnt

alt #LightCyan Código OTP Válido
    Ctrl -> Ctrl : hashBcrypt(nuevaClave, cost=12)
    Ctrl -> UserEnt : updatePassword(usuario_id, nuevoHash, estado='ACTIVO', intentos=0)
    activate UserEnt
    UserEnt -> DB : UPDATE usuarios SET password_hash=..., intentos_fallidos=0, estado_cuenta='ACTIVO'
    DB --> UserEnt : ok
    UserEnt --> Ctrl : ok
    deactivate UserEnt
    
    Ctrl -> TokenEnt : markAsUsed(token_id)
    activate TokenEnt
    TokenEnt -> DB : UPDATE tokens_recuperacion SET utilizado = true WHERE id = token_id
    DB --> TokenEnt : ok
    deactivate TokenEnt
    
    Ctrl --> UI : claveActualizadaExitosamente()
    UI --> User : notificarExitoYRedirigirLogin("¡Contraseña restablecida con éxito!")
else #Pink Código OTP Inválido o Expirado
    Ctrl --> UI : errorOtpInvalido("Código incorrecto o vencido")
    UI --> User : mostrarMensajeError("El código ingresado es incorrecto o ya expiró")
end
deactivate Ctrl
deactivate UI
@enduml
```

---

#### 3.2.2 Diagrama de Secuencia Transaccional - Entrada de Inventario con CPP (CU09)

Modelado con fragmentos combinados (`alt` para bifurcación de condición de existencia y `loop` para procesamiento de variantes):

```plantuml
@startuml
actor "Personal Logística" as User
boundary "IInventarioBoundary" as UI
control "InventarioControl" as Ctrl
entity "InventarioEntity" as Inv
entity "KardexEntity" as Kardex
database "PostgreSQL" as DB

User -> UI : ingresarDatosEntrada(sucursal_id, producto_id, talla, color, cant, costo_unit)
activate UI

UI -> Ctrl : registrarEntradaMercaderia(datosEntrada)
activate Ctrl

Ctrl -> Inv : findVariante(sucursal_id, producto_id, talla, color)
activate Inv
Inv -> DB : SELECT * FROM inventario WHERE ...
DB --> Inv : registro_actual
Inv --> Ctrl : inventarioActual (stock_ant, cpp_ant)
deactivate Inv

alt #LightCyan Registro Existente en Sucursal
    Ctrl -> Ctrl : calcularCPP(stock_ant, cpp_ant, cant, costo_unit)
    Ctrl -> Inv : updateStockYCostos(nuevo_stock, costo_unit, nuevo_cpp)
    activate Inv
    Inv -> DB : UPDATE inventario SET stock_fisico=..., costo_unitario=..., cpp=...
    DB --> Inv : ok
    Inv --> Ctrl : ok
    deactivate Inv
else #LightYellow Primera Entrada de Variante en Sucursal
    Ctrl -> Inv : createRegistroInventario(cant, costo_unit, cpp=costo_unit)
    activate Inv
    Inv -> DB : INSERT INTO inventario (...)
    DB --> Inv : ok
    Inv --> Ctrl : ok
    deactivate Inv
end

Ctrl -> Kardex : registrarAsientoKardex("COMPRA", cant, costo_unit, nuevo_cpp)
activate Kardex
Kardex -> DB : INSERT INTO kardex_movimientos (...)
DB --> Kardex : ok
Kardex --> Ctrl : asiento_id
deactivate Kardex

Ctrl --> UI : confirmacionExito(nuevo_stock, nuevo_cpp)
deactivate Ctrl

UI --> User : mostrarMensaje("Lote ingresado exitosamente. Nuevo CPP calculado.")
deactivate UI
@enduml
```

---

#### 3.2.3 Diagrama de Tiempo - Ciclo de Vida del Stock y Valuación

Modela la evolución temporal de los estados del inventario físico y la variación de su costo promedio ponderado ($CPP$) frente a eventos sucesivos de compra y venta en el tiempo:

```plantuml
@startuml
robust "Estado de Existencias" as EstadoStock
concise "Nivel de Stock Físico" as NivelStock
concise "Valuación CPP (Bs)" as ValCPP

@0
EstadoStock is SinStock
NivelStock is "0 uds"
ValCPP is "0.00 Bs"

@10
EstadoStock is Disponible
NivelStock is "10 uds"
ValCPP is "100.00 Bs"
note bottom of ValCPP : Compra Lote 1: 10 uds @ 100 Bs

@30
NivelStock is "5 uds"
ValCPP is "100.00 Bs"
note bottom of NivelStock : Salida por Venta: -5 uds

@50
NivelStock is "25 uds"
ValCPP is "116.00 Bs"
note bottom of ValCPP : Compra Lote 2: 20 uds @ 120 Bs
CPP = (5*100 + 20*120)/25 = 116 Bs

@70
EstadoStock is BajoStockMinimo
NivelStock is "3 uds"
ValCPP is "116.00 Bs"
note bottom of EstadoStock : Alerta automática al encargado
@enduml
```

---

#### 3.2.4 Diagramas de Estado - Dominio del Sistema

##### a) Ciclo de Vida de la Cuenta de Usuario y Token OTP (Seguridad)

Modela los estados de seguridad de la cuenta frente a intentos de acceso y el ciclo de vida efímero del token de recuperación:

```plantuml
@startuml
[*] --> Creado_Activo : Registro exitoso (CU02) / Alta admin (CU04)

state Creado_Activo {
    [*] --> Operativo
    Operativo --> IntentosFallidos : 1 a 4 logins errados
    IntentosFallidos --> Operativo : Login exitoso (resetea a 0)
}

Creado_Activo --> Bloqueado_Por_Intentos : 5to login fallido consecutivo
Creado_Activo --> Inactivo : Baja preventiva por Administrador

Bloqueado_Por_Intentos --> Desbloqueo_Admin : Admin presiona 'Desbloquear' (CU04)
Desbloqueo_Admin --> Creado_Activo

Bloqueado_Por_Intentos --> OTP_Solicitado : Usuario pide recuperación (CU03)

state "Ciclo del Token OTP (15 min)" as CicloOTP {
    [*] --> OTP_Emitido : Generación de código criptográfico
    OTP_Emitido --> OTP_Validado : Ingreso correcto de 6 dígitos dentro de 15 min
    OTP_Emitido --> OTP_Expirado : Transcurren > 15 minutos sin canjear
    OTP_Emitido --> OTP_Revocado : 3 intentos erróneos de código
    OTP_Validado --> Clave_Restablecida : Nueva clave cifrada con Bcrypt
}

OTP_Solicitado --> CicloOTP
Clave_Restablecida --> Creado_Activo : Cuenta reactivada y clave actualizada
OTP_Expirado --> [*] : Requiere nueva solicitud
Inactivo --> Creado_Activo : Reactivación por Admin
@enduml
```

##### b) Ciclo de Vida del Producto e Inventario

Modela las transiciones del ciclo de vida de una prenda de vestir en la tienda:

```plantuml
@startuml
[*] --> Borrador : Creación de Ficha Técnica

state Borrador {
    [*] --> Incompleto
    Incompleto --> Completo : Carga de tallas, colores y fotos
}

Borrador --> Publicado : Aprobación de Catálogo
Publicado --> EnCampanaEstacional : Vinculación a Temporada

state Publicado {
    [*] --> ConStockDisponible
    ConStockDisponible --> StockCritico : Stock <= Stock Mínimo
    StockCritico --> Agotado : Stock = 0
    Agotado --> ConStockDisponible : Recepción de nuevo lote
}

Publicado --> EnLiquidacion : Fin de Temporada
EnLiquidacion --> Descatalogado : Retiro de Línea
Descatalogado --> [*]
@enduml
```

---

#### 3.2.5 Diagrama de Navegación del Sistema (Ciclo 1)

Modela el flujo de navegación entre vistas y pantallas para la plataforma web y móvil:

```plantuml
@startuml
state "Pantalla Login (/login)" as VistaLogin
state "Pantalla Registro (/registro)" as VistaRegistro
state "Solicitar OTP (/recuperar-password)" as VistaOlvido
state "Restablecer Clave (/reset-password)" as VistaReset
state "Dashboard Principal (/dashboard)" as VistaDashboard
state "Gestión Usuarios y Roles (/admin/usuarios)" as VistaUsuarios
state "Módulo Sucursales (/sucursales)" as VistaSucursales
state "Módulo Productos (/productos)" as VistaProductos
state "Módulo Inventario y Kardex (/inventario)" as VistaInventario
state "Módulo Temporadas (/temporadas)" as VistaTemporadas
state "Módulo Proveedores (/proveedores)" as VistaProveedores
state "Catálogo Público (/catalogo)" as VistaCatalogo
state "Ficha Detalle Prenda (/prenda/:id)" as VistaDetalle

[*] --> VistaLogin : Acceso al sistema
[*] --> VistaCatalogo : Visitante público
[*] --> VistaRegistro : Clic 'Crear Cuenta'

VistaLogin --> VistaRegistro : 'Registrarse como Cliente'
VistaRegistro --> VistaLogin : 'Ya tengo cuenta'
VistaRegistro --> VistaCatalogo : Registro Exitoso (Auto-login)

VistaLogin --> VistaOlvido : '¿Olvidaste tu contraseña?'
VistaOlvido --> VistaLogin : 'Regresar al Login'
VistaOlvido --> VistaReset : OTP despachado por correo
VistaReset --> VistaLogin : Clave restablecida exitosamente

VistaLogin --> VistaDashboard : Autenticación Exitosa (Admin / Empleado)
VistaLogin --> VistaCatalogo : Autenticación Exitosa (Cliente)

VistaDashboard --> VistaUsuarios : Menú 'Usuarios y Roles' (Solo Admin)
VistaUsuarios --> VistaDashboard : Volver

VistaDashboard --> VistaSucursales : Menú 'Sucursales'
VistaSucursales --> VistaDashboard : Volver

VistaDashboard --> VistaProductos : Menú 'Productos'
VistaProductos --> VistaDashboard : Volver

VistaDashboard --> VistaInventario : Menú 'Inventario y CPP'
VistaInventario --> VistaDashboard : Volver

VistaDashboard --> VistaTemporadas : Menú 'Temporadas' (CU07)
VistaTemporadas --> VistaDashboard : Volver

VistaDashboard --> VistaProveedores : Menú 'Proveedores' (CU08)
VistaProveedores --> VistaDashboard : Volver

VistaCatalogo --> VistaDetalle : Clic en Tarjeta de Prenda
VistaDetalle --> VistaCatalogo : Volver a Catálogo
@enduml
```

---

### 3.3 Diseño de Datos

#### 3.3.1 Diseño de Datos Lógico (Diagrama ER / Clases Persistentes)

```plantuml
@startuml
skinparam linetype ortho

entity "ciudades" as Ciudades {
    * id_ciudad : SERIAL <<PK>>
    --
    * nombre_ciudad : VARCHAR(80) <<UNIQUE>>
    * departamento : VARCHAR(80)
}

entity "sucursales" as Sucursales {
    * id_sucursal : SERIAL <<PK>>
    --
    * id_ciudad : INTEGER <<FK>>
    * nombre_sucursal : VARCHAR(100)
    * direccion : TEXT
    * latitud : DECIMAL(10,8)
    * longitud : DECIMAL(11,8)
    * telefono : VARCHAR(20)
    * capacidad_probadores : INTEGER
    * estado : VARCHAR(20)
}

entity "usuarios" as Usuarios {
    * id_usuario : SERIAL <<PK>>
    --
    * id_sucursal : INTEGER <<FK, NULL>>
    * nombres : VARCHAR(100)
    * apellidos : VARCHAR(100)
    * email : VARCHAR(120) <<UNIQUE>>
    * password_hash : VARCHAR(100)
    * rol : VARCHAR(30)
    * estado_cuenta : VARCHAR(30)
    * intentos_fallidos : INTEGER
    * bloqueado_hasta : TIMESTAMP
    * ultimo_acceso : TIMESTAMP
}

entity "tokens_recuperacion" as TokensRecup {
    * id_token : SERIAL <<PK>>
    --
    * id_usuario : INTEGER <<FK>>
    * codigo_otp_hash : VARCHAR(100)
    * expiracion : TIMESTAMP
    * utilizado : BOOLEAN
    * intentos_verificacion : INTEGER
    * fecha_creacion : TIMESTAMP
}

entity "proveedores" as Proveedores {
    * id_proveedor : SERIAL <<PK>>
    --
    * nit_identificacion : VARCHAR(30) <<UNIQUE>>
    * razon_social : VARCHAR(150)
    * contacto_nombre : VARCHAR(100)
    * telefono : VARCHAR(30)
    * email : VARCHAR(100)
    * terminos_pago : VARCHAR(50)
}

entity "temporadas" as Temporadas {
    * id_temporada : SERIAL <<PK>>
    --
    * codigo_campana : VARCHAR(30) <<UNIQUE>>
    * nombre_temporada : VARCHAR(100)
    * fecha_inicio : DATE
    * fecha_fin : DATE
    * estado : VARCHAR(30)
}

entity "categorias" as Categorias {
    * id_categoria : SERIAL <<PK>>
    --
    * nombre_categoria : VARCHAR(80) <<UNIQUE>>
    * descripcion : TEXT
}

entity "marcas" as Marcas {
    * id_marca : SERIAL <<PK>>
    --
    * nombre_marca : VARCHAR(80) <<UNIQUE>>
}

entity "productos" as Productos {
    * id_producto : SERIAL <<PK>>
    --
    * id_categoria : INTEGER <<FK>>
    * id_marca : INTEGER <<FK>>
    * id_temporada : INTEGER <<FK>>
    * id_proveedor : INTEGER <<FK>>
    * codigo_sku_base : VARCHAR(50) <<UNIQUE>>
    * nombre : VARCHAR(150)
    * descripcion : TEXT
    * precio_venta_base : DECIMAL(10,2)
    * genero : VARCHAR(20)
    * estado_publicacion : VARCHAR(30)
}

entity "producto_colores" as ProdColores {
    * id_prod_color : SERIAL <<PK>>
    --
    * id_producto : INTEGER <<FK>>
    * color_nombre : VARCHAR(50)
    * codigo_hex : VARCHAR(10)
}

entity "producto_tallas" as ProdTallas {
    * id_prod_talla : SERIAL <<PK>>
    --
    * id_producto : INTEGER <<FK>>
    * talla : VARCHAR(20)
}

entity "inventario" as Inventario {
    * id_inventario : SERIAL <<PK>>
    --
    * id_sucursal : INTEGER <<FK>>
    * id_producto : INTEGER <<FK>>
    * talla : VARCHAR(20)
    * color : VARCHAR(50)
    * stock_fisico : INTEGER
    * stock_reservado : INTEGER
    * stock_minimo : INTEGER
    * ultimo_costo_unitario : DECIMAL(10,2)
    * costo_promedio_ponderado : DECIMAL(10,2)
}

entity "kardex_movimientos" as Kardex {
    * id_kardex : SERIAL <<PK>>
    --
    * id_inventario : INTEGER <<FK>>
    * tipo_movimiento : VARCHAR(30)
    * cantidad : INTEGER
    * costo_unitario_mov : DECIMAL(10,2)
    * saldo_cantidad : INTEGER
    * saldo_cpp : DECIMAL(10,2)
    * fecha_movimiento : TIMESTAMP
}

' Relaciones
Ciudades ||--o{ Sucursales : posee
Sucursales ||--o{ Usuarios : emplea
Usuarios ||--o{ TokensRecup : genera_otps
Categorias ||--o{ Productos : clasifica
Marcas ||--o{ Productos : fabrica
Temporadas ||--o{ Productos : calendariza
Proveedores ||--o{ Productos : suministra

Productos ||--o{ ProdColores : variantes_color
Productos ||--o{ ProdTallas : variantes_talla

Sucursales ||--o{ Inventario : almacena
Productos ||--o{ Inventario : controla_stock
Inventario ||--o{ Kardex : registra_movimiento
@enduml
```

---

#### 3.3.2 Mapeo Objeto-Relacional

| Concepto de Dominio / Objeto | Estrategia de Mapeo a PostgreSQL | Justificación Técnica de Diseño |
|:---|:---|:---|
| **Colores Multivaluados** | Tabla relacional normalizada `producto_colores` con FK a `productos` (1 a N). | Permite búsquedas indexadas de alta velocidad por código HEX exacto sin sobrecargar campos JSON planos. |
| **Tallas Disponibles** | Tabla relacional normalizada `producto_tallas` con FK a `productos` (1 a N). | Normalización en 3ra Forma Normal (3FN), facilitando integridad referencial en el inventario. |
| **Costo Promedio ($CPP$)** | Campo `DECIMAL(10,2)` en tabla `inventario` recalculado vía transacción atómica. | Precisión aritmética exacta requerida para auditorías impositivas en Bolivia (evita imprecisiones de `FLOAT`). |
| **Contraseñas** | Campo `VARCHAR(100)` almacenando la cadena hash generada con `bcrypt`. | Cumplimiento estricto del RNF01 de seguridad; garantiza que nunca se persista texto en claro. |
| **Tokens OTP de Recuperación** | Tabla `tokens_recuperacion` con hash del código de 6 dígitos y timestamp `expiracion`. | Expiración estricta de 15 minutos; el código OTP nunca se persiste en texto plano en BD. |

---

#### 3.3.3 Diseño de Datos Físico (Script DDL SQL en PostgreSQL)

```sql
-- ============================================================================
-- SCRIPT DDL: BASE DE DATOS FASHIONSTORE (CICLO 1: FUNDAMENTOS Y MÓDULOS BASE)
-- Motor: PostgreSQL 15+ | Esquema Normalizado 3FN
-- ============================================================================

CREATE TABLE ciudades (
    id_ciudad SERIAL PRIMARY KEY,
    nombre_ciudad VARCHAR(80) NOT NULL UNIQUE,
    departamento VARCHAR(80) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sucursales (
    id_sucursal SERIAL PRIMARY KEY,
    id_ciudad INTEGER NOT NULL REFERENCES ciudades(id_ciudad) ON DELETE RESTRICT,
    nombre_sucursal VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    telefono VARCHAR(20),
    capacidad_probadores INTEGER NOT NULL DEFAULT 4 CHECK (capacidad_probadores > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'OPERATIVA' CHECK (estado IN ('OPERATIVA', 'MANTENIMIENTO', 'CERRADA')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_sucursal INTEGER REFERENCES sucursales(id_sucursal) ON DELETE SET NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'ENCARGADO_SUCURSAL', 'CAJERO', 'LOGISTICA', 'CLIENTE', 'PROVEEDOR')),
    estado_cuenta VARCHAR(30) NOT NULL DEFAULT 'ACTIVO' CHECK (estado_cuenta IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO_POR_INTENTOS')),
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para tokens de recuperación de contraseña con código OTP temporal (CU03)
CREATE TABLE tokens_recuperacion (
    id_token SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    codigo_otp_hash VARCHAR(100) NOT NULL,
    expiracion TIMESTAMP NOT NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    intentos_verificacion INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bitacora_accesos (
    id_bitacora SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    ip_origen VARCHAR(45) NOT NULL,
    user_agent TEXT,
    exitoso BOOLEAN NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nit_identificacion VARCHAR(30) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(30),
    email VARCHAR(100),
    terminos_pago VARCHAR(50) DEFAULT 'CONTADO',
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temporadas (
    id_temporada SERIAL PRIMARY KEY,
    codigo_campana VARCHAR(30) NOT NULL UNIQUE,
    nombre_temporada VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descuento_liquidacion DECIMAL(5,2) DEFAULT 0.00,
    estado VARCHAR(30) DEFAULT 'VIGENTE' CHECK (estado IN ('PLANIFICADA', 'VIGENTE', 'LIQUIDACION', 'FINALIZADA')),
    CONSTRAINT chk_fechas_temporada CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE marcas (
    id_marca SERIAL PRIMARY KEY,
    nombre_marca VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    id_marca INTEGER NOT NULL REFERENCES marcas(id_marca) ON DELETE RESTRICT,
    id_temporada INTEGER REFERENCES temporadas(id_temporada) ON DELETE SET NULL,
    id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
    codigo_sku_base VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_venta_base DECIMAL(10, 2) NOT NULL CHECK (precio_venta_base > 0),
    genero VARCHAR(20) NOT NULL DEFAULT 'MASCULINO',
    estado_publicacion VARCHAR(30) DEFAULT 'PUBLICADO' CHECK (estado_publicacion IN ('BORRADOR', 'PUBLICADO', 'DESCATALOGADO')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto_colores (
    id_prod_color SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    color_nombre VARCHAR(50) NOT NULL,
    codigo_hex VARCHAR(10) NOT NULL,
    CONSTRAINT uq_producto_color UNIQUE (id_producto, color_nombre)
);

CREATE TABLE producto_tallas (
    id_prod_talla SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    talla VARCHAR(20) NOT NULL,
    CONSTRAINT uq_producto_talla UNIQUE (id_producto, talla)
);

CREATE TABLE inventario (
    id_inventario SERIAL PRIMARY KEY,
    id_sucursal INTEGER NOT NULL REFERENCES sucursales(id_sucursal) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    talla VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock_fisico INTEGER NOT NULL DEFAULT 0 CHECK (stock_fisico >= 0),
    stock_reservado INTEGER NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    stock_maximo INTEGER NOT NULL DEFAULT 100 CHECK (stock_maximo >= stock_minimo),
    ultimo_costo_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    costo_promedio_ponderado DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT uq_inventario_variante UNIQUE (id_sucursal, id_producto, talla, color),
    CONSTRAINT chk_stock_valido CHECK (stock_fisico >= stock_reservado)
);

CREATE TABLE kardex_movimientos (
    id_kardex SERIAL PRIMARY KEY,
    id_inventario INTEGER NOT NULL REFERENCES inventario(id_inventario) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(30) NOT NULL CHECK (tipo_movimiento IN ('COMPRA', 'VENTA', 'RESERVA', 'AJUSTE_MERMA', 'TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA')),
    cantidad INTEGER NOT NULL,
    costo_unitario_mov DECIMAL(10, 2) NOT NULL,
    saldo_cantidad INTEGER NOT NULL,
    saldo_cpp DECIMAL(10, 2) NOT NULL,
    descripcion_motivo VARCHAR(200),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de alto rendimiento para búsquedas omnicanales
CREATE INDEX idx_productos_sku ON productos(codigo_sku_base);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_inventario_sucursal ON inventario(id_sucursal, id_producto);
CREATE INDEX idx_inventario_stock_disp ON inventario((stock_fisico - stock_reservado));
```

---

#### 3.3.4 Población de Datos (Script DML SQL en PostgreSQL)

```sql
-- ============================================================================
-- SCRIPT DML: POBLACIÓN DE DATOS SEMILLA PARA EL CICLO 1
-- Incluye Ciudades de Bolivia, Sucursales, Usuarios con BCrypt, Ropa Masculina,
-- Colores Multivaluados, Tallas e Inventario con Costo Promedio Ponderado
-- ============================================================================

-- 1. Ciudades
INSERT INTO ciudades (nombre_ciudad, departamento) VALUES
('Santa Cruz de la Sierra', 'Santa Cruz'),
('La Paz', 'La Paz'),
('Cochabamba', 'Cochabamba');

-- 2. Sucursales
INSERT INTO sucursales (id_ciudad, nombre_sucursal, direccion, latitud, longitud, telefono, capacidad_probadores) VALUES
(1, 'Sucursal Equipetrol', 'Av. San Martín #450, entre 3er y 4to anillo', -17.76823000, -63.18342000, '3-3445566', 6),
(1, 'Sucursal Centro', 'Calle 21 de Mayo esq. Ayacucho', -17.78312000, -63.18210000, '3-3332211', 4),
(2, 'Sucursal Calacoto', 'Av. Ballivián #1200, Calle 18', -16.53982000, -68.08921000, '2-2778899', 5),
(3, 'Sucursal El Prado', 'Av. Ballivián #600, El Prado', -17.38921000, -66.15672000, '4-4223344', 4);

-- 3. Usuarios del Sistema (Contraseña hash: 'Admin123*' cifrada con bcrypt)
-- Hash generado: $2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu
INSERT INTO usuarios (id_sucursal, nombres, apellidos, email, password_hash, rol, estado_cuenta, intentos_fallidos) VALUES
(NULL, 'Alberto', 'Delgado', 'alberto.delgado@store.bo', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'ADMINISTRADOR', 'ACTIVO', 0),
(NULL, 'Andy', 'Mujica', 'andy.mujica@store.bo', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'ADMINISTRADOR', 'ACTIVO', 0),
(1, 'Carlos', 'Morales', 'carlos.morales@store.bo', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'ENCARGADO_SUCURSAL', 'ACTIVO', 0),
(1, 'Javier', 'Roca', 'javier.roca@store.bo', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'CAJERO', 'BLOQUEADO_POR_INTENTOS', 5),
(NULL, 'Mateo', 'Suarez', 'mateo.logistica@store.bo', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'LOGISTICA', 'ACTIVO', 0),
(NULL, 'Rodrigo', 'Paz', 'rodrigo.cliente@gmail.com', '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', 'CLIENTE', 'ACTIVO', 0);

-- Semilla de tokens de recuperación OTP (CU03)
INSERT INTO tokens_recuperacion (id_usuario, codigo_otp_hash, expiracion, utilizado, intentos_verificacion) VALUES
(6, '$2b$12$e8Y4vFz7BvK8/9zD6x1Q4uS0.1234567890abcdefghijklmnopqrstu', CURRENT_TIMESTAMP + INTERVAL '15 MINUTE', FALSE, 0);

-- 4. Proveedores Textiles
INSERT INTO proveedores (nit_identificacion, razon_social, contacto_nombre, telefono, email, terminos_pago) VALUES
('1028392019', 'Confecciones Andina SA', 'Juan Paredes', '+591 70012345', 'ventas@andina.com.bo', 'CREDITO_30_DIAS'),
('9038472011', 'Hilanderías del Sur SRL', 'Marcos Vaca', '+591 71098765', 'contacto@hilasur.bo', 'CONTADO'),
('3829104018', 'Importadora Textil Italiana', 'Gianluca Rossi', '+591 72055443', 'grossi@textilitaliana.com', 'CREDITO_60_DIAS');

-- 5. Temporadas Comerciales
INSERT INTO temporadas (codigo_campana, nombre_temporada, fecha_inicio, fecha_fin, descuento_liquidacion, estado) VALUES
('SS-2026', 'Primavera - Verano 2026', '2026-08-01', '2027-01-31', 0.00, 'VIGENTE'),
('FW-2026', 'Otoño - Invierno 2026', '2026-02-01', '2026-07-31', 25.00, 'LIQUIDACION');

-- 6. Categorías y Marcas
INSERT INTO categorias (nombre_categoria, descripcion) VALUES
('Camisas Formales', 'Camisas ejecutivas y de vestir en algodón peinado y lino'),
('Pantalones Casuales', 'Pantalones estilo chino, gabardina y corte clásico'),
('Trajes y Blazers', 'Sacos, chaquetas y trajes de dos piezas en lana fría'),
('Calzado Ejecutivo', 'Zapatos Oxford, Derby y mocasines de cuero legítimo');

INSERT INTO marcas (nombre_marca) VALUES
('Oxford Heritage'),
('Urban Tailor'),
('Sartorial Milano'),
('Bocaccio Leather');

-- 7. Productos (Prendas Masculinas)
INSERT INTO productos (id_categoria, id_marca, id_temporada, id_proveedor, codigo_sku_base, nombre, descripcion, precio_venta_base, genero) VALUES
(1, 1, 1, 1, 'SHIRT-SLIM-001', 'Camisa Oxford Slim Fit', 'Camisa de corte entallado en 100% algodón egipcio, cuello italiano', 280.00, 'MASCULINO'),
(2, 2, 1, 2, 'PANT-CHINO-002', 'Pantalón Chino Gabardina', 'Pantalón casual de gabardina elastizada con bolsillos traseros ojales', 320.00, 'MASCULINO'),
(3, 3, 1, 3, 'BLAZ-LINO-003', 'Blazer de Lino Casual', 'Chaqueta ligera desestructurada de lino ideal para clima templado y cálido', 650.00, 'MASCULINO');

-- 8. Colores Multivaluados
INSERT INTO producto_colores (id_producto, color_nombre, codigo_hex) VALUES
(1, 'Azul Marino', '#000080'),
(1, 'Blanco Óptico', '#FFFFFF'),
(1, 'Celeste Cielo', '#87CEEB'),
(2, 'Beige Arena', '#F5F5DC'),
(2, 'Azul Noche', '#191970'),
(2, 'Verde Oliva', '#556B2F'),
(3, 'Azul Cobalto', '#0047AB'),
(3, 'Gris Plomo', '#708090');

-- 9. Tallas Normalizadas
INSERT INTO producto_tallas (id_producto, talla) VALUES
(1, 'S'), (1, 'M'), (1, 'L'), (1, 'XL'),
(2, '30'), (2, '32'), (2, '34'), (2, '36'),
(3, '38'), (3, '40'), (3, '42');

-- 10. Inventario con Costo Unitario y Costo Promedio Ponderado (CPP)
-- Ejemplo real demostrativo:
-- Camisa Oxford Slim Fit (Talla M, Azul Marino) en Sucursal Equipetrol:
-- Lote 1: 15 unidades a 90 Bs = 1350 Bs
-- Lote 2: 20 unidades a 120 Bs = 2400 Bs
-- Total unidades: 35 | Costo Total: 3750 Bs | CPP = 3750 / 35 = 107.14 Bs | Último Costo = 120.00 Bs
INSERT INTO inventario (id_sucursal, id_producto, talla, color, stock_fisico, stock_reservado, stock_minimo, stock_maximo, ultimo_costo_unitario, costo_promedio_ponderado) VALUES
(1, 1, 'M', 'Azul Marino', 35, 5, 10, 100, 120.00, 107.14),
(1, 1, 'L', 'Blanco Óptico', 25, 0, 5, 80, 110.00, 110.00),
(1, 2, '32', 'Beige Arena', 20, 2, 5, 60, 140.00, 135.00),
(2, 1, 'M', 'Azul Marino', 15, 0, 5, 50, 115.00, 115.00),
(3, 3, '40', 'Gris Plomo', 8, 1, 2, 30, 320.00, 310.00);

-- 11. Asientos de Kardex Inicial
INSERT INTO kardex_movimientos (id_inventario, tipo_movimiento, cantidad, costo_unitario_mov, saldo_cantidad, saldo_cpp, descripcion_motivo) VALUES
(1, 'COMPRA', 15, 90.00, 15, 90.00, 'Ingreso Lote Inicial Fac-101'),
(1, 'COMPRA', 20, 120.00, 35, 107.14, 'Ingreso Segundo Lote Fac-205 - Recálculo CPP');
```

---

## 4. Flujo de Trabajo: Implementación

### 4.1 Selección de la Plataforma de Software

Conforme al requerimiento del enunciado y las notas de clase, se selecciona el siguiente stack tecnológico de alta eficiencia:
- **Backend**: **Python 3.11+ con FastAPI**. Permite arquitectura asíncrona no bloqueante (ASGI), serialización tipada y validación con Pydantic, e inyección nativa de dependencias. Expone la documentación automática OpenAPI en `/docs`.
- **Frontend Web**: **Angular 17+**. Basado en TypeScript, componentes reactivos, inyección de dependencias y modularidad estricta para la SPA administrativa y el catálogo web.
- **Aplicación Móvil**: **Flutter 3.x con Dart**. Compilación nativa para Android e iOS desde un solo repositorio, con soporte para ARCore y sensores de cámara.
- **Base de Datos**: **PostgreSQL 15+**. Motor relacional con integridad transaccional ACID, índices B-Tree y soporte geoespacial.
- **Contenedores**: **Docker & Docker Compose** para aislamiento de entornos y despliegue continuo en la nube (Render / Railway).

---

### 4.2 Implementación de la Arquitectura del Sistema Principal

La arquitectura del sistema backend sigue el patrón de **Arquitectura Limpia / Modular por Paquetes**:

```
fashionstore-backend/
├── app/
│   ├── core/                  # Configuraciones globales, seguridad JWT, base de datos
│   │   ├── config.py          # Variables de entorno (Pydantic Settings)
│   │   ├── security.py        # Hashing bcrypt y generación/validación JWT
│   │   └── database.py        # Sesión async SQLAlchemy y pool de conexiones
│   ├── modules/               # Módulos desacoplados del sistema
│   │   ├── auth/              # M01: Autenticación, Registro y Recuperación OTP (CU01, CU02, CU03)
│   │   ├── usuarios/          # M01: Gestión de Usuarios y Roles RBAC (CU04)
│   │   ├── sucursales/        # M02: Sucursales y Ciudades (CU05)
│   │   ├── productos/         # M03: Productos, Tallas y Colores (CU06)
│   │   ├── temporadas/        # M04: Temporadas y Colecciones (CU07)
│   │   ├── proveedores/       # M05: Proveedores Textiles (CU08)
│   │   ├── inventario/        # M06: Control Multi-Sucursal y Algoritmo CPP (CU09)
│   │   └── catalogo/          # M07: Catálogo y Disponibilidad por Tienda (CU10)
│   └── main.py                # Punto de entrada ASGI, middlewares CORS y montaje de routers
├── migrations/                # Control de versiones de base de datos con Alembic
├── docker-compose.yml         # Orquestación de contenedores locales
└── Dockerfile                 # Imagen de despliegue productivo para nube
```

---

### 4.3 Implementación de la Arquitectura del Sub Sistema

A continuación se exhibe la implementación del núcleo de lógica de negocio para los dos subsistemas críticos del Ciclo 1:

#### 4.3.1 Sub Sistema de Seguridad: Recuperación de Contraseña con OTP y Bloqueo Preventivo (M01 - CU01 y CU03)

```python
# app/modules/auth/service.py
import secrets
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import SolicitarOtpRequest, ResetPasswordOtpRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = AuthRepository(db)

    async def registrar_intento_fallido(self, email: str) -> None:
        """Incrementa fallos y bloquea automáticamente al 5to intento erróneo"""
        user = await self.repo.obtener_por_email(email)
        if user:
            user.intentos_fallidos += 1
            if user.intentos_fallidos >= 5:
                user.estado_cuenta = "BLOQUEADO_POR_INTENTOS"
                user.bloqueado_hasta = datetime.now(timezone.utc) + timedelta(minutes=30)
            await self.repo.commit()

    async def solicitar_otp_recuperacion(self, request: SolicitarOtpRequest) -> dict:
        """Genera un código criptográfico de 6 dígitos con ventana de validez de 15 minutos"""
        user = await self.repo.obtener_por_email(request.email)
        # Mitigación OWASP: Siempre devolver respuesta exitosa sin filtrar existencia
        if user and user.estado_cuenta != "INACTIVO":
            # Generación criptográficamente segura de 6 dígitos numéricos
            codigo_otp = f"{secrets.randbelow(900000) + 100000}"
            otp_hash = pwd_context.hash(codigo_otp)
            expiracion = datetime.now(timezone.utc) + timedelta(minutes=15)
            
            await self.repo.guardar_token_otp(
                usuario_id=user.id_usuario,
                otp_hash=otp_hash,
                expiracion=expiracion
            )
            # Despachar correo asíncrono con el código OTP
            await self.repo.enviar_email_otp(user.email, codigo_otp, minutos=15)

        return {"mensaje": "Si el correo está registrado, se ha enviado un código de verificación de 6 dígitos."}

    async def restablecer_password_con_otp(self, request: ResetPasswordOtpRequest) -> dict:
        """Valida el OTP de 6 dígitos, actualiza el hash bcrypt y desbloquea la cuenta"""
        user = await self.repo.obtener_por_email(request.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solicitud inválida.")

        token_record = await self.repo.obtener_ultimo_token_otp(user.id_usuario)
        now = datetime.now(timezone.utc)

        if not token_record or token_record.utilizado or token_record.expiracion < now:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El código OTP ha expirado o es inválido.")

        if token_record.intentos_verificacion >= 3:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código bloqueado por superar 3 intentos.")

        if not pwd_context.verify(request.codigo_otp, token_record.codigo_otp_hash):
            token_record.intentos_verificacion += 1
            await self.repo.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código OTP incorrecto.")

        # Cifrar nueva contraseña con Bcrypt (cost factor 12)
        user.password_hash = pwd_context.hash(request.nueva_password)
        user.intentos_fallidos = 0
        user.bloqueado_hasta = None
        user.estado_cuenta = "ACTIVO"
        token_record.utilizado = True

        await self.repo.commit()
        return {"mensaje": "Contraseña restablecida exitosamente. Ya puede iniciar sesión."}
```

#### 4.3.2 Sub Sistema de Inventario y Valuación: Cálculo Matemático de CPP (M06 - CU09)

```python
# app/modules/inventario/service.py
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.inventario.repository import InventarioRepository
from app.modules.inventario.schemas import EntradaLoteCreate, KardexResponse

class InventarioService:
    def __init__(self, db_session: AsyncSession):
        self.repo = InventarioRepository(db_session)

    async def registrar_entrada_lote(self, entrada: EntradaLoteCreate) -> KardexResponse:
        """
        Registra la recepción de un lote de prendas por compra a proveedor,
        almacena el último costo unitario y recalcula matemáticamente
        el Costo Promedio Ponderado (CPP) según la directriz de clase (B4.txt).
        """
        # 1. Recuperar registro actual de existencias de la variante en la sucursal
        item_inv = await self.repo.obtener_por_variante(
            sucursal_id=entrada.id_sucursal,
            producto_id=entrada.id_producto,
            talla=entrada.talla,
            color=entrada.color
        )

        costo_lote = Decimal(str(entrada.costo_unitario_compra))
        cant_lote = entrada.cantidad_recibida

        if item_inv:
            stock_anterior = item_inv.stock_fisico
            cpp_anterior = Decimal(str(item_inv.costo_promedio_ponderado))

            # Fórmula formal de Costo Promedio Ponderado:
            # CPP = (Stock_ant * CPP_ant + Cant_lote * Costo_lote) / (Stock_ant + Cant_lote)
            inversion_anterior = stock_anterior * cpp_anterior
            inversion_nueva = cant_lote * costo_lote
            nuevo_stock_total = stock_anterior + cant_lote
            
            nuevo_cpp = (inversion_anterior + inversion_nueva) / Decimal(str(nuevo_stock_total))
            nuevo_cpp = round(nuevo_cpp, 2)

            # Actualizar entidad de inventario
            item_inv.stock_fisico = nuevo_stock_total
            item_inv.ultimo_costo_unitario = costo_lote
            item_inv.costo_promedio_ponderado = nuevo_cpp
        else:
            # Primer ingreso de la variante en la sucursal
            nuevo_stock_total = cant_lote
            nuevo_cpp = round(costo_lote, 2)
            item_inv = await self.repo.crear_registro_inventario(
                sucursal_id=entrada.id_sucursal,
                producto_id=entrada.id_producto,
                talla=entrada.talla,
                color=entrada.color,
                stock_inicial=cant_lote,
                costo_unitario=costo_lote,
                cpp=nuevo_cpp
            )

        # 2. Asentar movimiento en el Kardex inmutable
        asiento = await self.repo.crear_movimiento_kardex(
            id_inventario=item_inv.id_inventario,
            tipo_movimiento="COMPRA",
            cantidad=cant_lote,
            costo_unitario=costo_lote,
            saldo_cantidad=nuevo_stock_total,
            saldo_cpp=nuevo_cpp,
            motivo=f"Recepción compra Factura: {entrada.numero_factura}"
        )

        await self.repo.commit()
        return KardexResponse.from_orm(asiento)
```

---

## 5. Flujo de Trabajo: Pruebas

### 5.1 Pruebas de Casos de Uso (Pruebas de Caja Negra)

Se documentan las pruebas formales de caja negra realizadas sobre los 10 Casos de Uso del Ciclo 1 para validar exhaustivamente las condiciones de aceptación funcionales y de seguridad:

| ID Prueba | Caso de Uso | Escenario Evaluado | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|:---:|:---|:---|:---|:---|:---|:---:|
| **TC01** | CU01: Login RBAC | Autenticación válida de Administrador | Email: `alberto.delgado@store.bo`<br>Clave: `Admin123*` | Token JWT emitido con claims de rol `ADMINISTRADOR`, HTTP 200, redirección a `/dashboard`. | Token generado correctamente, perfil cargado con permisos completos. | **PASÓ** |
| **TC02** | CU01: Login RBAC | Bloqueo preventivo tras 5 intentos fallidos | Email: `rodrigo.cliente@gmail.com`<br>Clave errónea x5 | HTTP 401 en intentos 1-4; en 5to intento cuenta pasa a `BLOQUEADO_POR_INTENTOS` por 30 min. | Cuenta bloqueada preventivamente, registro en auditoría de seguridad. | **PASÓ** |
| **TC03** | CU02: Auto-registro | Alta autoservicio de cliente con clave segura | Email: `nuevo.cliente@gmail.com`<br>Clave: `Fashion2026*`<br>Nombre: Carlos | Usuario persistido con rol `CLIENTE`, hash Bcrypt almacenado, auto-login con token JWT. | Cuenta creada, password cifrado en BD (cost factor 12), sesión iniciada. | **PASÓ** |
| **TC04** | CU03: Recuperación OTP | Restablecimiento de clave con código OTP de 6 dígitos | Email registrado + OTP correcto dentro de 15 min | Contraseña actualizada con nuevo hash bcrypt, token OTP invalidado, cuenta desbloqueada. | Token validado, clave cambiada exitosamente, login posterior verificado. | **PASÓ** |
| **TC05** | CU04: Usuarios y Roles | Desbloqueo administrativo de cuenta bloqueada | Admin presiona *"Desbloquear"* sobre usuario con 5 fallos | `estado_cuenta = 'ACTIVO'`, `intentos_fallidos = 0`, `bloqueado_hasta = NULL`. | Cuenta habilitada inmediatamente, cajero logra iniciar sesión sin trabas. | **PASÓ** |
| **TC06** | CU05: Sucursales | Alta de sucursal con coordenadas GPS válidas | Ciudad: Santa Cruz<br>Nombre: `Sucursal Equipetrol`<br>Lat: `-17.76823`, Lon: `-63.18342` | Sucursal creada, HTTP 201, visualizada en mapa georreferenciado con 6 probadores. | Registro persistido en BD con capacidad operativa confirmada. | **PASÓ** |
| **TC07** | CU06: Productos | Alta de prenda con tallas y colores multivaluados | SKU: `SHIRT-SLIM-001`<br>Tallas: `[S, M, L]`<br>Colores: `[#000080, #FFFFFF]` | Prenda registrada, tablas normalizadas `producto_colores` y `producto_tallas` pobladas. | Registro normalizado en 3FN verificado en PostgreSQL. | **PASÓ** |
| **TC08** | CU07: Temporadas | Calendarización y activación de campaña estacional | Código: `SS-2026`<br>Fechas: `2026-08-01` a `2027-01-31`<br>Estado: `VIGENTE` | Temporada creada, prendas asociadas a la campaña Primavera-Verano 2026. | Campaña vigente visible en catálogo y promociones. | **PASÓ** |
| **TC09** | CU08: Proveedores | Validación de unicidad de NIT tributario de proveedor | NIT: `1028392019` (existente) | HTTP 400 Bad Request: *"El NIT ingresado ya se encuentra registrado"*. | Restricción de unicidad capturada, formulario previene duplicados. | **PASÓ** |
| **TC10** | CU09: Inventario CPP | Recálculo matemático de Costo Promedio Ponderado | Stock prev: 15 uds @ 90 Bs<br>Entrada: 20 uds @ 120 Bs | Nuevo Stock = 35 uds<br>Último Costo = 120.00 Bs<br>Nuevo CPP = 107.14 Bs | Cálculo exacto verificado: `(1350 + 2400)/35 = 107.1428 -> 107.14 Bs`. | **PASÓ** |
| **TC11** | CU10: Catálogo | Consulta de disponibilidad por sucursal física | Prenda: Camisa Oxford M Azul<br>Sucursal: Equipetrol | Muestra: *"35 unidades físicas, 5 reservadas, 30 disponibles para prueba o venta"*. | Stock en tiempo real concordante entre tienda digital y almacén físico. | **PASÓ** |

---

### 5.2 Historias de Usuario (H.U.) del Ciclo 1

Para homologar la entrega con metodologías ágiles requeridas en el marco académico, se formulan las 10 Historias de Usuario correspondientes a los 10 Casos de Uso del Ciclo 1 con sus criterios de aceptación en sintaxis formal **Gherkin**:

#### HU01: Autenticación Segura y Control RBAC (CU01)
- **Como** usuario del sistema (Administrador, Empleado o Cliente),
- **Quiero** iniciar sesión introduciendo mi correo electrónico y contraseña cifrada,
- **Para** acceder de forma segura a las funciones correspondientes a mi perfil.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que el usuario ingresa sus credenciales válidas en la pantalla de login,
  * **Cuando** presiona el botón "Iniciar Sesión",
  * **Entonces** el sistema valida el hash bcrypt, devuelve un token JWT y redirige al panel autorizado.
  * **Dado** que un usuario ingresa una contraseña errónea por 5 veces consecutivas,
  * **Cuando** se procesa el quinto intento fallido,
  * **Entonces** el sistema bloquea preventivamente la cuenta por 30 minutos y registra la alerta en la bitácora.

#### HU02: Auto-registro de Clientes y Verificación de Cuenta (CU02)
- **Como** visitante no registrado de la tienda web o app móvil,
- **Quiero** crear mi cuenta proporcionando mis datos personales y una contraseña segura,
- **Para** acceder a los probadores virtuales de Realidad Aumentada, reservar prendas y comprar en línea.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que un visitante completa el formulario con correo único y contraseña de al menos 8 caracteres con números y mayúsculas,
  * **Cuando** presiona el botón "Crear Mi Cuenta FashionStore",
  * **Entonces** el sistema cifra la clave con bcrypt (factor 12), crea el registro con rol `CLIENTE`, genera el token de sesión e inicia sesión automáticamente.
  * **Dado** que el correo ingresado ya pertenece a un usuario registrado,
  * **Cuando** se intenta procesar el registro,
  * **Entonces** el sistema rechaza la solicitud indicando que el correo ya existe y ofrece enlace directo al login o recuperación.

#### HU03: Recuperación Autoservicio de Contraseña por Código OTP (CU03)
- **Como** usuario que olvidó su contraseña de acceso a FashionStore,
- **Quiero** solicitar un código OTP a mi correo y usarlo para definir una nueva contraseña,
- **Para** recuperar el acceso a mi cuenta de manera autónoma sin intervención manual de soporte técnico.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que el usuario ingresa su correo en la vista de "¿Olvidaste tu contraseña?",
  * **Cuando** presiona "Enviar Código de Recuperación",
  * **Entonces** el sistema genera un código numérico criptográfico de 6 dígitos válido por 15 minutos y lo despacha por correo electrónico.
  * **Dado** que el usuario ingresa el código OTP correcto y su nueva contraseña antes de cumplirse los 15 minutos,
  * **Cuando** presiona "Restablecer Contraseña Ahora",
  * **Entonces** el sistema valida el código, actualiza el hash bcrypt, desbloquea la cuenta si estaba bloqueada y notifica el éxito de la operación.

#### HU04: Gestión de Usuarios, Asignación de Roles y Desbloqueo (CU04)
- **Como** Administrador General del sistema,
- **Quiero** dar de alta personal interno, asignar roles y sucursales, y desbloquear cuentas bloqueadas,
- **Para** asegurar la correcta operación del personal en tiendas y puntos de venta.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que el Administrador accede al panel de "Usuarios y Roles",
  * **Cuando** crea un empleado asignándole el rol `CAJERO` y la sucursal `Calacoto`,
  * **Entonces** el sistema persiste el usuario vinculado y le otorga exclusivamente permisos de cobro en POS.
  * **Dado** que una cuenta se encuentra con estado `BLOQUEADO_POR_INTENTOS`,
  * **Cuando** el Administrador presiona el botón "Desbloquear",
  * **Entonces** el sistema restablece el contador de fallos a 0 y reactiva la cuenta inmediatamente.

#### HU05: Gestión y Geolocalización de Ciudades y Sucursales (CU05)
- **Como** Administrador General,
- **Quiero** registrar y parametrizar sucursales físicas con sus coordenadas GPS y capacidad de probadores,
- **Para** que los clientes puedan geolocalizar tiendas y agendar reservas de probadores.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que el Administrador ingresa el nombre, dirección, coordenadas latitud/longitud y número de probadores,
  * **Cuando** presiona "Guardar Sucursal",
  * **Entonces** el sistema almacena la sucursal y la despliega georreferenciada en el mapa del catálogo.

#### HU06: Administración de Productos y Atributos de Moda Masculina (CU06)
- **Como** Administrador de Catálogo,
- **Quiero** registrar prendas masculinas especificando tallas normalizadas y colores multivaluados con código Hex,
- **Para** ofrecer fichas técnicas detalladas que faciliten la búsqueda y la experiencia de compra.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que se registra una camisa con tallas `[S, M, L]` y colores `#000080` (Azul) y `#FFFFFF` (Blanco),
  * **Cuando** se guarda el producto,
  * **Entonces** el sistema genera variantes normalizadas indexadas listas para la consulta de existencias.

#### HU07: Gestión de Temporadas y Campañas Comerciales (CU07)
- **Como** Administrador de Ventas,
- **Quiero** calendarizar temporadas comerciales y activar descuentos de liquidación,
- **Para** sincronizar la oferta de prendas con el calendario de la moda y liquidar sobrestocks.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que concluye la temporada Invierno,
  * **Cuando** el Administrador cambia el estado a `LIQUIDACION` y define 25% de descuento,
  * **Entonces** el sistema aplica automáticamente la rebaja a todas las prendas vinculadas a la colección.

#### HU08: Gestión de Proveedores Textiles y Términos Comerciales (CU08)
- **Como** Encargado de Adquisiciones,
- **Quiero** administrar el padrón de empresas proveedoras textiles con su NIT y términos de pago,
- **Para** formalizar órdenes de compra y mantener trazabilidad del abastecimiento de mercadería.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que se registra un nuevo proveedor con un NIT que ya existe en la base de datos,
  * **Cuando** se presiona "Guardar Proveedor",
  * **Entonces** el sistema impide el registro duplicado y emite alerta de validación tributaria.

#### HU09: Recálculo de Costo Promedio Ponderado en Entradas de Inventario (CU09)
- **Como** Encargado de Logística de Almacén,
- **Quiero** registrar la entrada de lotes de prendas capturando su costo unitario de compra,
- **Para** que el sistema actualice el stock físico y calcule matemáticamente el Costo Promedio Ponderado ($CPP$).
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que existen 15 prendas en stock con un CPP previo de 90.00 Bs,
  * **Cuando** ingresa una compra de 20 prendas adicionales a un costo unitario de 120.00 Bs,
  * **Entonces** el sistema calcula el nuevo CPP en 107.14 Bs, registra el último costo en 120.00 Bs y genera el asiento inmutable en el Kardex.

#### HU10: Consulta Omnicanal de Disponibilidad de Stock por Sucursal (CU10)
- **Como** cliente interesado en adquirir prendas masculinas,
- **Quiero** filtrar el catálogo por talla, color y sucursal y conocer cuántas unidades hay en cada tienda física,
- **Para** decidir si acudir a una sucursal cercana a probarme la prenda o realizar la compra digital directa.
- **Criterios de Aceptación (Gherkin):**
  * **Dado** que un cliente consulta una Camisa Oxford en talla M y color Azul,
  * **Cuando** selecciona la opción "Ver Disponibilidad por Sucursal",
  * **Entonces** el sistema muestra el stock disponible en tiempo real desglosado para las tiendas de Equipetrol, Calacoto y El Prado.
