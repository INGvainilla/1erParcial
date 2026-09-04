/**
 * Módulo de Gestión de Temporadas y Colecciones
 * Caso de Uso: CU07 - Gestionar Temporadas y Colecciones
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU07 - Consulta de Temporadas Comerciales
// =============================================================================
async function cargarTemporadas() {
  // Paso 1: El Administrador solicita las campañas y temporadas activas
  try {
    const temporadas = await apiFetch("/temporadas");
    const tbody = document.getElementById("temporadas-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (temporadas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay temporadas registradas.</td></tr>`;
      return;
    }

    temporadas.forEach(t => {
      const tr = document.createElement("tr");

      let estadoBadge = `<span class="badge badge-success">VIGENTE</span>`;
      let accionLiquidacion = "";

      if (t.estado === "LIQUIDACION") {
        estadoBadge = `<span class="badge badge-warning"><i class="fas fa-percentage"></i> LIQUIDACIÓN (${parseFloat(t.descuento_liquidacion)}% OFF)</span>`;
      } else if (t.estado === "FINALIZADA") {
        estadoBadge = `<span class="badge badge-danger">FINALIZADA</span>`;
      } else {
        // Opción para activar remate estacional
        accionLiquidacion = `
          <button class="btn btn-warning btn-sm" onclick="abrirModalLiquidar(${t.id_temporada}, '${t.codigo_campana}')" title="Activar liquidación con descuento masivo">
            <i class="fas fa-tags"></i> Liquidar
          </button>
        `;
      }

      tr.innerHTML = `
        <td><strong style="color: #a5b4fc; font-family: var(--font-mono);">${t.codigo_campana}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${t.nombre_temporada}</div>
        </td>
        <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${t.fecha_inicio} al ${t.fecha_fin}</span></td>
        <td>
          <span style="font-weight: 700; color: ${parseFloat(t.descuento_liquidacion) > 0 ? '#f59e0b' : 'var(--text-muted)'};">
            ${parseFloat(t.descuento_liquidacion).toFixed(1)}%
          </span>
        </td>
        <td><span class="badge badge-info">${t.cantidad_productos_asociados} prendas</span></td>
        <td>${estadoBadge}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            ${accionLiquidacion}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar temporadas:", error);
  }
}

// =============================================================================
// CASO DE USO: CU07 - Programar Temporada Comercial
// =============================================================================
async function handleCrearTemporada(event) {
  event.preventDefault();

  // Paso 1: El Administrador ingresa datos de la campaña estacional
  const codigo = document.getElementById("temp-codigo").value.trim().toUpperCase();
  const nombre = document.getElementById("temp-nombre").value.trim();
  const inicio = document.getElementById("temp-inicio").value;
  const fin = document.getElementById("temp-fin").value;
  const descuento = parseFloat(document.getElementById("temp-descuento").value) || 0.0;

  // Paso 1.1: Validación de fechas
  if (!codigo || !nombre || !inicio || !fin) {
    showToast("Complete todos los datos de la temporada.", "error");
    return;
  }

  if (new Date(inicio) >= new Date(fin)) {
    showToast("La fecha de inicio debe ser anterior a la fecha de finalización.", "error");
    return;
  }

  // Paso 1.2: ITemporadaBoundary envía programarTemporada al backend
  try {
    const nueva = await apiFetch("/temporadas", {
      method: "POST",
      body: JSON.stringify({
        codigo_campana: codigo,
        nombre_temporada: nombre,
        fecha_inicio: inicio,
        fecha_fin: fin,
        descuento_liquidacion: descuento,
        estado: "VIGENTE"
      })
    });

    showToast(`Campaña '${nueva.nombre_temporada}' programada con éxito.`, "success");
    cerrarModal("modal-crear-temporada");
    cargarTemporadas();

  } catch (error) {
    console.error("Error al registrar temporada:", error);
  }
}

// =============================================================================
// CASO DE USO: CU07 - Activar Descuento Masivo por Liquidación
// =============================================================================
async function handleActivarLiquidacion(event) {
  event.preventDefault();

  const idTemp = parseInt(document.getElementById("liq-temp-id").value, 10);
  const descuento = parseFloat(document.getElementById("liq-descuento-pct").value);

  if (!idTemp || isNaN(descuento) || descuento <= 0 || descuento > 90) {
    showToast("Ingrese un porcentaje de descuento válido (entre 1% y 90%).", "error");
    return;
  }

  try {
    const data = await apiFetch(`/temporadas/${idTemp}/liquidar`, {
      method: "POST",
      body: JSON.stringify({ descuento_liquidacion: descuento })
    });

    showToast(`¡Liquidación activada para ${data.codigo_campana} con ${descuento}% de descuento!`, "success");
    cerrarModal("modal-liquidar-temporada");
    cargarTemporadas();
    cargarCatalogo(); // Los precios con descuento se reflejarán en el catálogo

  } catch (error) {
    console.error("Error al activar liquidación:", error);
  }
}
