import { GoogleGenerativeAI } from "@google/generative-ai";

export const translateWithGemini = async (
  apiKey: string,
  base64Image: string,
  onResult: (blocks: { text: string }[]) => void
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
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
    
    // Função para limpar a resposta caso a IA envie markdown ou texto extra
    const cleanJson = (text: string) => {
      const match = text.match(/\{[\s\S]*\}/); // Pega apenas o que estiver entre chaves
      return match ? match[0] : text;
    };

    const json = JSON.parse(cleanJson(responseText));
    if (json.translations) {
      onResult(json.translations);
    }
  } catch (error: any) {
    console.error("Erro na API do Gemini:", error);
    throw error;
  }
};