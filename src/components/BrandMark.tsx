import React from "react";
import { MangAIOfficialLogo } from "@/components/icons/MangAIOfficialLogo";
import { useTheme } from "@/contexts/ThemeContext";

interface BrandMarkProps {
  compact?: boolean;
  contrast?: "auto" | "dark" | "light";
}

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false, contrast = "auto" }) => {
  const { theme } = useTheme();
  const isLight =
    contrast === "auto" ? theme === "paper-light" : contrast === "light";

  if (compact) {
    return (
      <div className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-app-border bg-app-card shadow-ink transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:border-app-accent">
        <MangAIOfficialLogo size={34} showText={false} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Moldura da Logo com Borda Nanquim e Selo Hanko */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-app-border bg-app-card shadow-ink transition-transform hover:-translate-y-0.5">
        <MangAIOfficialLogo size={44} showText={false} />
      </div>

      {/* Tipografia Editorial de Mangá */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 leading-none">
          <span className="font-display text-3xl uppercase tracking-wider text-current font-black">
            MangAI
          </span>
          <span className="font-display text-xl uppercase tracking-tight text-app-accent font-bold">
            Translator
          </span>
          <span className="rounded border border-app-accent/40 bg-app-accent/10 px-1.5 py-0.5 font-pixel text-[9px] font-black uppercase tracking-widest text-app-accent">
            v0.4.0
          </span>
        </div>
        <div
          className={`mt-1 font-pixel text-[10px] uppercase tracking-[0.2em] font-bold ${
            isLight ? "text-nanquim/70" : "text-washi/60"
          }`}
        >
          マンガAI翻訳 &bull; Localização Editorial Assistida
        </div>
      </div>
    </div>
  );
};

export default BrandMark;
