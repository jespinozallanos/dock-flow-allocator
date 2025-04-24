
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';

// Function to fetch real-time weather data for Talcahuano, Chile
export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    // In a real app, this would call a weather API for Talcahuano
    // For this demo, we'll simulate the result
    
    // Simulate network request with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return simulated weather data
    return {
      location: "Talcahuano, Chile",
      timestamp: new Date().toISOString(),
      tide: {
        current: 7.2 + (Math.random() * 2 - 1), // Random between 6.2 and 8.2 meters
        unit: "metros",
        minimum: 7.0, // Minimum required tide for ship entry
      },
      wind: {
        speed: 8 + (Math.random() * 14), // Random between 8 and 22 knots
        direction: "NW",
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

// Mock Python model execution (in a real app, this would call a Python backend)
export const runAllocationModel = async (params: PythonModelParams): Promise<PythonModelResult> => {
  // Get weather data
  const weatherData = await fetchWeatherData();
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // This is where we would normally send the request to a Python backend
      // For this demo, we'll just simulate the result
      
      const allocations: Allocation[] = [];
      const ships = [...params.ships];
      const docks = [...params.docks].filter(d => d.operationalStatus === 'operativo');
      
      // Weather status check
      const weatherSuitable = isWeatherSuitable(weatherData);
      
      // If weather conditions are unsuitable, return with a weather warning
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
      
      // Sort ships by priority first, then by arrival time
      ships.sort((a, b) => a.priority - b.priority || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
      
      // For each ship, try to find a suitable dock
      for (const ship of ships) {
        // Skip if the ship is already allocated
        if (allocations.some(a => a.shipId === ship.id)) continue;
        
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
