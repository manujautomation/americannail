"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { BUSINESS, FEATURES } from "@/lib/constants";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "services", href: "#menu" },
  { key: "gallery", href: "#gallery" },
  { key: "reviews", href: "#reviews" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tHero = useTranslations("hero");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass shadow-soft py-3" : "bg-transparent py-5"
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="American Nails & Spa — Home">
            <Logo variant={scrolled ? "dark" : "light"} size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map(({ key, href }) => (
              <button
                key={key}
                onClick={() => handleNavClick(href)}
                className={cn(
                  "nav-link underline-rose",
                  scrolled ? "" : "nav-link-white"
                )}
              >
                {t(key)}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher scrolled={scrolled} />

            <a
              href={`tel:${BUSINESS.phone}`}
              className={cn(
                "flex items-center gap-1.5 text-xs tracking-widest uppercase font-medium transition-colors",
                scrolled ? "text-rose-gold hover:text-rose-gold-dark" : "text-white/80 hover:text-white"
              )}
              style={{ color: scrolled ? "#B76E79" : undefined }}
            >
              <Phone size={13} />
              {BUSINESS.phoneDisplay}
            </a>

            {/* My Account — customer portal only, admin link is intentionally hidden */}
            {FEATURES.customerPortal && (
              <Link
                href="/en/portal/login"
                className={cn(
                  "flex items-center gap-1.5 text-xs tracking-widest uppercase font-medium transition-colors",
                  scrolled ? "text-rose-gold hover:text-rose-gold-dark" : "text-white/80 hover:text-white"
                )}
                style={{ color: scrolled ? "#B76E79" : undefined }}
              >
                <User size={13} />
                My Account
              </Link>
            )}

            {FEATURES.onlineBooking ? (
              <button
                onClick={() => {
                  const el = document.querySelector("#booking");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 rounded-full text-xs tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90 hover:shadow-rose"
                style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
              >
                {t("bookNow")}
              </button>
            ) : (
              <a
                href={`tel:${BUSINESS.phone}`}
                className="px-5 py-2.5 rounded-full text-xs tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90 hover:shadow-rose"
                style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
              >
                {tHero("cta2")}
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={22} className={scrolled ? "text-charcoal" : "text-white"} style={{ color: scrolled ? undefined : "white" }} />
            ) : (
              <Menu size={22} className={scrolled ? "text-charcoal" : "text-white"} style={{ color: scrolled ? undefined : "white" }} />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-72 glass flex flex-col pt-20 pb-8 px-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ key, href }, i) => (
                  <motion.button
                    key={key}
                    onClick={() => handleNavClick(href)}
                    className="text-left py-3 px-4 rounded-xl text-sm tracking-wider uppercase font-medium text-charcoal hover:bg-blush-faint transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ color: "#1C1C1C" }}
                  >
                    {t(key)}
                  </motion.button>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-full border text-sm font-medium"
                  style={{ borderColor: "rgba(183,110,121,0.3)", color: "#B76E79" }}
                >
                  <Phone size={14} />
                  {BUSINESS.phoneDisplay}
                </a>
                {FEATURES.customerPortal && (
                  <Link
                    href="/en/portal/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-full border text-sm font-medium"
                    style={{ borderColor: "rgba(183,110,121,0.3)", color: "#B76E79" }}
                  >
                    <User size={14} />
                    My Account
                  </Link>
                )}
                {FEATURES.onlineBooking && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="py-3 rounded-full text-white text-sm font-medium tracking-wider uppercase"
                    style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
                  >
                    {t("bookNow")}
                  </button>
                )}
                <LanguageSwitcher scrolled={true} mobile />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
