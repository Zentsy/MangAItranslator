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
import { Button } from "@/components/ui/button";
import { getOllamaModelOption } from "@/config/ollamaModels";
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
} from "lucide-react";

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
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'library' | 'settings'>('dashboard');
  const [recentProjects, setRecentProjects] = useState<DBProject[]>([]);
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
        <aside className="w-20 border-r border-app-border flex flex-col items-center py-8 gap-8 bg-app-surface/40 backdrop-blur-md relative z-20">
          <div className="w-12 h-12 bg-app-surface/50 rounded-xl border border-app-border flex items-center justify-center mb-4">
            <span className="text-xl font-bold italic tracking-tighter text-app-text-primary">MA</span>
          </div>
          
          <nav className="flex flex-col gap-6 flex-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('dashboard')} className={`hover:bg-app-surface/50 transition-all ${currentView === 'dashboard' ? 'text-app-text-primary bg-app-surface' : 'text-app-text-secondary'}`}>
              <LayoutGrid size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('library')} className={`hover:bg-app-surface/50 transition-all ${currentView === 'library' ? 'text-app-text-primary bg-app-surface' : 'text-app-text-secondary'}`}>
              <Library size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { if(currentProjectId) setCurrentView('editor'); }} className={`hover:bg-app-surface/50 transition-all ${currentView === 'editor' ? 'text-app-text-primary bg-app-surface' : 'text-app-text-secondary'} ${!currentProjectId ? 'opacity-20 cursor-not-allowed' : ''}`}>
              <FileImage size={24} />
            </Button>
          </nav>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentView('settings')}
            className={`hover:bg-app-surface/50 transition-all mt-auto ${currentView === 'settings' ? 'text-app-text-primary bg-app-surface' : 'text-app-text-secondary'}`}
          >
            <Settings size={24} />
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-app-bg text-app-text-primary">
          {currentView === 'settings' && (
            <div className="h-full p-8 overflow-y-auto">
              <SettingsView onBack={() => setCurrentView('dashboard')} />
            </div>
          )}

          {currentView === 'dashboard' && (
            <main className="relative flex h-full flex-col overflow-y-auto p-8 pb-10">
              <OnboardingOverlay />
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic text-app-text-primary">{t('dashboard.title')} <span className="text-app-text-secondary/40">Translator</span></h1>
                  <p className="text-app-text-secondary text-sm font-mono tracking-widest mt-1 uppercase">{t('dashboard.subtitle')}</p>
                </div>

                <div className="flex gap-4">
                   <div className="flex items-center gap-2 px-2 py-1 bg-app-surface/50 border border-app-border rounded-full">
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
                   {translationEngine === "gemini" && (
                     <div className="flex items-center gap-2 px-4 py-1 bg-app-surface/50 border border-app-border rounded-full animate-in fade-in slide-in-from-right-2 duration-300">
                        <Key size={14} className="text-app-text-secondary" />
                        <input 
                          type="password" 
                          placeholder="Gemini API Key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                         className="bg-transparent border-none outline-none text-[10px] w-32 font-mono text-app-text-primary placeholder:text-app-text-secondary/30"
                        />
                     </div>
                   )}
                   {translationEngine === "ollama" && (
                     <div className="flex items-center gap-2 px-4 py-1 bg-app-surface/50 border border-app-border rounded-full animate-in fade-in slide-in-from-right-2 duration-300">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/60">
                          Modelo
                        </span>
                        <span className="text-[10px] font-mono text-app-text-primary">
                          {selectedOllamaModel.label}
                        </span>
                     </div>
                   )}
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${ollamaStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'} transition-all`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Ollama: {ollamaStatus ? t('common.online') : t('common.offline')}</span>
                  </div>
                </div>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FileUpload onSuccess={() => setCurrentView('editor')} />
                
                <div 
                  onClick={() => setCurrentView('library')}
                  className="group relative p-6 bg-app-surface/50 border border-app-border rounded-2xl hover:bg-app-surface transition-all cursor-pointer overflow-hidden"
                >
                   <h3 className="text-xl font-bold mb-2 uppercase italic text-app-text-primary">{t('dashboard.history.title')}</h3>
                   <p className="text-sm text-app-text-secondary leading-relaxed">{t('dashboard.history.description')}</p>
                   <div className="mt-6 flex items-center justify-end text-[10px] font-bold text-app-text-secondary/40 group-hover:text-app-text-primary transition-all uppercase tracking-widest gap-1">
                      Acessar Biblioteca <ChevronRight size={12} />
                   </div>
                </div>
              </section>

              <section className="mt-8 min-h-0">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-app-text-primary">
                      Retomar <span className="text-app-text-secondary/40">Traducoes</span>
                    </h2>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/60">
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
                  <div className="rounded-3xl border border-app-border bg-app-surface/30 p-6 text-app-text-secondary/60">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
                      <Clock3 size={18} className="text-app-text-secondary/40" />
                      Nenhuma traducao recente ainda
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">
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
                          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_300px]">
                            <div className="relative flex h-full min-w-0 flex-col justify-between p-6">
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

                                <h3 className="max-w-3xl break-words text-2xl font-black uppercase tracking-tight leading-tight text-app-text-primary">
                                  {project.name}
                                </h3>

                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-app-text-secondary">
                                  Volte direto para o capitulo mais recente e continue refinando os blocos sem procurar no historico.
                                </p>
                              </div>

                              <div className="relative mt-8">
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

                                <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-app-text-secondary/40 transition-colors group-hover:text-app-text-primary">
                                  <span>Continuar traducao</span>
                                  <Play size={12} />
                                </div>
                              </div>
                            </div>

                            <div className="relative hidden min-h-[260px] overflow-hidden border-l border-app-border lg:block">
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
                          <div className="flex h-full min-w-0 flex-col p-6">
                            <div className="relative mb-5 overflow-hidden rounded-2xl border border-app-border bg-app-surface/50 aspect-[16/10]">
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

                                <h3 className="break-words text-2xl font-black uppercase tracking-tight leading-tight text-app-text-primary">
                                  {project.name}
                                </h3>

                                <p className="mt-3 text-sm leading-relaxed text-app-text-secondary">
                                  Projeto recente pronto para continuar do ponto em que voce parou.
                                </p>
                              </div>

                              <div className="relative mt-8">
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

                                <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-app-text-secondary/40 transition-colors group-hover:text-app-text-primary">
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
      </div>
    </MangaBackground>
  );
}

export default App;
