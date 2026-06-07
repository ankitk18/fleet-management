export type VehicleStatus = "ACTIVE" | "IDLE" | "OFFLINE";

export interface DriverRow {
  id: string;
  full_name: string;
  phone_number: string | null;
  license_number: string | null;
  experience_years: number | null;
  status: string | null;
}

export interface VehicleRow {
  id: string;
  name: string;
  registration_number: string;
  status: VehicleStatus;
  battery_level: number | null;
  fuel_level: number | null;
  last_seen: string;
  latitude: number | null;
  longitude: number | null;
  driver_id: string | null;
}

export interface TripRow {
  id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string | null;
  distance: number | null;
  duration_minutes: number | null;
  avg_speed: number | null;
  max_speed: number | null;
  idle_time: number | null;
  halt_count: number | null;
  overspeed_count: number | null;
  start_location: string | null;
  end_location: string | null;
}

export interface RoutePointRow {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface VehicleWithDriver extends VehicleRow {
  driver: DriverRow | null;
}

export interface TripWithVehicle extends TripRow {
  vehicle: VehicleRow & { driver: DriverRow | null };
}

export interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
}
