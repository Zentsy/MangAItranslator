import React, { useEffect, useState, useMemo } from "react";
import { dbService, DBProject } from "@/services/dbService";
import { useMangaStore } from "@/store/useMangaStore";
import ConfirmModal from "@/components/ConfirmModal";
import NanquimLoading from "@/components/NanquimLoading";
import { Search, Clock, Trash2, ArrowUpRight, BookOpen, Layers } from "lucide-react";
import { WatojiBookIcon, HankoStampIcon } from "@/components/icons/MangaIcons";

interface LibraryViewProps {
  onOpenProject: (projectId: string) => void;
}

type FilterStatus = "all" | "in_progress" | "completed";

const formatProjectDate = (value: string) => {
  const parsedDate = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(parsedDate.getTime())) {
    return "Recém-registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [searchTerm, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<DBProject | null>(null);

  const { currentProjectId, clearStore, cancelPendingSaves } = useMangaStore();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await dbService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar projetos do arquivo SQLite:", error);
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
    if (!projectToDelete) return;

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

  // Contadores para os filtros
  const inProgressCount = useMemo(
    () => projects.filter((p) => p.status !== "completed").length,
    [projects]
  );
  const completedCount = useMemo(
    () => projects.filter((p) => p.status === "completed").length,
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStatus === "completed") return project.status === "completed";
      if (filterStatus === "in_progress") return project.status !== "completed";
      return true;
    });
  }, [projects, searchTerm, filterStatus]);

  return (
    <div className="flex h-full flex-col overflow-hidden border-2 border-app-border bg-app-surface/90 p-6 md:p-8 shadow-ink backdrop-blur-md relative">
      {/* Retícula sutil de fundo */}
      <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

      {/* Cabeçalho da Biblioteca Editorial */}
      <header className="mb-6 z-10 relative">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-app-border">
          <div className="flex items-center gap-3">
            {/* Selo Hanko 書庫 (Shoko = Arquivo/Biblioteca) */}
            <div className="inline-grid h-12 w-12 place-items-center bg-app-accent text-white border-2 border-app-text-primary shadow-ink-sm -rotate-2 select-none">
              <span className="font-brush text-2xl font-black leading-none">書庫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] font-bold uppercase tracking-widest text-app-accent">
                  MANGA ARCHIVE &bull; REGISTRO EDITORIAL
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-app-text-primary leading-none">
                BIBLIOTECA DE MANUSCRITOS
              </h2>
            </div>
          </div>

          {/* Campo de Busca Nanquim */}
          <div className="flex items-center gap-2 border-2 border-app-border bg-app-card px-3 py-1.5 shadow-ink-sm focus-within:border-app-accent focus-within:shadow-ink transition-all">
            <Search size={15} className="text-app-text-secondary" />
            <input
              type="text"
              placeholder="Buscar obra ou volume..."
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-44 md:w-60 border-none bg-transparent font-body text-xs font-bold text-app-text-primary outline-none placeholder:text-app-text-secondary/40 placeholder:font-normal"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="font-pixel text-[10px] text-app-text-secondary hover:text-app-accent"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros por Status (Hankos de Categoria) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-app-text-secondary/70 mr-1">
              FILTRAR:
            </span>
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all shadow-ink-sm ${
                filterStatus === "all"
                  ? "bg-app-accent text-white border-app-text-primary shadow-ink -translate-y-0.5"
                  : "bg-app-card text-app-text-primary border-app-border hover:border-app-accent"
              }`}
            >
              <span className="font-brush text-sm">[全]</span>
              <span>Todas ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("in_progress")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all shadow-ink-sm ${
                filterStatus === "in_progress"
                  ? "bg-amber-600 text-white border-app-text-primary shadow-ink -translate-y-0.5"
                  : "bg-app-card text-app-text-primary border-app-border hover:border-amber-600"
              }`}
            >
              <span className="font-brush text-sm text-amber-500">[進]</span>
              <span>Em Andamento ({inProgressCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus("completed")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all shadow-ink-sm ${
                filterStatus === "completed"
                  ? "bg-emerald-600 text-white border-app-text-primary shadow-ink -translate-y-0.5"
                  : "bg-app-card text-app-text-primary border-app-border hover:border-emerald-600"
              }`}
            >
              <span className="font-brush text-sm text-emerald-500">[完]</span>
              <span>Concluídas ({completedCount})</span>
            </button>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-widest text-app-text-secondary/60">
            TOTAL: {filteredProjects.length} {filteredProjects.length === 1 ? "VOLUME" : "VOLUMES"}
          </div>
        </div>
      </header>

      {/* Área de Listagem com Scrollbar Estilizada */}
      <div className="no-scrollbar flex-1 overflow-y-auto z-10 relative pr-1">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <NanquimLoading compact={false} text="Consultando acervo editorial..." />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center border-2 border-dashed border-app-border/70 bg-app-card/40 p-8 text-center">
            <div className="inline-grid h-16 w-16 place-items-center border-2 border-app-border bg-app-surface text-app-text-secondary/40 shadow-ink-sm mb-4">
              <span className="font-brush text-3xl">無</span>
            </div>
            <h3 className="font-display text-xl uppercase tracking-wider text-app-text-primary mb-1">
              NENHUM MANUSCRITO LOCALIZADO
            </h3>
            <p className="font-mono text-xs text-app-text-secondary/70 max-w-sm mb-4">
              {searchTerm
                ? `Nenhum projeto coincide com o termo "${searchTerm}". Verifique a ortografia ou limpe a busca.`
                : "Seu arquivo físico está vazio. Inicie um novo capítulo ou importe páginas na tela inicial para catalogar sua primeira obra."}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="btn border-2 border-app-border bg-app-card px-4 py-1.5 font-bold uppercase text-xs shadow-ink-sm hover:border-app-accent"
              >
                Limpar Busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pb-6">
            {filteredProjects.map((project) => {
              const isCompleted = project.status === "completed";
              const progressVal = Math.round(project.progress || 0);

              return (
                <div
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="group relative cursor-pointer overflow-hidden border-2 border-app-border bg-app-card p-5 pl-7 shadow-ink transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:border-app-accent hover:shadow-ink-hover"
                >
                  {/* Lombada de Livro / Tankōbon (Spine físico na esquerda) */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-app-surface border-r-2 border-app-border flex flex-col justify-between items-center py-3 select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-app-border" />
                    <span className="font-pixel text-[8px] font-bold text-app-text-secondary/50 -rotate-90 tracking-tighter">
                      VOL
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-app-border" />
                  </div>

                  {/* Header do Card: Hanko de Status + Botão Excluir */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    {/* Hanko de Status */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 border-2 border-emerald-600 bg-emerald-500/10 px-2 py-0.5 font-pixel text-[9px] font-black uppercase tracking-wider text-emerald-500 shadow-ink-sm rotate-[-1deg]">
                        <HankoStampIcon size={13} kanji="済" className="text-emerald-500" />
                        <span>CONCLUÍDO</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 border-2 border-amber-600 bg-amber-500/10 px-2 py-0.5 font-pixel text-[9px] font-black uppercase tracking-wider text-amber-500 shadow-ink-sm rotate-[1deg]">
                        <HankoStampIcon size={13} kanji="進" className="text-amber-500" />
                        <span>EM PROGRESSO</span>
                      </span>
                    )}

                    {/* Botão de Excluir Obra */}
                    <button
                      type="button"
                      onClick={(event) => handleDeleteClick(project, event)}
                      title="Excluir capítulo deste computador"
                      className="border border-transparent p-1.5 text-app-text-secondary/30 transition-all hover:border-rose-600 hover:bg-rose-500/10 hover:text-rose-500 hover:shadow-ink-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Título do Projeto */}
                  <h3 className="font-display text-xl uppercase tracking-wide text-app-text-primary transition-colors group-hover:text-app-accent truncate mb-1">
                    {project.name}
                  </h3>

                  {/* Data de Modificação */}
                  <div className="mb-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-app-text-secondary/70">
                    <Clock size={11} />
                    <span>{formatProjectDate(project.updated_at)}</span>
                  </div>

                  {/* Barra de Progresso com Retícula / Listras */}
                  <div className="space-y-1.5 border-t border-dashed border-app-border pt-3">
                    <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-app-text-secondary">
                      <span className="flex items-center gap-1">
                        <WatojiBookIcon size={12} className="text-app-accent" />
                        Progresso Editorial
                      </span>
                      <span className="font-bold text-app-text-primary">{progressVal}%</span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden border-2 border-app-border bg-app-surface relative">
                      <div
                        className="h-full bg-app-accent bar-stripes transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(5, progressVal)}%` }}
                      />
                    </div>
                  </div>

                  {/* Rodapé do Card com Ação */}
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="font-pixel text-[9px] uppercase text-app-text-secondary/50">
                      ID: {project.id.slice(0, 6)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-body text-xs font-black uppercase tracking-wider text-app-text-primary group-hover:text-app-accent transition-colors">
                      <span>Abrir Volume</span>
                      <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Remoção */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
        title="Excluir Manuscrito?"
        description={
          projectToDelete
            ? `Esta ação removerá "${projectToDelete.name}" permanentemente do banco local deste computador. Páginas e dados traduzidos serão descartados.`
            : ""
        }
        confirmText="Confirmar Exclusão"
        variant="destructive"
      />
    </div>
  );
};

export default LibraryView;
