import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendLowStockAlert } from "@/lib/email";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";
// Default supplier UUID from seed data — used when no specific supplier is selected
const DEFAULT_SUPPLIER_ID = "50000000-0000-0000-0000-000000000001";

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

function generateRef() {
  const now = new Date();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `PO-${now.getFullYear()}-${rand}`;
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
    .select("*, purchase_order_items(*, inventory(name, category))")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Normalize to consistent shape for UI
  const orders = (data ?? []).map((po) => ({
    ...po,
    supplier_name: po.notes?.match(/^Supplier: (.+?)\n/)?.[1] ?? "—",
    notes: po.notes?.replace(/^Supplier: .+?\n/, "") ?? po.notes,
    total_cost: po.total_amount,
    purchase_order_lines: po.purchase_order_items ?? [],
  }));
  return NextResponse.json({ orders });
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
  const reference = generateRef();
  // Store supplier name inside notes with a prefix so we can extract it
  const notesValue = `Supplier: ${parsed.data.supplier_name}\n${parsed.data.notes}`.trim();

  const { data: po, error } = await db.from("purchase_orders").insert({
    location_id:  LOCATION_ID,
    supplier_id:  DEFAULT_SUPPLIER_ID,
    reference,
    notes:        notesValue,
    status:       "pending",
    total_amount: total,
    ordered_at:   new Date().toISOString(),
    created_by:   user.id,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lines = parsed.data.lines.map((l) => ({
    purchase_order_id: po.id,
    inventory_id:      l.inventory_id,
    qty_ordered:       l.qty_ordered,
    qty_received:      0,
    unit_price:        l.unit_cost,
  }));
  await db.from("purchase_order_items").insert(lines);

  return NextResponse.json({ order: { ...po, supplier_name: parsed.data.supplier_name, total_cost: total } }, { status: 201 });
}

// PATCH — mark order received (updates stock)
export async function PATCH(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = adminDb();
  const { data: lines } = await db
    .from("purchase_order_items")
    .select("inventory_id, qty_ordered")
    .eq("purchase_order_id", id);
  if (lines) {
    for (const line of lines) {
      await db.rpc("increment_inventory_qty", { p_inventory_id: line.inventory_id, p_amount: line.qty_ordered });
      await db.from("purchase_order_items").update({ qty_received: line.qty_ordered }).eq("purchase_order_id", id).eq("inventory_id", line.inventory_id);
    }
  }
  await db.from("purchase_orders").update({ status: "received", received_at: new Date().toISOString() }).eq("id", id);
  // Alert if any items still low after receiving
  const { data: stillLow } = await db.from("inventory").select("name,category,current_qty,min_qty").filter("current_qty", "lte", "min_qty").eq("is_active", true);
  if (stillLow?.length) sendLowStockAlert(stillLow).catch(() => {});
  return NextResponse.json({ ok: true });
}
