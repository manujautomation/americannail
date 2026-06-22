"use client";

import { useTranslations } from "next-intl";
import { MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { BUSINESS, HOURS } from "@/lib/constants";

export default function Contact() {
  const t = useTranslations("contact");
  const today = new Date().getDay(); // 0=Sun

  return (
    <section
      id="contact"
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
            Visit Us
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <ScrollReveal direction="left">
            <div className="space-y-8">
              {/* Address */}
              <div className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(183,110,121,0.1)" }}
                >
                  <MapPin size={18} style={{ color: "#B76E79" }} />
                </div>
                <div>
                  <h3
                    className="text-xs tracking-[0.2em] uppercase font-medium mb-2"
                    style={{ color: "#B76E79" }}
                  >
                    {t("address")}
                  </h3>
                  <p className="text-charcoal font-medium">
                    {BUSINESS.address.street}
                  </p>
                  <p className="text-muted text-sm">
                    {BUSINESS.address.city}, {BUSINESS.address.state}{" "}
                    {BUSINESS.address.zip}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(140,123,123,0.7)" }}
                  >
                    {BUSINESS.address.building}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(183,110,121,0.1)" }}
                >
                  <Phone size={18} style={{ color: "#B76E79" }} />
                </div>
                <div>
                  <h3
                    className="text-xs tracking-[0.2em] uppercase font-medium mb-2"
                    style={{ color: "#B76E79" }}
                  >
                    {t("phone")}
                  </h3>
                  <a
                    href={`tel:${BUSINESS.phone}`}
                    className="text-charcoal font-medium hover:text-rose-gold transition-colors text-lg"
                    style={{ color: "#1C1C1C" }}
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(183,110,121,0.1)" }}
                >
                  <Clock size={18} style={{ color: "#B76E79" }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xs tracking-[0.2em] uppercase font-medium mb-3"
                    style={{ color: "#B76E79" }}
                  >
                    {t("hours")}
                  </h3>
                  <div className="space-y-1.5">
                    {HOURS.map((h, i) => (
                      <div
                        key={h.day}
                        className={`flex justify-between items-center py-1.5 px-3 rounded-lg text-sm transition-colors ${
                          i === today
                            ? "bg-blush-faint"
                            : ""
                        }`}
                        style={
                          i === today
                            ? { background: "rgba(232,180,184,0.2)" }
                            : {}
                        }
                      >
                        <span
                          className={`font-medium ${i === today ? "" : "text-muted"}`}
                          style={{
                            color: i === today ? "#B76E79" : undefined,
                          }}
                        >
                          {t(`days.${h.dayKey}` as Parameters<typeof t>[0])}
                          {i === today && (
                            <span
                              className="ml-2 text-[10px] tracking-wider uppercase font-medium"
                              style={{ color: "#B76E79" }}
                            >
                              Today
                            </span>
                          )}
                        </span>
                        <span
                          className={h.closed ? "text-muted/50" : "text-charcoal"}
                        >
                          {h.closed
                            ? t("closed")
                            : `${h.open} – ${h.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={BUSINESS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-sm tracking-wider uppercase font-medium transition-all hover:opacity-90 hover:shadow-rose"
                  style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                >
                  <Navigation size={14} />
                  {t("getDirections")}
                  <ExternalLink size={12} />
                </a>
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm tracking-wider uppercase font-medium border transition-all hover:bg-blush-faint"
                  style={{
                    borderColor: "rgba(183,110,121,0.3)",
                    color: "#B76E79",
                  }}
                >
                  <Phone size={14} />
                  {t("callUs")}
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Map */}
          <ScrollReveal direction="right" delay={0.15}>
            <div
              className="rounded-2xl overflow-hidden h-[460px] shadow-medium"
              style={{ boxShadow: "0 8px 40px rgba(183,110,121,0.12)" }}
            >
              <iframe
                title="American Nails & Spa Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=640+Warrior+Dr+Ste+106,+Stephens+City,+VA+22655&output=embed&z=16`}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
