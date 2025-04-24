
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult } from '@/types/types';
import { mockShips, mockDocks, mockAllocations } from '@/data/mockData';

// Mock Python model execution (in a real app, this would call a Python backend)
export const runAllocationModel = (params: PythonModelParams): Promise<PythonModelResult> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // This is where we would normally send the request to a Python backend
      // For this demo, we'll just simulate the result
      
      const allocations: Allocation[] = [];
      const ships = [...params.ships];
      const docks = [...params.docks].filter(d => !d.occupied);
      
      // Simple greedy algorithm to assign ships to docks
      ships.sort((a, b) => a.priority - b.priority || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
      
      for (const ship of ships) {
        // Find suitable dock
        const suitableDock = docks.find(dock => 
          dock.length >= ship.length && 
          dock.depth >= ship.draft && 
          (!dock.specializations || dock.specializations.includes(ship.type))
        );
        
        if (suitableDock) {
          // Remove dock from available docks
          const dockIndex = docks.findIndex(d => d.id === suitableDock.id);
          if (dockIndex >= 0) {
            docks.splice(dockIndex, 1);
          }
          
          // Create allocation
          allocations.push({
            id: Math.random().toString(36).substring(2, 9),
            shipId: ship.id,
            dockId: suitableDock.id,
            startTime: ship.arrivalTime,
            endTime: ship.departureTime,
            created: new Date().toISOString(),
            status: 'scheduled'
          });
        }
      }
      
      // Calculate some mock metrics
      const metrics = {
        totalWaitingTime: Math.floor(Math.random() * 120),
        dockUtilization: 0.7 + Math.random() * 0.2,
        conflicts: 0
      };
      
      resolve({
        allocations,
        metrics
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
    // Find if dock is allocated in any of the provided allocations
    const allocation = allocations.find(a => 
      a.dockId === dock.id && 
      a.status !== 'completed' && 
      new Date(a.endTime) > new Date()
    );
    
    if (allocation) {
      return {
        ...dock,
        occupied: true,
        occupiedBy: allocation.shipId,
        occupiedUntil: allocation.endTime
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
