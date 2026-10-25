import React, { useMemo, useState, type ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  GEMINI_MODEL_OPTIONS,
  getGeminiAccessLabel,
  getGeminiFamilyLabel,
} from "@/config/geminiModels";
import {
  getOllamaModelOption,
  getOllamaProfileLabel,
  OLLAMA_MODEL_OPTIONS,
} from "@/config/ollamaModels";
import {
  getDefaultOpenAiCompatibleModelForProvider,
  getOpenAiCompatibleModel,
  getOpenAiCompatibleProvider,
  OPENROUTER_AUTO_FREE_MODEL_ID,
  OPENAI_COMPATIBLE_PROVIDERS,
  type OpenAiCompatibleProviderId,
} from "@/config/openAiCompatibleProviders";
import {
  GeminiLogo,
  OllamaLogo,
  OpenRouterLogo,
  GroqLogo,
  LMStudioLogo,
  getProviderLogo,
} from "@/components/icons/EngineLogos";

import { InkWellIcon, GPenIcon, DialoguePolishIcon } from "@/components/icons/MangaIcons";

import { useMangaStore } from "@/store/useMangaStore";
import { useTheme } from "@/contexts/ThemeContext";
import { dbService } from "@/services/dbService";
import {
  clearOpenRouterFreeModelsCache,
  getOpenRouterFreeVisionModels,
} from "@/services/openAiCompatibleService";
import type { AvailableUpdateInfo, UpdateCheckResult } from "@/hooks/useAppUpdater";
import {
  Brain,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Github,
  Heart,
  History,
  Info,
  Palette,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,

  Tags,
  Trash2,

  Zap,
  type LucideIcon,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import StatusModal, { StatusType } from "@/components/StatusModal";
import TranslationProfilePanel from "@/components/TranslationProfilePanel";

interface SettingsViewProps {
  onBack: () => void;
  appVersion: string;
  availableUpdate: AvailableUpdateInfo | null;
  isCheckingUpdates: boolean;
  isInstallingUpdate: boolean;
  updateProgressPercent: number | null;
  updateStatusMessage: string | null;
  lastUpdateCheck: string | null;
  updateError: string | null;
  onCheckForUpdates: () => Promise<UpdateCheckResult>;
  onInstallUpdate: () => Promise<boolean>;
}

type SettingsSectionId = "ai" | "editor" | "appearance" | "data" | "updates" | "about";

const SUPPORT_URL = "https://ko-fi.com/zentsy";
const GITHUB_URL = "https://github.com/Zentsy/MangAItranslator";

const SETTINGS_SECTIONS: Array<{ id: SettingsSectionId; label: string; kicker: string; icon: React.ComponentType<{ size?: number; className?: string }>; hanko: string }> = [
  { id: "ai", label: "Motores IA", kicker: "modelos", icon: InkWellIcon, hanko: "知" },
  { id: "editor", label: "Mesa Editorial", kicker: "draft", icon: GPenIcon, hanko: "筆" },
  { id: "appearance", label: "Aparência", kicker: "estilo", icon: Palette, hanko: "色" },
  { id: "data", label: "Cofre & Dados", kicker: "local", icon: Database, hanko: "庫" },
  { id: "updates", label: "Atualizações", kicker: "versão", icon: RefreshCw, hanko: "新" },
  { id: "about", label: "Sobre o Tomo", kicker: "projeto", icon: Info, hanko: "誌" },
];

const CHANGELOG_ITEMS = [
  {
    version: "v0.4.0",
    badge: "Atual",
    title: "Nova Identidade Nanquim, Segunda Passada & Iconografia Autoral",
    items: [
      "Nova Identidade Visual 'Paper Light' inspirada em Papel Washi cru, Nanquim e Pena G tradicional.",
      "Segunda Passada de Naturalidade (PT-BR): polimento opcional de fluidez com preservação contextual estrita.",
      "Preset Especializado Japonês Raw -> PT-BR com desambiguação de kanjis homófonos, furigana e tategaki.",
      "Aposentadoria de AI Slop: iconografia tátil e artesanal com penas G, balões e tinteiros em SVG puro.",
      "Logo Oficial autoral vetorial em SVG puro, eliminando assets pesados e aumentando a nitidez em qualquer tela.",
      "Otimização do roteador OpenRouter Auto-Free com suporte ampliado a modelos de visão e limpeza de raciocínio.",
    ],
  },
  {
    version: "v0.3.5",
    badge: "Anterior",
    title: "Changelog Real no UpdateModal & CI Automatizada",
    items: [
      "Injeção do changelog real na tela 'Nova Versão Pronta' (UpdateModal) com suporte a Markdown.",
      "Identidade visual Nanquim & Washi aplicada ao fluxo de atualização do app.",
      "Geração automatizada de notas de lançamento na esteira de CI do GitHub Actions.",
    ],
  },
  {
    version: "v0.3.1",
    badge: "Anterior",
    title: "Correção na Exportação Word (.docx)",
    items: [
      "Correção do erro na exportação para Word (.docx) em ambientes WebView2/browser.",
      "Geração do documento via ArrayBuffer binário nativo para gravação estável.",
      "Apresentação detalhada da causa real de falha no modal em vez de mensagem genérica.",
    ],
  },
  {
    version: "v0.3.0",
    badge: "Anterior",
    title: "Identidade Nanquim, Tradução em Lote e Produtividade",
    items: [
      "Nova identidade visual autêntica inspirada em Nanquim & Pena G.",
      "Tradução em lote sequencial com monitor de progresso em tempo real.",
      "Glossário local persistente por projeto com armazenamento SQLite.",
      "Memória de curto prazo entre páginas consecutivas para coerência narrativa.",
      "Atalhos de alta velocidade no editor: M (mesclar balões) e S (trocar ordem).",
      "Cofre seguro de credenciais com isolamento de chaves no keyring do SO.",
      "Modelos atualizados: Gemini 3.8 Flash nativo, Claude Sonnet 5, GPT-6 Astra e Qwen 3.8.",
    ],
  },
  {
    version: "v0.2.0",
    badge: "Anterior",
    title: "Suporte amplo a modelos e APIs",
    items: [
      "OpenRouter com modo grátis automático e fallback seguro.",
      "LM Studio com detecção automática do modelo carregado.",
      "Groq como modo turbo para páginas leves.",
      "Thinking e tipos de balão agora podem ser ligados direto no editor.",
    ],
  },
  {
    version: "v0.1.3",
    badge: "Anterior",
    title: "Correções de segurança e release público",
    items: [
      "Ajustes de dependências sinalizadas pelo Dependabot.",
      "README, licença MIT e avisos de SmartScreen refinados.",
      "Fluxo de atualização automática preparado via GitHub Releases.",
    ],
  },
  {
    version: "v0.1.2",
    badge: "Base pública",
    title: "Apoio, roadmap e refinamentos",
    items: [
      "Ko-fi adicionado ao app e ao repositório.",
      "Roadmap público atualizado com pedidos da comunidade.",
      "Correções no fluxo de exportação e acabamento visual.",
    ],
  },
  {
    version: "v0.1.1",
    badge: "Beta",
    title: "Instalador e atualizações",
    items: [
      "Build Windows assinado para o updater do Tauri.",
      "Primeiro canal de atualização pelo GitHub Releases.",
      "Ajustes de branding, ícone e pacote de release.",
    ],
  },
];

const formatLastCheck = (value: string | null) => {
  if (!value) return "Ainda não verificado";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Ainda não verificado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const panelClass = "border-2 border-app-border bg-app-surface p-5 shadow-ink-sm relative";
const cardClass = "border-2 border-app-border bg-app-card p-4 shadow-ink-sm";
const labelClass = "font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70";
const inputClass = "w-full border-2 border-app-border bg-app-card px-4 py-2.5 font-mono text-xs text-app-text-primary outline-none transition-all placeholder:text-app-text-secondary/30 focus:border-app-accent focus:shadow-ink-sm";

const SectionTitle = ({ icon: Icon, label, title, description }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; title: string; description: string }) => (
  <div className="mb-6 flex items-start gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-sm">
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <div className={labelClass}>{label}</div>
      <h3 className="mt-1 font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight">{title}</h3>
      <p className="mt-1 max-w-3xl font-mono text-xs leading-relaxed text-app-text-secondary/80">{description}</p>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-app-border py-2.5 last:border-b-0">
    <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">{label}</span>
    <span className="text-right font-mono text-xs font-bold text-app-text-primary">{value}</span>
  </div>
);

const ToggleButton = ({
  active,
  title,
  description,
  icon: Icon,
  onClick,
  accentClass: _accentClass,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  accentClass?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "border-2 p-5 text-left transition-all relative overflow-hidden group",
      active
        ? "border-app-text-primary bg-app-card shadow-ink"
        : "border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent hover:bg-app-card hover:text-app-text-primary shadow-ink-sm"
    )}
  >
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className={cx(
        "flex h-9 w-9 items-center justify-center border-2 transition-colors",
        active ? "border-app-text-primary bg-app-accent text-white" : "border-app-border bg-app-card text-app-text-secondary"
      )}>
        <Icon size={18} />
      </div>
      <span className={cx(
        "border px-2 py-0.5 font-pixel text-[9px] font-black uppercase tracking-wider",
        active ? "border-app-text-primary bg-app-accent text-white" : "border-app-border bg-app-card text-app-text-secondary/60"
      )}>
        {active ? "ATIVO" : "OPCIONAL"}
      </span>
    </div>
    <h4 className="font-display text-lg uppercase tracking-wide text-app-text-primary">{title}</h4>
    <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">{description}</p>
  </button>
);

const EngineCard = ({
  active,
  icon,
  title,
  badge,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  tone?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "border-2 p-4 text-left transition-all relative group",
      active
        ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
        : "border-app-border bg-app-surface hover:border-app-accent hover:bg-app-card hover:shadow-ink-sm"
    )}
  >
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="flex h-9 w-9 items-center justify-center border-2 border-app-border bg-app-card p-1.5 text-app-text-primary group-hover:border-app-accent transition-colors">
        {icon}
      </div>
      <span className={cx(
        "border px-2 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider",
        active ? "border-app-accent bg-app-accent/10 text-app-accent" : "border-app-border text-app-text-secondary/60"
      )}>
        {badge}
      </span>
    </div>
    <h5 className="font-display text-base uppercase tracking-wide text-app-text-primary">{title}</h5>
    <p className="mt-1 font-mono text-[11px] leading-relaxed text-app-text-secondary/80">{description}</p>
  </button>
);
const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  appVersion,
  availableUpdate,
  isCheckingUpdates,
  isInstallingUpdate,
  updateProgressPercent,
  updateStatusMessage,
  lastUpdateCheck,
  updateError,
  onCheckForUpdates,
  onInstallUpdate,
}) => {
  const {
    apiKey,
    setApiKey,
    openRouterApiKey,
    setOpenRouterApiKey,
    groqApiKey,
    setGroqApiKey,
    customApiKey,
    setCustomApiKey,
    translationEngine,
    setTranslationEngine,
    geminiModel,
    setGeminiModel,
    ollamaModel,
    setOllamaModel,
    openAiCompatibleProvider,
    setOpenAiCompatibleProvider,
    openAiCompatibleModel,
    setOpenAiCompatibleModel,
    openRouterModelMode,
    setOpenRouterModelMode,
    aiThinkingEnabled,
    setAiThinkingEnabled,
    aiInferBlockTypesEnabled,
    setAiInferBlockTypesEnabled,
    aiSecondPassEnabled,
    setAiSecondPassEnabled,
    resetOnboarding,
    clearStore,
  } = useMangaStore();

  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("ai");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isRefreshingOpenRouterModels, setIsRefreshingOpenRouterModels] = useState(false);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; description: string; type: StatusType }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const selectedOllamaModel = getOllamaModelOption(ollamaModel);
  const selectedOpenAiProvider = getOpenAiCompatibleProvider(openAiCompatibleProvider);
  const selectedOpenAiModel = getOpenAiCompatibleModel(openAiCompatibleProvider, openAiCompatibleModel);

  const activeEngineLabel = useMemo(() => {
    if (translationEngine === "gemini") return "Google Gemini";
    if (translationEngine === "ollama") return "Ollama Local";
    return selectedOpenAiProvider.label;
  }, [selectedOpenAiProvider.label, translationEngine]);

  const handleOpenAiProviderSelect = (providerId: OpenAiCompatibleProviderId) => {
    setOpenAiCompatibleProvider(providerId);
    setOpenAiCompatibleModel(getDefaultOpenAiCompatibleModelForProvider(providerId));
    setOpenRouterModelMode(providerId === "openrouter" ? "auto-free" : "manual");
    setTranslationEngine("openaiCompatible");
  };

  const handleRefreshOpenRouterFreeModels = async () => {
    setIsRefreshingOpenRouterModels(true);
    try {
      clearOpenRouterFreeModelsCache();
      const models = await getOpenRouterFreeVisionModels(openRouterApiKey, true);
      setStatusModal({ isOpen: true, title: "Lista atualizada", description: `Encontramos ${models.length} modelo(s) grátis com vision no OpenRouter.`, type: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar a lista agora.";
      setStatusModal({ isOpen: true, title: "Falha ao atualizar", description: message, type: "error" });
    } finally {
      setIsRefreshingOpenRouterModels(false);
    }
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    setStatusModal({ isOpen: true, title: "Tutorial reativado", description: "As dicas iniciais vão aparecer novamente no painel.", type: "success" });
  };

  const handleWipeAll = async () => {
    try {
      await dbService.wipeAllData();
      clearStore();
      setConfirmWipe(false);
      setStatusModal({ isOpen: true, title: "Dados apagados", description: "Histórico, cache de imagens e configurações foram removidos deste computador.", type: "success" });
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
      setStatusModal({ isOpen: true, title: "Não foi possível limpar agora", description: "Tente novamente em alguns instantes.", type: "error" });
    }
  };

  const openExternalUrl = async (url: string) => {
    try {
      await openUrl(url);
    } catch (error) {
      console.error("Erro ao abrir link externo:", error);
      setStatusModal({ isOpen: true, title: "Não foi possível abrir o link", description: "Tente novamente em alguns instantes.", type: "error" });
    }
  };

  const renderGeminiSettings = () => (
    <div className="space-y-4">
      <label className="block">
        <span className={labelClass}>Gemini API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Cole sua chave do Google AI Studio"
          className={cx(inputClass, "mt-2")}
        />
        <p className="mt-2 font-mono text-[10px] text-app-text-secondary/70">
          A chave é armazenada de forma segura no cofre do sistema operacional (Keyring).
        </p>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {GEMINI_MODEL_OPTIONS.map((model) => {
          const isSelected = geminiModel === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => { setGeminiModel(model.id); setTranslationEngine("gemini"); }}
              className={cx(
                "border-2 p-4 text-left transition-all relative group",
                isSelected
                  ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                  : "border-app-border bg-app-surface hover:border-app-accent hover:bg-app-card hover:shadow-ink-sm"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <GeminiLogo className="h-4 w-4 flex-shrink-0" />
                  <span className="font-display text-sm uppercase tracking-wide text-app-text-primary truncate">{model.label}</span>
                </div>
                <span className="border border-app-border px-1.5 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider text-app-text-secondary/70 flex-shrink-0">
                  {getGeminiAccessLabel(model.access)}
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80">{model.description}</p>
              <div className="mt-3 font-pixel text-[9px] uppercase tracking-wider text-app-accent">
                {getGeminiFamilyLabel(model.family)} {isSelected ? "✓ Selecionado" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderOllamaSettings = () => (
    <div className="space-y-4">
      <div className={cardClass}>
        <InfoRow label="Modelo atual" value={selectedOllamaModel.label} />
        <InfoRow label="Perfil" value={getOllamaProfileLabel(selectedOllamaModel.profile)} />
        <InfoRow label="Tamanho" value={selectedOllamaModel.sizeLabel} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {OLLAMA_MODEL_OPTIONS.map((model) => {
          const isSelected = ollamaModel === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => { setOllamaModel(model.id); setTranslationEngine("ollama"); }}
              className={cx(
                "border-2 p-4 text-left transition-all relative group",
                isSelected
                  ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                  : "border-app-border bg-app-surface hover:border-app-accent hover:bg-app-card hover:shadow-ink-sm"
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <OllamaLogo className="h-4 w-4 flex-shrink-0 text-app-text-primary" />
                  <span className="font-display text-sm uppercase tracking-wide text-app-text-primary truncate">{model.label}</span>
                </div>
                <span className="border border-app-border px-1.5 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider text-app-text-secondary/70 flex-shrink-0">{model.sizeLabel}</span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80">{model.description}</p>
              <code className="mt-3 block border border-app-border bg-app-card px-2.5 py-1.5 font-pixel text-[10px] text-app-text-primary/90 select-all">{model.installCommand}</code>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderOpenAiCompatibleSettings = () => (
    <div className="space-y-4">
      {selectedOpenAiProvider.requiresApiKey ? (
        <label className="block">
          <span className={labelClass}>{selectedOpenAiProvider.apiKeyLabel}</span>
          <input
            type="password"
            value={
              selectedOpenAiProvider.id === "openrouter" ? openRouterApiKey :
              selectedOpenAiProvider.id === "groq" ? groqApiKey :
              customApiKey
            }
            onChange={(event) => {
              const val = event.target.value;
              if (selectedOpenAiProvider.id === "openrouter") setOpenRouterApiKey(val);
              else if (selectedOpenAiProvider.id === "groq") setGroqApiKey(val);
              else setCustomApiKey(val);
            }}
            placeholder={selectedOpenAiProvider.apiKeyLabel}
            className={cx(inputClass, "mt-2")}
          />
        </label>
      ) : (
        <div className={cardClass}>
          <div className="mb-2 flex items-center gap-2 text-app-text-primary"><ShieldCheck size={16} className="text-emerald-500" /><span className="font-display text-sm uppercase tracking-wide">Servidor local</span></div>
          <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80">Deixe o LM Studio aberto em <span className="font-bold text-app-text-primary">localhost:1234</span>. O app tenta detectar o modelo carregado automaticamente.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {selectedOpenAiProvider.models.map((model) => {
          const isSelected = openAiCompatibleModel === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                setOpenAiCompatibleModel(model.id);
                setOpenRouterModelMode(selectedOpenAiProvider.id === "openrouter" && model.id === OPENROUTER_AUTO_FREE_MODEL_ID ? "auto-free" : "manual");
                setTranslationEngine("openaiCompatible");
              }}
              className={cx(
                "border-2 p-4 text-left transition-all relative group",
                isSelected
                  ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
                  : "border-app-border bg-app-surface hover:border-app-accent hover:bg-app-card hover:shadow-ink-sm"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getProviderLogo(selectedOpenAiProvider.id, "h-4 w-4 flex-shrink-0 text-app-accent")}
                  <span className="font-display text-sm uppercase tracking-wide text-app-text-primary truncate">{model.label}</span>
                </div>
                {model.recommended && (
                  <span className="border border-emerald-600/40 bg-emerald-600/10 px-1.5 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider text-emerald-500 flex-shrink-0">
                    Sugestão
                  </span>
                )}
              </div>
              <p className="font-mono text-xs leading-relaxed text-app-text-secondary/80">{model.description}</p>
              <p className="mt-3 break-all font-pixel text-[10px] uppercase tracking-wider text-app-accent">{model.id === OPENROUTER_AUTO_FREE_MODEL_ID ? "Fila grátis / vision" : model.id}</p>
            </button>
          );
        })}
      </div>

      {selectedOpenAiProvider.id === "openrouter" && (
        <div className="border-2 border-dashed border-amber-500/40 bg-amber-500/10 p-3.5 font-mono text-xs leading-relaxed text-app-text-primary shadow-ink-sm">
          <span className="font-pixel font-bold uppercase tracking-widest text-amber-500">Aviso rápido:</span>{" "}
          no modo grátis, a qualidade depende do modelo disponível no momento. O app tenta corrigir respostas
          duplicadas ou mal formatadas, mas alguns modelos podem só transcrever em vez de traduzir.
        </div>
      )}

      <div className="border-2 border-app-border bg-app-surface p-4 shadow-ink-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><div className={labelClass}>Avançado</div><p className="mt-1 font-mono text-xs text-app-text-secondary/80">Use apenas se você já souber o ID exato do modelo.</p></div>
          <button type="button" onClick={() => { void openExternalUrl(selectedOpenAiProvider.docsUrl); }} className="btn border-2 border-app-border bg-app-card px-3 py-1 font-display text-[10px] uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm flex items-center gap-1.5">Docs <ExternalLink size={12} /></button>
        </div>
        <input type="text" value={selectedOpenAiProvider.id === "openrouter" && openRouterModelMode === "auto-free" ? "" : openAiCompatibleModel} onChange={(event) => { setOpenAiCompatibleModel(event.target.value); setOpenRouterModelMode("manual"); setTranslationEngine("openaiCompatible"); }} placeholder={selectedOpenAiProvider.id === "openrouter" ? "Cole um ID manual, ex: google/gemini-2.5-flash" : selectedOpenAiModel.id} className={inputClass} />
        {selectedOpenAiProvider.id === "openrouter" && (
          <button type="button" onClick={handleRefreshOpenRouterFreeModels} disabled={isRefreshingOpenRouterModels} className="btn primary border-2 border-app-text-primary bg-emerald-600 px-4 py-2.5 font-black text-xs uppercase tracking-wider text-white shadow-ink transition-all hover:bg-emerald-500 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover w-full mt-3 flex items-center justify-center gap-2">
            <RefreshCw className={cx("h-4 w-4", isRefreshingOpenRouterModels && "animate-spin")} /> Atualizar lista grátis
          </button>
        )}
      </div>
    </div>
  );
  const renderAiSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={InkWellIcon} label="Motores de tradução" title="Escolha como a IA trabalha" description="Selecione entre nuvem, APIs flexíveis e modelos locais. O modo recomendado continua simples, mas quem quiser ajustar tem espaço para isso." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><div className={labelClass}>Motor ativo</div><h4 className="mt-1 font-display text-2xl uppercase tracking-wide text-app-text-primary">{activeEngineLabel}</h4></div>
            <span className="border-2 border-emerald-600/40 bg-emerald-600/10 px-2.5 py-1 font-pixel text-[9px] font-black uppercase tracking-wider text-emerald-500">Pronto para AI Draft</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <EngineCard
              active={translationEngine === "gemini"}
              icon={<GeminiLogo className="h-5 w-5" />}
              title="Google Gemini"
              badge="Confiável"
              description="Melhor escolha para qualidade consistente e pouco atrito no dia a dia."
              onClick={() => setTranslationEngine("gemini")}
            />
            {OPENAI_COMPATIBLE_PROVIDERS.map((provider) => {
              const isSelected = translationEngine === "openaiCompatible" && selectedOpenAiProvider.id === provider.id;
              const logo = provider.id === "groq" ? (
                <GroqLogo className="h-5 w-5 text-[#F55036]" />
              ) : provider.id === "lmstudio" ? (
                <LMStudioLogo className="h-5 w-5 text-[#A855F7]" />
              ) : (
                <OpenRouterLogo className="h-5 w-5 text-app-accent" />
              );
              const chip = provider.id === "groq" ? "Turbo" : provider.id === "lmstudio" ? "Local" : "Flexível";
              return (
                <EngineCard
                  key={provider.id}
                  active={isSelected}
                  icon={logo}
                  title={provider.label}
                  badge={chip}
                  description={provider.description}
                  onClick={() => handleOpenAiProviderSelect(provider.id)}
                />
              );
            })}
            <EngineCard
              active={translationEngine === "ollama"}
              icon={<OllamaLogo className="h-5 w-5 text-app-text-primary" />}
              title="Ollama Local"
              badge="Experimental"
              description="Opção local simples para quem já usa Ollama, mas pode ser lenta em CPU."
              onClick={() => setTranslationEngine("ollama")}
            />
          </div>
        </div>
        <div className={panelClass}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><div className={labelClass}>Configuração do motor</div><h4 className="mt-1 font-display text-2xl uppercase tracking-wide text-app-text-primary">{activeEngineLabel}</h4></div>
            <button type="button" onClick={() => setActiveSection("editor")} className="flex items-center gap-1 font-pixel text-[9px] font-black uppercase tracking-wider text-app-text-secondary hover:text-app-text-primary">Ajustes do draft <ChevronRight size={12} /></button>
          </div>
          {translationEngine === "gemini" && renderGeminiSettings()}
          {translationEngine === "ollama" && renderOllamaSettings()}
          {translationEngine === "openaiCompatible" && renderOpenAiCompatibleSettings()}
        </div>
      </div>
    </section>
  );

  const renderEditorSection = () => (
    <section className="space-y-6">
      <SectionTitle
        icon={GPenIcon}
        label="Persona & AI Draft"
        title="Perfil de Tradução & Comportamento"
        description="Ajuste a persona editorial, o preset cultural de idioma (Mangá JP, Manhwa KR, Manhua CN), o tom de voz e as diretrizes exclusivas do System Prompt da IA."
      />

      <div className={panelClass}>
        <TranslationProfilePanel />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ToggleButton
          active={aiThinkingEnabled}
          title="Thinking mais cuidadoso"
          description="Ajuda modelos locais/reasoning a não só transcrever o inglês, mas pode aumentar bastante o tempo de resposta."
          icon={Brain}
          onClick={() => setAiThinkingEnabled(!aiThinkingEnabled)}
        />
        <ToggleButton
          active={aiInferBlockTypesEnabled}
          title="Detectar tipos de balão"
          description="Quando ligado, a IA tenta classificar narração, pensamento, texto fora de balão e balão duplo. Se o modelo errar, deixe desligado."
          icon={Tags}
          onClick={() => setAiInferBlockTypesEnabled(!aiInferBlockTypesEnabled)}
        />
        <ToggleButton
          active={aiSecondPassEnabled}
          title="Segunda Passada (Naturalidade)"
          description="Refinamento adicional somente-texto focado em ritmo, gírias e diálogos orgânicos em PT-BR. Consome mais tokens da API."
          icon={DialoguePolishIcon}
          onClick={() => setAiSecondPassEnabled(!aiSecondPassEnabled)}
        />
      </div>

      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-2 text-app-text-primary">
          <Info size={16} className="text-app-accent" />
          <h4 className="font-display text-sm uppercase tracking-wider">Sugestão prática de produção</h4>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className={cardClass}>
            <div className={labelClass}>Uso diário</div>
            <p className="mt-1 font-display text-sm uppercase tracking-wide text-app-text-primary">Thinking desligado</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">Mais rápido para Gemini, Groq e páginas simples.</p>
          </div>
          <div className={cardClass}>
            <div className={labelClass}>Modelos locais</div>
            <p className="mt-1 font-display text-sm uppercase tracking-wide text-app-text-primary">Thinking ligado</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">Pode melhorar LM Studio, especialmente em modelos menores.</p>
          </div>
          <div className={cardClass}>
            <div className={labelClass}>Tipos</div>
            <p className="mt-1 font-display text-sm uppercase tracking-wide text-app-text-primary">Opcional</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">Se a classificação vier ruim, usar tudo como bloco neutro é melhor.</p>
          </div>
        </div>
      </div>
    </section>
  );
  const renderAppearanceSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Palette} label="Identidade Visual" title="Aparência do Aplicativo" description="Alterne entre o Nanquim Profundo e o Papel Washi Cru tradicional. Ambos os estilos preservam a autenticidade editorial de mangá e descartam minimalismo genérico." />
      <div className="grid gap-4 md:grid-cols-2">
        {/* Dark Organic / Nanquim */}
        <button
          type="button"
          onClick={() => setTheme("dark-organic")}
          className={cx(
            "border-2 p-6 text-left transition-all relative overflow-hidden group",
            theme === "dark-organic"
              ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
              : "border-app-border bg-app-surface hover:border-app-accent shadow-ink-sm"
          )}
        >
          <div className="mb-6 h-24 border-2 border-app-border bg-[#0B0C10] p-4 relative overflow-hidden flex items-center justify-between">
            <div className="halftone absolute inset-0 opacity-40 pointer-events-none" />
            <div className="z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-white bg-app-accent text-white font-brush text-2xl font-black shadow-ink-sm">
                墨
              </div>
              <div>
                <span className="block font-display text-lg uppercase tracking-wider text-white">Nanquim Profundo</span>
                <span className="block font-pixel text-[9px] uppercase tracking-widest text-white/60">DARK ORGANIC // 執筆</span>
              </div>
            </div>
          </div>
          <h4 className="font-display text-xl uppercase tracking-wider text-app-text-primary">Dark Organic (Nanquim)</h4>
          <p className="mt-2 font-mono text-xs leading-relaxed text-app-text-secondary/80">
            Mesa de mangaká noturna: nanquim preto puro, retículas halftones profundas e acentos em vermelhão Hanko. Ideal para concentração em sessões prolongadas de tradução.
          </p>
          {theme === "dark-organic" && (
            <div className="mt-4 inline-block border-2 border-app-text-primary bg-app-accent px-3 py-1 font-pixel text-[9px] font-black uppercase tracking-widest text-white shadow-ink-sm">
              [済] TEMA EM USO
            </div>
          )}
        </button>

        {/* Paper Light / Washi Cru */}
        <button
          type="button"
          onClick={() => setTheme("paper-light")}
          className={cx(
            "border-2 p-6 text-left transition-all relative overflow-hidden group",
            theme === "paper-light"
              ? "border-app-text-primary bg-app-card shadow-ink -translate-x-0.5 -translate-y-0.5"
              : "border-app-border bg-app-surface hover:border-app-accent shadow-ink-sm"
          )}
        >
          <div className="mb-6 h-24 border-2 border-stone-400 bg-[#F3EFE3] p-4 relative overflow-hidden flex items-center justify-between text-stone-900">
            <div className="halftone-paper absolute inset-0 opacity-40 pointer-events-none" />
            <div className="z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-stone-900 bg-stone-900 text-[#F3EFE3] font-brush text-2xl font-black shadow-ink-sm">
                和
              </div>
              <div>
                <span className="block font-display text-lg uppercase tracking-wider text-stone-900">Papel Washi Cru</span>
                <span className="block font-pixel text-[9px] uppercase tracking-widest text-stone-700">PAPER LIGHT // 和紙</span>
              </div>
            </div>
          </div>
          <h4 className="font-display text-xl uppercase tracking-wider text-app-text-primary">Paper Light (Washi Cru)</h4>
          <p className="mt-2 font-mono text-xs leading-relaxed text-app-text-secondary/80">
            Manuscrito impresso: textura de papel artesanal washi marfim com traços de nanquim preto de alto contraste. Perfeito para ambientes claros com estética editorial clássica.
          </p>
          {theme === "paper-light" && (
            <div className="mt-4 inline-block border-2 border-app-text-primary bg-app-accent px-3 py-1 font-pixel text-[9px] font-black uppercase tracking-widest text-white shadow-ink-sm">
              [済] TEMA EM USO
            </div>
          )}
        </button>
      </div>
    </section>
  );

  const renderDataSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Database} label="Privacidade local" title="Dados deste computador" description="O MangAI salva configurações, chaves e projetos localmente para você não precisar configurar tudo de novo a cada abertura." />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className={panelClass}>
          <div className="mb-4 flex items-center gap-2 text-app-text-primary"><ShieldCheck size={18} className="text-emerald-500" /><h4 className="font-display text-lg uppercase tracking-wider">O que fica salvo?</h4></div>
          <div className="border-2 border-app-border bg-app-card px-4 py-2 shadow-ink-sm">
            <InfoRow label="Gemini key" value={apiKey ? "Cofre do SO (Keyring)" : "Não configurada"} />
            <InfoRow label="OpenRouter key" value={openRouterApiKey ? "Cofre do SO (Keyring)" : "Não configurada"} />
            <InfoRow label="Groq key" value={groqApiKey ? "Cofre do SO (Keyring)" : "Não configurada"} />
            <InfoRow label="Projetos & Capítulos" value="SQLite Local" />
            <InfoRow label="Glossário" value="SQLite Local" />
          </div>
          <p className="mt-4 font-mono text-xs leading-relaxed text-app-text-secondary/70">O app armazena suas chaves no gerenciador de credenciais do sistema operacional (Windows Credential Manager / macOS Keychain). As chamadas são feitas diretamente para o provedor configurado.</p>
        </div>
        <div className="space-y-4">
          <div className={panelClass}>
            <h4 className="font-display text-lg uppercase tracking-wider text-app-text-primary">Tutorial Inicial</h4>
            <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">Reative o guia passo a passo da mesa de trabalho caso deseje rever o fluxo do app.</p>
            <button
              type="button"
              onClick={handleResetOnboarding}
              className="btn border-2 border-app-border bg-app-card py-2.5 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all w-full mt-4 flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} /> Mostrar Tutorial
            </button>
          </div>
          <div className="border-2 border-rose-600/40 bg-rose-500/10 p-5 shadow-ink-sm">
            <h4 className="font-display text-lg uppercase tracking-wider text-rose-500">Limpar Todos os Dados</h4>
            <p className="mt-1 font-mono text-xs leading-relaxed text-app-text-secondary/80">Remove permanentemente histórico, cache de imagens, projetos salvos e chaves deste computador.</p>
            <button
              type="button"
              onClick={() => setConfirmWipe(true)}
              className="btn border-2 border-rose-700 bg-rose-600 py-2.5 font-black text-xs uppercase tracking-wider text-white hover:bg-rose-700 shadow-ink transition-all w-full mt-4 flex items-center justify-center gap-2"
            >
              <Trash2 size={15} /> Apagar Dados Deste App
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderUpdatesSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={RefreshCw} label="Distribuição" title="Atualizações e Changelog" description="Confira a versão instalada, procure novidades pelo GitHub Releases e veja as melhorias acumuladas no ciclo." />
      <div className="grid gap-4 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        <div className={panelClass}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className={labelClass}>Versão instalada</div>
              <h4 className="mt-1 font-display text-2xl uppercase tracking-wider text-app-text-primary">MangAI {appVersion}</h4>
            </div>
            {availableUpdate ? (
              <span className="border-2 border-amber-600 bg-amber-500 text-black px-2.5 py-1 font-pixel text-[9px] font-black uppercase tracking-wider shadow-ink-sm">
                NOVA {availableUpdate.version}
              </span>
            ) : (
              <span className="border border-app-border bg-app-card px-2.5 py-1 font-pixel text-[9px] font-black uppercase tracking-wider text-app-text-secondary/70">
                SEM UPDATE PENDENTE
              </span>
            )}
          </div>
          <div className="border-2 border-app-border bg-app-card px-4 py-2 shadow-ink-sm">
            <InfoRow label="Última verificação" value={formatLastCheck(lastUpdateCheck)} />
            <InfoRow label="Canal" value="GitHub Releases (Oficial)" />
          </div>
          {(updateStatusMessage || updateError) && (
            <p className="mt-4 border border-dashed border-app-border bg-app-card p-3 font-mono text-xs leading-relaxed text-app-text-secondary">
              {updateError || updateStatusMessage}
            </p>
          )}
          {isInstallingUpdate && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-app-text-secondary">
                <span>PROGRESSO DO DOWNLOAD</span>
                <span className="font-bold text-amber-500">{updateProgressPercent ?? 0}%</span>
              </div>
              <div className="h-3 overflow-hidden border-2 border-app-border bg-app-card">
                <div
                  className="bar-stripes h-full bg-gradient-to-r from-amber-500 to-app-accent transition-all duration-300"
                  style={{ width: `${updateProgressPercent ?? 0}%` }}
                />
              </div>
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              onClick={() => { void onCheckForUpdates(); }}
              disabled={isCheckingUpdates || isInstallingUpdate}
              className="btn border-2 border-app-border bg-app-card py-2.5 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={cx("h-4 w-4", isCheckingUpdates && "animate-spin")} />
              {isCheckingUpdates ? "Verificando..." : "Verificar agora"}
            </button>
            <button
              type="button"
              onClick={() => { void onInstallUpdate(); }}
              disabled={!availableUpdate || isInstallingUpdate || isCheckingUpdates}
              className="btn primary border-2 border-app-text-primary bg-amber-500 py-2.5 font-black text-xs uppercase tracking-wider text-black shadow-ink transition-all hover:bg-amber-400 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInstallingUpdate ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Instalando...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{availableUpdate ? `Instalar ${availableUpdate.version}` : "Nenhum update agora"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Painel de Changelog */}
        <div className={panelClass}>
          <div className="mb-4 flex items-center gap-2 text-app-text-primary">
            <History size={18} className="text-app-accent" />
            <h4 className="font-display text-lg uppercase tracking-wider">Histórico de Lançamentos</h4>
          </div>
          <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
            {CHANGELOG_ITEMS.map((entry) => (
              <article key={entry.version} className="border-2 border-app-border bg-app-card p-4 shadow-ink-sm">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-app-border pb-2">
                  <div>
                    <div className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-accent">{entry.version}</div>
                    <h5 className="font-display text-base uppercase tracking-wide text-app-text-primary mt-0.5">{entry.title}</h5>
                  </div>
                  <span className="border border-app-border bg-app-surface px-2 py-0.5 font-pixel text-[8px] font-black uppercase tracking-wider text-app-text-secondary/80">
                    {entry.badge}
                  </span>
                </div>
                <ul className="space-y-1.5 font-mono text-xs leading-relaxed text-app-text-secondary/80">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">✒</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderAboutSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Info} label="Projeto Aberto" title="MangAI Translator" description="Aplicativo desktop para localização assistida de mangás, manwhas e quadrinhos, criado para acelerar o rascunho sem abrir mão do controle artesanal e da diagramação humana." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelClass}>
          <h4 className="font-display text-xl uppercase tracking-wider text-app-text-primary">Desenvolvimento Ativo</h4>
          <p className="mt-2 font-mono text-xs leading-relaxed text-app-text-secondary/80">O app é desenvolvido de forma aberta e contínua com feedback dos scanlators. Sugestões, dúvidas e correções são muito bem-vindas no GitHub.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { void openExternalUrl(GITHUB_URL); }}
              className="btn border-2 border-app-border bg-app-card py-2.5 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all flex items-center justify-center gap-2"
            >
              <Github size={16} /> GitHub
            </button>
            <button
              type="button"
              onClick={() => { void openExternalUrl(SUPPORT_URL); }}
              className="btn primary border-2 border-app-text-primary bg-[#FF5E5B] py-2.5 font-black text-xs uppercase tracking-wider text-white shadow-ink transition-all hover:bg-[#ff7b78] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover flex items-center justify-center gap-2"
            >
              <Heart size={16} /> Apoiar no Ko-fi
            </button>
          </div>
        </div>
        <div className={panelClass}>
          <h4 className="font-display text-xl uppercase tracking-wider text-app-text-primary">Ficha Editorial</h4>
          <div className="mt-3 border-2 border-app-border bg-app-card px-4 py-2 shadow-ink-sm">
            <InfoRow label="Versão" value={appVersion} />
            <InfoRow label="Licença" value="MIT (Código Aberto)" />
            <InfoRow label="Canal de Entrega" value="GitHub Releases" />
            <InfoRow label="Comunidade" value="Scanlators & Criadores" />
          </div>
        </div>
      </div>
    </section>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "ai": return renderAiSection();
      case "editor": return renderEditorSection();
      case "appearance": return renderAppearanceSection();
      case "data": return renderDataSection();
      case "updates": return renderUpdatesSection();
      case "about": return renderAboutSection();
      default: return renderAiSection();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-2 border-app-border bg-app-card text-app-text-primary p-6 shadow-ink-lg relative">
      {/* Cantoneiras Tonbo de Corte Editorial */}
      <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
      <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
      <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
      <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

      {/* Retícula sutil */}
      <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 z-10 relative">
        <div className="flex min-w-0 items-center gap-3.5">
          {/* Selo Hanko Editorial [設] */}
          <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-app-accent text-white shadow-ink-sm -rotate-2 select-none">
            <span className="font-brush text-2xl font-black leading-none">設</span>
          </div>
          <div className="min-w-0">
            <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
              PAINEL DE CONTROLE // SYSTEM CONFIG
            </span>
            <h2 className="font-display text-3xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
              Configurações Editoriais
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn border-2 border-app-border bg-app-surface px-4 py-2 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all"
        >
          Voltar para o Painel
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:grid-rows-none z-10 relative">
        <aside className="custom-scrollbar flex gap-2 overflow-x-auto border-2 border-app-border bg-app-surface p-3 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden shadow-ink-sm">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cx(
                  "flex min-w-[150px] items-center gap-3 border-2 px-3.5 py-3 text-left transition-all lg:min-w-0 shadow-ink-sm",
                  isActive
                    ? "border-app-text-primary bg-app-accent text-white shadow-ink -translate-x-0.5 -translate-y-0.5"
                    : "border-app-border bg-app-card text-app-text-secondary hover:border-app-accent hover:text-app-text-primary"
                )}
              >
                <div className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center border font-brush text-sm font-black",
                  isActive ? "border-white bg-black/20 text-white" : "border-app-border bg-app-surface text-app-text-primary"
                )}>
                  {section.hanko}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-sm uppercase tracking-wider truncate">{section.label}</span>
                  <span className={cx(
                    "block font-pixel text-[8px] uppercase tracking-widest",
                    isActive ? "text-white/80" : "text-app-text-secondary/60"
                  )}>
                    {section.kicker}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>
        <main className="custom-scrollbar min-h-0 overflow-y-auto border-2 border-app-border bg-app-surface/60 p-6 shadow-ink-sm">
          {renderActiveSection()}
        </main>
      </div>

      <ConfirmModal isOpen={confirmWipe} onClose={() => setConfirmWipe(false)} onConfirm={() => { void handleWipeAll(); }} title="Apagar dados do app?" description="Esta ação não pode ser desfeita. Suas traduções salvas localmente, imagens em cache e chaves de API serão removidas deste computador." confirmText="Sim, apagar dados" variant="destructive" />
      <StatusModal isOpen={statusModal.isOpen} onClose={() => setStatusModal({ ...statusModal, isOpen: false })} title={statusModal.title} description={statusModal.description} type={statusModal.type} />
    </div>
  );
};

export default SettingsView;
