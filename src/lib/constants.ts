export const BUSINESS = {
  name: "American Nails & Spa",
  shortName: "ANS",
  phone: "+15408682811",
  phoneDisplay: "(540) 868-2811",
  email: "manuj.automation.ssn@gmail.com", // FUTURE: replace with owner email
  address: {
    street: "640 Warrior Dr Ste 106",
    city: "Stephens City",
    state: "VA",
    zip: "22655",
    full: "640 Warrior Dr Ste 106, Stephens City, VA 22655",
    building: "Warrior Center, Floor 1",
  },
  coordinates: {
    lat: 39.1026,
    lng: -78.2189,
  },
  rating: 4.0,
  reviewCount: 82,
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=640+Warrior+Dr+Ste+106+Stephens+City+VA+22655",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3111.5!2d-78.2189!3d39.1026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s640+Warrior+Dr+Ste+106%2C+Stephens+City%2C+VA+22655!5e0!3m2!1sen!2sus!4v1",
} as const;

export const HOURS = [
  { day: "Sunday", dayKey: "sun", open: "11:00 AM", close: "5:00 PM", closed: false },
  { day: "Monday", dayKey: "mon", open: "", close: "", closed: true },
  { day: "Tuesday", dayKey: "tue", open: "10:00 AM", close: "7:00 PM", closed: false },
  { day: "Wednesday", dayKey: "wed", open: "10:00 AM", close: "7:00 PM", closed: false },
  { day: "Thursday", dayKey: "thu", open: "10:00 AM", close: "7:00 PM", closed: false },
  { day: "Friday", dayKey: "fri", open: "10:00 AM", close: "7:00 PM", closed: false },
  { day: "Saturday", dayKey: "sat", open: "9:00 AM", close: "6:00 PM", closed: false },
] as const;

export function getTodayStatus(): { isOpen: boolean; label: string; closeTime?: string } {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const today = HOURS[dayIndex];
  if (today.closed) return { isOpen: false, label: "Closed Today" };
  return { isOpen: true, label: `Open · Closes ${today.close}`, closeTime: today.close };
}

export const SERVICES = [
  {
    id: "gel-manicure",
    dbId: "30000000-0000-0000-0000-000000000001",
    nameKey: "gel",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    duration: "45–60 min",
    color: "#E8B4B8",
  },
  {
    id: "acrylic-nails",
    dbId: "30000000-0000-0000-0000-000000000002",
    nameKey: "acrylic",
    image: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80",
    duration: "75–90 min",
    color: "#D4A0A7",
  },
  {
    id: "dip-powder",
    dbId: "30000000-0000-0000-0000-000000000003",
    nameKey: "dip",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&q=80",
    duration: "60–75 min",
    color: "#C9A96E",
  },
  {
    id: "spa-pedicure",
    dbId: "30000000-0000-0000-0000-000000000004",
    nameKey: "pedicure",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    duration: "60–75 min",
    color: "#B76E79",
  },
  {
    id: "foot-massage",
    dbId: "30000000-0000-0000-0000-000000000005",
    nameKey: "massage",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    duration: "30–45 min",
    color: "#E8D5B0",
  },
  {
    id: "nail-art",
    dbId: "30000000-0000-0000-0000-000000000006",
    nameKey: "art",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    duration: "varies",
    color: "#F5E6E8",
  },
  {
    id: "waxing",
    dbId: "30000000-0000-0000-0000-000000000007",
    nameKey: "waxing",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    duration: "15–45 min",
    color: "#D4A0A7",
  },
  {
    id: "spa-treatments",
    dbId: "30000000-0000-0000-0000-000000000008",
    nameKey: "spa",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    duration: "90+ min",
    color: "#B76E79",
  },
] as const;

export const GALLERY_IMAGES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85",
    alt: "Personalized gel manicure with rose gold accents",
    span: "tall",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=800&q=85",
    alt: "Custom acrylic nail art design",
    span: "wide",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=85",
    alt: "Elegant dip powder nails",
    span: "normal",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=85",
    alt: "Relaxing spa pedicure treatment",
    span: "normal",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=85",
    alt: "Premium spa treatment experience",
    span: "wide",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=85",
    alt: "Professional waxing services",
    span: "tall",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=85",
    alt: "Therapeutic foot massage",
    span: "normal",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85",
    alt: "Elegant salon interior",
    span: "normal",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    text: "Absolutely love this place! The staff is so talented and the salon is beautiful. My gel manicure lasted over three weeks without chipping. Will definitely be back!",
    date: "2 weeks ago",
    service: "Gel Manicure",
  },
  {
    id: 2,
    name: "Jennifer L.",
    rating: 5,
    text: "Best pedicure I've ever had. The foot massage alone was worth it. The technicians are incredibly skilled and the ambiance is so relaxing. My go-to spot!",
    date: "1 month ago",
    service: "Spa Pedicure",
  },
  {
    id: 3,
    name: "Maria R.",
    rating: 4,
    text: "Great nail art! They did exactly what I wanted from just a reference photo. Very detailed work and very reasonably priced for the quality you get.",
    date: "3 weeks ago",
    service: "Nail Art",
  },
] as const;

export const TEAM = [
  {
    id: 1,
    name: "Lily Chen",
    role: "Lead Nail Technician",
    specialty: "Nail Art & Acrylics",
    years: 6,
    avatar: null, // FUTURE: real photo
  },
  {
    id: 2,
    name: "Sophie Tran",
    role: "Spa Specialist",
    specialty: "Pedicures & Massage",
    years: 4,
    avatar: null,
  },
  {
    id: 3,
    name: "Anna Kim",
    role: "Color Expert",
    specialty: "Gel & Dip Powder",
    years: 5,
    avatar: null,
  },
] as const;

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
