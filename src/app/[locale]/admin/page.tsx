import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profileRaw || !["owner", "admin", "staff"].includes(profileRaw.role ?? "")) {
    redirect("/en/admin/login");
  }

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const [appts, msgs, subs, employees, inventory, reviews, customers] = await Promise.all([
    db.from("appointments")
      .select("id, status, created_at, first_name, last_name, appointment_date, appointment_time, reference, phone, email, notes, employee_id, service_id, customer_id")
      .order("appointment_date", { ascending: false })
      .limit(50),
    db.from("messages")
      .select("id, name, phone, email, message, status, created_at, reference, preferred_date, preferred_time")
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("newsletter_subscribers")
      .select("id", { count: "exact", head: true }),
    db.from("employees")
      .select("id, display_name, role, specialty, years_experience, is_active, sort_order")
      .order("sort_order"),
    db.from("inventory")
      .select("id, name, category, current_qty, min_qty, retail_price, purchase_price, supplier_id, storage_location, is_active")
      .order("category")
      .limit(100),
    db.from("reviews")
      .select("id, customer_name, rating, text, service_name, source, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    // Derive customers from unique emails/phones in appointments
    db.from("appointments")
      .select("first_name, last_name, phone, email, created_at, status")
      .not("phone", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const appointments = appts.data ?? [];
  const messages = msgs.data ?? [];

  // Deduplicate customers by phone
  const seen = new Set<string>();
  const uniqueCustomers = ((customers.data ?? []) as Array<{
    first_name: string; last_name: string; phone: string;
    email: string | null; created_at: string; status: string;
  }>).filter((c) => {
    if (seen.has(c.phone)) return false;
    seen.add(c.phone);
    return true;
  });

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a: { status: string }) => a.status === "pending").length,
    newMessages: messages.filter((m: { status: string }) => m.status === "new").length,
    subscribers: (subs.count as number) ?? 0,
    totalCustomers: uniqueCustomers.length,
    lowStock: (inventory.data ?? []).filter((i: { current_qty: number; min_qty: number }) => i.current_qty <= i.min_qty).length,
  };

  return (
    <AdminDashboard
      profile={profileRaw}
      appointments={appointments}
      messages={messages}
      employees={employees.data ?? []}
      inventory={inventory.data ?? []}
      reviews={reviews.data ?? []}
      customers={uniqueCustomers}
      stats={stats}
    />
  );
}
