import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireStaff() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

const lineSchema = z.object({
  inventory_id: z.string().uuid(),
  qty_ordered:  z.number().int().min(1),
  unit_cost:    z.number().min(0),
});

const poSchema = z.object({
  supplier_name: z.string().min(1).max(200),
  notes:         z.string().max(500).optional().default(""),
  lines:         z.array(lineSchema).min(1),
});

// GET — list purchase orders
export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  const { data, error } = await db
    .from("purchase_orders")
    .select("*, purchase_order_lines(*, inventory(name, category))")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

// POST — create purchase order
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = poSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const db = adminDb();
  const total = parsed.data.lines.reduce((s, l) => s + l.qty_ordered * l.unit_cost, 0);
  const { data: po, error } = await db.from("purchase_orders").insert({
    supplier_name: parsed.data.supplier_name,
    notes:         parsed.data.notes,
    status:        "pending",
    total_cost:    total,
    created_by:    user.id,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const lines = parsed.data.lines.map((l) => ({ ...l, purchase_order_id: po.id, qty_received: 0 }));
  await db.from("purchase_order_lines").insert(lines);
  return NextResponse.json({ order: po }, { status: 201 });
}

// PATCH — mark order received (updates stock)
export async function PATCH(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = adminDb();
  // Fetch lines to increment inventory
  const { data: lines } = await db
    .from("purchase_order_lines")
    .select("inventory_id, qty_ordered")
    .eq("purchase_order_id", id);
  if (lines) {
    for (const line of lines) {
      await db.rpc("increment_inventory_qty", { p_inventory_id: line.inventory_id, p_amount: line.qty_ordered });
      await db.from("purchase_order_lines").update({ qty_received: line.qty_ordered }).eq("purchase_order_id", id).eq("inventory_id", line.inventory_id);
    }
  }
  await db.from("purchase_orders").update({ status: "received", received_at: new Date().toISOString(), received_by: user.id }).eq("id", id);
  return NextResponse.json({ ok: true });
}
