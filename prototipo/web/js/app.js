/**
 * Controlador Principal de la Aplicación Web FashionStore (Ciclo 1)
 * Orquesta la navegación SPA, control de vistas, inicialización y RBAC visual
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("FashionStore Web App iniciada - Ciclo 1: Fundamentos y Módulos Base");
  
  // 1. Inicializar sesión y estado de usuario
  updateUserInterfaceSession();

  // 2. Cargar vistas iniciales y desplegar catálogo por defecto
  showView("catalogo-view");

  // 3. Inicializar combos y selects dependientes
  cargarFiltrosGlobales();
});

/**
 * Control de Vistas SPA (Single Page Application)
 */
function showView(viewId) {
  // Desactivar todas las secciones
  const sections = document.querySelectorAll(".view-section");
  sections.forEach(s => s.classList.remove("active"));

  // Activar la vista solicitada
  const targetSection = document.getElementById(viewId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Actualizar estado activo en la barra lateral
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-view") === viewId) {
      item.classList.add("active");
    }
  });

  // Ejecutar carga de datos según la vista seleccionada
  if (viewId === "catalogo-view") {
    cargarCatalogo();
  } else if (viewId === "usuarios-view") {
    cargarUsuarios();
  } else if (viewId === "sucursales-view") {
    cargarSucursales();
  } else if (viewId === "productos-view") {
    cargarProductosAdmin();
  } else if (viewId === "temporadas-view") {
    cargarTemporadas();
  } else if (viewId === "proveedores-view") {
    cargarProveedores();
  } else if (viewId === "inventario-view") {
    cargarInventarioStock();
    cargarKardexMovimientos();
  } else if (viewId === "dashboard-view") {
    cargarMetricasDashboard();
  }
}

/**
 * Actualizar interfaz según el usuario autenticado (RBAC)
 */
function updateUserInterfaceSession() {
  const user = State.user;
  const userCard = document.getElementById("sidebar-user-card");
  const authNavItem = document.getElementById("nav-auth-item");
  const adminNavSections = document.querySelectorAll(".admin-only-nav");

  if (user && State.token) {
    if (userCard) userCard.style.display = "flex";
    if (authNavItem) authNavItem.style.display = "none";

    document.getElementById("sidebar-user-name").innerText = user.nombre_completo || user.email;
    document.getElementById("sidebar-user-role").innerText = user.rol;
    document.getElementById("sidebar-user-avatar").innerText = (user.nombres ? user.nombres[0] : "U").toUpperCase();

    // Visibilidad RBAC
    const isAdmin = user.rol === "ADMINISTRADOR";
    const isLogistica = user.rol === "LOGISTICA" || isAdmin;

    adminNavSections.forEach(el => {
      const allowedRoles = el.getAttribute("data-roles");
      if (!allowedRoles || allowedRoles.includes(user.rol)) {
        el.style.display = "block";
      } else {
        el.style.display = "none";
      }
    });

  } else {
    if (userCard) userCard.style.display = "none";
    if (authNavItem) authNavItem.style.display = "flex";

    // Visitante: solo ve catálogo y login
    adminNavSections.forEach(el => el.style.display = "none");
  }
}

/**
 * Control de Modales
 */
function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function showAuthTab(tab) {
  const loginForm = document.getElementById("login-form-container");
  const regForm = document.getElementById("register-form-container");
  const otpForm = document.getElementById("otp-form-container");
  const tabBtns = document.querySelectorAll(".auth-tab-btn");

  tabBtns.forEach(btn => btn.classList.remove("active"));

  if (tab === "login") {
    loginForm.style.display = "block";
    regForm.style.display = "none";
    otpForm.style.display = "none";
    document.getElementById("tab-btn-login").classList.add("active");
  } else if (tab === "register") {
    loginForm.style.display = "none";
    regForm.style.display = "block";
    otpForm.style.display = "none";
    document.getElementById("tab-btn-register").classList.add("active");
  } else if (tab === "otp") {
    loginForm.style.display = "none";
    regForm.style.display = "none";
    otpForm.style.display = "block";
    document.getElementById("otp-step-1").style.display = "block";
    document.getElementById("otp-step-2").style.display = "none";
  }
}

/**
 * Inicializar filtros de categorías, marcas y sucursales en selects
 */
async function cargarFiltrosGlobales() {
  try {
    const [cats, marcas, sucursales, temporadas] = await Promise.all([
      apiFetch("/productos/categorias").catch(() => []),
      apiFetch("/productos/marcas").catch(() => []),
      apiFetch("/sucursales").catch(() => []),
      apiFetch("/temporadas").catch(() => [])
    ]);

    // Llenar filtros del catálogo
    const catSelect = document.getElementById("cat-filter-categoria");
    if (catSelect) {
      cats.forEach(c => {
        catSelect.innerHTML += `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`;
      });
    }

    const tempSelect = document.getElementById("cat-filter-temporada");
    if (tempSelect) {
      temporadas.forEach(t => {
        tempSelect.innerHTML += `<option value="${t.id_temporada}">${t.nombre_temporada}</option>`;
      });
    }

    const sucSelect = document.getElementById("cat-filter-sucursal");
    if (sucSelect) {
      sucursales.forEach(s => {
        sucSelect.innerHTML += `<option value="${s.id_sucursal}">${s.nombre_sucursal} (${s.nombre_ciudad})</option>`;
      });
    }

    // Llenar selects del modal crear producto
    const prodCat = document.getElementById("prod-categoria");
    if (prodCat) {
      cats.forEach(c => {
        prodCat.innerHTML += `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`;
      });
    }

    const prodMrc = document.getElementById("prod-marca");
    if (prodMrc) {
      marcas.forEach(m => {
        prodMrc.innerHTML += `<option value="${m.id_marca}">${m.nombre_marca}</option>`;
      });
    }

    const prodTemp = document.getElementById("prod-temporada");
    if (prodTemp) {
      temporadas.forEach(t => {
        prodTemp.innerHTML += `<option value="${t.id_temporada}">${t.nombre_temporada}</option>`;
      });
    }

    // Llenar selects de entrada de mercadería (inventario)
    const entSuc = document.getElementById("ent-sucursal");
    if (entSuc) {
      sucursales.forEach(s => {
        entSuc.innerHTML += `<option value="${s.id_sucursal}">${s.nombre_sucursal}</option>`;
      });
    }

    const prods = await apiFetch("/productos").catch(() => []);
    const entProd = document.getElementById("ent-producto");
    if (entProd) {
      prods.forEach(p => {
        entProd.innerHTML += `<option value="${p.id_producto}">${p.nombre} (${p.codigo_sku_base})</option>`;
      });
    }

    // Llenar select de sucursal en crear usuario
    const userSuc = document.getElementById("new-user-sucursal");
    if (userSuc) {
      sucursales.forEach(s => {
        userSuc.innerHTML += `<option value="${s.id_sucursal}">${s.nombre_sucursal}</option>`;
      });
    }

  } catch (error) {
    console.error("Error al cargar filtros globales:", error);
  }
}

/**
 * Cargar Métricas Dashboard Resumen
 */
async function cargarMetricasDashboard() {
  try {
    const [usuarios, sucursales, productos, stock] = await Promise.all([
      apiFetch("/usuarios").catch(() => []),
      apiFetch("/sucursales").catch(() => []),
      apiFetch("/productos").catch(() => []),
      apiFetch("/inventario/stock").catch(() => [])
    ]);

    document.getElementById("metric-usuarios-total").innerText = usuarios.length;
    document.getElementById("metric-sucursales-total").innerText = sucursales.length;
    document.getElementById("metric-productos-total").innerText = productos.length;

    const totalUnidades = stock.reduce((sum, item) => sum + item.stock_disponible, 0);
    document.getElementById("metric-stock-total").innerText = `${totalUnidades} uds.`;

  } catch (error) {
    console.error("Error al cargar métricas:", error);
  }
}

function abrirModalLiquidar(idTemporada, codigoCampana) {
  document.getElementById("liq-temp-id").value = idTemporada;
  document.getElementById("liq-temp-codigo-span").innerText = codigoCampana;
  abrirModal("modal-liquidar-temporada");
}
