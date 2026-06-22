import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import LenisProvider from "@/components/motion/LenisProvider";
import CursorGlow from "@/components/motion/CursorGlow";
import LoadingScreen from "@/components/motion/LoadingScreen";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "American Nails & Spa | Luxury Nail & Spa Experience",
    template: "%s | American Nails & Spa",
  },
  description:
    "Premium luxury nail and spa services in Stephens City, Virginia. Gel manicures, acrylic nails, spa pedicures, nail art, waxing and more. Walk-ins welcome.",
  keywords: [
    "nail salon",
    "spa",
    "Stephens City VA",
    "gel manicure",
    "acrylic nails",
    "pedicure",
    "nail art",
    "luxury spa",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "American Nails & Spa",
    title: "American Nails & Spa | Luxury Nail & Spa Experience",
    description:
      "Premium luxury nail and spa services in Stephens City, Virginia.",
  },
  robots: {
    index: false, // FUTURE: set to true in production
    follow: false,
  },
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }, { locale: "id" }];
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es" | "id")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-warm-white text-charcoal font-body overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <LoadingScreen />
          <LenisProvider>
            {children}
          </LenisProvider>
          <CursorGlow />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
