import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface BrandMarkProps {
  compact?: boolean;
  contrast?: "auto" | "dark" | "light";
}

const BrandSymbol: React.FC<{
  contrast: "dark" | "light";
  className: string;
}> = ({ contrast, className }) => {
  const stroke = contrast === "light" ? "#1C1917" : "#F5F1E8";
  const strokeMuted = contrast === "light" ? "#44403C" : "#D6D1C7";
  const orbFill = contrast === "light" ? "#2563EB" : "#10B981";
  const orbGlow = contrast === "light" ? "rgba(37,99,235,0.14)" : "rgba(16,185,129,0.16)";

  return (
    <svg
      viewBox="0 0 112 112"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="88" cy="22" r="14" fill={orbGlow} />
      <circle cx="88" cy="22" r="8" fill={orbFill} />
      <path
        d="M22 82V28L40 50L56 34L72 50L90 28V82"
        stroke={stroke}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M26 92H86" stroke={strokeMuted} strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
};

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, contrast = "auto" }) => {
  const { theme } = useTheme();
  const resolvedContrast =
    contrast === "auto" ? (theme === "paper-light" ? "light" : "dark") : contrast;
  const subtitleClass = resolvedContrast === "light"
    ? "text-app-text-secondary/65"
    : "text-app-text-secondary/55";

  if (compact) {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.35rem] border border-app-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)] shadow-[0_14px_28px_-18px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-1 rounded-[1rem] border border-app-border/40" />
        <BrandSymbol contrast={resolvedContrast} className="relative z-10 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-app-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)] shadow-[0_18px_34px_-20px_rgba(0,0,0,0.72)]">
        <div className="absolute inset-1.5 rounded-[1.25rem] border border-app-border/40" />
        <BrandSymbol contrast={resolvedContrast} className="relative z-10 h-9 w-9" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 leading-none">
          <span className="text-[2rem] font-black uppercase tracking-[-0.06em] text-app-text-primary">
            MangAI
          </span>
          <span className="text-[1.75rem] font-black uppercase italic tracking-[-0.05em] text-app-text-secondary/58">
            Translator
          </span>
        </div>
        <div className={`mt-2 text-[11px] font-mono uppercase tracking-[0.24em] ${subtitleClass}`}>
          Ferramenta editorial para manga e quadrinhos
        </div>
      </div>
    </div>
  );
};

export default BrandMark;
