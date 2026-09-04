/**
 * Módulo de Autenticación, Registro y Recuperación OTP
 * Casos de Uso: CU01, CU02, CU03
 * Implementa el control de interfaz de usuario con pasos correlativos de ejecución.
 */

// =============================================================================
// CASO DE USO: CU01 - Autenticar Usuario y Control de Acceso (RBAC)
// =============================================================================
async function handleLogin(event) {
  event.preventDefault();

  // Paso 1: El usuario ingresa su correo electrónico y contraseña en el formulario
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const rememberCheckbox = document.getElementById("login-remember");

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const recordar = rememberCheckbox ? rememberCheckbox.checked : false;

  if (!email || !password) {
    showToast("Por favor complete todos los campos de acceso.", "error");
    return;
  }

  // Paso 1.1: ILoginBoundary envía solicitarAutenticacion al backend mediante POST /api/v1/auth/login
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
        recordar_sesion: recordar
      })
    });

    // Paso 1.2: Se recibe TokenResponse con JWT y rol asignado
    State.setSession(data.access_token, {
      id_usuario: data.id_usuario,
      nombres: data.nombres,
      apellidos: data.apellidos,
      nombre_completo: data.nombre_completo || `${data.nombres} ${data.apellidos}`,
      email: data.email,
      rol: data.rol,
      id_sucursal: data.id_sucursal
    });

    // Paso 1.3: Redirección automática según el rol asignado en la matriz RBAC
    showToast(`¡Bienvenido/a ${data.nombre_completo}! Sesión iniciada con rol ${data.rol}.`, "success");
    
    if (data.rol === "ADMINISTRADOR") {
      showView("dashboard-view");
    } else if (data.rol === "LOGISTICA") {
      showView("inventario-view");
    } else {
      showView("catalogo-view");
    }

  } catch (error) {
    // Paso 1.4: En caso de error o cuenta bloqueada por 5 fallos, el backend arroja detalle
    console.error("Error en autenticación:", error);
  }
}

// =============================================================================
// CASO DE USO: CU02 - Registrar Cliente (Auto-registro)
// =============================================================================
async function handleRegistro(event) {
  event.preventDefault();

  // Paso 1: El cliente ingresa nombres, apellidos, correo, teléfono y contraseña
  const nombres = document.getElementById("reg-nombres").value.trim();
  const apellidos = document.getElementById("reg-apellidos").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const telefono = document.getElementById("reg-telefono").value.trim();

  if (!nombres || !apellidos || !email || !password) {
    showToast("Complete todos los campos obligatorios.", "error");
    return;
  }

  // Paso 1.1: IRegistroBoundary invoca procesarRegistroCliente enviando payload a /api/v1/auth/registro
  try {
    const data = await apiFetch("/auth/registro", {
      method: "POST",
      body: JSON.stringify({
        nombres,
        apellidos,
        email,
        password,
        telefono: telefono || null
      })
    });

    // Paso 1.2: El sistema almacena el usuario con rol CLIENTE y emite sesión automática
    State.setSession(data.access_token, {
      id_usuario: data.id_usuario,
      nombres: data.nombres,
      apellidos: data.apellidos,
      nombre_completo: data.nombre_completo || `${data.nombres} ${data.apellidos}`,
      email: data.email,
      rol: data.rol,
      id_sucursal: null
    });

    showToast("¡Cuenta creada exitosamente! Bienvenido a FashionStore.", "success");
    showView("catalogo-view");

  } catch (error) {
    console.error("Error en auto-registro:", error);
  }
}

// =============================================================================
// CASO DE USO: CU03 - Recuperar Contraseña vía Token OTP de 6 Dígitos
// =============================================================================
async function handleSolicitarOtp(event) {
  event.preventDefault();

  // Paso 1: El usuario ingresa su correo en la interfaz de recuperación
  const email = document.getElementById("otp-email").value.trim();
  if (!email) {
    showToast("Ingrese su correo electrónico.", "error");
    return;
  }

  // Paso 1.1: Enviar solicitud de código OTP de 6 dígitos con vigencia de 15 minutos
  try {
    const data = await apiFetch("/auth/recuperar-password/solicitar", {
      method: "POST",
      body: JSON.stringify({ email })
    });

    showToast(data.mensaje, "info");

    // Habilitar el segundo paso en la vista
    document.getElementById("otp-step-1").style.display = "none";
    document.getElementById("otp-step-2").style.display = "block";
    document.getElementById("otp-verify-email").value = email;

  } catch (error) {
    console.error("Error al solicitar OTP:", error);
  }
}

async function handleVerificarOtpYReset(event) {
  event.preventDefault();

  // Paso 2: El usuario ingresa el código OTP recibido y la nueva contraseña
  const email = document.getElementById("otp-verify-email").value.trim();
  const codigoOtp = document.getElementById("otp-codigo").value.trim();
  const nuevaPassword = document.getElementById("otp-nueva-clave").value;

  if (!codigoOtp || !nuevaPassword) {
    showToast("Ingrese el código OTP de 6 dígitos y la nueva contraseña.", "error");
    return;
  }

  // Paso 2.1: Enviar verificación del token y actualización del hash Bcrypt
  try {
    const data = await apiFetch("/auth/recuperar-password/verificar", {
      method: "POST",
      body: JSON.stringify({
        email,
        codigo_otp: codigoOtp,
        nueva_password: nuevaPassword
      })
    });

    showToast(data.mensaje, "success");
    
    // Regresar al formulario de login
    document.getElementById("otp-step-2").style.display = "none";
    document.getElementById("otp-step-1").style.display = "block";
    showAuthTab("login");

  } catch (error) {
    console.error("Error al verificar OTP:", error);
  }
}

function handleLogout() {
  State.clearSession();
  showToast("Sesión cerrada correctamente.", "info");
  showView("catalogo-view");
}
