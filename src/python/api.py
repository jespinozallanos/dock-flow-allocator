
# API Flask para el modelo de asignación de diques
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os
import socket
from dock_allocation_model import run_allocation_model

app = Flask(__name__)

# Configurar CORS para permitir solicitudes desde localhost y Codespaces
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "https://*.github.dev",
    "https://*.githubpreview.dev",
    "https://*.codespaces.githubusercontent.com",
    "https://*.lovableproject.com"
])

def get_local_ip():
    """Obtener la IP local del sistema"""
    try:
        # Conectar a una dirección externa para obtener la IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "No disponible"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del API"""
    return jsonify({
        'status': 'healthy',
        'service': 'dock-allocation-api',
        'message': 'API Python funcionando correctamente',
        'python_version': sys.version,
        'working_directory': os.getcwd(),
        'local_ip': get_local_ip(),
        'endpoints': ['/api/health', '/api/allocation-model']
    })

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
    print("=" * 60)
    print("🚀 INICIANDO API PYTHON PARA MODELO DE ASIGNACIÓN DE DIQUES")
    print("=" * 60)
    print(f"📍 Directorio de trabajo: {os.getcwd()}")
    print(f"🐍 Versión de Python: {sys.version}")
    print(f"🌐 IP local del sistema: {get_local_ip()}")
    print("")
    print("📡 ENDPOINTS DISPONIBLES:")
    print("  • Health check: /api/health")
    print("  • Modelo de asignación: /api/allocation-model")
    print("")
    print("🔗 URLS DE ACCESO:")
    print("  • Localhost: http://localhost:5000")
    print("  • Localhost (127.0.0.1): http://127.0.0.1:5000")
    print(f"  • Red local: http://{get_local_ip()}:5000")
    print("")
    print("🔧 PARA CONECTAR DESDE EL FRONTEND:")
    print("  1. Asegúrate de que este servidor esté ejecutándose")
    print("  2. Ejecuta el frontend con: npm run dev")
    print("  3. El frontend detectará automáticamente esta API")
    print("")
    print("⚠️  SI TIENES PROBLEMAS DE CONEXIÓN:")
    print("  • Verifica que no haya firewall bloqueando el puerto 5000")
    print("  • Asegúrate de que ningún otro servicio use el puerto 5000")
    print("  • Revisa la consola del navegador para errores CORS")
    print("=" * 60)
    
    # Configurar el servidor para que funcione tanto en localhost como en Codespaces
    try:
        app.run(
            host='0.0.0.0',  # Permitir conexiones desde cualquier IP
            port=5000, 
            debug=True,
            threaded=True  # Permitir múltiples peticiones simultáneas
        )
    except OSError as e:
        if "Address already in use" in str(e):
            print("❌ ERROR: El puerto 5000 ya está en uso")
            print("🔧 SOLUCIONES:")
            print("  1. Cierra cualquier otro servidor en el puerto 5000")
            print("  2. O usa: sudo lsof -ti:5000 | xargs kill -9")
            print("  3. Luego vuelve a ejecutar: python api.py")
        else:
            print(f"❌ ERROR al iniciar el servidor: {e}")
        sys.exit(1)
