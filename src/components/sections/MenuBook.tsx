"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";

const PAGES = [
  { src: "/menu/01-manicure.jpeg", key: "manicure" },
  { src: "/menu/02-pedicure.jpeg", key: "pedicure" },
  { src: "/menu/03-nail-enhancement.jpeg", key: "nailEnhancement" },
  { src: "/menu/04-waxing.jpeg", key: "waxing" },
  { src: "/menu/05-add-ons.jpeg", key: "addOns" },
  { src: "/menu/06-signature.jpeg", key: "signature" },
  { src: "/menu/07-thank-you.jpeg", key: "thankYou" },
] as const;

// Leaves of the desktop book: front face shows on the right, back face on the left
// after the leaf is turned. The last leaf never turns, so Thank You stays visible.
const LEAVES = [
  { front: 0, back: 1 },
  { front: 2, back: 3 },
  { front: 4, back: 5 },
  { front: 6, back: null },
] as const;

const MAX_SPREAD = LEAVES.length - 1;
const FLIP_TRANSITION = { duration: 1.1, ease: [0.645, 0.045, 0.355, 1] as const };
const PAGE_SIZES = "(max-width: 767px) 85vw, 420px";

function PageImage({ page, priority }: { page: (typeof PAGES)[number]; priority?: boolean }) {
  const t = useTranslations("menuBook");
  return (
    <Image
      src={page.src}
      alt={t(`pages.${page.key}`)}
      fill
      className="object-cover"
      sizes={PAGE_SIZES}
      priority={priority}
    />
  );
}

function InnerCover() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-l-xl"
      style={{ background: "linear-gradient(135deg, #FDF0F1, #F0E8E4)" }}
    >
      <span
        className="font-heading text-3xl lg:text-4xl font-light text-center px-6"
        style={{ fontFamily: "var(--font-heading)", color: "#1C1C1C" }}
      >
        American
        <br />
        Nails &amp; Spa
      </span>
      <div className="w-10 h-px" style={{ background: "#B76E79" }} />
      <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: "#8C7B7B" }}>
        Service Menu
      </span>
      {/* Spine shading */}
      <div
        className="absolute inset-y-0 right-0 w-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(28,28,28,0.10), transparent)" }}
      />
    </div>
  );
}

export default function MenuBook() {
  const t = useTranslations("menuBook");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Desktop: number of leaves turned. Mobile: current page index.
  const [spread, setSpread] = useState(0);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zoomed, setZoomed] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    setMounted(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (zoomed === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  const atStart = isMobile ? page === 0 : spread === 0;
  const atEnd = isMobile ? page === PAGES.length - 1 : spread === MAX_SPREAD;

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    if (isMobile) {
      setPage((p) => Math.min(Math.max(p + dir, 0), PAGES.length - 1));
    } else {
      setSpread((s) => Math.min(Math.max(s + dir, 0), MAX_SPREAD));
    }
  };

  const positionLabel = isMobile
    ? `${page + 1} / ${PAGES.length}`
    : `${spread + 1} / ${MAX_SPREAD + 1}`;

  return (
    <section id="menu" className="section-padding gradient-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <span
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4 block"
            style={{ color: "#B76E79" }}
          >
            {t("eyebrow")}
          </span>
          <h2
            className="font-heading text-5xl lg:text-6xl font-light mb-5"
            style={{ fontFamily: "var(--font-heading)", color: "#1C1C1C" }}
          >
            {t("heading")}
          </h2>
          <div className="divider-rose mb-5" />
          <p className="text-muted text-base max-w-lg mx-auto leading-relaxed" style={{ color: "#8C7B7B" }}>
            {t("subheading")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {/* Book */}
          {!mounted ? (
            <div className="mx-auto w-full max-w-[860px]" style={{ aspectRatio: "2330 / 2000" }} />
          ) : isMobile ? (
            /* ---------- Mobile: single page with turn animation + swipe ---------- */
            <div className="mx-auto w-[min(85vw,340px)]" style={{ perspective: 1800 }}>
              <div
                className="relative w-full rounded-xl"
                style={{ aspectRatio: "1165 / 2000", boxShadow: "var(--shadow-strong)" }}
              >
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                  <motion.div
                    key={page}
                    className="absolute inset-0 rounded-xl overflow-hidden bg-white"
                    custom={direction}
                    initial={{ rotateY: direction > 0 ? 65 : -65, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: direction > 0 ? -65 : 65, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ transformOrigin: direction > 0 ? "left center" : "right center" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 && !atEnd) go(1);
                      else if (info.offset.x > 60 && !atStart) go(-1);
                    }}
                    onTap={() => setZoomed(page)}
                  >
                    <PageImage page={PAGES[page]} priority={page === 0} />
                    <div
                      className="absolute inset-y-0 left-0 w-6 pointer-events-none"
                      style={{ background: "linear-gradient(to right, rgba(28,28,28,0.12), transparent)" }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* ---------- Desktop: two-page spread with 3D turning leaves ---------- */
            <div className="mx-auto w-full max-w-[860px]" style={{ perspective: 2600 }}>
              <div
                className="relative w-full rounded-xl"
                style={{
                  aspectRatio: "2330 / 2000",
                  transformStyle: "preserve-3d",
                  boxShadow: "var(--shadow-strong)",
                }}
              >
                {/* Base: inner cover on the left, blank page under the right stack */}
                <div className="absolute left-0 top-0 h-full w-1/2">
                  <InnerCover />
                </div>
                <div
                  className="absolute right-0 top-0 h-full w-1/2 rounded-r-xl"
                  style={{ background: "#F0E8E4" }}
                />

                {/* Turning leaves */}
                {LEAVES.map((leaf, i) => {
                  const flipped = i < spread;
                  return (
                    <motion.div
                      key={i}
                      className="absolute top-0 h-full w-1/2 cursor-pointer"
                      style={{
                        left: "50%",
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                      }}
                      animate={{ rotateY: flipped ? -180 : 0, z: flipped ? (i + 1) * 2 : -i * 2 }}
                      transition={FLIP_TRANSITION}
                      onClick={() => setZoomed(flipped ? leaf.back : leaf.front)}
                    >
                      {/* Front face — shows as the right-hand page */}
                      <div
                        className="absolute inset-0 rounded-r-xl overflow-hidden bg-white"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <PageImage page={PAGES[leaf.front]} priority={i === 0} />
                        <div
                          className="absolute inset-y-0 left-0 w-8 pointer-events-none"
                          style={{ background: "linear-gradient(to right, rgba(28,28,28,0.14), transparent)" }}
                        />
                      </div>
                      {/* Back face — shows as the left-hand page once turned */}
                      <div
                        className="absolute inset-0 rounded-l-xl overflow-hidden bg-white"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        {leaf.back !== null ? (
                          <>
                            <PageImage page={PAGES[leaf.back]} />
                            <div
                              className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                              style={{ background: "linear-gradient(to left, rgba(28,28,28,0.14), transparent)" }}
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0" style={{ background: "#F0E8E4" }} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button
              onClick={() => go(-1)}
              disabled={atStart}
              aria-label={t("prev")}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white transition-all duration-300 hover:shadow-rose hover:-translate-y-0.5 disabled:opacity-35 disabled:pointer-events-none"
              style={{ color: "#B76E79", boxShadow: "var(--shadow-soft)" }}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-xs tracking-[0.25em] font-medium tabular-nums" style={{ color: "#8C7B7B" }}>
              {positionLabel}
            </span>

            <button
              onClick={() => go(1)}
              disabled={atEnd}
              aria-label={t("next")}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white transition-all duration-300 hover:shadow-rose hover:-translate-y-0.5 disabled:opacity-35 disabled:pointer-events-none"
              style={{ color: "#B76E79", boxShadow: "var(--shadow-soft)" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <p
            className="flex items-center justify-center gap-1.5 text-[11px] tracking-wider uppercase mt-4"
            style={{ color: "#B8A9A9" }}
          >
            <ZoomIn size={12} />
            {t("zoomHint")}
          </p>
        </ScrollReveal>
      </div>

      {/* Zoom lightbox */}
      <AnimatePresence>
        {zoomed !== null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(28,28,28,0.92)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoomed(null)}
            data-lenis-prevent
          >
            <button
              onClick={() => setZoomed(null)}
              aria-label={t("close")}
              className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/10"
            >
              <X size={22} />
            </button>
            <motion.div
              className="relative h-full w-full max-w-[560px]"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={PAGES[zoomed].src}
                alt={t(`pages.${PAGES[zoomed].key}`)}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 560px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
