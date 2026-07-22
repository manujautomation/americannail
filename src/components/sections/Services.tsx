"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { BUSINESS, FEATURES } from "@/lib/constants";

export default function Services() {
  const t = useTranslations("services");

  return (
    <section
      id="services"
      className="py-10"
      style={{ background: "var(--color-warm-white)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA only */}
        <ScrollReveal className="text-center" delay={0.1}>
          {FEATURES.onlineBooking ? (
            <button
              onClick={() =>
                document
                  .querySelector("#booking")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:shadow-rose hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
            >
              Book Any Service
              <ArrowRight size={14} />
            </button>
          ) : (
            <a
              href={`tel:${BUSINESS.phone}`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:shadow-rose hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
            >
              <Phone size={14} />
              {t("callToBook")} · {BUSINESS.phoneDisplay}
            </a>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
