# ==============================================================================
# Dockerfile: FashionStore Omnicanal (Ciclos 1, 2 y 3: SI2 - 2-2026)
# Backend: FastAPI + Uvicorn + SQLAlchemy + SQLite/PostgreSQL (10 Paquetes PUDS)
# Frontend: Angular 19 SPA con CU25 Devoluciones y Asistente IA (web_dist)
# Optimizado para Render: Pre-compilado para evitar OOM (Out-of-Memory) en tier gratuito
# ==============================================================================
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

# Copiar el backend completo (incluyendo web_dist con la SPA Angular compilada)
COPY prototipo/backend/ ./

# Exponer el puerto por defecto
EXPOSE 8000

# Comando de inicio: Uvicorn en 0.0.0.0 en el puerto asignado dinámicamente por la nube (Render PORT)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
