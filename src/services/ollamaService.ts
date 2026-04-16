const VALID_BLOCK_TYPES = new Set(["rect", "outside", "thought", "double", "none"]);

export interface OllamaTranslationBlock {
  text: string;
  type?: string;
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

MODELO:
{
  "translations": [
    { "text": "fala 1", "type": "none" },
    { "text": "fala 2", "type": "rect" }
  ]
}

Se a pagina nao tiver texto traduzivel, retorne {"translations": []}.`;

const OLLAMA_USER_PROMPT =
  "Analise esta pagina de manga e retorne somente o JSON solicitado.";

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

const extractStreamText = (line: string) => {
  try {
    const json = JSON.parse(line) as {
      message?: { content?: string };
    };
    return json.message?.content ?? "";
  } catch (error) {
    console.warn("Linha de stream do Ollama ignorada.", error);
    return "";
  }
};

export const translateImage = async (
  base64Image: string,
  model: string,
  onChunk?: (chunk: string) => void
) => {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        options: {
          temperature: 0.1,
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

    if (!response.ok) {
      const errorText = await response.text();

      if (errorText.toLowerCase().includes("not found")) {
        throw new Error(`Modelo do Ollama nao encontrado. Execute: ollama pull ${model}`);
      }

      throw new Error(`Erro no Ollama (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let pendingChunk = "";

    if (!reader) {
      return [];
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      pendingChunk += decoder.decode(value, { stream: true });
      const lines = pendingChunk.split("\n");
      pendingChunk = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const parsedLine = extractStreamText(line);
        if (!parsedLine) {
          continue;
        }

        fullResponse += parsedLine;
        onChunk?.(parsedLine);
      }
    }

    if (pendingChunk.trim()) {
      const parsedLine = extractStreamText(pendingChunk);
      if (parsedLine) {
        fullResponse += parsedLine;
        onChunk?.(parsedLine);
      }
    }

    return parseOllamaResponse(fullResponse);
  } catch (error) {
    console.error("Erro na traducao com Ollama:", error);
    throw error;
  }
};
