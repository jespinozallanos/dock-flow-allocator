import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';

// Function to fetch real-time weather data for Talcahuano, Chile
export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // Using OpenWeatherMap API for Talcahuano, Chile
    // Coordinates for Talcahuano: -36.7247, -73.1169
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=-36.7247&lon=-73.1169&appid=YOUR_API_KEY_HERE&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Error fetching weather data');
    }
    
    const data = await response.json();
    
    // Convert from OpenWeatherMap format to our WeatherData format
    // Note: This is a simplified conversion as OpenWeatherMap doesn't provide tide data
    // For tide data in real implementation, you would need a specialized marine weather API
    
    // Wind speed conversion from m/s to knots (1 m/s = 1.94384 knots)
    const windSpeed = data.wind.speed * 1.94384;
    
    // For tide simulation, we'll use a sinusoidal function based on the current hour
    // This is just for simulation - in production, use a real tide API
    const hour = new Date().getHours();
    const tideLevel = 7.0 + Math.sin(hour / 24 * 2 * Math.PI) * 1.2;
    
    return {
      location: "Talcahuano, Chile",
      timestamp: new Date().toISOString(),
      tide: {
        current: parseFloat(tideLevel.toFixed(1)),
        unit: "metros",
        minimum: 7.0, // Minimum required tide for ship entry
      },
      wind: {
        speed: parseFloat(windSpeed.toFixed(1)),
        direction: data.wind.deg > 337.5 || data.wind.deg <= 22.5 ? "N" :
                  data.wind.deg > 22.5 && data.wind.deg <= 67.5 ? "NE" :
                  data.wind.deg > 67.5 && data.wind.deg <= 112.5 ? "E" :
                  data.wind.deg > 112.5 && data.wind.deg <= 157.5 ? "SE" :
                  data.wind.deg > 157.5 && data.wind.deg <= 202.5 ? "S" :
                  data.wind.deg > 202.5 && data.wind.deg <= 247.5 ? "SW" :
                  data.wind.deg > 247.5 && data.wind.deg <= 292.5 ? "W" : "NW",
        unit: "nudos",
        maximum: 15, // Maximum allowed wind for ship entry
      }
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Return default values if API call fails
    return {
      location: "Talcahuano, Chile",
      timestamp: new Date().toISOString(),
      tide: { current: 8.0, unit: "metros", minimum: 7.0 },
      wind: { speed: 10.0, direction: "N", unit: "nudos", maximum: 15 }
    };
  }
};

// Check if weather conditions allow dock entry
const isWeatherSuitable = (weatherData: WeatherData): boolean => {
  // Tide must be above minimum (7m) and wind below maximum (15 knots)
  return weatherData.tide.current >= weatherData.tide.minimum && 
         weatherData.wind.speed <= weatherData.wind.maximum;
};

// Check if dock space allows for the ship (considering other ships already in dock)
const hasAvailableSpace = (
  dock: Dock, 
  ship: Ship, 
  allocatedShips: Array<{ship: Ship, allocation: Allocation}>
): boolean => {
  // If dock is not operational, it can't hold ships
  if (dock.operationalStatus !== 'operativo') return false;
  
  // Calculate total length of ships already allocated to this dock at the same time
  const totalLengthAllocated = allocatedShips.reduce((total, item) => total + item.ship.length, 0);
  
  // Check if adding this ship would exceed dock length
  return (totalLengthAllocated + ship.length) <= dock.length;
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

// Mock Python model execution (in a real app, this would call a Python backend)
export const runAllocationModel = async (params: PythonModelParams): Promise<PythonModelResult> => {
  // Get weather data
  const weatherData = await fetchWeatherData();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const allocations: Allocation[] = [];
      const ships = [...params.ships];
      const docks = [...params.docks].filter(d => d.operationalStatus === 'operativo');
      const existingAllocations = [...params.existingAllocations];
      
      // Weather status check
      const weatherSuitable = isWeatherSuitable(weatherData);
      
      if (!weatherSuitable) {
        resolve({
          allocations: [],
          metrics: {
            totalWaitingTime: 0,
            dockUtilization: 0,
            conflicts: 0
          },
          weatherData,
          weatherWarning: true
        });
        return;
      }
      
      // Maps to track allocated ships per dock and their timing
      const docksAllocation: Record<string, Array<{ship: Ship, allocation: Allocation}>> = {};
      docks.forEach(dock => docksAllocation[dock.id] = []);
      
      // Track allocated ships to prevent the same ship from being allocated multiple times
      const allocatedShipIds = new Set<string>();
      
      // Sort ships by priority first, then by arrival time
      ships.sort((a, b) => a.priority - b.priority || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
      
      // For each ship, try to find a suitable dock
      for (const ship of ships) {
        // Skip if the ship is already allocated in any existing allocations
        if (allocatedShipIds.has(ship.id) || isShipAlreadyAllocated(ship, ship.arrivalTime, ship.departureTime, existingAllocations)) {
          continue;
        }
        
        // Find docks that can handle this ship type and dimensions
        const suitableDocks = docks.filter(dock => 
          dock.length >= ship.length && 
          dock.depth >= ship.draft && 
          (!dock.specializations || dock.specializations.includes(ship.type))
        );
        
        // Find a dock with available space
        for (const dock of suitableDocks) {
          if (hasAvailableSpace(dock, ship, docksAllocation[dock.id])) {
            // Create allocation
            const newAllocation = {
              id: Math.random().toString(36).substring(2, 9),
              shipId: ship.id,
              dockId: dock.id,
              startTime: ship.arrivalTime,
              endTime: ship.departureTime,
              created: new Date().toISOString(),
              status: 'scheduled' as const
            };
            
            allocations.push(newAllocation);
            docksAllocation[dock.id].push({ ship, allocation: newAllocation });
            
            // Mark this ship as allocated
            allocatedShipIds.add(ship.id);
            break;
          }
        }
      }
      
      // Calculate metrics
      const metrics = {
        totalWaitingTime: Math.floor(Math.random() * 120),
        dockUtilization: 0.7 + Math.random() * 0.2,
        conflicts: 0
      };
      
      resolve({
        allocations,
        metrics,
        weatherData
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
  const newShip = { ...ship, id: Math.random().toString(36).substring(2, 9) };
  mockShips.push(newShip);
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
