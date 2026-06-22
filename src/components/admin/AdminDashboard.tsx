"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import {
  CalendarDays, MessageSquare, Users, TrendingUp,
  LogOut, Bell, CheckCircle, Clock, XCircle, ChevronRight,
} from "lucide-react";

type Appointment = {
  id: string;
  reference: string;
  status: string;
  first_name: string;
  last_name: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
};

type Message = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
};

type Stats = {
  totalAppointments: number;
  pendingAppointments: number;
  newMessages: number;
  subscribers: number;
};

type Tab = "overview" | "appointments" | "messages";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: "Pending",   bg: "rgba(201,169,110,0.12)", color: "#C9A96E" },
    confirmed: { label: "Confirmed", bg: "rgba(34,197,94,0.1)",    color: "#16a34a" },
    cancelled: { label: "Cancelled", bg: "rgba(239,68,68,0.1)",    color: "#dc2626" },
    completed: { label: "Completed", bg: "rgba(100,116,139,0.1)",  color: "#475569" },
    new:       { label: "New",       bg: "rgba(183,110,121,0.12)", color: "#B76E79" },
    read:      { label: "Read",      bg: "rgba(100,116,139,0.1)",  color: "#475569" },
    replied:   { label: "Replied",   bg: "rgba(34,197,94,0.1)",    color: "#16a34a" },
  };
  const s = map[status] ?? { label: status, bg: "rgba(0,0,0,0.05)", color: "#666" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 flex items-start gap-4"
      style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(183,110,121,0.1)" }}
      >
        <span style={{ color: "#B76E79" }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-charcoal">{value}</p>
        <p className="text-xs text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[11px] mt-1 font-medium" style={{ color: "#B76E79" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard({
  profile,
  appointments,
  messages,
  stats,
}: {
  profile: { role: string | null; first_name: string; last_name: string | null };
  appointments: Appointment[];
  messages: Message[];
  stats: Stats;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [apptList, setApptList] = useState(appointments);
  const [msgList, setMsgList] = useState(messages);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/en/admin/login");
  };

  const updateApptStatus = async (id: string, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("appointments").update({ status }).eq("id", id);
    setApptList((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const markMessageRead = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("messages").update({ status: "read" }).eq("id", id);
    setMsgList((prev) => prev.map((m) => m.id === id ? { ...m, status: "read" } : m));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview",     label: "Overview",     icon: <TrendingUp size={15} /> },
    { id: "appointments", label: "Appointments", icon: <CalendarDays size={15} /> },
    { id: "messages",     label: "Messages",     icon: <MessageSquare size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F2" }}>
      {/* Top nav */}
      <header
        className="bg-white border-b sticky top-0 z-20"
        style={{ borderColor: "rgba(183,110,121,0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="dark" size="sm" />
            <span
              className="text-[11px] tracking-[0.2em] uppercase font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(183,110,121,0.1)", color: "#B76E79" }}
            >
              {profile.role ?? "staff"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {stats.pendingAppointments + stats.newMessages > 0 && (
              <div className="relative">
                <Bell size={18} style={{ color: "#8C7B7B" }} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                  style={{ background: "#B76E79" }}
                >
                  {stats.pendingAppointments + stats.newMessages}
                </span>
              </div>
            )}
            <span className="text-sm text-muted hidden sm:block">
              {profile.first_name} {profile.last_name ?? ""}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1
            className="font-heading text-3xl font-light text-charcoal"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">American Nails &amp; Spa — Stephens City, VA</p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 bg-white rounded-2xl p-1.5 mb-8 w-fit"
          style={{ boxShadow: "0 2px 12px rgba(183,110,121,0.07)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "linear-gradient(135deg, #B76E79, #C9A96E)" : "transparent",
                color: tab === t.id ? "white" : "#8C7B7B",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<CalendarDays size={20} />} label="Total Bookings" value={stats.totalAppointments} />
              <StatCard icon={<Clock size={20} />} label="Pending Approval" value={stats.pendingAppointments} sub={stats.pendingAppointments > 0 ? "Action required" : undefined} />
              <StatCard icon={<MessageSquare size={20} />} label="New Messages" value={stats.newMessages} sub={stats.newMessages > 0 ? "Unread" : undefined} />
              <StatCard icon={<Users size={20} />} label="Subscribers" value={stats.subscribers} />
            </div>

            {/* Recent appointments */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: "rgba(183,110,121,0.08)" }}
              >
                <h2 className="font-medium text-charcoal">Recent Appointments</h2>
                <button
                  onClick={() => setTab("appointments")}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: "#B76E79" }}
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
                {apptList.slice(0, 5).map((a) => (
                  <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {a.first_name} {a.last_name}
                      </p>
                      <p className="text-xs text-muted">
                        {a.appointment_date} · {a.appointment_time.slice(0, 5)} ·{" "}
                        <span className="font-mono">{a.reference}</span>
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
                {apptList.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-muted">No appointments yet</p>
                )}
              </div>
            </div>

            {/* Recent messages */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: "rgba(183,110,121,0.08)" }}
              >
                <h2 className="font-medium text-charcoal">Recent Messages</h2>
                <button
                  onClick={() => setTab("messages")}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: "#B76E79" }}
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y">
                {msgList.slice(0, 3).map((m) => (
                  <div key={m.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-charcoal">{m.name}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-xs text-muted truncate">{m.message}</p>
                      <p className="text-xs text-muted mt-0.5">{m.phone}</p>
                    </div>
                  </div>
                ))}
                {msgList.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-muted">No messages yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments tab */}
        {tab === "appointments" && (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: "rgba(183,110,121,0.08)" }}
            >
              <h2 className="font-medium text-charcoal">All Appointments ({apptList.length})</h2>
            </div>
            <div className="divide-y overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(248,243,242,0.8)" }}>
                    {["Reference", "Name", "Date", "Time", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[11px] tracking-wider uppercase font-medium"
                        style={{ color: "#8C7B7B" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
                  {apptList.map((a) => (
                    <tr key={a.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted">{a.reference}</td>
                      <td className="px-6 py-4 font-medium text-charcoal whitespace-nowrap">
                        {a.first_name} {a.last_name}
                      </td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">{a.appointment_date}</td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">{a.appointment_time.slice(0, 5)}</td>
                      <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {a.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateApptStatus(a.id, "confirmed")}
                                className="p-1.5 rounded-lg transition-colors hover:bg-green-50"
                                title="Confirm"
                              >
                                <CheckCircle size={15} className="text-green-600" />
                              </button>
                              <button
                                onClick={() => updateApptStatus(a.id, "cancelled")}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                title="Cancel"
                              >
                                <XCircle size={15} className="text-red-500" />
                              </button>
                            </>
                          )}
                          {a.status === "confirmed" && (
                            <button
                              onClick={() => updateApptStatus(a.id, "completed")}
                              className="text-[11px] px-3 py-1 rounded-full border transition-colors"
                              style={{ borderColor: "rgba(183,110,121,0.2)", color: "#B76E79" }}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apptList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">
                        No appointments yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages tab */}
        {tab === "messages" && (
          <div className="space-y-4">
            {msgList.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-6"
                style={{
                  boxShadow: "0 2px 16px rgba(183,110,121,0.07)",
                  borderLeft: m.status === "new" ? "3px solid #B76E79" : "3px solid transparent",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-charcoal">{m.name}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-muted">{m.phone} · <span className="font-mono">{m.reference}</span></p>
                  </div>
                  <p className="text-xs text-muted whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-charcoal leading-relaxed mb-4">{m.message}</p>
                {m.status === "new" && (
                  <button
                    onClick={() => markMessageRead(m.id)}
                    className="text-xs px-4 py-2 rounded-full border transition-all hover:bg-rose-50"
                    style={{ borderColor: "rgba(183,110,121,0.25)", color: "#B76E79" }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
            {msgList.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
                <MessageSquare size={36} className="mx-auto mb-3" style={{ color: "rgba(183,110,121,0.3)" }} />
                <p className="text-sm text-muted">No messages yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
