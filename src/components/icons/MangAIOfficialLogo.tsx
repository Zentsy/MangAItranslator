import React from "react";

interface MangAIOfficialLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * Logo Oficial Vetorial do MangAI Translator.
 * Aposentadoria total de assets raster/AI Slop em favor de arte vetorial SVG
 * autoral, geométrica, nítida em qualquer DPI com estética Nanquim, Pena G e Hanko.
 */
export const MangAIOfficialLogo: React.FC<MangAIOfficialLogoProps> = ({
  className = "h-10 w-10",
  size = 40,
  showText = false,
}) => (
  <div className={`inline-flex items-center gap-3 select-none ${className}`}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 overflow-visible"
    >
      <defs>
        {/* Gradiente Metálico para o Bico de Pena G */}
        <linearGradient id="gpen-metallic" x1="16" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.4" stopColor="#E2E8F0" />
          <stop offset="0.8" stopColor="#94A3B8" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>

        {/* Gradiente Vermelho Nanquim / Hanko */}
        <linearGradient id="hanko-red" x1="40" y1="6" x2="60" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E11D48" />
          <stop offset="1" stopColor="#9F1239" />
        </linearGradient>

        {/* Sombra dura estilo Nanquim */}
        <filter id="ink-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="2.5" stdDeviation="0" floodColor="#0F172A" floodOpacity="0.85" />
        </filter>
      </defs>

      {/* 1. MOLDURA EXTERNA OCTOGONAL (Estilo Selo Editorial / Washi Card) */}
      <polygon
        points="14,4 50,4 60,14 60,50 50,60 14,60 4,50 4,14"
        fill="#090A0F"
        stroke="#E2E8F0"
        strokeWidth="2.5"
        filter="url(#ink-shadow)"
      />

      {/* Linha de Registro Tonbo interna (Tracejada) */}
      <polygon
        points="16,8 48,8 56,16 56,48 48,56 16,56 8,48 8,16"
        fill="none"
        stroke="#E2E8F0"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeDasharray="3 2"
      />

      {/* 2. BALÃO DE DIÁLOGO DE MANGÁ (Silhueta que abraça a pena) */}
      <path
        d="M20 16C20 13.8 21.8 12 24 12H40C42.2 12 44 13.8 44 16V36C44 38.2 42.2 40 40 40H30L22 47V40H24C21.8 40 20 38.2 20 36V16Z"
        fill="#1E293B"
        fillOpacity="0.85"
        stroke="#E2E8F0"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Linhas de Tradução Editorial dentro do balão */}
      <line x1="26" y1="20" x2="38" y2="20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="25" x2="35" y2="25" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* 3. BICO DE PENA G DE MANGÁ (G-Pen Nib central em destaque) */}
      <g filter="url(#ink-shadow)">
        {/* Corpo Triangular da Pena G */}
        <path
          d="M32 18L44 32C44 32 40 46 32 54C24 46 20 32 20 32L32 18Z"
          fill="url(#gpen-metallic)"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Respiro / Orifício Central (Breather Hole) */}
        <circle cx="32" cy="36" r="2.5" fill="#0F172A" />
        {/* Fenda da Pena dividida até a ponta (Split-Tine) */}
        <line x1="32" y1="38.5" x2="32" y2="54" stroke="#0F172A" strokeWidth="1.75" strokeLinecap="round" />
        {/* Acento de luz no bico */}
        <path d="M26 31L32 24L34 26" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      </g>

      {/* 4. SELO HANKO VERMELHO OFICIAL (訳 = Tradução) */}
      <g transform="translate(42, 6) rotate(6)">
        {/* Carimbo Quadrado com Sombra */}
        <rect
          x="0"
          y="0"
          width="16"
          height="16"
          rx="2"
          fill="url(#hanko-red)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          filter="url(#ink-shadow)"
        />
        {/* Moldura Interna */}
        <rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="none" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.4" />
        {/* Ideograma Kanji de Tradução (訳) */}
        <text
          x="8"
          y="11.5"
          textAnchor="middle"
          fontSize="9"
          fontFamily="serif"
          fontWeight="900"
          fill="#FFFFFF"
          style={{ fontStyle: "normal" }}
        >
          訳
        </text>
      </g>
    </svg>

    {showText && (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-2xl font-black uppercase tracking-wider text-app-text-primary leading-none">
            Mang<span className="text-app-accent">AI</span>
          </span>
          <span className="rounded border border-app-accent bg-app-accent/15 px-1 py-0.2 font-pixel text-[8px] font-black uppercase tracking-widest text-app-accent">
            v0.4.0
          </span>
        </div>
        <span className="font-pixel text-[9px] uppercase tracking-[0.25em] text-app-text-secondary/70 mt-0.5">
          TRANSLATOR &bull; 翻訳
        </span>
      </div>
    )}
  </div>
);
