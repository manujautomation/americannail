"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? TESTIMONIALS.length - 1 : a - 1));
  const next = () => setActive((a) => (a === TESTIMONIALS.length - 1 ? 0 : a + 1));

  return (
    <section
      id="reviews"
      className="section-padding relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1C1C1C 0%, #2C2C2C 100%)",
      }}
    >
      {/* Decorative rose gold circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
        style={{
          background: "radial-gradient(circle, #B76E79, transparent)",
          transform: "translate(40%, -40%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
        style={{
          background: "radial-gradient(circle, #C9A96E, transparent)",
          transform: "translate(-40%, 40%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#C9A96E" }}
          >
            Client Experiences
          </span>
          <h2
            className="font-heading text-5xl lg:text-6xl font-light text-white mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("heading")}
          </h2>
          <div
            className="divider-rose mb-5 mx-auto"
            style={{
              background: "linear-gradient(90deg, #B76E79, #C9A96E)",
              height: "1px",
              width: "60px",
            }}
          />
          <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-base">
            {t("subheading")}
          </p>
        </ScrollReveal>

        {/* Testimonial Slider */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center px-8 lg:px-16"
            >
              {/* Quote icon */}
              <Quote
                size={48}
                className="mx-auto mb-8 opacity-30"
                style={{ color: "#B76E79" }}
              />

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: TESTIMONIALS[active].rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-current"
                    style={{ color: "#C9A96E" }}
                  />
                ))}
              </div>

              {/* Text */}
              <blockquote
                className="font-heading text-2xl lg:text-3xl font-light leading-relaxed text-white mb-8 italic"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                &ldquo;{TESTIMONIALS[active].text}&rdquo;
              </blockquote>

              {/* Meta */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-white font-medium text-sm tracking-wider">
                  {TESTIMONIALS[active].name}
                </span>
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "#B76E79" }}
                >
                  {TESTIMONIALS[active].service}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {TESTIMONIALS[active].date}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                border: "1px solid rgba(183,110,121,0.4)",
                color: "#B76E79",
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="transition-all duration-300"
                  style={{
                    width: i === active ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background:
                      i === active
                        ? "linear-gradient(90deg, #B76E79, #C9A96E)"
                        : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                border: "1px solid rgba(183,110,121,0.4)",
                color: "#B76E79",
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Google CTA */}
        <ScrollReveal className="text-center mt-14" delay={0.2}>
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            82 reviews on Google
          </p>
          <a
            href="https://www.google.com/search?q=American+Nails+Spa+Stephens+City+VA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wider transition-colors"
            style={{ color: "#C9A96E" }}
          >
            View All Reviews on Google
            <ChevronRight size={14} />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
