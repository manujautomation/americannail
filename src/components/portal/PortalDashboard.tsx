"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import {
  CalendarDays, Star, LogOut, ChevronRight,
  Sparkles, Clock, CheckCircle, XCircle, User,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";

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

type Tab = "home" | "appointments" | "rewards";

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:   <Clock size={13} className="text-amber-500" />,
  confirmed: <CheckCircle size={13} className="text-green-500" />,
  completed: <CheckCircle size={13} className="text-slate-400" />,
  cancelled: <XCircle size={13} className="text-red-400" />,
  no_show:   <XCircle size={13} className="text-red-300" />,
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show:   "No Show",
};

function serviceName(serviceId: string) {
  const svc = SERVICES.find((s) => s.id === serviceId);
  return svc ? svc.nameKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Service";
}

function AppointmentCard({ a }: { a: ApptRow }) {
  const isPast = new Date(a.appointment_date) < new Date();
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{
        boxShadow: "0 2px 16px rgba(183,110,121,0.07)",
        borderLeft: !isPast && a.status === "confirmed" ? "3px solid #22c55e" : !isPast && a.status === "pending" ? "3px solid #C9A96E" : "3px solid transparent",
        opacity: a.status === "cancelled" ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-charcoal text-sm">{serviceName(a.service_id)}</p>
          <p className="text-xs text-muted mt-0.5">
            {new Date(a.appointment_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {" · "}
            {a.appointment_time.slice(0, 5)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8C7B7B" }}>
          {STATUS_ICON[a.status]}
          {STATUS_LABEL[a.status] ?? a.status}
        </div>
      </div>
      <p className="text-[11px] font-mono mt-2" style={{ color: "rgba(140,123,123,0.6)" }}>{a.reference}</p>
    </div>
  );
}

export default function PortalDashboard({
  profile,
  appointments,
  points,
}: {
  profile: { first_name: string; last_name: string | null; email: string; phone: string | null };
  appointments: ApptRow[];
  points: PointsRow;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("home");

  const upcoming = appointments.filter((a) =>
    new Date(a.appointment_date) >= new Date() && !["cancelled", "no_show"].includes(a.status)
  );
  const past = appointments.filter((a) =>
    new Date(a.appointment_date) < new Date() || ["cancelled", "no_show"].includes(a.status)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/en/portal/login");
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home",         label: "Home",         icon: <Sparkles size={15} /> },
    { id: "appointments", label: "Appointments",  icon: <CalendarDays size={15} /> },
    { id: "rewards",      label: "Rewards",       icon: <Star size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F2" }}>
      {/* Header */}
      <header
        className="bg-white border-b sticky top-0 z-20"
        style={{ borderColor: "rgba(183,110,121,0.1)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo variant="dark" size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">
              {profile.first_name} {profile.last_name ?? ""}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div
          className="flex gap-1 bg-white rounded-2xl p-1.5 mb-8"
          style={{ boxShadow: "0 2px 12px rgba(183,110,121,0.07)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "linear-gradient(135deg, #B76E79, #C9A96E)" : "transparent",
                color: tab === t.id ? "white" : "#8C7B7B",
              }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Home */}
        {tab === "home" && (
          <div className="space-y-6">
            {/* Welcome card */}
            <motion.div
              className="rounded-3xl p-8 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #B76E79 0%, #C9A96E 100%)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%, -30%)" }}
              />
              <p className="text-white/70 text-sm mb-1">Welcome back</p>
              <h1
                className="text-3xl font-light mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {profile.first_name} {profile.last_name ?? ""}
              </h1>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-semibold">{points.balance}</p>
                  <p className="text-white/70 text-xs">Points balance</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-semibold">{points.lifetime_earned}</p>
                  <p className="text-white/70 text-xs">Lifetime earned</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-semibold">{appointments.filter((a) => a.status === "completed").length}</p>
                  <p className="text-white/70 text-xs">Visits</p>
                </div>
              </div>
            </motion.div>

            {/* Upcoming */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-charcoal text-sm">Upcoming Appointments</h2>
                {upcoming.length > 0 && (
                  <button
                    onClick={() => setTab("appointments")}
                    className="text-xs flex items-center gap-1"
                    style={{ color: "#B76E79" }}
                  >
                    View all <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {upcoming.length === 0 ? (
                <div
                  className="bg-white rounded-2xl p-8 text-center"
                  style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
                >
                  <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "rgba(183,110,121,0.3)" }} />
                  <p className="text-sm text-muted mb-4">No upcoming appointments</p>
                  <a
                    href="/en#booking"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                  >
                    Book Now
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 2).map((a) => <AppointmentCard key={a.id} a={a} />)}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Book Appointment", icon: <CalendarDays size={18} />, href: "/en#booking" },
                { label: "My Rewards",       icon: <Star size={18} />,         onClick: () => setTab("rewards") },
              ].map((item) => (
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md"
                    style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
                  >
                    <span style={{ color: "#B76E79" }}>{item.icon}</span>
                    <span className="text-sm font-medium text-charcoal">{item.label}</span>
                  </a>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md"
                    style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
                  >
                    <span style={{ color: "#B76E79" }}>{item.icon}</span>
                    <span className="text-sm font-medium text-charcoal">{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* Appointments */}
        {tab === "appointments" && (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-medium text-charcoal text-sm mb-3">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map((a) => <AppointmentCard key={a.id} a={a} />)}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="font-medium text-charcoal text-sm mb-3">Past</h2>
                <div className="space-y-3">
                  {past.map((a) => <AppointmentCard key={a.id} a={a} />)}
                </div>
              </div>
            )}

            {appointments.length === 0 && (
              <div
                className="bg-white rounded-2xl p-12 text-center"
                style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
              >
                <CalendarDays size={36} className="mx-auto mb-3" style={{ color: "rgba(183,110,121,0.3)" }} />
                <p className="text-sm text-muted mb-4">No appointments yet</p>
                <a
                  href="/en#booking"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                  style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                >
                  Book Your First Visit
                </a>
              </div>
            )}
          </div>
        )}

        {/* Rewards */}
        {tab === "rewards" && (
          <div className="space-y-5">
            {/* Balance card */}
            <motion.div
              className="rounded-3xl p-8 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #C9A96E 0%, #B76E79 100%)" }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div
                className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%, 30%)" }}
              />
              <Star size={28} className="mb-4 opacity-80" />
              <p className="text-5xl font-light mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {points.balance}
              </p>
              <p className="text-white/70 text-sm">Points available</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Lifetime Earned",  value: points.lifetime_earned },
                { label: "Visits Completed", value: appointments.filter((a) => a.status === "completed").length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl p-5 text-center"
                  style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
                >
                  <p className="text-2xl font-semibold text-charcoal">{s.value}</p>
                  <p className="text-xs text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
            >
              <h3 className="font-medium text-charcoal mb-4 text-sm">How Rewards Work</h3>
              <div className="space-y-4">
                {[
                  { pts: "10 pts", label: "Earned per visit" },
                  { pts: "Bonus", label: "Extra points for referrals & birthdays" },
                  { pts: "100 pts", label: "= $5 off your next service" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div
                      className="w-14 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(183,110,121,0.1)", color: "#B76E79" }}
                    >
                      {row.pts}
                    </div>
                    <p className="text-sm text-charcoal">{row.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-4 text-center text-xs"
              style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", color: "#8C7B7B" }}
            >
              Rewards redemption coming soon — ask our team at your next visit!
            </div>
          </div>
        )}

        {/* Profile footer */}
        <div
          className="mt-8 bg-white rounded-2xl p-5 flex items-center justify-between"
          style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
            >
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{profile.first_name} {profile.last_name ?? ""}</p>
              <p className="text-xs text-muted">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs flex items-center gap-1.5 transition-colors"
            style={{ color: "#8C7B7B" }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
