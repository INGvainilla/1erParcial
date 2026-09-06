/**
 * Resolución dinámica de la URL base de la API REST de FashionStore.
 * - En modo desarrollo (ng serve en localhost:4200): redirige automáticamente a http://localhost:8000/api/v1
 * - En producción o embebido en FastAPI (puerto 8000 o detrás de proxy): utiliza la ruta relativa /api/v1
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && window.location.port === '4200') {
      return `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;
    }
  }
  return '/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
