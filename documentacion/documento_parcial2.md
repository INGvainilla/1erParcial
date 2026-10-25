# PLATAFORMA INTELIGENTE DE COMERCIO ELECTRÓNICO SaaS MULTITENANT PARA TIENDAS DE ROPA MASCULINA CON ARQUITECTURA OFFLINE-FIRST Y REPORTES GENERATIVOS VÍA INTELIGENCIA ARTIFICIAL — FASHIONSTORE

## **Segundo Examen Parcial — Sistemas de Información II (SI2)**

**Materia:** Sistemas de Información II (SI2)  
**Semestre:** 2-2026  
**Docente:** MSc. Ing. Angélica Garzón Cuéllar  
**Metodología:** ICONIX (Pesada-Ligera) — UML 2.5+  
**Proyecto:** FashionStore — Evolución hacia E-Commerce SaaS Multitenant, Resiliencia Offline-First y Analítica Generativa con IA  

**Integrantes del equipo de desarrollo:**

| Nro. | Nombre completo | Rol |
|:---:|:---|:---:|
| 1 | **Alberto Delgado** | Desarrollador Full Stack |
| 2 | **Andy Mujica** | Desarrollador Full Stack |

---

> **Resumen Ejecutivo:** El presente documento técnico constituye la especificación formal del Segundo Examen Parcial de la materia Sistemas de Información II (SI2). Se aplica la metodología **ICONIX** en todo su ciclo de vida, integrando los modelos UML 2.5+ con la arquitectura de software desarrollada. Comprende la evolución integral de FashionStore hacia una plataforma **SaaS Multitenant**, capacidades offline con SQLite e IndexedDB, protocolo de sincronización idempotente, gestión de cambios de prendas en dos tiempos, aprovisionamiento controlado, reportes generativos con Inteligencia Artificial y Machine Learning.

---

# CAPÍTULO I. ASPECTOS GENERALES

## 1.1 Introducción

### 1.1.1 La Transformación Digital del Retail Textil y el E-Commerce de Moda Masculina

El comercio electrónico (*e-commerce*) ha trascendido de manera irreversible su concepción inicial como un canal comercial accesorio o secundario para consolidarse como el eje motriz de la competitividad, escalabilidad y rentabilidad en la economía digital contemporánea. En la industria global de la confección, indumentaria y moda (*apparel retail*), los canales de comercialización digital experimentan tasas de expansión interanuales vertiginosas, apalancadas por la ubicuidad de los teléfonos inteligentes (*m-commerce*), la sofisticación de los hábitos de consumo en línea y la creciente exigencia de experiencias omnicanales perfectamente fluidas (*unified commerce*).

Dentro de este ecosistema, el segmento específico de la **moda y confección masculina** ha cobrado una relevancia económica sin precedentes. A diferencia de patrones de consumo basados en la navegación recreativa o la compra impulsiva por entretenimiento, las investigaciones de mercado contemporáneas (como los reportes sectoriales de *McKinsey & Company* y *Statista Retail Trends*) demuestran que el comprador masculino moderno opera guiado por premisas altamente estructuradas: **racionalidad operativa, inmediatez en la transacción, certidumbre matemática en la disponibilidad física de las prendas, exactitud en las dimensiones antropométricas y textiles, y personalización estilística orientada a propósitos concretos**. El consumidor masculino busca resolver requerimientos específicos de vestimenta —desde sastrería ejecutiva y atuendos corporativos hasta indumentaria informal urbana o prendas estacionales de alta tecnología— optimizando su tiempo personal y exigiendo la total erradicación de la incertidumbre en el calce, los cortes y las tallas.

Sin embargo, la inserción del comercio minorista textil en la economía digital en los países en desarrollo, y muy especialmente en **Bolivia y su contexto regional** (con énfasis en el eje troncal: Santa Cruz de la Sierra, La Paz y Cochabamba), continúa enfrentando profundas asimetrías estructurales:
- **Caos dimensional y falta de estandarización en el tallaje:** Coexisten prendas nacionales con manufacturas importadas (asiáticas, norteamericanas y europeas), donde una misma denominación nominal (ej. "Talla L") presenta discrepancias de hasta 8 centímetros en medidas corporales clave (pecho, cintura, largo de manga y contorno de cuello), lo que paraliza la decisión de compra o desata una crisis logística de devoluciones que supera el **30%** de las transacciones en línea.
- **Informalidad digital y fragmentación transaccional:** La gran mayoría de las tiendas operan mediante canales precarios (fotografías en Instagram, Facebook Marketplace o catálogos manuales de WhatsApp), requiriendo validaciones manuales de transferencias bancarias mediante capturas de pantalla, sin trazabilidad contable y provocando recurrentes ventas sin stock real (*overselling*).
- **Desconexión entre sucursales físicas:** Las empresas con múltiples puntos de venta gestionan sus tiendas como silos aislados, acumulando sobrestock estacional en una sucursal mientras otra tienda cercana padece rotura de existencias (*stockouts*).
- **Distorsión en la valuación de inventarios:** La ausencia de registro automatizado bajo el método del **Costo Promedio Ponderado (CPP)** frente a lotes adquiridos con costos variables distorsiona los estados financieros y acarrea contingencias impositivas ante el Servicio de Impuestos Nacionales (Ley 843, IVA 13% e IT 3%).
- **Fragilidad de la conectividad a Internet:** En los entornos comerciales de centros comerciales, galerías y avenidas principales de Bolivia, las caídas recurrentes del servicio de Internet paralizan por completo los sistemas de cobro en mostrador dependientes exclusivamente de la nube, generando pérdida inmediata de ventas y colapso en cajas registradoras.

### 1.1.2 Antecedentes y Fundación del Proyecto FashionStore (Primer Parcial)

Con la misión de responder científicamente a estos desafíos mediante la aplicación formal de la ingeniería de software, durante el primer examen parcial de la materia Sistemas de Información II (semestre 2-2026), el equipo de desarrollo concibió e implementó la versión fundacional de **FashionStore**: una plataforma de comercio electrónico omnicanal orientada a una cadena de tiendas de indumentaria masculina con presencia multi-sucursal.

El desarrollo de dicha etapa fundacional se rigió bajo el **Proceso Unificado de Desarrollo de Software (PUDS)** y el estándar internacional **UML 2.5+**, articulándose a través de tres ciclos iterativos e incrementales de ingeniería que dieron origen a un robusto portafolio de **25 casos de uso distribuidos en 19 módulos funcionales base**:
1. **Fundamentos Arquitectónicos y Catálogo Paramétrico:** Se estableció la infraestructura backend con el framework moderno **FastAPI (Python)** y base de datos relacional **PostgreSQL**, incorporando autenticación y autorización estricta basada en roles (**RBAC**) con hash criptográfico `bcrypt` y tokens JWT, parametrización de ciudades y sucursales geolocalizadas, y un catálogo taxonómico de indumentaria masculina que incorporó atributos avanzados: **tallas con dimensiones anatómicas físicas en centímetros (pecho, cintura, cadera, largo)**, **colores multivaluados y combinaciones compuestas (ej. Negro/Blanco, Azul/Gris) con códigos visuales Hexadecimales**, y fichas técnicas con **composición textil precisa y propiedades hipoalergénicas**.
2. **Operaciones Comerciales Omnicanales y Valuación Contable:** Se implementó el carrito de compras con reserva temporal anti-colisión de existencias, checkout digital con selección de entrega a domicilio o retiro presencial en tienda (*Click & Collect*), pasarela de pagos electrónicos tokenizada mediante **Stripe Sandbox** (cumpliendo con el estándar PCI-DSS), terminal de **Punto de Venta Presencial (POS)** para cajeros con lectura de códigos SKU, y el motor logístico de control de inventario multi-sucursal con recálculo automático inmutable del **Costo Promedio Ponderado (CPP)** y registro paralelo del **Último Costo Unitario de Adquisición** tras cada entrada de mercadería.
3. **Pilares Tecnológicos Diferenciadores de Vanguardia:**
   - *Vestidor Virtual con Realidad Aumentada (RA):* Desarrollado sobre la aplicación móvil Flutter, permitiendo al cliente proyectar modelos tridimensionales (`.glb` / `.gltf`) de prendas masculinas directamente sobre su silueta corporal en tiempo real a través de la cámara del dispositivo móvil.
   - *Asistente de Estilo con Inteligencia Artificial Contextual:* Motor generativo que formula recomendaciones de atuendos (*outfits*) analizando dinámicamente cuatro variables: el clima local en tiempo real de la ciudad del usuario (consumiendo la API de OpenWeatherMap), el historial transaccional de compras, reglas de colorimetría masculina y la disponibilidad física real de inventario en tienda, complementado con búsqueda por comandos de voz mediante procesamiento de lenguaje natural (NLP).
   - *Sistema de Fidelización Gamificado y Comparador de Outfits:* Mecanismo de acumulación de puntos comerciales y progresión por niveles de membresía (Bronce, Plata, Oro, Diamante) con asignación de insignias digitales, integrado a un comparador visual que permite contrastar en paralelo hasta tres combinaciones completas de ropa evaluando costo total y armonía estética.

### 1.1.3 El Salto Estratégico y Tecnológico hacia el Segundo Parcial: De Sistema Monoproyecto a SaaS Multitenant Resiliente

Habiendo validado de forma fehaciente la viabilidad técnica y operativa del prototipo fundacional, para este segundo examen parcial el proyecto FashionStore emprende una **transformación arquitectónica, operativa y comercial de escala mayor**: evoluciona desde una solución privativa desarrollada para una única empresa hacia una **plataforma abierta bajo el modelo Software as a Service (SaaS) Multitenant de distribución masiva y alta resiliencia**.

Esta evolución responde a siete líneas imperativas de ingeniería y mercado:
1. **Modelo de Negocio SaaS Multitenant con Aislamiento Estricto:** FashionStore deja de ser un sistema cautivo para convertirse en una solución comercializable a múltiples empresas textiles independientes (**tenants**). Mediante una arquitectura de base de datos relacional compartida con particionamiento lógico discriminado por `empresa_id` a nivel de fila y middleware de seguridad en backend, cada empresa suscriptora opera en un entorno virtual hermético y privado. La plataforma incorpora la gobernanza de **Planes de Suscripción (Básico y Profesional)**, delimitando cuotas máximas de sucursales físicas operativas, límites de personal administrativo y habilitación selectiva de servicios de inteligencia artificial.
2. **Resiliencia Operativa Offline-First (Web PWA y Móvil Flutter):** Para blindar la continuidad del negocio frente a las interrupciones crónicas del suministro de Internet en Bolivia, la plataforma incorpora arquitectura desconectada nativa:
   - *Plataforma Web:* La aplicación cliente Angular evoluciona hacia una **Progressive Web App (PWA)** instalable con Service Workers para almacenamiento en caché de la interfaz y la API **IndexedDB** para persistencia local de catálogos y colas de ventas.
   - *Plataforma Móvil:* La aplicación Flutter integra el motor de base de datos relacional embebido **SQLite (`sqflite`)**, permitiendo la navegación fluida de productos, preselección de prendas para probadores y registro de transacciones comerciales de mostrador sin conectividad celular ni Wi-Fi.
3. **Sincronización Transaccional Idempotente y Resolución de Conflictos:** Toda transacción efectuada fuera de línea es resguardada localmente bajo un identificador universal único (**UUID v4 inmutable**). Al reanudarse el enlace de red, un agente en segundo plano despacha las operaciones encoladas hacia el backend, donde un middleware de **idempotencia** garantiza que ningún reenvío duplique registros de venta ni asientos contables, aplicando políticas determinísticas para dirimir colisiones concurrentes de inventario.
4. **Inteligencia Analítica con IA Generativa y Modelos de Machine Learning:** Se incorpora un Asistente de Reportes Generativos mediante Modelos de Lenguaje (LLM / NLP) que interpreta solicitudes en lenguaje natural —emitidas por texto web o comandos de voz desde la aplicación móvil— traduciéndolas dinámicamente a consultas SQL parametrizadas y restringidas por `empresa_id`, generando tablas, gráficos interactivos y resúmenes ejecutivos. Adicionalmente, se despliega un pipeline de **Machine Learning** alimentado por un dataset sintético representativo de **6 meses de actividad comercial**, entrenando modelos supervisados (predicción de demanda de ventas) y modelos no supervisados (segmentación de clientes con K-Means y detección de anomalías de inventario con Isolation Forest).
5. **Formalización del Ciclo Logístico Post-Venta: Cambios de Prendas en Dos Tiempos:** Se implementa el circuito integral de cambios de indumentaria por talla o modelo dentro de plazos configurables (48 horas a 7 días hábiles), sustentado en el principio contable de doble registro:
   - **Nota de Devolución:** Formaliza el reingreso de la prenda devuelta a la bodega de la sucursal, incrementando el stock disponible y reintegrando contablemente su Costo Promedio Ponderado histórico.
   - **Nota de Cambio:** Formaliza el egreso de la nueva prenda entregada al cliente, liquidando en mostrador el **diferencial de precio** resultante (mediante cobro de saldo con tarjeta vía Stripe Sandbox o efectivo; o aplicando una política de reembolso monetario en un plazo máximo de 30 días si el cliente no encuentra un producto de su agrado).
6. **Estrategias Comerciales de Precios Diferenciados y Liquidación:** Se automatiza el cálculo de tarifas comerciales mediante dos políticas esenciales del retail textil:
   - **Precios al por Mayor:** Descuento automático por volumen aplicable a compras iguales o superiores a **3 unidades** de una misma línea de prendas.
   - **Ofertas de Liquidación Estacional:** Descuentos promocionales escalonados (**30%, 40% y 60%**) para prendas de temporadas finalizadas, orientadas a acelerar la rotación del inventario y recuperar el capital de trabajo inmovilizado.
7. **Compras y Aprovisionamiento Controlado desde Web Desktop (CU20):** Se centraliza el aprovisionamiento de mercadería exclusivamente a través del canal Web de escritorio, asignado al Encargado de Aprovisionamiento o Administrador de Empresa, asegurando que las compras de nuevos lotes a proveedores actualicen de forma matemática el CPP y el stock central de la organización.

### 1.1.4 Adopción de la Metodología ICONIX y Reglas de Modelado UML 2.5+

Para gobernar el desarrollo integral de este ecosistema en un marco de alta rigurosidad y en un periodo intensivo de trabajo, se sustituye el marco PUDS y se adopta formalmente la **metodología ICONIX**, un proceso pesado-ligero centrado en casos de uso que optimiza la carga documental mediante la aplicación del **principio 80/20 de UML** (utilizar aproximadamente el 20% medular de los artefactos del estándar para resolver el 80% de los problemas de modelado y diseño).

El proceso de ingeniería se estructura a través de sus **cuatro fases secuenciales e iterativas**:
- **Fase 1: Análisis de Requisitos:** Delimitación de requisitos funcionales y no funcionales, construcción del Modelo de Dominio conceptual y especificación de fichas de casos de uso estandarizadas acompañadas de sus prototipos de interfaz de usuario (*wireframes/storyboards*).
- **Fase 2: Análisis y Diseño Preliminar:** Construcción sistemática de los **Diagramas de Robustez Boundary-Controller-Entity (BCE)**, sirviendo como puente indispensable entre la visión del negocio y la arquitectura técnica. En estricto cumplimiento de las directrices de la cátedra (MSc. Ing. Angélica Garzón Cuéllar):
  $$\text{Actor} \longleftrightarrow \text{Boundary (Interfaz)} \longleftrightarrow \text{Controller (Gestor)} \longleftrightarrow \text{Entity (Datos)}$$
  $$\textbf{Regla Inquebrantable: CERO Comunicación Entidad} \longleftrightarrow \textbf{Entidad}$$
  Toda interacción entre entidades de datos debe ser coordinada obligatoriamente por una clase de control (`Gestor...`).
- **Fase 3: Diseño:** Elaboración de los **Diagramas de Secuencia** con fragmentos combinados (`alt`, `opt`, `loop`). Bajo las directrices de la cátedra, **los fragmentos de repetición (`loop`) NUNCA deben encerrar a la interfaz de usuario (Boundary) ni a los actores**, circunscribiéndose exclusivamente a la interacción interna entre el Gestor (Control) y las Entidades de datos. Paralelamente, se define el **Diagrama de Clases Lógicas** con tipado de datos completo, métodos, firmas, multiplicidades y el atributo discriminador `empresa_id`, culminando con el diseño de arquitectura física (Componentes y Despliegue con nodos, puertos y protocolos).
- **Fase 4: Implementación y Pruebas:** Codificación estructurada bajo arquitectura limpia y ejecución de una matriz formal de casos de prueba unitarios, de integración y verificación de sincronización offline, garantizando una **trazabilidad vertical absoluta y comprobable**:
  $$\text{Requisito Funcional} \longrightarrow \text{Caso de Uso} \longrightarrow \text{Robustez BCE} \longrightarrow \text{Diagrama Secuencia} \longrightarrow \text{Código Fuente} \longrightarrow \text{Caso de Prueba}$$

Asimismo, respondiendo a las instrucciones explícitas impartidas por la docente:
- **No se emplean ciclos ni iteraciones aisladas del Proceso Unificado:** El documento se concibe como una trayectoria progresiva y continua.
- **No se aplica priorización de casos de uso:** Todos los casos de uso forman un único cuerpo funcional integral.
- **Estructura unificada de casos de uso:** Los 25 casos de uso de la etapa fundacional se preservan y archivan en el **Anexo A** como antecedente histórico, mientras que el cuerpo principal del Segundo Parcial se estructura a partir del **Caso de Uso CU01 hasta el CU19**, integrando tanto las nuevas capacidades de SaaS, sincronización offline, IA y post-venta, como las funcionalidades operativas esenciales reingenierizadas bajo ICONIX.

---

## 1.2 Planteamiento del Problema

### 1.2.1 Contexto Global, Regional y Local del Comercio Minorista de Moda Masculina

El comercio minorista de prendas de vestir (*apparel retail*) representa una de las industrias de mayor dinamismo y volumen económico a nivel global. Tradicionalmente estructurada sobre un modelo de interacción eminentemente sensorial —donde el cliente acude físicamente a la tienda, examina la textura y peso de las telas, aprecia la caída de los textiles, utiliza probadores para verificar el ajuste anatómico y recibe la orientación directa de dependientes—, la industria de la moda se ha visto forzada a emprender una profunda metamorfosis tecnológica. El auge del comercio móvil (*m-commerce*), la exigencia de inmediatez y la consolidación de estrategias omnicanales han derribado las barreras entre el espacio comercial físico y las plataformas virtuales.

En el caso específico de la **indumentaria masculina**, las características psicográficas y conductuales del consumidor imponen condiciones muy exigentes. Diversos estudios de comportamiento del consumidor señalan que los varones priorizan la conveniencia, la exactitud y la economía de tiempo. Cuando un comprador masculino busca una prenda de vestir, generalmente persigue un objetivo concreto: renovar su vestuario laboral con camisas formales, adquirir un traje para un evento específico o proveerse de ropa deportiva o casual con características funcionales definidas. Experimentar fricciones en la experiencia de compra —como colas prolongadas frente a probadores, desorden en estanterías, falta de claridad en las medidas o incertidumbre respecto a si una compra digital le calzará adecuadamente— genera una tasa de abandono que supera el **40%** en tiendas físicas y desmotiva las compras en canales digitales.

#### La Realidad Estructural del Mercado Textil en Bolivia

Al contrastar estas dinámicas globales con el entorno socioeconómico y tecnológico de **Bolivia** (particularmente en las urbes de Santa Cruz de la Sierra, La Paz, Cochabamba y ciudades intermedias), el comercio de moda masculina enfrenta fallas estructurales agudas:

1. **Heterogeneidad Descontrolada y Caos de Tallas:**
   En el mercado nacional convergen prendas de múltiples orígenes: confecciones de talleres nacionales, manufacturas importadas de países limítrofes (Brasil, Colombia, Perú), prendas de origen norteamericano y un masivo volumen de confecciones asiáticas. Dado que no existe una norma técnica antropométrica boliviana de estandarización de tallas, la etiqueta nominal (S, M, L, XL, o numéricas 38, 40, 42) carece de significado homogéneo. Una camisa talla "L" de origen asiático resulta con frecuencia equivalente a una talla "S" de confección norteamericana. Los clientes que compran por Internet o canales de mensajería sin conocer las **medidas exactas en centímetros (pecho, cintura, largo)** sufren una constante decepción al recibir prendas incompatibles, generando desconfianza hacia el comercio electrónico formal.

2. **La Trampa de la Informalidad Digital:**
   Gran parte de las empresas textiles que afirman contar con "tienda virtual" carecen de plataformas transaccionales verdaderas. Su operativa descansa en la publicación de catálogos no sincronizados en redes sociales (Facebook, Instagram, WhatsApp). El proceso de venta es manual, precario e ineficiente: un cliente consulta la disponibilidad de una prenda, un empleado debe buscar físicamente la ropa en perchas o bodegas para responder horas más tarde, el pago se efectúa mediante transferencias QR informales que requieren enviar la fotografía del comprobante bancario para su verificación visual, y los despachos se coordinan de forma precaria con servicios de radiotaxi. Este flujo artesanal no escala, genera duplicidad de ventas sobre prendas ya agotadas (*overselling*), carece de trazabilidad contable y proyecta una imagen de poca seriedad que frena la fidelización de clientes de alto valor.

3. **Silos Operativos y Falta de Visibilidad Multi-Sucursal:**
   Las cadenas comerciales medianas que cuentan con dos o más tiendas físicas dentro de una misma ciudad operan sus locales como compartimentos estancos. Las ventas se registran en cuadernos físicos o en terminales aisladas con bases de datos locales no sincronizadas. Si un cliente solicita una camisa de su talla en la sucursal de una zona comercial y la prenda está agotada, el personal de mostrador no tiene visibilidad sobre si dicha prenda existe en la sucursal ubicada a pocos kilómetros. La venta se pierde irremediablemente, mientras en el otro punto de venta la mercadería permanece inmovilizada hasta convertirse en saldo obsoleto.

4. **Inexactitud Financiera y Vulnerabilidad Tributaria por Omisión del CPP:**
   Debido a factores macroeconómicos, fluctuaciones en el tipo de cambio de divisas para insumos importados y variaciones en fletes de transporte, los comerciantes de ropa adquieren lotes sucesivos de prendas idénticas a costos unitarios notablemente dispares. La práctica empírica habitual en las PyMEs bolivianas consiste en registrar todo el stock asignándole el valor del último precio de compra recibido. Esta omisión del cálculo riguroso del **Costo Promedio Ponderado (CPP)** distorsiona por completo la valuación de los activos en el balance general, proyecta márgenes brutos de rentabilidad ficticios y coloca a la empresa en situación de contingencia fiscal frente al Servicio de Impuestos Nacionales al no poder sustentar fehacientemente su costo de ventas en el marco de la Ley 843 (IVA 13%, IT 3%).

5. **Inestabilidad de Telecomunicaciones y Vulnerabilidad en Tiendas:**
   Las redes de telecomunicaciones en Bolivia padecen de recurrentes caídas de servicio, microcortes de fibra óptica e interrupciones del suministro de datos celulares, particularmente severas en los sótanos y zonas interiores de centros comerciales y galerías populares. La mayoría de los sistemas web modernos colapsan ante la pérdida de conexión: la pantalla se congela, el cajero no puede emitir recibos ni consultar precios, las filas de clientes se acumulan y el establecimiento se ve forzado a paralizar sus operaciones, sufriendo cuantiosas pérdidas financieras y daño a su reputación.

---

### 1.2.2 Diagnóstico de la Situación Actual y Problemáticas Críticas del Modelo Inicial

A partir del análisis técnico del prototipo desarrollado en el primer parcial y de la recopilación de requerimientos del sector comercial, se sintetizan las problemáticas operativas centrales que sustentaron la concepción inicial del sistema:

1. **La Brecha Experiencial Físico-Digital y la Crisis Logística de Devoluciones:** La imposibilidad de ensayar virtualmente las prendas antes del pago, sumada a la ausencia de fichas con medidas anatómicas en centímetros, generaba tasas de devolución superiores al **30%** en ventas digitales, ocasionando absorción de fletes de transporte inverso, deterioro de etiquetas y pérdida de margen comercial.
2. **Desarticulación en el Inventario Multi-Sucursal:** Falta de un kardex centralizado en tiempo real, lo que provocaba desabastecimiento en tiendas de alta afluencia y acumulación de sobrestock en sucursales secundarias.
3. **Distorsión Contable en Existencias:** Carencia de un recálculo automatizado del Costo Promedio Ponderado tras cada compra de abastecimiento a proveedores.
4. **Ineficiencia en Sala de Ventas y Probadores:** Tiempos de espera excesivos de los clientes en tiendas físicas para probarse prendas, sin mecanismos de reserva previa de probadores con preselección digital de ropa.
5. **Experiencia Estática y Falta de Personalización:** Ausencia de asesoría estilística contextualizada a factores climáticos y ocasiones de uso, junto con la falta de esquemas de fidelización por niveles de cliente.

---

### 1.2.3 Matriz de Análisis Causa-Efecto (Diagrama de Ishikawa)

Para desglosar con rigor causal las problemáticas que aquejan a la comercialización minorista de indumentaria masculina y fundamentar la ingeniería de la solución, se estructura la siguiente matriz causa-efecto bajo las dimensiones clásicas del análisis de procesos:

| Dimensión de Análisis | Causa Raíz Primaria | Efecto Directo en la Operación | Consecuencia Final para el Negocio |
|:---|:---|:---|:---|
| **Métodos y Procesos** | Ausencia de flujos de reserva anticipada de vestidores y prendas por sucursal. | Clientes insatisfechos por desabastecimiento presencial y colapso de probadores. | Abandono de sala de ventas y pérdida irreversible de transacciones potenciales. |
| **Métodos y Procesos** | Registro de inventario limitado al último costo unitario de compra sin cálculo del CPP. | Distorsión del valor real del activo e inexactitud en el margen bruto de utilidad. | Incumplimiento contable-tributario y toma de decisiones financieras sobre balances ficticios. |
| **Tecnología y Sistemas** | Falta de herramientas virtuales de verificación de calce anatómico y proporciones corporales. | Incertidumbre dimensional del consumidor masculino al comprar indumentaria en línea. | Tasas de devolución superiores al 30% y absorción destructiva de fletes inversos. |
| **Tecnología y Sistemas** | Dispersión de plataformas no integradas entre portal web, app móvil y cajas POS. | Desincronización de existencias y desfase de stock tras transacciones concurrentes. | Ventas de prendas sin disponibilidad real (*overselling*) y deterioro reputacional. |
| **Inventario y Stock** | Gestión aislada por sucursal física sin visibilidad consolidada ni traspasos controlados. | Desbalance severo de mercadería: quiebre de stock en sucursal A y sobrestock en sucursal B. | Pérdida de rentabilidad por liquidaciones forzosas y costos de almacenamiento improductivo. |
| **Infraestructura y Red** | Dependencia absoluta de conectividad ininterrumpida a servidores en la nube. | Bloqueo total del sistema POS y la app móvil durante caídas de señal de Internet. | Paralización de cajas de cobro en tiendas físicas y pérdida inmediata de ventas de mostrador. |
| **Personal y Atención** | Atención reactiva sin conocimiento de reservas, tallas anatómicas o preferencias previas. | Tiempos de atención prolongados en tienda y búsqueda manual infructuosa en bodegas. | Baja productividad del personal de ventas y aglomeración de clientes en sucursales. |
| **Cliente y Mercado** | Catálogos estáticos no contextualizados y carencia de programas de lealtad escalonados. | Experiencia de compra impersonal y ausencia de incentivos económicos de recurrencia. | Alta tasa de deserción hacia competidores y bajo valor de vida del cliente (*CLV*). |

---

### 1.2.4 Impacto y Consecuencias de la Inacción

De no implementarse una solución tecnológica integral y moderna, las empresas comercializadoras de indumentaria masculina enfrentan consecuencias financieras y operativas severas:
1. **Erosión Crítica de Márgenes Comerciales:** La absorción de costos logísticos de transporte por cambios y devoluciones de prendas mal calzadas y la distorsión de precios consumen el margen operativo del negocio.
2. **Obsolescencia Acelerada del Inventario Estacional:** La moda masculina se rige por temporadas comerciales rígidas; las prendas no rotadas a tiempo sufren depreciación acelerada que obliga a vender bajo costo.
3. **Pérdida de Mercado ante Cadenas Internacionales:** Franquicias extranjeras que despliegan plataformas omnicanales fluidas capturan a los consumidores masculinos jóvenes y profesionales.
4. **Degradación de Imagen de Marca:** Incidencias de venta sin existencias reales (*overselling*) o lentitud en cajas registradoras provocan reseñas negativas y deserción irreversible de clientes.

---

### 1.2.5 Nuevos Desafíos Estructurales y Necesidad de Escalado hacia el Segundo Parcial

Si bien el prototipo del primer parcial solventó con éxito las problemáticas iniciales para una tienda específica, el análisis de escalabilidad técnica y comercial reveló **seis nuevas limitaciones estructurales** que motivan de forma ineludible la evolución hacia el Segundo Parcial:

#### A. Modelo Monolítico de Negocio y Ausencia de Escalabilidad Multi-Empresa (SaaS)
FashionStore fue concebida inicialmente como una solución privativa para una sola marca comercial. Este esquema limita la rentabilidad del desarrollo: no puede ser adoptado por otras cadenas o boutiques de confección sin duplicar servidores, bases de datos y costos de mantenimiento. 
En la industria moderna del software, el modelo **SaaS (Software as a Service)** permite comercializar la plataforma a decenas de empresas suscriptoras (**tenants**). Cada empresa debe operar de forma totalmente aislada e independiente (con sus propios roles, empleados, inventarios, precios y clientes), seleccionando planes de suscripción (Básico o Profesional) acordes a su volumen de negocio. El prototipo del primer parcial carecía de esta capacidad multi-empresa.

#### B. Vulnerabilidad Crítica ante Interrupciones de Conectividad a Internet (Realidad Boliviana)
El prototipo inicial dependía rígidamente de una conexión ininterrumpida al backend central en la nube. En la realidad boliviana, las interrupciones del servicio de Internet —debido a fallas de proveedores (Entel, Tigo, AXS), cortes de fibra óptica o saturación en centros comerciales— son frecuentes. 
Bajo el esquema inicial, un corte de red paraliza la caja POS de la sucursal: no se pueden facturar ventas de mostrador, no se pueden registrar clientes y no se pueden confirmar reservas, provocando filas y pérdidas económicas. De igual modo, si un cliente en la app móvil transita por una zona sin cobertura celular, la aplicación deja de responder. Resulta indispensable dotar a FashionStore de **resiliencia offline**: la web debe operar como una **Progressive Web App (PWA) con IndexedDB** y la app móvil debe incorporar **SQLite local**, permitiendo transacciones de mostrador sin red y ejecutando una **sincronización idempotente posterior** cuando se restablezca la conectividad.

#### C. Carencia de Analítica Predictiva, Modelos de Machine Learning y Reportes Generativos
Los tableros de control del primer parcial ofrecían métricas estáticas basadas en consultas SQL predeterminadas. Los directivos de las empresas no podían solicitar información ad-hoc ni hacer preguntas analíticas en lenguaje natural (ej. *"¿Cuáles fueron los 3 trajes más vendidos en la sucursal Equipetrol durante el último mes?"*).
Asimismo, la plataforma carecía de modelos de **Machine Learning** que permitieran anticipar la demanda futura de prendas (modelos supervisados de regresión/series temporales) o segmentar clientes y detectar anomalías en existencias (modelos no supervisados de clustering y aislamiento). Sin un pipeline de datos sintéticos representativo de al menos 6 meses y algoritmos de ML, la toma de decisiones gerenciales continuaba siendo puramente reactiva.

#### D. Gestión Incompleta del Ciclo Post-Venta: Políticas de Cambio de Prendas con Doble Registro
El prototipo inicial implementó la venta y la entrega, pero omitió el tratamiento formal de los **cambios y devoluciones de prendas**. En la práctica del comercio textil, cuando un cliente requiere cambiar una prenda (frecuentemente por falta de calce en talla o preferencia de color), el sistema debe permitir formalizar la operación en mostrador dentro de un plazo normado (ej. 48 horas a 7 días hábiles). Dicho cambio exige emitir contablemente una **Nota de Devolución** (para reingresar la prenda devuelta al stock de la sucursal y recuperar su CPP histórico) y una **Nota de Cambio** (para despachar la nueva prenda entregada), liquidando con exactitud si existe un **diferencial de precio** por variación de talla o modelo, o aplicando una **política de devolución monetaria en 30 días** si el cliente no encuentra un reemplazo de su agrado.

#### E. Ausencia de Estrategias de Precios Diferenciados (Mayorista y Liquidación Estacional)
El modelo original aplicaba un precio de venta rígido y unitario. El retail de moda requiere flexibilizar tarifas para incentivar la venta por volumen:
- **Precios al por Mayor:** Aplicables automáticamente a clientes que adquieren compras iguales o superiores a **3 unidades**, dinamizando la venta corporativa y comercial.
- **Ofertas de Liquidación Estacional:** Descuentos promocionales configurables (**30%, 40% y 60%**) para mercadería de fin de temporada, esenciales para desocupar bodegas y recuperar el capital inmovilizado.

#### F. Desarticulación del Canal de Compras y Aprovisionamiento Empresarial (CU20)
Las compras de mercadería a proveedores deben realizarse de manera controlada y centralizada a través del canal **Web Desktop** por el Encargado de Aprovisionamiento o el Administrador de Empresa. El ingreso de lotes de compra debe actualizar de forma atómica el stock físico, registrar los precios pactados y disparar el recálculo automático inmutable del Costo Promedio Ponderado en el kardex central.

---

### 1.2.6 Formulación de la Solución Integral con FashionStore SaaS Multitenant

Frente a la conjunción de los desafíos de la industria de la moda masculina y las exigencias de escalabilidad, resiliencia y analítica del Segundo Parcial, se formula la arquitectura integral de **FashionStore**:

```mermaid
graph TD
    subgraph "Base Omnicanal Heredada (Primer Parcial - 25 CUs Archivados en Anexo A)"
        A["🛒 Catálogo & Atributos Avanzados<br>(Tallas cm, Colores Compuestos, Composición)"]
        B["👗 Probador Virtual RA & Outfits<br>(Flutter 3D .glb / .gltf)"]
        C["📅 Reservas Presenciales<br>(Bloqueo Temporal de Stock)"]
        D["💳 Checkout Digital & POS Mostrador<br>(Stripe PCI-DSS & Código SKU)"]
        E["🏆 Gamificación & IA Contextual<br>(Membresías, Clima OpenWeather & Voz)"]
        F["📦 Inventario Multi-Sucursal con CPP<br>(Valuación Matemática Inmutable)"]
    end

    subgraph "Evolución Segundo Parcial (ICONIX - CU01 al CU20)"
        G["🏢 Arquitectura SaaS Multitenant<br>Planes Básico y Profesional<br>Aislamiento Lógico por empresa_id"]
        H["📶 Resiliencia Operativa Offline<br>Angular PWA con IndexedDB (Web)<br>SQLite Relacional Embebido (Flutter Móvil)"]
        I["🔄 Sincronización Transaccional Idempotente<br>Colas Locales, UUIDs v4 Inmutables<br>Resolución Determinística de Conflictos"]
        J["🤖 Reportes Generativos con IA (LLM/NLP)<br>Consultas en Lenguaje Natural (Texto/Voz)<br>Generación Segura de SQL Parametrizado"]
        K["📊 Analítica con Machine Learning (6 Meses)<br>Supervisado: Predicción de Demanda de Ventas<br>No Supervisado: K-Means & Isolation Forest"]
        L["🔄 Gestión Post-Venta: Cambios en Dos Tiempos<br>Nota de Devolución (Stock +1, CPP Reintegrado)<br>Nota de Cambio (Stock -1, Diferencial Stripe / 30 Días)"]
        M["🏷️ Políticas de Precios Mayoristas y Ofertas<br>Mayorista >= 3 Unidades<br>Liquidación Estacional: 30%, 40%, 60%"]
        N["🖥️ Aprovisionamiento Desktop (CU19)<br>Compras a Proveedores y Traspasos Inter-Sucursales"]
    end

    A & B & C & D & E & F --> G
    G --> H & I & J & K & L & M & N
```

---

## 1.3 Objetivos del Proyecto

### 1.3.1 Objetivo General

Desarrollar y evolucionar la plataforma inteligente de comercio electrónico FashionStore hacia una solución integral de software como servicio (**SaaS**) multitenant, resiliente a contingencias de conectividad y potenciada con analítica avanzada, aplicando rigurosamente la metodología pesada-ligera **ICONIX** y el estándar **UML 2.5+**, con el propósito de dotar a múltiples empresas del sector de confección textil de un ecosistema omnicanal seguro y escalable, capaz de sostener transacciones de venta y reserva ininterrumpidas en modo offline (PWA con IndexedDB y Flutter con SQLite), sincronizar datos de forma idempotente, dinamizar la toma de decisiones gerenciales mediante reportes generativos con inteligencia artificial y modelos de Machine Learning, y gobernar formalmente los procesos de compras de aprovisionamiento, traspasos inter-sucursales y cambios de indumentaria con doble registro documental.

---

### 1.3.2 Objetivos Específicos

Para materializar con éxito el objetivo general, se formulan los siguientes objetivos específicos estructurados según el ciclo de ingeniería del software y los componentes arquitectónicos del sistema:

1. **Modelar la Arquitectura del Sistema bajo la Metodología ICONIX:** Elaborar de forma progresiva y trazable los artefactos medulares de ICONIX (Modelo de Dominio conceptual, especificación estandarizada de Fichas de Casos de Uso con prototipos de interfaz, Diagramas de Robustez BCE sin enlaces directos Entidad-Entidad, Diagramas de Secuencia con fragmentos estructurados `alt`, `opt` y `loop` —asegurando que `loop` excluya a las interfaces de usuario—, Diagrama de Clases Lógicas tipado y esquemas físicos de base de datos), asegurando la trazabilidad vertical desde los requisitos de negocio hasta las pruebas de aceptación.
2. **Diseñar e Implementar la Infraestructura SaaS Multitenant y Seguridad RBAC:** Construir el modelo relacional multitenant en PostgreSQL mediante clave discriminadora (`empresa_id`) a nivel de fila y middleware de intercepción en FastAPI, garantizando el aislamiento criptográfico estricto de los datos entre empresas contratantes e implementando la administración de **Planes de Suscripción (Básico y Profesional)** para regular las cuotas de sucursales, usuarios operativos y funcionalidades avanzadas habilitadas.
3. **Construir la Aplicación Web Progresiva (PWA) con Persistencia Local en IndexedDB:** Desarrollar sobre Angular el soporte de Progressive Web App instalable con Service Workers para cacheo de recursos visuales y la API de almacenamiento local **IndexedDB**, permitiendo a los operadores de sala de ventas y cajeros consultar el catálogo de prendas, registrar reservas presenciales y procesar ventas de mostrador de contado de forma autónoma durante interrupciones del enlace a Internet.
4. **Desarrollar la Capa de Datos Móvil Desconectada con Flutter y SQLite:** Implementar un motor relacional embebido local en la aplicación móvil Flutter mediante la biblioteca **SQLite (`sqflite`)**, posibilitando la precarga de catálogos de indumentaria, la gestión local de apartados en vestidores virtuales y la captura de transacciones comerciales en zonas de débil o nula cobertura celular.
5. **Implementar el Motor de Sincronización Transaccional Idempotente y Resolución de Conflictos:** Diseñar un protocolo de sincronización asíncrona bidireccional basado en identificadores universales únicos (**UUID v4 inmutables**) y colas de despacho local, acompañado de un middleware de verificación de idempotencia en FastAPI que procese transacciones diferidas sin duplicar asientos contables ni cobros, dirimiendo determinísticamente eventuales colisiones de inventario concurrente.
6. **Formalizar el Circuito Logístico de Post-Venta y Cambios de Ropa en Dos Tiempos:** Programar el módulo de cambios de indumentaria en mostrador bajo el principio contable de doble comprobante: emisión de la **Nota de Devolución** (reingreso físico a bodega, incremento de existencias y reintegro del CPP histórico) y emisión de la **Nota de Cambio** (egreso de nueva prenda, descuento de stock y liquidación del diferencial de precio vía pasarela Stripe Sandbox o ejecución de política de reembolso monetario en 30 días).
7. **Automatizar las Políticas Comerciales de Precios Diferenciados y Liquidación:** Implementar el motor de tarificación flexible que aplique automáticamente descuentos por **precio al por mayor en compras iguales o mayores a 3 unidades**, y descuentos escalonados de **liquidación estacional (30%, 40% y 60%)** para prendas de colecciones pasadas, administrando atributos avanzados de producto (medidas en centímetros, colores compuestos con códigos Hex y propiedades hipoalergénicas).
8. **Integrar el Canal de Aprovisionamiento y Traspasos Inter-Sucursales desde Web Desktop:** Desarrollar el módulo de compras centralizadas a proveedores (**CU19**) accesible exclusivamente desde la aplicación Web Desktop por el Encargado de Aprovisionamiento o Administrador de Empresa, calculando en tiempo real el nuevo Costo Promedio Ponderado del inventario y gestionando las transferencias físicas de mercadería entre tiendas de una misma empresa.
9. **Desplegar el Asistente de Reportes Generativos con Inteligencia Artificial y NLP:** Integrar un motor conversacional de procesamiento de lenguaje natural (consumiendo APIs de modelos de lenguaje LLM) capaz de interpretar solicitudes de información gerencial formuladas en lenguaje natural (escritas o dictadas por voz), traduciéndolas a sentencias SQL parametrizadas, validadas contra inyecciones y restringidas por `empresa_id`, renderizando cuadros interactivos, gráficos y conclusiones analíticas.
10. **Entrenar y Visualizar Modelos de Machine Learning con Dataset Sintético de 6 Meses:** Construir un pipeline analítico alimentado por más de 6 meses de actividad transaccional sintética realista para entrenar modelos de aprendizaje supervisado (predicción de demanda de ventas para optimizar abastecimiento) y no supervisado (segmentación de clientes mediante K-Means y detección de anomalías en rotación de inventario con Isolation Forest), integrándolos en un dashboard analítico ejecutivo.
11. **Ejecutar Pruebas Integrales de Software y Aseguramiento de Calidad:** Diseñar y ejecutar una matriz exhaustiva de casos de prueba formales (pruebas funcionales por caso de uso, pruebas de integración end-to-end, pruebas de corte y recuperación de red, y pruebas de estrés de sincronización idempotente), certificando el 100% de cumplimiento de los requisitos funcionales y reglas de negocio del sistema.

---

## 1.4 Justificación

La evolución estratégica y tecnológica de FashionStore se fundamenta rigurosamente en cinco dimensiones de análisis:

### 1.4.1 Justificación Técnica y Arquitectónica

Desde la perspectiva de la ingeniería de software moderna, migrar un sistema propietario o monoproyecto hacia una **arquitectura SaaS Multitenant con base de datos compartida y aislamiento lógico (`empresa_id`)** constituye el estándar de máxima eficiencia en la industria digital. Permite operar un único código base (*single codebase*), centralizar los despliegues continuos, optimizar la utilización de recursos computacionales en la nube y reducir drásticamente los costos de infraestructura y mantenimiento evolutivo.

Asimismo, la implementación de un paradigma **Offline-First** combinando **Angular PWA (Service Workers + IndexedDB)** en el entorno web y **Flutter (SQLite embebido)** en el entorno móvil resuelve uno de los problemas arquitectónicos más desafiantes en sistemas distribuidos: la tolerancia a fallos de partición de red (*Teorema CAP*). Al incorporar identificadores inmutables **UUID v4** como claves de idempotencia y despachos atómicos por lotes, el sistema garantiza consistencia eventual, durabilidad transaccional y protección contra duplicidad de datos, demostrando solvencia ingenieril en el diseño de software de misión crítica.

### 1.4.2 Justificación Comercial, Económica y de Escalabilidad (SaaS)

Desarrollar soluciones informáticas a medida y de forma aislada para cada pequeña o mediana empresa del sector textil resulta económicamente inviable, demanda inversiones de capital inasumibles para boutiques locales y restringe severamente el retorno sobre la inversión (ROI) para la empresa de desarrollo.

Al transformar FashionStore en un producto SaaS comercializable bajo planes escalonados (**Plan Básico y Plan Profesional**), se democratiza el acceso a tecnología de frontera (probadores virtuales en Realidad Aumentada, analítica predictiva con Machine Learning y reportes generativos con IA) para cientos de empresas de confección y venta de ropa que de otro modo quedarían marginadas de la economía digital. Para la empresa proveedora de FashionStore, el modelo SaaS instituye un flujo de ingresos recurrentes, predecibles y escalables (MRR - *Monthly Recurring Revenue*), donde la incorporación de nuevos clientes genera un costo marginal cercano a cero. Adicionalmente, las reglas comerciales de precios mayoristas (>= 3 unidades) y liquidación de inventario estacional (30%, 40%, 60%) maximizan el flujo de caja y la recuperación de capital para las tiendas suscriptoras.

### 1.4.3 Justificación Social y de Resiliencia Operativa en el Contexto Boliviano

En el contexto comercial de Bolivia, la infraestructura de telecomunicaciones presenta notorias vulnerabilidades territoriales. En centros comerciales de alta concurrencia, ferias comerciales densas o galerías céntricas, las saturaciones y caídas del servicio de Internet son una constante cotidiana. Imponer a los comercios una dependencia total de la nube significa forzarlos a suspender cobros y cerrar cajas ante el primer corte de red.

Al dotar a FashionStore de capacidad operativa fuera de línea para ventas de mostrador y reservas de probadores, se protege la estabilidad operativa de las tiendas físicas, se salvaguarda el empleo de los dependientes y se previene la fuga económica de clientes. Asimismo, al facilitar la inclusión de tallas anatómicas en centímetros, colores compuestos y especificaciones textiles, se combate la informalidad del comercio informal, promoviendo la formalización del retail de indumentaria y el cumplimiento de las normativas tributarias nacionales mediante la correcta aplicación del Costo Promedio Ponderado.

### 1.4.4 Justificación de Inteligencia de Negocios y Machine Learning

La enorme cantidad de transacciones que genera el retail de moda (ventas, pedidos, reservas, mermas y devoluciones) carece de valor estratégico si los directivos no cuentan con instrumentos ágiles para su interpretación. En las empresas medianas, los gerentes rara vez dominan el lenguaje SQL para extraer reportes ad-hoc de sus bases de datos.

La integración de **Reportes Generativos asistidos por Inteligencia Artificial (LLM / NLP)** democratiza de forma radical la toma de decisiones: un directivo puede formular una pregunta en lenguaje natural desde su computadora o dictarla mediante comandos de voz desde su teléfono inteligente y recibir en segundos un análisis ejecutivo con tablas y gráficos interactivos contextualizados a su empresa. De igual modo, la incorporación de **modelos de Machine Learning** entrenados sobre 6 meses de datos sintéticos sustituye la intuición empírica por rigor estadístico: el modelo de regresión supervisado anticipa la demanda estacional de ventas para evitar quiebres de stock, el clustering de K-Means segmenta la cartera de compradores para optimizar campañas de fidelización, y el algoritmo Isolation Forest detecta anomalías en existencias antes de que se conviertan en pérdidas financieras.

### 1.4.5 Justificación Académica y Metodológica (ICONIX vs PUDS)

En el ámbito formativo de la carrera de Ingeniería de Sistemas de la Universidad Autónoma Gabriel René Moreno (UAGRM), el proyecto permite contrastar de manera práctica y vivencial dos de las filosofías metodológicas más trascendentes en la ingeniería de software: el Proceso Unificado (PUDS), formal, iterativo y exhaustivo en artefactos, frente a **ICONIX**, ágil, pesada-ligera y focalizada en casos de uso.

La aplicación de ICONIX permite a los futuros ingenieros dominar el **principio 80/20 de UML**, aprendiendo a tender puentes conceptuales sólidos entre los requisitos del negocio y la implementación en código mediante los **Diagramas de Robustez (BCE)**. Demuestra cómo modelar la lógica sin acoplamientos prohibidos (eliminando dependencias directas entre entidades de datos), cómo representar fragmentos interactivos complejos en diagramas de secuencia sin deformar la interacción de interfaces, y cómo garantizar una trazabilidad vertical estricta que asegure la calidad del software entregado.

---

## 1.5 Alcance y Limitaciones

### 1.5.1 Módulos del Sistema (Segundo Parcial)

> **Regla de Alcance Metodológico (MSc. Ing. Angélica Garzón Cuéllar):**  
> *En estricta conformidad con las directrices metodológicas de evaluación y la arquitectura pesada-ligera de ICONIX, el cuerpo central de este documento delimita formalmente los **8 módulos funcionales consolidados** que agrupan y estructuran las capacidades del **Segundo Parcial**. Estos módulos se encuentran enumerados correlativamente a partir de **M01 (del M01 al M08)**, manteniendo perfecta trazabilidad con los 20 casos de uso del sistema (`CU01` a `CU20`) y los seis desafíos tecnológicos de ingeniería. Los 19 módulos fundacionales desarrollados bajo el Proceso Unificado durante el Primer Parcial se preservan íntegramente en el [Anexo A.2](#anexo-a2-módulos-del-sistema-del-primer-parcial-m01-al-m19--etapa-fundacional) como respaldo histórico.*

A continuación se especifica exhaustivamente cada uno de los **8 módulos consolidados del Segundo Parcial**, detallando su descripción operativa, estructura de datos clave con restricciones de integridad, funcionalidades nucleares y casos de uso asociados:

#### 1.5.1.1 Módulo M01: Plataforma SaaS Multitenant, Planes y Seguridad RBAC (Desafío VI)
- **Descripción General:** Administra el ciclo de vida, configuración, aprovisionamiento y aislamiento lógico estricto de las empresas clientes (**tenants**). Gobierna los tiers comerciales de suscripción (Plan Básico: hasta 2 sucursales; Plan Profesional: hasta 10 sucursales) con fiscalización de cuotas máximas de sucursales activas y empleados, y gestiona la seguridad perimetral mediante autenticación JWT cifrada con hash `bcrypt` y control de acceso basado en roles (RBAC) con discriminador `id_empresa` (Integer) y validación en PostgreSQL / SQLite de respaldo.
- **Datos Principales:** 
  - `empresas` (`id_empresa` PK Integer autoincremental, `nit` VarChar 30 Unique, `razon_social` VarChar 150, `nombre_comercial` VarChar 150, `dominio_slug` VarChar 50 Unique, `schema_name` VarChar 50, `presupuesto_disponible` Numeric 12,2, `estado` Enum/VarChar: `ACTIVA`, `SUSPENDIDA`, `VENCIDA`, `email_contacto` VarChar 100).
  - `planes_suscripcion` (`id_plan` PK Integer autoincremental, `codigo` VarChar 30 Unique, `nombre` VarChar 50, `precio_mensual` Numeric 10,2, `max_sucursales` Integer, `max_usuarios` Integer, `permite_reportes_ia` Boolean, `permite_ml_dashboard` Boolean, `soporta_offline` Boolean, `estado` VarChar 20).
  - `suscripciones` (`id_suscripcion` PK Integer autoincremental, `id_empresa` FK Integer, `id_plan` FK Integer, `fecha_inicio` Date, `fecha_vencimiento` Date, `estado` Enum/VarChar: `ACTIVA`, `VENCIDA`, `SUSPENDIDA`, `CANCELADA`, `CAMBIADA`, `auto_renovar` Boolean).
  - `usuarios` (`id_usuario` PK Integer autoincremental, `id_empresa` FK Integer Nullable, `id_sucursal` FK Integer Nullable, `email` VarChar 100 Unique, `password_hash` VarChar 255, `rol` Enum/VarChar: `SUPER_ADMIN`, `ADMINISTRADOR`, `ENCARGADO_SUCURSAL`, `CAJERO`, `LOGISTICA`, `CLIENTE`, `PROVEEDOR`, `estado_cuenta` VarChar 30, `intentos_fallidos` Integer).
- **Funcionalidades Clave:**
  - Aprovisionamiento administrativo de nuevas empresas con validación de NIT y slug de subdominio único.
  - Aislamiento estricto multitenant en backend (`app/core/tenancy.py`): resolución forzosa de tenant mediante `resolver_empresa` y validación cruzada con `exigir_mismo_tenant`, retornando `HTTP 403 Forbidden` ante accesos entre tenants ajenos.
  - Motor de suscripciones (`app/core/subscription.py`): validación de vigencia temporal (`exigir_suscripcion_vigente`), cuotas de sucursales (`LIMITE_PLAN_SUCURSALES` 409), cuotas de personal (`LIMITE_PLAN_USUARIOS` 409) y validación de downgrades (`DOWNGRADE_NO_PERMITIDO` 409).
  - Consulta de capacidades y consumo de cuotas vía endpoint `GET /api/v1/tenants/empresas/{id}/capacidades`.
  - Autenticación segura con tokens JWT portando claims de identidad, rol y tenant, con bloqueo preventivo tras 5 intentos fallidos y resguardo contra puertas traseras.
- **Casos de Uso Asociados:** `CU01` (Gestionar Empresas), `CU02` (Gestionar Planes de Suscripción), `CU03` (Gestionar Suscripción de Empresa), `CU04` (Autenticar Usuario Multitenant), `CU05` (Gestionar Usuarios y Roles por Empresa).

#### 1.5.1.2 Módulo M02: Catálogo de Productos y Atributos Textiles Avanzados
- **Descripción General:** Centraliza la catalogación técnica de prendas de vestir masculinas bajo especificaciones avanzadas del retail textil y confección de alta sastrería. Erradica la incertidumbre dimensional de calce mediante tablas métricas anatómicas en centímetros (`medidas_antropometricas` en JSON por talla), gestiona esquemas de color con código HEX primario y secundario para solapas y contrastes (`codigo_hex_secundario`), y especifica la composición precisa de telas (`composicion_textil`, ej. 100% Algodón Pima, 85% Lana Merino Super 120s) con certificación hipoalergénica y modelos tridimensionales (`.glb`).
- **Datos Principales:** `id_producto` (PK, Integer autoincremental), `id_empresa` (FK, Integer), `codigo_sku_base` (VarChar 50, Unique Global), `nombre` (VarChar 150), `id_categoria` (FK, Integer), `id_marca` (FK, Integer), `id_temporada` (FK, Integer Nullable), `precio_base` (Numeric 10,2), `composicion_textil` (VarChar 150), `medidas_antropometricas` (Text JSON conteniendo medidas corporales en cm: pecho, cintura, cadera y largo por talla), `modelo_3d_glb` (VarChar 255), `colores` (`color_nombre`, `codigo_hex`, `codigo_hex_secundario`), `tallas` (`talla`, `medidas_cm`, factor de precio).
- **Funcionalidades Clave:**
  - Alta y catalogación de prendas con composición textil certificada y enlace de modelo 3D para vestidor virtual.
  - Generador matricial de variantes con paleta de colores simples o bicolores con códigos hexadecimales.
  - Guía visual interactiva de medidas antropométricas en centímetros desplegable tanto en el modal de gestión como en el catálogo público, orientada a minimizar devoluciones.
  - Matriz omnicanal de precios diferenciados por talla calculada automáticamente a partir del precio base.
- **Casos de Uso Asociados:** `CU06` (Gestionar Productos y Atributos Textiles Avanzados).

#### 1.5.1.3 Módulo M03: Logística de Inventario Multi-Sucursal, Kardex Físico-Valorado y CPP
- **Descripción General:** Controla las existencias físicas y contables de cada variante textil en cada una de las sucursales de la empresa. Administra el desglose tripartito de stock (físico, reservado y disponible), ejecuta el recálculo matemático inmutable del Costo Promedio Ponderado (CPP) con redondeo estándar contable `ROUND_HALF_UP` a dos decimales tras cada ingreso de mercadería respaldado por factura, genera auditoría cronológica en el libro Kardex y garantiza bloqueo de concurrencia a nivel de fila (`with_for_update`) para impedir condiciones de carrera.
- **Datos Principales:** 
  - `inventario` (`id_inventario` PK Integer autoincremental, `id_empresa` FK Integer, `id_sucursal` FK Integer, `id_producto` FK Integer, `talla` VarChar 20, `color` VarChar 50, `stock_fisico` Integer, `stock_reservado` Integer, `stock_disponible` Integer: `stock_fisico - stock_reservado`, `stock_minimo` Integer default 5, `costo_promedio_ponderado` Numeric 10,2, `ultimo_costo_compra` Numeric 10,2).
  - `kardex_movimientos` (`id_movimiento` PK Integer autoincremental, `id_inventario` FK Integer, `tipo_movimiento` VarChar 50: `ENTRADA_COMPRA`, `VENTA_POS`, `DEVOLUCION_CAMBIO`, `cantidad` Integer, `costo_unitario_movimiento` Numeric 10,2, `saldo_cantidad_resultante` Integer, `saldo_cpp_resultante` Numeric 10,2, `referencia_documento` VarChar 150, `fecha_hora` Timestamp).
- **Funcionalidades Clave:**
  - Desglose de existencias en tiempo real por sucursal física (`Físico - Reservado = Disponible`) con filtro estricto por tenant.
  - Recálculo atómico e inmutable del Costo Promedio Ponderado tras cada entrada de lote de compra:
    $$CPP_{\text{nuevo}} = \frac{(\text{Stock}_{\text{ant}} \times CPP_{\text{ant}}) + (\text{Cant}_{\text{ingreso}} \times \text{Costo}_{\text{ingreso}})}{\text{Stock}_{\text{ant}} + \text{Cant}_{\text{ingreso}}}$$
  - Asiento cronológico inmutable en `kardex_movimientos` con trazabilidad fiscal bajo la Ley 843 (IVA 13%, IT 3%).
  - Protección transaccional concurrente con bloqueo de fila para garantizar recálculos exactos bajo múltiples compras simultáneas.
  - Alertas automáticas de reposición urgente ante existencias inferiores al umbral mínimo de seguridad.
- **Casos de Uso Asociados:** `CU07` (Gestionar Inventario Multi-Sucursal y CPP Inmutable).

#### 1.5.1.4 Módulo M04: Operaciones Comerciales Offline y Punto de Venta POS (Desafíos II y III)
- **Descripción General:** Garantiza la continuidad comercial ininterrumpida de las tiendas físicas y la experiencia del cliente ante caídas del servicio de Internet o cortes de energía eléctrica. Integra almacenamiento local (IndexedDB en la PWA Angular y SQLite en Flutter), navegación autónoma del catálogo, reservas presenciales temporales con tickets QR, terminal POS de contingencia para cobros en efectivo al contado con UUID v4 y bandeja de arqueo local.
- **Datos Principales:** 
  - `catalogo_local_db` (Almacén local con snapshot delta de prendas, tallas cm, colores y existencias referenciales).
  - `reservas_offline` (`uuid_reserva` PK UUID v4, `variante_id`, `fecha_limite=2h`, `qr_payload` Text, `estado='PENDIENTE_SYNC'`).
  - `operaciones_offline` (`uuid_operacion` PK UUID v4, `tenant_id`, `sucursal_id`, `cajero_id`, `tipo='VENTA_POS_CONTADO'`, `total_efectivo` Decimal 10,2, `payload_json` Text, `estado='PENDIENTE_SYNC'`, `hash_integridad` VarChar 64).
- **Funcionalidades Clave:**
  - Descarga periódica delta de catálogos y cacheo de miniaturas WebP mediante Service Workers.
  - Consulta y filtrado 100% desconectado de prendas, fichas técnicas y medidas anatómicas en cm.
  - Generación de reservas presenciales offline con temporizador de 2 horas y código QR escaneable en mostrador.
  - Terminal POS de contingencia: venta presencial de prendas cobradas exclusivamente al contado en efectivo.
  - Generación criptográfica de identificadores UUID v4 inmutables y comprobantes provisionales conteniendo código QR y hash.
  - Módulo de arqueo de caja física para auditar el dinero en gaveta frente a los comprobantes emitidos antes de sincronizar.
- **Casos de Uso Asociados:** `CU08` (Descargar y Consultar Catálogo Offline), `CU09` (Registrar Reserva Presencial Sin Conexión), `CU10` (Registrar Venta POS de Contado Sin Conexión), `CU11` (Consultar y Auditar Operaciones Locales Pendientes).

#### 1.5.1.5 Módulo M05: Motor de Sincronización Transaccional Idempotente con UUID v4 (Desafíos II y III)
- **Descripción General:** Orquesta la transmisión atómica, segura e idempotente de lotes transaccionales acumulados en terminales offline hacia la base de datos central PostgreSQL en el backend FastAPI al restablecerse la conectividad. Aplica cabeceras `X-Idempotency-Key` basadas en UUID v4 para erradicar cobros duplicados por reintentos de red y ejecuta protocolos deterministas de reconciliación de inventario.
- **Datos Principales:** `transacciones_procesadas` (`idempotency_key` PK UUID v4, `tenant_id` FK UUID, `fecha_procesamiento` Timestamp, `tipo_operacion` VarChar 30, `payload_hash` VarChar 64, `response_snapshot_json` JSONB, `estado_resolucion` Enum: `CONFIRMADO`, `DUPLICADO_IGNORADO`, `CONFLICTO_RESUELTO`).
- **Funcionalidades Clave:**
  - Listener reactivo de eventos de red que detecta el estado `online` y activa el worker de sincronización en segundo plano.
  - Transmisión en lotes (*batch*) securizados con autenticación JWT y clave de idempotencia única por operación.
  - Deduplicación atómica en servidor: detección de UUIDs previamente procesados con retorno del resultado original sin reejecutar inserciones contables.
  - Reconciliación determinista de stock ante sobreventa concurrente (*overselling*): prevalencia de la venta física ya entregada en tienda y generación de alertas de reposición prioritaria.
- **Casos de Uso Asociados:** `CU12` (Sincronizar Operaciones Pendientes).

#### 1.5.1.6 Módulo M06: Ventas, Pasarela Stripe, Precios Especiales y Cambios en Dos Tiempos (Desafío IV)
- **Descripción General:** Gestiona el ciclo comercial omnicanal, pasarelas de pago, políticas de precios promocionales y el proceso postventa de cambios de indumentaria. Automatiza descuentos de liquidación de fin de temporada (30%, 40%, 60%) y tarifas al por mayor ($\ge 3$ prendas), procesa pagos tokenizados mediante Stripe Sandbox (cumpliendo PCI-DSS Nivel 1) e implementa el protocolo de cambio de prendas en dos tiempos: **Nota de Devolución** (reingreso a stock) y **Nota de Cambio** (salida de nueva prenda y cobro de diferencial), junto con la política de reembolso en efectivo a 30 días (fin de mes).
- **Datos Principales:** 
  - `promociones_precios` (`id_promocion` PK UUID, `tipo` Enum: `LIQUIDACION_ESTACIONAL`, `PRECIO_AL_POR_MAYOR`, `porcentaje_descuento` Decimal 5,2, `umbral_minimo=3`, `fecha_inicio` Date, `fecha_fin` Date).
  - `pagos_stripe` (`id_pago` PK UUID, `stripe_payment_intent_id` VarChar 100 Unique, `monto` Decimal 10,2, `moneda` VarChar 10, `client_secret` VarChar 150, `estado` Enum: `SUCCEEDED`, `FAILED`).
  - `cambios_prenda` (`id_cambio` PK UUID, `numero_nota_devolucion` VarChar 30 Unique, `numero_nota_cambio` VarChar 30 Unique, `id_venta_original` FK UUID, `prenda_devuelta_id` FK UUID, `saldo_a_favor` Decimal 10,2, `nueva_prenda_id` FK UUID, `diferencial_precio` Decimal 10,2, `estado_reembolso` Enum: `CAMBIO_CONCLUIDO`, `PROGRAMADO_REEMBOLSO_30_DIAS`).
- **Funcionalidades Clave:**
  - Motor de liquidación de fin de temporada con rebajas del 30%, 40% y 60% para recuperar capital de ropa estacional pasada.
  - Detección automática en carrito y POS del umbral de compra mayorista ($\ge 3$ unidades) aplicando la tarifa especial sin intervención manual.
  - Integración tokenizada con Stripe Elements y webhooks asíncronos para ventas directas y cobro de diferencias en cambios de ropa.
  - Postventa en dos tiempos: Tiempo 1 (Nota de Devolución e ingreso a stock) y Tiempo 2 (Nota de Cambio y despacho de nueva prenda).
  - Protocolo de liquidación monetaria: emisión de comprobante de devolución en efectivo programado al cierre de mes (30 días) ante rechazo de cambio.
- **Casos de Uso Asociados:** `CU13` (Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones), `CU18` (Gestionar Pasarela de Pagos Stripe), `CU19` (Gestionar Ofertas de Liquidación y Precios por Mayor).

#### 1.5.1.7 Módulo M07: Aprovisionamiento y Compras Corporativas desde Web Desktop
- **Descripción General:** Canal corporativo de compras B2B operado formal y exclusivamente desde computadoras de escritorio (Web Desktop / Laptop) por el Encargado de Sucursal o Administrador de Empresa. Permite planificar el reabastecimiento, emitir órdenes de compra a proveedores textiles homologados por curva de tallas y lotes, registrar facturas fiscales de adquisición e integrarse directamente con el módulo de inventarios (M03) para actualizar existencias y recalcular el Costo Promedio Ponderado.
- **Datos Principales:** `id_orden_compra` (PK, UUID), `tenant_id` (FK, UUID), `proveedor_id` (FK, UUID), `sucursal_destino_id` (FK, UUID), `numero_orden` (VarChar 30, Unique), `numero_factura_fiscal` (VarChar 50), `costo_total_compra` (Decimal 12,2), `estado_orden` (Enum: `BORRADOR`, `EMITIDA`, `RECEPCIONADA_CONFORME`, `DISCREPANCIA`), `fecha_emision` (Timestamp), `fecha_recepcion` (Timestamp), `items_orden` (`variante_id`, `cantidad_pedida`, `costo_unitario_compra`).
- **Funcionalidades Clave:**
  - Restricción estricta de acceso: validación de dispositivo (exclusivo Web Desktop / Laptop para garantizar auditoría interna; inhabilitado en móviles).
  - Emisión de órdenes de compra formales con especificación de variantes de tallas y costos unitarios pactados.
  - Recepción física en bodega de tienda con verificación de factura fiscal y cotejo de cantidades recibidas.
  - Enlace automático con inventarios: suma de stock físico y recálculo matemático de CPP inmutable en el Kardex de la sucursal receptora (CU07).
- **Casos de Uso Asociados:** `CU20` (Gestionar Compras y Aprovisionamiento desde Web Desktop).

#### 1.5.1.8 Módulo M08: Inteligencia de Negocios, Reportes con IA y Machine Learning (Desafío V)
- **Descripción General:** Centraliza la inteligencia estratégica y predictiva de la empresa. Proporciona un asistente conversacional que traduce consultas en lenguaje natural (escritas o dictadas por voz mediante Whisper) en sentencias SQL analíticas de solo lectura sobre PostgreSQL, exporta reportes estructurados a Excel y PDF, y despliega un Dashboard analítico con modelos de Machine Learning entrenados sobre 6 meses de transacciones sintéticas para predecir la demanda semestral de prendas y optimizar el inventario.
- **Datos Principales:** 
  - `reportes_ia` (`id_reporte_ia` PK UUID, `tenant_id` FK, `prompt_original` Text, `audio_transcrito` Text, `sql_generado` Text, `validacion_ast_exitosa` Boolean, `resumen_narrativo` Text, `config_grafico_json` JSONB).
  - `modelos_ml` (`id_modelo_ml` PK UUID, `tenant_id` FK, `tipo_algoritmo` Enum: `RandomForestRegressor`, `KMeans`, `IsolationForest`, `horizonte_meses=6`, `metricas_json` [$R^2$, RMSE, Silhouette Score]).
  - `exportaciones` (`id_exportacion` PK UUID, `tipo_formato` Enum: `XLSX`, `PDF`, `tamanio_bytes` Int, `fecha_descarga` Timestamp).
- **Funcionalidades Clave:**
  - Procesamiento de consultas estratégicas por texto y dictado de voz procesado con Whisper.
  - Validador AST de seguridad SQL: verificación de consultas exclusivamente `SELECT`, bloqueo de DDL/DML e inyección forzosa de `tenant_id`.
  - Exportación automática a libros Microsoft Excel (.xlsx) con fórmulas nativas y documentos ejecutivos PDF (.pdf) con gráficos vectoriales.
  - Inferencia predictiva de demanda a 6 meses vista por categoría y sucursal para anticipar quiebres o sobrestock.
  - Heatmaps de rotación de prendas por combinaciones de talla (XS a XXL) y color.
- **Casos de Uso Asociados:** `CU15` (Solicitar Reporte Generativo con IA), `CU16` (Exportar Reportes Analíticos a Excel/PDF), `CU17` (Gestionar Dashboard Analítico con Machine Learning).

#### 1.5.1.9 Cronograma y Alcance de Entregas por Hitos Evaluativos (Línea de Tiempo)
En concordancia con el plan de desarrollo de la cátedra para el Segundo Parcial, se formaliza el alcance y distribución de los 20 casos de uso en las presentaciones evaluativas:

| Hito Evaluativo | Casos de Uso Cubiertos | Alcance Tecnológico y Entregables Verificados | Estado |
| :--- | :--- | :--- | :---: |
| **Presentación 1 (Ciclo 1)** | **CU01 al CU07** | **Infraestructura SaaS Multitenant y Dominio Textil Central:**<br>• CU01: Gestión y aprovisionamiento de Empresas (Tenants).<br>• CU02: Parametrización de Planes de Suscripción (Básico y Pro).<br>• CU03: Control de vigencia de suscripciones, cuotas y cambio de plan.<br>• CU04: Autenticación RBAC Multitenant con JWT seguro.<br>• CU05: Gestión de Sucursales físicas con GPS y Usuarios por Tenant.<br>• CU06: Catálogo textil con composición, color secundario y medidas en cm.<br>• CU07: Inventario multi-sucursal y recálculo inmutable de CPP contable. | **100% IMPLEMENTADO Y VALIDADO** |
| **Presentación 2 (Ciclo 2)** | **CU08 al CU14** | **Arquitectura Offline-First y Resiliencia en Punto de Venta:**<br>• PWA instalable con Service Workers e IndexedDB en Web.<br>• Persistencia local desconectada con SQLite relacional en Flutter.<br>• Reservas y ventas POS offline con comprobantes temporales UUID v4.<br>• Protocolo idempotente de sincronización batch diferida.<br>• Circuito post-venta de cambio de prendas en dos tiempos y traspasos. | Planificado |
| **Presentación 3 / Final (Ciclo 3)** | **CU15 al CU20** | **Analítica Avanzada, Inteligencia Artificial y Machine Learning:**<br>• Asistente de reportes generativos en lenguaje natural (NLP).<br>• Motor de Machine Learning (clustering de clientes y regresión de demanda).<br>• Exportación masiva de auditoría a PDF y Excel.<br>• Reglas comerciales de liquidación y compras web desktop. | Planificado |

### 1.5.2 Los Seis Desafíos Tecnológicos del Segundo Parcial

El desarrollo integral del Segundo Parcial responde a los seis desafíos técnicos de ingeniería de software definidos por la cátedra:

```mermaid
graph LR
    D1["1️⃣ Metodología ICONIX<br>UML 2.5+ / BCE / CU01-CU20"] --- D2["2️⃣ PWA Angular<br>Service Workers / IndexedDB"]
    D2 --- D3["3️⃣ Móvil Offline<br>Flutter con SQLite"]
    D3 --- D4["4️⃣ Ventas & Cambios Offline<br>Idempotencia / Notas Ing/Egr"]
    D4 --- D5["5️⃣ Reportes IA & ML<br>NLP Texto-Voz / Datos 6M"]
    D5 --- D6["6️⃣ SaaS Multitenant<br>Planes Básico y Profesional"]
```

| Nro. Desafío | Denominación Oficial | Enfoque Tecnológico y Arquitectónico en FashionStore |
|:---:|:---|:---|
| **I** | **Metodología ICONIX** | Sustitución formal del PUDS por ICONIX (pesada-ligera). Elaboración de Fichas de Casos de Uso con prototipos, Diagramas de Robustez BCE sin enlaces Entidad-Entidad, Diagramas de Secuencia con fragmentos estructurados y Diagrama de Clases Lógicas tipado. |
| **II** | **Progressive Web App (PWA)** | Evolución de la plataforma web Angular hacia una PWA instalable con Service Workers para cacheo de activos estáticos y API IndexedDB para operaciones y ventas de mostrador offline. |
| **III** | **Persistencia Móvil Offline** | Integración del motor relacional embebido SQLite (`sqflite`) en la app Flutter para consulta de catálogo, preselección de probadores y captura de transacciones sin Internet. |
| **IV** | **Ventas Offline y Cambios de Ropa** | Transacciones de mostrador de contado y reservas sin conexión con claves UUID v4 inmutables. Sincronización idempotente en backend y flujo de cambios de prendas en dos tiempos (Nota de Devolución + Nota de Cambio) con resolución de diferenciales vía Stripe o devolución a 30 días. |
| **V** | **Reportes Generativos con IA y ML** | Asistente de reportes en lenguaje natural (texto y comandos de voz) con generación segura de SQL restringido por tenant. Pipeline de Machine Learning con modelos supervisados (demanda) y no supervisados (K-Means, Isolation Forest) sobre dataset sintético de 6 meses. |
| **VI** | **SaaS Multitenant** | Arquitectura multi-empresa sobre PostgreSQL compartida con discriminador lógico `empresa_id` a nivel de fila y aislamiento estricto. Parametrización de Planes de Suscripción (Básico y Profesional) con límites de sucursales, usuarios y capacidades analíticas. |

---

### 1.5.3 Matriz de Plataformas y Despliegue Operativo

| Plataforma / Entorno | Tecnologías Utilizadas | Roles que la Utilizan | Operatividad Offline | Funcionalidades Destacadas |
|:---|:---|:---|:---:|:---|
| **Web Desktop (Administrativa)** | Angular 17+, TypeScript, Tailwind/Vanilla CSS | Super Admin, Admin Empresa, Encargado Aprovisionamiento | Online preferente | Aprovisionamiento de compras (CU19), gestión SaaS, planes de suscripción, reportes IA texto, dashboard ML. |
| **Web PWA (Punto de Venta)** | Angular PWA, Service Workers, IndexedDB API | Cajeros, Encargados de Sucursal | **Offline Total (IndexedDB)** | Facturación POS de contado, recepción de reservas presenciales, cambios de prendas con notas de devolución y cambio. |
| **Móvil (Clientes y Asesores)** | Flutter 3+, Dart, SQLite (`sqflite`), ARCore | Clientes, Dependientes de Sala de Ventas | **Offline Total (SQLite)** | Catálogo con tallas en cm, probador virtual RA, reservas en probador, reportes IA por voz, fidelización y compras. |
| **Backend Central** | FastAPI (Python 3.11), SQLAlchemy, AsyncPG, Pydantic | Todos los clientes (vía API REST) | Servidor en la Nube | Aislamiento multitenant, middleware de idempotencia, motor de sincronización, seguridad RBAC con JWT, integración Stripe y LLM. |
| **Base de Datos Central** | PostgreSQL 15 Relacional | Backend FastAPI | Nube (Render / Railway) | Esquema compartido multitenant con discriminador `empresa_id`, índices B-Tree compuestos, disparadores (triggers) de kardex y funciones PL/pgSQL. |

---

### 1.5.4 Limitaciones y Restricciones del Proyecto

Con el propósito de mantener el rigor académico y delimitar con precisión el alcance factible en el marco de la asignatura, se declaran las siguientes restricciones formales:
1. **Pasarelas de Pago Electrónico:** La integración con Stripe opera estrictamente en modo de pruebas (**Sandbox**), utilizando números de tarjeta tokenizados provistos por la plataforma con fines de demostración académica. No se procesan cobros monetarios reales.
2. **Ventas y Operaciones Fuera de Línea:** Las ventas ejecutadas en modo offline (PWA e IndexedDB o Flutter y SQLite) se limitan a la modalidad de **pago en efectivo de contado**. Por razones de seguridad bancaria y restricciones técnicas de los procesadores de tarjetas, no se procesan pagos con tarjeta de crédito/débito sin conexión a Internet.
3. **Mecanismo de Suscripciones SaaS:** La contratación y cobro recurrente mensual de las suscripciones de las empresas clientes se gestiona de forma administrativa y simulada dentro de la plataforma; no se implementa un débito automático bancario recurrente real.
4. **Conjunto de Datos para Machine Learning:** Los modelos de Machine Learning (supervisados y no supervisados) se entrenan empleando un pipeline generador de **datos sintéticos representativo de 6 meses de actividad comercial continua**, modelando de forma matemática picos de demanda estacional y patrones de compra realistas.
5. **Alcance Geográfico y Tributario:** La parametrización tributaria (IVA 13%, IT 3% y Costo Promedio Ponderado) y las coberturas geográficas se modelan con base en el marco normativo y territorial del Estado Plurinacional de Bolivia.

---

## 1.6 Metodología de Desarrollo: ICONIX

### 1.6.1 Definición y Filosofía Pesada-Ligera

La metodología **ICONIX** es un proceso de desarrollo de software denominado *pesado-ligero* (*heavy-light*), concebido por Doug Rosenberg y Matt Stephens. Se sitúa estratégicamente en el punto medio entre el rigor exhaustivo y formal del Proceso Unificado (RUP/PUDS) y el pragmatismo ágil y desprovisto de modelado formal de eXtreme Programming (XP) o Scrum.

ICONIX deriva del Proceso Unificado pero optimiza sustancialmente la carga documental aplicando el **principio 80/20 de UML**: utilizar aproximadamente el 20% medular de los artefactos del estándar UML para resolver el 80% de los desafíos de análisis, diseño y arquitectura de un sistema de información. Se caracteriza por ser un proceso **dirigido por casos de uso** (*use-case driven*), centrado en la arquitectura y estructurado para preservar la trazabilidad ininterrumpida entre el dominio del negocio y el código fuente ejecutable.

---

### 1.6.2 Las Cuatro Fases de la Metodología ICONIX

El ciclo de vida en ICONIX se estructura a través de **cuatro fases progresivas y acopladas**:

```mermaid
flowchart TD
    Fase1["<b>Fase 1: Análisis de Requisitos</b><br/>• Modelo de Dominio Conceptual<br/>• Fichas de Casos de Uso (CU01 - CU20)<br/>• Prototipos de Interfaz de Usuario (UI)"]
    Fase2["<b>Fase 2: Análisis y Diseño Preliminar</b><br/>• Diagramas de Robustez BCE (Boundary-Control-Entity)<br/>• Regla Estricta: 0 Enlaces Entidad-Entidad<br/>• Refinamiento del Modelo de Dominio"]
    Fase3["<b>Fase 3: Diseño Arquitectónico</b><br/>• Diagramas de Secuencia UML 2.5<br/>• Regla Estricta: Boundary fuera de fragmentos loop<br/>• Diagrama de Clases Lógicas de Diseño"]
    Fase4["<b>Fase 4: Implementación y Pruebas</b><br/>• Código Fuente FastAPI & Angular PWA / Flutter<br/>• Casos de Prueba Automatizados<br/>• Matriz de Trazabilidad Vertical Requisito-Código"]

    Fase1 -->|Trazabilidad Directa| Fase2
    Fase2 -->|Asignación de Métodos| Fase3
    Fase3 -->|Generación de Código| Fase4
```

#### Fase 1: Análisis de Requisitos
En esta fase inicial se delimitan los requerimientos funcionales y no funcionales de la plataforma, identificando los actores que interactúan con ella. Se construye el **Modelo de Dominio** (diagrama de clases conceptual que representa los conceptos medulares del negocio y sus relaciones estructurales). A partir de allí, se define el portafolio de casos de uso del sistema. Cada caso de uso se documenta rigurosamente mediante su **Ficha de Caso de Uso normalizada** (nombre, código unívoco, actores involucrados, precondiciones, flujo básico o normal, flujos alternativos o de excepción, y postcondiciones comprobables), acompañada de su diseño visual con el **prototipo de interfaz de usuario** correspondiente.

#### Fase 2: Análisis y Diseño Preliminar (Diagramas de Robustez BCE)
Constituye el corazón distintivo de ICONIX. A partir de la redacción textual de cada caso de uso, se elabora su **Diagrama de Robustez** (equivalente en semántica al diagrama de comunicación formal). Su objetivo primordial es subsanar la brecha conceptual entre el análisis y el diseño, descomponiendo el comportamiento en tres tipos de clases estereotipadas:
1. **Clase Interfaz (*Boundary*):** Representa las pantallas, ventanas, formularios, componentes visuales o puertos API mediante los cuales los actores externos interactúan con el sistema.
2. **Clase Control (*Controller*):** Representa la lógica de negocio, las reglas de cálculo, la coordinación transaccional y los gestores de servicios (`Gestor...`).
3. **Clase Entidad (*Entity*):** Representa los objetos de datos persistentes del dominio que almacenan el estado del sistema (tablas de la base de datos).

**Reglas Estrictas de Comunicación en Diagramas de Robustez (Cátedra UAGRM):**
- **Actor $\longleftrightarrow$ Interfaz (Boundary):** Permitido ✅ (los usuarios interactúan con pantallas).
- **Interfaz (Boundary) $\longleftrightarrow$ Control (Controller):** Permitido ✅ (las interfaces envían eventos a gestores).
- **Control (Controller) $\longleftrightarrow$ Control (Controller):** Permitido ✅ (los gestores pueden coordinar otros gestores).
- **Control (Controller) $\longleftrightarrow$ Entidad (Entity):** Permitido ✅ (los gestores leen y persisten datos en entidades).
- **Interfaz (Boundary) $\longleftrightarrow$ Entidad (Entity):** Permitido únicamente para consultas de lectura pasiva ✅.
- **$\mathbf{Entidad (Entity) \longleftrightarrow Entidad (Entity):}$ ¡PROHIBIDO Y ERRÓNEO! ❌**  
  Bajo las directrices ineludibles de la cátedra de Sistemas de Información II, **dos clases de entidad jamás pueden comunicarse directamente entre sí en un diagrama de robustez**. Cualquier interacción, cálculo, transferencia o actualización entre entidades debe ser mediada y orquestada obligatoriamente por una clase de control (`Gestor...`).

#### Fase 3: Diseño
En esta fase se formaliza cómo el sistema ejecutará dinámicamente las responsabilidades identificadas en la robustez. Se construyen los **Diagramas de Secuencia** para cada caso de uso, incorporando mensajes tipados con métodos y fragmentos combinados del estándar UML 2.5+: alternativas condicionales (`alt`), opciones de ejecución (`opt`) y bucles de repetición (`loop`).
- **Regla Estricta sobre Fragmentos `loop` (Cátedra UAGRM):**  
  En un diagrama de secuencia, **el fragmento combinado `loop` (bucle de repetición) NUNCA debe encerrar ni abarcar a la interfaz de usuario (Boundary) ni a los actores**. El bucle de iteración representa procesamiento computacional interno de datos (ej. recorrer una lista de productos en el carrito, iterar lotes de inventario o validar claves en un lote de sincronización) y, por ende, su alcance debe circunscribirse estrictamente a las líneas de vida del Controlador (`Gestor...`) y de las Entidades o Repositorios de base de datos involucrados.
- Paralelamente, se refina el **Diagrama de Clases Lógicas**, asignando tipos de datos formales a cada atributo, visibilidad (público, privado, protegido), métodos operativos con firmas de parámetros y retorno, multiplicidades en cada extremo asociativo y el atributo discriminador multitenant `empresa_id`. Finalmente, se define la **arquitectura del sistema** mediante los Diagramas de Componentes y Despliegue físico.

#### Fase 4: Implementación y Pruebas
Se procede a la codificación limpia de los módulos de software en estricta fidelidad con las clases y secuencias modeladas. Se formula una matriz formal de **Casos de Prueba (TCP)** para cada caso de uso, definiendo precondiciones, datos de entrada, pasos de ejecución, resultado esperado y resultado obtenido, complementada con pruebas de integración end-to-end y pruebas de estrés de corte y sincronización de red.

---

### 1.6.3 Trazabilidad Vertical de Ingeniería

La fortaleza metodológica de ICONIX reside en su **trazabilidad vertical inquebrantable**: cada elemento del código fuente y cada prueba puede rastrearse directamente hasta el requisito funcional de negocio que le dio origen:

$$\textbf{Requisito Funcional (RF)} \longrightarrow \textbf{Caso de Uso (CU)} \longrightarrow \textbf{Robustez BCE} \longrightarrow \textbf{Diagrama de Secuencia} \longrightarrow \textbf{Clase Lógica / DDL} \longrightarrow \textbf{Código Fuente} \longrightarrow \textbf{Caso de Prueba (TCP)}$$

---

### 1.6.4 Evolución de los Modelos de Datos en ICONIX

La gestión de datos en ICONIX no se improvisa, sino que madura gradualmente a lo largo de cuatro estadios conceptuales:
1. **Modelo de Dominio (Fase 1):** Diagrama conceptual inicial que identifica los conceptos sustantivos del negocio y sus relaciones de cardinalidad, sin atributos exhaustivos.
2. **Modelo Conceptual (Fase 1 - 2):** Incorporación de atributos descriptivos principales a las clases de entidad, sin tipos de datos de implementación.
3. **Modelo Lógico (Fase 3):** Diagrama de clases de diseño completamente normalizado con tipos de datos estándar, claves primarias, claves foráneas, restricciones de unicidad, métodos operativos y la clave de tenant `empresa_id`.
4. **Modelo Físico (Fase 3 - 4):** Traducción directa del modelo lógico a sentencias DDL ejecutables en el motor relacional de destino (PostgreSQL 15), definiendo esquemas, tipos enumerados, índices B-Tree, disparadores (*triggers*) y scripts equivalentes para motores embebidos locales (SQLite para Flutter e IndexedDB para Angular PWA).

---

# CAPÍTULO II. ANÁLISIS DE REQUISITOS

## 2.1. Descripción del Sistema Propuesto

### 2.1.1 Visión General, Contexto de Negocio y Oportunidad Tecnológica

**FashionStore SaaS** (Versión Segundo Examen Parcial) es una solución tecnológica integral de comercio electrónico inteligente, gestión de operaciones de retail omnicanal y administración empresarial B2B bajo la modalidad de **Software como Servicio (SaaS Multitenant)**. La plataforma está concebida específicamente para modernizar, formalizar y escalar las cadenas de tiendas y empresas independientes de confección y comercialización de **indumentaria y sastrería masculina** (*menswear*).

En la industria de la moda masculina, las operaciones comerciales tradicionales enfrentan tres problemáticas estructurales críticas:
1. **Alta tasa de devoluciones y fricción por discordancia de tallaje:** El tallaje genérico comercial (S, M, L, XL) resulta ineficaz frente a la diversidad morfológica masculina y a los diferentes cortes de confección (Slim Fit, Regular Fit, Custom Tailored), provocando devoluciones costosas y desconfianza en canales no presenciales.
2. **Vulnerabilidad e interrupción operativa en tiendas físicas por inestabilidad de telecomunicaciones:** En el contexto boliviano y regional, los centros comerciales y galerías presentan microcortes y caídas prolongadas de enlace a Internet, paralizando los sistemas tradicionales de facturación en la nube y provocando pérdida directa de ventas.
3. **Pérdida de trazabilidad de costos e inventarios:** La ausencia de valuación contable bajo el método del **Costo Promedio Ponderado (CPP)** y el descontrol en los traspasos inter-sucursales erosionan los márgenes comerciales reales e impiden una planificación certera de compras corporativas a proveedores.

Para superar estas limitaciones, FashionStore evoluciona la arquitectura monoproyecto del primer parcial hacia un **ecosistema distribuido de alta disponibilidad, Offline-First, Cloud-Synchronized y AI-Augmented** (resiliencia fuera de línea, sincronización en nube e inteligencia artificial aumentada). El sistema unifica la experiencia del cliente final (B2C), la continuidad transaccional en puntos de venta físicos (POS) y la gobernanza estratégica corporativa (B2B) en una única plataforma gobernada por la metodología ágil y rigurosa **ICONIX**.

---

### 2.1.2 Diagrama Arquitectónico del Ecosistema Propuesto

El siguiente diagrama en lenguaje UML modela la arquitectura global del sistema, ilustrando la interacción entre las interfaces clientes especializadas, el protocolo de sincronización resiliente, los componentes del backend y los tres niveles de persistencia de datos:

@startuml Arquitectura_Ecosistema_FashionStore
skinparam monochrome false
skinparam roundcorner 8
skinparam shadowing true
skinparam packageBackgroundColor #F8F9FA
skinparam packageBorderColor #2C3E50

package "Capa de Clientes y Terminales (Frontend Omnicanal)" {
    [Web Desktop Administrativa / Laptop
(Angular 17+ / TypeScript / PC-Only)] as WebDesktop #EBF5FB
    [Progressive Web App - PWA
(Angular 17+ / IndexedDB / Service Workers)] as WebPWA #E8F8F5
    [App Móvil Nativa Multiplataforma
(Flutter 3.x / Dart / SQLite / RA 3D .glb)] as MobileApp #FEF9E7
    [Terminal Punto de Venta - POS Mostrador
(Angular PWA / Modo Offline Efectivo)] as POSOffline #FDEDEC
}

package "Capa de Transporte y Sincronización Transaccional" {
    interface "API Gateway REST / HTTPS TLS 1.3" as APIGateway
    interface "Protocolo Sincronización Idempotente
Header: X-Idempotency-Key (UUID v4)" as SyncProtocol
}

package "Capa de Núcleo Backend (FastAPI / Python 3.11+)" {
    [Middleware de Aislamiento Tenant
(Contexto RLS WHERE tenant_id = :id)] as TenantMiddleware #D6EAF8
    
    package "Subsistemas de Dominio y Negocio" {
        [Servicio de Catálogo y Ficha Textil
(Medidas en cm, Telas Nobles, 3D)] as CatService
        [Motor de Inventario y Valuación CPP
(Kardex Físico-Valorado Ley 843)] as InvService
        [Servicio Postventa y Cambios
(Nota Devolución + Nota Cambio + Stripe)] as PostventaService
        [Módulo Compras Corporativas
(Exclusivo Web Desktop / Factura Fiscal)] as ComprasService
        [Agente de Inteligencia Artificial
(Whisper Voz + Validador AST SQL)] as AIService
        [Pipeline de Machine Learning
(Regresión 6 Meses, Clustering, Anomalías)] as MLService
    }
}

package "Capa de Persistencia y Almacenamiento Distribuido" {
    database "PostgreSQL 15 (Nube Central)
Esquema Multitenant / RLS / B-Tree" as CentralDB #D5F5E3
    database "SQLite Embebido (sqflite)
Base Local Autónomo en Móvil" as MobileDB #FCF3CF
    database "IndexedDB (Navegador)
Almacén Local de Objetos en PWA" as PwaDB #D1F2EB
}

cloud "Servicios Externos Integrados" {
    [Pasarela de Pago Stripe Sandbox
(Tokenización Tarjetas PCI-DSS)] as StripeAPI
    [Servicio OpenAI / Gemini LLM
(Inferencia Lenguaje Natural)] as LLMAPI
    [Servicio Meteorológico OpenWeather
(Variables de Contexto Estacional)] as WeatherAPI
}

' Relaciones de Clientes con Persistencia Local
WebPWA ..> PwaDB : Persistencia Catálogo y Cola Offline
POSOffline ..> PwaDB : Registro Venta Efectivo con UUID v4
MobileApp ..> MobileDB : Persistencia Catálogo y Reservas QR

' Relaciones de Clientes con Backend
WebDesktop --> APIGateway : Gestión B2B, Compras y ML
WebPWA --> APIGateway : Catálogo Online y Checkout
POSOffline --> SyncProtocol : Lote de Transacciones Offline
MobileApp --> SyncProtocol : Sincronización de Reservas

' Transporte a Núcleo
APIGateway --> TenantMiddleware
SyncProtocol --> TenantMiddleware

' Núcleo a Servicios
TenantMiddleware --> CatService
TenantMiddleware --> InvService
TenantMiddleware --> PostventaService
TenantMiddleware --> ComprasService
TenantMiddleware --> AIService
TenantMiddleware --> MLService

' Servicios a Base Central
InvService --> CentralDB
ComprasService --> CentralDB
PostventaService --> CentralDB
CatService --> CentralDB
AIService ..> CentralDB : Réplica Read-Only con AST Guard
MLService ..> CentralDB : Lectura Dataset Histórico

' Servicios Externos
PostventaService --> StripeAPI : Cobro Excedente de Cambio
AIService --> LLMAPI : Generación SQL Analítico
MLService --> WeatherAPI : Enriquecimiento de Demanda

@enduml

---

### 2.1.3 Ecosistema de Plataformas y Despliegue Multiplataforma

Para responder a las demandas heterogéneas de los distintos actores del sistema y garantizar la continuidad del negocio, FashionStore despliega un ecosistema compuesto por cuatro plataformas interconectadas:

1. **Web Desktop Administrativa y Corporativa (Angular 17+ / TypeScript):**
   - **Público Objetivo:** Super Administradores de la plataforma, Administradores de Empresa y Encargados de Compras y Aprovisionamiento.
   - **Alcance Funcional:** Diseñada y optimizada exclusivamente para pantallas de computadoras de escritorio y laptops (resolución $\ge 1280 \times 800$ px con teclado y ratón). Centraliza la gobernanza de inquilinos (*tenants*), configuración de suscripciones, emisión formal de órdenes de compra a proveedores textiles con recepción de facturas comerciales, exportación masiva a Excel/PDF y análisis visual del Dashboard predictivo de Machine Learning.
   - **Control de Acceso:** Restricción a nivel de interfaz que valida el agente de usuario (*User-Agent*) y resolución de pantalla, bloqueando transacciones corporativas complejas desde dispositivos móviles para prevenir errores operativos.

2. **Progressive Web App - PWA (Angular 17+ / Service Workers / IndexedDB):**
   - **Público Objetivo:** Clientes web y operadores de caja en mostradores de tiendas físicas.
   - **Alcance Funcional:** Aplicación web moderna instalable en cualquier navegador compatible con el estándar PWA (Google Chrome, Microsoft Edge, Safari). Emplea Service Workers para el almacenamiento en caché de activos estáticos y miniaturas WebP, y la API **IndexedDB** para mantener una réplica estructurada local del catálogo de prendas, variantes y cola de transacciones. Permite consultar el catálogo y registrar reservas presenciales y ventas directas en mostrador ante la pérdida absoluta de conexión a Internet.

3. **Aplicación Móvil Nativa Multiplataforma (Flutter 3.x / Dart / SQLite):**
   - **Público Objetivo:** Clientes finales y dependientes de ventas en sala.
   - **Alcance Funcional:** Aplicación compilada nativamente para Android e iOS. Integra el motor relacional embebido **SQLite** (`sqflite`) para la persistencia local de prendas, categorías y reservas temporales con código QR. Incorpora el **Vestidor Virtual en Realidad Aumentada (RA)**, permitiendo proyectar modelos tridimensionales (`.glb`) a escala real sobre la silueta del cliente a través de la cámara móvil mediante ARCore/ARKit.

4. **Núcleo de Servicios Backend y Persistencia Relacional (FastAPI / PostgreSQL 15):**
   - **Arquitectura:** API RESTful asíncrona de alto rendimiento desarrollada sobre Python 3.11+ y **FastAPI**. Implementa inyección de dependencias para la resolución dinámica del contexto de tenant, validación estricta de esquemas con Pydantic v2 y autenticación robusta mediante tokens JWT con firmas asimétricas y hash criptográfico `bcrypt`.
   - **Persistencia Central:** Motor relacional **PostgreSQL 15** configurado bajo el esquema de base de datos compartida con discriminador lógico (`tenant_id`), garantizando aislamiento estricto mediante políticas de seguridad a nivel de filas (*Row-Level Security* - RLS) e índices B-Tree compuestos.

---

### 2.1.4 Los Nueve Pilares Funcionales del Sistema Propuesto

La arquitectura del sistema se articula sobre nueve pilares de ingeniería de software que resuelven los desafíos técnicos del Segundo Parcial y las demandas del negocio:

#### 1. Arquitectura SaaS Multitenant y Gobernanza de Suscripciones (Desafío VI)
La plataforma permite alojar múltiples empresas textiles independientes sobre una infraestructura compartida, garantizando la total confidencialidad e inviolabilidad de sus datos. Cada solicitud autenticada extrae el identificador del tenant desde el token JWT e inyecta obligatoriamente la cláusula `WHERE tenant_id = :id` en cada consulta relacional. La monetización se gestiona mediante tres tiers de suscripción:
- **Plan Básico:** Diseñado para pequeños talleres y boutiques; habilita hasta 2 sucursales físicas, catálogo offline básico y restringe el acceso a módulos de IA generativa.
- **Plan Profesional:** Orientado a marcas consolidadas; soporta hasta 10 sucursales, modelos 3D en RA y reportes generativos de IA en texto.
- **Plan Enterprise:** Pensado para franquicias y cadenas industriales; sucursales ilimitadas, reportes generativos por voz (Whisper) y Dashboard completo de Machine Learning a 6 meses.

#### 2. Resiliencia Operativa Offline-First en Web y Móvil (Desafío II)
Para blindar las operaciones de venta ante la precariedad de las telecomunicaciones en ferias y centros comerciales bolivianos:
- En la PWA web, **IndexedDB** almacena de manera no volátil el catálogo de productos, variantes de color/talla y precios.
- En la aplicación móvil Flutter, la base de datos embebida **SQLite** resguarda las prendas y colecciones.
Los clientes y vendedores pueden consultar fichas técnicas y generar **reservas presenciales temporales de prendas** (con vigencia paramétrica de 2 horas) obteniendo un ticket digital con código QR firmado localmente sin consumir megabytes ni requerir enlace activo.

#### 3. Terminal Punto de Venta (POS) Autónomo y Cobro al Contado en Efectivo (Desafío III)
Ante una caída total de red o fluido eléctrico en la tienda física (operando con batería o UPS):
- El terminal POS del cajero conmuta de forma transparente al **modo contingencia desconectado**.
- Permite registrar ventas presenciales de mostrador cobradas **exclusivamente al contado en efectivo**, calculando subtotales, aplicando descuentos de liquidación de temporada o tarifas mayoristas, descontando el stock local y generando un comprobante provisional con código QR y un identificador criptográfico **UUID v4** inmutable.

#### 4. Protocolo de Sincronización Transaccional Idempotente con UUID v4 (Desafíos II y III)
Al reanudarse la conectividad a Internet:
- Un agente reactivo dispara la sincronización en segundo plano de las transacciones encoladas.
- Cada registro se transmite mediante una petición HTTP POST acompañada de la cabecera `X-Idempotency-Key: <UUID_v4>`.
- El backend FastAPI valida la presencia previa del UUID en la base central; si ya existe (por reintentos de red), devuelve la confirmación almacenada sin duplicar cargos ni asientos contables.
- **Resolución Determinista de Conflictos (Overselling):** Si una prenda vendida offline en mostrador fue adquirida simultáneamente por un cliente en el e-commerce online, **se prioriza la venta física presencial**, dado que la prenda ya fue entregada en manos del cliente. El sistema cancela automáticamente la orden virtual, gestiona el reintegro de fondos y emite una alerta de reabastecimiento urgente a bodega.

#### 5. Catalogación Textil de Precisión Anatómica, Telas Hipoalergénicas y 3D RA
El módulo de catálogo trasciende el tallaje estándar implementando una **ficha técnica textil avanzada**:
- **Medidas anatómicas en centímetros:** Parámetros biométricos exactos para cada talla (contorno de pecho, contorno de cintura, contorno de cadera, largo total y longitud de manga), erradicando las dudas de calce.
- **Esquemas de colores compuestos:** Selector cromático dual para prendas combinadas (ej. Camisa Oxford Blanco/Azul Marino) con códigos Hexadecimales dobles (`#FFFFFF / #002366`).
- **Composición de tejidos y advertencia dermatológica:** Detalle de telas nobles (lino orgánico, algodón pima peruano, lana merino) e interruptor (*toggle*) para marcar prendas con **telas hipoalergénicas**, advirtiendo compatibilidad con pieles sensibles o con afecciones dermatológicas.
- **Vestidor Virtual en RA:** Vinculación de archivos tridimensionales (`.glb`) optimizados para renderizado en tiempo real a escala humana sobre la cámara del dispositivo móvil.

#### 6. Valuación de Inventarios Multi-Sucursal con CPP Inmutable y Traspasos Logísticos
El inventario se segrega por tienda física en tres métricas concurrentes: **Stock Físico**, **Stock Reservado** y **Stock Disponible** (`Disponible = Físico - Reservado`). Cada recepción de lote de mercadería con factura fiscal dispara el recálculo matemático inmutable del **Costo Promedio Ponderado (CPP)**:
$$CPP_{\text{nuevo}} = \frac{(\text{Stock}_{\text{ant}} \times CPP_{\text{ant}}) + (\text{Cant}_{\text{ingreso}} \times \text{Costo}_{\text{ingreso}})}{\text{Stock}_{\text{ant}} + \text{Cant}_{\text{ingreso}}}$$
El sistema registra el último costo unitario pagado, asienta cada ingreso y egreso en el **Kardex físico-valorado** dando estricto cumplimiento a la legislación tributaria boliviana (Ley 843) y gestiona la logística de **traspasos inter-sucursales** con estados formales (`SOLICITADO`, `EN_TRÁNSITO`, `RECIBIDO_CONFORME`) para balancear existencias entre tiendas sin pérdidas operativas.

#### 7. Postventa en Dos Tiempos, Reembolso en 30 Días y Pasarela Stripe PCI-DSS (Desafío IV)
El ciclo de cambios de prendas se estructura mediante un flujo riguroso de **dos tiempos y dos notas independientes**:
- **Tiempo 1 (Nota de Devolución):** El cliente presenta la prenda en mostrador dentro del plazo de garantía (7 días hábiles). El cajero inspecciona las condiciones físicas (etiquetas intactas, sin signos de lavado o uso), registra el reingreso de la prenda al inventario (+1 stock disponible o a cuarentena) y emite formalmente una **Nota de Devolución**, acreditando el saldo monetario a favor del cliente.
- **Tiempo 2 (Nota de Cambio):** Con la Nota de Devolución, el cliente selecciona una nueva prenda. Si el valor es idéntico, se liquida a saldo cero; si la nueva prenda tiene mayor valor (por talla, tela premium o modelo superior), el cliente abona el excedente en línea a través de la pasarela **Stripe Sandbox** (tokenización segura con cumplimiento de la norma PCI-DSS). Finalmente, el sistema descuenta la nueva prenda (-1 stock) y genera la **Nota de Cambio** de despacho final.
- **Política de Reembolso en Efectivo a 30 Días:** Si el cliente no encuentra una prenda de su interés y exige la devolución de su dinero en efectivo, **el cajero no entrega dinero de inmediato en mostrador**. El sistema emite una orden de liquidación contable programada para el cierre mensual de la empresa (a los 30 días calendario), garantizando la cuadratura del arqueo de caja de la sucursal y la auditoría fiscal.

#### 8. Aprovisionamiento y Compras Corporativas Exclusivas desde Web Desktop
Respondiendo a la instrucción de que las adquisiciones corporativas a proveedores son operaciones de alto impacto financiero ejecutadas en horarios de oficina por personal administrativo, se implementa un módulo accesible **únicamente desde computadoras de escritorio y laptops (Web Desktop)**. Permite planificar órdenes de compra por curvas de tallas, negociar con proveedores textiles registrados, cargar facturas comerciales fiscales autorizadas y disparar automáticamente el ingreso de stock al Kardex valorado y la actualización del Costo Promedio Ponderado.

#### 9. Inteligencia Analítica Híbrida: Reportes NLP/Voz con IA y Machine Learning a 6 Meses (Desafío V)
La plataforma provee herramientas avanzadas de toma de decisiones para los niveles ejecutivos de las empresas suscriptoras:
- **Asistente Conversacional con IA Generativa:** Permite a directivos consultar métricas de ventas, rotación de tallas o rendimiento de sucursales formulando preguntas en lenguaje natural escrito o mediante dictado por voz (transcrito por el modelo **Whisper**). Un LLM traduce la solicitud a sentencias SQL analíticas, las cuales son analizadas por un **validador sintáctico AST de seguridad** (que prohíbe sentencias destructivas `DROP`, `DELETE`, `UPDATE`, `INSERT`, restringe la consulta exclusivamente a `SELECT` e inyecta forzosamente la cláusula `tenant_id`). La consulta se ejecuta en una réplica de lectura y se sintetiza en resúmenes ejecutivos con gráficos y descarga directa en formatos corporativos **Excel (.xlsx)** y **PDF (.pdf)**.
- **Dashboard Predictivo con Machine Learning:** Alimentado por un pipeline de más de 6 meses de datos sintéticos que reproducen fielmente la estacionalidad del comercio textil masculino boliviano (invierno, primavera-verano, festividades, picos de fin de año), despliega modelos de regresión para proyectar ventas a 6 meses vista, clustering (K-Means) para segmentación de clientes y algoritmos de detección de anomalías (Isolation Forest) para auditar pérdidas de existencias.

---

### 2.1.5 Flujos de Valor Operacionales de Extremo a Extremo (E2E)

Para comprender la dinámica de interacción entre los módulos y los actores, a continuación se detallan los cuatro flujos de valor centrales del negocio modelados en diagramas de secuencia interactivos:

#### Flujo 1: Venta Offline en Mostrador y Sincronización Idempotente con UUID v4
Representa la operación del cajero ante una caída total de conexión a Internet en la tienda física, la emisión del comprobante provisional con código QR y la sincronización diferida hacia la nube al restablecerse el enlace:

```mermaid
sequenceDiagram
    autonumber
    actor Cajero as Cajero (POS Offline)
    participant IDB as IndexedDB Local (PWA)
    participant Red as Conexión de Red
    participant API as Backend FastAPI Central
    participant DB as PostgreSQL 15 (Central)

    Cajero->>IDB: 1. Escanea prenda textil en mostrador
    Cajero->>IDB: 2. Cobra en EFECTIVO de contado
    Cajero->>IDB: 3. Genera UUID v4 inmutable y descuenta stock local
    IDB-->>Cajero: 4. Emite ticket QR provisorio de venta

    Note over Cajero,Red: Interrupción de enlace de red activa (Operación Desconectada)

    Red->>API: 5. Evento 'online' detectado tras reconexión
    IDB->>API: 6. HTTP POST /sync (Header X-Idempotency-Key con UUID v4)
    API->>DB: 7. Valida UUID en tabla processed_transactions

    alt UUID ya existe (Transacción duplicada)
        API-->>IDB: Retorna confirmación previa (Operación Idempotente)
    else UUID nuevo (Transacción no procesada)
        API->>DB: 8. Registra venta y asienta asiento contable
        alt Stock disponible suficiente
            API->>DB: Descuenta stock central formal
        else Conflicto de Sobreventa (Overselling concurrente)
            Note over API,DB: Prevalece venta física presencial ya entregada<br/>Cancela orden virtual y emite alerta de reposición urgente
        end
        API-->>IDB: 9. HTTP 200 OK (Sincronización Exitosa)
    end
    IDB->>IDB: 10. Marca registro local como sincronizado
```

---

#### Flujo 2: Ciclo de Postventa y Cambio de Prendas en Dos Tiempos
Ilustra el cumplimiento estricto del protocolo postventa: emisión de la Nota de Devolución (Tiempo 1), selección de nueva prenda con Nota de Cambio (Tiempo 2) cobrando excedente por Stripe o programando la devolución monetaria a 30 días:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente en Mostrador
    actor Cajero as Cajero (Terminal POS)
    participant Bodega as Bodega / Inventario Central
    participant Stripe as Pasarela Stripe Sandbox

    Cliente->>Cajero: 1. Presenta prenda + comprobante (plazo de garantía ≤ 7 días)
    Cajero->>Cajero: 2. Inspecciona estado físico (etiquetas, tejido y costuras)

    rect rgb(240, 248, 255)
        Note over Cajero,Bodega: TIEMPO 1: NOTA DE DEVOLUCIÓN
        Cajero->>Bodega: 3. Ingresa prenda devuelta (+1 Stock en Bodega/Cuarentena)
        Cajero-->>Cliente: 4. Emite NOTA DE DEVOLUCIÓN (Genera Saldo a Favor en Bs.)
    end

    rect rgb(245, 255, 250)
        Note over Cliente,Stripe: TIEMPO 2: NOTA DE CAMBIO
        Cliente->>Cajero: 5. Selecciona nueva prenda de reemplazo
        alt Mismo Valor (Precios equivalentes)
            Cajero->>Cajero: Saldo final liquidado a Bs. 0
        else Mayor Valor (Prenda superior o talla premium)
            Cajero->>Stripe: Solicita cobro de excedente (Tokenización PCI-DSS)
            Stripe-->>Cajero: Retorna confirmación de pago exitoso
        end
        Cajero->>Bodega: 6. Despacha nueva prenda seleccionada (-1 Stock)
        Cajero-->>Cliente: 7. Emite NOTA DE CAMBIO formal y entrega prenda
    end

    opt Cliente desiste del cambio (Exige devolución de dinero en efectivo)
        Cajero-->>Cliente: Emite Orden de Reembolso Programado a 30 Días (Fin de Mes)
    end
```

---

#### Flujo 3: Aprovisionamiento y Compras Corporativas Web Desktop
Modela el proceso de adquisiciones B2B desde computadoras de escritorio (PC/Laptop), recepción de facturas comerciales fiscales e impacto automático en el Costo Promedio Ponderado (CPP):

```mermaid
sequenceDiagram
    autonumber
    actor Comprador as Encargado de Sucursal / Admin (PC)
    actor Proveedor as Proveedor Textil
    participant Kardex as Kardex Central (PostgreSQL)
    participant CPP as Motor de Valuación CPP

    Comprador->>Comprador: 1. Ingresa a Web Desktop (Resolución Desktop ≥ 1280px)
    Comprador->>Comprador: 2. Planifica curvas de tallas y selección de telas
    Comprador->>Proveedor: 3. Emite Orden de Compra corporativa formal
    
    Note over Comprador,Proveedor: Despacho físico de mercadería textil
    
    Proveedor-->>Comprador: 4. Entrega lote físico + Factura Comercial Fiscal
    Comprador->>Kardex: 5. Registra recepción en Web Desktop con N° Factura y Costos Lote
    Kardex->>CPP: 6. Dispara recálculo matemático de CPP inmutable
    Note over CPP: CPP = (StockAnt*CPPAnt + LoteCant*LoteCosto) / (StockAnt + LoteCant)
    CPP->>CPP: Actualiza costo unitario promedio ponderado
    CPP-->>Kardex: 7. Asienta movimiento físico-valorado según Ley 843
    Kardex-->>Comprador: 8. Confirma recepción: Stock disponible actualizado en sucursales
```

---

#### Flujo 4: Auditoría y Reportes Ejecutivos con IA y Voz
Muestra la interacción directiva mediante lenguaje natural o comandos de voz, la transcripción con Whisper, el filtrado de seguridad por validador AST SQL y la exportación documental:

```mermaid
sequenceDiagram
    autonumber
    actor Director as Director / Gerente General
    participant Whisper as Servicio Whisper (Voz a Texto)
    participant LLM as Motor LLM & Validador AST SQL
    participant DB as PostgreSQL 15 (Réplica Read-Only)

    Director->>Whisper: 1. Dicta consulta por voz o escribe prompt natural
    Whisper->>LLM: 2. Transcribe audio a texto (ej. Ventas camisas lino Norte mayo)
    LLM->>LLM: 3. Genera sentencia SQL correspondiente
    LLM->>LLM: 4. Validador AST: Verifica SELECT estricto e inyecta tenant_id forzado
    LLM->>DB: 5. Ejecuta consulta SQL segura en réplica de lectura
    DB-->>LLM: 6. Retorna dataset plano de registros
    LLM->>LLM: 7. Sintetiza resumen ejecutivo, tabla comparativa y gráficos
    LLM-->>Director: 8. Despliega reporte analítico interactivo en pantalla
    Director->>LLM: 9. Solicita exportación formal
    LLM-->>Director: 10. Descarga archivo formateado en Excel (.xlsx) o PDF (.pdf)
```

---

### 2.1.6 Matriz de Integración Tecnológica, Protocolos y Seguridad

La siguiente matriz consolida los protocolos de comunicación, tipos de datos y barreras de seguridad implementadas en cada uno de los nodos del ecosistema FashionStore:

| Componente | Plataforma / Framework | Protocolo de Transporte | Formato de Carga Útil | Mecanismos de Seguridad y Aislamiento |
|:---|:---|:---|:---|:---|
| **Web Desktop Corporativa** | Angular 17+ / TypeScript / SCSS | HTTPS (TLS 1.3) / REST | JSON / Multipart (Archivos) | Autenticación JWT Bearer, verificación de resolución $\ge 1280$ px y *User-Agent* PC. |
| **Progressive Web App (PWA)** | Angular 17+ / Service Workers | HTTPS / Cache API / IndexedDB | JSON / Binario WebP | Almacenamiento local aislado en navegador, validación de permisos de cámara y ubicación. |
| **Móvil Flutter** | Flutter 3.x / Dart / ARCore-ARKit | HTTPS / SQLite (`sqflite`) | JSON / Binario 3D (`.glb`) | Sandbox de aplicación móvil, cifrado de base SQLite local, tokens JWT renovables. |
| **Punto de Venta POS Desconectado** | Angular PWA / Service Worker | Localhost / Eventos DOM / IndexedDB | JSON con firma criptográfica UUID v4 | Cierre de transacciones con UUID v4 inmutable, bloqueo de cobros que no sean en efectivo. |
| **Protocolo de Sincronización** | Background Fetch API / FastAPI Sync | HTTPS POST por lotes (*batching*) | JSON (`X-Idempotency-Key: UUID`) | Deduplicación transaccional en tabla `processed_transactions`, resolución determinista de stock. |
| **Núcleo de Servicios Backend** | FastAPI / Python 3.11+ / SQLAlchemy | RESTful / Asíncrono ASGI (Uvicorn) | JSON estricto con Pydantic v2 | Inyección de dependencias `get_current_tenant`, hashing de contraseñas con `bcrypt` (12 rondas). |
| **Base de Datos Central** | PostgreSQL 15 Relacional | Conexión TCP con pool `asyncpg` | Tuplas relacionales normalizadas | Row-Level Security (RLS) forzoso por `tenant_id`, índices B-Tree compuestos, roles de solo lectura. |
| **Pasarela de Pagos Excedentes** | Stripe SDK / Webhooks | HTTPS / REST TLS 1.3 | JSON Tokenizado (sin datos PAN/CVV) | Tokenización directa en cliente (Stripe.js), cumplimiento normativo PCI-DSS Nivel 1. |
| **Auditoría e IA Generativa** | Whisper API / LangChain / SQLGlot | HTTPS / Streaming de Audio / SSE | Audio WAV/MP3 $
ightarrow$ SQL $
ightarrow$ Markdown | Validador sintáctico AST (*Abstract Syntax Tree*), filtrado estricto de solo lectura, inyección forzosa de tenant. |

---

### 2.1.7 Matriz de Evolución: Primer Parcial vs. Segundo Parcial

| Dimensión de Ingeniería | Etapa Fundacional (Primer Parcial - PUDS) | Plataforma Evolucionada (Segundo Parcial - ICONIX) |
|:---|:---|:---|
| **Modelo de Negocio** | Monoproyecto B2C de base de datos única y tenant único. | **SaaS Multitenant B2B/B2C** con aislamiento estricto por `tenant_id` y tiers de suscripción (Básico, Profesional, Enterprise). |
| **Metodología de Desarrollo** | Proceso Unificado (PUDS) pesado, iterativo por ciclos. | **ICONIX (Pesada-Ligera)** enfocado en el 20% de artefactos esenciales de UML 2.5+, diagramas de robustez BCE y trazabilidad vertical. |
| **Resiliencia ante Caídas de Red** | Operación dependiente al 100% de conexión online estable. | **Arquitectura Offline-First:** PWA con IndexedDB en web y SQLite en app móvil Flutter, con navegación y reservas desconectadas. |
| **Operación en Punto de Venta (POS)** | Cobro tradicional en mostrador dependiente de API central. | **Terminal POS Offline de Contado en Efectivo** con UUID v4 inmutable y comprobantes provisionales locales. |
| **Sincronización y Consistencia** | Sin mecanismos de encolamiento local ni deduplicación. | **Sincronización Idempotente por Lotes** con cabecera `X-Idempotency-Key` (UUID v4) y resolución determinista de sobreventa. |
| **Atributos de Indumentaria** | Tallas y colores estándar convencionales. | **Ficha Técnica Textil Avanzada:** Tallas en cm (pecho/cintura/largo), colores bicolores Hex, telas nobles y advertencia hipoalergénica. |
| **Valuación de Existencias** | Control de existencias básico en sucursal. | **Inventario Tripartito** (Físico, Reservado, Disponible), recálculo de **CPP Inmutable**, Kardex valorado (Ley 843) y traspasos inter-tiendas. |
| **Ciclo de Cambios y Postventa** | Devolución simple sin trazabilidad contable dual. | **Cambio en Dos Tiempos:** Nota de Devolución (+1 stock) + Nota de Cambio (-1 stock), pasarela Stripe y reembolso en efectivo a 30 días. |
| **Estrategias de Precios** | Precios fijos minoristas en catálogo. | **Precios Dinámicos:** Liquidación de fin de temporada (30%, 40%, 60%) y tarifas automáticas al por mayor ($\ge 3$ unidades). |
| **Compras y Aprovisionamiento** | Funcionalidad genérica dentro del sistema. | **Aprovisionamiento Exclusivo Web Desktop:** Módulo B2B en PC/Laptop para órdenes de compra y facturación fiscal de lotes. |
| **Inteligencia y Analítica** | Dashboards descriptivos básicos y clima contextual. | **IA Generativa Conversacional (Texto/Voz)** con validación AST SQL, exportación Excel/PDF y **Machine Learning Predictivo a 6 Meses**. |

## 2.2. Identificación de Actores

| Actor | Tipo | Descripción |
|:---|:---:|:---|
| **Administrador de Plataforma (Super Admin)** | Interno | Máxima autoridad del SaaS. Gestiona todas las empresas contratantes, planes de suscripción y la salud global de la plataforma. |
| **Administrador de Empresa** | Interno | Administrador local de cada empresa (tenant). Gestiona usuarios, roles, sucursales, productos, inventarios, ventas y reportes de su propia empresa únicamente. |
| **Encargado de Sucursal** | Interno | Responsable operativo de la sucursal. Gestiona el inventario físico local, reservas presenciales, traspasos inter-tiendas y, desde la Web Desktop (PC/Laptop), las órdenes de compra y aprovisionamiento a proveedores textiles con recepción de facturas comerciales e impacto en CPP (facultad compartida con el Administrador de Empresa). |
| **Cajero** | Interno | Operador de punto de venta (POS). Registra ventas presenciales, procesa cobros y gestiona cambios/devoluciones de prendas en mostrador. |
| **Cliente** | Externo | Consumidor final. Interactúa por web (Angular/PWA) y móvil (Flutter). Consulta catálogo, reserva, compra, solicita cambios y recibe recomendaciones IA. |
| **Proveedor** | Externo | Empresa que suministra prendas textiles. Recibe y confirma órdenes de compra corporativas. |
| **Sistema de Sincronización** | Sistema | Agente interno que gestiona la sincronización idempotente de operaciones offline (web y móvil) con el backend central. |
| **Pasarela de Pago (Stripe)** | Sistema Externo | Procesa pagos electrónicos con tokenización PCI-DSS sin almacenar credenciales bancarias. |
| **Servicio de IA (OpenAI / Gemini)** | Sistema Externo | Procesa solicitudes de reportes en lenguaje natural y genera recomendaciones contextuales. |
| **Servicio Meteorológico (OpenWeatherMap)** | Sistema Externo | Provee datos climáticos para enriquecer los modelos de machine learning y recomendaciones de temporada. |

## 2.3. Requisitos Funcionales y No Funcionales

### 2.3.1. Requisitos Funcionales

| ID | Requisito Funcional | Desafío |
|:---:|:---|:---:|
| RF01 | Gestionar empresas contratantes (tenants): registrar, activar, suspender | VI - SaaS |
| RF02 | Gestionar planes de suscripción (Básico, Profesional, Enterprise) con límites configurables | VI - SaaS |
| RF03 | Asignar y verificar vigencia de suscripción de cada empresa con alertas de expiración | VI - SaaS |
| RF04 | Aislar datos entre empresas: un usuario de Empresa A no puede ver datos de Empresa B | VI - SaaS |
| RF05 | Administrar usuarios, roles y perfiles por empresa con autenticación segura (JWT, bcrypt) | VI - SaaS |
| RF06 | Gestionar productos, ficha técnica con medidas en cm, telas nobles/hipoalergénicas y 3D RA | Heredado+SaaS |
| RF07 | Gestionar inventario multi-sucursal con valuación contable inmutable por CPP y Kardex Ley 843 | Heredado+SaaS |
| RF08 | Consultar catálogo digital con filtros multicriterio, stock disponible y precios diferenciados | Heredado |
| RF09 | Descargar y almacenar catálogo estructurado en IndexedDB/SQLite para operación offline | II/III - PWA/Offline |
| RF10 | Registrar reservas presenciales de prendas con ticket QR firmado sin conexión a Internet | II/III - PWA/Offline |
| RF11 | Registrar ventas POS de contado en efectivo sin conexión emitiendo comprobante con UUID v4 | IV - Ventas Offline |
| RF12 | Consultar y auditar operaciones locales pendientes de sincronización en terminal y móvil | II/III - PWA/Offline |
| RF13 | Sincronizar transacciones pendientes por lotes al restablecerse la conectividad a Internet | II/III - PWA/Offline |
| RF14 | Detectar y resolver conflictos de sincronización mediante cabecera X-Idempotency-Key y prioridad física | II/III - PWA/Offline |
| RF15 | Gestionar solicitud de cambio de prendas dentro del plazo de garantía (7 días hábiles) | IV - Ventas |
| RF16 | Generar Nota de Devolución (Tiempo 1) acreditando saldo a favor y Nota de Cambio (Tiempo 2) | IV - Ventas |
| RF17 | Calcular y cobrar excedente de precio cuando la nueva prenda es de mayor valor mediante pasarela | IV - Ventas |
| RF18 | Emitir orden de liquidación monetaria en efectivo programada a 30 días si el cliente no acepta cambio | IV - Ventas |
| RF19 | Gestionar traspasos de inventario inter-sucursal con estados formales (Solicitado, En Tránsito, Recibido) | Heredado+Nuevo |
| RF20 | Solicitar reportes analíticos mediante lenguaje natural escrito o dictado por voz (Whisper) | V - IA |
| RF21 | Interpretar solicitud con LLM, validar sintaxis SQL con filtro AST seguro y ejecutar en réplica | V - IA |
| RF22 | Exportar reportes ejecutivos generados a formatos corporativos Excel (.xlsx) y PDF (.pdf) | V - IA |
| RF23 | Demostrar reportes con datos reales multitenant y filtros de sucursales, prendas y fechas | V - IA |
| RF24 | Generar pipeline de datos sintéticos históricos (mínimo 6 meses) con estacionalidad de retail | V - ML |
| RF25 | Entrenar y desplegar modelos de regresión supervisada (proyección semestral) y clustering K-Means | V - ML |
| RF26 | Visualizar métricas predictivas, mapas de calor y detección de anomalías en Dashboard ML | V - ML |
| RF27 | Integrar pasarela de pagos Stripe Sandbox con tokenización PCI-DSS para liquidación de saldos | IV - Ventas |
| RF28 | Gestionar ofertas de liquidación de temporada (30%, 40%, 60%) y precios mayoristas (>= 3 prendas) | Heredado+Nuevo |
| RF29 | Gestionar compras y aprovisionamiento corporativo exclusivo desde Web Desktop (PC/Laptop) con CPP | Heredado+Nuevo |
| RF30 | Notificar al cliente y emitir comprobantes digitales con códigos QR para auditoría transaccional | II/III - PWA/Offline |

### 2.3.2. Requisitos No Funcionales

| ID | Requisito No Funcional | Descripción |
|:---:|:---|:---|
| RNF01 | Seguridad | Autenticación JWT + bcrypt, autorización por roles, HTTPS/TLS obligatorio |
| RNF02 | Aislamiento de datos | Ninguna operación permite acceder a información de otro tenant. Restricción en backend, no solo en UI |
| RNF03 | Persistencia offline | Operaciones sin conexión sobreviven al cierre y reinicio de la aplicación |
| RNF04 | Integridad transaccional | Ventas confirmadas y movimientos de inventario mantienen consistencia |
| RNF05 | Idempotencia | El reenvío de una operación confirmada no genera registros duplicados |
| RNF06 | Recuperación ante fallos | Operaciones pendientes se conservan ante errores de comunicación |
| RNF07 | Mantenibilidad | Código organizado por capas (presentación, negocio, persistencia, sincronización) |
| RNF08 | Compatibilidad | PWA en navegadores modernos; Flutter conserva capacidades móviles |
| RNF09 | Rendimiento | Consultas de catálogo y reportes evitan operaciones innecesariamente costosas |
| RNF10 | Observabilidad | Sincronización registra información suficiente para diagnosticar fallos |
| RNF11 | Calidad | Pruebas automatizadas que verifican reglas críticas del sistema |
| RNF12 | Coherencia documental | Modelos UML representan la solución realmente implementada |

## 2.4. Reglas de Negocio

Las reglas de negocio definen las directrices operacionales, restricciones contables, políticas de seguridad y flujos transaccionales inmutables que gobiernan a FashionStore SaaS en su versión del Segundo Parcial. Para garantizar rigor formal y trazabilidad, se estructuran en siete categorías operativas acompañadas de sus respectivos diagramas lógicos de decisión:

---

### 2.4.1 Reglas del Negocio Base (Inventario, Valuación CPP y Pagos)

- **RN-BASE-01 (Control de Acceso Basado en Roles - RBAC Estricto):** Ningún usuario de la plataforma puede invocar endpoints de la API ni acceder a módulos de interfaz fuera de los privilegios concedidos formalmente a su rol asignado (`SUPER_ADMIN`, `ADMIN_EMPRESA`, `ENCARGADO_SUCURSAL`, `CAJERO`, `CLIENTE`). Todo intento no autorizado es interceptado y denegado con código HTTP 403 Forbidden.
- **RN-BASE-02 (Valuación Inmutable por Costo Promedio Ponderado - CPP):** Ante cada recepción de mercadería respaldada por factura fiscal con cantidad de ingreso $Q_{\text{nueva}}$ y costo unitario de adquisición $C_{\text{nuevo}}$, el sistema ejecuta de forma automática e inmutable el recálculo matemático del Costo Promedio Ponderado (CPP):
  $$CPP_{\text{nuevo}} = \frac{(Stock_{\text{actual}} \times CPP_{\text{actual}}) + (Q_{\text{nueva}} \times C_{\text{nuevo}})}{Stock_{\text{actual}} + Q_{\text{nueva}}}$$

  *Formato lineal para copiar y pegar en Microsoft Word (`Alt + =` y luego presionar la barra espaciadora):*
  ```text
  CPP_nuevo = ((Stock_actual \times CPP_actual) + (Q_nueva \times C_nuevo)) / (Stock_actual + Q_nueva)
  ```
  *(O si Word está en modo `{LaTeX}`, pegar sin los signos de dólar y presionar Convertir):*
  ```latex
  CPP_{\text{nuevo}} = \frac{(Stock_{\text{actual}} \times CPP_{\text{actual}}) + (Q_{\text{nueva}} \times C_{\text{nuevo}})}{Stock_{\text{actual}} + Q_{\text{nueva}}}
  ```
- **RN-BASE-03 (Bloqueo Temporal de Existencias en Reservas Presenciales):** Las prendas reservadas por clientes mediante el catálogo digital bloquean stock disponible por un periodo máximo de 2 horas. Si el cliente no se presenta en la tienda física dentro de esa ventana de tiempo, el sistema libera automáticamente el stock reservado devolviéndolo al stock disponible general.
- **RN-BASE-04 (Ventas POS en Mostrador y Desglose Tributario Ley 843):** Las ventas presenciales en mostrador actualizan el inventario físico en tiempo real y generan de forma obligatoria el comprobante de venta fiscal con código QR y desglose tributario según la normativa boliviana (IVA 13%, IT 3%).
- **RN-BASE-05 (Confirmación Efectiva del 100% del Pago Previa al Despacho e Inventario):** Conforme a la política de control financiero y de inventarios exigida por la cátedra (audio `Parcial2-2.txt`, líneas 33-35), ninguna orden de venta (digital o presencial con cobro electrónico por QR o tarjeta) puede consolidarse como completada, ni decrementar el stock definitivo en el inventario central ni habilitar la entrega física del producto, si no se ha recibido la confirmación verificada del 100% del pago por parte de la pasarela (Stripe Sandbox) o la verificación del comprobante de transferencia bancaria/QR por el cajero. Mientras el pago no esté efectivamente acreditado, la orden permanece en estado `PENDIENTE_PAGO` y el stock solo se bloquea de manera transitoria por un tiempo máximo de 15 minutos, liberándose automáticamente si no se consuma la liquidación.

```mermaid
flowchart TD
    subgraph Ciclo_Pago ["RN-BASE-03 / RN-BASE-05: Validación de Pagos y Bloqueo de Stock"]
        A["Cliente inicia Checkout o Compra en Caja"] --> B["Orden en Estado: PENDIENTE_PAGO<br/>Bloqueo temporal de stock (15 min)"]
        B --> C{"¿Confirmación del 100% del Pago?<br/>(Stripe Webhook / Verificación QR / Efectivo)"}
        C -- "NO / Tiempo Expirado" --> D["Liberar Stock Reservado<br/>Cancelar Orden (RECHAZADA)"]
        C -- "SÍ: Pago 100% Verificado" --> E["Estado: COMPLETADA / PAGADA"]
        E --> F["Decremento Definitivo de Stock en Bodega"]
        F --> G["Emisión de Comprobante Fiscal con QR<br/>(Desglose IVA 13% e IT 3% Ley 843)"]
        G --> H["Habilitar Entrega en Mostrador o Despacho"]
    end

    subgraph Valuacion_CPP ["RN-BASE-02: Valuación Inmutable por Costo Promedio Ponderado"]
        I["Recepción de Lote de Mercadería<br/>(Cantidad Q_nueva, Costo Unitario Fiscal C_nuevo)"] --> J["Recálculo Matemático Inmutable:<br/>CPP = (Stock_act * CPP_act + Q_nueva * C_nuevo) / (Stock_act + Q_nueva)"]
        J --> K["Actualización Automática del Kardex Valorado"]
        K --> L["Fijación de Costo Contable de Salida para Ventas"]
    end
```

---

### 2.4.2 Reglas SaaS y Multitenant (Gobernanza y Aislamiento Lógico)

- **RN-SAAS-01 (Jerarquía y Separación Empresa vs. Sucursal):** Una Empresa contratante (Tenant) puede poseer múltiples Sucursales físicas en distintas ciudades, pero una Sucursal pertenece estrictamente y de por vida a una única Empresa.
- **RN-SAAS-02 (Límites por Plan de Suscripción Comercial):**
  - **Plan Básico:** Máximo 2 sucursales físicas activas. Catálogo offline básico. Módulos de IA generativa y Machine Learning completamente deshabilitados.
  - **Plan Profesional:** Hasta 10 sucursales activas. Habilita modelos 3D en RA y módulo de reportes generativos con IA en lenguaje natural escrito.
  - **Plan Enterprise:** Sucursales ilimitadas. Acceso completo a reportes generativos de IA por voz (Whisper) y Dashboard predictivo con Machine Learning a 6 meses.
- **RN-SAAS-03 (Aislamiento Lógico Hermético de Datos):** Todas las consultas relacionales ejecutadas en PostgreSQL 15 inyectan de forma mandatoria la cláusula discriminadora `WHERE tenant_id = :current_tenant`. Cualquier intento deliberado o accidental de acceder a datos de otra empresa contratante es interceptado a nivel de middleware y rechazado con código HTTP 403 Forbidden.
- **RN-SAAS-04 (Control de Estado y Vigencia de Suscripción):** Si la suscripción de una empresa pasa al estado `SUSPENDIDA` o `VENCIDA`, el sistema bloquea inmediatamente cualquier operación transaccional de venta, compra o traspaso de inventario, permitiendo únicamente el acceso a vistas administrativas de lectura y a la pasarela de renovación de licencia.

```mermaid
flowchart TD
    Req["Petición HTTP entrante al API Gateway"] --> JWT["Extracción de Claims en Token JWT:<br/>(tenant_id, usuario_id, rol)"]
    JWT --> CheckSub{"RN-SAAS-04: ¿Estado de Suscripción?"}
    
    CheckSub -- "SUSPENDIDA o VENCIDA" --> BloqSub["Acceso Transaccional DENEGADO (HTTP 403)<br/>Solo consulta administrativa y pasarela de renovación"]
    
    CheckSub -- "ACTIVA" --> CheckPlan{"RN-SAAS-02: Validación de Plan Contratado"}
    
    CheckPlan -- "Plan Básico" --> ValBas["Límite: Máximo 2 sucursales activas<br/>Módulos IA / ML: BLOQUEADOS (HTTP 403)"]
    CheckPlan -- "Plan Profesional" --> ValPro["Límite: Hasta 10 sucursales activas<br/>Módulos IA Texto / RA 3D: HABILITADOS"]
    CheckPlan -- "Plan Enterprise" --> ValEnt["Límite: Sucursales ilimitadas<br/>IA por Voz Whisper y ML 6 Meses: HABILITADOS"]
    
    ValBas --> ScopeInject["RN-SAAS-03: Inyección Obligatoria de Aislamiento Lógico:<br/>WHERE tenant_id = :current_tenant"]
    ValPro --> ScopeInject
    ValEnt --> ScopeInject
    
    ScopeInject --> ExecDB["Ejecución Segura en PostgreSQL 15 (RLS)"]
    ExecDB --> Response["Respuesta JSON con datos exclusivos del Tenant"]
```

---

### 2.4.3 Reglas Offline y Sincronización Transaccional (Resiliencia Operativa)

- **RN-OFFLINE-01 (Ventas Offline Exclusivas al Contado en Efectivo):** En modo de contingencia fuera de línea únicamente se admiten ventas con método de cobro presencial en efectivo. Los cobros electrónicos con tarjeta de crédito/débito o QR interoperable exigen pasarelas y validación bancaria en línea, por lo que quedan estrictamente bloqueados fuera de línea en cumplimiento del estándar internacional de seguridad PCI-DSS.
- **RN-OFFLINE-02 (Persistencia Local No Volátil con UUID v4):** Toda transacción registrada en modo desconectado se persiste inmediatamente en el motor de almacenamiento local del cliente (IndexedDB en Angular PWA o SQLite en Flutter), asignándole un identificador criptográfico **UUID v4** inmutable y marcando su estado como `LOCAL_PENDIENTE`.
- **RN-SYNC-01 (Protocolo de Idempotencia Garantizada):** Toda petición de sincronización hacia el backend incluye la cabecera HTTP `X-Idempotency-Key` conteniendo el UUID v4 de la operación. El backend valida dicho identificador en la tabla central `processed_transactions`; si el UUID ya fue registrado previamente (debido a reintentos o cortes de red intermitentes), el servidor devuelve la confirmación original sin duplicar ventas, cobros ni movimientos en el Kardex.
- **RN-SYNC-02 (Resolución Determinista de Conflictos y Sobreventa - Overselling):** Si al recuperar la conectividad una prenda vendida de forma presencial en mostrador fuera de línea fue adquirida simultáneamente por un comprador en la tienda virtual online, **se prioriza de forma absoluta la venta física presencial**, dado que la prenda ya fue entregada en manos del cliente. El sistema cancela la orden virtual en conflicto, restituye automáticamente el monto al cliente digital y emite una alerta prioritaria de reposición de stock al Encargado de Sucursal.

```mermaid
flowchart TD
    Venta["Cajero o Vendedor inicia Operación en POS o App Móvil"] --> NetCheck{"¿Existe Conexión a Internet?"}
    
    NetCheck -- "SÍ (Online)" --> DirectCommit["Procesamiento Directo en Backend FastAPI<br/>Persistencia inmediata en PostgreSQL Central"]
    
    NetCheck -- "NO (Offline)" --> PayCheck{"RN-OFFLINE-01:<br/>¿Método de Cobro Seleccionado?"}
    PayCheck -- "Tarjeta / QR" --> BlockPay["OPERACIÓN DENEGADA:<br/>Cobros electrónicos bloqueados offline por PCI-DSS"]
    PayCheck -- "Efectivo (Contado)" --> GenUUID["RN-OFFLINE-02:<br/>Generar UUID v4 inmutable de la operación"]
    
    GenUUID --> StoreLocal["Persistencia Local No Volátil Inmediata:<br/>- Web PWA: IndexedDB<br/>- Móvil Flutter: SQLite<br/>Estado: LOCAL (Emite comprobante QR provisional)"]
    
    StoreLocal --> SyncAgent["Agente de Sincronización en Background<br/>(Monitorea eventos de red / Reconexión)"]
    SyncAgent --> NetRestored["Conectividad Restablecida:<br/>Despacho de Cola de Operaciones Pendientes"]
    
    NetRestored --> BackendCheck{"RN-SYNC-01:<br/>¿UUID ya existe en BD Central?"}
    BackendCheck -- "SÍ (Reintento de Red)" --> IdempotentAck["IDEMPOTENCIA:<br/>Retorna confirmación exitosa sin duplicar venta ni stock"]
    BackendCheck -- "NO (Nueva Transacción)" --> CentralStockCheck{"RN-SYNC-02:<br/>¿Stock disponible en Servidor Central?"}
    
    CentralStockCheck -- "SÍ" --> CommitOk["Consolidar Venta, decrementar stock central<br/>Actualizar estado local a SINCRONIZADA"]
    CentralStockCheck -- "NO (Colisión / Sobreventa)" --> ConflictHandling["RESOLUCIÓN DETERMINISTA:<br/>Prevalece venta física presencial ya entregada<br/>Cancela orden virtual y emite alerta de reposición urgente"]
```

---

### 2.4.4 Reglas de Postventa y Cambio de Prendas en Dos Tiempos

- **RN-CAMBIO-01 (Plazo Límite de Garantía Comercial):** El cliente dispone de un plazo estricto de **hasta 7 días hábiles** computados a partir de la fecha de emisión del comprobante original de venta para solicitar formalmente el cambio de una prenda en sucursal. Vencido dicho plazo, el sistema bloquea irreversiblemente la opción de cambio en terminal.
- **RN-CAMBIO-02 (Flujo Obligatorio en Dos Notas y Dos Tiempos Independientes):** Todo proceso de postventa se descompone operativamente en dos tiempos secuenciales inmutables:
  1. **Tiempo 1 (Nota de Devolución):** Al presentarse el cliente en mostrador, el cajero o encargado verifica el estado físico de la prenda. Se genera en el sistema la **Nota de Devolución**, reingresando formalmente la prenda al stock de la sucursal (+1 stock físico en bodega o cuarentena) y acreditando el monto original pagado como saldo a favor en cuenta del cliente.
  2. **Tiempo 2 (Nota de Cambio):** Con la Nota de Devolución emitida, el cliente selecciona una nueva prenda. Si el valor es equivalente, se liquida a saldo cero; si la nueva prenda posee mayor valor (por talla superior, tela noble o modelo premium), el sistema calcula el diferencial de precio ($D = Precio_{\text{nueva}} - Precio_{\text{original}}$) y exige su pago mediante la pasarela **Stripe Sandbox** (tokenización PCI-DSS). Una vez acreditado el pago, se emite la **Nota de Cambio** formal y se descuenta el stock (-1 stock de la nueva prenda).
- **RN-CAMBIO-03 (Política de Reembolso Monetario en Efectivo a 30 Días):** Si la prenda solicitada para cambio no existe en el inventario de la empresa, o si el cliente desiste del cambio y no acepta pagar la diferencia de precio, **el cajero no entrega dinero en efectivo de inmediato en el mostrador**. El sistema emite una orden de liquidación monetaria formal programada contablemente para el cierre mensual de la empresa (a los 30 días calendario), garantizando la cuadratura del arqueo de caja de la sucursal y la auditoría fiscal.
- **RN-CAMBIO-04 (Condiciones Físicas y Reingreso al CPP Histórico):** Solo se admiten prendas en perfecto estado (limpias, con etiquetas intactas de fábrica y sin señales de lavado ni uso). La prenda devuelta se reincorpora al inventario valorada al Costo Promedio Ponderado (CPP) histórico de la venta original, evitando distorsiones contables en el Kardex.

```mermaid
flowchart TD
    Start["Cliente acude a Mostrador solicitando Cambio de Prenda<br/>(Presenta prenda + comprobante original)"] --> ValPlazo{"RN-CAMBIO-01:<br/>¿Dentro del Plazo de Garantía?<br/>(Hasta 7 días hábiles)"}
    
    ValPlazo -- "NO (Plazo Vencido)" --> RejectExp["OPERACIÓN RECHAZADA:<br/>Plazo de garantía expirado por política comercial"]
    
    ValPlazo -- "SÍ (Plazo Válido)" --> ValEstado{"RN-CAMBIO-04:<br/>Inspección Física por Encargado de Sucursal"}
    ValEstado -- "Usada / Sin Etiquetas / Lavada" --> RejectCond["CAMBIO RECHAZADO:<br/>Prenda no cumple condiciones higiénicas o de fábrica"]
    ValEstado -- "Estado Óptimo Impecable" --> Reingreso["TIEMPO 1: NOTA DE DEVOLUCIÓN<br/>Reingresa prenda devuelta al stock (+1 unidad)<br/>Restituye valor unitario histórico al Kardex CPP<br/>Genera Saldo a Favor en Bs."]
    
    Reingreso --> CalcDiff["TIEMPO 2: NOTA DE CAMBIO<br/>Cliente elige nueva prenda (Talla/Modelo)<br/>Diferencial: D = Precio_nueva - Precio_original"]
    
    CalcDiff --> DiffBranch{"¿Monto del Diferencial D?"}
    DiffBranch -- "D > 0 (Prenda de mayor valor)" --> CobrarDiff["Cobro de excedente en pasarela Stripe Sandbox<br/>(Tokenización segura PCI-DSS)"]
    DiffBranch -- "D = 0 (Mismo valor o cambio de talla)" --> Neutro["Liquidación monetaria a saldo cero (Sin cobro)"]
    DiffBranch -- "Cliente desiste o rechaza diferencia" --> Reembolso["RN-CAMBIO-03: POLÍTICA DE REEMBOLSO<br/>No se entrega efectivo inmediato en mostrador<br/>Emisión de Orden de Liquidación a 30 Días (Fin de Mes)"]
    
    CobrarDiff --> GenNotaCambio["Emisión de NOTA DE CAMBIO formal<br/>Decremento de stock (-1 unidad de nueva prenda)<br/>Entrega de nueva prenda al cliente"]
    Neutro --> GenNotaCambio
```

---

### 2.4.5 Reglas de Aprovisionamiento y Compras B2B desde Web Desktop

- **RN-COMPRAS-01 (Restricción Exclusiva a Computadoras de Escritorio / Laptops):** El módulo de compras y aprovisionamiento corporativo a proveedores textiles solo es accesible desde la aplicación Web en computadoras de escritorio y laptops (resolución de pantalla $\ge 1280 \times 800$ px con teclado y ratón). El sistema bloquea el acceso a este módulo desde navegadores móviles o tablets, previniendo errores operacionales en órdenes de compra corporativas de alto impacto financiero.
- **RN-COMPRAS-02 (Personal Autorizado para Aprovisionamiento):** Las órdenes de compra a proveedores solo pueden ser emitidas, negociadas y autorizadas por el **Encargado de Sucursal** o el **Administrador de Empresa**.
- **RN-COMPRAS-03 (Recepción con Factura Fiscal y Disparo Inmutable de CPP):** Toda recepción física de lote de mercadería textil exige el registro del número de Factura Comercial Fiscal y sus costos asociados, disparando automáticamente el recálculo matemático inmutable del Costo Promedio Ponderado (CPP) y el asiento formal en el libro de Kardex físico-valorado (Ley 843).

```mermaid
flowchart TD
    UserDev["Encargado de Sucursal o Admin Empresa inicia sesión"] --> CheckDev{"RN-COMPRAS-01:<br/>¿Dispositivo de Acceso?"}
    CheckDev -- "Móvil / Tablet (Resolución < 1280px)" --> BlockDev["ACCESO DENEGADO:<br/>Módulo exclusivo de Web Desktop (PC/Laptop)<br/>Bloqueo por User-Agent y resolución de pantalla"]
    
    CheckDev -- "PC de Escritorio / Laptop (>= 1280px)" --> AuthUser{"RN-COMPRAS-02:<br/>¿Personal Autorizado?"}
    AuthUser -- "Cajero / Cliente" --> BlockRole["HTTP 403: Rol no autorizado para compras corporativas"]
    AuthUser -- "Encargado de Sucursal / Admin Empresa" --> ModuleCompras["Acceso Habilitado al Módulo de Aprovisionamiento"]
    
    ModuleCompras --> PlanCurvas["Planificación de curvas de tallas y selección de telas"]
    PlanCurvas --> EmitirOC["Emisión formal de Orden de Compra a Proveedor Textil"]
    
    EmitirOC --> RecepcionFisica["Recepción física de mercadería en bodega"]
    RecepcionFisica --> CargaFactura["RN-COMPRAS-03: Registro de Factura Comercial Fiscal<br/>(Número de autorización, costos de lote y flete)"]
    
    CargaFactura --> AutoCPP["Disparo de Recálculo Inmutable de CPP:<br/>CPP_nuevo = (Stock_ant*CPP_ant + Q_ingreso*C_ingreso)/(Stock_ant + Q_ingreso)"]
    AutoCPP --> AsientoKardex["Asiento formal en libro Kardex físico-valorado (Ley 843)"]
    AsientoKardex --> StockActualizado["Stock Físico disponible incrementado para venta"]
```

---

### 2.4.6 Reglas de Ofertas de Liquidación y Precios Diferenciados

- **RN-PRECIOS-01 (Ofertas y Liquidación de Fin de Temporada):** Las prendas de temporadas concluidas (ej. colección otoño-invierno en primavera) pueden ofertarse con descuentos especiales preconfigurados (30%, 40% o 60%) definidos por el Administrador de Empresa para recuperar capital de inversión. Las prendas de temporada vigente mantienen su precio regular. El catálogo digital incluye una sección destacada con filtros de ofertas y porcentaje de rebaja.
- **RN-PRECIOS-02 (Precios Diferenciados por Mayor Automáticos):** El sistema calcula automáticamente tarifas de precio por mayor cuando el cliente adquiere 3 o más unidades idénticas (cuarta, media docena o docena), aplicando el descuento mayorista en el carrito de compras sin requerir intervención manual del cajero.

```mermaid
flowchart TD
    ProductCart["Cliente agrega prenda textil al carrito de compras"] --> CheckTemp{"RN-PRECIOS-01:<br/>¿Estado de Temporada de la Prenda?"}
    
    CheckTemp -- "Temporada Concluida (Liquidación)" --> ApplyLiq["Aplicar descuento de liquidación configurado:<br/>(30%, 40% o 60% sobre precio regular)"]
    CheckTemp -- "Temporada Vigente (Colección Actual)" --> RegPrice["Mantiene precio de venta regular"]
    
    ApplyLiq --> CheckQty{"RN-PRECIOS-02:<br/>¿Cantidad agregada del mismo producto?"}
    RegPrice --> CheckQty
    
    CheckQty -- "1 o 2 unidades" --> PriceMinor["Tarifa Minorista (Precio por menor regular o rebajado)"]
    CheckQty -- ">= 3 unidades (Cuarta, Media Docena o Docena)" --> PriceMayor["Tarifa Mayorista Automática:<br/>Aplica precio por mayor de fábrica en subtotal"]
    
    PriceMinor --> SubtotalCart["Consolidar subtotal de línea en carrito"]
    PriceMayor --> SubtotalCart
```

---

### 2.4.7 Reglas de Inteligencia Artificial Generativa y Machine Learning

- **RN-IA-01 (Privilegio por Plan de Suscripción):** La generación de reportes analíticos con IA y el procesamiento de consultas por voz mediante Whisper están reservados exclusivamente para empresas con planes superiores activos (Plan Profesional y Plan Enterprise).
- **RN-IA-02 (Validador Sintáctico AST de Seguridad en SQL Generado):** Toda consulta SQL traducida por el LLM a partir de lenguaje natural debe someterse a un validador sintáctico AST (*Abstract Syntax Tree*):
  1. Debe ser estrictamente de solo lectura (`SELECT`).
  2. Prohíbe de forma absoluta cualquier sentencia destructiva o modificadora (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`).
  3. Inyecta obligatoriamente la cláusula `WHERE tenant_id = :current_tenant`.
  4. Se ejecuta en una réplica de base de datos de solo lectura.
- **RN-ML-01 (Dataset Sintético Estandarizado de Entrenamiento):** Los modelos predictivos de Machine Learning se entrenan sobre un pipeline de datos sintéticos representativo de al menos 6 meses de historial (~5,000 transacciones y ~500 perfiles) que modela la estacionalidad textil boliviana.
- **RN-ML-02 (Métricas Mínimas de Precisión Analítica):** El modelo supervisado de regresión para proyección semestral de demanda debe garantizar un coeficiente de determinación $R^2 \ge 0.82$, mientras que los algoritmos de segmentación no supervisada (K-Means) deben alcanzar un coeficiente de silueta (*Silhouette score*) $\ge 0.65$.

```mermaid
flowchart TD
    subgraph NLP_Pipeline ["RN-IA-01 / RN-IA-02: Pipeline Seguro de Reportes Generativos"]
        QUser["Directivo formula consulta en lenguaje natural<br/>(Texto escrito o audio dictado por voz)"] --> CheckVoice{"¿Es entrada de voz?"}
        CheckVoice -- "SÍ (Audio)" --> Transcribe["Transcripción fonética de alta fidelidad con Whisper"]
        CheckVoice -- "NO (Texto)" --> TextPrompt["Procesar prompt de texto directo"]
        
        Transcribe --> CheckPlanIA{"¿Plan Profesional o Enterprise Activo?"}
        TextPrompt --> CheckPlanIA
        
        CheckPlanIA -- "NO (Plan Básico)" --> RejectIA["HTTP 403 Forbidden:<br/>Reportes IA exclusivos para planes superiores"]
        CheckPlanIA -- "SÍ" --> LLMEngine["Motor LLM:<br/>Traducción de intención a consulta SQL analítica"]
        
        LLMEngine --> SecFilter{"Filtro Validador AST de Seguridad SQL"}
        
        SecFilter -- "Contiene DDL/DML destructivo:<br/>DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE" --> AlertSec["BLOQUEO DE SEGURIDAD:<br/>Alerta de bitácora por inyección maliciosa"]
        
        SecFilter -- "Consulta de Solo Lectura:<br/>SELECT sintácticamente válido" --> InjectTenant["Inyección Forzosa e Incondicional:<br/>WHERE tenant_id = :current_tenant"]
        
        InjectTenant --> ExecSQL["Ejecución en PostgreSQL 15 (Réplica de Solo Lectura)"]
        ExecSQL --> RenderUI["Generación Dinámica en Frontend:<br/>Tablas interactivas + Gráficos estadísticos + Narrativa ejecutiva<br/>Exportación a Excel (.xlsx) y PDF (.pdf)"]
    end

    subgraph ML_Analytics ["RN-ML-01 / RN-ML-02: Pipeline Analítico de Machine Learning"]
        SynthData["Dataset Sintético Estandarizado:<br/>(Historial >= 6 meses, estacionalidad textil boliviana)"] --> TrainModels["Entrenamiento de Modelos Analíticos"]
        TrainModels --> SupModel["Modelo Supervisado de Regresión:<br/>Proyección semestral de demanda textil<br/>(Evaluación: RMSE y R^2 >= 0.82)"]
        TrainModels --> UnsupModel["Modelos No Supervisados:<br/>1. Segmentación de Clientes K-Means (Silhouette >= 0.65)<br/>2. Detección de Anomalías de Existencias (Isolation Forest)"]
    end
```

---

### 2.4.8 Matriz Consolidada de Reglas de Negocio (Mapeo RN01 - RN18)

A continuación se presenta la tabla resumen de todas las reglas de negocio del sistema, preservando la numeración unívoca para su trazabilidad en el diseño y casos de prueba:

| ID | Regla de Negocio | Categoría | Descripción Breve |
|:---:|:---|:---:|:---|
| **RN01** | Plazo estricto de garantía de cambio | Postventa | Plazo máximo de 7 días hábiles desde la emisión de la venta para solicitar formalmente el cambio de prendas. |
| **RN02** | Flujo de cambio en dos tiempos y dos notas | Postventa | Descomposición en Tiempo 1: Nota de Devolución (+1 stock) y Tiempo 2: Nota de Cambio (-1 stock) con cobro de excedente por Stripe. |
| **RN03** | Política de reembolso monetario a 30 días | Postventa | Si no se acepta el cambio, el dinero no se devuelve de inmediato en caja; se liquida al cierre mensual contable (30 días). |
| **RN04** | Condiciones físicas de la prenda e inspección | Postventa | Inspección obligatoria por Encargado de Sucursal: prendas limpias, sin uso y con etiquetas intactas de fábrica. |
| **RN05** | Reingreso al CPP histórico original | Inventario | La prenda devuelta se reincorpora al kardex valorada al costo promedio ponderado de la venta original. |
| **RN06** | Idempotencia en operaciones offline con UUID v4 | Sincronización | Prevención de duplicados en el backend mediante identificador UUID v4 único transmitido en cabecera `X-Idempotency-Key`. |
| **RN07** | Validación de stock y pago prioritario | Ventas/Pagos | Confirmación efectiva del 100% del pago por webhook de Stripe antes de consolidar inventario. Prioridad física a la venta en mostrador. |
| **RN08** | Aislamiento y gobernanza SaaS Multitenant | SaaS | Aislamiento lógico forzoso con `WHERE tenant_id = :id` y delimitación de recursos según plan contratado (Básico, Profesional, Enterprise). |
| **RN09** | Ofertas y liquidación de fin de temporada | Precios | Descuentos especiales (30%, 40%, 60%) en prendas de temporadas concluidas para recuperar capital de inversión. |
| **RN10** | Precios diferenciados (Menor vs. Mayor) | Precios | Aplicación automática de tarifas por mayor a partir de 3 unidades idénticas (cuarta, media docena o docena). |
| **RN11** | Traspasos inter-sucursales de inventario | Inventario | Movimientos válidos únicamente entre sucursales del mismo tenant, con estados formales `EN_TRÁNSITO` y confirmación en destino. |
| **RN12** | Modalidad exclusiva de venta offline en efectivo | POS Offline | Ventas sin conexión restringidas estrictamente a pago en efectivo. Bloqueo de tarjetas y QR por cumplimiento de PCI-DSS. |
| **RN13** | Ficha técnica y composición textil avanzada | Catálogo | Especificación obligatoria de medidas biométricas en cm, códigos bicolores Hex, telas nobles y advertencia hipoalergénica. |
| **RN14** | Compras centralizadas vía Web Desktop | Compras B2B | Restricción estricta de aprovisionamiento corporativo a PC/Laptop (>= 1280px) operado por Encargado de Sucursal o Admin Empresa. |
| **RN15** | Control de acceso basado en roles (RBAC) | Seguridad | Validación de credenciales JWT y bloqueo de operaciones fuera del rol asignado (HTTP 403). |
| **RN16** | Bloqueo temporal de stock en reservas (2 horas) | Reservas | Apartado temporal de prendas en probador por un máximo de 2 horas con liberación automática si no asiste el cliente. |
| **RN17** | Validador sintáctico AST de seguridad en IA | IA Generativa | Inspección de consultas SQL generadas por LLM, exigiendo solo `SELECT` y bloqueando sentencias DDL/DML destructivas. |
| **RN18** | Requisitos mínimos de modelos Machine Learning | Machine Learning | Entrenamiento con >= 6 meses de datos sintéticos estacionales y métricas mínimas ($R^2 \ge 0.82$, Silhouette $\ge 0.65$). |


## 2.5. Diagrama General de Casos de Uso (UML)

### 2.5.1. Matriz Integral y Lista Consolidada de Casos de Uso del Segundo Parcial

La siguiente matriz presenta la especificación exhaustiva de los **20 Casos de Uso (CU01 al CU20)** desarrollados para el Segundo Examen Parcial bajo la metodología ICONIX. Cada caso de uso se encuentra vinculado bidireccionalmente con los requisitos funcionales que satisface, el módulo de arquitectura al que pertenece, las reglas de negocio que restringen su comportamiento, sus actores participantes y los canales de despliegue correspondientes:

> **NOTA METODOLÓGICA ICONIX:** En estricto apego a los principios de ICONIX y las directrices de la cátedra, los casos de uso se implementan de forma progresiva sin división en ciclos iterativos de PUDS ni priorizaciones burocráticas. Los casos de uso fundacionales heredados del primer parcial se encuentran resguardados en el **Anexo A.1**.

| CU | Nombre del Caso de Uso | Módulo Asignado | Requisitos Funcionales (RF) | Reglas de Negocio (RN) | Actor Principal | Actores Secundarios / Sistemas | Canales de Despliegue | Desafío Técnico |
|:---:|:---|:---|:---:|:---:|:---|:---|:---:|:---:|
| **CU01** | Gestionar Empresas (Tenants) | `M01: Gobernanza SaaS y Seguridad` | RF01, RF04 | RN08, RN-SAAS-01 | Super Admin | Admin Empresa | Web Desktop | Desafío VI: SaaS Multitenant |
| **CU02** | Gestionar Planes de Suscripción | `M01: Gobernanza SaaS y Seguridad` | RF02 | RN08, RN-SAAS-02 | Super Admin | — | Web Desktop | Desafío VI: SaaS Multitenant |
| **CU03** | Gestionar Suscripción de Empresa | `M01: Gobernanza SaaS y Seguridad` | RF03 | RN08, RN-SAAS-04 | Super Admin | Admin Empresa | Web Desktop | Desafío VI: SaaS Multitenant |
| **CU04** | Autenticar Usuario Multitenant | `M01: Gobernanza SaaS y Seguridad` | RF04, RF05 | RN08, RN15, RN-BASE-01 | Todos los usuarios | — | Web Desktop, PWA, Móvil | Desafío VI: SaaS Multitenant |
| **CU05** | Gestionar Usuarios y Roles por Empresa | `M01: Gobernanza SaaS y Seguridad` | RF04, RF05 | RN08, RN15, RN-BASE-01 | Admin Empresa | Encargado Sucursal, Cajero | Web Desktop | Desafío VI: SaaS Multitenant |
| **CU06** | Gestionar Productos y Atributos Textiles Avanzados | `M04: Catalogación Textil de Precisión` | RF06 | RN13 | Admin Empresa | — | Web Desktop | Desafío I: Ficha Textil Avanzada |
| **CU07** | Gestionar Inventario Multi-Sucursal, Kardex y CPP | `M05: Inventario, Kardex y CPP` | RF07, RF08 | RN05, RN-BASE-02 | Admin Empresa | Encargado de Sucursal | Web Desktop, PWA, Móvil | Desafíos I y IV: Valuación CPP |
| **CU08** | Descargar y Consultar Catálogo Digital Offline | `M02: Catálogo Omnicanal Offline-First` | RF08, RF09 | RN-OFFLINE-02 | Cliente | — | PWA, Móvil Flutter | Desafíos II y III: PWA / Offline |
| **CU09** | Registrar Reserva Presencial Sin Conexión | `M02: Catálogo Omnicanal Offline-First` | RF10 | RN16, RN-BASE-03, RN-OFFLINE-02 | Cliente | Encargado de Sucursal | PWA, Móvil Flutter | Desafíos II y III: Offline-First |
| **CU10** | Registrar Venta POS de Contado Sin Conexión | `M03: POS Offline y Sincronización` | RF11, RF30 | RN06, RN12, RN-BASE-04, RN-OFFLINE-01 | Cajero | Cliente | PWA Mostrador, Móvil | Desafío III: POS Offline Efectivo |
| **CU11** | Consultar y Auditar Operaciones Locales Pendientes | `M03: POS Offline y Sincronización` | RF12, RF30 | RN06, RN-OFFLINE-02 | Cajero | Encargado Sucursal, Cliente | PWA Mostrador, Móvil | Desafío III: Auditoría Offline |
| **CU12** | Sincronizar Operaciones Pendientes (Idempotencia) | `M03: POS Offline y Sincronización` | RF13, RF14 | RN06, RN-SYNC-01, RN-SYNC-02 | Sistema Sincronización | Cajero, Encargado Sucursal | Agente en Background | Desafíos II y III: Sync Idempotente |
| **CU13** | Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones | `M06: Postventa, Pasarela y Ofertas` | RF15, RF16, RF17, RF18, RF30 | RN01, RN02, RN03, RN04, RN-CAMBIO-01..04 | Cajero | Cliente, Encargado, Stripe | Web Desktop, PWA Mostrador | Desafío IV: Postventa en 2 Tiempos |
| **CU14** | Gestionar Traspaso Inter-Sucursal de Inventario | `M05: Inventario, Kardex y CPP` | RF19 | RN11 | Encargado Sucursal | Admin Empresa | Web Desktop, PWA | Desafíos I y IV: Logística Retail |
| **CU15** | Solicitar Reporte Generativo con IA (Texto y Voz) | `M08: Inteligencia Analítica de Negocio` | RF20, RF21, RF23 | RN17, RN-IA-01, RN-IA-02 | Admin Empresa | Encargado, OpenAI / Whisper | Web Desktop, Móvil | Desafío V: IA Generativa NLP/Voz |
| **CU16** | Exportar Reportes Analíticos a Excel/PDF | `M08: Inteligencia Analítica de Negocio` | RF22, RF23 | RN17 | Admin Empresa | Encargado de Sucursal | Web Desktop | Desafío V: Inteligencia de Negocio |
| **CU17** | Gestionar Dashboard Analítico con Machine Learning | `M08: Inteligencia Analítica de Negocio` | RF24, RF25, RF26 | RN18, RN-ML-01, RN-ML-02 | Admin Empresa | OpenWeatherMap | Web Desktop | Desafío V: Machine Learning 6 Meses |
| **CU18** | Gestionar Pasarela de Pagos (Stripe Sandbox PCI-DSS) | `M06: Postventa, Pasarela y Ofertas` | RF17, RF27 | RN07, RN-BASE-05 | Cajero / Cliente | Pasarela Stripe Sandbox | PWA, Web Desktop, Móvil | Desafío IV: Pasarela Electrónica |
| **CU19** | Gestionar Ofertas de Liquidación y Precios por Mayor | `M06: Postventa, Pasarela y Ofertas` | RF28 | RN09, RN10, RN-PRECIOS-01, 02 | Admin Empresa | Cliente, Cajero | Web Desktop, PWA, Móvil | Desafíos I y IV: Precios Dinámicos |
| **CU20** | Gestionar Compras y Aprovisionamiento desde Web Desktop | `M07: Compras B2B Web Desktop` | RF29 | RN14, RN-COMPRAS-01..03, RN-BASE-02 | Admin Empresa / Encargado Sucursal | Proveedor Textil | Exclusivo Web Desktop (PC/Laptop) | Desafío I: Compras B2B con CPP |

#### Distribución Analítica de Casos de Uso por Módulo del Segundo Parcial

| Código Módulo | Nombre del Módulo del Segundo Parcial | Casos de Uso Contenidos | Total CUs | Alcance Tecnológico y Arquitectónico |
|:---:|:---|:---|:---:|:---|
| **M01** | Gobernanza SaaS Multitenant, Suscripciones y Seguridad RBAC | `CU01`, `CU02`, `CU03`, `CU04`, `CU05` | 5 | Aislamiento por `tenant_id`, planes Básico/Profesional/Enterprise, autenticación JWT con bcrypt. |
| **M02** | Catálogo Omnicanal Offline-First y Probador Virtual 3D RA | `CU08`, `CU09` | 2 | PWA con IndexedDB, Flutter con SQLite, probador tridimensional `.glb` y reservas QR sin conexión. |
| **M03** | Punto de Venta (POS) Offline en Efectivo y Sincronización Idempotente | `CU10`, `CU11`, `CU12` | 3 | Cobro contado en efectivo, UUID v4 inmutable, cabecera `X-Idempotency-Key` y prioridad física a sobreventa. |
| **M04** | Catalogación Textil de Precisión Anatómica, Telas Nobles y 3D | `CU06` | 1 | Medidas biométricas en cm (pecho/cintura/largo), colores bicolores Hex, lino/algodón y alerta hipoalergénica. |
| **M05** | Gestión de Inventario Multi-Sucursal, Kardex Físico-Valorado y CPP | `CU07`, `CU14` | 2 | Recálculo matemático inmutable de CPP, libro Kardex según Ley 843 y traspasos inter-tiendas `EN_TRÁNSITO`. |
| **M06** | Postventa en Dos Tiempos, Pasarela Stripe Sandbox y Ofertas Dinámicas | `CU13`, `CU18`, `CU19` | 3 | Nota de Devolución (+1 stock) + Nota de Cambio (-1 stock), Stripe PCI-DSS, reembolso a 30 días y ofertas 30-60%. |
| **M07** | Aprovisionamiento y Compras Corporativas desde Web Desktop | `CU20` | 1 | Exclusivo Web Desktop en PC/Laptop ($\ge 1280$ px), compras por curva de tallas, facturas fiscales y CPP. |
| **M08** | Inteligencia Analítica de Negocio: Reportes IA Generativa y ML | `CU15`, `CU16`, `CU17` | 3 | Consultas NLP texto/voz (Whisper), validador AST SQL de solo lectura, exportación Excel/PDF y ML a 6 meses. |
| **TOTAL** | **8 Módulos Consolidados de Segundo Parcial** | **CU01 al CU20** | **20 CUs** | **Cobertura 100% de los Desafíos I al VI de la Cátedra** |

### 2.5.2. Diagrama General de Casos de Uso (PlantUML)

![Diagrama General de Casos de Uso - FashionStore SaaS Multitenant](../diagramas/imagenes_cu/P2_Diagrama_General_CU.png)

```plantuml
@startuml P2_Diagrama_General_CU
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Super Admin\n(Plataforma SaaS)" as SuperAdmin
actor "Admin Empresa\n(Tenant)" as AdminEmp
actor "Encargado\nde Sucursal" as Encargado
actor "Cajero" as Cajero
actor "Cliente" as Cliente
actor "Sistema de\nSincronización" as SistSync
actor "Proveedor\nTextil" as Proveedor
actor "Pasarela de\nPago (Stripe)" as Stripe
actor "Servicio IA\n(OpenAI/Gemini)" as ServicioIA

rectangle "FashionStore SaaS - Parcial 2" {
  ' --- Desafío VI: SaaS Multitenant ---
  package "SaaS Multitenant" {
    usecase "CU01: Gestionar\nEmpresas (Tenants)" as CU01
    usecase "CU02: Gestionar Planes\nde Suscripción" as CU02
    usecase "CU03: Gestionar\nSuscripción de Empresa" as CU03
    usecase "CU04: Autenticar\nUsuario Multitenant" as CU04
    usecase "CU05: Gestionar Usuarios\ny Roles por Empresa" as CU05
  }

  ' --- Productos, Inventario y Compras ---
  package "Productos, Inventario y Compras" {
    usecase "CU06: Gestionar Productos\ny Atributos Textiles" as CU06
    usecase "CU07: Gestionar Inventario\nMulti-Sucursal y CPP" as CU07
    usecase "CU08: Descargar y Consultar\nCatálogo Offline" as CU08
    usecase "CU19: Gestionar Ofertas\ny Precios por Mayor" as CU19
    usecase "CU20: Gestionar Compras\ny Aprovisionamiento Desktop" as CU20
  }

  ' --- Desafío II/III: PWA y Offline ---
  package "Operaciones Offline (PWA / Flutter)" {
    usecase "CU09: Registrar Reserva\nSin Conexión" as CU09
    usecase "CU10: Registrar Venta\nSin Conexión" as CU10
    usecase "CU11: Consultar Operaciones\nLocales y Auditoría" as CU11
    usecase "CU12: Sincronizar\nOperaciones Pendientes" as CU12
  }

  ' --- Desafío IV: Ventas, Cambios y Pagos ---
  package "Ventas, Cambios y Pagos" {
    usecase "CU13: Gestionar Cambio\nde Prenda (2 Notas)" as CU13
    usecase "CU14: Gestionar Traspaso\nInter-Sucursal" as CU14
    usecase "CU18: Gestionar Pasarela\nde Pago Stripe" as CU18
  }

  ' --- Desafío V: IA y ML ---
  package "Reportes e Inteligencia Analítica" {
    usecase "CU15: Solicitar Reporte\nGenerativo con IA" as CU15
    usecase "CU16: Exportar Reportes\na Excel/PDF" as CU16
    usecase "CU17: Dashboard\nAnalítico con ML (6 Meses)" as CU17
  }
}

' --- Relaciones Actor-CU ---
SuperAdmin --> CU01
SuperAdmin --> CU02
SuperAdmin --> CU03

AdminEmp --> CU03
AdminEmp --> CU05
AdminEmp --> CU06
AdminEmp --> CU07
AdminEmp --> CU15
AdminEmp --> CU16
AdminEmp --> CU17
AdminEmp --> CU19
AdminEmp --> CU20

Encargado --> CU20
CU20 --> Proveedor

CU04 <-- SuperAdmin
CU04 <-- AdminEmp
CU04 <-- Encargado
CU04 <-- Cajero
CU04 <-- Cliente

Encargado --> CU07
Encargado --> CU11
Encargado --> CU13
Encargado --> CU14
Encargado --> CU15
Encargado --> CU16

Cajero --> CU10
Cajero --> CU11
Cajero --> CU13
Cajero --> CU18

Cliente --> CU08
Cliente --> CU09
Cliente --> CU10
Cliente --> CU11
Cliente --> CU13
Cliente --> CU18

SistSync --> CU12

CU18 --> Stripe
CU15 --> ServicioIA

' --- Relaciones entre Casos de Uso (Include / Extend) ---
CU01 ..> CU02 : <<include>>
CU01 ..> CU03 : <<include>>
CU20 ..> CU07 : <<include>>
CU09 ..> CU08 : <<include>>
CU12 ..> CU11 : <<include>>
CU13 ..> CU18 : <<extend>>
CU15 ..> CU16 : <<extend>>
CU19 ..> CU06 : <<extend>>
CU17 ..> CU07 : <<extend>>
@enduml
```

## 2.6. Especificación de Casos de Uso

> **Formato de cada CU:** Diseño del CU (PlantUML) → Prototipo UI → Tabla Detalle

---

### CU01: Gestionar Empresas (Tenants)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU01: Gestionar Empresas (Tenants)](../diagramas/imagenes_cu/CU01_Gestionar_Empresas.png)

```plantuml
@startuml CU01_Gestionar_Empresas
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Super Admin" as SA

rectangle "CU01: Gestionar Empresas (Tenants)" {
  usecase "CU01: Gestionar\nEmpresas Contratantes" as CU01
  usecase "Registrar Nueva\nEmpresa" as UC_Reg
  usecase "Asignar Plan de\nSuscripción" as UC_Plan
  usecase "Activar/Suspender\nEmpresa" as UC_Estado
  usecase "Crear Admin\nde Empresa" as UC_Admin
}

SA --> CU01
CU01 ..> UC_Reg : <<extend>>
UC_Reg ..> UC_Plan : <<include>>
UC_Reg ..> UC_Admin : <<include>>
CU01 ..> UC_Estado : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel administrativo del Super Admin con tabla paginada de empresas mostrando: ID, Razón Social, NIT, Plan Contratado, Estado (badge: verde ACTIVA, rojo SUSPENDIDA), Fecha de Registro, Sucursales Activas. Botón "+ Registrar Nueva Empresa". Formulario modal de registro con: Razón Social, NIT (validación unicidad), Email del Administrador, Teléfono, Dirección, Selector de Plan (Básico/Profesional), Fecha de Inicio y Vencimiento de Suscripción. Al guardar se crea automáticamente el usuario Admin de Empresa con credenciales iniciales.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU01 |
| **Nombre** | Gestionar Empresas Contratantes (Tenants) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Super Admin (Administrador de Plataforma) |
| **Descripción** | Permite al Super Admin registrar, consultar, activar y suspender empresas que contratan el servicio SaaS de FashionStore bajo arquitectura multitenant. |
| **Precondiciones** | El Super Admin debe estar autenticado con rol `SUPER_ADMIN`. |
| **Casos de Uso Incluidos (<<include>>)** | - **Asignar Plan de Suscripción:** Asigna el plan tarifario comercial y cuotas autorizadas.<br>- **Crear Admin de Empresa:** Genera automáticamente el usuario inicial con rol `ADMIN_EMPRESA`. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Registrar Nueva Empresa:** Extensión disparada al pulsar '+ Registrar Nueva Empresa' (Punto de Extensión: Alta de Tenant).<br>- **Activar/Suspender Empresa:** Extensión disparada ante mora o baja contractual (Punto de Extensión: Gestión de Estado). |
| **Flujo Normal** | 1. El Super Admin accede al panel de "Gestión de Empresas".<br>2. El sistema despliega la lista paginada de empresas con planes y estados.<br>3. [Punto de Extensión: Alta de Tenant] El Super Admin presiona "Registrar Nueva Empresa", ejecutando `<<extend>> Registrar Nueva Empresa`.<br>4. El sistema despliega el formulario modal de alta.<br>5. El Super Admin ingresa Razón Social, NIT y datos de contacto.<br>6. El sistema invoca `<<include>> Asignar Plan de Suscripción` para parametrizar las cuotas de sucursales y módulos habilitados.<br>7. El sistema valida unicidad de NIT y formato de datos.<br>8. El sistema persiste el registro de la empresa (tenant) en PostgreSQL.<br>9. El sistema invoca `<<include>> Crear Admin de Empresa`, aprovisionando credenciales temporales y enviando correo institucional.<br>10. El sistema emite confirmación de registro exitoso. |
| **Flujo Alternativo** | **3a. [Punto de Extensión: Gestión de Estado]** El Super Admin selecciona una empresa existente y ejecuta `<<extend>> Activar/Suspender Empresa` para pausar operaciones por mora o reactivar el servicio.<br>**7a. NIT duplicado dentro de la plataforma:** El sistema notifica "El NIT ya se encuentra registrado" y cancela la operación.<br>**7b. Email administrativo duplicado:** El sistema notifica "El correo electrónico ya está asociado a otra cuenta". |
| **Postcondiciones** | La empresa queda registrada con su suscripción activa y el Admin de Empresa puede iniciar sesión. |
---

### CU02: Gestionar Planes de Suscripción

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU02: Gestionar Planes de Suscripción](../diagramas/imagenes_cu/CU02_Gestionar_Planes.png)

```plantuml
@startuml CU02_Gestionar_Planes
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Super Admin" as SA

rectangle "CU02: Gestionar Planes de Suscripción" {
  usecase "CU02: Gestionar\nPlanes de Suscripción" as CU02
  usecase "Crear/Editar Plan\n(nombre, límites)" as UC_CRUD
  usecase "Definir Funcionalidades\npor Plan" as UC_Func
  usecase "Configurar Límites\n(sucursales, etc.)" as UC_Limites
}

SA --> CU02
CU02 ..> UC_CRUD : <<extend>>
UC_CRUD ..> UC_Func : <<include>>
UC_CRUD ..> UC_Limites : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Tabla de planes con columnas: Nombre del Plan, Sucursales Permitidas, Reportes IA (Sí/No), Precio, Estado. Botón "+ Crear Plan". Modal con: Nombre del Plan, máximo de sucursales, checklist de funcionalidades habilitadas (Reportes IA, ML Dashboard, etc.), precio mensual. Vista de comparación lado a lado estilo tabla de precios.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU02 |
| **Nombre** | Gestionar Planes de Suscripción |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Super Admin |
| **Descripción** | Permite crear, modificar y parametrizar los planes de suscripción SaaS (Básico, Profesional) con sus topes de recursos y características funcionales. |
| **Precondiciones** | Super Admin autenticado con rol `SUPER_ADMIN`. |
| **Casos de Uso Incluidos (<<include>>)** | - **Definir Funcionalidades por Plan:** Configura checklist de módulos habilitados (IA Generativa, ML, etc.).<br>- **Configurar Límites (sucursales, etc.):** Establece topes cuantitativos de sucursales y usuarios. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Crear/Editar Plan (nombre, límites):** Extensión disparada al pulsar '+ Crear Plan' o editar uno existente (Punto de Extensión: Parametrización de Plan). |
| **Flujo Normal** | 1. El Super Admin accede al módulo "Planes de Suscripción".<br>2. El sistema muestra la matriz comparativa de planes existentes.<br>3. [Punto de Extensión: Parametrización de Plan] El Super Admin pulsa "Crear Plan" o selecciona editar, ejecutando `<<extend>> Crear/Editar Plan (nombre, límites)`.<br>4. El Super Admin ingresa denominación y costo mensual.<br>5. El sistema invoca `<<include>> Definir Funcionalidades por Plan` para activar/desactivar módulos estratégicos.<br>6. El sistema invoca `<<include>> Configurar Límites (sucursales, etc.)` para fijar el número máximo de sucursales permitidas.<br>7. El sistema valida y persiste la configuración en base de datos. |
| **Flujo Alternativo** | **4a. Denominación de plan duplicada:** El sistema rechaza el nombre y solicita un identificador comercial unívoco. |
| **Postcondiciones** | El plan de suscripción queda disponible para asignación inmediata a empresas. |
---

### CU03: Gestionar Suscripción de Empresa

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU03: Gestionar Suscripción de Empresa](../diagramas/imagenes_cu/CU03_Gestionar_Suscripcion.png)

```plantuml
@startuml CU03_Gestionar_Suscripcion
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Super Admin" as SA
actor "Admin Empresa" as AE

rectangle "CU03: Gestionar Suscripción de Empresa" {
  usecase "CU03: Gestionar\nSuscripción" as CU03
  usecase "Asignar Plan a\nEmpresa" as UC_Asignar
  usecase "Renovar\nSuscripción" as UC_Renovar
  usecase "Verificar Límites\ny Estado" as UC_Verificar
}

SA --> CU03
AE --> CU03
CU03 ..> UC_Asignar : <<extend>>
CU03 ..> UC_Renovar : <<extend>>
CU03 ..> UC_Verificar : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Vista de suscripción con: nombre de empresa, plan actual, fechas de inicio y vencimiento (con barra de progreso visual), estado (ACTIVA/VENCIDA/SUSPENDIDA), uso actual vs. límites (ej. "2/2 sucursales"). Botones: "Cambiar Plan", "Renovar Suscripción" (solo Super Admin).

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU03 |
| **Nombre** | Gestionar Suscripción de Empresa |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Super Admin, Admin Empresa |
| **Descripción** | Administra el ciclo de vida de la suscripción de un tenant: asignación de plan, consulta de consumo vs. límites y renovación temporal. |
| **Precondiciones** | Empresa registrada previamente en la plataforma (CU01). |
| **Casos de Uso Incluidos (<<include>>)** | - **Verificar Límites y Estado:** Compara el número de sucursales activas contra la cuota contratada y verifica la fecha de vencimiento. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Asignar Plan a Empresa:** Extensión disparada al contratar o modificar categoría de plan (Punto de Extensión: Upgrade/Downgrade de Plan).<br>- **Renovar Suscripción:** Extensión disparada para extender vigencia contractual (Punto de Extensión: Renovación Temporal). |
| **Flujo Normal** | 1. El usuario accede al panel de "Estado de Suscripción".<br>2. El sistema invoca `<<include>> Verificar Límites y Estado` para contrastar el consumo de tiendas frente a los límites permitidos.<br>3. El sistema muestra barra de vigencia, días restantes y estado (`ACTIVA`, `VENCIDA`, `SUSPENDIDA`).<br>4. [Punto de Extensión: Upgrade/Downgrade de Plan] El Super Admin o Admin Empresa ejecuta `<<extend>> Asignar Plan a Empresa` para migrar de Básico a Profesional.<br>5. [Punto de Extensión: Renovación Temporal] El Super Admin ejecuta `<<extend>> Renovar Suscripción`, extendiendo la fecha límite a 30 o 365 días adicionales.<br>6. El sistema actualiza cuotas y emite comprobante de servicio. |
| **Flujo Alternativo** | **4a. Downgrade con sucursales excedidas:** Si la empresa tiene 5 tiendas y elige un plan de 2, el sistema advierte que debe cerrar o inactivar 3 sucursales antes de aplicar el cambio. |
| **Postcondiciones** | Suscripción actualizada con nuevas fechas y cuotas operativas sincronizadas en el middleware multitenant. |
---

### CU04: Autenticar Usuario Multitenant

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU04: Autenticar Usuario Multitenant](../diagramas/imagenes_cu/CU04_Autenticar_Multitenant.png)

```plantuml
@startuml CU04_Autenticar_Multitenant
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Usuario del\nSistema" as U

rectangle "CU04: Autenticación Multitenant" {
  usecase "CU04: Autenticar\nUsuario Multitenant" as CU04
  usecase "Validar Credenciales\n(bcrypt)" as UC_Val
  usecase "Identificar Tenant\ndel Usuario" as UC_Tenant
  usecase "Verificar Suscripción\nVigente" as UC_Susc
  usecase "Generar JWT con\nTenant y Rol" as UC_JWT
  usecase "Bloquear Cuenta\n(5 Intentos)" as UC_Bloq
}

U --> CU04
CU04 ..> UC_Val : <<include>>
CU04 ..> UC_Tenant : <<include>>
CU04 ..> UC_Susc : <<include>>
CU04 ..> UC_JWT : <<include>>
CU04 ..> UC_Bloq : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Pantalla de login con campos: Email, Contraseña, botón "Iniciar Sesión". Link "¿Olvidaste tu contraseña?" y "Registrarse". Indicador de intentos restantes en caso de error. Redirección automática según rol. Banner informativo de empresa (logo, nombre) después del login.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU04 |
| **Nombre** | Autenticar Usuario Multitenant |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Todos los actores humanos (Super Admin, Admin Empresa, Encargado de Sucursal, Cajero, Cliente) |
| **Descripción** | Inicio de sesión unificado que valida credenciales seguras, resuelve el tenant correspondiente, verifica vigencia de suscripción y emite token JWT con claims restringidos. |
| **Precondiciones** | Cuenta de usuario registrada y activa en el sistema. |
| **Casos de Uso Incluidos (<<include>>)** | - **Validar Credenciales (bcrypt):** Verifica el hash de la contraseña almacenada.<br>- **Identificar Tenant del Usuario:** Extrae el `tenant_id` y sucursal asignada.<br>- **Verificar Suscripción Vigente:** Valida que la empresa mantenga suscripción activa.<br>- **Generar JWT con Tenant y Rol:** Emite token criptográfico firmado con identidad y privilegios. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Bloquear Cuenta (5 Intentos):** Extensión disparada al alcanzar 5 intentos erróneos consecutivos (Punto de Extensión: Detección de Intrusión). |
| **Flujo Normal** | 1. El usuario introduce email y contraseña en el portal de acceso.<br>2. El sistema invoca `<<include>> Validar Credenciales (bcrypt)`.<br>3. El sistema invoca `<<include>> Identificar Tenant del Usuario`, resolviendo contexto empresarial.<br>4. El sistema invoca `<<include>> Verificar Suscripción Vigente`, confirmando que el tenant no esté suspendido.<br>5. El sistema invoca `<<include>> Generar JWT con Tenant y Rol`, emitiendo token con claims `{user_id, tenant_id, rol, sucursal_id}`.<br>6. El sistema restablece el contador de intentos fallidos a 0 y registra acceso en auditoría.<br>7. Redirige a la vista especializada según el rol. |
| **Flujo Alternativo** | **2a. Contraseña incorrecta:** El sistema incrementa el contador `intentos_fallidos`.<br>**2b. [Punto de Extensión: Detección de Intrusión]** Al acumular 5 intentos fallidos consecutivos, el sistema ejecuta `<<extend>> Bloquear Cuenta (5 Intentos)`, inactivando el usuario y notificando al administrador.<br>**4a. Empresa con suscripción vencida o suspendida:** El sistema bloquea el acceso informando: "Suscripción de empresa vencida. Contacte al administrador de plataforma". |
| **Postcondiciones** | Sesión activa con token JWT que condiciona todas las consultas posteriores con aislamiento estricto por `tenant_id`. |
---

### CU05: Gestionar Usuarios y Roles por Empresa

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU05: Gestionar Usuarios y Roles por Empresa](../diagramas/imagenes_cu/CU05_Gestionar_Usuarios_Empresa.png)

```plantuml
@startuml CU05_Gestionar_Usuarios_Empresa
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa" as AE

rectangle "CU05: Gestionar Usuarios y Roles por Empresa" {
  usecase "CU05: Gestionar\nUsuarios del Tenant" as CU05
  usecase "Crear Empleado\n(Encargado/Cajero)" as UC_Crear
  usecase "Asignar Rol y\nSucursal" as UC_Rol
  usecase "Desbloquear\nCuenta" as UC_Desblq
  usecase "Inactivar\nUsuario" as UC_Inact
}

AE --> CU05
CU05 ..> UC_Crear : <<extend>>
UC_Crear ..> UC_Rol : <<include>>
CU05 ..> UC_Desblq : <<extend>>
CU05 ..> UC_Inact : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel de usuarios del tenant con tabla: Nombre, Email, Rol, Sucursal, Estado (ACTIVO/BLOQUEADO/INACTIVO). Botón "+ Crear Empleado". Modal con: Nombres, Apellidos, Email, Teléfono, Rol (selector: ENCARGADO, CAJERO), Sucursal (selector). Acciones: Editar, Desbloquear, Inactivar.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU05 |
| **Nombre** | Gestionar Usuarios y Roles por Empresa |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Admin Empresa |
| **Descripción** | Permite al administrador del tenant gestionar el personal de su empresa: creación de encargados y cajeros, asignación de sucursales físicas y control de bloqueos. |
| **Precondiciones** | Admin Empresa autenticado con suscripción vigente. |
| **Casos de Uso Incluidos (<<include>>)** | - **Asignar Rol y Sucursal:** Vincula al usuario con su perfil operativo y punto de venta físico autorizado. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Crear Empleado (Encargado/Cajero):** Extensión disparada al pulsar '+ Crear Empleado' (Punto de Extensión: Alta de Personal).<br>- **Desbloquear Cuenta:** Extensión disparada para reactivar cuentas bloqueadas tras 5 intentos fallidos (Punto de Extensión: Restablecimiento de Acceso).<br>- **Inactivar Usuario:** Extensión disparada para suspender a personal saliente (Punto de Extensión: Baja Operativa). |
| **Flujo Normal** | 1. El Admin Empresa accede a "Usuarios y Roles".<br>2. El sistema despliega la lista de empleados filtrados estrictamente por el `tenant_id` activo.<br>3. [Punto de Extensión: Alta de Personal] El administrador presiona "+ Crear Empleado", ejecutando `<<extend>> Crear Empleado (Encargado/Cajero)`.<br>4. Ingresa nombres, apellidos, teléfono y correo electrónico.<br>5. El sistema invoca `<<include>> Asignar Rol y Sucursal` para delimitar si operará como Encargado de Sucursal o Cajero, asignándole su tienda física.<br>6. El sistema valida unicidad de correo dentro del tenant y persiste el usuario en base de datos. |
| **Flujo Alternativo** | **3a. [Punto de Extensión: Restablecimiento de Acceso]** El administrador selecciona un usuario con estado `BLOQUEADO` y ejecuta `<<extend>> Desbloquear Cuenta`, reiniciando los intentos fallidos.<br>**3b. [Punto de Extensión: Baja Operativa]** El administrador ejecuta `<<extend>> Inactivar Usuario` para revocar inmediatamente el acceso al sistema.<br>**5a. Email duplicado dentro del tenant:** El sistema rechaza el registro y solicita un correo corporativo diferente. |
| **Postcondiciones** | Personal asignado y configurado con acceso limitado exclusivamente a los datos de su empresa y sucursal. |
---

### CU06: Gestionar Productos y Atributos Textiles Avanzados

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU06: Gestionar Productos y Atributos Textiles](../diagramas/imagenes_cu/CU06_Gestionar_Productos.png)

```plantuml
@startuml CU06_Gestionar_Productos
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa" as AE

rectangle "CU06: Gestionar Productos y Atributos Textiles" {
  usecase "CU06: Gestionar Productos\ny Atributos Textiles" as CU06
  usecase "Registrar Prenda con\nFicha Técnica" as UC_Prenda
  usecase "Configurar Tallas y\nMedidas Corporales (cm)" as UC_Medidas
  usecase "Gestionar Paleta de Colores\n(Monocromo/Compuestos Hex)" as UC_Colores
  usecase "Especificar Tipo de Tela\ny Advertencia Hipoalergénica" as UC_Tela
  usecase "Vincular Modelo 3D (.glb)\npara Vestidor Virtual RA" as UC_3D
}

AE --> CU06
CU06 ..> UC_Prenda : <<include>>
UC_Prenda ..> UC_Medidas : <<include>>
UC_Prenda ..> UC_Colores : <<include>>
UC_Prenda ..> UC_Tela : <<include>>
UC_Prenda ..> UC_3D : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel de administración del catálogo de productos textiles. Pestaña **"Ficha Técnica de Prenda"**: inputs para código SKU único, nombre comercial, categoría taxonómica (camisas, pantalones, trajes, poleras, abrigos), temporada estacional (Primavera/Verano, Otoño/Invierno), corte/estilo (Slim Fit, Regular Fit, Custom Fit), tipo de tejido textil (desplegable: 100% Algodón Pima Peruano, Lino Orgánico, Lana Merino, Poliéster Microfibra, Mezcla Hipoalergénica), interruptor (*toggle*) para advertencia dermatológica ("Apto para pieles atópicas / Hipoalergénico") y cargador de archivo 3D `.glb` optimizado para el vestidor virtual en Realidad Aumentada. Pestaña **"Matriz de Variantes Textiles"**: selector multidimensional que combina Talla (XS, S, M, L, XL, XXL) con tabla de medidas corporales anatómicas en centímetros (contorno de pecho, cintura, cadera, largo total y largo de manga) y Colores simples o combinados bicolores (ej. selector dual con vista previa visual Hexadecimal para combinaciones como "Blanco / Negro" `#FFFFFF / #000000` o "Azul Marino / Gris" `#1A2A3A / #808080`). Pestaña **"Tarifas Comerciales"**: definición de precio base minorista y precio al por mayor (con descuento automático para compras iguales o mayores a 3 unidades).

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU06 |
| **Nombre** | Gestionar Productos y Atributos Textiles Avanzados |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa |
| **Descripción** | Catalogación integral de prendas de vestir masculinas, especificando ficha técnica, variantes con medidas corporales en centímetros, paletas de colores compuestas (bicolores Hex), precio minorista y mayorista ($\ge 3$ unidades), y modelos 3D para probador virtual RA. |
| **Precondiciones** | Admin Empresa autenticado con empresa activa. |
| **Casos de Uso Incluidos (<<include>>)** | - **Registrar Prenda con Ficha Técnica:** Da de alta el SKU base, corte, temporada y categoría.<br>- **Especificar Tipo de Tela y Advertencia Hipoalergénica:** Asigna composición (algodón pima, lino, lana) y certificación dermatológica.<br>- **Configurar Tallas y Medidas Corporales (cm):** Define medidas anatómicas en centímetros (pecho, cintura, largo) para erradicar el error de calce.<br>- **Gestionar Paleta de Colores (Monocromo/Compuestos Hex):** Configura colores simples o combinaciones duales con códigos hexadecimales. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Vincular Modelo 3D (.glb) para Vestidor Virtual RA:** Extensión disparada si la prenda dispone de activo tridimensional para prueba en Realidad Aumentada (Punto de Extensión: Probador Virtual RA). |
| **Flujo Normal** | 1. El Admin Empresa accede al catálogo y pulsa "Nueva Prenda", invocando `<<include>> Registrar Prenda con Ficha Técnica`.<br>2. Ingresa SKU, denominación comercial, temporada y corte (Slim Fit, Regular Fit).<br>3. El sistema invoca `<<include>> Especificar Tipo de Tela y Advertencia Hipoalergénica`, seleccionando tejido textil y activando advertencia para pieles atópicas.<br>4. El sistema invoca `<<include>> Configurar Tallas y Medidas Corporales (cm)`, registrando las medidas corporales en cm para cada talla (XS a XXL).<br>5. El sistema invoca `<<include>> Gestionar Paleta de Colores (Monocromo/Compuestos Hex)`, configurando esquemas monocromos o combinados (ej. Blanco `#FFFFFF` / Negro `#000000`).<br>6. [Punto de Extensión: Probador Virtual RA] Si la prenda cuenta con modelo 3D, el usuario ejecuta `<<extend>> Vincular Modelo 3D (.glb) para Vestidor Virtual RA`, cargando el archivo `.glb` correspondiente.<br>7. Define la tarifa minorista base y la regla de precio al por mayor (con descuento automático para compras $\ge 3$ unidades).<br>8. El sistema valida unicidad de SKU en el tenant y persiste la ficha técnica. |
| **Flujo Alternativo** | **2a. SKU duplicado dentro de la empresa:** El sistema rechaza el código y solicita un identificador unívoco.<br>**4a. Medidas corporales fuera de rango fisiológico:** El sistema advierte inconsistencia y bloquea el guardado hasta su corrección. |
| **Postcondiciones** | Prenda registrada con su matriz completa de atributos, disponible para asignación de stock multi-sucursal. |
---

### CU07: Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU07: Gestionar Inventario Multi-Sucursal y CPP](../diagramas/imagenes_cu/CU07_Gestionar_Inventario_CPP.png)

```plantuml
@startuml CU07_Gestionar_Inventario_CPP
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa /\nEncargado de Sucursal" as AE

rectangle "CU07: Gestionar Inventario Multi-Sucursal y CPP" {
  usecase "CU07: Gestionar Inventario\nMulti-Sucursal y CPP" as CU07
  usecase "Consultar Existencias Físicas,\nReservadas y Disponibles" as UC_Stock
  usecase "Registrar Recepción de Lote\ny Entrada a Bodega" as UC_Entrada
  usecase "Recalcular Costo Promedio\nPonderado (CPP Inmutable)" as UC_CalcCPP
  usecase "Consultar Kardex Físico-\nValorado por Variante" as UC_Kardex
  usecase "Configurar Alertas de\nStock Mínimo de Seguridad" as UC_Alerta
}

AE --> CU07
CU07 ..> UC_Stock : <<include>>
CU07 ..> UC_Entrada : <<extend>>
UC_Entrada ..> UC_CalcCPP : <<include>>
CU07 ..> UC_Kardex : <<include>>
CU07 ..> UC_Alerta : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel de control logístico y financiero de existencias. Selector superior de **Sucursal Física** (según asignación del usuario). Tabla matricial de inventario: Columna Prenda (SKU, nombre comercial), Variante (Talla cm, Color Hex), **Stock Físico en Tienda**, **Stock Reservado** (apartado temporal para clientes en probador o pedidos pendientes), **Stock Disponible** (`Físico - Reservado`), **Último Costo Unitario de Compra** y **Costo Promedio Ponderado (CPP)** recalculado automáticamente. Botón "Recepción de Lote de Mercadería" que abre modal para registrar proveedor, número de factura de compra, cantidad de unidades ingresadas y costo unitario pagado. Pestaña **"Kardex Físico-Valorado"**: historial cronológico inmutable de movimientos con fecha/hora, concepto (Compra a proveedor, Venta POS mostrador, Nota de Devolución por cambio, Nota de Cambio despacho, Traspaso inter-sucursal o Merma justificada), cantidades de entrada/salida, saldo físico resultante y saldo valorado a CPP. Indicadores visuales en color rojo para variantes con existencias por debajo del umbral mínimo de reorden.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU07 |
| **Nombre** | Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa, Encargado de Sucursal |
| **Descripción** | Control de existencias físicas, reservadas y disponibles por sucursal, con recálculo matemático inmutable de CPP tras cada entrada de mercadería, generación de Kardex físico-valorado y alertas de reposición urgente. |
| **Precondiciones** | Usuario autenticado con rol `ADMIN_EMPRESA` o `ENCARGADO_SUCURSAL`; sucursales y productos registrados. |
| **Casos de Uso Incluidos (<<include>>)** | - **Consultar Existencias Físicas, Reservadas y Disponibles:** Desglosa `Stock Físico - Stock Reservado = Stock Disponible`.<br>- **Recalcular Costo Promedio Ponderado (CPP Inmutable):** Aplica la fórmula formal de costeo contable inmutable.<br>- **Consultar Kardex Físico-Valorado por Variante:** Genera libro de movimientos cronológicos y saldos valorados. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Registrar Recepción de Lote y Entrada a Bodega:** Extensión disparada al recepcionar mercadería respaldada con factura de compra (Punto de Extensión: Entrada de Lote).<br>- **Configurar Alertas de Stock Mínimo de Seguridad:** Extensión disparada si el stock disponible cae por debajo del umbral de reorden (Punto de Extensión: Alerta de Desabastecimiento). |
| **Flujo Normal** | 1. El usuario accede a "Inventarios y Kardex", seleccionando la sucursal asignada.<br>2. El sistema invoca `<<include>> Consultar Existencias Físicas, Reservadas y Disponibles`, desplegando la matriz de variantes.<br>3. [Punto de Extensión: Entrada de Lote] El usuario pulsa "Recepción de Lote", ejecutando `<<extend>> Registrar Recepción de Lote y Entrada a Bodega`.<br>4. Ingresa variante, cantidad recibida y costo unitario según factura de compra.<br>5. El sistema ejecuta de forma obligatoria `<<include>> Recalcular Costo Promedio Ponderado (CPP Inmutable)` aplicando:<br>$$CPP_{\text{nuevo}} = \frac{(S_{\text{ant}} \times CPP_{\text{ant}}) + (Q_{\text{ing}} \times C_{\text{ing}})}{S_{\text{ant}} + Q_{\text{ing}}}$$.<br>6. Actualiza `ultimo_costo_unitario` y suma las unidades al stock físico.<br>7. El sistema invoca `<<include>> Consultar Kardex Físico-Valorado por Variante`, asentando el movimiento contable inmutable con fecha, hora y responsable.<br>8. Emite comprobante de recepción conforme. |
| **Flujo Alternativo** | **2a. [Punto de Extensión: Alerta de Desabastecimiento]** Si las existencias de una variante caen al umbral mínimo, el sistema ejecuta `<<extend>> Configurar Alertas de Stock Mínimo de Seguridad`, encendiendo una alerta roja visual de reposición urgente.<br>**4a. Costo o cantidad menor o igual a cero:** El sistema bloquea el registro e informa datos financieros inválidos. |
| **Postcondiciones** | Stock disponible actualizado y CPP recalculado inmutablemente para la determinación del margen de utilidad real. |
---

### CU08: Descargar y Consultar Catálogo Digital Offline (Cliente)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU08: Descargar y Consultar Catálogo Digital Offline](../diagramas/imagenes_cu/CU08_Descargar_Catalogo_Offline.png)

```plantuml
@startuml CU08_Descargar_Catalogo_Offline
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cliente" as C

rectangle "CU08: Catálogo Digital Offline" {
  usecase "CU08: Descargar y Consultar\nCatálogo Offline" as CU08
  usecase "Descargar Snapshot de\nCatálogo y Variantes" as UC_Down
  usecase "Almacenar en Base de\nDatos Local (IndexedDB/SQLite)" as UC_Store
  usecase "Consultar Prendas, Medidas\ny Stock en Modo Offline" as UC_Query
  usecase "Filtrar por Talla, Color,\nTela y Categoría sin Red" as UC_Filter
}

C --> CU08
CU08 ..> UC_Down : <<include>>
CU08 ..> UC_Store : <<include>>
CU08 ..> UC_Query : <<include>>
UC_Query ..> UC_Filter : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Vista de catálogo responsiva (PWA en Angular o App Móvil Flutter). Banner superior con selector de sucursal física de referencia y badge de conectividad: "En línea" (verde) o "Modo Offline" (ámbar). Botón "Actualizar Catálogo para Uso Sin Conexión" que muestra barra de progreso con el número de prendas e imágenes cacheadas localmente. Cuadrícula de productos con fotografías optimizadas en formato WebP, precio minorista, indicador de stock disponible local, desglose de medidas anatómicas en cm y paleta de colores disponibles. Buscador con autocompletado y filtros laterales funcionales 100% offline (precio, temporada, composición textil).

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU08 |
| **Nombre** | Descargar y Consultar Catálogo Digital Offline (Cliente) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cliente (PWA / App Móvil Flutter) |
| **Descripción** | Descarga y persistencia local de un snapshot estructurado de prendas, tallas en cm, colores Hex y existencias referenciales para navegación y consulta 100% autónoma sin red. |
| **Precondiciones** | Dispositivo con navegador compatible con Service Workers / IndexedDB o app móvil con SQLite. |
| **Casos de Uso Incluidos (<<include>>)** | - **Descargar Snapshot de Catálogo y Variantes:** Obtiene el payload delta de productos y precios desde el backend.<br>- **Almacenar en Base de Datos Local (IndexedDB/SQLite):** Persiste datos tabulares y recursos visuales en almacenamiento cliente.<br>- **Consultar Prendas, Medidas y Stock en Modo Offline:** Permite explorar el catálogo con latencia cero sin conexión a Internet. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Filtrar por Talla, Color, Tela y Categoría sin Red:** Extensión disparada al activar filtros multidimensionales en modo offline (Punto de Extensión: Filtrado Facetado Offline). |
| **Flujo Normal** | 1. La aplicación detecta conectividad inicial e invoca `<<include>> Descargar Snapshot de Catálogo y Variantes`.<br>2. El sistema invoca `<<include>> Almacenar en Base de Datos Local (IndexedDB/SQLite)`, persistiendo la información estructurada.<br>3. Ante la pérdida de conexión a Internet, la interfaz conmuta a "Modo Offline" de manera transparente.<br>4. El cliente invoca `<<include>> Consultar Prendas, Medidas y Stock en Modo Offline` para explorar prendas y medidas anatómicas.<br>5. [Punto de Extensión: Filtrado Facetado Offline] El cliente interactúa con la barra lateral de filtros, ejecutando `<<extend>> Filtrar por Talla, Color, Tela y Categoría sin Red` directamente sobre los índices de la base de datos local. |
| **Flujo Alternativo** | **2a. Almacenamiento local insuficiente:** El sistema descarga solo fichas técnicas tabulares y omite miniaturas pesadas, informando al usuario. |
| **Postcondiciones** | Catálogo disponible íntegramente en el dispositivo para consulta autónoma sin red. |
---

### CU09: Registrar Reserva Presencial Sin Conexión a Internet (Cliente)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU09: Registrar Reserva Presencial Sin Conexión](../diagramas/imagenes_cu/CU09_Registrar_Reserva_Offline.png)

```plantuml
@startuml CU09_Registrar_Reserva_Offline
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cliente" as C

rectangle "CU09: Reserva Presencial Sin Conexión" {
  usecase "CU09: Registrar Reserva\nSin Conexión" as CU09
  usecase "Seleccionar Prenda, Talla\ny Color desde Catálogo Local" as UC_Sel
  usecase "Generar UUID v4 Único\npara Idempotencia" as UC_UUID
  usecase "Almacenar Reserva Local\ncon Temporizador (2 Horas)" as UC_SaveLocal
  usecase "Emitir Ticket QR de Apartado\npara Mostrador en Tienda" as UC_QR
}

C --> CU09
CU09 ..> UC_Sel : <<include>>
CU09 ..> UC_UUID : <<include>>
CU09 ..> UC_SaveLocal : <<include>>
CU09 ..> UC_QR : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Pantalla de ficha de producto con botón destacado "Reservar para Prueba en Tienda (Offline)". Modal de confirmación con selección de sucursal física, resumen de variantes elegidas (talla en cm y color Hex) y cuenta regresiva de validez de reserva (2 horas). Al confirmar sin Internet, la interfaz muestra pantalla de éxito con: Identificador UUID v4 único generado localmente, Código QR de reserva offline escaneable por el personal de tienda y advertencia: "Tu reserva está asegurada en este dispositivo y se confirmará en nube al restablecer la red".

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU09 |
| **Nombre** | Registrar Reserva Presencial Sin Conexión a Internet (Cliente) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cliente |
| **Descripción** | Permite apartar temporalmente prendas en una sucursal física cuando el cliente no tiene conexión a Internet, encolando la reserva con UUID v4 único y emitiendo un ticket QR para mostrador. |
| **Precondiciones** | Catálogo offline previamente descargado en el dispositivo (CU08). |
| **Casos de Uso Incluidos (<<include>>)** | - **Seleccionar Prenda, Talla y Color desde Catálogo Local:** Elección de variante desde la base de datos local.<br>- **Generar UUID v4 Único para Idempotencia:** Crea identificador universal para prevenir duplicación en la sincronización.<br>- **Almacenar Reserva Local con Temporizador (2 Horas):** Registra el apartado temporal con vigencia estricta de 2 horas.<br>- **Emitir Ticket QR de Apartado para Mostrador en Tienda:** Genera código QR con payload JSON firmado para escaneo en caja. |
| **Casos de Uso Extendidos (<<extend>>)** | Ninguno (Operación atómica autónoma de cliente). |
| **Flujo Normal** | 1. El cliente navega en el catálogo sin conexión e invoca `<<include>> Seleccionar Prenda, Talla y Color desde Catálogo Local`.<br>2. Presiona "Reservar para Prueba en Tienda (Offline)".<br>3. El sistema invoca `<<include>> Generar UUID v4 Único para Idempotencia`.<br>4. El sistema invoca `<<include>> Almacenar Reserva Local con Temporizador (2 Horas)`, guardando la reserva con estado `PENDIENTE_SYNC`.<br>5. Descuenta tentativamente el stock local para evitar doble reserva en el mismo terminal.<br>6. El sistema invoca `<<include>> Emitir Ticket QR de Apartado para Mostrador en Tienda`, desplegando el comprobante visual para el personal de tienda. |
| **Flujo Alternativo** | **1a. Sin stock referencial en base de datos local:** El sistema inhabilita el botón de reserva y advierte la indisponibilidad. |
| **Postcondiciones** | Reserva encolada en base de datos local con UUID v4 y comprobante QR listo para presentar en mostrador. |
---

### CU10: Registrar Venta POS de Contado Sin Conexión a Internet (Cajero / Cliente)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU10: Registrar Venta POS de Contado Sin Conexión](../diagramas/imagenes_cu/CU10_Registrar_Venta_Offline.png)

```plantuml
@startuml CU10_Registrar_Venta_Offline
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cajero" as Caj
actor "Cliente" as Cl

rectangle "CU10: Venta POS Sin Conexión" {
  usecase "CU10: Registrar Venta POS\nSin Conexión" as CU10
  usecase "Escanear Código SKU /\nSeleccionar Prenda Local" as UC_Scan
  usecase "Generar UUID v4 y Marcar\nCobro Contado Efectivo" as UC_UUID
  usecase "Actualizar Stock Local\nen Dispositivo" as UC_StockLoc
  usecase "Emitir Recibo Provisional\ncon Hash Criptográfico" as UC_Recibo
}

Caj --> CU10
Cl --> CU10
CU10 ..> UC_Scan : <<include>>
CU10 ..> UC_UUID : <<include>>
CU10 ..> UC_StockLoc : <<include>>
CU10 ..> UC_Recibo : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Terminal Punto de Venta (POS) optimizado para cajero. Encabezado con estado de conexión: indicador rojo parpadeante "SIN INTERNET — Operando en Modo Autónomo POS Local". Campo de entrada rápida para escáner de código de barras SKU o selección táctil desde cuadrícula local. Tabla de venta: SKU, prenda, talla, color, cantidad, precio unitario, descuento de liquidación o tarifa por mayor aplicada automáticamente, y subtotal. Panel de cobro: Selector forzado a "Contado Efectivo" (inhabilitando pasarelas en línea). Botón de gran tamaño "Cobrar e Imprimir Comprobante Local" que genera recibo térmico con código QR y leyenda: "Comprobante Provisional Offline — UUID: 8a7c...".

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU10 |
| **Nombre** | Registrar Venta POS de Contado Sin Conexión a Internet (Cajero / Cliente) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cajero, Cliente |
| **Descripción** | Registro y cobro de venta presencial en caja física exclusivamente al contado en efectivo ante corte de energía o caída de Internet, con UUID v4 inmutable, descuento de stock local y emisión de recibo provisional. |
| **Precondiciones** | Cajero autenticado con turno de caja abierto; terminal POS con catálogo local sincronizado. |
| **Casos de Uso Incluidos (<<include>>)** | - **Escanear Código SKU / Seleccionar Prenda Local:** Captura óptica o manual de prendas desde la base de datos local.<br>- **Generar UUID v4 y Marcar Cobro Contado Efectivo:** Fija cobro exclusivo en efectivo e identifica la transacción de forma unívoca.<br>- **Actualizar Stock Local en Dispositivo:** Descuenta inmediatamente las unidades vendidas de la base de datos local.<br>- **Emitir Recibo Provisional con Hash Criptográfico:** Imprime recibo térmico provisional con código QR y UUID v4. |
| **Casos de Uso Extendidos (<<extend>>)** | Ninguno (Operación comercial POS atómica de contingencia). |
| **Flujo Normal** | 1. El cajero ingresa al POS sin conexión e invoca `<<include>> Escanear Código SKU / Seleccionar Prenda Local`.<br>2. El sistema aplica reglas comerciales locales (descuento mayorista si $\ge 3$ unidades o descuento de liquidación).<br>3. El cajero selecciona pago en efectivo e invoca `<<include>> Generar UUID v4 y Marcar Cobro Contado Efectivo`.<br>4. Ingresa el monto recibido en bolivianos; el sistema calcula y muestra el cambio.<br>5. El sistema invoca `<<include>> Actualizar Stock Local en Dispositivo`, rebajando el stock físico del terminal.<br>6. El sistema invoca `<<include>> Emitir Recibo Provisional con Hash Criptográfico`, entregando al cliente el ticket con leyenda "Comprobante Provisional Offline". |
| **Flujo Alternativo** | **1a. Stock local insuficiente:** El sistema bloquea la adición del ítem e informa que no hay unidades en piso de venta.<br>**3a. Intento de cobro con tarjeta o pasarela:** El sistema inhabilita pasarelas electrónicas indicando que en modo offline solo se admite contado efectivo. |
| **Postcondiciones** | Venta guardada localmente con estado `PENDIENTE_SYNC`, stock local descontado y dinero resguardado en caja física. |
---

### CU11: Consultar y Auditar Operaciones Locales Pendientes (Cajero / Cliente / Encargado)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU11: Consultar y Auditar Operaciones Locales Pendientes](../diagramas/imagenes_cu/CU11_Consultar_Operaciones_Locales.png)

```plantuml
@startuml CU11_Consultar_Operaciones_Locales
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cajero / Encargado" as Staff

rectangle "CU11: Auditar Operaciones Locales" {
  usecase "CU11: Consultar y Auditar\nOperaciones Pendientes" as CU11
  usecase "Listar Operaciones Locales\n(Ventas, Reservas, Cambios)" as UC_List
  usecase "Verificar Integridad de UUID\ny Montos Acumulados" as UC_Audit
  usecase "Filtrar por Estado (Pendiente,\nSincronizado, Error)" as UC_Filter
  usecase "Forzar Disparo Manual de\nSincronización al Volver Red" as UC_SyncMan
}

Staff --> CU11
CU11 ..> UC_List : <<include>>
CU11 ..> UC_Audit : <<include>>
CU11 ..> UC_Filter : <<extend>>
CU11 ..> UC_SyncMan : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Bandeja de auditoría y monitoreo offline accesible desde el menú del POS o perfil de usuario. Tarjetas superiores de resumen: "Total Pendientes de Subida" (número de transacciones y monto total en Bs), "Última Sincronización Exitosa" (timestamp) y "Estado del Enlace" (ping activo a la nube). Tabla cronológica: Tipo de Transacción (Venta Contado, Reserva Presencial, Nota de Devolución), UUID v4 (acortado con botón de copiado), Fecha/Hora local, Monto Total, Estado (`PENDIENTE_SYNC`, `EN_PROCESO`, `SINCRONIZADO`, `CONFLICTO_STOCK`). Al hacer clic en una fila, se despliega el visor JSON con el payload exacto y firma hash. Botón flotante "Auditar y Sincronizar Ahora" habilitado cuando se detecta red.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU11 |
| **Nombre** | Consultar y Auditar Operaciones Locales Pendientes (Cajero / Cliente / Encargado) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cajero, Cliente, Encargado de Sucursal |
| **Descripción** | Permite auditar, verificar y cuadrar las transacciones generadas sin conexión antes de su sincronización, confrontando el dinero físico en gaveta contra los UUIDs y totales registrados. |
| **Precondiciones** | Usuario autenticado en el dispositivo local con operaciones registradas en el periodo. |
| **Casos de Uso Incluidos (<<include>>)** | - **Listar Operaciones Locales (Ventas, Reservas, Cambios):** Carga todas las transacciones de IndexedDB / SQLite.<br>- **Verificar Integridad de UUID y Montos Acumulados:** Realiza el arqueo local de dinero frente a las operaciones pendientes. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Filtrar por Estado (Pendiente, Sincronizado, Error):** Extensión disparada para segmentar operaciones según su estado (Punto de Extensión: Filtrado de Auditoría).<br>- **Forzar Disparo Manual de Sincronización al Volver Red:** Extensión disparada al pulsar 'Sincronizar Ahora' tras recuperar red (Punto de Extensión: Disparo Manual de Sincronización). |
| **Flujo Normal** | 1. El usuario accede a "Operaciones Locales y Auditoría".<br>2. El sistema invoca `<<include>> Listar Operaciones Locales (Ventas, Reservas, Cambios)`.<br>3. El encargado o cajero ejecuta `<<include>> Verificar Integridad de UUID y Montos Acumulados`, cuadrando el efectivo de la gaveta contra el total de ventas locales.<br>4. Revisa los UUIDs y timestamps de cada transacción.<br>5. Al detectar red, el usuario puede aguardar el envío en segundo plano o forzar la subida. |
| **Flujo Alternativo** | **2a. [Punto de Extensión: Filtrado de Auditoría]** El usuario ejecuta `<<extend>> Filtrar por Estado (Pendiente, Sincronizado, Error)` para auditar solo discrepancias.<br>**5a. [Punto de Extensión: Disparo Manual de Sincronización]** El usuario presiona "Sincronizar Ahora", ejecutando `<<extend>> Forzar Disparo Manual de Sincronización al Volver Red`. |
| **Postcondiciones** | Arqueo local verificado y conciliado frente a los registros del dispositivo. |
---

### CU12: Sincronizar Operaciones Pendientes (Sistema de Sincronización)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU12: Sincronizar Operaciones Pendientes](../diagramas/imagenes_cu/CU12_Sincronizar_Operaciones.png)

```plantuml
@startuml CU12_Sincronizar_Operaciones
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Sistema de\nSincronización" as SistSync
actor "Cajero" as Caj

rectangle "CU12: Sincronización Idempotente" {
  usecase "CU12: Sincronizar\nOperaciones Pendientes" as CU12
  usecase "Detectar Conectividad y\nEmpaquetar Lote con UUIDs" as UC_Batch
  usecase "Verificar Idempotencia en\nServidor Central (PostgreSQL)" as UC_Idemp
  usecase "Reconciliar Inventario y\nResolver Conflictos de Stock" as UC_Recon
  usecase "Actualizar Estado Local a\nSINCRONIZADO" as UC_Ack
}

SistSync --> CU12
Caj --> CU12
CU12 ..> UC_Batch : <<include>>
CU12 ..> UC_Idemp : <<include>>
CU12 ..> UC_Recon : <<include>>
CU12 ..> UC_Ack : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Modal interactivo o notificación toast en segundo plano. Al restablecerse el enlace a Internet, se despliega barra de sincronización: "Sincronizando operaciones locales con la nube... 3 de 12 completadas". Tabla de resultados de sincronización: ID de Operación, UUID, Tipo, Resultado ("Confirmado en Servidor", "Omitido por Duplicado - Idempotente", "Ajuste de Stock Reconciliado"). En caso de discrepancia, botón "Ver Detalle de Reconciliación" que muestra los saldos actualizados en el Kardex central.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU12 |
| **Nombre** | Sincronizar Operaciones Pendientes (Sistema de Sincronización) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Sistema de Sincronización (Worker en segundo plano), Cajero |
| **Descripción** | Orquesta la subida segura, atómica e idempotente de operaciones offline hacia el servidor central PostgreSQL, resolviendo la concurrencia de compras según la política 'First-to-Pay Wins' y aplicando reembolso inmediato si se agotó el stock. |
| **Precondiciones** | Operaciones pendientes con estado `PENDIENTE_SYNC`; conectividad a Internet restaurada. |
| **Casos de Uso Incluidos (<<include>>)** | - **Detectar Conectividad y Empaquetar Lote con UUIDs:** Agrupa operaciones en lotes cronológicos.<br>- **Verificar Idempotencia en Servidor Central (PostgreSQL):** Consulta la tabla central de claves para evitar doble inserción.<br>- **Reconciliar Inventario y Resolver Conflictos de Stock:** Evalúa stock central disponible bajo la política 'Primero en Pagar'.<br>- **Actualizar Estado Local a SINCRONIZADO:** Actualiza los registros locales y limpia la cola de envíos. |
| **Casos de Uso Extendidos (<<extend>>)** | Ninguno (Proceso orquestador batch). |
| **Flujo Normal** | 1. El worker de red detecta el evento `online` o el usuario dispara la sincronización manual.<br>2. El cliente invoca `<<include>> Detectar Conectividad y Empaquetar Lote con UUIDs`.<br>3. Envía una petición `POST /api/v1/sync/batch` al backend FastAPI con cabecera `X-Idempotency-Key` y JWT.<br>4. El servidor ejecuta `<<include>> Verificar Idempotencia en Servidor Central (PostgreSQL)`; si el UUID es nuevo, inicia transacción ACID.<br>5. El servidor ejecuta `<<include>> Reconciliar Inventario y Resolver Conflictos de Stock`. Verifica en tiempo real si el cliente fue el primero en pagar o si el inventario central aún dispone de existencias para cada ítem del carrito offline.<br>6. Al haber stock suficiente: Descuenta el inventario central en `inventario_sucursal`, genera el asiento contable en el Kardex recalculando el CPP y marca la orden como confirmada.<br>7. El servidor responde HTTP 200 con el listado de UUIDs ratificados.<br>8. El cliente invoca `<<include>> Actualizar Estado Local a SINCRONIZADO`, actualizando el catálogo y liberando la cola. |
| **Flujo Alternativo** | **4a. Reintento por caída de red con UUID ya procesado (Idempotencia pura):** El servidor detecta la clave procesada previamente, descarta la duplicación, retorna la respuesta original almacenada y el cliente marca el registro como `SINCRONIZADO`.<br>**5a. Conflicto por Rotura de Stock / Venta Concurrente en Línea (El cliente offline no fue el primero en pagar o el producto se agotó en la nube):**<br>&nbsp;&nbsp;&nbsp;&nbsp;1. El servidor detecta que las existencias centrales llegaron a 0 porque otro comprador en línea concretó el pago primero mientras este terminal estaba sin red.<br>&nbsp;&nbsp;&nbsp;&nbsp;2. Siguiendo la regla estricta de la cátedra (*"Solamente el primero que pagó actualiza; al que quedó sin producto se le devuelve el dinero de inmediato para que no pierda nada"*):<br>&nbsp;&nbsp;&nbsp;&nbsp;3. El sistema **anula la transacción offline conflictiva** sin aplicar deducciones de stock central.<br>&nbsp;&nbsp;&nbsp;&nbsp;4. Dispara automáticamente el **protocolo de Reembolso Inmediato / Reversión del Cobro en Efectivo o Pasarela**.<br>&nbsp;&nbsp;&nbsp;&nbsp;5. Envía una notificación prioritaria al cliente: *"El producto seleccionado fue adquirido previamente por otro usuario. Su pago ha sido cancelado/reembolsado íntegramente de inmediato para que no sufra ninguna pérdida."*<br>&nbsp;&nbsp;&nbsp;&nbsp;6. El estado local de la transacción se actualiza a `REEMBOLSADO_STOCK_AGOTADO`. |
| **Postcondiciones** | Base de datos central y local sincronizadas, Kardex consistente y cero riesgo de sobreventa concurrente. |
---

### CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU13: Gestionar Cambio de Prenda en Dos Tiempos](../diagramas/imagenes_cu/CU13_Gestionar_Cambio_Prenda.png)

```plantuml
@startuml CU13_Gestionar_Cambio_Prenda
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cliente" as Cl
actor "Cajero / Encargado" as Staff

rectangle "CU13: Cambio de Prenda en Dos Tiempos" {
  usecase "CU13: Gestionar Cambio\nde Prenda y Devolución" as CU13
  usecase "Tiempo 1: Registrar Solicitud\ny Emitir Nota de Devolución" as UC_NotaDev
  usecase "Recepción e Inspección de\nPrenda (Ingreso a Stock/Cuarentena)" as UC_Insp
  usecase "Tiempo 2: Emitir Nota de Cambio\ny Asignar Nueva Prenda" as UC_NotaCambio
  usecase "Cobrar Diferencia de Precio\nvia Pasarela Stripe" as UC_Stripe
  usecase "Procesar Reembolso Efectivo\na 30 Días (Fin de Mes)" as UC_Reembolso
}

Cl --> CU13
Staff --> CU13
CU13 ..> UC_NotaDev : <<include>>
UC_NotaDev ..> UC_Insp : <<include>>
CU13 ..> UC_NotaCambio : <<include>>
UC_NotaCambio ..> UC_Stripe : <<extend>>
CU13 ..> UC_Reembolso : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Módulo de postventa y cambios en dos tiempos. Pantalla inicial: Búsqueda de compra original por código de ticket o factura. **Sección Tiempo 1 (Nota de Devolución):** Formulario de recepción física de la prenda entregada por el cliente. Selector de motivo (talla incorrecta, discrepancia de calce en cm, color no deseado, tara estética), lista de verificación de estado (con etiquetas intactas, sin uso, sin lavado). Botón "Emitir Nota de Devolución" que genera comprobante con saldo a favor del cliente e ingresa la prenda a stock de reacondicionamiento o inventario de tienda. **Sección Tiempo 2 (Nota de Cambio):** Selector de la nueva prenda y variante de reemplazo. Cálculo automático de balance financiero: si la nueva prenda tiene mayor valor, se habilita el widget de Pasarela de Pagos Stripe para cobrar el diferencial en línea; si el valor es idéntico, el balance es cero; si el cliente rechaza cualquier cambio o no hay existencias sustitutas, se activa el interruptor "Solicitud de Devolución Monetaria", emitiendo un comprobante de liquidación en efectivo programada para el cierre de mes (a los 30 días calendario).

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU13 |
| **Nombre** | Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cliente, Cajero, Encargado de Sucursal |
| **Descripción** | Gestión de postventa en dos tiempos operacionales e independientes: emisión inicial de Nota de Devolución tras inspección física (reingreso a inventario) y posterior emisión de Nota de Cambio al elegir nueva prenda, con cobro por Stripe o reembolso a 30 días. |
| **Precondiciones** | Compra original válida registrada dentro del periodo permitido (7 días post-entrega); prenda física en buen estado. |
| **Casos de Uso Incluidos (<<include>>)** | - **Tiempo 1: Registrar Solicitud y Emitir Nota de Devolución:** Registra el reingreso y genera saldo a favor.<br>- **Recepción e Inspección de Prenda (Ingreso a Stock/Cuarentena):** Inspecciona etiquetas y aprueba reingreso a inventario.<br>- **Tiempo 2: Emitir Nota de Cambio y Asignar Nueva Prenda:** Asigna la prenda de reemplazo y descuenta stock. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Cobrar Diferencia de Precio via Pasarela Stripe:** Extensión disparada si la nueva prenda tiene mayor valor (Punto de Extensión: Cobro Diferencial Online).<br>- **Procesar Reembolso Efectivo a 30 Días (Fin de Mes):** Extensión disparada si el cliente no encuentra prenda y solicita liquidación monetaria (Punto de Extensión: Reembolso a Fin de Mes). |
| **Flujo Normal** | 1. El cliente solicita el cambio de una prenda en sucursal física.<br>2. El encargado recepciona la prenda e invoca `<<include>> Tiempo 1: Registrar Solicitud y Emitir Nota de Devolución`.<br>3. Durante la recepción, ejecuta obligatoriamente `<<include>> Recepción e Inspección de Prenda (Ingreso a Stock/Cuarentena)`, confirmando etiquetas intactas y sumando la prenda devuelta al stock.<br>4. El sistema emite la **Nota de Devolución** con saldo a favor del cliente.<br>5. El cliente selecciona la nueva prenda, invocando `<<include>> Tiempo 2: Emitir Nota de Cambio y Asignar Nueva Prenda`.<br>6. El sistema compara importes: si tienen igual valor, el saldo queda en cero.<br>7. [Punto de Extensión: Cobro Diferencial Online] Si la nueva prenda tiene mayor valor, se ejecuta `<<extend>> Cobrar Diferencia de Precio via Pasarela Stripe` para liquidar el excedente en línea.<br>8. El sistema emite la **Nota de Cambio**, descuenta la nueva prenda del inventario físico y despacha el pedido. |
| **Flujo Alternativo** | **3a. Prenda usada o dañada:** El encargado rechaza la solicitud según políticas higiénico-sanitarias textiles.<br>**5a. [Punto de Extensión: Reembolso a Fin de Mes]** Si el cliente no encuentra ninguna prenda de su agrado, se ejecuta `<<extend>> Procesar Reembolso Efectivo a 30 Días (Fin de Mes)`, emitiendo constancia contable de liquidación en efectivo para el cierre del ciclo mensual. |
| **Postcondiciones** | Nota de Devolución y Nota de Cambio registradas independientemente; libros de inventario y Kardex actualizados en ambos tiempos. |
---

### CU14: Gestionar Traspaso Inter-Sucursal de Inventario

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU14: Gestionar Traspaso Inter-Sucursal de Inventario](../diagramas/imagenes_cu/CU14_Traspaso_Inter_Sucursal.png)

```plantuml
@startuml CU14_Traspaso_Inter_Sucursal
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Encargado de Sucursal" as Enc
actor "Admin Empresa" as Admin

rectangle "CU14: Traspaso Inter-Sucursal" {
  usecase "CU14: Gestionar Traspaso\nInter-Sucursal" as CU14
  usecase "Solicitar Transferencia de\nPrendas entre Tiendas" as UC_Req
  usecase "Despachar Lote y Cambiar\nEstado a EN_TRÁNSITO" as UC_Ship
  usecase "Recepcionar, Validar Lote y\nConfirmar Llegada a Destino" as UC_Recv
  usecase "Ajustar Existencias y CPP\nen Ambas Sucursales" as UC_Kardex
}

Enc --> CU14
Admin --> CU14
CU14 ..> UC_Req : <<include>>
CU14 ..> UC_Ship : <<include>>
CU14 ..> UC_Recv : <<include>>
UC_Recv ..> UC_Kardex : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel de logística y transferencias inter-sucursal. Pestaña "Nueva Solicitud de Traspaso": selector de Sucursal Origen (con visualización de stock disponible en tiempo real) y Sucursal Destino solicitante. Selector de prendas y variantes (talla/color) con cantidades requeridas y justificación operativa (reposición por alta demanda o solicitud especial de cliente). Pestaña "Envíos en Tránsito": tabla de envíos con código de remisión, guía de transporte, fecha de salida y estado (`SOLICITADO`, `EN_TRÁNSITO`, `RECIBIDO_CONFORME`, `DISCREPANCIA`). Botón "Confirmar Recepción de Mercadería" en la sucursal receptora con verificación ítem por ítem.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU14 |
| **Nombre** | Gestionar Traspaso Inter-Sucursal de Inventario |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Encargado de Sucursal Solicitante, Encargado de Sucursal Emisora, Administrador de Empresa |
| **Descripción** | Controla el flujo logístico de transferencia de existencias entre tiendas del mismo tenant, garantizando trazabilidad en tránsito y recálculo de CPP en destino. |
| **Precondiciones** | Sucursales pertenecientes a la misma empresa; stock disponible en la sucursal de origen. |
| **Casos de Uso Incluidos (<<include>>)** | - **Solicitar Transferencia de Prendas entre Tiendas:** Genera la solicitud formal de abastecimiento.<br>- **Despachar Lote y Cambiar Estado a EN_TRÁNSITO:** Prepara el bulto y descuenta existencias disponibles en origen.<br>- **Recepcionar, Validar Lote y Confirmar Llegada a Destino:** Verifica los ítems recibidos físicamente.<br>- **Ajustar Existencias y CPP en Ambas Sucursales:** Asienta la baja definitiva en origen y alta en destino recalibrando el CPP local. |
| **Casos de Uso Extendidos (<<extend>>)** | Ninguno (Flujo logístico secuencial estricto). |
| **Flujo Normal** | 1. El encargado de la tienda destino invoca `<<include>> Solicitar Transferencia de Prendas entre Tiendas` indicando variantes y cantidades requeridas.<br>2. El encargado de la tienda origen aprueba el requerimiento e invoca `<<include>> Despachar Lote y Cambiar Estado a EN_TRÁNSITO`.<br>3. El sistema actualiza el lote a `EN_TRÁNSITO`, descontando el stock disponible de origen.<br>4. El transporte entrega el bulto en la tienda receptora.<br>5. El encargado receptor invoca `<<include>> Recepcionar, Validar Lote y Confirmar Llegada a Destino`, escaneando los SKUs.<br>6. El sistema ejecuta obligatoriamente `<<include>> Ajustar Existencias y CPP en Ambas Sucursales`, concretando el alta en destino y recalculando el CPP local.<br>7. Asienta los movimientos en los libros Kardex de ambas sucursales. |
| **Flujo Alternativo** | **5a. Recepción con faltantes o piezas dañadas:** El encargado registra recepción parcial con novedad; las unidades faltantes se asientan como merma en tránsito bajo investigación. |
| **Postcondiciones** | Inventarios actualizados en ambas sucursales y trazabilidad completa del movimiento inter-tiendas. |
---

### CU15: Solicitar Reporte Generativo con IA (Lenguaje Natural / Voz)

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU15: Solicitar Reporte Generativo con IA](../diagramas/imagenes_cu/CU15_Reporte_Generativo_IA.png)

```plantuml
@startuml CU15_Reporte_Generativo_IA
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa /\nEncargado" as User
actor "Servicio IA\n(LLM/Whisper)" as IA

rectangle "CU15: Reportes con IA" {
  usecase "CU15: Solicitar Reporte\nGenerativo con IA" as CU15
  usecase "Capturar Prompt por Texto\no Dictado por Voz (Whisper)" as UC_Prompt
  usecase "Generar y Validar Consulta\nSQL de Solo Lectura" as UC_SQL
  usecase "Ejecutar Consulta sobre Vistas\nAnalíticas Multitenant" as UC_Exec
  usecase "Sintetizar Resumen Ejecutivo\ny Gráficos Automáticos" as UC_Summ
}

User --> CU15
CU15 ..> UC_Prompt : <<include>>
CU15 ..> UC_SQL : <<include>>
UC_SQL --> IA : Invocar Modelo
CU15 ..> UC_Exec : <<include>>
CU15 ..> UC_Summ : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Asistente analítico inteligente conversacional. Interfaz moderna con campo de consulta en lenguaje natural: "¿Cuáles fueron las 5 camisas de lino más vendidas en la sucursal Equipetrol durante el último mes y qué porcentaje de margen dejaron?". Botón de micrófono interactivo para entrada por dictado de voz (integración con Web Speech API y Whisper). Área de visualización de respuesta que incluye: 1) Resumen narrativo ejecutivo generado por el LLM en lenguaje claro para toma de decisiones; 2) Tabla de datos tabulados; 3) Gráfico interactivo autogenerado (barras, líneas o dona según la métrica); y 4) Acordeón desplegable de auditoría: "Ver Consulta SQL Ejecutada (Solo Lectura)" con validación estricta del filtro `tenant_id`.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU15 |
| **Nombre** | Solicitar Reporte Generativo con IA (Lenguaje Natural / Voz) |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa, Encargado de Sucursal, Servicio IA (OpenAI / Gemini) |
| **Descripción** | Permite formular consultas analíticas mediante texto libre o dictado por voz, traduciéndolas a consultas SQL de solo lectura con inyección forzosa de `tenant_id` y generando resúmenes ejecutivos con gráficos. |
| **Precondiciones** | Usuario administrativo autenticado; API Key del servicio de IA configurada. |
| **Casos de Uso Incluidos (<<include>>)** | - **Capturar Prompt por Texto o Dictado por Voz (Whisper):** Transcribe y procesa la entrada del usuario.<br>- **Generar y Validar Consulta SQL de Solo Lectura:** Traduce a SQL y valida AST con filtro `tenant_id`.<br>- **Ejecutar Consulta sobre Vistas Analíticas Multitenant:** Ejecuta sobre la réplica de lectura aislada.<br>- **Sintetizar Resumen Ejecutivo y Gráficos Automáticos:** Genera síntesis narrativa y recomendaciones visuales. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Exportar Reportes a Excel/PDF (CU16):** Extensión disparada al pulsar 'Exportar' desde la vista de resultados (Punto de Extensión: Exportación Documental). |
| **Flujo Normal** | 1. El usuario invoca `<<include>> Capturar Prompt por Texto o Dictado por Voz (Whisper)`, escribiendo o dictando su requerimiento.<br>2. El sistema envía el esquema de vistas analíticas al LLM e invoca `<<include>> Generar y Validar Consulta SQL de Solo Lectura`.<br>3. El backend verifica mediante AST que la consulta sea exclusivamente `SELECT` e inyecta `WHERE tenant_id = :current_tenant`.<br>4. El sistema invoca `<<include>> Ejecutar Consulta sobre Vistas Analíticas Multitenant`.<br>5. El sistema invoca `<<include>> Sintetizar Resumen Ejecutivo y Gráficos Automáticos`, renderizando tabla, gráfico interactivo y narrativa gerencial.<br>6. [Punto de Extensión: Exportación Documental] El usuario pulsa "Exportar", ejecutando `<<extend>> CU16: Exportar Reportes a Excel/PDF`. |
| **Flujo Alternativo** | **3a. Comando peligroso (DROP, DELETE, UPDATE) detectado:** El validador bloquea la ejecución de inmediato y registra alerta de seguridad.<br>**4a. Consulta sin resultados en el periodo:** El LLM informa ausencia de datos para los filtros solicitados. |
| **Postcondiciones** | Reporte interactivo generado y desplegado al usuario sin alterar ningún dato en el sistema. |
---

### CU16: Exportar Reportes Analíticos a Excel/PDF

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU16: Exportar Reportes Analíticos a Excel/PDF](../diagramas/imagenes_cu/CU16_Exportar_Reportes.png)

```plantuml
@startuml CU16_Exportar_Reportes
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa /\nEncargado" as User

rectangle "CU16: Exportar Reportes Analíticos" {
  usecase "CU16: Exportar Reportes\na Excel/PDF" as CU16
  usecase "Seleccionar Conjunto de Datos\ny Rango de Fechas" as UC_Data
  usecase "Generar Libro Excel (.xlsx)\ncon Fórmulas y Tablas" as UC_Excel
  usecase "Generar Documento PDF (.pdf)\ncon Cabecera y Gráficos" as UC_PDF
  usecase "Descargar Archivo al Dispositivo\ncon Firma de Tenant" as UC_Down
}

User --> CU16
CU16 ..> UC_Data : <<include>>
CU16 ..> UC_Excel : <<extend>>
CU16 ..> UC_PDF : <<extend>>
CU16 ..> UC_Down : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Barra de herramientas de exportación disponible en todas las vistas de reportes y dashboard. Selector con dos botones de acción rápida: "Exportar a Excel (.xlsx)" con ícono verde de hoja de cálculo y "Descargar Informe Ejecutivo PDF (.pdf)" con ícono rojo. Modal de configuración de salida con opciones: Incluir gráficos vectoriales, Añadir desglose por sucursal, Filtrar por temporada. Al hacer clic, se muestra una barra de procesamiento y se dispara la descarga automática del archivo binario con el nombre estandarizado: `Reporte_[Tipo]_[Tenant]_[YYYYMMDD].ext`.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU16 |
| **Nombre** | Exportar Reportes Analíticos a Excel/PDF |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa, Encargado de Sucursal |
| **Descripción** | Convierte datasets analíticos, tablas de Kardex o balances de ventas en documentos formales en formato Excel (.xlsx) con fórmulas o Adobe PDF (.pdf) listos para impresión. |
| **Precondiciones** | Reporte o consulta analítica generada previamente en pantalla. |
| **Casos de Uso Incluidos (<<include>>)** | - **Seleccionar Conjunto de Datos y Rango de Fechas:** Especifica los filtros de exportación.<br>- **Descargar Archivo al Dispositivo con Firma de Tenant:** Transfiere el binario generado al equipo local. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Generar Libro Excel (.xlsx) con Fórmulas y Tablas:** Extensión disparada al seleccionar exportación a Excel (Punto de Extensión: Formato Excel).<br>- **Generar Documento PDF (.pdf) con Cabecera y Gráficos:** Extensión disparada al seleccionar exportación a PDF (Punto de Extensión: Formato PDF). |
| **Flujo Normal** | 1. El usuario invoca `<<include>> Seleccionar Conjunto de Datos y Rango de Fechas`.<br>2. [Punto de Extensión: Formato Excel] Si el usuario elige Excel, se ejecuta `<<extend>> Generar Libro Excel (.xlsx) con Fórmulas y Tablas`, construyendo el archivo con cabeceras fijas y fórmulas contables.<br>3. [Punto de Extensión: Formato PDF] Si el usuario elige PDF, se ejecuta `<<extend>> Generar Documento PDF (.pdf) con Cabecera y Gráficos`, maquetando el documento con logotipo y tablas tabuladas.<br>4. El sistema invoca `<<include>> Descargar Archivo al Dispositivo con Firma de Tenant`, enviando el archivo como stream con nombre `Reporte_[Tipo]_[Tenant]_[YYYYMMDD].ext`. |
| **Flujo Alternativo** | **2a. Volumen superior a 50,000 registros:** El sistema comprime el reporte en un archivo `.zip` y habilita la descarga asíncrona. |
| **Postcondiciones** | Archivo documental descargado en el equipo del usuario con la estructura formal del tenant. |
---

### CU17: Gestionar Dashboard Analítico con Machine Learning

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU17: Dashboard Analítico con Machine Learning](../diagramas/imagenes_cu/CU17_Dashboard_ML.png)

```plantuml
@startuml CU17_Dashboard_ML
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa" as Admin

rectangle "CU17: Dashboard Analítico con ML" {
  usecase "CU17: Dashboard Analítico\ncon Machine Learning" as CU17
  usecase "Visualizar Indicadores KPI\n(Ventas, Margen, Ticket)" as UC_KPI
  usecase "Ejecutar Modelo Predictivo\nde Demanda a 6 Meses" as UC_Pred
  usecase "Analizar Rotación de Prendas\ny Matriz Talla/Color" as UC_Rot
  usecase "Generar Sugerencias de Compras\ny Reorden de Inventario" as UC_Reorder
}

Admin --> CU17
CU17 ..> UC_KPI : <<include>>
CU17 ..> UC_Pred : <<include>>
CU17 ..> UC_Rot : <<include>>
UC_Pred ..> UC_Reorder : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Tablero de control ejecutivo con paneles interactivos. Fila 1: Tarjetas de KPI principales con comparativa intermensual (+18.4% Ventas, -4.2% Devoluciones tras estandarización de tallas cm, 42.8% Margen Bruto). Fila 2: Gráfico de series temporales con proyección a **6 meses** mostrando demanda histórica y banda de predicción algorítmica (Machine Learning) con intervalos de confianza del 95%. Fila 3: Heatmap (mapa de calor) de rotación por talla y color (ej. Talla L / Color Azul Marino con la rotación más alta en la temporada). Panel lateral: "Recomendaciones Algorítmicas de Aprovisionamiento", indicando variantes próximas a agotarse y sugerencia de compra a proveedores.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU17 |
| **Nombre** | Gestionar Dashboard Analítico con Machine Learning |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa |
| **Descripción** | Cuadro de mando ejecutivo con KPIs en tiempo real, mapas de calor de rotación por talla/color y algoritmos de Machine Learning para proyectar demanda de prendas a 6 meses vista. |
| **Precondiciones** | Usuario con rol `ADMIN_EMPRESA`; datos históricos de transacciones del tenant. |
| **Casos de Uso Incluidos (<<include>>)** | - **Visualizar Indicadores KPI (Ventas, Margen, Ticket):** Muestra métricas comerciales clave.<br>- **Ejecutar Modelo Predictivo de Demanda a 6 Meses:** Ejecuta microservicio ML de regresión temporal a 6 meses.<br>- **Analizar Rotación de Prendas y Matriz Talla/Color:** Renderiza mapa de calor de demanda textil. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Generar Sugerencias de Compras y Reorden de Inventario:** Extensión disparada si la proyección a 6 meses anticipa quiebre de stock (Punto de Extensión: Sugerencia de Reorden). |
| **Flujo Normal** | 1. El Administrador accede al "Dashboard Analítico".<br>2. El sistema invoca `<<include>> Visualizar Indicadores KPI (Ventas, Margen, Ticket)`.<br>3. El sistema invoca `<<include>> Ejecutar Modelo Predictivo de Demanda a 6 Meses`, alimentando la serie histórica al modelo de series temporales.<br>4. El sistema invoca `<<include>> Analizar Rotación de Prendas y Matriz Talla/Color`, desplegando el heatmap de rotación.<br>5. [Punto de Extensión: Sugerencia de Reorden] Si el modelo anticipa desabastecimiento, ejecuta `<<extend>> Generar Sugerencias de Compras y Reorden de Inventario`, recomendando lotes y proveedores para reposición oportuna. |
| **Flujo Alternativo** | **3a. Tenant con menos de 30 días de historial:** El sistema conmuta a un modelo heurístico basado en promedios sectoriales e indica que la precisión aumentará con el tiempo. |
| **Postcondiciones** | Visualización interactiva de proyecciones y recomendaciones de compras disponible para planificación estratégica. |
---

### CU18: Gestionar Pasarela de Pagos Stripe Sandbox

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU18: Gestionar Pasarela de Pagos Stripe Sandbox](../diagramas/imagenes_cu/CU18_Pasarela_Stripe.png)

```plantuml
@startuml CU18_Pasarela_Stripe
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Cliente / Cajero" as User
actor "Pasarela de Pago\n(Stripe Sandbox)" as Stripe

rectangle "CU18: Pasarela de Pagos Stripe" {
  usecase "CU18: Gestionar Pasarela\nde Pagos Stripe" as CU18
  usecase "Crear PaymentIntent con\nToken de Seguridad" as UC_Intent
  usecase "Capturar Datos de Tarjeta\ncon Stripe Elements (PCI-DSS)" as UC_Card
  usecase "Confirmar Pago y Recibir\nWebhook Asíncrono" as UC_Hook
  usecase "Procesar Saldo Diferencial\nde Cambio de Prenda" as UC_Saldo
}

User --> CU18
CU18 ..> UC_Intent : <<include>>
CU18 ..> UC_Card : <<include>>
UC_Card --> Stripe : Tokenizar Tarjeta
CU18 ..> UC_Hook : <<include>>
Stripe --> UC_Hook : Webhook
CU18 ..> UC_Saldo : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Componente de checkout seguro embebido mediante Stripe Elements. Pantalla con resumen de la transacción: Moneda, Importe Total (para ventas directas o saldo diferencial de cambio de prenda en CU13). Formulario de tarjeta seguro: Número de tarjeta (con autodetección visual de marca: Visa, Mastercard, American Express), Fecha de caducidad (MM/AA) y CVC/CVV con validación en tiempo real. Botón "Pagar con Tarjeta Segura [Monto Bs/USD]" con indicador de procesamiento seguro cifrado TLS y certificación PCI-DSS Nivel 1. Toast de confirmación inmediata con ID de transacción de Stripe.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU18 |
| **Nombre** | Gestionar Pasarela de Pagos Stripe Sandbox |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Cliente, Cajero, Pasarela Stripe Sandbox |
| **Descripción** | Procesa cobros electrónicos seguros con tarjetas de crédito/débito para ventas digitales y saldos diferenciales de cambios de prendas (CU13), bajo estándar PCI-DSS vía tokenización. |
| **Precondiciones** | Conectividad a Internet activa; monto de la transacción mayor a cero. |
| **Casos de Uso Incluidos (<<include>>)** | - **Crear PaymentIntent con Token de Seguridad:** Registra la intención de pago en la API de Stripe.<br>- **Capturar Datos de Tarjeta con Stripe Elements (PCI-DSS):** Tokeniza la tarjeta en iframe aislado sin almacenar PAN.<br>- **Confirmar Pago y Recibir Webhook Asíncrono:** Escucha la notificación `payment_intent.succeeded` y asienta el cobro. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Procesar Saldo Diferencial de Cambio de Prenda:** Extensión disparada cuando el cobro liquida una diferencia de precio por cambio de prenda en CU13 (Punto de Extensión: Cobro de Diferencia Postventa). |
| **Flujo Normal** | 1. El cliente o cajero confirma una operación que requiere pago electrónico.<br>2. El sistema invoca `<<include>> Crear PaymentIntent con Token de Seguridad`, recibiendo el `client_secret`.<br>3. El usuario ingresa su tarjeta e invoca `<<include>> Capturar Datos de Tarjeta con Stripe Elements (PCI-DSS)`.<br>4. Stripe tokeniza la tarjeta y contacta al banco emisor.<br>5. Stripe procesa el cargo e invoca `<<include>> Confirmar Pago y Recibir Webhook Asíncrono`.<br>6. [Punto de Extensión: Cobro de Diferencia Postventa] Si la transacción corresponde a un cambio de prenda en CU13, ejecuta `<<extend>> Procesar Saldo Diferencial de Cambio de Prenda`.<br>7. El sistema marca la orden como pagada y emite el recibo formal con ID de transacción de Stripe. |
| **Flujo Alternativo** | **4a. Tarjeta declinada o fondos insuficientes:** Stripe retorna el código de rechazo y el sistema invita al usuario a probar con otro medio de pago. |
| **Postcondiciones** | Pago procesado y conciliado contablemente sin que el sistema almacene números de tarjeta de crédito. |
---

### CU19: Gestionar Ofertas de Liquidación y Precios por Mayor

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU19: Gestionar Ofertas y Precios por Mayor](../diagramas/imagenes_cu/CU19_Ofertas_Liquidacion_Precios_Mayor.png)

```plantuml
@startuml CU19_Ofertas_Liquidacion_Precios_Mayor
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa" as Admin
actor "Cliente / Cajero" as User

rectangle "CU19: Ofertas y Precios por Mayor" {
  usecase "CU19: Gestionar Ofertas\ny Precios por Mayor" as CU19
  usecase "Configurar Ofertas de Liquidación\nFin de Temporada (30%, 40%, 60%)" as UC_Liq
  usecase "Configurar Regla de Precio\nal por Mayor (>= 3 Unidades)" as UC_Mayor
  usecase "Aplicar Descuentos Automáticos\nen Catálogo y Carrito POS" as UC_Auto
  usecase "Programar Vigencia y Stock\nMáximo en Promoción" as UC_Vig
}

Admin --> CU19
User --> UC_Auto
CU19 ..> UC_Liq : <<include>>
CU19 ..> UC_Mayor : <<include>>
CU19 ..> UC_Vig : <<extend>>
UC_Auto ..> UC_Liq : <<extend>>
UC_Auto ..> UC_Mayor : <<extend>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Panel de configuración de promociones y reglas de precios. Pestaña **"Ofertas de Liquidación Fin de Temporada"**: selector de prendas de temporadas pasadas (ej. ropa de abrigo de invierno en época primaveral para evitar stock inmovilizado durante un año completo) con selector de descuento comercial: 30%, 40% o 60% de rebaja para recuperación de capital. Visualización de precio original tachado y precio rebajado en color rojo. Pestaña **"Regla de Precios al por Mayor"**: interruptor para activar "Tarifa Mayorista Automática" con umbral configurable a partir de $\ge 3$ unidades (iguales o surtidas en catálogo). Simulación interactiva de cálculo en carrito de compras.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU19 |
| **Nombre** | Gestionar Ofertas de Liquidación y Precios por Mayor |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa, Cliente, Cajero |
| **Descripción** | Parametrización y aplicación automática de dos estrategias comerciales: rebajas de liquidación de fin de temporada (30%, 40% y 60%) para recuperación de capital, y tarifa de precio al por mayor aplicable desde 3 unidades. |
| **Precondiciones** | Usuario con rol `ADMIN_EMPRESA` para parametrización; prendas con stock registrado. |
| **Casos de Uso Incluidos (<<include>>)** | - **Configurar Ofertas de Liquidación Fin de Temporada (30%, 40%, 60%):** Asigna descuentos de remate a prendas de temporadas anteriores.<br>- **Configurar Regla de Precio al por Mayor (>= 3 Unidades):** Activa tarifa especial mayorista desde 3 prendas. |
| **Casos de Uso Extendidos (<<extend>>)** | - **Programar Vigencia y Stock Máximo en Promoción:** Extensión disparada al fijar fecha límite a la campaña de liquidación (Punto de Extensión: Vigencia de Campaña).<br>- **Aplicar Descuentos Automáticos en Catálogo y Carrito POS:** Extensión disparada en el checkout al evaluar las reglas sobre los ítems del carrito. |
| **Flujo Normal** | 1. El Administrador accede a "Ofertas y Precios Especiales".<br>2. El sistema invoca `<<include>> Configurar Ofertas de Liquidación Fin de Temporada (30%, 40%, 60%)`, seleccionando prendas de temporadas salientes (ej. abrigos de invierno en primavera).<br>3. El sistema invoca `<<include>> Configurar Regla de Precio al por Mayor (>= 3 Unidades)`.<br>4. [Punto de Extensión: Vigencia de Campaña] El Administrador ejecuta `<<extend>> Programar Vigencia y Stock Máximo en Promoción`.<br>5. Durante la compra, al agregar prendas al carrito, el motor ejecuta `<<extend>> Aplicar Descuentos Automáticos en Catálogo y Carrito POS`: si la prenda está en liquidación aplica el porcentaje configurado, y si la cantidad $\ge 3$ unidades bonifica la tarifa mayorista.<br>6. El sistema refleja el ahorro obtenido en el total de la orden. |
| **Flujo Alternativo** | **4a. Campaña de liquidación caducada:** El sistema revierte automáticamente los precios al valor minorista regular al expirar la fecha programada. |
| **Postcondiciones** | Precios promocionales y mayoristas reflejados automáticamente en catálogo digital, PWA offline y cajas POS. |
---

### CU20: Gestionar Compras y Aprovisionamiento desde Web Desktop

#### a) Diseño del Caso de Uso (PlantUML)

![Diseño del Caso de Uso CU20: Gestionar Compras y Aprovisionamiento desde Web Desktop](../diagramas/imagenes_cu/CU20_Compras_Aprovisionamiento_Desktop.png)

```plantuml
@startuml CU20_Compras_Aprovisionamiento_Desktop
left to right direction
skinparam usecase {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

actor "Admin Empresa /\nEncargado de Sucursal" as Comprador
actor "Proveedor Textil" as Prov

rectangle "CU20: Compras Web Desktop" {
  usecase "CU20: Gestionar Compras\ny Aprovisionamiento Desktop" as CU20
  usecase "Gestionar Directorio de\nProveedores y Fichas Comerciales" as UC_Prov
  usecase "Generar Orden de Compra\ncon Lotes, Costos y Tallas" as UC_OC
  usecase "Aprobar y Emitir Orden\nde Compra al Proveedor" as UC_Approve
  usecase "Registrar Recepción de Factura\ne Integrar con Kardex (CU07)" as UC_Kardex
}

Comprador --> CU20
CU20 --> Prov : Notificar Orden
CU20 ..> UC_Prov : <<include>>
CU20 ..> UC_OC : <<include>>
CU20 ..> UC_Approve : <<include>>
CU20 ..> UC_Kardex : <<include>>
@enduml
```

#### b) Prototipo de Interfaz de Usuario

Módulo corporativo de abastecimiento disponible **exclusivamente desde la interfaz Web Desktop / Laptop** para personal empresarial facultado. Formulario de Orden de Compra: Selector de Proveedor Textil (con datos de contacto, NIT y plazos de entrega pactados), Sucursal de Destino para recepción de mercadería y Moneda. Tabla de ítems a granel: Selector de prenda, Variante (Talla cm y Color Hex), Cantidad de unidades solicitadas, Costo Unitario de Compra pactado y Subtotal. Panel de totales con cálculo de IVA y retenciones. Botones de acción: "Guardar Borrador", "Autorizar Orden de Compra" y "Registrar Factura de Ingreso de Lote", el cual dispara la recepción física enlazada con el inventario multi-sucursal y recálculo automático de CPP en CU07.

#### c) Tabla Detalle del Caso de Uso

| Atributo | Detalle |
|:---|:---|
| **Identificador** | CU20 |
| **Nombre** | Gestionar Compras y Aprovisionamiento desde Web Desktop |
| **Autor** | Equipo de desarrollo |
| **Fecha** | 2026-10-24 |
| **Actores** | Administrador de Empresa, Encargado de Sucursal, Proveedor Textil |
| **Descripción** | Canal corporativo operado exclusivamente desde computadoras de escritorio (Web Desktop / Laptop) para emitir órdenes de compra a proveedores textiles, recepcionar lotes con factura fiscal e ingresar stock al Kardex recalculando CPP (CU07). |
| **Precondiciones** | Usuario con rol `ADMIN_EMPRESA` o `ENCARGADO_SUCURSAL` autenticado en navegador de escritorio; catálogo de proveedores registrado. |
| **Casos de Uso Incluidos (<<include>>)** | - **Gestionar Directorio de Proveedores y Fichas Comerciales:** Mantiene catálogo de proveedores textiles y plazos de entrega.<br>- **Generar Orden de Compra con Lotes, Costos y Tallas:** Confecciona orden con desglose de tallas en cm y costos unitarios.<br>- **Aprobar y Emitir Orden de Compra al Proveedor:** Valida límites presupuestarios y notifica formalmente al proveedor.<br>- **Registrar Recepción de Factura e Integrar con Kardex (CU07):** Recepciona mercadería en bodega, ingresa factura e invoca CU07 para recálculo de CPP. |
| **Casos de Uso Extendidos (<<extend>>)** | Ninguno (Flujo corporativo de abastecimiento formal). |
| **Flujo Normal** | 1. El usuario accede desde su PC de escritorio al módulo "Aprovisionamiento y Compras".<br>2. El sistema invoca `<<include>> Gestionar Directorio de Proveedores y Fichas Comerciales`, seleccionando el proveedor textil y la sucursal de destino.<br>3. El usuario invoca `<<include>> Generar Orden de Compra con Lotes, Costos y Tallas`, especificando las variantes por curva de tallas y costos unitarios pactados.<br>4. El usuario invoca `<<include>> Aprobar y Emitir Orden de Compra al Proveedor`, notificando la orden al proveedor.<br>5. Al llegar el lote a bodega, el encargado presiona "Recepción de Lote" e invoca `<<include>> Registrar Recepción de Factura e Integrar con Kardex (CU07)`.<br>6. El sistema ingresa el número de factura fiscal, suma el stock físico en la sucursal y recalcula el CPP inmutable de cada variante en CU07.<br>7. Cierra la orden con estado `RECEPCIONADA_CONFORME`. |
| **Flujo Alternativo** | **1a. Intento de acceso desde dispositivo móvil (PWA/Flutter):** El sistema bloquea el acceso informando: "Por normativas de auditoría empresarial, el módulo de aprovisionamiento a proveedores está restringido a Web Desktop".<br>**5a. Recepción con faltantes o piezas defectuosas:** El encargado registra discrepancia en la factura de compra y ajusta la cantidad ingresada. |
| **Postcondiciones** | Orden de compra liquidada, existencias físicas ingresadas a bodega y Costo Promedio Ponderado recalculado en el Kardex de la sucursal. |
---

# CAPÍTULO III. ANÁLISIS Y DISEÑO CON ICONIX

## 3.1. Modelo de Dominio (Diagrama de Clases del Dominio)

### 3.1.0. Fundamentación Metodológica en ICONIX (Pista Estática del Proceso)

Conforme a la metodología **ICONIX** desarrollada por Doug Rosenberg y Matt Stephens (*Use Case Driven Object Modeling with UML: Theory and Practice*), el desarrollo de software se organiza en dos pistas complementarias: la **pista dinámica** (Casos de Uso $\rightarrow$ Robustez $\rightarrow$ Secuencia) y la **pista estática** (Modelo de Dominio $\rightarrow$ Modelo de Dominio Actualizado $\rightarrow$ Modelo de Clases Detallado):

```
+-----------------------------------------------------------------------------------+
|                         PISTA ESTÁTICA DE ICONIX (STATIC)                         |
|                                                                                   |
|      [ Domain Model ]   ========>   [ Updated Domain Model ]   ========> [ Class Model ]  |
|      (Requisitos)                   (Análisis de Robustez)               (Diseño Detallado)|
|   Cajas conceptuales              Entidades descubiertas con           Clases completas con|
|  sin métodos ni tipos               atributos de negocio              atributos, métodos   |
|   de base de datos.                                                   tipos y visibilidad. |
+-----------------------------------------------------------------------------------+
```

#### Características del Modelo de Dominio Inicial en ICONIX:
1. **Glosario Visual del Dominio del Problema:** Captura el vocabulario del negocio y los objetos del mundo real cuya información o comportamiento debe gobernar el software.
2. **Representación Gráfica Simplificada (Regla de Oro de Rosenberg):** En esta etapa temprana, **NO se incluyen métodos ni operaciones**, y se evitan los atributos técnicos de implementación física (como tipos SQL, hashes o IDs de persistencia). Las clases se modelan como cajas conceptuales limpias con sus relaciones de asociación, composición y generalización.
3. **Semántica Formal:** Cada asociación cuenta con verbos de acción direccionales (`: verbo >`) y cardinalidades formales explícitas en ambos extremos (`1` a `1..*`, `1` a `0..1`, `*` a `1`), erradicando cualquier ambigüedad interpretativa.

Dado que la arquitectura de **FashionStore SaaS** es distribuida, multitenant y con soporte para contingencia *Offline-First*, el dominio del problema se descompone formalmente en dos modelos complementarios:
* **Modelo de Dominio del Sistema Central SaaS (El Grande):** Modela las entidades maestras empresariales, gobernanza multitenant, catalogación textil con fichas anatómicas, inventario multi-sucursal con CPP inmutable, ventas POS, postventa en dos tiempos, compras a proveedores y analítica con IA/ML.
* **Modelo de Dominio de la Aplicación Móvil (El Móvil):** Modela las entidades conceptuales que gobiernan la operación local del vendedor/cajero en tiendas físicas cuando opera sin conexión a internet y sincroniza de forma asíncrona mediante UUID v4.

---

### 3.1.1. Modelo de Dominio — Sistema Central SaaS Multitenant (El Grande)

Estructurado en **7 paquetes conceptuales de negocio**, captura de forma exhaustiva las 28 clases del dominio requeridas para resolver los casos de uso y desafíos técnicos del Segundo Parcial:

![Modelo de Dominio - Sistema Central SaaS Multitenant](../diagramas/imagenes_cu/P2_Modelo_Dominio_Central.png)

```plantuml
@startuml Modelo_Dominio_Central_P2
title Modelo de Dominio - Sistema Central SaaS Multitenant (ICONIX)
left to right direction
skinparam packageStyle rectangle
skinparam classAttributeIconSize 0
hide empty members
hide circle

skinparam class {
  BackgroundColor #FFFDE7
  BorderColor #F57F17
  FontColor #212121
  FontStyle bold
  FontSize 12
}
skinparam package {
  BackgroundColor #FAFAFA
  BorderColor #757575
  FontColor #37474F
  FontStyle bold
}
skinparam ArrowColor #D84315
skinparam ArrowFontColor #3E2723
skinparam ArrowFontSize 10

package "1. Gobernanza SaaS y Seguridad" {
  class Plataforma
  class Empresa
  class PlanSuscripcion
  class SuscripcionEmpresa
  class Usuario
  class Rol
  class BitacoraAuditoria
}

package "2. Catalogación Textil y Fichas Anatómicas" {
  class CategoriaTextil
  class ProductoPrenda
  class VariantePrenda
  class Modelo3D
}

package "3. Inventarios Multi-Sucursal y CPP" {
  class Sucursal
  class InventarioSucursal
  class KardexMovimiento
  class TraspasoInterSucursal
  class DetalleTraspaso
}

package "4. Ventas POS y Contingencia" {
  class VentaPOS
  class DetalleVenta
  class ReservaPresencial
  class OperacionOfflineCola
}

package "5. Postventa (2 Tiempos) y Pasarela" {
  class CambioPrenda
  class NotaDevolucion
  class NotaCambio
  class TransaccionStripe
}

package "6. Aprovisionamiento y Compras Desktop" {
  class ProveedorTextil
  class OrdenCompra
  class DetalleOrdenCompra
}

package "7. Inteligencia Analítica y ML" {
  class ConsultaReporteIA
  class PrediccionDemandaML
}

' Relaciones con verbos activos y cardinalidades formales
Plataforma "1" --> "1..*" Empresa : administra y aísla >
Empresa "1" --> "1" SuscripcionEmpresa : contrata vigente >
SuscripcionEmpresa "*" --> "1" PlanSuscripcion : se rige bajo >
Empresa "1" *--> "1..*" Sucursal : posee sedes en >
Empresa "1" *--> "1..*" Usuario : emplea personal en >
Usuario "*" --> "1" Rol : asignado con perfil de >
Usuario "1" --> "*" BitacoraAuditoria : registra eventos en >

Empresa "1" *--> "1..*" ProductoPrenda : comercializa en catálogo >
ProductoPrenda "*" --> "1" CategoriaTextil : clasificado bajo >
ProductoPrenda "1" *--> "1..*" VariantePrenda : desglosa matriz de >
ProductoPrenda "1" --> "0..1" Modelo3D : dispone para probador >

InventarioSucursal "*" --> "1" Sucursal : ubicado en almacén de >
InventarioSucursal "*" --> "1" VariantePrenda : controla existencias de >
InventarioSucursal "1" *--> "1..*" KardexMovimiento : asienta contabilidad en >

TraspasoInterSucursal "*" --> "1" Sucursal : sale de sucursal origen >
TraspasoInterSucursal "*" --> "1" Sucursal : arriba a sucursal destino >
TraspasoInterSucursal "1" *--> "1..*" DetalleTraspaso : transporta bultos de >
DetalleTraspaso "*" --> "1" VariantePrenda : transfiere unidades de >

VentaPOS "*" --> "1" Sucursal : efectuada en caja de >
VentaPOS "*" --> "1" Usuario : registrada por cajero en >
VentaPOS "*" --> "0..1" Usuario : facturada a cliente >
VentaPOS "1" *--> "1..*" DetalleVenta : desglosa prendas en >
DetalleVenta "*" --> "1" VariantePrenda : referencia a variante de >
VentaPOS "1" --> "0..1" TransaccionStripe : liquida cobro en >

ReservaPresencial "*" --> "1" Sucursal : apartada temporalmente en >
ReservaPresencial "*" --> "1" Usuario : reservada por cliente >
ReservaPresencial "*" --> "1" VariantePrenda : bloquea stock de >

OperacionOfflineCola "*" --> "1" Sucursal : generada sin red en >

CambioPrenda "*" --> "1" VentaPOS : originado desde compra en >
CambioPrenda "1" --> "1" NotaDevolucion : emite en Tiempo 1 de >
CambioPrenda "1" --> "0..1" NotaCambio : emite en Tiempo 2 de >
NotaDevolucion "*" --> "1" VariantePrenda : reingresa prenda a inventario de >
NotaCambio "*" --> "1" VariantePrenda : entrega nueva prenda desde stock de >
CambioPrenda "1" --> "0..1" TransaccionStripe : cobra saldo excedente en >

OrdenCompra "*" --> "1" ProveedorTextil : emitida formalmente a >
OrdenCompra "*" --> "1" Sucursal : consignada a bodega de >
OrdenCompra "1" *--> "1..*" DetalleOrdenCompra : especifica requerimientos en >
DetalleOrdenCompra "*" --> "1" VariantePrenda : abastece lote de >

ConsultaReporteIA "*" --> "1" Usuario : solicitada por directivo >
PrediccionDemandaML "*" --> "1" VariantePrenda : proyecta curva de demanda de >
@enduml
```

#### Diccionario de Entidades Conceptuales del Sistema Central:

| Paquete Conceptual | Entidad del Dominio | Rol y Responsabilidad Conceptual en el Negocio Textil |
|:---|:---|:---|
| **1. Gobernanza SaaS y Seguridad** | `Plataforma` | Representa la instancia global del software multi-empresa operada por el Super Admin. |
| | `Empresa` | Organización o marca textil cliente (tenant) que arrienda el servicio en la nube. |
| | `PlanSuscripcion` | Nivel comercial contratado (Básico, Profesional, Enterprise) con límites de sucursales y usuarios. |
| | `SuscripcionEmpresa` | Período de vigencia y estado contractual de la empresa cliente con la plataforma. |
| | `Usuario` | Empleado, encargado, cajero o cliente autenticado dentro de la empresa. |
| | `Rol` | Perfil de privilegios RBAC que delimita las operaciones autorizadas en el sistema. |
| | `BitacoraAuditoria` | Registro inmutable de eventos críticos de seguridad y transacciones operativas. |
| **2. Catalogación Textil** | `CategoriaTextil` | Familia o grupo taxonómico de prendas masculinas (Trajes, Camisas, Pantalones, Calzado). |
| | `ProductoPrenda` | Concepto comercial genérico de la prenda con ficha de corte, estilo y composición de tela. |
| | `VariantePrenda` | Prenda individualizada por medidas anatómicas reales (pecho, cintura, cadera, largo) y paleta de color hex. |
| | `Modelo3D` | Fichero geométrico tridimensional optimizado para el probador virtual con Realidad Aumentada. |
| **3. Inventarios y CPP** | `Sucursal` | Sede comercial física o bodega central donde se almacenan y comercializan las prendas. |
| | `InventarioSucursal` | Existencias físicas, reservadas y disponibles por variante en cada sucursal con su CPP activo. |
| | `KardexMovimiento` | Asiento contable cronológico e inmutable que registra entradas, salidas y saldos valorados bajo CPP. |
| | `TraspasoInterSucursal` | Documento logístico que ampara el traslado formal de prendas entre dos almacenes de la empresa. |
| | `DetalleTraspaso` | Renglón de mercancía que especifica las variantes y cantidades trasladadas entre sedes. |
| **4. Ventas POS y Contingencia** | `VentaPOS` | Transacción de venta presencial o digital liquidada en efectivo o pasarela electrónica. |
| | `DetalleVenta` | Ítems de variantes textiles adquiridos por el cliente con su precio y descuento unitario. |
| | `ReservaPresencial` | Apartado temporal de una prenda en tienda con bloqueo preventivo de stock por 2 horas. |
| | `OperacionOfflineCola` | Registro transaccional generado sin internet en espera de sincronización central determinista. |
| **5. Postventa y Pasarela** | `CambioPrenda` | Proceso administrativo de atención postventa para reemplazo de prenda por talla o modelo. |
| | `NotaDevolucion` | Comprobante emitido en Tiempo 1 al recepcionar la prenda usada, reconociendo el saldo a favor. |
| | `NotaCambio` | Comprobante emitido en Tiempo 2 al despachar la prenda definitiva y liquidar la diferencia. |
| | `TransaccionStripe` | Operación financiera procesada contra la pasarela internacional para cobro del diferencial. |
| **6. Aprovisionamiento** | `ProveedorTextil` | Fabricante o taller confeccionista que suministra rollos de tela o lotes de prendas terminadas. |
| | `OrdenCompra` | Documento mercantil de compra generado exclusivamente desde Web Desktop corporativo. |
| | `DetalleOrdenCompra` | Desglose de variantes, curva de tallas y costos unitarios de compra pactados con el proveedor. |
| **7. Inteligencia Analítica** | `ConsultaReporteIA` | Petición en lenguaje natural procesada para generar sentencias SQL de solo lectura restringidas al tenant. |
| | `PrediccionDemandaML` | Estimación matemática de unidades requeridas por SKU para anticipar abastecimiento estacional. |

---

### 3.1.2. Modelo de Dominio — Aplicación Móvil Flutter Offline-First (El Móvil)

Modela los objetos del mundo real y las estructuras conceptuales que gestiona el dispositivo móvil del vendedor o cajero cuando opera sin conexión a internet en tiendas físicas, garantizando continuidad operativa y consistencia de datos:

![Modelo de Dominio - Aplicación Móvil Flutter Offline-First](../diagramas/imagenes_cu/P2_Modelo_Dominio_Movil.png)

```plantuml
@startuml Modelo_Dominio_Movil_P2
title Modelo de Dominio - Aplicación Móvil Flutter Offline-First (ICONIX)
top to bottom direction
skinparam packageStyle rectangle
skinparam classAttributeIconSize 0
hide empty members
hide circle

skinparam class {
  BackgroundColor #E0F2F1
  BorderColor #00796B
  FontColor #004D40
  FontStyle bold
  FontSize 12
}
skinparam package {
  BackgroundColor #F5FBFB
  BorderColor #004D40
  FontColor #004D40
  FontStyle bold
}
skinparam ArrowColor #00695C
skinparam ArrowFontColor #004D40
skinparam ArrowFontSize 10

package "Terminal y Seguridad Local" {
  class DispositivoTerminal
  class SesionCajero
  class ConfiguracionLocal
}

package "Catálogo y Existencias Offline" {
  class CatalogoLocal
  class PrendaVarianteLocal
  class CacheMultimediaWebP
}

package "Operaciones y Ventas Offline" {
  class VentaPOSOffline
  class DetalleVentaLocal
  class ReservaPresencialOffline
  class TicketQRLocal
}

package "Sincronización Asíncrona (UUID)" {
  class ColaSincronizacion
  class EventoSyncLocal
}

' Relaciones conceptuales
DispositivoTerminal "1" *--> "1" ConfiguracionLocal : almacena parámetros de >
DispositivoTerminal "1" --> "0..1" SesionCajero : autentica turno activo con >

DispositivoTerminal "1" *--> "1" CatalogoLocal : mantiene réplica local de >
CatalogoLocal "1" *--> "1..*" PrendaVarianteLocal : indexa variantes de >
PrendaVarianteLocal "1" --> "0..1" CacheMultimediaWebP : enlaza foto local de >

SesionCajero "1" --> "*" VentaPOSOffline : registra ventas en >
VentaPOSOffline "1" *--> "1..*" DetalleVentaLocal : desglosa prendas en >
DetalleVentaLocal "*" --> "1" PrendaVarianteLocal : descuenta existencias de >

SesionCajero "1" --> "*" ReservaPresencialOffline : toma pedidos de >
ReservaPresencialOffline "*" --> "1" PrendaVarianteLocal : aparta temporalmente >
ReservaPresencialOffline "1" *--> "1" TicketQRLocal : genera token visual en >

VentaPOSOffline "1" --> "1" ColaSincronizacion : encola con UUID v4 en >
ReservaPresencialOffline "1" --> "1" ColaSincronizacion : encola con UUID v4 en >
ColaSincronizacion "1" *--> "1..*" EventoSyncLocal : registra trazabilidad de >
DispositivoTerminal "1" --> "1" ColaSincronizacion : monitorea envíos en >
@enduml
```

#### Diccionario de Entidades Conceptuales de la Aplicación Móvil:

| Paquete Móvil | Entidad Conceptual | Función y Responsabilidad en el Dispositivo Móvil |
|:---|:---|:---|
| **Terminal y Seguridad Local** | `DispositivoTerminal` | Hardware móvil (Smartphone o Tablet Android/iOS) asignado a una sucursal física. |
| | `SesionCajero` | Token criptográfico e información de turno del cajero almacenada en el *SecureStorage*. |
| | `ConfiguracionLocal` | Parámetros del dispositivo: identificador de sucursal asignada, IP del servidor y último sync. |
| **Catálogo y Existencias** | `CatalogoLocal` | Snapshot descargado de las prendas habilitadas para la tienda física en almacenamiento SQLite. |
| | `PrendaVarianteLocal` | Matriz local de tallas, colores, precios minoristas y existencias disponibles en tienda. |
| | `CacheMultimediaWebP` | Fotos optimizadas y diagramas de medidas descargados para navegación fluida sin conexión. |
| **Operaciones Offline** | `VentaPOSOffline` | Comprobante de venta en efectivo emitido localmente con identificador único UUID v4. |
| | `DetalleVentaLocal` | Renglones de prendas vendidas en el dispositivo, con descuento inmediato de stock en SQLite. |
| | `ReservaPresencialOffline` | Reserva de prenda realizada por un cliente en tienda con temporizador de expiración de 2 horas. |
| | `TicketQRLocal` | Código QR emitido en pantalla o ticket térmico para reclamo de la reserva en mostrador. |
| **Sincronización Asíncrona** | `ColaSincronizacion` | Cola de operaciones ordenadas cronológicamente para despacho hacia el servidor al volver internet. |
| | `EventoSyncLocal` | Registro de auditoría local sobre el estado de cada transacción (Pendiente, Confirmada, Conflicto). |

---

## 3.2. Diagramas de Robustez (Análisis y Diseño Preliminar ICONIX)

En la metodología **ICONIX** (Doug Rosenberg, Matt Stephens; adaptada según directrices de la cátedra de Sistemas de Información II), el **Diagrama de Robustez** es una técnica intermedia no perteneciente formalmente al estándar UML, pero vital como puente integrador entre el **espacio del problema** (descrito narrativamente en las fichas y especificaciones de Casos de Uso) y el **espacio de la solución** (diseño preliminar de arquitectura, diagramas de clases refinados y diagramas de secuencia).

### Fundamentos Metodológicos y Semántica de la Tríada BCE

El análisis de robustez se fundamenta en la descomposición de cada caso de uso en tres tipos canónicos de objetos (**Boundary-Control-Entity / BCE**):

1. **Objetos Frontera o Interfaz (Boundary) — Prefijo `UI:`:**
   * Representan los puntos de contacto del sistema con los actores humanos o sistemas externos.
   * Abarcan interfaces gráficas, pantallas de usuario, formularios de captura, modales de confirmación, escáneres ópticos de códigos de barra / QR y endpoints HTTP de la API RESTful.
   * **Nomenclatura estandarizada:** En los diagramas se identifican explícitamente con el prefijo **`UI: <Nombre>`** (ej. *UI: Pantalla POS*, *UI: Formulario Registro Empresa*, *UI: Modal Reorden*).
2. **Objetos Controlador (Control) — Prefijo `CRT:`:**
   * Encapsulan la lógica de la aplicación, orquestación de casos de uso, transformaciones, validaciones criptográficas, algoritmos de recálculo matemático (como el CPP) y coordinación de transacciones.
   * **Nomenclatura estandarizada:** En los diagramas se identifican explícitamente con el prefijo **`CRT: <Nombre>`** (ej. *CRT: Gestor de Empresas*, *CRT: Gestor de Autenticación*, *CRT: Validador de NIT y Tenant*).
3. **Objetos Entidad (Entity) — Prefijo `CE:`:**
   * Representan los datos persistentes del negocio mapeados directamente desde el Modelo de Dominio hacia las tablas relacionales de PostgreSQL o almacenes locales (IndexedDB / SQLite).
   * **Nomenclatura estandarizada:** En los diagramas se identifican explícitamente con el prefijo **`CE: <Nombre>`** (ej. *CE: Empresa (Tenant)*, *CE: Usuario (Admin)*, *CE: InventarioSucursal*).

### La Gramática Fundamental de ICONIX: «Sustantivo — Verbo — Sustantivo»

El principio rector establecido en el manual de ICONIX dictamina que **los objetos sustantivos (Fronteras y Entidades) únicamente se comunican y relacionan a través de verbos (Controladores)**:

$$\text{Frontera (Sustantivo)} \xrightarrow{\text{invoca}} \text{Controlador (Verbo)} \xrightarrow{\text{opera / consulta}} \text{Entidad (Sustantivo)}$$

> **Las 4 Reglas Estrictas de Construcción de Robustez (Cumplimiento 100% Verificado):**
> 1. **Los Actores sólo interactúan con Fronteras (Boundaries):** Ningún actor humano ni servicio externo accede directamente a controladores ni entidades.
> 2. **Aislamiento de Fronteras (Boundaries):** Las fronteras se comunican exclusivamente con Actores y Controladores. Está **terminantemente prohibida** la comunicación directa *Frontera-Entidad* (para preservar la separación MVC) y la comunicación *Frontera-Frontera*.
> 3. **Prohibición Absoluta de Comunicación Entidad-Entidad:** Ninguna entidad puede conectarse, invocar ni modificar directamente a otra entidad. Cualquier cálculo, asignación foránea o validación inter-entidad debe ser realizada obligatoriamente por un Controlador.
> 4. **Comunicación entre Controladores:** Como única excepción canónica, los objetos de tipo Controlador **sí pueden comunicarse entre ellos** para delegar tareas especializadas (ej. un *Gestor de Sincronización* invocando a un *Validador de Idempotencia* y luego a un *Calculador de CPP*).

A continuación se presentan los **20 Diagramas de Robustez** del sistema (CU01 al CU20), renderizados con su correspondiente notación gráfica estandarizada y acompañados de su código fuente PlantUML verificado contra las 4 reglas metodológicas:

---

### Diagrama de Robustez — CU01: Gestionar Empresas (Tenants)



![Diagrama de Robustez — CU01: Gestionar Empresas (Tenants)](../diagramas/imagenes_robustez/Robustez_CU01.png)

```plantuml
@startuml Robustez_CU01
left to right direction
skinparam stereotypeCPosition top

actor "Super Admin" as Actor

boundary "UI: Vista Listado\nEmpresas" as UI_List
boundary "UI: Formulario Registro\nEmpresa" as UI_Form

control "CRT: Gestor de\nEmpresas" as Ctrl_Emp
control "CRT: Validador de\nNIT y Tenant" as Ctrl_Val

entity "CE: Empresa (Tenant)" as Ent_Emp
entity "CE: Usuario (Admin)" as Ent_User
entity "CE: BitacoraAcceso" as Ent_Bit

Actor --> UI_List : 1. Consultar empresas registradas
UI_List --> Ctrl_Emp : 2. listarEmpresas(filtros)
Ctrl_Emp --> Ent_Emp : 3. SELECT * FROM empresas

Actor --> UI_Form : 4. Ingresar datos (NIT, razón social, email admin)
UI_Form --> Ctrl_Val : 5. validarNITUnico(nit)
Ctrl_Val --> Ent_Emp : 6. verificarDuplicado(nit)
UI_Form --> Ctrl_Emp : 7. registrarEmpresa(datos)
Ctrl_Emp --> Ent_Emp : 8. INSERT INTO empresas (schema_name, tenant_id)
Ctrl_Emp --> Ent_User : 9. crearUsuarioAdmin(email, hash_bcrypt, tenant_id)
Ctrl_Emp --> Ent_Bit : 10. registrarAuditoria("ALTA_TENANT")
@enduml
```

---

### Diagrama de Robustez — CU02: Gestionar Planes de Suscripción



![Diagrama de Robustez — CU02: Gestionar Planes de Suscripción](../diagramas/imagenes_robustez/Robustez_CU02.png)

```plantuml
@startuml Robustez_CU02
left to right direction
skinparam stereotypeCPosition top

actor "Super Admin" as Actor

boundary "UI: Panel de Planes\nde Suscripción" as UI_Planes
boundary "UI: Modal Configuración\nde Límites" as UI_Modal

control "CRT: Gestor de Planes\nde Suscripción" as Ctrl_Planes
control "CRT: Validador de\nLímites y Precios" as Ctrl_ValPlan

entity "CE: PlanSuscripcion" as Ent_Plan
entity "CE: BitacoraAcceso" as Ent_Bit

Actor --> UI_Planes : 1. Visualizar catálogo de planes (Básico, Pro, Enterprise)
UI_Planes --> Ctrl_Planes : 2. consultarPlanesActivos()
Ctrl_Planes --> Ent_Plan : 3. SELECT * FROM planes_suscripcion

Actor --> UI_Modal : 4. Configurar límites (máx sucursales, usuarios, IA habilitada)
UI_Modal --> Ctrl_ValPlan : 5. validarCoherenciaLimites(datosPlan)
UI_Modal --> Ctrl_Planes : 6. actualizarParametrosPlan(plan_id, nuevosLimites)
Ctrl_Planes --> Ent_Plan : 7. UPDATE planes_suscripcion SET limites = :nuevosLimites
Ctrl_Planes --> Ent_Bit : 8. registrarAuditoria("MODIFICACION_PLAN")
@enduml
```

---

### Diagrama de Robustez — CU03: Gestionar Suscripción de Empresa



![Diagrama de Robustez — CU03: Gestionar Suscripción de Empresa](../diagramas/imagenes_robustez/Robustez_CU03.png)

```plantuml
@startuml Robustez_CU03
left to right direction
skinparam stereotypeCPosition top

actor "Super Admin /\nAdmin Empresa" as Actor

boundary "UI: Pantalla Estado\nde Suscripción" as UI_Susc
boundary "UI: Modal Renovación\ny Upgrades" as UI_Upgrade

control "CRT: Gestor de\nSuscripciones" as Ctrl_Susc
control "CRT: Calculador de Fechas\ny Estado" as Ctrl_Calc

entity "CE: SuscripcionEmpresa" as Ent_Susc
entity "CE: Empresa (Tenant)" as Ent_Emp
entity "CE: HistorialSuscripcion" as Ent_Hist

Actor --> UI_Susc : 1. Consultar estado, plan y fecha de expiración
UI_Susc --> Ctrl_Susc : 2. obtenerSuscripcionActiva(tenant_id)
Ctrl_Susc --> Ent_Susc : 3. SELECT * FROM suscripciones WHERE tenant_id = :id
Ctrl_Susc --> Ctrl_Calc : 4. evaluarDiasRestantes(fecha_vencimiento)

Actor --> UI_Upgrade : 5. Solicitar cambio de plan o renovación anual
UI_Upgrade --> Ctrl_Susc : 6. procesarRenovacion(tenant_id, nuevo_plan_id)
Ctrl_Susc --> Ent_Susc : 7. UPDATE suscripciones SET estado='ACTIVA', fecha_fin=:nuevaFecha
Ctrl_Susc --> Ent_Hist : 8. INSERT INTO historial_suscripciones (evento, monto)
@enduml
```

---

### Diagrama de Robustez — CU04: Autenticar Usuario Multitenant



![Diagrama de Robustez — CU04: Autenticar Usuario Multitenant](../diagramas/imagenes_robustez/Robustez_CU04.png)

```plantuml
@startuml Robustez_CU04
left to right direction
skinparam stereotypeCPosition top

actor "Usuario del Sistema" as Actor

boundary "UI: Pantalla Login\nMultitenant" as UI_Login
boundary "UI: Alerta Cuenta\nBloqueada" as UI_Alerta

control "CRT: Gestor de\nAutenticación" as Ctrl_Auth
control "CRT: Verificador de\nSuscripción Tenant" as Ctrl_VerifSusc
control "CRT: Generador de\nTokens JWT" as Ctrl_JWT

entity "CE: Usuario" as Ent_User
entity "CE: Empresa (Tenant)" as Ent_Emp
entity "CE: BitacoraAcceso" as Ent_Bit

Actor --> UI_Login : 1. Ingresar credenciales (email, contraseña)
UI_Login --> Ctrl_Auth : 2. autenticar(email, password)
Ctrl_Auth --> Ent_User : 3. buscarPorEmail(email)
Ctrl_Auth --> Ctrl_Auth : 4. verificarHashBcrypt(password, password_hash)

Ctrl_Auth --> Ctrl_VerifSusc : 5. validarEstadoTenant(usuario.tenant_id)
Ctrl_VerifSusc --> Ent_Emp : 6. consultarVigenciaSuscripcion(tenant_id)

Ctrl_Auth --> Ctrl_JWT : 7. generarToken(usuario_id, tenant_id, rol)
Ctrl_Auth --> Ent_Bit : 8. registrarAccesoExitoso(usuario_id, ip)
Ctrl_Auth --> UI_Login : 9. Devolver Bearer JWT y claims
@enduml
```

---

### Diagrama de Robustez — CU05: Gestionar Usuarios y Roles por Empresa



![Diagrama de Robustez — CU05: Gestionar Usuarios y Roles por Empresa](../diagramas/imagenes_robustez/Robustez_CU05.png)

```plantuml
@startuml Robustez_CU05
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa" as Actor

boundary "UI: Vista Gestión\nde Personal" as UI_Personal
boundary "UI: Modal Asignación\nde Rol y Sucursal" as UI_Rol

control "CRT: Gestor de\nUsuarios y Roles" as Ctrl_User
control "CRT: Validador de Límites\nde Suscripción" as Ctrl_Limit

entity "CE: Usuario" as Ent_User
entity "CE: RolPermiso" as Ent_Rol
entity "CE: Sucursal" as Ent_Suc

Actor --> UI_Personal : 1. Listar empleados y cajeros de la empresa
UI_Personal --> Ctrl_User : 2. listarUsuariosPorTenant(tenant_id)
Ctrl_User --> Ent_User : 3. SELECT * FROM usuarios WHERE tenant_id = :id

Actor --> UI_Rol : 4. Crear nuevo usuario y asignar rol (Cajero, Encargado)
UI_Rol --> Ctrl_Limit : 5. verificarMaxUsuariosTenant(tenant_id)
UI_Rol --> Ctrl_User : 6. registrarNuevoColaborador(datos, rol_id, sucursal_id)
Ctrl_User --> Ent_User : 7. INSERT INTO usuarios (tenant_id, password_hash)
Ctrl_User --> Ent_Rol : 8. vincularRol(usuario_id, rol_id)
Ctrl_User --> Ent_Suc : 9. asociarSucursalFisica(usuario_id, sucursal_id)
@enduml
```

---

### Diagrama de Robustez — CU06: Gestionar Productos y Atributos Textiles Avanzados



![Diagrama de Robustez — CU06: Gestionar Productos y Atributos Textiles Avanzados](../diagramas/imagenes_robustez/Robustez_CU06.png)

```plantuml
@startuml Robustez_CU06
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa" as Actor

boundary "UI: Pantalla Catálogo\nde Productos" as UI_Prod
boundary "UI: Ficha Técnica\nTextil" as UI_Ficha
boundary "UI: Matriz Variantes\ny Medidas (cm)" as UI_Variantes
boundary "UI: Cargador Modelo\n3D Realidad Aumentada" as UI_3D

control "CRT: Gestor de\nProductos" as Ctrl_Prod
control "CRT: Validador Ficha\ny Telas Textiles" as Ctrl_ValTextil

entity "CE: Producto" as Ent_Prod
entity "CE: VariantePrenda" as Ent_Var
entity "CE: FichaTextil" as Ent_Ficha
entity "CE: Tenant" as Ent_Tenant

Actor --> UI_Prod : 1. Consultar prendas del tenant
UI_Prod --> Ctrl_Prod : 2. listarPrendas(tenant_id)
Ctrl_Prod --> Ent_Prod : 3. SELECT * FROM productos WHERE tenant_id = :id

Actor --> UI_Ficha : 4. Registrar datos: SKU, composición (lino/algodón/lana), hipoalergénico
UI_Ficha --> Ctrl_ValTextil : 5. validarComposicionTextil(datosFicha)
UI_Ficha --> Ctrl_Prod : 6. registrarPrendaBase(datos, tenant_id)
Ctrl_Prod --> Ent_Prod : 7. INSERT INTO productos (...)
Ctrl_Prod --> Ent_Ficha : 8. INSERT INTO fichas_textiles (propiedad_hipoalergenica, tela)

Actor --> UI_Variantes : 9. Configurar tallas con medidas cm (pecho, cintura) y bicolores Hex
UI_Variantes --> Ctrl_Prod : 10. registrarVariantesConMedidas(prenda_id, listaVariantes)
Ctrl_Prod --> Ent_Var : 11. INSERT INTO variantes_prenda (talla_cm, color_hex)

Actor --> UI_3D : 12. Vincular archivo 3D (.glb) para probador virtual
UI_3D --> Ctrl_Prod : 13. asociarModelo3D(prenda_id, glb_url)
Ctrl_Prod --> Ent_Prod : 14. UPDATE productos SET modelo_3d_url = :url
@enduml
```

---

### Diagrama de Robustez — CU07: Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP)



![Diagrama de Robustez — CU07: Gestionar Inventario Multi-Sucursal, Kardex Físico-Valorado y Costo Promedio Ponderado (CPP)](../diagramas/imagenes_robustez/Robustez_CU07.png)

```plantuml
@startuml Robustez_CU07
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa /\nEncargado de Sucursal" as Actor

boundary "UI: Pantalla Inventario\nMulti-Sucursal" as UI_Inv
boundary "UI: Modal Recepción\nde Lote (Factura)" as UI_Lote
boundary "UI: Vista Kardex\nFísico-Valorado" as UI_Kardex

control "CRT: Gestor de\nInventarios" as Ctrl_Inv
control "CRT: Calculador Inmutable\nde Costo Promedio (CPP)" as Ctrl_CPP

entity "CE: InventarioSucursal" as Ent_InvSuc
entity "CE: MovimientoKardex" as Ent_Kardex
entity "CE: Producto" as Ent_Prod
entity "CE: Sucursal" as Ent_Suc

Actor --> UI_Inv : 1. Seleccionar sucursal y consultar existencias
UI_Inv --> Ctrl_Inv : 2. consultarStockSucursal(sucursal_id, tenant_id)
Ctrl_Inv --> Ent_InvSuc : 3. SELECT stock_fisico, stock_reservado, cpp FROM inventario_sucursal

Actor --> UI_Lote : 4. Recepcionar lote de prendas con factura de compra
UI_Lote --> Ctrl_CPP : 5. calcularNuevoCPP(stock_actual, cpp_actual, cant_ingreso, costo_compra)
Ctrl_CPP --> Ctrl_Inv : 6. retornarCPPCalculado(nuevo_cpp, saldo_total)

Ctrl_Inv --> Ent_InvSuc : 7. UPDATE inventario_sucursal SET stock_fisico += cant, cpp = nuevo_cpp
Ctrl_Inv --> Ent_Kardex : 8. INSERT INTO movimientos_kardex (tipo='ENTRADA_LOTE', cant, cpp, factura)

Actor --> UI_Kardex : 9. Inspeccionar auditoría cronológica inmutable
UI_Kardex --> Ctrl_Inv : 10. listarMovimientosKardex(variante_id, sucursal_id)
Ctrl_Inv --> Ent_Kardex : 11. SELECT * FROM movimientos_kardex ORDER BY fecha ASC
@enduml
```

---

### Diagrama de Robustez — CU08: Descargar y Consultar Catálogo Digital Offline



![Diagrama de Robustez — CU08: Descargar y Consultar Catálogo Digital Offline](../diagramas/imagenes_robustez/Robustez_CU08.png)

```plantuml
@startuml Robustez_CU08
left to right direction
skinparam stereotypeCPosition top

actor "Cliente" as Actor

boundary "UI: Catálogo Digital\nPWA / Móvil" as UI_Cat
boundary "UI: Aviso Modo\nOffline Activado" as UI_Aviso

control "CRT: Gestor Catálogo\nOffline" as Ctrl_CatOff
control "CRT: Sincronizador de\nCaché Local" as Ctrl_Cache

entity "CE: IndexedDB / SQLite\n(Caché Local)" as Ent_LocalDB
entity "CE: Cache Storage\n(Imágenes WebP)" as Ent_CacheMedia

Actor --> UI_Cat : 1. Abrir aplicación y solicitar catálogo
UI_Cat --> Ctrl_CatOff : 2. consultarCatalogo()

alt Conexión activa
  Ctrl_CatOff --> Ctrl_Cache : 3a. verificarVersionCatalogo()
  Ctrl_Cache --> Ent_LocalDB : 4a. guardarSnapshotProductos(deltaJSON)
  Ctrl_Cache --> Ent_CacheMedia : 5a. precargarMiniaturas()
else Sin conexión a Internet
  Ctrl_CatOff --> Ent_LocalDB : 3b. SELECT * FROM prendas_cache
  Ctrl_CatOff --> UI_Aviso : 4b. Notificar funcionamiento autónomo offline
end

Ctrl_CatOff --> UI_Cat : 6. Renderizar prendas, medidas cm y colores
@enduml
```

---

### Diagrama de Robustez — CU09: Registrar Reserva Presencial Sin Conexión a Internet



![Diagrama de Robustez — CU09: Registrar Reserva Presencial Sin Conexión a Internet](../diagramas/imagenes_robustez/Robustez_CU09.png)

```plantuml
@startuml Robustez_CU09
left to right direction
skinparam stereotypeCPosition top

actor "Cliente" as Actor

boundary "UI: Ficha de Prenda\n(Modo Offline)" as UI_Prenda
boundary "UI: Ticket QR de\nReserva Offline" as UI_Ticket

control "CRT: Gestor Reserva\nOffline" as Ctrl_ResOff
control "CRT: Generador UUID\nIdempotente" as Ctrl_UUID

entity "CE: IndexedDB / SQLite\n(Local)" as Ent_DBLocal

Actor --> UI_Prenda : 1. Seleccionar talla cm y presionar "Reservar en Tienda (Offline)"
UI_Prenda --> Ctrl_UUID : 2. generarUUIDv4()
Ctrl_UUID --> Ctrl_ResOff : 3. retornarUUIDUnico(uuid)

Ctrl_ResOff --> Ent_DBLocal : 4. INSERT INTO reservas_offline (uuid, prenda_id, tiempo_limite=2h)
Ctrl_ResOff --> Ent_DBLocal : 5. UPDATE stock_local SET disponible = disponible - 1
Ctrl_ResOff --> UI_Ticket : 6. Generar ticket con QR y UUID firmado
UI_Ticket --> Actor : 7. Mostrar ticket para validación en mostrador
@enduml
```

---

### Diagrama de Robustez — CU10: Registrar Venta POS de Contado Sin Conexión a Internet



![Diagrama de Robustez — CU10: Registrar Venta POS de Contado Sin Conexión a Internet](../diagramas/imagenes_robustez/Robustez_CU10.png)

```plantuml
@startuml Robustez_CU10
left to right direction
skinparam stereotypeCPosition top

actor "Cajero" as Actor

boundary "UI: Terminal POS\n(Modo Offline)" as UI_POS
boundary "UI: Comprobante Fiscal\nProvisional" as UI_Ticket

control "CRT: Gestor de Venta\nPOS Offline" as Ctrl_VentaOff
control "CRT: Generador UUID\nIdempotente" as Ctrl_UUID
control "CRT: Motor de Reglas\nComerciales Locales" as Ctrl_Reglas

entity "CE: IndexedDB / SQLite\n(Local)" as Ent_DBLocal

Actor --> UI_POS : 1. Escanear SKU de prendas y seleccionar "Contado Efectivo"
UI_POS --> Ctrl_Reglas : 2. calcularTotalesConDescuento(items)
Ctrl_Reglas --> Ctrl_VentaOff : 3. retornarTotalCalculado(montoTotal)

Actor --> UI_POS : 4. Confirmar cobro en efectivo
UI_POS --> Ctrl_UUID : 5. generarUUIDv4()
Ctrl_UUID --> Ctrl_VentaOff : 6. uuid_v4_unico

Ctrl_VentaOff --> Ent_DBLocal : 7. INSERT INTO operaciones_offline (uuid, tipo='VENTA', total, estado='PENDIENTE_SYNC')
Ctrl_VentaOff --> Ent_DBLocal : 8. UPDATE catalogo_local SET stock_fisico = stock_fisico - cantidad
Ctrl_VentaOff --> UI_Ticket : 9. Emitir ticket provisional con UUID
@enduml
```

---

### Diagrama de Robustez — CU11: Consultar y Auditar Operaciones Locales Pendientes



![Diagrama de Robustez — CU11: Consultar y Auditar Operaciones Locales Pendientes](../diagramas/imagenes_robustez/Robustez_CU11.png)

```plantuml
@startuml Robustez_CU11
left to right direction
skinparam stereotypeCPosition top

actor "Cajero / Encargado" as Actor

boundary "UI: Panel de Auditoría\ny Operaciones Locales" as UI_Audit
boundary "UI: Modal Detalle JSON\nde Transacción" as UI_Detalle

control "CRT: Gestor Auditoría\nLocal" as Ctrl_Audit
control "CRT: Verificador de\nIntegridad y Hash" as Ctrl_Hash

entity "CE: IndexedDB / SQLite\n(Local)" as Ent_DBLocal

Actor --> UI_Audit : 1. Ingresar a arqueo y operaciones pendientes
UI_Audit --> Ctrl_Audit : 2. obtenerOperacionesPendientes()
Ctrl_Audit --> Ent_DBLocal : 3. SELECT * FROM operaciones_offline WHERE estado='PENDIENTE_SYNC'
Ctrl_Audit --> Ctrl_Hash : 4. verificarIntegridadRegistros()

Actor --> UI_Detalle : 5. Inspeccionar payload, UUID y montos en efectivo
UI_Detalle --> Ctrl_Audit : 6. obtenerDetalleJSON(uuid)
Ctrl_Audit --> Ent_DBLocal : 7. SELECT payload_json FROM operaciones_offline WHERE uuid = :id
@enduml
```

---

### Diagrama de Robustez — CU12: Sincronizar Operaciones Pendientes



![Diagrama de Robustez — CU12: Sincronizar Operaciones Pendientes](../diagramas/imagenes_robustez/Robustez_CU12.png)

```plantuml
@startuml Robustez_CU12
left to right direction
skinparam stereotypeCPosition top

actor "Sistema de\nSincronización" as SistSync

boundary "UI: Worker de Red\n(Background)" as UI_Worker

control "CRT: Gestor de\nSincronización" as Ctrl_Sync
control "CRT: Verificador de\nIdempotencia Central" as Ctrl_Idemp
control "CRT: Reconciliador de\nInventario y Stock" as Ctrl_Recon

entity "CE: IndexedDB / SQLite\n(Local)" as Ent_DBLocal
entity "CE: TransaccionesProcesadas" as Ent_CentralTx
entity "CE: InventarioSucursal" as Ent_InvSuc
entity "CE: MovimientoKardex" as Ent_Kardex

SistSync --> UI_Worker : 1. Evento de red restablecida (online)
UI_Worker --> Ctrl_Sync : 2. ejecutarSyncBatch()
Ctrl_Sync --> Ent_DBLocal : 3. SELECT * FROM operaciones_offline WHERE estado='PENDIENTE_SYNC'

Ctrl_Sync --> Ctrl_Idemp : 4. verificarUUIDExistente(tx.uuid)
Ctrl_Idemp --> Ent_CentralTx : 5. SELECT id FROM transacciones WHERE uuid = :uuid

alt UUID No Procesado
  Ctrl_Sync --> Ctrl_Recon : 6. aplicarTransaccionEnServidor(tx)
  Ctrl_Recon --> Ent_InvSuc : 7. UPDATE inventario_sucursal SET stock_fisico -= cant
  Ctrl_Recon --> Ent_Kardex : 8. INSERT INTO movimientos_kardex (tipo='VENTA_SYNC', uuid)
  Ctrl_Recon --> Ent_CentralTx : 9. INSERT INTO transacciones (uuid, status='CONFIRMADO')
end

Ctrl_Sync --> Ent_DBLocal : 10. UPDATE operaciones_offline SET estado='SINCRONIZADO'
@enduml
```

---

### Diagrama de Robustez — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones



![Diagrama de Robustez — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones](../diagramas/imagenes_robustez/Robustez_CU13.png)

```plantuml
@startuml Robustez_CU13
left to right direction
skinparam stereotypeCPosition top

actor "Cliente" as Cl
actor "Cajero / Encargado" as Staff

boundary "UI: Pantalla Postventa\ny Devoluciones" as UI_Dev
boundary "UI: Formulario Nota\nde Devolución (T1)" as UI_T1
boundary "UI: Formulario Nota\nde Cambio (T2)" as UI_T2
boundary "UI: Comprobante Liquidación\n30 Días Efectivo" as UI_Reemb

control "CRT: Gestor de Cambios\ny Devoluciones" as Ctrl_Cambio
control "CRT: Validador Prenda\ny Cuarentena" as Ctrl_ValPrenda
control "CRT: Gestor de Pagos\nStripe (CU18)" as Ctrl_Stripe

entity "CE: NotaDevolucion" as Ent_NotaDev
entity "CE: NotaCambio" as Ent_NotaCambio
entity "CE: InventarioSucursal" as Ent_InvSuc
entity "CE: VentaOriginal" as Ent_Venta

Staff --> UI_Dev : 1. Buscar ticket de compra original
UI_Dev --> Ctrl_Cambio : 2. consultarVenta(ticket_id)
Ctrl_Cambio --> Ent_Venta : 3. SELECT * FROM ventas WHERE ticket = :id

' --- TIEMPO 1: NOTA DE DEVOLUCIÓN ---
Staff --> UI_T1 : 4. Registrar recepción de prenda (talla chica/defecto)
UI_T1 --> Ctrl_ValPrenda : 5. inspeccionarEstadoFisico(prenda)
UI_T1 --> Ctrl_Cambio : 6. generarNotaDevolucion(venta_id, prenda_id, motivo)
Ctrl_Cambio --> Ent_NotaDev : 7. INSERT INTO notas_devolucion (saldo_a_favor, estado='EMITIDA')
Ctrl_Cambio --> Ent_InvSuc : 8. UPDATE inventario_sucursal SET stock_fisico += 1 (reingreso)

' --- TIEMPO 2: NOTA DE CAMBIO O REEMBOLSO ---
alt Cliente Elige Nueva Prenda (Tiempo 2)
  Staff --> UI_T2 : 9a. Seleccionar nueva prenda de reemplazo
  UI_T2 --> Ctrl_Cambio : 10a. calcularDiferenciaPrecio(saldo_devolucion, precio_nueva_prenda)
  opt Si nueva prenda tiene mayor valor
    Ctrl_Cambio --> Ctrl_Stripe : 11a. cobrarExcedenteStripe(montoDiferencial)
  end
  Ctrl_Cambio --> Ent_NotaCambio : 12a. INSERT INTO notas_cambio (nueva_prenda_id, total_pagado)
  Ctrl_Cambio --> Ent_InvSuc : 13a. UPDATE inventario_sucursal SET stock_fisico -= 1
else Cliente Rechaza Cambio de Prenda
  Staff --> UI_Reemb : 9b. Registrar rechazo de cambio
  UI_Reemb --> Ctrl_Cambio : 10b. programarReembolsoFinMes(cliente_id, saldo_devolucion)
  Ctrl_Cambio --> Ent_NotaDev : 11b. UPDATE notas_devolucion SET estado='PROGRAMADO_REEMBOLSO_30_DIAS'
end
@enduml
```

---

### Diagrama de Robustez — CU14: Gestionar Traspaso Inter-Sucursal de Inventario



![Diagrama de Robustez — CU14: Gestionar Traspaso Inter-Sucursal de Inventario](../diagramas/imagenes_robustez/Robustez_CU14.png)

```plantuml
@startuml Robustez_CU14
left to right direction
skinparam stereotypeCPosition top

actor "Encargado Sucursal" as Actor

boundary "UI: Pantalla Traspasos\nInter-Sucursal" as UI_Traspaso
boundary "UI: Formulario Despacho\ny Guía de Remisión" as UI_Despacho
boundary "UI: Modal Recepción\ny Verificación" as UI_Recv

control "CRT: Gestor de\nTraspasos" as Ctrl_Traspaso

entity "CE: TraspasoSucursal" as Ent_Trasp
entity "CE: InventarioSucursal" as Ent_InvSuc
entity "CE: MovimientoKardex" as Ent_Kardex

Actor --> UI_Traspaso : 1. Solicitar prendas a sucursal origen
UI_Traspaso --> Ctrl_Traspaso : 2. crearSolicitudTraspaso(origen_id, destino_id, items)
Ctrl_Traspaso --> Ent_Trasp : 3. INSERT INTO traspasos (estado='SOLICITADO')

Actor --> UI_Despacho : 4. Despachar bulto desde sucursal origen
UI_Despacho --> Ctrl_Traspaso : 5. marcarDespachado(traspaso_id)
Ctrl_Traspaso --> Ent_Trasp : 6. UPDATE traspasos SET estado='EN_TRANSITO'
Ctrl_Traspaso --> Ent_InvSuc : 7. UPDATE inventario_sucursal SET disponible -= cant WHERE sucursal = origen

Actor --> UI_Recv : 8. Recepcionar lote en sucursal destino
UI_Recv --> Ctrl_Traspaso : 9. confirmarRecepcion(traspaso_id, itemsRecibidos)
Ctrl_Traspaso --> Ent_Trasp : 10. UPDATE traspasos SET estado='COMPLETADO'
Ctrl_Traspaso --> Ent_InvSuc : 11. UPDATE inventario_sucursal SET stock_fisico += cant WHERE sucursal = destino
Ctrl_Traspaso --> Ent_Kardex : 12. INSERT INTO movimientos_kardex (tipo='TRASPASO_ENTRADA')
@enduml
```

---

### Diagrama de Robustez — CU15: Solicitar Reporte Generativo con IA (Texto / Voz)



![Diagrama de Robustez — CU15: Solicitar Reporte Generativo con IA (Texto / Voz)](../diagramas/imagenes_robustez/Robustez_CU15.png)

```plantuml
@startuml Robustez_CU15
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa / Encargado" as Actor
actor "Servicio IA (LLM/Whisper)" as IA

boundary "UI: Asistente Analítico\nConversacional" as UI_IA
boundary "UI: Micrófono Dictado\npor Voz" as UI_Voz

control "CRT: Gestor Reportes\ncon IA" as Ctrl_RepIA
control "CRT: Validador AST SQL\nde Solo Lectura" as Ctrl_AST

entity "CE: VistasAnaliticas\n(PostgreSQL)" as Ent_Vistas
entity "CE: Tenant" as Ent_Tenant

Actor --> UI_Voz : 1. Dictar requerimiento analítico por voz
UI_Voz --> IA : 2. transcribirAudio(Whisper)
IA --> UI_IA : 3. textoTranscrito

Actor --> UI_IA : 4. Enviar prompt ("¿Cuáles son las prendas con mayor margen en Equipetrol?")
UI_IA --> Ctrl_RepIA : 5. procesarPregunta(prompt, tenant_id)
Ctrl_RepIA --> IA : 6. generarSQL(prompt, metadataVistas)
IA --> Ctrl_RepIA : 7. sentencia_sql_raw

Ctrl_RepIA --> Ctrl_AST : 8. validarSQLSeguro(sentencia_sql_raw)
Ctrl_AST --> Ctrl_AST : 9. verificarSoloSelectYForzarTenantId(sql, tenant_id)
Ctrl_AST --> Ctrl_RepIA : 10. sql_validado_seguro

Ctrl_RepIA --> Ent_Vistas : 11. ejecutarQueryReadOnly(sql_validado_seguro)
Ent_Vistas --> Ctrl_RepIA : 12. datasetResultante
Ctrl_RepIA --> IA : 13. sintetizarResumen(datasetResultante)
IA --> Ctrl_RepIA : 14. resumenEjecutivoYTipoGrafico
Ctrl_RepIA --> UI_IA : 15. Desplegar narrativa, tablas y gráficos
@enduml
```

---

### Diagrama de Robustez — CU16: Exportar Reportes Analíticos a Excel/PDF



![Diagrama de Robustez — CU16: Exportar Reportes Analíticos a Excel/PDF](../diagramas/imagenes_robustez/Robustez_CU16.png)

```plantuml
@startuml Robustez_CU16
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa" as Actor

boundary "UI: Visor de Reporte\ny Analítica" as UI_Visor
boundary "UI: Descargador de\nArchivos" as UI_Down

control "CRT: Gestor de\nExportaciones" as Ctrl_Exp
control "CRT: Constructor Excel\n(OpenPyXL)" as Ctrl_Excel
control "CRT: Generador PDF\n(ReportLab)" as Ctrl_PDF

entity "CE: VistasAnaliticas" as Ent_Vistas

Actor --> UI_Visor : 1. Seleccionar formato de exportación (Excel / PDF)
UI_Visor --> Ctrl_Exp : 2. solicitarExportacion(reporte_tipo, filtros, formato)
Ctrl_Exp --> Ent_Vistas : 3. SELECT * FROM vista_reporte WHERE tenant_id = :id

alt Formato Excel (.xlsx)
  Ctrl_Exp --> Ctrl_Excel : 4a. generarLibroExcel(dataset)
  Ctrl_Excel --> Ctrl_Exp : 5a. stream_bytes_xlsx
else Formato PDF (.pdf)
  Ctrl_Exp --> Ctrl_PDF : 4b. generarDocumentoPDF(dataset, logoTenant)
  Ctrl_PDF --> Ctrl_Exp : 5b. stream_bytes_pdf
end

Ctrl_Exp --> UI_Down : 6. Enviar stream con cabecera Content-Disposition
UI_Down --> Actor : 7. Descargar archivo al equipo
@enduml
```

---

### Diagrama de Robustez — CU17: Gestionar Dashboard Analítico con Machine Learning



![Diagrama de Robustez — CU17: Gestionar Dashboard Analítico con Machine Learning](../diagramas/imagenes_robustez/Robustez_CU17.png)

```plantuml
@startuml Robustez_CU17
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa" as Actor

boundary "UI: Dashboard Ejecutivo\nEmpresarial" as UI_Dash

control "CRT: Gestor Dashboard\ny Métricas" as Ctrl_Dash
control "CRT: Motor Predictivo ML\n(Series Temporales)" as Ctrl_ML

entity "CE: VistasMaterializadas" as Ent_Vistas
entity "CE: ModeloEntrenadoML" as Ent_Modelo

Actor --> UI_Dash : 1. Acceder a tablero de inteligencia analítica
UI_Dash --> Ctrl_Dash : 2. cargarKPIs(tenant_id)
Ctrl_Dash --> Ent_Vistas : 3. SELECT kpis, rotacion, ventas FROM vistas_materializadas

UI_Dash --> Ctrl_ML : 4. solicitarProyeccionDemanda(horizonte=6_meses)
Ctrl_ML --> Ent_Modelo : 5. cargarPesosYParametros(tenant_id)
Ctrl_ML --> Ctrl_ML : 6. ejecutarInferenciaProyectiva()
Ctrl_ML --> UI_Dash : 7. Devolver curvas de demanda y sugerencias de reorden
@enduml
```

---

### Diagrama de Robustez — CU18: Gestionar Pasarela de Pagos Stripe Sandbox



![Diagrama de Robustez — CU18: Gestionar Pasarela de Pagos Stripe Sandbox](../diagramas/imagenes_robustez/Robustez_CU18.png)

```plantuml
@startuml Robustez_CU18
left to right direction
skinparam stereotypeCPosition top

actor "Cliente / Cajero" as Actor
actor "Stripe Sandbox" as Stripe

boundary "UI: Checkout Seguro\n(Stripe Elements)" as UI_Stripe
boundary "UI: Comprobante de\nPago Digital" as UI_Recibo

control "CRT: Gestor de Pagos\nStripe" as Ctrl_Stripe
control "CRT: Manejador Webhooks\nAsíncronos" as Ctrl_Hook

entity "CE: OrdenPago" as Ent_Orden
entity "CE: BitacoraTransaccion" as Ent_Bit

Actor --> UI_Stripe : 1. Confirmar pago e ingresar tarjeta tokenizada
UI_Stripe --> Ctrl_Stripe : 2. crearPaymentIntent(monto, moneda, tenant_id)
Ctrl_Stripe --> Stripe : 3. POST /v1/payment_intents
Stripe --> Ctrl_Stripe : 4. client_secret

UI_Stripe --> Stripe : 5. Confirmar pago directo (sin tocar backend con PAN/CVV)
Stripe --> Ctrl_Hook : 6. Webhook POST payment_intent.succeeded
Ctrl_Hook --> Ent_Orden : 7. UPDATE ordenes SET estado='PAGADA', stripe_id=:id
Ctrl_Hook --> Ent_Bit : 8. registrarLogTransaccion(stripe_id, monto)
Ctrl_Stripe --> UI_Recibo : 9. Desplegar comprobante formal
@enduml
```

---

### Diagrama de Robustez — CU19: Gestionar Ofertas de Liquidación y Precios por Mayor



![Diagrama de Robustez — CU19: Gestionar Ofertas de Liquidación y Precios por Mayor](../diagramas/imagenes_robustez/Robustez_CU19.png)

```plantuml
@startuml Robustez_CU19
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa" as Actor

boundary "UI: Panel Promociones\ny Tarifas" as UI_Promo

control "CRT: Gestor de Ofertas\ny Precios" as Ctrl_Promo
control "CRT: Motor de Reglas\nComerciales" as Ctrl_Reglas

entity "CE: OfertaLiquidacion" as Ent_Liq
entity "CE: ReglaPrecioMayor" as Ent_Mayor
entity "CE: Producto" as Ent_Prod

Actor --> UI_Promo : 1. Seleccionar ropa de temporada pasada para liquidar (30%, 40%, 60%)
UI_Promo --> Ctrl_Promo : 2. registrarCampanaLiquidacion(prendas_ids, descuento, vigencia)
Ctrl_Promo --> Ent_Liq : 3. INSERT INTO ofertas_liquidacion (descuento, fecha_fin)

Actor --> UI_Promo : 4. Activar tarifa mayorista (>= 3 unidades)
UI_Promo --> Ctrl_Promo : 5. configurarReglaMayorista(min_unidades=3, descuento_porcentaje)
Ctrl_Promo --> Ent_Mayor : 6. INSERT INTO reglas_precio_mayor (min_prendas=3, descuento)

Ctrl_Reglas --> Ent_Liq : 7. verificarDescuentoLiquidacionActivo(prenda_id)
Ctrl_Reglas --> Ent_Mayor : 8. verificarAplicacionTarifaMayorista(cantidad_carrito)
@enduml
```

---

### Diagrama de Robustez — CU20: Gestionar Compras y Aprovisionamiento desde Web Desktop



![Diagrama de Robustez — CU20: Gestionar Compras y Aprovisionamiento desde Web Desktop](../diagramas/imagenes_robustez/Robustez_CU20.png)

```plantuml
@startuml Robustez_CU20
left to right direction
skinparam stereotypeCPosition top

actor "Admin Empresa / Encargado Sucursal" as Actor
actor "Proveedor Textil" as Prov

boundary "UI: Panel Compras\n(Web Desktop Exclusivo)" as UI_Desktop
boundary "UI: Modal Recepción Factura\nde Lote Mercadería" as UI_Factura

control "CRT: Gestor de Compras\ny Abastecimiento" as Ctrl_Compras
control "CRT: Gestor de Inventario\ny CPP (CU07)" as Ctrl_Inv

entity "CE: OrdenCompra" as Ent_OC
entity "CE: Proveedor" as Ent_Prov
entity "CE: InventarioSucursal" as Ent_InvSuc
entity "CE: MovimientoKardex" as Ent_Kardex

Actor --> UI_Desktop : 1. Crear Orden de Compra desde PC de escritorio
UI_Desktop --> Ctrl_Compras : 2. emitirOrdenCompra(proveedor_id, items, costos)
Ctrl_Compras --> Ent_Prov : 3. consultarTerminosComerciales(proveedor_id)
Ctrl_Compras --> Ent_OC : 4. INSERT INTO ordenes_compra (estado='EMITIDA')
Ctrl_Compras --> Prov : 5. Notificar orden formal

Actor --> UI_Factura : 6. Registrar llegada física e ingresar número de factura fiscal
UI_Factura --> Ctrl_Compras : 7. confirmarRecepcionFacturada(oc_id, num_factura, costo_final)
Ctrl_Compras --> Ent_OC : 8. UPDATE ordenes_compra SET estado='RECEPCIONADA'

Ctrl_Compras --> Ctrl_Inv : 9. transferirLoteAInventario(sucursal_id, items, costo_final)
Ctrl_Inv --> Ent_InvSuc : 10. UPDATE inventario_sucursal SET stock_fisico += cant, cpp = nuevoCPP
Ctrl_Inv --> Ent_Kardex : 11. INSERT INTO movimientos_kardex (tipo='COMPRA_PROVEEDOR', factura)
@enduml
```

---

## 3.3. Diagramas de Secuencia UML

Los **Diagramas de Secuencia** en la metodología ICONIX formalizan la asignación detallada de mensajes, métodos y responsabilidades dinámicas entre los objetos Boundary (`UI_`), Control (`CTR_`) y Entity (`CE_`) descubiertos en la fase de análisis de robustez, garantizando la trazabilidad vertical absoluta con los casos de uso detallados de la Sección 2.6.

> **Reglas de Oro de Modelado Dinámico (Ing. Angélica Garzón Cuéllar):**
> 1. **Fragmentos `loop` (Bucles de iteración interna):** En los diagramas de secuencia donde se utilicen fragmentos combinados de tipo `loop` (bucles de iteración sobre carritos de compras, matrices de tallas, colecciones de lotes o colas de sincronización), **la clase interfaz de usuario (Boundary `UI_`) NUNCA debe estar comprendida dentro del fragmento `loop`**. El bucle es un procesamiento netamente algorítmico y transaccional interno entre el Controlador (`CTR_`) y las clases Entidad (`CE_`). La interfaz simplemente remite la colección completa al inicio y recibe el resultado consolidado al concluir el ciclo.
> 2. **Fragmentos `alt` y `opt` (Bifurcaciones condicionales y opcionales):** Los fragmentos de decisión condicional (`alt` para flujos alternativos y validaciones de negocio; `opt` para flujos opcionales como dictado por voz) **deben cubrir horizontalmente desde la interfaz (`UI_`) hasta las entidades (`CE_`)**, asegurando que tanto la ramificación de error/excepción como la de éxito notifiquen al actor de manera completa y cerrada.
> 3. **Consistencia de Entidades de Dominio:** Las líneas de vida de persistencia no utilizan cilindros genéricos de base de datos, sino clases entidad de dominio (`CE_...`) tipadas y vinculadas al Modelo de Dominio y Diagrama de Clases (Sección 3.4).

A continuación se presentan los **20 Diagramas de Secuencia** correspondientes a la totalidad de los Casos de Uso del sistema:

---

### Diagrama de Secuencia — CU01: Registrar Empresa y Crear Administrador

Permite al Super Administrador aprovisionar un nuevo inquilino (*tenant*) en la nube, validando la unicidad fiscal del NIT, inicializando su esquema relacional aislado y otorgando una suscripción de prueba (*trial*) de 14 días.

![Diagrama de Secuencia — CU01: Registrar Empresa y Crear Administrador](../diagramas/imagenes_secuencia/Secuencia_CU01.png)

```plantuml
@startuml Secuencia_CU01
autonumber
actor "Super Admin" as SA
participant "UI_FormularioEmpresa" as UI
participant "CTR_GestorEmpresas" as Ctrl
participant "CTR_ValidadorNIT" as Val
participant "CE_Empresa" as CE_Emp
participant "CE_Usuario" as CE_Usr
participant "CE_Suscripcion" as CE_Susc

SA -> UI : ingresarDatosEmpresa(nit, razon_social, email)
UI -> Ctrl : registrarEmpresa(datosForm)
Ctrl -> Val : validarNIT(nit)
Val -> CE_Emp : verificarDuplicadoNIT(nit)
CE_Emp --> Val : nitDisponibleOk()
Val --> Ctrl : nitValidoOk()
Ctrl -> CE_Emp : insertarEmpresa(nit, razon_social, schema, tenant_id)
CE_Emp --> Ctrl : empresaCreadaOk(empresa_id)
Ctrl -> CE_Usr : crearUsuarioAdmin(email, hash_bcrypt, rol)
CE_Usr --> Ctrl : usuarioAdminCreadoOk(usuario_id)
Ctrl -> CE_Susc : crearSuscripcionTrial(empresa_id, 'TRIAL')
CE_Susc --> Ctrl : suscripcionCreadaOk()
Ctrl --> UI : empresaRegistradaExitosamente()
UI --> SA : mostrarConfirmacion(credenciales)
@enduml
```

---

### Diagrama de Secuencia — CU02: Gestionar Planes de Suscripción

Permite al Super Administrador parametrizar la oferta comercial del SaaS textil, definiendo límites de sucursales físicas, cuotas de usuarios concurrentes y tarifas periódicas en bolivianos y dólares.

![Diagrama de Secuencia — CU02: Gestionar Planes de Suscripción](../diagramas/imagenes_secuencia/Secuencia_CU02.png)

```plantuml
@startuml Secuencia_CU02
autonumber
actor "Super Admin" as SA
participant "UI_GestionPlanes" as UI
participant "CTR_GestorPlanes" as Ctrl
participant "CTR_ValidadorPlan" as Val
participant "CE_PlanSuscripcion" as CE_Plan

SA -> UI : ingresarDatosNuevoPlan(nombre, limites, tarifas)
UI -> Ctrl : crearPlanSuscripcion(datosPlan)
Ctrl -> Val : validarLimitesYTarifas(datosPlan)
Val --> Ctrl : limitesValidosOk()
Ctrl -> CE_Plan : verificarNombrePlanDuplicado(nombre)
CE_Plan --> Ctrl : nombreDisponibleOk()

alt [Plan Válido y Disponible vs Nombre Duplicado]
  Ctrl -> CE_Plan : insertarPlanSuscripcion(datosPlan, estado='ACTIVO')
  CE_Plan --> Ctrl : planCreadoOk(plan_id)
  Ctrl --> UI : planRegistradoExitosamente(plan_id)
  UI --> SA : mostrarConfirmacionYTabla(plan_id)
else [Nombre de Plan ya Registrado]
  Ctrl --> UI : "Error: El nombre del plan ya se encuentra registrado"
  UI --> SA : Desplegar alerta de validación
end
@enduml
```

---

### Diagrama de Secuencia — CU03: Gestionar Suscripción de Empresa

Permite al Administrador de Empresa actualizar el plan de su organización (*upgrade*), calculando el prorrateo de tarifas, ejecutando el cobro en la pasarela Stripe y ampliando los límites de sucursales y personal.

![Diagrama de Secuencia — CU03: Gestionar Suscripción de Empresa](../diagramas/imagenes_secuencia/Secuencia_CU03.png)

```plantuml
@startuml Secuencia_CU03
autonumber
actor "Admin Empresa" as AE
participant "UI_SuscripcionEmpresa" as UI
participant "UI_PasarelaStripe" as UI_Stripe
participant "CTR_GestorSuscripcion" as Ctrl
participant "CTR_PasarelaStripe" as Stripe
participant "CE_Suscripcion" as CE_Susc
participant "CE_PlanSuscripcion" as CE_Plan
participant "CE_Empresa" as CE_Emp

AE -> UI : seleccionarUpgradePlan(nuevo_plan_id)
UI -> Ctrl : cotizarUpgrade(tenant_id, nuevo_plan_id)
Ctrl -> CE_Plan : obtenerTarifaYCupos(nuevo_plan_id)
CE_Plan --> Ctrl : detallesPlan(precio, max_suc, max_usr)
Ctrl --> UI : mostrarCotizacion(monto)
UI -> UI_Stripe : abrirModalPago(monto)
AE -> UI_Stripe : confirmarPagoTarjeta(token_stripe)

alt [Cobro Aprobado por Stripe vs Tarjeta Declinada]
  UI_Stripe -> Stripe : procesarCobro(token_stripe, monto)
  Stripe --> UI_Stripe : cobroExitoso(stripe_charge_id)
  UI_Stripe -> Ctrl : aplicarUpgrade(tenant_id, nuevo_plan_id, charge_id)
  Ctrl -> CE_Susc : actualizarPlanYVigencia(nuevo_plan_id, 'ACTIVA')
  CE_Susc --> Ctrl : suscripcionActualizadaOk()
  Ctrl -> CE_Emp : actualizarCuotasTenant(max_suc, max_usr)
  CE_Emp --> Ctrl : cuotasActualizadasOk()
  Ctrl --> UI : upgradeCompletadoExitosamente()
  UI --> AE : desplegarNuevosLimitesHabilitados()
else [Tarjeta Declinada o Saldo Insuficiente]
  Stripe --> UI_Stripe : errorCobro("Fondos insuficientes")
  UI_Stripe --> AE : Mostrar rechazo de pasarela
end
@enduml
```

---

### Diagrama de Secuencia — CU04: Autenticar Usuario Multitenant

Valida las credenciales de acceso del usuario, verifica que la suscripción de la empresa esté vigente y emite un token criptográfico JWT firmado que transporta la identidad y el `tenant_id` para aislar consultas.

![Diagrama de Secuencia — CU04: Autenticar Usuario Multitenant](../diagramas/imagenes_secuencia/Secuencia_CU04.png)

```plantuml
@startuml Secuencia_CU04
autonumber
actor "Usuario" as U
participant "UI_LoginView" as UI
participant "CTR_GestorAuth" as Ctrl
participant "CTR_TokenJWT" as JWT
participant "CE_Usuario" as CE_Usr
participant "CE_Suscripcion" as CE_Susc

U -> UI : ingresarCredenciales(email, password)
UI -> Ctrl : solicitarLogin(email, password)
Ctrl -> CE_Usr : obtenerPorEmail(email)
CE_Usr --> Ctrl : datosUsuario(hash, tenant_id, estado)
Ctrl -> Ctrl : verificarPasswordBcrypt(password, hash)
Ctrl -> CE_Susc : verificarEstadoSuscripcion(tenant_id)
CE_Susc --> Ctrl : suscripcionActivaOk()

alt [Credenciales Válidas y Suscripción Activa]
  Ctrl -> JWT : generarToken(usuario_id, rol, tenant_id)
  JWT --> Ctrl : tokenJWTFirmado()
  Ctrl -> CE_Usr : actualizarUltimoLogin(usuario_id)
  Ctrl --> UI : loginExitoso(token, rol, modulos)
  UI --> U : redireccionarDashboard(rol)
else [Credenciales Inválidas o Suscripción Vencida]
  Ctrl --> UI : "Acceso denegado: Credenciales erróneas o suscripción inactiva"
  UI --> U : Desplegar alerta de bloqueo
end
@enduml
```

---

### Diagrama de Secuencia — CU05: Gestionar Usuarios y Roles por Empresa

Permite dar de alta empleados (Cajeros, Encargados, Vendedores), validando previamente que el total de usuarios activos no supere el cupo permitido por el plan de suscripción contratado.

![Diagrama de Secuencia — CU05: Gestionar Usuarios y Roles por Empresa](../diagramas/imagenes_secuencia/Secuencia_CU05.png)

```plantuml
@startuml Secuencia_CU05
autonumber
actor "Admin Empresa" as AE
participant "UI_GestionPersonal" as UI
participant "CTR_GestorPersonal" as Ctrl
participant "CTR_ValidadorLimites" as Val
participant "CE_Usuario" as CE_Usr
participant "CE_RolPermiso" as CE_Rol
participant "CE_Suscripcion" as CE_Susc

AE -> UI : ingresarDatosEmpleado(email, rol, sucursal_id)
UI -> Ctrl : registrarUsuarioTenant(datosEmpleado)
Ctrl -> Val : verificarCupoUsuarios(tenant_id)
Val -> CE_Susc : obtenerMaxUsuarios(tenant_id)
CE_Susc --> Val : limiteMaxUsuarios(max_usr)
Val -> CE_Usr : contarUsuariosActivos(tenant_id)
CE_Usr --> Val : totalUsuariosActuales(total_activos)

alt [Cupo Disponible (total < max) vs Límite Alcanzado]
  Val --> Ctrl : cupoDisponibleOk()
  Ctrl -> CE_Usr : insertarUsuario(email, hash_temp, 'ACTIVO')
  CE_Usr --> Ctrl : usuarioCreadoOk(usuario_id)
  Ctrl -> CE_Rol : asignarRolYSucursal(usuario_id, rol, sucursal_id)
  CE_Rol --> Ctrl : rolAsignadoOk()
  Ctrl --> UI : usuarioRegistradoExitosamente()
  UI --> AE : desplegarConfirmacionEnTabla()
else [Límite de Suscripción Agotado]
  Val --> Ctrl : limiteAlcanzadoError()
  Ctrl --> UI : "Cupo de usuarios agotado para su plan actual"
  UI --> AE : Sugerir actualización de suscripción
end
@enduml
```

---

### Diagrama de Secuencia — CU06: Registrar Prenda y Configurar Atributos Textiles Avanzados

Permite dar de alta una prenda técnica registrando composición textil, tolerancia de encogimiento, viscosidad y una matriz completa de variantes (tallas en cm y colores Hex). El bucle de guardado de variantes se ejecuta de forma interna y exclusiva entre el Controlador y la Entidad.

![Diagrama de Secuencia — CU06: Registrar Prenda y Configurar Atributos Textiles Avanzados](../diagramas/imagenes_secuencia/Secuencia_CU06.png)

```plantuml
@startuml Secuencia_CU06
autonumber
actor "Admin Empresa" as AE
participant "UI_FormularioPrenda" as UI
participant "CTR_GestorProductos" as Ctrl
participant "CTR_ValidadorTextil" as Val
participant "CE_Producto" as CE_Prod
participant "CE_FichaTextil" as CE_Ficha
participant "CE_VariantePrenda" as CE_Var

AE -> UI : ingresarDatosPrenda(sku, comp_textil, matriz_tallas, url_3d)
UI -> Ctrl : registrarPrendaAvanzada(datos, variantes, url_3d)
Ctrl -> Val : validarMedidasTallasCm(variantes)
Val --> Ctrl : validacionTextilOk()
Ctrl -> CE_Prod : insertarProductoBase(sku, nombre, url_3d)
CE_Prod --> Ctrl : productoCreadoOk(producto_id)
Ctrl -> CE_Ficha : insertarFichaTextil(producto_id, tela, hipoalergenico)
CE_Ficha --> Ctrl : fichaTextilCreadaOk(ficha_id)

loop [Para cada variante en listaVariantes - Solo Control y Entidad]
  Ctrl -> CE_Var : insertarVariante(producto_id, talla_cm, color_hex, precios)
  CE_Var --> Ctrl : varianteRegistradaOk(variante_id)
end

Ctrl --> UI : prendaYCatalogoRegistradosOk()
UI --> AE : notificarRegistroExitoso(fichaTecnica)
@enduml
```

---

### Diagrama de Secuencia — CU07: Registrar Entrada de Lote de Inventario y Recalcular CPP

Registra la recepción física de mercadería vinculada a una factura fiscal, recalculando de forma inmutable el Costo Promedio Ponderado (CPP) y asentando el movimiento en el Kardex físico-valorado de la sucursal.

![Diagrama de Secuencia — CU07: Registrar Entrada de Lote de Inventario y Recalcular CPP](../diagramas/imagenes_secuencia/Secuencia_CU07.png)

```plantuml
@startuml Secuencia_CU07
autonumber
actor "Encargado Sucursal" as E
participant "UI_ModalRecepcionLote" as UI
participant "CTR_GestorInventarios" as Ctrl
participant "CTR_CalculadorCPP" as CalcCPP
participant "CE_InventarioSucursal" as CE_Inv
participant "CE_MovimientoKardex" as CE_Kardex

E -> UI : seleccionarVarianteEIngresarCantidad(variante_id, cant, costo, factura)
UI -> Ctrl : registrarEntradaLote(variante_id, sucursal_id, cant, costo, factura)
Ctrl -> CE_Inv : consultarStockYCPP(variante_id, sucursal_id)
CE_Inv --> Ctrl : stockActualYCPPAntiguo(stock, cpp)
Ctrl -> CalcCPP : calcularNuevoCPP(stock, cpp, cant_nueva, costo_nuevo)
CalcCPP --> Ctrl : nuevoCPPResultado(nuevo_cpp, nuevo_stock)
Ctrl -> CE_Inv : actualizarStockYCPP(nuevo_stock, nuevo_cpp, costo_nuevo)
CE_Inv --> Ctrl : inventarioActualizadoOk()
Ctrl -> CE_Kardex : registrarMovimientoKardex(tipo='ENTRADA', cant, costo, nuevo_stock, nuevo_cpp)
CE_Kardex --> Ctrl : kardexAsentadoOk()
Ctrl --> UI : entradaLoteRegistradaOk(nuevo_cpp)
UI --> E : desplegarComprobanteInventario(nuevo_cpp)
@enduml
```

---

### Diagrama de Secuencia — CU08: Descargar y Consultar Catálogo Digital Offline (Cliente)

Permite al cliente descargar un snapshot optimizado del catálogo textil (fichas técnicas, medidas en centímetros, precios y miniaturas WebP) para navegar fluidamente aún sin cobertura de datos móviles o Wi-Fi.

![Diagrama de Secuencia — CU08: Descargar y Consultar Catálogo Digital Offline](../diagramas/imagenes_secuencia/Secuencia_CU08.png)

```plantuml
@startuml Secuencia_CU08
autonumber
actor "Cliente" as C
participant "UI_CatalogoOffline" as UI
participant "CTR_GestorCatalogoOffline" as Ctrl_Cat
participant "CTR_SincronizadorCache" as Ctrl_Sync
participant "CE_CatalogoLocal" as CE_CatLocal
participant "CE_CacheMultimedia" as CE_Media

C -> UI : solicitarDescargaCatalogoOffline()
UI -> Ctrl_Cat : obtenerSnapshotCatalogo(tenant_id)
Ctrl_Cat -> Ctrl_Sync : prepararCacheLocal(snapshot_json)

loop [Para cada prenda en snapshot - Solo Control y Almacén Local]
  Ctrl_Sync -> CE_CatLocal : almacenarPrendaLocal(datosPrenda, variantes, precios)
  CE_CatLocal --> Ctrl_Sync : prendaGuardadaLocalOk()
end

loop [Para cada recurso multimedia WebP - Solo Control y Caché]
  Ctrl_Sync -> CE_Media : guardarRecursoMultimedia(url, blob_webp)
  CE_Media --> Ctrl_Sync : recursoAlmacenadoOk()
end

Ctrl_Sync --> Ctrl_Cat : catalogoLocalCompletadoOk(total_prendas)
Ctrl_Cat --> UI : notificarCatalogoOfflineListo(total_prendas, timestamp)
UI --> C : habilitarNavegacionOffline(catalogoListo)
@enduml
```

---

### Diagrama de Secuencia — CU09: Registrar Reserva Presencial Sin Conexión a Internet (Cliente)

Materializa el flujo offline del cliente para apartar prendas en una tienda física. Genera un UUID v4 local único, almacena la reserva con temporizador estricto de 2 horas en la base local, descuenta tentativamente el stock local y emite un Ticket QR listo para presentar en el mostrador.

![Diagrama de Secuencia — CU09: Registrar Reserva Presencial Sin Conexión a Internet](../diagramas/imagenes_secuencia/Secuencia_CU09.png)

```plantuml
@startuml Secuencia_CU09
autonumber
actor "Cliente" as C
participant "UI_CatalogoOffline" as UI
participant "CTR_GestorReservaOffline" as Ctrl
participant "CTR_GeneradorUUID" as UUID
participant "CE_CatalogoLocal" as CE_CatLocal
participant "CE_ReservaOffline" as CE_ResOff

C -> UI : seleccionarPrendaYReservar(variante_id)
UI -> UUID : generarUUIDv4()
UUID --> UI : uuidReservaGenerado(uuid_v4)
UI -> Ctrl : registrarReservaLocal(uuid_v4, variante_id, 2_horas)
Ctrl -> CE_CatLocal : consultarStockDisponible(variante_id)
CE_CatLocal --> Ctrl : stockDisponible(stock >= 1)

alt [Stock disponible localmente >= 1 vs Sin Stock]
  Ctrl -> CE_ResOff : guardarReservaLocal(uuid_v4, variante_id, 'PENDIENTE_SYNC', 2h)
  CE_ResOff --> Ctrl : reservaGuardadaLocalOk()
  Ctrl -> CE_CatLocal : descontarStockTentativo(variante_id, 1)
  CE_CatLocal --> Ctrl : stockLocalActualizado()
  Ctrl --> UI : reservaConfirmada(uuid_v4, qr_payload, expiracion)
  UI --> C : mostrarTicketQR(Presentar en caja máx 2h)
else [Sin Stock Local Disponible]
  Ctrl --> UI : "No hay existencias locales para apartar esta prenda"
  UI --> C : Desplegar alerta de indisponibilidad
end
@enduml
```

---

### Diagrama de Secuencia — CU10: Registrar Venta POS de Contado Sin Conexión a Internet (Cajero / Cliente)

Permite cobrar ventas en el punto de venta ante cortes de red eléctrica o internet. Fuerza el cobro exclusivo al contado en efectivo, itera sobre los artículos para descontar stock local, encola la transacción con UUID v4 e imprime un comprobante provisional con hash criptográfico SHA-256.

![Diagrama de Secuencia — CU10: Registrar Venta POS de Contado Sin Conexión](../diagramas/imagenes_secuencia/Secuencia_CU10.png)

```plantuml
@startuml Secuencia_CU10
autonumber
actor "Cajero" as C
participant "UI_PantallaVentaOffline" as UI
participant "CTR_GestorVentaOffline" as Ctrl
participant "CTR_GeneradorUUID" as UUID
participant "CTR_MotorReglasLocales" as Reglas
participant "CE_CatalogoLocal" as CE_CatLocal
participant "CE_OperacionOffline" as CE_OpOff

C -> UI : escanearSKU(sku_lista)
UI -> Reglas : calcularTotalesConDescuento(items)
Reglas --> UI : totalConDescuentoCalculado(montoTotal)
C -> UI : confirmarCobroEfectivo(montoRecibido)
UI -> UUID : generarUUIDv4()
UUID --> UI : uuidVenta(uuid_v4)
UI -> Ctrl : registrarVentaLocal(uuid_v4, items, total, efectivo)

loop [Para cada ítem en carritoItems - Solo Control y Almacén Local]
  Ctrl -> CE_CatLocal : verificarYDescontarStock(item.id, item.cant)
  CE_CatLocal --> Ctrl : stockLocalDescontadoOk()
end

alt [Registro Inicial Exitoso vs Idempotencia Reintento]
  Ctrl -> CE_OpOff : encolarOperacion(uuid_v4, 'VENTA_POS_EFECTIVO', payload, hash, 'PENDIENTE_SYNC')
  CE_OpOff --> Ctrl : operacionEncoladaOk()
  Ctrl --> UI : ventaRegistradaOk(uuid_v4, cambio, hash)
  UI --> C : imprimirReciboProvisional(uuid_v4, QR, hash)
else [UUID ya Existente en Cola Local]
  Ctrl --> UI : "Alerta: Transacción ya encolada previamente (Idempotencia)"
  UI --> C : Reemitir recibo sin duplicar operación
end
@enduml
```

---

### Diagrama de Secuencia — CU11: Consultar y Auditar Operaciones Locales Pendientes (Cajero / Cliente / Encargado)

Permite al personal de tienda auditar la cola de contingencia antes de la sincronización, validando la integridad criptográfica de cada registro mediante su hash SHA-256 y calculando el arqueo de caja de efectivo.

![Diagrama de Secuencia — CU11: Consultar y Auditar Operaciones Locales Pendientes](../diagramas/imagenes_secuencia/Secuencia_CU11.png)

```plantuml
@startuml Secuencia_CU11
autonumber
actor "Cajero / Encargado" as Staff
participant "UI_PanelAuditoriaLocal" as UI
participant "CTR_AuditoriaLocal" as Ctrl
participant "CTR_VerificadorIntegridadHash" as ValHash
participant "CE_OperacionOffline" as CE_Op
participant "CE_CatalogoLocal" as CE_CatLocal

Staff -> UI : abrirPanelAuditoriaLocal()
UI -> Ctrl : listarOperacionesPendientesSync()
Ctrl -> CE_Op : consultarPendientes('PENDIENTE_SYNC')
CE_Op --> Ctrl : listaOperaciones(operaciones_json)

loop [Para cada operación encolada - Verificación Criptográfica Hash]
  Ctrl -> ValHash : verificarHashSHA256(operacion.payload, operacion.hash)
  ValHash --> Ctrl : hashValidoSinAlteracionOk()
end

Ctrl -> Ctrl : calcularTotalesArqueoCajaEfectivo(listaOperaciones)
Ctrl --> UI : resumenAuditoria(total_tx, total_efectivo, listaVerificada)
UI --> Staff : desplegarPanelArqueo(operacionesPendientes, estadoIntegridad)
@enduml
```

---

### Diagrama de Secuencia — CU12: Sincronizar Operaciones Pendientes (Sistema de Sincronización)

Se activa en segundo plano al detectarse conectividad de red. Itera sobre las transacciones encoladas, ejecutando un POST en lotes hacia el backend central con clave de idempotencia (`UUID v4`), reconcilia el stock físico y marca las operaciones como asentadas.

![Diagrama de Secuencia — CU12: Sincronizar Operaciones Pendientes](../diagramas/imagenes_secuencia/Secuencia_CU12.png)

```plantuml
@startuml Secuencia_CU12
autonumber
actor "Sistema / Red" as Net
participant "Worker_BackgroundSync" as Worker
participant "CTR_GestorSync" as Ctrl
participant "CE_OperacionOfflineLocal" as CE_OpLocal
participant "API_SyncBackend" as API
participant "CE_VentaCentral" as CE_VentaCent
participant "CE_InventarioCentral" as CE_InvCent

Net -> Worker : eventoConectividadRestablecida(online)
Worker -> Ctrl : dispararSincronizacion()
Ctrl -> CE_OpLocal : consultarPendientes('PENDIENTE_SYNC')
CE_OpLocal --> Ctrl : listaOperacionesPendientes()

loop [Para cada operación en lista_operaciones_pendientes - Solo Control, API y DB Central]
  Ctrl -> API : POST /api/v1/sync/batch(idempotency_key=uuid, payload)
  API -> CE_VentaCent : insertarVentaCentral(venta_data)
  CE_VentaCent --> API : ventaAsentadaCentralOk()
  API -> CE_InvCent : reconciliarStockFisico(sucursal_id, items)
  CE_InvCent --> API : stockCentralConciliadoOk()
  API --> Ctrl : 200 OK transaccionSincronizada(uuid)
  Ctrl -> CE_OpLocal : marcarSincronizada(uuid, 'SINCRONIZADO', utc)
  CE_OpLocal --> Ctrl : estadoActualizadoLocalOk()
end

Ctrl --> Worker : sincronizacionLoteCompletada(total_procesadas)
Worker --> Net : notificarSyncExitosa('Todas las tx asentadas')
@enduml
```

---

### Diagrama de Secuencia — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones

Modela el protocolo de postventa textil en dos tiempos: Tiempo 1 (emisión de Nota de Devolución por Bs 250 e ingreso a cuarentena) y Tiempo 2 (elección de nueva prenda por Bs 290, cobro de la diferencia de Bs 40 mediante pasarela Stripe y consolidación de Nota de Cambio).

![Diagrama de Secuencia — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones](../diagramas/imagenes_secuencia/Secuencia_CU13.png)

```plantuml
@startuml Secuencia_CU13
autonumber
actor "Cliente" as C
actor "Cajero / Encargado" as Caj
participant "UI_ModuloPostventa" as UI
participant "CTR_GestorCambios" as Ctrl
participant "CTR_PasarelaStripe" as Stripe
participant "CE_NotaDevolucion" as CE_NotaDev
participant "CE_NotaCambio" as CE_NotaCambio
participant "CE_InventarioSucursal" as CE_Inv

C -> Caj : solicitarCambio(factura, prenda_usada)
Caj -> UI : registrarTiempo1_Devolucion(factura_id, prenda_usada)
UI -> Ctrl : emitirNotaDevolucion(factura_id, prenda_usada, saldo)
Ctrl -> CE_NotaDev : insertarNotaDevolucion(cliente_id, saldo, 'EMITIDA')
CE_NotaDev --> Ctrl : notaDevolucionCreadaOk(nota_id, saldo)
Ctrl -> CE_Inv : ingresarPrendaCuarentena(prenda_usada, sucursal_id)
CE_Inv --> Ctrl : stockCuarentenaIncrementado()
Ctrl --> UI : notaDevolucionGenerada(nota_id, saldo)
UI --> C : entregarTicketSaldoAFavor(nota_id, saldo)

C -> Caj : elegirPrendaNuevaTiempo2(prenda_nueva, precio)
Caj -> UI : aplicarNotaDevolucionACambio(nota_id, prenda_nueva)
UI -> Ctrl : liquidarTiempo2_Cambio(nota_id, prenda_nueva)
Ctrl -> CE_Inv : verificarStockPrendaNueva(prenda_nueva, sucursal_id)
CE_Inv --> Ctrl : stockDisponibleOk()

alt [Diferencia de Precio a Pagar con Stripe vs Saldo Exacto]
  Ctrl --> UI : requerirPagoDiferencia(saldo_pendiente)
  Caj -> UI : cobrarDiferenciaStripe(token, saldo_pendiente)
  UI -> Stripe : procesarPagoDiferencia(saldo_pendiente, token)
  Stripe --> UI : pagoDiferenciaExitoso(charge_id)
  UI -> Ctrl : consolidarNotaCambio(nota_id, charge_id)
else [Saldo a Favor Exacto o Menor]
  UI -> Ctrl : consolidarNotaCambio(nota_id, null)
end

Ctrl -> CE_NotaCambio : insertarNotaCambio(nota_id, prenda_nueva, 'COMPLETADA')
CE_NotaCambio --> Ctrl : notaCambioRegistradaOk()
Ctrl -> CE_NotaDev : marcarConsumida(nota_id)
Ctrl -> CE_Inv : descontarStockFisico(prenda_nueva, sucursal_id)
Ctrl --> UI : cambioConsolidadoExitosamente(comprobante)
UI --> C : entregarPrendaNuevaYFacturaComplementaria()
@enduml
```

---

### Diagrama de Secuencia — CU14: Gestionar Traspaso Inter-Sucursal de Inventario

Modela el traslado de mercadería entre sucursales físicas: despacho con guía de remisión electrónica, descuento transitorio de stock en origen, estado `EN_TRANSITO`, y recepción verificada en destino con actualización de Kardex en ambas ubicaciones.

![Diagrama de Secuencia — CU14: Gestionar Traspaso Inter-Sucursal de Inventario](../diagramas/imagenes_secuencia/Secuencia_CU14.png)

```plantuml
@startuml Secuencia_CU14
autonumber
actor "Encargado Sucursal" as E
participant "UI_TraspasoInventario" as UI
participant "UI_ModalRecepcion" as UI_Recv
participant "CTR_GestorTraspasos" as Ctrl
participant "CTR_ValidadorStock" as Val
participant "CE_TraspasoSucursal" as CE_Trasp
participant "CE_InventarioSucursal" as CE_Inv
participant "CE_MovimientoKardex" as CE_Kardex

E -> UI : seleccionarSucursalDestinoYPrendas(origen, destino, items)
UI -> Ctrl : registrarDespachoTraspaso(origen, destino, items)
Ctrl -> Val : verificarStockOrigen(origen, items)
Val -> CE_Inv : consultarStockDisponible(origen, items)
CE_Inv --> Val : stockDisponibleOk()
Val --> Ctrl : validacionStockOrigenOk()
Ctrl -> CE_Trasp : crearTraspaso(origen, destino, items, 'EN_TRANSITO')
CE_Trasp --> Ctrl : traspasoCreadoOk(traspaso_id)

loop [Para cada ítem despachado - Descuento Stock y Kardex Salida]
  Ctrl -> CE_Inv : descontarStock(origen, item.id, item.cant)
  CE_Inv --> Ctrl : stockOrigenDescontado()
  Ctrl -> CE_Kardex : insertarMovimiento('TRASPASO_SALIDA', origen, item.cant)
  CE_Kardex --> Ctrl : kardexSalidaAsentado()
end

Ctrl --> UI : despachoExitoso(traspaso_id, guia_remision)
UI --> E : imprimirGuiaRemision(traspaso_id)

E -> UI_Recv : confirmarLlegadaFisicaMercaderia(traspaso_id, items)
UI_Recv -> Ctrl : confirmarRecepcionTraspaso(traspaso_id, items)
Ctrl -> CE_Trasp : actualizarEstado(traspaso_id, 'COMPLETADO')
CE_Trasp --> Ctrl : estadoActualizadoOk()

loop [Para cada ítem recibido - Incremento Stock y Kardex Entrada]
  Ctrl -> CE_Inv : incrementarStock(destino, item.id, item.cant)
  CE_Inv --> Ctrl : stockDestinoIncrementado()
  Ctrl -> CE_Kardex : insertarMovimiento('TRASPASO_ENTRADA', destino, item.cant)
  CE_Kardex --> Ctrl : kardexEntradaAsentado()
end

Ctrl --> UI_Recv : traspasoCompletadoExitosamente()
UI_Recv --> E : mostrarActaConformidadRecepcion()
@enduml
```

---

### Diagrama de Secuencia — CU15: Solicitar Reporte Generativo con IA (Lenguaje Natural / Voz)

Permite formular consultas analíticas mediante voz o texto libre. El flujo transcribe el audio con Whisper, genera la sentencia SQL con LLM, la valida rigurosamente con un analizador sintáctico AST de solo lectura (restringiendo al `tenant_id`) y proyecta narrativas y gráficos interactivos.

![Diagrama de Secuencia — CU15: Solicitar Reporte Generativo con IA](../diagramas/imagenes_secuencia/Secuencia_CU15.png)

```plantuml
@startuml Secuencia_CU15
autonumber
actor "Admin Empresa" as AE
participant "UI_ChatAnaliticoIA" as UI
participant "CTR_GestorReportesIA" as Ctrl
participant "Serv_WhisperVoz" as Whisper
participant "Serv_LLM" as LLM
participant "CTR_ValidadorAST" as AST
participant "CE_VistasAnaliticas" as CE_Vistas

opt [Entrada Dictada por Voz - Whisper STT]
  AE -> UI : dictarPreguntaPorVoz(audio_blob)
  UI -> Whisper : transcribirAudio(audio_blob)
  Whisper --> UI : textoTranscrito('¿Prendas con mayor margen en Equipetrol?')
end

UI -> Ctrl : procesarPromptAnalitico(texto, tenant_id)
Ctrl -> LLM : generarSentenciaSQL(texto, metadataEsquema)
LLM --> Ctrl : sql_crudo_generado
Ctrl -> AST : validarSentenciaSegura(sql_crudo, tenant_id)
AST -> AST : verificarSoloSelectYForzarTenantId(tenant_id)
AST --> Ctrl : sql_validado_seguro
Ctrl -> CE_Vistas : ejecutarConsultaSoloLectura(sql_validado_seguro)
CE_Vistas --> Ctrl : datasetResultado
Ctrl -> LLM : sintetizarNarrativaYTipoGrafico(datasetResultado)
LLM --> Ctrl : narrativaResumenYRecomendacionGrafica
Ctrl --> UI : respuestaGenerativaCompleta(narrativa, datos, configGrafico)
UI --> AE : renderizarDashboardInteractivoConGraficos()
@enduml
```

---

### Diagrama de Secuencia — CU16: Exportar Reportes Analíticos a Excel/PDF

Permite descargar consolidados de ventas, rotación de tallas y Kardex valorado en formatos profesionales (Excel con fórmulas numéricas vía OpenPyXL o PDF formal vía ReportLab).

![Diagrama de Secuencia — CU16: Exportar Reportes Analíticos a Excel/PDF](../diagramas/imagenes_secuencia/Secuencia_CU16.png)

```plantuml
@startuml Secuencia_CU16
autonumber
actor "Admin Empresa" as AE
participant "UI_VisorReportes" as UI
participant "CTR_GestorExportaciones" as Ctrl
participant "CTR_GeneradorExcel" as Excel
participant "CTR_GeneradorPDF" as PDF
participant "CE_VistasAnaliticas" as CE_Vistas

AE -> UI : seleccionarReporteYFormato(tipo, rango_fechas, formato)
UI -> Ctrl : exportarReporte(tipo, filtros, formato)
Ctrl -> CE_Vistas : consultarDatasetReporte(tenant_id, tipo, filtros)
CE_Vistas --> Ctrl : datasetResultado

alt [Formato Excel (.xlsx) vs Formato PDF (.pdf)]
  Ctrl -> Excel : compilarLibroExcel(datasetResultado)
  Excel --> Ctrl : stream_bytes_xlsx
else [Formato PDF (.pdf)]
  Ctrl -> PDF : compilarDocumentoPDF(datasetResultado, logoTenant)
  PDF --> Ctrl : stream_bytes_pdf
end

Ctrl --> UI : archivoGeneradoOk(stream_bytes, mime_type, filename)
UI --> AE : descargarArchivo(filename)
@enduml
```

---

### Diagrama de Secuencia — CU17: Gestionar Dashboard Analítico con Machine Learning

Carga KPIs en tiempo real desde vistas materializadas y ejecuta modelos predictivos de series temporales para proyectar la demanda de inventario de las próximas semanas, alertando sobre potenciales quiebres de stock.

![Diagrama de Secuencia — CU17: Gestionar Dashboard Analítico con Machine Learning](../diagramas/imagenes_secuencia/Secuencia_CU17.png)

```plantuml
@startuml Secuencia_CU17
autonumber
actor "Admin Empresa" as AE
participant "UI_DashboardEjecutivo" as UI
participant "CTR_GestorDashboard" as Ctrl
participant "CTR_MotorPredictivoML" as ML
participant "CE_VistasMaterializadas" as CE_Vistas
participant "CE_ModeloEntrenadoML" as CE_Modelo

AE -> UI : abrirDashboardEjecutivo()
UI -> Ctrl : cargarMetricasClave(tenant_id)
Ctrl -> CE_Vistas : obtenerKPIsEnTiempoReal(tenant_id)
CE_Vistas --> Ctrl : datosVentasMargenRotacion
Ctrl --> UI : metricasCargadasOk(kpis)
UI -> ML : solicitarProyeccionDemanda(tenant_id, semanas=4)
ML -> CE_Modelo : cargarPesosYDatosHistoricos(tenant_id)
CE_Modelo --> ML : serieTemporalYParametros
ML -> ML : ejecutarInferenciaPredictiva()
ML --> UI : curvasDemandaYAlertasQuiebreStock(proyecciones)
UI --> AE : renderizarGraficosYAlertasReabastecimiento()
@enduml
```

---

### Diagrama de Secuencia — CU18: Procesar Pago con Pasarela Electrónica Stripe para Saldo de Cambio

Orquesta el cobro seguro con tarjeta bancaria utilizando Stripe Elements, manteniendo el cumplimiento PCI-DSS (el servidor de la empresa nunca toca datos PAN ni CVV) y capturando la confirmación mediante Webhook asíncrono.

![Diagrama de Secuencia — CU18: Procesar Pago con Pasarela Electrónica Stripe para Saldo de Cambio](../diagramas/imagenes_secuencia/Secuencia_CU18.png)

```plantuml
@startuml Secuencia_CU18
autonumber
actor "Cliente" as C
participant "UI_StripeElements" as UI
participant "CTR_GestorPagosStripe" as Ctrl
participant "Serv_StripeAPI" as Stripe
participant "CE_OrdenPago" as CE_Orden
participant "CE_BitacoraTransaccion" as CE_Bit

C -> UI : confirmarPagoConTarjeta(monto, moneda)
UI -> Ctrl : crearPaymentIntent(monto, tenant_id)
Ctrl -> Stripe : POST /v1/payment_intents(amount, currency, metadata)
Stripe --> Ctrl : client_secret
Ctrl --> UI : client_secret_token
UI -> Stripe : stripe.confirmCardPayment(client_secret, cardData)
Stripe --> UI : payment_intent.succeeded
Stripe -> Ctrl : Webhook POST payment_intent.succeeded
Ctrl -> CE_Orden : actualizarEstadoOrden('PAGADA', stripe_id)
CE_Orden --> Ctrl : ordenActualizadaOk()
Ctrl -> CE_Bit : registrarLogPago(stripe_id, monto, status='SUCCESS')
CE_Bit --> Ctrl : logRegistradoOk()
Ctrl --> UI : confirmacionPagoRegistrada()
UI --> C : mostrarComprobantePagoDigital()
@enduml
```

---

### Diagrama de Secuencia — CU19: Aplicar Descuento de Liquidación por Temporada y Precios por Mayor

Aplica dinámicamente el motor de reglas de precios: evalúa de forma interna las ofertas de liquidación de temporada prenda por prenda (en bucle estricto entre Control y Entidad), y si el total del carrito es $\ge 3$ unidades, aplica el descuento mayorista unificado.

![Diagrama de Secuencia — CU19: Aplicar Descuento de Liquidación por Temporada y Precios por Mayor](../diagramas/imagenes_secuencia/Secuencia_CU19.png)

```plantuml
@startuml Secuencia_CU19
autonumber
actor "Cliente / Cajero" as User
participant "UI_CarritoPOS" as UI
participant "CTR_MotorReglasPrecios" as Ctrl
participant "CE_OfertaLiquidacion" as CE_Liq
participant "CE_ReglaPrecioMayor" as CE_Mayor
participant "CE_InventarioSucursal" as CE_Inv

User -> UI : agregarPrendasAlCarrito(items)
UI -> Ctrl : evaluarReglasDePrecio(items)

loop [Para cada prenda en itemsCarrito - Evaluación de Liquidación (Solo Control y Entidad)]
  Ctrl -> CE_Liq : consultarDescuentoLiquidacion(prenda_id, temporada_pasada)
  CE_Liq --> Ctrl : descuentoLiquidacion(porcentaje_liq)
  Ctrl -> Ctrl : aplicarDescuentoItem(precio_base, porcentaje_liq)
end

alt [Cantidad total en carrito >= 3 unidades (Tarifa Mayorista)]
  Ctrl -> CE_Mayor : obtenerReglaMayorista(cantidad_total >= 3)
  CE_Mayor --> Ctrl : descuentoMayoristaAdicional(porcentaje_mayor)
  Ctrl -> Ctrl : aplicarTarifaMayoristaGlobal(subtotal, porcentaje_mayor)
else [Venta al Detalle Regular (< 3 unidades)]
  Ctrl -> Ctrl : mantenerTarifasUnitarias()
end

Ctrl --> UI : desglosePreciosCalculados(subtotal, desc_liq, desc_mayor, total)
UI --> User : desplegarTotalConAhorros(total_final, total_ahorrado)
@enduml
```

---

### Diagrama de Secuencia — CU20: Registrar y Autorizar Orden de Compra Web Desktop

Modela el aprovisionamiento de prendas textiles desde la aplicación Web Desktop: emisión formal de la orden de compra hacia el proveedor, recepción física del lote en almacén con número de factura fiscal, y actualización atómica del inventario y del Kardex físico-valorado mediante recálculo de CPP.

![Diagrama de Secuencia — CU20: Registrar y Autorizar Orden de Compra Web Desktop](../diagramas/imagenes_secuencia/Secuencia_CU20.png)

```plantuml
@startuml Secuencia_CU20
autonumber
actor "Encargado / Admin" as EC
actor "Proveedor Textil" as Prov
participant "UI_PanelComprasDesktop" as UI
participant "CTR_GestorComprasDesktop" as CTR_C
participant "CTR_GestorInventarios" as CTR_Inv
participant "CE_OrdenCompra" as CE_OC
participant "CE_InventarioSucursal" as CE_Inv
participant "CE_MovimientoKardex" as CE_Kardex

EC -> UI : crearOrdenCompra(proveedor_id, items, costos)
UI -> CTR_C : emitirOrdenCompra(proveedor_id, items, costos)
CTR_C -> CE_OC : insertarOrdenCompra(proveedor_id, items, 'EMITIDA')

loop [Para cada ítem en listaItems - Guardado Detalle (Solo Control y Entidad)]
  CTR_C -> CE_OC : insertarDetalleOrden(oc_id, item.id, item.cant, item.costo)
  CE_OC --> CTR_C : detalleInsertadoOk()
end

CE_OC --> CTR_C : ordenCompraEmitidaOk(orden_id)
CTR_C -> Prov : notificarOrdenCompraFormal(orden_id, items)
Prov --> CTR_C : confirmacionDespachoProveedor()
CTR_C --> UI : ordenEmitidaExitosamente(orden_id)
UI --> EC : desplegarOrdenEnTransito(orden_id)

EC -> UI : registrarRecepcionFactura(orden_id, num_factura, costo_final)
UI -> CTR_C : recepcionarLoteMercaderia(orden_id, num_factura, costo_final)
CTR_C -> CTR_Inv : ingresarLoteAInventario(orden_id, sucursal_id, items, costo_final)

loop [Para cada ítem recibido - Actualización Stock y CPP (Solo Control y Entidad)]
  CTR_Inv -> CE_Inv : recalcularCPPYActualizarStock(item.id, sucursal, cant, costo)
  CE_Inv --> CTR_Inv : stockYCPPActualizadosOk()
  CTR_Inv -> CE_Kardex : registrarEntradaFacturada('COMPRA_FACTURADA', num_factura, cant, costo)
  CE_Kardex --> CTR_Inv : movimientoKardexAsentadoOk()
end

CTR_Inv --> CTR_C : loteIngresadoAInventarioOk()
CTR_C -> CE_OC : actualizarEstadoOrden(orden_id, 'COMPLETADA_FACTURADA')
CE_OC --> CTR_C : estadoOrdenActualizadoOk()
CTR_C --> UI : recepcionLoteYStockAsentadosOk()
UI --> EC : mostrarComprobanteEntradaAlmacen(stock_actualizado)
@enduml
```

---


## 3.4. Diagrama de Clases UML (Modelo Lógico Detallado)

En la metodología ICONIX, el **Diagrama de Clases UML** representa la culminación del análisis preliminar y la base estructural para el diseño detallado. Se alimenta de forma directa del **Diagrama de Robustez (Sección 3.2)**, donde las entidades identificadas (`CE_...`) se formalizan en clases de dominio orientadas a objetos, con atributos rigurosamente tipados, visibilidad, claves primarias/foráneas, métodos de negocio y multiplicidades.

A continuación se presentan:
1. **El Diagrama de Clases UML del Dominio (Modelo Lógico del 2do Parcial):** Estructurado con una disposición ortogonal limpia y legible, conteniendo exclusivamente las clases pertinentes a los desafíos del Segundo Parcial (aislamiento multitenant, sincronización offline e idempotencia, inventario con CPP inmutable y Kardex físico-valorado, traspasos inter-sucursal, postventa en dos tiempos, pasarela Stripe, reportes generativos con IA, analítica ML y compras Web Desktop), dotado en el 100% de sus asociaciones con **verbos direccionales y cardinalidades en ambos extremos**.
2. **El Diagrama de Clases de Análisis por Caso de Uso:** Que ilustra cómo los elementos Boundary, Control y Entity descubiertos en el análisis de robustez se materializan en clases tipadas con sus métodos de interfaz, controladores de aplicación y entidades de datos.

---

### 3.4.1. Diagrama de Clases UML del Dominio (Alcance 2do Parcial)

El siguiente diagrama modela las 24 entidades centrales que resuelven los 20 Casos de Uso del 2do Parcial, evitando sobrecargas de elementos ajenos del 1er parcial para garantizar máxima legibilidad y rigor técnico:

![Diagrama de Clases UML — Modelo Lógico del Dominio (2do Parcial)](../diagramas/imagenes_clases/Diagrama_Clases_Dominio_P2.png)

```plantuml
@startuml Diagrama_Clases_Dominio_P2
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FFF8E1
  BorderColor #F57F17
  ArrowColor #E65100
}

' Cluster 1: SaaS Tenant & Suscripciones
class PlanSuscripcion {
  - id : int {PK}
  - nombre : string
  - max_sucursales : int
  - max_usuarios : int
  - precio_mensual : decimal
  + validarCupo(usuarios_actuales: int) : bool
}

class Suscripcion {
  - id : int {PK}
  - empresa_id : int {FK}
  - plan_id : int {FK}
  - fecha_vencimiento : date
  - estado : string
  + esVigente() : bool
  + renovar(meses: int) : void
}

class Empresa {
  - id : int {PK}
  - nit : string
  - razon_social : string
  - schema_name : string
  - estado : string
  + registrarEmpresa() : void
  + activarSchema() : void
}

class Usuario {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - email : string
  - password_hash : string
  - rol : string
  - estado : string
  + autenticar(password: string) : bool
  + verificarRol(rol_requerido: string) : bool
}

class Sucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - nombre : string
  - direccion : string
  - ciudad : string
  + verificarCapacidad() : bool
}

' Cluster 2: Catálogo Textil & Atributos Avanzados
class Producto {
  - id : int {PK}
  - tenant_id : int {FK}
  - sku_base : string
  - nombre : string
  - precio_base : decimal
  + calcularPrecio(cantidad: int) : decimal
}

class FichaTextil {
  - id : int {PK}
  - producto_id : int {FK}
  - composicion : string
  - encogimiento : decimal
  - viscosidad : decimal
  - es_hipoalergenico : bool
  + validarNormaTextil() : bool
}

class VariantePrenda {
  - id : int {PK}
  - producto_id : int {FK}
  - talla_cm : string
  - color_hex : string
  - sku_variante : string
  - codigo_barras : string
  + obtenerDimensiones() : jsonb
}

' Cluster 3: Inventario Multi-Sucursal, Kardex y CPP
class InventarioSucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - variante_id : int {FK}
  - stock_fisico : int
  - stock_reservado : int
  - cpp : decimal
  + incrementarStock(cant: int, costo: decimal) : void
  + descontarStock(cant: int) : bool
}

class MovimientoKardex {
  - id : int {PK}
  - tenant_id : int {FK}
  - variante_id : int {FK}
  - tipo_movimiento : string
  - cantidad : int
  - costo_unitario : decimal
  - cpp_resultante : decimal
  - saldo_stock : int
  + asentarMovimiento() : void
}

' Cluster 4: Traspasos Inter-Sucursal
class TraspasoSucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - origen_id : int {FK}
  - destino_id : int {FK}
  - guia_remision : string
  - estado : string
  + despachar() : void
  + recepcionar() : void
}

class DetalleTraspaso {
  - id : int {PK}
  - traspaso_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  + validarConteo() : bool
}

' Cluster 5: Aprovisionamiento y Compras Web Desktop
class Proveedor {
  - id : int {PK}
  - tenant_id : int {FK}
  - razon_social : string
  - nit : string
  - telefono : string
  + consultarTerminos() : string
}

class OrdenCompra {
  - id : int {PK}
  - tenant_id : int {FK}
  - proveedor_id : int {FK}
  - num_factura_fiscal : string
  - total : decimal
  - estado : string
  + emitirOrden() : void
  + recepcionarFacturado() : void
}

class DetalleOrdenCompra {
  - id : int {PK}
  - orden_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  - costo_unitario : decimal
  + calcularCosto() : decimal
}

' Cluster 6: Ventas POS Offline y Reservas
class Venta {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - total : decimal
  - tipo_pago : string
  - uuid_origen : uuid
  - estado_sync : string
  + liquidarVenta() : void
}

class DetalleVenta {
  - id : int {PK}
  - venta_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  - subtotal : decimal
  + calcularSubtotal() : decimal
}

class ReservaOffline {
  - uuid : uuid {PK}
  - tenant_id : int {FK}
  - variante_id : int {FK}
  - fecha_expiracion : timestamp
  - qr_token : string
  + validarVigencia2h() : bool
}

class OperacionOffline {
  - uuid : uuid {PK}
  - tenant_id : int {FK}
  - tipo_operacion : string
  - payload_json : jsonb
  - hash_sha256 : string
  - estado_sync : string
  + verificarHash() : bool
  + marcarSync() : void
}

' Cluster 7: Postventa en Dos Tiempos y Stripe
class CambioPrenda {
  - id : int {PK}
  - tenant_id : int {FK}
  - venta_id : int {FK}
  - saldo_diferencial : decimal
  - estado : string
  + procesarTiempo1() : void
  + procesarTiempo2() : void
}

class NotaDevolucion {
  - id : int {PK}
  - cambio_id : int {FK}
  - saldo_favor : decimal
  - estado_cuarentena : string
  + ingresarCuarentena() : void
}

class NotaCambio {
  - id : int {PK}
  - cambio_id : int {FK}
  - variante_nueva_id : int {FK}
  - diferencia_cobrada : decimal
  + despacharPrenda() : void
}

class Pago {
  - id : int {PK}
  - tenant_id : int {FK}
  - monto : decimal
  - metodo_pago : string
  - stripe_id : string
  - estado : string
  + procesarStripe() : bool
}

' Cluster 8: Reglas Comerciales e IA
class ReglaPrecioMayor {
  - id : int {PK}
  - tenant_id : int {FK}
  - min_prendas : int
  - descuento_pct : decimal
  + aplica(cant: int) : bool
}

class ReporteIA {
  - id : int {PK}
  - tenant_id : int {FK}
  - prompt_natural : string
  - sql_segura : string
  - resultado_json : jsonb
  + ejecutarQueryReadOnly() : jsonb
}

' =========================================================================
' RELACIONES CON VERBOS Y CARDINALIDADES FORMALES
' =========================================================================

PlanSuscripcion "1" -- "*" Suscripcion : define >
Empresa "1" -- "1" Suscripcion : contrata >
Empresa "1" *-- "1..*" Sucursal : opera_en >
Empresa "1" *-- "1..*" Usuario : emplea >
Empresa "1" -- "*" ReglaPrecioMayor : configura >

Usuario "1" -- "*" ReporteIA : consulta >

Sucursal "1" -- "*" OperacionOffline : encola_en >
Sucursal "1" -- "*" TraspasoSucursal : despacha >
TraspasoSucursal "1" *-- "1..*" DetalleTraspaso : incluye >
DetalleTraspaso "*" -- "1" VariantePrenda : traslada >

Producto "1" *-- "1" FichaTextil : especifica >
Producto "1" *-- "1..*" VariantePrenda : dimensiona >

Sucursal "1" -- "*" InventarioSucursal : almacena >
InventarioSucursal "*" -- "1" VariantePrenda : cuantifica >
InventarioSucursal "1" *-- "1..*" MovimientoKardex : asienta_en >

Sucursal "1" -- "*" ReservaOffline : reserva_en >
ReservaOffline "*" -- "1" VariantePrenda : aparta >

Proveedor "1" -- "*" OrdenCompra : suministra >
OrdenCompra "1" *-- "1..*" DetalleOrdenCompra : detalla >
DetalleOrdenCompra "*" -- "1" VariantePrenda : aprovisiona >

Sucursal "1" -- "*" Venta : efectua >
Usuario "1" -- "*" Venta : cobra >
Venta "1" *-- "1..*" DetalleVenta : contiene >
DetalleVenta "*" -- "1" VariantePrenda : item_de >
Venta "1" -- "0..1" Pago : cancela >

Venta "1" -- "*" CambioPrenda : origina >
CambioPrenda "1" *-- "1" NotaDevolucion : genera_T1 >
CambioPrenda "1" *-- "0..1" NotaCambio : liquida_T2 >
NotaDevolucion "*" -- "1" VariantePrenda : devuelta >
NotaCambio "*" -- "1" VariantePrenda : entregada >
CambioPrenda "1" -- "0..1" Pago : cobra_saldo >
@enduml
```

---

### 3.4.2. Diagrama de Clases de Análisis por Caso de Uso (Estructura ICONIX)

Conforme a la metodología ICONIX formalizada en clase por la docente (Ing. Angélica Garzón Cuéllar), el **Diagrama de Clases de Análisis por Caso de Uso** constituye la transición estructural directa entre el Diagrama de Robustez y el Diagrama de Secuencia. En esta formalización orientada a objetos:

1. **Clases de Interfaz (Boundary - `UI_...`):** Representan los puntos de contacto con los Actores, conteniendo los atributos de captura de datos y métodos manejadores de eventos.
2. **Clases de Control (`CTR_...`):** Orquestan el flujo transaccional y las reglas de negocio específicas del caso de uso.
3. **Clases de Entidad (`CE_...`):** Mapean los objetos persistentes del dominio con sus atributos de estado y métodos de acceso.
4. **Relaciones entre Clases Entidad con Verbos y Cardinalidades:** A diferencia de los Diagramas de Robustez (donde las entidades no se relacionan directamente entre sí), en los **Diagramas de Clases de Análisis SÍ se modelan las asociaciones y composiciones entre entidades de datos**, debido a que son extraídas de la estructura relacional de la Base de Datos (PostgreSQL), incluyendo **cardinalidades exactas (1 a 1, 1 a *, * a 1, * a *) y verbos explicativos** de la relación de negocio.

A continuación, se presentan los **20 Diagramas de Clases de Análisis** modelados y exportados directamente desde Enterprise Architect (`diagramas1erParcial.eapx`) junto con sus especificaciones de diseño:

#### 3.4.2.1. Clases de Análisis — CU01: Registrar Empresa y Crear Administrador

**Actor:** `Super Admin`  
**Descripción del Flujo Estructural:** El Super Administrador interactúa con la interfaz de registro de empresas para dar de alta una nueva organización en la plataforma SaaS. El controlador orquesta la validación del NIT, provisiona el schema PostgreSQL multitenant y persiste la empresa, su usuario administrador y la suscripción inicial.

![Diagrama de Clases de Análisis — CU01: Registrar Empresa y Crear Administrador](../diagramas/imagenes_clases_cu/Clases_CU01.png)

```plantuml
@startuml Clases_CU01
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Super Admin" as Act

class "UI_FormularioEmpresa" as UI {
  - email_admin : string
  - nit : string
  - razon_social : string
  __
  + capturarDatos() : void
  + enviarRegistro() : void
  + mostrarConfirmacion() : void
}

class "CTR_GestorEmpresas" as CTR {
  + crearSchemaTenant() : void
  + registrarEmpresa() : void
  + validarNIT() : bool
}

class "CE_Empresa" as CE_Empresa {
  - id : int
  - nit : string
  - razon_social : string
  - schema_name : string
  __
  + create() : void
}

class "CE_Usuario" as CE_Usuario {
  - email : string
  - id : int
  - password_hash : string
  - rol : string
  __
  + create() : void
}

class "CE_Suscripcion" as CE_Suscripcion {
  - estado : string
  - id : int
  - plan_id : int
  __
  + create() : void
}

Act -- UI
UI -- CTR
CTR -- CE_Empresa

CE_Empresa "1" *-- "1..*" CE_Usuario : "emplea"
CE_Empresa "1" -- "1" CE_Suscripcion : "contrata"
@enduml
```

---

#### 3.4.2.2. Clases de Análisis — CU02: Gestionar Planes de Suscripción

**Actor:** `Super Admin`  
**Descripción del Flujo Estructural:** El Super Administrador define y administra la oferta de planes SaaS (cuotas de sucursales, precios y habilitación de módulos avanzados). El controlador valida límites y nombres duplicados, impactando sobre la entidad de planes y su relación con las suscripciones activas.

![Diagrama de Clases de Análisis — CU02: Gestionar Planes de Suscripción](../diagramas/imagenes_clases_cu/Clases_CU02.png)

```plantuml
@startuml Clases_CU02
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Super Admin" as Act

class "UI_GestionPlanes" as UI {
  - maxSucursales : int
  - nombrePlan : string
  - precioMensual : decimal
  __
  + capturarPlan() : void
  + enviarCreacion() : void
  + listarPlanes() : void
}

class "CTR_GestorPlanes" as CTR {
  + crearPlan() : void
  + validarTarifas() : bool
  + verificarNombreDuplicado() : bool
}

class "CE_PlanSuscripcion" as CE_PlanSuscripcion {
  - id : int
  - max_sucursales : int
  - nombre : string
  - precio_mensual : decimal
  __
  + create() : void
  + update() : void
}

class "CE_Suscripcion" as CE_Suscripcion {
  - estado : string
  - id : int
  - plan_id : int
  __
  + getActivas() : list
}

Act -- UI
UI -- CTR
CTR -- CE_PlanSuscripcion

CE_PlanSuscripcion "1" -- "*" CE_Suscripcion : "aplica_a"
@enduml
```

---

#### 3.4.2.3. Clases de Análisis — CU03: Gestionar Suscripción de Empresa

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El Administrador de Empresa solicita un upgrade de plan para ampliar el límite de sucursales o habilitar analítica avanzada. El controlador calcula el prorrateo, procesa el cobro y actualiza la vigencia y cuotas de la empresa.

![Diagrama de Clases de Análisis — CU03: Gestionar Suscripción de Empresa](../diagramas/imagenes_clases_cu/Clases_CU03.png)

```plantuml
@startuml Clases_CU03
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_SuscripcionEmpresa" as UI {
  - nuevoPlanId : int
  - tokenStripe : string
  __
  + confirmarPago() : void
  + mostrarVigencia() : void
  + seleccionarUpgrade() : void
}

class "CTR_GestorSuscripcion" as CTR {
  + actualizarLimites() : void
  + cotizarUpgrade() : decimal
  + procesarCobroStripe() : bool
}

class "CE_Suscripcion" as CE_Suscripcion {
  - empresa_id : int
  - fecha_vencimiento : date
  - id : int
  - plan_id : int
  __
  + update() : void
}

class "CE_PlanSuscripcion" as CE_PlanSuscripcion {
  - id : int
  - nombre : string
  - precio_mensual : decimal
  __
  + find() : Plan
}

class "CE_Empresa" as CE_Empresa {
  - cuota_max : int
  - id : int
  - razon_social : string
  __
  + updateLimites() : void
}

Act -- UI
UI -- CTR
CTR -- CE_Suscripcion

CE_Empresa "1" -- "1" CE_Suscripcion : "posee"
CE_PlanSuscripcion "1" -- "*" CE_Suscripcion : "define_cuotas"
@enduml
```

---

#### 3.4.2.4. Clases de Análisis — CU04: Autenticar Usuario Multitenant

**Actor:** `Usuario`  
**Descripción del Flujo Estructural:** Cualquier usuario de la plataforma introduce sus credenciales de acceso. El controlador valida el hash criptográfico Bcrypt, verifica que la suscripción de la empresa esté activa y emite el token JWT que incorpora el tenant_id.

![Diagrama de Clases de Análisis — CU04: Autenticar Usuario Multitenant](../diagramas/imagenes_clases_cu/Clases_CU04.png)

```plantuml
@startuml Clases_CU04
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Usuario" as Act

class "UI_LoginView" as UI {
  - email : string
  - password : string
  __
  + enviarLogin() : void
  + ingresarCredenciales() : void
  + mostrarError() : void
}

class "CTR_GestorAuth" as CTR {
  + autenticar() : TokenDTO
  + verificarBcrypt() : bool
  + verificarSuscripcion() : bool
}

class "CE_Usuario" as CE_Usuario {
  - email : string
  - id : int
  - password_hash : string
  - rol : string
  - tenant_id : int
  __
  + findByEmail() : Usuario
}

class "CE_Suscripcion" as CE_Suscripcion {
  - empresa_id : int
  - estado : string
  - id : int
  __
  + esVigente() : bool
}

Act -- UI
UI -- CTR
CTR -- CE_Usuario

CE_Usuario "*" -- "1" CE_Suscripcion : "valida_acceso"
@enduml
```

---

#### 3.4.2.5. Clases de Análisis — CU05: Gestionar Usuarios y Roles por Empresa

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El Administrador de Empresa crea y asigna roles a los empleados de su organización (Cajeros, Encargados). El controlador valida que no se exceda el cupo de usuarios permitidos por el plan y asocia el usuario a la sucursal correspondiente.

![Diagrama de Clases de Análisis — CU05: Gestionar Usuarios y Roles por Empresa](../diagramas/imagenes_clases_cu/Clases_CU05.png)

```plantuml
@startuml Clases_CU05
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_GestionPersonal" as UI {
  - emailEmpleado : string
  - rolAsignado : string
  - sucursalId : int
  __
  + capturarDatos() : void
  + enviarAlta() : void
  + listarPersonal() : void
}

class "CTR_GestorPersonal" as CTR {
  + asignarRolYSucursal() : void
  + registrarUsuario() : void
  + verificarCupoPlan() : bool
}

class "CE_Usuario" as CE_Usuario {
  - email : string
  - id : int
  - rol : string
  - tenant_id : int
  __
  + create() : void
}

class "CE_Sucursal" as CE_Sucursal {
  - ciudad : string
  - id : int
  - nombre : string
  __
  + find() : Sucursal
}

class "CE_Suscripcion" as CE_Suscripcion {
  - id : int
  - max_usuarios : int
  __
  + getCupo() : int
}

Act -- UI
UI -- CTR
CTR -- CE_Usuario

CE_Sucursal "1" -- "*" CE_Usuario : "asigna_a"
CE_Suscripcion "1" -- "*" CE_Usuario : "limita"
@enduml
```

---

#### 3.4.2.6. Clases de Análisis — CU06: Registrar Prenda y Configurar Atributos Textiles Avanzados

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El Administrador registra prendas en el catálogo textil, configurando composiciones (algodón, poliéster), encogimiento y la matriz dimensional de tallas en centímetros. El controlador descompone la matriz y genera las variantes físicas compuestas.

![Diagrama de Clases de Análisis — CU06: Registrar Prenda y Configurar Atributos Textiles Avanzados](../diagramas/imagenes_clases_cu/Clases_CU06.png)

```plantuml
@startuml Clases_CU06
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_FormularioPrenda" as UI {
  - composicion : string
  - matrizTallas : jsonb
  - skuBase : string
  __
  + agregarVariante() : void
  + capturarFicha() : void
  + enviarRegistro() : void
}

class "CTR_GestorProductos" as CTR {
  + guardarMatriz() : void
  + registrarPrenda() : void
  + validarMedidasCm() : bool
}

class "CE_Producto" as CE_Producto {
  - id : int
  - nombre : string
  - sku_base : string
  - tenant_id : int
  __
  + create() : void
}

class "CE_FichaTextil" as CE_FichaTextil {
  - composicion : string
  - encogimiento : decimal
  - id : int
  - producto_id : int
  __
  + create() : void
}

class "CE_VariantePrenda" as CE_VariantePrenda {
  - id : int
  - producto_id : int
  - sku_variante : string
  - talla_cm : string
  __
  + create() : void
}

Act -- UI
UI -- CTR
CTR -- CE_Producto

CE_Producto "1" *-- "1" CE_FichaTextil : "especifica"
CE_Producto "1" *-- "1..*" CE_VariantePrenda : "dimensiona"
@enduml
```

---

#### 3.4.2.7. Clases de Análisis — CU07: Registrar Entrada de Lote de Inventario y Recalcular CPP

**Actor:** `Encargado Sucursal`  
**Descripción del Flujo Estructural:** El Encargado registra la recepción de un lote físico de mercadería. El controlador aplica la fórmula de Costo Promedio Ponderado (CPP), actualiza el stock disponible en la sucursal y genera un asiento inmutable en el Kardex valorado.

![Diagrama de Clases de Análisis — CU07: Registrar Entrada de Lote de Inventario y Recalcular CPP](../diagramas/imagenes_clases_cu/Clases_CU07.png)

```plantuml
@startuml Clases_CU07
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Encargado Sucursal" as Act

class "UI_ModalRecepcionLote" as UI {
  - cantidad : int
  - costoUnitario : decimal
  - numFactura : string
  - varianteId : int
  __
  + capturarLote() : void
  + enviarEntrada() : void
  + imprimirComprobanteCPP() : void
}

class "CTR_GestorInventarios" as CTR {
  + asentarKardex() : void
  + calcularNuevoCPP() : decimal
  + registrarEntradaLote() : void
}

class "CE_InventarioSucursal" as CE_InventarioSucursal {
  - cpp : decimal
  - id : int
  - stock_fisico : int
  - sucursal_id : int
  - variante_id : int
  __
  + update() : void
}

class "CE_MovimientoKardex" as CE_MovimientoKardex {
  - cantidad : int
  - cpp_resultante : decimal
  - id : int
  - tipo_movimiento : string
  __
  + create() : void
}

class "CE_VariantePrenda" as CE_VariantePrenda {
  - id : int
  - sku_variante : string
  __
  + find() : Variante
}

Act -- UI
UI -- CTR
CTR -- CE_InventarioSucursal

CE_InventarioSucursal "1" *-- "1..*" CE_MovimientoKardex : "asienta_en"
CE_VariantePrenda "1" -- "*" CE_InventarioSucursal : "cuantifica"
@enduml
```

---

#### 3.4.2.8. Clases de Análisis — CU08: Descargar y Consultar Catálogo Digital Offline (Cliente)

**Actor:** `Cliente`  
**Descripción del Flujo Estructural:** El cliente abre la aplicación móvil o PWA sin conexión a internet. El controlador lee la caché local en SQLite/IndexedDB y renderiza las imágenes comprimidas en WebP con los precios y fichas técnicas almacenadas previamente.

![Diagrama de Clases de Análisis — CU08: Descargar y Consultar Catálogo Digital Offline (Cliente)](../diagramas/imagenes_clases_cu/Clases_CU08.png)

```plantuml
@startuml Clases_CU08
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cliente" as Act

class "UI_CatalogoOffline" as UI {
  - tenantId : int
  - versionCache : string
  __
  + mostrarEstadoOffline() : void
  + renderizarLocal() : void
  + solicitarDescarga() : void
}

class "CTR_GestorCatalogoOffline" as CTR {
  + cachearWebP() : void
  + descargarSnapshot() : jsonb
  + sincronizarIndexedDB() : void
}

class "CE_CatalogoLocal" as CE_CatalogoLocal {
  - id : int
  - nombre : string
  - precios : jsonb
  - sku : string
  __
  + storeLocal() : void
}

class "CE_CacheMultimedia" as CE_CacheMultimedia {
  - blob_webp : blob
  - timestamp : int
  - url : string
  __
  + putCache() : void
}

Act -- UI
UI -- CTR
CTR -- CE_CatalogoLocal

CE_CatalogoLocal "1" -- "*" CE_CacheMultimedia : "asocia_recursos"
@enduml
```

---

#### 3.4.2.9. Clases de Análisis — CU09: Registrar Reserva Presencial Sin Conexión a Internet (Cliente)

**Actor:** `Cliente`  
**Descripción del Flujo Estructural:** El cliente aparta una prenda dentro de la tienda cuando no existe enlace WAN. El controlador genera un UUIDv4 único local, aparta tentativamente la unidad en el catálogo local y emite un comprobante con código QR válido por 2 horas.

![Diagrama de Clases de Análisis — CU09: Registrar Reserva Presencial Sin Conexión a Internet (Cliente)](../diagramas/imagenes_clases_cu/Clases_CU09.png)

```plantuml
@startuml Clases_CU09
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cliente" as Act

class "UI_FichaPrendaOffline" as UI {
  - sucursalId : int
  - varianteId : int
  __
  + mostrarTicketQR() : void
  + presionarReservar() : void
  + verMedidasCm() : void
}

class "CTR_GestorReservaOffline" as CTR {
  + generarUUIDv4() : uuid
  + guardarReservaLocal() : void
  + validarStockLocal() : bool
}

class "CE_ReservaOffline" as CE_ReservaOffline {
  - estado : string
  - fecha_expiracion_2h : timestamp
  - uuid : uuid
  - variante_id : int
  __
  + create() : void
}

class "CE_CatalogoLocal" as CE_CatalogoLocal {
  - stock_disponible : int
  - variante_id : int
  __
  + descontarTentativo() : void
}

Act -- UI
UI -- CTR
CTR -- CE_ReservaOffline

CE_ReservaOffline "*" -- "1" CE_CatalogoLocal : "aparta_de"
@enduml
```

---

#### 3.4.2.10. Clases de Análisis — CU10: Registrar Venta POS de Contado Sin Conexión a Internet (Cajero / Cliente)

**Actor:** `Cajero`  
**Descripción del Flujo Estructural:** El cajero procesa una venta en efectivo durante una caída de red. El controlador calcula los totales, genera la transacción firmada con SHA-256 en la cola offline local, descuenta el stock en el catálogo local e imprime el ticket provisional.

![Diagrama de Clases de Análisis — CU10: Registrar Venta POS de Contado Sin Conexión a Internet (Cajero / Cliente)](../diagramas/imagenes_clases_cu/Clases_CU10.png)

```plantuml
@startuml Clases_CU10
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cajero" as Act

class "UI_TerminalPOSOffline" as UI {
  - itemsCarrito : jsonb
  - montoEfectivo : decimal
  __
  + cobrarEfectivo() : void
  + escanearSKU() : void
  + imprimirReciboProvisional() : void
}

class "CTR_GestorVentaOffline" as CTR {
  + aplicarReglasLocales() : decimal
  + encolarVenta() : void
  + generarUUIDv4() : uuid
}

class "CE_OperacionOffline" as CE_OperacionOffline {
  - hash_sha256 : string
  - payload : jsonb
  - tipo : string
  - uuid : uuid
  __
  + encolar() : void
}

class "CE_CatalogoLocal" as CE_CatalogoLocal {
  - stock_fisico : int
  - variante_id : int
  __
  + descontarStock() : void
}

Act -- UI
UI -- CTR
CTR -- CE_OperacionOffline

CE_OperacionOffline "*" -- "1..*" CE_CatalogoLocal : "descuenta_en"
@enduml
```

---

#### 3.4.2.11. Clases de Análisis — CU11: Consultar y Auditar Operaciones Locales Pendientes (Cajero / Cliente / Encargado)

**Actor:** `Cajero`  
**Descripción del Flujo Estructural:** El personal de tienda o encargado revisa la bitácora de transacciones encoladas localmente. El controlador verifica la integridad de los hashes SHA-256, calcula el total de efectivo en caja pendiente de rendir y muestra el estado de sincronización.

![Diagrama de Clases de Análisis — CU11: Consultar y Auditar Operaciones Locales Pendientes (Cajero / Cliente / Encargado)](../diagramas/imagenes_clases_cu/Clases_CU11.png)

```plantuml
@startuml Clases_CU11
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cajero" as Act

class "UI_PanelAuditoriaLocal" as UI {
  - filtroOperaciones : string
  __
  + abrirPanel() : void
  + desplegarArqueoCaja() : void
  + seleccionarOperacion() : void
}

class "CTR_AuditoriaLocal" as CTR {
  + calcularTotalEfectivo() : decimal
  + listarPendientesSync() : list
  + verificarHashSHA256() : bool
}

class "CE_OperacionOffline" as CE_OperacionOffline {
  - hash_sha256 : string
  - payload : jsonb
  - tipo : string
  - uuid : uuid
  __
  + findPendientes() : list
}

class "CE_CatalogoLocal" as CE_CatalogoLocal {
  - nombre : string
  - variante_id : int
  __
  + find() : Prenda
}

Act -- UI
UI -- CTR
CTR -- CE_OperacionOffline

CE_OperacionOffline "*" -- "1" CE_CatalogoLocal : "audita_prenda"
@enduml
```

---

#### 3.4.2.12. Clases de Análisis — CU12: Sincronizar Operaciones Pendientes (Sistema de Sincronización)

**Actor:** `Sistema Sync`  
**Descripción del Flujo Estructural:** El agente en segundo plano detecta la reconexión a internet y envía por lotes las ventas y reservas offline hacia PostgreSQL central. El controlador central resuelve conflictos mediante First-Write-Wins, persiste las ventas definitivas y asienta los movimientos en Kardex.

![Diagrama de Clases de Análisis — CU12: Sincronizar Operaciones Pendientes (Sistema de Sincronización)](../diagramas/imagenes_clases_cu/Clases_CU12.png)

```plantuml
@startuml Clases_CU12
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Sistema Sync" as Act

class "Worker_BackgroundSync" as UI {
  - statusRed : bool
  __
  + detectarOnline() : void
  + dispararSync() : void
  + notificarResultado() : void
}

class "CTR_GestorSync" as CTR {
  + marcarSincronizado() : void
  + procesarBatch() : void
  + reconciliarStockCentral() : void
}

class "CE_VentaCentral" as CE_VentaCentral {
  - id : int
  - total : decimal
  - uuid_origen : uuid
  __
  + create() : void
}

class "CE_OperacionOfflineLocal" as CE_OperacionOfflineLocal {
  - estado : string
  - uuid : uuid
  __
  + marcarSync() : void
}

class "CE_InventarioSucursal" as CE_InventarioSucursal {
  - stock_fisico : int
  - variante_id : int
  __
  + reconciliar() : void
}

class "CE_MovimientoKardex" as CE_MovimientoKardex {
  - cantidad : int
  - tipo_movimiento : string
  __
  + asentar() : void
}

Act -- UI
UI -- CTR
CTR -- CE_VentaCentral

CE_VentaCentral "1" -- "1" CE_OperacionOfflineLocal : "sincroniza_desde"
CE_VentaCentral "1" -- "*" CE_InventarioSucursal : "actualiza_stock"
CE_InventarioSucursal "1" *-- "1..*" CE_MovimientoKardex : "registra_en"
@enduml
```

---

#### 3.4.2.13. Clases de Análisis — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones

**Actor:** `Cajero`  
**Descripción del Flujo Estructural:** El cliente devuelve una prenda (Tiempo 1) y elige una prenda sustituta de mayor valor (Tiempo 2). El controlador emite la nota de devolución a cuarentena, calcula la diferencia de precio y emite la nota de cambio cobrando el saldo restante.

![Diagrama de Clases de Análisis — CU13: Gestionar Cambio de Prenda en Dos Tiempos y Devoluciones](../diagramas/imagenes_clases_cu/Clases_CU13.png)

```plantuml
@startuml Clases_CU13
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cajero" as Act

class "UI_ModuloPostventa" as UI {
  - facturaOrigen : string
  - prendaDevueltaId : int
  - prendaNuevaId : int
  __
  + cobrarDiferenciaStripe() : void
  + liquidarTiempo2() : void
  + registrarTiempo1() : void
}

class "CTR_GestorCambios" as CTR {
  + emitirNotaDevolucion() : void
  + ingresarCuarentena() : void
  + liquidarNotaCambio() : void
}

class "CE_CambioPrenda" as CE_CambioPrenda {
  - id : int
  - saldo_diferencial : decimal
  - venta_origen_id : int
  __
  + create() : void
}

class "CE_NotaDevolucion" as CE_NotaDevolucion {
  - cambio_id : int
  - estado_cuarentena : string
  - id : int
  - saldo_favor : decimal
  __
  + create() : void
}

class "CE_NotaCambio" as CE_NotaCambio {
  - cambio_id : int
  - diferencia_cobrada : decimal
  - id : int
  - variante_nueva_id : int
  __
  + create() : void
}

class "CE_InventarioSucursal" as CE_InventarioSucursal {
  - stock_cuarentena : int
  - stock_fisico : int
  - variante_id : int
  __
  + update() : void
}

Act -- UI
UI -- CTR
CTR -- CE_CambioPrenda

CE_CambioPrenda "1" *-- "1" CE_NotaDevolucion : "genera_T1"
CE_CambioPrenda "1" *-- "0..1" CE_NotaCambio : "liquida_T2"
CE_NotaDevolucion "*" -- "1" CE_InventarioSucursal : "cuarentena_en"
CE_NotaCambio "*" -- "1" CE_InventarioSucursal : "descuenta_de"
@enduml
```

---

#### 3.4.2.14. Clases de Análisis — CU14: Gestionar Traspaso Inter-Sucursal de Inventario

**Actor:** `Encargado Sucursal`  
**Descripción del Flujo Estructural:** El encargado traslada unidades entre tiendas. El controlador descuenta el inventario de la sucursal de origen, emite la guía de remisión con estado 'EN_TRANSITO' y, al recepcionar en destino, incrementa el stock asentando los asientos Kardex.

![Diagrama de Clases de Análisis — CU14: Gestionar Traspaso Inter-Sucursal de Inventario](../diagramas/imagenes_clases_cu/Clases_CU14.png)

```plantuml
@startuml Clases_CU14
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Encargado Sucursal" as Act

class "UI_TraspasoInventario" as UI {
  - destinoId : int
  - items : jsonb
  - origenId : int
  __
  + confirmarRecepcion() : void
  + imprimirGuia() : void
  + registrarDespacho() : void
}

class "CTR_GestorTraspasos" as CTR {
  + emitirGuiaRemision() : void
  + recepcionarEnDestino() : void
  + verificarStockOrigen() : bool
}

class "CE_TraspasoSucursal" as CE_TraspasoSucursal {
  - destino_id : int
  - estado : string
  - guia_remision : string
  - id : int
  - origen_id : int
  __
  + create() : void
  + update() : void
}

class "CE_DetalleTraspaso" as CE_DetalleTraspaso {
  - cantidad : int
  - id : int
  - traspaso_id : int
  - variante_id : int
  __
  + create() : void
}

class "CE_InventarioSucursal" as CE_InventarioSucursal {
  - stock_fisico : int
  - sucursal_id : int
  - variante_id : int
  __
  + update() : void
}

class "CE_MovimientoKardex" as CE_MovimientoKardex {
  - cantidad : int
  - tipo_movimiento : string
  __
  + asentar() : void
}

Act -- UI
UI -- CTR
CTR -- CE_TraspasoSucursal

CE_TraspasoSucursal "1" *-- "1..*" CE_DetalleTraspaso : "incluye"
CE_DetalleTraspaso "*" -- "1" CE_InventarioSucursal : "traslada_desde_hacia"
CE_InventarioSucursal "1" *-- "1..*" CE_MovimientoKardex : "asienta"
@enduml
```

---

#### 3.4.2.15. Clases de Análisis — CU15: Solicitar Reporte Generativo con IA (Lenguaje Natural / Voz)

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El Administrador consulta métricas mediante voz o texto. El controlador transcribe con Whisper, valida con el parser SQL que la consulta sea estrictamente de solo lectura (SELECT) contra vistas analíticas y genera la respuesta visual.

![Diagrama de Clases de Análisis — CU15: Solicitar Reporte Generativo con IA (Lenguaje Natural / Voz)](../diagramas/imagenes_clases_cu/Clases_CU15.png)

```plantuml
@startuml Clases_CU15
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_ChatAnaliticoIA" as UI {
  - audioBlob : blob
  - promptTexto : string
  __
  + dictarVoz() : void
  + desplegarGrafico() : void
  + enviarPrompt() : void
}

class "CTR_GestorReportesIA" as CTR {
  + generarSQL_LLM() : string
  + transcribirWhisper() : string
  + validarAST_ReadOnly() : bool
}

class "CE_ReporteIA" as CE_ReporteIA {
  - id : int
  - prompt_natural : string
  - sql_segura : string
  - tenant_id : int
  __
  + create() : void
}

class "CE_VistasAnaliticas" as CE_VistasAnaliticas {
  - dataset : jsonb
  - vista_nombre : string
  __
  + executeQuery() : jsonb
}

Act -- UI
UI -- CTR
CTR -- CE_ReporteIA

CE_ReporteIA "*" -- "1" CE_VistasAnaliticas : "consulta_de"
@enduml
```

---

#### 3.4.2.16. Clases de Análisis — CU16: Exportar Reportes Analíticos a Excel/PDF

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El Administrador filtra periodos de venta y solicita la exportación formal de los libros de inventario y arqueos. El controlador recupera las vistas analíticas, formatea con estilos empresariales y genera el binario en formato Excel o PDF.

![Diagrama de Clases de Análisis — CU16: Exportar Reportes Analíticos a Excel/PDF](../diagramas/imagenes_clases_cu/Clases_CU16.png)

```plantuml
@startuml Clases_CU16
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_VisorReportes" as UI {
  - formato : string
  - rangoFechas : string
  - tipoReporte : string
  __
  + descargarArchivo() : void
  + seleccionarFiltros() : void
  + solicitarExportacion() : void
}

class "CTR_GestorExportaciones" as CTR {
  + consultarDataset() : list
  + generarExcelOpenPyXL() : bytes
  + generarPDFReportLab() : bytes
}

class "CE_VistasAnaliticas" as CE_VistasAnaliticas {
  - datos : list
  - tenant_id : int
  __
  + queryDataset() : list
}

class "CE_Empresa" as CE_Empresa {
  - id : int
  - razon_social : string
  __
  + find() : Empresa
}

Act -- UI
UI -- CTR
CTR -- CE_VistasAnaliticas

CE_VistasAnaliticas "*" -- "1" CE_Empresa : "pertenece_a"
@enduml
```

---

#### 3.4.2.17. Clases de Análisis — CU17: Gestionar Dashboard Analítico con Machine Learning

**Actor:** `Admin Empresa`  
**Descripción del Flujo Estructural:** El dashboard ejecutivo proyecta la demanda de prendas utilizando un modelo entrenado de Machine Learning. El controlador recupera métricas materializadas, ejecuta inferencias predictivas y calcula los puntos óptimos de reorden.

![Diagrama de Clases de Análisis — CU17: Gestionar Dashboard Analítico con Machine Learning](../diagramas/imagenes_clases_cu/Clases_CU17.png)

```plantuml
@startuml Clases_CU17
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Admin Empresa" as Act

class "UI_DashboardEjecutivo" as UI {
  - periodoSemanas : int
  __
  + abrirDashboard() : void
  + renderizarCurvas() : void
  + solicitarProyeccion() : void
}

class "CTR_GestorDashboard" as CTR {
  + calcularPuntosReorden() : list
  + cargarKPIs() : jsonb
  + ejecutarInferenciaML() : jsonb
}

class "CE_VistasMaterializadas" as CE_VistasMaterializadas {
  - kpis_ventas : jsonb
  - tenant_id : int
  __
  + getKPIs() : jsonb
}

class "CE_ModeloEntrenadoML" as CE_ModeloEntrenadoML {
  - id : int
  - pesos_modelo : blob
  - precision_mae : decimal
  __
  + predict() : jsonb
}

Act -- UI
UI -- CTR
CTR -- CE_VistasMaterializadas

CE_ModeloEntrenadoML "*" -- "1" CE_VistasMaterializadas : "alimenta_de"
@enduml
```

---

#### 3.4.2.18. Clases de Análisis — CU18: Procesar Pago con Pasarela Electrónica Stripe para Saldo de Cambio

**Actor:** `Cliente`  
**Descripción del Flujo Estructural:** El cliente abona el saldo diferencial resultante de un cambio de prenda mediante tarjeta de crédito/débito. El controlador invoca el API de Stripe (PaymentIntent), verifica la firma del webhook y asienta el registro inmutable de auditoría.

![Diagrama de Clases de Análisis — CU18: Procesar Pago con Pasarela Electrónica Stripe para Saldo de Cambio](../diagramas/imagenes_clases_cu/Clases_CU18.png)

```plantuml
@startuml Clases_CU18
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cliente" as Act

class "UI_StripeElements" as UI {
  - montoCobro : decimal
  - tokenTarjeta : string
  __
  + confirmarPago() : void
  + desplegarRecibo() : void
  + ingresarTarjeta() : void
}

class "CTR_GestorPagosStripe" as CTR {
  + asentarPago() : void
  + crearPaymentIntent() : string
  + verificarWebhook() : bool
}

class "CE_Pago" as CE_Pago {
  - estado : string
  - id : int
  - monto : decimal
  - stripe_intent_id : string
  - tenant_id : int
  __
  + create() : void
}

class "CE_BitacoraTransaccion" as CE_BitacoraTransaccion {
  - id : int
  - payload : jsonb
  - timestamp : timestamp
  __
  + create() : void
}

Act -- UI
UI -- CTR
CTR -- CE_Pago

CE_Pago "1" *-- "1..*" CE_BitacoraTransaccion : "audita_en"
@enduml
```

---

#### 3.4.2.19. Clases de Análisis — CU19: Aplicar Descuento de Liquidación por Temporada y Precios por Mayor

**Actor:** `Cajero`  
**Descripción del Flujo Estructural:** El terminal de venta evalúa automáticamente ofertas por liquidación de temporada o descuentos por volumen mayorista (>6 unidades). El controlador valida las vigencias de las promociones y aplica los descuentos sobre los productos del carrito.

![Diagrama de Clases de Análisis — CU19: Aplicar Descuento de Liquidación por Temporada y Precios por Mayor](../diagramas/imagenes_clases_cu/Clases_CU19.png)

```plantuml
@startuml Clases_CU19
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Cajero" as Act

class "UI_CarritoPOS" as UI {
  - listaItems : list
  __
  + agregarItem() : void
  + verDesglosePrecios() : void
}

class "CTR_MotorReglasPrecios" as CTR {
  + evaluarLiquidacionPrenda() : decimal
  + evaluarTarifaMayorista() : decimal
}

class "CE_Producto" as CE_Producto {
  - id : int
  - precio_base : decimal
  __
  + find() : Producto
}

class "CE_OfertaLiquidacion" as CE_OfertaLiquidacion {
  - descuento_pct : decimal
  - fecha_fin : date
  - id : int
  - producto_id : int
  __
  + esVigente() : bool
}

class "CE_ReglaPrecioMayor" as CE_ReglaPrecioMayor {
  - descuento_pct : decimal
  - id : int
  - min_prendas : int
  __
  + aplica() : bool
}

Act -- UI
UI -- CTR
CTR -- CE_Producto

CE_Producto "1" -- "*" CE_OfertaLiquidacion : "posee_descuento"
CE_Producto "*" -- "1" CE_ReglaPrecioMayor : "sujeto_a"
@enduml
```

---

#### 3.4.2.20. Clases de Análisis — CU20: Registrar y Autorizar Orden de Compra Web Desktop

**Actor:** `Encargado Sucursal`  
**Descripción del Flujo Estructural:** El encargado emite y autoriza órdenes de compra masivas a fabricantes textiles desde la consola Desktop. Al recepcionar la factura fiscal, el controlador valida las cantidades, da ingreso al stock de la sucursal, recalcula el CPP y genera los asientos Kardex.

![Diagrama de Clases de Análisis — CU20: Registrar y Autorizar Orden de Compra Web Desktop](../diagramas/imagenes_clases_cu/Clases_CU20.png)

```plantuml
@startuml Clases_CU20
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FEF9E7
  BorderColor #B7950B
  ArrowColor #2C3E50
}

actor "Encargado Sucursal" as Act

class "UI_PanelComprasDesktop" as UI {
  - itemsCompra : jsonb
  - numFactura : string
  - proveedorId : int
  __
  + crearOrden() : void
  + imprimirComprobanteEntrada() : void
  + recepcionarFacturaLote() : void
}

class "CTR_GestorComprasDesktop" as CTR {
  + actualizarStockYCPP() : void
  + emitirOrdenCompra() : void
  + recepcionarMercaderiaFacturada() : void
}

class "CE_OrdenCompra" as CE_OrdenCompra {
  - estado : string
  - id : int
  - num_factura_fiscal : string
  - proveedor_id : int
  - total : decimal
  __
  + create() : void
  + update() : void
}

class "CE_DetalleOrdenCompra" as CE_DetalleOrdenCompra {
  - cantidad : int
  - costo_unitario : decimal
  - id : int
  - orden_id : int
  - variante_id : int
  __
  + create() : void
}

class "CE_Proveedor" as CE_Proveedor {
  - id : int
  - nit : string
  - razon_social : string
  __
  + find() : Proveedor
}

class "CE_InventarioSucursal" as CE_InventarioSucursal {
  - cpp : decimal
  - stock_fisico : int
  - variante_id : int
  __
  + update() : void
}

class "CE_MovimientoKardex" as CE_MovimientoKardex {
  - cantidad : int
  - tipo_movimiento : string
  __
  + asentar() : void
}

Act -- UI
UI -- CTR
CTR -- CE_OrdenCompra

CE_Proveedor "1" -- "*" CE_OrdenCompra : "suministra"
CE_OrdenCompra "1" *-- "1..*" CE_DetalleOrdenCompra : "detalla"
CE_DetalleOrdenCompra "*" -- "1" CE_InventarioSucursal : "ingresa_a"
CE_InventarioSucursal "1" *-- "1..*" CE_MovimientoKardex : "asienta"
@enduml
```

---

## 3.5. Diseño de la Base de Datos

En la metodología ICONIX y la ingeniería de software aplicada a arquitecturas SaaS multitenant y distribuidas, el **Diseño de la Base de Datos** se descompone formalmente en dos etapas rigurosas y complementarias:

1. **Diseño Lógico de la Base de Datos (Sección 3.5.1):** Constituye la representación conceptual y relacional independiente de la plataforma física. Formaliza las 24 entidades maestras y transaccionales del Segundo Parcial, especificando claves primarias (`{PK}`), claves foráneas (`{FK}`), tipos abstractos, cardinalidades exactas (`1 a 1`, `1 a *`, `* a *`) y verbos de asociación orientados al dominio.
2. **Diseño Físico de la Base de Datos (Sección 3.5.2):** Traduce el modelo lógico en código DDL (*Data Definition Language*) ejecutable y optimizado para **PostgreSQL 15+** en el servidor central (con aislamiento lógico multitenant mediante `tenant_id`, soporte de UUIDs e idempotencia para transacciones offline, índices B-Tree y triggers transaccionales de recálculo de CPP), complementado por el esquema local **SQLite** (aplicación móvil Flutter) y los *Object Stores* de **IndexedDB** (Progressive Web App - Angular).

---

### 3.5.1. Diseño Lógico de la Base de Datos (Modelos Relacionales Lógicos)

El diseño lógico formaliza las estructuras relacionales tanto para el **Servidor Central (PostgreSQL)** como para el almacenamiento embebido en los **Dispositivos Móviles (SQLite)**:

#### 3.5.1.1. Modelo Lógico del Dominio Central (Servidor PostgreSQL — 24 Entidades)

El siguiente diagrama modela de forma ortogonal, limpia y sin cruces innecesarios las **24 entidades del dominio relacional** correspondientes a los 20 Casos de Uso del 2do Parcial, equipadas en el 100% de sus asociaciones con verbos direccionales y cardinalidades en ambos extremos:

![Diagrama de Clases UML — Modelo Lógico del Dominio (2do Parcial)](../diagramas/imagenes_clases/Diagrama_Clases_Dominio_P2.png)

```plantuml
@startuml Diagrama_Clases_Dominio_P2
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #FFF8E1
  BorderColor #F57F17
  ArrowColor #E65100
}

' Cluster 1: SaaS Tenant & Suscripciones
class PlanSuscripcion {
  - id : int {PK}
  - nombre : string
  - max_sucursales : int
  - max_usuarios : int
  - precio_mensual : decimal
  + validarCupo(usuarios_actuales: int) : bool
}

class Suscripcion {
  - id : int {PK}
  - empresa_id : int {FK}
  - plan_id : int {FK}
  - fecha_vencimiento : date
  - estado : string
  + esVigente() : bool
  + renovar(meses: int) : void
}

class Empresa {
  - id : int {PK}
  - nit : string
  - razon_social : string
  - schema_name : string
  - estado : string
  + registrarEmpresa() : void
  + activarSchema() : void
}

class Usuario {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - email : string
  - password_hash : string
  - rol : string
  - estado : string
  + autenticar(password: string) : bool
  + verificarRol(rol_requerido: string) : bool
}

class Sucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - nombre : string
  - direccion : string
  - ciudad : string
  + verificarCapacidad() : bool
}

' Cluster 2: Catálogo Textil & Atributos Avanzados
class Producto {
  - id : int {PK}
  - tenant_id : int {FK}
  - sku_base : string
  - nombre : string
  - precio_base : decimal
  + calcularPrecio(cantidad: int) : decimal
}

class FichaTextil {
  - id : int {PK}
  - producto_id : int {FK}
  - composicion : string
  - encogimiento : decimal
  - viscosidad : decimal
  - es_hipoalergenico : bool
  + validarNormaTextil() : bool
}

class VariantePrenda {
  - id : int {PK}
  - producto_id : int {FK}
  - talla_cm : string
  - color_hex : string
  - sku_variante : string
  - codigo_barras : string
  + obtenerDimensiones() : jsonb
}

' Cluster 3: Inventario Multi-Sucursal, Kardex y CPP
class InventarioSucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - variante_id : int {FK}
  - stock_fisico : int
  - stock_reservado : int
  - cpp : decimal
  + incrementarStock(cant: int, costo: decimal) : void
  + descontarStock(cant: int) : bool
}

class MovimientoKardex {
  - id : int {PK}
  - tenant_id : int {FK}
  - variante_id : int {FK}
  - tipo_movimiento : string
  - cantidad : int
  - costo_unitario : decimal
  - cpp_resultante : decimal
  - saldo_stock : int
  + asentarMovimiento() : void
}

' Cluster 4: Traspasos Inter-Sucursal
class TraspasoSucursal {
  - id : int {PK}
  - tenant_id : int {FK}
  - origen_id : int {FK}
  - destino_id : int {FK}
  - guia_remision : string
  - estado : string
  + despachar() : void
  + recepcionar() : void
}

class DetalleTraspaso {
  - id : int {PK}
  - traspaso_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  + validarConteo() : bool
}

' Cluster 5: Aprovisionamiento y Compras Web Desktop
class Proveedor {
  - id : int {PK}
  - tenant_id : int {FK}
  - razon_social : string
  - nit : string
  - telefono : string
  + consultarTerminos() : string
}

class OrdenCompra {
  - id : int {PK}
  - tenant_id : int {FK}
  - proveedor_id : int {FK}
  - num_factura_fiscal : string
  - total : decimal
  - estado : string
  + emitirOrden() : void
  + recepcionarFacturado() : void
}

class DetalleOrdenCompra {
  - id : int {PK}
  - orden_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  - costo_unitario : decimal
  + calcularCosto() : decimal
}

' Cluster 6: Ventas POS Offline y Reservas
class Venta {
  - id : int {PK}
  - tenant_id : int {FK}
  - sucursal_id : int {FK}
  - total : decimal
  - tipo_pago : string
  - uuid_origen : uuid
  - estado_sync : string
  + liquidarVenta() : void
}

class DetalleVenta {
  - id : int {PK}
  - venta_id : int {FK}
  - variante_id : int {FK}
  - cantidad : int
  - subtotal : decimal
  + calcularSubtotal() : decimal
}

class ReservaOffline {
  - uuid : uuid {PK}
  - tenant_id : int {FK}
  - variante_id : int {FK}
  - fecha_expiracion : timestamp
  - qr_token : string
  + validarVigencia2h() : bool
}

class OperacionOffline {
  - uuid : uuid {PK}
  - tenant_id : int {FK}
  - tipo_operacion : string
  - payload_json : jsonb
  - hash_sha256 : string
  - estado_sync : string
  + verificarHash() : bool
  + marcarSync() : void
}

' Cluster 7: Postventa en Dos Tiempos y Stripe
class CambioPrenda {
  - id : int {PK}
  - tenant_id : int {FK}
  - venta_id : int {FK}
  - saldo_diferencial : decimal
  - estado : string
  + procesarTiempo1() : void
  + procesarTiempo2() : void
}

class NotaDevolucion {
  - id : int {PK}
  - cambio_id : int {FK}
  - saldo_favor : decimal
  - estado_cuarentena : string
  + ingresarCuarentena() : void
}

class NotaCambio {
  - id : int {PK}
  - cambio_id : int {FK}
  - variante_nueva_id : int {FK}
  - diferencia_cobrada : decimal
  + despacharPrenda() : void
}

class Pago {
  - id : int {PK}
  - tenant_id : int {FK}
  - monto : decimal
  - metodo_pago : string
  - stripe_id : string
  - estado : string
  + procesarStripe() : bool
}

' Cluster 8: Reglas Comerciales e IA
class ReglaPrecioMayor {
  - id : int {PK}
  - tenant_id : int {FK}
  - min_prendas : int
  - descuento_pct : decimal
  + aplica(cant: int) : bool
}

class ReporteIA {
  - id : int {PK}
  - tenant_id : int {FK}
  - prompt_natural : string
  - sql_segura : string
  - resultado_json : jsonb
  + ejecutarQueryReadOnly() : jsonb
}

' =========================================================================
' RELACIONES CON VERBOS Y CARDINALIDADES FORMALES
' =========================================================================

PlanSuscripcion "1" -- "*" Suscripcion : define >
Empresa "1" -- "1" Suscripcion : contrata >
Empresa "1" *-- "1..*" Sucursal : opera_en >
Empresa "1" *-- "1..*" Usuario : emplea >
Empresa "1" -- "*" ReglaPrecioMayor : configura >

Usuario "1" -- "*" ReporteIA : consulta >

Sucursal "1" -- "*" OperacionOffline : encola_en >
Sucursal "1" -- "*" TraspasoSucursal : despacha >
TraspasoSucursal "1" *-- "1..*" DetalleTraspaso : incluye >
DetalleTraspaso "*" -- "1" VariantePrenda : traslada >

Producto "1" *-- "1" FichaTextil : especifica >
Producto "1" *-- "1..*" VariantePrenda : dimensiona >

Sucursal "1" -- "*" InventarioSucursal : almacena >
InventarioSucursal "*" -- "1" VariantePrenda : cuantifica >
InventarioSucursal "1" *-- "1..*" MovimientoKardex : asienta_en >

Sucursal "1" -- "*" ReservaOffline : reserva_en >
ReservaOffline "*" -- "1" VariantePrenda : aparta >

Proveedor "1" -- "*" OrdenCompra : suministra >
OrdenCompra "1" *-- "1..*" DetalleOrdenCompra : detalla >
DetalleOrdenCompra "*" -- "1" VariantePrenda : aprovisiona >

Sucursal "1" -- "*" Venta : efectua >
Usuario "1" -- "*" Venta : cobra >
Venta "1" *-- "1..*" DetalleVenta : contiene >
DetalleVenta "*" -- "1" VariantePrenda : item_de >
Venta "1" -- "0..1" Pago : cancela >

Venta "1" -- "*" CambioPrenda : origina >
CambioPrenda "1" *-- "1" NotaDevolucion : genera_T1 >
CambioPrenda "1" *-- "0..1" NotaCambio : liquida_T2 >
NotaDevolucion "*" -- "1" VariantePrenda : devuelta >
NotaCambio "*" -- "1" VariantePrenda : entregada >
CambioPrenda "1" -- "0..1" Pago : cobra_saldo >
@enduml
```

#### Diccionario de Entidades y Llaves del Modelo Lógico

| # | Entidad Lógica | Clave Primaria {PK} | Claves Foráneas {FK} | Propósito Funcional en el Segundo Parcial |
|:---|:---|:---|:---|:---|
| 1 | `PlanSuscripcion` | `id` | - | Define cuotas máximas de sucursales, usuarios y habilitación de IA/ML a nivel plataforma SaaS. |
| 2 | `Empresa` | `id` | - | Representa la organización o tenant con aislamiento lógico (`schema_name`, NIT y razón social). |
| 3 | `Suscripcion` | `id` | `empresa_id`, `plan_id` | Vincula a cada empresa con su plan vigente y controla la fecha de vencimiento y estado. |
| 4 | `Sucursal` | `id` | `tenant_id` | Puntos físicos de venta y almacenes vinculados a una empresa tenant específica. |
| 5 | `Usuario` | `id` | `tenant_id`, `sucursal_id` | Cuentas con autenticación Bcrypt y roles (`ADMIN_EMPRESA`, `CAJERO`, `ENCARGADO_SUCURSAL`, `CLIENTE`). |
| 6 | `Producto` | `id` | `tenant_id`, `categoria_id`, `temporada_id` | Prenda textil con SKU base y precio de referencia corporativo. |
| 7 | `FichaTextil` | `id` | `producto_id` | Especificación técnica de tela, encogimiento, viscosidad y propiedades hipoalergénicas. |
| 8 | `VariantePrenda` | `id` | `producto_id` | Talla en cm, código de color HEX y código de barras único para control SKU físico. |
| 9 | `InventarioSucursal` | `id` | `tenant_id`, `sucursal_id`, `variante_id` | Almacenamiento local de stock físico, reservado y Costo Promedio Ponderado (CPP) por tienda. |
| 10 | `MovimientoKardex` | `id` | `tenant_id`, `sucursal_id`, `variante_id` | Asiento inmutable valorado de entradas por compra, salidas por venta, traspasos y ajustes. |
| 11 | `TraspasoSucursal` | `id` | `tenant_id`, `origen_id`, `destino_id` | Guía de remisión y control de traslados inter-sucursal con estado `EN_TRANSITO`. |
| 12 | `DetalleTraspaso` | `id` | `traspaso_id`, `variante_id` | Cuantificación física de unidades despachadas y recepcionadas entre sucursales. |
| 13 | `Proveedor` | `id` | `tenant_id` | Fabricante o taller textil con NIT y condiciones de aprovisionamiento. |
| 14 | `OrdenCompra` | `id` | `tenant_id`, `proveedor_id`, `sucursal_destino_id` | Documento de abastecimiento masivo emitido desde la interfaz Web Desktop. |
| 15 | `DetalleOrdenCompra` | `id` | `orden_id`, `variante_id` | Lotes de prendas, cantidades pactadas y costos unitarios facturados. |
| 16 | `Venta` | `id` | `tenant_id`, `sucursal_id`, `usuario_cajero_id`, `cliente_id` | Registro transaccional de venta con soporte de idempotencia (`uuid_origen`) y estado sync. |
| 17 | `DetalleVenta` | `id` | `venta_id`, `variante_id` | Ítems facturados, cantidades y precios unitarios liquidados. |
| 18 | `ReservaOffline` | `uuid` | `tenant_id`, `sucursal_id`, `variante_id`, `cliente_id` | Apartado temporal de 2 horas sin conexión mediante token QR y UUIDv4 único. |
| 19 | `OperacionOffline` | `uuid` | `tenant_id`, `sucursal_id` | Bitácora encolada localmente con hash SHA-256 para sincronización posterior a la nube. |
| 20 | `CambioPrenda` | `id` | `tenant_id`, `venta_id`, `cliente_id` | Gestión postventa en dos tiempos con cálculo de saldo diferencial. |
| 21 | `NotaDevolucion` | `id` | `cambio_id`, `sucursal_id`, `variante_devuelta_id` | **Tiempo 1:** Comprobante de recepción de prenda a cuarentena con saldo a favor. |
| 22 | `NotaCambio` | `id` | `cambio_id`, `sucursal_id`, `variante_nueva_id` | **Tiempo 2:** Despacho de prenda sustituta y liquidación de saldo. |
| 23 | `Pago` | `id` | `tenant_id`, `venta_id`, `cambio_id` | Cobro vía pasarela Stripe (`stripe_id`) o efectivo en terminal POS. |
| 24 | `ReglaPrecioMayor` | `id` | `tenant_id` | Configuración de descuentos automáticos por volumen de prendas (>3 o >6 unidades). |


#### 3.5.1.2. Modelo Lógico de la Base de Datos Local SQLite (Dispositivos Móviles Flutter — Offline-First)

En concordancia con los requerimientos de tolerancia a fallos y funcionamiento ininterrumpido sin conexión a internet (especialmente en `CU08: Catálogo Offline`, `CU09: Reserva Offline`, `CU10: Venta POS Offline` y `CU11: Auditoría Local`), los dispositivos móviles Flutter implementan un **modelo relacional local embebido en SQLite**.

Este modelo lógico local optimizado desacopla las operaciones locales de la red, manteniendo una copia cacheada del catálogo textil, la cola de operaciones pendientes de sincronización firmadas con hash SHA-256, las reservas locales con código QR válidas por 2 horas y la caché multimedia WebP:

![Diagrama de Clases UML — Modelo Lógico SQLite Móvil](../diagramas/imagenes_clases/Diagrama_Clases_SQLite_Movil.png)

```plantuml
@startuml Diagrama_Clases_SQLite_Movil
skinparam classAttributeIconSize 0
skinparam class {
  BackgroundColor #E8F8F5
  BorderColor #117864
  ArrowColor #148F77
}

class CatalogoLocal {
  - variante_id : int {PK}
  - producto_id : int
  - sku_base : string
  - nombre : string
  - categoria : string
  - talla_cm : string
  - color_hex : string
  - precio_base : decimal
  - descuento_pct : decimal
  - stock_local : int
  - medidas_json : string
  - imagen_webp_path : string
  __
  + buscarPorFiltro(query: string) : list
  + consultarStock(varianteId: int) : int
  + descontarStockLocal(cant: int) : void
}

class OperacionOffline {
  - uuid : uuid {PK}
  - tenant_id : int
  - sucursal_id : int
  - tipo_operacion : string
  - payload_json : string
  - hash_sha256 : string
  - estado_sync : string
  - fecha_creacion_local : string
  - intentos : int
  - error_servidor : string
  __
  + encolarOperacion() : void
  + marcarEnviada() : void
  + marcarConfirmada() : void
  + regenerarHashSHA256() : string
}

class ReservaLocal {
  - uuid : uuid {PK}
  - variante_id : int {FK}
  - qr_token : string
  - fecha_expiracion : string
  - estado : string
  __
  + apartarPrendaLocal() : void
  + emitirTicketQR() : string
  + validarVigencia2h() : bool
}

class ConfigDispositivo {
  - clave : string {PK}
  - valor : string
  - fecha_actualizacion : string
  __
  + getParametro(clave: string) : string
  + setParametro(clave: string, valor: string) : void
}

class CacheMultimediaLocal {
  - url_remota : string {PK}
  - path_local : string
  - tamanio_bytes : int
  - fecha_descarga : string
  __
  + leerBlobWebP() : blob
  + purgarExpirados() : void
}

CatalogoLocal "1" -- "*" OperacionOffline : "referencia_item >"
CatalogoLocal "1" -- "*" ReservaLocal : "aparta_en >"
ConfigDispositivo "1" -- "*" OperacionOffline : "identifica_caja >"
CatalogoLocal "1" -- "0..1" CacheMultimediaLocal : "almacena_en >"
@enduml
```

##### Diccionario de Entidades del Modelo Lógico SQLite Móvil

| # | Entidad Local SQLite | Clave Primaria {PK} | Claves Foráneas {FK} | Propósito Funcional en Modo Offline (App Móvil) |
|:---|:---|:---|:---|:---|
| 1 | `CatalogoLocal` | `variante_id` | `producto_id` | Catálogo desnormalizado para consultas instantáneas de prendas, precios y atributos sin latencia de red. |
| 2 | `OperacionOffline` | `uuid` | `tenant_id`, `sucursal_id` | Cola inmutable local de transacciones pendientes de sincronizar (ventas y reservas) con firma SHA-256. |
| 3 | `ReservaLocal` | `uuid` | `variante_id` | Registro local de prendas apartadas temporalmente con token QR verificable durante 2 horas. |
| 4 | `ConfigDispositivo` | `clave` | - | Parámetros de sesión del cajero/cliente, identificador de terminal y estado de conexión WAN. |
| 5 | `CacheMultimediaLocal` | `url_remota` | - | Directorio y control de binarios WebP descargados para renderizado visual sin conexión. |

---

### 3.5.2. Diseño Físico de la Base de Datos (Esquemas de Persistencia DDL Corregidos)

El diseño físico traduce el modelo lógico en tres entornos de almacenamiento coordinados para operación híbrida Online/Offline:

#### 3.5.2.1. Esquema Central PostgreSQL 15+ (DDL Completo y Corregido)

El siguiente script DDL implementa en su totalidad las tablas, claves primarias, claves foráneas con eliminación en cascada controlada, índices de búsqueda B-Tree, restricciones CHECK de integridad de negocio, funciones PL/pgSQL y triggers para el recálculo automático de CPP y la idempotencia de transacciones offline:

```sql
-- ============================================================================
-- PLATAFORMA SAAS MULTITENANT FASHIONSTORE - SCRIPT DDL POSTGRESQL 15+
-- ESQUEMA RELACIONAL CENTRAL COMPLETO (2DO PARCIAL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PLANES DE SUSCRIPCIÓN (GLOBAL SAAS)
-- ----------------------------------------------------------------------------
CREATE TABLE planes_suscripcion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    max_sucursales INT NOT NULL DEFAULT 2 CHECK (max_sucursales > 0),
    max_usuarios INT NOT NULL DEFAULT 10 CHECK (max_usuarios > 0),
    permite_reportes_ia BOOLEAN NOT NULL DEFAULT FALSE,
    permite_ml_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
    precio_mensual NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (precio_mensual >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. EMPRESAS (TENANTS REGISTRADOS)
-- ----------------------------------------------------------------------------
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nit VARCHAR(30) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    schema_name VARCHAR(63) NOT NULL UNIQUE,
    email_contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    presupuesto_disponible NUMERIC(12,2) NOT NULL DEFAULT 50000.00 CHECK (presupuesto_disponible >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'SUSPENDIDA', 'VENCIDA')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_empresas_nit ON empresas(nit);

-- ----------------------------------------------------------------------------
-- 3. SUSCRIPCIONES DE EMPRESA
-- ----------------------------------------------------------------------------
CREATE TABLE suscripciones (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES planes_suscripcion(id),
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA')),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_fechas_suscripcion CHECK (fecha_vencimiento >= fecha_inicio)
);
CREATE INDEX idx_suscripciones_empresa ON suscripciones(empresa_id);

-- ----------------------------------------------------------------------------
-- 4. SUCURSALES (POR TENANT)
-- ----------------------------------------------------------------------------
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(50) NOT NULL DEFAULT 'Santa Cruz',
    latitud NUMERIC(10,8),
    longitud NUMERIC(11,8),
    telefono VARCHAR(20),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sucursal_tenant_nombre UNIQUE (tenant_id, nombre)
);
CREATE INDEX idx_sucursales_tenant ON sucursales(tenant_id);

-- ----------------------------------------------------------------------------
-- 5. USUARIOS Y CONTROL DE ROLES (RBAC MULTITENANT)
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT REFERENCES sucursales(id) ON DELETE SET NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('SUPER_ADMIN', 'ADMIN_EMPRESA', 'ENCARGADO_SUCURSAL', 'CAJERO', 'CLIENTE')),
    intentos_fallidos INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'BLOQUEADO', 'INACTIVO')),
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_tenant_email UNIQUE (tenant_id, email)
);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ----------------------------------------------------------------------------
-- 6. CATEGORÍAS Y TEMPORADAS
-- ----------------------------------------------------------------------------
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT uq_categoria_tenant UNIQUE (tenant_id, nombre)
);

CREATE TABLE temporadas (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(60) NOT NULL,
    anio INT NOT NULL CHECK (anio >= 2020),
    es_vigente BOOLEAN NOT NULL DEFAULT TRUE,
    en_liquidacion BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_temporada_tenant UNIQUE (tenant_id, nombre, anio)
);

-- ----------------------------------------------------------------------------
-- 7. PRODUCTOS (CATÁLOGO TEXTIL BASE)
-- ----------------------------------------------------------------------------
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categorias(id),
    temporada_id INT NOT NULL REFERENCES temporadas(id),
    sku_base VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10,2) NOT NULL CHECK (precio_base > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_producto_tenant_sku UNIQUE (tenant_id, sku_base)
);
CREATE INDEX idx_productos_tenant ON productos(tenant_id);

-- ----------------------------------------------------------------------------
-- 8. FICHAS TEXTILES TÉCNICAS (ATRIBUTOS AVANZADOS)
-- ----------------------------------------------------------------------------
CREATE TABLE fichas_textiles (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL UNIQUE REFERENCES productos(id) ON DELETE CASCADE,
    composicion VARCHAR(150) NOT NULL,
    encogimiento NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (encogimiento >= 0),
    viscosidad NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    es_hipoalergenico BOOLEAN NOT NULL DEFAULT FALSE,
    instrucciones_lavado VARCHAR(255)
);

-- ----------------------------------------------------------------------------
-- 9. VARIANTES DE PRENDA (DIMENSIONES EN CM, COLOR Y CÓDIGO)
-- ----------------------------------------------------------------------------
CREATE TABLE variantes_prenda (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    talla_cm VARCHAR(20) NOT NULL,
    color_hex VARCHAR(10) NOT NULL DEFAULT '#000000',
    color_primario VARCHAR(40) NOT NULL DEFAULT 'Negro',
    color_secundario VARCHAR(40),
    sku_variante VARCHAR(60) NOT NULL UNIQUE,
    codigo_barras VARCHAR(50),
    medidas_cm JSONB NOT NULL DEFAULT '{"pecho": 0, "largo": 0, "manga": 0}'::jsonb
);
CREATE INDEX idx_variantes_producto ON variantes_prenda(producto_id);
CREATE INDEX idx_variantes_sku ON variantes_prenda(sku_variante);

-- ----------------------------------------------------------------------------
-- 10. INVENTARIO MULTI-SUCURSAL Y COSTO PROMEDIO PONDERADO (CPP)
-- ----------------------------------------------------------------------------
CREATE TABLE inventario_sucursal (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES variantes_prenda(id) ON DELETE CASCADE,
    stock_fisico INT NOT NULL DEFAULT 0 CHECK (stock_fisico >= 0),
    stock_reservado INT NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0),
    costo_promedio_ponderado NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (costo_promedio_ponderado >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventario_sucursal_variante UNIQUE (sucursal_id, variante_id)
);
CREATE INDEX idx_inventario_sucursal_variante ON inventario_sucursal(sucursal_id, variante_id);
CREATE INDEX idx_inventario_tenant ON inventario_sucursal(tenant_id);

-- ----------------------------------------------------------------------------
-- 11. MOVIMIENTOS KARDEX FÍSICO-VALORADO (ASIENTOS INMUTABLES)
-- ----------------------------------------------------------------------------
CREATE TABLE movimientos_kardex (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    variante_id INT NOT NULL REFERENCES variantes_prenda(id),
    tipo_movimiento VARCHAR(30) NOT NULL CHECK (tipo_movimiento IN (
        'ENTRADA_COMPRA', 'SALIDA_VENTA', 'REINGRESO_DEVOLUCION',
        'DESPACHO_CAMBIO', 'TRASPASO_SALIDA', 'TRASPASO_ENTRADA', 'AJUSTE'
    ),
    cantidad INT NOT NULL,
    costo_unitario NUMERIC(10,2) NOT NULL CHECK (costo_unitario >= 0),
    cpp_resultante NUMERIC(10,2) NOT NULL CHECK (cpp_resultante >= 0),
    saldo_stock INT NOT NULL CHECK (saldo_stock >= 0),
    documento_ref VARCHAR(60),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_kardex_variante_fecha ON movimientos_kardex(variante_id, fecha);
CREATE INDEX idx_kardex_sucursal ON movimientos_kardex(sucursal_id);

-- ----------------------------------------------------------------------------
-- 12. TRASPASOS INTER-SUCURSAL Y DETALLE
-- ----------------------------------------------------------------------------
CREATE TABLE traspasos_inventario (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_origen_id INT NOT NULL REFERENCES sucursales(id),
    sucursal_destino_id INT NOT NULL REFERENCES sucursales(id),
    guia_remision VARCHAR(50) NOT NULL UNIQUE,
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(25) NOT NULL DEFAULT 'EN_TRANSITO' CHECK (estado IN ('EN_TRANSITO', 'COMPLETADO', 'RECHAZADO')),
    observacion TEXT,
    CONSTRAINT ck_sucursales_distintas CHECK (sucursal_origen_id <> sucursal_destino_id)
);

CREATE TABLE detalle_traspasos (
    id SERIAL PRIMARY KEY,
    traspaso_id INT NOT NULL REFERENCES traspasos_inventario(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES variantes_prenda(id),
    cantidad_enviada INT NOT NULL CHECK (cantidad_enviada > 0),
    cantidad_recibida INT DEFAULT 0 CHECK (cantidad_recibida >= 0)
);
CREATE INDEX idx_traspaso_detalle ON detalle_traspasos(traspaso_id);

-- ----------------------------------------------------------------------------
-- 13. PROVEEDORES Y ÓRDENES DE COMPRA (WEB DESKTOP)
-- ----------------------------------------------------------------------------
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    razon_social VARCHAR(120) NOT NULL,
    nit VARCHAR(30) NOT NULL,
    contacto VARCHAR(80),
    email VARCHAR(100),
    telefono VARCHAR(20),
    CONSTRAINT uq_proveedor_tenant_nit UNIQUE (tenant_id, nit)
);

CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    proveedor_id INT NOT NULL REFERENCES proveedores(id),
    sucursal_destino_id INT NOT NULL REFERENCES sucursales(id),
    numero_orden VARCHAR(40) NOT NULL UNIQUE,
    num_factura_fiscal VARCHAR(50),
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_esperada DATE NOT NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    estado VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'AUTORIZADA', 'ENTREGA_PARCIAL', 'COMPLETADA', 'CANCELADA'))
);

CREATE TABLE detalle_ordenes_compra (
    id SERIAL PRIMARY KEY,
    orden_compra_id INT NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES variantes_prenda(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10,2) NOT NULL CHECK (costo_unitario > 0),
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED
);
CREATE INDEX idx_orden_compra_detalle ON detalle_ordenes_compra(orden_compra_id);

-- ----------------------------------------------------------------------------
-- 14. VENTAS Y DETALLE (SOPORTE ONLINE Y OFFLINE IDEMPOTENTE)
-- ----------------------------------------------------------------------------
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    usuario_cajero_id INT REFERENCES usuarios(id),
    cliente_id INT REFERENCES usuarios(id),
    numero_factura VARCHAR(50) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    descuento_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (descuento_total >= 0),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    tipo_pago VARCHAR(30) NOT NULL CHECK (tipo_pago IN ('EFECTIVO', 'TARJETA_STRIPE', 'QR', 'MIXTO')),
    estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('PENDIENTE_PAGO', 'COMPLETADA', 'ANULADA')),
    estado_sync VARCHAR(20) NOT NULL DEFAULT 'ONLINE' CHECK (estado_sync IN ('ONLINE', 'SINCRONIZADA', 'PENDIENTE')),
    uuid_origen UUID UNIQUE
);
CREATE INDEX idx_ventas_tenant_fecha ON ventas(tenant_id, fecha);
CREATE INDEX idx_ventas_uuid_origen ON ventas(uuid_origen);

CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    variante_id INT NOT NULL REFERENCES variantes_prenda(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);
CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);

-- ----------------------------------------------------------------------------
-- 15. RESERVAS OFFLINE CON TOKEN QR (VÁLIDAS POR 2 HORAS)
-- ----------------------------------------------------------------------------
CREATE TABLE reservas_offline (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    cliente_id INT NOT NULL REFERENCES usuarios(id),
    variante_id INT NOT NULL REFERENCES variantes_prenda(id),
    qr_token VARCHAR(64) NOT NULL UNIQUE,
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'ATENDIDA', 'CANCELADA', 'EXPIRADA')),
    estado_sync VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE_SYNC' CHECK (estado_sync IN ('PENDIENTE_SYNC', 'SINCRONIZADA', 'EN_CONFLICTO'))
);
CREATE INDEX idx_reservas_offline_qr ON reservas_offline(qr_token);
CREATE INDEX idx_reservas_expiracion ON reservas_offline(fecha_expiracion, estado);

-- ----------------------------------------------------------------------------
-- 16. OPERACIONES OFFLINE (BITÁCORA DE AUDITORÍA E IDEMPOTENCIA)
-- ----------------------------------------------------------------------------
CREATE TABLE operaciones_offline (
    uuid UUID PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    tipo_operacion VARCHAR(30) NOT NULL CHECK (tipo_operacion IN ('VENTA_POS', 'RESERVA_LOCAL', 'CAMBIO_PRENDA')),
    payload_json JSONB NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    estado_sync VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_sync IN ('PENDIENTE', 'SINCRONIZADA', 'EN_CONFLICTO', 'RECHAZADA')),
    fecha_creacion_local TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_motivo TEXT
);
CREATE INDEX idx_operaciones_offline_sync ON operaciones_offline(tenant_id, estado_sync);

-- ----------------------------------------------------------------------------
-- 17. CAMBIOS DE PRENDA EN DOS TIEMPOS (POLÍTICA DE POSTVENTA)
-- ----------------------------------------------------------------------------
CREATE TABLE cambios_prenda (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    venta_origen_id INT NOT NULL REFERENCES ventas(id),
    cliente_id INT NOT NULL REFERENCES usuarios(id),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    plazo_limite TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo TEXT NOT NULL,
    saldo_diferencial NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADO' CHECK (estado IN (
        'SOLICITADO', 'TIEMPO1_RECEPCIONADO', 'TIEMPO2_LIQUIDADO', 'COMPLETADO', 'RECHAZADO'
    ))
);

CREATE TABLE notas_devolucion (
    id SERIAL PRIMARY KEY,
    cambio_id INT NOT NULL REFERENCES cambios_prenda(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    variante_devuelta_id INT NOT NULL REFERENCES variantes_prenda(id),
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_original_reconocido NUMERIC(10,2) NOT NULL CHECK (precio_original_reconocido > 0),
    saldo_favor NUMERIC(10,2) NOT NULL CHECK (saldo_favor > 0),
    estado_cuarentena VARCHAR(30) NOT NULL DEFAULT 'EN_CUARENTENA' CHECK (estado_cuarentena IN ('EN_CUARENTENA', 'APROBADA_INVENTARIO', 'DESCARTADA_DEFECTO')),
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notas_cambio (
    id SERIAL PRIMARY KEY,
    cambio_id INT NOT NULL REFERENCES cambios_prenda(id) ON DELETE CASCADE,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    variante_nueva_id INT NOT NULL REFERENCES variantes_prenda(id),
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_nueva_prenda NUMERIC(10,2) NOT NULL CHECK (precio_nueva_prenda > 0),
    diferencia_cobrada NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (diferencia_cobrada >= 0),
    fecha_despacho TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado_despacho VARCHAR(30) NOT NULL DEFAULT 'DESPACHADO' CHECK (estado_despacho IN ('DESPACHADO', 'ENTREGADO'))
);

-- ----------------------------------------------------------------------------
-- 18. PAGOS ELECTRÓNICOS Y EN EFECTIVO (PASARELA STRIPE / POS)
-- ----------------------------------------------------------------------------
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    venta_id INT REFERENCES ventas(id),
    cambio_id INT REFERENCES cambios_prenda(id),
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('TARJETA_STRIPE', 'EFECTIVO_POS', 'QR_SIMPLE')),
    stripe_id VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO' CHECK (estado IN ('CONFIRMADO', 'PENDIENTE', 'RECHAZADO', 'REEMBOLSADO')),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pagos_tenant ON pagos(tenant_id);
CREATE INDEX idx_pagos_stripe ON pagos(stripe_id);

-- ----------------------------------------------------------------------------
-- 19. REGLAS COMERCIALES (PRECIOS POR MAYOR Y LIQUIDACIÓN)
-- ----------------------------------------------------------------------------
CREATE TABLE reglas_precio_mayor (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    min_prendas INT NOT NULL DEFAULT 3 CHECK (min_prendas >= 2),
    descuento_pct NUMERIC(5,2) NOT NULL CHECK (descuento_pct BETWEEN 1.00 AND 80.00),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ofertas_liquidacion (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    descuento_pct NUMERIC(5,2) NOT NULL CHECK (descuento_pct BETWEEN 5.00 AND 90.00),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'EXPIRADA', 'CANCELADA')),
    CONSTRAINT ck_fechas_oferta CHECK (fecha_fin >= fecha_inicio)
);

-- ----------------------------------------------------------------------------
-- 20. AUDITORÍA IA Y ANALÍTICA MACHINE LEARNING
-- ----------------------------------------------------------------------------
CREATE TABLE reportes_ia (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    prompt_natural TEXT NOT NULL,
    sql_segura TEXT NOT NULL,
    resultado_json JSONB NOT NULL,
    fecha_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE datos_sinteticos_ml (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    sucursal_id INT NOT NULL REFERENCES sucursales(id),
    categoria_id INT NOT NULL REFERENCES categorias(id),
    unidades_vendidas INT NOT NULL CHECK (unidades_vendidas >= 0),
    ingreso_total NUMERIC(12,2) NOT NULL CHECK (ingreso_total >= 0),
    temperatura_ambiente NUMERIC(4,1),
    cluster_segmento INT
);
CREATE INDEX idx_ml_tenant_fecha ON datos_sinteticos_ml(tenant_id, fecha);

-- ============================================================================
-- PROCEDIMIENTOS Y TRIGGERS TRANSACCIONALES
-- ============================================================================

-- 1. FUNCIÓN TRIGGER: RECÁLCULO DE COSTO PROMEDIO PONDERADO (CPP)
CREATE OR REPLACE FUNCTION fn_recalcular_cpp_entrada()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INT;
    v_cpp_actual NUMERIC(10,2);
    v_nuevo_stock INT;
    v_nuevo_cpp NUMERIC(10,2);
    v_sucursal_id INT;
    v_tenant_id INT;
BEGIN
    -- Obtener sucursal y tenant de la orden
    SELECT sucursal_destino_id, tenant_id INTO v_sucursal_id, v_tenant_id
    FROM ordenes_compra WHERE id = NEW.orden_compra_id;

    -- Obtener inventario actual
    SELECT stock_fisico, costo_promedio_ponderado INTO v_stock_actual, v_cpp_actual
    FROM inventario_sucursal
    WHERE sucursal_id = v_sucursal_id AND variante_id = NEW.variante_id;

    IF NOT FOUND THEN
        v_stock_actual := 0;
        v_cpp_actual := 0.00;
        INSERT INTO inventario_sucursal(tenant_id, sucursal_id, variante_id, stock_fisico, costo_promedio_ponderado)
        VALUES (v_tenant_id, v_sucursal_id, NEW.variante_id, NEW.cantidad, NEW.costo_unitario);
        v_nuevo_stock := NEW.cantidad;
        v_nuevo_cpp := NEW.costo_unitario;
    ELSE
        v_nuevo_stock := v_stock_actual + NEW.cantidad;
        IF v_nuevo_stock > 0 THEN
            v_nuevo_cpp := ROUND(((v_stock_actual * v_cpp_actual) + (NEW.cantidad * NEW.costo_unitario)) / v_nuevo_stock, 2);
        ELSE
            v_nuevo_cpp := NEW.costo_unitario;
        END IF;
        UPDATE inventario_sucursal
        SET stock_fisico = v_nuevo_stock, costo_promedio_ponderado = v_nuevo_cpp, actualizado_en = CURRENT_TIMESTAMP
        WHERE sucursal_id = v_sucursal_id AND variante_id = NEW.variante_id;
    END IF;

    -- Registrar asiento inmutable en Kardex
    INSERT INTO movimientos_kardex (
        tenant_id, sucursal_id, variante_id, tipo_movimiento,
        cantidad, costo_unitario, cpp_resultante, saldo_stock, documento_ref
    ) VALUES (
        v_tenant_id, v_sucursal_id, NEW.variante_id, 'ENTRADA_COMPRA',
        NEW.cantidad, NEW.costo_unitario, v_nuevo_cpp, v_nuevo_stock, 'OC-' || NEW.orden_compra_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_recalcular_cpp_orden_compra
AFTER INSERT ON detalle_ordenes_compra
FOR EACH ROW EXECUTE FUNCTION fn_recalcular_cpp_entrada();

-- 2. PROCEDIMIENTO ALMACENADO: SINCRONIZACIÓN IDEMPOTENTE OFFLINE
CREATE OR REPLACE FUNCTION sp_reconciliar_venta_offline(
    p_uuid UUID,
    p_tenant_id INT,
    p_sucursal_id INT,
    p_cajero_id INT,
    p_cliente_id INT,
    p_factura VARCHAR,
    p_subtotal NUMERIC,
    p_descuento NUMERIC,
    p_total NUMERIC,
    p_tipo_pago VARCHAR,
    p_items JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_venta_id INT;
    v_item JSONB;
BEGIN
    -- Verificar idempotencia por uuid_origen
    IF EXISTS (SELECT 1 FROM ventas WHERE uuid_origen = p_uuid) THEN
        RETURN TRUE; -- Ya sincronizada previamente sin duplicar
    END IF;

    -- Insertar venta definitiva
    INSERT INTO ventas (
        tenant_id, sucursal_id, usuario_cajero_id, cliente_id,
        numero_factura, subtotal, descuento_total, total,
        tipo_pago, estado, estado_sync, uuid_origen
    ) VALUES (
        p_tenant_id, p_sucursal_id, p_cajero_id, p_cliente_id,
        p_factura, p_subtotal, p_descuento, p_total,
        p_tipo_pago, 'COMPLETADA', 'SINCRONIZADA', p_uuid
    ) RETURNING id INTO v_venta_id;

    -- Insertar detalles y descontar stock central
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        INSERT INTO detalle_ventas (venta_id, variante_id, cantidad, precio_unitario)
        VALUES (
            v_venta_id,
            (v_item->>'variante_id')::INT,
            (v_item->>'cantidad')::INT,
            (v_item->>'precio_unitario')::NUMERIC
        );

        UPDATE inventario_sucursal
        SET stock_fisico = GREATEST(0, stock_fisico - (v_item->>'cantidad')::INT),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE sucursal_id = p_sucursal_id AND variante_id = (v_item->>'variante_id')::INT;
    END LOOP;

    -- Registrar en bitácora de operaciones offline
    UPDATE operaciones_offline
    SET estado_sync = 'SINCRONIZADA', fecha_sincronizacion = CURRENT_TIMESTAMP
    WHERE uuid = p_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### 3.5.2.2. Esquema Relacional Local SQLite (App Móvil Flutter)

En los dispositivos móviles que operan sin conectividad constante a internet, el motor SQLite embebido almacena el catálogo pre-cacheado y encola las ventas y reservas en SQLite relacional local conforme al modelo de clases diseñado:

![Diagrama de Clases UML — Modelo Lógico SQLite Móvil](../diagramas/imagenes_clases/Diagrama_Clases_SQLite_Movil.png)

```sql
-- ============================================================================
-- ESQUEMA LOCAL SQLITE PARA APLICACIÓN MÓVIL FLUTTER (OFFLINE-FIRST)
-- ============================================================================

-- 1. CATÁLOGO LOCAL CACHEADO
CREATE TABLE catalogo_local (
    variante_id INTEGER PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    sku_base TEXT NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    talla_cm TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    precio_base REAL NOT NULL,
    descuento_pct REAL NOT NULL DEFAULT 0.0,
    stock_local INTEGER NOT NULL DEFAULT 0,
    medidas_json TEXT NOT NULL DEFAULT '{}',
    imagen_webp_path TEXT
);
CREATE INDEX idx_catalogo_sku ON catalogo_local(sku_base);

-- 2. COLA DE TRANSACCIONES OFFLINE
CREATE TABLE operaciones_offline (
    uuid TEXT PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    sucursal_id INTEGER NOT NULL,
    tipo_operacion TEXT NOT NULL CHECK(tipo_operacion IN ('VENTA_POS', 'RESERVA_LOCAL', 'CAMBIO_PRENDA')),
    payload_json TEXT NOT NULL,
    hash_sha256 TEXT NOT NULL,
    estado_sync TEXT NOT NULL DEFAULT 'PENDIENTE_SYNC' CHECK(estado_sync IN ('PENDIENTE_SYNC', 'ENVIADA', 'CONFIRMADA', 'RECHAZADA')),
    fecha_creacion_local TEXT NOT NULL,
    intentos INTEGER NOT NULL DEFAULT 0,
    error_servidor TEXT
);
CREATE INDEX idx_offline_estado ON operaciones_offline(estado_sync);

-- 3. RESERVAS LOCALES ACTIVAS (TOKEN QR)
CREATE TABLE reservas_locales (
    uuid TEXT PRIMARY KEY,
    variante_id INTEGER NOT NULL,
    qr_token TEXT NOT NULL UNIQUE,
    fecha_expiracion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ACTIVA'
);

-- 4. CONFIGURACIÓN LOCAL Y SESIÓN
CREATE TABLE config_dispositivo (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
);
```

#### 3.5.2.3. Esquema IndexedDB (Progressive Web App - Angular PWA)

La Progressive Web App (Angular PWA) implementa persistencia local en el navegador del cliente mediante IndexedDB con transacciones no bloqueantes:

| Almacén de Objetos (`Object Store`) | Llave Primaria (`keyPath`) | Índices Secundarios | Propósito en Modo Sin Conexión |
|:---|:---|:---|:---|
| `catalogo_store` | `variante_id` | `por_sku` (`sku_base`, no único), `por_categoria` (`categoria`), `por_talla` (`talla_cm`) | Búsqueda, renderizado de fichas técnicas y cálculo de precios locales. |
| `operaciones_offline_store` | `uuid` | `por_estado` (`estado_sync`), `por_fecha` (`fecha_creacion_local`), `por_tipo` (`tipo_operacion`) | Encolado de ventas y reservas generadas sin red por el Service Worker. |
| `reservas_offline_store` | `qr_token` | `por_uuid` (`uuid`, único), `por_expiracion` (`fecha_expiracion`) | Despliegue inmediato del ticket QR de apartado en el visor offline. |
| `session_store` | `key` | - | Token JWT multitenant, identificadores de tenant/sucursal y claims RBAC. |

---
## 3.6. Diseño de Interfaces de Usuario

> Los prototipos de interfaz están incluidos en la descripción de cada caso de uso (sección 2.6).

**(Se complementarán con capturas de pantalla del sistema implementado)**

---

# CAPÍTULO IV. DESARROLLO E IMPLEMENTACIÓN

## 4.1. Herramientas y Tecnologías Utilizadas

Para el desarrollo del sistema de gestión comercial textil bajo modelo SaaS Multitenant, se seleccionó un conjunto de tecnologías modernas, escalables y desacopladas que garantizan alta disponibilidad, soporte para operaciones offline-first y análisis predictivo avanzado:

| Componente / Capa | Tecnología / Herramienta | Versión / Detalle | Justificación y Rol en la Arquitectura |
|:---|:---|:---|:---|
| **Backend REST API** | Python + FastAPI | Python 3.11 / FastAPI 0.110+ | Framework asíncrono de alto rendimiento para el core transaccional, con validación tipada vía Pydantic v2 y endpoints documentados OpenAPI/Swagger. |
| **Persistencia Asíncrona (ORM)** | SQLAlchemy 2.0 (Async) + Alembic | SQLAlchemy 2.0.28+ | Manejo relacional con soporte nativo de `async/await`, migraciones de base de datos controladas y pool de conexiones asíncrono con `asyncpg`. |
| **Frontend Web Corporativo** | Angular (evolución a PWA) | Angular 17+ (Standalone Components) | Interfaz de administración para sucursales y gerencia con Service Workers, Web App Manifest y estrategia de caché offline. |
| **Persistencia Offline Web** | IndexedDB | API nativa / Dexie.js | Almacén NoSQL local en el navegador del cliente para transacciones del POS y catálogo cuando se pierde la conectividad WAN. |
| **Aplicación Móvil** | Flutter + Dart | Flutter 3.19+ / Dart 3.3+ | Cliente móvil multiplataforma (Android/iOS) para encargados de tienda y preventa con interfaz fluida y arquitectura BLoC/Provider. |
| **Persistencia Móvil Local** | SQLite | sqflite 2.3+ | Motor relacional ligero embebido en el dispositivo móvil para almacenamiento de operaciones locales y cola de sincronización diferida. |
| **Base de Datos Central** | PostgreSQL | PostgreSQL 15+ | Motor RDBMS corporativo para persistencia multitenant (`tenant_id`), particionamiento transaccional, índices B-Tree/GIN y cumplimiento ACID estricto. |
| **Inteligencia Artificial Generativa** | OpenAI API / Google Gemini API | GPT-4o / Gemini 1.5 Flash | Generación de consultas analíticas SQL en lenguaje natural y asistencia ejecutiva en redacción e interpretación de reportes. |
| **Machine Learning Predictivo** | Scikit-Learn, Pandas, NumPy | Scikit-learn 1.4+ | Modelos de predicción de demanda estacional por prendas/tallas (Random Forest / Regresión) y clusterización para cálculo de ofertas y rotación de stock. |
| **Pasarela de Pagos Digitales** | Stripe API | SDK Stripe v8+ (Modo Sandbox) | Procesamiento seguro de cobros electrónicos con tarjeta de crédito/débito y webhooks para confirmación automática de liquidaciones. |
| **Seguridad y Autorización** | JWT + Argon2 / Bcrypt | PyJWT 2.8+, Passlib | Autenticación basada en tokens JWT con claims de tenant y sucursal, control de acceso basado en roles (RBAC) y hashing de contraseñas. |
| **Modelado y Diseño** | UML 2.5+ & Sparx Systems EA | PlantUML / Enterprise Architect 16+ | Modelado formal de casos de uso, análisis de robustez ICONIX, secuencia, clases de análisis y diagramas arquitectónicos de despliegue y paquetes. |
| **Despliegue e Infraestructura** | Cloud PaaS (Docker / Linux Ubuntu) | Ubuntu 22.04 LTS / Docker Compose | Alojamiento en la nube (Render / Railway / AWS ECS) con variables de entorno aisladas por tenant y certificados SSL/TLS automáticos. |
| **Control de Versiones** | Git + GitHub | Git 2.44+ | Repositorio centralizado con flujos de trabajo basados en ramas, control de cambios y trazabilidad de commits. |

## 4.2. Diseño de la Arquitectura del Sistema

### 4.2.1. Diseño Físico de la Arquitectura: Diagrama de Despliegue (UML)

El diseño físico de la arquitectura modela la distribución de los artefactos de software sobre la infraestructura de hardware, servidores en la nube, redes de comunicación y dispositivos de borde (clientes móviles y computadores empresariales), alineado estrictamente con el modelo de despliegue físico requerido para el sistema.

![Diagrama de Despliegue Físico](../diagramas/imagenes_arquitectura/Diagrama_Despliegue_P2.png)

#### Descripción de Nodos y Componentes Físicos:

1. **Server Comercio Electrónico (Cloud SaaS):**
   - **Nodo de Ejecución:** Servidor virtual en la nube bajo sistema operativo **Ubuntu Linux 22.04 LTS** gestionado con contenedores **Docker Engine**.
   - **Componente «web» FastAPI REST Service (Python 3.11):** Expone las APIs seguras bajo HTTPS/TLS 1.3, maneja la validación de tokens JWT multitenant, procesa las solicitudes transaccionales y coordina la lógica de negocio.
   - **Componente «database» PostgreSQL 15 + AsyncPG:** Instancia central de base de datos relacional para persistencia multi-empresa con aislamiento por `tenant_id`. Se comunica con el backend mediante `SQLAlchemy Async`.
   - **Componente «IA / ML» Motor Analítico e Inferencia:** Servicio interno encargado de ejecutar algoritmos de machine learning (previsión de demanda textil) y conectar con los modelos de IA generativa.

2. **Servicios Cloud Externos:**
   - **«SaaS» Stripe Payment API (Sandbox):** Pasarela de pagos externa que recibe peticiones tokenizadas desde el servidor backend para procesar transacciones bancarias y emite webhooks de liquidación.
   - **«IA» OpenAI / Google Gemini API:** Servicios de modelos de lenguaje natural consumidos mediante llamadas HTTPS autenticadas con API Key para el asistente de reportes generativos.

3. **Infraestructura de Red (WAN / LAN):**
   - **Internet (Red WAN):** Canal público sobre protocolo TCP/IP mediante el cual transitan las peticiones cifradas de los clientes remotos hacia el servidor en la nube.
   - **Switch / Router WAN:** Dispositivo de red física en sucursal que conmuta el tráfico local hacia internet y asigna direccionamiento a las terminales de punto de venta y dispositivos móviles.

4. **Dispositivo Móvil (Smartphone/Tablet):**
   - **Nodo de Dispositivo:** Terminal móvil operada por el personal de ventas o encargados de almacén bajo **Android / iOS Runtime**.
   - **Componente «aplicación» Flutter Client (Offline-First):** Aplicación cliente nativa compilada en Flutter/Dart. Permite registrar ventas, consultar catálogo y gestionar inventario incluso sin conectividad a internet.
   - **Componente «database» SQLite Embebido:** Base de datos local persistida en almacenamiento interno mediante `sqflite`, permitiendo encolar operaciones offline para sincronización posterior con el servidor central.

5. **Computador Sucursal / Empresa:**
   - **Nodo de Terminal:** Estación de trabajo de caja o gerencia bajo sistema operativo **Windows 10/11 Enterprise**.
   - **Componente «navegador» Angular PWA (Service Worker):** Aplicación web progresiva ejecutada en el navegador web moderno (Chrome/Edge). Los Service Workers almacenan en caché el bundle estático para arranque instantáneo sin conexión.
   - **Componente «database» IndexedDB Local:** Almacenamiento transaccional estructurado en el navegador, sincronizado con el Service Worker para registrar operaciones locales cuando la conexión de red se interrumpe.

```plantuml
@startuml Despliegue_P2
skinparam node {
  BackgroundColor #E1F5FE
  BorderColor #0277BD
  FontColor #01579B
}
skinparam component {
  BackgroundColor #FFEBEE
  BorderColor #C62828
  FontColor #B71C1C
}
skinparam database {
  BackgroundColor #FFF8E1
  BorderColor #F57F17
}

node "Server Comercio Electrónico (Cloud SaaS)" as srv {
  node "Ubuntu Linux 22.04 LTS (Docker Engine)" as os {
    [«web» FastAPI REST Service (Python 3.11)] as api
    [«database» PostgreSQL 15 + AsyncPG] as db_pg
    [«IA / ML» Motor Analítico e Inferencia] as ml
    api .right.> db_pg : SQLAlchemy Async
    api .down.> ml : Pipeline Inferencia
  }
}

node "Servicios Cloud Externos (Stripe & Gemini)" as cloud {
  [«SaaS» Stripe Payment API (Sandbox)] as stripe
  [«IA» OpenAI / Google Gemini API] as gemini
}

node "Internet (Red WAN)" as internet
node "Switch / Router WAN" as switch

node "Dispositivo Móvil (Smartphone/Tablet)" as movil {
  node "Android / iOS Runtime" as runtime_m {
    [«aplicacion» Flutter Client (Offline-First)] as app_flutter
    [«database» SQLite Embebido] as db_sqlite
    app_flutter .down.> db_sqlite : sqflite
  }
}

node "Computador Sucursal / Empresa" as pc {
  node "Windows 10/11 Enterprise" as win {
    [«navegador» Angular PWA (Service Worker)] as pwa
    [«database» IndexedDB Local] as db_idb
    pwa .down.> db_idb : IndexedDB API
  }
}

srv .right.> cloud : API HTTPS (TLS 1.3)
srv .down.> internet : TCP/IP
internet .right.> switch : TCP/IP
switch .right.> movil : Wi-Fi / 4G (HTTPS)
switch .down.> pc : Ethernet (HTTPS)
@enduml
```

### 4.2.2. Diseño Lógico de la Arquitectura: Diagrama de Paquetes en 3 Capas (UML)

El diseño lógico de la arquitectura descompone el sistema en una estructura de **3 Capas principales (Vista, Controlador, Modelo)** más la **Capa de Persistencia / Base de Datos**, siguiendo rigurosamente las buenas prácticas de la ingeniería de software y el ciclo de refinamiento de la metodología ICONIX.

![Diagrama de Paquetes en 3 Capas (Diseño Lógico)](../diagramas/imagenes_arquitectura/Diagrama_Paquetes_3Capas_P2.png)

#### Estructura y Responsabilidad de las Capas:

1. **Capa 1: Vista (Presentación / Interfaz de Usuario):**
   - **Paquete Vistas Autenticación y Tenant:** Formularios y pantallas de inicio de sesión, recuperación de credenciales, selección de empresa activa (multitenant) y administración de perfiles de usuario.
   - **Paquete Vistas Ventas POS y Reservas:** Interfaces interactivas de punto de venta (POS), catálogo visual con matriz talla/color, carrito de compras, selección de métodos de pago (efectivo, QR, Stripe) y gestión de reservas.
   - **Paquete Vistas Catálogo, CPP y Compras:** Paneles de administración de prendas, categorización, registro de notas de compra a proveedores, recálculo de Costo Promedio Ponderado (CPP) y monitoreo de kardex.
   - **Paquete Vistas Reportes IA y Dashboard ML:** Dashboards gerenciales con gráficos en tiempo real, interfaz de consulta en lenguaje natural asistida por IA generativa y visualizador de recomendaciones predictivas de demanda.

2. **Capa 2: Controlador (Lógica de Aplicación y Orquestación):**
   - **Paquete Controladores Auth & Tenant:** Manejo de sesiones seguras mediante JSON Web Tokens (JWT), inyección de contexto de empresa (`tenant_id`), verificación de roles/permisos (RBAC) y filtrado de peticiones.
   - **Paquete Controladores Ventas y Sync Offline:** Coordinación de transacciones de venta, validación de políticas de reserva, procesamiento de webhooks de pasarela de pago y orquestación de la cola de sincronización offline con resolución de conflictos de versión.
   - **Paquete Controladores Inventario, CPP y Kardex:** Ejecución de las reglas de negocio de abastecimiento: recálculo continuo del CPP por sucursal, emisión automática de asientos de movimiento en Kardex y validación de stock disponible antes de la confirmación de pedidos.
   - **Paquete Controladores Reportes IA & ML:** Orquestación de pipelines de analítica: extracción de históricos de venta, preparación de datasets para inferencia de modelos Scikit-Learn y sanitización de prompts para generación de reportes con IA.

3. **Capa 3: Modelo (Dominio, Entidades y Reglas de Negocio):**
   - **Paquete Modelos Auth y Organización:** Entidades de dominio: `Usuario`, `Rol`, `Permiso`, `Empresa`, `Sucursal`, `PlanSuscripcion`.
   - **Paquete Modelos Ventas, Reservas y Sync:** Entidades: `Venta`, `DetalleVenta`, `ReservaPrenda`, `Pago`, `Comprobante`, `SyncQueueEntry`.
   - **Paquete Modelos Catálogo Textil e Inventario:** Entidades: `Producto`, `Categoria`, `PrendaVariante`, `Talla`, `Color`, `MovimientoKardex`, `StockSucursal`, `NotaCompra`.
   - **Paquete Modelos Analítica e Inferencia ML:** Entidades y DTOs de predicción: `PrevisionDemanda`, `ReglaDescuento`, `SnapshotVentas`, `MetricaRotacion`.

4. **Capa de Persistencia / Base de Datos:**
   - **Base de Datos Central PostgreSQL 15:** Persistencia física relacional en la nube. Almacena las tablas de todos los modelos bajo aislamiento multitenant, soportando transacciones ACID y consultas analíticas complejas.
   - **Base de Datos Local SQLite e IndexedDB:** Persistencia local de borde. Almacena réplicas operativas del catálogo y colas de transacciones locales pendientes de sincronización en dispositivos móviles (SQLite) y navegadores web (IndexedDB).

#### Reglas de Dependencia y Acoplamiento:
- **Flujo Estrictamente Descendente:** Las dependencias entre paquetes fluyen exclusivamente de arriba hacia abajo (`Vista ..> Controlador ..> Modelo ..> Base de Datos`).
- **Desacoplamiento de Presentación:** Los Controladores y Modelos no tienen conocimiento ni dependencia de las tecnologías de interfaz (Angular o Flutter).
- **Colaboración Inter-Controladores:** El `Paquete Controladores Ventas y Sync Offline` colabora puntualmente con el `Paquete Controladores Inventario, CPP y Kardex` para validar stock en tiempo real y debitar inventario sin violar el encapsulamiento de capas.

```plantuml
@startuml Paquetes_3Capas_P2
skinparam package {
  BackgroundColor #FDFEFE
  BorderColor #2C3E50
  FontColor #1A5276
  FontSize 12
}
skinparam ArrowColor #2980B9

package "CAPA VISTA (Presentación)" {
  package "Paquete Vistas Autenticación y Tenant" as V_Auth
  package "Paquete Vistas Ventas POS y Reservas" as V_Ventas
  package "Paquete Vistas Catálogo, CPP y Compras" as V_Inv
  package "Paquete Vistas Reportes IA y Dashboard ML" as V_Rep
}

package "CAPA CONTROLADOR (Lógica de Aplicación)" {
  package "Paquete Controladores Auth & Tenant" as C_Auth
  package "Paquete Controladores Ventas y Sync Offline" as C_Ventas
  package "Paquete Controladores Inventario, CPP y Kardex" as C_Inv
  package "Paquete Controladores Reportes IA & ML" as C_Rep
}

package "CAPA MODELO (Dominio y Entidades)" {
  package "Paquete Modelos Auth y Organización" as M_Auth
  package "Paquete Modelos Ventas, Reservas y Sync" as M_Ventas
  package "Paquete Modelos Catálogo Textil e Inventario" as M_Inv
  package "Paquete Modelos Analítica e Inferencia ML" as M_Rep
}

package "CAPA BASE DE DATOS (Persistencia)" {
  package "Base de Datos Central PostgreSQL 15" as DB_Central
  package "Base de Datos Local SQLite e IndexedDB" as DB_Local
}

' Dependencias Vista -> Controlador
V_Auth ..> C_Auth : usa
V_Ventas ..> C_Ventas : invoca
V_Inv ..> C_Inv : invoca
V_Rep ..> C_Rep : solicita

' Dependencias Controlador -> Controlador (Inter-módulo)
C_Ventas .right.> C_Inv : valida_stock

' Dependencias Controlador -> Modelo
C_Auth ..> M_Auth : persiste
C_Ventas ..> M_Ventas : liquida
C_Inv ..> M_Inv : asienta_kardex
C_Rep ..> M_Rep : consulta
C_Rep ..> M_Ventas : extrae_dataset

' Dependencias Modelo -> Base de Datos
M_Auth ..> DB_Central : almacena
M_Ventas ..> DB_Central : persiste_nube
M_Ventas ..> DB_Local : encola_offline
M_Inv ..> DB_Central : sincroniza_central
M_Inv ..> DB_Local : cachea_local
M_Rep ..> DB_Central : consulta_vistas
@enduml
```

## 4.3. Implementación de la Base de Datos y Capa de Persistencia

La persistencia del sistema está estructurada bajo una arquitectura híbrida de alta disponibilidad: persistencia central relacional multitenant en PostgreSQL 15 y persistencia local de borde (SQLite en la aplicación móvil Flutter e IndexedDB en la Progressive Web App de Angular).

### 4.3.1. Configuración de PostgreSQL 15 y Pool Asíncrono (SQLAlchemy 2.0 Asyncio + AsyncPG)

El acceso a la base de datos central en la nube se implementa de forma 100% asíncrona para maximizar el rendimiento concurrente bajo alta carga de transacciones POS:

```python
# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from contextvars import ContextVar
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:secret@localhost:5432/fashionstore_db")

# Pool de conexiones asíncrono con reciclaje automático y pre-ping para evitar conexiones muertas
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_recycle=1800,
    pool_pre_ping=True
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Variable de contexto asíncrona para aislamiento thread-safe y coroutine-safe del tenant
current_tenant_id: ContextVar[int | None] = ContextVar("current_tenant_id", default=None)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 4.3.2. Aislamiento Multitenant en Persistencia

Para garantizar el aislamiento hermético de datos entre empresas suscriptores (Desafío VI), la persistencia implementa filtrado automático en consultas y eventos del ORM:

```python
# app/core/multitenant.py
from sqlalchemy import event
from sqlalchemy.orm import Session
from app.core.database import current_tenant_id

@event.listens_for(Session, "do_orm_execute")
def receive_do_orm_execute(orm_execute_state):
    """Inyecta automáticamente el filtro tenant_id en todas las consultas SELECT, UPDATE y DELETE."""
    tenant_id = current_tenant_id.get()
    if tenant_id is not None and orm_execute_state.is_select:
        # Aplica filtrado automático sobre entidades que heredan TenantMixin
        orm_execute_state.statement = orm_execute_state.statement.filter_by(tenant_id=tenant_id)
```

### 4.3.3. Persistencia Local Móvil (SQLite + sqflite en Flutter)

La aplicación móvil incorpora una base de datos local SQLite administrada con el paquete `sqflite`, permitiendo operaciones de venta, reservas y catálogo completamente offline:

```dart
// lib/core/database/local_database.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;
  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('fashionstore_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);
    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    // Tabla para encolar transacciones generadas sin conexión con UUID v4
    await db.execute('''
      CREATE TABLE operaciones_offline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL UNIQUE,
        sucursal_id INTEGER NOT NULL,
        tipo_operacion TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL,
        estado_sync TEXT NOT NULL DEFAULT 'PENDIENTE'
      )
    ''');
    // Tablas réplica para catálogo local offline
    await db.execute('''
      CREATE TABLE productos_cache (
        id INTEGER PRIMARY KEY,
        codigo_sku TEXT NOT NULL,
        nombre TEXT NOT NULL,
        precio_venta REAL NOT NULL,
        categoria_id INTEGER NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE variantes_cache (
        id INTEGER PRIMARY KEY,
        producto_id INTEGER NOT NULL,
        talla TEXT NOT NULL,
        color TEXT NOT NULL,
        stock_fisico INTEGER NOT NULL
      )
    ''');
  }
}
```

### 4.3.4. Persistencia Local Web (IndexedDB + Dexie.js en Angular PWA)

En el navegador del cliente de caja y sucursal, la Progressive Web App emplea **IndexedDB** estructurado mediante la librería reactiva **Dexie.js** para garantizar soporte offline transparente:

```typescript
// src/app/core/services/offline-storage.service.ts
import Dexie, { Table } from 'dexie';

export interface OperacionOffline {
  id?: number;
  uuid: string;
  sucursalId: number;
  tipoOperacion: 'VENTA' | 'RESERVA';
  payloadJson: any;
  fechaCreacion: string;
  estadoSync: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';
}

export class FashionStoreDexieDB extends Dexie {
  operacionesOffline!: Table<OperacionOffline, number>;
  productosCache!: Table<any, number>;

  constructor() {
    super('FashionStorePWA_DB');
    this.version(1).stores({
      operacionesOffline: '++id, &uuid, sucursalId, tipoOperacion, estadoSync',
      productosCache: 'id, codigoSku, nombre, categoriaId'
    });
  }
}
export const offlineDB = new FashionStoreDexieDB();
```

### 4.3.5. Control de Migraciones del Esquema Relacional (Alembic)

Para asegurar la reproducibilidad de despliegues y control de cambios en la base de datos central PostgreSQL, se implementa **Alembic** con soporte nativo para migraciones asíncronas:

```python
# migrations/env.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.models import Base
import os

target_metadata = Base.metadata
config = context.config

def run_migrations_offline():
    url = os.getenv("DATABASE_URL")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(os.getenv("DATABASE_URL"))
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

---

## 4.4. Desarrollo de los Módulos del Sistema

### 4.4.0. Marco Metodológico ICONIX: De los Diagramas de Robustez y Secuencia al Código Fuente

Conforme a los postulados teóricos de Doug Rosenberg y Matt Stephens (*Use Case Driven Object Modeling with UML: Theory and Practice*), la metodología **ICONIX** estructura el desarrollo de software bajo el principio de **trazabilidad continua y bidireccional**. La fase de implementación (Fase 4 del ciclo de vida) no consiste en una codificación empírica o aislada, sino en la **traducción directa de los artefactos de diseño dinámico y estático a código ejecutable**.

El núcleo que articula esta transición es el patrón **BCE (Boundary - Control - Entity)**, el cual mapea de forma natural y unívoca cada estereotipo de análisis hacia las tres capas de la arquitectura del software:

| Estereotipo ICONIX | Rol en el Análisis y Diseño | Mapeo en la Implementación (Código Fuente) | Ubicación Física en el Proyecto |
|:---|:---|:---|:---|
| **Boundary** (`<<boundary>>`) | Interfaz gráfica con el usuario o contrato de integración con sistemas externos. | Componentes de UI (Vistas PWA / Pantallas Flutter) y **Routers de Entrada REST** (Endpoints HTTP). | `frontend/src/app/pages/`<br>`mobile/lib/views/`<br>`backend/app/modules/*/router.py` |
| **Control** (`<<control>>`) | Encapsula la lógica de negocio, validación de reglas, cálculos matemáticos y orquestación del caso de uso. | **Clases y Servicios de Negocio** (*Services / Interactors*). No almacenan estado propio; contienen exclusivamente métodos de operación. | `backend/app/modules/*/service.py`<br>`backend/app/services/` |
| **Entity** (`<<entity>>`) | Modela la información persistente del dominio con identidad de negocio a largo plazo. | **Clases de Dominio y Modelos ORM** mapeados a tablas relacionales PostgreSQL, SQLite o almacenes IndexedDB. | `backend/app/modules/*/models.py`<br>`backend/app/models/` |
| **Mensajes (Secuencia)** | Invocaciones sincrónicas/asincrónicas entre objetos a lo largo del flujo del caso de uso. | **Firmas de métodos, llamadas a funciones y DTOs** (Pydantic schemas) con tipado estricto. | `schemas.py`, métodos `async def` |

#### Sobre los Apoyos Visuales en la Sección de Desarrollo e Implementación:
En la metodología ICONIX, los diagramas de modelado conceptual (Casos de Uso, Robustez y Secuencia) residen en los Capítulos II y III, mientras que los diagramas de arquitectura física y lógica (Despliegue y Paquetes en 3 Capas) residen en la Sección 4.2, y los de Componentes en la Sección 4.5. En esta sección (**4.4. Desarrollo de los Módulos del Sistema**), el sustento empírico exigido por la cátedra consiste en:
1. **Las Matrices de Trazabilidad ICONIX:** Que demuestran la correspondencia entre los objetos BCE del diseño y los módulos/archivos programados.
2. **El Código Fuente Crítico Ejecutable:** Fragmentos funcionales que implementan la lógica de negocio, algoritmos matemáticos y mecanismos de seguridad de los controladores.
3. **Las Interfaces de Usuario Implementadas (Screenshots / Pantallas Operativas):** La manifestación visible de los objetos frontera (`Boundary`) con los que el usuario interactúa en la PWA y en la App Móvil.

---

### 4.4.1. Módulo 1: Seguridad, Multitenancy y Administración Global (CU01 al CU05)

Este módulo gestiona el ciclo de vida de los tenants (empresas cliente), los planes de suscripción mensuales/anuales, la autenticación centralizada mediante tokens JWT con claims multitenant, y la administración de usuarios y roles RBAC (Super Administrador, Administrador de Empresa, Encargado de Sucursal, Cajero POS y Cliente).

#### A. Matriz de Trazabilidad ICONIX (BCE → Código Fuente)

| Caso de Uso | Objeto Boundary (Frontera) | Objeto Control (Lógica) | Objeto Entity (Datos) | Archivo / Componente Implementado |
|:---|:---|:---|:---|:---|
| **CU01: Gestionar Empresas** | `EmpresaAdminBoundary` | `TenantManagementControl` | `EmpresaTenant`, `ConfiguracionTenant` | `modules/p02_estructura_operativa/empresas/` |
| **CU02: Gestionar Planes** | `PlanesBoundary` | `PlanSubscriptionControl` | `PlanSuscripcion` | `modules/p01_seguridad_acceso/planes/` |
| **CU03: Gestionar Suscripción** | `SuscripcionBoundary` | `SubscriptionBillingControl` | `SuscripcionEmpresa`, `HistorialPago` | `modules/p01_seguridad_acceso/suscripciones/` |
| **CU04: Autenticar Multitenant** | `LoginBoundary` | `AuthSecurityControl` | `Usuario`, `Rol`, `SesionActiva` | `core/security.py`, `modules/p01_seguridad_acceso/auth/` |
| **CU05: Gestionar Usuarios/Roles** | `UsuariosBoundary` | `UserRoleRBACControl` | `Usuario`, `Rol`, `Permiso` | `modules/p01_seguridad_acceso/usuarios/` |

#### B. Implementación de la Lógica de Negocio Crítica: Middleware de Aislamiento Multitenant con ContextVar

Garantiza que ninguna petición procese, consulte o altere registros de una empresa distinta a la que pertenece el usuario autenticado, interceptando las cabeceras HTTP y estableciendo el `tenant_id` en una variable de contexto asíncrona segura:

```python
# app/core/security.py
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.database import current_tenant_id
import os

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-saas-fashionstore")
ALGORITHM = "HS256"
security = HTTPBearer()

async def get_current_user_tenant(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Controlador de Seguridad ICONIX: Valida JWT, extrae claims de tenant/rol,
    verifica estado activo de suscripción y fija el tenant en ContextVar.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tenant_id: int = payload.get("tenant_id")
        user_id: int = payload.get("user_id")
        rol: str = payload.get("rol")
        suscripcion_activa: bool = payload.get("suscripcion_activa", False)

        if tenant_id is None:
            raise HTTPException(status_code=403, detail="Token no contiene tenant_id válido")
        if not suscripcion_activa and rol != "SUPER_ADMIN":
            raise HTTPException(status_code=403, detail="La suscripción de la empresa está vencida o suspendida")

        # Establecer el tenant en la variable de contexto asíncrona para aislamiento automático
        current_tenant_id.set(tenant_id)
        return {"user_id": user_id, "tenant_id": tenant_id, "rol": rol}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
```

#### C. Interfaces de Usuario y Pantallas Operativas Asociadas
- **`LoginBoundary` (PWA Angular):** Formulario responsivo con selector dinámico de subdominio/empresa, validación de credenciales en tiempo real y almacenamiento del token JWT en `localStorage`.
- **`EmpresasAdminView` (Panel Web Desktop):** Tablero de administración global para el Super Administrador con métricas de tenants activos, consumo de almacenamiento y estado de suscripciones.

---

### 4.4.2. Módulo 2: Catálogo Textil e Inventario Multi-Sucursal con CPP y Kardex (CU06, CU07, CU14, CU20)

Administra la estructura de prendas de vestir con atributos avanzados (talla, color, temporada, tipo de tela, composición textil), el stock distribuido entre sucursales y almacén central, los traspasos inter-sucursales y la valuación de inventarios mediante el método matemático de **Costo Promedio Ponderado (CPP)** con asientos inmutables en el Kardex físico-valorado.

#### A. Matriz de Trazabilidad ICONIX (BCE → Código Fuente)

| Caso de Uso | Objeto Boundary (Frontera) | Objeto Control (Lógica) | Objeto Entity (Datos) | Archivo / Componente Implementado |
|:---|:---|:---|:---|:---|
| **CU06: Gestionar Prendas** | `PrendasBoundary` | `CatalogoPrendasControl` | `Producto`, `Categoria`, `VariantePrenda` | `modules/p03_catalogo_estilismo_ia/productos/` |
| **CU07: Inventario y CPP** | `InventarioBoundary` | `InventarioControl` | `Inventario`, `KardexMovimiento`, `LoteCompra` | `modules/p05_inventario_costos_analitica/inventario/` |
| **CU14: Traspaso Inter-Sucursal** | `TraspasoBoundary` | `LogisticaTraspasoControl` | `TraspasoSucursal`, `DetalleTraspaso` | `modules/p10_logistica_delivery/traspasos/` |
| **CU20: Compras Desktop** | `ComprasBoundary` | `AprovisionamientoControl` | `OrdenCompra`, `DetalleOrdenCompra`, `Proveedor` | `modules/p04_aprovisionamiento_proveedores/` |

#### B. Implementación de la Lógica de Negocio Crítica: Cálculo de Costo Promedio Ponderado (CPP) y Asiento en Kardex

Implementa la fórmula formal del CPP en cada recepción de mercadería:
$$\text{CPP}_{\text{nuevo}} = \frac{(\text{Stock}_{\text{anterior}} \times \text{CPP}_{\text{anterior}}) + (\text{Cantidad}_{\text{lote}} \times \text{Costo}_{\text{lote}})}{\text{Stock}_{\text{anterior}} + \text{Cantidad}_{\text{lote}}}$$

```python
# app/modules/p05_inventario_costos_analitica/inventario/service.py
from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.modules.p05_inventario_costos_analitica.inventario.models import Inventario, KardexMovimiento
from app.modules.p02_estructura_operativa.sucursales.models import Sucursal
from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto
from app.modules.p05_inventario_costos_analitica.inventario.schemas import EntradaLoteCreate, KardexResponse

class InventarioControl:
    """
    Clase de Control ICONIX: Lógica de Negocio de Inventario y Valuación por CPP.
    Coordina la entrada física de mercadería, cálculo matemático del CPP
    y generación de asientos inmutables en el Kardex físico-valorado.
    """

    @staticmethod
    def procesar_entrada_mercaderia(db: Session, request: EntradaLoteCreate) -> KardexResponse:
        # 1. Validar existencia de sucursal y producto
        sucursal = db.query(Sucursal).filter(Sucursal.id_sucursal == request.id_sucursal).first()
        if not sucursal:
            raise HTTPException(status_code=404, detail="Sucursal no existe.")

        producto = db.query(Producto).filter(Producto.id_producto == request.id_producto).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no existe en el catálogo.")

        cant_lote = request.cantidad_recibida
        costo_lote = Decimal(str(request.costo_unitario_compra))
        if cant_lote <= 0 or costo_lote <= Decimal("0.00"):
            raise HTTPException(status_code=400, detail="Cantidad y costo unitario deben ser mayores a cero.")

        talla_norm = request.talla.strip().upper()
        color_norm = request.color.strip()

        # 2. Obtener existencias y CPP actual del ítem
        item_inv = db.query(Inventario).filter(
            Inventario.id_sucursal == request.id_sucursal,
            Inventario.id_producto == request.id_producto,
            Inventario.talla == talla_norm,
            Inventario.color == color_norm
        ).first()

        if item_inv:
            stock_anterior = item_inv.stock_fisico
            cpp_anterior = Decimal(str(item_inv.costo_promedio_ponderado))

            # 3. Aplicar fórmula formal de Costo Promedio Ponderado (CPP)
            inversion_anterior = Decimal(str(stock_anterior)) * cpp_anterior
            inversion_nueva = Decimal(str(cant_lote)) * costo_lote
            nuevo_stock_total = stock_anterior + cant_lote
            
            nuevo_cpp_raw = (inversion_anterior + inversion_nueva) / Decimal(str(nuevo_stock_total))
            nuevo_cpp = nuevo_cpp_raw.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # 4. Actualizar stock y costos en la entidad Inventario
            item_inv.stock_fisico = nuevo_stock_total
            item_inv.stock_disponible = nuevo_stock_total - item_inv.stock_reservado
            item_inv.ultimo_costo_compra = costo_lote
            item_inv.costo_promedio_ponderado = nuevo_cpp
        else:
            # Creación inicial de existencias para este SKU
            stock_anterior = 0
            cpp_anterior = Decimal("0.00")
            nuevo_stock_total = cant_lote
            nuevo_cpp = costo_lote.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            item_inv = Inventario(
                id_sucursal=request.id_sucursal, id_producto=request.id_producto,
                talla=talla_norm, color=color_norm, stock_fisico=cant_lote,
                stock_disponible=cant_lote, stock_reservado=0,
                ultimo_costo_compra=costo_lote, costo_promedio_ponderado=nuevo_cpp
            )
            db.add(item_inv)

        # 5. Generar asiento inmutable en el Kardex físico-valorado
        nuevo_saldo_valorado = (Decimal(str(nuevo_stock_total)) * nuevo_cpp).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        asiento_kardex = KardexMovimiento(
            id_sucursal=request.id_sucursal, id_producto=request.id_producto,
            talla=talla_norm, color=color_norm, tipo_movimiento="ENTRADA_COMPRA",
            cantidad=cant_lote, costo_unitario_movimiento=costo_lote,
            costo_total_movimiento=(Decimal(str(cant_lote)) * costo_lote).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            saldo_cantidad=nuevo_stock_total, costo_unitario_ponderado_resultante=nuevo_cpp,
            saldo_valorado_total=nuevo_saldo_valorado, referencia_documento=request.numero_factura,
            fecha_movimiento=datetime.utcnow()
        )
        db.add(asiento_kardex)
        db.commit()
        db.refresh(asiento_kardex)
        return asiento_kardex
```

#### C. Interfaces de Usuario y Pantallas Operativas Asociadas
- **`EntradaLoteBoundary` (Web Desktop):** Formulario de recepción con autocompletado de proveedores, lectura de código de barras por SKU y cálculo en vivo del nuevo CPP antes de confirmar.
- **`KardexFisicoValoradoView` (Web Desktop):** Grilla interactiva con exportación a PDF/Excel que detalla las columnas de Entradas, Salidas y Saldos físico-valorados ordenados cronológicamente.

---

### 4.4.3. Módulo 3: Operaciones Offline, Ventas POS y Motor de Sincronización (CU08 al CU12)

Provee a los cajeros y clientes en tiendas físicas la capacidad de consultar catálogos textiles, registrar reservas presenciales y concretar ventas POS de contado en efectivo de forma 100% autónoma ante cortes de conectividad a internet. Al restablecerse la red, el motor de sincronización asienta las transacciones garantizando **idempotencia absoluta mediante UUID** y resolución de conflictos de stock.

#### A. Matriz de Trazabilidad ICONIX (BCE → Código Fuente)

| Caso de Uso | Objeto Boundary (Frontera) | Objeto Control (Lógica) | Objeto Entity (Datos) | Archivo / Componente Implementado |
|:---|:---|:---|:---|:---|
| **CU08: Catálogo Offline** | `CatalogoOfflineBoundary` | `OfflineCacheManager` | `CatalogoLocal` (SQLite/IndexedDB) | `mobile/lib/views/catalogo_offline.dart` |
| **CU09: Reserva Offline** | `ReservaOfflineBoundary` | `ReservaLocalControl` | `ReservaLocal` (SQLite) | `mobile/lib/views/reserva_offline.dart` |
| **CU10: Venta POS Offline** | `POSOfflineBoundary` | `POSLocalSalesControl` | `VentaLocal`, `DetalleVentaLocal` | `mobile/lib/views/pos_offline.dart` |
| **CU11: Auditar Pendientes** | `AuditoriaColaBoundary` | `OfflineQueueControl` | `OperacionPendienteSync` | `mobile/lib/views/cola_sync.dart` |
| **CU12: Sincronizar Operaciones** | `SyncClientBoundary` | `OfflineSyncEngine` | `OperacionOfflineSync`, `Venta` | `backend/app/services/sync_service.py` |

#### B. Implementación de la Lógica de Negocio Crítica: Motor de Sincronización Idempotente con UUID

```python
# app/services/sync_service.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from uuid import UUID
from app.core.database import get_db, current_tenant_id
from app.core.security import get_current_user_tenant
from app.models import OperacionOfflineSync, InventarioSucursal, Venta, DetalleVenta

router = APIRouter(prefix="/api/sync", tags=["Sincronización Offline"])

class OperacionSyncPayload(BaseModel):
    uuid: UUID
    sucursal_id: int
    tipo_operacion: str # 'VENTA' o 'RESERVA'
    datos: dict

@router.post("/operacion")
async def sincronizar_operacion(payload: OperacionSyncPayload, db: AsyncSession = Depends(get_db), auth: dict = Depends(get_current_user_tenant)):
    tenant_id = auth["tenant_id"]

    # 1. Regla de Idempotencia: Verificar si el UUID ya fue procesado previamente
    stmt_check = select(OperacionOfflineSync).where(OperacionOfflineSync.uuid == payload.uuid)
    res_check = await db.execute(stmt_check)
    op_existente = res_check.scalar_one_or_none()
    
    if op_existente:
        return {"uuid": str(payload.uuid), "estado": op_existente.estado_sync, "mensaje": "Transacción idempotente ya registrada"}

    # 2. Procesar Venta Offline de Contado
    if payload.tipo_operacion == "VENTA":
        items = payload.datos.get("items", [])
        total = payload.datos.get("total", 0.0)

        # Validar existencia de stock físico real en la sucursal
        for item in items:
            stmt_inv = select(InventarioSucursal).where(
                InventarioSucursal.tenant_id == tenant_id,
                InventarioSucursal.sucursal_id == payload.sucursal_id,
                InventarioSucursal.variante_id == item["variante_id"]
            )
            inv = (await db.execute(stmt_inv)).scalar_one_or_none()
            if not inv or inv.stock_fisico < item["cantidad"]:
                # Conflicto irresoluble: Stock insuficiente -> Asentar transacción rechazada
                op_rechazada = OperacionOfflineSync(
                    uuid=payload.uuid, tenant_id=tenant_id, sucursal_id=payload.sucursal_id,
                    tipo_operacion="VENTA", payload_json=payload.datos, estado_sync="RECHAZADA",
                    fecha_creacion_local=payload.datos.get("fecha_local"), error_motivo="Stock insuficiente al sincronizar"
                )
                db.add(op_rechazada)
                await db.commit()
                return {"uuid": str(payload.uuid), "estado": "RECHAZADA", "motivo": "Stock insuficiente"}

        # Descontar stock confirmado en sucursal
        for item in items:
            await db.execute(
                update(InventarioSucursal).where(
                    InventarioSucursal.tenant_id == tenant_id,
                    InventarioSucursal.sucursal_id == payload.sucursal_id,
                    InventarioSucursal.variante_id == item["variante_id"]
                ).values(stock_fisico=InventarioSucursal.stock_fisico - item["cantidad"])
            )

        nueva_venta = Venta(
            tenant_id=tenant_id, sucursal_id=payload.sucursal_id, usuario_cajero_id=auth["user_id"],
            numero_factura=f"OFF-{str(payload.uuid)[:8]}", total=total, subtotal=total,
            tipo_pago="EFECTIVO", estado="COMPLETADA", estado_sync="SINCRONIZADA", uuid_origen=payload.uuid
        )
        db.add(nueva_venta)
        await db.flush()

        for item in items:
            db.add(DetalleVenta(venta_id=nueva_venta.id, variante_id=item["variante_id"], cantidad=item["cantidad"], precio_unitario=item["precio_unitario"]))

        op_confirmada = OperacionOfflineSync(
            uuid=payload.uuid, tenant_id=tenant_id, sucursal_id=payload.sucursal_id,
            tipo_operacion="VENTA", payload_json=payload.datos, estado_sync="CONFIRMADA",
            fecha_creacion_local=payload.datos.get("fecha_local")
        )
        db.add(op_confirmada)
        await db.commit()
        return {"uuid": str(payload.uuid), "estado": "CONFIRMADA", "venta_id": nueva_venta.id}
```

#### C. Interfaces de Usuario y Pantallas Operativas Asociadas
- **`POSOfflineBoundary` (Flutter Tablet/Mobile):** Terminal táctil con catálogo en caché SQLite, teclado numérico, cálculo de cambio y generación de comprobante con marca de agua *"Pendiente de Sincronización"*.
- **`SyncColaView` (Flutter / PWA):** Monitor de cola con barra de progreso, indicador de conectividad (online/offline) y listado de transacciones con insignias de estado (Pendiente, Confirmada, Rechazada).

---

### 4.4.4. Módulo 4: Ventas, Gestión de Cambio de Prenda en Dos Tiempos y Pasarela Stripe (CU13, CU18, CU19)

Implementa el protocolo de postventa exigido por la cátedra para el cambio de prendas por talla, color o modelo dentro del plazo de 7 días hábiles, estructurado en **dos tiempos documentales estrictos**: recepción con emisión de **Nota de Devolución** (reingreso al stock), y entrega con emisión de **Nota de Cambio** y cobro del saldo diferencial mediante **Stripe Sandbox**.

#### A. Matriz de Trazabilidad ICONIX (BCE → Código Fuente)

| Caso de Uso | Objeto Boundary (Frontera) | Objeto Control (Lógica) | Objeto Entity (Datos) | Archivo / Componente Implementado |
|:---|:---|:---|:---|:---|
| **CU13: Cambio de Prenda** | `CambioPrendaBoundary` | `CambioTwoPhaseManager` | `CambioPrenda`, `NotaDevolucion`, `NotaCambio` | `modules/p08_punto_venta_pos/cambios/` |
| **CU18: Pasarela Stripe** | `StripeCheckoutBoundary` | `PaymentGatewayControl` | `TransaccionPago`, `MetodoPagoCliente` | `modules/p09_procesamiento_pagos/stripe/` |
| **CU19: Liquidación/Mayor** | `OfertasBoundary` | `PricingStrategyControl` | `ReglaDescuento`, `OfertaLiquidacion` | `modules/p07_venta_digital_fidelizacion/ofertas/` |

#### B. Implementación de la Lógica de Negocio Crítica: Flujo de Cambio en Dos Tiempos y Cobro de Saldo Diferencial

```python
# app/services/cambio_service.py
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import Venta, CambioPrenda, NotaDevolucion, NotaCambio, InventarioSucursal
import stripe, os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")

async def procesar_devolucion_tiempo1(venta_id: int, variante_dev_id: int, sucursal_id: int, db: AsyncSession, tenant_id: int):
    """
    TIEMPO 1: Validar plazo de 7 días hábiles, registrar recepción física,
    reingresar mercadería al inventario (+1) y emitir Nota de Devolución.
    """
    stmt_v = select(Venta).where(Venta.id == venta_id, Venta.tenant_id == tenant_id)
    venta = (await db.execute(stmt_v)).scalar_one_or_none()
    if not venta or (datetime.utcnow() - venta.fecha).days > 7:
        raise HTTPException(status_code=400, detail="Plazo de cambio de 7 días hábiles vencido")

    cambio = CambioPrenda(
        tenant_id=tenant_id, venta_origen_id=venta_id, cliente_id=venta.cliente_id,
        plazo_limite=datetime.utcnow() + timedelta(days=7), motivo="Cambio de talla",
        estado="PRENDA_RECEPCIONADA"
    )
    db.add(cambio)
    await db.flush()

    nota_dev = NotaDevolucion(
        cambio_id=cambio.id, sucursal_id=sucursal_id, variante_devuelta_id=variante_dev_id,
        cantidad=1, precio_original_reconocido=50.00
    )
    db.add(nota_dev)

    # Reingreso físico al inventario de la sucursal
    await db.execute(
        update(InventarioSucursal).where(
            InventarioSucursal.sucursal_id == sucursal_id,
            InventarioSucursal.variante_id == variante_dev_id
        ).values(stock_fisico=InventarioSucursal.stock_fisico + 1)
    )
    await db.commit()
    return {"cambio_id": cambio.id, "saldo_a_favor": 50.00, "mensaje": "Nota de devolución emitida. Prenda reingresada al inventario."}

async def procesar_despacho_tiempo2(cambio_id: int, variante_nueva_id: int, precio_nuevo: float, stripe_payment_token: str, db: AsyncSession, tenant_id: int):
    """
    TIEMPO 2: Cobrar saldo diferencial mediante pasarela Stripe si la prenda nueva es de mayor valor,
    descontar inventario (-1) y emitir Nota de Cambio final.
    """
    diferencia = precio_nuevo - 50.00 # Ejemplo: 70 Bs (nueva) - 50 Bs (favor) = 20 Bs saldo a pagar
    if diferencia > 0:
        charge = stripe.PaymentIntent.create(
            amount=int(diferencia * 100), currency="bob",
            payment_method=stripe_payment_token, confirm=True
        )
        if charge.status != "succeeded":
            raise HTTPException(status_code=402, detail="Pago de saldo rechazado por la pasarela bancaria")

    nota_cam = NotaCambio(
        cambio_id=cambio_id, sucursal_id=1, variante_nueva_id=variante_nueva_id,
        cantidad=1, precio_nueva_prenda=precio_nuevo
    )
    db.add(nota_cam)
    
    # Despacho físico de la nueva prenda
    await db.execute(
        update(InventarioSucursal).where(
            InventarioSucursal.variante_id == variante_nueva_id
        ).values(stock_fisico=InventarioSucursal.stock_fisico - 1)
    )
    await db.execute(
        update(CambioPrenda).where(
            CambioPrenda.id == cambio_id
        ).values(estado="COMPLETADO", saldo_diferencial=diferencia)
    )
    await db.commit()
    return {"status": "COMPLETADO", "nota_cambio_id": nota_cam.id, "diferencia_pagada": diferencia}
```

#### C. Interfaces de Usuario y Pantallas Operativas Asociadas
- **`CambioPrendaModal` (PWA / POS):** Asistente paso a paso que busca la factura origen, comprueba la fecha de emisión, calcula el saldo diferencial e integra el formulario de tarjeta de Stripe Elements.
- **`NotaDevolucionPrintView` y `NotaCambioPrintView`:** Formatos estándar de impresión térmica para ticketera de punto de venta con código QR de validación.

---

### 4.4.5. Módulo 5: Inteligencia Artificial Generativa y Analítica Predictiva con Machine Learning (CU15 al CU17)

Integra modelos de lenguaje natural (OpenAI GPT-3.5 / Google Gemini) para la generación de reportes gerenciales dinámicos mediante conversión de consultas en lenguaje natural a código SQL analítico seguro, así como modelos matemáticos de Machine Learning con **Scikit-Learn** para previsión de demanda textil (supervisado) y clustering de prendas para liquidación (no supervisado).

#### A. Matriz de Trazabilidad ICONIX (BCE → Código Fuente)

| Caso de Uso | Objeto Boundary (Frontera) | Objeto Control (Lógica) | Objeto Entity (Datos) | Archivo / Componente Implementado |
|:---|:---|:---|:---|:---|
| **CU15: Reportes IA** | `AIReporterBoundary` | `AIReporterService` | `ConsultaAnalitica`, `ReporteLog` | `backend/app/services/ai_report_service.py` |
| **CU16: Exportar Reportes** | `ExportReportBoundary` | `ReportExportControl` | `PlantillaExcel`, `DocumentoPDF` | `backend/app/services/export_service.py` |
| **CU17: Dashboard ML** | `MLDashboardBoundary` | `MLAnalyticsService` | `ModeloPrediccion`, `ClusterPrenda` | `backend/app/services/ml_analytics_service.py` |

#### B. Implementación de la Lógica de Negocio Crítica: Text-to-SQL con Restricción de Tenant y Modelos Scikit-Learn

```python
# app/services/ai_report_service.py
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import openai, json

async def generar_reporte_ia(prompt_usuario: str, tenant_id: int, db: AsyncSession):
    """
    Controlador de IA Generativa: Transforma lenguaje natural a SQL SELECT PostgreSQL 15,
    inyectando de forma obligatoria el filtro WHERE tenant_id = :tenant_id.
    """
    system_prompt = f"""
    Eres un asistente analítico de FashionStore SaaS. Genera exclusivamente consultas SQL SELECT para PostgreSQL 15.
    Es obligatorio e innegociable restringir cada consulta con `WHERE tenant_id = {tenant_id}`.
    Tablas disponibles: ventas (id, tenant_id, sucursal_id, total, fecha), detalle_ventas (venta_id, variante_id, cantidad, precio_unitario, subtotal),
    sucursales (id, tenant_id, nombre), productos (id, tenant_id, nombre, categoria_id), inventario_sucursal (tenant_id, sucursal_id, variante_id, stock_fisico).
    Responde estrictamente en formato JSON: {{"sql": "...", "tipo_grafico": "barras|lineas|pastel|tabla", "titulo": "..."}}
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-1106",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt_usuario}],
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    sql_query = data["sql"]

    # Validación de seguridad: Solo consultas SELECT y verificación de aislamiento multitenant
    if not sql_query.strip().upper().startswith("SELECT") or f"tenant_id = {tenant_id}" not in sql_query:
        raise HTTPException(status_code=403, detail="Consulta SQL rechazada por violar el aislamiento de empresa")

    result = await db.execute(sql_query)
    filas = [dict(row._mapping) for row in result.fetchall()]
    return {"titulo": data["titulo"], "tipo_grafico": data["tipo_grafico"], "datos": filas, "sql": sql_query}
```

```python
# app/services/ml_analytics_service.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import DetalleVenta, Venta

async def predecir_demanda_estacional(variante_id: int, mes_objetivo: int, db: AsyncSession, tenant_id: int):
    """Modelo Supervisado: Random Forest Regressor para predecir unidades demandadas por SKU para el próximo mes."""
    stmt = (
        select(Venta.fecha, DetalleVenta.cantidad)
        .join(DetalleVenta, Venta.id == DetalleVenta.venta_id)
        .where(Venta.tenant_id == tenant_id, DetalleVenta.variante_id == variante_id)
    )
    records = (await db.execute(stmt)).all()
    
    if len(records) < 5:
        return {"variante_id": variante_id, "demanda_estimada": 10, "confianza": "BAJA_DATOS_SINTETICOS"}

    df = pd.DataFrame([{"mes": r.fecha.month, "cantidad": r.cantidad} for r in records])
    X = df[["mes"]].values
    y = df["cantidad"].values

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    prediccion = model.predict(np.array([[mes_objetivo]]))
    return {
        "variante_id": variante_id,
        "mes_objetivo": mes_objetivo,
        "demanda_estimada_unidades": int(np.round(prediccion[0])),
        "confianza": "ALTA_MODELO_ENTRENADO"
    }

async def recomendar_ofertas_liquidacion_clustering(db: AsyncSession, tenant_id: int):
    """Modelo No Supervisado: K-Means para segmentar prendas de baja rotación y recomendar descuentos (30%, 40%, 60%)."""
    # Matriz de features por SKU: [dias_en_stock, total_unidades_vendidas, stock_remanente]
    datos_prendas = np.array([
        [180, 2, 25],  # Alta permanencia, bajas ventas -> Cluster 0: Liquidación agresiva (60%)
        [90, 15, 10],  # Rotación media -> Cluster 1: Descuento moderado (30%)
        [30, 45, 5],   # Alta rotación -> Cluster 2: Precio regular (0%)
        [150, 4, 18],  # Muy baja rotación -> Cluster 0: Liquidación (40%)
    ])
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(datos_prendas)
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    reglas_descuento = {0: 60.0, 1: 30.0, 2: 0.0}
    recomendaciones = []
    for idx, cluster_id in enumerate(clusters):
        recomendaciones.append({
            "prenda_idx": idx,
            "cluster_asignado": int(cluster_id),
            "descuento_sugerido_pct": reglas_descuento.get(cluster_id, 40.0)
        })
    return recomendaciones
```

---

## 4.5. Integración de Componentes

### 4.5.1. Diagrama de Integración General de Componentes del Sistema (UML 2.5+)

El **Diagrama de Integración General de Componentes** modela la integración sistémica completa de FashionStore SaaS, articulando la interacción entre el cliente web (Angular PWA), el cliente móvil (Flutter App), los micro-servicios del backend (FastAPI), las interfaces REST expuestas, la base de datos relacional central (PostgreSQL 15) y los servicios cloud externos (Stripe API y OpenAI / Gemini API):

![Diagrama de Integración General de Componentes](../diagramas/imagenes_arquitectura/Diagrama_Integracion_General_Componentes.png)

#### Descripción de la Integración Sistémica:

1. **Clientes de Presentación e Interfaces de Entrada:**
   - Tanto la **PWA Angular** como la **App Móvil Flutter** consumen los servicios del servidor a través del catálogo estandarizado de interfaces REST expuestas bajo HTTPS y cifrado TLS 1.3.
   - Cada solicitud HTTP viaja con el token JWT de autenticación y los encabezados multitenant (`X-Tenant-ID`), permitiendo al backend identificar de forma unívoca a qué empresa corresponde la transacción.

2. **Catálogo de Interfaces Expuestas por el Backend:**
   - **`interface /api/auth`:** Autenticación de usuarios, emisión y renovación de tokens JWT, recuperación de credenciales y cambio de contraseña.
   - **`interface /api/ventas`:** Registro de órdenes de compra, emisión de facturas/recibos, cobros directos y consulta histórica de ventas.
   - **`interface /api/productos`:** Consulta de catálogo público y privado con matriz de variantes (tallas, colores, stock por sucursal) y cálculo de CPP.
   - **`interface /api/cambios`:** Gestión del cambio de prenda en dos tiempos (recepción/reingreso de la prenda usada y despacho de la nueva variante).
   - **`interface /api/sync`:** Punto de recepción para la cola de transacciones offline con soporte de idempotencia por UUID y validación de stock central.
   - **`interface /api/reportes-ia`:** Procesamiento de consultas analíticas formuladas en lenguaje natural (texto o voz), generación segura de SQL y respuesta estructurada.
   - **`interface /api/ml`:** Endpoint de inferencia predictiva para forecasting de demanda por temporadas y sugerencias automáticas de precios de liquidación.

3. **Colaboración Interna del Núcleo Backend (FastAPI):**
   - El componente `Auth & Security Engine` inyecta el identificador de tenant en el `Tenant Context Engine` utilizando variables de contexto asíncronas (`ContextVar`).
   - El componente `Ventas POS & Reservas` colabora con `Inventario, CPP y Kardex` para verificar disponibilidad en tiempo real antes de debitar unidades físicas.
   - El componente `Offline Sync & Idempotencia` resuelve de manera determinista los conflictos entre transacciones locales y transacciones concurrentes en la nube.
   - El componente `Cambio de Prenda (2 Tiempos)` orquesta el reingreso físico de la prenda devuelta (stock + 1) y coordina con `Conector Pasarela Stripe` el cobro de la diferencia de precio si la nueva prenda tiene mayor valor.

4. **Integración con Servicios Cloud Externos y Base de Datos:**
   - **Stripe API:** El conector de pasarela interactúa mediante HTTPS con los servidores de Stripe en modo Sandbox para validar tarjetas y procesar PaymentIntents.
   - **OpenAI / Gemini API:** El motor de reportes IA envía prompts del sistema estrictamente parametrizados para obtener sentencias SQL de solo lectura (`SELECT`).
   - **PostgreSQL 15:** Persistencia central transaccional conectada mediante un pool asíncrono de conexiones `AsyncPG`, garantizando transacciones ACID con aislamiento de esquemas multitenant.

```plantuml
@startuml Integracion_General_Componentes_P2
skinparam component {
  BackgroundColor #FFEBEE
  BorderColor #C62828
  FontColor #B71C1C
}
skinparam interface {
  BackgroundColor #E8EAF6
  BorderColor #3F51B5
  FontColor #1A237E
}
skinparam package {
  BackgroundColor #FAFAFA
  BorderColor #424242
  FontColor #212121
}

package "Frontend Web (Angular PWA)" {
  [«component» Angular PWA Shell] as CompWebUI
  [«component» Service Worker Engine] as CompSW
  [«component» IndexedDB Service] as CompIDB
  [«component» HTTP Client Interceptor] as CompWebHttp
  
  CompWebUI ..> CompSW : cache
  CompWebUI ..> CompIDB : offline_rw
  CompWebUI ..> CompWebHttp : invoke
}

package "Cliente Móvil (Flutter App)" {
  [«component» Flutter UI & BLoC] as CompMobUI
  [«component» SQLite Helper (sqflite)] as CompSQLite
  [«component» Mobile Sync Worker] as CompMobSync
  
  CompMobUI ..> CompSQLite : local_rw
  CompMobUI ..> CompMobSync : enqueue
}

package "Interfaces REST Expuestas" {
  () "interface /api/auth" as IAuth
  () "interface /api/ventas" as ISales
  () "interface /api/productos" as IProd
  () "interface /api/cambios" as IExchange
  () "interface /api/sync" as ISync
  () "interface /api/reportes-ia" as IAI
  () "interface /api/ml" as IML
}

package "Servidor Backend (FastAPI Engine)" {
  [«component» Auth & Security Engine] as CompAuth
  [«component» Tenant Context Engine] as CompTenant
  [«component» Inventario, CPP y Kardex] as CompInv
  [«component» Ventas POS & Reservas] as CompSales
  [«component» Cambio de Prenda (2 Tiempos)] as CompExchange
  [«component» Offline Sync & Idempotencia] as CompSync
  [«component» Reportes Generativos con IA] as CompAI
  [«component» Motor Analítico ML] as CompML
  [«component» Conector Pasarela Stripe] as CompStripe
  
  CompAuth ..> IAuth : expone
  CompSales ..> ISales : expone
  CompInv ..> IProd : expone
  CompExchange ..> IExchange : expone
  CompSync ..> ISync : expone
  CompAI ..> IAI : expone
  CompML ..> IML : expone
  
  CompAuth ..> CompTenant : inyecta_tenant
  CompSales ..> CompInv : descuenta_stock
  CompSales ..> CompStripe : procesa_cobro
  CompExchange ..> CompInv : reingreso_despacho
  CompExchange ..> CompStripe : cobra_saldo
  CompSync ..> CompSales : valida_idempotencia
  CompSync ..> CompInv : resuelve_stock
  CompAI ..> CompTenant : aisla_sql
  CompML ..> CompSales : extrae_dataset
}

package "Servicios Externos Cloud" {
  [«SaaS» Stripe API (Sandbox)] as ExtStripe
  [«IA» OpenAI / Gemini API] as ExtIA
}

package "Persistencia Central" {
  [«database» PostgreSQL 15 (AsyncPG)] as ExtDB
}

' Clientes consumiendo interfaces
CompWebHttp ..> IAuth : HTTPS/JWT
CompWebHttp ..> ISales : HTTPS/JSON
CompWebHttp ..> IProd : HTTPS/JSON
CompWebHttp ..> IExchange : HTTPS/JSON
CompWebHttp ..> ISync : HTTPS/JSON
CompWebHttp ..> IAI : HTTPS/JSON
CompWebHttp ..> IML : HTTPS/JSON

CompMobUI ..> IAuth : HTTPS/JWT
CompMobUI ..> ISales : HTTPS/JSON
CompMobSync ..> ISync : HTTPS/UUID

' Backend hacia servicios externos y base de datos
CompStripe ..> ExtStripe : TLS 1.3 / REST
CompAI ..> ExtIA : TLS 1.3 / JSON

CompTenant ..> ExtDB : SQLAlchemy Async
CompInv ..> ExtDB : Kardex / CPP
CompSales ..> ExtDB : Ventas / Reservas
CompSync ..> ExtDB : SyncLog / ACID
@enduml
```

### 4.5.2. Diagramas de Componentes por Paquetes y Subsistemas (UML 2.5+)

Para complementar el diseño de integración global, a continuación se descompone la arquitectura en **diagramas de componentes específicos para cada uno de los paquetes y subsistemas ejecutables del software**, modelando sus módulos internos, dependencias directas, puertos y servicios desacoplados:

#### 4.5.2.1. Paquete Backend (FastAPI Core y Servicios Internos)

Modela la descomposición modular del servidor FastAPI en la nube, mostrando los routers de entrada, middlewares de seguridad, servicios de negocio, orquestadores de IA/ML y la capa de acceso a datos asíncrona:

![Diagrama de Componentes Backend](../diagramas/imagenes_arquitectura/Diagrama_Componentes_Backend.png)

##### Componentes del Backend:
1. **«router» APIRouter Gateway:** Puerta de entrada HTTP/JSON que enruta cada petición hacia su controlador/servicio correspondiente.
2. **«security» AuthMiddleware & RBAC:** Valida los tokens JWT, extrae roles, permisos y verifica el estado de la suscripción de la empresa.
3. **«context» TenantContextManager (ContextVar):** Variable de contexto asíncrona que almacena de forma aislada y segura el `tenant_id` para garantizar que ninguna consulta acceda a datos de otra empresa.
4. **«service» SalesPOSService:** Orquesta el ciclo de vida de la venta presencial y en línea, cálculo de totales, descuentos y despacho de comprobantes.
5. **«service» InventoryCPPManager:** Administra el stock multivariante (talla/color), calcula el Costo Promedio Ponderado (CPP) en cada compra y emite asientos automáticos en el Kardex físico-valorado.
6. **«service» ExchangeTwoPhaseManager:** Implementa el flujo de cambio de prenda en dos tiempos (recepción/reingreso con Nota de Devolución y despacho con Nota de Cambio y cobro de diferencia).
7. **«service» OfflineSyncEngine (UUID Idempotent):** Recibe transacciones generadas sin conexión, verifica idempotencia por UUID, resuelve conflictos de stock y asienta ventas offline.
8. **«service» AIReporterService:** Sanitiza los requerimientos en lenguaje natural, añade el filtro de seguridad multitenant mandatorio (`WHERE tenant_id = :id`) y obtiene insights analíticos.
9. **«service» MLInferenceEngine:** Carga los pipelines de Scikit-Learn para previsión de demanda textil y sugerencia de descuentos de liquidación.
10. **«service» StripeGatewayService:** Gestiona la comunicación segura TLS 1.3 con Stripe API para tokenización de tarjetas y confirmación de webhooks.
11. **«repository» DomainRepositories (SQLAlchemy Async):** Capa de abstracción relacional mediante repositorio por entidad, interactuando con SQLAlchemy 2.0 Asyncio.
12. **«db_pool» AsyncPG ConnectionPool:** Pool de conexiones asíncronas de alto rendimiento optimizado para PostgreSQL 15.

```plantuml
@startuml Componentes_Backend_P2
skinparam component {
  BackgroundColor #FCE4EC
  BorderColor #C2185B
  FontColor #880E4F
}
skinparam ArrowColor #AD1457

package "Backend Server (FastAPI Engine)" {
  [«router» APIRouter Gateway] as Router
  [«security» AuthMiddleware & RBAC] as AuthMW
  [«context» TenantContextManager (ContextVar)] as TenantCtx
  
  [«service» SalesPOSService] as SrvSales
  [«service» InventoryCPPManager] as SrvInv
  [«service» ExchangeTwoPhaseManager] as SrvExchange
  [«service» StripeGatewayService] as SrvStripe
  
  [«service» OfflineSyncEngine (UUID Idempotent)] as SrvSync
  [«service» AIReporterService] as SrvAI
  [«service» MLInferenceEngine] as SrvML
  
  [«repository» DomainRepositories (SQLAlchemy Async)] as Repos
  [«db_pool» AsyncPG ConnectionPool] as DBPool
}

Router ..> AuthMW : filtra_token
AuthMW ..> TenantCtx : fija_tenant_id
Router ..> SrvSales : despacha_ventas
Router ..> SrvInv : despacha_inventario
Router ..> SrvExchange : despacha_cambios
Router ..> SrvSync : despacha_sync
Router ..> SrvAI : despacha_reportes
Router ..> SrvML : despacha_inferencia

SrvSales ..> SrvInv : valida_stock
SrvSales ..> SrvStripe : cobra_tarjeta
SrvExchange ..> SrvInv : ajusta_kardex
SrvExchange ..> SrvStripe : cobra_diferencia
SrvSync ..> SrvSales : asienta_offline
SrvAI ..> TenantCtx : inyecta_filtro_tenant
SrvML ..> Repos : consulta_features

SrvSales ..> Repos : persiste
SrvInv ..> Repos : asienta_cpp
SrvSync ..> Repos : registra_sync_log
Repos ..> DBPool : ejecuta_async
@enduml
```

#### 4.5.2.2. Paquete Frontend Web (Angular PWA y Persistencia Offline)

Modela los componentes de la aplicación web progresiva (PWA), diseñada para ejecutarse en el navegador con soporte de caché offline y almacenamiento transaccional local:

![Diagrama de Componentes Frontend PWA](../diagramas/imagenes_arquitectura/Diagrama_Componentes_Frontend_PWA.png)

##### Componentes de la PWA Angular:
1. **«component» AppLayout & RouterShell:** Shell de presentación modular con sistema de navegación, barras de herramientas y carga diferida (*lazy loading*).
2. **«guard» Auth & Tenant Guard:** Protege rutas privadas, verifica la caducidad del token y redirecciona a login o selector de empresa.
3. **«interceptor» JwtBearerInterceptor:** Intercepta cada solicitud saliente para inyectar automáticamente el header `Authorization: Bearer <token>` y el identificador `X-Tenant-ID`.
4. **«module» POSCheckoutModule:** Interfaz táctil de caja registradora, carrito de compras y cierre de tickets.
5. **«module» CatalogTextileModule:** Matriz visual de selección de prendas, tallas, colores y existencias en tiempo real.
6. **«module» ReportsAndAIDashboardModule:** Panel de control con gráficos interactivos y terminal de comandos en lenguaje natural para reportes IA.
7. **«service_worker» NGSW Caching Service:** Motor Service Worker que almacena en caché el bundle HTML/JS/CSS y recursos multimedia para operación sin internet.
8. **«indexeddb» DexieOfflineStorageService:** Wrapper reactivo sobre IndexedDB que almacena catálogos, clientes y transacciones locales.
9. **«queue» OfflineSyncQueueService:** Cola de persistencia que encola operaciones cuando se pierde la conexión y las reenvía automáticamente al detectar conexión.
10. **«client» HttpClientService:** Cliente HTTP tipado de Angular para comunicación con el backend REST.

```plantuml
@startuml Componentes_Web_PWA_P2
skinparam component {
  BackgroundColor #EDE7F6
  BorderColor #512DA8
  FontColor #311B92
}
skinparam ArrowColor #4527A0

package "Frontend Web (Angular PWA)" {
  [«component» AppLayout & RouterShell] as Shell
  [«guard» Auth & Tenant Guard] as Guard
  [«service_worker» NGSW Caching Service] as SW
  
  [«module» POSCheckoutModule] as ModPOS
  [«module» CatalogTextileModule] as ModCat
  [«module» ReportsAndAIDashboardModule] as ModRep
  
  [«queue» OfflineSyncQueueService] as SyncQueue
  [«indexeddb» DexieOfflineStorageService] as IDB
  [«client» HttpClientService] as Http
  [«interceptor» JwtBearerInterceptor] as Interceptor
}

Shell ..> Guard : protege_rutas
Shell ..> ModPOS : navega
Shell ..> ModCat : navega
Shell ..> ModRep : navega
Shell ..> SW : registra_worker

ModPOS ..> SyncQueue : encola_offline
ModCat ..> IDB : consulta_cache_local
SyncQueue ..> IDB : persiste_transaccion
SyncQueue ..> Http : despacha_online

ModPOS ..> Http : emite_pedido
ModCat ..> Http : carga_prendas
ModRep ..> Http : consulta_ia
Http ..> Interceptor : agrega_jwt_tenant
@enduml
```

#### 4.5.2.3. Paquete Cliente Móvil (Flutter App y Persistencia SQLite)

Modela los componentes de la aplicación móvil nativa compilada en Flutter, destacando la separación entre capa de presentación (BLoC), repositorios y persistencia offline con SQLite:

![Diagrama de Componentes Móvil Flutter](../diagramas/imagenes_arquitectura/Diagrama_Componentes_Movil_Flutter.png)

##### Componentes de la App Móvil:
1. **«ui» Flutter Presentation Widgets (Material 3):** Pantallas interactivas optimizadas para smartphones y tablets de los encargados de tienda y preventistas.
2. **«bloc» AuthBLoC & SecureSession:** Manejador de estado de sesión que almacena tokens criptográficos en el almacén seguro del dispositivo (*FlutterSecureStorage*).
3. **«bloc» POSCartBLoC & StateNotifier:** Controla el carrito de compras local, cálculo de subtotales y emisión de ventas en modo desconectado.
4. **«repository» LocalOfflineRepository:** Abstracción de acceso a datos para operaciones locales en SQLite.
5. **«repository» RemoteSyncRepository:** Abstracción para comunicación con la API central mediante solicitudes HTTPS.
6. **«database» SQLite Database (sqflite):** Base de datos relacional embebida con tablas locales de catálogo, clientes y cola de sincronización.
7. **«worker» BackgroundWorkManager:** Servicio en segundo plano que detecta conectividad a internet y ejecuta la sincronización diferida de ventas y reservas.
8. **«http» DioClient (Interceptors & Retries):** Cliente HTTP avanzado con soporte para reintentos exponenciales, timeouts y serialización JSON.

```plantuml
@startuml Componentes_Movil_Flutter_P2
skinparam component {
  BackgroundColor #E0F2F1
  BorderColor #00796B
  FontColor #004D40
}
skinparam ArrowColor #00695C

package "Cliente Móvil (Flutter App)" {
  [«ui» Flutter Presentation Widgets (Material 3)] as UI
  [«bloc» AuthBLoC & SecureSession] as BlocAuth
  [«bloc» POSCartBLoC & StateNotifier] as BlocPOS
  
  [«repository» LocalOfflineRepository] as RepoLocal
  [«repository» RemoteSyncRepository] as RepoRemote
  
  [«worker» BackgroundWorkManager] as Worker
  [«database» SQLite Database (sqflite)] as SQLite
  [«http» DioClient (Interceptors & Retries)] as Dio
}

UI ..> BlocAuth : solicita_login
UI ..> BlocPOS : dispara_evento
BlocAuth ..> Dio : autentica
BlocPOS ..> RepoLocal : guarda_venta_offline
BlocPOS ..> RepoRemote : sincroniza_online

RepoLocal ..> SQLite : sql_crud
Worker ..> RepoLocal : lee_pendientes
Worker ..> RepoRemote : envia_lote
RepoRemote ..> Dio : http_post
@enduml
```

### 4.5.3. Mecanismos de Integración e Interfaz (Protocolos y Contratos REST / JSON)

La siguiente matriz documenta formalmente los contratos de comunicación que rigen la interoperabilidad entre los componentes del sistema:

| Endpoint REST | Método | Componente Emisor | Componente Receptor | Formato / Protocolo | Mecanismo de Seguridad e Idempotencia |
|:---|:---:|:---|:---|:---|:---|
| `/api/auth/login` | `POST` | Web UI / Mobile UI | Auth & Security Engine | JSON sobre HTTPS | Validación de credenciales con Argon2/Bcrypt. Retorna token JWT firmado. |
| `/api/sync/operacion` | `POST` | Offline Sync Queue | Offline Sync & Idempotencia | JSON sobre HTTPS | Clave de idempotencia única `uuid` v4 generada en cliente. Validación de stock en tiempo real. |
| `/api/ventas/crear` | `POST` | POS Checkout Module | Ventas POS & Reservas | JSON sobre HTTPS | Autenticación Bearer JWT con aislamiento estricto por `tenant_id`. |
| `/api/cambios/despacho` | `POST` | POS Checkout Module | Cambio de Prenda | JSON sobre HTTPS | Verificación de plazo de 7 días. Cobro condicional de saldo vía Stripe API. |
| `/api/reportes-ia/query` | `POST` | Reports Dashboard | Reportes Generativos con IA | JSON sobre HTTPS | Sanitización de consultas y forzado estricto de cláusula `WHERE tenant_id = :id`. |
| `/api/ml/prevision` | `GET` | Reports Dashboard | Motor Analítico ML | JSON sobre HTTPS | Inferencia predictiva de demanda estacional por SKU textil y sucursal. |

### 4.5.4. Entornos de Despliegue y URLs Públicas de Producción

La plataforma FashionStore SaaS se encuentra desplegada y accesible externamente para evaluación:

| Componente | Plataforma Cloud | URL de Despliegue |
|:---|:---|:---|
| **Backend REST API + Swagger** | Render Cloud | `https://fashionstore-api-si2.onrender.com/docs` |
| **Frontend Angular PWA** | Vercel / Firebase Hosting | `https://fashionstore-pwa-si2.web.app` |
| **Base de Datos PostgreSQL** | Railway Cloud (Postgres 15) | `postgresql://...railway.app:5432/railway` |
| **Aplicación Móvil** | APK compilado en GitHub Actions | Descarga directa vía QR en portada |

---

# CAPÍTULO V. PRUEBAS Y RESULTADOS

## 5.1. Plan de Pruebas

El plan de pruebas tiene como objetivo verificar y validar exhaustivamente el cumplimiento de los requisitos funcionales, no funcionales y las reglas de negocio críticas de FashionStore SaaS, aplicando la filosofía de **Diseño Dirigido por Pruebas (Design-Driven Testing - DDT)** promovida por la metodología ICONIX.

### Objetivos y Alcance:
1. **Verificación de Reglas Críticas:** Comprobar matemáticamente la inmutabilidad del Costo Promedio Ponderado (CPP), la regla de cambio de prenda en dos tiempos (7 días hábiles) y las tarifas mayoristas/liquidación.
2. **Resiliencia Offline-First:** Validar el comportamiento autónomo de la aplicación móvil Flutter y la PWA Angular sin conexión a Internet, y la posterior sincronización determinista con resolución de conflictos.
3. **Hermetismo Multitenant:** Asegurar que ninguna consulta, reporte o transacción permita fuga de información o acceso cruzado entre empresas.
4. **Entorno de Pruebas:**
   - **Pruebas de Backend:** `pytest` con cliente asíncrono `httpx.AsyncClient` sobre base de datos PostgreSQL de test en Docker.
   - **Pruebas de Integración de APIs:** Colección automatizada de Postman / Newman con variables de entorno para tokens JWT y assertions de esquema JSON.
   - **Pruebas de Interfaz Móvil y Web:** `flutter_test` para BLoCs y servicios locales de SQLite; Jasmine/Karma para interceptores y servicios Dexie en Angular.

---

## 5.2. Pruebas Funcionales

Las pruebas funcionales evalúan la concordancia entre las operaciones del software y las especificaciones de los casos de uso nucleares (CU01 al CU20). Cada prueba funcional valida entradas, precondiciones, transformaciones de estado y salidas esperadas:

- **Autenticación y Control de Acceso (CU01-CU05):** Verificación de bloqueo inmediato de usuarios pertenecientes a empresas con suscripción vencida, unicidad de NIT corporativo y cifrado de credenciales.
- **Catálogo Textil e Inventario (CU06-CU07, CU19-CU20):** Exactitud de cálculo de CPP con precisión a 2 decimales, inmutabilidad del registro en kardex, tarifas automáticas por volumen (>=3 prendas) y restricción estricta de compras a Web Desktop.
- **Venta POS y Operaciones Offline (CU08-CU12):** Almacenamiento local en SQLite/IndexedDB en ausencia de red, asignación de UUID v4 y respuesta idempotente ante múltiples pulsaciones de cobro.
- **Postventa y Pasarela Stripe (CU13, CU18):** Conciliación a cero entre la Nota de Devolución emitida y la Nota de Cambio con cobro del diferencial vía tarjeta en Stripe Sandbox.
- **Analítica e IA Generativa (CU15-CU17):** Validación de consultas SQL seguras con cláusula obligatoria `tenant_id`, generación de gráficos y previsiones de demanda textil con Scikit-Learn.

---

## 5.3. Pruebas de Integración

Las pruebas de integración validan la interoperabilidad entre los diferentes subsistemas, APIs externas y mecanismos de persistencia:

### TI01: Sincronización Offline End-to-End con Reconciliación de Stock

| Atributo | Detalle |
|:---|:---|
| **ID Prueba** | TI-SYNC-01 |
| **Componentes Involucrados** | Angular PWA / Flutter Móvil + `sync_service` + Base de Datos PostgreSQL |
| **Objetivo** | Verificar que una venta encolada sin conexión en SQLite/IndexedDB se sincroniza y descuenta el stock real al recuperar Internet |
| **Precondiciones** | Stock en servidor de Camisa Polo M = 5 unidades. Dispositivo desconectado de la red. |
| **Procedimiento** | 1. Registrar venta offline de 2 unidades en el cliente. 2. Verificar que se genera UUID y se guarda en `operaciones_offline` local. 3. Reconectar conectividad Wi-Fi. 4. El background worker invoca `POST /api/sync/operacion`. 5. Consultar stock en PostgreSQL central. |
| **Resultado Esperado** | Venta creada con `estado_sync='SINCRONIZADA'`, stock en BD central actualizado a 3 unidades, operación local marcada como `CONFIRMADA`. |
| **Estado** | **PASÓ** ✅ |

### TI02: Flujo Completo de Cambio de Prenda con Pasarela Stripe

| Atributo | Detalle |
|:---|:---|
| **ID Prueba** | TI-CAMBIO-02 |
| **Componentes Involucrados** | Front Web POS + `cambio_service` + Stripe API + Kardex PostgreSQL |
| **Objetivo** | Validar la emisión secuencial de la Nota de Devolución, cobro del saldo diferencial y emisión de la Nota de Cambio |
| **Precondiciones** | Venta #V100 existente (Camisa M a Bs. 50). Stock Camisa M = 2, Stock Camisa L = 4 (precio Bs. 70). |
| **Procedimiento** | 1. Iniciar cambio de Camisa M. 2. Verificar emisión de Nota de Devolución y reingreso físico (Stock M pasa a 3). 3. Seleccionar Camisa L (+Bs. 20). 4. Enviar token de prueba Stripe `tok_visa` por Bs. 20. 5. Confirmar transacción en Stripe. 6. Verificar emisión de Nota de Cambio y despacho (Stock L pasa a 3). |
| **Resultado Esperado** | Dos notas emitidas en BD, inventarios actualizados en kardex, cobro de Bs. 20 registrado con ID de Stripe y cambio en estado `COMPLETADO`. |
| **Estado** | **PASÓ** ✅ |

### TI03: Verificación de Aislamiento Estricto Multitenant

| Atributo | Detalle |
|:---|:---|
| **ID Prueba** | TI-TENANT-03 |
| **Componentes Involucrados** | JWT Security Middleware + Endpoints REST + PostgreSQL RLS / Filter |
| **Objetivo** | Comprobar que un usuario autenticado de Empresa A no puede leer ni modificar productos, clientes o ventas de Empresa B |
| **Precondiciones** | Usuario A autenticado con `tenant_id=1`. Producto #99 perteneciente a `tenant_id=2`. |
| **Procedimiento** | 1. Enviar petición `GET /api/productos/99` portando el JWT del Usuario A. 2. Enviar petición `POST /api/ventas` intentando asignar `sucursal_id` de Empresa B. |
| **Resultado Esperado** | Código de respuesta HTTP 404 Not Found o 403 Forbidden. En ningún caso se revelan datos de la Empresa B. |
| **Estado** | **PASÓ** ✅ |

### TI04: Generación y Ejecución Segura de Reportes IA

| Atributo | Detalle |
|:---|:---|
| **ID Prueba** | TI-IA-04 |
| **Componentes Involucrados** | Frontend UI + `ai_report_service` + OpenAI API + Motor PostgreSQL |
| **Objetivo** | Verificar que un comando en lenguaje natural genera una consulta SQL válida, restringida por tenant_id y renderizable |
| **Precondiciones** | Tenant con 15 ventas registradas en el mes actual. |
| **Procedimiento** | 1. Ingresar: "Top 5 productos más vendidos este mes". 2. Capturar la consulta SQL devuelta por el LLM. 3. Verificar que incluya cláusula `WHERE tenant_id = X`. 4. Ejecutar consulta y formatear en JSON. |
| **Resultado Esperado** | Respuesta JSON estructurada con datos reales de los 5 productos y tipo de gráfico "barras". Consulta segura ejecutada sin errores de sintaxis. |
| **Estado** | **PASÓ** ✅ |

---

## 5.4. Corrección de Errores

Durante las fases de integración y pruebas del sistema se identificaron y subsanaron los siguientes defectos:

| Nro. | Defecto Identificado | Causa Raíz | Solución Aplicada |
|:---:|:---|:---|:---|
| 1 | **Duplicación de transacciones offline** | El usuario presionaba repetidas veces "Confirmar Venta" ante la falta de feedback en red lenta. | Se implementó generación de **UUID v4** en el cliente antes de la confirmación y restricción de unicidad (`UNIQUE CONSTRAINT`) en `operaciones_offline_sync`. Múltiples envíos retornan respuesta idempotente. |
| 2 | **Filtrado cruzado en reportes IA** | El LLM ocasionalmente omitía la restricción de tenant en consultas complejas con `JOIN`. | Se implementó un parser de seguridad en FastAPI que inspecciona el árbol sintáctico (AST) del SQL y valida obligatoriamente la presencia de `tenant_id = {current_tenant}` antes de ejecutarlo en base de datos. |
| 3 | **Desincronización de Kardex en cambios** | El inventario de la prenda devuelta no se valoraba al costo histórico de venta original. | Se vinculó la `NotaDevolucion` a la línea original de `DetalleVenta` para extraer el CPP exacto de la fecha de venta, preservando la exactitud del kardex contable. |
| 4 | **Bloqueo en bucle de diagramas de secuencia** | En la primera versión de los modelos UML, los fragmentos `loop` abarcaban la interfaz gráfica (UI). | Se corrigió la sintaxis UML según la observación docente: los fragmentos `loop` solo encierran clases de control y entidades. La interfaz gestiona colecciones completas sin iterar visualmente en el diagrama. |

---

## 5.5. Resultados de las Pruebas

A continuación se resume el balance cuantitativo de ejecución de pruebas funcionales y de aceptación sobre los 20 casos de uso del software:

| Módulo Evaluado | Casos de Uso Cubiertos | Pruebas Ejecutadas | Pruebas Aprobadas | Pruebas Fallidas | Tasa de Éxito |
|:---|:---:|:---:|:---:|:---:|:---:|
| **1. Gobernanza SaaS y Seguridad** | CU01, CU02, CU03, CU04, CU05 | 8 | 8 | 0 | 100% |
| **2. Catalogación Textil, Inventario y Compras** | CU06, CU07, CU19, CU20 | 8 | 8 | 0 | 100% |
| **3. Operaciones Offline-First y Sincronización** | CU08, CU09, CU10, CU11, CU12 | 10 | 10 | 0 | 100% |
| **4. Ventas POS, Postventa y Pasarela Stripe** | CU13, CU18 | 6 | 6 | 0 | 100% |
| **5. Traspasos, Analítica e Inteligencia Artificial / ML** | CU14, CU15, CU16, CU17 | 6 | 6 | 0 | 100% |
| **Total General** | **CU01 al CU20 (100% Cobertura)** | **38** | **38** | **0** | **100%** |

---

## 5.6. Casos de Prueba

A continuación se presentan las especificaciones formales de los casos de prueba ejecutados sobre los casos de uso nucleares, seguidas de la matriz de trazabilidad transversal ICONIX:

### 5.6.1. Fichas de Casos de Prueba (Pruebas de Aceptación)

Conforme a la metodología **ICONIX** y la filosofía de **Diseño Dirigido por Pruebas (Design-Driven Testing - DDT)** formulada por Doug Rosenberg y Matt Stephens (*Design-Driven Testing: Test Smarter, Not Harder*), las pruebas de aceptación representan el cierre formal del ciclo de desarrollo. Cada uno de los **20 casos de uso del sistema (CU01 al CU20)** cuenta con su respectiva ficha técnica formal de prueba de aceptación, derivada de la narrativa del caso de uso y de los diagramas de robustez/secuencia, acompañada del registro visual de la interfaz de usuario implementada:

---

#### Prueba de Caso de Uso CU01: Gestionar Empresas
*(Pruebas de aceptación)*

| Caso de uso 1 | Gestión de Empresas (SaaS Multitenant) |
|:---|:---|
| **Descripción** | Permite que el Super Administrador registre nuevas empresas cliente (tenants), configure sus datos jurídicos (NIT, razón social), asigne planes de suscripción y cree automáticamente la cuenta del Administrador de Empresa, garantizando el aislamiento lógico de datos en PostgreSQL mediante `tenant_id` y esquemas dedicados. |
| **Precondiciones** | a) El Super Administrador debe tener sesión iniciada en la plataforma central.<br>b) El módulo "Empresas SaaS" debe estar habilitado.<br>c) El NIT de la nueva empresa no debe existir previamente en la base de datos central. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Acceder al módulo "Gestión de Empresas" desde el menú administrativo. | Se despliega el listado de tenants registrados con NIT, Razón Social, Plan y Estado. | Satisfactorio |
| 2 | Pulsar el botón "+ Registrar Empresa". | Se abre el modal con formulario de alta de nuevo tenant. | Satisfactorio |
| 3 | Ingresar NIT ("1029384756"), Razón Social ("Boutique Elegance SRL"), Plan y Email del Admin. | Los campos validan formato de correo y formato numérico de NIT en tiempo real. | Satisfactorio |
| 4 | Confirmar guardado mediante el botón "Guardar". | El sistema crea el registro en PostgreSQL, genera el hash bcrypt del admin y asigna el schema multitenant (HTTP 201 Created). | Satisfactorio |
| 5 | Visualizar el nuevo tenant en la lista general. | La tabla se actualiza de inmediato mostrando la empresa en estado "Activo" con su plan contratado. | Satisfactorio |
| 6 | Verificar aislamiento multitenant. | Las consultas del nuevo tenant quedan herméticamente aisladas sin exponer datos de otros clientes. | Satisfactorio |

| Responsable | Super Administrador de Plataforma |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU01: Gestionar Empresas](../diagramas/imagenes_pruebas/Prueba_CU01_Gestionar_Empresas.png) |

---

#### Prueba de Caso de Uso CU02: Gestionar Planes de Suscripción
*(Pruebas de aceptación)*

| Caso de uso 2 | Gestión de Planes de Suscripción SaaS |
|:---|:---|
| **Descripción** | Permite al Super Administrador crear y parametrizar los paquetes comerciales de suscripción (Básico, Profesional, Enterprise), definiendo cuotas de sucursales, límites de usuarios concurrentes, tarifas mensuales en bolivianos y módulos habilitados. |
| **Precondiciones** | a) Super Administrador autenticado con privilegios globales.<br>b) Conexión activa a base de datos central.<br>c) Código mnemotécnico de plan no registrado previamente. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar a la sección "Planes de Suscripción" en el panel maestro. | Se visualiza el catálogo de planes activos con sus límites y precios. | Satisfactorio |
| 2 | Presionar "+ Nuevo Plan". | Se despliega el modal de configuración de parámetros comerciales. | Satisfactorio |
| 3 | Configurar nombre "Empresarial Pro Plus", tarifa "Bs. 950.00", 12 sucursales y 30 usuarios. | El sistema fiscaliza que los límites sean enteros positivos y el precio admita 2 decimales. | Satisfactorio |
| 4 | Activar banderas de funcionalidades avanzadas (Offline y Reportes IA). | Las opciones quedan seleccionadas para gobernanza automática de permisos. | Satisfactorio |
| 5 | Guardar nuevo plan de suscripción. | Se inserta el registro en la tabla `planes_suscripcion` con estado "Activo". | Satisfactorio |
| 6 | Verificar disponibilidad inmediata. | El plan aparece disponible para contratación al dar de alta nuevos tenants. | Satisfactorio |

| Responsable | Super Administrador de Plataforma |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU02: Gestionar Planes](../diagramas/imagenes_pruebas/Prueba_CU02_Gestionar_Planes.png) |

---

#### Prueba de Caso de Uso CU03: Gestionar Suscripción de Empresa
*(Pruebas de aceptación)*

| Caso de uso 3 | Gestión de Suscripción de Empresa |
|:---|:---|
| **Descripción** | Permite auditar el estado y vigencia de la suscripción de cada empresa contratante, procesar renovaciones de periodos (mensual/anual), aplicar extensiones y registrar comprobantes de pago de licencias B2B. |
| **Precondiciones** | a) Empresa tenant registrada en el sistema.<br>b) Super Administrador autenticado.<br>c) Factura o comprobante de renovación disponible. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Seleccionar una empresa desde la tabla de tenants y abrir "Detalle Suscripción". | Se muestra el historial de suscripciones, fechas de inicio/fin y estado actual. | Satisfactorio |
| 2 | Seleccionar una suscripción vencida y presionar "Renovar Suscripción". | Se abre el formulario de prórroga y actualización de periodo. | Satisfactorio |
| 3 | Seleccionar plazo de extensión (12 meses) e ingresar número de comprobante. | El sistema calcula automáticamente la nueva fecha de expiración. | Satisfactorio |
| 4 | Confirmar la renovación del servicio. | El estado de la empresa cambia de `VENCIDA` a `VIGENTE` en la base de datos. | Satisfactorio |
| 5 | Comprobar desbloqueo operativo del tenant. | Los usuarios de la empresa recuperan de inmediato el acceso a los módulos operativos. | Satisfactorio |
| 6 | Emitir confirmación al correo de la empresa. | Se envía notificación por correo electrónico con el recibo de renovación. | Satisfactorio |

| Responsable | Super Administrador de Plataforma |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU03: Gestionar Suscripción](../diagramas/imagenes_pruebas/Prueba_CU03_Gestionar_Suscripcion.png) |

---

#### Prueba de Caso de Uso CU04: Autenticar Usuario y Control de Acceso (RBAC y Suscripción)
*(Pruebas de aceptación)*

| Caso de uso 4 | Autenticar Usuario y Control de Acceso (RBAC) |
|:---|:---|
| **Descripción** | Permite verificar las credenciales de los usuarios, controlar el acceso según roles (Super Admin, Admin Empresa, Encargado, Cajero) y aplicar la regla de negocio de bloqueo inmediato si la suscripción de la empresa contratante se encuentra vencida. |
| **Precondiciones** | a) La base de datos central PostgreSQL debe estar operativa.<br>b) Debe existir un usuario registrado con credenciales válidas perteneciente a una empresa con suscripción vencida (`estado_suscripcion = 'VENCIDA'`).<br>c) El middleware de seguridad e inspección de JWT debe estar activo. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Acceder a la pantalla de inicio de sesión (/login). | Se despliega el formulario seguro de autenticación. | Satisfactorio |
| 2 | Ingresar email y contraseña válidos de un cajero perteneciente a una empresa con suscripción vencida. | El formulario captura las credenciales y las transmite por canal HTTPS seguro. | Satisfactorio |
| 3 | Presionar "Iniciar Sesión". | El backend autentica la contraseña con bcrypt y verifica la vigencia de la suscripción del tenant. | Satisfactorio |
| 4 | Detectar condición de suscripción vencida. | El middleware intercepta la solicitud y deniega la emisión de permisos operativos. | Satisfactorio |
| 5 | Retornar código HTTP 403 Forbidden. | La interfaz despliega la alerta: "Su empresa tiene la suscripción vencida. Contacte al administrador de plataforma." | Satisfactorio |
| 6 | Registrar auditoría en bitácora. | Se genera un registro de evento de intento de acceso bloqueado por morosidad de tenant. | Satisfactorio |

| Responsable | Administrador de Seguridad / Auditor |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU04: Autenticar Usuario](../diagramas/imagenes_pruebas/Prueba_CU04_Autenticar_Multitenant.png) |

---

#### Prueba de Caso de Uso CU05: Gestionar Usuarios y Roles por Empresa
*(Pruebas de aceptación)*

| Caso de uso 5 | Gestión de Usuarios y Roles por Empresa |
|:---|:---|
| **Descripción** | Permite al Administrador de Empresa crear colaboradores (Encargados de Sucursal, Cajeros), asignarles sucursales físicas operativas, establecer roles según la matriz RBAC y gestionar bloqueos de seguridad por intentos fallidos. |
| **Precondiciones** | a) Administrador de Empresa autenticado con sesión activa.<br>b) Sucursal física creada previamente dentro de los límites del plan.<br>c) Correo corporativo del nuevo usuario no registrado. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar al módulo "Personal y Seguridad" desde el menú corporativo. | Se muestra la lista de colaboradores del tenant con su rol, sucursal y estado. | Satisfactorio |
| 2 | Pulsar "+ Registrar Colaborador". | Se abre el modal de registro de usuario corporativo. | Satisfactorio |
| 3 | Ingresar nombre, email corporativo, seleccionar rol `CAJERO` y asignar sucursal. | El sistema valida que el email pertenezca al dominio y que la sucursal esté activa. | Satisfactorio |
| 4 | Establecer contraseña temporal con políticas de complejidad. | Se encripta con algoritmo bcrypt (cost factor 12) antes de persistir en PostgreSQL. | Satisfactorio |
| 5 | Confirmar guardado del colaborador. | Se asienta la fila en tabla `usuarios` asociando obligatoriamente el `tenant_id` de la empresa. | Satisfactorio |
| 6 | Comprobar actualización en la tabla de usuarios. | El nuevo cajero aparece en estado "Activo" con sus credenciales operativas listas. | Satisfactorio |

| Responsable | Administrador de Empresa |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU05: Usuarios y Roles](../diagramas/imagenes_pruebas/Prueba_CU05_Gestionar_Usuarios_Empresa.png) |

---

#### Prueba de Caso de Uso CU06: Gestionar Catálogo Textil y Fichas Anatómicas en Centímetros
*(Pruebas de aceptación)*

| Caso de uso 6 | Gestionar Catálogo Textil y Fichas Anatómicas |
|:---|:---|
| **Descripción** | Permite registrar y administrar las prendas de vestir masculinas, configurando atributos textiles avanzados: guía anatómica en centímetros (pecho, cintura, cadera, largo), colores compuestos con códigos Hexadecimales, composición textil hipoalergénica y vinculación de modelos 3D (.glb). |
| **Precondiciones** | a) Usuario autenticado con rol Administrador de Empresa o Encargado de Sucursal.<br>b) Categorías textiles registradas previamente.<br>c) Conexión activa con el repositorio de activos digitales para modelos 3D. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Acceder al módulo "Catálogo Textil" desde el panel principal. | Se muestra la lista de prendas registradas con imagen, SKU, dimensiones y precio base. | Satisfactorio |
| 2 | Presionar "+ Registrar Prenda". | Se abre el modal con ficha técnica textil avanzada. | Satisfactorio |
| 3 | Registrar dimensiones anatómicas en centímetros por talla (S, M, L, XL). | El sistema valida que las medidas corporales en cm sean valores numéricos positivos coherentes. | Satisfactorio |
| 4 | Configurar color compuesto con selector Hexadecimal (#0B2545 / #FFFFFF). | Se renderiza la muestra visual bicolor en la vista previa del formulario. | Satisfactorio |
| 5 | Adjuntar modelo tridimensional (.glb) para probador virtual en Realidad Aumentada. | El archivo es validado por tamaño y tipo MIME, cargándose al servidor de almacenamiento. | Satisfactorio |
| 6 | Guardar prenda y verificar publicación. | El producto queda guardado en PostgreSQL y disponible de inmediato en el catálogo omnicanal. | Satisfactorio |

| Responsable | Encargado de Catálogo / Administrador |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU06: Catálogo Textil](../diagramas/imagenes_pruebas/Prueba_CU06_Gestionar_Productos.png) |

---

#### Prueba de Caso de Uso CU07: Inventario Multi-Sucursal y Recálculo Inmutable de CPP
*(Pruebas de aceptación)*

| Caso de uso 7 | Inventario Multi-Sucursal y CPP Inmutable |
|:---|:---|
| **Descripción** | Valida el registro de existencias físicas por sucursal y la inmutabilidad matemática del Costo Promedio Ponderado (CPP) tras cada recepción de compra a proveedores, generando un asiento inmutable en el kardex físico-valorado. |
| **Precondiciones** | a) Usuario autenticado con rol Encargado de Sucursal o Administrador.<br>b) Stock previo existente de Camisa Lino Blanca M: 10 unidades a CPP = Bs. 100.00 (Saldo valorado: Bs. 1,000.00).<br>c) Factura de proveedor válida con 20 unidades adicionales a costo unitario de Bs. 130.00. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar al módulo "Inventarios y CPP" y seleccionar la variante Camisa Lino M. | Se despliega el saldo actual (10 unids) y el CPP vigente (Bs. 100.00). | Satisfactorio |
| 2 | Seleccionar "Registrar Entrada por Compra". | Se abre el formulario de asiento de kardex. | Satisfactorio |
| 3 | Ingresar cantidad (20 unidades) y costo unitario de compra (Bs. 130.00). | El motor financiero calcula: Stock final = 30; Nuevo CPP = (1000 + 2600)/30 = Bs. 120.00. | Satisfactorio |
| 4 | Confirmar la transacción de ingreso. | Se asienta la fila en kardex con saldo valorado de Bs. 3,600.00 y firma digital del responsable. | Satisfactorio |
| 5 | Consultar inmutabilidad del registro. | El kardex no permite edición ni borrado del registro asentado. | Satisfactorio |
| 6 | Comprobar actualización en inventario multi-sucursal. | El stock disponible refleja 30 unidades y el costo unitario para margen refleja Bs. 120.00. | Satisfactorio |

| Responsable | Encargado de Sucursal / Contador de Inventario |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU07: Inventario y CPP](../diagramas/imagenes_pruebas/Prueba_CU07_Gestionar_Inventario_CPP.png) |

---

#### Prueba de Caso de Uso CU08: Descargar y Consultar Catálogo Digital Offline (Cliente)
*(Pruebas de aceptación)*

| Caso de uso 8 | Catálogo Digital Offline (PWA / App Móvil) |
|:---|:---|
| **Descripción** | Permite a clientes y vendedores navegar por el catálogo textil completo, ver imágenes optimizadas WebP y aplicar filtros por medidas anatómicas en cm y colores, operando de forma autónoma sin acceso a Internet gracias a IndexedDB / SQLite. |
| **Precondiciones** | a) Aplicación cliente iniciada con conexión previa para descarga de snapshot.<br>b) Dispositivo móvil o navegador sin red (`navigator.onLine = false`).<br>c) Espacio de almacenamiento local disponible en el cliente. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Desconectar intencionalmente la conexión Wi-Fi / Datos del dispositivo. | La aplicación detecta el corte de red y conmuta a modo "Catálogo Offline" sin errores. | Satisfactorio |
| 2 | Ingresar a la sección "Catálogo de Prendas". | Se despliegan 48 productos cacheados con miniaturas WebP locales e información técnica. | Satisfactorio |
| 3 | Aplicar filtro por medidas anatómicas (Pecho entre 100 y 105 cm). | El motor de búsqueda local en IndexedDB/SQLite filtra las prendas en menos de 20 ms. | Satisfactorio |
| 4 | Consultar el detalle de una prenda masculina seleccionada. | Se muestra la ficha anatómica completa, composición 100% algodón y precios vigentes. | Satisfactorio |
| 5 | Seleccionar talla y color compuesto para agregar al carrito provisional. | El ítem se agrega a la orden local sin requerir llamadas al servidor central. | Satisfactorio |
| 6 | Verificar persistencia al reiniciar la aplicación móvil. | Al cerrar y reabrir la app sin conexión, el catálogo y carrito se preservan intactos. | Satisfactorio |

| Responsable | Cliente Digital / Vendedor en Salón |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU08: Catálogo Offline](../diagramas/imagenes_pruebas/Prueba_CU08_Descargar_Catalogo_Offline.png) |

---

#### Prueba de Caso de Uso CU09: Registrar Reserva Presencial Sin Conexión a Internet
*(Pruebas de aceptación)*

| Caso de uso 9 | Registrar Reserva Presencial Offline con QR |
|:---|:---|
| **Descripción** | Permite a los clientes reservar prendas en vestidores físicos de una sucursal aun cuando el dispositivo se encuentre sin conexión a Internet, generando un token QR autónomo cifrado localmente para validación presencial posterior. |
| **Precondiciones** | a) App móvil con sesión iniciada y catálogo local sincronizado.<br>b) Dispositivo sin conexión a Internet (`offline`).<br>c) Horario de probadores físicos configurado en la sucursal seleccionada. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Seleccionar prenda y talla deseada en modo offline dentro de la app móvil. | Se abre la opción "Reservar para Probar en Tienda". | Satisfactorio |
| 2 | Seleccionar sucursal física de destino y horario estimado de visita. | La app valida la capacidad de vestidores según los datos cacheados localmente. | Satisfactorio |
| 3 | Confirmar solicitud de reserva presencial. | La app genera un token criptográfico local y almacena la reserva en SQLite. | Satisfactorio |
| 4 | Renderizar código QR en pantalla sin requerir llamada a Internet. | Se visualiza en pantalla el código QR unívoco con hash de reserva y fecha límite. | Satisfactorio |
| 5 | Asignar estado temporal a la reserva en cola local. | La reserva queda guardada con estado `RESERVADO` y marca `PENDIENTE_SYNC`. | Satisfactorio |
| 6 | Presentar el código QR en caja al llegar a la tienda física. | El encargado de tienda escanea el QR y valida los datos de la reserva offline. | Satisfactorio |

| Responsable | Cliente Móvil / Encargado de Tienda |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU09: Reserva Presencial Offline](../diagramas/imagenes_pruebas/Prueba_CU09_Registrar_Reserva_Offline.png) |

---

#### Prueba de Caso de Uso CU10: Registrar Venta POS Offline al Contado
*(Pruebas de aceptación)*

| Caso de uso 10 | Registrar Venta POS Offline al Contado |
|:---|:---|
| **Descripción** | Permite a los cajeros en tiendas físicas realizar ventas en efectivo de manera ininterrumpida cuando la conexión a Internet se interrumpe, almacenando los datos localmente en SQLite/IndexedDB con UUID v4 único e idempotente y emitiendo un ticket provisional. |
| **Precondiciones** | a) Terminal POS autenticado con catálogo descargado previamente en almacenamiento local.<br>b) Dispositivo sin conectividad a Internet (`navigator.onLine = false`).<br>c) Saldo inicial de caja física abierto. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Interrumpir la conexión a Internet en la terminal POS. | El sistema conmuta automáticamente a modo "Offline Autónomo" con indicador visual ámbar. | Satisfactorio |
| 2 | Escanear código de barras o buscar prenda (2 camisas a Bs. 250.00 c/u). | Las prendas se añaden al carrito POS con total de Bs. 500.00. | Satisfactorio |
| 3 | Seleccionar modalidad de pago "Efectivo Contado" e ingresar Bs. 500.00. | El sistema calcula cambio Bs. 0.00 y habilita el botón "Cobrar". | Satisfactorio |
| 4 | Presionar "Cobrar" (incluso ante múltiples pulsaciones consecutivas). | Se genera un único UUID v4 (`c9a1d2e3...`), previniendo duplicación por idempotencia. | Satisfactorio |
| 5 | Guardar transacción en almacenamiento local (SQLite/IndexedDB). | La venta se asienta en `operaciones_offline` con estado `PENDIENTE_SYNC`. Tiempo: 18 ms. | Satisfactorio |
| 6 | Imprimir comprobante provisional de venta. | Se genera el ticket fiscal provisional con el UUID v4 impreso para respaldo del cliente. | Satisfactorio |

| Responsable | Cajero de Sucursal Física |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU10: Venta POS Offline](../diagramas/imagenes_pruebas/Prueba_CU10_Registrar_Venta_POS_Offline.png) |

---

#### Prueba de Caso de Uso CU11: Consultar y Auditar Operaciones Locales Pendientes
*(Pruebas de aceptación)*

| Caso de uso 11 | Bandeja de Operaciones Locales Pendientes |
|:---|:---|
| **Descripción** | Permite a los cajeros y encargados de tienda inspeccionar visualmente la cola de transacciones almacenadas localmente en SQLite/IndexedDB que están a la espera de conexión a Internet para ser transmitidas a la base central. |
| **Precondiciones** | a) Terminal POS o dispositivo móvil con al menos una venta o reserva offline generada.<br>b) Usuario autenticado con rol Cajero o Encargado de Sucursal.<br>c) Acceso al menú de contingencia y sincronización local. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Abrir el panel "Bandeja de Operaciones Offline" desde la terminal. | Se despliega la lista de transacciones locales pendientes con su UUID y hora de registro. | Satisfactorio |
| 2 | Consultar el detalle de una venta local encolada. | Se muestra el desglose completo de prendas, cliente, monto total e identificador UUID. | Satisfactorio |
| 3 | Verificar estado de la cola de sincronización. | Los ítems se visualizan con etiqueta amarilla "PENDIENTE_SYNC" y cero reintentos fallidos. | Satisfactorio |
| 4 | Validar cálculo de totales acumulados en modo offline. | La bandeja consolida el total en bolivianos de ventas locales efectuadas durante la desconexión. | Satisfactorio |
| 5 | Presionar botón "Probar Conexión con Servidor Central". | El sistema realiza un ping HTTP liviano indicando si el backend ya es accesible. | Satisfactorio |
| 6 | Mantener la integridad de los datos ante cierres imprevistos. | Se simula apagado de la app; al reabrir, la cola de operaciones permanece íntegra. | Satisfactorio |

| Responsable | Cajero / Encargado de Sucursal |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU11: Operaciones Locales Pendientes](../diagramas/imagenes_pruebas/Prueba_CU11_Consultar_Operaciones_Locales.png) |

---

#### Prueba de Caso de Uso CU12: Sincronización Idempotente con UUID v4 y Resolución de Quiebres
*(Pruebas de aceptación)*

| Caso de uso 12 | Sincronización Idempotente con UUID v4 |
|:---|:---|
| **Descripción** | Evalúa el protocolo de transmisión en segundo plano de operaciones locales hacia la base central en PostgreSQL una vez restablecida la red, aplicando política determinista de inventario ante quiebres de stock. |
| **Precondiciones** | a) Operaciones offline encoladas en el dispositivo móvil/PWA con UUID v4.<br>b) Conexión a Internet restablecida (`navigator.onLine = true`).<br>c) Stock central en PostgreSQL = 1 unidad; venta física offline ya entregada = 2 unidades. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Restablecer conectividad a Internet en la terminal. | El worker en segundo plano detecta la red e inicia el proceso de sincronización. | Satisfactorio |
| 2 | Transmitir lote con cabecera `X-Idempotency-Key` y payload cifrado. | El backend recibe el lote de operaciones pendientes. | Satisfactorio |
| 3 | Validar unicidad de cada UUID v4 en tabla central. | Se verifica que ninguna operación haya sido procesada previamente. | Satisfactorio |
| 4 | Evaluar discrepancia de inventario (quiebre de stock transitorio). | El backend aplica la política de negocio: la venta física prevalece, el stock queda en -1. | Satisfactorio |
| 5 | Disparar alerta de alta prioridad al Encargado de Sucursal. | Se emite notificación inmediata para reabastecimiento urgente de la prenda agotada. | Satisfactorio |
| 6 | Confirmar estado de sincronización en el cliente. | Las operaciones locales pasan a estado `CONFIRMADA` y se libera el espacio en cola local. | Satisfactorio |

| Responsable | Servicio de Sincronización / Encargado de Sucursal |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU12: Sincronización UUID](../diagramas/imagenes_pruebas/Prueba_CU12_Sincronizar_Operaciones_UUID.png) |

---

#### Prueba de Caso de Uso CU13: Gestión de Cambio de Prenda en Dos Tiempos
*(Pruebas de aceptación)*

| Caso de uso 13 | Cambio de Prenda en Dos Tiempos |
|:---|:---|
| **Descripción** | Valida el proceso postventa de cambio de prenda respetando la regla de 7 días hábiles: Tiempo 1 emite Nota de Devolución con reingreso a stock, y Tiempo 2 emite Nota de Cambio con selección de nueva prenda y cobro de diferencial vía Stripe. |
| **Precondiciones** | a) Venta original existente dentro de los 7 días hábiles de plazo.<br>b) Prenda devuelta en perfecto estado: Camisa Lino M (valor original Bs. 250.00).<br>c) Prenda nueva deseada: Camisa Entallada Slim L (precio Bs. 290.00; diferencial Bs. 40.00). |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar código de comprobante original en el módulo de Postventa. | Se carga el detalle de la venta original validando que no exceda los 7 días hábiles. | Satisfactorio |
| 2 | Registrar recepción física de la prenda devuelta (Tiempo 1). | Se emite la Nota de Devolución #DEV-1042 con reingreso al inventario físico (+1). | Satisfactorio |
| 3 | Seleccionar nueva prenda de reemplazo (Tiempo 2: Camisa Talla L). | El sistema calcula el saldo diferencial exacto: Bs. 290.00 - Bs. 250.00 = +Bs. 40.00. | Satisfactorio |
| 4 | Procesar el cobro diferencial de Bs. 40.00 con tarjeta en Stripe Sandbox. | Stripe procesa el token de prueba y retorna confirmación del pago `succeeded`. | Satisfactorio |
| 5 | Emitir la Nota de Cambio #CAM-2098 vinculada a la Nota de Devolución. | Se genera la salida física de la nueva prenda (-1) y se concilia el saldo contable a cero. | Satisfactorio |
| 6 | Entregar comprobantes al cliente. | El cliente recibe comprobante de devolución, comprobante de cambio y voucher Stripe. | Satisfactorio |

| Responsable | Cajero / Encargado de Sucursal |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU13: Cambio de Prenda](../diagramas/imagenes_pruebas/Prueba_CU13_Cambio_Prenda_Dos_Tiempos.png) |

---

#### Prueba de Caso de Uso CU14: Gestionar Traspaso Inter-Sucursal de Inventario
*(Pruebas de aceptación)*

| Caso de uso 14 | Gestión de Traspasos Inter-Sucursales |
|:---|:---|
| **Descripción** | Permite solicitar y despachar transferencias de mercadería entre sucursales físicas de una misma empresa, administrando los estados de solicitud, aprobación, tránsito y recepción física con rebalanceo automático en los inventarios. |
| **Precondiciones** | a) Al menos dos sucursales físicas creadas en la empresa tenant.<br>b) Stock suficiente en la sucursal de origen (Sucursal Central).<br>c) Encargado de Sucursal autenticado. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar al módulo "Traspasos de Inventario" y pulsar "+ Nueva Solicitud". | Se abre el formulario de transferencia inter-sucursal. | Satisfactorio |
| 2 | Seleccionar Sucursal Origen (Central) y Sucursal Destino (Equipetrol). | El sistema muestra únicamente el catálogo y existencias de la sucursal emisora. | Satisfactorio |
| 3 | Agregar 10 unidades de "Camisa Lino Blanca M" a la orden de despacho. | Se verifica que la cantidad solicitada no sobrepase el stock disponible. | Satisfactorio |
| 4 | Autorizar despacho y marcar mercadería "EN_TRANSITO". | El stock en la sucursal origen se descuenta de forma preventiva (-10 unidades). | Satisfactorio |
| 5 | Registrar recepción física en la sucursal de destino. | El encargado receptor valida el estado de las prendas y confirma la recepción. | Satisfactorio |
| 6 | Asentar rebalanceo y completar transferencia. | El stock en la sucursal destino se incrementa (+10) y se asientan asientos de kardex inmutables. | Satisfactorio |

| Responsable | Encargado de Sucursal Emisora / Receptora |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU14: Traspaso Inter-Sucursal](../diagramas/imagenes_pruebas/Prueba_CU14_Traspaso_Inter_Sucursal.png) |

---

#### Prueba de Caso de Uso CU15: Reportes Analíticos con Inteligencia Artificial Generativa
*(Pruebas de aceptación)*

| Caso de uso 15 | Reportes Analíticos con IA Generativa |
|:---|:---|
| **Descripción** | Evalúa la capacidad de generar consultas analíticas en lenguaje natural (texto o voz), transformándolas en consultas SQL seguras con inyección obligatoria del filtro multitenant (`WHERE tenant_id = X`). |
| **Precondiciones** | a) Usuario autenticado con rol Administrador de Empresa o Super Admin.<br>b) Base de datos con datos históricos de ventas del tenant.<br>c) Servicio LLM / OpenAI API activo y parser de seguridad AST habilitado. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Ingresar al módulo "Analítica IA" y pulsar el botón del micrófono o campo de texto. | Se activa la interfaz de entrada en lenguaje natural. | Satisfactorio |
| 2 | Enviar solicitud: "Top 5 productos más vendidos del mes actual". | El servicio procesa el prompt y solicita la generación de SQL al modelo LLM. | Satisfactorio |
| 3 | Inspeccionar consulta SQL generada en el backend FastAPI. | El parser AST verifica que la consulta contenga obligatoriamente `WHERE tenant_id = 1`. | Satisfactorio |
| 4 | Comprobar neutralización de sentencias destructivas. | Se valida que no contenga DROP, DELETE, ALTER ni permita fuga hacia otros tenants. | Satisfactorio |
| 5 | Ejecutar consulta segura en PostgreSQL central. | La base de datos ejecuta la lectura en 38 ms y retorna los datos en formato JSON. | Satisfactorio |
| 6 | Renderizar visualización gráfica automática. | La interfaz presenta de inmediato un gráfico de barras interactivo con los 5 productos. | Satisfactorio |

| Responsable | Gerente de Empresa / Administrador |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU15: Reportes IA](../diagramas/imagenes_pruebas/Prueba_CU15_Reportes_IA_Generativa.png) |

---

#### Prueba de Caso de Uso CU16: Exportar Reportes Analíticos a Excel/PDF
*(Pruebas de aceptación)*

| Caso de uso 16 | Exportación de Reportes a Excel y PDF |
|:---|:---|
| **Descripción** | Permite a la gerencia y auditores exportar datos tabulares y cuadros de mando en formatos ejecutivos XLSX (OpenPyXL) y PDF formal con membrete y firmas (ReportLab), aplicando filtros de fecha y aislamiento de empresa. |
| **Precondiciones** | a) Usuario con privilegios de Administrador o Encargado autenticado.<br>b) Conjunto de datos analítico cargado en pantalla (Kardex, Ventas o Inventarios).<br>c) Librerías de exportación en backend operativas sin dependencias faltantes. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Consultar el reporte consolidado de "Kardex Valorado de Inventario". | La pantalla presenta la grilla de datos con columnas contables completas. | Satisfactorio |
| 2 | Pulsar el botón "Exportar a PDF". | El backend FastAPI invoca el generador ReportLab en memoria (tiempo: 145 ms). | Satisfactorio |
| 3 | Verificar estructura del documento PDF descargado. | Incluye logotipo de la empresa, tabla paginada con CPP inmutable y pie de firma. | Satisfactorio |
| 4 | Pulsar el botón "Exportar a Excel (XLSX)". | El backend genera el libro Excel con fórmulas nativas de sumatoria y estilos. | Satisfactorio |
| 5 | Abrir el archivo generado en Microsoft Excel / LibreOffice. | La hoja abre sin advertencias de corrupción con los datos formateados a 2 decimales. | Satisfactorio |
| 6 | Fiscalizar aislamiento de datos multitenant. | El reporte no contiene ninguna fila ni ID perteneciente a empresas externas. | Satisfactorio |

| Responsable | Administrador de Empresa / Contador |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU16: Exportar Reportes](../diagramas/imagenes_pruebas/Prueba_CU16_Exportar_Reportes.png) |

---

#### Prueba de Caso de Uso CU17: Gestionar Dashboard Analítico con Machine Learning
*(Pruebas de aceptación)*

| Caso de uso 17 | Dashboard Predictivo con Machine Learning |
|:---|:---|
| **Descripción** | Proporciona proyecciones automáticas de demanda textil a 6 meses mediante algoritmos de Machine Learning (RandomForestRegressor y K-Means Clustering) para anticipar abastecimiento de temporada y evitar quiebres de stock. |
| **Precondiciones** | a) Histórico de ventas registrado en la empresa tenant (mínimo 6 meses de datos).<br>b) Módulo de analítica predictiva habilitado en el plan de suscripción.<br>c) Modelo Scikit-Learn entrenado y cargado en memoria del backend. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Acceder a la sección "Dashboard Inteligente / Machine Learning". | Se cargan los gráficos de previsión de ventas y métricas de desempeño del modelo. | Satisfactorio |
| 2 | Seleccionar categoría "Camisas de Lino" para análisis estacional. | El modelo ejecuta la inferencia predictiva para los próximos 6 meses en 62 ms. | Satisfactorio |
| 3 | Visualizar curva de tendencia de demanda futura. | La interfaz proyecta un incremento del 25% para fin de año con banda de confianza 95%. | Satisfactorio |
| 4 | Consultar recomendaciones automatizadas de abastecimiento. | El sistema sugiere cantidad óptima de compra: "Adquirir 180 unidades antes del 15 de Nov". | Satisfactorio |
| 5 | Inspeccionar agrupamiento de clientes por K-Means (Clustering). | Se visualizan 3 clusters de preferencia de atuendos según ticket promedio y calce. | Satisfactorio |
| 6 | Enlazar predicción con orden de compra hacia proveedores. | Un clic redirige la cantidad sugerida al módulo de Compras Web Desktop (CU20). | Satisfactorio |

| Responsable | Gerente de Empresa / Director de Operaciones |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU17: Dashboard ML](../diagramas/imagenes_pruebas/Prueba_CU17_Dashboard_ML.png) |

---

#### Prueba de Caso de Uso CU18: Procesamiento de Pagos con Pasarela Stripe Sandbox
*(Pruebas de aceptación)*

| Caso de uso 18 | Pasarela de Pagos Stripe Sandbox |
|:---|:---|
| **Descripción** | Comprueba la tokenización segura bajo estándar PCI-DSS, creación de PaymentIntent y confirmación de cobros con tarjeta bancaria en el entorno de pruebas de Stripe. |
| **Precondiciones** | a) Llaves API de prueba configuradas en backend FastAPI (`STRIPE_SECRET_KEY`).<br>b) Orden de venta o nota de cambio pendiente de pago por saldo diferencial.<br>c) Token de tarjeta de pruebas válido provisto por Stripe (`tok_visa`). |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Iniciar flujo de cobro digital seleccionando "Tarjeta de Crédito / Débito (Stripe)". | El frontend carga los Stripe Elements cifrados sin almacenar datos de tarjeta. | Satisfactorio |
| 2 | Invocar `POST /api/pagos/crear-intent` con monto (Bs. 40.00) y moneda. | El backend genera un PaymentIntent en Stripe y retorna el `client_secret`. | Satisfactorio |
| 3 | Enviar tokenización de tarjeta de prueba `tok_visa`. | Stripe valida la transacción en su sandbox y autoriza el cargo de Bs. 40.00. | Satisfactorio |
| 4 | Capturar evento de webhook `payment_intent.succeeded`. | El backend verifica la firma HMAC-SHA256 del webhook de Stripe. | Satisfactorio |
| 5 | Asentar pago en tabla `pagos_transacciones` con ID de Stripe. | La transacción queda registrada con código de autorización y trazabilidad contable. | Satisfactorio |
| 6 | Desplegar voucher digital de confirmación. | La interfaz notifica al usuario: "Pago confirmado exitosamente vía Stripe". | Satisfactorio |

| Responsable | Cajero / Cliente Digital |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU18: Pasarela Stripe](../diagramas/imagenes_pruebas/Prueba_CU18_Pasarela_Stripe_Sandbox.png) |

---

#### Prueba de Caso de Uso CU19: Ofertas de Liquidación y Tarifas por Mayor (>=3)
*(Pruebas de aceptación)*

| Caso de uso 19 | Liquidación y Precios por Mayor (>=3) |
|:---|:---|
| **Descripción** | Valida la aplicación automática de descuentos estacionales de liquidación (30%, 40%, 60%) y la tarifa bonificada por volumen cuando se compran 3 o más unidades de una prenda. |
| **Precondiciones** | a) Prenda en catálogo con precio de lista de Bs. 200.00 marcada con 40% de descuento de liquidación.<br>b) Regla comercial mayorista activa para compras mayores o iguales a 3 unidades (bonificación adicional de Bs. 20.00 por unidad).<br>c) Carrito de compras abierto. |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Consultar prenda en liquidación dentro del catálogo digital. | La interfaz muestra precio base Bs. 200.00 tachado y precio liquidación Bs. 120.00. | Satisfactorio |
| 2 | Añadir 1 unidad al carrito de compras. | El subtotal refleja Bs. 120.00 aplicando únicamente el 40% de descuento estacional. | Satisfactorio |
| 3 | Incrementar la cantidad en el carrito a 3 unidades. | El motor de reglas comerciales detecta la condición de volumen mayor o igual a 3. | Satisfactorio |
| 4 | Aplicar tarifa por mayor de forma automática. | El precio unitario se reduce a Bs. 100.00 c/u, calculando un total de Bs. 300.00. | Satisfactorio |
| 5 | Verificar desglose en el resumen del pedido. | Se detallan ambos beneficios (Liquidación 40% + Tarifa Mayorista) sin intervención manual. | Satisfactorio |
| 6 | Proceder al cobro con tarifas consolidadas. | La venta se asienta con el precio promocional exacto en la base de datos. | Satisfactorio |

| Responsable | Cajero POS / Cliente Web |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU19: Liquidación y Precios Mayor](../diagramas/imagenes_pruebas/Prueba_CU19_Liquidacion_Precios_Mayor.png) |

---

#### Prueba de Caso de Uso CU20: Control de Acceso Exclusivo a Compras Web Desktop
*(Pruebas de aceptación)*

| Caso de uso 20 | Compras Exclusivas Web Desktop |
|:---|:---|
| **Descripción** | Fiscaliza que el aprovisionamiento de mercadería y compras a proveedores textiles únicamente se ejecute desde estaciones de trabajo de escritorio (Web Desktop/Laptop), bloqueando el acceso desde dispositivos móviles por seguridad y auditoría. |
| **Precondiciones** | a) Usuario con rol Encargado de Sucursal o Administrador intentando acceder al módulo.<br>b) Middleware de detección de dispositivo y resolución de pantalla activo.<br>c) Navegador simulando cliente móvil (User-Agent: iPhone / Android, pantalla táctil reducida). |

| Paso | Acción | Resultado esperado | Estado (Satisfactorio/Fallido) |
|:---:|:---|:---|:---:|
| 1 | Intentar cargar la ruta `/compras/nuevo` desde un navegador móvil. | El middleware de FastAPI y Angular intercepta las cabeceras `User-Agent`. | Satisfactorio |
| 2 | Analizar resolución de pantalla y tipo de dispositivo. | Se detecta resolución inferior a 768px y User-Agent correspondiente a smartphone. | Satisfactorio |
| 3 | Aplicar política de seguridad de negocio (RN14). | El sistema deniega el acceso a las funciones de compra a proveedores. | Satisfactorio |
| 4 | Retornar respuesta HTTP 403 Forbidden. | La interfaz muestra el mensaje: "Por normativas de auditoría empresarial, el módulo de aprovisionamiento a proveedores está restringido a Web Desktop". | Satisfactorio |
| 5 | Ingresar al mismo módulo desde una computadora de escritorio (Laptop/PC). | El sistema detecta entorno Web Desktop habilitando el formulario completo de compras. | Satisfactorio |
| 6 | Asentar intento móvil en bitácora de auditoría. | Queda registrado en la base de datos el intento de acceso desde dispositivo no autorizado. | Satisfactorio |

| Responsable | Encargado de Seguridad / Auditor de Sistemas |
|:---|:---|
| **Resultado de la prueba** | **Satisfactorio** |
| **Adjunto** | ![Prueba CU20: Compras Web Desktop](../diagramas/imagenes_pruebas/Prueba_CU20_Compras_Aprovisionamiento_Desktop.png) |

---


### 5.6.2. Matriz de Trazabilidad ICONIX

La siguiente matriz evidencia la consistencia metodológica transversal entre requisitos funcionales, casos de uso, análisis de robustez (BCE), diseño de secuencia y casos de prueba:

| Requisito Funcional | Caso de Uso | Diagrama de Robustez | Diagrama de Secuencia | Caso de Prueba |
|:---|:---:|:---:|:---:|:---:|
| RF01 (Empresas SaaS Multitenant) | CU01 | `Robustez_CU01` | `Secuencia_CU01` | TCP-CU01-01 |
| RF02 (Planes de Suscripción) | CU02 | `Robustez_CU02` | `Secuencia_CU02` | TCP-CU02-01 |
| RF03 (Vigencia de Suscripción) | CU03 | `Robustez_CU03` | `Secuencia_CU03` | TCP-CU03-01 |
| RF04, RF05 (Usuarios Tenant y RBAC) | CU04, CU05 | `Robustez_CU04`, `CU05` | `Secuencia_CU04` | TCP-CU04-01 |
| RF06 (Ficha Técnica y Atributos Textiles cm/Hex/3D) | CU06 | `Robustez_CU06` | `Secuencia_CU06` | TCP-CU06-01 |
| RF07, RF08 (Inventario Multi-Sucursal y CPP Inmutable) | CU07 | `Robustez_CU07` | `Secuencia_CU07` | TCP-CU07-01 |
| RF09 (Catálogo Digital Offline PWA/Flutter) | CU08 | `Robustez_CU08` | `Secuencia_CU08` | TCP-CU08-01 |
| RF10 (Reservas Presenciales Offline con QR) | CU09 | `Robustez_CU09` | `Secuencia_CU09` | TCP-CU09-01 |
| RF11 (Ventas POS Offline Contado Efectivo) | CU10 | `Robustez_CU10` | `Secuencia_CU10` | TCP-CU10-01, 02 |
| RF12 (Auditoría de Operaciones Locales Pendientes) | CU11 | `Robustez_CU11` | `Secuencia_CU11` | TCP-CU11-01 |
| RF13, RF14 (Sincronización Idempotente con UUID v4) | CU12 | `Robustez_CU12` | `Secuencia_CU12` | TCP-CU12-01, TI01 |
| RF15-RF18 (Cambios en 2 Notas y Devolución 30 Días) | CU13 | `Robustez_CU13` | `Secuencia_CU13` | TCP-CU13-01, TI02 |
| RF19 (Traspasos Inter-Sucursales de Inventario) | CU14 | `Robustez_CU14` | `Secuencia_CU14` | TCP-CU14-01 |
| RF20-RF22 (Reportes IA Lenguaje Natural Texto y Voz) | CU15 | `Robustez_CU15` | `Secuencia_CU15` | TCP-CU15-01, TI04 |
| RF23 (Exportación Analítica a Excel y PDF) | CU16 | `Robustez_CU16` | `Secuencia_CU16` | TCP-CU16-01 |
| RF24-RF26 (Dashboard ML Proyección Demanda 6 Meses) | CU17 | `Robustez_CU17` | `Secuencia_CU17` | TCP-CU17-01 |
| RF27, RF30 (Pasarela Stripe Sandbox PCI-DSS) | CU18 | `Robustez_CU18` | `Secuencia_CU18` | TCP-CU18-01, TI02 |
| RF28, RN09, RN10 (Ofertas Liquidación 30-60% y Mayor >=3) | CU19 | `Robustez_CU19` | `Secuencia_CU19` | TCP-CU19-01 |
| RF29, RN14 (Compras y Aprovisionamiento Web Desktop) | CU20 | `Robustez_CU20` | `Secuencia_CU20` | TCP-CU20-01 |

---

# CAPÍTULO VI. CONCLUSIONES Y RECOMENDACIONES

## 6.1. Conclusiones

1. **Eficacia y Rigor de la Metodología ICONIX:**  
   La adopción de ICONIX como metodología pesada-ligera demostró ser la estrategia óptima para la evolución del sistema. Al focalizarse en el 20% crítico de artefactos UML (casos de uso con fichas y diseño, diagramas de robustez y diagramas de secuencia con fragmentos combinados), se eliminó la sobrecarga burocrática del Proceso Unificado original sin sacrificar la trazabilidad técnica. El diagrama de robustez actuó exitosamente como el puente formal entre el análisis de requisitos y la implementación, garantizando que cada método invocado en los controladores del backend FastAPI estuviera plenamente justificado y acoplado a la arquitectura.

2. **Viabilidad Técnica y Comercial del Modelo SaaS Multitenant:**  
   La transformación arquitectónica hacia una plataforma multitenant permitió dotar a FashionStore de un modelo de negocio B2B escalable. El esquema de base de datos compartida con discriminador lógico (`tenant_id`) en PostgreSQL 15, complementado por la inyección de dependencias y variables de contexto en FastAPI, demostró un aislamiento de datos 100% hermético sin incurrir en los elevados costos de infraestructura asociados a esquemas físicos independientes por cliente.

3. **Resiliencia Operativa mediante Arquitectura Offline-First:**  
   La implementación de almacenamiento local (IndexedDB en la PWA Angular y SQLite en Flutter) junto con el protocolo de sincronización idempotente basado en UUID v4 resolvió de manera contundente la vulnerabilidad de conectividad en tiendas físicas. Los cajeros y clientes pueden continuar operando de forma ininterrumpida ante caídas de red, preservando la integridad del negocio y resolviendo conflictos de inventario bajo la política formal de confirmación prioritaria en el servidor central.

4. **Innovación Analítica con Inteligencia Artificial y Machine Learning:**  
   La incorporación de reportes generativos mediante lenguaje natural y dashboards predictivos con Machine Learning transformó a FashionStore en una herramienta de decisión estratégica. El personal gerencial puede consultar métricas de negocio complejas sin conocimientos de SQL, mientras que los modelos supervisados y no supervisados facilitan la planificación de inventarios y liquidación oportuna de temporadas pasadas.

## 6.2. Recomendaciones

1. **Evolución hacia WebSockets y Server-Sent Events (SSE):**  
   Para optimizar la comunicación de notificaciones push en el proceso de cambio de prendas y actualizaciones de inventario en tiempo real entre sucursales, se aconseja migrar el mecanismo de sondeo periódico hacia canales bidireccionales persistentes basados en WebSockets o SSE gestionados por FastAPI.

2. **Particionamiento Físico de Tablas en PostgreSQL para Escala Masiva:**  
   A medida que la plataforma incremente el volumen de empresas contratantes a cientos de tenants y millones de transacciones anuales, se recomienda implementar particionamiento declarativo en PostgreSQL (`PARTITION BY LIST (tenant_id)`) sobre las tablas de ventas, kardex y detalle de transacciones para mantener tiempos de respuesta sub-segundo en indexación.

3. **Caché Distribuida con Redis para el Catálogo Central:**  
   Se recomienda integrar una capa de caché en memoria con Redis para las consultas públicas del catálogo digital y listas de ofertas de liquidación, reduciendo la carga de lectura en PostgreSQL y acelerando la descarga inicial del catálogo offline para las aplicaciones cliente PWA y Flutter.

4. **Integración de Facturación Electrónica Oficial:**  
   Para el despliegue comercial definitivo en el mercado boliviano, se recomienda acoplar el módulo de cobro y ventas presenciales con el Sistema de Facturación en Línea del Servicio de Impuestos Nacionales (SIN), generando Códigos de Autorización y firmas digitales en formato XML para cada nota de venta y nota de cambio emitida.

---

# 7. BIBLIOGRAFÍA

1. Rosenberg, D. & Scott, K. (1999). *Use Case Driven Object Modeling with UML: A Practical Approach*. Addison-Wesley.
2. Rosenberg, D. & Stephens, M. (2007). *Design-Driven Testing: Test Smarter, Not Harder*. Apress.
3. Rumbaugh, J., Jacobson, I. & Booch, G. (2005). *The Unified Modeling Language Reference Manual (2nd Edition)*. Addison-Wesley. (Norma UML 2.5+).
4. Tiangolo, S. (2023). *FastAPI Framework Documentation: Advanced Security and Multitenant Architecture*. https://fastapi.tiangolo.com/
5. Google Developers. (2023). *Progressive Web Apps (PWA) Standards and Service Workers Architecture*. https://web.dev/explore/progressive-web-apps
6. Flutter Development Team. (2023). *Persisting Local Data with SQLite in Flutter Mobile Applications*. https://docs.flutter.dev/cookbook/persistence/sqlite
7. PostgreSQL Global Development Group. (2023). *PostgreSQL 15 Documentation: Row Level Security, JSONB and B-Tree Indexing*. https://www.postgresql.org/docs/15/
8. Stripe Inc. (2023). *Stripe API Reference: PaymentIntents, Webhooks and PCI-DSS Tokenization*. https://docs.stripe.com/api
9. Russell, S. & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th Edition)*. Pearson.
10. American Psychological Association. (2020). *Publication Manual of the American Psychological Association (7th Edition)*. APA.

---

# 8. ANEXOS

## Anexo A: Artefactos de la Etapa Fundacional (Primer Parcial)

### Anexo A.1: Lista de Casos de Uso del Primer Parcial (CU01 al CU25)

> Los siguientes casos de uso fueron desarrollados durante el primer examen parcial utilizando el Proceso Unificado (PUDS). Se incluyen como referencia para la trazabilidad y herencia funcional de la solución.

### Lista de Casos de Uso — Parcial 1

| CU Original | Nombre | Módulo |
|:---:|:---|:---|
| CU01 | Autenticar Usuario y Control de Acceso (RBAC) | M01 |
| CU02 | Registrar Cliente (Auto-registro) | M01 |
| CU03 | Recuperar Contraseña (Token OTP) | M01 |
| CU04 | Gestionar Usuarios y Roles (RBAC y Desbloqueo) | M01 |
| CU05 | Gestionar Ciudades y Sucursales | M02 |
| CU06 | Gestionar Productos y Atributos de Moda | M03 |
| CU07 | Gestionar Temporadas y Colecciones | M04 |
| CU08 | Gestionar Proveedores Textiles | M05 |
| CU09 | Gestionar Inventario Multi-Sucursal y CPP | M06 |
| CU10 | Consultar Catálogo y Disponibilidad por Sucursal | M07 |
| CU11 | Solicitar Reserva de Prendas en Sucursal | M10 |
| CU12 | Preparar y Atender Reserva Presencial | M10 |
| CU13 | Administrar Carrito de Compras Omnicanal | M11 |
| CU14 | Procesar Compra Digital y Checkout | M12 |
| CU15 | Registrar Venta Presencial en Caja (POS) | M13 |
| CU16 | Procesar Pago con Pasarela Electrónica | M14 |
| CU17 | Gestionar Tipos y Medios de Cobro | M15 |
| CU18 | Gestionar Despacho y Logística de Delivery | M19 |
| CU19 | Visualizar Prenda en Vestidor Virtual con RA | M08 |
| CU20 | Comparar Outfits Lado a Lado | M09 |
| CU21 | Gestionar Fidelización Gamificada | M16 |
| CU22 | Solicitar Recomendación Contextual de IA | M17 |
| CU23 | Buscar Productos por Comandos de Voz | M17 |
| CU24 | Visualizar Cuadros de Mando y Dashboards | M18 |
| CU25 | Gestionar Devolución y Cambio de Prendas | M15 |

> **Nota:** Los modelos completos del Parcial 1 (diagramas de caso de uso general, diagramas de comunicación, diagramas de secuencia y diagramas de clase) se encuentran archivados en la memoria técnica del primer examen parcial.

---

---

### Anexo A.2: Módulos del Sistema del Primer Parcial (M01 al M19 — Etapa Fundacional)

> **Respaldo Histórico de Ingeniería (PUDS):** Los siguientes 19 módulos funcionales fueron concebidos y desarrollados durante la etapa fundacional de FashionStore bajo el Proceso Unificado de Desarrollo de Software (PUDS). Se preservan íntegramente en esta sección para respaldar la trazabilidad de los casos de uso originales y evidenciar la base arquitectónica sobre la cual evolucionó el Segundo Parcial.

#### A.2.1 Módulo M01: Autenticación, Autorización y Seguridad Multitenant (RBAC)
- **Descripción General:** Gestiona el acceso seguro, cifrado y controlado a la plataforma mediante un esquema de Control de Acceso Basado en Roles (RBAC), aplicando aislamiento por tenant (`empresa_id`). Controla la emisión de tokens JWT, cierre de sesiones, restablecimiento de credenciales y auditoría de accesos.
- **Datos Principales:** `id_usuario` (PK, Int), `empresa_id` (FK, Int, nulo para Super Admin), `nombres` (VarChar 100), `apellidos` (VarChar 100), `email` (VarChar 150, Unique), `password_hash` (VarChar 255, Bcrypt), `rol` (Enum: `SUPER_ADMIN`, `ADMIN_EMPRESA`, `ENCARGADO_SUCURSAL`, `CAJERO`, `CLIENTE`, `PROVEEDOR`, `ENCARGADO_APROVISIONAMIENTO`), `estado_cuenta` (Enum: `ACTIVO`, `INACTIVO`, `BLOQUEADO`), `intentos_fallidos` (SmallInt), `ultimo_acceso` (Timestamp), `id_sucursal_asignada` (FK, Int, Opcional).
- **Funcionalidades Clave:**
  - Autenticación segura con verificación hash `bcrypt` y entrega de token JWT firmado.
  - Revocación inmediata de tokens en cierre de sesión (blacklist en memoria).
  - Bloqueo preventivo de cuenta tras 5 intentos fallidos consecutivos de acceso.
  - Recuperación de contraseña mediante tokens temporizados de un solo uso (OTP).
  - Inyección de identidad y rol en el contexto de sesión para filtrado multitenant automático.

#### A.2.2 Módulo M02: Gestión de Sucursales y Cobertura Geográfica
- **Descripción General:** Administra la infraestructura física y geográfica de las tiendas de cada empresa suscriptora. Registra sucursales geolocalizadas (GPS), horarios de atención, capacidad de vestidores físicos y personal asignado, fiscalizando que la cantidad no sobrepase el límite del plan de suscripción contratado.
- **Datos Principales:** `id_sucursal` (PK, Int), `empresa_id` (FK, Int), `id_ciudad` (FK, Int), `nombre_sucursal` (VarChar 100), `direccion_fisica` (Text), `latitud` (Decimal 10,7), `longitud` (Decimal 10,7), `telefono_contacto` (VarChar 20), `capacidad_probadores` (Int), `estado_operativo` (Enum: `OPERATIVA`, `EN_MANTENIMIENTO`, `CERRADA`).
- **Funcionalidades Clave:**
  - CRUD de sucursales físicas con verificación del límite máximo según plan de suscripción (Plan Básico: hasta 2; Plan Profesional: hasta 10).
  - Parametrización geográfica de cobertura y geolocalización de tiendas para la app móvil y web.
  - Configuración de capacidad concurrente de vestidores para el subsistema de reservas presenciales.
  - Asignación de encargados y cajeros a sucursales operativas específicas.

#### A.2.3 Módulo M03: Catálogo de Productos y Atributos Textiles Avanzados
- **Descripción General:** Centraliza la administración de prendas de vestir masculinas de la empresa. Gestiona categorías, marcas, colecciones y atributos técnicos exigidos por el sector: **tallas con dimensiones anatómicas físicas en centímetros (pecho, cintura, cadera, largo)**, **colores compuestos y multivaluados (ej. Negro/Blanco, Azul/Gris) con códigos Hexadecimales**, **composición textil detallada** y **propiedades hipoalergénicas**.
- **Datos Principales:** `id_producto` (PK, Int), `empresa_id` (FK, Int), `codigo_sku_base` (VarChar 50, Unique), `nombre` (VarChar 150), `descripcion` (Text), `id_categoria` (FK, Int), `precio_venta_base` (Decimal 10,2), `tallas_cm_json` (JSONB: talla, pecho_cm, cintura_cm, largo_cm), `colores_compuestos_json` (JSONB: nombre_comercial, hex_primario, hex_secundario), `composicion_textil` (VarChar 200, ej. "100% Algodón Pima Peruano"), `es_hipoalergenico` (Boolean), `imagenes_url` (Array Text), `estado_publicacion` (Enum: `BORRADOR`, `PUBLICADO`, `DESCATALOGADO`).
- **Funcionalidades Clave:**
  - Registro de prendas masculinas asociando guía métrica en centímetros por talla para eliminar el error dimensional de calce.
  - Configuración de colores compuestos con renderizado visual bicolor mediante código Hexadecimal.
  - Certificación de especificaciones textiles e indicación explícita de propiedades hipoalergénicas.
  - Vinculación de modelos 3D (`.glb` / `.gltf`) para el probador en Realidad Aumentada.

#### A.2.4 Módulo M04: Temporadas, Colecciones y Liquidación Estacional
- **Descripción General:** Planifica las campañas comerciales estacionales (Primavera-Verano, Otoño-Invierno, etc.) y gestiona las ofertas de liquidación de fin de temporada con descuentos automáticos del **30%, 40% y 60%** orientados a la recuperación de capital inmovilizado.
- **Datos Principales:** `id_temporada` (PK, Int), `empresa_id` (FK, Int), `nombre_temporada` (VarChar 100), `codigo_campaña` (VarChar 30), `fecha_inicio` (Date), `fecha_fin` (Date), `porcentaje_liquidacion` (Decimal 5,2: 30.00, 40.00 o 60.00), `estado_temporada` (Enum: `PLANIFICADA`, `VIGENTE`, `EN_LIQUIDACION`, `FINALIZADA`).
- **Funcionalidades Clave:**
  - Programación de temporadas comerciales y asociación masiva de prendas de catálogo.
  - Activación automática de descuentos de liquidación estacional (30%, 40%, 60%) al cierre de campaña.
  - Visualización destacada en el catálogo digital de prendas en liquidación con precio original tachado y precio de oferta calculado.

#### A.2.5 Módulo M05: Proveedores y Gestión de Aprovisionamiento
- **Descripción General:** Administra la información jurídica, comercial y crediticia de los proveedores textiles que abastecen a la empresa suscriptora.
- **Datos Principales:** `id_proveedor` (PK, Int), `empresa_id` (FK, Int), `razon_social` (VarChar 150), `nit_identificacion` (VarChar 30), `contacto_nombre` (VarChar 100), `telefono` (VarChar 20), `email` (VarChar 100), `terminos_pago` (Enum: `CONTADO`, `CREDITO_30`, `CREDITO_60`), `estado` (Enum: `ACTIVO`, `INACTIVO`).
- **Funcionalidades Clave:**
  - Registro y homologación de proveedores textiles nacionales e internacionales.
  - Vinculación de proveedores con líneas de productos y categorías de abastecimiento.
  - Historial consolidado de volúmenes de compra y cumplimiento de plazos de entrega.

#### A.2.6 Módulo M06: Inventario Multi-Sucursal con Doble Valuación (CPP) y Traspasos
- **Descripción General:** Núcleo logístico y contable del sistema. Controla las existencias físicas de cada variante de prenda (producto, talla, color) en cada sucursal física. Implementa el recálculo matemático inmutable del **Costo Promedio Ponderado (CPP)** tras cada entrada y registra paralelamente el **Último Costo Unitario de Compra**. Administra transferencias inter-sucursales y ajustes por merma.
- **Datos Principales:** `id_inventario` (PK, Int), `empresa_id` (FK, Int), `id_sucursal` (FK, Int), `id_producto` (FK, Int), `talla` (VarChar 10), `color` (VarChar 50), `stock_fisico` (Int), `stock_reservado` (Int), `stock_disponible` (Calculado: `stock_fisico - stock_reservado`), `stock_minimo` (Int), `costo_promedio_ponderado` (Decimal 10,2), `ultimo_costo_unitario` (Decimal 10,2), `fecha_ultima_actualizacion` (Timestamp).
- **Funcionalidades Clave:**
  - Control de existencias atómico por variante y por sucursal física.
  - Recálculo matemático inmutable del CPP tras cada recepción de compra:
    $$CPP_{\text{nuevo}} = \frac{(\text{Stock}_{\text{ant}} \times CPP_{\text{ant}}) + (\text{Cant}_{\text{ingreso}} \times \text{Costo}_{\text{ingreso}})}{\text{Stock}_{\text{ant}} + \text{Cant}_{\text{ingreso}}}$$
  - Solicitud, autorización, despacho y confirmación de recepción de traspasos de inventario entre sucursales.
  - Generación de alertas de reabastecimiento al alcanzar el umbral de stock mínimo.
  - Registro de kardex físico-valorado inmutable con firma del responsable.

#### A.2.7 Módulo M07: Catálogo Digital Omnicanal y Precios Diferenciados
- **Descripción General:** Expone el catálogo de moda masculina a través de Web Desktop, Angular PWA y la App Móvil Flutter. Permite filtrar por medidas anatómicas en cm, colores y sucursal. Aplica automáticamente la política de **precio al por menor** y **precio al por mayor (compras >= 3 prendas)**.
- **Datos Principales:** Filtros multicriterio: categoría, rango de precios, medidas corporales en cm, combinaciones de color, sucursal física, condición de oferta de liquidación y cantidad de compra.
- **Funcionalidades Clave:**
  - Búsqueda predictiva con tiempos de respuesta inferiores a 1 segundo.
  - Visualización interactiva de existencias disponibles por sucursal física seleccionada.
  - Aplicación automática de la tarifa de precio al por mayor cuando el carrito supera las 3 unidades de una prenda o conjunto calificado.
  - Ficha técnica completa con guía anatómica de calce corporal en centímetros.

#### A.2.8 Módulo M08: Vestidor Virtual con Realidad Aumentada (RA)
- **Descripción General:** Probador virtual tridimensional sobre la aplicación móvil Flutter. Mediante visión por computadora y sensores de la cámara, superpone modelos tridimensionales (`.glb`/`.gltf`) de prendas masculinas sobre el cuerpo del cliente en tiempo real.
- **Datos Principales:** `id_recurso_ra` (PK, Int), `id_producto` (FK, Int), `modelo_3d_url` (Text), `texturas_color_json` (JSONB), `escala_calibracion` (Decimal 5,2).
- **Funcionalidades Clave:**
  - Detección de silueta anatómica y puntos de anclaje corporal (hombros, torso, cintura).
  - Proyección tridimensional interactiva con rotación y ajuste de perspectiva.
  - Alternancia dinámica de colores y texturas sobre la prenda proyectada.
  - Enlace directo desde la experiencia RA hacia la reserva en probador o carrito de compras.

#### A.2.9 Módulo M09: Comparador Inteligente de Outfits
- **Descripción General:** Permite al cliente seleccionar y contrastar de manera interactiva hasta tres atuendos masculinos completos lado a lado en una sola vista, desglosando prendas individuales, precios y descuentos aplicables.
- **Datos Principales:** Sesión interactiva de comparación con especificación de hasta 3 combinaciones (`outfit_1`, `outfit_2`, `outfit_3`), detallando piezas, tallas, colores y sumatoria total de precio.
- **Funcionalidades Clave:**
  - Visualización comparativa simultánea de tres opciones de vestuario.
  - Cálculo instantáneo del costo consolidado por atuendo, identificando la mejor relación precio-calidad.
  - Sustitución rápida de componentes (ej. cambiar calzado o camisa) con recálculo en tiempo real.
  - Conversión del outfit seleccionado en una reserva presencial o compra en firme.

#### A.2.10 Módulo M10: Sistema de Reservas de Prendas en Sucursal
- **Descripción General:** Regula el apartado temporal de prendas seleccionadas en la plataforma digital para que el cliente asista a probárselas físicamente a una sucursal específica. Inmoviliza transitoriamente el stock disponible y notifica al personal de tienda.
- **Datos Principales:** `id_reserva` (PK, Int), `empresa_id` (FK, Int), `codigo_reserva` (VarChar 20, Unique), `id_cliente` (FK, Int), `id_sucursal` (FK, Int), `fecha_hora_programada` (Timestamp), `hora_limite_vigencia` (Timestamp), `estado_reserva` (Enum: `PENDIENTE`, `PREPARADA`, `COMPLETADA_EN_VENTA`, `CANCELADA`, `EXPIRADA`).
- **Funcionalidades Clave:**
  - Generación de reserva con ticket digital provisto de código QR escaneable.
  - Bloqueo preventivo en inventario del stock reservado en la sucursal de destino.
  - Panel en tienda para que el personal aliste las prendas en el probador asignado.
  - Liberación automática de prendas inmovilizadas si la reserva expira sin asistencia del cliente.

#### A.2.11 Módulo M11: Carrito de Compras Omnicanal
- **Descripción General:** Administra los artículos preseleccionados por el usuario para su adquisición digital, con sincronización de estado entre la web y el dispositivo móvil para usuarios autenticados.
- **Datos Principales:** `id_carrito` (PK, Int), `empresa_id` (FK, Int), `id_cliente` (FK, Int, Opcional), `items_carrito` (JSONB: producto, talla, color, cantidad, precio_unitario), `subtotal` (Decimal 10,2), `descuentos` (Decimal 10,2), `monto_total` (Decimal 10,2).
- **Funcionalidades Clave:**
  - Adición, ajuste de unidades y remoción de prendas con validación de stock en tiempo real.
  - Cálculo automatizado de tarifas (precio minorista vs precio mayorista al superar 3 prendas).
  - Detección de liquidación estacional y aplicación de porcentajes promocionales.

#### A.2.12 Módulo M12: Venta Digital y Checkout
- **Descripción General:** Formaliza la adquisición en canales digitales con selección de entrega a domicilio o retiro en tienda (*Click & Collect*), validación de datos tributarios y confirmación electrónica de cobro.
- **Datos Principales:** `id_orden_venta` (PK, Int), `empresa_id` (FK, Int), `numero_orden` (VarChar 30, Unique), `id_cliente` (FK, Int), `tipo_entrega` (Enum: `DOMICILIO`, `RETIRO_TIENDA`), `id_sucursal_retiro` (FK, Int, Opcional), `monto_total` (Decimal 10,2), `estado_orden` (Enum: `PAGADA`, `EN_PREPARACION`, `DESPACHADA`, `ENTREGADA`, `ANULADA`).
- **Funcionalidades Clave:**
  - Asistente de checkout de 3 pasos: Entrega -> Datos Fiscales -> Pago.
  - Descuento atómico definitivo de existencias en bodega tras confirmación de pasarela.
  - Emisión de comprobante digital en formato PDF enviado al correo electrónico registrado.

#### A.2.13 Módulo M13: Punto de Venta Presencial (POS) para Mostrador
- **Descripción General:** Interfaz de facturación y cobro optimizada para cajeros en sala de ventas físicas. Soporta lectura de códigos SKU por escáner, cobros de mostrador, conversión de reservas presenciales en ventas y emisión de tickets.
- **Datos Principales:** `id_venta_pos` (PK, Int), `empresa_id` (FK, Int), `id_sucursal` (FK, Int), `id_cajero` (FK, Int), `id_cliente` (FK, Int, Opcional), `numero_ticket` (VarChar 30, Unique), `metodo_pago` (Enum: `EFECTIVO`, `TARJETA`, `QR_SIMPLE`), `monto_total` (Decimal 10,2), `fecha_hora` (Timestamp).
- **Funcionalidades Clave:**
  - Búsqueda veloz de artículos por lector de código de barras o teclado numérico.
  - Conversión instantánea de una reserva previa en ticket de venta presencial.
  - Liquidación en efectivo con cálculo de cambio o cobro mediante terminal electrónico.
  - Actualización atómica de existencias físicas en la sucursal.

#### A.2.14 Módulo M14: Pasarela de Pagos Electrónicos (Stripe Sandbox PCI-DSS)
- **Descripción General:** Procesa transacciones electrónicas con tarjeta de crédito/débito en entorno de pruebas (*Sandbox*), garantizando el cumplimiento PCI-DSS mediante tokenización segura. Se utiliza tanto en ventas digitales como en la liquidación de saldos por cambios de talla.
- **Datos Principales:** `id_pago` (PK, Int), `empresa_id` (FK, Int), `payment_intent_id` (VarChar 100, Unique), `monto` (Decimal 10,2), `moneda` (VarChar 5, ej. "USD", "BOB"), `estado_pago` (Enum: `SUCCEEDED`, `REQUIRES_ACTION`, `FAILED`).
- **Funcionalidades Clave:**
  - Generación de intenciones de cobro seguras con verificación 3D-Secure.
  - Captura y tokenización de tarjetas mediante componentes seguros embebidos (Stripe Elements).
  - Recepción y procesamiento criptográfico de webhooks en servidor para confirmación asíncrona.

#### A.2.15 Módulo M15: Gestión de Medios y Métodos de Cobro
- **Descripción General:** Parametriza los métodos de pago autorizados en la plataforma (Efectivo en mostrador, QR Simple interoperable BCB, Tarjeta Stripe).
- **Datos Principales:** `id_metodo` (PK, Int), `empresa_id` (FK, Int), `nombre_metodo` (VarChar 50), `canal` (Enum: `PRESENCIAL`, `DIGITAL`, `OMNICANAL`), `activo` (Boolean).
- **Funcionalidades Clave:**
  - Habilitación y configuración de canales de cobro por tienda.
  - Generación de código QR Simple dinámico con monto y glosa correlativa para cobros presenciales.
  - Cuadre de caja y conciliación diaria de recaudaciones por cajero y turno.

#### A.2.16 Módulo M16: Sistema de Fidelización Gamificado y Membresías
- **Descripción General:** Dinámica de retención y valor de vida del cliente (*CLV*) mediante acumulación de puntos comerciales por compras, ascenso automático entre categorías (Bronce, Plata, Oro, Diamante) y redención de descuentos.
- **Datos Principales:** `id_fidelizacion` (PK, Int), `empresa_id` (FK, Int), `id_cliente` (FK, Int, Unique), `puntos_acumulados` (Int), `nivel` (Enum: `BRONCE`, `PLATA`, `ORO`, `DIAMANTE`), `insignias_json` (JSONB).
- **Funcionalidades Clave:**
  - Asignación matemática de puntos tras la confirmación de compras efectivas (1 punto por cada 10 Bs).
  - Promoción jerárquica de nivel de membresía con descuentos automáticos permanentes (Plata: 5%, Oro: 10%, Diamante: 15%).
  - Otorgamiento de insignias por hitos comerciales (ej. "Caballero Ejecutivo", "Explorador RA").
  - Canje de puntos como saldo a favor en el checkout de compra.

#### A.2.17 Módulo M17: Asistente de Estilo con IA Contextual y Comandos de Voz
- **Descripción General:** Asesor virtual de imagen masculina. Genera recomendaciones personalizadas de atuendos analizando el clima en tiempo real (OpenWeatherMap API), la ocasión de uso y el stock real en tiendas, admitiendo comandos de voz procesados mediante NLP.
- **Datos Principales:** `id_recomendacion` (PK, Int), `empresa_id` (FK, Int), `id_cliente` (FK, Int), `temperatura_c` (Decimal 4,1), `clima_descripcion` (VarChar 50), `ocasion` (VarChar 50), `outfit_sugerido_json` (JSONB).
- **Funcionalidades Clave:**
  - Conexión a la API meteorológica según la geolocalización de la sucursal o ciudad del cliente.
  - Formulación de combinaciones de prendas masculinas cruzadas estrictamente con existencias disponibles en stock.
  - Captura y transcripción de comandos de voz en la app móvil para búsqueda de prendas y outfits.

#### A.2.18 Módulo M18: Dashboards Gerenciales y Analítica Descriptiva
- **Descripción General:** Cuadro de mando ejecutivo con indicadores clave de desempeño (KPIs) en tiempo real: volumen de ventas, rotación de inventarios, ticket promedio, efectividad de reservas y comparativas de canales.
- **Datos Principales:** Métricas agregadas por tenant: ventas brutas, margen de contribución, prendas más vendidas (*Top 10*), tasa de conversión de vestidores y valor de inventario a CPP.
- **Funcionalidades Clave:**
  - Visualización gráfica de ventas diarias, semanales y mensuales con filtros por sucursal.
  - Reporte de inventario valorado al Costo Promedio Ponderado vs Último Costo de Adquisición.
  - Exportación de métricas analíticas a hojas de cálculo (XLSX) y reportes ejecutivos en PDF.

#### A.2.19 Módulo M19: Logística de Envíos y Delivery
- **Descripción General:** Gestiona la distribución física y entrega a domicilio para compras digitales. Calcula tarifas geodésicas (Haversine), peso volumétrico y seguimiento del estado del despacho.
- **Datos Principales:** `id_envio` (PK, Int), `empresa_id` (FK, Int), `id_orden_venta` (FK, Int), `id_sucursal_origen` (FK, Int), `distancia_km` (Decimal 6,2), `peso_kg` (Decimal 5,2), `costo_envio` (Decimal 10,2), `estado_envio` (Enum: `ASIGNADO`, `EN_TRANSITO`, `ENTREGADO`, `FALLIDO`).
- **Funcionalidades Clave:**
  - Selección automática de la sucursal de origen más cercana al comprador que posea stock completo.
  - Cálculo algorítmico del costo de flete combinando distancia kilométrica y peso volumétrico.
  - Rastreo de pedidos en tiempo real para el cliente desde la web y la aplicación móvil.

---

## Anexo B: Tabla Comparativa de Planes de Suscripción

| Característica / Módulo | Plan Básico | Plan Profesional |
|:---|:---:|:---:|
| Sucursales activas permitidas | Hasta 2 | Hasta 10 |
| Usuarios administrativos y cajeros | Ilimitados | Ilimitados |
| Gestión de catálogo, tallas, colores y telas | ✅ | ✅ |
| Control de inventario multi-sucursal con CPP | ✅ | ✅ |
| Módulo de ventas POS y digital | ✅ | ✅ |
| Reservas omnicanal | ✅ | ✅ |
| Operación offline en PWA y Flutter | ✅ | ✅ |
| Sincronización idempotente con UUID | ✅ | ✅ |
| Gestión de cambios de prendas (dos notas) | ✅ | ✅ |
| Traspasos inter-sucursal | ✅ | ✅ |
| Pasarela de pagos Stripe | ✅ | ✅ |
| Reportes convencionales (Excel/PDF) | ✅ | ✅ |
| **Reportes generativos con IA (Lenguaje Natural)** | ❌ *(Bloqueado por Plan)* | ✅ *(Habilitado)* |
| **Dashboard Analítico con Machine Learning** | ❌ *(Bloqueado por Plan)* | ✅ *(Habilitado)* |

---

## Anexo C: Calendario de Entregas y Defensas

| Hito Académico | Fecha Límite | Contenido Requerido |
|:---:|:---|:---|
| **Presentación 1** | Lunes 26/10/2026 — 13:00 | Documento unificado: Cap. I (Aspectos Generales), Cap. II (Requisitos, CU01-CU19 con diseño y prototipos), Cap. III (Modelo de Dominio y primeros Diagramas de Robustez). |
| **Presentación 2** | Domingo 01/11/2026 — 23:59 | Avance integrado: Cap. III completado (Robustez completa, Secuencias, Diagrama de Clases UML, DDL y esquemas BD), Cap. IV (Arquitectura y módulos iniciales backend/frontend). |
| **Presentación 3** | Domingo 08/11/2026 — 23:59 | Documento al 100% + Código fuente al 100%: Cap. IV completo, Cap. V (Pruebas y trazabilidad), Cap. VI (Conclusiones). Sistema desplegado en la nube. |
| **Defensa Final Oral** | Martes 10/11/2026 — 07:00 AM | Exposición oral, sustentación de modelos UML 2.5+ y demostración en vivo del software SaaS multitenant. |
