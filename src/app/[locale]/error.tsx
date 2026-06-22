"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--color-warm-white)" }}
    >
      <Logo variant="dark" size="md" className="mb-10" />

      <p
        className="font-heading text-6xl font-light mb-4"
        style={{
          fontFamily: "var(--font-heading)",
          color: "#B76E79",
        }}
      >
        Oops
      </p>

      <h1
        className="font-heading text-3xl font-light text-charcoal mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Something went wrong
      </h1>
      <p className="text-muted text-sm mb-10 max-w-sm">
        We encountered an unexpected error. Please try again or contact us at (540) 868-2811.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-8 py-4 rounded-full text-white text-sm tracking-[0.15em] uppercase font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-8 py-4 rounded-full text-sm tracking-[0.15em] uppercase font-medium border transition-all hover:bg-blush-faint"
          style={{ borderColor: "rgba(183,110,121,0.3)", color: "#B76E79" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
