import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Keep-alive endpoint — called by Vercel Cron every 3 days
// Prevents Supabase free-tier project from going dormant
export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("locations").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[ping] Supabase health check failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
