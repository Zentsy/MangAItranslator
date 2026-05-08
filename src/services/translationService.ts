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
import { BlockType, TranslationEngine } from "@/store/useMangaStore";

export interface TranslationResult {
  text: string;
  type?: BlockType;
}

export const translatePage = async (
  engine: TranslationEngine,
  apiKey: string,
  geminiModel: string,
  ollamaModel: string,
  openAiCompatibleProvider: OpenAiCompatibleProviderId,
  openAiCompatibleApiKey: string,
  openAiCompatibleModel: string,
  openRouterModelMode: OpenRouterModelMode,
  aiThinkingEnabled: boolean,
  aiInferBlockTypesEnabled: boolean,
  base64Image: string,
  onResult: (results: TranslationResult[]) => void,
  onProgress?: (chunk: string) => void,
  onStatusChange?: (update: OllamaStatusUpdate | OpenAiCompatibleStatusUpdate) => void
) => {
  if (engine === "gemini") {
    if (!apiKey) {
      throw new Error("API Key do Gemini nao configurada.");
    }
    await translateWithGemini(
      apiKey,
      geminiModel,
      base64Image,
      aiThinkingEnabled,
      aiInferBlockTypesEnabled,
      onResult
    );
    return;
  }

  if (engine === "ollama") {
    const results = await translateWithOllama(
      base64Image,
      ollamaModel,
      aiThinkingEnabled,
      aiInferBlockTypesEnabled,
      onProgress,
      onStatusChange
    );
    onResult(
      results.map((result) => ({
        text: result.text,
        type: aiInferBlockTypesEnabled ? (result.type as BlockType | undefined) : "none",
      }))
    );
    return;
  }

  const results = await translateWithOpenAiCompatible(
    openAiCompatibleProvider,
    openAiCompatibleApiKey,
    openAiCompatibleProvider === "openrouter" && openRouterModelMode === "auto-free"
      ? OPENROUTER_AUTO_FREE_MODEL_ID
      : openAiCompatibleModel,
    base64Image,
    aiThinkingEnabled,
    aiInferBlockTypesEnabled,
    onStatusChange
  );

  onResult(
    results.map((result) => ({
      text: result.text,
      type: aiInferBlockTypesEnabled ? (result.type as BlockType | undefined) : "none",
    }))
  );
};
