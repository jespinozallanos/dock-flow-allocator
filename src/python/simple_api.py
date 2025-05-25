
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["*"])  # Permitir todas las conexiones para simplificar

@app.route('/health', methods=['GET'])
def health():
    """Health check simple"""
    return jsonify({
        'status': 'ok',
        'message': 'API Python funcionando',
        'port': 3001
    })

@app.route('/allocate', methods=['POST'])
def allocate():
    """Modelo de asignación simplificado"""
    try:
        data = request.json
        print(f"Datos recibidos: {data}")
        
        # Modelo simplificado - solo crear una asignación básica
        ships = data.get('ships', [])
        docks = data.get('docks', [])
        
        allocations = []
        for i, ship in enumerate(ships[:len(docks)]):  # Asignar hasta que se acaben los diques
            allocation = {
                'id': f'alloc_{i}',
                'shipId': ship['id'],
                'dockId': docks[i]['id'],
                'startTime': ship.get('arrivalTime'),
                'endTime': ship.get('departureTime'),
                'status': 'scheduled',
                'created': datetime.now().isoformat()
            }
            allocations.append(allocation)
        
        result = {
            'allocations': allocations,
            'metrics': {
                'totalWaitingTime': 0,
                'dockUtilization': 0.8,
                'conflicts': 0
            }
        }
        
        print(f"Resultado: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 API Python Simple - Puerto 3001")
    print("📡 Endpoints:")
    print("  - Health: http://localhost:3001/health")
    print("  - Allocate: http://localhost:3001/allocate")
    app.run(host='localhost', port=3001, debug=True)
