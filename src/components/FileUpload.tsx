import React, { useState } from "react";
import { FileImage, FolderOpen, Images, Loader2 } from "lucide-react";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService } from "@/services/dbService";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import ChapterNameModal from "@/components/ChapterNameModal";
import StatusModal, { StatusType } from "@/components/StatusModal";

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
  id: Math.random().toString(36).substring(7),
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
        title: "Nao foi possivel preparar o capitulo",
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
        title: "Imagens nao encontradas",
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
      title: "Selecione a pasta do capitulo",
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
        title: "Nao foi possivel abrir a pasta",
        description: "Tente novamente ou selecione uma pagina manualmente.",
        type: "error",
      });
    }
  };

  const handlePickSinglePage = async () => {
    const selected = await open({
      multiple: false,
      title: "Selecione qualquer pagina do capitulo",
      filters: [
        {
          name: "Imagens de Manga",
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
      console.error("Erro ao descobrir paginas vizinhas:", error);
      setStatusModal({
        isOpen: true,
        title: "Nao foi possivel carregar as paginas",
        description: "Tente selecionar a pasta do capitulo inteira.",
        type: "error",
      });
    }
  };

  return (
    <div
      className={`
        group relative rounded-[2rem] border-2 border-dashed p-8 transition-all duration-300
        border-app-border bg-app-surface/30 hover:border-app-accent/30 hover:bg-app-surface/50
        ${isProcessing ? "cursor-wait opacity-50" : ""}
      `}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-app-border bg-app-surface/50 transition-transform group-hover:scale-105">
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin text-app-text-primary" />
          ) : (
            <FolderOpen className="h-7 w-7 text-app-text-secondary/40 transition-colors group-hover:text-app-text-primary" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-app-text-primary">
            {isProcessing ? "Preparando as imagens..." : "Selecionar capitulo"}
          </h3>
          <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-app-text-secondary/60">
            {isProcessing
              ? "Estamos organizando tudo para voce continuar sem se preocupar com a estrutura dos arquivos."
              : "Abra a pasta inteira do capitulo ou selecione uma pagina para puxar automaticamente as vizinhas."}
          </p>
        </div>

        {!isProcessing && (
          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              onClick={handlePickFolder}
              className="h-11 gap-2 bg-app-text-primary px-5 text-app-bg shadow-lg hover:opacity-90"
            >
              <FolderOpen size={14} />
              Selecionar pasta
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePickSinglePage}
              className="h-11 gap-2 border-app-border px-5 text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
            >
              <Images size={14} />
              Selecionar uma pagina
            </Button>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-2 flex items-center gap-2 rounded-full border border-app-border bg-app-surface/50 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.18em] text-app-text-secondary/40">
            <FileImage size={12} />
            Salvo localmente neste app
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
