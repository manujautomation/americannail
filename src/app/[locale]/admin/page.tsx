import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

type ProfileRow = { role: string | null; first_name: string; last_name: string | null };
type ApptRow = { id: string; status: string; created_at: string; first_name: string; last_name: string; appointment_date: string; appointment_time: string; reference: string };
type MsgRow = { id: string; name: string; phone: string; message: string; status: string; created_at: string; reference: string };

export default async function AdminPage() {
  // Auth check with cookie-based client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as ProfileRow | null;

  if (!profile || !["owner", "admin", "staff"].includes(profile.role ?? "")) {
    redirect("/en/admin/login");
  }

  // Data fetching with admin client (bypasses RLS for staff dashboard)
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any;

  const [appts, msgs, subs] = await Promise.all([
    adminAny
      .from("appointments")
      .select("id, status, created_at, first_name, last_name, appointment_date, appointment_time, reference")
      .order("created_at", { ascending: false })
      .limit(20),
    adminAny
      .from("messages")
      .select("id, name, phone, message, status, created_at, reference")
      .order("created_at", { ascending: false })
      .limit(20),
    adminAny
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true }),
  ]);

  const appointments: ApptRow[] = appts.data ?? [];
  const messages: MsgRow[] = msgs.data ?? [];

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    newMessages: messages.filter((m) => m.status === "new").length,
    subscribers: (subs.count as number) ?? 0,
  };

  return (
    <AdminDashboard
      profile={profile}
      appointments={appointments}
      messages={messages}
      stats={stats}
    />
  );
}
