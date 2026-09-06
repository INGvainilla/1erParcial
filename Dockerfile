# ==============================================================================
# Dockerfile: FashionStore Omnicanal (Ciclo 1: SI2 - 2-2026)
# Backend: FastAPI + Uvicorn + SQLAlchemy + SQLite/PostgreSQL
# Frontend: Angular 19 SPA (Embebido en web_dist para despliegue ultra-rápido y estable)
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Variables de entorno para Python y Uvicorn
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Instalar dependencias del sistema requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY prototipo/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el backend completo incluyendo los activos compilados de Angular en web_dist
COPY prototipo/backend/ ./

# Exponer el puerto por defecto
EXPOSE 8000

# Comando de inicio: Uvicorn escuchando en 0.0.0.0 en el puerto asignado dinámicamente por la nube
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
