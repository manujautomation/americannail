import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  email:     z.string().email(),
  password:  z.string().min(6),
  firstName: z.string().min(1).max(80),
  lastName:  z.string().max(80).optional().default(""),
  phone:     z.string().max(20).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    // Use standard supabase-js client with service role key for admin auth operations
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create user via admin API — bypasses email confirmation requirement
    const { data: userData, error: createError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, phone },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Ensure profile row exists with correct role
    await db.from("profiles").upsert({
      id:         userData.user.id,
      email,
      role:       "customer",
      first_name: firstName,
      last_name:  lastName,
      phone:      phone || null,
    }, { onConflict: "id" });

    // Seed reward_points row
    await db.from("reward_points").upsert({
      customer_id:     userData.user.id,
      balance:         0,
      lifetime_earned: 0,
    }, { onConflict: "customer_id", ignoreDuplicates: true });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
