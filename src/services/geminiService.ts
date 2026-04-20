import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";

const MAX_RETRIES = 2;
const NON_RETRYABLE_GEMINI_CODES = new Set([
  "GEMINI_INVALID_KEY",
  "GEMINI_RATE_LIMIT",
  "GEMINI_FORBIDDEN",
  "GEMINI_BAD_REQUEST",
]);

const translationResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    translations: {
      type: SchemaType.ARRAY,
      description: "Lista em ordem de leitura com as falas ja traduzidas para portugues brasileiro.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description:
              "Traducao final em PT-BR. Nunca devolva a frase original em ingles, exceto nomes proprios inevitaveis.",
          },
        },
        required: ["text"],
      },
    },
  },
  required: ["translations"],
};

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

  const systemPrompt = `Voce e um tradutor especializado em mangas.
Sua unica tarefa e ler o texto da imagem e devolver a traducao final em portugues brasileiro.
REGRAS:
- ORDEM: Siga rigorosamente a ordem de leitura (Direita para Esquerda, Cima para Baixo).
- IDIOMA: Cada item em "translations.text" deve estar em PT-BR natural e legivel.
- NAO COPIE O INGLES: Nunca devolva a frase original em ingles, exceto nomes proprios inevitaveis.
- OCR: Se um balao estiver vazio, ilegivel ou sem texto relevante, nao invente conteudo.
- FORMATO: Responda somente em JSON valido seguindo o schema.

Exemplo:
English: "I love you."
JSON correto: {"translations":[{"text":"Eu te amo."}]}`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
            {
              inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: translationResponseSchema,
      },
    });

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
