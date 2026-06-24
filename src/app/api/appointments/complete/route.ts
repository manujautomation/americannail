import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// 1 point per $1 spent — configurable
const POINTS_PER_DOLLAR = 1;

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user: staffUser } } = await supabase.auth.getUser();
  if (!staffUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appointmentId, amountCharged } = await req.json() as {
    appointmentId: string;
    amountCharged: number; // actual dollars charged at counter
  };

  if (!appointmentId) return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
  if (typeof amountCharged !== "number" || amountCharged < 0)
    return NextResponse.json({ error: "Invalid amountCharged" }, { status: 400 });

  const db = adminDb();

  const { data: appt, error: fetchErr } = await db
    .from("appointments")
    .select("id, status, customer_id, service_id")
    .eq("id", appointmentId)
    .single();

  if (fetchErr || !appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  if (appt.status === "completed") return NextResponse.json({ ok: true, alreadyDone: true });

  // Points = floor(amountCharged * rate) — minimum 1 pt for any paid visit
  const pointsEarned = Math.max(1, Math.floor(amountCharged * POINTS_PER_DOLLAR));

  // Mark completed + record actual amount charged (full audit trail)
  await db.from("appointments").update({
    status:         "completed",
    amount_charged: amountCharged,
    completed_by:   staffUser.id,
  }).eq("id", appointmentId);

  // Award points if linked to a registered customer
  if (appt.customer_id) {
    await db.rpc("increment_reward_points", {
      p_customer_id: appt.customer_id,
      p_amount:      pointsEarned,
    });

    await db.from("reward_history").insert({
      customer_id:    appt.customer_id,
      type:           "earn",
      points:         pointsEarned,
      description:    `Visit completed — $${amountCharged.toFixed(2)} charged (${pointsEarned} pts @ $1/pt)`,
      appointment_id: appointmentId,
    });
  }

  // Audit log
  await db.from("audit_logs").insert({
    actor_id:   staffUser.id,
    action:     "appointment_completed",
    table_name: "appointments",
    record_id:  appointmentId,
    new_data:   {
      amount_charged: amountCharged,
      points_awarded: appt.customer_id ? pointsEarned : 0,
      completed_by:   staffUser.id,
      completed_at:   new Date().toISOString(),
    },
  });

  return NextResponse.json({
    ok: true,
    pointsAwarded: appt.customer_id ? pointsEarned : 0,
    amountCharged,
  });
}
