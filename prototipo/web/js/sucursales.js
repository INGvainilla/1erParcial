/**
 * Módulo de Gestión de Sucursales y Ciudades Físicas
 * Caso de Uso: CU05 - Gestionar Sucursales Físicas
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU05 - Consulta de Tiendas Físicas y Ciudades
// =============================================================================
async function cargarSucursales() {
  // Paso 1: El usuario o administrador consulta la red de tiendas físicas
  try {
    const sucursales = await apiFetch("/sucursales");
    const tbody = document.getElementById("sucursales-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (sucursales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay sucursales registradas.</td></tr>`;
      return;
    }

    sucursales.forEach(s => {
      const tr = document.createElement("tr");

      let estadoBadge = `<span class="badge badge-success">OPERATIVA</span>`;
      if (s.estado === "MANTENIMIENTO") {
        estadoBadge = `<span class="badge badge-warning">MANTENIMIENTO</span>`;
      } else if (s.estado === "CERRADA") {
        estadoBadge = `<span class="badge badge-danger">CERRADA</span>`;
      }

      const googleMapsUrl = `https://www.google.com/maps?q=${s.latitud},${s.longitud}`;

      tr.innerHTML = `
        <td><strong>#${s.id_sucursal}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${s.nombre_sucursal}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${s.direccion}</div>
        </td>
        <td><span class="badge badge-info"><i class="fas fa-city"></i> ${s.nombre_ciudad} (${s.departamento})</span></td>
        <td>
          <a href="${googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ver en Google Maps">
            <i class="fas fa-map-marker-alt" style="color: #ef4444;"></i>
            <span style="font-family: var(--font-mono); font-size: 0.75rem;">${parseFloat(s.latitud).toFixed(4)}, ${parseFloat(s.longitud).toFixed(4)}</span>
          </a>
        </td>
        <td>
          <span style="font-weight: 700; color: #a5b4fc;"><i class="fas fa-door-open"></i> ${s.capacidad_probadores} probadores</span>
        </td>
        <td style="font-size: 0.82rem;">${s.horario_apertura} - ${s.horario_cierre}</td>
        <td>${estadoBadge}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar sucursales:", error);
  }
}

async function cargarCiudadesSelect(selectId) {
  try {
    const ciudades = await apiFetch("/ciudades");
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar Ciudad --</option>';
    ciudades.forEach(c => {
      select.innerHTML += `<option value="${c.id_ciudad}">${c.nombre_ciudad} (${c.departamento})</option>`;
    });
  } catch (error) {
    console.error("Error al cargar ciudades:", error);
  }
}

// =============================================================================
// CASO DE USO: CU05 - Alta de Sucursal con Coordenadas GPS y Probadores
// =============================================================================
async function handleCrearSucursal(event) {
  event.preventDefault();

  // Paso 1: El Administrador ingresa datos de la sucursal física
  const idCiudad = parseInt(document.getElementById("suc-ciudad").value, 10);
  const nombre = document.getElementById("suc-nombre").value.trim();
  const direccion = document.getElementById("suc-direccion").value.trim();
  const latitud = parseFloat(document.getElementById("suc-latitud").value);
  const longitud = parseFloat(document.getElementById("suc-longitud").value);
  const probadores = parseInt(document.getElementById("suc-probadores").value, 10);
  const apertura = document.getElementById("suc-apertura").value;
  const cierre = document.getElementById("suc-cierre").value;

  // Paso 1.1: Validación de reglas de negocio en la interfaz
  if (!idCiudad || !nombre || !direccion || isNaN(latitud) || isNaN(longitud)) {
    showToast("Por favor complete todos los datos requeridos.", "error");
    return;
  }

  if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
    showToast("Coordenadas GPS fuera de rango válido terrestre.", "error");
    return;
  }

  if (probadores < 1) {
    showToast("La sucursal debe disponer de al menos 1 probador físico.", "error");
    return;
  }

  // Paso 1.2: Enviar POST a /api/v1/sucursales
  try {
    const nueva = await apiFetch("/sucursales", {
      method: "POST",
      body: JSON.stringify({
        id_ciudad: idCiudad,
        nombre_sucursal: nombre,
        direccion: direccion,
        latitud: latitud,
        longitud: longitud,
        capacidad_probadores: probadores,
        horario_apertura: apertura,
        horario_cierre: cierre,
        estado: "OPERATIVA"
      })
    });

    showToast(`Sucursal '${nueva.nombre_sucursal}' registrada con éxito.`, "success");
    cerrarModal("modal-crear-sucursal");
    cargarSucursales();

  } catch (error) {
    console.error("Error al registrar sucursal:", error);
  }
}
