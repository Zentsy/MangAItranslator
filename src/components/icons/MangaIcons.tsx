import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Bico de Pena G (G-Pen Nib) tradicional de mangaká.
 * Símbolo autoral do MangAI Translator: precisão, nanquim e traço flexível.
 */
export const GPenIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cabo da Pena (Tsukegi) */}
    <path
      d="M15.5 2.5L21.5 8.5L19 11L13 5L15.5 2.5Z"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line x1="14" y1="4" x2="20" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
    
    {/* Bico Metálico da Pena G */}
    <path
      d="M13 5L4.5 13.5C3.8 14.2 3.2 16.5 2 22C7.5 20.8 9.8 20.2 10.5 19.5L19 11L13 5Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    {/* Orifício de Respiração (Breather Hole) */}
    <circle cx="10" cy="14" r="1.25" fill="currentColor" />
    {/* Fenda Central da Pena (Split-Tine com tinta) */}
    <path
      d="M9.1 14.9L2 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Balão Retangular de Narração / Caixa Editorial (Rect / Narration).
 */
export const RectBubbleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Caixa com cantoneiras de corte */}
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Linhas de Narração */}
    <line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Balão Explosivo / Serrilhado (Shout / SFX / Fora do Balão).
 */
export const ShoutBubbleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L14.5 6.5L19.5 5.5L18 10.5L22.5 13L17.5 15.5L19 20.5L14 18.5L12 23L9.5 18.5L4.5 20.5L6 15.5L1.5 13L6 10.5L4.5 5.5L9.5 6.5L12 2Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    {/* Ponto de exclamação no centro */}
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

/**
 * Balão de Pensamento / Nuvem Orgânica de Mangá (Thought Cloud).
 */
export const ThoughtBubbleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Nuvem de Pensamento */}
    <path
      d="M7 16C4.8 16 3 14.2 3 12C3 10.1 4.3 8.5 6.1 8.1C6.6 5.8 8.6 4 11 4C13.2 4 15 5.4 15.7 7.4C16.3 7.1 17 7 17.7 7C19.5 7 21 8.5 21 10.3C21 10.8 20.9 11.3 20.7 11.7C21.5 12.4 22 13.4 22 14.5C22 16.4 20.4 18 18.5 18H7.5"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bolhas Flutuantes da Cauda */}
    <circle cx="5" cy="19.5" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="3" cy="22" r="0.8" fill="currentColor" />
  </svg>
);

/**
 * Balão Duplo Sobreposto (Double / Overlapping Speech Bubble).
 */
export const DoubleBubbleIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Balão de Trás */}
    <path
      d="M14 3H19C20.7 3 22 4.3 22 6V11C22 12.7 20.7 14 19 14H18V17L15 14H14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2 2"
      fill="currentColor"
      fillOpacity="0.08"
    />
    {/* Balão da Frente */}
    <path
      d="M4 8H14C15.7 8 17 9.3 17 11V16C17 17.7 15.7 19 14 19H9L5 22V19H4C2.3 19 1 17.7 1 16V11C1 9.3 2.3 8 4 8Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <line x1="5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Lupa com Marcas de Registro Tonbo (Zoom In Editorial).
 */
export const TonboZoomInIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
    <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cruz de Tonbo / Mais de Zoom */}
    <line x1="10" y1="6.5" x2="10" y2="13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * Lupa com Marcas de Registro Tonbo (Zoom Out Editorial).
 */
export const TonboZoomOutIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
    <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Menos de Zoom */}
    <line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * Enquadramento de Prancheta / Cantoneiras de Tonbo (Fit Screen).
 */
export const TonboFitIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cantoneiras de registro de corte de mangá */}
    <path d="M3 8V4C3 3.4 3.4 3 4 3H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3H20C20.6 3 21 3.4 21 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 16V20C21 20.6 20.6 21 20 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 21H4C3.4 21 3 20.6 3 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Folha central em miniatura */}
    <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

/**
 * Rolo de Manuscrito / Encadernação para Exportação (Export Scroll).
 */
export const ScrollExportIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M19 17V5C19 3.9 18.1 3 17 3H6C4.3 3 3 4.3 3 6C3 7.7 4.3 9 6 9H17C17.6 9 18 9.4 18 10V18C18 19.7 16.7 21 15 21H5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6C3 4.3 4.3 3 6 3C7.7 3 9 4.3 9 6C9 7.7 7.7 9 6 9C4.3 9 3 7.7 3 6Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    {/* Seta de saída/exportação para fora */}
    <path d="M14 13L21 13M21 13L18 10M21 13L18 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Pote de Nanquim Artesanal (Tinteiro com Pena G).
 */
export const InkWellIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Boca do Tinteiro */}
    <ellipse cx="12" cy="6" rx="6" ry="2" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.2" />
    {/* Corpo de Vidro Facetado */}
    <path
      d="M6 7L3.5 15C3 16.5 4 20 6.5 21C9 22 15 22 17.5 21C20 20 21 16.5 20.5 15L18 7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    {/* Nível do Nanquim Escuro */}
    <path
      d="M5 14C8 16 16 16 19 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * Encadernação Watoji (Livro de Mangá Tradicional com Costura Japonesa).
 */
export const WatojiBookIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Capa do Livro */}
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.75"
      fill="currentColor"
      fillOpacity="0.1"
    />
    {/* Lombada com Costura Watoji */}
    <line x1="8" y1="3" x2="8" y2="21" stroke="currentColor" strokeWidth="1.5" />
    {/* Pontos de Costura Tradicional */}
    <line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" />
    <line x1="4" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" />
    <line x1="4" y1="18" x2="8" y2="18" stroke="currentColor" strokeWidth="1.5" />
    {/* Etiqueta de Título Vertical (Daishi) */}
    <rect x="11" y="5" width="4" height="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/**
 * Selo Hanko Carimbo Vermelho Vetorial (訳 / Tradução).
 */
export const HankoStampIcon: React.FC<IconProps & { kanji?: string }> = ({
  className = "w-4 h-4",
  size = 16,
  kanji = "訳",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" />
    <text
      x="12"
      y="16.5"
      textAnchor="middle"
      fontSize="12"
      fontFamily="var(--font-brush), serif"
      fontWeight="900"
      fill="currentColor"
    >
      {kanji}
    </text>
  </svg>
);

/**
 * Lapidação de Diálogo / 2ª Passada Editorial (Dialogue Polish).
 * Representa o refinamento da fala em mangá através de uma pena fina de retoque
 * (Maru-Pen / G-Pen) polindo os contornos e ritmo do balão.
 */
export const DialoguePolishIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Balão de Fala com Cauda */}
    <path
      d="M17 13.5C17 14.9 15.7 16 14 16H8L4 19V16H3C1.3 16 0 14.9 0 13.5V6.5C0 5.1 1.3 4 3 4H14C15.7 4 17 5.1 17 6.5V13.5Z"
      transform="translate(1.5, 0.5)"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    {/* Linhas de Diálogo sendo polidas */}
    <line x1="5.5" y1="8" x2="11.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

    {/* Bico de Pena de Retoque / Maru-Pen no Canto Superior Direito */}
    <g transform="translate(11, 1)">
      {/* Corpo da Pena */}
      <path
        d="M9 1L12 4L8.5 7.5L5.5 4.5L9 1Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      {/* Bico Metálico de Retoque */}
      <path
        d="M5.5 4.5L1.5 8.5C1.2 8.8 0.8 10 0 12C2 11.2 3.2 10.8 3.5 10.5L7.5 6.5L5.5 4.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Fenda da ponta */}
      <line x1="3" y1="9" x2="0" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
);
