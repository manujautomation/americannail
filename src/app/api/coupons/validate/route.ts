import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/coupons/validate?code=ANS-XXXXXXXX
// Returns coupon details if valid, error if not
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const db = adminDb();
  const { data, error } = await db
    .from("coupons")
    .select("id, code, discount_type, discount_value, usage_limit, times_used, expires_at, is_active")
    .eq("code", code)
    .single();

  if (error || !data) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 });
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
  if (data.usage_limit !== null && (data.times_used ?? 0) >= data.usage_limit)
    return NextResponse.json({ error: "Coupon has already been used" }, { status: 400 });

  return NextResponse.json({
    valid: true,
    id: data.id,
    code: data.code,
    discountType: data.discount_type,
    discountValue: data.discount_value,
  });
}

// POST /api/coupons/validate — consume (mark used) after booking confirmed
export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code: string };
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const db = adminDb();

  // Re-validate before consuming
  const { data, error } = await db
    .from("coupons")
    .select("id, usage_limit, times_used, expires_at, is_active")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (error || !data) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 });
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });

  const timesUsed = data.times_used ?? 0;
  if (data.usage_limit !== null && timesUsed >= data.usage_limit)
    return NextResponse.json({ error: "Coupon has already been used" }, { status: 400 });

  // Increment times_used; deactivate if now at limit
  const newTimesUsed = timesUsed + 1;
  const nowExhausted = data.usage_limit !== null && newTimesUsed >= data.usage_limit;

  await db.from("coupons").update({
    times_used: newTimesUsed,
    ...(nowExhausted ? { is_active: false } : {}),
  }).eq("id", data.id);

  return NextResponse.json({ ok: true, consumed: true });
}
