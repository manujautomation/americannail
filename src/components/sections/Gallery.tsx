"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { ZoomIn } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { GALLERY_IMAGES } from "@/lib/constants";

export default function Gallery() {
  const t = useTranslations("gallery");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // Split into two columns for masonry effect
  const col1 = GALLERY_IMAGES.filter((_, i) => i % 2 === 0);
  const col2 = GALLERY_IMAGES.filter((_, i) => i % 2 !== 0);

  return (
    <section
      id="gallery"
      className="section-padding overflow-hidden"
      style={{ background: "var(--color-cream)" }}
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#B76E79" }}
          >
            Portfolio
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

        {/* Masonry Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            {col1.slice(0, 2).map((img, i) => (
              <GalleryCard key={img.id} img={img} delay={i * 0.1} tall={i === 0} />
            ))}
          </div>

          {/* Column 2 — offset with parallax */}
          <motion.div className="flex flex-col gap-4 mt-12" style={{ y }}>
            {col2.slice(0, 3).map((img, i) => (
              <GalleryCard key={img.id} img={img} delay={i * 0.1 + 0.15} />
            ))}
          </motion.div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4">
            {col1.slice(2).map((img, i) => (
              <GalleryCard key={img.id} img={img} delay={i * 0.1 + 0.3} tall={i === 1} />
            ))}
          </div>
        </div>

        {/* Mobile: 2-col simple grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {GALLERY_IMAGES.map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 0.06}>
              <div className="relative rounded-xl overflow-hidden aspect-square img-zoom group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

type GalleryImage = typeof GALLERY_IMAGES[number];

function GalleryCard({ img, delay, tall }: { img: GalleryImage; delay: number; tall?: boolean }) {
  return (
    <ScrollReveal delay={delay}>
      <div
        className={`relative rounded-2xl overflow-hidden img-zoom group cursor-pointer ${tall ? "aspect-[3/4]" : "aspect-square"}`}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
          <motion.div
            className="text-white flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          >
            <ZoomIn size={24} />
            <span className="text-xs tracking-[0.2em] uppercase">View</span>
          </motion.div>
        </div>
        {/* Bottom gradient for alt text */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs tracking-wide line-clamp-1">{img.alt}</span>
        </div>
      </div>
    </ScrollReveal>
  );
}
