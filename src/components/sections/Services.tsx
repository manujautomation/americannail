"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Phone } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { BUSINESS, FEATURES, SERVICES } from "@/lib/constants";

export default function Services() {
  const t = useTranslations("services");

  return (
    <section
      id="services"
      className="section-padding"
      style={{ background: "var(--color-warm-white)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#B76E79" }}
          >
            What We Offer
          </span>
          <h2
            className="font-heading text-5xl lg:text-6xl font-light text-charcoal mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("heading")}
          </h2>
          <div className="divider-rose mb-5" />
          <p className="text-muted text-base max-w-lg mx-auto leading-relaxed">
            {t("subheading")}
          </p>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => {
            const nameKey = service.nameKey as keyof typeof t;
            const name = t(`items.${service.nameKey}.name` as Parameters<typeof t>[0]);
            const desc = t(`items.${service.nameKey}.description` as Parameters<typeof t>[0]);

            return (
              <ScrollReveal key={service.id} delay={i * 0.07} direction="up">
                <motion.div
                  className="group relative bg-white rounded-2xl overflow-hidden card-lift cursor-pointer"
                  style={{ boxShadow: "0 2px 20px rgba(183,110,121,0.06)" }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Image */}
                  <div className="img-zoom relative h-52 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Color overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                      style={{ background: service.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Duration chip */}
                    <div
                      className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium mb-3"
                      style={{ color: "#B76E79" }}
                    >
                      <Clock size={10} />
                      {service.duration}
                    </div>

                    <h3
                      className="font-heading text-xl font-medium text-charcoal mb-2 group-hover:text-rose-gold transition-colors"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "#1C1C1C",
                      }}
                    >
                      {name}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
                      {desc}
                    </p>

                    {/* CTA */}
                    {FEATURES.onlineBooking ? (
                      <button
                        onClick={() =>
                          document
                            .querySelector("#booking")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium transition-all duration-300 group-hover:gap-2.5"
                        style={{ color: "#B76E79" }}
                      >
                        {t("bookService")}
                        <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <a
                        href={`tel:${BUSINESS.phone}`}
                        className="flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium transition-all duration-300 group-hover:gap-2.5"
                        style={{ color: "#B76E79" }}
                      >
                        <Phone size={11} />
                        {t("callToBook")}
                      </a>
                    )}
                  </div>

                  {/* Rose gold top border on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{
                      background: "linear-gradient(90deg, #B76E79, #C9A96E)",
                    }}
                  />
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal className="text-center mt-14" delay={0.2}>
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
