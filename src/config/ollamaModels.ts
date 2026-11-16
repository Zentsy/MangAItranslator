export interface OllamaModelOption {
  id: string;
  label: string;
  sizeLabel: string;
  profile: "leve" | "equilibrado" | "qualidade" | "ocr" | "legacy";
  description: string;
  installCommand: string;
  requiresOllama: string;
  recommended?: boolean;
  isNew?: boolean;
}

export const DEFAULT_OLLAMA_MODEL = "qwen3-vl:4b";

export const OLLAMA_MODEL_OPTIONS: OllamaModelOption[] = [
  {
    id: "qwen3-vl:2b",
    label: "Qwen 3 VL 2B",
    sizeLabel: "1.9 GB",
    profile: "leve",
    description: "O mais leve da lista. Excelente para PCs modestos, laptops e testes rápidos.",
    installCommand: "ollama pull qwen3-vl:2b",
    requiresOllama: "0.12.7+",
  },
  {
    id: "qwen3-vl:4b",
    label: "Qwen 3 VL 4B",
    sizeLabel: "3.3 GB",
    profile: "equilibrado",
    description: "Melhor equilíbrio entre velocidade, acurácia de OCR e tradução em hardware comum.",
    installCommand: "ollama pull qwen3-vl:4b",
    requiresOllama: "0.12.7+",
    recommended: true,
  },
  {
    id: "qwen3-vl:8b",
    label: "Qwen 3 VL 8B",
    sizeLabel: "6.1 GB",
    profile: "qualidade",
    description: "Salto nítido de qualidade para kanjis difíceis, mantendo boa velocidade em GPUs de 8GB+.",
    installCommand: "ollama pull qwen3-vl:8b",
    requiresOllama: "0.12.7+",
  },
  {
    id: "gemma4:26b",
    label: "Gemma 4 26B",
    sizeLabel: "16.2 GB",
    profile: "qualidade",
    description: "Nova geração aberta multimodal da Google com alta capacidade de raciocínio sobre imagens.",
    installCommand: "ollama pull gemma4:26b",
    requiresOllama: "0.14.0+",
    isNew: true,
  },
  {
    id: "qwen3-vl:32b",
    label: "Qwen 3 VL 32B",
    sizeLabel: "20.5 GB",
    profile: "qualidade",
    description: "Máxima inteligência local para quem possui GPUs avançadas (24GB+ VRAM).",
    installCommand: "ollama pull qwen3-vl:32b",
    requiresOllama: "0.12.7+",
    isNew: true,
  },
  {
    id: "llama3.2-vision:11b",
    label: "Llama 3.2 Vision 11B",
    sizeLabel: "7.9 GB",
    profile: "qualidade",
    description: "Modelo multimodal oficial da Meta com forte capacidade de raciocínio sobre imagens.",
    installCommand: "ollama pull llama3.2-vision:11b",
    requiresOllama: "0.3.12+",
    isNew: true,
  },
  {
    id: "gemma3:4b",
    label: "Gemma 3 4B",
    sizeLabel: "3.3 GB",
    profile: "leve",
    description: "Multimodal compacto e veloz da Google. Boa alternativa compacta fora da família Qwen.",
    installCommand: "ollama pull gemma3:4b",
    requiresOllama: "0.6+",
  },
  {
    id: "minicpm-v:8b",
    label: "MiniCPM-V 8B",
    sizeLabel: "5.5 GB",
    profile: "ocr",
    description: "Especialista em OCR e páginas densas, com alta fidelidade para imagens em alta resolução.",
    installCommand: "ollama pull minicpm-v:8b",
    requiresOllama: "0.3.10+",
  },
  {
    id: "qwen2.5vl:7b",
    label: "Qwen 2.5 VL 7B",
    sizeLabel: "6.0 GB",
    profile: "ocr",
    description: "Opção consolidada para OCR e documentos. Muito estável para mangás densos.",
    installCommand: "ollama pull qwen2.5vl:7b",
    requiresOllama: "0.7.0+",
  },
  {
    id: "translategemma:4b",
    label: "TranslateGemma 4B",
    sizeLabel: "3.3 GB",
    profile: "legacy",
    description: "Opção direcionada para tradução multilíngue. Útil para benchmarking e comparações.",
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
