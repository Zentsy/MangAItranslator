import React, { useState } from "react";
import { FileImage, FolderOpen, Images, Loader2 } from "lucide-react";
import { useMangaStore } from "@/store/useMangaStore";
import { dbService } from "@/services/dbService";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onSuccess: () => void;
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
  const { setPages, setProjectId } = useMangaStore();

  const importChapter = async (imagePaths: string[]) => {
    if (imagePaths.length === 0) {
      alert("Nenhuma imagem suportada foi encontrada.");
      return;
    }

    setIsProcessing(true);

    try {
      const sortedPaths = sortPaths(imagePaths);
      const detectedName = detectProjectName(sortedPaths[0]);
      const projectName = prompt("Digite o nome da obra/capitulo:", detectedName) || detectedName;
      const projectId = await dbService.createProject(projectName, "1");
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
      alert("Falha ao processar arquivos.");
    } finally {
      setIsProcessing(false);
    }
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
      await importChapter(imagePaths);
    } catch (error) {
      console.error("Erro ao ler a pasta selecionada:", error);
      alert("Nao foi possivel ler a pasta selecionada.");
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
      await importChapter(imagePaths);
    } catch (error) {
      console.error("Erro ao descobrir paginas vizinhas:", error);
      alert("Nao foi possivel carregar as outras paginas da pasta.");
    }
  };

  return (
    <div
      className={`
        group relative rounded-3xl border-2 border-dashed p-10 transition-all duration-300
        border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.08]
        ${isProcessing ? "cursor-wait opacity-50" : ""}
      `}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform group-hover:scale-110">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <FolderOpen className="h-8 w-8 text-white/40 transition-colors group-hover:text-white" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">
            {isProcessing ? "Copiando para o Cache..." : "Selecionar Capitulo"}
          </h3>
          <p className="mt-1 max-w-[300px] text-sm text-white/40">
            {isProcessing
              ? "Isso economizara seu SSD no futuro"
              : "Abra a pasta inteira do capitulo ou selecione uma pagina para puxar automaticamente as vizinhas."}
          </p>
        </div>

        {!isProcessing && (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={handlePickFolder}
              className="gap-2 bg-white text-black hover:bg-white/90"
            >
              <FolderOpen size={16} />
              Selecionar Pasta
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePickSinglePage}
              className="gap-2 border-white/10 text-white/70 hover:bg-white/5"
            >
              <Images size={16} />
              Selecionar Uma Pagina
            </Button>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-2 flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white/30">
            <FileImage size={12} />
            SQLite + Cache Local Ativos
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
