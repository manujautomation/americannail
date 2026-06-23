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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Call Supabase Auth Admin REST API directly — bypasses SDK wrapper issues
    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey":        serviceKey,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm:  true,
        user_metadata: { first_name: firstName, last_name: lastName, phone },
      }),
    });

    const authBody = await authRes.json() as Record<string, unknown>;

    if (!authRes.ok) {
      console.error("[register] Supabase auth REST error:", authRes.status, JSON.stringify(authBody));
      return NextResponse.json({
        error: (authBody?.msg as string) || (authBody?.message as string) || (authBody?.error_description as string) || JSON.stringify(authBody),
        supabaseStatus: authRes.status,
        raw: authBody,
      }, { status: 400 });
    }

    const userId = (authBody as { id: string }).id;

    // Use service-role client for DB writes
    const db = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await db.from("profiles").upsert({
      id:         userId,
      email,
      role:       "customer",
      first_name: firstName,
      last_name:  lastName,
      phone:      phone || null,
    }, { onConflict: "id" });

    await db.from("reward_points").upsert({
      customer_id:     userId,
      balance:         0,
      lifetime_earned: 0,
    }, { onConflict: "customer_id", ignoreDuplicates: true });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
