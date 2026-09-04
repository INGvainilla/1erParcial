/**
 * Módulo de Catálogo Omnicanal y Disponibilidad por Sucursal Física
 * Caso de Uso: CU10 - Consultar Catálogo y Disponibilidad por Sucursal
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU10 - Exploración de Catálogo con Filtros Multicriterio
// =============================================================================
async function cargarCatalogo() {
  // Paso 1: El Cliente o usuario selecciona criterios de filtro en ICatalogoBoundary
  const busqueda = document.getElementById("cat-search")?.value || "";
  const categoria = document.getElementById("cat-filter-categoria")?.value || "";
  const temporada = document.getElementById("cat-filter-temporada")?.value || "";
  const sucursal = document.getElementById("cat-filter-sucursal")?.value || "";

  let query = "/catalogo?";
  if (busqueda) query += `busqueda=${encodeURIComponent(busqueda)}&`;
  if (categoria) query += `id_categoria=${categoria}&`;
  if (temporada) query += `id_temporada=${temporada}&`;
  if (sucursal) query += `id_sucursal=${sucursal}&`;

  try {
    // Paso 1.1: ICatalogoBoundary invoca consultarPrendas(criteriosFiltro) en CatalogoControl mediante GET /api/v1/catalogo
    const prendas = await apiFetch(query);
    const container = document.getElementById("catalogo-products-grid");
    if (!container) return;

    container.innerHTML = "";

    if (prendas.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.2rem; color: var(--text-secondary);">No se encontraron prendas con los filtros seleccionados</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Intente seleccionar otra categoría o restablecer la búsqueda.</p>
        </div>
      `;
      return;
    }

    // Paso 1.2: Renderizar tarjetas de producto interactivas con variantes e indicador omnicanal
    prendas.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      // Badge de temporada / liquidación
      let seasonBadge = "";
      if (p.codigo_temporada) {
        seasonBadge = `<div class="badge-season-tag">${p.codigo_temporada}</div>`;
      }

      // Badge de Realidad Aumentada
      const arBadge = p.modelo_3d_glb ? `<div class="badge-ar-tag"><i class="fas fa-vr-cardboard"></i> 3D RA</div>` : "";

      // Colores HEX interactivos
      const coloresHtml = p.colores.map(c => 
        `<span class="color-dot" style="background-color: ${c.codigo_hex};" title="${c.color_nombre}"></span>`
      ).join("");

      // Tallas disponibles
      const tallasHtml = p.tallas.map(t => 
        `<span class="size-pill">${t.talla}</span>`
      ).join("");

      // Cálculo de precio y descuento
      let priceHtml = `<div class="product-price">Bs. ${parseFloat(p.precio_final).toFixed(2)}</div>`;
      if (parseFloat(p.descuento_aplicable_pct) > 0) {
        priceHtml = `
          <div class="product-price-row">
            <div class="product-price">Bs. ${parseFloat(p.precio_final).toFixed(2)}</div>
            <div class="product-price-discounted">Bs. ${parseFloat(p.precio_base).toFixed(2)}</div>
            <span class="badge badge-warning">-${parseFloat(p.descuento_aplicable_pct)}% OFF</span>
          </div>
        `;
      }

      // Indicador de existencias físicas
      let stockBadge = `<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Agotado</span>`;
      if (p.stock_total_disponible > 0) {
        stockBadge = `<span class="badge badge-success"><i class="fas fa-check-circle"></i> ${p.stock_total_disponible} unidades disponibles</span>`;
      }

      card.innerHTML = `
        <div class="product-image-container">
          <img src="${p.imagen_principal || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'}" 
               class="product-image" alt="${p.nombre}">
          ${seasonBadge}
          ${arBadge}
        </div>
        <div class="product-info">
          <div class="product-brand">${p.nombre_marca || 'FashionStore'}</div>
          <div class="product-title">${p.nombre}</div>
          <div style="margin-bottom: 8px;">${stockBadge}</div>
          ${priceHtml}
          <div class="color-dots-row">${coloresHtml}</div>
          <div class="sizes-row">${tallasHtml}</div>
          <div style="margin-top: auto; display: flex; gap: 8px;">
            <button class="btn btn-primary" style="flex: 1;" onclick="verDisponibilidadTiendas(${p.id_producto})">
              <i class="fas fa-store"></i> Ver en Tiendas
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error al cargar catálogo:", error);
  }
}

// =============================================================================
// CASO DE USO: CU10 - Disponibilidad por Sucursal Física en Tiempo Real
// =============================================================================
async function verDisponibilidadTiendas(idProducto) {
  // Paso 2: El cliente pulsa 'Ver en Tiendas' en ICatalogoBoundary
  try {
    // Paso 2.1: Se invoca GET /api/v1/catalogo/{id_producto}/disponibilidad-sucursales
    const data = await apiFetch(`/catalogo/${idProducto}/disponibilidad-sucursales`);

    document.getElementById("modal-disp-prenda-titulo").innerText = `Disponibilidad Física: ${data.nombre} (${data.codigo_sku_base})`;
    const listContainer = document.getElementById("modal-disp-sucursales-list");
    listContainer.innerHTML = "";

    if (!data.sucursales || data.sucursales.length === 0) {
      listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No se registraron existencias físicas en sucursales.</div>`;
    } else {
      data.sucursales.forEach(s => {
        const div = document.createElement("div");
        div.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;";

        let badgeStock = `<span class="badge badge-danger">Sin Existencias</span>`;
        if (s.stock_disponible > 0) {
          badgeStock = `<span class="badge badge-success" style="font-size: 0.9rem;"><i class="fas fa-check"></i> ${s.stock_disponible} unidades disponibles</span>`;
        }

        const tallasStr = s.tallas_disponibles.length > 0 ? s.tallas_disponibles.join(", ") : "Ninguna";
        const coloresStr = s.colores_disponibles.length > 0 ? s.colores_disponibles.join(", ") : "Ninguno";
        const mapsLink = `https://www.google.com/maps?q=${s.latitud},${s.longitud}`;

        div.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 1rem; color: #fff;">${s.nombre_sucursal}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${s.direccion} (${s.nombre_ciudad})</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
              <strong>Tallas:</strong> ${tallasStr} | <strong>Colores:</strong> ${coloresStr}
            </div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            ${badgeStock}
            <a href="${mapsLink}" target="_blank" class="btn btn-secondary btn-sm" title="Abrir ubicación">
              <i class="fas fa-directions"></i> Cómo llegar
            </a>
          </div>
        `;
        listContainer.appendChild(div);
      });
    }

    abrirModal("modal-disponibilidad-sucursales");

  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
  }
}
