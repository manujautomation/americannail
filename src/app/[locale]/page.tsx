import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickActionBar from "@/components/layout/QuickActionBar";
import AmbientMusic from "@/components/layout/AmbientMusic";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Services from "@/components/sections/Services";
import MenuBook from "@/components/sections/MenuBook";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import Team from "@/components/sections/Team";
import BookingSection from "@/components/sections/BookingSection";
import Contact from "@/components/sections/Contact";
import Newsletter from "@/components/sections/Newsletter";
import { FEATURES } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Stats />
        <MenuBook />
        <Services />
        <Gallery />
        <Testimonials />
        <Team />
        {FEATURES.onlineBooking && <BookingSection />}
        <Contact />
        <Newsletter />
      </main>

      <Footer />
      <QuickActionBar />
      <ConciergeWidget />
      {FEATURES.ambientMusic && <AmbientMusic />}
    </>
  );
}
