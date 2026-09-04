/**
 * Módulo de Control de Inventario Multi-Sucursal y Costos Ponderados (CPP)
 * Caso de Uso: CU09 - Gestionar Inventario y Costos (CPP)
 * Documentado con pasos correlativos de ejecución y demostración matemática formal.
 */

// =============================================================================
// CASO DE USO: CU09 - Consulta de Existencias y Asientos de Kardex
// =============================================================================
async function cargarInventarioStock() {
  try {
    const items = await apiFetch("/inventario/stock");
    const tbody = document.getElementById("inventario-stock-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay existencias en inventario.</td></tr>`;
      return;
    }

    items.forEach(it => {
      const tr = document.createElement("tr");

      let stockColor = "#34d399";
      if (it.stock_disponible <= it.stock_minimo) {
        stockColor = "#ef4444";
      } else if (it.stock_disponible <= it.stock_minimo * 2) {
        stockColor = "#f59e0b";
      }

      tr.innerHTML = `
        <td><strong style="color: #fff;">${it.nombre_sucursal}</strong></td>
        <td>
          <div style="font-weight: 700;">${it.nombre_producto}</div>
          <div style="font-size: 0.75rem; color: #a5b4fc; font-family: var(--font-mono);">${it.codigo_sku_base}</div>
        </td>
        <td><span class="size-pill">${it.talla}</span></td>
        <td><span style="font-size: 0.85rem;">${it.color}</span></td>
        <td style="font-weight: 800; color: ${stockColor}; font-size: 1.05rem;">
          ${it.stock_disponible} uds.
          ${it.stock_reservado > 0 ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(${it.stock_reservado} reservadas)</div>` : ''}
        </td>
        <td style="font-family: var(--font-heading); font-size: 0.95rem; color: var(--text-secondary);">Bs. ${parseFloat(it.ultimo_costo_compra).toFixed(2)}</td>
        <td style="font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: #38bdf8;">
          Bs. ${parseFloat(it.costo_promedio_ponderado).toFixed(2)}
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="verKardexDeInventario(${it.id_inventario})" title="Ver movimientos de Kardex">
            <i class="fas fa-history"></i> Kardex
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar inventario:", error);
  }
}

async function cargarKardexMovimientos(idInventario = null) {
  try {
    let endpoint = "/inventario/kardex";
    if (idInventario) endpoint += `?id_inventario=${idInventario}`;

    const movimientos = await apiFetch(endpoint);
    const tbody = document.getElementById("kardex-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (movimientos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay movimientos asentados en el Kardex.</td></tr>`;
      return;
    }

    movimientos.forEach(m => {
      const tr = document.createElement("tr");

      let tipoBadge = `<span class="badge badge-success"><i class="fas fa-arrow-down"></i> ${m.tipo_movimiento}</span>`;
      if (m.tipo_movimiento.includes("SALIDA")) {
        tipoBadge = `<span class="badge badge-danger"><i class="fas fa-arrow-up"></i> ${m.tipo_movimiento}</span>`;
      }

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${new Date(m.fecha_hora).toLocaleString()}</td>
        <td>${tipoBadge}</td>
        <td><strong>${m.referencia_documento || 'Movimiento de Almacén'}</strong></td>
        <td style="font-weight: 700; color: #34d399;">+${m.cantidad} uds.</td>
        <td style="font-family: var(--font-heading);">Bs. ${parseFloat(m.costo_unitario_movimiento).toFixed(2)}</td>
        <td style="font-weight: 800; font-size: 1rem; color: #fff;">${m.saldo_cantidad_resultante} uds.</td>
        <td style="font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: #38bdf8;">
          Bs. ${parseFloat(m.saldo_cpp_resultante).toFixed(2)}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar Kardex:", error);
  }
}

// =============================================================================
// CASO DE USO: CU09 - Registrar Entrada de Lote y Recálculo de CPP
// =============================================================================
async function handleEntradaMercaderia(event) {
  event.preventDefault();

  // Paso 1: El Personal de Logística registra la entrada de un lote
  const idSucursal = parseInt(document.getElementById("ent-sucursal").value, 10);
  const idProducto = parseInt(document.getElementById("ent-producto").value, 10);
  const talla = document.getElementById("ent-talla").value.trim().toUpperCase();
  const color = document.getElementById("ent-color").value.trim();
  const cantidad = parseInt(document.getElementById("ent-cantidad").value, 10);
  const costoUnitario = parseFloat(document.getElementById("ent-costo").value);
  const factura = document.getElementById("ent-factura").value.trim();

  if (!idSucursal || !idProducto || !talla || !color || isNaN(cantidad) || isNaN(costoUnitario)) {
    showToast("Por favor complete todos los datos del lote de recepción.", "error");
    return;
  }

  if (cantidad <= 0 || costoUnitario <= 0) {
    showToast("La cantidad y el costo unitario deben ser mayores a cero.", "error");
    return;
  }

  // Paso 1.1: IInventarioBoundary invoca procesarEntradaMercaderia en InventarioControl mediante POST /api/v1/inventario/entradas
  try {
    const kardex = await apiFetch("/inventario/entradas", {
      method: "POST",
      body: JSON.stringify({
        id_sucursal: idSucursal,
        id_producto: idProducto,
        talla: talla,
        color: color,
        cantidad_recibida: cantidad,
        costo_unitario_compra: costoUnitario,
        numero_factura: factura || null
      })
    });

    // Paso 1.2: El backend recalcula matemáticamente el CPP y asienta el movimiento
    showToast(
      `Lote registrado exitosamente. Nuevo Saldo: ${kardex.saldo_cantidad_resultante} unidades | Nuevo CPP: Bs. ${parseFloat(kardex.saldo_cpp_resultante).toFixed(2)}`,
      "success"
    );

    cerrarModal("modal-entrada-mercaderia");
    cargarInventarioStock();
    cargarKardexMovimientos();

  } catch (error) {
    console.error("Error al recepcionar lote:", error);
  }
}

// Widget en vivo: Pre-calcular matemáticamente el CPP en pantalla mientras el usuario tipea
function actualizarCalculadoraCppEnVivo() {
  const cantNueva = parseInt(document.getElementById("ent-cantidad")?.value || "0", 10);
  const costoNuevo = parseFloat(document.getElementById("ent-costo")?.value || "0");
  const box = document.getElementById("cpp-live-preview-box");
  if (!box) return;

  if (cantNueva > 0 && costoNuevo > 0) {
    box.style.display = "block";
    const subtotalLote = cantNueva * costoNuevo;
    document.getElementById("cpp-calc-subtotal").innerText = `Bs. ${subtotalLote.toFixed(2)}`;
  } else {
    box.style.display = "none";
  }
}
