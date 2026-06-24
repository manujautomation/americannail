import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";

const bookingSchema = z.object({
  serviceId:   z.string().min(1),
  employeeId:  z.string().optional(),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:        z.string().min(1),
  firstName:   z.string().min(1).max(80),
  lastName:    z.string().max(80).optional().default(""),
  phone:       z.string().min(7).max(20),
  email:       z.string().email().optional().or(z.literal("")),
  notes:       z.string().max(500).optional().default(""),
  customerId:  z.string().uuid().optional(),
});

function generateRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "ANS-";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: service } = await (supabase as any)
      .from("services")
      .select("duration_min")
      .eq("id", data.serviceId)
      .single();

    const reference = generateRef();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appt, error } = await (supabase as any)
      .from("appointments")
      .insert({
        reference,
        location_id:      LOCATION_ID,
        service_id:       data.serviceId,
        employee_id:      data.employeeId && data.employeeId !== "any" ? data.employeeId : null,
        status:           "pending",
        appointment_date: data.date,
        appointment_time: data.time,
        duration_min:     service?.duration_min ?? 60,
        first_name:       data.firstName,
        last_name:        data.lastName,
        phone:            data.phone,
        email:            data.email || null,
        notes:            data.notes || null,
        customer_id:      data.customerId ?? null,
        source:           "online",
        demo_mode:        process.env.NEXT_PUBLIC_DEMO_MODE === "true",
      })
      .select("id, reference")
      .single();

    if (error) {
      console.error("[booking] insert error:", error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reference: appt.reference, id: appt.id }, { status: 201 });
  } catch (err) {
    console.error("[booking] unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
