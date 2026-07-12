import { useTranslations } from "next-intl";
import { Phone, MapPin } from "lucide-react";

// Social SVG icons (lucide-react v1 dropped Instagram/Facebook)
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import Logo from "@/components/Logo";
import { BUSINESS, FEATURES, HOURS } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Services", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  ...(FEATURES.onlineBooking ? [{ label: "Book Appointment", href: "#booking" }] : []),
];

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#0F0F0F" }}
    >
      {/* Top accent line */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #B76E79 30%, #C9A96E 70%, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="light" size="md" className="mb-5" />
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {t("tagline")}
            </p>

            {/* Social — coming soon */}
            <div className="flex gap-3">
              {[
                { icon: <InstagramIcon />, label: "Instagram" },
                { icon: <FacebookIcon />, label: "Facebook" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="group relative w-9 h-9 rounded-full flex items-center justify-center cursor-not-allowed"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}
                  title={`${s.label} — ${t("comingSoon")}`}
                >
                  {s.icon}
                  {/* Tooltip */}
                  <span
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded"
                    style={{ background: "rgba(183,110,121,0.9)", color: "white" }}
                  >
                    {t("comingSoon")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xs tracking-[0.25em] uppercase font-medium mb-5"
              style={{ color: "#B76E79" }}
            >
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3
              className="text-xs tracking-[0.25em] uppercase font-medium mb-5"
              style={{ color: "#B76E79" }}
            >
              {t("openHours")}
            </h3>
            <ul className="space-y-2">
              {HOURS.filter((h) => !h.closed).map((h) => (
                <li
                  key={h.day}
                  className="flex justify-between text-xs"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <span>{h.day.slice(0, 3)}</span>
                  <span>{h.open} – {h.close}</span>
                </li>
              ))}
              <li
                className="flex justify-between text-xs"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                <span>Mon</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs tracking-[0.25em] uppercase font-medium mb-5"
              style={{ color: "#B76E79" }}
            >
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#B76E79" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {BUSINESS.address.street}<br />
                  {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <Phone size={14} className="flex-shrink-0" style={{ color: "#B76E79" }} />
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          <span>
            {t("copyright", { year })}
          </span>
          <span>
            Walk-Ins Welcome · (540) 868-2811
          </span>
        </div>
      </div>
    </footer>
  );
}
