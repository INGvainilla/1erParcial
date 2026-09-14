# ==============================================================================
# Dockerfile Multi-Stage: FashionStore Omnicanal (Ciclos 1 y 2: SI2 - 2-2026)
# Backend: FastAPI + Uvicorn + SQLAlchemy + PostgreSQL / SQLite
# Frontend: Angular SPA (Compilado en Node.js y servido estáticamente)
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: Compilación del Frontend Web Angular
# ------------------------------------------------------------------------------
FROM node:20-alpine AS web-builder

WORKDIR /app/web

# Instalar dependencias npm
COPY prototipo/web/package*.json ./
RUN npm ci --prefer-offline --no-audit || npm install --legacy-peer-deps

# Copiar el código fuente web y compilar para producción
COPY prototipo/web/ ./
RUN npm run build -- --configuration production

# ------------------------------------------------------------------------------
# Etapa 2: Runtime Backend Python / FastAPI + Frontend Embebido
# ------------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# Variables de entorno para Python y Uvicorn
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Instalar utilitarios del sistema requeridos
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY prototipo/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el backend de la aplicación
COPY prototipo/backend/ ./

# Copiar los activos web compilados de Angular desde la Etapa 1 hacia web_dist
COPY --from=web-builder /app/web/dist/web_app/browser/ ./web_dist/

# Exponer el puerto por defecto
EXPOSE 8000

# Comando de inicio: Uvicorn en 0.0.0.0 en el puerto asignado dinámicamente por la nube (Render PORT)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

