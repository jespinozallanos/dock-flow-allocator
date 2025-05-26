
@echo off
echo 🚀 Iniciando aplicación completa (Frontend + Python API)...
echo ==================================================

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Python no está instalado
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

echo ✅ Node.js encontrado
echo ✅ Python encontrado

REM Instalar dependencias de Python si es necesario
if not exist "src\python\.deps_installed" (
    echo 📦 Instalando dependencias de Python...
    cd src\python
    %PYTHON_CMD% -m pip install -r requirements.txt
    echo. > .deps_installed
    cd ..\..
)

REM Instalar dependencias de Node.js si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias de Node.js...
    npm install
)

echo 🎯 Iniciando servicios...
echo   • Python API en puerto 5000
echo   • Frontend en puerto 8080
echo.
echo Para detener la aplicación, presiona Ctrl+C
echo ==================================================

REM Ejecutar ambos servicios usando concurrently
npx concurrently ^
    --names "🐍PYTHON,⚛️REACT" ^
    --prefix-colors "blue,green" ^
    "cd src/python && %PYTHON_CMD% api.py" ^
    "npm run dev"

pause
