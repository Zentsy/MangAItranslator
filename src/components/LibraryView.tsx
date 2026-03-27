import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { dbService, DBProject } from "@/services/dbService";
import { useMangaStore } from "@/store/useMangaStore";
import { ask } from "@tauri-apps/plugin-dialog";
import { Search, FolderOpen, Clock, Trash2, ChevronRight } from "lucide-react";

interface LibraryViewProps {
  onOpenProject: (projectId: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenProject }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [searchTerm, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const { currentProjectId, clearStore, cancelPendingSaves } = useMangaStore();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await dbService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const confirmed = await ask(t("common.confirmDelete"), {
      title: "MangAI Translator",
      kind: "warning",
    });

    if (!confirmed) {
      return;
    }

    if (id === currentProjectId) {
      cancelPendingSaves();
    }

    await dbService.deleteProject(id);

    if (id === currentProjectId) {
      clearStore();
    }

    await loadProjects();
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/20 p-8 backdrop-blur-sm">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            Biblioteca <span className="text-white/20">Local</span>
          </h2>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-white/40">
            Sincronizacao SQLite Ativa
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Search size={16} className="text-white/20" />
            <input
              type="text"
              placeholder="Buscar obra..."
              value={searchTerm}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-48 border-none bg-transparent text-xs font-mono text-white/80 outline-none placeholder:text-white/20"
            />
          </div>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-white/10">
            <FolderOpen size={48} strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.3em]">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.08]"
              >
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />

                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-500">
                    {project.status === "completed" ? "Concluido" : "Em Progresso"}
                  </div>
                  <button
                    onClick={(event) => handleDelete(project.id, event)}
                    className="relative z-30 rounded-lg p-1.5 text-white/10 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="mb-1 truncate pr-8 text-lg font-bold uppercase italic transition-colors group-hover:text-white">
                  {project.name}
                </h3>
                <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase text-white/30">
                  <Clock size={12} />
                  <span>Capitulo {project.chapter}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-white/40">
                    <span>Progresso</span>
                    <span>{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest text-white/20 transition-all group-hover:text-white">
                  Continuar <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
