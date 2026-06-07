import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function normalizeStatus(status: string | null | undefined) {
  return status ? status.trim().toUpperCase() : status;
}

export async function GET() {
  const { data, error } = await supabase
    .from("trips")
    .select(
      `
        id,
        vehicle_id,
        start_time,
        end_time,
        distance,
        duration_minutes,
        avg_speed,
        max_speed,
        idle_time,
        halt_count,
        overspeed_count,
        start_location,
        end_location,
        vehicle:vehicles (
          id,
          name,
          registration_number,
          status,
          battery_level,
          fuel_level,
          last_seen,
          latitude,
          longitude,
          driver_id,
          driver:drivers (
            id,
            full_name,
            phone_number,
            license_number,
            experience_years,
            status
          )
        )
      `,
    )
    .order("start_time", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trips = (data ?? []).map((trip) => {
    const vehicle = Array.isArray(trip.vehicle)
      ? (trip.vehicle[0] ?? null)
      : (trip.vehicle ?? null);

    return {
      ...trip,
      vehicle: vehicle
        ? {
            ...vehicle,
            status: normalizeStatus(vehicle.status),
            driver: Array.isArray(vehicle.driver)
              ? (vehicle.driver[0] ?? null)
              : (vehicle.driver ?? null),
          }
        : vehicle,
    };
  });

  return NextResponse.json(trips);
}
