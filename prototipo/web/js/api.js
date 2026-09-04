/**
 * FashionStore API Client & Utilities
 * Manejo centralizado de peticiones HTTP hacia el Backend FastAPI
 * Integración con tokens JWT y notificaciones Toast
 */

const API_BASE = "http://localhost:8000/api/v1";

// Estado de sesión en memoria / almacenamiento local
const State = {
  token: localStorage.getItem("fashionstore_token") || null,
  user: JSON.parse(localStorage.getItem("fashionstore_user") || "null"),

  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("fashionstore_token", token);
    localStorage.setItem("fashionstore_user", JSON.stringify(user));
    updateUserInterfaceSession();
  },

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("fashionstore_token");
    localStorage.removeItem("fashionstore_user");
    updateUserInterfaceSession();
  }
};

/**
 * Cliente HTTP unificado con soporte para Bearer Token
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (State.token) {
    headers["Authorization"] = `Bearer ${State.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 && !endpoint.includes("/login")) {
      showToast("Sesión expirada o no autorizada. Por favor inicie sesión.", "error");
      State.clearSession();
      showView("auth-view");
      throw new Error("No autorizado");
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || `Error HTTP ${response.status}: ${response.statusText}`;
      showToast(errorMsg, "error");
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Gestor de Notificaciones Toast flotantes
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "exclamation-triangle";

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
