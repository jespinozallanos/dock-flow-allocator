
# API Flask para el modelo de asignación de diques
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from dock_allocation_model import run_allocation_model

app = Flask(__name__)
CORS(app)  # Permitir solicitudes CORS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del API"""
    return jsonify({
        'status': 'healthy',
        'service': 'dock-allocation-api',
        'message': 'API Python funcionando correctamente'
    })

@app.route('/api/allocation-model', methods=['POST'])
def allocation_model():
    try:
        # Recibir parámetros del modelo
        params = request.json
        print(f"Recibidos parámetros del modelo: {json.dumps(params, indent=2, default=str)}")
        
        # Ejecutar modelo de optimización
        result = run_allocation_model(params)
        print(f"Resultado del modelo: {json.dumps(result, indent=2, default=str)}")
        
        # Devolver resultados
        return jsonify(result)
    
    except Exception as e:
        print(f"Error en el modelo de asignación: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Iniciando API Python para modelo de asignación de diques...")
    print("Endpoint de salud: /api/health")
    print("Endpoint del modelo: /api/allocation-model")
    app.run(host='0.0.0.0', port=5000, debug=True)
