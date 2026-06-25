import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi", "es", "id"],
  defaultLocale: "en",
});
