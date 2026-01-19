import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Upload, FileImage } from 'lucide-react';
import { useMangaStore } from '@/store/useMangaStore';

interface FileUploadProps {
  onSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const setPages = useMangaStore((state) => state.setPages);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPages = acceptedFiles
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file),
        name: file.name,
        translation: '',
        blocks: [], // CORREÇÃO: Inicializando o array de blocos
        status: 'pending' as const,
      }));

    if (newPages.length > 0) {
      setPages(newPages);
      onSuccess();
    }
  }, [setPages, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer p-10 border-2 border-dashed rounded-3xl transition-all duration-300
        ${isDragActive 
          ? 'border-white bg-white/10 scale-[1.02]' 
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.08]'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-white/40'}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">{t('dashboard.newTranslation.title')}</h3>
          <p className="text-sm text-white/40 mt-1 max-w-[240px]">
            {isDragActive ? 'Solte as imagens agora' : t('dashboard.newTranslation.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
           <FileImage size={12} />
           JPG, PNG, WEBP suportados
        </div>
      </div>
    </div>
  );
};

export default FileUpload;