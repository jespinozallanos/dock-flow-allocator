
# 🚀 Guía de Inicio Rápido

Esta aplicación incluye tanto el frontend (React) como la API de Python para el modelo de optimización de asignación de diques.

## Inicio con Un Solo Comando

### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### Windows:
```cmd
start.bat
```

## ¿Qué hace el script de inicio?

1. **Verifica dependencias**: Node.js y Python
2. **Instala automáticamente**: 
   - Dependencias de Python (Flask, PuLP, etc.)
   - Dependencias de Node.js (si es necesario)
3. **Inicia ambos servicios**:
   - 🐍 **Python API** en `http://localhost:5000`
   - ⚛️ **Frontend React** en `http://localhost:8080`

## Inicio Manual (Método Anterior)

Si prefieres controlar cada servicio por separado:

### Terminal 1 - API Python:
```bash
cd src/python
pip install -r requirements.txt
python api.py
```

### Terminal 2 - Frontend:
```bash
npm install
npm run dev
```

## Verificación

1. **API Python**: Visita `http://localhost:5000/api/health`
2. **Frontend**: Visita `http://localhost:8080`
3. **Dashboard**: En el frontend, verifica que aparezca "API Python: ✅ Conectada"

## Solución de Problemas

- **Puerto ocupado**: Si el puerto 5000 está ocupado, detén otros servicios Python
- **Dependencias**: Los scripts instalan automáticamente las dependencias necesarias
- **Permisos**: En Linux/Mac, asegúrate de dar permisos de ejecución: `chmod +x start.sh`

## Entornos Soportados

- ✅ **Local** (Windows, Mac, Linux)
- ✅ **GitHub Codespaces**
- ✅ **Contenedores Docker**
- ❌ **Lovable remoto** (solo frontend)
