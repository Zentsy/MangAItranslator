export interface GeminiModelOption {
  id: string;
  label: string;
  family: "flash-lite" | "flash" | "pro";
  access: "free" | "paid" | "preview";
  description: string;
  recommended?: boolean;
}

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    family: "flash-lite",
    access: "free",
    description: "Opcao mais leve e economica para testes rapidos e uso diario simples.",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    family: "flash",
    access: "free",
    description: "Melhor equilibrio entre velocidade, OCR e qualidade para a maioria dos capitulos.",
    recommended: true,
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    family: "pro",
    access: "paid",
    description: "Opcao mais forte para quem quer mais qualidade e ja tem billing ativo no Google AI.",
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash Preview",
    family: "flash",
    access: "preview",
    description: "Versao mais nova da linha Flash. Boa para testar ganhos de raciocinio e visao.",
  },
  {
    id: "gemini-3-pro-preview",
    label: "Gemini 3 Pro Preview",
    family: "pro",
    access: "preview",
    description: "Preview avancado para quem quer o topo da linha e aceita custo maior e possiveis mudancas.",
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
