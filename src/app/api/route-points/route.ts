import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get("tripId");

  if (!tripId) {
    return NextResponse.json({ error: "tripId is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("route_points")
    .select("id, trip_id, latitude, longitude, recorded_at")
    .eq("trip_id", tripId)
    .order("recorded_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
