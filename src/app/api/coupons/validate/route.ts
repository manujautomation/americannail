import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/coupons/validate?code=ANS-XXXXX-XXXXX
// Used by admin dashboard to look up a coupon before applying it
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const db = adminDb();
  const { data, error } = await db
    .from("coupons")
    .select("id, code, description, discount_type, discount_value, usage_limit, times_used, expires_at, is_active, metadata")
    .eq("code", code)
    .single();

  if (error || !data) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });

  // Validation checks
  if (!data.is_active)
    return NextResponse.json({ valid: false, error: "Coupon has already been used or deactivated" }, { status: 400 });
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return NextResponse.json({ valid: false, error: "Coupon has expired" }, { status: 400 });
  if (data.usage_limit !== null && (data.times_used ?? 0) >= data.usage_limit)
    return NextResponse.json({ valid: false, error: "Coupon has already been used" }, { status: 400 });

  // Fetch customer name if this is a loyalty redemption coupon
  let customerName: string | null = null;
  const redeemedBy = (data.metadata as Record<string, string> | null)?.redeemed_by;
  if (redeemedBy) {
    const { data: profile } = await db
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", redeemedBy)
      .single();
    if (profile) {
      customerName = `${profile.first_name} ${profile.last_name ?? ""}`.trim() || profile.email;
    }
  }

  return NextResponse.json({
    valid: true,
    id:            data.id,
    code:          data.code,
    description:   data.description,
    discountType:  data.discount_type,
    discountValue: data.discount_value,
    expiresAt:     data.expires_at,
    customerName,
    isLoyaltyReward: (data.metadata as Record<string, string> | null)?.type === "loyalty_reward",
  });
}

// POST /api/coupons/validate — admin applies coupon (marks used + audit log)
export async function POST(req: NextRequest) {
  // Verify caller is staff
  const supabase = await createServerClient();
  const { data: { user: staffUser } } = await supabase.auth.getUser();
  if (!staffUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json() as { code: string };
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const db = adminDb();
  const cleanCode = code.toUpperCase().trim();

  const { data, error } = await db
    .from("coupons")
    .select("id, usage_limit, times_used, expires_at, is_active, discount_value, metadata")
    .eq("code", cleanCode)
    .single();

  if (error || !data) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: "Coupon has already been used or deactivated" }, { status: 400 });
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });

  const timesUsed = data.times_used ?? 0;
  if (data.usage_limit !== null && timesUsed >= data.usage_limit)
    return NextResponse.json({ error: "Coupon has already been used" }, { status: 400 });

  const newTimesUsed = timesUsed + 1;
  const nowExhausted = data.usage_limit !== null && newTimesUsed >= data.usage_limit;

  // Mark used
  await db.from("coupons").update({
    times_used: newTimesUsed,
    is_active:  !nowExhausted,
  }).eq("id", data.id);

  // Audit log — who applied it and when
  await db.from("audit_logs").insert({
    actor_id:   staffUser.id,
    action:     "coupon_applied",
    table_name: "coupons",
    record_id:  data.id,
    new_data:   {
      code:       cleanCode,
      applied_by: staffUser.id,
      applied_at: new Date().toISOString(),
      discount:   data.discount_value,
      redeemed_by: (data.metadata as Record<string, string> | null)?.redeemed_by ?? null,
    },
  });

  return NextResponse.json({ ok: true, consumed: true, discount: data.discount_value });
}
