import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface MangaBackgroundProps {
  children: React.ReactNode;
}

const MangaBackground: React.FC<MangaBackgroundProps> = ({ children }) => {
  const { theme } = useTheme();
  const isLight = theme === "paper-light";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-app-bg text-app-text-primary transition-colors duration-300"
    >
      {/* 1. Camada de Ruído de Papel Washi (SVG turbulence local 100% offline) */}
      <div className="noise-layer" aria-hidden="true" />

      {/* 2. Camada de Retícula Halftone de Mangá */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isLight ? "halftone opacity-[0.14]" : "halftone-paper opacity-[0.08]"
        }`}
        aria-hidden="true"
      />

      {/* 3. Linhas de Ação / Speedlines Sutis nos cantos */}
      <div
        className="speedlines pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* 4. Marcas de Corte Editorial de Prancha (Genkō Yōshi) */}
      <div
        className="pointer-events-none absolute inset-3 z-30 select-none opacity-20"
        aria-hidden="true"
      >
        {/* Canto Superior Esquerdo */}
        <span className="absolute top-0 left-0 font-pixel text-xs leading-none text-current">
          ⌜ MANGAI-PAGE
        </span>
        {/* Canto Superior Direito */}
        <span className="absolute top-0 right-0 font-pixel text-xs leading-none text-current">
          GENKO-YOSHI ⌝
        </span>
        {/* Canto Inferior Esquerdo */}
        <span className="absolute bottom-0 left-0 font-pixel text-xs leading-none text-current">
          ⌞ PT-BR
        </span>
        {/* Canto Inferior Direito */}
        <span className="absolute bottom-0 right-0 font-pixel text-xs leading-none text-current">
          ORIGINAL ⌟
        </span>
      </div>

      {/* Conteúdo da Aplicação */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
};

export default MangaBackground;
