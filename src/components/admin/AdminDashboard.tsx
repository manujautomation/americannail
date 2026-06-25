"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import {
  CalendarDays, MessageSquare, Users, TrendingUp, LogOut, Bell,
  CheckCircle, Clock, XCircle, ChevronRight, Package, Star,
  UserCheck, AlertTriangle, Eye, EyeOff, Plus, Pencil, Trash2,
  ShoppingCart, ArrowDownCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Appointment = {
  id: string; reference: string; status: string; first_name: string; last_name: string;
  appointment_date: string; appointment_time: string; created_at: string;
  phone: string; email: string | null; notes: string | null; customer_id: string | null;
};
type Message = {
  id: string; reference: string; name: string; phone: string; email: string | null;
  message: string; status: string; created_at: string;
  preferred_date: string | null; preferred_time: string | null;
};
type Employee = {
  id: string; display_name: string; role: string; specialty: string | null;
  years_experience: number; is_active: boolean; sort_order: number;
};
type InventoryItem = {
  id: string; name: string; category: string; current_qty: number; min_qty: number;
  retail_price: number | null; purchase_price: number | null; storage_location: string | null; is_active: boolean;
};
type Review = {
  id: string; customer_name: string; rating: number; text: string;
  service_name: string | null; source: string; is_featured: boolean; created_at: string;
};
type Customer = {
  first_name: string; last_name: string; phone: string; email: string | null; created_at: string; status: string;
};
type Stats = {
  totalAppointments: number; pendingAppointments: number; newMessages: number;
  subscribers: number; totalCustomers: number; lowStock: number;
};

type PurchaseOrderLine = {
  id: string; inventory_id: string; qty_ordered: number; qty_received: number; unit_cost: number;
  inventory: { name: string; category: string } | null;
};
type PurchaseOrder = {
  id: string; supplier_name: string; status: string; total_cost: number;
  notes: string | null; created_at: string; received_at: string | null;
  purchase_order_lines: PurchaseOrderLine[];
};

type Tab = "overview" | "appointments" | "messages" | "customers" | "employees" | "inventory" | "reviews";

// ─── Small shared components ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: "Pending",   bg: "rgba(201,169,110,0.12)", color: "#C9A96E" },
    confirmed: { label: "Confirmed", bg: "rgba(34,197,94,0.1)",    color: "#16a34a" },
    cancelled: { label: "Cancelled", bg: "rgba(239,68,68,0.1)",    color: "#dc2626" },
    completed: { label: "Completed", bg: "rgba(100,116,139,0.1)",  color: "#475569" },
    no_show:   { label: "No Show",   bg: "rgba(239,68,68,0.08)",   color: "#b91c1c" },
    new:       { label: "New",       bg: "rgba(183,110,121,0.12)", color: "#B76E79" },
    read:      { label: "Read",      bg: "rgba(100,116,139,0.1)",  color: "#475569" },
    contacted: { label: "Contacted", bg: "rgba(34,197,94,0.1)",    color: "#16a34a" },
    booked:    { label: "Booked",    bg: "rgba(34,197,94,0.12)",   color: "#15803d" },
    closed:    { label: "Closed",    bg: "rgba(100,116,139,0.1)",  color: "#64748b" },
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

function StatCard({ icon, label, value, sub, alert }: {
  icon: React.ReactNode; label: string; value: number; sub?: string; alert?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-6 flex items-start gap-4"
      style={{
        boxShadow: "0 2px 16px rgba(183,110,121,0.07)",
        borderLeft: alert && value > 0 ? "3px solid #ef4444" : "3px solid transparent",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: alert && value > 0 ? "rgba(239,68,68,0.08)" : "rgba(183,110,121,0.1)" }}
      >
        <span style={{ color: alert && value > 0 ? "#ef4444" : "#B76E79" }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-charcoal">{value}</p>
        <p className="text-xs text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[11px] mt-1 font-medium" style={{ color: alert && value > 0 ? "#ef4444" : "#B76E79" }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, action, onAction }: {
  title: string; count?: number; action?: string; onAction?: () => void;
}) {
  return (
    <div
      className="px-6 py-4 flex items-center justify-between border-b"
      style={{ borderColor: "rgba(183,110,121,0.08)" }}
    >
      <h2 className="font-medium text-charcoal">
        {title}{count !== undefined && <span className="ml-2 text-muted font-normal text-sm">({count})</span>}
      </h2>
      {action && onAction && (
        <button onClick={onAction} className="text-xs flex items-center gap-1 transition-colors" style={{ color: "#B76E79" }}>
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard({
  profile, appointments, messages, employees, inventory, reviews, customers, stats,
}: {
  profile: { role: string | null; first_name: string; last_name: string | null };
  appointments: Appointment[];
  messages: Message[];
  employees: Employee[];
  inventory: InventoryItem[];
  reviews: Review[];
  customers: Customer[];
  stats: Stats;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [apptList, setApptList] = useState(appointments);
  const [msgList, setMsgList] = useState(messages);
  const [reviewList, setReviewList] = useState(reviews);

  // ── Inventory state ──
  const [invList, setInvList] = useState<InventoryItem[]>(inventory);
  const [invSubTab, setInvSubTab] = useState<"stock" | "orders">("stock");

  // Add/edit item modal
  const blankItem = { name: "", category: "", current_qty: 0, min_qty: 5, purchase_price: "", retail_price: "", storage_location: "" };
  const [itemModal, setItemModal] = useState<{ open: boolean; editing: InventoryItem | null; form: typeof blankItem }>({ open: false, editing: null, form: blankItem });
  const [itemSaving, setItemSaving] = useState(false);
  const [itemError, setItemError] = useState("");

  const openAddItem = () => setItemModal({ open: true, editing: null, form: blankItem });
  const openEditItem = (item: InventoryItem) => setItemModal({
    open: true, editing: item,
    form: { name: item.name, category: item.category, current_qty: item.current_qty, min_qty: item.min_qty, purchase_price: item.purchase_price?.toString() ?? "", retail_price: item.retail_price?.toString() ?? "", storage_location: item.storage_location ?? "" },
  });

  const saveItem = async () => {
    setItemSaving(true); setItemError("");
    const body = {
      ...itemModal.form,
      current_qty: Number(itemModal.form.current_qty),
      min_qty: Number(itemModal.form.min_qty),
      purchase_price: itemModal.form.purchase_price !== "" ? Number(itemModal.form.purchase_price) : null,
      retail_price: itemModal.form.retail_price !== "" ? Number(itemModal.form.retail_price) : null,
    };
    const method = itemModal.editing ? "PATCH" : "POST";
    const payload = itemModal.editing ? { ...body, id: itemModal.editing.id } : body;
    const res = await fetch("/api/inventory", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    setItemSaving(false);
    if (!res.ok) { setItemError(json.error ?? "Error saving item"); return; }
    if (itemModal.editing) {
      setInvList((prev) => prev.map((i) => i.id === json.item.id ? json.item : i));
    } else {
      setInvList((prev) => [...prev, json.item]);
    }
    setItemModal({ open: false, editing: null, form: blankItem });
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this item from inventory?")) return;
    await fetch("/api/inventory", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setInvList((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Purchase Orders state ──
  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [poLoaded, setPoLoaded] = useState(false);
  const [poLoading, setPoLoading] = useState(false);

  const loadPOs = async () => {
    if (poLoaded) return;
    setPoLoading(true);
    const res = await fetch("/api/purchase-orders");
    const json = await res.json();
    setPoLoading(false);
    setPoList(json.orders ?? []);
    setPoLoaded(true);
  };

  // New PO form
  const blankPO = { supplier_name: "", notes: "" };
  const blankPOLine = { inventory_id: "", qty_ordered: 1, unit_cost: 0 };
  const [poModal, setPoModal] = useState(false);
  const [poForm, setPoForm] = useState(blankPO);
  const [poLines, setPoLines] = useState([{ ...blankPOLine }]);
  const [poSaving, setPoSaving] = useState(false);
  const [poError, setPoError] = useState("");

  const addPOLine = () => setPoLines((prev) => [...prev, { ...blankPOLine }]);
  const removePOLine = (i: number) => setPoLines((prev) => prev.filter((_, idx) => idx !== i));

  const savePO = async () => {
    setPoSaving(true); setPoError("");
    const lines = poLines.filter((l) => l.inventory_id && l.qty_ordered > 0);
    if (!lines.length) { setPoError("Add at least one item"); setPoSaving(false); return; }
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...poForm, lines }),
    });
    const json = await res.json();
    setPoSaving(false);
    if (!res.ok) { setPoError(json.error ?? "Error"); return; }
    setPoList((prev) => [json.order, ...prev]);
    setPoModal(false); setPoForm(blankPO); setPoLines([{ ...blankPOLine }]);
  };

  const receivePO = async (id: string) => {
    if (!confirm("Mark this order as received? This will update stock quantities.")) return;
    const res = await fetch("/api/purchase-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) {
      setPoList((prev) => prev.map((po) => po.id === id ? { ...po, status: "received" } : po));
      // Refresh inventory counts
      const inv = await fetch("/api/inventory");
      const invJson = await inv.json();
      if (invJson.items) setInvList(invJson.items);
    }
  };

  // Coupon validator state
  type CouponResult = { valid: boolean; code: string; discountValue: number; description: string; customerName: string | null; expiresAt: string; isLoyaltyReward: boolean } | null;
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const couponInputRef = useRef<HTMLInputElement>(null);

  const lookupCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true); setCouponError(""); setCouponResult(null); setCouponApplied(false);
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
    const json = await res.json();
    setCouponLoading(false);
    if (!res.ok || !json.valid) { setCouponError(json.error ?? "Invalid coupon"); return; }
    setCouponResult(json);
  };

  // Mark Done modal state
  const [completingAppt, setCompletingAppt] = useState<{ id: string; name: string; hasCustomer: boolean } | null>(null);
  const [amountCharged, setAmountCharged] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeResult, setCompleteResult] = useState<{ pointsAwarded: number; resolvedName: string | null } | null>(null);

  const openCompleteModal = (id: string, firstName: string, lastName: string, hasCustomer: boolean) => {
    setCompletingAppt({ id, name: `${firstName} ${lastName}`.trim(), hasCustomer });
    setAmountCharged("");
    setCustomerEmail("");
    setCompleteResult(null);
  };

  const confirmComplete = async () => {
    if (!completingAppt) return;
    const amount = parseFloat(amountCharged);
    if (isNaN(amount) || amount < 0) return;
    setCompleteLoading(true);
    const res = await fetch("/api/appointments/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: completingAppt.id,
        amountCharged: amount,
        customerEmail: customerEmail.trim() || undefined,
      }),
    });
    const json = await res.json();
    setApptList((prev) => prev.map((a) => (a.id === completingAppt.id ? { ...a, status: "completed" } : a)));
    setCompleteLoading(false);
    setCompleteResult({ pointsAwarded: json.pointsAwarded ?? 0, resolvedName: json.resolvedName ?? null });
  };

  const applyCoupon = async () => {
    if (!couponResult) return;
    setCouponLoading(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponResult.code }),
    });
    const json = await res.json();
    setCouponLoading(false);
    if (!res.ok) { setCouponError(json.error ?? "Failed to apply"); return; }
    setCouponApplied(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/en/admin/login");
  };

  const updateApptStatus = async (id: string, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("appointments").update({ status }).eq("id", id);
    setApptList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateMsgStatus = async (id: string, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("messages").update({ status }).eq("id", id);
    setMsgList((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("reviews").update({ is_featured: !current }).eq("id", id);
    setReviewList((prev) => prev.map((r) => (r.id === id ? { ...r, is_featured: !current } : r)));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview",     label: "Overview",     icon: <TrendingUp size={15} /> },
    { id: "appointments", label: "Appointments", icon: <CalendarDays size={15} />, badge: stats.pendingAppointments },
    { id: "messages",     label: "Messages",     icon: <MessageSquare size={15} />, badge: stats.newMessages },
    { id: "customers",    label: "Customers",    icon: <Users size={15} /> },
    { id: "employees",    label: "Team",         icon: <UserCheck size={15} /> },
    { id: "inventory",    label: "Inventory",    icon: <Package size={15} />, badge: stats.lowStock },
    { id: "reviews",      label: "Reviews",      icon: <Star size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F2" }}>
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: "rgba(183,110,121,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="dark" size="sm" />
            <span
              className="text-[11px] tracking-[0.2em] uppercase font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(183,110,121,0.1)", color: "#B76E79" }}
            >
              {profile.role ?? "staff"}
            </span>
          </div>
          <div className="flex items-center gap-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-light text-charcoal" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">American Nails &amp; Spa — Stephens City, VA</p>
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div className="overflow-x-auto pb-1 mb-8">
          <div
            className="flex gap-1 bg-white rounded-2xl p-1.5 w-fit min-w-full sm:min-w-0"
            style={{ boxShadow: "0 2px 12px rgba(183,110,121,0.07)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: tab === t.id ? "linear-gradient(135deg, #B76E79, #C9A96E)" : "transparent",
                  color: tab === t.id ? "white" : "#8C7B7B",
                }}
              >
                {t.icon}
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: tab === t.id ? "rgba(255,255,255,0.35)" : "#B76E79" }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard icon={<CalendarDays size={20} />} label="Total Bookings"   value={stats.totalAppointments} />
              <StatCard icon={<Clock size={20} />}        label="Pending Approval" value={stats.pendingAppointments} sub={stats.pendingAppointments > 0 ? "Action required" : undefined} alert />
              <StatCard icon={<MessageSquare size={20} />} label="New Messages"    value={stats.newMessages} sub={stats.newMessages > 0 ? "Unread" : undefined} alert />
              <StatCard icon={<Users size={20} />}        label="Customers"        value={stats.totalCustomers} />
              <StatCard icon={<Package size={20} />}      label="Low Stock Items"  value={stats.lowStock} sub={stats.lowStock > 0 ? "Reorder needed" : undefined} alert />
              <StatCard icon={<Star size={20} />}         label="Subscribers"      value={stats.subscribers} />
            </div>

            {/* Recent appointments */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
              <SectionHeader title="Recent Appointments" count={apptList.length} action="View all" onAction={() => setTab("appointments")} />
              <div className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
                {apptList.slice(0, 5).map((a) => (
                  <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{a.first_name} {a.last_name}</p>
                      <p className="text-xs text-muted">
                        {a.appointment_date} · {a.appointment_time.slice(0, 5)} · <span className="font-mono">{a.reference}</span>
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
                {apptList.length === 0 && <p className="px-6 py-8 text-center text-sm text-muted">No appointments yet</p>}
              </div>
            </div>

            {/* Low stock alert */}
            {invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty).length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(239,68,68,0.08)" }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h2 className="font-medium text-charcoal">Low Stock Alert</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                      {invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty).length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const lowItems = invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty);
                        setPoLines(lowItems.map((i) => ({ inventory_id: i.id, qty_ordered: Math.max(1, i.min_qty - i.current_qty + i.min_qty), unit_cost: i.purchase_price ?? 0 })));
                        setTab("inventory");
                        setInvSubTab("orders");
                        setPoModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                      style={{ background: "#B76E79" }}
                    >
                      <ShoppingCart size={12} /> Quick Reorder
                    </button>
                    <button onClick={() => { setTab("inventory"); setInvSubTab("stock"); }} className="text-xs flex items-center gap-1" style={{ color: "#B76E79" }}>
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(239,68,68,0.06)" }}>
                  {invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty).map((i) => (
                    <div key={i.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-charcoal">{i.name}</p>
                        <p className="text-xs text-muted">{i.category}{i.storage_location ? ` · ${i.storage_location}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-500">{i.current_qty} left</p>
                        <p className="text-xs text-muted">min: {i.min_qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coupon Validator */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(183,110,121,0.08)" }}>
                <Star size={15} style={{ color: "#B76E79" }} />
                <h2 className="font-medium text-charcoal text-sm">Coupon Validator</h2>
                <span className="text-xs text-muted ml-1">— validate & apply customer reward codes at checkout</span>
              </div>
              <div className="p-6">
                {!couponApplied ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      <input
                        ref={couponInputRef}
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && lookupCoupon()}
                        placeholder="ANS-XXXXX-XXXXX"
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono outline-none tracking-wider"
                        style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                      />
                      <button
                        onClick={lookupCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                      >
                        {couponLoading ? "..." : "Check"}
                      </button>
                    </div>

                    {couponError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626" }}>
                        <XCircle size={15} /> {couponError}
                      </div>
                    )}

                    {couponResult && (
                      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="font-medium text-charcoal text-sm">Valid Coupon</span>
                          {couponResult.isLoyaltyReward && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(183,110,121,0.1)", color: "#B76E79" }}>Loyalty Reward</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="text-muted">Discount</p><p className="font-semibold text-charcoal text-base">${couponResult.discountValue} off</p></div>
                          <div><p className="text-muted">Expires</p><p className="font-medium text-charcoal">{new Date(couponResult.expiresAt).toLocaleDateString()}</p></div>
                          {couponResult.customerName && (
                            <div className="col-span-2"><p className="text-muted">Redeemed by</p><p className="font-medium text-charcoal">{couponResult.customerName}</p></div>
                          )}
                        </div>
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                        >
                          {couponLoading ? "Applying..." : `Apply $${couponResult.discountValue} Discount`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal text-sm">Coupon Applied</p>
                      <p className="text-xs text-muted mt-0.5">Code <span className="font-mono">{couponResult?.code}</span> marked as used. Discount of ${couponResult?.discountValue} applied.</p>
                    </div>
                    <button onClick={() => { setCouponCode(""); setCouponResult(null); setCouponApplied(false); setCouponError(""); }} className="ml-auto text-xs underline text-muted">New</button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent messages */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
              <SectionHeader title="Recent Messages" action="View all" onAction={() => setTab("messages")} />
              <div className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
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
                {msgList.length === 0 && <p className="px-6 py-8 text-center text-sm text-muted">No messages yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {tab === "appointments" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
            <SectionHeader title="All Appointments" count={apptList.length} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(248,243,242,0.8)" }}>
                    {["Reference", "Name", "Phone", "Date", "Time", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] tracking-wider uppercase font-medium" style={{ color: "#8C7B7B" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
                  {apptList.map((a) => (
                    <tr key={a.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-muted">{a.reference}</td>
                      <td className="px-5 py-4 font-medium text-charcoal whitespace-nowrap">{a.first_name} {a.last_name}</td>
                      <td className="px-5 py-4 text-muted text-xs">{a.phone}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{a.appointment_date}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{a.appointment_time.slice(0, 5)}</td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {a.status === "pending" && (
                            <>
                              <button onClick={() => updateApptStatus(a.id, "confirmed")} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Confirm">
                                <CheckCircle size={15} className="text-green-600" />
                              </button>
                              <button onClick={() => updateApptStatus(a.id, "cancelled")} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Cancel">
                                <XCircle size={15} className="text-red-500" />
                              </button>
                            </>
                          )}
                          {a.status === "confirmed" && (
                            <button
                              onClick={() => openCompleteModal(a.id, a.first_name, a.last_name, !!a.customer_id)}
                              className="text-[11px] px-3 py-1 rounded-full border transition-colors hover:bg-rose-50"
                              style={{ borderColor: "rgba(183,110,121,0.2)", color: "#B76E79" }}
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apptList.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-muted">No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
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
                    <p className="text-xs text-muted">
                      {m.phone}
                      {m.email && ` · ${m.email}`}
                      {" · "}<span className="font-mono">{m.reference}</span>
                    </p>
                    {(m.preferred_date || m.preferred_time) && (
                      <p className="text-xs text-muted mt-0.5">
                        Preferred: {m.preferred_date ?? ""} {m.preferred_time ?? ""}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-charcoal leading-relaxed mb-4">{m.message}</p>
                <div className="flex flex-wrap gap-2">
                  {m.status === "new" && (
                    <button onClick={() => updateMsgStatus(m.id, "read")} className="text-xs px-4 py-1.5 rounded-full border hover:bg-rose-50 transition-colors" style={{ borderColor: "rgba(183,110,121,0.25)", color: "#B76E79" }}>
                      Mark Read
                    </button>
                  )}
                  {(m.status === "new" || m.status === "read") && (
                    <button onClick={() => updateMsgStatus(m.id, "contacted")} className="text-xs px-4 py-1.5 rounded-full border hover:bg-green-50 transition-colors" style={{ borderColor: "rgba(34,197,94,0.3)", color: "#16a34a" }}>
                      Mark Contacted
                    </button>
                  )}
                  {m.status === "contacted" && (
                    <button onClick={() => updateMsgStatus(m.id, "booked")} className="text-xs px-4 py-1.5 rounded-full border hover:bg-green-50 transition-colors" style={{ borderColor: "rgba(34,197,94,0.3)", color: "#15803d" }}>
                      Mark Booked
                    </button>
                  )}
                  {m.status !== "closed" && (
                    <button onClick={() => updateMsgStatus(m.id, "closed")} className="text-xs px-4 py-1.5 rounded-full border hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(100,116,139,0.2)", color: "#64748b" }}>
                      Close
                    </button>
                  )}
                </div>
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

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
            <SectionHeader title="Customers" count={customers.length} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(248,243,242,0.8)" }}>
                    {["Name", "Phone", "Email", "First Visit", "Last Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] tracking-wider uppercase font-medium" style={{ color: "#8C7B7B" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
                  {customers.map((c, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-charcoal whitespace-nowrap">{c.first_name} {c.last_name}</td>
                      <td className="px-5 py-4 text-muted text-xs">{c.phone}</td>
                      <td className="px-5 py-4 text-muted text-xs">{c.email ?? "—"}</td>
                      <td className="px-5 py-4 text-muted text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">No customers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TEAM / EMPLOYEES ── */}
        {tab === "employees" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-2xl p-6"
                style={{
                  boxShadow: "0 2px 16px rgba(183,110,121,0.07)",
                  opacity: e.is_active ? 1 : 0.5,
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-medium flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                  >
                    {e.display_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{e.display_name}</p>
                    <p className="text-xs text-muted">{e.role}</p>
                    {!e.is_active && <span className="text-[10px] text-red-500 font-medium uppercase tracking-wider">Inactive</span>}
                  </div>
                </div>
                {e.specialty && (
                  <div className="text-xs mb-3" style={{ color: "#B76E79" }}>
                    ✦ {e.specialty}
                  </div>
                )}
                <div className="text-xs text-muted">{e.years_experience} years experience</div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="col-span-3 bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
                <p className="text-sm text-muted">No team members found</p>
              </div>
            )}
          </div>
        )}

        {/* ── INVENTORY ── */}
        {tab === "inventory" && (
          <div className="space-y-4">
            {/* Sub-tab bar */}
            <div className="flex gap-2">
              {(["stock", "orders"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => { setInvSubTab(st); if (st === "orders") loadPOs(); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={invSubTab === st ? { background: "#B76E79", color: "#fff" } : { background: "#fff", color: "#8C7B7B" }}
                >
                  {st === "stock" ? "Stock" : "Purchase Orders"}
                </button>
              ))}
              <div className="flex-1" />
              {invSubTab === "stock" && (
                <div className="flex items-center gap-2">
                  {invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty).length > 0 && (
                    <button
                      onClick={() => {
                        const lowItems = invList.filter((i) => i.is_active !== false && i.current_qty <= i.min_qty);
                        setPoLines(lowItems.map((i) => ({ inventory_id: i.id, qty_ordered: Math.max(1, i.min_qty - i.current_qty + i.min_qty), unit_cost: i.purchase_price ?? 0 })));
                        setInvSubTab("orders");
                        setPoModal(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                    >
                      <ShoppingCart size={14} /> Reorder Low-Stock
                    </button>
                  )}
                  <button
                    onClick={openAddItem}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "#B76E79" }}
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              )}
              {invSubTab === "orders" && (
                <button
                  onClick={() => setPoModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: "#B76E79" }}
                >
                  <ShoppingCart size={14} /> New Order
                </button>
              )}
            </div>

            {/* Stock table */}
            {invSubTab === "stock" && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(248,243,242,0.8)" }}>
                        {["Product", "Category", "In Stock", "Min", "Purchase", "Retail", "Location", "Status", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] tracking-wider uppercase font-medium" style={{ color: "#8C7B7B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "rgba(183,110,121,0.06)" }}>
                      {invList.filter(i => i.is_active !== false).map((item) => {
                        const isLow = item.current_qty <= item.min_qty;
                        return (
                          <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-charcoal">{item.name}</td>
                            <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{item.category}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: isLow ? "#ef4444" : "#1C1C1C" }}>{item.current_qty}</span>
                              {isLow && <AlertTriangle size={12} className="inline ml-1 text-red-400" />}
                            </td>
                            <td className="px-4 py-3 text-muted text-xs">{item.min_qty}</td>
                            <td className="px-4 py-3 text-muted text-xs">{item.purchase_price != null ? `$${item.purchase_price}` : "—"}</td>
                            <td className="px-4 py-3 text-muted text-xs">{item.retail_price != null ? `$${item.retail_price}` : "—"}</td>
                            <td className="px-4 py-3 text-muted text-xs">{item.storage_location ?? "—"}</td>
                            <td className="px-4 py-3">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>Low Stock</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider" style={{ background: "rgba(34,197,94,0.08)", color: "#16a34a" }}>OK</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEditItem(item)} className="p-1 rounded hover:bg-rose-50 transition-colors" title="Edit">
                                  <Pencil size={13} style={{ color: "#B76E79" }} />
                                </button>
                                <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-red-50 transition-colors" title="Remove">
                                  <Trash2 size={13} style={{ color: "#ef4444" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {invList.filter(i => i.is_active !== false).length === 0 && (
                        <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-muted">No inventory items. Click &quot;Add Item&quot; to get started.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Purchase Orders list */}
            {invSubTab === "orders" && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
                {poLoading && <p className="px-6 py-8 text-center text-muted text-sm">Loading orders…</p>}
                {!poLoading && poList.length === 0 && (
                  <p className="px-6 py-12 text-center text-sm text-muted">No purchase orders yet. Click &quot;New Order&quot; to create one.</p>
                )}
                {poList.map((po) => (
                  <div key={po.id} className="border-b last:border-0 p-5" style={{ borderColor: "rgba(183,110,121,0.08)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-charcoal">{po.supplier_name}</p>
                        <p className="text-xs text-muted mt-0.5">{new Date(po.created_at).toLocaleDateString()} · ${po.total_cost?.toFixed(2) ?? "0.00"} total</p>
                        {po.notes && <p className="text-xs text-muted mt-1 italic">{po.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge status={po.status} />
                        {po.status === "pending" && (
                          <button
                            onClick={() => receivePO(po.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                            style={{ background: "#16a34a" }}
                          >
                            <ArrowDownCircle size={12} /> Mark Received
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {po.purchase_order_lines?.map((line) => (
                        <div key={line.id} className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(248,243,242,0.8)" }}>
                          <span className="font-medium text-charcoal">{line.inventory?.name ?? "Unknown"}</span>
                          <span className="text-muted ml-2">× {line.qty_ordered} @ ${line.unit_cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ITEM MODAL ── */}
        {itemModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="font-semibold text-charcoal mb-4">{itemModal.editing ? "Edit Item" : "Add Inventory Item"}</h3>
              <div className="space-y-3">
                {[
                  { label: "Product Name *", key: "name", type: "text" },
                  { label: "Category *", key: "category", type: "text" },
                  { label: "Current Qty *", key: "current_qty", type: "number" },
                  { label: "Min Qty (reorder point) *", key: "min_qty", type: "number" },
                  { label: "Purchase Price ($)", key: "purchase_price", type: "number" },
                  { label: "Retail Price ($)", key: "retail_price", type: "number" },
                  { label: "Storage Location", key: "storage_location", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs text-muted mb-1 block">{label}</label>
                    <input
                      type={type}
                      value={itemModal.form[key as keyof typeof blankItem]}
                      onChange={(e) => setItemModal((prev) => ({ ...prev, form: { ...prev.form, [key]: type === "number" ? e.target.value : e.target.value } }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1"
                      style={{ borderColor: "rgba(183,110,121,0.3)", focusRingColor: "#B76E79" } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
              {itemError && <p className="text-red-500 text-xs mt-2">{itemError}</p>}
              <div className="flex gap-3 mt-5">
                <button onClick={() => setItemModal({ open: false, editing: null, form: blankItem })} className="flex-1 py-2 rounded-xl border text-sm text-muted" style={{ borderColor: "rgba(183,110,121,0.2)" }}>Cancel</button>
                <button onClick={saveItem} disabled={itemSaving} className="flex-1 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#B76E79" }}>
                  {itemSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── NEW PO MODAL ── */}
        {poModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-semibold text-charcoal mb-4">New Purchase Order</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-muted mb-1 block">Supplier Name *</label>
                  <input type="text" value={poForm.supplier_name} onChange={(e) => setPoForm((p) => ({ ...p, supplier_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: "rgba(183,110,121,0.3)" }} />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Notes</label>
                  <input type="text" value={poForm.notes} onChange={(e) => setPoForm((p) => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: "rgba(183,110,121,0.3)" }} />
                </div>
              </div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Items</p>
              {poLines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                  <select
                    value={line.inventory_id}
                    onChange={(e) => setPoLines((prev) => prev.map((l, idx) => idx === i ? { ...l, inventory_id: e.target.value } : l))}
                    className="col-span-5 border rounded-lg px-2 py-2 text-xs outline-none"
                    style={{ borderColor: "rgba(183,110,121,0.3)" }}
                  >
                    <option value="">Select item…</option>
                    {invList.filter(it => it.is_active !== false).map((it) => (
                      <option key={it.id} value={it.id}>{it.name}</option>
                    ))}
                  </select>
                  <input type="number" min={1} placeholder="Qty" value={line.qty_ordered} onChange={(e) => setPoLines((prev) => prev.map((l, idx) => idx === i ? { ...l, qty_ordered: Number(e.target.value) } : l))} className="col-span-3 border rounded-lg px-2 py-2 text-xs outline-none" style={{ borderColor: "rgba(183,110,121,0.3)" }} />
                  <input type="number" min={0} step="0.01" placeholder="$/unit" value={line.unit_cost || ""} onChange={(e) => setPoLines((prev) => prev.map((l, idx) => idx === i ? { ...l, unit_cost: Number(e.target.value) } : l))} className="col-span-3 border rounded-lg px-2 py-2 text-xs outline-none" style={{ borderColor: "rgba(183,110,121,0.3)" }} />
                  <button onClick={() => removePOLine(i)} className="col-span-1 text-red-400 hover:text-red-600 text-center">×</button>
                </div>
              ))}
              <button onClick={addPOLine} className="text-xs flex items-center gap-1 mt-1 mb-4" style={{ color: "#B76E79" }}>
                <Plus size={12} /> Add line
              </button>
              {poLines.length > 0 && (
                <p className="text-xs text-muted mb-3">Total: <strong className="text-charcoal">${poLines.reduce((s, l) => s + l.qty_ordered * l.unit_cost, 0).toFixed(2)}</strong></p>
              )}
              {poError && <p className="text-red-500 text-xs mb-2">{poError}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setPoModal(false); setPoForm(blankPO); setPoLines([{ ...blankPOLine }]); }} className="flex-1 py-2 rounded-xl border text-sm text-muted" style={{ borderColor: "rgba(183,110,121,0.2)" }}>Cancel</button>
                <button onClick={savePO} disabled={poSaving} className="flex-1 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#B76E79" }}>
                  {poSaving ? "Saving…" : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {reviewList.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-6"
                style={{
                  boxShadow: "0 2px 16px rgba(183,110,121,0.07)",
                  borderLeft: r.is_featured ? "3px solid #C9A96E" : "3px solid transparent",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-charcoal">{r.customer_name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} fill={s <= r.rating ? "#C9A96E" : "none"} style={{ color: "#C9A96E" }} />
                        ))}
                      </div>
                      {r.is_featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider" style={{ background: "rgba(201,169,110,0.12)", color: "#C9A96E" }}>
                          Featured
                        </span>
                      )}
                    </div>
                    {r.service_name && <p className="text-xs mb-2" style={{ color: "#B76E79" }}>{r.service_name}</p>}
                    <p className="text-sm text-charcoal leading-relaxed">{r.text}</p>
                    <p className="text-xs text-muted mt-2">{new Date(r.created_at).toLocaleDateString()} · {r.source}</p>
                  </div>
                  <button
                    onClick={() => toggleFeatured(r.id, r.is_featured)}
                    className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-amber-50"
                    title={r.is_featured ? "Remove from featured" : "Feature this review"}
                  >
                    {r.is_featured ? (
                      <Eye size={16} style={{ color: "#C9A96E" }} />
                    ) : (
                      <EyeOff size={16} style={{ color: "#8C7B7B" }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {reviewList.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 16px rgba(183,110,121,0.07)" }}>
                <Star size={36} className="mx-auto mb-3" style={{ color: "rgba(183,110,121,0.3)" }} />
                <p className="text-sm text-muted">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MARK DONE MODAL ── */}
      {completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(28,28,28,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }}>
            <h2 className="text-xl font-light text-charcoal mb-1">Complete Appointment</h2>
            <p className="text-sm text-muted mb-6">
              Completing visit for <strong>{completingAppt.name}</strong>.
            </p>

            {!completeResult ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs tracking-wider uppercase font-medium mb-2 block" style={{ color: "#B76E79" }}>
                      Amount Charged ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 45.00"
                      value={amountCharged}
                      onChange={(e) => setAmountCharged(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "rgba(183,110,121,0.3)", color: "#1C1C1C" }}
                      autoFocus
                    />
                    {amountCharged && !isNaN(parseFloat(amountCharged)) && (
                      <p className="text-xs mt-1.5" style={{ color: "#B76E79" }}>
                        → <strong>{Math.max(1, Math.floor(parseFloat(amountCharged)))} points</strong> will be awarded (1 pt per $1)
                      </p>
                    )}
                  </div>

                  {!completingAppt.hasCustomer && (
                    <div>
                      <label className="text-xs tracking-wider uppercase font-medium mb-2 block" style={{ color: "#B76E79" }}>
                        Customer Email <span className="normal-case font-normal text-muted">(optional — to link points)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="customer@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: "rgba(183,110,121,0.3)", color: "#1C1C1C" }}
                      />
                      <p className="text-xs mt-1.5 text-muted">If the customer has a portal account, points will be added to their balance.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCompletingAppt(null)}
                    className="flex-1 py-3 rounded-full border text-sm font-medium text-muted hover:bg-slate-50 transition-colors"
                    style={{ borderColor: "rgba(183,110,121,0.2)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmComplete}
                    disabled={completeLoading || !amountCharged || isNaN(parseFloat(amountCharged))}
                    className="flex-1 py-3 rounded-full text-white text-sm font-medium disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                  >
                    {completeLoading ? "Saving..." : "Confirm & Complete"}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <p className="font-medium text-charcoal text-sm">Appointment Completed</p>
                  </div>
                  <p className="text-xs text-muted">Amount charged: <strong>${parseFloat(amountCharged).toFixed(2)}</strong></p>
                  {completeResult.pointsAwarded > 0 ? (
                    <p className="text-xs mt-1" style={{ color: "#B76E79" }}>
                      ✦ <strong>{completeResult.pointsAwarded} points</strong> awarded
                      {completeResult.resolvedName && ` to ${completeResult.resolvedName}`}
                    </p>
                  ) : (
                    <p className="text-xs text-muted mt-1">No portal account linked — no points awarded.</p>
                  )}
                </div>
                <button
                  onClick={() => setCompletingAppt(null)}
                  className="w-full py-3 rounded-full text-white text-sm font-medium"
                  style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
