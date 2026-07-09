"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Phone, MapPin, ChevronDown, Star, CalendarDays } from "lucide-react";
import { BUSINESS, FEATURES, getTodayStatus } from "@/lib/constants";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920&q=90";

export default function Hero() {
  const t = useTranslations("hero");
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const today = getTodayStatus();

  // GSAP parallax on scroll
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      gsap.to(img, {
        y: scrollY * 0.35,
        ease: "none",
        duration: 0,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP word-by-word reveal after loading screen
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const words = el.querySelectorAll(".word");
    gsap.fromTo(
      words,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 2.5,
      }
    );
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background Image with parallax wrapper */}
      <div className="absolute inset-0 z-0" ref={imageRef}>
        <Image
          src={HERO_IMAGE}
          alt="Personalized nail salon ambiance"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Cinematic overlay */}
      <div className="absolute inset-0 z-10 cinematic-overlay" />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "150px",
          mixBlendMode: "overlay",
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20">
        {/* Eyebrow */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
        >
          <div
            className="h-px w-12"
            style={{ background: "rgba(201,169,110,0.6)" }}
          />
          <span
            className="text-xs tracking-[0.35em] uppercase font-light"
            style={{ color: "rgba(201,169,110,0.9)" }}
          >
            {t("eyebrow")}
          </span>
          <div
            className="h-px w-12"
            style={{ background: "rgba(201,169,110,0.6)" }}
          />
        </motion.div>

        {/* Main Heading */}
        <div ref={headingRef} className="overflow-hidden mb-4">
          <h1
            className="font-heading leading-none"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <div className="overflow-hidden mb-1">
              <span
                className="word block text-white font-light"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 9rem)",
                  letterSpacing: "0.08em",
                }}
              >
                {t("headline1")}
              </span>
            </div>
            <div className="overflow-hidden">
              <span
                className="word block italic"
                style={{
                  fontSize: "clamp(3rem, 9vw, 8rem)",
                  letterSpacing: "0.04em",
                  color: "#E8D5B0",
                }}
              >
                {t("headline2")}
              </span>
            </div>
          </h1>
        </div>

        {/* Tagline */}
        <motion.p
          className="text-white/70 text-sm sm:text-base tracking-[0.25em] uppercase font-light mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.0 }}
        >
          {t("tagline")}
        </motion.p>

        {/* Rating */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3.1 }}
        >
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                size={14}
                className="fill-current"
                style={{ color: "#C9A96E" }}
              />
            ))}
            <Star
              size={14}
              style={{ color: "#C9A96E", opacity: 0.5 }}
            />
          </div>
          <span className="text-white/80 text-sm">
            <span style={{ color: "#C9A96E" }} className="font-medium">
              {t("rating")}
            </span>
            <span className="ml-2 opacity-70">{t("ratingLabel")}</span>
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
        >
          {FEATURES.onlineBooking && (
            <button
              onClick={() =>
                document
                  .querySelector("#booking")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group flex items-center gap-2.5 px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
            >
              <CalendarDays size={15} />
              {t("cta1")}
            </button>
          )}
          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center gap-2.5 px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            style={
              FEATURES.onlineBooking
                ? {
                    border: "1px solid rgba(255,255,255,0.35)",
                    backdropFilter: "blur(8px)",
                  }
                : { background: "linear-gradient(135deg, #B76E79, #C9A96E)" }
            }
          >
            <Phone size={15} />
            {t("cta2")}
          </a>
        </motion.div>

        {/* Status chips */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3.3 }}
        >
          {/* Open status */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: today.isOpen ? "#22c55e" : "#ef4444",
                boxShadow: today.isOpen
                  ? "0 0 6px #22c55e"
                  : "0 0 6px #ef4444",
              }}
            />
            <span className="text-white/80 tracking-wider">
              {today.label}
            </span>
          </div>

          {/* Walk-ins */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white/70 tracking-wider"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            ✓ {t("walkInsWelcome")}
          </div>

          {/* Address */}
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white/70 tracking-wider"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <MapPin size={12} />
            {t("address")}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3.6 }}
      >
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
