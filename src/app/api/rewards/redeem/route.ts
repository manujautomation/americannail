import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createHmac, randomBytes } from "crypto";

const REDEEM_COST  = 100;
const REDEEM_VALUE = 5;

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Cryptographically unpredictable code: HMAC(secret, userId+timestamp+nonce)
// Format: ANS-<6 hex chars from HMAC>-<4 random hex chars>
// No sequential pattern, cannot be reverse-engineered without the secret key
function generateSecureCode(userId: string): string {
  const secret = process.env.COUPON_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const nonce  = randomBytes(8).toString("hex");
  const ts     = Date.now().toString();
  const hmac   = createHmac("sha256", secret)
    .update(`${userId}:${ts}:${nonce}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
  return `ANS-${hmac.slice(0, 5)}-${hmac.slice(5)}`;
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

  // Generate secure code and expiry
  const code      = generateSecureCode(user.id);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  // Deduct points atomically first
  await db.rpc("decrement_reward_points", {
    p_customer_id: user.id,
    p_amount: REDEEM_COST,
  });

  // Create coupon — store customer_id so admin can see who redeemed
  await db.from("coupons").insert({
    code,
    description:    `$${REDEEM_VALUE} reward redemption`,
    discount_type:  "fixed",
    discount_value: REDEEM_VALUE,
    usage_limit:    1,
    times_used:     0,
    is_active:      true,
    expires_at:     expiresAt,
    metadata:       { redeemed_by: user.id, redeemed_at: new Date().toISOString(), type: "loyalty_reward" },
  });

  // Audit log
  await db.from("reward_history").insert({
    customer_id: user.id,
    type:        "redeemed",
    points:      -REDEEM_COST,
    description: `Redeemed for $${REDEEM_VALUE} coupon (${code})`,
  });

  return NextResponse.json({ ok: true, code, value: REDEEM_VALUE, expiresAt });
}
