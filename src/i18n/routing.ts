import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi", "es", "id"],
  defaultLocale: "en",
  // Always land on English — no browser-language or cookie-based redirects.
  // Visitors pick their language explicitly via the switcher.
  localeDetection: false,
});
