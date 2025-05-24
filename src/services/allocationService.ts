import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData, TideWindow } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';
import { runPythonAllocationModel, testPythonApiConnection } from '@/services/pythonModelService';

// Function to fetch real-time weather data for Talcahuano, Chile
export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // Using Open Meteo API for Talcahuano, Chile
    // Coordinates for Talcahuano: -36.7247, -73.1169
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=-36.7247&longitude=-73.1169&current=temperature_2m,wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&timezone=America/Santiago`
    );
    
    if (!response.ok) {
      throw new Error('Error fetching weather data');
    }
    
    const data = await response.json();
    
    // Convert wind speed from m/s to knots (1 m/s = 1.94384 knots)
    const windSpeed = data.current.wind_speed_10m * 1.94384;
    
    // For tide simulation, we'll use a combination of time-based calculation
    const hour = new Date().getHours();
    // Base tide level of 3.5 meters with a variation of 0.8 meters based on time
    const tideLevel = 3.5 + Math.sin(hour / 24 * 2 * Math.PI) * 0.8;
    
    // Generate tide windows for the next 24 hours
    const tideWindows = generateTideWindows(3.0);
    
    return {
      location: "Talcahuano, Chile",
      timestamp: new Date().toISOString(),
      tide: {
        current: parseFloat(tideLevel.toFixed(1)),
        unit: "metros",
        minimum: 3.0,
        windows: tideWindows,
      },
      wind: {
        speed: parseFloat(windSpeed.toFixed(1)),
        direction: getWindDirection(data.current.wind_direction_10m),
        unit: "nudos",
        maximum: 8.0,
      },
      settings: {
        maxWindSpeed: 8.0,
        minTideLevel: 3.0
      }
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Return default values if API call fails
    return {
      location: "Talcahuano, Chile",
      timestamp: new Date().toISOString(),
      tide: { 
        current: 3.5, 
        unit: "metros", 
        minimum: 3.0,
        windows: generateTideWindows(3.0), 
      },
      wind: { speed: 5.0, direction: "N", unit: "nudos", maximum: 8.0 },
      settings: {
        maxWindSpeed: 8.0,
        minTideLevel: 3.0
      }
    };
  }
};

// Helper function to get wind direction from degrees
const getWindDirection = (degrees: number): string => {
  if (degrees > 337.5 || degrees <= 22.5) return "N";
  if (degrees > 22.5 && degrees <= 67.5) return "NE";
  if (degrees > 67.5 && degrees <= 112.5) return "E";
  if (degrees > 112.5 && degrees <= 157.5) return "SE";
  if (degrees > 157.5 && degrees <= 202.5) return "S";
  if (degrees > 202.5 && degrees <= 247.5) return "SW";
  if (degrees > 247.5 && degrees <= 292.5) return "W";
  return "NW";
};

// Generate simulated tide windows for the next 24 hours
const generateTideWindows = (minimumTideLevel: number): TideWindow[] => {
  const windows: TideWindow[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  
  // Generate windows for the next 24 hours in 2-hour intervals
  for (let i = 0; i < 12; i++) {
    const startTime = new Date(now);
    startTime.setHours(now.getHours() + i * 2);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);
    
    // Calculate tide level using a sinusoidal pattern
    // High tides at around 6AM and 6PM, low tides at 12PM and 12AM
    const hour = startTime.getHours();
    const tideLevel = 3.5 + Math.sin((hour + 6) / 12 * Math.PI) * 0.8;
    
    // Consider tide safe if above minimum tide level (now 3.0 meters)
    const isSafe = tideLevel >= minimumTideLevel;
    
    windows.push({
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      level: parseFloat(tideLevel.toFixed(1)),
      isSafe
    });
  }
  
  return windows;
};

// Check if weather conditions allow dock entry
const isWeatherSuitable = (weatherData: WeatherData): boolean => {
  // CRITICAL FIX: Always use settings from weatherData if available
  const maxWindSpeed = weatherData.settings?.maxWindSpeed || weatherData.wind.maximum;
  const minTideLevel = weatherData.settings?.minTideLevel || weatherData.tide.minimum;
  
  // Tide must be above minimum and wind below maximum
  return weatherData.tide.current >= minTideLevel && 
         weatherData.wind.speed <= maxWindSpeed;
};

// Check if the operation time falls within a safe tide window
const isWithinSafeTideWindow = (
  startTime: string,
  endTime: string,
  weatherData: WeatherData
): boolean => {
  // CRITICAL FIX: Use the settings values from weatherData
  const minTideLevel = weatherData.settings?.minTideLevel || weatherData.tide.minimum;
  
  if (!weatherData.tide.windows || weatherData.tide.windows.length === 0) {
    // If no window data, fall back to current tide level check
    return weatherData.tide.current >= minTideLevel;
  }
  
  const operationStart = new Date(startTime).getTime();
  const operationEnd = new Date(endTime).getTime();
  
  // Find all tide windows that overlap with the operation time
  const overlappingWindows = weatherData.tide.windows.filter(window => {
    const windowStart = new Date(window.start).getTime();
    const windowEnd = new Date(window.end).getTime();
    
    // Check if there's an overlap between operation time and tide window
    return (
      (operationStart <= windowEnd && operationEnd >= windowStart)
    );
  });

  // Recalculate isSafe based on the current settings
  const safeWindows = overlappingWindows.map(window => ({
    ...window,
    isSafe: window.level >= minTideLevel
  }));
  
  // Operation is safe if all overlapping windows have safe tide levels
  return safeWindows.length > 0 && 
         safeWindows.every(window => window.isSafe);
};

// Check if dock space allows for the ship (considering other ships already in dock)
const hasAvailableSpace = (
  dock: Dock, 
  ship: Ship, 
  allocatedShips: Array<{ship: Ship, allocation: Allocation}>,
  proposedStartTime: string,
  proposedEndTime: string,
  existingAllocations: Allocation[]
): boolean => {
  // If dock is not operational, it can't hold ships
  if (dock.operationalStatus !== 'operativo') return false;
  
  const proposedStart = new Date(proposedStartTime).getTime();
  const proposedEnd = new Date(proposedEndTime).getTime();
  
  // Find all ships that will be in this dock during the proposed time period
  const overlappingAllocations = existingAllocations.filter(allocation => {
    if (allocation.dockId !== dock.id) return false;
    
    const allocStart = new Date(allocation.startTime).getTime();
    const allocEnd = new Date(allocation.endTime).getTime();
    
    // Check if there's time overlap
    return (proposedStart < allocEnd && proposedEnd > allocStart);
  });
  
  // Calculate total length of ships that will overlap with this proposed allocation
  let totalOverlapLength = 0;
  for (const allocation of overlappingAllocations) {
    const overlappingShip = mockShips.find(s => s.id === allocation.shipId);
    if (overlappingShip) {
      totalOverlapLength += overlappingShip.length;
    }
  }
  
  // Add ships from current allocation session that are not yet in existingAllocations
  for (const allocatedItem of allocatedShips) {
    if (allocatedItem.allocation.dockId === dock.id) {
      const allocStart = new Date(allocatedItem.allocation.startTime).getTime();
      const allocEnd = new Date(allocatedItem.allocation.endTime).getTime();
      
      // Check if there's time overlap
      if (proposedStart < allocEnd && proposedEnd > allocStart) {
        totalOverlapLength += allocatedItem.ship.length;
      }
    }
  }
  
  // Check if adding this ship would exceed dock length
  const availableSpace = dock.length - totalOverlapLength;
  
  console.log(`Dock ${dock.name}: Available space = ${availableSpace}m, Ship ${ship.name} needs = ${ship.length}m`);
  
  return ship.length <= availableSpace;
};

// Check if ship is already allocated in the provided time period
const isShipAlreadyAllocated = (
  ship: Ship,
  startTime: string,
  endTime: string,
  existingAllocations: Allocation[]
): boolean => {
  const newStartTime = new Date(startTime).getTime();
  const newEndTime = new Date(endTime).getTime();
  
  // Find allocations for this ship
  const shipAllocations = existingAllocations.filter(a => a.shipId === ship.id);
  
  // Check for time overlap
  return shipAllocations.some(allocation => {
    const existingStartTime = new Date(allocation.startTime).getTime();
    const existingEndTime = new Date(allocation.endTime).getTime();
    
    // Check if there's an overlap in time periods
    return (
      (newStartTime <= existingEndTime && newEndTime >= existingStartTime) ||
      (existingStartTime <= newEndTime && existingEndTime >= newStartTime)
    );
  });
};

// Check if allocated time matches or exceeds required time
const isAllocationTimeValid = (
  ship: Ship,
  startTime: string,
  endTime: string
): boolean => {
  const requiredDuration = new Date(ship.departureTime).getTime() - new Date(ship.arrivalTime).getTime();
  const allocatedDuration = new Date(endTime).getTime() - new Date(startTime).getTime();
  
  return allocatedDuration >= requiredDuration;
};

// Get allocation failure reason for a ship
const getShipAllocationFailureReason = (
  ship: Ship,
  docks: Dock[],
  weatherData: WeatherData,
  startTime: string,
  endTime: string
): string => {
  // CRITICAL FIX: Always use the settings from weatherData
  const maxWindSpeed = weatherData.settings?.maxWindSpeed || weatherData.wind.maximum;
  const minTideLevel = weatherData.settings?.minTideLevel || weatherData.tide.minimum;
  
  if (weatherData.tide.current < minTideLevel) {
    return `Nivel de marea insuficiente (${weatherData.tide.current}m < ${minTideLevel}m)`;
  }
  
  if (weatherData.wind.speed > maxWindSpeed) {
    return `Velocidad del viento excesiva (${weatherData.wind.speed} > ${maxWindSpeed} nudos)`;
  }
  
  // Check if within safe tide window using updated settings
  if (!isWithinSafeTideWindow(startTime, endTime, weatherData)) {
    return "No hay ventana de marea segura disponible para la operación";
  }
  
  // Check available docks
  const suitableDocks = docks.filter(dock => 
    dock.length >= ship.length && 
    dock.depth >= ship.draft && 
    (!dock.specializations || dock.specializations.includes(ship.type))
  );
  
  if (suitableDocks.length === 0) {
    return `No hay diques disponibles que cumplan con los requisitos (largo: ${ship.length}m, calado: ${ship.draft}m, tipo: ${ship.type})`;
  }
  
  if (suitableDocks.every(dock => dock.occupied)) {
    return "Todos los diques compatibles están ocupados";
  }
  
  return "No se pudo asignar por restricciones operativas";
};

// Mock Python model execution (in a real app, this would call a Python backend)
export const runAllocationModel = async (params: PythonModelParams): Promise<PythonModelResult> => {
  // Get weather data
  const weatherData = await fetchWeatherData();
  
  // CRITICAL FIX: Ensure we properly set the weather data settings before running the model
  if (params.weatherSettings) {
    weatherData.settings = {
      maxWindSpeed: params.weatherSettings.maxWindSpeed,
      minTideLevel: params.weatherSettings.minTideLevel
    };
  }
  
  // Si la API Python está disponible, usar el modelo matemático
  if (isPythonApiAvailable) {
    try {
      console.log("Usando modelo matemático Python");
      return await runPythonAllocationModel(params, weatherData);
    } catch (error) {
      console.error("Error con la API Python. Se usará el modelo de simulación:", error);
      // Si hay error, usar el modelo de simulación como fallback
      return runSimulationModel(params, weatherData);
    }
  } else {
    console.log("Usando modelo de simulación JavaScript");
    // Si la API Python no está disponible, usar el modelo de simulación
    return runSimulationModel(params, weatherData);
  }
};

// Modelo de simulación JavaScript (código existente)
const runSimulationModel = async (params: PythonModelParams, weatherData: WeatherData): Promise<PythonModelResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allocations: Allocation[] = [];
      const ships = [...params.ships];
      const docks = [...params.docks].filter(d => d.operationalStatus === 'operativo');
      const existingAllocations = [...params.existingAllocations];
      const unassignedShips: Array<{ship: Ship, reason: string}> = [];
      
      // Weather status check - CRITICAL FIX: Always use the settings from weatherData
      const maxWindSpeed = weatherData.settings?.maxWindSpeed || weatherData.wind.maximum;
      const minTideLevel = weatherData.settings?.minTideLevel || weatherData.tide.minimum;
      
      // Update the condition check to use the correct settings
      const weatherSuitable = weatherData.tide.current >= minTideLevel && 
                             weatherData.wind.speed <= maxWindSpeed;
      
      if (!weatherSuitable) {
        // Add all ships to unassigned with weather reason
        ships.forEach(ship => {
          unassignedShips.push({
            ship,
            reason: getShipAllocationFailureReason(ship, docks, weatherData, ship.arrivalTime, ship.departureTime)
          });
        });
        
        resolve({
          allocations: [],
          metrics: {
            totalWaitingTime: 0,
            dockUtilization: 0,
            conflicts: 0
          },
          weatherData,
          weatherWarning: true,
          unassignedShips
        });
        return;
      }
      
      const docksAllocation: Record<string, Array<{ship: Ship, allocation: Allocation}>> = {};
      docks.forEach(dock => docksAllocation[dock.id] = []);
      
      const allocatedShipIds = new Set<string>();
      
      ships.sort((a, b) => a.priority - b.priority || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
      
      for (const ship of ships) {
        // Skip if ship is already allocated
        if (allocatedShipIds.has(ship.id) || isShipAlreadyAllocated(ship, ship.arrivalTime, ship.departureTime, existingAllocations)) {
          continue;
        }
        
        // Check if the operation is within a safe tide window, using the updated settings
        if (!isWithinSafeTideWindow(ship.arrivalTime, ship.departureTime, weatherData)) {
          unassignedShips.push({
            ship,
            reason: getShipAllocationFailureReason(ship, docks, weatherData, ship.arrivalTime, ship.departureTime)
          });
          continue;
        }

        // Ensure we're using the ship's scheduled times
        const proposedStartTime = ship.arrivalTime;
        const proposedEndTime = ship.departureTime;
        
        // Verify allocation time is valid
        if (!isAllocationTimeValid(ship, proposedStartTime, proposedEndTime)) {
          unassignedShips.push({
            ship,
            reason: "Tiempo de asignación inválido"
          });
          continue;
        }
        
        // Find suitable docks
        const suitableDocks = docks.filter(dock => 
          dock.length >= ship.length && 
          dock.depth >= ship.draft && 
          (!dock.specializations || dock.specializations.includes(ship.type))
        );
        
        let allocated = false;
        for (const dock of suitableDocks) {
          if (hasAvailableSpace(dock, ship, docksAllocation[dock.id], proposedStartTime, proposedEndTime, existingAllocations)) {
            const newAllocation = {
              id: Math.random().toString(36).substring(2, 9),
              shipId: ship.id,
              dockId: dock.id,
              startTime: proposedStartTime,
              endTime: proposedEndTime,
              created: new Date().toISOString(),
              status: 'scheduled' as const
            };
            
            allocations.push(newAllocation);
            docksAllocation[dock.id].push({ ship, allocation: newAllocation });
            allocatedShipIds.add(ship.id);
            allocated = true;
            
            console.log(`Assigned ship ${ship.name} (${ship.length}m) to dock ${dock.name}`);
            break;
          }
        }
        
        if (!allocated) {
          const reason = suitableDocks.length === 0 ? 
            `No hay diques disponibles que cumplan con los requisitos (largo: ${ship.length}m, calado: ${ship.draft}m, tipo: ${ship.type})` :
            `No hay espacio suficiente en los diques compatibles`;
          
          unassignedShips.push({
            ship,
            reason
          });
          
          console.log(`Could not assign ship ${ship.name} (${ship.length}m): ${reason}`);
        }
      }
      
      const metrics = {
        totalWaitingTime: Math.floor(Math.random() * 120),
        dockUtilization: 0.7 + Math.random() * 0.2,
        conflicts: 0
      };
      
      resolve({
        allocations,
        metrics,
        weatherData,
        unassignedShips
      });
    }, 1500);
  });
};

// Get all ships
export const getShips = (): Promise<Ship[]> => {
  return Promise.resolve([...mockShips]);
};

// Get all docks
export const getDocks = (): Promise<Dock[]> => {
  return Promise.resolve([...mockDocks]);
};

// Get all allocations
export const getAllocations = (): Promise<Allocation[]> => {
  return Promise.resolve([...mockAllocations]);
};

// Add a new ship
export const addShip = (ship: Omit<Ship, 'id'>): Promise<Ship> => {
  // Create a new ship with ID but preserve all other properties exactly as provided
  const newShip = { 
    ...ship, 
    id: Math.random().toString(36).substring(2, 9)
  };
  
  // Add the new ship to the mockShips array
  mockShips.push(newShip);
  
  // Return a promise that resolves to the new ship
  return Promise.resolve(newShip);
};

// Update dock status based on allocations
export const updateDockStatus = (allocations: Allocation[]): Promise<Dock[]> => {
  const updatedDocks = [...mockDocks].map(dock => {
    // Find all current allocations for this dock
    const dockAllocations = allocations.filter(a => 
      a.dockId === dock.id && 
      a.status !== 'completed' && 
      new Date(a.endTime) > new Date()
    );
    
    if (dockAllocations.length > 0) {
      // Find the latest end time among all allocations
      const latestEndTime = dockAllocations.reduce((latest, a) => {
        const endTime = new Date(a.endTime);
        return endTime > latest ? endTime : latest;
      }, new Date(0)).toISOString();
      
      return {
        ...dock,
        occupied: true,
        occupiedBy: dockAllocations.map(a => a.shipId).join(','),
        occupiedUntil: latestEndTime
      };
    }
    
    return {
      ...dock,
      occupied: false,
      occupiedBy: undefined,
      occupiedUntil: undefined
    };
  });
  
  return Promise.resolve(updatedDocks);
};

// Variable para rastrear si la API Python está disponible
let isPythonApiAvailable = false;

// Comprobar al inicio si la API Python está disponible
testPythonApiConnection().then(available => {
  isPythonApiAvailable = available;
  console.log(`API Python ${available ? 'disponible' : 'no disponible'}. ${available ? 'Se usará el modelo matemático de optimización.' : 'Se usará el modelo de simulación.'}`);
});
