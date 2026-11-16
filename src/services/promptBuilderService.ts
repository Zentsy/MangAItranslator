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
      ? "Brazilian Portuguese (PT-BR)"
      : target === "es"
        ? "Spanish"
        : "English";

  if (source === "ja") {
    return `LANGUAGE PRESET: RAW JAPANESE -> ${targetLabel.toUpperCase()} (DIRECT TRANSLATION)
- CRITICAL KANJI & FURIGANA DISAMBIGUATION (MAXIMUM PRIORITY):
  1. DENSE OR STYLIZED KANJI: Original Japanese raw pages contain visually similar kanji with subtle stroke differences (e.g., 土/士, 未/末, 待/持, 鳴/嗚, 千/于, 日/曰, 人/入). ALWAYS disambiguate based on sentence grammar, character relationships, and scene context. NEVER hallucinate nonsensical characters.
  2. FURIGANA (RUBY TEXT): When furigana (small phonetic hiragana/katakana above or beside kanji) is present, use it EXCLUSIVELY to decode the author's intended pronunciation and nuance (including puns and stylized ateji). NEVER transcribe, append, or duplicate furigana as loose separate text in the final translation.
  3. VERTICAL READING ORDER (TATEGAKI): Traditional vertical text reads top-to-bottom in columns advancing from RIGHT TO LEFT. Respect natural sentence continuity without intertwining parallel lines from the same bubble.
  4. DIRECT TRANSLATION WITHOUT ENGLISH PIVOT: Convert Japanese semantics directly into fluent ${targetLabel}, preserving expressive power and avoiding awkward constructs derived from intermediate English.
  5. COLLOQUIAL CONTRACTIONS & DIALECTS: Accurately identify spoken contractions in informal Japanese (〜ちゃう, 〜じゃん, 〜っす, 〜とく, 〜なきゃ, 〜だろ, 〜ぜ, 〜ぞ) and omitted subjects (I, you, he/she), inferring the correct pronouns from scene dynamics and benefactive verbs (kureru, ageru, morau).`;
  }

  if (source === "ko") {
    return `LANGUAGE PRESET: KOREAN (MANHWA/HANGUL) -> ${targetLabel.toUpperCase()}
- Continuous vertical/horizontal webtoon flow.
- Pay strict attention to topic/subject grammatical particles (은/는, 이/가) and politeness levels (Banmal vs. Jondaenmal).`;
  }

  if (source === "zh") {
    return `LANGUAGE PRESET: CHINESE (MANHUA/HANZI) -> ${targetLabel.toUpperCase()}
- Accurate distinction between simplified and traditional characters.
- Pay attention to 4-character idioms (Chengyu) and martial arts/cultivation terminology (Xianxia/Wuxia).`;
  }

  if (source === "en") {
    return `LANGUAGE PRESET: ENGLISH (WESTERN COMICS / SCANLATION) -> ${targetLabel.toUpperCase()}
- Translate dialogue and narration accurately into natural ${targetLabel}.
- Avoid literal translations of false cognates (e.g., actually, pretend, realize) and Western idioms.`;
  }

  return `LANGUAGE PRESET: AUTO-DETECT SOURCE LANGUAGE -> ${targetLabel.toUpperCase()}
- Automatically detect the language of the text inside speech bubbles and output the final translation in fluent ${targetLabel}.`;
};

export const getMediumInstructions = (medium: TargetMedium, honorifics: HonorificsStyle): string => {
  switch (medium) {
    case "manga":
      return `SOURCE MEDIUM: Traditional Japanese Manga.
- READING ORDER: Strictly Right-to-Left (RTL) and Top-to-Bottom.
- CULTURE & HONORIFICS: ${
        honorifics === "preserve"
          ? "PRESERVE Japanese honorific suffixes (-san, -kun, -chan, -sama, -senpai, -sensei, -dono) hyphenated after character names, as they define social hierarchy and interpersonal intimacy."
          : "LOCALIZE or omit Japanese honorific suffixes into natural target language conventions based on character intimacy."
      }`;

    case "manhwa":
      return `SOURCE MEDIUM: Korean Manhwa (Webtoon).
- READING ORDER: Continuous vertical layout (top-to-bottom), and standard horizontal reading within speech bubbles.
- CULTURE & HONORIFICS: ${
        honorifics === "preserve"
          ? "PRESERVE Korean kinship and social respect terms (Hyung, Oppa, Noona, Unnie, Sunbae, Hubae, Ajusshi, Ajumma) when used as terms of address."
          : "LOCALIZE Korean kinship/respect terms into natural target language equivalents based on relationship context."
      }`;

    case "manhua":
      return `SOURCE MEDIUM: Chinese Manhua (Cultivation, Wuxia, or Xianxia).
- READING ORDER: Left-to-Right or vertical columns.
- CULTURE & HONORIFICS: ${
        honorifics === "preserve"
          ? "PRESERVE Chinese martial arts and cultivation titles (Shifu, Gege, Meimei, Shixiong, Shidi, Dantian, Qi) following Xianxia/Wuxia scanlation standards."
          : "LOCALIZE Chinese titles into natural target language equivalents to ensure accessible reading."
      }`;

    case "comic":
      return `SOURCE MEDIUM: Western Comics / Graphic Novels.
- READING ORDER: Western standard Left-to-Right (LTR) and Top-to-Bottom.
- CULTURE: Direct western comic dialogue style without oriental honorific conventions.`;
  }
};

export const getToneInstructions = (tone: TranslationTone): string => {
  switch (tone) {
    case "natural":
      return "TONE OF VOICE: Natural, fluid, and expressive modern scanlation style. Adapt idioms into organic spoken dialogue without sounding robotic or excessively academic.";
    case "informal":
      return "TONE OF VOICE: Highly colloquial, youthful, and dynamic. Use common spoken contractions and authentic contemporary slang suited for vivid spoken dialogue.";
    case "formal":
      return "TONE OF VOICE: Polished, refined, and literary. Use elevated grammar, avoid modern slang or vulgar contractions, maintaining character solemnity and dignity.";
    case "raw":
      return "TONE OF VOICE: Direct and strictly literal to the source text, prioritizing maximum semantic fidelity over creative adaptation.";
  }
};

export const getProfanityInstructions = (profanity: ProfanityLevel): string => {
  switch (profanity) {
    case "uncensored":
      return "PROFANITY & EXPLETIVES: Uncensored. Translate insults, curses, and aggressive language present in the original with natural, equally intense equivalents in the target language.";
    case "soft":
      return "PROFANITY & EXPLETIVES: Softened and toned down. Avoid heavy vulgarity; replace intense profanity with milder expressions (e.g., 'damn', 'jerk', 'curse it').";
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
      ? "Brazilian Portuguese (PT-BR)"
      : profile.targetLanguage === "es"
        ? "Spanish"
        : "English";

  const customText = profile.customDirectives?.trim()
    ? `\nCUSTOM TRANSLATOR DIRECTIVES (PROJECT EXCLUSIVE RULES):\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nMANDATORY PROJECT GLOSSARY (Strictly prioritize these translations):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nPREVIOUS PAGE CONTEXT (Use to maintain narrative continuity and consistent pronouns):\n${previousContext}`
    : "";

  const thinkingText = options.thinkingEnabled
    ? "THINKING: Reason internally before answering to understand contextual nuances and avoid literal word-by-word transcription, but return strictly the final JSON."
    : "THINKING: Prioritize speed and conciseness; do not output reasoning, notes, or explanations.";

  const typeText = options.inferBlockTypes
    ? 'VISUAL CONTAINER CLASSIFICATION: When confident, classify each bubble/container as "rect" (narration/box), "outside" (text outside bubbles/sfx), "thought" (thought bubble), "double" (double/overlapping bubble), or "none".'
    : 'VISUAL CONTAINER CLASSIFICATION: Do not classify containers; use "none" as "type" for all blocks.';

  return `You are an expert manga, comic, and webtoon OCR, localization, and translation engine.
Your sole task is to transcribe all text from the image in correct reading order and return the final translation in ${targetLangLabel}.

${languageText}

${mediumText}
- ${toneText}
- ${profanityText}
- TARGET LANGUAGE: Every item in "translations[].text" must be delivered in fluent, natural ${targetLangLabel}.
- DO NOT COPY SOURCE LANGUAGE: Never output phrases in the original source language unless they are unavoidable proper nouns or names.
- FAITHFUL OCR: If a bubble is empty, illegible, or contains only drawing/visual noise, do not invent content.
- ${thinkingText}
- ${typeText}${customText}${glossaryText}${contextText}
- FORMAT: Respond strictly in valid JSON matching the requested schema, without markdown fences and without commentary.`;
};

export const buildEditorialUserPrompt = (inferBlockTypes: boolean, targetLanguage: TargetLanguage = "pt-BR"): string => {
  const targetLabel = targetLanguage === "pt-BR" ? "Brazilian Portuguese (PT-BR)" : targetLanguage === "es" ? "Spanish" : "English";
  return `Analyze this comic/manga page image and return only the requested JSON with the final translation in ${targetLabel}.${
    inferBlockTypes
      ? ' Include the visual container type ("rect", "outside", "thought", "double", or "none") when confident.'
      : ' Use "type": "none" for all blocks.'
  }`;
};

export const buildEditorialRepairPrompt = (options: PromptBuilderOptions): string => {
  const profile = options.profile ?? DEFAULT_TRANSLATION_PROFILE;
  const glossary = options.glossary ?? [];
  const previousContext = options.previousContext ?? null;

  const toneText = getToneInstructions(profile.tone);
  const profanityText = getProfanityInstructions(profile.profanity);
  const targetLangLabel =
    profile.targetLanguage === "pt-BR"
      ? "Brazilian Portuguese (PT-BR)"
      : profile.targetLanguage === "es"
        ? "Spanish"
        : "English";

  const customText = profile.customDirectives?.trim()
    ? `\nCUSTOM TRANSLATOR DIRECTIVES:\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nPROJECT GLOSSARY (Strictly prioritize these translations):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nPREVIOUS PAGE CONTEXT:\n${previousContext}`
    : "";

  return `You are an expert comic and manga editorial proofreading and translation repair engine.
You will receive transcribed blocks that may be in Japanese, Korean, Chinese, English, or raw drafts.
Your task is to refine and translate them into natural, fluent ${targetLangLabel}.

RULES:
- ${toneText}
- ${profanityText}
- Preserve the exact original sequence and block count.
- Respond strictly in valid JSON matching the requested schema without commentary.${customText}${glossaryText}${contextText}`;
};

export const buildEditorialSecondPassPrompt = (options: PromptBuilderOptions): string => {
  const profile = options.profile ?? DEFAULT_TRANSLATION_PROFILE;
  const glossary = options.glossary ?? [];
  const previousContext = options.previousContext ?? null;

  const toneText = getToneInstructions(profile.tone);
  const profanityText = getProfanityInstructions(profile.profanity);
  const targetLangLabel =
    profile.targetLanguage === "pt-BR"
      ? "Brazilian Portuguese (PT-BR)"
      : profile.targetLanguage === "es"
        ? "Spanish"
        : "English";

  const customText = profile.customDirectives?.trim()
    ? `\nCUSTOM TRANSLATOR DIRECTIVES:\n${profile.customDirectives.trim()}`
    : "";

  const glossaryText =
    glossary.length > 0
      ? `\nMANDATORY GLOSSARY (Strictly maintain these terms):\n${glossary
          .map((t) => `- "${t.term}": "${t.translation}"`)
          .join("\n")}`
      : "";

  const contextText = previousContext
    ? `\nPREVIOUS PAGE CONTEXT:\n${previousContext}`
    : "";

  return `You are a Chief Editorial Director specialized in professional comic and manga scanlation and localization.
You will receive initial translation blocks from a comic page.

YOUR MISSION IN THE 2ND PASS (NATURAL DIALOGUE POLISHING):
1. COLLOQUIAL NATURALNESS: Eliminate any robotic phrasing, stiff syntax, or literal calques from the source language. Speech must sound 100% organic, like real people speaking in ${targetLangLabel}.
2. PACING & CONCISENESS: Refine sentence rhythm and brevity so dialogues fit comfortably inside comic balloons without losing emotional punch or character voice.
3. STRUCTURAL PRESERVATION: STRICTLY maintain the exact same number of items in the list, in the identical sequential order, preserving the "type" field of each item.
4. ${toneText}
5. ${profanityText}${customText}${glossaryText}${contextText}

MANDATORY RESPONSE SCHEMA:
Respond ONLY with valid JSON in this exact structure:
{
  "translations": [
    { "text": "polished natural dialogue in ${targetLangLabel}", "type": "original_type" }
  ]
}`;
};
