import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";

// Business hours slots (15-min grid, trimmed to display slots)
const ALL_SLOTS = [
  "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00",
];

// Returns true if slot "HH:MM" overlaps with a booked appointment
function overlaps(slot: string, bookedTime: string, durationMin: number): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const slotMin = toMin(slot);
  const startMin = toMin(bookedTime);
  const endMin = startMin + durationMin;
  // Block the slot if it falls within [start, end)
  return slotMin >= startMin && slotMin < endMin;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const employeeId = searchParams.get("employeeId"); // "any" or a UUID

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const supabase = await createAdminClient();

    // Build query — if a specific technician is chosen, only check their bookings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("appointments")
      .select("appointment_time, duration_min, employee_id")
      .eq("location_id", LOCATION_ID)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (employeeId && employeeId !== "any") {
      query = query.eq("employee_id", employeeId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("[availability] query error:", error);
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }

    // Mark each slot as available or booked
    const slots = ALL_SLOTS.map((slot) => {
      const blocked = (bookings ?? []).some((b: { appointment_time: string; duration_min: number }) =>
        overlaps(slot, b.appointment_time.slice(0, 5), b.duration_min)
      );
      return { time: slot, available: !blocked };
    });

    return NextResponse.json({ date, slots });
  } catch (err) {
    console.error("[availability] unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
