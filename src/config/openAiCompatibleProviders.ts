export type OpenAiCompatibleProviderId = "openrouter" | "lmstudio" | "groq";

export interface OpenAiCompatibleModelOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
}

export interface OpenAiCompatibleProviderOption {
  id: OpenAiCompatibleProviderId;
  label: string;
  baseUrl: string;
  apiKeyLabel: string;
  requiresApiKey: boolean;
  description: string;
  docsUrl: string;
  models: OpenAiCompatibleModelOption[];
}

export const DEFAULT_OPENAI_COMPATIBLE_PROVIDER: OpenAiCompatibleProviderId = "openrouter";
export type OpenRouterModelMode = "auto-free" | "manual";
export const OPENROUTER_AUTO_FREE_MODEL_ID = "openrouter:auto-free-vision";
export const DEFAULT_OPENAI_COMPATIBLE_MODEL = OPENROUTER_AUTO_FREE_MODEL_ID;

export const OPENAI_COMPATIBLE_PROVIDERS: OpenAiCompatibleProviderOption[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyLabel: "OpenRouter API Key",
    requiresApiKey: true,
    description: "Acesso a vários modelos vision por uma única API, dependendo da disponibilidade da conta.",
    docsUrl: "https://openrouter.ai/docs",
    models: [
      {
        id: OPENROUTER_AUTO_FREE_MODEL_ID,
        label: "Auto grátis",
        description:
          "Escolhe automaticamente modelos vision gratuitos e tenta outro se bater cota ou indisponibilidade.",
        recommended: true,
      },
      {
        id: "google/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        description: "Google Gemini 3.8 Flash via OpenRouter. Flagship ágil e multimodal de alta precisão.",
      },
      {
        id: "google/gemini-3.7-flash",
        label: "Gemini 3.7 Flash",
        description: "Google Gemini 3.7 Flash com raciocínio híbrido e excelente visão.",
      },
      {
        id: "google/gemini-3.5-flash",
        label: "Gemini 3.5 Flash",
        description: "Versão intermediária estável e rápida para leitura de balões.",
      },
      {
        id: "anthropic/claude-fable-5.1",
        label: "Claude Fable 5.1",
        description: "Nova geração topo de linha da Anthropic com naturalidade editorial impecável em PT-BR.",
      },
      {
        id: "anthropic/claude-sonnet-5",
        label: "Claude Sonnet 5",
        description: "Flagship moderno da família Sonnet com alta capacidade de análise e adaptação cultural.",
      },
      {
        id: "anthropic/claude-3.7-sonnet",
        label: "Claude 3.7 Sonnet",
        description: "Modelo híbrido com raciocínio apurado para gírias e subtextos.",
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        label: "Claude 3.5 Sonnet",
        description: "Referência clássica em tradução editorial de mangás e HQs.",
      },
      {
        id: "openai/gpt-6-astra",
        label: "GPT-6 Astra",
        description: "Nova geração multimodal da OpenAI com visão profunda e interpretação semântica.",
      },
      {
        id: "openai/gpt-5.6-luna",
        label: "GPT-5.6 Luna",
        description: "Excelente compreensão de contexto e alta velocidade de resposta.",
      },
      {
        id: "openai/gpt-4o",
        label: "GPT-4o",
        description: "Modelo flagship consolidado da OpenAI com visão avançada.",
      },
      {
        id: "openai/gpt-4o-mini",
        label: "GPT-4o Mini",
        description: "Alternativa compacta e rápida para rascunhos e testes.",
      },
      {
        id: "qwen/qwen3.8-27b",
        label: "Qwen 3.8 27B",
        description: "Modelo aberto de última geração com desempenho excepcional em OCR de mangá.",
      },
      {
        id: "qwen/qwen3.8-flash",
        label: "Qwen 3.8 Flash",
        description: "Inferência rápida e responsiva para fluxos contínuos de tradução.",
      },
      {
        id: "qwen/qwen3-vl-32b-instruct",
        label: "Qwen 3 VL 32B Instruct",
        description: "Especialista em visão computacional e reconhecimento de caracteres japoneses estilizados.",
      },
      {
        id: "deepseek/deepseek-v4-flash-vision-exp",
        label: "DeepSeek V4 Flash Vision",
        description: "Modelo experimental da DeepSeek com velocidade e alta precisão multimodal.",
      },
    ],
  },
  {
    id: "lmstudio",
    label: "LM Studio",
    baseUrl: "http://localhost:1234/v1",
    apiKeyLabel: "API Key local",
    requiresApiKey: false,
    description: "Usa o servidor local do LM Studio. Carregue um modelo vision e copie o ID dele.",
    docsUrl: "https://lmstudio.ai/docs/developer/openai-compat",
    models: [
      {
        id: "local-model",
        label: "Modelo carregado",
        description: "Troque pelo identificador exato exibido no LM Studio.",
        recommended: true,
      },
      {
        id: "qwen3-vl-8b-instruct",
        label: "Qwen 3 VL 8B",
        description: "Sugestão local recomendada com ótimo equilíbrio entre OCR e tradução.",
      },
      {
        id: "qwen3-vl-32b-instruct",
        label: "Qwen 3 VL 32B",
        description: "Máxima precisão local se sua máquina tiver VRAM dedicada suficiente.",
      },
      {
        id: "qwen2.5-vl-7b-instruct",
        label: "Qwen 2.5 VL 7B",
        description: "Sugestão comprovada para OCR em placas de vídeo médias.",
      },
      {
        id: "gemma3-4b-it",
        label: "Gemma 3 4B-IT",
        description: "Opção compacta e multimodal para testes leves e rápidos.",
      },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyLabel: "Groq API Key",
    requiresApiKey: true,
    description: "Inferência em velocidade recorde via LPU da Groq.",
    docsUrl: "https://console.groq.com/docs/models",
    models: [
      {
        id: "qwen/qwen3.8-27b",
        label: "Qwen 3.8 27B",
        description: "Modelo multimodal Vision de altíssima velocidade e capacidade no hardware Groq LPU.",
        recommended: true,
      },
      {
        id: "qwen/qwen3.6-27b",
        label: "Qwen 3.6 27B",
        description: "Multimodal Vision comprovado no Groq para OCR e tradução de balões.",
      },
      {
        id: "llama-3.3-70b-versatile",
        label: "Llama 3.3 70B Versatile",
        description: "Maior capacidade de raciocínio da Meta com inferência instantânea.",
      },
      {
        id: "llama-3.1-8b-instant",
        label: "Llama 3.1 8B Instant",
        description: "Opção ultrarrápida para texto e refinamento editorial.",
      },
      {
        id: "openai/gpt-oss-120b",
        label: "GPT OSS 120B",
        description: "Modelo aberto de 120B hospedado no Groq com alto poder de compreensão.",
      },
      {
        id: "openai/gpt-oss-20b",
        label: "GPT OSS 20B",
        description: "Modelo aberto de 20B no Groq para inferência leve.",
      },
    ],
  },
];

export const getOpenAiCompatibleProvider = (providerId?: string | null) =>
  OPENAI_COMPATIBLE_PROVIDERS.find((provider) => provider.id === providerId) ??
  OPENAI_COMPATIBLE_PROVIDERS.find((provider) => provider.id === DEFAULT_OPENAI_COMPATIBLE_PROVIDER) ??
  OPENAI_COMPATIBLE_PROVIDERS[0];

export const getOpenAiCompatibleModel = (providerId?: string | null, modelId?: string | null) => {
  const provider = getOpenAiCompatibleProvider(providerId);
  return (
    provider.models.find((model) => model.id === modelId) ??
    provider.models.find((model) => model.recommended) ??
    provider.models[0]
  );
};

export const getDefaultOpenAiCompatibleModelForProvider = (providerId?: string | null) =>
  getOpenAiCompatibleModel(providerId).id;
