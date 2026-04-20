import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_RETRIES = 2;
const NON_RETRYABLE_GEMINI_CODES = new Set([
  "GEMINI_INVALID_KEY",
  "GEMINI_RATE_LIMIT",
  "GEMINI_FORBIDDEN",
  "GEMINI_BAD_REQUEST",
]);

type GeminiErrorCode =
  | "GEMINI_INVALID_KEY"
  | "GEMINI_RATE_LIMIT"
  | "GEMINI_FORBIDDEN"
  | "GEMINI_BAD_REQUEST"
  | "GEMINI_UNKNOWN";

export class GeminiRequestError extends Error {
  code: GeminiErrorCode;
  status?: number;

  constructor(code: GeminiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "GeminiRequestError";
    this.code = code;
    this.status = status;
  }
}

const cleanJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text;
  } catch {
    return text;
  }
};

const stringifyGeminiDetails = (details: unknown) => {
  if (!Array.isArray(details)) {
    return "";
  }

  return details
    .map((detail) => {
      if (typeof detail === "string") {
        return detail;
      }

      try {
        return JSON.stringify(detail);
      } catch {
        return String(detail);
      }
    })
    .join(" | ");
};

const normalizeGeminiError = (error: any) => {
  const status = typeof error?.status === "number" ? error.status : undefined;
  const rawMessage = [error?.message, error?.statusText, stringifyGeminiDetails(error?.errorDetails)]
    .filter(Boolean)
    .join(" | ");
  const message = rawMessage || "O Gemini retornou um erro inesperado.";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("api key not valid") || lowerMessage.includes("invalid api key")) {
    return new GeminiRequestError(
      "GEMINI_INVALID_KEY",
      "Sua chave do Gemini parece invalida. Confira se ela pertence ao projeto certo no Google AI Studio.",
      status
    );
  }

  if (
    status === 429 ||
    lowerMessage.includes("resource_exhausted") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("too many requests")
  ) {
    return new GeminiRequestError(
      "GEMINI_RATE_LIMIT",
      "O Google recusou a requisicao com 429. Isso costuma indicar quota, billing ou limite temporario no projeto do Gemini, e pode acontecer ate com uma chave nova.",
      status ?? 429
    );
  }

  if (
    status === 403 ||
    lowerMessage.includes("permission denied") ||
    lowerMessage.includes("forbidden")
  ) {
    return new GeminiRequestError(
      "GEMINI_FORBIDDEN",
      "A chave foi aceita, mas o projeto nao tem permissao para usar a Gemini API ou esta com restricoes ativas.",
      status ?? 403
    );
  }

  if (status === 400) {
    return new GeminiRequestError(
      "GEMINI_BAD_REQUEST",
      "O Gemini recusou a requisicao. Confira se a API esta habilitada, se a chave pertence ao projeto certo e se o projeto tem quota disponivel.",
      status
    );
  }

  return new GeminiRequestError("GEMINI_UNKNOWN", message, status);
};

export const translateWithGemini = async (
  apiKey: string,
  geminiModel: string,
  base64Image: string,
  onResult: (blocks: { text: string }[]) => void,
  retryCount = 0
): Promise<void> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: geminiModel,
  });

  const systemPrompt = `Voce e um extrator de dados JSON para traducao de mangas.
Sua unica tarefa e extrair o texto em ingles da imagem, traduzir para o portugues e retornar um JSON.
REGRAS:
- ORDEM: Siga rigorosamente a ordem de leitura (Direita para Esquerda, Cima para Baixo).
- FORMATO: Retorne APENAS o objeto JSON abaixo. Nao escreva nada antes ou depois.
- CASE: Use iniciais maiusculas e o restante minusculo.

MODELO DE RESPOSTA (JSON PURO):
{
  "translations": [
    { "text": "fala 1" },
    { "text": "fala 2" }
  ]
}`;

  try {
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    const cleaned = cleanJson(responseText);

    try {
      const json = JSON.parse(cleaned);
      if (json.translations && Array.isArray(json.translations)) {
        onResult(json.translations);
      } else {
        throw new Error("Formato de JSON invalido: campo translations ausente.");
      }
    } catch (parseError) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Falha no parse (tentativa ${retryCount + 1}). Tentando novamente...`);
        return translateWithGemini(apiKey, geminiModel, base64Image, onResult, retryCount + 1);
      }
      throw parseError;
    }
  } catch (error: any) {
    const normalizedError = normalizeGeminiError(error);

    if (retryCount < MAX_RETRIES && !NON_RETRYABLE_GEMINI_CODES.has(normalizedError.code)) {
      return translateWithGemini(apiKey, geminiModel, base64Image, onResult, retryCount + 1);
    }

    console.error("Erro na API do Gemini apos retries:", {
      code: normalizedError.code,
      status: normalizedError.status,
      message: normalizedError.message,
      rawError: error,
    });

    throw normalizedError;
  }
};
