import React, { useEffect, useState, useRef } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useMangaStore, BlockType } from "@/store/useMangaStore";
import { translatePage } from "@/services/translationService";
import { dbService } from "@/services/dbService";
import { exportProject } from "@/utils/exportUtils";
import { useTheme } from "@/contexts/ThemeContext";
import CyberLoading from "@/components/CyberLoading";
import ConfirmModal from "@/components/ConfirmModal";
import StatusModal, { StatusType } from "@/components/StatusModal";
import ExportModal from "@/components/ExportModal";
import { readFile } from "@tauri-apps/plugin-fs";
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Download,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  MessageSquareOff,
  CheckCircle2,
  Flag,
} from "lucide-react";

const MAX_AI_IMAGE_WIDTH = 1600;
const AI_IMAGE_QUALITY = 0.88;

const inferImageMimeType = (path: string) => {
  const normalizedPath = path.toLowerCase();

  if (normalizedPath.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedPath.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
};

const optimizeImageForAi = async (dataUrl: string) => {
  if (!dataUrl) {
    return "";
  }

  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = image.width > MAX_AI_IMAGE_WIDTH ? MAX_AI_IMAGE_WIDTH / image.width : 1;
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Nao foi possivel preparar a imagem para a IA."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      const optimizedDataUrl = canvas.toDataURL("image/jpeg", AI_IMAGE_QUALITY);
      resolve(optimizedDataUrl.split(",")[1] ?? "");
    };

    image.onerror = () => reject(new Error("Falha ao otimizar imagem para a IA."));
    image.src = dataUrl;
  });
};

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-app-border bg-app-surface/80 p-1 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 shadow-xl">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
        onClick={() => zoomIn()}
      >
        <ZoomIn size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
        onClick={() => zoomOut()}
      >
        <ZoomOut size={16} />
      </Button>
      <div className="mx-1 h-4 w-px bg-app-border" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
        onClick={() => resetTransform()}
      >
        <Maximize size={16} />
      </Button>
    </div>
  );
};

const EditorView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const {
    pages,
    currentPageIndex,
    nextPage,
    prevPage,
    updateBlock,
    reorderBlocks,
    addBlock,
    removeBlock,
    updatePage,
    apiKey,
    translationEngine,
    geminiModel,
    ollamaModel,
    currentProjectId,
    clearStore,
    cancelPendingSaves,
  } = useMangaStore();

  const { theme } = useTheme();

  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("Preparando traducao...");
  const [translationStartedAt, setTranslationStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [imgBase64, setImgBase64] = useState<string>("");
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [finishAfterExport, setFinishAfterExport] = useState(false);
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

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    if (!isTranslating || !translationStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - translationStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTranslating, translationStartedAt]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // AI Draft shortcut - ONLY with Shift
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        void handleTranslate();
        return;
      }

      // Page navigation (only when not typing)
      if (document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          nextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          prevPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, pages.length, isTranslating, apiKey, translationEngine, geminiModel]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    // Prevent Ctrl+Enter from bubbling to global handler (which triggers AI)
    if (e.ctrlKey && e.key === 'Enter') {
      e.stopPropagation(); 
      e.preventDefault();
      
      if (index < (currentPage.blocks?.length || 0) - 1) {
        textareaRefs.current[index + 1]?.focus();
      } else {
        // Last block: go to next page
        if (currentPageIndex < pages.length - 1) {
          nextPage();
          setTimeout(() => textareaRefs.current[0]?.focus(), 150);
        }
      }
    }

    // Alt + 1-4 to change block type
    if (e.altKey) {
      const types: BlockType[] = ['rect', 'outside', 'thought', 'double'];
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 4) {
        e.preventDefault();
        updateBlock(currentPage.id, currentPage.blocks[index].id, { type: types[keyNum - 1] });
      }
    }
  };

  useEffect(() => {
    async function loadPageImage() {
      if (!currentPage) return;

      setImgBase64("");

      try {
        const cleanPath = currentPage.path
          .replace("http://asset.localhost/", "")
          .replace(/%2F/g, "/")
          .replace(/%3A/g, ":");

        const contents = await readFile(cleanPath);
        const blob = new Blob([contents], { type: inferImageMimeType(cleanPath) });
        const reader = new FileReader();
        reader.onloadend = () => setImgBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Erro ao carregar imagem via FS:", error);
      }
    }

    loadPageImage();
  }, [currentPageIndex, currentPage?.id, currentPage?.path]);

  if (!currentPage) return null;

  const pageImageSrc = currentPage.url || "";

  const handleTranslate = async () => {
    if (translationEngine === "gemini" && !apiKey) {
      setStatusModal({
        isOpen: true,
        title: "Erro de ConfiguraÃ§Ã£o",
        description: "A API Key do Gemini nÃ£o foi encontrada. Configure-a no Dashboard.",
        type: "error",
      });
      return;
    }
    setIsTranslating(true);
    setTranslationStartedAt(Date.now());
    setTranslationStatus(
      translationEngine === "ollama"
        ? `Otimizando imagem para ${ollamaModel}...`
        : "Enviando imagem para o Gemini..."
    );
    try {
      const base64 = await optimizeImageForAi(imgBase64);
      await translatePage(
        translationEngine,
        apiKey,
        geminiModel,
        ollamaModel,
        base64,
        (results) => {
          if (results.length === 0) {
            setStatusModal({
              isOpen: true,
              title: "Resposta Vazia da IA",
              description:
                translationEngine === "ollama"
                  ? "O modelo local respondeu, mas nao devolveu blocos utilizaveis. Isso e comum em modelos pequenos/CPU-only. Tente outra pagina ou use Gemini."
                  : "A IA respondeu sem blocos utilizaveis para esta pagina.",
              type: "warning",
            });
            return;
          }

          const newBlocks = results.map((res) => ({
            id: Math.random().toString(36).substring(7),
            text: res.text,
            type: (res.type ?? "none") as BlockType,
          }));
          updatePage(currentPage.id, {
            blocks: [...(currentPage.blocks || []), ...newBlocks],
            status: "completed",
          });
        },
        undefined,
        (status) => {
          setTranslationStatus(status.message);
        }
      );
    } catch (error: any) {
      let friendlyMessage = "Ocorreu um erro inesperado ao processar a pagina.";
      const errorStr = [error?.message, error?.statusText, error?.toString?.()]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const errorCode = typeof error?.code === "string" ? error.code : "";

      if (errorCode === "GEMINI_INVALID_KEY" || errorStr.includes("api key not valid") || errorStr.includes("invalid api key")) {
        friendlyMessage = "Sua chave de API do Gemini e invalida. Verifique-a nas configuracoes.";
      } else if (errorCode === "GEMINI_RATE_LIMIT" || errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("too many requests")) {
        friendlyMessage = "O Google recusou a requisicao com 429. Isso normalmente significa quota, billing ou limite temporario no projeto do Gemini, e pode acontecer ate com chave nova.";
      } else if (errorCode === "GEMINI_FORBIDDEN" || errorStr.includes("permission denied") || errorStr.includes("forbidden")) {
        friendlyMessage = "A chave foi aceita, mas o projeto nao tem permissao para usar a Gemini API. Confira a chave, o projeto no AI Studio e se a API esta habilitada.";
      } else if (errorCode === "GEMINI_BAD_REQUEST") {
        friendlyMessage = "O Gemini recusou a requisicao. Confira se a chave pertence ao projeto certo e se esse projeto tem quota disponivel.";
      } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
        friendlyMessage = "Erro de conexao. Verifique sua internet ou o status dos servidores da IA.";
      } else if (errorStr.includes("tempo limite") || errorStr.includes("timeout")) {
        friendlyMessage = "O Ollama demorou demais para responder. Em CPU isso pode acontecer; tente uma pagina mais simples ou use Gemini.";
      } else if (errorStr.includes("ollama nao encontrado") || errorStr.includes("failed to fetch")) {
        friendlyMessage = "Nao consegui falar com o Ollama. Verifique se ele esta aberto e rodando na sua maquina.";
      } else if (errorStr.includes("modelo do ollama nao encontrado") || errorStr.includes("not found")) {
        friendlyMessage = `O modelo ${ollamaModel} ainda nao foi baixado. Rode "ollama pull ${ollamaModel}" no terminal.`;
      }

      setStatusModal({
        isOpen: true,
        title: "Erro na IA",
        description: friendlyMessage,
        type: "error",
      });
    } finally {
      setIsTranslating(false);
      setTranslationStartedAt(null);
      setTranslationStatus("Preparando traducao...");
    }
  };

  const getBlockColor = (type: BlockType) => {
    const isLight = theme === 'paper-light';
    switch (type) {
      case 'rect': return isLight ? 'hsl(142 70% 35%)' : 'hsl(var(--block-rect))';
      case 'outside': return isLight ? 'hsl(217 91% 45%)' : 'hsl(var(--block-outside))';
      case 'thought': return isLight ? 'hsl(271 91% 50%)' : 'hsl(var(--block-thought))';
      case 'double': return isLight ? 'hsl(346 84% 45%)' : 'hsl(var(--block-double))';
      default: return isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
    }
  };

  const togglePageStatus = () => {
    const newStatus = currentPage.status === "completed" ? "pending" : "completed";
    updatePage(currentPage.id, { status: newStatus });
  };

  const handleExport = async (format: 'txt' | 'docx') => {
    try {
      const success = await exportProject(pages, format);
      if (success) {
        if (finishAfterExport && currentProjectId) {
          cancelPendingSaves();

          try {
            await dbService.deleteProject(currentProjectId);
            setFinishAfterExport(false);
            clearStore();
            onBack();
            return;
          } catch (error) {
            console.error("Erro ao finalizar projeto:", error);
            setFinishAfterExport(false);
            setStatusModal({
              isOpen: true,
              title: "Exportado, mas nao finalizado",
              description: "O arquivo foi salvo, mas nao consegui limpar o projeto deste computador.",
              type: "warning",
            });
            return;
          }
        }

        setStatusModal({
          isOpen: true,
          title: "Exportacao Concluida",
          description: `O arquivo .${format} foi salvo com sucesso no local escolhido.`,
          type: "success",
        });
      }
    } catch (error: any) {
      setStatusModal({
        isOpen: true,
        title: "Erro na Exportacao",
        description: "Nao foi possivel salvar o arquivo. Verifique as permissoes de pasta.",
        type: "error",
      });
    }
  };

  const handleFinishProject = () => {
    setFinishAfterExport(true);
    setShowExportModal(true);
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;

      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleTranslate();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (currentPage) {
          void useMangaStore.getState().savePageToDb(currentPage.id);
        }
      }

      if (!isTyping) {
        if (event.key === 'ArrowRight' || event.key === 'd') nextPage();
        if (event.key === 'ArrowLeft' || event.key === 'a') prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, currentPage?.id, isTranslating, apiKey, imgBase64, translationEngine, geminiModel]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-app-border bg-app-surface/20 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-app-text-secondary hover:bg-app-surface/80 hover:text-app-text-primary">
            <ChevronLeft size={20} /> {t("common.back").toUpperCase()}
          </Button>
          <div className="h-4 w-px bg-app-border" />
          <span className="text-xs font-mono uppercase tracking-tighter text-app-text-secondary">
            PAGINA {currentPageIndex + 1} / {pages.length}
          </span>
          <div className="h-4 w-px bg-app-border" />
          <span className="max-w-[150px] truncate text-[10px] font-mono uppercase text-app-text-secondary/40">
            {currentPage.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePageStatus}
            className={`gap-2 border text-[10px] font-bold transition-all ${
              currentPage.status === "completed"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                : "border-app-border text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
            }`}
          >
            {currentPage.status === "completed" ? (
              <CheckCircle2 size={14} />
            ) : (
              <MessageSquareOff size={14} />
            )}
            {currentPage.status === "completed" ? "CONCLUIDA" : "MARCAR SEM TEXTO"}
          </Button>

          <div className="mx-2 h-4 w-px bg-app-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFinishAfterExport(false);
              setShowExportModal(true);
            }}
            className="gap-2 border-app-border text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
          >
            <Download size={16} /> EXPORTAR CAPITULO
          </Button>

          {isLastPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFinishModal(true)}
              className="gap-2 border-emerald-500/20 bg-emerald-500/5 font-bold text-emerald-500 hover:bg-emerald-500/10"
            >
              <Flag size={16} /> FINALIZAR CAPITULO
            </Button>
          )}

          <Button
            size="sm"
            className="gap-2 bg-app-text-primary font-bold text-app-bg hover:opacity-90 shadow-lg"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
            AI DRAFT
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="group relative flex-1 overflow-hidden border-r border-app-border bg-app-bg/40">
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            limitToBounds={false}
            key={currentPage.id}
          >
            <React.Fragment>
              <ZoomControls />
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pageImageSrc ? (
                  <img
                    src={pageImageSrc}
                    className="h-auto max-h-full w-auto max-w-full object-contain shadow-2xl transition-transform"
                    alt="page"
                  />
                ) : (
                  <div className="animate-pulse text-xs font-mono uppercase text-app-text-secondary/20">
                    Carregando Imagem...
                  </div>
                )}
              </TransformComponent>
            </React.Fragment>
          </TransformWrapper>
          {isTranslating && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-app-bg/60">
              <CyberLoading />
              <div className="flex max-w-md flex-col items-center gap-2 text-center">
                <span className="animate-pulse text-[10px] font-mono uppercase tracking-[0.4em] text-app-text-primary">
                  AI Engine Processing
                </span>
                <span className="text-xs text-app-text-secondary">
                  {translationStatus}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/70">
                  {elapsedSeconds}s decorridos
                </span>
                {translationEngine === "ollama" && (
                  <span className="text-[10px] text-app-text-secondary/60">
                    Ollama local em CPU pode levar 1-5 minutos por pagina.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="flex w-[550px] flex-col bg-app-surface/30 border-l border-app-border">
          <div className="flex items-center justify-between border-b border-app-border bg-app-surface/50 p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary/60">
              Translation Blocks
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] text-rose-500 hover:bg-rose-500/10"
              onClick={() => updatePage(currentPage.id, { blocks: [] })}
            >
              <RefreshCcw size={10} className="mr-1" /> LIMPAR PAGINA
            </Button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {(!currentPage.blocks || currentPage.blocks.length === 0) && !isTranslating && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-app-text-secondary/20">
                <p className="text-[10px] uppercase leading-relaxed tracking-[0.2em]">
                  Fila vazia.
                  <br />
                  Clique em "AI DRAFT" ou adicione um bloco manual.
                </p>
              </div>
            )}
            {currentPage.blocks?.map((block, index) => (
              <div
                key={block.id}
                className="group flex flex-col gap-3 rounded-xl border border-l-4 border-app-border bg-app-surface/50 p-3 transition-all hover:border-app-accent/20 hover:bg-app-surface/80 shadow-sm"
                style={{ borderLeftColor: getBlockColor(block.type) }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {[
                      { type: "rect", label: "[]" },
                      { type: "outside", label: "{}" },
                      { type: "thought", label: "()" },
                      { type: "double", label: "//" },
                    ].map((button) => (
                      <button
                        key={button.type}
                        onClick={() =>
                          updateBlock(currentPage.id, block.id, {
                            type: block.type === button.type ? "none" : (button.type as BlockType),
                          })
                        }
                        className={`h-6 w-8 rounded border text-[9px] font-bold transition-all ${
                          block.type === button.type
                            ? "border-app-text-primary bg-app-text-primary text-app-bg shadow-md"
                            : "border-app-border text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
                        }`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
                      onClick={() => reorderBlocks(currentPage.id, index, index - 1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
                      onClick={() => reorderBlocks(currentPage.id, index, index + 1)}
                      disabled={index === (currentPage.blocks?.length || 0) - 1}
                    >
                      <ArrowDown size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-rose-500 hover:bg-rose-500/10"
                      onClick={() => removeBlock(currentPage.id, block.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <textarea
                  ref={(el) => {
                    textareaRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => handleTextareaKeyDown(e, index)}
                  className="min-h-[70px] resize-none rounded-lg border border-transparent bg-app-bg/40 p-3 font-mono text-sm outline-none transition-colors focus:border-app-accent/20 text-app-text-primary placeholder:text-app-text-secondary/20 shadow-inner"
                  style={{ color: block.type !== 'none' ? getBlockColor(block.type) : 'inherit' }}
                  value={block.text}
                  onChange={(event) => updateBlock(currentPage.id, block.id, { text: event.target.value })}
                  placeholder="Texto da traducao..."
                />
              </div>
            ))}
            <Button
              variant="outline"
              className="h-14 rounded-xl border-dashed border-app-border text-app-text-secondary/40 hover:border-app-accent/30 hover:text-app-text-primary bg-app-surface/20"
              onClick={() => addBlock(currentPage.id)}
            >
              <Plus size={16} className="mr-2" /> NOVO BLOCO MANUAL
            </Button>
          </div>

          <div className="border-t border-app-border bg-app-surface/20 px-4 py-3">
             <div className="mb-4 flex flex-col gap-2 border-b border-app-border pb-3">
                <h5 className="text-[8px] font-bold uppercase italic tracking-[0.3em] text-app-text-secondary/40">
                  Atalhos de Teclado
                </h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono uppercase text-app-text-secondary/60">
                   <div className="flex items-center justify-between">
                      <span className="text-app-text-secondary/80">Ctrl+Ent</span>
                      <span>PrÃ³ximo</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-app-text-secondary/80">C+S+Ent</span>
                      <span>AI Draft</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-app-text-secondary/80">Alt+1-4</span>
                      <span>Tipo</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-app-text-secondary/80">Setas</span>
                      <span>PÃ¡ginas</span>
                   </div>
                </div>
             </div>
            <h5 className="mb-2 text-[8px] font-bold uppercase italic tracking-[0.3em] text-app-text-secondary/40">
              Legenda de Sinais
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-mono uppercase text-app-text-secondary/60">
              <div className="flex items-center gap-2">
                <span className="text-app-text-secondary/80">[]</span> Retangulo
              </div>
              <div className="flex items-center gap-2">
                <span className="text-app-text-secondary/80">{"{}"}</span> Texto Fora
              </div>
              <div className="flex items-center gap-2">
                <span className="text-app-text-secondary/80">()</span> Pensamento
              </div>
              <div className="flex items-center gap-2">
                <span className="text-app-text-secondary/80">//</span> Balao Duplo
              </div>
            </div>
          </div>

          <footer className="flex justify-between border-t border-app-border bg-app-surface/30 p-3 text-[9px] font-mono uppercase text-app-text-secondary/40">
            <span>{currentPage.blocks?.length || 0} blocks in queue</span>
            <span className={currentPage.status === "completed" ? "text-emerald-500" : "text-app-text-secondary/40"}>
              Status: {currentPage.status === "completed" ? "Completed" : "Draft"}
            </span>
          </footer>
        </aside>
      </div>

      <ConfirmModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleFinishProject}
        title={t("editor.finishModal.title")}
        description={t("editor.finishModal.description")}
        confirmText={t("editor.finishModal.confirm")}
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        description={statusModal.description}
        type={statusModal.type}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setFinishAfterExport(false);
        }}
        onExport={handleExport}
      />

      <footer className="flex h-16 items-center justify-between border-t border-app-border bg-app-surface/40 px-6">
        <Button
          variant="ghost"
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className="gap-2 font-bold text-app-text-secondary/60 hover:text-app-text-primary hover:bg-app-surface/20"
        >
          <ChevronLeft size={20} /> ANTERIOR
        </Button>
        <div className="no-scrollbar flex max-w-[40%] items-center gap-2 overflow-x-auto px-4">
          {pages.map((page, index) => (
            <div
              key={index}
              className={`cursor-pointer flex-shrink-0 transition-all ${
                index === currentPageIndex
                  ? "h-1.5 w-8 bg-app-text-primary shadow-[0_0_8px_rgba(var(--app-text-primary),0.3)]"
                  : page.status === "completed"
                    ? "h-1.5 w-2 bg-emerald-500/40"
                    : "h-1.5 w-2 bg-app-text-secondary/20 hover:bg-app-text-secondary/40"
              }`}
              onClick={() => useMangaStore.getState().setPageIndex(index)}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={nextPage}
          disabled={currentPageIndex === pages.length - 1}
          className="gap-2 font-bold text-app-text-secondary/60 hover:text-app-text-primary hover:bg-app-surface/20"
        >
          PROXIMA <ChevronRight size={20} />
        </Button>
      </footer>
    </div>
  );
};

export default EditorView;

