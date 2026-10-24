import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
}

export function Logo({ className = "", size = "md", withTagline = false }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-drop-navy rounded-lg transition-transform duration-200 hover:scale-[1.02] ${className}`}
      aria-label="DROP Homepage"
    >
      {/* Iconic Droplet and Ripple Mark */}
      <div
        className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-drop-midnight to-drop-navy border border-drop-cyan/20 group-hover:border-drop-cyan/50 transition-colors shadow-sm shadow-drop-cyan/10 overflow-hidden`}
      >
        {/* Subtle ambient ripple ring */}
        <span
          className="absolute inset-0 rounded-xl border border-drop-cyan/30 animate-ping opacity-25 pointer-events-none"
          style={{ animationDuration: "3s" }}
        />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 drop-shadow-[0_0_8px_rgba(0,229,240,0.6)]"
          aria-hidden="true"
        >
          {/* Outer Ripple Wave */}
          <ellipse
            cx="16"
            cy="21"
            rx="12"
            ry="4.5"
            stroke="url(#rippleGradOuter)"
            strokeWidth="1.2"
            strokeDasharray="1 1.5"
            opacity="0.6"
          />
          {/* Inner Ripple Wave */}
          <ellipse
            cx="16"
            cy="21"
            rx="7"
            ry="2.6"
            stroke="url(#rippleGradInner)"
            strokeWidth="1.4"
            opacity="0.85"
          />
          {/* Falling Luminous Droplet */}
          <path
            d="M16 4.5C16 4.5 10.5 12.5 10.5 16.5C10.5 19.5376 12.9624 22 16 22C19.0376 22 21.5 19.5376 21.5 16.5C21.5 12.5 16 4.5 16 4.5Z"
            fill="url(#dropletGrad)"
          />
          {/* Specular Highlight */}
          <circle cx="14" cy="14" r="1.3" fill="#FFFFFF" opacity="0.9" />

          <defs>
            <linearGradient id="dropletGrad" x1="16" y1="4.5" x2="16" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5F0" />
              <stop offset="0.6" stopColor="#1677FF" />
              <stop offset="1" stopColor="#6657FF" />
            </linearGradient>
            <linearGradient id="rippleGradInner" x1="9" y1="21" x2="23" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5F0" />
              <stop offset="1" stopColor="#1677FF" />
            </linearGradient>
            <linearGradient id="rippleGradOuter" x1="4" y1="21" x2="28" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5F0" stopOpacity="0.8" />
              <stop offset="1" stopColor="#6657FF" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`font-display font-extrabold tracking-wider text-drop-white ${textSizes[size]} leading-none`}
        >
          DROP
        </span>
        {withTagline && (
          <span className="text-[10px] uppercase tracking-widest text-drop-cyan/80 font-medium mt-1">
            Small Steps. Big Ideas.
          </span>
        )}
      </div>
    </Link>
  );
}
