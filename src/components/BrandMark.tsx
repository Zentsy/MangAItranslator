import React from "react";

interface BrandMarkProps {
  compact?: boolean;
}

const BrandMark: React.FC<BrandMarkProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.35rem] border border-app-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_60%)] shadow-[0_14px_28px_-18px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-1 rounded-[1rem] border border-app-border/40" />
        <div className="absolute -left-4 top-3 h-px w-12 rotate-[28deg] bg-app-text-primary/15" />
        <div className="absolute -right-4 bottom-4 h-px w-10 -rotate-[28deg] bg-app-text-primary/15" />
        <svg
          viewBox="0 0 72 72"
          className="relative z-10 h-8 w-8 text-app-text-primary"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        >
          <path d="M14 51V20L28 36L36 24L44 36L58 20V51" />
          <path d="M17 55H55" strokeWidth="4" />
          <circle cx="55" cy="16" r="4" fill="currentColor" stroke="none" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <BrandMark compact />
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-app-text-secondary/60">
          MangAI
        </div>
        <div className="text-2xl font-black uppercase italic tracking-tight text-app-text-primary">
          Translator
        </div>
        <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/50">
          Terminal de localizacao assistida
        </div>
      </div>
    </div>
  );
};

export default BrandMark;
