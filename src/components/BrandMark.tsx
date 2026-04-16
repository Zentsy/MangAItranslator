import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import symbolDark from "@/assets/branding/mangai-symbol-dark.svg";
import symbolLight from "@/assets/branding/mangai-symbol-light.svg";

interface BrandMarkProps {
  compact?: boolean;
  contrast?: "auto" | "dark" | "light";
}

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, contrast = "auto" }) => {
  const { theme } = useTheme();
  const resolvedContrast =
    contrast === "auto" ? (theme === "paper-light" ? "light" : "dark") : contrast;

  const symbolSrc = resolvedContrast === "light" ? symbolLight : symbolDark;
  const subtitleClass = resolvedContrast === "light"
    ? "text-app-text-secondary/65"
    : "text-app-text-secondary/55";

  if (compact) {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.35rem] border border-app-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)] shadow-[0_14px_28px_-18px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-1 rounded-[1rem] border border-app-border/40" />
        <img
          src={symbolSrc}
          alt="MangAI Translator"
          className="relative z-10 h-8 w-8 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-app-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)] shadow-[0_18px_34px_-20px_rgba(0,0,0,0.72)]">
        <div className="absolute inset-1.5 rounded-[1.25rem] border border-app-border/40" />
        <img
          src={symbolSrc}
          alt="MangAI Translator"
          className="relative z-10 h-9 w-9 object-contain"
        />
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
