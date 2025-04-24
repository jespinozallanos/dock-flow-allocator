
import { Ship, Dock, Allocation } from '@/types/types';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to generate dates within a range
const generateDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Mock current date for the application
export const CURRENT_DATE = new Date().toISOString();

// Mock ships
export const mockShips: Ship[] = [
  {
    id: "s1",
    name: "Atlantic Explorer",
    type: "container",
    length: 300,
    draft: 14.5,
    arrivalTime: generateDate(new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)),
    departureTime: generateDate(new Date(Date.now() + 48 * 60 * 60 * 1000), new Date(Date.now() + 72 * 60 * 60 * 1000)),
    cargoType: "Electronics",
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
    cargoType: "Grain",
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
    cargoType: "Crude Oil",
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
    cargoType: "Manufactured Goods",
    priority: 2
  }
];

// Mock docks
export const mockDocks: Dock[] = [
  {
    id: "d1",
    name: "North Terminal 1",
    length: 350,
    depth: 15,
    specializations: ["container"],
    occupied: false
  },
  {
    id: "d2",
    name: "North Terminal 2",
    length: 300,
    depth: 14,
    specializations: ["container", "bulk"],
    occupied: false
  },
  {
    id: "d3",
    name: "South Terminal 1",
    length: 400,
    depth: 16,
    specializations: ["container", "tanker"],
    occupied: false
  },
  {
    id: "d4",
    name: "Passenger Terminal",
    length: 350,
    depth: 10,
    specializations: ["passenger"],
    occupied: false
  },
  {
    id: "d5",
    name: "South Terminal 2",
    length: 320,
    depth: 15,
    specializations: ["bulk", "tanker"],
    occupied: false
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
