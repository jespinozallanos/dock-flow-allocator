
#!/bin/bash

echo "🚀 Iniciando aplicación completa (Frontend + Python API)..."
echo "=================================================="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar Python
if ! command_exists python3; then
    if ! command_exists python; then
        echo "❌ Python no está instalado"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ Python encontrado: $($PYTHON_CMD --version)"

# Instalar dependencias de Python si es necesario
if [ ! -d "src/python/__pycache__" ] || [ ! -f "src/python/.deps_installed" ]; then
    echo "📦 Instalando dependencias de Python..."
    cd src/python
    $PYTHON_CMD -m pip install -r requirements.txt
    touch .deps_installed
    cd ../..
fi

# Instalar dependencias de Node.js si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

echo "🎯 Iniciando servicios..."
echo "  • Python API en puerto 5000"
echo "  • Frontend en puerto 8080"
echo ""
echo "Para detener la aplicación, presiona Ctrl+C"
echo "=================================================="

# Ejecutar ambos servicios usando concurrently
npx concurrently \
    --names "🐍PYTHON,⚛️REACT" \
    --prefix-colors "blue,green" \
    "cd src/python && $PYTHON_CMD api.py" \
    "npm run dev"
