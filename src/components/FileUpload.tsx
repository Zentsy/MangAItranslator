import React, { useState } from "react";
import { FileImage, FolderOpen, Images, Loader2 } from "lucide-react";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService } from "@/services/dbService";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import ChapterNameModal from "@/components/ChapterNameModal";
import StatusModal, { StatusType } from "@/components/StatusModal";
import { GPenNibIcon } from "@/components/NanquimLoading";

interface FileUploadProps {
  onSuccess: () => void;
}

interface PendingImport {
  imagePaths: string[];
  suggestedName: string;
}

const normalizePath = (filePath: string) => filePath.replace(/\\/g, "/");

const getFileName = (filePath: string) => filePath.split(/[\\/]/).pop() || "page";

const sortPaths = (paths: string[]) =>
  [...paths].sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));

const detectProjectName = (filePath: string) => {
  const parts = normalizePath(filePath).split("/").filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : "Novo Projeto";
};

const buildPage = (cachedPath: string, originalPath: string) => ({
  id: crypto.randomUUID(),
  url: convertFileSrc(normalizePath(cachedPath)),
  path: cachedPath,
  name: getFileName(originalPath),
  translation: "",
  blocks: [],
  status: "pending" as const,
});

const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
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
  const { setPages, setProjectId } = useMangaStore();

  const importChapter = async (imagePaths: string[], projectName: string) => {
    if (imagePaths.length === 0) {
      setStatusModal({
        isOpen: true,
        title: "Pasta vazia",
        description: "Nenhuma imagem suportada foi encontrada.",
        type: "warning",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const sortedPaths = sortPaths(imagePaths);
      const projectId = await dbService.createProject(projectName, projectName);
      const newPages = [];

      setProjectId(projectId);

      for (let index = 0; index < sortedPaths.length; index += 1) {
        const originalPath = sortedPaths[index];
        const cachedPath = await invoke<string>("cache_image", {
          projectId,
          imagePath: originalPath,
        });

        const page = buildPage(cachedPath, originalPath);
        newPages.push(page);
        await dbService.savePage(projectId, page, index);
      }

      setPages(newPages);
      onSuccess();
    } catch (error) {
      console.error("Erro no upload nativo:", error);
      setStatusModal({
        isOpen: true,
        title: "Não foi possível preparar o capítulo",
        description: "Tente novamente em instantes ou escolha outra pasta.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const queueImport = (imagePaths: string[]) => {
    if (imagePaths.length === 0) {
      setStatusModal({
        isOpen: true,
        title: "Imagens não encontradas",
        description: "Verifique se a pasta tem imagens suportadas, como JPG, PNG ou WEBP.",
        type: "warning",
      });
      return;
    }

    const sortedPaths = sortPaths(imagePaths);
    setPendingImport({
      imagePaths: sortedPaths,
      suggestedName: detectProjectName(sortedPaths[0]),
    });
  };

  const handlePickFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      recursive: false,
      title: "Selecione a pasta do capítulo",
    });

    if (!selected || Array.isArray(selected)) {
      return;
    }

    try {
      const imagePaths = await invoke<string[]>("list_chapter_images", { sourcePath: selected });
      queueImport(imagePaths);
    } catch (error) {
      console.error("Erro ao ler a pasta selecionada:", error);
      setStatusModal({
        isOpen: true,
        title: "Não foi possível abrir a pasta",
        description: "Tente novamente ou selecione uma página manualmente.",
        type: "error",
      });
    }
  };

  const handlePickSinglePage = async () => {
    const selected = await open({
      multiple: false,
      title: "Selecione qualquer página do capítulo",
      filters: [
        {
          name: "Imagens de Mangá",
          extensions: ["png", "jpg", "jpeg", "webp"],
        },
      ],
    });

    if (!selected || Array.isArray(selected)) {
      return;
    }

    try {
      const imagePaths = await invoke<string[]>("list_chapter_images", { sourcePath: selected });
      queueImport(imagePaths);
    } catch (error) {
      console.error("Erro ao descobrir páginas vizinhas:", error);
      setStatusModal({
        isOpen: true,
        title: "Não foi possível carregar as páginas",
        description: "Tente selecionar a pasta do capítulo inteira.",
        type: "error",
      });
    }
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border-2 border-app-border bg-app-card p-7 md:p-8 shadow-ink transition-all duration-300
        hover:border-hanko hover:shadow-hanko
        ${isProcessing ? "cursor-wait opacity-70" : ""}
      `}
    >
      {/* Retícula sutil no fundo da prancha (Halftone Washi) */}
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.08]" />

      {/* Grade de enquadramento da prancha Genkō Yōshi (Non-photo blue border) */}
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-app-border/40 opacity-50" />

      {/* Marcas de corte autênticas (トンボ - Tonbo / Crop & Trim Marks) */}
      <div className="pointer-events-none absolute top-3 left-3 z-0 select-none flex items-center gap-1 font-pixel text-[9px] text-hanko/90">
        <span className="font-bold tracking-wider">⌜ 原稿受付</span>
        <span className="text-app-text-secondary/40 hidden sm:inline">[B4-STD]</span>
      </div>
      <div className="pointer-events-none absolute top-3 right-3 z-0 select-none flex items-center gap-1 font-pixel text-[9px] text-app-text-secondary/50">
        <span className="text-app-text-secondary/40 hidden sm:inline">[600 DPI]</span>
        <span className="font-bold tracking-wider">トンボ ⌝</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-0 select-none flex items-center gap-1 font-pixel text-[9px] text-app-text-secondary/50">
        <span className="font-bold tracking-wider">⌞ DRAFT-IN</span>
        <span className="text-app-text-secondary/40 hidden sm:inline">BLEED // 3MM</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-0 select-none flex items-center gap-1 font-pixel text-[9px] text-hanko/90">
        <span className="text-app-text-secondary/40 hidden sm:inline">PENA-G // 0.5MM</span>
        <span className="font-bold tracking-wider">CHAPTER ⌟</span>
      </div>

      {/* Guias Centrais de Registro (十字トンボ - Center Crosshairs) */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-app-border/70" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 border-t-2 border-app-border/70" />
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 w-2 border-r-2 border-app-border/70" />
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-4 w-2 border-l-2 border-app-border/70" />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        {/* Selo Hanko da Prancheta Editorial */}
        <div className="inline-flex items-center gap-2 rounded-md border-2 border-hanko bg-hanko/15 px-3 py-1 text-hanko shadow-ink -rotate-1 select-none">
          <span className="font-brush text-base font-black leading-none">原稿</span>
          <span className="font-pixel text-[9px] font-bold uppercase tracking-widest">
            MESA DE RECEPÇÃO EDITORIAL &bull; INGESTÃO
          </span>
        </div>

        {/* Ícone de Pena G & Bandeja de Manuscrito */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-app-border bg-app-surface shadow-ink transition-transform duration-300 group-hover:scale-105 group-hover:border-hanko">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin text-hanko" />
          ) : (
            <div className="relative">
              <FolderOpen className="h-8 w-8 text-app-text-primary/80 transition-colors group-hover:text-hanko" />
              <GPenNibIcon className="absolute -bottom-1.5 -right-1.5 h-4 w-4 text-hanko drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </div>
          )}

          {/* Mini-selo de recepção */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-sm bg-hanko font-brush text-[8px] font-bold text-white shadow-[1px_1px_0px_#000]">
            受
          </span>
        </div>

        <div>
          <h3 className="font-display text-2xl md:text-3xl uppercase tracking-wider text-app-text-primary">
            {isProcessing ? (
              <span>Entalhando <span className="text-hanko">Páginas...</span></span>
            ) : (
              <span>Recepcionar <span className="text-hanko">Manuscrito</span></span>
            )}
          </h3>
          <p className="mt-2 max-w-[460px] font-body text-xs md:text-sm leading-relaxed text-app-text-secondary">
            {isProcessing
              ? "Organizando as lâminas sequenciais e gerando cache de alta resolução preservado no SQLite local."
              : "Abra a pasta do capítulo inteira ou selecione uma imagem solta para detecção sequencial automática de páginas."}
          </p>
        </div>

        {!isProcessing && (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row w-full justify-center max-w-md">
            <Button
              type="button"
              variant="hanko"
              size="lg"
              onClick={handlePickFolder}
              className="flex-1 gap-2.5 font-display text-xs uppercase tracking-wider shadow-ink hover:shadow-hanko transition-all"
            >
              <FolderOpen size={16} />
              Importar Pasta de Capítulo
            </Button>
            <Button
              type="button"
              variant="washi"
              size="lg"
              onClick={handlePickSinglePage}
              className="flex-1 gap-2.5 font-display text-xs uppercase tracking-wider shadow-ink hover:border-hanko transition-all"
            >
              <Images size={16} />
              Importar Imagens Soltas
            </Button>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.16em] text-app-text-secondary">
              <FileImage size={11} className="text-hanko" />
              JPG &bull; PNG &bull; WEBP
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.16em] text-app-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Cache Local Seguro (SQLite)
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.16em] text-app-text-secondary">
              <span className="font-brush text-[10px] text-hanko">墨</span>
              Fidelidade 1:1
            </div>
          </div>
        )}
      </div>

      <ChapterNameModal
        isOpen={Boolean(pendingImport)}
        defaultName={pendingImport?.suggestedName || ""}
        onClose={() => setPendingImport(null)}
        onConfirm={(projectName) => {
          const currentImport = pendingImport;
          setPendingImport(null);

          if (!currentImport) {
            return;
          }

          void importChapter(currentImport.imagePaths, projectName);
        }}
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        description={statusModal.description}
        type={statusModal.type}
      />
    </div>
  );
};

export default FileUpload;
