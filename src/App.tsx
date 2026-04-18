import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import MangaBackground from "@/components/MangaBackground";
import EditorView from "@/components/EditorView";
import LibraryView from "@/components/LibraryView";
import SettingsView from "@/components/SettingsView";
import FileUpload from "@/components/FileUpload";
import StatusModal, { StatusType } from "@/components/StatusModal";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import BrandMark from "@/components/BrandMark";
import UpdateModal from "@/components/UpdateModal";
import { Button } from "@/components/ui/button";
import { getOllamaModelOption } from "@/config/ollamaModels";
import { useAppUpdater, type UpdateCheckResult } from "@/hooks/useAppUpdater";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService, DBProject, resolveAssetUrl } from "@/services/dbService";
import {
  LayoutGrid,
  FileImage,
  Settings,
  Key,
  Library,
  ChevronRight,
  Clock3,
  History,
  Play,
  RefreshCw,
} from "lucide-react";

type AppView = "dashboard" | "editor" | "library" | "settings";

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
    setPages, 
    setProjectId, 
    setPageIndex,
    currentProjectId, 
    translationEngine, 
    setTranslationEngine,
    ollamaModel,
  } = useMangaStore();
  const selectedOllamaModel = getOllamaModelOption(ollamaModel);
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
    } catch (e) {
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
      setPages(pages);
      setProjectId(projectId);
      
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
        {/* Sidebar */}
        <aside className="relative z-20 flex w-[112px] flex-col border-r border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-3 py-6 backdrop-blur-md">
          <div className="mb-6 flex justify-center">
            <BrandMark compact />
          </div>

          <nav className="flex flex-1 flex-col gap-2.5">
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
                  className={`group flex flex-col items-center gap-2 rounded-[1.45rem] border px-2.5 py-3 text-center transition-all ${
                    isActive
                      ? "border-app-accent/30 bg-app-surface/80 text-app-text-primary shadow-[0_18px_35px_-22px_rgba(0,0,0,0.8)]"
                      : "border-app-border bg-app-surface/25 text-app-text-secondary hover:bg-app-surface/45 hover:text-app-text-primary"
                  } ${item.disabled ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[1rem] border ${isActive ? "border-app-accent/20 bg-app-bg/55" : "border-app-border bg-app-bg/35"} transition-all`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.16em]">
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-[7px] font-mono uppercase tracking-[0.16em] text-app-text-secondary/45 group-hover:text-app-text-secondary/70">
                      {item.caption}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

        </aside>

        {/* Main Content Area */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-app-bg text-app-text-primary">
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
                  <p className="mt-5 max-w-[620px] text-[14px] leading-relaxed text-app-text-secondary/62">
                    Traduza capitulos com um fluxo editorial mais limpo: importe, gere o draft, refine os blocos e exporte sem perder contexto.
                  </p>
                </div>

                <div className="flex flex-wrap items-start justify-start gap-3 xl:max-w-[760px] xl:justify-end">
                   <button
                      type="button"
                      onClick={() => void handleManualUpdateCheck()}
                      className="flex h-12 items-center gap-2 rounded-full border border-app-border bg-app-surface/50 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-app-text-secondary transition-all hover:bg-app-surface hover:text-app-text-primary"
                    >
                      <RefreshCw size={14} className={updater.isChecking ? "animate-spin" : ""} />
                      {updater.availableUpdate ? `Atualizacao ${updater.availableUpdate.version}` : "Verificar atualizacao"}
                    </button>
                   <div className="flex flex-col gap-2 rounded-[1.6rem] border border-app-border bg-app-surface/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setTranslationEngine("gemini")}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${translationEngine === "gemini" ? "bg-app-text-primary text-app-bg" : "text-app-text-secondary hover:text-app-text-primary"}`}
                        >
                          Gemini
                        </button>
                        <button 
                          onClick={() => setTranslationEngine("ollama")}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${translationEngine === "ollama" ? "bg-app-text-primary text-app-bg" : "text-app-text-secondary hover:text-app-text-primary"}`}
                        >
                          Ollama
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.16em]">
                        {translationEngine === "gemini" ? (
                          <>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-400">
                              Recomendado
                            </span>
                            <span className="max-w-[260px] text-app-text-secondary/50">
                              Melhor qualidade e fluxo principal do app
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-400">
                              Modo local
                            </span>
                            <span className="max-w-[260px] text-app-text-secondary/50">
                              Roda no seu PC e pode variar bastante de velocidade
                            </span>
                          </>
                        )}
                      </div>
                   </div>
                   {translationEngine === "gemini" && (
                     <div
                        data-gemini-key-anchor="true"
                        className="flex h-12 items-center gap-2 rounded-full border border-app-border bg-app-surface/50 px-4 py-1 animate-in fade-in slide-in-from-right-2 duration-300"
                      >
                        <Key size={14} className="text-app-text-secondary" />
                        <input 
                          type="password" 
                          placeholder="Gemini API Key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                         className="w-36 bg-transparent border-none text-[10px] font-mono text-app-text-primary outline-none placeholder:text-app-text-secondary/30"
                        />
                     </div>
                   )}
                   {translationEngine === "ollama" && (
                     <div className="flex h-12 items-center gap-2 rounded-full border border-app-border bg-app-surface/50 px-4 py-1 animate-in fade-in slide-in-from-right-2 duration-300">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/60">
                          Modelo
                        </span>
                        <span className="text-[10px] font-mono text-app-text-primary">
                          {selectedOllamaModel.label}
                        </span>
                     </div>
                   )}
                  <div className={`flex h-12 items-center gap-3 rounded-full border px-4 py-2 ${ollamaStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'} transition-all`}>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Ollama: {ollamaStatus ? t('common.online') : t('common.offline')}</span>
                  </div>
                </div>
              </header>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <FileUpload onSuccess={() => setCurrentView('editor')} />
                
                <div 
                  onClick={() => setCurrentView('library')}
                  className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-app-border bg-app-surface/50 p-7 transition-all hover:bg-app-surface"
                >
                   <h3 className="mb-3 text-xl font-bold uppercase italic text-app-text-primary">{t('dashboard.history.title')}</h3>
                   <p className="max-w-[420px] text-[14px] leading-relaxed text-app-text-secondary">{t('dashboard.history.description')}</p>
                   <div className="mt-8 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest text-app-text-secondary/40 transition-all group-hover:text-app-text-primary">
                      Acessar Biblioteca <ChevronRight size={12} />
                   </div>
                </div>
              </section>

              <section className="mt-10 min-h-0">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-[1.8rem] font-black uppercase tracking-tighter italic text-app-text-primary">
                      Retomar <span className="text-app-text-secondary/40">Traducoes</span>
                    </h2>
                    <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.22em] text-app-text-secondary/60">
                      Continue rapido sem precisar abrir a aba de historico
                    </p>
                  </div>

                  {recentProjects.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView('library')}
                      className="gap-2 text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
                    >
                      <History size={14} />
                      Ver Tudo
                    </Button>
                  )}
                </div>

                {recentProjects.length === 0 ? (
                  <div className="rounded-[2rem] border border-app-border bg-app-surface/30 p-8 text-app-text-secondary/60">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
                      <Clock3 size={18} className="text-app-text-secondary/40" />
                      Nenhuma traducao recente ainda
                    </div>
                    <p className="mt-3 max-w-[760px] text-[15px] leading-relaxed">
                      Assim que voce importar um capitulo, ele aparece aqui para voce continuar do ponto em que parou.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {recentProjects.map((project, index) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleOpenProject(project.id)}
                        className={`group relative min-w-0 overflow-hidden rounded-3xl border text-left transition-all hover:-translate-y-0.5 hover:border-app-accent/20 hover:bg-app-surface/80 ${
                          index === 0
                            ? "border-app-border bg-gradient-to-br from-app-surface/50 via-app-surface/20 to-transparent lg:col-span-2"
                            : "border-app-border bg-app-surface/40"
                        }`}
                      >
                        {index === 0 ? (
                          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_240px]">
                            <div className="relative flex h-full min-w-0 flex-col justify-between p-5">
                              <div>
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] ${
                                      project.status === "completed"
                                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                        : "border border-app-border bg-app-surface text-app-text-secondary"
                                    }`}
                                  >
                                    {project.status === "completed" ? "Concluido" : "Em andamento"}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                    {formatProjectDate(project.updated_at)}
                                  </span>
                                </div>

                                <h3 className="max-w-3xl break-words text-[1.7rem] font-black uppercase tracking-tight leading-tight text-app-text-primary">
                                  {project.name}
                                </h3>

                                <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-app-text-secondary">
                                  Volte direto para o capitulo mais recente e continue refinando os blocos sem procurar no historico.
                                </p>
                              </div>

                              <div className="relative mt-6">
                                <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/60">
                                  <span>Progresso salvo</span>
                                  <span>{Math.round(project.progress || 0)}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-surface">
                                  <div
                                    className="h-full bg-app-text-primary transition-all duration-700"
                                    style={{ width: `${project.progress || 0}%` }}
                                  />
                                </div>

                                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/40 transition-colors group-hover:text-app-text-primary">
                                  <span>Continuar traducao</span>
                                  <Play size={12} />
                                </div>
                              </div>
                            </div>

                            <div className="relative hidden min-h-[220px] overflow-hidden border-l border-app-border lg:block">
                              <ProjectThumbnail
                                thumbnailPath={project.thumbnail_path}
                                alt={`Preview de ${project.name}`}
                                className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                                fallbackClassName="flex h-full items-center justify-center bg-app-surface text-app-text-secondary/20"
                                iconSize={36}
                              />
                              <div className="absolute inset-0 bg-gradient-to-l from-app-bg/10 via-transparent to-app-bg/80" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full min-w-0 flex-col p-5">
                            <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl border border-app-border bg-app-surface/50">
                              <ProjectThumbnail
                                thumbnailPath={project.thumbnail_path}
                                alt={`Preview de ${project.name}`}
                                className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                                fallbackClassName="flex h-full items-center justify-center text-app-text-secondary/20"
                                iconSize={32}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-app-bg/80 via-app-bg/15 to-transparent" />
                            </div>

                            <div className="flex h-full min-w-0 flex-col justify-between">
                              <div>
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] ${
                                      project.status === "completed"
                                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                        : "border border-app-border bg-app-surface text-app-text-secondary"
                                    }`}
                                  >
                                    {project.status === "completed" ? "Concluido" : "Em andamento"}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                                    {formatProjectDate(project.updated_at)}
                                  </span>
                                </div>

                                <h3 className="break-words text-[1.65rem] font-black uppercase tracking-tight leading-tight text-app-text-primary">
                                  {project.name}
                                </h3>

                                <p className="mt-3 text-[13px] leading-relaxed text-app-text-secondary">
                                  Projeto recente pronto para continuar do ponto em que voce parou.
                                </p>
                              </div>

                              <div className="relative mt-6">
                                <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/60">
                                  <span>Progresso salvo</span>
                                  <span>{Math.round(project.progress || 0)}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-surface">
                                  <div
                                    className="h-full bg-app-text-primary transition-all duration-700"
                                    style={{ width: `${project.progress || 0}%` }}
                                  />
                                </div>

                                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/40 transition-colors group-hover:text-app-text-primary">
                                  <span>Continuar traducao</span>
                                  <Play size={12} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
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
              <EditorView onBack={() => setCurrentView('library')} />
            </div>
          )}
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
