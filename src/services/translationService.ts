import { translateWithGemini } from "./geminiService";
import { OllamaStatusUpdate, translateImage as translateWithOllama } from "./ollamaService";
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
  base64Image: string,
  onResult: (results: TranslationResult[]) => void,
  onProgress?: (chunk: string) => void,
  onStatusChange?: (update: OllamaStatusUpdate) => void
) => {
  if (engine === "gemini") {
    if (!apiKey) {
      throw new Error("API Key do Gemini nao configurada.");
    }
    await translateWithGemini(apiKey, geminiModel, base64Image, onResult);
  } else {
    const results = await translateWithOllama(base64Image, ollamaModel, onProgress, onStatusChange);
    onResult(
      results.map((result) => ({
        text: result.text,
        type: result.type as BlockType | undefined,
      }))
    );
  }
};
