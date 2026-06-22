"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { TEAM } from "@/lib/constants";

// Elegant placeholder avatar with initials
function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center font-heading text-4xl font-light text-white"
      style={{
        background: `linear-gradient(135deg, ${color}, #C9A96E)`,
        fontFamily: "var(--font-heading)",
      }}
    >
      {initials}
    </div>
  );
}

const COLORS = ["#B76E79", "#9A5562", "#D4A0A7"];

export default function Team() {
  const t = useTranslations("team");

  return (
    <section
      id="about"
      className="section-padding"
      style={{ background: "var(--color-blush-faint)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#B76E79" }}
          >
            Our Specialists
          </span>
          <h2
            className="font-heading text-5xl lg:text-6xl font-light text-charcoal mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("heading")}
          </h2>
          <div className="divider-rose mb-5" />
          <p className="text-muted text-base max-w-lg mx-auto">
            {t("subheading")}
          </p>
        </ScrollReveal>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {TEAM.map((member, i) => (
            <ScrollReveal key={member.id} delay={i * 0.15} direction="up">
              <motion.div
                className="group text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar circle */}
                <div className="relative mx-auto mb-6">
                  <div
                    className="w-36 h-36 mx-auto rounded-full overflow-hidden"
                    style={{
                      boxShadow: "0 8px 32px rgba(183,110,121,0.2)",
                    }}
                  >
                    <Avatar name={member.name} color={COLORS[i]} />
                  </div>
                  {/* Sparkle decoration */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <Sparkles size={20} style={{ color: "#C9A96E" }} />
                  </motion.div>
                </div>

                {/* Info */}
                <h3
                  className="font-heading text-2xl font-medium text-charcoal mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-xs tracking-[0.2em] uppercase font-medium mb-3"
                  style={{ color: "#B76E79" }}
                >
                  {member.role}
                </p>

                {/* Divider */}
                <div
                  className="w-8 h-px mx-auto mb-3"
                  style={{ background: "linear-gradient(90deg, #B76E79, #C9A96E)" }}
                />

                {/* Specialty */}
                <p className="text-sm text-muted mb-2">
                  <span className="font-medium" style={{ color: "#1C1C1C" }}>
                    {t("specialty")}:
                  </span>{" "}
                  {member.specialty}
                </p>
                <p
                  className="text-xs tracking-wider"
                  style={{ color: "rgba(140,123,123,0.7)" }}
                >
                  {member.years} {t("yearsExp")}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Note: will be updated with real photos */}
        <ScrollReveal className="text-center mt-12" delay={0.3}>
          <p
            className="text-xs tracking-wider"
            style={{ color: "rgba(140,123,123,0.5)" }}
          >
            Team photos coming soon
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
