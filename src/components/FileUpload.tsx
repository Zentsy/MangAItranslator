import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import { useMangaStore } from '@/store/useMangaStore';
import { dbService } from '@/services/dbService';
import { invoke } from '@tauri-apps/api/core';

interface FileUploadProps {
  onSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPages, setProjectId } = useMangaStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    try {
      // 1. Cria o projeto no banco
      const projectName = acceptedFiles[0]?.name.split('.')[0] || "Novo Projeto";
      const projectId = await dbService.createProject(projectName, "1");
      setProjectId(projectId);

      // 2. Processa e copia imagens para o cache
      const sortedFiles = acceptedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const newPages = [];

      for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];
        // Nota: Em Tauri v2, o path real do arquivo não é acessível diretamente via JS File por segurança.
        // Precisamos usar o plugin de dialog ou assumir que o usuário selecionou via input.
        // Como estamos em WebView, vamos usar o URL.createObjectURL para visualização temporária,
        // mas no futuro o ideal é usar o path real.
        
        const tempUrl = URL.createObjectURL(file);
        
        const page = {
          id: Math.random().toString(36).substring(7),
          url: tempUrl,
          name: file.name,
          translation: '',
          blocks: [],
          status: 'pending' as const,
        };
        
        newPages.push(page);
        // Salva a página inicial no banco
        await dbService.savePage(projectId, page, i);
      }

      setPages(newPages);
      onSuccess();
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Falha ao criar projeto.");
    } finally {
      setIsProcessing(false);
    }
  }, [setPages, setProjectId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer p-10 border-2 border-dashed rounded-3xl transition-all duration-300
        ${isDragActive 
          ? 'border-white bg-white/10 scale-[1.02]' 
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.08]'}
        ${isProcessing ? 'opacity-50 cursor-wait' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-white/40'}`} />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">
            {isProcessing ? 'Processando...' : t('dashboard.newTranslation.title')}
          </h3>
          <p className="text-sm text-white/40 mt-1 max-w-[240px]">
            {isDragActive ? 'Solte as imagens agora' : t('dashboard.newTranslation.description')}
          </p>
        </div>
        {!isProcessing && (
          <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
             <FileImage size={12} />
             JPG, PNG, WEBP suportados
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
