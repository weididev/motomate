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
  vin?: string;
  puccExpiry?: string;
  odometer: number; // Supports decimals (e.g., 7260.3)
  price?: number;
  registrationValidity?: string;
  insuranceExpiry?: string;
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
  partChanged?: boolean;
  nextReplacementOdometer?: number;
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
  isFullTank?: boolean;
}

export interface AccessoryRecord {
  id: string;
  name: string;
  date: string;
  cost: number;
  notes?: string;
  isMaintenancePart?: boolean;
}

export interface LapRecord {
  id: string;
  timestamp: string;
  odometer: number;
  distance: number;
  type?: 'Pickup' | 'Drop' | 'Free ride' | 'Regular';
}

export interface TripRecord {
  id: string;
  startTime: string;
  endTime: string;
  startOdometer: number;
  endOdometer: number;
  distance: number;
  durationMinutes: number;
  fuelConsumed?: number;
  cost?: number;
  type: 'Pickup/Drop' | 'Free Trip' | 'Regular';
  laps?: LapRecord[];
}

export interface ActiveTrip {
  startTime: string;
  startOdometer: number;
  status: 'active' | 'paused';
  type: 'Pickup/Drop' | 'Free Trip' | 'Regular';
  laps: LapRecord[];
  lastPauseTime?: string;
  totalPausedMinutes: number;
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
