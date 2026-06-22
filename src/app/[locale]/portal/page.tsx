import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import PortalDashboard from "@/components/portal/PortalDashboard";

type ApptRow = {
  id: string;
  reference: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  service_id: string;
};

type PointsRow = {
  balance: number;
  lifetime_earned: number;
};

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/portal/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("role, first_name, last_name, email, phone")
    .eq("id", user.id)
    .single();

  if (!profileRaw) redirect("/en/portal/login");

  // Block staff from using customer portal
  if (["owner", "admin", "staff"].includes(profileRaw.role ?? "")) {
    redirect("/en/admin");
  }

  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any;

  const [appts, points] = await Promise.all([
    adminAny
      .from("appointments")
      .select("id, reference, status, appointment_date, appointment_time, created_at, service_id")
      .eq("customer_id", user.id)
      .order("appointment_date", { ascending: false })
      .limit(20),
    adminAny
      .from("reward_points")
      .select("balance, lifetime_earned")
      .eq("customer_id", user.id)
      .single(),
  ]);

  return (
    <PortalDashboard
      profile={profileRaw}
      appointments={(appts.data ?? []) as ApptRow[]}
      points={(points.data ?? { balance: 0, lifetime_earned: 0 }) as PointsRow}
    />
  );
}
