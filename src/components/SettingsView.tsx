import React, { useState } from "react";
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
import { useMangaStore } from "@/store/useMangaStore";
import { useTheme } from "@/contexts/ThemeContext";
import { dbService } from "@/services/dbService";
import {
  clearOpenRouterFreeModelsCache,
  getOpenRouterFreeVisionModels,
} from "@/services/openAiCompatibleService";
import { Button } from "@/components/ui/button";
import type { AvailableUpdateInfo, UpdateCheckResult } from "@/hooks/useAppUpdater";
import {
  Settings,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Key,
  Monitor,
  Database,
  Download,
  RefreshCw,
  Rocket,
  Heart,
  Brain,
  Tags,
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

const formatLastCheck = (value: string | null) => {
  if (!value) {
    return "Ainda nao verificado";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Ainda nao verificado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const SUPPORT_URL = "https://ko-fi.com/zentsy";

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
  const selectedGeminiModel = getGeminiModelOption(geminiModel);
  const selectedOllamaModel = getOllamaModelOption(ollamaModel);
  const selectedOpenAiProvider = getOpenAiCompatibleProvider(openAiCompatibleProvider);
  const selectedOpenAiModel = getOpenAiCompatibleModel(openAiCompatibleProvider, openAiCompatibleModel);

  const handleOpenAiProviderSelect = (providerId: OpenAiCompatibleProviderId) => {
    setOpenAiCompatibleProvider(providerId);
    setOpenAiCompatibleModel(getDefaultOpenAiCompatibleModelForProvider(providerId));
    setOpenRouterModelMode(providerId === "openrouter" ? "auto-free" : "manual");
    setTranslationEngine("openaiCompatible");
  };

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isRefreshingOpenRouterModels, setIsRefreshingOpenRouterModels] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: StatusType;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const handleRefreshOpenRouterFreeModels = async () => {
    setIsRefreshingOpenRouterModels(true);

    try {
      clearOpenRouterFreeModelsCache();
      const models = await getOpenRouterFreeVisionModels(openAiCompatibleApiKey, true);
      setStatusModal({
        isOpen: true,
        title: "Lista atualizada",
        description: `Encontramos ${models.length} modelo(s) gratis com vision no OpenRouter.`,
        type: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a lista agora.";
      setStatusModal({
        isOpen: true,
        title: "Falha ao atualizar",
        description: message,
        type: "error",
      });
    } finally {
      setIsRefreshingOpenRouterModels(false);
    }
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    setStatusModal({
      isOpen: true,
      title: "Tutorial reativado",
      description: "As dicas iniciais vao aparecer novamente no painel.",
      type: "success",
    });
  };

  const handleWipeAll = async () => {
    try {
      await dbService.wipeAllData();
      clearStore();
      setConfirmWipe(false);
      setStatusModal({
        isOpen: true,
        title: "Dados apagados",
        description: "Historico, cache de imagens e configuracoes foram removidos deste computador.",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
      setStatusModal({
        isOpen: true,
        title: "Nao foi possivel limpar agora",
        description: "Tente novamente em alguns instantes.",
        type: "error",
      });
    }
  };

  const handleOpenSupport = async () => {
    try {
      await openUrl(SUPPORT_URL);
    } catch (error) {
      console.error("Erro ao abrir link de apoio:", error);
      setStatusModal({
        isOpen: true,
        title: "Nao foi possivel abrir o link",
        description: "Tente novamente em alguns instantes.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-app-border bg-app-surface/20 p-8 shadow-2xl backdrop-blur-md">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-3">
            <Settings className="text-app-text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-app-text-primary">
              Configuracoes <span className="text-app-text-secondary/20">do app</span>
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/40">
              Escolha como voce quer traduzir, visualizar e salvar seus dados
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary hover:bg-app-surface/50 hover:text-app-text-primary"
        >
          Voltar para o painel
        </Button>
      </header>

      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto pr-4">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Rocket size={16} className="text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Atualizacoes do app
            </h3>
          </div>

          <div className="rounded-3xl border border-app-border bg-app-surface/20 p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-3xl border border-app-border bg-app-surface/30 p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/45">
                      Versao instalada
                    </div>
                    <h4 className="mt-2 text-lg font-bold italic text-app-text-primary">
                      MangAI Translator {appVersion}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-app-text-secondary/60">
                      O app pode checar novas versoes no GitHub Releases e abrir o instalador para voce.
                    </p>
                  </div>

                  {availableUpdate ? (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                      Nova versao {availableUpdate.version}
                    </span>
                  ) : (
                    <span className="rounded-full border border-app-border bg-app-surface px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-app-text-secondary">
                      Sem update pendente
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-app-border bg-app-bg/35 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-app-text-secondary/50">
                    <span>Ultima verificacao</span>
                    <span className="text-app-text-primary">{formatLastCheck(lastUpdateCheck)}</span>
                  </div>

                  {(updateStatusMessage || updateError) && (
                    <p className="mt-3 text-xs leading-relaxed text-app-text-secondary/60">
                      {updateError || updateStatusMessage}
                    </p>
                  )}

                  {isInstallingUpdate && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[11px] text-app-text-secondary/65">
                        <span>Progresso do download</span>
                        <span>{updateProgressPercent ?? 0}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-app-surface">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${updateProgressPercent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-app-border bg-app-surface/30 p-5">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-app-text-secondary/60">
                    Como funciona
                  </h4>
                  <p className="mt-3 text-xs leading-relaxed text-app-text-secondary/60">
                    Quando uma nova versao estiver publicada, o app avisa aqui e prepara a instalacao para voce.
                    No Windows, ele fecha sozinho para abrir o instalador.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      void onCheckForUpdates();
                    }}
                    variant="outline"
                    disabled={isCheckingUpdates || isInstallingUpdate}
                    className="w-full rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary"
                  >
                    <RefreshCw className={isCheckingUpdates ? "animate-spin" : ""} />
                    {isCheckingUpdates ? "Verificando..." : "Verificar agora"}
                  </Button>

                  <Button
                    onClick={() => {
                      void onInstallUpdate();
                    }}
                    disabled={!availableUpdate || isInstallingUpdate || isCheckingUpdates}
                    className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    {isInstallingUpdate ? (
                      <>
                        <RefreshCw className="animate-spin" />
                        Instalando
                      </>
                    ) : (
                      <>
                        <Download />
                        {availableUpdate ? `Instalar ${availableUpdate.version}` : "Nenhum update agora"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Como voce quer traduzir
            </h3>
          </div>

          <div className="rounded-3xl border border-app-border bg-app-surface/20 p-5">
            <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-app-border bg-app-surface/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/40">
                    Motor ativo
                  </div>
                  <h4 className="mt-2 text-lg font-bold italic text-app-text-primary">
                    {translationEngine === "gemini"
                      ? "Google Gemini"
                      : translationEngine === "ollama"
                        ? "Ollama Local"
                        : selectedOpenAiProvider.label}
                  </h4>
                </div>

                <div className="inline-flex rounded-full border border-app-border bg-app-bg/35 p-1">
                  <button
                    type="button"
                    onClick={() => setTranslationEngine("gemini")}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      translationEngine === "gemini"
                        ? "bg-app-text-primary text-app-bg"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationEngine("ollama")}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      translationEngine === "ollama"
                        ? "bg-app-text-primary text-app-bg"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Ollama
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationEngine("openaiCompatible")}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      translationEngine === "openaiCompatible"
                        ? "bg-app-text-primary text-app-bg"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    APIs
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-bg/35 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-xl border p-2 ${
                      aiThinkingEnabled
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-app-border bg-app-surface/40 text-app-text-secondary"
                    }`}
                  >
                    <Brain size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text-primary">
                      Thinking
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-app-text-secondary/60">
                      Ligue quando quiser que a IA pense mais antes de responder. Pode ajudar modelos
                      locais e reasoning, mas deixa o AI Draft mais lento.
                    </p>
                  </div>
                </div>

                <div className="inline-flex self-start rounded-full border border-app-border bg-app-surface/35 p-1 md:self-auto">
                  <button
                    type="button"
                    onClick={() => setAiThinkingEnabled(false)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      !aiThinkingEnabled
                        ? "bg-app-text-primary text-app-bg"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Rapido
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiThinkingEnabled(true)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      aiThinkingEnabled
                        ? "bg-amber-500 text-black"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Pensar mais
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-bg/35 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-xl border p-2 ${
                      aiInferBlockTypesEnabled
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-app-border bg-app-surface/40 text-app-text-secondary"
                    }`}
                  >
                    <Tags size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text-primary">
                      Tipos de balao
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-app-text-secondary/60">
                      Deixe desligado para criar blocos neutros. Ligue apenas se o modelo estiver
                      classificando bem pensamento, narracao, texto fora de balao e balao duplo.
                    </p>
                  </div>
                </div>

                <div className="inline-flex self-start rounded-full border border-app-border bg-app-surface/35 p-1 md:self-auto">
                  <button
                    type="button"
                    onClick={() => setAiInferBlockTypesEnabled(false)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      !aiInferBlockTypesEnabled
                        ? "bg-app-text-primary text-app-bg"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Neutro
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiInferBlockTypesEnabled(true)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      aiInferBlockTypesEnabled
                        ? "bg-cyan-500 text-black"
                        : "text-app-text-secondary hover:text-app-text-primary"
                    }`}
                  >
                    Detectar
                  </button>
                </div>
              </div>

              {translationEngine === "gemini" ? (
                <>
                  <p className="text-sm leading-relaxed text-app-text-secondary/65">
                    Melhor escolha para quem quer resultado consistente sem configurar modelo local.
                    O modelo atual e <span className="text-app-text-primary">{selectedGeminiModel.label}</span>.
                  </p>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded bg-app-surface/60 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">
                          {selectedGeminiModel.recommended ? "Padrao" : "Modelo em uso"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                          {getGeminiAccessLabel(selectedGeminiModel.access)}
                        </span>
                      </div>

                      <div className="mb-3 text-sm font-bold text-app-text-primary">{selectedGeminiModel.label}</div>
                      <p className="text-xs leading-relaxed text-app-text-secondary/60">
                        {selectedGeminiModel.description}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                          Chave da API
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-app-text-secondary/60">
                        {apiKey
                          ? "Sua chave fica salva apenas neste computador e o app fala direto com a API do Google."
                          : "Cole sua chave do Google AI Studio no painel para liberar o AI Draft com Gemini."}
                      </p>
                    </div>
                  </div>
                </>
              ) : translationEngine === "ollama" ? (
                <>
                  <p className="text-sm leading-relaxed text-app-text-secondary/65">
                    Traduz usando um modelo rodando no seu PC. O modelo atual e <span className="text-app-text-primary">{selectedOllamaModel.label}</span>,
                    com perfil <span className="text-app-text-primary">{getOllamaProfileLabel(selectedOllamaModel.profile)}</span>.
                  </p>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded bg-app-surface/60 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">
                          Modelo local
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                          {selectedOllamaModel.sizeLabel}
                        </span>
                      </div>

                      <div className="mb-3 text-sm font-bold text-app-text-primary">{selectedOllamaModel.label}</div>
                      <p className="text-xs leading-relaxed text-app-text-secondary/60">
                        {selectedOllamaModel.description}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                        Instalar no terminal
                      </div>
                      <code className="block rounded-xl border border-app-border bg-app-surface/40 px-3 py-2 text-[11px] text-app-text-primary">
                        {selectedOllamaModel.installCommand}
                      </code>
                      <p className="mt-3 text-xs leading-relaxed text-app-text-secondary/60">
                        Requer Ollama {selectedOllamaModel.requiresOllama}. Em PCs mais modestos, vale comecar por modelos leves.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-app-text-secondary/65">
                    Traduz usando uma API compativel com OpenAI. O provedor atual e <span className="text-app-text-primary">{selectedOpenAiProvider.label}</span>
                    {" "}com <span className="text-app-text-primary">
                      {selectedOpenAiProvider.id === "openrouter" &&
                      openRouterModelMode === "auto-free"
                        ? "modelos gratis automaticos"
                        : `o modelo ${openAiCompatibleModel}`}
                    </span>.
                  </p>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded bg-app-surface/60 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">
                          {selectedOpenAiProvider.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                          Vision
                        </span>
                      </div>

                      <div className="mb-3 break-all text-xs font-mono text-app-text-primary">{selectedOpenAiProvider.baseUrl}</div>
                      <p className="text-xs leading-relaxed text-app-text-secondary/60">
                        {selectedOpenAiProvider.description}
                      </p>
                      {selectedOpenAiProvider.id === "openrouter" && (
                        <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[11px] leading-relaxed text-emerald-500">
                          No modo automatico, o app tenta apenas modelos vision gratuitos e pula para o proximo se bater cota.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-app-border bg-app-bg/35 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Key size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                          {selectedOpenAiProvider.requiresApiKey ? selectedOpenAiProvider.apiKeyLabel : "Servidor local"}
                        </span>
                      </div>

                      {selectedOpenAiProvider.requiresApiKey ? (
                        <input
                          type="password"
                          value={openAiCompatibleApiKey}
                          onChange={(event) => setOpenAiCompatibleApiKey(event.target.value)}
                          placeholder={selectedOpenAiProvider.apiKeyLabel}
                          className="w-full rounded-xl border border-app-border bg-app-surface/40 px-3 py-3 text-xs font-mono text-app-text-primary outline-none placeholder:text-app-text-secondary/30 focus:border-app-accent/30"
                        />
                      ) : (
                        <p className="text-xs leading-relaxed text-app-text-secondary/60">
                          Abra o servidor do LM Studio e mantenha o modelo vision carregado. Nao precisa colar chave no app.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-3xl border border-app-border bg-app-surface/20 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-app-text-secondary/60">
                    {translationEngine === "gemini"
                      ? "Modelos Gemini"
                      : translationEngine === "ollama"
                        ? "Modelos locais"
                        : "APIs compativeis"}
                  </h4>
                  <p className="mt-1 text-xs text-app-text-secondary/50">
                    {translationEngine === "gemini"
                      ? "Troque o modelo na nuvem sem editar codigo. Alguns modelos pedem billing ou ainda estao em preview."
                      : translationEngine === "ollama"
                        ? "Escolha um modelo mais leve para ganhar velocidade ou um maior se quiser tentar mais qualidade."
                        : "Escolha o provedor e o modelo vision que o app deve usar no AI Draft."}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/40">
                    Selecionado agora
                  </div>
                  <div className="text-xs text-app-text-primary">
                    {translationEngine === "gemini"
                      ? selectedGeminiModel.label
                      : translationEngine === "ollama"
                        ? selectedOllamaModel.label
                        : selectedOpenAiProvider.id === "openrouter" &&
                            openRouterModelMode === "auto-free"
                          ? "OpenRouter / Auto gratis"
                          : `${selectedOpenAiProvider.label} / ${openAiCompatibleModel}`}
                  </div>
                </div>
              </div>

              {translationEngine === "gemini" ? (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {GEMINI_MODEL_OPTIONS.map((model) => {
                      const isSelected = geminiModel === model.id;

                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setGeminiModel(model.id);
                            setTranslationEngine("gemini");
                          }}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-app-accent/30 bg-app-surface/80"
                              : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-app-text-primary">{model.label}</h5>
                                {model.recommended && (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                                    Padrao
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                {model.id}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                              {getGeminiAccessLabel(model.access)}
                            </span>
                          </div>

                          <p className="min-h-[48px] text-xs leading-relaxed text-app-text-secondary/60">
                            {model.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                            <span className="text-app-text-secondary/50">
                              {getGeminiFamilyLabel(model.family)}
                            </span>
                            <span className={isSelected ? "text-app-text-primary" : "text-app-text-secondary/40"}>
                              {isSelected ? "Selecionado" : "Escolher"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl border border-app-border bg-app-bg/30 px-4 py-3 text-xs leading-relaxed text-app-text-secondary/60">
                    Dica: <span className="text-app-text-primary">Gemini 2.5 Flash</span> e o melhor ponto de partida.
                    Se voce tiver billing ativo ou quiser testar as novidades, pode trocar para a linha <span className="text-app-text-primary">Pro</span> ou para os modelos <span className="text-app-text-primary">Gemini 3</span>.
                  </div>
                </>
              ) : translationEngine === "ollama" ? (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {OLLAMA_MODEL_OPTIONS.map((model) => {
                      const isSelected = ollamaModel === model.id;

                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setOllamaModel(model.id);
                            setTranslationEngine("ollama");
                          }}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-app-accent/30 bg-app-surface/80"
                              : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-app-text-primary">{model.label}</h5>
                                {model.recommended && (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                                    Boa opcao
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                {model.id}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                              {model.sizeLabel}
                            </span>
                          </div>

                          <p className="min-h-[48px] text-xs leading-relaxed text-app-text-secondary/60">
                            {model.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                            <span className="text-app-text-secondary/50">
                              {getOllamaProfileLabel(model.profile)}
                            </span>
                            <span className={isSelected ? "text-app-text-primary" : "text-app-text-secondary/40"}>
                              {isSelected ? "Selecionado" : "Escolher"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-bg/30 px-4 py-3">
                    <div className="text-xs text-app-text-secondary/60">
                      Se voce quer praticidade, fique com <span className="text-app-text-primary">Gemini</span>.
                      Se preferir testar tudo localmente, comece por <span className="text-app-text-primary">Qwen 3 VL 2B</span> em PCs mais fracos.
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-app-text-secondary/30">
                      Escolha o que fizer mais sentido pra voce <ChevronRight size={10} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {OPENAI_COMPATIBLE_PROVIDERS.map((provider) => {
                      const isSelected = selectedOpenAiProvider.id === provider.id;

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => handleOpenAiProviderSelect(provider.id)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-app-accent/30 bg-app-surface/80"
                              : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <h5 className="text-sm font-bold text-app-text-primary">{provider.label}</h5>
                              <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                {provider.requiresApiKey ? "API Key" : "Local"}
                              </p>
                            </div>
                            {provider.id === "openrouter" && (
                              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                                Flexivel
                              </span>
                            )}
                          </div>

                          <p className="min-h-[52px] text-xs leading-relaxed text-app-text-secondary/60">
                            {provider.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                            <span className="max-w-[190px] truncate text-app-text-secondary/50">
                              {provider.baseUrl.replace(/^https?:\/\//, "")}
                            </span>
                            <span className={isSelected ? "text-app-text-primary" : "text-app-text-secondary/40"}>
                              {isSelected ? "Selecionado" : "Escolher"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedOpenAiProvider.models.map((model) => {
                      const isSelected = openAiCompatibleModel === model.id;

                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setOpenAiCompatibleModel(model.id);
                            setOpenRouterModelMode(
                              selectedOpenAiProvider.id === "openrouter" &&
                                model.id === OPENROUTER_AUTO_FREE_MODEL_ID
                                ? "auto-free"
                                : "manual"
                            );
                            setTranslationEngine("openaiCompatible");
                          }}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-app-accent/30 bg-app-surface/80"
                              : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-app-text-primary">{model.label}</h5>
                                {model.recommended && (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                                    Sugestao
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 break-all text-[11px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                {model.id === OPENROUTER_AUTO_FREE_MODEL_ID
                                  ? "FILA GRATIS / VISION"
                                  : model.id}
                              </p>
                            </div>
                          </div>

                          <p className="min-h-[48px] text-xs leading-relaxed text-app-text-secondary/60">
                            {model.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                            <span className="text-app-text-secondary/50">Vision</span>
                            <span className={isSelected ? "text-app-text-primary" : "text-app-text-secondary/40"}>
                              {isSelected && model.id === OPENROUTER_AUTO_FREE_MODEL_ID
                                ? "Automatico"
                                : isSelected
                                  ? "Selecionado"
                                  : "Escolher"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl border border-app-border bg-app-bg/30 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                        Modelo customizado avancado
                      </span>
                      <input
                        type="text"
                        value={
                          selectedOpenAiProvider.id === "openrouter" &&
                          openRouterModelMode === "auto-free"
                            ? ""
                            : openAiCompatibleModel
                        }
                        onChange={(event) => {
                          setOpenAiCompatibleModel(event.target.value);
                          setOpenRouterModelMode("manual");
                          setTranslationEngine("openaiCompatible");
                        }}
                        placeholder={
                          selectedOpenAiProvider.id === "openrouter"
                            ? "Cole um ID manual, ex: google/gemini-2.5-flash"
                            : selectedOpenAiModel.id
                        }
                        className="mt-2 w-full rounded-xl border border-app-border bg-app-surface/40 px-3 py-3 text-xs font-mono text-app-text-primary outline-none placeholder:text-app-text-secondary/30 focus:border-app-accent/30"
                      />
                      <p className="mt-2 text-[11px] leading-relaxed text-app-text-secondary/45">
                        Deixe vazio e escolha Auto gratis para o app cuidar da fila sem usar modelos pagos.
                      </p>
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      {selectedOpenAiProvider.id === "openrouter" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRefreshOpenRouterFreeModels}
                          disabled={isRefreshingOpenRouterModels}
                          className="rounded-xl border-emerald-500/20 px-5 py-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500 hover:bg-emerald-500/10"
                        >
                          {isRefreshingOpenRouterModels ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Atualizar lista gratis
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          void openUrl(selectedOpenAiProvider.docsUrl);
                        }}
                        className="rounded-xl border-app-border px-5 py-6 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary"
                      >
                        Abrir docs
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Aparencia
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setTheme("dark-organic")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                theme === "dark-organic"
                  ? "border-app-accent/30 bg-app-surface/80"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">Dark Organic</h4>
              <p className="text-xs leading-relaxed text-app-text-secondary/60">
                Tema escuro para focar na leitura e trabalhar por mais tempo.
              </p>
              {theme === "dark-organic" && (
                <div className="mt-4 text-[9px] font-black uppercase text-emerald-500">Ativo</div>
              )}
            </button>

            <button
              onClick={() => setTheme("paper-light")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                theme === "paper-light"
                  ? "border-app-accent/30 bg-app-surface/80 shadow-inner"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">Paper Light</h4>
              <p className="text-xs leading-relaxed text-app-text-secondary/60">
                Tema claro com visual de papel, bom para ambientes iluminados.
              </p>
              {theme === "paper-light" && (
                <div className="mt-4 text-[9px] font-black uppercase text-app-accent">Ativo</div>
              )}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Database size={16} className="text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Seus dados
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-6 transition-all group hover:bg-rose-500/10">
              <h4 className="mb-1 text-lg font-bold italic text-rose-400">Limpar tudo</h4>
              <p className="mb-6 text-xs leading-relaxed text-app-text-secondary/60">
                Apaga historico, imagens em cache e configuracoes salvas neste computador.
              </p>
              <Button
                onClick={() => setConfirmWipe(true)}
                variant="destructive"
                className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 size={16} className="mr-2" /> APAGAR DADOS DESTE APP
              </Button>
            </div>

            <div className="rounded-3xl border border-app-border bg-app-surface/30 p-6 text-left transition-all group hover:bg-app-surface/50">
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">
                Mostrar tutorial de novo
              </h4>
              <p className="mb-6 text-xs leading-relaxed text-app-text-secondary/60">
                Traz de volta as dicas iniciais para quem quiser rever como o app funciona.
              </p>
              <Button
                onClick={handleResetOnboarding}
                variant="outline"
                className="w-full rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-widest text-app-text-secondary hover:text-app-text-primary"
              >
                <RotateCcw size={16} className="mr-2" /> MOSTRAR TUTORIAL
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Heart size={16} className="text-pink-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Apoiar o projeto
            </h3>
          </div>

          <div className="rounded-3xl border border-pink-500/15 bg-pink-500/5 p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-[720px]">
                <h4 className="text-lg font-bold italic text-app-text-primary">Curtiu o MangAI Translator?</h4>
                <p className="mt-2 text-sm leading-relaxed text-app-text-secondary/65">
                  Se o app te ajudou e voce quiser fortalecer o projeto, voce pode apoiar o desenvolvimento pelo Ko-fi.
                  Isso ajuda bastante nas proximas melhorias, manutencao e tempo investido no app.
                </p>
              </div>

              <Button
                onClick={() => {
                  void handleOpenSupport();
                }}
                className="min-w-[220px] rounded-2xl bg-[#FF5E5B] py-6 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff7b78]"
              >
                <Heart size={16} className="mr-2" />
                Apoiar no Ko-fi
              </Button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={() => {
          void handleWipeAll();
        }}
        title="Apagar dados do app?"
        description="Esta acao nao pode ser desfeita. Suas traducoes salvas localmente, imagens em cache e chaves de API serao removidas deste computador."
        confirmText="Sim, apagar dados"
        variant="destructive"
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        description={statusModal.description}
        type={statusModal.type}
      />
    </div>
  );
};

export default SettingsView;
