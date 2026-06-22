import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Upsert — re-subscribes if previously unsubscribed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("newsletter_subscribers")
      .upsert(
        { email: parsed.data.email, location_id: LOCATION_ID, status: "active" },
        { onConflict: "email,location_id" }
      );

    if (error) {
      console.error("[newsletter] upsert error:", error);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[newsletter] unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
