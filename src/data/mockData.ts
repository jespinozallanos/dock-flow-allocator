import { Ship, Dock, Allocation } from '@/types/types';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to generate dates within a range
const generateDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Mock current date for the application
export const CURRENT_DATE = new Date().toISOString();

// Mock ships with Spanish descriptions
export const mockShips: Ship[] = [
  {
    id: "s1",
    name: "Atlantic Explorer",
    type: "container",
    length: 300,
    draft: 14.5,
    arrivalTime: generateDate(new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 48 * 60 * 60 * 1000), new Date(Date.now() + 72 * 60 * 60 * 1000)),
    cargoType: "Contenedores",
    priority: 2
  },
  {
    id: "s2",
    name: "Pacific Voyager",
    type: "bulk",
    length: 250,
    draft: 12,
    arrivalTime: generateDate(new Date(), new Date(Date.now() + 12 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 36 * 60 * 60 * 1000), new Date(Date.now() + 48 * 60 * 60 * 1000)),
    cargoType: "Grano",
    priority: 3
  },
  {
    id: "s3",
    name: "Nordic Queen",
    type: "passenger",
    length: 330,
    draft: 8.2,
    arrivalTime: generateDate(new Date(Date.now() + 24 * 60 * 60 * 1000), new Date(Date.now() + 48 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 72 * 60 * 60 * 1000), new Date(Date.now() + 96 * 60 * 60 * 1000)),
    priority: 1
  },
  {
    id: "s4",
    name: "Gulf Carrier",
    type: "tanker",
    length: 280,
    draft: 15,
    arrivalTime: generateDate(new Date(Date.now() + 6 * 60 * 60 * 1000), new Date(Date.now() + 12 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 24 * 60 * 60 * 1000), new Date(Date.now() + 36 * 60 * 60 * 1000)),
    cargoType: "Crudo",
    priority: 2
  },
  {
    id: "s5",
    name: "East Wind",
    type: "container",
    length: 320,
    draft: 13.8,
    arrivalTime: generateDate(new Date(Date.now() + 12 * 60 * 60 * 1000), new Date(Date.now() + 24 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 48 * 60 * 60 * 1000), new Date(Date.now() + 72 * 60 * 60 * 1000)),
    cargoType: "Productos Manufacturados",
    priority: 2
  }
];

// Updated mock docks with real names and operational conditions
export const mockDocks: Dock[] = [
  {
    id: "d1",
    name: "Mery",
    length: 350,
    depth: 15,
    specializations: ["container", "bulk"],
    occupied: false,
    operationalStatus: "operativo",
    maxWindSpeed: 25, // nudos
    minTideLevel: 2.5, // metros
  },
  {
    id: "d2",
    name: "Gutierrez",
    length: 300,
    depth: 14,
    specializations: ["container", "bulk"],
    occupied: false,
    operationalStatus: "operativo",
    maxWindSpeed: 20,
    minTideLevel: 2.0,
  },
  {
    id: "d3",
    name: "DS1",
    length: 400,
    depth: 16,
    specializations: ["container", "tanker"],
    occupied: false,
    operationalStatus: "mantenimiento",
    maxWindSpeed: 30,
    minTideLevel: 3.0,
  },
  {
    id: "d4",
    name: "DS2",
    length: 350,
    depth: 10,
    specializations: ["passenger", "bulk"],
    occupied: false,
    operationalStatus: "operativo",
    maxWindSpeed: 22,
    minTideLevel: 2.2,
  },
  {
    id: "d5",
    name: "Talcahuano",
    length: 320,
    depth: 15,
    specializations: ["bulk", "tanker"],
    occupied: false,
    operationalStatus: "operativo",
    maxWindSpeed: 28,
    minTideLevel: 2.8,
  }
];

// Mock allocations
export const mockAllocations: Allocation[] = [
  {
    id: generateId(),
    shipId: "s1",
    dockId: "d1",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    created: new Date().toISOString(),
    status: "scheduled"
  },
  {
    id: generateId(),
    shipId: "s2",
    dockId: "d2",
    startTime: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
    created: new Date().toISOString(),
    status: "scheduled"
  }
];
