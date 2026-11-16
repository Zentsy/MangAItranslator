import { GlossaryTerm } from "./dbService";
import { buildEditorialSystemPrompt, buildEditorialUserPrompt } from "./promptBuilderService";
import type { TranslationProfile } from "@/store/useMangaStore";

const VALID_BLOCK_TYPES = new Set(["rect", "outside", "thought", "double", "none"]);
const OLLAMA_REQUEST_TIMEOUT_MS = 8 * 60 * 1000;

const OLLAMA_TRANSLATION_SCHEMA = {
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
            enum: ["rect", "outside", "thought", "double", "none"],
          },
        },
        required: ["text", "type"],
      },
    },
  },
  required: ["translations"],
};

export interface OllamaTranslationBlock {
  text: string;
  type?: string;
}

export interface OllamaStatusUpdate {
  stage: "connecting" | "processing" | "parsing";
  message: string;
}

const OLLAMA_SYSTEM_PROMPT = `You are an expert manga and comic OCR and translation engine.
Your task is to analyze the page image, read text in correct reading order, and translate it into natural Brazilian Portuguese (PT-BR).

RULES:
- READING ORDER: follow standard manga reading order, from right to left and top to bottom.
- TEXT: transcribe and translate visible text from the page faithfully.
- FORMAT: respond strictly with valid JSON, without markdown fences and without commentary.
- TYPE: classify visual container type when confident:
  - "rect" for narration / rectangular text box
  - "outside" for text outside bubbles, sfx, or floating text
  - "thought" for thought bubbles
  - "double" for double or overlapping bubbles
  - "none" when uncertain

MANDATORY JSON SCHEMA:
{
  "translations": [
    { "text": "translated dialogue 1", "type": "none" },
    { "text": "translated dialogue 2", "type": "rect" }
  ]
}

If the page has no translatable text, return {"translations": []}.`;

const getThinkingInstruction = (thinkingEnabled: boolean) =>
  thinkingEnabled
    ? "\nTHINKING: reason internally before answering if supported, but return strictly the final JSON."
    : "\nTHINKING: do not output chain-of-thought; be direct and return strictly the final JSON.";

const getTypeInstruction = (inferBlockTypes: boolean) =>
  inferBlockTypes
    ? '\nTYPE: classify visual container when confident: "rect", "outside", "thought", "double", or "none".'
    : '\nTYPE: do not classify containers. Use "none" for all blocks.';

const getOllamaUserPrompt = (inferBlockTypes: boolean) =>
  `Analyze this comic/manga page image and return only the requested JSON.
${getTypeInstruction(inferBlockTypes)}
Strictly follow this schema:
${JSON.stringify(OLLAMA_TRANSLATION_SCHEMA)}`;

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

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  return trimmed;
};

const normalizeBlock = (value: unknown): OllamaTranslationBlock | null => {
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

  const normalizedType =
    typeof maybeBlock.type === "string" && VALID_BLOCK_TYPES.has(maybeBlock.type)
      ? maybeBlock.type
      : undefined;

  return {
    text,
    type: normalizedType,
  };
};

const inferTypeFromLine = (line: string) => {
  if (line.startsWith("[") && line.endsWith("]")) {
    return { text: line.slice(1, -1).trim(), type: "rect" };
  }

  if (line.startsWith("{") && line.endsWith("}")) {
    return { text: line.slice(1, -1).trim(), type: "outside" };
  }

  if (line.startsWith("(") && line.endsWith(")")) {
    return { text: line.slice(1, -1).trim(), type: "thought" };
  }

  if (line.startsWith("//")) {
    return { text: line.replace(/^\/\/\s*/, "").trim(), type: "double" };
  }

  return { text: line.trim(), type: "none" };
};

const fallbackParseBlocks = (rawText: string): OllamaTranslationBlock[] =>
  rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .map(inferTypeFromLine)
    .filter((block) => block.text.length > 0);

const parseOllamaResponse = (rawText: string): OllamaTranslationBlock[] => {
  const cleaned = cleanJson(rawText);

  try {
    const parsed = JSON.parse(cleaned) as
      | { translations?: unknown[]; blocks?: unknown[] }
      | unknown[];

    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.translations)
        ? parsed.translations
        : Array.isArray(parsed.blocks)
          ? parsed.blocks
          : [];

    const blocks = candidates
      .map(normalizeBlock)
      .filter((block): block is OllamaTranslationBlock => Boolean(block));

    if (blocks.length > 0 || cleaned.includes('"translations": []')) {
      return blocks;
    }
  } catch (error) {
    console.warn("Falha ao parsear JSON do Ollama, usando fallback por linhas.", error);
  }

  return fallbackParseBlocks(rawText);
};

const salvageBlocksFromBrokenJson = (rawText: string): OllamaTranslationBlock[] => {
  const blocks: OllamaTranslationBlock[] = [];
  const regex =
    /"text"\s*:\s*"((?:\\.|[^"\\])*)"(?:[\s\S]*?"type"\s*:\s*"((?:\\.|[^"\\])*)")?/g;

  for (const match of rawText.matchAll(regex)) {
    const text = JSON.parse(`"${match[1]}"`) as string;
    const maybeType = match[2] ? (JSON.parse(`"${match[2]}"`) as string) : undefined;

    if (!text.trim()) {
      continue;
    }

    blocks.push({
      text: text.trim(),
      type: maybeType && VALID_BLOCK_TYPES.has(maybeType) ? maybeType : "none",
    });
  }

  return blocks;
};

export const translateImage = async (
  base64Image: string,
  model: string,
  thinkingEnabled = false,
  inferBlockTypes = false,
  glossary: GlossaryTerm[] = [],
  previousContext: string | null = null,
  onChunk?: (chunk: string) => void,
  onStatusChange?: (update: OllamaStatusUpdate) => void,
  profile?: TranslationProfile
) => {
  const requestLabel = `[ollama] ${model} #${Date.now()}`;
  let timerRunning = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const endTimer = () => {
    if (!timerRunning) {
      return;
    }

    console.timeEnd(requestLabel);
    timerRunning = false;
  };

  try {
    onStatusChange?.({
      stage: "connecting",
      message: `Preparando o envio da imagem para ${model}...`,
    });
    console.time(requestLabel);
    timerRunning = true;

    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), OLLAMA_REQUEST_TIMEOUT_MS);

    const fetchPromise = fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        think: thinkingEnabled,
        format: OLLAMA_TRANSLATION_SCHEMA,
        options: {
          temperature: 0,
        },
        messages: [
          {
            role: "system",
            content: buildEditorialSystemPrompt({
              profile,
              thinkingEnabled,
              inferBlockTypes,
              glossary,
              previousContext,
            }),
          },
          {
            role: "user",
            content: buildEditorialUserPrompt(inferBlockTypes),
            images: [base64Image],
          },
        ],
      }),
    });

    onStatusChange?.({
      stage: "processing",
      message: thinkingEnabled
        ? `${model} recebeu a imagem com thinking ligado. Isso pode melhorar a leitura, mas demora mais em CPU.`
        : `${model} recebeu a imagem. Aguardando resposta local sem thinking extra.`,
    });

    console.info(`${requestLabel} imagem enviada, aguardando resposta completa...`);

    const response = await fetchPromise;

    if (!response.ok) {
      const errorText = await response.text();
      endTimer();

      if (errorText.toLowerCase().includes("not found")) {
        throw new Error(`Modelo do Ollama nao encontrado. Execute: ollama pull ${model}`);
      }

      throw new Error(`Erro no Ollama (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };
    console.info(`${requestLabel} resposta completa recebida.`);

    const fullResponse = payload.message?.content ?? payload.response ?? "";
    if (fullResponse) {
      onChunk?.(fullResponse);
    }

    onStatusChange?.({
      stage: "parsing",
      message: "Resposta recebida. Organizando os blocos da pagina...",
    });

    let parsed = parseOllamaResponse(fullResponse);
    if (parsed.length === 0 && fullResponse.trim()) {
      const salvaged = salvageBlocksFromBrokenJson(fullResponse);
      if (salvaged.length > 0) {
        console.warn(`${requestLabel} JSON veio quebrado; recuperando ${salvaged.length} bloco(s) via salvage.`);
        parsed = salvaged;
      } else {
        console.warn(`${requestLabel} resposta bruta sem blocos parseados:`, fullResponse.slice(0, 1200));
      }
    }

    endTimer();
    console.info(`${requestLabel} retornou ${parsed.length} bloco(s).`);
    return parsed;
  } catch (error) {
    endTimer();

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `Tempo limite excedido ao aguardar o Ollama (${Math.round(
          OLLAMA_REQUEST_TIMEOUT_MS / 60000
        )} min).`,
        { cause: error }
      );
    }

    console.error("Erro na traducao com Ollama:", error);
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};
