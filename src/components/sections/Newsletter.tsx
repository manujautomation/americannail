"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function Newsletter() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Demo mode: simulate success
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(183,110,121,0.06) 0%, rgba(201,169,110,0.06) 100%)",
        borderTop: "1px solid rgba(183,110,121,0.1)",
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full -translate-y-1/2 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #E8B4B8, transparent)" }}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <ScrollReveal>
          <Sparkles
            size={28}
            className="mx-auto mb-4 animate-float"
            style={{ color: "#C9A96E" }}
          />
          <h2
            className="font-heading text-4xl lg:text-5xl font-light text-charcoal mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-muted text-base mb-8 max-w-md mx-auto leading-relaxed">
            {t("subheading")}
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex-1 relative">
                  <Mail
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#B76E79" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("placeholder")}
                    className="w-full pl-10 pr-4 py-3.5 rounded-full bg-white border text-sm outline-none transition-all"
                    style={{
                      borderColor: "rgba(183,110,121,0.2)",
                      color: "#1C1C1C",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#B76E79")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(183,110,121,0.2)")
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-full text-white text-sm tracking-wider uppercase font-medium transition-all hover:opacity-90 disabled:opacity-70 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                >
                  {loading ? "..." : t("cta")}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle size={36} style={{ color: "#22c55e" }} />
                <p className="text-charcoal font-medium">
                  You&rsquo;re on the list! 🌸
                </p>
                <p className="text-sm text-muted">
                  Watch for exclusive offers and updates.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!submitted && (
            <p
              className="text-xs mt-4"
              style={{ color: "rgba(140,123,123,0.6)" }}
            >
              {t("disclaimer")}
            </p>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
