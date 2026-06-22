import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "id"],
  defaultLocale: "en",
});
