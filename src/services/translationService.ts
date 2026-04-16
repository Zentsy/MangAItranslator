import { translateWithGemini } from "./geminiService";
import { translateImage as translateWithOllama } from "./ollamaService";
import { BlockType, TranslationEngine } from "@/store/useMangaStore";

export interface TranslationResult {
  text: string;
  type?: BlockType;
}

export const translatePage = async (
  engine: TranslationEngine,
  apiKey: string,
  ollamaModel: string,
  base64Image: string,
  onResult: (results: TranslationResult[]) => void,
  onProgress?: (chunk: string) => void
) => {
  if (engine === "gemini") {
    if (!apiKey) {
      throw new Error("API Key do Gemini não configurada.");
    }
    await translateWithGemini(apiKey, base64Image, onResult);
  } else {
    const results = await translateWithOllama(base64Image, ollamaModel, onProgress);
    onResult(
      results.map((result) => ({
        text: result.text,
        type: result.type as BlockType | undefined,
      }))
    );
  }
};
