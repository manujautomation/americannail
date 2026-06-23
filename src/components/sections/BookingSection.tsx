"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { SERVICES, TEAM } from "@/lib/constants";

type Step = 0 | 1 | 2 | 3 | 4;

type SlotStatus = { time: string; available: boolean };

function to12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}


export default function BookingSection() {
  const t = useTranslations("booking");
  const ts = useTranslations("services"); // for service names (live in services namespace)
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState({
    service: "",
    technician: "any",
    date: "",
    time: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = useCallback(async (date: string, technician: string) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const params = new URLSearchParams({ date });
      if (technician && technician !== "any") params.set("employeeId", technician);
      const res = await fetch(`/api/availability?${params}`);
      const json = await res.json();
      if (res.ok) setSlots(json.slots ?? []);
    } catch {
      // silently fall back — slots stay empty, UI will show a message
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Re-fetch whenever date or technician changes
  useEffect(() => {
    if (data.date) {
      fetchSlots(data.date, data.technician);
      setData((prev) => ({ ...prev, time: "" })); // clear stale time selection
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.date, data.technician]);

  const steps = [
    t("steps.service"),
    t("steps.technician"),
    t("steps.datetime"),
    t("steps.info"),
    t("steps.confirm"),
  ];

  const canNext = () => {
    if (step === 0) return !!data.service;
    if (step === 1) return true;
    if (step === 2) return !!data.date && !!data.time;
    if (step === 3) return !!data.firstName && !!data.phone;
    return false;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const selectedSvc = SERVICES.find((s) => s.id === data.service);

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId:  selectedSvc?.id ?? data.service,
          employeeId: data.technician,
          date:       data.date,
          time:       data.time,
          firstName:  data.firstName,
          lastName:   data.lastName,
          phone:      data.phone,
          email:      data.email,
          notes:      data.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to book");
      setRef(json.reference);
      setStep(4);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = SERVICES.find((s) => s.id === data.service);

  return (
    <section
      id="booking"
      className="section-padding"
      style={{ background: "var(--color-blush-faint)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#B76E79" }}
          >
            Reservations
          </span>
          <h2
            className="font-heading text-5xl lg:text-6xl font-light text-charcoal mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("heading")}
          </h2>
          <div className="divider-rose mb-5" />
          {/* Demo badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "rgba(183,110,121,0.1)",
              color: "#B76E79",
              border: "1px solid rgba(183,110,121,0.2)",
            }}
          >
            ✦ {t("demoNote")}
          </span>
        </ScrollReveal>

        {step < 4 ? (
          <ScrollReveal>
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 8px 48px rgba(183,110,121,0.1)" }}
            >
              {/* Progress bar */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center justify-between mb-4">
                  {steps.map((label, i) => (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                          style={{
                            background:
                              i < step
                                ? "linear-gradient(135deg, #B76E79, #C9A96E)"
                                : i === step
                                ? "linear-gradient(135deg, #B76E79, #C9A96E)"
                                : "rgba(183,110,121,0.1)",
                            color: i <= step ? "white" : "rgba(183,110,121,0.4)",
                          }}
                        >
                          {i < step ? "✓" : i + 1}
                        </div>
                        <span
                          className="text-[10px] tracking-wider uppercase mt-1 hidden sm:block"
                          style={{
                            color:
                              i === step
                                ? "#B76E79"
                                : "rgba(140,123,123,0.5)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className="flex-1 h-px mx-2 transition-all duration-500"
                          style={{
                            background:
                              i < step
                                ? "linear-gradient(90deg, #B76E79, #C9A96E)"
                                : "rgba(183,110,121,0.15)",
                            width: "24px",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step content */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {/* Step 0: Service */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {SERVICES.map((s) => {
                        const name = ts(`items.${s.nameKey}.name` as Parameters<typeof ts>[0]);
                        return (
                          <button
                            key={s.id}
                            onClick={() => setData({ ...data, service: s.id })}
                            className="p-4 rounded-xl text-left transition-all duration-200 border"
                            style={{
                              background:
                                data.service === s.id
                                  ? "rgba(232,180,184,0.15)"
                                  : "rgba(248,243,242,0.5)",
                              borderColor:
                                data.service === s.id
                                  ? "#B76E79"
                                  : "rgba(183,110,121,0.1)",
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full mb-2"
                              style={{ background: s.color }}
                            />
                            <div
                              className="text-sm font-medium"
                              style={{ color: data.service === s.id ? "#B76E79" : "#1C1C1C" }}
                            >
                              {name}
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Step 1: Technician */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      {[
                        { id: "any", name: t("anyTechnician"), role: "Best match for your service" },
                        ...TEAM.map((m) => ({ id: m.id.toString(), name: m.name, role: m.specialty })),
                      ].map((tech) => (
                        <button
                          key={tech.id}
                          onClick={() => setData({ ...data, technician: tech.id })}
                          className="w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all"
                          style={{
                            background:
                              data.technician === tech.id
                                ? "rgba(232,180,184,0.15)"
                                : "rgba(248,243,242,0.5)",
                            borderColor:
                              data.technician === tech.id
                                ? "#B76E79"
                                : "rgba(183,110,121,0.1)",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #B76E79, #C9A96E)",
                            }}
                          >
                            {tech.name.charAt(0)}
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{
                                color:
                                  data.technician === tech.id ? "#B76E79" : "#1C1C1C",
                              }}
                            >
                              {tech.name}
                            </div>
                            <div className="text-xs text-muted">{tech.role}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 2: Date & Time */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="text-xs tracking-wider uppercase font-medium mb-2 block" style={{ color: "#B76E79" }}>
                          {t("selectDate")}
                        </label>
                        <input
                          type="date"
                          value={data.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setData({ ...data, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                          style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider uppercase font-medium mb-2 block" style={{ color: "#B76E79" }}>
                          {t("selectTime")}
                        </label>
                        {!data.date ? (
                          <p className="text-xs text-muted py-4 text-center">Select a date first</p>
                        ) : loadingSlots ? (
                          <div className="flex items-center justify-center py-6 gap-2 text-muted text-xs">
                            <Loader2 size={14} className="animate-spin" style={{ color: "#B76E79" }} />
                            Checking availability…
                          </div>
                        ) : slots.length === 0 ? (
                          <p className="text-xs text-muted py-4 text-center">No availability data. Try another date.</p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {slots.map(({ time, available }) => {
                              const isSelected = data.time === time;
                              return (
                                <button
                                  key={time}
                                  onClick={() => available && setData({ ...data, time })}
                                  disabled={!available}
                                  title={!available ? "Already booked" : undefined}
                                  className="py-2 rounded-lg text-xs font-medium border transition-all relative"
                                  style={{
                                    background: isSelected
                                      ? "linear-gradient(135deg, #B76E79, #C9A96E)"
                                      : !available
                                      ? "rgba(220,220,220,0.4)"
                                      : "rgba(248,243,242,0.5)",
                                    borderColor: isSelected
                                      ? "transparent"
                                      : !available
                                      ? "rgba(200,200,200,0.3)"
                                      : "rgba(183,110,121,0.15)",
                                    color: isSelected ? "white" : !available ? "#C0B8B8" : "#8C7B7B",
                                    cursor: !available ? "not-allowed" : "pointer",
                                    textDecoration: !available ? "line-through" : "none",
                                  }}
                                >
                                  {to12h(time)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Info */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      {[
                        { key: "firstName", label: t("firstName"), type: "text", span: 1, required: true },
                        { key: "lastName", label: t("lastName"), type: "text", span: 1, required: false },
                        { key: "phone", label: t("phone"), type: "tel", span: 2, required: true },
                        { key: "email", label: t("email"), type: "email", span: 2, required: false },
                      ].map(({ key, label, type, span, required }) => (
                        <div key={key} className={span === 2 ? "col-span-2" : ""}>
                          <label className="text-xs tracking-wider uppercase font-medium mb-1.5 block" style={{ color: "#B76E79" }}>
                            {label}{required && " *"}
                          </label>
                          <input
                            type={type}
                            value={data[key as keyof typeof data]}
                            onChange={(e) => setData({ ...data, [key]: e.target.value })}
                            required={required}
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                            style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="text-xs tracking-wider uppercase font-medium mb-1.5 block" style={{ color: "#B76E79" }}>
                          {t("notes")}
                        </label>
                        <textarea
                          value={data.notes}
                          onChange={(e) => setData({ ...data, notes: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
                          style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6" style={{ borderTop: "1px solid rgba(183,110,121,0.1)" }}>
                  {step > 0 ? (
                    <button
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="flex items-center gap-2 text-sm font-medium transition-colors"
                      style={{ color: "#8C7B7B" }}
                    >
                      <ArrowLeft size={14} />
                      {t("back")}
                    </button>
                  ) : <div />}

                  {step < 3 ? (
                    <button
                      onClick={() => setStep((s) => (s + 1) as Step)}
                      disabled={!canNext()}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                    >
                      {t("next")}
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      {submitError && (
                        <p className="text-xs text-red-500">{submitError}</p>
                      )}
                      <button
                        onClick={handleConfirm}
                        disabled={!canNext() || submitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                      >
                        {submitting ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {t("confirm")}
                            <CheckCircle size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          /* Success */
          <ScrollReveal>
            <motion.div
              className="bg-white rounded-3xl p-12 text-center"
              style={{ boxShadow: "0 8px 48px rgba(183,110,121,0.1)" }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <CheckCircle size={64} className="mx-auto mb-6" style={{ color: "#22c55e" }} />
              </motion.div>
              <h3
                className="font-heading text-4xl font-light text-charcoal mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("success")}
              </h3>
              <p className="text-muted mb-2 text-sm">
                {t("reference")}:{" "}
                <span className="font-mono font-bold" style={{ color: "#B76E79" }}>
                  {ref}
                </span>
              </p>
              <p className="text-muted text-sm mb-4">{t("confirmationSent")}</p>
              {selectedService && (
                <div
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full mb-6"
                  style={{
                    background: "rgba(183,110,121,0.08)",
                    color: "#B76E79",
                  }}
                >
                  <CalendarDays size={14} />
                  {t(`items.${selectedService.nameKey}.name` as Parameters<typeof t>[0])} · {data.date} · {to12h(data.time)}
                </div>
              )}
              <button
                onClick={() => { setStep(0); setSlots([]); setData({ service: "", technician: "any", date: "", time: "", firstName: "", lastName: "", phone: "", email: "", notes: "" }); }}
                className="text-sm font-medium tracking-wider uppercase transition-colors"
                style={{ color: "#B76E79" }}
              >
                Book Another
              </button>
            </motion.div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
