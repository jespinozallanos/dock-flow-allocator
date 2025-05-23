
# API Flask para el modelo de asignación de diques
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from dock_allocation_model import run_allocation_model

app = Flask(__name__)
CORS(app)  # Permitir solicitudes CORS

@app.route('/api/allocation-model', methods=['POST'])
def allocation_model():
    try:
        # Recibir parámetros del modelo
        params = request.json
        
        # Ejecutar modelo de optimización
        result = run_allocation_model(params)
        
        # Devolver resultados
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
