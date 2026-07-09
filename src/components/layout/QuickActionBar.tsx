"use client";

import { useTranslations } from "next-intl";
import { Phone, MapPin, CalendarDays, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BUSINESS, FEATURES } from "@/lib/constants";

export default function QuickActionBar() {
  const t = useTranslations("quickAction");

  const actions = [
    {
      key: "call",
      icon: <Phone size={18} />,
      href: `tel:${BUSINESS.phone}`,
      onClick: undefined,
    },
    {
      key: "directions",
      icon: <MapPin size={18} />,
      href: BUSINESS.googleMapsUrl,
      onClick: undefined,
      external: true,
    },
    ...(FEATURES.onlineBooking
      ? [{
          key: "book",
          icon: <CalendarDays size={18} />,
          href: undefined,
          onClick: () => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" }),
          highlight: true,
        } as const]
      : []),
    {
      key: "message",
      icon: <MessageCircle size={18} />,
      href: undefined,
      onClick: () => document.querySelector("#concierge-trigger")?.dispatchEvent(new Event("click")),
    },
  ] as const;

  type Action = typeof actions[number];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-white/40 pb-safe"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 2.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch">
        {actions.map((action) => {
          const label = t(action.key);
          const isHighlight = "highlight" in action && action.highlight;
          const className = isHighlight
            ? "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-white text-[10px] tracking-wider uppercase font-medium"
            : "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-charcoal/70 text-[10px] tracking-wider uppercase font-medium hover:text-rose-gold transition-colors";

          if (action.href) {
            return (
              <a
                key={action.key}
                href={action.href}
                target={"external" in action && action.external ? "_blank" : undefined}
                rel={"external" in action && action.external ? "noopener noreferrer" : undefined}
                className={className}
                aria-label={label}
              >
                {action.icon}
                <span>{label}</span>
              </a>
            );
          }

          return (
            <button
              key={action.key}
              onClick={action.onClick}
              className={className}
              aria-label={label}
              style={
                isHighlight
                  ? { background: "linear-gradient(135deg, #B76E79, #C9A96E)" }
                  : undefined
              }
            >
              {action.icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
