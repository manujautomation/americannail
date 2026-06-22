"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required = true,
  rightSlot,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#B76E79" }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-11 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-all"
        style={{ borderColor: "rgba(183,110,121,0.2)", color: "#1C1C1C", background: "#FDFBFB" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#B76E79")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(183,110,121,0.2)")}
      />
      {rightSlot && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  );
}

export default function PortalAuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName,
              phone: form.phone,
              role: "customer",
            },
          },
        });
        if (err) throw err;
      }
      router.push("/en/portal");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const pwToggle = (
    <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted hover:text-charcoal transition-colors">
      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, rgba(183,110,121,0.06) 0%, rgba(201,169,110,0.06) 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="dark" size="md" />
        </div>

        {/* Mode toggle */}
        <div
          className="flex bg-white rounded-2xl p-1.5 mb-6"
          style={{ boxShadow: "0 2px 12px rgba(183,110,121,0.08)" }}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
              style={{
                background: mode === m ? "linear-gradient(135deg, #B76E79, #C9A96E)" : "transparent",
                color: mode === m ? "white" : "#8C7B7B",
              }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div
          className="bg-white rounded-3xl p-8"
          style={{ boxShadow: "0 8px 48px rgba(183,110,121,0.1)" }}
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field icon={<User size={15} />} type="text" placeholder="First name" value={form.firstName} onChange={set("firstName")} />
                    <Field icon={<User size={15} />} type="text" placeholder="Last name" value={form.lastName} onChange={set("lastName")} required={false} />
                  </div>
                  <Field icon={<Phone size={15} />} type="tel" placeholder="Phone number" value={form.phone} onChange={set("phone")} />
                </>
              )}
              <Field icon={<Mail size={15} />} type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
              <Field icon={<Lock size={15} />} type={showPw ? "text" : "password"} placeholder="Password" value={form.password} onChange={set("password")} rightSlot={pwToggle} />

              {error && (
                <p className="text-xs text-red-500 text-center pt-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-white text-sm font-medium tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center mt-2"
                style={{ background: "linear-gradient(135deg, #B76E79, #C9A96E)" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Demo hint */}
          {mode === "login" && (
            <div
              className="mt-5 p-3 rounded-xl text-center"
              style={{ background: "rgba(183,110,121,0.05)", border: "1px solid rgba(183,110,121,0.1)" }}
            >
              <p className="text-[11px] tracking-wider uppercase font-medium mb-1" style={{ color: "#B76E79" }}>
                Demo Customer
              </p>
              <p className="text-xs text-muted">customer@demo.com</p>
              <p className="text-xs text-muted">Customer@ANS2024!</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted">
          <a href="/en" className="hover:text-charcoal transition-colors">← Back to website</a>
          <span>·</span>
          <a href="/en/admin/login" className="hover:text-charcoal transition-colors">Staff login</a>
        </div>
      </div>
    </div>
  );
}
