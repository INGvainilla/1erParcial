@echo off
title Construir Frontend Angular - FashionStore
color 0A

echo =========================================================================
echo       COMPILANDO APLICACION ANGULAR - FASHIONSTORE
echo =========================================================================
echo.

cd /d "%~dp0\web"

echo [1/2] Instalando dependencias (npm install)...
call npm install

echo.
echo [2/2] Construyendo proyecto Angular para produccion...
call npm run build

echo.
echo [3/3] Copiando archivos compilados al servidor backend...
xcopy /E /Y "dist\web_app\browser\*" "..\backend\web_dist\"

echo.
echo Compilacion terminada exitosamente.
echo El frontend actualizado ha sido copiado a backend/web_dist y sera servido por FastAPI.
echo =========================================================================
pause
