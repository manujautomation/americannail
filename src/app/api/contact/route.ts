import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";

const contactSchema = z.object({
  name:          z.string().min(1).max(100),
  phone:         z.string().min(7).max(20),
  email:         z.string().email().optional().or(z.literal("")),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  preferredTime: z.string().optional().or(z.literal("")),
  message:       z.string().min(1).max(1000),
  source:        z.enum(["concierge", "contact_form", "website"]).default("concierge"),
});

function generateRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "MSG-";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = await createAdminClient();
    const reference = generateRef();

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        location_id:    LOCATION_ID,
        reference,
        name:           data.name,
        phone:          data.phone,
        email:          data.email || null,
        preferred_date: data.preferredDate || null,
        preferred_time: data.preferredTime ? `${data.preferredTime}:00` : null,
        message:        data.message,
        status:         "new",
        source:         data.source,
      })
      .select("id, reference")
      .single();

    if (error) {
      console.error("[contact] insert error:", error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reference: msg.reference }, { status: 201 });
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
