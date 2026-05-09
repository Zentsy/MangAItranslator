import React, { useMemo, useState, type ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  GEMINI_MODEL_OPTIONS,
  getGeminiAccessLabel,
  getGeminiFamilyLabel,
  getGeminiModelOption,
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
import { useMangaStore, type TranslationEngine } from "@/store/useMangaStore";
import { useTheme } from "@/contexts/ThemeContext";
import { dbService } from "@/services/dbService";
import {
  clearOpenRouterFreeModelsCache,
  getOpenRouterFreeVisionModels,
} from "@/services/openAiCompatibleService";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  Tags,
  Trash2,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import StatusModal, { StatusType } from "@/components/StatusModal";

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

const SETTINGS_SECTIONS: Array<{ id: SettingsSectionId; label: string; kicker: string; icon: LucideIcon }> = [
  { id: "ai", label: "IA", kicker: "motores", icon: Sparkles },
  { id: "editor", label: "Editor", kicker: "draft", icon: Wand2 },
  { id: "appearance", label: "Aparência", kicker: "tema", icon: Palette },
  { id: "data", label: "Dados", kicker: "local", icon: Database },
  { id: "updates", label: "Atualizações", kicker: "release", icon: RefreshCw },
  { id: "about", label: "Sobre", kicker: "projeto", icon: Info },
];

const CHANGELOG_ITEMS = [
  {
    version: "v0.2.0",
    badge: "Novo",
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
const panelClass = "rounded-[2rem] border border-app-border bg-app-surface/25 p-5 shadow-black/10";
const cardClass = "rounded-3xl border border-app-border bg-app-bg/25 p-5";
const labelClass = "text-[10px] font-black uppercase tracking-[0.22em] text-app-text-secondary/50";
const inputClass = "w-full rounded-2xl border border-app-border bg-app-surface/50 px-4 py-3 text-xs font-mono text-app-text-primary outline-none placeholder:text-app-text-secondary/30 focus:border-app-accent/40";

const SectionTitle = ({ icon: Icon, label, title, description }: { icon: LucideIcon; label: string; title: string; description: string }) => (
  <div className="mb-6 flex items-start gap-4">
    <div className="rounded-2xl border border-app-border bg-app-surface/50 p-3 text-app-text-secondary">
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <div className={labelClass}>{label}</div>
      <h3 className="mt-2 text-2xl font-black uppercase italic tracking-tighter text-app-text-primary">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-app-text-secondary/70">{description}</p>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-app-border/60 py-3 last:border-b-0">
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">{label}</span>
    <span className="text-right text-xs font-bold text-app-text-primary">{value}</span>
  </div>
);

const ToggleButton = ({
  active,
  title,
  description,
  icon: Icon,
  onClick,
  accentClass,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  accentClass: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "rounded-3xl border p-5 text-left transition-all",
      active ? accentClass : "border-app-border bg-app-bg/25 text-app-text-secondary hover:bg-app-surface/50 hover:text-app-text-primary"
    )}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="rounded-2xl border border-current/20 bg-current/10 p-3"><Icon size={18} /></div>
      <span className="rounded-full border border-current/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em]">{active ? "Ativo" : "Opcional"}</span>
    </div>
    <h4 className="text-base font-black italic text-app-text-primary">{title}</h4>
    <p className="mt-2 text-xs leading-relaxed text-app-text-secondary/70">{description}</p>
  </button>
);

const EngineCard = ({
  active,
  icon: Icon,
  title,
  badge,
  description,
  tone,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  title: string;
  badge: string;
  description: string;
  tone: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cx("rounded-3xl border p-5 text-left transition-all", active ? tone : "border-app-border bg-app-bg/25 hover:bg-app-surface/50")}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <Icon size={22} />
      <span className="rounded-full border border-app-border px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-app-text-secondary">{badge}</span>
    </div>
    <h5 className="font-black italic text-app-text-primary">{title}</h5>
    <p className="mt-2 text-xs leading-relaxed text-app-text-secondary/70">{description}</p>
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
    translationEngine,
    setTranslationEngine,
    geminiModel,
    setGeminiModel,
    ollamaModel,
    setOllamaModel,
    openAiCompatibleProvider,
    setOpenAiCompatibleProvider,
    openAiCompatibleApiKey,
    setOpenAiCompatibleApiKey,
    openAiCompatibleModel,
    setOpenAiCompatibleModel,
    openRouterModelMode,
    setOpenRouterModelMode,
    aiThinkingEnabled,
    setAiThinkingEnabled,
    aiInferBlockTypesEnabled,
    setAiInferBlockTypesEnabled,
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

  const selectedGeminiModel = getGeminiModelOption(geminiModel);
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
      const models = await getOpenRouterFreeVisionModels(openAiCompatibleApiKey, true);
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
        <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Cole sua chave do Google AI Studio" className={cx(inputClass, "mt-2")} />
        <p className="mt-2 text-xs leading-relaxed text-app-text-secondary/60">A chave fica salva neste computador e o app fala direto com a API do Google.</p>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {GEMINI_MODEL_OPTIONS.map((model) => {
          const isSelected = geminiModel === model.id;
          return (
            <button key={model.id} type="button" onClick={() => { setGeminiModel(model.id); setTranslationEngine("gemini"); }} className={cx("rounded-2xl border p-4 text-left transition-all", isSelected ? "border-emerald-500/30 bg-emerald-500/10" : "border-app-border bg-app-bg/30 hover:bg-app-surface/50")}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-app-text-primary">{model.label}</span>
                <span className="rounded-full border border-app-border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-app-text-secondary">{getGeminiAccessLabel(model.access)}</span>
              </div>
              <p className="text-xs leading-relaxed text-app-text-secondary/70">{model.description}</p>
              <div className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-app-text-secondary/50">{getGeminiFamilyLabel(model.family)} {isSelected ? "- selecionado" : ""}</div>
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
            <button key={model.id} type="button" onClick={() => { setOllamaModel(model.id); setTranslationEngine("ollama"); }} className={cx("rounded-2xl border p-4 text-left transition-all", isSelected ? "border-violet-500/30 bg-violet-500/10" : "border-app-border bg-app-bg/30 hover:bg-app-surface/50")}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-sm font-black text-app-text-primary">{model.label}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-app-text-secondary/50">{model.sizeLabel}</span>
              </div>
              <p className="text-xs leading-relaxed text-app-text-secondary/70">{model.description}</p>
              <code className="mt-3 block rounded-xl border border-app-border bg-app-surface/50 px-3 py-2 text-[10px] text-app-text-primary">{model.installCommand}</code>
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
          <input type="password" value={openAiCompatibleApiKey} onChange={(event) => setOpenAiCompatibleApiKey(event.target.value)} placeholder={selectedOpenAiProvider.apiKeyLabel} className={cx(inputClass, "mt-2")} />
        </label>
      ) : (
        <div className={cardClass}>
          <div className="mb-2 flex items-center gap-2 text-app-text-primary"><ShieldCheck size={16} className="text-blue-400" /><span className="text-sm font-black">Servidor local</span></div>
          <p className="text-xs leading-relaxed text-app-text-secondary/70">Deixe o LM Studio aberto em <span className="text-app-text-primary">localhost:1234</span>. O app tenta detectar o modelo carregado automaticamente.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {selectedOpenAiProvider.models.map((model) => {
          const isSelected = openAiCompatibleModel === model.id;
          return (
            <button key={model.id} type="button" onClick={() => { setOpenAiCompatibleModel(model.id); setOpenRouterModelMode(selectedOpenAiProvider.id === "openrouter" && model.id === OPENROUTER_AUTO_FREE_MODEL_ID ? "auto-free" : "manual"); setTranslationEngine("openaiCompatible"); }} className={cx("rounded-2xl border p-4 text-left transition-all", isSelected ? "border-cyan-500/30 bg-cyan-500/10" : "border-app-border bg-app-bg/30 hover:bg-app-surface/50")}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-app-text-primary">{model.label}</span>
                {model.recommended && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-400">Sugestão</span>}
              </div>
              <p className="text-xs leading-relaxed text-app-text-secondary/70">{model.description}</p>
              <p className="mt-3 break-all text-[10px] font-mono uppercase tracking-wider text-app-text-secondary/50">{model.id === OPENROUTER_AUTO_FREE_MODEL_ID ? "Fila grátis / vision" : model.id}</p>
            </button>
          );
        })}
      </div>

      {selectedOpenAiProvider.id === "openrouter" && (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-relaxed text-app-text-secondary/80">
          <span className="font-black uppercase tracking-[0.18em] text-amber-400">Aviso rápido:</span>{" "}
          no modo grátis, a qualidade depende do modelo disponível no momento. O app tenta corrigir respostas
          duplicadas ou mal formatadas, mas alguns modelos podem só transcrever em vez de traduzir.
        </div>
      )}

      <div className="rounded-3xl border border-app-border bg-app-bg/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><div className={labelClass}>Avançado</div><p className="mt-1 text-xs text-app-text-secondary/60">Use apenas se você já souber o ID exato do modelo.</p></div>
          <Button type="button" variant="outline" onClick={() => { void openExternalUrl(selectedOpenAiProvider.docsUrl); }} className="rounded-xl border-app-border px-4 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary">Docs <ExternalLink size={13} className="ml-2" /></Button>
        </div>
        <input type="text" value={selectedOpenAiProvider.id === "openrouter" && openRouterModelMode === "auto-free" ? "" : openAiCompatibleModel} onChange={(event) => { setOpenAiCompatibleModel(event.target.value); setOpenRouterModelMode("manual"); setTranslationEngine("openaiCompatible"); }} placeholder={selectedOpenAiProvider.id === "openrouter" ? "Cole um ID manual, ex: google/gemini-2.5-flash" : selectedOpenAiModel.id} className={inputClass} />
        {selectedOpenAiProvider.id === "openrouter" && (
          <Button type="button" variant="outline" onClick={handleRefreshOpenRouterFreeModels} disabled={isRefreshingOpenRouterModels} className="mt-3 w-full rounded-xl border-emerald-500/20 py-5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500 hover:bg-emerald-500/10">
            <RefreshCw className={cx("mr-2 h-4 w-4", isRefreshingOpenRouterModels && "animate-spin")} /> Atualizar lista grátis
          </Button>
        )}
      </div>
    </div>
  );
  const renderAiSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Sparkles} label="Motores de tradução" title="Escolha como a IA trabalha" description="Selecione entre nuvem, APIs flexíveis e modelos locais. O modo recomendado continua simples, mas quem quiser ajustar tem espaço para isso." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><div className={labelClass}>Motor ativo</div><h4 className="mt-2 text-xl font-black italic text-app-text-primary">{activeEngineLabel}</h4></div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Pronto para AI Draft</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <EngineCard active={translationEngine === "gemini"} icon={Cloud} title="Google Gemini" badge="Confiável" description="Melhor escolha para qualidade consistente e pouco atrito no dia a dia." tone="border-emerald-500/30 bg-emerald-500/10" onClick={() => setTranslationEngine("gemini")} />
            {OPENAI_COMPATIBLE_PROVIDERS.map((provider) => {
              const isSelected = translationEngine === "openaiCompatible" && selectedOpenAiProvider.id === provider.id;
              const Icon = provider.id === "lmstudio" ? Cpu : provider.id === "groq" ? Zap : Cloud;
              const chip = provider.id === "groq" ? "Turbo" : provider.id === "lmstudio" ? "Local" : "Flexível";
              const tone = provider.id === "groq" ? "border-orange-500/30 bg-orange-500/10" : provider.id === "lmstudio" ? "border-blue-500/30 bg-blue-500/10" : "border-cyan-500/30 bg-cyan-500/10";
              return <EngineCard key={provider.id} active={isSelected} icon={Icon} title={provider.label} badge={chip} description={provider.description} tone={tone} onClick={() => handleOpenAiProviderSelect(provider.id)} />;
            })}
            <EngineCard active={translationEngine === "ollama"} icon={Cpu} title="Ollama Local" badge="Experimental" description="Opção local simples para quem já usa Ollama, mas pode ser lenta em CPU." tone="border-violet-500/30 bg-violet-500/10" onClick={() => setTranslationEngine("ollama")} />
          </div>
        </div>
        <div className={panelClass}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><div className={labelClass}>Configuração do motor</div><h4 className="mt-2 text-xl font-black italic text-app-text-primary">{activeEngineLabel}</h4></div>
            <button type="button" onClick={() => setActiveSection("editor")} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary">Ajustes do draft <ChevronRight size={12} /></button>
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
      <SectionTitle icon={Wand2} label="AI Draft" title="Comportamento do editor" description="Ajustes que afetam como o rascunho da IA chega na fila de blocos. Também aparecem no editor para troca rápida durante o trabalho." />
      <div className="grid gap-4 lg:grid-cols-2">
        <ToggleButton active={aiThinkingEnabled} title="Thinking mais cuidadoso" description="Ajuda modelos locais/reasoning a não só transcrever o inglês, mas pode aumentar bastante o tempo de resposta." icon={Brain} onClick={() => setAiThinkingEnabled(!aiThinkingEnabled)} accentClass="border-amber-500/30 bg-amber-500/10 text-amber-400" />
        <ToggleButton active={aiInferBlockTypesEnabled} title="Detectar tipos de balão" description="Quando ligado, a IA tenta classificar narração, pensamento, texto fora de balão e balão duplo. Se o modelo errar, deixe desligado." icon={Tags} onClick={() => setAiInferBlockTypesEnabled(!aiInferBlockTypesEnabled)} accentClass="border-cyan-500/30 bg-cyan-500/10 text-cyan-400" />
      </div>
      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-2 text-app-text-primary"><Info size={16} className="text-app-accent" /><h4 className="text-sm font-black uppercase tracking-[0.18em]">Sugestão prática</h4></div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className={cardClass}><div className={labelClass}>Uso diário</div><p className="mt-2 text-sm font-bold text-app-text-primary">Thinking desligado</p><p className="mt-2 text-xs leading-relaxed text-app-text-secondary/70">Mais rápido para Gemini, Groq e páginas simples.</p></div>
          <div className={cardClass}><div className={labelClass}>Modelos locais</div><p className="mt-2 text-sm font-bold text-app-text-primary">Thinking ligado</p><p className="mt-2 text-xs leading-relaxed text-app-text-secondary/70">Pode melhorar LM Studio, especialmente em modelos menores.</p></div>
          <div className={cardClass}><div className={labelClass}>Tipos</div><p className="mt-2 text-sm font-bold text-app-text-primary">Opcional</p><p className="mt-2 text-xs leading-relaxed text-app-text-secondary/70">Se a classificação vier ruim, usar tudo como bloco neutro é melhor.</p></div>
        </div>
      </div>
    </section>
  );

  const renderAppearanceSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Palette} label="Visual" title="Aparência do app" description="Escolha o tema que combina melhor com seu ambiente. A interface continua seguindo a identidade editorial/scan-tech do MangAI." />
      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => setTheme("dark-organic")} className={cx("rounded-[2rem] border p-6 text-left transition-all", theme === "dark-organic" ? "border-emerald-500/30 bg-emerald-500/10" : "border-app-border bg-app-surface/30 hover:bg-app-surface/50")}>
          <div className="mb-8 h-24 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_42%),linear-gradient(135deg,#090909,#151515)]" />
          <h4 className="text-xl font-black italic text-app-text-primary">Dark Organic</h4><p className="mt-2 text-sm leading-relaxed text-app-text-secondary/70">Tema escuro para focar na leitura e trabalhar por mais tempo.</p>
          {theme === "dark-organic" && <div className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Ativo</div>}
        </button>
        <button type="button" onClick={() => setTheme("paper-light")} className={cx("rounded-[2rem] border p-6 text-left transition-all", theme === "paper-light" ? "border-blue-500/30 bg-blue-500/10" : "border-app-border bg-app-surface/30 hover:bg-app-surface/50")}>
          <div className="mb-8 h-24 rounded-3xl border border-stone-300 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_45%),linear-gradient(135deg,#fffef8,#eee9d8)]" />
          <h4 className="text-xl font-black italic text-app-text-primary">Paper Light</h4><p className="mt-2 text-sm leading-relaxed text-app-text-secondary/70">Tema claro com visual de papel, bom para ambientes iluminados.</p>
          {theme === "paper-light" && <div className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Ativo</div>}
        </button>
      </div>
    </section>
  );

  const renderDataSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Database} label="Privacidade local" title="Dados deste computador" description="O MangAI salva configurações, chaves e projetos localmente para você não precisar configurar tudo de novo a cada abertura." />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className={panelClass}>
          <div className="mb-4 flex items-center gap-2 text-app-text-primary"><ShieldCheck size={18} className="text-emerald-400" /><h4 className="text-lg font-black italic">O que fica salvo?</h4></div>
          <div className="rounded-3xl border border-app-border bg-app-bg/30 px-5 py-2">
            <InfoRow label="Gemini key" value={apiKey ? "Salva localmente" : "Não configurada"} />
            <InfoRow label="APIs compatíveis" value={openAiCompatibleApiKey ? "Salva localmente" : "Não configurada"} />
            <InfoRow label="Projetos" value="SQLite local" />
            <InfoRow label="Cache" value="Imagens e histórico local" />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-app-text-secondary/60">O app não envia sua chave para o desenvolvedor. As chamadas são feitas do seu computador para o provedor escolhido.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-app-border bg-app-surface/25 p-5"><h4 className="text-lg font-black italic text-app-text-primary">Tutorial inicial</h4><p className="mt-2 text-sm leading-relaxed text-app-text-secondary/70">Reative as dicas do primeiro uso caso queira rever o fluxo do app.</p><Button onClick={handleResetOnboarding} variant="outline" className="mt-5 w-full rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-widest text-app-text-secondary hover:text-app-text-primary"><RotateCcw size={16} className="mr-2" /> Mostrar tutorial</Button></div>
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-5"><h4 className="text-lg font-black italic text-rose-400">Limpar tudo</h4><p className="mt-2 text-sm leading-relaxed text-app-text-secondary/70">Remove histórico, cache, projetos salvos e chaves deste computador.</p><Button onClick={() => setConfirmWipe(true)} variant="destructive" className="mt-5 w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest"><Trash2 size={16} className="mr-2" /> Apagar dados deste app</Button></div>
        </div>
      </div>
    </section>
  );
  const renderUpdatesSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={RefreshCw} label="Release" title="Atualizações e changelog" description="Confira a versão instalada, procure updates pelo GitHub Releases e veja o que mudou nas últimas versões." />
      <div className="grid gap-4 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        <div className={panelClass}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><div className={labelClass}>Versão instalada</div><h4 className="mt-2 text-2xl font-black italic text-app-text-primary">MangAI {appVersion}</h4></div>
            {availableUpdate ? <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Nova {availableUpdate.version}</span> : <span className="rounded-full border border-app-border bg-app-bg/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-app-text-secondary">Sem update pendente</span>}
          </div>
          <div className="rounded-3xl border border-app-border bg-app-bg/30 px-5 py-3"><InfoRow label="Última verificação" value={formatLastCheck(lastUpdateCheck)} /><InfoRow label="Canal" value="GitHub Releases" /></div>
          {(updateStatusMessage || updateError) && <p className="mt-4 rounded-2xl border border-app-border bg-app-bg/30 p-4 text-xs leading-relaxed text-app-text-secondary/70">{updateError || updateStatusMessage}</p>}
          {isInstallingUpdate && <div className="mt-5"><div className="mb-2 flex items-center justify-between text-[11px] text-app-text-secondary/70"><span>Progresso do download</span><span>{updateProgressPercent ?? 0}%</span></div><div className="h-2 overflow-hidden rounded-full bg-app-bg/60"><div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${updateProgressPercent ?? 0}%` }} /></div></div>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Button onClick={() => { void onCheckForUpdates(); }} variant="outline" disabled={isCheckingUpdates || isInstallingUpdate} className="rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary"><RefreshCw className={cx("mr-2 h-4 w-4", isCheckingUpdates && "animate-spin")} />{isCheckingUpdates ? "Verificando..." : "Verificar agora"}</Button>
            <Button onClick={() => { void onInstallUpdate(); }} disabled={!availableUpdate || isInstallingUpdate || isCheckingUpdates} className="rounded-2xl py-6 text-[10px] font-black uppercase tracking-[0.18em]">{isInstallingUpdate ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}{isInstallingUpdate ? "Instalando" : availableUpdate ? `Instalar ${availableUpdate.version}` : "Nenhum update agora"}</Button>
          </div>
        </div>
        <div className={panelClass}>
          <div className="mb-5 flex items-center gap-2 text-app-text-primary"><History size={18} className="text-app-accent" /><h4 className="text-lg font-black italic">Changelog</h4></div>
          <div className="space-y-3">
            {CHANGELOG_ITEMS.map((entry) => (
              <article key={entry.version} className="rounded-3xl border border-app-border bg-app-bg/30 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[0.22em] text-app-text-secondary/50">{entry.version}</div><h5 className="mt-1 text-base font-black italic text-app-text-primary">{entry.title}</h5></div><span className="rounded-full border border-app-border bg-app-surface/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-app-text-secondary">{entry.badge}</span></div>
                <ul className="space-y-2 text-xs leading-relaxed text-app-text-secondary/70">{entry.items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-app-accent" /><span>{item}</span></li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderAboutSection = () => (
    <section className="space-y-6">
      <SectionTitle icon={Info} label="Projeto" title="MangAI Translator" description="Desktop app para localização assistida de mangá e quadrinhos, feito para acelerar o rascunho sem tirar o controle editorial de você." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelClass}>
          <h4 className="text-xl font-black italic text-app-text-primary">Beta aberto</h4>
          <p className="mt-3 text-sm leading-relaxed text-app-text-secondary/70">O app ainda está evoluindo com feedback da comunidade. Bugs e sugestões são bem-vindos no GitHub.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => { void openExternalUrl(GITHUB_URL); }} className="rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary"><Github size={16} className="mr-2" /> GitHub</Button>
            <Button onClick={() => { void openExternalUrl(SUPPORT_URL); }} className="rounded-2xl bg-[#FF5E5B] py-6 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff7b78]"><Heart size={16} className="mr-2" /> Ko-fi</Button>
          </div>
        </div>
        <div className={panelClass}>
          <h4 className="text-xl font-black italic text-app-text-primary">Resumo</h4>
          <div className="mt-4 rounded-3xl border border-app-border bg-app-bg/30 px-5 py-2"><InfoRow label="Versão" value={appVersion} /><InfoRow label="Licença" value="MIT" /><InfoRow label="Release" value="GitHub Releases" /><InfoRow label="Apoio" value="Ko-fi / comunidade" /></div>
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
    <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-app-border bg-app-surface/20 p-6 shadow-2xl backdrop-blur-md">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-3"><Settings className="text-app-text-secondary" size={24} /></div>
          <div className="min-w-0"><h2 className="text-3xl font-black uppercase tracking-tighter italic text-app-text-primary">Configurações <span className="text-app-text-secondary/20">do app</span></h2><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/50">IA, editor, aparência, dados e atualizações em seções separadas</p></div>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary hover:bg-app-surface/50 hover:text-app-text-primary">Voltar para o painel</Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-5 lg:grid-cols-[245px_minmax(0,1fr)] lg:grid-rows-none">
        <aside className="custom-scrollbar flex gap-2 overflow-x-auto rounded-[2rem] border border-app-border bg-app-bg/25 p-3 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={cx("flex min-w-[150px] items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all lg:min-w-0", isActive ? "border-app-accent/30 bg-app-accent/10 text-app-text-primary" : "border-transparent text-app-text-secondary hover:border-app-border hover:bg-app-surface/30 hover:text-app-text-primary")}>
                <span className="rounded-xl border border-current/20 bg-current/10 p-2"><Icon size={16} /></span>
                <span className="min-w-0"><span className="block text-sm font-black uppercase tracking-tight">{section.label}</span><span className="block text-[9px] font-bold uppercase tracking-[0.2em] opacity-55">{section.kicker}</span></span>
              </button>
            );
          })}
        </aside>
        <main className="custom-scrollbar min-h-0 overflow-y-auto rounded-[2rem] border border-app-border bg-app-bg/20 p-6">{renderActiveSection()}</main>
      </div>

      <ConfirmModal isOpen={confirmWipe} onClose={() => setConfirmWipe(false)} onConfirm={() => { void handleWipeAll(); }} title="Apagar dados do app?" description="Esta ação não pode ser desfeita. Suas traduções salvas localmente, imagens em cache e chaves de API serão removidas deste computador." confirmText="Sim, apagar dados" variant="destructive" />
      <StatusModal isOpen={statusModal.isOpen} onClose={() => setStatusModal({ ...statusModal, isOpen: false })} title={statusModal.title} description={statusModal.description} type={statusModal.type} />
    </div>
  );
};

export default SettingsView;
