/**
 * Módulo de Gestión de Catálogo de Productos y Atributos de Moda
 * Caso de Uso: CU06 - Gestionar Productos y Atributos
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU06 - Listado de Productos Base y Variantes de Moda
// =============================================================================
async function cargarProductosAdmin() {
  // Paso 1: El Administrador solicita la lista de prendas registradas
  try {
    const productos = await apiFetch("/productos");
    const tbody = document.getElementById("productos-admin-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (productos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay productos en el catálogo.</td></tr>`;
      return;
    }

    productos.forEach(p => {
      const tr = document.createElement("tr");

      // Render de colores con código HEX y tooltip
      const coloresHtml = p.colores.map(c => 
        `<span class="color-dot" style="background-color: ${c.codigo_hex}; display: inline-block;" title="${c.color_nombre} (${c.codigo_hex})"></span>`
      ).join(" ");

      // Render de tallas
      const tallasHtml = p.tallas.map(t => 
        `<span class="size-pill">${t.talla}</span>`
      ).join(" ");

      tr.innerHTML = `
        <td><code style="color: #a5b4fc; font-weight: 700;">${p.codigo_sku_base}</code></td>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${p.imagen_principal || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120'}" 
                 style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" alt="${p.nombre}">
            <div>
              <div style="font-weight: 700; color: #fff;">${p.nombre}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${p.nombre_categoria || 'Sin Categoría'} • ${p.nombre_marca || 'Sin Marca'}</div>
            </div>
          </div>
        </td>
        <td><span style="font-family: var(--font-heading); font-weight: 800; font-size: 1rem; color: #34d399;">Bs. ${parseFloat(p.precio_base).toFixed(2)}</span></td>
        <td><div style="display: flex; gap: 6px; align-items: center;">${coloresHtml}</div></td>
        <td><div style="display: flex; gap: 4px; flex-wrap: wrap;">${tallasHtml}</div></td>
        <td>
          ${p.modelo_3d_glb ? 
            `<span class="badge badge-info" title="${p.modelo_3d_glb}"><i class="fas fa-cube"></i> Modelo 3D</span>` : 
            `<span style="color: var(--text-muted); font-size: 0.75rem;">Sin 3D</span>`}
        </td>
        <td>
          <span class="badge badge-success">${p.estado}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar productos en panel admin:", error);
  }
}

// =============================================================================
// CASO DE USO: CU06 - Alta de Ficha Técnica de Producto con Colores y Tallas
// =============================================================================
async function handleCrearProducto(event) {
  event.preventDefault();

  // Paso 1: El Administrador envía la ficha técnica (SKU base, tallas, colores HEX)
  const sku = document.getElementById("prod-sku").value.trim().toUpperCase();
  const nombre = document.getElementById("prod-nombre").value.trim();
  const descripcion = document.getElementById("prod-desc").value.trim();
  const precio = parseFloat(document.getElementById("prod-precio").value);
  const idCategoria = parseInt(document.getElementById("prod-categoria").value, 10);
  const idMarca = parseInt(document.getElementById("prod-marca").value, 10);
  const idTemporada = parseInt(document.getElementById("prod-temporada").value, 10) || null;
  const imagenUrl = document.getElementById("prod-imagen").value.trim();
  const modelo3dUrl = document.getElementById("prod-modelo-3d").value.trim();

  // Obtener tallas seleccionadas de checkboxes
  const tallasCheckboxes = document.querySelectorAll("input[name='prod-talla']:checked");
  const tallas = Array.from(tallasCheckboxes).map(cb => cb.value);

  // Obtener colores ingresados dinámicamente
  const colorItems = [];
  const colorRows = document.querySelectorAll(".color-input-row");
  colorRows.forEach(row => {
    const nombreColor = row.querySelector(".input-color-nombre")?.value.trim();
    const hexColor = row.querySelector(".input-color-hex")?.value.trim();
    if (nombreColor && hexColor) {
      colorItems.push({ color_nombre: nombreColor, codigo_hex: hexColor });
    }
  });

  // Validaciones
  if (!sku || !nombre || isNaN(precio) || !idCategoria || !idMarca) {
    showToast("Complete los datos obligatorios de la prenda.", "error");
    return;
  }

  if (tallas.length === 0) {
    showToast("Debe seleccionar al menos una talla normalizada.", "error");
    return;
  }

  if (colorItems.length === 0) {
    showToast("Debe registrar al menos un color con código HEX.", "error");
    return;
  }

  // Paso 1.1: IProductoBoundary invoca guardarProducto(datosProducto) mediante POST /api/v1/productos
  try {
    const nuevo = await apiFetch("/productos", {
      method: "POST",
      body: JSON.stringify({
        codigo_sku_base: sku,
        nombre: nombre,
        descripcion: descripcion || null,
        precio_base: precio,
        id_categoria: idCategoria,
        id_marca: idMarca,
        id_temporada: idTemporada,
        imagen_principal: imagenUrl || null,
        modelo_3d_glb: modelo3dUrl || null,
        tallas: tallas,
        colores: colorItems
      })
    });

    // Paso 1.2: Se confirma el alta con sus variantes normalizadas
    showToast(`Prenda '${nuevo.nombre}' (SKU: ${nuevo.codigo_sku_base}) agregada al catálogo.`, "success");
    cerrarModal("modal-crear-producto");
    cargarProductosAdmin();
    cargarCatalogo(); // Actualizar también el catálogo omnicanal

  } catch (error) {
    console.error("Error al registrar prenda:", error);
  }
}

// Helpers para agregar colores dinámicamente en el formulario
function agregarFilaColor() {
  const container = document.getElementById("colores-dynamic-container");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "color-input-row";
  div.style.cssText = "display: flex; gap: 10px; align-items: center; margin-bottom: 8px;";
  div.innerHTML = `
    <input type="text" class="form-control input-color-nombre" placeholder="Nombre (ej. Azul Marino)" style="flex: 2;">
    <input type="color" class="form-control input-color-picker" value="#000080" style="width: 50px; padding: 2px; height: 38px;" onchange="this.nextElementSibling.value = this.value">
    <input type="text" class="form-control input-color-hex" value="#000080" style="flex: 1; font-family: var(--font-mono);" readonly>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()" title="Eliminar color"><i class="fas fa-trash"></i></button>
  `;
  container.appendChild(div);
}
