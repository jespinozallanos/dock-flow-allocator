
// Ships and Dock types
export type ShipType = 'container' | 'bulk' | 'tanker' | 'passenger';
export type OperationalStatus = 'operativo' | 'mantenimiento' | 'fuera-de-servicio';

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
  width?: number; // Added width parameter
  specializations?: ShipType[];
  occupied?: boolean;
  occupiedBy?: string;
  occupiedUntil?: string;
  operationalStatus: OperationalStatus;
  maxWindSpeed: number; // Maximum wind speed in knots
  minTideLevel: number; // Minimum tide level in meters
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

// Weather data structure
export interface WeatherData {
  location: string;
  timestamp: string;
  tide: {
    current: number;
    unit: string;
    minimum: number;
    // Tide window forecasting
    windows?: TideWindow[];
  };
  wind: {
    speed: number;
    direction: string;
    unit: string;
    maximum: number;
  };
}

// New tide window interface for safe operation periods
export interface TideWindow {
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
  level: number; // Tide level in meters
  isSafe: boolean; // Whether the tide level is safe for operations
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
  weatherData?: WeatherData;
  weatherWarning?: boolean;
}

export type TabOption = 'dashboard' | 'allocation' | 'ships' | 'docks' | 'history';

// Timeline view options
export type TimelineViewMode = 'week' | 'month';
