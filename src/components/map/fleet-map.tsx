"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { RoutePointRow, VehicleWithDriver } from "@/lib/dashboard-types";

type FleetMapProps = {
  vehicles: VehicleWithDriver[];
  selectedVehicleId: string | null;
  routePoints: RoutePointRow[];
  loading: boolean;
  onSelectVehicle: (vehicleId: string) => void;
};

const INDIA_CENTER: [number, number] = [22.5937, 78.9629];

function getDriverName(vehicle: VehicleWithDriver) {
  const driver = vehicle.driver;
  if (!driver) return "Unassigned";
  return Array.isArray(driver)
    ? (driver[0]?.full_name ?? "Unassigned")
    : driver.full_name;
}

function getMarkerColor(status: string | null | undefined) {
  if (status === "ACTIVE") return "#2563eb";
  if (status === "IDLE") return "#f59e0b";
  return "#64748b";
}

function createVehicleIcon(
  selected: boolean,
  status: string | null | undefined,
) {
  const color = getMarkerColor(status);
  const size = selected ? 22 : 16;
  const borderWidth = selected ? 4 : 3;

  return L.divIcon({
    className: "",
    iconSize: [size + 12, size + 12],
    iconAnchor: [size / 2 + 6, size / 2 + 6],
    popupAnchor: [0, -(size + 6)],
    html: `
      <div style="width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${borderWidth}px solid white;box-shadow:0 8px 20px rgba(15,23,42,.28);transform:${selected ? "scale(1.18)" : "scale(1)"};transition:transform .15s ease;"></div>
      </div>
    `,
  });
}

function MapViewport({
  vehicles,
  selectedVehicleId,
}: Pick<FleetMapProps, "vehicles" | "selectedVehicleId">) {
  const map = useMap();

  const vehicleLocations = useMemo(
    () =>
      vehicles.filter(
        (
          vehicle,
        ): vehicle is VehicleWithDriver & {
          latitude: number;
          longitude: number;
        } => vehicle.latitude != null && vehicle.longitude != null,
      ),
    [vehicles],
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  useEffect(() => {
    if (
      selectedVehicle &&
      selectedVehicle.latitude != null &&
      selectedVehicle.longitude != null
    ) {
      map.setView([selectedVehicle.latitude, selectedVehicle.longitude], 12, {
        animate: true,
      });
      return;
    }

    if (vehicleLocations.length > 0) {
      const bounds = L.latLngBounds(
        vehicleLocations.map(
          (vehicle) =>
            [vehicle.latitude, vehicle.longitude] as [number, number],
        ),
      );
      map.fitBounds(bounds, { padding: [40, 40] });
      return;
    }

    map.setView(INDIA_CENTER, 5, { animate: true });
  }, [map, selectedVehicle, vehicleLocations]);

  return null;
}

export default function FleetMap({
  vehicles,
  selectedVehicleId,
  routePoints,
  loading,
  onSelectVehicle,
}: FleetMapProps) {
  const markers = useMemo(
    () =>
      vehicles.filter(
        (
          vehicle,
        ): vehicle is VehicleWithDriver & {
          latitude: number;
          longitude: number;
        } => vehicle.latitude != null && vehicle.longitude != null,
      ),
    [vehicles],
  );

  const routeLine = useMemo(
    () =>
      routePoints.map(
        (point) => [point.latitude, point.longitude] as [number, number],
      ),
    [routePoints],
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  return (
    <div className="relative min-h-90 w-full">
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={3}
        maxZoom={18}
        className="h-90 w-full lg:h-105"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
        />

        {routeLine.length > 1 ? (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85 }}
          />
        ) : null}

        {markers.map((vehicle) => {
          const selected = vehicle.id === selectedVehicleId;
          const driverName = getDriverName(vehicle);

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createVehicleIcon(selected, vehicle.status)}
              eventHandlers={{
                click: () => onSelectVehicle(vehicle.id),
              }}
              zIndexOffset={selected ? 1000 : 0}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">{vehicle.name}</p>
                  <p className="text-slate-600">
                    {vehicle.registration_number}
                  </p>
                  <p className="text-slate-600">Status: {vehicle.status}</p>
                  <p className="text-slate-600">Driver: {driverName}</p>
                  <p className="text-xs text-slate-500">
                    {vehicle.latitude.toFixed(4)},{" "}
                    {vehicle.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {loading ? (
        <div className="absolute inset-0 z-500 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
          <div className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            Loading map...
          </div>
        </div>
      ) : null}

      {!selectedVehicle && markers.length === 0 ? (
        <div className="absolute inset-0 z-500 flex items-center justify-center bg-white/45">
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            No vehicle coordinates available
          </div>
        </div>
      ) : null}
    </div>
  );
}
