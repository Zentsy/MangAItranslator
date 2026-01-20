import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { dbService, DBProject } from "@/services/dbService";
import { useMangaStore } from "@/store/useMangaStore";
import { ask } from '@tauri-apps/plugin-dialog';
import { Search, FolderOpen, Clock, Trash2, ChevronRight } from "lucide-react";

interface LibraryViewProps {
  onOpenProject: (projectId: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenProject }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [searchTerm, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Acessa a store para verificar o projeto atual
  const { currentProjectId, clearStore } = useMangaStore();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await dbService.getProjects();
      setProjects(data);
    } catch (e) {
      console.error("Erro ao carregar projetos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o projeto ao clicar na lixeira
    
    // Usa o diálogo real do Tauri (assíncrono e seguro)
    const confirmed = await ask(t('common.confirmDelete'), {
      title: 'MangAI Translator',
      kind: 'warning',
    });

    if (confirmed) {
      await dbService.deleteProject(id);
      
      // SE O PROJETO DELETADO FOR O QUE ESTÁ ABERTO, LIMPA A MEMÓRIA!
      if (id === currentProjectId) {
        clearStore();
      }
      
      loadProjects();
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden p-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Biblioteca <span className="text-white/20">Local</span></h2>
          <p className="text-white/40 text-xs font-mono tracking-widest mt-1 uppercase">Sincronização SQLite Ativa</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <Search size={16} className="text-white/20" />
            <input 
              type="text" 
              placeholder="Buscar obra..."
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-mono text-white/80 placeholder:text-white/20 w-48"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
            <FolderOpen size={48} strokeWidth={1} />
            <p className="uppercase tracking-[0.3em] text-[10px]">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                    {project.status === 'completed' ? 'Concluído' : 'Em Progresso'}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(project.id, e)}
                    className="p-1.5 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 relative z-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="text-lg font-bold uppercase truncate pr-8 mb-1 italic group-hover:text-white transition-colors">{project.name}</h3>
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase mb-6">
                  <Clock size={12} />
                  <span>Capítulo {project.chapter}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                    <span>Progresso</span>
                    <span>{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end text-[10px] font-bold text-white/20 group-hover:text-white transition-all uppercase tracking-widest gap-1">
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