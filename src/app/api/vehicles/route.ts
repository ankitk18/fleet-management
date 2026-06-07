import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function normalizeStatus(status: string | null | undefined) {
  return status ? status.trim().toUpperCase() : status;
}

export async function GET() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
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
      `,
    )
    .order("last_seen", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vehicles = (data ?? []).map((vehicle) => ({
    ...vehicle,
    status: normalizeStatus(vehicle.status),
    driver: Array.isArray(vehicle.driver)
      ? (vehicle.driver[0] ?? null)
      : (vehicle.driver ?? null),
  }));
  return NextResponse.json(vehicles);
}
