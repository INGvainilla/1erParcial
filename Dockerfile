# ==============================================================================
# Dockerfile Multi-Stage: FashionStore Omnicanal (Ciclo 1: SI2 - 2-2026)
# Etapa 1: Compilación de Frontend Angular SPA
# Etapa 2: Backend FastAPI + Uvicorn + Base de Datos + Static Files
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. ETAPA DE CONSTRUCCIÓN FRONTEND (Node.js 20)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend

# Copiar manifiestos e instalar dependencias de Angular
COPY prototipo/web/package*.json ./
RUN npm install

# Copiar código fuente de Angular y generar bundle de producción
COPY prototipo/web/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# 2. ETAPA DE EJECUCIÓN BACKEND (Python 3.11 Slim)
# ------------------------------------------------------------------------------
FROM python:3.11-slim AS runtime

WORKDIR /app

# Variables de entorno para Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Instalar dependencias básicas del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY prototipo/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY prototipo/backend/ ./

# Copiar frontend compilado desde la etapa 1 a las rutas esperadas
COPY --from=build-frontend /app/frontend/dist /app/web/dist
COPY --from=build-frontend /app/frontend/dist /prototipo/web/dist

# Exponer el puerto por defecto
EXPOSE 8000

# Comando de inicio: Uvicorn escuchando en 0.0.0.0 en el puerto asignado dinámicamente por la nube
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
