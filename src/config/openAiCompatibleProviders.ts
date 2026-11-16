export type OpenAiCompatibleProviderId = "openrouter" | "lmstudio" | "groq";

export interface OpenAiCompatibleModelOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  isNew?: boolean;
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
    description: "Acesso a centenas de modelos vision e multimodais por uma única API, com roteamento dinâmico e opções gratuitas.",
    docsUrl: "https://openrouter.ai/docs",
    models: [
      {
        id: OPENROUTER_AUTO_FREE_MODEL_ID,
        label: "Auto grátis",
        description:
          "Escolhe automaticamente modelos vision gratuitos e tenta outro se bater cota ou indisponibilidade.",
        recommended: true,
      },
      // Google
      {
        id: "google/gemini-4-hydrogen",
        label: "Gemini 4 Hydrogen",
        description: "Google Gemini 4 Hydrogen via OpenRouter (Nov/2026). Workhorse de altíssima eficiência e velocidade da família Gemini 4.",
        isNew: true,
      },
      {
        id: "google/gemini-4-argon",
        label: "Gemini 4 Argon",
        description: "Google Gemini 4 Argon via OpenRouter. Flagship mais recente com raciocínio de 1M tokens e alta precisão.",
        isNew: true,
      },
      {
        id: "google/gemini-4-carbon",
        label: "Gemini 4 Carbon",
        description: "Geração Gemini 4 equilibrada para alto rendimento e multimodalidade densa.",
        isNew: true,
      },
      {
        id: "google/gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        description: "Flagship ágil e multimodal de alta precisão para tradução e OCR rápido.",
        isNew: true,
      },
      {
        id: "google/gemini-omni-1.2-flash",
        label: "Gemini Omni 1.2 Flash",
        description: "Modelo multimodal ultrarrápido com visão nativa e baixa latência.",
      },
      {
        id: "google/gemini-3.6-flash",
        label: "Gemini 3.6 Flash",
        description: "Versão estável e rápida para leitura contínua de balões.",
      },
      // Anthropic
      {
        id: "anthropic/claude-fable-5.2",
        label: "Claude Fable 5.2",
        description: "Topo absoluto de linha da Anthropic com raciocínio profundo e naturalidade editorial impecável em PT-BR.",
        isNew: true,
      },
      {
        id: "anthropic/claude-opus-5.5",
        label: "Claude Opus 5.5",
        description: "Modelo de altíssima capacidade para adaptação cultural, gírias e subtextos narrativos complexos.",
        isNew: true,
      },
      {
        id: "anthropic/claude-sonnet-5.5",
        label: "Claude Sonnet 5.5",
        description: "Workhorse moderno da família Sonnet com alta capacidade analítica, velocidade e fidelidade visual.",
        isNew: true,
      },
      {
        id: "anthropic/claude-haiku-5.5",
        label: "Claude Haiku 5.5",
        description: "Modelo ultra veloz e de baixo custo para rascunhos rápidos e tarefas de alta cadência.",
        isNew: true,
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
      // OpenAI
      {
        id: "openai/gpt-6.1-terra",
        label: "GPT-6.1 Terra",
        description: "Geração 6.1 da OpenAI com alta precisão contextual e robustez analítica.",
        isNew: true,
      },
      {
        id: "openai/gpt-6.1-sol",
        label: "GPT-6.1 Sol",
        description: "Versão otimizada de alta inteligência para fluxos contínuos e velocidade superior.",
        isNew: true,
      },
      {
        id: "openai/gpt-6-astra",
        label: "GPT-6 Astra",
        description: "Flagship ultra-avançado da OpenAI com visão profunda e interpretação semântica.",
        isNew: true,
      },
      {
        id: "openai/gpt-6-luna",
        label: "GPT-6 Luna",
        description: "Excelente compreensão de contexto, visão apurada e alta velocidade de resposta.",
        isNew: true,
      },
      {
        id: "openai/gpt-5.6-luna",
        label: "GPT-5.6 Luna",
        description: "Modelo ágil e consolidado da geração 5.6.",
      },
      {
        id: "openai/gpt-5-pro",
        label: "GPT-5 Pro",
        description: "Modelo unificado com raciocínio profundo e visão computacional avançada.",
      },
      {
        id: "openai/o3-pro",
        label: "OpenAI o3 Pro",
        description: "Modelo de raciocínio profundo focado em problemas complexos e deduções visuais difíceis.",
      },
      {
        id: "openai/gpt-4o",
        label: "GPT-4o",
        description: "Modelo flagship clássico consolidado da OpenAI com visão avançada.",
      },
      {
        id: "openai/gpt-4o-mini",
        label: "GPT-4o Mini",
        description: "Alternativa compacta e rápida para rascunhos e testes.",
      },
      // Qwen & DeepSeek
      {
        id: "qwen/qwen4-max",
        label: "Qwen 4 Max",
        description: "Novo flagship topo de linha da Alibaba Cloud com capacidade visual e OCR de última geração.",
        isNew: true,
      },
      {
        id: "qwen/qwen3.8-27b",
        label: "Qwen 3.8 27B",
        description: "Modelo aberto com desempenho excepcional em OCR de mangá e balões verticais.",
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
        id: "deepseek/deepseek-v4.1-flash",
        label: "DeepSeek V4.1 Flash",
        description: "Novo modelo multimodal nativo da DeepSeek com velocidade extrema e altíssima precisão visual.",
        isNew: true,
      },
      {
        id: "deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        description: "Flagship de raciocínio e visão da DeepSeek para desafios complexos de localização.",
        isNew: true,
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
        description: "Sugestão local recomendada com ótimo equilíbrio entre OCR e tradução em GPUs médias (8-12GB).",
      },
      {
        id: "qwen3-vl-32b-instruct",
        label: "Qwen 3 VL 32B",
        description: "Máxima precisão local se sua máquina tiver 24GB+ de VRAM dedicada.",
      },
      {
        id: "qwen3-vl-4b-instruct",
        label: "Qwen 3 VL 4B",
        description: "Opção leve e rápida para laptops e placas de entrada.",
      },
      {
        id: "gemma-4-26b-a4b-it",
        label: "Gemma 4 26B-A4B-IT",
        description: "Novo modelo aberto multimodal da Google de alta fidelidade visual e semântica.",
        isNew: true,
      },
      {
        id: "gemma3-4b-it",
        label: "Gemma 3 4B-IT",
        description: "Opção compacta e multimodal da Google para testes leves e rápidos.",
      },
      {
        id: "qwen2.5-vl-7b-instruct",
        label: "Qwen 2.5 VL 7B",
        description: "Sugestão comprovada para OCR em páginas densas.",
      },
      {
        id: "minicpm-v-8b",
        label: "MiniCPM-V 8B",
        description: "Especialista em OCR de alta precisão para documentos e layouts complexos.",
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
        id: "meta-models/muse-spark-open",
        label: "Meta Muse Spark",
        description: "Modelo multimodal MoE de raciocínio da Meta com alta acurácia visual.",
        isNew: true,
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
