"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoutePoints, getTrips, getVehicles } from "@/lib/api";
import type {
  DashboardAlert,
  RoutePointRow,
  TripWithVehicle,
  VehicleWithDriver,
} from "@/lib/dashboard-types";

type DashboardState = {
  vehicles: VehicleWithDriver[];
  trips: TripWithVehicle[];
  routePoints: RoutePointRow[];
  selectedVehicleId: string | null;
  selectedTripId: string | null;
  loading: boolean;
  routeLoading: boolean;
  error: string | null;
  routeError: string | null;
  setSelectedVehicleId: (vehicleId: string) => void;
  setSelectedTripId: (tripId: string) => void;
  selectedVehicle: VehicleWithDriver | null;
  selectedTrip: TripWithVehicle | null;
  selectedDriverName: string;
  selectedDriverSubtitle: string;
  stats: { label: string; value: string; delta: string }[];
  alerts: DashboardAlert[];
  tripsForSelectedVehicle: TripWithVehicle[];
};

function isActiveVehicle(status: string | null | undefined) {
  return status?.trim().toUpperCase() === "ACTIVE";
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isToday(value: string | null | undefined) {
  const parsed = parseDate(value);
  if (!parsed) return false;
  const now = new Date();
  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate()
  );
}

function getDriver(vehicle: VehicleWithDriver | TripWithVehicle["vehicle"]) {
  const driver = vehicle.driver;
  if (!driver) {
    return null;
  }

  return Array.isArray(driver) ? (driver[0] ?? null) : driver;
}

function formatDateTime(value: string | null | undefined) {
  const parsed = parseDate(value);
  if (!parsed) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatSpeed(value: number | null | undefined) {
  if (value == null) return "0";
  return value.toLocaleString();
}

function buildAlerts(
  vehicles: VehicleWithDriver[],
  trips: TripWithVehicle[],
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  vehicles.forEach((vehicle) => {
    if ((vehicle.battery_level ?? 100) < 50) {
      alerts.push({
        id: `battery-${vehicle.id}`,
        title: `Battery below 50%: ${vehicle.name}`,
        detail: `Battery is at ${vehicle.battery_level ?? 0}%.`,
        severity: "medium",
      });
    }

    if ((vehicle.fuel_level ?? 100) < 30) {
      alerts.push({
        id: `fuel-${vehicle.id}`,
        title: `Fuel below 30%: ${vehicle.name}`,
        detail: `Fuel is at ${vehicle.fuel_level ?? 0}%.`,
        severity: "medium",
      });
    }

    if (vehicle.status === "OFFLINE") {
      alerts.push({
        id: `offline-${vehicle.id}`,
        title: `Offline vehicle: ${vehicle.name}`,
        detail: `Last seen ${formatDateTime(vehicle.last_seen)}.`,
        severity: "high",
      });
    }
  });

  trips.forEach((trip) => {
    if ((trip.overspeed_count ?? 0) > 3) {
      alerts.push({
        id: `overspeed-${trip.id}`,
        title: `Overspeed events on ${trip.vehicle.name}`,
        detail: `${trip.overspeed_count ?? 0} overspeed events recorded.`,
        severity: "high",
      });
    }
  });

  return alerts;
}

export function useDashboardData() {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [trips, setTrips] = useState<TripWithVehicle[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePointRow[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [vehicleRows, tripRows] = await Promise.all([
          getVehicles(),
          getTrips(),
        ]);

        if (!isMounted) {
          return;
        }
        setVehicles(vehicleRows);
        setTrips(tripRows);

        if (!selectedVehicleId && vehicleRows.length > 0) {
          setSelectedVehicleId(vehicleRows[0].id);
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load dashboard data.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  const tripsForSelectedVehicle = useMemo(() => {
    if (!selectedVehicle) {
      return [];
    }

    return trips.filter((trip) => trip.vehicle_id === selectedVehicle.id);
  }, [selectedVehicle, trips]);

  const selectedTrip = useMemo(() => {
    if (!selectedTripId) {
      return tripsForSelectedVehicle[0] ?? null;
    }

    return trips.find((trip) => trip.id === selectedTripId) ?? null;
  }, [selectedTripId, trips, tripsForSelectedVehicle]);

  useEffect(() => {
    let isMounted = true;

    async function loadRoutePoints() {
      if (!selectedTrip?.id) {
        setRoutePoints([]);
        setRouteError(null);
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError(null);

        const points = await getRoutePoints(selectedTrip.id);
        if (isMounted) {
          setRoutePoints(points);
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load route points.";
        setRouteError(message);
        setRoutePoints([]);
      } finally {
        if (isMounted) {
          setRouteLoading(false);
        }
      }
    }

    loadRoutePoints();

    return () => {
      isMounted = false;
    };
  }, [selectedTrip?.id]);

  useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!selectedVehicleId || !selectedVehicle) {
      return;
    }

    if (tripsForSelectedVehicle.length === 0) {
      if (selectedTripId !== null) {
        setSelectedTripId(null);
      }
      return;
    }

    if (!tripsForSelectedVehicle.some((trip) => trip.id === selectedTripId)) {
      setSelectedTripId(tripsForSelectedVehicle[0].id);
    }
  }, [
    selectedTripId,
    selectedVehicle,
    selectedVehicleId,
    tripsForSelectedVehicle,
  ]);

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((vehicle) =>
      isActiveVehicle(vehicle.status),
    ).length;
    const tripsToday = trips.filter((trip) => isToday(trip.start_time)).length;
    const overspeedEvents = trips.reduce(
      (total, trip) => total + (trip.overspeed_count ?? 0),
      0,
    );

    return [
      { label: "Total Vehicles", value: String(totalVehicles), delta: "Live" },
      {
        label: "Active Vehicles",
        value: String(activeVehicles),
        delta: `${totalVehicles ? Math.round((activeVehicles / totalVehicles) * 100) : 0}%`,
      },
      { label: "Trips Today", value: String(tripsToday), delta: "Today" },
      {
        label: "Total Overspeed Events",
        value: String(overspeedEvents),
        delta: "Live",
      },
    ];
  }, [trips, vehicles]);

  const alerts = useMemo(() => buildAlerts(vehicles, trips), [trips, vehicles]);

  const selectedDriver = selectedVehicle ? getDriver(selectedVehicle) : null;

  return {
    vehicles,
    trips,
    routePoints,
    selectedVehicleId,
    selectedTripId,
    loading,
    routeLoading,
    error,
    routeError,
    setSelectedVehicleId,
    setSelectedTripId,
    selectedVehicle,
    selectedTrip,
    selectedDriverName: selectedDriver?.full_name ?? "Unassigned",
    selectedDriverSubtitle: selectedDriver
      ? `${selectedDriver.license_number ?? "No license"} • ${selectedDriver.experience_years ?? 0} yrs experience`
      : "No assigned driver",
    stats,
    alerts,
    tripsForSelectedVehicle,
  } as DashboardState;
}
