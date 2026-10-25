import {
  type TranslationProfile,
  type TargetMedium,
  type TranslationTone,
  type HonorificsStyle,
  type ProfanityLevel,
  type SourceLanguage,
  type TargetLanguage,
  DEFAULT_TRANSLATION_PROFILE,
} from "@/store/useMangaStore";
import { type GlossaryTerm } from "./dbService";

export interface PromptBuilderOptions {
  profile?: TranslationProfile;
  thinkingEnabled?: boolean;
  inferBlockTypes?: boolean;
  glossary?: GlossaryTerm[];
  previousContext?: string | null;
}

export const getLanguageInstructions = (
  source: SourceLanguage = "ja",
  target: TargetLanguage = "pt-BR"
): string => {
  const targetLabel =
    target === "pt-BR"
      ? "Português Brasileiro (PT-BR)"
      : target === "es"
        ? "Espanhol"
        : "Inglês";

  if (source === "ja") {
    return `PRESET LINGUÍSTICO: JAPONÊS RAW -> ${targetLabel.toUpperCase()} (TRADUÇÃO DIRETA)
- DESAMBIGUAÇÃO CRÍTICA DE KANJI & FURIGANA (MÁXIMA ATENÇÃO):
  1. KANJIS DENSOS OU ESTILIZADOS: Páginas originais japonesas contêm kanjis com traços visualmente próximos (ex: 土/士, 未/末, 待/持, 鳴/嗚, 千/于, 日/曰, 人/入). DESAMBIGUE SEMPRE pelo contexto gramatical da oração, relações dos personagens e sentido da cena. NUNCA invente caracteres sem nexo.
  2. FURIGANA (RUBY TEXT): Quando houver furigana (leitura fonética em hiragana/katakana pequeno posicionado ao lado ou acima do kanji), use-o EXCLUSIVAMENTE para decifrar a pronúncia/leitura pretendida pelo autor (incluindo trocadilhos e leituras estilizadas tipo ateji). JAMAIS transcreva, anexe ou duplique o furigana como texto avulso na tradução final.
  3. ORDEM VERTICAL (TATEGAKI): A escrita vertical tradicional é lida de cima para baixo em colunas, e as colunas avançam da DIREITA PARA A ESQUERDA. Respeite as conexões naturais das frases sem misturar linhas paralelas de um mesmo balão.
  4. TRADUÇÃO DIRETA SEM ESCALA EM INGLÊS: Converta a semântica japonesa diretamente para o ${targetLabel}, preservando a força expressiva e evitando construções artificiais derivadas do inglês.
  5. CONTRAÇÕES COLOQUIAIS & DIALETOS: Reconheça contrações orais do japonês informal (〜ちゃう, 〜じゃん, 〜っす, 〜とく, 〜なきゃ, 〜だろ, 〜ぜ, 〜ぞ) e a omissão de sujeitos (eu, você, ele), inferindo os pronomes corretos pela dinâmica da cena e verbos de benefício (kureru, ageru, morau).`;
  }

  if (source === "ko") {
    return `PRESET LINGUÍSTICO: COREANO (MANHWA/HANGUL) -> ${targetLabel.toUpperCase()}
- Leitura horizontal/vertical contínua de webtoon.
- Atenção a partículas gramaticais de tópico/sujeito (은/는, 이/가) e níveis de polidez (Banmal vs. Jondaenmal).`;
  }

  if (source === "zh") {
    return `PRESET LINGUÍSTICO: CHINÊS (MANHUA/HANZI) -> ${targetLabel.toUpperCase()}
- Distinção entre caracteres simplificados e tradicionais.
- Atenção a expressões idiomáticas de 4 caracteres (Chengyu) e terminologias de artes marciais/cultivo (Xianxia/Wuxia).`;
  }

  if (source === "en") {
    return `PRESET LINGUÍSTICO: INGLÊS (SCANLATION OCIDENTAL) -> ${targetLabel.toUpperCase()}
- Traduza as falas e narrações em inglês para ${targetLabel} natural.
- Evite traduções literais de falsos cognatos (ex: actually, pretend, realize) e expressões idiomáticas ocidentais.`;
  }

  return `PRESET LINGUÍSTICO: AUTO-DETECÇÃO DE IDIOMA -> ${targetLabel.toUpperCase()}
- Identifique automaticamente o idioma do texto nos balões e entregue a tradução final em ${targetLabel} fluído.`;
};

export const getMediumInstructions = (medium: TargetMedium, honorifics: HonorificsStyle): string => {
  switch (medium) {
    case "manga":
      return `ORIGEM: Mangá japonês tradicional.
- ORDEM DE LEITURA: Rigorosamente da Direita para a Esquerda (RTL) e de cima para baixo.
- CULTURA & HONORÍFICOS: ${
        honorifics === "preserve"
          ? "PRESERVE sufixos honoríficos japoneses (-san, -kun, -chan, -sama, -senpai, -sensei, -dono) com hífen após o nome, pois definem a hierarquia e nuances de respeito entre personagens."
          : "LOCALIZE ou omita honoríficos japoneses para o português natural (use Senhor, Mestre, Irmão ou apenas o nome, conforme a intimidade)."
      }`;

    case "manhwa":
      return `ORIGEM: Manhwa coreano (Webtoon).
- ORDEM DE LEITURA: Leitura vertical contínua (de cima para baixo), e horizontal ocidental (esquerda para a direita) nas falas.
- CULTURA & TRATAMENTO: ${
        honorifics === "preserve"
          ? "PRESERVE termos de respeito e parentesco social coreanos (Hyung, Oppa, Noona, Unnie, Sunbae, Hubae, Ajusshi, Ajumma) quando usados como forma de tratamento."
          : "LOCALIZE os termos de parentesco/respeito coreanos para equivalentes brasileiros naturais (Mano, Irmão, Irmã, Veterano, Senhor) dependendo do contexto da relação."
      }`;

    case "manhua":
      return `ORIGEM: Manhua chinês (Cultivo, Wuxia ou Xianxia).
- ORDEM DE LEITURA: Esquerda para a Direita ou vertical.
- CULTURA & CULTIVO: ${
        honorifics === "preserve"
          ? "PRESERVE termos de tratamento, seitas e artes marciais chinesas (Shifu, Gege, Meimei, Shixiong, Shidi, Dantian, Qi) conforme convenções de scanlation de Xianxia/Wuxia."
          : "LOCALIZE os títulos chineses para o português (Mestre, Irmão Mais Velho, Irmãzinha) facilitando a leitura acessível."
      }`;

    case "comic":
      return `ORIGEM: Quadrinhos ocidentais (Comics / Graphic Novels).
- ORDEM DE LEITURA: Ocidental padrão, da Esquerda para a Direita (LTR) e de cima para baixo.
- CULTURA: Linguagem direta de HQs ocidentais, sem convenções ou sufixos orientais.`;
  }
};

export const getToneInstructions = (tone: TranslationTone): string => {
  switch (tone) {
    case "natural":
      return "TOM DE VOZ: Natural, fluido e expressivo de scanlation brasileira moderna. Adapte expressões idiomáticas para o português do Brasil sem soar robótico ou excessivamente acadêmico.";
    case "informal":
      return "TOM DE VOZ: Altamente coloquial, jovem e dinâmico. Use contrações orais comuns do Brasil (tá, pra, cê, valeu) e gírias contemporâneas autênticas adequadas a um diálogo falado.";
    case "formal":
      return "TOM DE VOZ: Polido, culto e literário. Mantenha gramática culta, evite gírias modernas ou contrações chulas, preservando solenidade e dignidade na fala dos personagens.";
    case "raw":
      return "TOM DE VOZ: Direto e estritamente literal ao texto original, priorizando máxima fidelidade semântica sem adaptações livres.";
  }
};

export const getProfanityInstructions = (profanity: ProfanityLevel): string => {
  switch (profanity) {
    case "uncensored":
      return "VOCABULÁRIO / XINGAMENTOS: Sem censura. Palavrões, provocações e ofensas presentes no original devem ser traduzidos com termos equivalentes e expressivos do português brasileiro com a mesma intensidade emocional da cena.";
    case "soft":
      return "VOCABULÁRIO / XINGAMENTOS: Suavizado e atenuado. Evite palavrões pesados de baixo calão; substitua ofensas intensas por termos atenuados (ex: 'droga', 'maldito', 'idiota', 'desgraça').";
  }
};

export const buildEditorialSystemPrompt = (options: PromptBuilderOptions): string => {
  const profile = options.profile ?? DEFAULT_TRANSLATION_PROFILE;
  const glossary = options.glossary ?? [];
  const previousContext = options.previousContext ?? null;

  const languageText = getLanguageInstructions(profile.sourceLanguage, profile.targetLanguage);
  const mediumText = getMediumInstructions(profile.targetMedium, profile.honorifics);
  const toneText = getToneInstructions(profile.tone);
  const profanityText = getProfanityInstructions(profile.profanity);

  const targetLangLabel =
    profile.targetLanguage === "pt-BR"
      ? "português brasileiro (PT-BR)"
      : profile.targetLanguage === "es"
        ? "espanhol"
        : "inglês";

  const customText = profile.customDirectives?.trim()
    ? `\nDIRETRIZES PERSONALIZADAS DO TRADUTOR (REGRAS EXCLUSIVAS DO PROJETO):\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nGLOSSÁRIO OBRIGATÓRIO DO PROJETO (Use estas traduções preferencialmente):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nCONTEXTO DA PÁGINA ANTERIOR (Use para manter continuidade narrativa e pronomes):\n${previousContext}`
    : "";

  const thinkingText = options.thinkingEnabled
    ? "THINKING: Pense internamente antes de responder para interpretar nuances contextuais e evitar transcrição literal, mas retorne estritamente o JSON final."
    : "THINKING: Priorize velocidade e concisão; não inclua raciocínio, notas ou explicações.";

  const typeText = options.inferBlockTypes
    ? 'TIPO VISUAL: Quando conseguir inferir com confiança, classifique cada balão como "rect" (narração/caixa), "outside" (texto fora/sfx), "thought" (pensamento), "double" (balão duplo) ou "none".'
    : 'TIPO VISUAL: Não classifique balões/containers; use "none" como "type" em todos os blocos.';

  return `Você é um tradutor e adaptador editorial especializado em quadrinhos e mangás.
Sua única tarefa é transcrever o texto da imagem na ordem correta e devolver a tradução final em ${targetLangLabel}.

${languageText}

${mediumText}
- ${toneText}
- ${profanityText}
- IDIOMA: Cada item em "translations.text" deve ser entregue em ${targetLangLabel} fluído.
- NÃO COPIE O IDIOMA DE ORIGEM: Nunca repita a frase no idioma original, exceto nomes próprios inevitáveis.
- OCR FIEL: Se um balão estiver vazio, ilegível ou for apenas um desenho/ruído, não invente conteúdo.
- ${thinkingText}
- ${typeText}${customText}${glossaryText}${contextText}
- FORMATO: Responda estritamente em JSON válido seguindo o schema solicitado, sem markdown e sem comentários.`;
};

export const buildEditorialUserPrompt = (inferBlockTypes: boolean, targetLanguage: TargetLanguage = "pt-BR"): string => {
  const targetLabel = targetLanguage === "pt-BR" ? "PT-BR" : targetLanguage === "es" ? "Espanhol" : "Inglês";
  return `Analise esta página de quadrinhos/mangá e retorne somente o JSON solicitado com a tradução final em ${targetLabel}.${
    inferBlockTypes
      ? ' Inclua o tipo visual ("rect", "outside", "thought", "double" ou "none") quando tiver confiança.'
      : ' Use "type": "none" em todos os blocos.'
  }`;
};

export const buildEditorialRepairPrompt = (options: PromptBuilderOptions): string => {
  const profile = options.profile ?? DEFAULT_TRANSLATION_PROFILE;
  const glossary = options.glossary ?? [];
  const previousContext = options.previousContext ?? null;

  const toneText = getToneInstructions(profile.tone);
  const profanityText = getProfanityInstructions(profile.profanity);
  const customText = profile.customDirectives?.trim()
    ? `\nDIRETRIZES PERSONALIZADAS DO TRADUTOR:\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nGLOSSÁRIO (Use estas traduções preferencialmente):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nCONTEXTO DA PÁGINA ANTERIOR:\n${previousContext}`
    : "";

  return `Você é um revisor editorial de quadrinhos e mangás.
Receberá blocos transcritos que podem estar em inglês, japonês ou rascunho.
Sua tarefa é refiná-los para português brasileiro natural.

REGRAS:
- ${toneText}
- ${profanityText}
- Preserve a ordem original dos blocos.
- Responda apenas em JSON válido no schema solicitado.${customText}${glossaryText}${contextText}`;
};

export const buildEditorialSecondPassPrompt = (options: PromptBuilderOptions): string => {
  const profile = options.profile ?? DEFAULT_TRANSLATION_PROFILE;
  const glossary = options.glossary ?? [];
  const previousContext = options.previousContext ?? null;

  const toneText = getToneInstructions(profile.tone);
  const profanityText = getProfanityInstructions(profile.profanity);
  const customText = profile.customDirectives?.trim()
    ? `\nDIRETRIZES PERSONALIZADAS DO TRADUTOR:\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nGLOSSÁRIO OBRIGATÓRIO (Mantenha rigorosamente estes termos):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nCONTEXTO DA PÁGINA ANTERIOR:\n${previousContext}`
    : "";

  return `Você é um Diretor Editorial e Revisor Chefe especializado em scanlations e quadrinhos publicados no Brasil.
Você receberá os blocos de tradução inicial de uma página.

SUA MISSÃO NA 2ª PASSADA (LAPIDAÇÃO DE NATURALIDADE):
1. NATURALIDADE COLOQUIAL: Elimine qualquer traço de tradução robótica, dura ou calques do japonês/inglês. As falas devem soar 100% orgânicas, como pessoas reais conversando no português do Brasil.
2. CADÊNCIA & CONCISÃO: Ajuste o ritmo e tamanho das frases para que caibam bem nos balões de quadrinhos sem perder impacto emocional.
3. PRESERVAÇÃO DE ESTRUTURA: Mantenha RIGOROSAMENTE a mesma quantidade de itens na lista, na mesma ordem sequencial e preservando o campo "type" de cada item.
4. ${toneText}
5. ${profanityText}${customText}${glossaryText}${contextText}

SCHEMA OBRIGATÓRIO DE RESPOSTA:
Responda APENAS em JSON válido no formato:
{
  "translations": [
    { "text": "fala polida e natural em PT-BR", "type": "tipo_original" }
  ]
}`;
};
