@echo off
title FashionStore - Plataforma E-Commerce Omnicanal (Ciclo 1: SI2)
color 0B

echo =========================================================================
echo       FASHIONSTORE - CICLO 1: FUNDAMENTOS Y MODULOS BASE (SI2 2-2026)
echo       Integrantes: Alberto Delgado y Andy Mujica
echo       Docente: MSc. Ing. Angelica Garzon Cuellar
echo =========================================================================
echo.

cd /d "%~dp0\backend"

echo [1/3] Verificando conexion a Base de Datos PostgreSQL...
python -c "from app.core.config import settings; from app.core.database import engine; conn = engine.connect(); print(' [OK] Conectado exitosamente a PostgreSQL (fashionstore_db)'); conn.close()"

echo.
echo [2/3] Iniciando Servidor Unificado FastAPI (Backend + Frontend Angular)...
echo       - Web App Angular: http://localhost:8000/app/
echo       - Swagger OpenAPI: http://localhost:8000/docs
echo       - Health Check:    http://localhost:8000/health
echo.

start "" "http://localhost:8000"

echo [3/3] Servidor en ejecucion. Presione CTRL+C para detener el sistema.
echo =========================================================================
python run.py
pause
