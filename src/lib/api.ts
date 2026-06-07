import type {
  RoutePointRow,
  TripWithVehicle,
  VehicleWithDriver,
  DriverRow,
} from "@/lib/dashboard-types";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload: unknown = await response.json();
      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as { error?: unknown }).error === "string"
      ) {
        message = (payload as { error: string }).error;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getVehicles() {
  return request<VehicleWithDriver[]>("/api/vehicles");
}

export function getTrips() {
  return request<TripWithVehicle[]>("/api/trips");
}

export function getDrivers() {
  return request<DriverRow[]>("/api/drivers");
}

export function getRoutePoints(tripId: string) {
  return request<RoutePointRow[]>(`/api/route-points?tripId=${encodeURIComponent(tripId)}`);
}
