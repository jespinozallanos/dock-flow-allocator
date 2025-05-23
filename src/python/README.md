
# Modelo Matemático de Optimización para Asignación de Diques

Este directorio contiene la implementación del modelo matemático de optimización para la asignación de diques, desarrollado en Python utilizando PuLP.

## Requisitos

- Python 3.7+
- Dependencias listadas en `requirements.txt`

## Instalación

Para instalar las dependencias necesarias, ejecutar:

```bash
pip install -r requirements.txt
```

## Ejecutar el servidor

Para iniciar el servidor de la API Flask, ejecutar:

```bash
python api.py
```

El servidor estará disponible en http://localhost:5000

## Endpoints de la API

- **POST /api/allocation-model**: Ejecuta el modelo de optimización con los parámetros proporcionados

## Estructura del código

- `api.py`: Servidor Flask que expone el modelo a través de una API REST
- `dock_allocation_model.py`: Implementación del modelo matemático de optimización utilizando PuLP
- `requirements.txt`: Lista de dependencias necesarias para ejecutar el código

## Integración con la aplicación web

La aplicación web se conectará automáticamente a este servidor cuando esté disponible. Si el servidor no está disponible, la aplicación utilizará su modelo de simulación JavaScript como alternativa.
