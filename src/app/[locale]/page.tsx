import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QuickActionBar from "@/components/layout/QuickActionBar";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Services from "@/components/sections/Services";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import Team from "@/components/sections/Team";
import BookingSection from "@/components/sections/BookingSection";
import Contact from "@/components/sections/Contact";
import Newsletter from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Stats />
        <Services />
        <Gallery />
        <Testimonials />
        <Team />
        <BookingSection />
        <Contact />
        <Newsletter />
      </main>

      <Footer />
      <QuickActionBar />
      <ConciergeWidget />
    </>
  );
}
