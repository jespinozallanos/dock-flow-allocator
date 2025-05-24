
# Instrucciones para Ejecutar el Sistema Localmente

## Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **Python** (versión 3.7 o superior)
3. **Git** (para clonar el repositorio)

## Pasos para Ejecutar

### 1. Clonar y Configurar el Proyecto React

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]

# Instalar dependencias de Node.js
npm install

# Ejecutar la aplicación React (en puerto 5173)
npm run dev
```

### 2. Configurar y Ejecutar el Servidor Python

**En una terminal separada:**

```bash
# Navegar a la carpeta Python
cd src/python

# Instalar dependencias Python
pip install -r requirements.txt

# Ejecutar el servidor Flask
python api.py
```

**Salida esperada:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### 3. Verificar que Todo Funciona

1. **Aplicación React**: Abre http://localhost:5173 en tu navegador
2. **Servidor Python**: Debe mostrar "Modelo Matemático Python Activo" en la interfaz
3. **Prueba**: Ve a la pestaña "Asignación" y haz clic en "Ejecutar Modelo de Optimización"

## Solución de Problemas

### Error: "Servidor Python No Disponible"

1. Verifica que el servidor Python esté corriendo en http://127.0.0.1:5000
2. Asegúrate de que no haya firewall bloqueando el puerto 5000
3. Revisa la terminal donde ejecutaste `python api.py` por errores

### Error: "pip install" falla

```bash
# Actualizar pip
python -m pip install --upgrade pip

# Instalar dependencias una por una si es necesario
pip install flask==2.0.1
pip install flask-cors==3.0.10
pip install pulp==2.7.0
```

### Error: Python no encontrado

- En Windows: Asegúrate de que Python esté en el PATH
- En macOS/Linux: Puede que necesites usar `python3` en lugar de `python`

## Estructura del Sistema

```
proyecto/
├── src/
│   ├── python/           # Servidor Flask + Modelo de Optimización
│   │   ├── api.py        # Servidor web
│   │   ├── dock_allocation_model.py  # Lógica de optimización
│   │   └── requirements.txt
│   └── [otros archivos React]
└── [archivos de configuración]
```

## Puertos Utilizados

- **React**: http://localhost:5173
- **Python Flask**: http://127.0.0.1:5000

## Notas Importantes

- Mantén ambas terminales abiertas mientras uses la aplicación
- El servidor Python debe ejecutarse ANTES de usar la función de optimización
- Los cambios en el código Python requieren reiniciar el servidor Flask
- Los cambios en el código React se actualizan automáticamente
