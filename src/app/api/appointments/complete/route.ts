import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const POINTS_PER_VISIT = 10;

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  // Verify caller is staff
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appointmentId } = await req.json() as { appointmentId: string };
  if (!appointmentId) return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });

  const db = adminDb();

  // Fetch appointment to get customer_id and current status
  const { data: appt, error: fetchErr } = await db
    .from("appointments")
    .select("id, status, customer_id")
    .eq("id", appointmentId)
    .single();

  if (fetchErr || !appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  if (appt.status === "completed") return NextResponse.json({ ok: true, alreadyDone: true });

  // Mark completed
  await db.from("appointments").update({ status: "completed" }).eq("id", appointmentId);

  // Award points if appointment belongs to a registered customer
  if (appt.customer_id) {
    // RPC handles upsert + increment atomically — no separate upsert needed
    await db.rpc("increment_reward_points", {
      p_customer_id: appt.customer_id,
      p_amount: POINTS_PER_VISIT,
    });

    // Log to reward_history
    await db.from("reward_history").insert({
      customer_id:    appt.customer_id,
      type:           "earn",
      points:         POINTS_PER_VISIT,
      description:    "Visit completed",
      appointment_id: appointmentId,
    });
  }

  return NextResponse.json({ ok: true, pointsAwarded: appt.customer_id ? POINTS_PER_VISIT : 0 });
}
