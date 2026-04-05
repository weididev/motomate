export interface Bike {
  id: string;
  name: string;
  company: string;
  model: string;
  year: number;
  registrationNumber: string;
  purchaseDate: string;
  engineNumber?: string;
  chassisNumber?: string;
  odometer: number; // Supports decimals (e.g., 7260.3)
  price?: number;
  registrationValidity?: string;
  fuelCapacity: number;
  manualServiceKm?: number;
  manualServiceDate?: string;
}

export interface MaintenanceRecord {
  id: string;
  type: string;
  date: string;
  odometer: number;
  cost: number;
  notes?: string;
}

export interface FuelRecord {
  id: string;
  date: string;
  liters: number;
  cost: number;
  odometer: number;
  stationName?: string;
  efficiency?: number; // km/l for this refill
  isDump?: boolean;
}

export interface AccessoryRecord {
  id: string;
  name: string;
  date: string;
  cost: number;
  notes?: string;
}

export interface TripRecord {
  id: string;
  startTime: string;
  endTime: string;
  startOdometer: number;
  endOdometer: number;
  distance: number;
  durationMinutes: number;
}

export interface ActiveTrip {
  startTime: string;
  startOdometer: number;
}

export interface ServiceChecklistItem {
  id: string;
  text: string;
  date: string;
  isCompleted: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
