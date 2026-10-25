import { translateWithGemini } from "./geminiService";
import { OllamaStatusUpdate, translateImage as translateWithOllama } from "./ollamaService";
import {
  OpenAiCompatibleStatusUpdate,
  translateWithOpenAiCompatible,
} from "./openAiCompatibleService";
import {
  OPENROUTER_AUTO_FREE_MODEL_ID,
  type OpenAiCompatibleProviderId,
  type OpenRouterModelMode,
} from "@/config/openAiCompatibleProviders";
import { BlockType, TranslationEngine, TranslationProfile } from "@/store/useMangaStore";
import { GlossaryTerm } from "./dbService";
import { executeSecondPassRefinement } from "./secondPassService";

export interface TranslationResult {
  text: string;
  type?: BlockType;
}

export const translatePage = async (
  engine: TranslationEngine,
  apiKey: string, // Gemini
  openRouterApiKey: string,
  groqApiKey: string,
  customApiKey: string,
  geminiModel: string,
  ollamaModel: string,
  openAiCompatibleProvider: OpenAiCompatibleProviderId,
  openAiCompatibleModel: string,
  openRouterModelMode: OpenRouterModelMode,
  aiThinkingEnabled: boolean,
  aiInferBlockTypesEnabled: boolean,
  base64Image: string,
  glossary: GlossaryTerm[],
  previousContext: string | null,
  onResult: (results: TranslationResult[]) => void,
  onProgress?: (chunk: string) => void,
  onStatusChange?: (update: OllamaStatusUpdate | OpenAiCompatibleStatusUpdate) => void,
  profile?: TranslationProfile,
  aiSecondPassEnabled = false
) => {
  const deliverResults = async (rawResults: TranslationResult[]) => {
    let finalResults = rawResults;

    if (aiSecondPassEnabled && finalResults.length > 0) {
      try {
        finalResults = await executeSecondPassRefinement({
          blocks: finalResults,
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
          glossary,
          previousContext,
          onStatusChange: (status) => {
            onStatusChange?.({
              stage: "processing",
              message: status.message,
            });
          },
        });
      } catch (err) {
        console.warn("[translatePage] 2ª passada falhou; entregando 1ª passada:", err);
      }
    }

    onResult(finalResults);
  };

  if (engine === "gemini") {
    if (!apiKey) {
      throw new Error("API Key do Gemini nao configurada.");
    }
    let geminiBlocks: TranslationResult[] = [];
    await translateWithGemini(
      apiKey,
      geminiModel,
      base64Image,
      aiThinkingEnabled,
      aiInferBlockTypesEnabled,
      glossary,
      previousContext,
      (results) => {
        geminiBlocks = results;
      },
      0,
      profile
    );
    await deliverResults(geminiBlocks);
    return;
  }

  if (engine === "ollama") {
    const results = await translateWithOllama(
      base64Image,
      ollamaModel,
      aiThinkingEnabled,
      aiInferBlockTypesEnabled,
      glossary,
      previousContext,
      onProgress,
      onStatusChange,
      profile
    );
    const mapped = results.map((result) => ({
      text: result.text,
      type: aiInferBlockTypesEnabled ? (result.type as BlockType | undefined) : "none",
    }));
    await deliverResults(mapped);
    return;
  }

  const currentProviderApiKey =
    openAiCompatibleProvider === "openrouter" ? openRouterApiKey :
    openAiCompatibleProvider === "groq" ? groqApiKey :
    customApiKey;

  const results = await translateWithOpenAiCompatible(
    openAiCompatibleProvider,
    currentProviderApiKey,
    openAiCompatibleProvider === "openrouter" && openRouterModelMode === "auto-free"
      ? OPENROUTER_AUTO_FREE_MODEL_ID
      : openAiCompatibleModel,
    base64Image,
    aiThinkingEnabled,
    aiInferBlockTypesEnabled,
    glossary,
    previousContext,
    onStatusChange,
    profile
  );

  const mapped = results.map((result) => ({
    text: result.text,
    type: aiInferBlockTypesEnabled ? (result.type as BlockType | undefined) : "none",
  }));
  await deliverResults(mapped);
};
