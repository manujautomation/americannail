import { cn } from "@/lib/utils";

type Props = {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { icon: 20, text1: "text-sm", text2: "text-[10px]", gap: "gap-2" },
  md: { icon: 28, text1: "text-base", text2: "text-[11px]", gap: "gap-2.5" },
  lg: { icon: 40, text1: "text-2xl", text2: "text-sm", gap: "gap-3" },
};

export default function Logo({ variant = "dark", size = "md", className }: Props) {
  const s = sizes[size];
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center", s.gap, className)} aria-label="American Nails & Spa">
      {/* Icon: minimalist lotus / nail motif */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer petals */}
        <path
          d="M20 4C20 4 14 10 14 17C14 20.31 16.69 23 20 23C23.31 23 26 20.31 26 17C26 10 20 4 20 4Z"
          fill={isLight ? "rgba(255,255,255,0.9)" : "#B76E79"}
        />
        <path
          d="M20 4C20 4 26 10 26 17C26 20.31 23.31 23 20 23C16.69 23 14 20.31 14 17C14 10 20 4 20 4Z"
          fill={isLight ? "rgba(201,169,110,0.7)" : "#C9A96E"}
          opacity="0.6"
        />
        {/* Left petal */}
        <path
          d="M7 17C7 17 11 12 17 13C19.5 13.5 21 16 20 18.5C19 21 16 22 13.5 21C9 19.5 7 17 7 17Z"
          fill={isLight ? "rgba(255,255,255,0.6)" : "#D4A0A7"}
          opacity="0.8"
        />
        {/* Right petal */}
        <path
          d="M33 17C33 17 29 12 23 13C20.5 13.5 19 16 20 18.5C21 21 24 22 26.5 21C31 19.5 33 17 33 17Z"
          fill={isLight ? "rgba(255,255,255,0.6)" : "#D4A0A7"}
          opacity="0.8"
        />
        {/* Center dot */}
        <circle
          cx="20"
          cy="18"
          r="3"
          fill={isLight ? "rgba(201,169,110,0.9)" : "#C9A96E"}
        />
        {/* Stem */}
        <line
          x1="20"
          y1="23"
          x2="20"
          y2="36"
          stroke={isLight ? "rgba(255,255,255,0.5)" : "#B76E79"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Bottom leaf left */}
        <path
          d="M20 30C20 30 14 28 13 33C16 34 20 32 20 30Z"
          fill={isLight ? "rgba(255,255,255,0.4)" : "#C9A96E"}
          opacity="0.7"
        />
        {/* Bottom leaf right */}
        <path
          d="M20 30C20 30 26 28 27 33C24 34 20 32 20 30Z"
          fill={isLight ? "rgba(255,255,255,0.4)" : "#C9A96E"}
          opacity="0.7"
        />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading font-light tracking-[0.25em] uppercase",
            s.text1,
            isLight ? "text-white" : "text-charcoal"
          )}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          American
        </span>
        <span
          className={cn(
            "font-heading italic tracking-[0.15em]",
            s.text2,
            isLight ? "text-gold-light" : "text-rose-gold"
          )}
          style={{
            fontFamily: "var(--font-heading)",
            color: isLight ? "#E8D5B0" : "#B76E79",
          }}
        >
          Nails &amp; Spa
        </span>
      </div>
    </div>
  );
}
