import React from "react";
import { motion } from "framer-motion";

interface NanquimLoadingProps {
  compact?: boolean;
  text?: string;
  subtitle?: string;
  className?: string;
}

export const GPenNibIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 2L9 8L7 17L12 22L17 17L15 8L12 2Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 2V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M7 17L17 17" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
);

const NanquimLoading: React.FC<NanquimLoadingProps> = ({
  compact = true,
  text,
  subtitle,
  className = "",
}) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        {/* Bico de Pena G com gota de nanquim pulsante */}
        <div className="relative flex items-center justify-center">
          <GPenNibIcon className="h-4 w-4 text-app-accent animate-pulse" />
          <motion.span
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-app-accent"
          />
        </div>

        {/* Indicador caligráfico / texto */}
        <span className="font-pixel text-[11px] font-bold uppercase tracking-wider text-app-accent">
          {text || "墨..."}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden border-2 border-app-border bg-app-card p-8 shadow-ink text-app-text-primary ${className}`}
    >
      {/* Retícula de fundo */}
      <div className="halftone absolute inset-0 opacity-15 pointer-events-none" />

      {/* Cantoneiras Tonbo */}
      <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
      <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
      <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
      <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

      {/* Ícone de Pena G com anel de tinta */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center border-2 border-app-accent bg-app-surface shadow-hanko -rotate-2">
        <GPenNibIcon className="h-9 w-9 text-app-accent" />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 border-2 border-app-accent"
        />
      </div>

      {/* Textos editoriais */}
      <div className="relative z-10 mt-5 text-center">
        <div className="font-display text-lg tracking-wider text-app-text-primary uppercase">
          {text || "Carregando..."}
        </div>
        <div className="mt-1 font-pixel text-[10px] tracking-[0.25em] text-app-text-secondary/70 uppercase">
          {subtitle || "執筆中 • MANUSCRITO EM ANDAMENTO"}
        </div>
      </div>

      {/* Barra de progresso com listras de mangá */}
      <div className="relative z-10 mt-4 h-2.5 w-48 overflow-hidden border-2 border-app-border bg-app-surface">
        <div className="bar-stripes h-full w-full bg-app-accent" />
      </div>
    </div>
  );
};

export default NanquimLoading;
