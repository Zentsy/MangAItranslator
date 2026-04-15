import React, { useEffect, useState } from "react";
import { dbService, DBProject } from "@/services/dbService";
import { useMangaStore } from "@/store/useMangaStore";
import ConfirmModal from "@/components/ConfirmModal";
import { Search, FolderOpen, Clock, Trash2, ChevronRight } from "lucide-react";

interface LibraryViewProps {
  onOpenProject: (projectId: string) => void;
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

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [searchTerm, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<DBProject | null>(null);

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

  const handleDeleteClick = (project: DBProject, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) {
      return;
    }

    const id = projectToDelete.id;

    if (id === currentProjectId) {
      cancelPendingSaves();
    }

    await dbService.deleteProject(id);

    if (id === currentProjectId) {
      clearStore();
    }

    setProjectToDelete(null);
    await loadProjects();
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-app-border bg-app-surface/20 p-8 backdrop-blur-sm">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-app-text-primary">
            Biblioteca <span className="text-app-text-secondary/20">Local</span>
          </h2>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-app-text-secondary/40">
            Sincronizacao SQLite Ativa
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-full border border-app-border bg-app-surface/50 px-4 py-2">
            <Search size={16} className="text-app-text-secondary/20" />
            <input
              type="text"
              placeholder="Buscar obra..."
              value={searchTerm}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-48 border-none bg-transparent text-xs font-mono text-app-text-primary outline-none placeholder:text-app-text-secondary/20"
            />
          </div>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-border border-t-app-accent" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-app-text-secondary/10">
            <FolderOpen size={48} strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.3em]">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-app-border bg-app-surface/40 p-6 transition-all hover:bg-app-surface/80"
              >
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-app-text-primary/5 blur-3xl transition-all group-hover:bg-app-text-primary/10" />

                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-500">
                    {project.status === "completed" ? "Concluido" : "Em Progresso"}
                  </div>
                  <button
                    onClick={(event) => handleDeleteClick(project, event)}
                    className="relative z-30 rounded-lg p-1.5 text-app-text-secondary/20 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="mb-1 truncate pr-8 text-lg font-bold uppercase italic text-app-text-primary transition-colors group-hover:text-app-accent">
                  {project.name}
                </h3>
                <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase text-app-text-secondary/40">
                  <Clock size={12} />
                  <span>{formatProjectDate(project.updated_at)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-app-text-secondary/60">
                    <span>Progresso</span>
                    <span>{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-app-surface">
                    <div
                      className="h-full bg-app-text-primary transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest text-app-text-secondary/20 transition-all group-hover:text-app-text-primary">
                  Continuar <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
        title="Excluir Capitulo?"
        description={
          projectToDelete
            ? `Isso vai remover "${projectToDelete.name}" do historico local e apagar o cache salvo deste projeto.`
            : ""
        }
        confirmText="Excluir do Historico"
        variant="destructive"
      />
    </div>
  );
};

export default LibraryView;
