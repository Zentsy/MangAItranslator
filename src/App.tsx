import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import MangaBackground from "@/components/MangaBackground";
import FileUpload from "@/components/FileUpload";
import StatusModal, { StatusType } from "@/components/StatusModal";
import BrandMark from "@/components/BrandMark";
import UpdateModal from "@/components/UpdateModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { getGeminiModelOption, GEMINI_MODEL_OPTIONS, getGeminiAccessLabel } from "@/config/geminiModels";
import { getOllamaModelOption, OLLAMA_MODEL_OPTIONS } from "@/config/ollamaModels";
import { getOpenAiCompatibleProvider, OPENROUTER_AUTO_FREE_MODEL_ID } from "@/config/openAiCompatibleProviders";
import { useAppUpdater, type UpdateCheckResult } from "@/hooks/useAppUpdater";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService, DBProject, resolveAssetUrl } from "@/services/dbService";
import { loadSecret, stripLegacyKeysFromLocalStorage } from "@/services/secretsService";
import NanquimLoading from "@/components/NanquimLoading";
import { GeminiLogo, OllamaLogo, OpenRouterLogo, GroqLogo, LMStudioLogo, getProviderLogo } from "@/components/icons/EngineLogos";
import {
  LayoutGrid,
  FileImage,
  Settings,
  Key,
  Library,
  ChevronRight,
  ChevronDown,
  Check,
  Clock3,
  History,
  Play,
  RefreshCw,
  BookOpen,
} from "lucide-react";

const EditorView = lazy(() => import("@/components/EditorView"));
const LibraryView = lazy(() => import("@/components/LibraryView"));
const SettingsView = lazy(() => import("@/components/SettingsView"));
const OnboardingOverlay = lazy(() => import("@/components/OnboardingOverlay"));

type AppView = "dashboard" | "editor" | "library" | "settings";

const getViewLoadingInfo = (view: AppView) => {
  switch (view) {
    case "editor":
      return {
        text: "Preparando Mesa do Mangaká",
        subtitle: "執筆中 • CARREGANDO PÁGINAS DO CAPÍTULO",
      };
    case "library":
      return {
        text: "Acessando Acervo Editorial",
        subtitle: "書庫 • CONSULTANDO TOMOS DO PROJETO",
      };
    case "settings":
      return {
        text: "Carregando Configurações",
        subtitle: "設定 • AJUSTES DO SISTEMA E MOTORES",
      };
    default:
      return {
        text: "Preparando Painel",
        subtitle: "執筆中 • CARREGANDO AMBIENTE",
      };
  }
};

const ViewLoader: React.FC<{ view?: AppView }> = ({ view = "dashboard" }) => {
  const info = getViewLoadingInfo(view);
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <NanquimLoading compact={false} text={info.text} subtitle={info.subtitle} />
    </div>
  );
};

interface NavItem {
  id: AppView;
  label: string;
  caption: string;
  icon: typeof LayoutGrid;
  disabled?: boolean;
}

const formatProjectDate = (value: string) => {
  const parsedDate = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(parsedDate.getTime())) {
    return "Atualizado recentemente";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const getThumbnailUrl = (thumbnailPath?: string | null) => resolveAssetUrl(thumbnailPath);

const ProjectThumbnail: React.FC<{
  thumbnailPath?: string | null;
  alt: string;
  className: string;
  fallbackClassName: string;
  iconSize: number;
}> = ({ thumbnailPath, alt, className, fallbackClassName, iconSize }) => {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? null : getThumbnailUrl(thumbnailPath);

  if (!src) {
    return (
      <div className={fallbackClassName}>
        <FileImage size={iconSize} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
};

function App() {
  const { t } = useTranslation();
  const updater = useAppUpdater();
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [recentProjects, setRecentProjects] = useState<DBProject[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
  const { 
    apiKey, 
    setApiKey,
    openRouterApiKey,
    setOpenRouterApiKey,
    groqApiKey,
    setGroqApiKey,
    customApiKey,
    setCustomApiKey,
    setPages, 
    setProjectId, 
    setPageIndex,
    setGlossary,
    currentProjectId, 
    translationEngine, 
    setTranslationEngine,
    geminiModel,
    setGeminiModel,
    ollamaModel,
    setOllamaModel,
    openAiCompatibleProvider,
    openAiCompatibleModel,
    setOpenAiCompatibleModel,
    setOpenRouterModelMode,
  } = useMangaStore();
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const selectedGeminiModel = getGeminiModelOption(geminiModel);
  const selectedOllamaModel = getOllamaModelOption(ollamaModel);
  const selectedOpenAiProvider = getOpenAiCompatibleProvider(openAiCompatibleProvider);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModelDropdownOpen]);
  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", caption: "Inicio", icon: LayoutGrid },
    { id: "library", label: "Biblioteca", caption: "Historico", icon: Library },
    { id: "editor", label: "Editor", caption: currentProjectId ? "Projeto ativo" : "Sem projeto", icon: FileImage, disabled: !currentProjectId },
    { id: "settings", label: "Ajustes", caption: "Engine e tema", icon: Settings },
  ];

  async function checkOllama() {
    try {
      const status = await invoke<boolean>("check_ollama_status");
      setOllamaStatus(status);
    } catch {
      setOllamaStatus(false);
    }
  }

  async function loadRecentProjects() {
    try {
      const projects = await dbService.getProjects();
      setRecentProjects(projects.slice(0, 3));
    } catch (error) {
      console.error("Erro ao carregar projetos recentes:", error);
    }
  }

  useEffect(() => {
    checkOllama();

      // Bootstrap secrets
    const bootstrapSecrets = async () => {
      const [geminiSecret, openrouterSecret, groqSecret, customSecret] = await Promise.all([
        loadSecret("gemini"),
        loadSecret("openrouter"),
        loadSecret("groq"),
        loadSecret("custom"),
      ]);

      // Atualiza o store sem disparar persistencia
      useMangaStore.setState({ 
        apiKey: geminiSecret || "", 
        openRouterApiKey: openrouterSecret || "",
        groqApiKey: groqSecret || "",
        customApiKey: customSecret || ""
      });

      // Limpa do localStorage (legado)
      stripLegacyKeysFromLocalStorage();
    };

    void bootstrapSecrets();
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard' || currentView === 'library') {
      void loadRecentProjects();
    }
  }, [currentView]);

  useEffect(() => {
    if (updater.availableUpdate && !updater.isInstalling) {
      setIsUpdateModalOpen(true);
    }
  }, [updater.availableUpdate, updater.isInstalling]);

  const handleManualUpdateCheck = async (): Promise<UpdateCheckResult> => {
    const result = await updater.checkForUpdates();

    if (result.status === "available") {
      setIsUpdateModalOpen(true);
      return result;
    }

    setStatusModal({
      isOpen: true,
      title:
        result.status === "none"
          ? "Sem atualizacao por enquanto"
          : result.status === "channel_unavailable"
            ? "Canal de atualizacao ainda nao publicado"
            : "Nao foi possivel verificar",
      description: result.message,
      type: result.status === "none" ? "info" : result.status === "channel_unavailable" ? "warning" : "error",
    });

    return result;
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      const pages = await dbService.getProjectPages(projectId);
      const glossary = await dbService.getProjectGlossary(projectId);
      setPages(pages);
      setProjectId(projectId);
      setGlossary(glossary);
      
      // Encontrar a primeira pagina que nao esta completada
      const firstIncompleteIndex = pages.findIndex(p => p.status !== 'completed');
      if (firstIncompleteIndex !== -1) {
        setPageIndex(firstIncompleteIndex);
      } else {
        setPageIndex(0);
      }
      
      setCurrentView('editor');
    } catch (error) {
      console.error("Erro ao abrir projeto:", error);
      setStatusModal({
        isOpen: true,
        title: "Erro ao Abrir",
        description: "Não foi possível carregar as páginas do projeto.",
        type: "error",
      });
    }
  };

  return (
    <MangaBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Estilo Lombada de Tankōbon */}
        <aside className="relative z-20 flex w-[118px] flex-col border-r-2 border-nanquim bg-nanquim-deep px-3 py-6 shadow-ink select-none before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-hanko">
          <div className="mb-6 flex justify-center">
            <BrandMark compact />
          </div>

          <nav className="flex flex-1 flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.disabled) {
                      return;
                    }

                    setCurrentView(item.id);
                  }}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                    isActive
                      ? "border-hanko bg-nanquim-surface text-washi shadow-hanko translate-x-1"
                      : "border-nanquim-border bg-nanquim-surface/40 text-washi/60 hover:border-nanquim hover:bg-nanquim-surface hover:text-washi hover:shadow-ink active:translate-x-[1px] active:translate-y-[1px]"
                  } ${item.disabled ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 ${
                      isActive
                        ? "border-hanko bg-hanko/15 text-hanko shadow-[inset_0_0_10px_rgba(232,56,43,0.2)]"
                        : "border-nanquim-border bg-nanquim-deep/60 text-washi/70 group-hover:border-nanquim group-hover:text-washi"
                    } transition-all`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-display text-xs uppercase tracking-wider text-current">
                      {item.label}
                    </div>
                    <div className="font-pixel text-[8px] uppercase tracking-wider opacity-60">
                      {item.caption}
                    </div>
                  </div>
                  {/* Selo ativo sutil */}
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-hanko font-brush text-[7px] font-bold text-white shadow-[1px_1px_0px_#000]">
                      印
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-app-bg text-app-text-primary">
          <Suspense fallback={<ViewLoader view={currentView} />}>
            {currentView === 'settings' && (
              <div className="h-full overflow-y-auto p-6">
                <SettingsView
                  onBack={() => setCurrentView('dashboard')}
                  appVersion={updater.appVersion}
                  availableUpdate={updater.availableUpdate}
                  isCheckingUpdates={updater.isChecking}
                  isInstallingUpdate={updater.isInstalling}
                  updateProgressPercent={updater.progressPercent}
                  updateStatusMessage={updater.statusMessage}
                  lastUpdateCheck={updater.lastCheckedAt}
                  updateError={updater.lastError}
                  onCheckForUpdates={handleManualUpdateCheck}
                  onInstallUpdate={updater.installUpdate}
                />
              </div>
            )}

            {currentView === 'dashboard' && (
              <main className="relative flex h-full flex-col overflow-y-auto px-8 py-8 pb-10">
                <OnboardingOverlay />
                <div className="mx-auto flex w-full max-w-[1680px] flex-col">
                <header className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-[720px]">
                    <BrandMark />
                    <p className="mt-4 max-w-[620px] font-body text-xs md:text-sm leading-relaxed text-washi/70">
                      Traduza capítulos de mangá com autenticidade editorial: recepcione manuscritos, refine balões com visão computacional e exporte sem perda de fidelidade gráfica.
                    </p>
                  </div>

                  <div className="flex flex-col items-start xl:items-end gap-2.5">
                    <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2.5">
                      {/* Seletor de Motor Unificado */}
                      <div className="flex h-11 items-center gap-1 rounded-xl border-2 border-nanquim bg-nanquim-surface p-1 shadow-ink">
                        <button 
                          onClick={() => setTranslationEngine("gemini")}
                          className={`flex h-8.5 items-center gap-1.5 px-3 rounded-lg border text-[10px] font-display uppercase tracking-wider transition-all ${
                            translationEngine === "gemini" 
                              ? "border-hanko bg-hanko text-white shadow-[1px_1px_0px_#000]" 
                              : "border-transparent text-washi/70 hover:border-nanquim-border hover:bg-nanquim-deep/60 hover:text-washi"
                          }`}
                        >
                          <GeminiLogo className="w-3.5 h-3.5" />
                          <span>Gemini</span>
                        </button>

                        <button 
                          onClick={() => setTranslationEngine("ollama")}
                          className={`flex h-8.5 items-center gap-1.5 px-3 rounded-lg border text-[10px] font-display uppercase tracking-wider transition-all ${
                            translationEngine === "ollama" 
                              ? "border-hanko bg-hanko text-white shadow-[1px_1px_0px_#000]" 
                              : "border-transparent text-washi/70 hover:border-nanquim-border hover:bg-nanquim-deep/60 hover:text-washi"
                          }`}
                        >
                          <OllamaLogo className="w-3.5 h-3.5 text-current" />
                          <span>Ollama</span>
                        </button>

                        <button
                          onClick={() => setTranslationEngine("openaiCompatible")}
                          className={`flex h-8.5 items-center gap-1.5 px-3 rounded-lg border text-[10px] font-display uppercase tracking-wider transition-all ${
                            translationEngine === "openaiCompatible" 
                              ? "border-hanko bg-hanko text-white shadow-[1px_1px_0px_#000]" 
                              : "border-transparent text-washi/70 hover:border-nanquim-border hover:bg-nanquim-deep/60 hover:text-washi"
                          }`}
                        >
                          {getProviderLogo(selectedOpenAiProvider.id, "w-3.5 h-3.5")}
                          <span>{selectedOpenAiProvider.label || "APIs"}</span>
                        </button>
                      </div>

                      {/* Seletor de Modelo Dropdown com Altura Alinhada */}
                      <div className="relative" ref={modelDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                          className="flex h-11 items-center gap-2 rounded-xl border-2 border-nanquim bg-nanquim-surface px-3.5 shadow-ink transition-all hover:border-hanko hover:shadow-hanko active:translate-x-[1px] active:translate-y-[1px]"
                          title="Clique para alternar o modelo de IA"
                        >
                          <span className="font-display text-[9px] uppercase tracking-wider text-washi/40">
                            MODELO //
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            {translationEngine === "gemini" && (
                              <>
                                <GeminiLogo className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="font-pixel text-[11px] text-hanko font-bold">
                                  {selectedGeminiModel.label}
                                </span>
                              </>
                            )}

                            {translationEngine === "openaiCompatible" && (
                              <>
                                {getProviderLogo(selectedOpenAiProvider.id, "h-3.5 w-3.5 flex-shrink-0 text-hanko")}
                                <span className="max-w-[150px] truncate font-pixel text-[11px] text-hanko font-bold">
                                  {openAiCompatibleModel}
                                </span>
                              </>
                            )}

                            {translationEngine === "ollama" && (
                              <>
                                <OllamaLogo className="h-3.5 w-3.5 flex-shrink-0 text-washi" />
                                <span className="font-pixel text-[11px] text-hanko font-bold">
                                  {selectedOllamaModel.label}
                                </span>
                              </>
                            )}
                          </div>

                          <ChevronDown size={12} className={`text-washi/50 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isModelDropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border-2 border-nanquim bg-nanquim-surface p-2 shadow-ink z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="mb-2 px-2 py-1 border-b border-nanquim-border/60">
                              <span className="font-pixel text-[9px] uppercase tracking-widest text-washi/40">
                                SELECIONAR MODELO // {translationEngine === "gemini" ? "Gemini" : translationEngine === "ollama" ? "Ollama" : selectedOpenAiProvider.label}
                              </span>
                            </div>

                            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                              {translationEngine === "gemini" &&
                                GEMINI_MODEL_OPTIONS.map((model) => {
                                  const isSelected = geminiModel === model.id;
                                  return (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => {
                                        setGeminiModel(model.id);
                                        setIsModelDropdownOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                                        isSelected
                                          ? "border border-hanko/40 bg-hanko/10 text-washi"
                                          : "hover:bg-nanquim-dark/60 text-washi/80 hover:text-washi"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <GeminiLogo className="h-3.5 w-3.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <div className="font-display text-xs uppercase tracking-wide truncate">
                                            {model.label}
                                          </div>
                                          <div className="font-pixel text-[9px] text-washi/40 truncate">
                                            {getGeminiAccessLabel(model.access)}
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && <Check size={14} className="text-hanko flex-shrink-0" />}
                                    </button>
                                  );
                                })}

                              {translationEngine === "ollama" &&
                                OLLAMA_MODEL_OPTIONS.map((model) => {
                                  const isSelected = ollamaModel === model.id;
                                  return (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => {
                                        setOllamaModel(model.id);
                                        setIsModelDropdownOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                                        isSelected
                                          ? "border border-hanko/40 bg-hanko/10 text-washi"
                                          : "hover:bg-nanquim-dark/60 text-washi/80 hover:text-washi"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <OllamaLogo className="h-3.5 w-3.5 flex-shrink-0 text-washi" />
                                        <div className="min-w-0">
                                          <div className="font-display text-xs uppercase tracking-wide truncate">
                                            {model.label}
                                          </div>
                                          <div className="font-pixel text-[9px] text-washi/40 truncate">
                                            {model.sizeLabel}
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && <Check size={14} className="text-hanko flex-shrink-0" />}
                                    </button>
                                  );
                                })}

                              {translationEngine === "openaiCompatible" &&
                                selectedOpenAiProvider.models.map((model) => {
                                  const isSelected = openAiCompatibleModel === model.id;
                                  return (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => {
                                        setOpenAiCompatibleModel(model.id);
                                        setOpenRouterModelMode(
                                          selectedOpenAiProvider.id === "openrouter" && model.id === OPENROUTER_AUTO_FREE_MODEL_ID
                                            ? "auto-free"
                                            : "manual"
                                          );
                                        setIsModelDropdownOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                                        isSelected
                                          ? "border border-hanko/40 bg-hanko/10 text-washi"
                                          : "hover:bg-nanquim-dark/60 text-washi/80 hover:text-washi"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        {getProviderLogo(selectedOpenAiProvider.id, "h-3.5 w-3.5 flex-shrink-0 text-hanko")}
                                        <div className="min-w-0">
                                          <div className="font-display text-xs uppercase tracking-wide truncate">
                                            {model.label}
                                          </div>
                                          {model.recommended && (
                                            <div className="font-pixel text-[8px] text-emerald-400 uppercase tracking-widest">
                                              Sugestão
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {isSelected && <Check size={14} className="text-hanko flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* API Key Input */}
                      {translationEngine === "gemini" && (
                        <div
                          data-gemini-key-anchor="true"
                          className="flex h-11 items-center gap-2 rounded-xl border-2 border-nanquim bg-nanquim-surface px-3 shadow-ink animate-in fade-in slide-in-from-right-2 duration-300"
                          title="A chave é armazenada de forma segura no cofre do sistema."
                        >
                          <Key size={14} className="text-hanko shrink-0" />
                          <input 
                            type="password" 
                            placeholder="Gemini API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-36 bg-transparent border-none font-pixel text-xs text-washi outline-none placeholder:text-washi/30"
                          />
                        </div>
                      )}

                      {translationEngine === "openaiCompatible" && selectedOpenAiProvider.requiresApiKey && (
                        <div
                          className="flex h-11 items-center gap-2 rounded-xl border-2 border-nanquim bg-nanquim-surface px-3 shadow-ink animate-in fade-in slide-in-from-right-2 duration-300"
                          title="A chave é armazenada de forma segura no cofre do sistema."
                        >
                          <Key size={14} className="text-hanko shrink-0" />
                          <input
                            type="password"
                            placeholder={selectedOpenAiProvider.apiKeyLabel}
                            value={
                              selectedOpenAiProvider.id === "openrouter" ? openRouterApiKey :
                              selectedOpenAiProvider.id === "groq" ? groqApiKey :
                              customApiKey
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (selectedOpenAiProvider.id === "openrouter") setOpenRouterApiKey(val);
                              else if (selectedOpenAiProvider.id === "groq") setGroqApiKey(val);
                              else setCustomApiKey(val);
                            }}
                            className="w-36 bg-transparent border-none font-pixel text-xs text-washi outline-none placeholder:text-washi/30"
                          />
                        </div>
                      )}

                      {/* Ollama Status Pill */}
                      <div className={`flex h-11 items-center gap-2 rounded-xl border-2 px-3 shadow-ink transition-all ${ollamaStatus ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/40 bg-rose-500/10 text-rose-400'}`}>
                        <span className={`h-2 w-2 rounded-full ${ollamaStatus ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span className="font-pixel text-[10px] font-bold uppercase tracking-[0.16em]">Ollama: {ollamaStatus ? t('common.online') : t('common.offline')}</span>
                      </div>

                      {/* Botão de Atualizações */}
                      <button
                        type="button"
                        onClick={() => void handleManualUpdateCheck()}
                        className="flex h-11 items-center gap-2 rounded-xl border-2 border-nanquim bg-nanquim-surface px-3.5 font-pixel text-[10px] font-bold uppercase tracking-[0.16em] text-washi shadow-ink transition-all hover:border-hanko active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <RefreshCw size={13} className={updater.isChecking ? "animate-spin text-hanko" : "text-hanko"} />
                        <span>{updater.availableUpdate ? `v${updater.availableUpdate.version} Disp.` : "Atualizações"}</span>
                      </button>
                    </div>

                    {/* Sub-faixa de Especificação Editorial */}
                    <div className="flex items-center gap-2 font-pixel text-[9px] uppercase tracking-[0.16em]">
                      {translationEngine === "gemini" ? (
                        <>
                          <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold">
                            RECOMENDADO
                          </span>
                          <span className="text-washi/50">
                            Alta fidelidade editorial e melhor leitura visual de balões
                          </span>
                        </>
                      ) : translationEngine === "ollama" ? (
                        <>
                          <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold">
                            100% OFFLINE
                          </span>
                          <span className="text-washi/50">
                            Processamento local no seu PC via CPU/GPU
                          </span>
                        </>
                      ) : translationEngine === "openaiCompatible" ? (
                        <>
                          <span className="rounded border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-blue-400 font-bold">
                            EXTERNO
                          </span>
                          <span className="text-washi/50">
                            {selectedOpenAiProvider.label} com visão computacional
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </header>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <FileUpload onSuccess={() => setCurrentView('editor')} />
                  
                  {/* Card "Acessar Biblioteca (書庫 / Archives)" - Tomo Encadernado do Arquivo */}
                  <div 
                    onClick={() => setCurrentView('library')}
                    className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border-2 border-nanquim bg-nanquim-surface p-7 pl-9 md:pl-10 shadow-ink transition-all duration-300 hover:-translate-y-1 hover:border-nanquim-border hover:shadow-hanko"
                  >
                    {/* Lombada lateral de arquivo físico encadernado */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 md:w-5 bg-nanquim-deep border-r-2 border-nanquim flex flex-col justify-between items-center py-4 select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-hanko shadow-[0_0_3px_rgba(232,56,43,0.8)]" />
                      <span className="font-pixel text-[8px] font-bold text-washi/40 -rotate-90 tracking-widest whitespace-nowrap">
                        書庫 ARCHIVE
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-nanquim-border" />
                    </div>

                    {/* Retícula sutil e marcas de registro */}
                    <div className="halftone pointer-events-none absolute inset-0 opacity-[0.08]" />
                    <div className="pointer-events-none absolute -right-6 -bottom-6 h-36 w-36 rounded-full halftone opacity-10 transition-opacity group-hover:opacity-20" />
                    <span className="pointer-events-none absolute top-3 right-3 font-pixel text-[9px] text-washi/30 select-none">トンボ ⌝</span>
                    <span className="pointer-events-none absolute bottom-3 right-3 font-pixel text-[9px] text-washi/30 select-none">ARC-REG ⌟</span>
                    
                    <div>
                      {/* Selo Hanko 書庫 (Shoko) */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="inline-grid h-12 w-12 place-items-center bg-hanko text-white border-2 border-nanquim shadow-ink -rotate-2 select-none group-hover:rotate-0 transition-transform">
                            <span className="font-brush text-2xl font-black leading-none">書庫</span>
                          </div>
                          <div>
                            <span className="rounded border border-hanko/30 bg-hanko/10 px-2 py-0.5 font-pixel text-[9px] font-bold uppercase tracking-widest text-hanko">
                              REGISTRO EDITORIAL &bull; ACERVO CENTRAL
                            </span>
                            <div className="mt-1 font-pixel text-[10px] text-washi/50">
                              {recentProjects.length} {recentProjects.length === 1 ? 'VOLUME CATALOGADO' : 'VOLUMES CATALOGADOS'}
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-1 rounded border border-nanquim-border/70 bg-nanquim-deep/60 px-2.5 py-1 font-pixel text-[9px] text-washi/40 uppercase tracking-widest">
                          <BookOpen size={11} className="text-hanko" />
                          <span>TOMO FÍSICO</span>
                        </div>
                      </div>

                      <h3 className="mb-2 font-display text-2xl md:text-3xl uppercase tracking-wider text-washi transition-colors group-hover:text-gold">
                        ACERVO EDITORIAL DE MANUSCRITOS
                      </h3>
                      <p className="max-w-[460px] font-body text-xs md:text-sm leading-relaxed text-washi/70">
                        Consulte o catálogo completo de obras: retome qualquer capítulo antigo, gerencie glossários editoriais por série e exporte arquivos finais encadernados.
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t-2 border-nanquim-border/60 pt-4">
                      <div className="flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wider text-washi/50">
                        <Library size={13} className="text-hanko" />
                        <span>Índice Geral de Projetos</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-display text-xs uppercase tracking-widest text-washi/90 transition-all group-hover:text-hanko group-hover:translate-x-1">
                        <span>Acessar Biblioteca Completa</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mt-10 min-h-0">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="inline-grid h-7 w-7 place-items-center bg-hanko text-white border border-nanquim shadow-sm -rotate-3 select-none">
                          <span className="font-brush text-xs font-black leading-none">再開</span>
                        </div>
                        <span className="rounded border border-hanko/30 bg-hanko/10 px-2 py-0.5 font-pixel text-[10px] font-bold uppercase tracking-widest text-hanko">
                          RESUME &bull; FLUXO DE PRODUÇÃO
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-3xl uppercase tracking-wider text-washi">
                        Retomar <span className="text-hanko">Traduções</span>
                      </h2>
                      <p className="mt-1 font-body text-xs text-washi/60">
                        Continue rápido sem precisar abrir a aba de histórico
                      </p>
                    </div>

                    {recentProjects.length > 0 && (
                      <Button
                        variant="washi"
                        size="sm"
                        onClick={() => setCurrentView('library')}
                        className="gap-2 font-display text-xs uppercase tracking-wider shadow-ink hover:border-hanko transition-all"
                      >
                        <History size={14} />
                        Ver Todo o Acervo
                      </Button>
                    )}
                  </div>

                  {recentProjects.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-nanquim-border/80 bg-nanquim-surface/40 p-10 text-center shadow-ink">
                      {/* Retícula sutil */}
                      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" />

                      {/* Cantoneiras editoriais */}
                      <span className="pointer-events-none absolute top-3 left-3 font-pixel text-[9px] text-washi/30 select-none">⌜ 無</span>
                      <span className="pointer-events-none absolute top-3 right-3 font-pixel text-[9px] text-washi/30 select-none">EMPTY ⌝</span>
                      <span className="pointer-events-none absolute bottom-3 left-3 font-pixel text-[9px] text-washi/30 select-none">⌞ DRAFT</span>
                      <span className="pointer-events-none absolute bottom-3 right-3 font-pixel text-[9px] text-washi/30 select-none">NONE ⌟</span>

                      <div className="relative z-10 flex flex-col items-center">
                        {/* Selo Tradicional [無] (Mu / Vazio / Nada) */}
                        <div className="mb-4 inline-grid h-16 w-16 place-items-center border-2 border-nanquim-border bg-nanquim-deep text-app-text-secondary/50 shadow-ink -rotate-2 select-none">
                          <span className="font-brush text-4xl text-hanko/80">無</span>
                        </div>

                        <h3 className="font-display text-xl uppercase tracking-wider text-washi">
                          NENHUM TOMO EM ANDAMENTO // 無原稿
                        </h3>
                        <p className="mt-2 max-w-md font-body text-xs leading-relaxed text-washi/60">
                          Sua prancheta está livre. Assim que você recepcionar um capítulo na mesa editorial acima, ele será catalogado como um tomo físico ativo aqui para você continuar do ponto em que parou.
                        </p>

                        <div className="mt-4 flex items-center gap-2 rounded-full border border-app-border bg-app-surface px-4 py-1.5 font-pixel text-[9px] uppercase tracking-[0.18em] text-app-text-secondary/70">
                          <Clock3 size={12} className="text-hanko" />
                          PRANCHETA PRONTA PARA NOVO MANUSCRITO
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {recentProjects.map((project, index) => {
                        const isCompleted = project.status === "completed";
                        const progressVal = Math.round(project.progress || 0);

                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleOpenProject(project.id)}
                            className={`group relative min-w-0 overflow-hidden rounded-2xl border-2 border-app-border bg-app-card text-left shadow-ink transition-all duration-200 hover:-translate-y-1 hover:border-hanko hover:shadow-hanko flex ${
                              index === 0 ? "lg:col-span-2" : ""
                            }`}
                          >
                            {/* Lombada física de Tankōbon à esquerda */}
                            <div className={`${index === 0 ? "w-6 md:w-7" : "w-5 md:w-6"} bg-app-surface border-r-2 border-app-border flex flex-col justify-between items-center py-4 select-none shrink-0`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? "bg-emerald-400" : "bg-hanko"} shadow-[0_0_3px_rgba(232,56,43,0.8)]`} />
                              <div className="flex flex-col items-center gap-1 -rotate-90 whitespace-nowrap">
                                <span className="font-pixel text-[7px] md:text-[8px] font-bold text-app-text-secondary/60 tracking-widest">
                                  TANKŌBON
                                </span>
                                <span className="font-pixel text-[7px] text-hanko font-bold">
                                  VOL.{String(index + 1).padStart(2, '0')}
                                </span>
                              </div>
                              <span className="h-1.5 w-1.5 rounded-full bg-app-border" />
                            </div>

                            {/* Conteúdo do Tomo */}
                            {index === 0 ? (
                              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_240px] flex-1 min-w-0">
                                <div className="relative flex h-full min-w-0 flex-col justify-between p-6">
                                  <div>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                      {/* Carimbo de Status Hanko [済] ou [進] */}
                                      {isCompleted ? (
                                        <span className="inline-flex items-center gap-1.5 border border-emerald-600/60 bg-emerald-950/40 px-2.5 py-0.5 font-pixel text-[9px] font-bold uppercase tracking-wider text-emerald-400 shadow-[1px_1px_0px_#000]">
                                          <span className="font-brush text-xs font-black">済</span>
                                          <span>CONCLUÍDO</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 border border-hanko/60 bg-hanko/15 px-2.5 py-0.5 font-pixel text-[9px] font-bold uppercase tracking-wider text-hanko shadow-[1px_1px_0px_#000]">
                                          <span className="font-brush text-xs font-black">進</span>
                                          <span>EM ANDAMENTO</span>
                                        </span>
                                      )}

                                      <span className="font-pixel text-[10px] uppercase tracking-widest text-app-text-secondary/60">
                                        {formatProjectDate(project.updated_at)}
                                      </span>
                                    </div>

                                    <h3 className="break-words font-display text-2xl uppercase tracking-wide text-app-text-primary transition-colors group-hover:text-gold line-clamp-2">
                                      {project.name}
                                    </h3>

                                    <p className="mt-2 max-w-2xl font-body text-xs leading-relaxed text-app-text-secondary">
                                      Tomo mais recente em edição. Clique para continuar o refinamento editorial dos blocos e retoque de balões.
                                    </p>
                                  </div>

                                  <div className="relative mt-6 border-t-2 border-app-border/60 pt-4">
                                    <div className="mb-2 flex items-center justify-between font-pixel text-[11px] text-app-text-secondary">
                                      <span className="flex items-center gap-1.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-hanko'}`} />
                                        Progresso Editorial
                                      </span>
                                      <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-hanko'}`}>
                                        {progressVal}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-app-border bg-app-surface">
                                      <div
                                        className={`h-full bar-stripes transition-all duration-700 ${
                                          isCompleted ? "bg-emerald-500" : "bg-hanko"
                                        }`}
                                        style={{ width: `${progressVal}%` }}
                                      />
                                    </div>

                                    <div className="mt-4 flex items-center justify-between font-display text-xs uppercase tracking-widest text-app-text-secondary transition-colors group-hover:text-hanko">
                                      <span>Continuar Edição do Tomo</span>
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-app-border bg-app-surface text-app-text-primary transition-all group-hover:border-hanko group-hover:bg-hanko group-hover:text-white shadow-ink">
                                        <Play size={10} />
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="relative hidden min-h-[220px] overflow-hidden border-l-2 border-app-border bg-app-surface lg:block">
                                  <ProjectThumbnail
                                    thumbnailPath={project.thumbnail_path}
                                    alt={`Preview de ${project.name}`}
                                    className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                                    fallbackClassName="flex h-full items-center justify-center bg-app-surface text-app-text-secondary/40"
                                    iconSize={36}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-l from-app-bg/10 via-transparent to-app-bg/80" />
                                  {/* Cantoneira de corte na miniatura */}
                                  <span className="pointer-events-none absolute top-2 right-2 font-pixel text-[8px] text-app-text-secondary/50">トンボ ⌝</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full min-w-0 flex-1 flex-col p-5 justify-between">
                                <div>
                                  <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl border-2 border-app-border bg-app-surface">
                                    <ProjectThumbnail
                                      thumbnailPath={project.thumbnail_path}
                                      alt={`Preview de ${project.name}`}
                                      className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                                      fallbackClassName="flex h-full items-center justify-center text-app-text-secondary/40"
                                      iconSize={32}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-app-bg/85 via-app-bg/20 to-transparent" />
                                  </div>

                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    {isCompleted ? (
                                      <span className="inline-flex items-center gap-1 border border-emerald-600/60 bg-emerald-950/40 px-2 py-0.5 font-pixel text-[8px] font-bold uppercase tracking-wider text-emerald-400 shadow-[1px_1px_0px_#000]">
                                        <span className="font-brush text-[11px] font-black">済</span>
                                        <span>CONCLUÍDO</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 border border-hanko/60 bg-hanko/15 px-2 py-0.5 font-pixel text-[8px] font-bold uppercase tracking-wider text-hanko shadow-[1px_1px_0px_#000]">
                                        <span className="font-brush text-[11px] font-black">進</span>
                                        <span>EM ANDAMENTO</span>
                                      </span>
                                    )}
                                    <span className="font-pixel text-[9px] uppercase tracking-widest text-app-text-secondary/50">
                                      {formatProjectDate(project.updated_at)}
                                    </span>
                                  </div>

                                  <h3 className="break-words font-display text-lg uppercase tracking-wide text-app-text-primary transition-colors group-hover:text-gold line-clamp-1">
                                    {project.name}
                                  </h3>
                                </div>

                                <div className="relative mt-4 border-t-2 border-app-border/60 pt-3">
                                  <div className="mb-1.5 flex items-center justify-between font-pixel text-[10px] text-app-text-secondary">
                                    <span>Progresso</span>
                                    <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-hanko'}`}>
                                      {progressVal}%
                                    </span>
                                  </div>
                                  <div className="h-2 w-full overflow-hidden rounded-full border border-app-border bg-app-surface">
                                    <div
                                      className={`h-full bar-stripes transition-all duration-700 ${
                                        isCompleted ? "bg-emerald-500" : "bg-hanko"
                                      }`}
                                      style={{ width: `${progressVal}%` }}
                                    />
                                  </div>

                                  <div className="mt-3 flex items-center justify-between font-display text-xs uppercase tracking-widest text-app-text-secondary transition-colors group-hover:text-hanko">
                                    <span>Abrir Tomo</span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-app-border bg-app-surface text-app-text-primary transition-all group-hover:border-hanko group-hover:bg-hanko group-hover:text-white shadow-ink">
                                      <Play size={8} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
                </div>
              </main>
            )}

            {currentView === 'library' && (
              <div className="h-full p-4">
                <LibraryView onOpenProject={handleOpenProject} />
              </div>
            )}

            {currentView === 'editor' && (
              <div className="h-full p-4">
                <ErrorBoundary>
                  <EditorView onBack={() => setCurrentView('library')} />
                </ErrorBoundary>
              </div>
            )}
          </Suspense>
        </div>

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          title={statusModal.title}
          description={statusModal.description}
          type={statusModal.type}
        />
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          update={updater.availableUpdate}
          isInstalling={updater.isInstalling}
          progressPercent={updater.progressPercent}
          statusMessage={updater.statusMessage}
          onInstall={updater.installUpdate}
        />
      </div>
    </MangaBackground>
  );
}

export default App;
