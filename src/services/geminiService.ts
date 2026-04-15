import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_RETRIES = 2;

const cleanJson = (text: string) => {
  try {
    // Tenta encontrar o bloco de JSON se a IA enviou markdown (```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text;
  } catch (e) {
    return text;
  }
};

export const translateWithGemini = async (
  apiKey: string,
  base64Image: string,
  onResult: (blocks: { text: string }[]) => void,
  retryCount = 0
): Promise<void> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // Atualizado para o modelo mais recente e estável
  });

  const systemPrompt = `Você é um extrator de dados JSON para tradução de mangás.
Sua única tarefa é extrair o texto em inglês da imagem, traduzir para o português e retornar um JSON.
REGRAS:
- ORDEM: Siga rigorosamente a ordem de leitura (Direita para Esquerda, Cima para Baixo).
- FORMATO: Retorne APENAS o objeto JSON abaixo. Não escreva nada antes ou depois.
- CASE: Use iniciais maiúsculas e o restante minúsculo.

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
          mimeType: "image/jpeg"
        }
      }
    ]);

    const responseText = result.response.text();
    const cleaned = cleanJson(responseText);
    
    try {
      const json = JSON.parse(cleaned);
      if (json.translations && Array.isArray(json.translations)) {
        onResult(json.translations);
      } else {
        throw new Error("Formato de JSON inválido: campo translations ausente.");
      }
    } catch (parseError) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Falha no parse (tentativa ${retryCount + 1}). Tentando novamente...`);
        return translateWithGemini(apiKey, base64Image, onResult, retryCount + 1);
      }
      throw parseError;
    }
  } catch (error: any) {
    // Se for erro de quota (429), NÃO faz retry automático.
    const isRateLimit = error.message?.includes("429") || error.status === 429;
    
    if (retryCount < MAX_RETRIES && !error.message?.includes("API key") && !isRateLimit) {
      return translateWithGemini(apiKey, base64Image, onResult, retryCount + 1);
    }
    
    if (isRateLimit) {
      throw new Error("Limite de requisições atingido (429). Aguarde alguns segundos antes de tentar novamente.");
    }
    
    console.error("Erro na API do Gemini após retries:", error);
    throw error;
  }
};