"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { supabase } from "@/lib/supabase";

function statusClasses(status: string | null | undefined) {
  if (status === "ACTIVE") return "bg-blue-100 text-blue-700";
  if (status === "IDLE") return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-600";
}

function severityClasses(severity: "high" | "medium" | "low") {
  if (severity === "high") return "border-red-100 bg-red-50 text-red-700";
  if (severity === "medium")
    return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function formatLastSeen(value: string | null | undefined) {
  if (!value) return "Unknown";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const minutes = Math.round((Date.now() - parsed.getTime()) / 60000);
  if (minutes <= 1) return "Live";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

function formatDuration(minutes: number | null | undefined) {
  if (minutes == null) return "--";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatDistance(value: number | null | undefined) {
  if (value == null) return "--";
  return `${value.toLocaleString()} km`;
}

const FleetMap = dynamic(() => import("@/components/map/fleet-map"), {
  ssr: false,
});

export function DashboardPage() {
  const [managerName, setManagerName] = useState("Current Manager");
  const {
    vehicles,
    loading,
    routeLoading,
    error,
    routeError,
    selectedVehicleId,
    selectedTripId,
    selectedVehicle,
    selectedTrip,
    selectedDriverName,
    selectedDriverSubtitle,
    stats,
    alerts,
    tripsForSelectedVehicle,
    routePoints,
    setSelectedVehicleId,
    setSelectedTripId,
  } = useDashboardData();

  const isInitialLoading = loading && vehicles.length === 0;

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!isMounted || !user) return;

      const profileName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        "Current Manager";

      setManagerName(profileName);
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-900">
      <header className="border-b border-slate-300 bg-[#f6f8fb] px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-400 items-center gap-4">
          <div className="flex items-center gap-3 border-r border-slate-300 pr-4">
            <span className="text-2xl font-black tracking-tight">
              FleetOps Pro
            </span>
            <span className="hidden text-sm text-slate-500 lg:block">
              Operations Dashboard
            </span>
          </div>
          <div className="hidden flex-1 items-center md:flex">
            <input
              type="text"
              placeholder="Search vehicles, drivers, or routes..."
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-4 text-slate-600">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold text-slate-800">{managerName}</p>
              <p className="text-slate-500">Fleet Manager</p>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mx-auto mt-3 w-full max-w-400 px-3 sm:px-6">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      ) : null}

      <main className="mx-auto grid w-full max-w-400 items-start gap-3 p-3 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="sticky top-3 flex max-h-[calc(100vh-1.5rem)] flex-col rounded-md border border-slate-300 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
              Fleet Inventory
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isInitialLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`vehicle-skeleton-${index}`}
                    className="border-b border-slate-200 px-3 py-3 last:border-b-0"
                  >
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
                  </div>
                ))
              : vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`w-full border-b border-slate-200 px-3 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                      selectedVehicleId === vehicle.id
                        ? "border-l-4 border-l-blue-700 bg-blue-100/50 pl-2"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{vehicle.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(vehicle.status)}`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {vehicle.registration_number}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatLastSeen(vehicle.last_seen)}</span>
                      <span>
                        {vehicle.latitude != null && vehicle.longitude != null
                          ? "Tracked"
                          : "No GPS"}
                      </span>
                    </div>
                  </button>
                ))}
          </div>
          <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
            <p>Support</p>
            <p className="mt-2">Sign Out</p>
          </div>
        </aside>

        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {isInitialLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`kpi-skeleton-${index}`}
                    className="rounded-md border border-slate-300 bg-white p-4"
                  >
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-10 w-16 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-12 animate-pulse rounded bg-slate-200" />
                  </div>
                ))
              : stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-md border border-slate-300 bg-white p-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-blue-700">
                      {stat.delta}
                    </p>
                  </div>
                ))}
          </div>

          <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
            <FleetMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              routePoints={routePoints}
              loading={isInitialLoading || routeLoading}
              onSelectVehicle={setSelectedVehicleId}
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-md border border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  Recent Trips
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/dispatch"
                    className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    New Dispatch
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Average Speed</th>
                      <th className="px-4 py-3">Start Location</th>
                      <th className="px-4 py-3">End Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? (
                      <tr className="border-t border-slate-200">
                        <td
                          className="px-4 py-6 text-sm text-slate-500"
                          colSpan={7}
                        >
                          Loading trips...
                        </td>
                      </tr>
                    ) : tripsForSelectedVehicle.length > 0 ? (
                      tripsForSelectedVehicle.map((trip) => {
                        const driver = Array.isArray(trip.vehicle.driver)
                          ? (trip.vehicle.driver[0] ?? null)
                          : trip.vehicle.driver;
                        const isSelected = selectedTripId === trip.id;

                        return (
                          <tr
                            key={trip.id}
                            onClick={() => setSelectedTripId(trip.id)}
                            className={`cursor-pointer border-t border-slate-200 transition hover:bg-slate-50 ${
                              isSelected ? "bg-blue-50/70" : ""
                            }`}
                          >
                            <td className="px-4 py-3 font-semibold">
                              {trip.vehicle.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {driver?.full_name ?? "Unassigned"}
                            </td>
                            <td className="px-4 py-3">
                              {formatDistance(trip.distance)}
                            </td>
                            <td className="px-4 py-3">
                              {formatDuration(trip.duration_minutes)}
                            </td>
                            <td className="px-4 py-3">
                              {trip.avg_speed != null
                                ? `${trip.avg_speed} km/h`
                                : "--"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {trip.start_location ?? "--"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {trip.end_location ?? "--"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="border-t border-slate-200">
                        <td
                          className="px-4 py-6 text-sm text-slate-500"
                          colSpan={7}
                        >
                          No trips available for{" "}
                          {selectedVehicle?.name ?? "this vehicle"}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-md border border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-red-600">
                  Critical Alerts
                </p>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  {alerts.length}
                </span>
              </div>
              <div className="space-y-2 p-3">
                {isInitialLoading ? (
                  <div className="rounded-md border border-red-100 bg-red-50 px-3 py-3 text-sm text-slate-500">
                    Loading alerts...
                  </div>
                ) : alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-md border px-3 py-3 ${severityClasses(alert.severity)}`}
                    >
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="mt-1 text-xs opacity-80">{alert.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    No active alerts.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-md border border-slate-300 bg-white p-4">
            <p className="text-3xl font-bold tracking-tight">
              {selectedVehicle?.name ?? "Loading vehicle..."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedVehicle?.registration_number ?? "--"} •{" "}
              {formatLastSeen(selectedVehicle?.last_seen)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-slate-300 bg-slate-50 p-3">
                <p className="text-slate-500">Registration</p>
                <p className="mt-1 font-semibold">
                  {selectedVehicle?.registration_number ?? "--"}
                </p>
              </div>
              <div className="rounded border border-slate-300 bg-slate-50 p-3">
                <p className="text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {selectedVehicle?.status ?? "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-300 bg-white p-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
              Current Driver
            </p>
            <p className="mt-3 font-semibold">{selectedDriverName}</p>
            <p className="text-xs text-slate-500">{selectedDriverSubtitle}</p>
          </div>

          <div className="rounded-md border border-slate-300 bg-white p-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
              Live Telemetry
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span>Fuel Level</span>
                  <span className="font-semibold">
                    {selectedVehicle?.fuel_level ?? 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-blue-700"
                    style={{ width: `${selectedVehicle?.fuel_level ?? 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Avg Speed</p>
                  <p className="text-2xl font-bold">
                    {selectedTrip?.avg_speed != null
                      ? selectedTrip.avg_speed
                      : "--"}
                  </p>
                  <p className="text-xs text-slate-500">km/h</p>
                </div>
                <div className="rounded border border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Distance</p>
                  <p className="text-2xl font-bold">
                    {selectedTrip
                      ? formatDistance(selectedTrip.distance)
                      : "--"}
                  </p>
                  <p className="text-xs text-slate-500">km</p>
                </div>
                <div className="rounded border border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Idle Time</p>
                  <p className="text-2xl font-bold">
                    {selectedTrip?.idle_time != null
                      ? selectedTrip.idle_time
                      : "--"}
                  </p>
                  <p className="text-xs text-slate-500">min</p>
                </div>
                <div className="rounded border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-600">Overspeed</p>
                  <p className="text-2xl font-bold text-red-700">
                    {selectedTrip?.overspeed_count ?? 0}
                  </p>
                  <p className="text-xs text-red-600">events</p>
                </div>
              </div>
            </div>
          </div>

          {routeError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {routeError}
            </div>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
