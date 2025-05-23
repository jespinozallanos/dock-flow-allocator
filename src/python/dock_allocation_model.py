
# Dock Allocation Optimization Model
# Este modelo utiliza PuLP para resolver el problema de optimización de asignación de diques

from pulp import *
import json
import datetime
from typing import Dict, List, Any, Tuple

def parse_datetime(dt_string):
    """Convierte una cadena ISO a datetime"""
    return datetime.datetime.fromisoformat(dt_string.replace('Z', '+00:00'))

def convert_to_time_periods(start_time, end_time, period_length=1):
    """Convierte un rango de tiempo en periodos discretos"""
    start = parse_datetime(start_time)
    end = parse_datetime(end_time)
    periods = []
    current = start
    
    while current < end:
        periods.append(current.isoformat())
        current += datetime.timedelta(hours=period_length)
    
    return periods

def run_allocation_model(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ejecuta el modelo de optimización de asignación de diques
    
    Args:
        params: Diccionario con los parámetros del modelo
            - ships: Lista de barcos
            - docks: Lista de diques
            - existingAllocations: Asignaciones existentes
            - optimizationCriteria: Criterio de optimización
            - weatherSettings: Configuración del clima
            - weatherData: Datos actuales del clima
    
    Returns:
        Diccionario con los resultados del modelo
            - allocations: Lista de asignaciones
            - metrics: Métricas del modelo
            - unassignedShips: Barcos no asignados
    """
    # Extraer datos del modelo
    ships = params["ships"]
    docks = params["docks"]
    existing_allocations = params.get("existingAllocations", [])
    optimization_criteria = params.get("optimizationCriteria", "balanced")
    weather_data = params.get("weatherData", None)
    
    # Comprobar condiciones climáticas
    if weather_data:
        min_tide_level = params.get("weatherSettings", {}).get("minTideLevel", weather_data["tide"]["minimum"])
        max_wind_speed = params.get("weatherSettings", {}).get("maxWindSpeed", weather_data["wind"]["maximum"])
        
        # Verificar si las condiciones actuales son adecuadas
        current_tide = weather_data["tide"]["current"]
        current_wind = weather_data["wind"]["speed"]
        
        if current_tide < min_tide_level or current_wind > max_wind_speed:
            # Si las condiciones no son adecuadas, devolver sin asignaciones
            return {
                "allocations": [],
                "metrics": {
                    "totalWaitingTime": 0,
                    "dockUtilization": 0,
                    "conflicts": 0
                },
                "weatherWarning": True,
                "unassignedShips": [
                    {"ship": ship, "reason": get_ship_allocation_failure_reason(ship, docks, weather_data)}
                    for ship in ships
                ]
            }
    
    # Filtrar diques operativos
    operational_docks = [dock for dock in docks if dock["operationalStatus"] == "operativo"]
    
    # Crear el problema de optimización
    problem = LpProblem("DockAllocation", LpMaximize)
    
    # Crear variables de decisión
    # X_{s,d} = 1 si el barco s se asigna al dique d, 0 en caso contrario
    X = {}
    for ship in ships:
        for dock in operational_docks:
            # Comprobar compatibilidad física
            if is_compatible(ship, dock):
                ship_id = ship["id"]
                dock_id = dock["id"]
                X[(ship_id, dock_id)] = LpVariable(f"X_{ship_id}_{dock_id}", cat="Binary")
    
    # Función objetivo
    objective = LpAffineExpression()
    
    if optimization_criteria == "waiting_time":
        # Minimizar tiempo de espera (ponderado por prioridad)
        for ship in ships:
            for dock in operational_docks:
                if (ship["id"], dock["id"]) in X:
                    # Menor prioridad (valor numérico) = más importante
                    objective += -1 * ship["priority"] * X[(ship["id"], dock["id"])]
    
    elif optimization_criteria == "dock_utilization":
        # Maximizar uso de diques
        for ship in ships:
            for dock in operational_docks:
                if (ship["id"], dock["id"]) in X:
                    # Ponderado por largo del barco (utilización de espacio)
                    objective += ship["length"] * X[(ship["id"], dock["id"])]
    
    else:  # balanced
        # Enfoque balanceado
        for ship in ships:
            for dock in operational_docks:
                if (ship["id"], dock["id"]) in X:
                    # Combinar ambos criterios
                    objective += (ship["length"] * 0.5 - ship["priority"] * 0.5) * X[(ship["id"], dock["id"])]
    
    problem += objective
    
    # Restricciones
    
    # 1. Cada barco puede ser asignado a lo sumo a un dique
    for ship in ships:
        problem += lpSum([X.get((ship["id"], dock["id"]), 0) for dock in operational_docks]) <= 1, f"OneAssignment_{ship['id']}"
    
    # 2. Capacidad de cada dique (longitud total)
    for dock in operational_docks:
        # Obtener barcos ya asignados a este dique
        already_allocated = sum(
            next((s["length"] for s in ships if s["id"] == alloc["shipId"]), 0)
            for alloc in existing_allocations if alloc["dockId"] == dock["id"]
        )
        
        # Restricción de capacidad considerando barcos ya asignados
        problem += (
            lpSum([ship["length"] * X.get((ship["id"], dock["id"]), 0) for ship in ships]) 
            + already_allocated <= dock["length"]
        ), f"Capacity_{dock['id']}"
    
    # 3. Evitar asignar barcos ya asignados
    already_allocated_ships = set(alloc["shipId"] for alloc in existing_allocations)
    for ship_id in already_allocated_ships:
        for dock in operational_docks:
            ship_obj = next((s for s in ships if s["id"] == ship_id), None)
            if ship_obj and (ship_id, dock["id"]) in X:
                problem += X[(ship_id, dock["id"])] == 0, f"AlreadyAllocated_{ship_id}_{dock['id']}"
    
    # Resolver el problema
    problem.solve(PULP_CBC_CMD(msg=0))
    
    # Procesar resultados
    allocations = []
    allocated_ships = set()
    
    if problem.status == LpStatusOptimal:
        for ship in ships:
            for dock in operational_docks:
                if (ship["id"], dock["id"]) in X and value(X[(ship["id"], dock["id"])]) > 0.5:  # Asignado (binario)
                    allocations.append({
                        "id": f"alloc_{ship['id']}_{dock['id']}_{len(allocations)}",
                        "shipId": ship["id"],
                        "dockId": dock["id"],
                        "startTime": ship["arrivalTime"],
                        "endTime": ship["departureTime"],
                        "created": datetime.datetime.now().isoformat(),
                        "status": "scheduled"
                    })
                    allocated_ships.add(ship["id"])
    
    # Calcular métricas
    total_ships = len(ships)
    allocated_count = len(allocations)
    total_dock_length = sum(d["length"] for d in operational_docks)
    used_length = sum(
        next((s["length"] for s in ships if s["id"] == alloc["shipId"]), 0)
        for alloc in allocations
    )
    
    metrics = {
        "totalWaitingTime": 0,  # Esto requeriría simulación temporal
        "dockUtilization": used_length / total_dock_length if total_dock_length > 0 else 0,
        "conflicts": 0  # Conflictos de asignación
    }
    
    # Identificar barcos no asignados y razones
    unassigned_ships = []
    for ship in ships:
        if ship["id"] not in allocated_ships and ship["id"] not in already_allocated_ships:
            reason = get_ship_allocation_failure_reason(ship, docks, weather_data)
            unassigned_ships.append({"ship": ship, "reason": reason})
    
    return {
        "allocations": allocations,
        "metrics": metrics,
        "unassignedShips": unassigned_ships
    }

def is_compatible(ship, dock):
    """Verifica si un barco es compatible con un dique"""
    # Verificar dimensiones
    if ship["length"] > dock["length"] or ship["draft"] > dock["depth"]:
        return False
    
    # Verificar especialización
    if "specializations" in dock and dock["specializations"]:
        if ship["type"] not in dock["specializations"]:
            return False
    
    return True

def get_ship_allocation_failure_reason(ship, docks, weather_data=None):
    """Determina la razón por la que un barco no pudo ser asignado"""
    # Verificar condiciones climáticas
    if weather_data:
        min_tide_level = weather_data.get("settings", {}).get("minTideLevel", weather_data["tide"]["minimum"])
        max_wind_speed = weather_data.get("settings", {}).get("maxWindSpeed", weather_data["wind"]["maximum"])
        
        if weather_data["tide"]["current"] < min_tide_level:
            return f"Nivel de marea insuficiente ({weather_data['tide']['current']}m < {min_tide_level}m)"
        
        if weather_data["wind"]["speed"] > max_wind_speed:
            return f"Velocidad del viento excesiva ({weather_data['wind']['speed']} > {max_wind_speed} nudos)"
    
    # Verificar diques compatibles
    compatible_docks = [
        dock for dock in docks 
        if dock["operationalStatus"] == "operativo" and
        dock["length"] >= ship["length"] and 
        dock["depth"] >= ship["draft"] and 
        (not dock.get("specializations") or ship["type"] in dock["specializations"])
    ]
    
    if not compatible_docks:
        return f"No hay diques disponibles que cumplan con los requisitos (largo: {ship['length']}m, calado: {ship['draft']}m, tipo: {ship['type']})"
    
    if all(dock.get("occupied", False) for dock in compatible_docks):
        return "Todos los diques compatibles están ocupados"
    
    return "No se pudo asignar por restricciones operativas"
