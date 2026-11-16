export interface GeminiModelOption {
  id: string;
  label: string;
  family: "flash-lite" | "flash" | "pro";
  access: "free" | "paid" | "preview";
  description: string;
  recommended?: boolean;
  isNew?: boolean;
}

export const DEFAULT_GEMINI_MODEL = "gemini-4-hydrogen";

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-4-hydrogen",
    label: "Gemini 4 Hydrogen",
    family: "flash",
    access: "free",
    description: "Workhorse de alta eficiência da família Gemini 4 (Lançado Nov/2026). Raciocínio nativo com 1M tokens, altíssima velocidade e latência ultrabaixa para OCR e tradução.",
    recommended: true,
    isNew: true,
  },
  {
    id: "gemini-4-argon",
    label: "Gemini 4 Argon",
    family: "pro",
    access: "free",
    description: "Flagship de raciocínio profundo da geração Gemini 4. Janela de 1M tokens, máxima precisão para kanjis raros, OCR complexo e onomatopeias.",
    isNew: true,
  },
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    family: "flash",
    access: "free",
    description: "Modelo consagrado da série Flash. Máxima velocidade com raciocínio multimodal de alta precisão.",
    isNew: true,
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    family: "flash",
    access: "free",
    description: "Sucessor estável do Gemini 3.5. Alta agilidade e leitura precisa para fluxos contínuos de tradução.",
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    family: "flash-lite",
    access: "free",
    description: "Opção ultraleve e econômica para páginas simples e alta velocidade.",
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro (Preview)",
    family: "pro",
    access: "preview",
    description: "Alta capacidade analítica para OCR denso, balões difíceis e adaptação poética.",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    family: "flash-lite",
    access: "preview",
    description: "Versão preliminar compacta focada em latência mínima.",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    family: "flash",
    access: "free",
    description: "Equilíbrio comprovado e amplamente testado na cota gratuita.",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    family: "pro",
    access: "paid",
    description: "Opção robusta da geração 2.5 para contas com faturamento ativo.",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    family: "flash-lite",
    access: "free",
    description: "Versão econômica e leve da geração 2.5.",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    family: "flash",
    access: "free",
    description: "Modelo clássico de alta compatibilidade e estabilidade comprovada.",
  },
];

export const getGeminiModelOption = (modelId?: string | null) =>
  GEMINI_MODEL_OPTIONS.find((option) => option.id === modelId) ??
  GEMINI_MODEL_OPTIONS.find((option) => option.id === DEFAULT_GEMINI_MODEL) ??
  GEMINI_MODEL_OPTIONS[0];

export const getGeminiAccessLabel = (access: GeminiModelOption["access"]) => {
  switch (access) {
    case "free":
      return "Gratis";
    case "paid":
      return "Pago";
    case "preview":
      return "Preview";
    default:
      return "Modelo";
  }
};

export const getGeminiFamilyLabel = (family: GeminiModelOption["family"]) => {
  switch (family) {
    case "flash-lite":
      return "Flash-Lite";
    case "flash":
      return "Flash";
    case "pro":
      return "Pro";
    default:
      return "Gemini";
  }
};
