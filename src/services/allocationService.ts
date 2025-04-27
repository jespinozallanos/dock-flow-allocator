import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData, TideWindow } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';

// Function to fetch real-time weather data for Talcahuano, Chile
export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // Using OpenWeatherMap API for Talcahuano, Chile
    // Coordinates for Talcahuano: -36.7247, -73.1169
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=d94f2a5a75a44bfb97830727231404&q=-36.7247,-73.1169&days=1&aqi=no&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error('Error fetching weather data');
    }
    
    const data = await response.json();
    
    // Convert from WeatherAPI format to our WeatherData format
    
    // Wind speed conversion from km/h to knots (1 km/h = 0.539957 knots)
    const windSpeed = data.current.wind_kph * 0.539957;
    
    // For tide simulation, we'll use a combination of weather data and time-based calculation
    // This is still a simulation as specialized marine APIs for tide data are typically paid
    const hour = new Date().getHours();
    // Base tide level of 3.5 meters with a variation of 0.8 meters based on time
    const tideLevel = 3.5 + Math.sin(hour / 24 * 2 * Math.PI) * 0.8;
    
    // Generate tide windows for the next 24 hours
    const tideWindows = generateTideWindows(3.0); // Minimum tide level now 3 meters
    
    return {
      location: `${data.location.name}, ${data.location.country}`,
      timestamp: new Date().toISOString(),
      tide: {
        current: parseFloat(tideLevel.toFixed(1)),
        unit: "metros",
        minimum: 3.0, // Updated minimum required tide for ship entry to 3 meters
        windows: tideWindows,
      },
      wind: {
        speed: parseFloat(windSpeed.toFixed(1)),
        direction: getWindDirection(data.current.wind_degree),
        unit: "nudos",
        maximum: 8.0, // Updated maximum allowed wind for ship entry to 8 knots
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
        minimum: 3.0, // Updated minimum required tide
        windows: generateTideWindows(3.0), 
      },
      wind: { speed: 5.0, direction: "N", unit: "nudos", maximum: 8.0 } // Updated maximum allowed wind
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
  // Tide must be above minimum (3m) and wind below maximum (8 knots)
  return weatherData.tide.current >= weatherData.tide.minimum && 
         weatherData.wind.speed <= weatherData.wind.maximum;
};

// Check if the operation time falls within a safe tide window
const isWithinSafeTideWindow = (
  startTime: string,
  endTime: string,
  weatherData: WeatherData
): boolean => {
  if (!weatherData.tide.windows || weatherData.tide.windows.length === 0) {
    // If no window data, fall back to current tide level check
    return weatherData.tide.current >= weatherData.tide.minimum;
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
  
  // Operation is safe if all overlapping windows have safe tide levels
  return overlappingWindows.length > 0 && 
         overlappingWindows.every(window => window.isSafe);
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
      
      const docksAllocation: Record<string, Array<{ship: Ship, allocation: Allocation}>> = {};
      docks.forEach(dock => docksAllocation[dock.id] = []);
      
      const allocatedShipIds = new Set<string>();
      
      ships.sort((a, b) => a.priority - b.priority || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
      
      for (const ship of ships) {
        // Skip if ship is already allocated
        if (allocatedShipIds.has(ship.id) || isShipAlreadyAllocated(ship, ship.arrivalTime, ship.departureTime, existingAllocations)) {
          continue;
        }
        
        // Check if the operation is within a safe tide window
        if (!isWithinSafeTideWindow(ship.arrivalTime, ship.departureTime, weatherData)) {
          console.log(`Ship ${ship.name} operation outside safe tide window`);
          continue;
        }

        // Ensure we're using the ship's scheduled times
        const proposedStartTime = ship.arrivalTime;
        const proposedEndTime = ship.departureTime;
        
        // Verify allocation time is valid
        if (!isAllocationTimeValid(ship, proposedStartTime, proposedEndTime)) {
          console.log(`Ship ${ship.name} cannot be allocated for less than scheduled time`);
          continue;
        }
        
        // Find suitable docks
        const suitableDocks = docks.filter(dock => 
          dock.length >= ship.length && 
          dock.depth >= ship.draft && 
          (!dock.specializations || dock.specializations.includes(ship.type))
        );
        
        for (const dock of suitableDocks) {
          if (hasAvailableSpace(dock, ship, docksAllocation[dock.id])) {
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
            break;
          }
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
