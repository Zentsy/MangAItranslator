export interface OllamaModelOption {
  id: string;
  label: string;
  sizeLabel: string;
  profile: "leve" | "equilibrado" | "qualidade" | "ocr" | "legacy";
  description: string;
  installCommand: string;
  requiresOllama: string;
  recommended?: boolean;
}

export const DEFAULT_OLLAMA_MODEL = "qwen3-vl:4b";

export const OLLAMA_MODEL_OPTIONS: OllamaModelOption[] = [
  {
    id: "qwen3-vl:2b",
    label: "Qwen 3 VL 2B",
    sizeLabel: "1.9 GB",
    profile: "leve",
    description: "O mais leve da lista. Bom para PC modesto e testes rapidos.",
    installCommand: "ollama pull qwen3-vl:2b",
    requiresOllama: "0.12.7+",
  },
  {
    id: "qwen3-vl:4b",
    label: "Qwen 3 VL 4B",
    sizeLabel: "3.3 GB",
    profile: "equilibrado",
    description: "Melhor equilibrio entre qualidade, OCR e velocidade para a maioria dos usos.",
    installCommand: "ollama pull qwen3-vl:4b",
    requiresOllama: "0.12.7+",
    recommended: true,
  },
  {
    id: "qwen3-vl:8b",
    label: "Qwen 3 VL 8B",
    sizeLabel: "6.1 GB",
    profile: "qualidade",
    description: "Subida clara de qualidade local se sua maquina aguentar sem sofrer.",
    installCommand: "ollama pull qwen3-vl:8b",
    requiresOllama: "0.12.7+",
  },
  {
    id: "qwen2.5vl:7b",
    label: "Qwen 2.5 VL 7B",
    sizeLabel: "6.0 GB",
    profile: "ocr",
    description: "Opcao bem provada para OCR e documentos. Continua forte para paginas com muito texto.",
    installCommand: "ollama pull qwen2.5vl:7b",
    requiresOllama: "0.7.0+",
  },
  {
    id: "gemma3:4b",
    label: "Gemma 3 4B",
    sizeLabel: "3.3 GB",
    profile: "leve",
    description: "Alternativa leve e multimodal. Boa para quem quer algo enxuto fora da familia Qwen.",
    installCommand: "ollama pull gemma3:4b",
    requiresOllama: "0.6+",
  },
  {
    id: "minicpm-v:8b",
    label: "MiniCPM-V 8B",
    sizeLabel: "5.5 GB",
    profile: "ocr",
    description: "Especialista em OCR e paginas densas, com boa eficiencia para imagens grandes.",
    installCommand: "ollama pull minicpm-v:8b",
    requiresOllama: "0.3.10+",
  },
  {
    id: "translategemma:4b",
    label: "TranslateGemma 4B",
    sizeLabel: "3.3 GB",
    profile: "legacy",
    description: "Focado em traducao, mas eu deixei como opcao secundaria por ter ficado mais lento no seu fluxo.",
    installCommand: "ollama pull translategemma:4b",
    requiresOllama: "recente",
  },
];

export const getOllamaModelOption = (modelId?: string | null) =>
  OLLAMA_MODEL_OPTIONS.find((option) => option.id === modelId) ??
  OLLAMA_MODEL_OPTIONS.find((option) => option.id === DEFAULT_OLLAMA_MODEL) ??
  OLLAMA_MODEL_OPTIONS[0];

export const getOllamaProfileLabel = (profile: OllamaModelOption["profile"]) => {
  switch (profile) {
    case "leve":
      return "Leve";
    case "equilibrado":
      return "Equilibrado";
    case "qualidade":
      return "Qualidade";
    case "ocr":
      return "OCR";
    case "legacy":
      return "Legacy";
    default:
      return "Modelo";
  }
};
