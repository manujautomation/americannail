"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  CalendarDays,
  HelpCircle,
  MessageSquare,
  Phone,
  MapPin,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";
import { BUSINESS, FEATURES } from "@/lib/constants";

type View = "menu" | "message" | "success";

export default function ConciergeWidget() {
  const t = useTranslations("concierge");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    message: "",
  });
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const reset = () => {
    setView("menu");
    setForm({ name: "", phone: "", email: "", date: "", time: "", message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name,
          phone:         form.phone,
          email:         form.email,
          preferredDate: form.date,
          preferredTime: form.time,
          message:       form.message,
          source:        "concierge",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setRef(json.reference);
      setView("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    ...(FEATURES.onlineBooking
      ? [{
          key: "book",
          icon: <CalendarDays size={16} />,
          action: () => {
            setOpen(false);
            document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
          },
        } as const]
      : []),
    {
      key: "question",
      icon: <HelpCircle size={16} />,
      action: () => setView("message"),
    },
    {
      key: "message",
      icon: <MessageSquare size={16} />,
      action: () => setView("message"),
    },
    {
      key: "call",
      icon: <Phone size={16} />,
      action: () => (window.location.href = `tel:${BUSINESS.phone}`),
    },
    {
      key: "directions",
      icon: <MapPin size={16} />,
      action: () => window.open(BUSINESS.googleMapsUrl, "_blank"),
    },
  ] as const;

  return (
    <>
      {/* Floating button */}
      <motion.button
        id="concierge-trigger"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg relative"
        style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 3, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open concierge"
      >
        <MessageCircle size={22} />
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
        />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              className="fixed inset-0 z-40 lg:hidden bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); reset(); }}
            />

            <motion.div
              className="fixed bottom-24 right-5 lg:bottom-28 lg:right-8 z-50 w-80 rounded-2xl overflow-hidden shadow-strong"
              style={{ background: "#FFFFFF" }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 text-white relative"
                style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
              >
                {view !== "menu" && (
                  <button
                    onClick={reset}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    aria-label="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h3 className="font-heading text-lg font-light text-center" style={{ fontFamily: "var(--font-heading)" }}>
                  {view === "success" ? "Message Sent! 🌸" : t("greeting")}
                </h3>
                <p className="text-white/70 text-[11px] text-center tracking-wide mt-0.5">
                  {view === "menu" ? t("subgreeting") : view === "success" ? t("form.success") : "Tell us more"}
                </p>

                {/* Close */}
                <button
                  onClick={() => { setOpen(false); reset(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[440px] overflow-y-auto" data-lenis-prevent>
                <AnimatePresence mode="wait">
                  {view === "menu" && (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 space-y-2"
                    >
                      {menuItems.map((item, i) => (
                        <motion.button
                          key={item.key}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-left transition-all hover:shadow-sm group"
                          style={{
                            background: "rgba(248,243,242,0.8)",
                            color: "#1C1C1C",
                          }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ x: 3 }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(232,180,184,0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(248,243,242,0.8)";
                          }}
                        >
                          <span style={{ color: "#B76E79" }}>{item.icon}</span>
                          {t(`options.${item.key}` as Parameters<typeof t>[0])}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {view === "message" && (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 space-y-3"
                    >
                      {[
                        { key: "name", type: "text", placeholder: t("form.name"), required: true },
                        { key: "phone", type: "tel", placeholder: t("form.phone"), required: true },
                        { key: "email", type: "email", placeholder: t("form.email"), required: false },
                        { key: "date", type: "date", placeholder: t("form.date"), required: false },
                        { key: "time", type: "time", placeholder: t("form.time"), required: false },
                      ].map(({ key, type, placeholder, required }) => (
                        <input
                          key={key}
                          type={type}
                          placeholder={placeholder}
                          required={required}
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-all"
                          style={{
                            borderColor: "rgba(183,110,121,0.2)",
                            color: "#1C1C1C",
                            background: "rgba(248,243,242,0.5)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
                        />
                      ))}
                      <textarea
                        placeholder={t("form.message")}
                        required
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-all resize-none"
                        style={{
                          borderColor: "rgba(183,110,121,0.2)",
                          color: "#1C1C1C",
                          background: "rgba(248,243,242,0.5)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
                      />
                      {submitError && (
                        <p className="text-xs text-red-500 text-center">{submitError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-white text-sm font-medium tracking-wider flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Send size={14} />{t("form.send")}</>
                        )}
                      </button>
                    </motion.form>
                  )}

                  {view === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 flex flex-col items-center gap-4 text-center"
                    >
                      <CheckCircle size={48} style={{ color: "#22c55e" }} />
                      <div>
                        <p className="text-charcoal font-medium mb-1">{t("form.success")}</p>
                        <p className="text-xs text-muted">
                          {t("form.reference")}{" "}
                          <span className="font-mono font-bold" style={{ color: "#B76E79" }}>
                            {ref}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={reset}
                        className="text-xs tracking-wider uppercase font-medium transition-colors"
                        style={{ color: "#B76E79" }}
                      >
                        Back to Menu
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
