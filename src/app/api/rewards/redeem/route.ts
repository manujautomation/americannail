import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const REDEEM_COST   = 100; // points
const REDEEM_VALUE  = 5;   // dollars

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "ANS-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminDb();

  // Check current balance
  const { data: pts } = await db
    .from("reward_points")
    .select("balance")
    .eq("customer_id", user.id)
    .single();

  if (!pts || pts.balance < REDEEM_COST) {
    return NextResponse.json({ error: `Need at least ${REDEEM_COST} points to redeem` }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

  // Deduct points
  await db.rpc("decrement_reward_points", {
    p_customer_id: user.id,
    p_amount: REDEEM_COST,
  });

  // Create coupon
  await db.from("coupons").insert({
    code,
    description:   `$${REDEEM_VALUE} reward redemption`,
    discount_type: "fixed",
    discount_value: REDEEM_VALUE,
    usage_limit:   1,
    expires_at:    expiresAt,
  });

  // Log to reward_history
  await db.from("reward_history").insert({
    customer_id: user.id,
    type:        "redeem",
    points:      -REDEEM_COST,
    description: `Redeemed for $${REDEEM_VALUE} coupon (${code})`,
  });

  return NextResponse.json({ ok: true, code, value: REDEEM_VALUE, expiresAt });
}
