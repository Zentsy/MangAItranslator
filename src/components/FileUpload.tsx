import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileImage, Loader2, FolderOpen } from 'lucide-react';
import { useMangaStore } from '@/store/useMangaStore';
import { dbService } from '@/services/dbService';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from '@tauri-apps/api/core';

interface FileUploadProps {
  onSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPages, setProjectId } = useMangaStore();

  const handlePickFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{
        name: 'Imagens de Mangá',
        extensions: ['png', 'jpg', 'jpeg', 'webp']
      }]
    });

    if (!selected || !Array.isArray(selected)) return;

    setIsProcessing(true);
    try {
      // MELHORIA: Tenta pegar o nome da pasta pai ou pede um nome
      const firstPath = selected[0].replace(/\\/g, '/');
      const pathParts = firstPath.split('/');
      // Pega o penúltimo elemento (a pasta) ou o nome do arquivo se falhar
      const detectedName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "Novo Projeto";
      
      const projectName = prompt("Digite o nome da obra/capítulo:", detectedName) || detectedName;
      const projectId = await dbService.createProject(projectName, "1");
      setProjectId(projectId);

      const sortedPaths = selected.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const newPages = [];

      for (let i = 0; i < sortedPaths.length; i++) {
        const originalPath = sortedPaths[i];
        
        const cachedPath = await invoke<string>("cache_image", {
          projectId,
          imagePath: originalPath
        });

        const fileName = originalPath.split(/[\\/]/).pop() || `page_${i}`;
        const cleanCachedPath = cachedPath.replace(/\\/g, '/');
        
        const page = {
          id: Math.random().toString(36).substring(7),
          url: convertFileSrc(cleanCachedPath),
          path: cachedPath,
          name: fileName,
          translation: '',
          blocks: [],
          status: 'pending' as const,
        };
        
        newPages.push(page);
        await dbService.savePage(projectId, page, i);
      }

      setPages(newPages);
      onSuccess();
    } catch (error) {
      console.error("Erro no upload nativo:", error);
      alert("Falha ao processar arquivos.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={handlePickFiles}
      className={`
        relative group cursor-pointer p-10 border-2 border-dashed rounded-3xl transition-all duration-300
        border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.08]
        ${isProcessing ? 'opacity-50 cursor-wait' : ''}
      `}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <FolderOpen className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">
            {isProcessing ? 'Copiando para o Cache...' : 'Selecionar Capítulo'}
          </h3>
          <p className="text-sm text-white/40 mt-1 max-w-[240px]">
            {isProcessing ? 'Isso economizará seu SSD no futuro' : 'Clique para selecionar as páginas e iniciar um novo projeto.'}
          </p>
        </div>
        {!isProcessing && (
          <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
             <FileImage size={12} />
             SQLite + Cache Local Ativos
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;