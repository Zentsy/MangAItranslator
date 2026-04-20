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

const OLLAMA_SYSTEM_PROMPT = `Voce e um extrator de texto para traducao de manga.
Sua tarefa e olhar a pagina, ler o texto na ordem correta e traduzir para portugues do Brasil.

REGRAS:
- ORDEM: respeite a leitura de manga, da direita para a esquerda e de cima para baixo.
- TEXTO: traduza apenas o conteudo visivel da pagina.
- FORMATO: responda apenas com JSON valido, sem markdown e sem comentarios.
- TIPO: use um destes tipos quando conseguir inferir o container do texto:
  - "rect" para narracao/caixa retangular
  - "outside" para texto fora de balao, sfx ou texto solto
  - "thought" para pensamento
  - "double" para balao duplo/sobreposto
  - "none" quando nao tiver certeza

SCHEMA JSON OBRIGATORIO:
{
  "translations": [
    { "text": "fala 1", "type": "none" },
    { "text": "fala 2", "type": "rect" }
  ]
}

Se a pagina nao tiver texto traduzivel, retorne {"translations": []}.`;

const OLLAMA_USER_PROMPT =
  `Analise esta pagina de manga e retorne somente o JSON solicitado.
Siga exatamente este schema:
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
  onChunk?: (chunk: string) => void,
  onStatusChange?: (update: OllamaStatusUpdate) => void
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
        think: false,
        format: OLLAMA_TRANSLATION_SCHEMA,
        options: {
          temperature: 0,
        },
        messages: [
          {
            role: "system",
            content: OLLAMA_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: OLLAMA_USER_PROMPT,
            images: [base64Image],
          },
        ],
      }),
    });

    onStatusChange?.({
      stage: "processing",
      message: `${model} recebeu a imagem. Agora ele esta pensando localmente, o que pode demorar bastante em CPU.`,
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
        )} min).`
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
