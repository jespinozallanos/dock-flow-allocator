
"""
Modelo Matemático de Optimización para Asignación de Diques
Implementado con PuLP
"""

import pulp
from datetime import datetime, timedelta
import json

def run_allocation_model(params):
    """
    Ejecuta el modelo de optimización para asignar barcos a diques
    
    Args:
        params: Diccionario con los parámetros del modelo
            - ships: Lista de barcos
            - docks: Lista de diques
            - existingAllocations: Asignaciones ya existentes
            - optimizationCriteria: Criterio de optimización ('waiting_time', 'dock_utilization', 'balanced')
            - weatherData: Datos meteorológicos
    
    Returns:
        Diccionario con los resultados del modelo
    """
    try:
        # Extraer parámetros
        ships = params.get('ships', [])
        docks = params.get('docks', [])
        existing_allocations = params.get('existingAllocations', [])
        optimization_criteria = params.get('optimizationCriteria', 'balanced')
        weather_data = params.get('weatherData', {})
        
        # Verificar condiciones climáticas
        tide_level = weather_data.get('tide', {}).get('current', 0)
        wind_speed = weather_data.get('wind', {}).get('speed', 0)
        min_tide_level = weather_data.get('settings', {}).get('minTideLevel', 3.0)
        max_wind_speed = weather_data.get('settings', {}).get('maxWindSpeed', 8.0)
        
        # Si las condiciones climáticas no son adecuadas, no realizar asignaciones
        if tide_level < min_tide_level or wind_speed > max_wind_speed:
            return {
                'allocations': [],
                'metrics': {
                    'totalWaitingTime': 0,
                    'dockUtilization': 0,
                    'conflicts': 0
                },
                'weatherData': weather_data,
                'weatherWarning': True,
                'unassignedShips': [{'ship': ship, 'reason': get_failure_reason(ship, docks, weather_data)} for ship in ships]
            }
        
        # Filtrar diques operativos
        operative_docks = [dock for dock in docks if dock.get('operationalStatus') == 'operativo']
        
        # Verificar barcos ya asignados
        allocated_ship_ids = set([alloc.get('shipId') for alloc in existing_allocations])
        unallocated_ships = [ship for ship in ships if ship.get('id') not in allocated_ship_ids]
        
        # Si no hay barcos para asignar o no hay diques operativos, retornar resultado vacío
        if not unallocated_ships or not operative_docks:
            return {
                'allocations': [],
                'metrics': {
                    'totalWaitingTime': 0,
                    'dockUtilization': 0,
                    'conflicts': 0
                },
                'weatherData': weather_data,
                'weatherWarning': False,
                'unassignedShips': [{'ship': ship, 'reason': "No hay diques operativos disponibles"} for ship in unallocated_ships]
            }
        
        # Crear modelo de optimización
        model = pulp.LpProblem("DockAllocation", pulp.LpMinimize)
        
        # Crear variables de decisión
        # x[s][d] = 1 si el barco s se asigna al dique d, 0 en caso contrario
        x = {}
        for ship in unallocated_ships:
            ship_id = ship.get('id')
            x[ship_id] = {}
            for dock in operative_docks:
                dock_id = dock.get('id')
                x[ship_id][dock_id] = pulp.LpVariable(f"x_{ship_id}_{dock_id}", cat='Binary')
        
        # Función objetivo según criterio seleccionado
        if optimization_criteria == 'waiting_time':
            # Minimizar tiempo de espera (prioridad a barcos con mayor prioridad)
            obj_function = pulp.lpSum(ship.get('priority', 1) * x[ship.get('id')][dock.get('id')] 
                                      for ship in unallocated_ships for dock in operative_docks)
        elif optimization_criteria == 'dock_utilization':
            # Maximizar utilización de diques (convertimos a minimización negando)
            obj_function = -pulp.lpSum(ship.get('length') * x[ship.get('id')][dock.get('id')] / dock.get('length')
                                     for ship in unallocated_ships for dock in operative_docks)
        else:  # balanced
            # Enfoque equilibrado
            obj_function = pulp.lpSum(ship.get('priority', 1) * x[ship.get('id')][dock.get('id')] 
                                    for ship in unallocated_ships for dock in operative_docks) \
                         - 0.5 * pulp.lpSum(ship.get('length') * x[ship.get('id')][dock.get('id')] / dock.get('length')
                                         for ship in unallocated_ships for dock in operative_docks)
        
        model += obj_function
        
        # Restricciones
        
        # 1. Cada barco se asigna a lo sumo a un dique
        for ship in unallocated_ships:
            ship_id = ship.get('id')
            model += pulp.lpSum(x[ship_id][dock.get('id')] for dock in operative_docks) <= 1
        
        # 2. Restricciones de compatibilidad física
        for ship in unallocated_ships:
            ship_id = ship.get('id')
            ship_length = ship.get('length', 0)
            ship_draft = ship.get('draft', 0)
            ship_type = ship.get('type', '')
            
            for dock in operative_docks:
                dock_id = dock.get('id')
                dock_length = dock.get('length', 0)
                dock_depth = dock.get('depth', 0)
                dock_specializations = dock.get('specializations', [])
                
                # Si el barco es demasiado largo para el dique, no puede ser asignado
                if ship_length > dock_length:
                    model += x[ship_id][dock_id] == 0
                
                # Si el barco tiene más calado que el dique, no puede ser asignado
                if ship_draft > dock_depth:
                    model += x[ship_id][dock_id] == 0
                
                # Si el dique tiene especializaciones y el tipo de barco no está incluido, no puede ser asignado
                if dock_specializations and ship_type not in dock_specializations:
                    model += x[ship_id][dock_id] == 0
        
        # 3. RESTRICCIÓN CRÍTICA: Capacidad total de los diques (longitud) considerando asignaciones existentes
        for dock in operative_docks:
            dock_id = dock.get('id')
            dock_length = dock.get('length', 0)
            
            # Calcular espacio ocupado por asignaciones existentes que se superponen temporalmente
            occupied_length = 0
            for allocation in existing_allocations:
                if allocation.get('dockId') == dock_id:
                    # En un modelo simplificado, asumimos que todas las asignaciones se superponen
                    # En un modelo más complejo, deberíamos verificar superposición temporal
                    ship_in_allocation = next((s for s in ships if s.get('id') == allocation.get('shipId')), None)
                    if ship_in_allocation:
                        occupied_length += ship_in_allocation.get('length', 0)
            
            available_length = dock_length - occupied_length
            
            # La suma de las longitudes de los nuevos barcos asignados no debe exceder el espacio disponible
            model += pulp.lpSum(ship.get('length') * x[ship.get('id')][dock_id] for ship in unallocated_ships) <= available_length
            
            print(f"Dock {dock.get('name')}: Total={dock_length}m, Occupied={occupied_length}m, Available={available_length}m")
        
        # Resolver el modelo
        model.solve(pulp.PULP_CBC_CMD(msg=False))
        
        # Extraer resultados
        allocations = []
        unassigned_ships = []
        
        for ship in unallocated_ships:
            ship_id = ship.get('id')
            assigned = False
            
            for dock in operative_docks:
                dock_id = dock.get('id')
                if x[ship_id][dock_id].value() == 1:
                    # Barco asignado a este dique
                    allocations.append({
                        'id': f"alloc_{ship_id}_{dock_id}_{int(datetime.now().timestamp())}",
                        'shipId': ship_id,
                        'dockId': dock_id,
                        'startTime': ship.get('arrivalTime'),
                        'endTime': ship.get('departureTime'),
                        'created': datetime.now().isoformat(),
                        'status': 'scheduled'
                    })
                    assigned = True
                    print(f"Assigned ship {ship.get('name')} ({ship.get('length')}m) to dock {dock.get('name')}")
                    break
            
            if not assigned:
                unassigned_ships.append({
                    'ship': ship,
                    'reason': get_failure_reason(ship, operative_docks, weather_data)
                })
                print(f"Could not assign ship {ship.get('name')} ({ship.get('length')}m)")
        
        # Calcular métricas
        total_waiting_time = 0  # En un modelo real, esto se calcularía basado en tiempos de espera
        dock_utilization = sum(ship.get('length') for ship in unallocated_ships if ship.get('id') not in [u['ship']['id'] for u in unassigned_ships]) / sum(dock.get('length', 0) for dock in operative_docks) if operative_docks else 0
        
        return {
            'allocations': allocations,
            'metrics': {
                'totalWaitingTime': total_waiting_time,
                'dockUtilization': dock_utilization,
                'conflicts': 0
            },
            'weatherData': weather_data,
            'unassignedShips': unassigned_ships
        }
    
    except Exception as e:
        import traceback
        print(f"Error en el modelo de optimización: {str(e)}")
        traceback.print_exc()
        return {
            'error': str(e),
            'allocations': [],
            'metrics': {
                'totalWaitingTime': 0,
                'dockUtilization': 0,
                'conflicts': 0
            }
        }

def get_failure_reason(ship, docks, weather_data):
    """
    Determina la razón por la que un barco no pudo ser asignado
    """
    # Verificar condiciones climáticas
    min_tide_level = weather_data.get('settings', {}).get('minTideLevel', 3.0)
    max_wind_speed = weather_data.get('settings', {}).get('maxWindSpeed', 8.0)
    tide_level = weather_data.get('tide', {}).get('current', 0)
    wind_speed = weather_data.get('wind', {}).get('speed', 0)
    
    if tide_level < min_tide_level:
        return f"Nivel de marea insuficiente ({tide_level}m < {min_tide_level}m)"
    
    if wind_speed > max_wind_speed:
        return f"Velocidad del viento excesiva ({wind_speed} > {max_wind_speed} nudos)"
    
    # Verificar diques compatibles
    suitable_docks = [
        dock for dock in docks 
        if dock.get('length', 0) >= ship.get('length', 0) 
        and dock.get('depth', 0) >= ship.get('draft', 0) 
        and (not dock.get('specializations') or ship.get('type') in dock.get('specializations', []))
    ]
    
    if not suitable_docks:
        return f"No hay diques disponibles que cumplan con los requisitos (largo: {ship.get('length')}m, calado: {ship.get('draft')}m, tipo: {ship.get('type')})"
    
    # Verificar capacidad disponible
    for dock in suitable_docks:
        # Simplificado: verificar si el barco cabe en el dique
        if dock.get('length', 0) >= ship.get('length', 0):
            return "No hay espacio suficiente en los diques compatibles"
    
    # Default reason
    return "No se pudo asignar por restricciones operativas"
