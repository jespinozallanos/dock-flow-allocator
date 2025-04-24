
// Ships and Dock types
export type ShipType = 'container' | 'bulk' | 'tanker' | 'passenger';

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  length: number;
  draft: number;
  arrivalTime: string;
  departureTime: string;
  cargoType?: string;
  priority: number;
}

export interface Dock {
  id: string;
  name: string;
  length: number;
  depth: number;
  specializations?: ShipType[];
  occupied?: boolean;
  occupiedBy?: string;
  occupiedUntil?: string;
}

export interface Allocation {
  id: string;
  shipId: string;
  dockId: string;
  startTime: string;
  endTime: string;
  created: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

// Mock data for Python model simulation
export interface PythonModelParams {
  ships: Ship[];
  docks: Dock[];
  existingAllocations: Allocation[];
  optimizationCriteria: 'waiting_time' | 'dock_utilization' | 'balanced';
}

export interface PythonModelResult {
  allocations: Allocation[];
  metrics: {
    totalWaitingTime: number;
    dockUtilization: number;
    conflicts: number;
  };
}

export type TabOption = 'dashboard' | 'allocation' | 'ships' | 'docks' | 'history';
