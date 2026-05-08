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
    description: "Acesso a varios modelos vision por uma unica API, dependendo da disponibilidade da conta.",
    docsUrl: "https://openrouter.ai/docs",
    models: [
      {
        id: OPENROUTER_AUTO_FREE_MODEL_ID,
        label: "Auto gratis",
        description:
          "Escolhe automaticamente modelos vision gratuitos e tenta outro se bater cota ou indisponibilidade.",
        recommended: true,
      },
      {
        id: "google/gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Bom ponto de partida para qualidade, OCR e custo equilibrado via OpenRouter.",
      },
      {
        id: "openai/gpt-4o-mini",
        label: "GPT-4o Mini",
        description: "Alternativa compacta para testes rapidos com suporte multimodal.",
      },
      {
        id: "anthropic/claude-sonnet-4.5",
        label: "Claude Sonnet 4.5",
        description: "Opcao forte para quem ja usa creditos Anthropic via OpenRouter.",
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
        id: "qwen3-vl-4b",
        label: "Qwen 3 VL 4B",
        description: "Sugestao local leve/intermediaria se o modelo estiver carregado no LM Studio.",
      },
      {
        id: "qwen2.5-vl-7b-instruct",
        label: "Qwen 2.5 VL 7B",
        description: "Sugestao local mais forte para OCR se sua maquina aguentar.",
      },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyLabel: "Groq API Key",
    requiresApiKey: true,
    description: "Modo experimental focado em velocidade. Imagens muito grandes podem bater no limite da API.",
    docsUrl: "https://console.groq.com/docs/vision",
    models: [
      {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        label: "Llama 4 Scout",
        description: "Modelo multimodal em preview recomendado pela documentacao de vision do Groq.",
        recommended: true,
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
