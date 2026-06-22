"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/en/admin");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, rgba(183,110,121,0.06) 0%, rgba(201,169,110,0.06) 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="dark" size="md" />
        </div>

        <div
          className="bg-white rounded-3xl p-8"
          style={{ boxShadow: "0 8px 48px rgba(183,110,121,0.1)" }}
        >
          <h1
            className="font-heading text-3xl font-light text-center text-charcoal mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Staff Portal
          </h1>
          <p className="text-center text-sm text-muted mb-8">American Nails &amp; Spa</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-wider uppercase font-medium mb-1.5 block" style={{ color: "#B76E79" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase font-medium mb-1.5 block" style={{ color: "#B76E79" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-white text-sm font-medium tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div
            className="mt-6 p-3 rounded-xl text-center"
            style={{ background: "rgba(183,110,121,0.06)", border: "1px solid rgba(183,110,121,0.1)" }}
          >
            <p className="text-[11px] tracking-wider uppercase font-medium mb-1" style={{ color: "#B76E79" }}>
              Demo Credentials
            </p>
            <p className="text-xs text-muted">owner@americannailsspa.com</p>
            <p className="text-xs text-muted">Demo@ANS2024!</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Customer?{" "}
          <a href="/en" className="underline" style={{ color: "#B76E79" }}>
            Visit our website
          </a>
        </p>
      </div>
    </div>
  );
}
