"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "framer-motion";
import ScrollReveal from "@/components/motion/ScrollReveal";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(duration / target);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const t = useTranslations("stats");

  const items = [
    {
      value: 82,
      suffix: "+",
      label: t("reviewsLabel"),
      sublabel: t("reviews"),
    },
    {
      value: 4,
      suffix: ".0★",
      label: t("ratingLabel"),
      sublabel: "Google",
    },
    {
      value: 5,
      suffix: "+",
      label: t("yearsLabel"),
      sublabel: t("years"),
    },
    {
      value: 8,
      suffix: "+",
      label: t("servicesLabel"),
      sublabel: t("services"),
    },
  ];

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1C1C1C 0%, #2C2C2C 100%)" }}
    >
      {/* Rose gold accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #B76E79 30%, #C9A96E 70%, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="up">
              <div className="text-center group">
                <div
                  className="font-heading text-5xl lg:text-6xl font-light mb-2 transition-all duration-300 group-hover:scale-105"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: "linear-gradient(135deg, #B76E79, #C9A96E)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <CountUp target={item.value} suffix={item.suffix} />
                </div>
                <div
                  className="text-sm font-medium tracking-wider uppercase mb-1"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {item.sublabel}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C9A96E 30%, #B76E79 70%, transparent)",
        }}
      />
    </section>
  );
}
