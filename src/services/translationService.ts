import { translateWithGemini } from "./geminiService";
import { translateImage as translateWithOllama } from "./ollamaService";
import { TranslationEngine } from "@/store/useMangaStore";

export interface TranslationResult {
  text: string;
}

export const translatePage = async (
  engine: TranslationEngine,
  apiKey: string,
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
    // Para o Ollama, como ele é streaming e retorna texto bruto com marcações,
    // vamos precisar de um parser para transformar em blocos se quisermos o mesmo comportamento.
    // Por enquanto, vamos apenas repassar o texto.
    let fullText = "";
    await translateWithOllama(base64Image, (chunk) => {
      fullText += chunk;
      if (onProgress) onProgress(chunk);
    });

    // Parse básico do Ollama para blocos se houver quebras de linha ou marcações
    // TODO: Melhorar o parser de sinais do Ollama ([ ], { }, etc)
    const lines = fullText.split("\n").filter(l => l.trim());
    onResult(lines.map(line => ({ text: line })));
  }
};
