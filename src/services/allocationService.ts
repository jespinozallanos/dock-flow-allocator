import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData, TideWindow } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';
import { runPythonAllocationModel } from '@/services/pythonModelService';

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

// Modelo de asignación usando SOLO el modelo Python
export const runAllocationModel = async (params: PythonModelParams): Promise<PythonModelResult> => {
  console.log("🎯 INICIANDO MODELO DE ASIGNACIÓN");
  console.log("📊 Parámetros recibidos:", params);
  
  // Get weather data
  const weatherData = await fetchWeatherData();
  console.log("🌤️ Datos meteorológicos obtenidos:", weatherData);
  
  // Ensure we properly set the weather data settings before running the model
  if (params.weatherSettings) {
    weatherData.settings = {
      maxWindSpeed: params.weatherSettings.maxWindSpeed,
      minTideLevel: params.weatherSettings.minTideLevel
    };
    console.log("⚙️ Configuración meteorológica actualizada:", weatherData.settings);
  }
  
  try {
    console.log("🐍 Llamando al modelo Python...");
    const result = await runPythonAllocationModel(params, weatherData);
    console.log("✅ Resultado obtenido del modelo Python:", result);
    return result;
  } catch (error) {
    console.error("❌ Error ejecutando modelo Python:", error);
    
    // Proporcionar error más específico
    const errorMessage = `FALLO EN CONEXIÓN CON SERVIDOR PYTHON

El modelo de optimización requiere que el servidor Python esté ejecutándose.

PASOS PARA SOLUCIONAR:
1. Abre una terminal
2. Navega a la carpeta del proyecto: cd src/python/
3. Instala dependencias: pip install -r requirements.txt
4. Ejecuta el servidor: python api.py
5. Verifica que aparezca: "Running on http://127.0.0.1:5000"
6. Deja el servidor corriendo y vuelve a intentar

Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    
    throw new Error(errorMessage);
  }
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
