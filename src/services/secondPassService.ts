import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import {
  getOpenAiCompatibleProvider,
  type OpenAiCompatibleProviderId,
  type OpenRouterModelMode,
} from "@/config/openAiCompatibleProviders";
import type { TranslationEngine, TranslationProfile } from "@/store/useMangaStore";
import type { GlossaryTerm } from "./dbService";
import { buildEditorialSecondPassPrompt } from "./promptBuilderService";
import type { TranslationResult } from "./translationService";

export interface SecondPassOptions {
  blocks: TranslationResult[];
  engine: TranslationEngine;
  apiKey: string; // Gemini
  openRouterApiKey: string;
  groqApiKey: string;
  customApiKey: string;
  geminiModel: string;
  ollamaModel: string;
  openAiCompatibleProvider: OpenAiCompatibleProviderId;
  openAiCompatibleModel: string;
  openRouterModelMode: OpenRouterModelMode;
  profile?: TranslationProfile;
  glossary?: GlossaryTerm[];
  previousContext?: string | null;
  onStatusChange?: (status: { stage: string; message: string }) => void;
}

const SECOND_PASS_TIMEOUT_MS = 30_000;

const cleanJson = (text: string): string => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text.trim();
  } catch {
    return text.trim();
  }
};

const parseRefinedBlocks = (rawText: string): Array<{ text: string; type?: string }> => {
  const cleaned = cleanJson(rawText);
  if (!cleaned) return [];

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.translations)) {
      return parsed.translations.filter((item: any) => item && typeof item.text === "string");
    }
    if (Array.isArray(parsed)) {
      return parsed.filter((item: any) => item && typeof item.text === "string");
    }
  } catch {
    // Tenta regex de emergência caso o json venha com pequenos problemas
    const matches = [...rawText.matchAll(/"text"\s*:\s*"([^"]+)"/g)];
    if (matches.length > 0) {
      return matches.map((m) => ({ text: m[1] }));
    }
  }
  return [];
};

const buildSecondPassUserPrompt = (blocks: TranslationResult[]): string => {
  return `Por favor, faça a 2ª passada editorial refinando as falas abaixo para português brasileiro 100% natural, coloquial e fluido.
Mantenha exatamente a mesma ordem e preserve os tipos ("type").

ENTRADA DA 1ª PASSADA:
${JSON.stringify({ translations: blocks }, null, 2)}

Devolva APENAS o JSON no formato:
{
  "translations": [
    { "text": "fala refinada em PT-BR", "type": "mesmo_tipo" }
  ]
}`;
};

/**
 * Executa a Segunda Passada de Naturalidade (Fase 4.2).
 * Refina puramente o texto dos balões via LLM para remover calques,
 * adaptar gírias e polir o ritmo de leitura dos quadrinhos em PT-BR.
 * Caso ocorra qualquer falha, retorna graciosamente os blocos originais intactos.
 */
export const executeSecondPassRefinement = async (
  options: SecondPassOptions
): Promise<TranslationResult[]> => {
  const {
    blocks,
    engine,
    apiKey,
    openRouterApiKey,
    groqApiKey,
    customApiKey,
    geminiModel,
    ollamaModel,
    openAiCompatibleProvider,
    openAiCompatibleModel,
    openRouterModelMode,
    profile,
    glossary = [],
    previousContext = null,
    onStatusChange,
  } = options;

  if (!blocks || blocks.length === 0) {
    return blocks;
  }

  // Se todos os blocos forem vazios, não há o que polir
  const hasContent = blocks.some((b) => b.text && b.text.trim().length > 0);
  if (!hasContent) {
    return blocks;
  }

  onStatusChange?.({
    stage: "second-pass",
    message: "2ª Passada: Lapidando naturalidade dos diálogos em PT-BR...",
  });

  const systemPrompt = buildEditorialSecondPassPrompt({
    profile,
    glossary,
    previousContext,
  });

  const userPrompt = buildSecondPassUserPrompt(blocks);

  try {
    let rawResponse = "";

    // 1. GEMINI
    if (engine === "gemini") {
      if (!apiKey?.trim()) return blocks;

      const ai = new GoogleGenerativeAI(apiKey.trim());
      const model = ai.getGenerativeModel({
        model: geminiModel || "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      });

      rawResponse = response.response.text();
    }
    // 2. OLLAMA
    else if (engine === "ollama") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SECOND_PASS_TIMEOUT_MS);

      try {
        const response = await tauriFetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            format: "json",
            stream: false,
            options: {
              temperature: 0.3,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama HTTP ${response.status}`);
        }

        const data = (await response.json()) as { message?: { content?: string } };
        rawResponse = data.message?.content || "";
      } finally {
        clearTimeout(timeoutId);
      }
    }
    // 3. OPENAI-COMPATIBLE (OpenRouter, Groq, LM Studio, etc.)
    else {
      const provider = getOpenAiCompatibleProvider(openAiCompatibleProvider);
      const currentApiKey =
        provider.id === "openrouter"
          ? openRouterApiKey
          : provider.id === "groq"
            ? groqApiKey
            : customApiKey;

      if (provider.requiresApiKey && !currentApiKey?.trim()) {
        return blocks;
      }

      // No OpenRouter com auto-free ou modelo vision específico, para texto usamos openrouter/free leve
      const textModel =
        provider.id === "openrouter"
          ? openRouterModelMode === "auto-free"
            ? "openrouter/free"
            : openAiCompatibleModel
          : provider.id === "groq"
            ? "llama-3.3-70b-versatile"
            : openAiCompatibleModel;

      const endpoint = `${provider.baseUrl.replace(/\/+$/, "")}/chat/completions`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (currentApiKey?.trim()) {
        headers.Authorization = `Bearer ${currentApiKey.trim()}`;
      }
      if (provider.id === "openrouter") {
        headers["HTTP-Referer"] = "https://github.com/Zentsy/MangAItranslator";
        headers["X-OpenRouter-Title"] = "MangAI Translator";
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SECOND_PASS_TIMEOUT_MS);

      try {
        const response = await tauriFetch(endpoint, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: textModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 2048,
            ...(provider.id === "openrouter" || provider.id === "lmstudio"
              ? { response_format: { type: "json_object" } }
              : {}),
          }),
        });

        if (!response.ok) {
          throw new Error(`${provider.label} HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        rawResponse = data.choices?.[0]?.message?.content || "";
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!rawResponse.trim()) {
      return blocks;
    }

    const refinedItems = parseRefinedBlocks(rawResponse);
    if (!refinedItems || refinedItems.length === 0) {
      return blocks;
    }

    // Mescla o texto refinado mantendo a lista de blocos original e seus respectivos types
    return blocks.map((originalBlock, index) => {
      const refined = refinedItems[index];
      if (refined && refined.text && refined.text.trim().length > 0) {
        return {
          text: refined.text.trim(),
          type: originalBlock.type,
        };
      }
      return originalBlock;
    });
  } catch (error) {
    console.warn(
      "[2ª Passada] Lapidação não concluída; mantendo traduções da primeira passada com segurança:",
      error
    );
    return blocks;
  }
};
