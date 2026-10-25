import React, { useState, useMemo } from "react";
import {
  useMangaStore,
  type TargetMedium,
  type TranslationTone,
  type HonorificsStyle,
  type ProfanityLevel,
  type SourceLanguage,
  type TargetLanguage,
  DEFAULT_TRANSLATION_PROFILE,
} from "@/store/useMangaStore";
import { buildEditorialSystemPrompt } from "@/services/promptBuilderService";
import { DialoguePolishIcon } from "@/components/icons/MangaIcons";
import {
  BookOpen,

  RotateCcw,
  Eye,
  EyeOff,
  Sliders,
  Check,
  ChevronDown,
  Languages,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface TranslationProfilePanelProps {
  compact?: boolean;
  onSaved?: () => void;
}

const SOURCE_LANGUAGE_OPTIONS: Array<{
  id: SourceLanguage;
  hanko: string;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: "ja",
    hanko: "日",
    label: "Japonês Raw (Direto)",
    badge: "TATEGAKI // 日本語",
    description:
      "Tradução direta do japonês. Ativa prompt avançado contra confusão em kanjis semelhantes, tategaki e furigana.",
  },
  {
    id: "en",
    hanko: "英",
    label: "Inglês (Scanlation)",
    badge: "SCAN // ENGLISH",
    description: "Tradução a partir de scans ocidentais ou intermediários em língua inglesa.",
  },
  {
    id: "ko",
    hanko: "韓",
    label: "Coreano (Manhwa)",
    badge: "HANGUL // 韓国語",
    description: "Tradução direta do coreano para webtoons com regras de ritmo e tratamento de idade.",
  },
  {
    id: "zh",
    hanko: "漢",
    label: "Chinês (Manhua)",
    badge: "HANZI // 中国語",
    description: "Tradução direta do chinês simplificado/tradicional com termos orientais e artes marciais.",
  },
  {
    id: "auto",
    hanko: "自",
    label: "Detecção Automática",
    badge: "AUTO // 識別",
    description: "Deixa a visão do modelo identificar automaticamente o idioma original da página.",
  },
];

const TARGET_LANGUAGE_OPTIONS: Array<{
  id: TargetLanguage;
  hanko: string;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: "pt-BR",
    hanko: "伯",
    label: "Português (Brasil)",
    badge: "PADRÃO // BRASIL",
    description: "Português brasileiro fluído, coloquial e adaptado aos padrões de editoras e scans brasileiras.",
  },
  {
    id: "en",
    hanko: "米",
    label: "Inglês",
    badge: "US // ENGLISH",
    description: "Gera a tradução adaptada para o inglês contemporâneo.",
  },
  {
    id: "es",
    hanko: "西",
    label: "Espanhol",
    badge: "LATAM // ES",
    description: "Gera a tradução no espanhol neutro para leitores hispânicos.",
  },
];

const MEDIUM_OPTIONS: Array<{
  id: TargetMedium;
  hanko: string;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: "manga",
    hanko: "巻",
    label: "Mangá Japonês",
    badge: "RTL // 日本",
    description: "Leitura direita para esquerda. Sufixos de respeito (-san, -kun, senpai, sensei).",
  },
  {
    id: "manhwa",
    hanko: "縦",
    label: "Manhwa Coreano",
    badge: "Webtoon // 韓国",
    description: "Leitura vertical webtoon. Termos de tratamento etário (Hyung, Oppa, Noona, Sunbae).",
  },
  {
    id: "manhua",
    hanko: "仙",
    label: "Manhua Chinês",
    badge: "Wuxia // 中国",
    description: "Cultivo, artes marciais e títulos de respeito orientais (Shifu, Gege, Shixiong).",
  },
  {
    id: "comic",
    hanko: "冊",
    label: "Comics / HQ",
    badge: "LTR // 西洋",
    description: "Quadrinhos ocidentais clássicos. Leitura da esquerda para a direita sem sufixos asiáticos.",
  },
];

const TONE_OPTIONS: Array<{
  id: TranslationTone;
  hanko: string;
  label: string;
  description: string;
}> = [
  {
    id: "natural",
    hanko: "風",
    label: "Natural / Scanlation",
    description: "Diálogos fluidos e expressivos do PT-BR moderno, sem parecer robótico.",
  },
  {
    id: "informal",
    hanko: "街",
    label: "Informal & Urbano",
    description: "Gírias jovens, contrações coloquiais orais (tá, pra, cê, valeu) e ritmo ágil.",
  },
  {
    id: "formal",
    hanko: "墨",
    label: "Formal & Literário",
    description: "Vocabulário polido, nobre e sem gírias. Ideal para personagens solenes ou época.",
  },
  {
    id: "raw",
    hanko: "直",
    label: "Cru & Literal",
    description: "Fidelidade semântica máxima ao original, evitando adaptações livres.",
  },
];

const QUICK_SUGGESTIONS = [
  "O protagonista usa gírias de rua e fala 'mano'",
  "Traduza feitiços mantendo os nomes em inglês/latim",
  "O vilão fala em tom pomposo e na 3ª pessoa",
  "Use 'você' em vez de 'tu'",
  "Evite palavras arcaicas ou floreios poéticos",
];

export const TranslationProfilePanel: React.FC<TranslationProfilePanelProps> = ({
  compact = false,
  onSaved,
}) => {
  const {
    translationProfile,
    setTranslationProfile,
    resetTranslationProfile,
    aiThinkingEnabled,
    aiInferBlockTypesEnabled,
    aiSecondPassEnabled,
    setAiSecondPassEnabled,
    glossary,
  } = useMangaStore();

  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const previewSystemPrompt = useMemo(() => {
    return buildEditorialSystemPrompt({
      profile: translationProfile,
      thinkingEnabled: aiThinkingEnabled,
      inferBlockTypes: aiInferBlockTypesEnabled,
      glossary,
      previousContext: null,
    });
  }, [
    translationProfile,
    aiThinkingEnabled,
    aiInferBlockTypesEnabled,
    glossary,
  ]);

  const handleSuggestionClick = (suggestion: string) => {
    const current = translationProfile.customDirectives?.trim() || "";
    if (current.includes(suggestion)) return;
    const updated = current ? `${current}\n- ${suggestion}` : `- ${suggestion}`;
    setTranslationProfile({ customDirectives: updated });
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-6 text-app-text-primary">
      {/* 1. PRESET DE IDIOMA: ORIGEM (RAW / SCAN) & DESTINO */}
      <div className="border-2 border-app-border bg-app-surface/90 p-4 shadow-ink-sm rounded-lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-brush text-base text-app-accent">言</span>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-widest text-app-text-secondary">
              Preset de Idioma & Direção de Tradução // LANGUAGE PIPELINE
            </span>
          </div>
          <span className="rounded border border-app-border bg-app-card px-2 py-0.5 font-pixel text-[9px] font-black text-app-accent">
            {translationProfile.sourceLanguage?.toUpperCase() || "JA"} ➔ {translationProfile.targetLanguage?.toUpperCase() || "PT-BR"}
          </span>
        </div>

        {/* Idioma de Origem (Raw / Scan) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-app-text-primary">
              1. Idioma Original da Obra (Raw / Scan)
            </span>
            <span className="font-pixel text-[8px] text-app-text-secondary">
              SELEÇÃO OBRIGATÓRIA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SOURCE_LANGUAGE_OPTIONS.map((item) => {
              const isSelected = (translationProfile.sourceLanguage || "ja") === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTranslationProfile({ sourceLanguage: item.id });
                    onSaved?.();
                  }}
                  className={`relative flex flex-col p-2.5 text-left transition-all border-2 rounded-lg ${
                    isSelected
                      ? "border-app-accent bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                      : "border-app-border bg-app-surface hover:border-app-accent/60 shadow-ink-sm"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-grid h-5 w-5 place-items-center border font-brush text-xs font-black ${
                          isSelected
                            ? "border-app-accent bg-app-accent text-white"
                            : "border-app-border bg-app-surface text-app-text-secondary"
                        }`}
                      >
                        {item.hanko}
                      </span>
                      <span className="font-display text-xs font-bold uppercase tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center h-4 w-4 bg-app-accent text-white rounded-full">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="font-pixel text-[8px] uppercase tracking-wider text-app-accent/90 mb-1">
                    {item.badge}
                  </span>
                  <p className="font-mono text-[11px] leading-relaxed text-app-text-secondary/80">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Idioma de Destino */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-app-text-primary">
              2. Idioma de Destino (Saída Editorial)
            </span>
            <span className="font-pixel text-[8px] text-app-text-secondary">
              SAÍDA FINAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TARGET_LANGUAGE_OPTIONS.map((item) => {
              const isSelected = (translationProfile.targetLanguage || "pt-BR") === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTranslationProfile({ targetLanguage: item.id });
                    onSaved?.();
                  }}
                  className={`relative flex flex-col p-2.5 text-left transition-all border-2 rounded-lg ${
                    isSelected
                      ? "border-app-accent bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                      : "border-app-border bg-app-surface hover:border-app-accent/60 shadow-ink-sm"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-grid h-5 w-5 place-items-center border font-brush text-xs font-black ${
                          isSelected
                            ? "border-app-accent bg-app-accent text-white"
                            : "border-app-border bg-app-surface text-app-text-secondary"
                        }`}
                      >
                        {item.hanko}
                      </span>
                      <span className="font-display text-xs font-bold uppercase tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center h-4 w-4 bg-app-accent text-white rounded-full">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="font-pixel text-[8px] uppercase tracking-wider text-app-accent/90 mb-1">
                    {item.badge}
                  </span>
                  <p className="font-mono text-[11px] leading-relaxed text-app-text-secondary/80">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SEGUNDA PASSADA DE NATURALIDADE (REVISÃO EDITORIAL) */}
      <div className="border-2 border-app-border bg-app-surface/90 p-4 shadow-ink-sm rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-grid h-8 w-8 place-items-center border-2 border-app-accent bg-app-card font-brush text-lg font-black text-app-accent shadow-ink-sm flex-shrink-0">
              磨
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display text-sm font-bold uppercase tracking-wide text-app-text-primary">
                  Segunda Passada de Naturalidade (Revisão Editorial)
                </span>
                <span className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider text-amber-500">
                  ⚠️ TOKENS ++ // REVISÃO TEXTUAL
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80">
                Submete os balões transcritos a um segundo ciclo textual focado exclusivamente em ritmo de fala, fluidez coloquial e eliminação de calques de tradução. Desativado por padrão para poupar cotas de API.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAiSecondPassEnabled(!aiSecondPassEnabled)}
            className={`border-2 px-3 py-1.5 font-pixel text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-ink-sm flex-shrink-0 ${
              aiSecondPassEnabled
                ? "border-emerald-600 bg-emerald-600 text-white shadow-ink"
                : "border-app-border bg-app-card text-app-text-secondary hover:border-app-accent"
            }`}
          >
            <DialoguePolishIcon size={13} className={aiSecondPassEnabled ? "text-white" : "text-app-accent"} />
            <span>{aiSecondPassEnabled ? "[済] ATIVADO" : "[無] DESATIVADO"}</span>
          </button>
        </div>
      </div>

      {/* 3. SELETOR DE MÍDIA / FORMATO CULTURAL */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-brush text-base text-app-accent">巻</span>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-widest text-app-text-secondary">
              Origem & Convenção Cultural // MEDIUM PRESET
            </span>
          </div>
          <span className="rounded border border-app-border bg-app-surface px-2 py-0.5 font-pixel text-[9px] font-black text-app-accent">
            {translationProfile.targetMedium.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MEDIUM_OPTIONS.map((item) => {
            const isSelected = translationProfile.targetMedium === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTranslationProfile({ targetMedium: item.id });
                  onSaved?.();
                }}
                className={`relative flex flex-col p-3 text-left transition-all border-2 rounded-lg ${
                  isSelected
                    ? "border-app-accent bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                    : "border-app-border bg-app-surface hover:border-app-accent/60 shadow-ink-sm"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-grid h-6 w-6 place-items-center border font-brush text-sm font-black ${
                        isSelected
                          ? "border-app-accent bg-app-accent text-white"
                          : "border-app-border bg-app-surface text-app-text-secondary"
                      }`}
                    >
                      {item.hanko}
                    </span>
                    <span className="font-display text-sm font-bold uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-pixel text-[8px] uppercase tracking-wider text-app-text-secondary/70">
                    {item.badge}
                  </span>
                </div>
                <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80 mt-1">
                  {item.description}
                </p>
                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center justify-center h-4 w-4 bg-app-accent text-white rounded-full">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TOM DE VOZ & REGISTRO */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-brush text-base text-app-accent">声</span>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-widest text-app-text-secondary">
              Tom de Voz do Agente // PERSONA TONE
            </span>
          </div>
          <span className="rounded border border-app-border bg-app-surface px-2 py-0.5 font-pixel text-[9px] font-black text-app-accent">
            {translationProfile.tone.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {TONE_OPTIONS.map((item) => {
            const isSelected = translationProfile.tone === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTranslationProfile({ tone: item.id });
                  onSaved?.();
                }}
                className={`relative flex flex-col p-2.5 text-left transition-all border-2 rounded-lg ${
                  isSelected
                    ? "border-app-accent bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                    : "border-app-border bg-app-surface hover:border-app-accent/60 shadow-ink-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-grid h-5 w-5 place-items-center border font-brush text-xs font-black ${
                      isSelected
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-border bg-app-surface text-app-text-secondary"
                    }`}
                  >
                    {item.hanko}
                  </span>
                  <span className="font-display text-xs font-bold uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-app-text-secondary/80">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. REGRAS CULTURAIS & FILTROS (Honoríficos & Xingamentos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Honoríficos */}
        <div className="border-2 border-app-border bg-app-surface/90 p-3.5 shadow-ink-sm rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary">
                Honoríficos & Títulos
              </span>
              <span className="font-brush text-sm text-app-accent">敬</span>
            </div>
            <p className="font-mono text-xs text-app-text-secondary/80 leading-relaxed mb-3">
              Como tratar sufixos e termos de respeito (-san, hyung, shifu).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-app-card border border-app-border rounded">
            <button
              type="button"
              onClick={() => {
                setTranslationProfile({ honorifics: "preserve" });
                onSaved?.();
              }}
              className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                translationProfile.honorifics === "preserve"
                  ? "bg-app-accent text-white shadow-ink-sm font-black"
                  : "text-app-text-secondary hover:text-app-text-primary"
              }`}
            >
              [敬] Preservar
            </button>
            <button
              type="button"
              onClick={() => {
                setTranslationProfile({ honorifics: "localize" });
                onSaved?.();
              }}
              className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                translationProfile.honorifics === "localize"
                  ? "bg-app-accent text-white shadow-ink-sm font-black"
                  : "text-app-text-secondary hover:text-app-text-primary"
              }`}
            >
              [訳] Localizar
            </button>
          </div>
        </div>

        {/* Vocabulário & Xingamentos */}
        <div className="border-2 border-app-border bg-app-surface/90 p-3.5 shadow-ink-sm rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary">
                Filtro de Linguagem
              </span>
              <span className="font-brush text-sm text-app-accent">激</span>
            </div>
            <p className="font-mono text-xs text-app-text-secondary/80 leading-relaxed mb-3">
              Tratamento de palavrões, xingamentos e expressões intensas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-app-card border border-app-border rounded">
            <button
              type="button"
              onClick={() => {
                setTranslationProfile({ profanity: "uncensored" });
                onSaved?.();
              }}
              className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                translationProfile.profanity === "uncensored"
                  ? "bg-rose-600 text-white shadow-ink-sm font-black"
                  : "text-app-text-secondary hover:text-app-text-primary"
              }`}
            >
              [激] Sem Censura
            </button>
            <button
              type="button"
              onClick={() => {
                setTranslationProfile({ profanity: "soft" });
                onSaved?.();
              }}
              className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                translationProfile.profanity === "soft"
                  ? "bg-emerald-600 text-white shadow-ink-sm font-black"
                  : "text-app-text-secondary hover:text-app-text-primary"
              }`}
            >
              [柔] Suavizado
            </button>
          </div>
        </div>
      </div>

      {/* 6. DIRETRIZES PERSONALIZADAS DO TRADUTOR (SYSTEM PROMPT CUSTOM) */}
      <div className="border-2 border-app-border bg-app-surface/90 p-4 shadow-ink-sm rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-brush text-base text-app-accent">筆</span>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-widest text-app-text-secondary">
              Diretrizes Exclusivas do Tradutor // CUSTOM SYSTEM DIRECTIVES
            </span>
          </div>
          <span className="font-mono text-[10px] text-app-text-secondary/60">
            {translationProfile.customDirectives?.length || 0} caracteres
          </span>
        </div>

        <p className="font-mono text-xs text-app-text-secondary/80 mb-3 leading-relaxed">
          Instruções adicionais que serão injetadas diretamente nas regras do motor de IA. Use para definir termos da trama, maneirismos de personagens ou regras do seu grupo de scanlation.
        </p>

        {/* Textarea estilo folha de manuscrito */}
        <textarea
          rows={3}
          value={translationProfile.customDirectives || ""}
          onChange={(e) => {
            setTranslationProfile({ customDirectives: e.target.value });
            onSaved?.();
          }}
          placeholder="Exemplo:&#10;- O protagonista usa gírias de São Paulo e fala 'mano'&#10;- O vilão é arrogante e fala de forma pomposa na 3ª pessoa&#10;- Sempre use 'você' em vez de 'tu'"
          className="w-full rounded-lg border-2 border-app-border bg-app-card p-3 font-mono text-xs text-app-text-primary outline-none transition-all placeholder:text-app-text-secondary/30 focus:border-app-accent focus:shadow-ink-sm resize-none leading-relaxed"
        />

        {/* Sugestões Rápidas */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="font-pixel text-[8px] uppercase tracking-wider text-app-text-secondary/70 mr-1">
            Sugestões rápidas:
          </span>
          {QUICK_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestionClick(sug)}
              className="rounded border border-app-border bg-app-card px-2 py-0.5 font-mono text-[10px] text-app-text-secondary hover:border-app-accent hover:text-app-accent transition-colors shadow-ink-sm"
            >
              + {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 7. INSPETOR DO SYSTEM PROMPT EM TEMPO REAL */}
      <div className="border-2 border-app-border bg-app-card rounded-lg overflow-hidden shadow-ink-sm">
        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="flex w-full items-center justify-between px-4 py-2.5 bg-app-surface text-left hover:bg-app-surface/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {showPromptPreview ? (
              <EyeOff size={14} className="text-app-accent" />
            ) : (
              <Eye size={14} className="text-app-accent" />
            )}
            <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-primary">
              Inspecionar System Prompt Real do Agente
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-app-text-secondary transition-transform duration-200 ${
              showPromptPreview ? "rotate-180" : ""
            }`}
          />
        </button>

        {showPromptPreview && (
          <div className="p-4 border-t border-app-border bg-app-bg/80 font-mono text-[11px] leading-relaxed text-app-text-secondary select-text whitespace-pre-wrap max-h-64 overflow-y-auto">
            {previewSystemPrompt}
          </div>
        )}
      </div>

      {/* 8. RESET BUTTON */}
      <div className="flex items-center justify-between pt-2 border-t border-dashed border-app-border">
        <button
          type="button"
          onClick={() => {
            resetTranslationProfile();
            onSaved?.();
          }}
          className="flex items-center gap-1.5 font-pixel text-[9px] font-bold uppercase tracking-wider text-app-text-secondary hover:text-rose-500 transition-colors"
        >
          <RotateCcw size={12} />
          <span>Restaurar Valores Padrão (Japonês ➔ PT-BR · Mangá · Natural)</span>
        </button>

        <span className="font-pixel text-[8px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Salvo Automaticamente
        </span>
      </div>
    </div>
  );
};

export default TranslationProfilePanel;
