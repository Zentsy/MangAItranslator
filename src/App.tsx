import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import MangaBackground from "@/components/MangaBackground";
import EditorView from "@/components/EditorView";
import LibraryView from "@/components/LibraryView";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService, DBProject } from "@/services/dbService";
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

function App() {
  const { t } = useTranslation();
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'library'>('dashboard');
  const [recentProjects, setRecentProjects] = useState<DBProject[]>([]);
  const { apiKey, setApiKey, setPages, setProjectId, currentProjectId } = useMangaStore();

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
      setCurrentView('editor');
    } catch (error) {
      console.error("Erro ao abrir projeto:", error);
      alert("Falha ao carregar páginas do projeto.");
    }
  };

  return (
    <MangaBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-8 bg-black/40 backdrop-blur-md relative z-20">
          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-4">
            <span className="text-xl font-bold italic tracking-tighter">MA</span>
          </div>
          
          <nav className="flex flex-col gap-6 flex-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('dashboard')} className={`hover:bg-white/5 transition-all ${currentView === 'dashboard' ? 'text-white bg-white/10' : 'text-white/50'}`}>
              <LayoutGrid size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('library')} className={`hover:bg-white/5 transition-all ${currentView === 'library' ? 'text-white bg-white/10' : 'text-white/50'}`}>
              <Library size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { if(currentProjectId) setCurrentView('editor'); }} className={`hover:bg-white/5 transition-all ${currentView === 'editor' ? 'text-white bg-white/10' : 'text-white/50'} ${!currentProjectId ? 'opacity-20 cursor-not-allowed' : ''}`}>
              <FileImage size={24} />
            </Button>
          </nav>

          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white/50 hover:text-white mt-auto">
            <Settings size={24} />
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {currentView === 'dashboard' && (
            <main className="h-full flex flex-col p-8 relative">
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">{t('dashboard.title')} <span className="text-white/40">Translator</span></h1>
                  <p className="text-white/40 text-sm font-mono tracking-widest mt-1 uppercase">{t('dashboard.subtitle')}</p>
                </div>

                <div className="flex gap-4">
                   <div className="flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                      <Key size={14} className="text-white/40" />
                      <input 
                        type="password" 
                        placeholder="Gemini API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] w-32 font-mono text-white/80 placeholder:text-white/20"
                      />
                   </div>
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${ollamaStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'} transition-all`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Ollama: {ollamaStatus ? t('common.online') : t('common.offline')}</span>
                  </div>
                </div>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FileUpload onSuccess={() => setCurrentView('editor')} />
                
                <div 
                  onClick={() => setCurrentView('library')}
                  className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer overflow-hidden"
                >
                   <h3 className="text-xl font-bold mb-2 uppercase italic">{t('dashboard.history.title')}</h3>
                   <p className="text-sm text-white/40 leading-relaxed">{t('dashboard.history.description')}</p>
                   <div className="mt-6 flex items-center justify-end text-[10px] font-bold text-white/20 group-hover:text-white transition-all uppercase tracking-widest gap-1">
                      Acessar Biblioteca <ChevronRight size={12} />
                   </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                      Retomar <span className="text-white/20">Traducoes</span>
                    </h2>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/35">
                      Continue rapido sem precisar abrir a aba de historico
                    </p>
                  </div>

                  {recentProjects.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView('library')}
                      className="gap-2 text-white/50 hover:bg-white/5 hover:text-white"
                    >
                      <History size={14} />
                      Ver Tudo
                    </Button>
                  )}
                </div>

                {recentProjects.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/35">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
                      <Clock3 size={18} className="text-white/20" />
                      Nenhuma traducao recente ainda
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/30">
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
                        className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09] ${
                          index === 0
                            ? "border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent lg:col-span-2"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

                        <div className="relative flex h-full flex-col justify-between">
                          <div>
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] ${
                                  project.status === "completed"
                                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border border-white/10 bg-white/5 text-white/45"
                                }`}
                              >
                                {project.status === "completed" ? "Concluido" : "Em andamento"}
                              </span>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                                {formatProjectDate(project.updated_at)}
                              </span>
                            </div>

                            <h3 className="max-w-xl text-2xl font-black uppercase tracking-tight">
                              {project.name}
                            </h3>

                            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">
                              {index === 0
                                ? "Volte direto para o capitulo mais recente e continue refinando os blocos sem procurar no historico."
                                : "Projeto recente pronto para continuar do ponto em que voce parou."}
                            </p>
                          </div>

                          <div className="relative mt-8">
                            <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/35">
                              <span>Progresso salvo</span>
                              <span>{Math.round(project.progress || 0)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full bg-white transition-all duration-700"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>

                            <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition-colors group-hover:text-white">
                              <span>Continuar traducao</span>
                              <Play size={12} />
                            </div>
                          </div>
                        </div>
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
      </div>
    </MangaBackground>
  );
}

export default App;
