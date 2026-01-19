export const fileToBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1024;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const base64String = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      resolve(base64String);
    };
    img.onerror = reject;
  });
};

export const translateImage = async (base64Image: string, onChunk: (chunk: string) => void) => {
  const systemPrompt = `Você é um tradutor especializado em mangás. Sua tarefa é extrair o texto da imagem e traduzi-lo do inglês para o português.
Use RIGOROSAMENTE as seguintes convenções de sinais:
[] para caixas de narração (retângulos).
{} para textos fora de balões (onomatopeias ou falas soltas).
() para pensamentos.
// para balões duplos ou falas sobrepostas.
Retorne APENAS o texto traduzido com os sinais, sem explicações adicionais.`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'translategemma:4b',
        prompt: "Traduza o texto desta página de mangá para português seguindo as regras de sinais.",
        system: systemPrompt,
        images: [base64Image],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no Ollama (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              onChunk(json.response);
            }
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error("Erro na tradução:", error);
    throw error;
  }
};
