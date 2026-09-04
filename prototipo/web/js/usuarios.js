/**
 * Módulo de Gestión de Usuarios y Roles (RBAC)
 * Caso de Uso: CU04 - Gestionar Usuarios del Sistema
 * Documentado con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU04 - Listado y Filtrado de Personal y Usuarios
// =============================================================================
async function cargarUsuarios() {
  // Paso 1: El Administrador solicita la lista de usuarios y define filtros
  const rolFilter = document.getElementById("filter-user-rol")?.value || "";
  const estadoFilter = document.getElementById("filter-user-estado")?.value || "";

  let query = "/usuarios?";
  if (rolFilter) query += `rol=${rolFilter}&`;
  if (estadoFilter) query += `estado=${estadoFilter}&`;

  try {
    // Paso 1.1: IGestionUsuariosBoundary invoca GET /api/v1/usuarios
    const usuarios = await apiFetch(query);

    // Paso 1.2: Renderizar grilla de usuarios con badges de estado y botones de acción
    const tbody = document.getElementById("usuarios-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No se encontraron usuarios coincidentes.</td></tr>`;
      return;
    }

    usuarios.forEach(u => {
      const tr = document.createElement("tr");

      // Badge de estado
      let estadoBadge = `<span class="badge badge-success"><i class="fas fa-check-circle"></i> ACTIVO</span>`;
      let accionDesbloquear = "";

      if (u.estado_cuenta === "BLOQUEADO_POR_INTENTOS") {
        estadoBadge = `<span class="badge badge-danger"><i class="fas fa-lock"></i> BLOQUEADO (${u.intentos_fallidos} fallos)</span>`;
        accionDesbloquear = `
          <button class="btn btn-warning btn-sm" onclick="desbloquearUsuario(${u.id_usuario}, '${u.email}')" title="Desbloquear acceso preventivo">
            <i class="fas fa-unlock"></i> Desbloquear
          </button>
        `;
      } else if (u.estado_cuenta === "INACTIVO") {
        estadoBadge = `<span class="badge badge-warning"><i class="fas fa-minus-circle"></i> INACTIVO</span>`;
      }

      tr.innerHTML = `
        <td><strong>#${u.id_usuario}</strong></td>
        <td>
          <div style="font-weight: 600;">${u.nombre_completo}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${u.email}</div>
        </td>
        <td><span class="user-role-badge">${u.rol}</span></td>
        <td>${u.sucursal_nombre || '<span style="color: var(--text-muted); font-style: italic;">Central / Digital</span>'}</td>
        <td>${estadoBadge}</td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem;">${new Date(u.creado_en).toLocaleDateString()}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            ${accionDesbloquear}
            <button class="btn btn-secondary btn-sm" onclick="abrirModalEditarUsuario(${u.id_usuario})">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

// =============================================================================
// CASO DE USO: CU04 - Desbloqueo Administrativo de Cuentas
// =============================================================================
async function desbloquearUsuario(idUsuario, email) {
  // Paso 2: El Administrador pulsa el botón 'Desbloquear' en IGestionUsuariosBoundary
  if (!confirm(`¿Confirma el desbloqueo administrativo de la cuenta para '${email}'?`)) {
    return;
  }

  // Paso 2.1: Se envía solicitud PUT /api/v1/usuarios/{id_usuario}/desbloquear
  try {
    const data = await apiFetch(`/usuarios/${idUsuario}/desbloquear`, {
      method: "PUT"
    });

    // Paso 2.2: El backend resetea intentos a 0 y estado a ACTIVO
    showToast(data.mensaje, "success");

    // Paso 2.3: La interfaz actualiza inmediatamente la grilla y el badge a verde
    cargarUsuarios();

  } catch (error) {
    console.error("Error al desbloquear cuenta:", error);
  }
}

// =============================================================================
// CASO DE USO: CU04 - Alta de Personal y Asignación de Roles
// =============================================================================
async function handleCrearUsuario(event) {
  event.preventDefault();

  // Paso 1: El Administrador completa el formulario de nuevo empleado
  const nombreCompleto = document.getElementById("new-user-nombre").value.trim();
  const email = document.getElementById("new-user-email").value.trim();
  const password = document.getElementById("new-user-password").value;
  const rol = document.getElementById("new-user-rol").value;
  const sucursalVal = document.getElementById("new-user-sucursal").value;
  const idSucursal = sucursalVal ? parseInt(sucursalVal, 10) : null;

  if (!nombreCompleto || !email || !password || !rol) {
    showToast("Complete los campos obligatorios del empleado.", "error");
    return;
  }

  // Paso 1.1: Se envía solicitud POST a /api/v1/usuarios
  try {
    const nuevo = await apiFetch("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nombre_completo: nombreCompleto,
        email: email,
        password: password,
        rol: rol,
        id_sucursal: idSucursal
      })
    });

    showToast(`Empleado ${nuevo.nombre_completo} dado de alta con rol ${nuevo.rol}.`, "success");
    cerrarModal("modal-crear-usuario");
    cargarUsuarios();

  } catch (error) {
    console.error("Error al crear usuario:", error);
  }
}
