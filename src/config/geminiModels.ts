export interface GeminiModelOption {
  id: string;
  label: string;
  family: "flash-lite" | "flash" | "pro";
  access: "free" | "paid" | "preview";
  description: string;
  recommended?: boolean;
}

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    family: "flash",
    access: "free",
    description: "Modelo de última geração. Máxima velocidade com raciocínio multimodal de alta precisão.",
    recommended: true,
  },
  {
    id: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    family: "flash",
    access: "free",
    description: "Modelo avançado da série 3 com raciocínio híbrido e alta acurácia visual.",
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    family: "flash",
    access: "free",
    description: "Versão ágil e estável para leitura rápida de quadrinhos e mangás.",
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    family: "flash",
    access: "free",
    description: "Excelente precisão em balões densos e detecção de caracteres japoneses complexos.",
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
    description: "Topo absoluto de linha para OCR complexo, onomatopeias estilizadas e balões difíceis.",
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash (Preview)",
    family: "flash",
    access: "preview",
    description: "Preview multimodal experimental da família Gemini 3.",
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
