
# API Flask para el modelo de asignación de diques
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os
from dock_allocation_model import run_allocation_model

app = Flask(__name__)

# Configurar CORS para permitir solicitudes desde localhost y Codespaces
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://*.github.dev",
    "https://*.githubpreview.dev",
    "https://*.codespaces.githubusercontent.com",
    "https://*.lovableproject.com"
])

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del API"""
    return jsonify({
        'status': 'healthy',
        'service': 'dock-allocation-api',
        'message': 'API Python funcionando correctamente',
        'python_version': sys.version,
        'working_directory': os.getcwd(),
        'environment': detect_environment()
    })

def detect_environment():
    """Detecta si estamos en Codespaces o localhost"""
    if os.environ.get('CODESPACES') == 'true':
        return 'GitHub Codespaces'
    elif os.environ.get('GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN'):
        return 'GitHub Codespaces'
    else:
        return 'Localhost'

@app.route('/api/allocation-model', methods=['POST'])
def allocation_model():
    try:
        # Recibir parámetros del modelo
        params = request.json
        print(f"Recibidos parámetros del modelo: {json.dumps(params, indent=2, default=str)}")
        
        if not params:
            return jsonify({'error': 'No se recibieron parámetros'}), 400
        
        # Ejecutar modelo de optimización
        result = run_allocation_model(params)
        print(f"Resultado del modelo: {json.dumps(result, indent=2, default=str)}")
        
        # Devolver resultados
        return jsonify(result)
    
    except Exception as e:
        print(f"Error en el modelo de asignación: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'type': 'allocation_model_error'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'available_endpoints': ['/api/health', '/api/allocation-model']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Error interno del servidor',
        'message': 'Consulta los logs del servidor para más detalles'
    }), 500

if __name__ == '__main__':
    # Detectar entorno
    environment = detect_environment()
    port = int(os.environ.get('PORT', 5000))
    
    print("=" * 60)
    print("Iniciando API Python para modelo de asignación de diques...")
    print(f"Entorno detectado: {environment}")
    print("Endpoints disponibles:")
    print("  - GET  /api/health")
    print("  - POST /api/allocation-model")
    print(f"Puerto: {port}")
    
    if environment == 'GitHub Codespaces':
        print("🔗 Configuración para GitHub Codespaces:")
        print(f"  - Puerto interno: {port}")
        print(f"  - CORS habilitado para dominios de Codespaces")
        print(f"  - El puerto será automáticamente expuesto por Codespaces")
    else:
        print("🏠 Configuración para Localhost:")
        print(f"  - URL: http://localhost:{port}")
        print(f"  - Frontend puede conectarse desde http://localhost:5173 o http://localhost:8080")
    
    print("=" * 60)
    
    # Configurar el servidor para que funcione tanto en localhost como en Codespaces
    app.run(
        host='0.0.0.0',  # Permitir conexiones desde cualquier IP
        port=port, 
        debug=True,
        threaded=True  # Permitir múltiples peticiones simultáneas
    )
