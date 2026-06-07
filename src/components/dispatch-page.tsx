"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getVehicles } from "@/lib/api";
import type { VehicleWithDriver } from "@/lib/dashboard-types";

type DispatchFormState = {
  vehicleId: string;
  destinationName: string;
  destinationAddress: string;
  city: string;
  region: string;
  scheduledFor: string;
  priority: "low" | "normal" | "high";
  dispatchType: "delivery" | "pickup" | "service";
  cargoType: string;
  estimatedDistance: string;
  instructions: string;
  notes: string;
};

const initialForm: DispatchFormState = {
  vehicleId: "",
  destinationName: "",
  destinationAddress: "",
  city: "",
  region: "",
  scheduledFor: "",
  priority: "normal",
  dispatchType: "delivery",
  cargoType: "",
  estimatedDistance: "",
  instructions: "",
  notes: "",
};

function formatVehicleLabel(vehicle: VehicleWithDriver) {
  return `${vehicle.name} • ${vehicle.registration_number}`;
}

function formatDriver(vehicle: VehicleWithDriver) {
  const driver = Array.isArray(vehicle.driver)
    ? (vehicle.driver[0] ?? null)
    : vehicle.driver;

  return driver?.full_name ?? "Unassigned";
}

export function DispatchPage() {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<DispatchFormState>(initialForm);

  useEffect(() => {
    let isMounted = true;

    async function loadVehicles() {
      try {
        setLoading(true);
        setError(null);

        const rows = await getVehicles();
        if (!isMounted) return;

        setVehicles(rows);
        setForm((current) => ({
          ...current,
          vehicleId: current.vehicleId || rows[0]?.id || "",
        }));
      } catch (fetchError) {
        if (!isMounted) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load vehicles.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === form.vehicleId) ?? null,
    [form.vehicleId, vehicles],
  );

  function updateField<K extends keyof DispatchFormState>(
    key: K,
    value: DispatchFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const dispatchSummary = useMemo(
    () => [
      {
        label: "Vehicle",
        value: selectedVehicle
          ? formatVehicleLabel(selectedVehicle)
          : "Select a vehicle",
      },
      {
        label: "Destination",
        value:
          form.destinationName || form.destinationAddress
            ? [form.destinationName, form.destinationAddress]
                .filter(Boolean)
                .join(" • ")
            : "Enter destination details",
      },
      {
        label: "Schedule",
        value: form.scheduledFor
          ? new Date(form.scheduledFor).toLocaleString()
          : "Choose a time",
      },
      { label: "Priority", value: form.priority.toUpperCase() },
    ],
    [
      form.destinationAddress,
      form.destinationName,
      form.priority,
      form.scheduledFor,
      selectedVehicle,
    ],
  );

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-900">
      <header className="border-b border-slate-300 bg-[#f6f8fb] px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-400 items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              FleetOps Pro
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">
              New Dispatch
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-400 p-3 sm:p-6">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-md border border-slate-300 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  Dispatch Details
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Select a vehicle, set the destination, and fill the dispatch
                  instructions.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Manual dispatch
              </span>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Vehicle
                </span>
                <select
                  value={form.vehicleId}
                  onChange={(event) =>
                    updateField("vehicleId", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                >
                  <option value="">
                    {loading ? "Loading vehicles..." : "Choose vehicle"}
                  </option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {formatVehicleLabel(vehicle)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Destination name
                </span>
                <input
                  value={form.destinationName}
                  onChange={(event) =>
                    updateField("destinationName", event.target.value)
                  }
                  type="text"
                  placeholder="Client warehouse, branch office, delivery stop"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Destination address
                </span>
                <input
                  value={form.destinationAddress}
                  onChange={(event) =>
                    updateField("destinationAddress", event.target.value)
                  }
                  type="text"
                  placeholder="Street, building, warehouse number"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  City
                </span>
                <input
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  type="text"
                  placeholder="Mumbai"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Region / State
                </span>
                <input
                  value={form.region}
                  onChange={(event) =>
                    updateField("region", event.target.value)
                  }
                  type="text"
                  placeholder="Maharashtra"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Dispatch type
                </span>
                <select
                  value={form.dispatchType}
                  onChange={(event) =>
                    updateField(
                      "dispatchType",
                      event.target.value as DispatchFormState["dispatchType"],
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                  <option value="service">Service / Maintenance</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Priority
                </span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    updateField(
                      "priority",
                      event.target.value as DispatchFormState["priority"],
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Scheduled for
                </span>
                <input
                  value={form.scheduledFor}
                  onChange={(event) =>
                    updateField("scheduledFor", event.target.value)
                  }
                  type="datetime-local"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Estimated distance
                </span>
                <input
                  value={form.estimatedDistance}
                  onChange={(event) =>
                    updateField("estimatedDistance", event.target.value)
                  }
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="185.4"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Cargo / package type
                </span>
                <input
                  value={form.cargoType}
                  onChange={(event) =>
                    updateField("cargoType", event.target.value)
                  }
                  type="text"
                  placeholder="Electronics, spare parts, sealed documents"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Special instructions
                </span>
                <textarea
                  value={form.instructions}
                  onChange={(event) =>
                    updateField("instructions", event.target.value)
                  }
                  rows={4}
                  placeholder="Security gate check-in, call on arrival, temperature control, etc."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Internal notes
                </span>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  rows={3}
                  placeholder="Anything dispatch coordinators should know"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </label>

              <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create Dispatch
                </button>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>

              {submitted ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:col-span-2">
                  Dispatch draft created for{" "}
                  {selectedVehicle?.name ?? "the selected vehicle"}. Connect
                  this form to a backend action when ready.
                </div>
              ) : null}
            </div>
          </form>

          <aside className="space-y-3">
            <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                Dispatch Preview
              </p>
              <div className="mt-3 space-y-3">
                {dispatchSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                Selected Vehicle
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-semibold text-slate-900">
                  {selectedVehicle
                    ? formatVehicleLabel(selectedVehicle)
                    : "No vehicle selected"}
                </p>
                <p className="text-slate-600">
                  Driver:{" "}
                  {selectedVehicle ? formatDriver(selectedVehicle) : "--"}
                </p>
                <p className="text-slate-600">
                  Status: {selectedVehicle?.status ?? "--"}
                </p>
                <p className="text-slate-600">
                  Fuel: {selectedVehicle?.fuel_level ?? 0}%
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
