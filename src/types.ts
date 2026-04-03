export interface Bike {
  id: string;
  name: string;
  company: string;
  model: string;
  registrationNumber: string;
  purchaseDate: string;
  odometer: number;
  fuelCapacity: number;
  year: number;
}

export interface FuelRecord {
  id: string;
  date: string;
  cost: number;
  liters: number;
  odometer: number;
  stationName: string;
  isDump?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  type: string;
  date: string;
  cost: number;
  odometer: number;
  notes?: string;
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
