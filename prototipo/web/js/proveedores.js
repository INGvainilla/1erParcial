/**
 * Módulo de Gestión de Proveedores Textiles
 * Caso de Uso: CU08 - Gestionar Proveedores Textiles
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU08 - Consulta de Directorio de Proveedores Textiles
// =============================================================================
async function cargarProveedores() {
  // Paso 1: El Personal de Logística solicita la lista de proveedores textiles
  try {
    const proveedores = await apiFetch("/proveedores");
    const tbody = document.getElementById("proveedores-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (proveedores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay proveedores registrados.</td></tr>`;
      return;
    }

    proveedores.forEach(p => {
      const tr = document.createElement("tr");

      let terminosBadge = `<span class="badge badge-info">CONTADO</span>`;
      if (p.terminos_pago === "CREDITO_30_DIAS") {
        terminosBadge = `<span class="badge badge-warning">CRÉDITO 30 DÍAS</span>`;
      } else if (p.terminos_pago === "CREDITO_60_DIAS") {
        terminosBadge = `<span class="badge badge-warning">CRÉDITO 60 DÍAS</span>`;
      }

      tr.innerHTML = `
        <td><strong style="color: #a5b4fc; font-family: var(--font-mono);">${p.nit_identificacion}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${p.razon_social}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${p.email || 'Sin correo registrado'}</div>
        </td>
        <td>${p.contacto_nombre || '<span style="color: var(--text-muted);">N/A</span>'}</td>
        <td style="font-family: var(--font-mono); font-size: 0.82rem;">${p.telefono || 'N/A'}</td>
        <td>${terminosBadge}</td>
        <td><span class="badge badge-success">${p.estado}</span></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar proveedores:", error);
  }
}

// =============================================================================
// CASO DE USO: CU08 - Alta de Proveedor Textil con Validación de NIT
// =============================================================================
async function handleCrearProveedor(event) {
  event.preventDefault();

  // Paso 1: El Personal de Logística envía datos del proveedor
  const nit = document.getElementById("prov-nit").value.trim();
  const razonSocial = document.getElementById("prov-razon").value.trim();
  const contacto = document.getElementById("prov-contacto").value.trim();
  const telefono = document.getElementById("prov-telefono").value.trim();
  const email = document.getElementById("prov-email").value.trim();
  const terminos = document.getElementById("prov-terminos").value;

  if (!nit || !razonSocial) {
    showToast("El NIT y la Razón Social son campos obligatorios.", "error");
    return;
  }

  // Paso 1.1: IProveedorBoundary invoca registrarProveedor(datosProv) mediante POST /api/v1/proveedores
  try {
    const nuevo = await apiFetch("/proveedores", {
      method: "POST",
      body: JSON.stringify({
        nit_identificacion: nit,
        razon_social: razonSocial,
        contacto_nombre: contacto || null,
        telefono: telefono || null,
        email: email || null,
        terminos_pago: terminos,
        estado: "ACTIVO"
      })
    });

    showToast(`Proveedor '${nuevo.razon_social}' registrado con NIT ${nuevo.nit_identificacion}.`, "success");
    cerrarModal("modal-crear-proveedor");
    cargarProveedores();

  } catch (error) {
    console.error("Error al registrar proveedor:", error);
  }
}
