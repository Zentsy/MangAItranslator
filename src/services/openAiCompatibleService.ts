import {
  getOpenAiCompatibleProvider,
  OPENROUTER_AUTO_FREE_MODEL_ID,
  type OpenAiCompatibleProviderId,
} from "@/config/openAiCompatibleProviders";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const OPENAI_COMPATIBLE_REQUEST_TIMEOUT_MS: Record<OpenAiCompatibleProviderId, number> = {
  openrouter: 5 * 60 * 1000,
  groq: 5 * 60 * 1000,
  lmstudio: 12 * 60 * 1000,
};
const LMSTUDIO_AUTO_MODEL_ID = "local-model";
const OPENROUTER_FREE_MODELS_CACHE_KEY = "mangai-openrouter-free-vision-models-v1";
const OPENROUTER_FREE_MODELS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const GROQ_BASE64_IMAGE_LIMIT_BYTES = 4 * 1024 * 1024;
const VALID_BLOCK_TYPES = new Set(["rect", "outside", "thought", "double", "none"]);
const VALID_BLOCK_TYPE_VALUES = ["rect", "outside", "thought", "double", "none"] as const;
const ENGLISH_SIGNAL_PATTERN =
  /\b(i|you|he|she|we|they|the|this|that|these|those|letter|truth|right|now|think|thought|come|came|leave|wait|actually|didn'?t|don'?t|can'?t|won'?t|is|are|am|was|were|have|has|had|will|would|should|could|everything)\b/i;
const PORTUGUESE_SIGNAL_PATTERN =
  /\b(voce|voc\u00ea|eu|ele|ela|nos|n\u00f3s|eles|elas|que|nao|n\u00e3o|sim|verdade|agora|carta|pensei|veio|venha|espera|espere|tudo|mesmo)\b/i;

const TRANSLATION_SCHEMA_DESCRIPTION = `{
  "translations": [
    { "text": "fala traduzida", "type": "none" }
  ]
}`;

const SYSTEM_PROMPT = `Voce e um tradutor especializado em mangas.
Sua unica tarefa e ler o texto da imagem e devolver a traducao final em portugues brasileiro.

REGRAS:
- ORDEM: siga a leitura de manga, da direita para a esquerda e de cima para baixo.
- IDIOMA: cada item em "translations.text" deve estar em PT-BR natural e legivel.
- NAO COPIE O INGLES: nunca devolva a frase original em ingles, exceto nomes proprios inevitaveis.
- OCR: se um balao estiver vazio, ilegivel ou sem texto relevante, nao invente conteudo.
- TIPO: quando conseguir inferir, use "rect", "outside", "thought", "double" ou "none".
- FORMATO: responda somente em JSON valido, sem markdown e sem comentarios.

SCHEMA JSON OBRIGATORIO:
${TRANSLATION_SCHEMA_DESCRIPTION}`;

const getThinkingInstruction = (thinkingEnabled: boolean) =>
  thinkingEnabled
    ? "THINKING: pense internamente antes de responder para evitar apenas transcrever o ingles. A resposta final ainda deve ser somente JSON em PT-BR."
    : "THINKING: priorize velocidade. Nao inclua raciocinio, notas ou explicacoes; devolva somente o JSON final.";

const getTypeInstruction = (inferBlockTypes: boolean) =>
  inferBlockTypes
    ? 'TIPO: quando conseguir inferir com confianca, use "rect", "outside", "thought", "double" ou "none".'
    : 'TIPO: nao classifique balao/container. Use "none" como type em todos os blocos.';

const buildSystemPrompt = (thinkingEnabled: boolean, inferBlockTypes: boolean) =>
  `${SYSTEM_PROMPT}\n\n${getThinkingInstruction(thinkingEnabled)}\n${getTypeInstruction(inferBlockTypes)}`;

const buildUserPrompt = (inferBlockTypes: boolean) => `Analise esta pagina de manga e retorne somente o JSON solicitado.
Cada bloco deve conter a traducao final em PT-BR.${
  inferBlockTypes ? " Inclua o tipo visual do texto quando tiver confianca." : ' Use "type": "none" em todos os blocos.'
}`;

const REPAIR_SYSTEM_PROMPT = `Voce e um tradutor editorial de mangas.
Recebera blocos de OCR/transcricao que podem estar em ingles, japones romanizado ou misturados.
Sua tarefa e devolver os mesmos blocos em portugues brasileiro natural.

REGRAS:
- Traduza falas e narracao em ingles para PT-BR.
- Preserve nomes proprios, nomes de lugares e honorificos quando fizer sentido.
- Preserve a ordem e o tipo de cada bloco.
- Nao explique nada.
- Responda somente em JSON valido no schema solicitado.`;

const buildRepairSystemPrompt = (thinkingEnabled: boolean, inferBlockTypes: boolean) =>
  `${REPAIR_SYSTEM_PROMPT}\n\n${getThinkingInstruction(thinkingEnabled)}\n${getTypeInstruction(inferBlockTypes)}`;

const TRANSLATION_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          type: {
            type: "string",
            enum: VALID_BLOCK_TYPE_VALUES,
          },
        },
        required: ["text"],
        additionalProperties: false,
      },
    },
  },
  required: ["translations"],
  additionalProperties: false,
};

export interface OpenAiCompatibleTranslationBlock {
  text: string;
  type?: string;
}

export interface OpenAiCompatibleStatusUpdate {
  stage: "connecting" | "discovering" | "fallback" | "processing" | "parsing" | "repairing";
  message: string;
  model?: string;
  provider?: OpenAiCompatibleProviderId;
}

type OpenAiCompatibleErrorCode =
  | "OPENAI_COMPATIBLE_MISSING_KEY"
  | "OPENAI_COMPATIBLE_INVALID_KEY"
  | "OPENAI_COMPATIBLE_RATE_LIMIT"
  | "OPENAI_COMPATIBLE_BAD_REQUEST"
  | "OPENAI_COMPATIBLE_FORBIDDEN"
  | "OPENAI_COMPATIBLE_TIMEOUT"
  | "OPENAI_COMPATIBLE_UNKNOWN";

export class OpenAiCompatibleRequestError extends Error {
  code: OpenAiCompatibleErrorCode;
  status?: number;

  constructor(code: OpenAiCompatibleErrorCode, message: string, status?: number) {
    super(message);
    this.name = "OpenAiCompatibleRequestError";
    this.code = code;
    this.status = status;
  }
}

const cleanJson = (text: string) => {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return trimmed;
};

const normalizeBlock = (value: unknown): OpenAiCompatibleTranslationBlock | null => {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? { text } : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const maybeBlock = value as { text?: unknown; type?: unknown };
  if (typeof maybeBlock.text !== "string") {
    return null;
  }

  const text = maybeBlock.text.trim();
  if (!text) {
    return null;
  }

  return {
    text,
    type:
      typeof maybeBlock.type === "string" && VALID_BLOCK_TYPES.has(maybeBlock.type)
        ? maybeBlock.type
        : "none",
  };
};

const getBlocksFromParsedJson = (
  parsed: { translations?: unknown[]; blocks?: unknown[] } | unknown[]
) => {
  const candidates = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.translations)
      ? parsed.translations
      : Array.isArray(parsed.blocks)
        ? parsed.blocks
        : [];

  return candidates
    .map(normalizeBlock)
    .filter((block): block is OpenAiCompatibleTranslationBlock => Boolean(block));
};

const extractJsonObjects = (text: string) => {
  const objects: string[] = [];
  let startIndex = -1;
  let depth = 0;
  let isInString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (isInString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        isInString = false;
      }
      continue;
    }

    if (char === '"') {
      isInString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && startIndex >= 0) {
        objects.push(text.slice(startIndex, index + 1));
        startIndex = -1;
      }
    }
  }

  return objects;
};

const parseBlocksFromJsonText = (jsonText: string) => {
  try {
    const parsed = JSON.parse(jsonText) as { translations?: unknown[]; blocks?: unknown[] } | unknown[];
    return getBlocksFromParsedJson(parsed);
  } catch {
    return [];
  }
};

const parseTranslationResponse = (rawText: string): OpenAiCompatibleTranslationBlock[] => {
  const cleaned = cleanJson(rawText);
  if (!cleaned) {
    return [];
  }

  const parsedBlocks = parseBlocksFromJsonText(cleaned);
  if (parsedBlocks.length > 0) {
    return parsedBlocks;
  }

  const jsonObjectBlocks = extractJsonObjects(cleaned)
    .map(parseBlocksFromJsonText)
    .filter((blocks) => blocks.length > 0);

  if (jsonObjectBlocks.length > 0) {
    for (let index = jsonObjectBlocks.length - 1; index >= 0; index -= 1) {
      if (!looksLikeEnglishTranscription(jsonObjectBlocks[index])) {
        return jsonObjectBlocks[index];
      }
    }

    return jsonObjectBlocks[jsonObjectBlocks.length - 1];
  }

  {
    const recoveredBlocks = [...rawText.matchAll(/"text"\s*:\s*"([^"]+)"(?:\s*,\s*"type"\s*:\s*"([^"]+)")?/g)]
      .map((match) =>
        normalizeBlock({
          text: match[1],
          type: match[2],
        })
      )
      .filter((block): block is OpenAiCompatibleTranslationBlock => Boolean(block));

    if (recoveredBlocks.length > 0) {
      return recoveredBlocks;
    }

    return rawText
      .split(/\n+/)
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter((line) => line && !/[{}[\]]/.test(line) && !line.includes('"translations"'))
      .map((text) => ({ text, type: "none" }));
  }
};

const extractResponseText = (payload: unknown) => {
  const maybePayload = payload as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
      text?: string;
    }>;
    output_text?: string;
    output?: Array<{ type?: string; content?: string }>;
  };

  const firstChoice = maybePayload.choices?.[0];
  const content = firstChoice?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n");
  }

  if (Array.isArray(maybePayload.output)) {
    return maybePayload.output
      .filter((item) => item.type === "message" && typeof item.content === "string")
      .map((item) => item.content)
      .join("\n");
  }

  return firstChoice?.text ?? maybePayload.output_text ?? "";
};

const looksLikeEnglishTranscription = (blocks: OpenAiCompatibleTranslationBlock[]) => {
  const textBlocks = blocks.filter((block) => block.text.trim().length > 0);
  if (textBlocks.length === 0) {
    return false;
  }

  const englishMatches = textBlocks.filter(
    (block) => ENGLISH_SIGNAL_PATTERN.test(block.text) && !PORTUGUESE_SIGNAL_PATTERN.test(block.text)
  ).length;

  return englishMatches >= Math.max(2, Math.ceil(textBlocks.length * 0.45));
};

const isTransientOrFallbackableError = (error: unknown) => {
  const maybeError = error as OpenAiCompatibleRequestError;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    maybeError.code === "OPENAI_COMPATIBLE_RATE_LIMIT" ||
    maybeError.code === "OPENAI_COMPATIBLE_FORBIDDEN" ||
    maybeError.code === "OPENAI_COMPATIBLE_BAD_REQUEST" ||
    maybeError.code === "OPENAI_COMPATIBLE_TIMEOUT" ||
    maybeError.status === 402 ||
    maybeError.status === 404 ||
    maybeError.status === 429 ||
    maybeError.status === 502 ||
    maybeError.status === 503 ||
    maybeError.status === 504 ||
    message.includes("model") ||
    message.includes("provider") ||
    message.includes("rate") ||
    message.includes("quota") ||
    message.includes("limit")
  );
};

const normalizeError = async (
  response: Response,
  providerLabel: string
): Promise<OpenAiCompatibleRequestError> => {
  let details = "";

  try {
    details = await response.text();
  } catch {
    details = response.statusText;
  }

  const lowerDetails = `${response.statusText} ${details}`.toLowerCase();

  if (response.status === 401 || lowerDetails.includes("invalid api key")) {
    return new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_INVALID_KEY",
      `A chave do ${providerLabel} parece invalida. Confira a chave salva nas configuracoes.`,
      response.status
    );
  }

  if (response.status === 403) {
    return new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_FORBIDDEN",
      `${providerLabel} recusou a requisicao. Confira permissao do modelo, saldo e restricoes da conta.`,
      response.status
    );
  }

  if (response.status === 429) {
    return new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_RATE_LIMIT",
      `${providerLabel} retornou limite de uso ou muitas requisicoes. Tente novamente em alguns minutos.`,
      response.status
    );
  }

  if (response.status === 400 || response.status === 413) {
    return new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_BAD_REQUEST",
      `${providerLabel} recusou a imagem ou o modelo selecionado. Confira se o modelo suporta vision e se a imagem nao esta grande demais.`,
      response.status
    );
  }

  return new OpenAiCompatibleRequestError(
    "OPENAI_COMPATIBLE_UNKNOWN",
    `${providerLabel} retornou erro ${response.status}: ${details || response.statusText}`,
    response.status
  );
};

const buildHeaders = (providerId: OpenAiCompatibleProviderId, apiKey: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }

  if (providerId === "openrouter") {
    headers["HTTP-Referer"] = "https://github.com/Zentsy/MangAItranslator";
    headers["X-OpenRouter-Title"] = "MangAI Translator";
  }

  return headers;
};

const buildResponseFormat = (
  providerId: OpenAiCompatibleProviderId,
  includeResponseFormat: boolean
) => {
  if (!includeResponseFormat) {
    return undefined;
  }

  if (providerId === "lmstudio" || providerId === "openrouter") {
    return {
      type: "json_schema",
      json_schema: {
        name: "mangai_translation_blocks",
        strict: true,
        schema: TRANSLATION_RESPONSE_SCHEMA,
      },
    };
  }

  return { type: "json_object" };
};

const buildOpenRouterFreeProviderOptions = (includeResponseFormat: boolean) => ({
  require_parameters: includeResponseFormat,
  max_price: {
    prompt: 0,
    completion: 0,
    request: 0,
    image: 0,
  },
  sort: {
    by: "throughput",
    partition: "model",
  },
});

const buildReasoningOptions = (
  providerId: OpenAiCompatibleProviderId,
  thinkingEnabled: boolean
) => {
  if (!thinkingEnabled || providerId !== "openrouter") {
    return {};
  }

  return {
    reasoning: {
      effort: "low",
      exclude: true,
    },
  };
};

const getLmStudioNativeReasoning = (thinkingEnabled: boolean) =>
  thinkingEnabled ? "on" : "off";

type ChatMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

const buildChatRequestBody = (
  providerId: OpenAiCompatibleProviderId,
  model: string,
  messages: Array<{ role: "system" | "user"; content: ChatMessageContent }>,
  includeResponseFormat: boolean,
  thinkingEnabled: boolean
) => ({
  model,
  stream: false,
  temperature: 0.2,
  max_tokens: 2048,
  ...buildReasoningOptions(providerId, thinkingEnabled),
  ...(includeResponseFormat
    ? { response_format: buildResponseFormat(providerId, includeResponseFormat) }
    : {}),
  messages,
});

const buildOpenRouterAutoFreeVisionRequestBody = (
  modelIds: string[],
  base64Image: string,
  includeResponseFormat: boolean,
  thinkingEnabled: boolean,
  inferBlockTypes: boolean
) => ({
  models: modelIds,
  stream: false,
  temperature: 0.2,
  max_tokens: 2048,
  provider: buildOpenRouterFreeProviderOptions(includeResponseFormat),
  // Keep native reasoning out of the auto-free router so unsupported free models stay eligible.
  ...(includeResponseFormat
    ? { response_format: buildResponseFormat("openrouter", includeResponseFormat) }
    : {}),
  messages: [
    {
      role: "system",
      content: buildSystemPrompt(thinkingEnabled, inferBlockTypes),
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: buildUserPrompt(inferBlockTypes),
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
          },
        },
      ],
    },
  ],
});

const buildVisionRequestBody = (
  providerId: OpenAiCompatibleProviderId,
  model: string,
  base64Image: string,
  includeResponseFormat: boolean,
  thinkingEnabled: boolean,
  inferBlockTypes: boolean
) => buildChatRequestBody(providerId, model, [
  {
    role: "system",
    content: buildSystemPrompt(thinkingEnabled, inferBlockTypes),
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: buildUserPrompt(inferBlockTypes),
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      },
    ],
  },
], includeResponseFormat, thinkingEnabled);

const buildRepairRequestBody = (
  providerId: OpenAiCompatibleProviderId,
  model: string,
  blocks: OpenAiCompatibleTranslationBlock[],
  includeResponseFormat: boolean,
  thinkingEnabled: boolean,
  inferBlockTypes: boolean
) => buildChatRequestBody(providerId, model, [
  {
    role: "system",
    content: buildRepairSystemPrompt(thinkingEnabled, inferBlockTypes),
  },
  {
    role: "user",
    content: `Traduza estes blocos para PT-BR.${
      inferBlockTypes
        ? ' Mantenha o campo "type" de cada item se ele estiver correto.'
        : ' Defina "type": "none" em todos os itens.'
    }

${JSON.stringify({ translations: blocks }, null, 2)}`,
  },
], includeResponseFormat, thinkingEnabled);

const getLmStudioNativeEndpoint = (baseUrl: string) =>
  baseUrl.replace(/\/v1\/?$/, "/api/v1").replace(/\/+$/, "") + "/chat";

const getOpenAiCompatibleModelsEndpoint = (baseUrl: string) =>
  `${baseUrl.replace(/\/+$/, "")}/models`;

interface OpenRouterDiscoveredModel {
  id: string;
  name: string;
  contextLength: number;
  supportsResponseFormat: boolean;
  supportsReasoning: boolean;
}

interface OpenRouterModelsCache {
  savedAt: number;
  models: OpenRouterDiscoveredModel[];
}

const isZeroishPrice = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  return Number(value) === 0;
};

const readOpenRouterFreeModelsCache = (): OpenRouterDiscoveredModel[] | null => {
  try {
    const rawCache = window.localStorage.getItem(OPENROUTER_FREE_MODELS_CACHE_KEY);
    if (!rawCache) {
      return null;
    }

    const cache = JSON.parse(rawCache) as OpenRouterModelsCache;
    if (!Array.isArray(cache.models) || Date.now() - cache.savedAt > OPENROUTER_FREE_MODELS_CACHE_TTL_MS) {
      return null;
    }

    return cache.models;
  } catch {
    return null;
  }
};

const writeOpenRouterFreeModelsCache = (models: OpenRouterDiscoveredModel[]) => {
  try {
    window.localStorage.setItem(
      OPENROUTER_FREE_MODELS_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), models } satisfies OpenRouterModelsCache)
    );
  } catch {
    // Cache failure should never block translation.
  }
};

const rankOpenRouterFreeModel = (model: OpenRouterDiscoveredModel) => {
  if (model.id === "openrouter/free") {
    return 10_000;
  }

  const id = model.id.toLowerCase();
  const name = model.name.toLowerCase();

  if (id.includes("gemma-4") || name.includes("gemma 4")) {
    return 10;
  }

  if (id.includes("nemotron") && (id.includes("vl") || id.includes("omni"))) {
    return 20;
  }

  if (id.includes("qianfan") || name.includes("ocr")) {
    return 30;
  }

  if (id.includes("gemma-3-27b")) {
    return 40;
  }

  if (id.includes("gemma-3-12b")) {
    return 50;
  }

  if (id.includes("gemma-3-4b")) {
    return 60;
  }

  return 100;
};

export const clearOpenRouterFreeModelsCache = () => {
  try {
    window.localStorage.removeItem(OPENROUTER_FREE_MODELS_CACHE_KEY);
  } catch {
    // noop
  }
};

export const getOpenRouterFreeVisionModels = async (
  apiKey: string,
  forceRefresh = false
) => {
  if (!forceRefresh) {
    const cachedModels = readOpenRouterFreeModelsCache();
    if (cachedModels?.length) {
      return cachedModels;
    }
  }

  const response = await tauriFetch("https://openrouter.ai/api/v1/models?output_modalities=text", {
    method: "GET",
    headers: buildHeaders("openrouter", apiKey),
  });

  if (!response.ok) {
    throw await normalizeError(response, "OpenRouter");
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: string;
      name?: string;
      context_length?: number;
      architecture?: {
        input_modalities?: string[];
        output_modalities?: string[];
      };
      pricing?: {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
        internal_reasoning?: string;
      };
      supported_parameters?: string[];
    }>;
  };

  const models = (payload.data ?? [])
    .filter((model) => {
      const id = model.id ?? "";
      const inputModalities = model.architecture?.input_modalities ?? [];
      const outputModalities = model.architecture?.output_modalities ?? [];
      const pricing = model.pricing ?? {};

      return (
        (id.endsWith(":free") || id === "openrouter/free") &&
        inputModalities.includes("image") &&
        outputModalities.includes("text") &&
        isZeroishPrice(pricing.prompt) &&
        isZeroishPrice(pricing.completion) &&
        isZeroishPrice(pricing.image) &&
        isZeroishPrice(pricing.request) &&
        isZeroishPrice(pricing.internal_reasoning)
      );
    })
    .map((model): OpenRouterDiscoveredModel => ({
      id: model.id ?? "",
      name: model.name ?? model.id ?? "OpenRouter free model",
      contextLength: model.context_length ?? 0,
      supportsResponseFormat: (model.supported_parameters ?? []).includes("response_format"),
      supportsReasoning: (model.supported_parameters ?? []).includes("reasoning"),
    }))
    .filter((model) => model.id)
    .sort((a, b) => rankOpenRouterFreeModel(a) - rankOpenRouterFreeModel(b));

  writeOpenRouterFreeModelsCache(models);
  return models;
};

const buildLmStudioNativeVisionRequestBody = (
  model: string,
  base64Image: string,
  thinkingEnabled: boolean,
  inferBlockTypes: boolean,
  includeReasoning = true
) => ({
  model,
  input: [
    {
      type: "text",
      content: buildUserPrompt(inferBlockTypes),
    },
    {
      type: "image",
      data_url: `data:image/jpeg;base64,${base64Image}`,
    },
  ],
  system_prompt: buildSystemPrompt(thinkingEnabled, inferBlockTypes),
  stream: false,
  temperature: 0.2,
  max_output_tokens: 2048,
  context_length: 8192,
  store: false,
  ...(includeReasoning ? { reasoning: getLmStudioNativeReasoning(thinkingEnabled) } : {}),
});

const buildLmStudioNativeRepairRequestBody = (
  model: string,
  blocks: OpenAiCompatibleTranslationBlock[],
  thinkingEnabled: boolean,
  inferBlockTypes: boolean,
  includeReasoning = true
) => ({
  model,
  input: `Traduza estes blocos para PT-BR.${
    inferBlockTypes
      ? ' Mantenha o campo "type" de cada item se ele estiver correto.'
      : ' Defina "type": "none" em todos os itens.'
  }

${JSON.stringify({ translations: blocks }, null, 2)}`,
  system_prompt: buildRepairSystemPrompt(thinkingEnabled, inferBlockTypes),
  stream: false,
  temperature: 0.2,
  max_output_tokens: 2048,
  context_length: 8192,
  store: false,
  ...(includeReasoning ? { reasoning: getLmStudioNativeReasoning(thinkingEnabled) } : {}),
});

export const translateWithOpenAiCompatible = async (
  providerId: OpenAiCompatibleProviderId,
  apiKey: string,
  model: string,
  base64Image: string,
  thinkingEnabled: boolean,
  inferBlockTypes: boolean,
  onStatusChange?: (update: OpenAiCompatibleStatusUpdate) => void
) => {
  const provider = getOpenAiCompatibleProvider(providerId);

  if (provider.requiresApiKey && !apiKey.trim()) {
    throw new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_MISSING_KEY",
      `Configure sua ${provider.apiKeyLabel} antes de traduzir com ${provider.label}.`
    );
  }

  if (provider.id === "groq" && base64Image.length > GROQ_BASE64_IMAGE_LIMIT_BYTES) {
    throw new OpenAiCompatibleRequestError(
      "OPENAI_COMPATIBLE_BAD_REQUEST",
      "A imagem otimizada ficou grande demais para o Groq. Tente uma pagina menor ou use outro provedor."
    );
  }

  const requestLabel = `[openai-compatible] ${provider.id}:${model} #${Date.now()}`;
  const openAiCompatibleEndpoint = `${provider.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const lmStudioNativeEndpoint =
    provider.id === "lmstudio" ? getLmStudioNativeEndpoint(provider.baseUrl) : "";
  const requestTimeoutMs =
    OPENAI_COMPATIBLE_REQUEST_TIMEOUT_MS[provider.id] ?? 5 * 60 * 1000;

  const sendRequest = async (body: unknown, requestEndpoint = openAiCompatibleEndpoint) => {
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, requestTimeoutMs);

    try {
      const response = await tauriFetch(requestEndpoint, {
        method: "POST",
        headers: buildHeaders(provider.id, apiKey),
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw await normalizeError(response, provider.label);
      }

      return response.json() as Promise<unknown>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

      if (
        didTimeout ||
        (controller.signal.aborted &&
          (error instanceof DOMException ||
            errorMessage.includes("canceled") ||
            errorMessage.includes("cancelled") ||
            errorMessage.includes("abort")))
      ) {
        throw new OpenAiCompatibleRequestError(
          "OPENAI_COMPATIBLE_TIMEOUT",
          `${provider.label} demorou demais para responder. Tente uma pagina mais simples ou escolha outro modelo.`
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const resolveLmStudioNativeModel = async () => {
    if (provider.id !== "lmstudio" || model.trim() !== LMSTUDIO_AUTO_MODEL_ID) {
      return model.trim();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await tauriFetch(getOpenAiCompatibleModelsEndpoint(provider.baseUrl), {
        method: "GET",
        headers: buildHeaders(provider.id, apiKey),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn(`${requestLabel} nao conseguiu listar modelos do LM Studio; usando fallback.`);
        return model.trim();
      }

      const payload = (await response.json()) as {
        data?: Array<{ id?: string; object?: string }>;
      };
      const detectedModel = payload.data?.find((item) => typeof item.id === "string")?.id?.trim();

      if (!detectedModel) {
        console.warn(`${requestLabel} LM Studio nao retornou nenhum modelo em /v1/models; usando fallback.`);
        return model.trim();
      }

      console.info(`${requestLabel} usando modelo LM Studio detectado automaticamente: ${detectedModel}`);
      return detectedModel;
    } catch (error) {
      console.warn(`${requestLabel} falha ao detectar modelo do LM Studio; usando fallback.`, error);
      return model.trim();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const sendLmStudioNativeRequest = async (body: unknown) => {
    try {
      return await sendRequest(body, lmStudioNativeEndpoint);
    } catch (error) {
      const maybeError = error as OpenAiCompatibleRequestError;

      if (maybeError.code === "OPENAI_COMPATIBLE_BAD_REQUEST") {
        console.warn(`${requestLabel} rejeitou reasoning nativo; tentando sem o campo reasoning.`);

        if (typeof body === "object" && body !== null) {
          const { reasoning: _reasoning, ...bodyWithoutReasoning } = body as Record<string, unknown>;
          return sendRequest(bodyWithoutReasoning, lmStudioNativeEndpoint);
        }
      }

      throw error;
    }
  };

  const sendOpenAiCompatibleVisionRequest = async (
    attemptModel: string,
    includeResponseFormat: boolean,
    attemptThinkingEnabled: boolean
  ) => {
    try {
      return await sendRequest(
        buildVisionRequestBody(
          provider.id,
          attemptModel,
          base64Image,
          includeResponseFormat,
          attemptThinkingEnabled,
          inferBlockTypes
        )
      );
    } catch (error) {
      const maybeError = error as OpenAiCompatibleRequestError;
      if (maybeError.code !== "OPENAI_COMPATIBLE_BAD_REQUEST" || !includeResponseFormat) {
        throw error;
      }

      console.warn(`${requestLabel} rejeitou response_format; tentando novamente sem structured output.`);
      return sendRequest(
        buildVisionRequestBody(
          provider.id,
          attemptModel,
          base64Image,
          false,
          attemptThinkingEnabled,
          inferBlockTypes
        )
      );
    }
  };

  const sendOpenRouterAutoFreeRouterRequest = async (
    modelIds: string[],
    includeResponseFormat: boolean
  ) => {
    try {
      return await sendRequest(
        buildOpenRouterAutoFreeVisionRequestBody(
          modelIds,
          base64Image,
          includeResponseFormat,
          thinkingEnabled,
          inferBlockTypes
        )
      );
    } catch (error) {
      const maybeError = error as OpenAiCompatibleRequestError;
      if (maybeError.code !== "OPENAI_COMPATIBLE_BAD_REQUEST" || !includeResponseFormat) {
        throw error;
      }

      console.warn(`${requestLabel} roteador OpenRouter rejeitou json_schema; tentando sem response_format.`);
      return sendRequest(
        buildOpenRouterAutoFreeVisionRequestBody(
          modelIds,
          base64Image,
          false,
          thinkingEnabled,
          inferBlockTypes
        )
      );
    }
  };

  try {
    console.time(requestLabel);
    onStatusChange?.({
      stage: "connecting",
      message: `Enviando imagem para ${provider.label} com ${model}...`,
    });

    let payload: unknown;
    let parsedBlocks: OpenAiCompatibleTranslationBlock[] | null = null;

    if (provider.id === "openrouter" && model === OPENROUTER_AUTO_FREE_MODEL_ID) {
      onStatusChange?.({
        stage: "discovering",
        provider: provider.id,
        message: "Buscando modelos vision gratuitos no OpenRouter...",
      });

      const freeModels = await getOpenRouterFreeVisionModels(apiKey);
      if (freeModels.length === 0) {
        throw new OpenAiCompatibleRequestError(
          "OPENAI_COMPATIBLE_BAD_REQUEST",
          "Nenhum modelo gratis com vision apareceu no OpenRouter agora. Tente atualizar a lista mais tarde."
        );
      }

      const schemaFriendlyModels = freeModels.filter((freeModel) => freeModel.supportsResponseFormat);
      const routerModels = (schemaFriendlyModels.length > 0 ? schemaFriendlyModels : freeModels).map(
        (freeModel) => freeModel.id
      );
      let lastFallbackError: unknown = null;

      onStatusChange?.({
        stage: "connecting",
        provider: provider.id,
        model: routerModels[0],
        message: `OpenRouter vai rotear entre ${routerModels.length} modelo(s) gratis...`,
      });

      try {
        payload = await sendOpenRouterAutoFreeRouterRequest(
          routerModels,
          schemaFriendlyModels.length > 0
        );
        const routerBlocks = parseTranslationResponse(extractResponseText(payload));

        if (routerBlocks.length > 0 && !looksLikeEnglishTranscription(routerBlocks)) {
          parsedBlocks = routerBlocks;
        } else {
          lastFallbackError = new OpenAiCompatibleRequestError(
            "OPENAI_COMPATIBLE_BAD_REQUEST",
            routerBlocks.length > 0
              ? "OpenRouter respondeu em ingles em vez de traduzir."
              : "OpenRouter respondeu sem blocos utilizaveis."
          );
          console.warn(`${requestLabel} roteador OpenRouter respondeu sem traducao util; tentando fallback local.`);
        }
      } catch (error) {
        lastFallbackError = error;

        if (!isTransientOrFallbackableError(error)) {
          throw error;
        }

        console.warn(`${requestLabel} roteador OpenRouter falhou; tentando fallback local.`, error);
      }

      for (const [index, freeModel] of freeModels.entries()) {
        if (parsedBlocks) {
          break;
        }

        onStatusChange?.({
          stage: "fallback",
          provider: provider.id,
          model: freeModel.id,
          message:
            index === 0
              ? `Resposta vazia. Tentando ${freeModel.name} diretamente...`
              : `Cota ou indisponibilidade detectada. Tentando ${freeModel.name}...`,
        });

        try {
          payload = await sendOpenAiCompatibleVisionRequest(
            freeModel.id,
            freeModel.supportsResponseFormat,
            thinkingEnabled && freeModel.supportsReasoning
          );
          const fallbackBlocks = parseTranslationResponse(extractResponseText(payload));

          if (fallbackBlocks.length > 0 && !looksLikeEnglishTranscription(fallbackBlocks)) {
            parsedBlocks = fallbackBlocks;
            break;
          }

          lastFallbackError = new OpenAiCompatibleRequestError(
            "OPENAI_COMPATIBLE_BAD_REQUEST",
            fallbackBlocks.length > 0
              ? `${freeModel.name} transcreveu em ingles em vez de traduzir.`
              : `${freeModel.name} respondeu sem blocos utilizaveis.`
          );
          console.warn(`${requestLabel} modelo gratis ${freeModel.id} respondeu sem traducao util; tentando proximo.`);
          continue;
        } catch (error) {
          lastFallbackError = error;

          if (!isTransientOrFallbackableError(error)) {
            throw error;
          }

          console.warn(
            `${requestLabel} modelo gratis ${freeModel.id} falhou; tentando proximo fallback.`,
            error
          );
        }
      }

      if (!parsedBlocks) {
        throw new OpenAiCompatibleRequestError(
          "OPENAI_COMPATIBLE_RATE_LIMIT",
          "Nenhum modelo gratis disponivel agora. Tente novamente mais tarde ou escolha um modelo pago/manual.",
          (lastFallbackError as OpenAiCompatibleRequestError | null)?.status
        );
      }
    } else if (provider.id === "lmstudio") {
      const lmStudioModel = await resolveLmStudioNativeModel();

      try {
        payload = await sendLmStudioNativeRequest(
          buildLmStudioNativeVisionRequestBody(
            lmStudioModel,
            base64Image,
            thinkingEnabled,
            inferBlockTypes
          )
        );
      } catch (error) {
        const maybeError = error as OpenAiCompatibleRequestError;
        if (maybeError.code !== "OPENAI_COMPATIBLE_BAD_REQUEST" && maybeError.status !== 404) {
          throw error;
        }

        console.warn(`${requestLabel} endpoint nativo falhou; tentando endpoint OpenAI-compatible.`);
        payload = await sendRequest(
          buildVisionRequestBody(provider.id, model, base64Image, true, thinkingEnabled, inferBlockTypes)
        );
      }
    } else {
      payload = await sendOpenAiCompatibleVisionRequest(model, true, thinkingEnabled);
    }

    onStatusChange?.({
      stage: "processing",
      message: `${provider.label} respondeu. Organizando os blocos da pagina...`,
    });

    if (!parsedBlocks) {
      const rawText = extractResponseText(payload);
      onStatusChange?.({
        stage: "parsing",
        message: "Resposta recebida. Validando o JSON da traducao...",
      });

      parsedBlocks = parseTranslationResponse(rawText);
    }

    if (provider.id === "lmstudio" && looksLikeEnglishTranscription(parsedBlocks)) {
      onStatusChange?.({
        stage: "repairing",
        message: "LM Studio transcreveu em ingles. Fazendo uma segunda passada para PT-BR...",
      });

      let repairPayload: unknown;
      const lmStudioModel = await resolveLmStudioNativeModel();

      try {
        repairPayload = await sendLmStudioNativeRequest(
          buildLmStudioNativeRepairRequestBody(
            lmStudioModel,
            parsedBlocks,
            thinkingEnabled,
            inferBlockTypes
          )
        );
      } catch (error) {
        const maybeError = error as OpenAiCompatibleRequestError;
        if (maybeError.code !== "OPENAI_COMPATIBLE_BAD_REQUEST" && maybeError.status !== 404) {
          throw error;
        }

        console.warn(`${requestLabel} reparo nativo falhou; tentando reparo OpenAI-compatible.`);
        repairPayload = await sendRequest(
          buildRepairRequestBody(provider.id, model, parsedBlocks, true, thinkingEnabled, inferBlockTypes)
        );
      }

      const repairedText = extractResponseText(repairPayload);
      const repairedBlocks = parseTranslationResponse(repairedText);

      if (repairedBlocks.length > 0) {
        return repairedBlocks;
      }
    }

    return parsedBlocks;
  } catch (error) {
    console.error("Erro na traducao OpenAI-compatible:", error);
    throw error;
  } finally {
    console.timeEnd(requestLabel);
  }
};
