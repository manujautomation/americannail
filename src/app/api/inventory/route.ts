import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const LOCATION_ID = "00000000-0000-0000-0000-000000000001";

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

const itemSchema = z.object({
  name:             z.string().min(1).max(200),
  sku:              z.string().max(100).optional().default(""),
  category:         z.string().min(1).max(100),
  current_qty:      z.number().int().min(0),
  min_qty:          z.number().int().min(0),
  purchase_price:   z.number().min(0).optional().nullable(),
  retail_price:     z.number().min(0).optional().nullable(),
  storage_location: z.string().max(100).optional().nullable(),
  supplier_id:      z.string().uuid().optional().nullable(),
});

// GET — list all inventory
export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  const { data, error } = await db
    .from("inventory")
    .select("*")
    .eq("location_id", LOCATION_ID)
    .order("category")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

// POST — create item
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const db = adminDb();
  const { data, error } = await db.from("inventory").insert({ ...parsed.data, location_id: LOCATION_ID, is_active: true }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

// PATCH — update item (qty, fields)
export async function PATCH(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...fields } = await req.json() as { id: string; [key: string]: unknown };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = adminDb();
  const { data, error } = await db.from("inventory").update(fields).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

// DELETE — soft delete (set is_active = false)
export async function DELETE(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = adminDb();
  await db.from("inventory").update({ is_active: false }).eq("id", id);
  return NextResponse.json({ ok: true });
}
