import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--color-warm-white)" }}
    >
      <Logo variant="dark" size="md" className="mb-10" />

      <p
        className="font-heading text-8xl font-light mb-4"
        style={{
          fontFamily: "var(--font-heading)",
          background: "linear-gradient(135deg, #B76E79, #C9A96E)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </p>

      <h1
        className="font-heading text-3xl font-light text-charcoal mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Page Not Found
      </h1>
      <p className="text-muted text-sm mb-10 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
