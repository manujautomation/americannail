"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOCALES = [
  { code: "en", label: "EN", full: "English" },
  { code: "vi", label: "VI", full: "Tiếng Việt" },
  { code: "es", label: "ES", full: "Español" },
  { code: "id", label: "ID", full: "Bahasa Indonesia" },
] as const;

type Props = { scrolled: boolean; mobile?: boolean };

export default function LanguageSwitcher({ scrolled, mobile = false }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  if (mobile) {
    return (
      <div className="flex gap-2 justify-center">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all",
              locale === l.code
                ? "text-white"
                : "text-muted hover:text-charcoal"
            )}
            style={locale === l.code ? { background: "linear-gradient(135deg, #B76E79, #C9A96E)" } : {}}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium transition-colors",
          scrolled ? "text-muted hover:text-charcoal" : "text-white/70 hover:text-white"
        )}
        aria-label="Switch language"
      >
        <Globe size={13} />
        {locale.toUpperCase()}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 glass rounded-xl overflow-hidden shadow-medium min-w-[140px]"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors",
                  locale === l.code
                    ? "text-rose-gold bg-blush-faint"
                    : "text-charcoal hover:bg-blush-faint"
                )}
                style={{ color: locale === l.code ? "#B76E79" : undefined }}
              >
                {l.label} — {l.full}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
