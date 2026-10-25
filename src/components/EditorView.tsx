import React, { useEffect, useState, useRef, useMemo } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useMangaStore, BlockType } from "@/store/useMangaStore";
import { translatePage } from "@/services/translationService";
import { dbService } from "@/services/dbService";
import TranslationProfileModal from "@/components/TranslationProfileModal";
import { exportProject } from "@/utils/exportUtils";
import { useTheme } from "@/contexts/ThemeContext";
import { getOpenAiCompatibleProvider } from "@/config/openAiCompatibleProviders";
import NanquimLoading from "@/components/NanquimLoading";
import ConfirmModal from "@/components/ConfirmModal";
import StatusModal, { StatusType } from "@/components/StatusModal";
import ExportModal from "@/components/ExportModal";
import GlossaryModal from "@/components/GlossaryModal";
import { readFile } from "@tauri-apps/plugin-fs";
import {
  GPenIcon,
  RectBubbleIcon,
  ShoutBubbleIcon,
  ThoughtBubbleIcon,
  DoubleBubbleIcon,
  TonboZoomInIcon,
  TonboZoomOutIcon,
  TonboFitIcon,
  ScrollExportIcon,
  DialoguePolishIcon,
} from "@/components/icons/MangaIcons";
import {
  ChevronLeft,
  ChevronRight,

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
  Brain,
  Tags,
  Book,
  Zap,
  Scan,
  Crosshair,
  Eye,
  EyeOff,
  ChevronDown,
  Sliders,

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
    <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 border-2 border-app-border bg-app-card/95 px-2 py-1 shadow-ink opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1">
      <span className="font-pixel text-[9px] font-bold text-app-text-secondary/60 px-1 select-none">
        ZOOM
      </span>
      <button
        type="button"
        title="Aumentar Zoom (+)"
        className="h-7 w-7 border border-app-border bg-app-surface text-app-text-primary hover:border-app-accent hover:text-app-accent flex items-center justify-center shadow-ink-sm transition-all"
        onClick={() => zoomIn()}
      >
        <TonboZoomInIcon size={14} />
      </button>
      <button
        type="button"
        title="Diminuir Zoom (-)"
        className="h-7 w-7 border border-app-border bg-app-surface text-app-text-primary hover:border-app-accent hover:text-app-accent flex items-center justify-center shadow-ink-sm transition-all"
        onClick={() => zoomOut()}
      >
        <TonboZoomOutIcon size={14} />
      </button>
      <div className="mx-0.5 h-4 w-px bg-app-border" />
      <button
        type="button"
        title="Ajustar à Tela (Reset)"
        className="h-7 w-7 border border-app-border bg-app-surface text-app-text-primary hover:border-app-accent hover:text-app-accent flex items-center justify-center shadow-ink-sm transition-all"
        onClick={() => resetTransform()}
      >
        <TonboFitIcon size={14} />
      </button>
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
    openRouterApiKey,
    groqApiKey,
    customApiKey,
    translationEngine,
    geminiModel,
    ollamaModel,
    openAiCompatibleProvider,
    openAiCompatibleModel,
    openRouterModelMode,
    aiThinkingEnabled,
    setAiThinkingEnabled,
    aiInferBlockTypesEnabled,
    setAiInferBlockTypesEnabled,
    aiSecondPassEnabled,
    setAiSecondPassEnabled,
    currentProjectId,
    clearStore,
    cancelPendingSaves,
    glossary,
    processingQueue,
    addToProcessingQueue,
    removeFromProcessingQueue,
    translationProfile,
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
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const [showBalloons, setShowBalloons] = useState(false);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<"ai" | "tools" | "export" | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    setHoveredBlockId(null);
    setSelectedBlockId(null);
    setOpenMenu(null);
  }, [currentPageIndex]);

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

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    // Prevent Ctrl+Enter from bubbling to global handler (which triggers AI)
    if (e.ctrlKey && e.key === 'Enter') {
      e.stopPropagation(); 
      e.preventDefault();
      
      if (index < (currentPage.blocks?.length || 0) - 1) {
        const nextTextarea = textareaRefs.current[index + 1];
        nextTextarea?.focus();
        nextTextarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Last block: go to next page
        if (currentPageIndex < pages.length - 1) {
          nextPage();
          setTimeout(() => {
            const first = textareaRefs.current[0];
            first?.focus();
            first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
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

    // Shortcut: M to merge with next
    if (e.altKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      const currentBlock = currentPage.blocks[index];
      const nextBlock = currentPage.blocks[index + 1];
      if (nextBlock) {
        updateBlock(currentPage.id, currentBlock.id, { text: `${currentBlock.text} ${nextBlock.text}`.trim() });
        removeBlock(currentPage.id, nextBlock.id);
      }
    }

    // Shortcut: S to swap with next
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (index < (currentPage.blocks?.length || 0) - 1) {
        reorderBlocks(currentPage.id, index, index + 1);
      }
    }
  };

  // Usar o objeto currentPage inteiro como dep recarregaria a imagem a cada
  // edicao de bloco; id/path ja bastam (disable na linha das deps).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex, currentPage?.id, currentPage?.path]);

  // Atalhos globais de teclado. Registrado antes do early return abaixo para
  // respeitar as Rules of Hooks (hooks nao podem ser condicionais).
  // handleTranslate/nextPage/prevPage sao recriados a cada render; as deps
  // abaixo ja cobrem os valores que eles leem (disable na linha das deps).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;

      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        void handleTranslate();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex, currentPage?.id, isTranslating, apiKey, imgBase64, translationEngine, geminiModel]);

  if (!currentPage) return null;

  const pageImageSrc = currentPage.url || "";
  const selectedOpenAiProvider = getOpenAiCompatibleProvider(openAiCompatibleProvider);
  const currentOpenAiApiKey =
    openAiCompatibleProvider === "openrouter"
      ? openRouterApiKey
      : openAiCompatibleProvider === "groq"
        ? groqApiKey
        : customApiKey;

  const displayedBubbles = useMemo(() => {
    return (currentPage?.blocks || [])
      .filter((b) => b.bbox != null)
      .map((b, idx) => ({
        id: b.id,
        blockId: b.id,
        orderIndex: idx + 1,
        x: b.bbox!.x,
        y: b.bbox!.y,
        width: b.bbox!.width,
        height: b.bbox!.height,
        text: b.text,
      }));
  }, [currentPage?.blocks]);

  const handleBubbleClick = (bubble: { id: string; blockId?: string | null }) => {
    const targetBlockId = bubble.blockId || bubble.id;
    setSelectedBlockId(targetBlockId);

    const blockIndex = (currentPage?.blocks || []).findIndex((b) => b.id === targetBlockId);
    if (blockIndex !== -1) {
      const textarea = textareaRefs.current[blockIndex];
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleTranslate = async () => {
    if (translationEngine === "gemini" && !apiKey) {
      setStatusModal({
        isOpen: true,
        title: "Erro de Configuracao",
        description: "A API Key do Gemini nao foi encontrada. Configure-a no Dashboard.",
        type: "error",
      });
      return;
    }

    if (
      translationEngine === "openaiCompatible" &&
      selectedOpenAiProvider.requiresApiKey &&
      !currentOpenAiApiKey
    ) {
      setStatusModal({
        isOpen: true,
        title: "Erro de Configuracao",
        description: `A ${selectedOpenAiProvider.apiKeyLabel} nao foi encontrada. Configure-a em Ajustes.`,
        type: "error",
      });
      return;
    }

    setIsTranslating(true);
    setTranslationStartedAt(Date.now());
    setTranslationStatus(
      translationEngine === "ollama"
        ? `Otimizando imagem para ${ollamaModel}...`
        : translationEngine === "openaiCompatible"
          ? `Enviando imagem para ${selectedOpenAiProvider.label}...`
          : "Enviando imagem para o Gemini..."
    );
    const base64 = await optimizeImageForAi(imgBase64);

    // Contexto da pagina anterior
    let previousContext: string | null = null;
    if (currentPageIndex > 0) {
      const prevPage = pages[currentPageIndex - 1];
      if (prevPage.blocks && prevPage.blocks.length > 0) {
        previousContext = prevPage.blocks
          .map((b) => `[${b.type}] ${b.text}`)
          .join("\n");
      }
    }

    try {
      await translatePage(
        translationEngine,
        apiKey,
        openRouterApiKey,
        groqApiKey,
        customApiKey,
        geminiModel,
        ollamaModel,
        openAiCompatibleProvider,
        openAiCompatibleModel,
        openRouterModelMode,
        aiThinkingEnabled,
        aiInferBlockTypesEnabled,
        base64,
        glossary,
        previousContext,
        (results) => {
          if (results.length === 0) {
            setStatusModal({
              isOpen: true,
              title: "Resposta Vazia da IA",
              description:
                translationEngine === "ollama"
                  ? "O modelo local respondeu, mas nao devolveu blocos utilizaveis. Isso e comum em modelos pequenos/CPU-only. Tente outra pagina ou use Gemini."
                  : translationEngine === "openaiCompatible"
                    ? "O provedor respondeu, mas nao devolveu blocos utilizaveis. Confira se o modelo selecionado suporta vision."
                  : "A IA respondeu sem blocos utilizaveis para esta pagina.",
              type: "warning",
            });
            return;
          }

          const newBlocks = results.map((res) => ({
            id: crypto.randomUUID(),
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
        },
        translationProfile,
        aiSecondPassEnabled
      );
    } catch (error) {
      let friendlyMessage = "Ocorreu um erro inesperado ao processar a pagina.";
      const errorInfo = error as { message?: string; statusText?: string; code?: string } | null;
      const errorStr = [errorInfo?.message, errorInfo?.statusText, String(error)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const errorCode = typeof errorInfo?.code === "string" ? errorInfo.code : "";

      if (errorCode === "GEMINI_INVALID_KEY" || errorStr.includes("api key not valid") || errorStr.includes("invalid api key")) {
        friendlyMessage = "Sua chave de API do Gemini e invalida. Verifique-a nas configuracoes.";
      } else if (errorCode === "GEMINI_RATE_LIMIT" || errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("too many requests")) {
        friendlyMessage = "O Google recusou a requisicao com 429. Isso normalmente significa quota, billing ou limite temporario no projeto do Gemini, e pode acontecer ate com chave nova.";
      } else if (errorCode === "GEMINI_FORBIDDEN" || errorStr.includes("permission denied") || errorStr.includes("forbidden")) {
        friendlyMessage = "A chave foi aceita, mas o projeto nao tem permissao para usar a Gemini API. Confira a chave, o projeto no AI Studio e se a API esta habilitada.";
      } else if (errorCode === "GEMINI_BAD_REQUEST") {
        friendlyMessage = "O Gemini recusou a requisicao. Confira se a chave pertence ao projeto certo e se esse projeto tem quota disponivel.";
      } else if (
        translationEngine === "ollama" &&
        (errorStr.includes("network") || errorStr.includes("fetch") || errorStr.includes("ollama nao encontrado"))
      ) {
        friendlyMessage = "Nao consegui falar com o Ollama. Verifique se ele esta aberto e rodando na sua maquina.";
      } else if (
        translationEngine === "openaiCompatible" &&
        (errorStr.includes("network") || errorStr.includes("fetch"))
      ) {
        friendlyMessage =
          selectedOpenAiProvider.id === "lmstudio"
            ? "Nao consegui falar com o LM Studio. Abra o servidor local na porta 1234 e confira se o modelo esta carregado."
            : `Nao consegui falar com ${selectedOpenAiProvider.label}. Verifique sua internet e tente novamente.`;
      } else if (
        translationEngine === "ollama" &&
        (errorStr.includes("tempo limite") || errorStr.includes("timeout"))
      ) {
        friendlyMessage = "O Ollama demorou demais para responder. Em CPU isso pode acontecer; tente uma pagina mais simples ou use Gemini.";
      } else if (errorStr.includes("modelo do ollama nao encontrado") || errorStr.includes("not found")) {
        friendlyMessage = `O modelo ${ollamaModel} ainda nao foi baixado. Rode "ollama pull ${ollamaModel}" no terminal.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_MISSING_KEY" || errorCode === "OPENAI_COMPATIBLE_INVALID_KEY") {
        friendlyMessage = errorInfo?.message ?? `Confira a chave salva para ${selectedOpenAiProvider.label}.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_RATE_LIMIT") {
        friendlyMessage = errorInfo?.message ?? `${selectedOpenAiProvider.label} retornou limite de uso. Tente novamente em alguns minutos.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_FORBIDDEN") {
        friendlyMessage = errorInfo?.message ?? `${selectedOpenAiProvider.label} recusou a requisicao. Confira permissao, saldo e modelo.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_BAD_REQUEST") {
        friendlyMessage = errorInfo?.message ?? `Confira se ${openAiCompatibleModel} suporta vision em ${selectedOpenAiProvider.label}.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_TIMEOUT") {
        friendlyMessage = errorInfo?.message ?? `${selectedOpenAiProvider.label} demorou demais para responder. Tente uma página mais simples ou outro modelo.`;
      } else if (errorCode === "OPENAI_COMPATIBLE_UNKNOWN") {
        friendlyMessage = errorInfo?.message ?? `${selectedOpenAiProvider.label} retornou um erro inesperado.`;
      } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
        friendlyMessage = "Erro de conexao. Verifique sua internet ou o status dos servidores da IA.";
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

  const handleBatchTranslate = async (count = 5) => {
    // Começa da pagina atual ate count paginas a frente
    const startIndex = currentPageIndex;
    const endIndex = Math.min(startIndex + count, pages.length);

    for (let i = startIndex; i < endIndex; i++) {
      const page = pages[i];
      
      // Pula se ja estiver concluida ou ja estiver na fila
      if (page.status === 'completed' || processingQueue.includes(page.id)) {
        continue;
      }

      // Adiciona na fila global
      addToProcessingQueue(page.id);

      // Dispara a traducao em background (sem await para nao travar o loop)
      void (async () => {
        try {
          // Precisamos ler a imagem dessa pagina especifica
          const cleanPath = page.path
            .replace("http://asset.localhost/", "")
            .replace(/%2F/g, "/")
            .replace(/%3A/g, ":");

          const contents = await readFile(cleanPath);
          const blob = new Blob([contents], { type: inferImageMimeType(cleanPath) });
          const reader = new FileReader();
          
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          const optimizedBase64 = await optimizeImageForAi(base64Data);

          // Contexto da pagina anterior para o lote
          let previousContext: string | null = null;
          if (i > 0) {
            const prevPage = pages[i - 1];
            if (prevPage.blocks && prevPage.blocks.length > 0) {
              previousContext = prevPage.blocks
                .map((b) => `[${b.type}] ${b.text}`)
                .join("\n");
            }
          }

          await translatePage(
            translationEngine,
            apiKey,
            openRouterApiKey,
            groqApiKey,
            customApiKey,
            geminiModel,
            ollamaModel,
            openAiCompatibleProvider,
            openAiCompatibleModel,
            openRouterModelMode,
            aiThinkingEnabled,
            aiInferBlockTypesEnabled,
            optimizedBase64,
            glossary,
            previousContext,
            (results) => {
              const newBlocks = results.map((res) => ({
                id: crypto.randomUUID(),
                text: res.text,
                type: (res.type ?? "none") as BlockType,
              }));
              updatePage(page.id, {
                blocks: newBlocks,
                status: "completed",
              });
            },
            undefined,
            undefined,
            translationProfile,
            aiSecondPassEnabled
          );
        } catch (error) {
          console.error(`Erro no lote para pagina ${i}:`, error);
        } finally {
          removeFromProcessingQueue(page.id);
        }
      })();

      // Pequeno delay entre disparos para nao floodar a API/Rede
      await new Promise(r => setTimeout(r, 800));
    }

    setStatusModal({
      isOpen: true,
      title: "Lote Iniciado",
      description: `Iniciamos a traducao automatica das proximas ${count} paginas em background.`,
      type: "success",
    });
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
    } catch (error) {
      console.error("Erro na exportacao:", error);
      setStatusModal({
        isOpen: true,
        title: "Erro na Exportacao",
        description: error instanceof Error ? `Nao foi possivel salvar o arquivo: ${error.message}` : "Nao foi possivel salvar o arquivo.",
        type: "error",
      });
    }
  };

  const handleFinishProject = () => {
    setFinishAfterExport(true);
    setShowExportModal(true);
  };

  const isBatchProcessing = processingQueue.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden border-2 border-app-border bg-app-surface shadow-ink relative">
      {/* Retícula de Nanquim e Papel Washi */}
      <div className="halftone absolute inset-0 opacity-[0.025] pointer-events-none" />

      {/* Overlay de Notificação do Batch (IA em Lote) */}
      {isBatchProcessing && (
        <div className="absolute right-6 top-16 z-[70] flex items-center gap-3 border-2 border-app-accent bg-app-card px-4 py-2.5 shadow-ink animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-app-accent border-t-transparent animate-spin" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-brush text-sm text-app-accent">[雷]</span>
              <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-app-text-primary">
                IA em Lote Ativa
              </span>
            </div>
            <span className="font-mono text-[9px] text-app-text-secondary">
              Processando {processingQueue.length} {processingQueue.length === 1 ? "página" : "páginas"} em background...
            </span>
          </div>
        </div>
      )}

      {/* Barra de Ferramentas Editorial Superior (Top Action Bar) */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-app-border bg-app-card/90 px-5 py-3 z-20 relative">
        {/* Esquerda: Voltar, Indicador de Página e Status da Página */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="btn border-2 border-app-border bg-app-surface px-3 py-1 font-bold text-xs uppercase tracking-wider text-app-text-primary shadow-ink-sm hover:border-app-accent hover:shadow-ink flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft size={16} />
            <span>{t("common.back").toUpperCase()}</span>
          </button>

          {/* Selo Editorial de Página */}
          <div className="flex items-center gap-2 border-2 border-app-border bg-app-surface px-3 py-1 shadow-ink-sm">
            <span className="font-brush text-sm font-black text-app-accent">[頁]</span>
            <span className="font-display text-sm uppercase tracking-wide text-app-text-primary">
              PÁGINA <span className="font-black text-app-accent">{currentPageIndex + 1}</span> / {pages.length}
            </span>
            <span className="max-w-[140px] truncate font-mono text-[10px] text-app-text-secondary/70 border-l border-app-border pl-2">
              {currentPage.name}
            </span>
          </div>

          {/* Navegação Entre Páginas */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="btn h-7 w-7 border-2 border-app-border bg-app-surface text-app-text-primary hover:border-app-accent hover:text-app-accent flex items-center justify-center shadow-ink-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Página Anterior (←)"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={isLastPage}
              className="btn h-7 w-7 border-2 border-app-border bg-app-surface text-app-text-primary hover:border-app-accent hover:text-app-accent flex items-center justify-center shadow-ink-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Próxima Página (→)"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Toggle de Conclusão / Sem Texto */}
          <button
            type="button"
            onClick={togglePageStatus}
            className={`btn border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-ink-sm flex items-center gap-1.5 transition-all ${
              currentPage.status === "completed"
                ? "border-emerald-600 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                : "border-app-border bg-app-surface text-app-text-secondary hover:border-app-accent hover:text-app-text-primary"
            }`}
          >
            {currentPage.status === "completed" ? (
              <>
                <span className="font-brush text-sm font-black">済</span>
                <span>CONCLUÍDA</span>
              </>
            ) : (
              <>
                <span className="font-brush text-sm font-black">未</span>
                <span>MARCAR SEM TEXTO</span>
              </>
            )}
          </button>
        </div>

        {/* Direita: Menus Organizados & Ação Principal */}
        <div ref={menuContainerRef} className="flex items-center gap-2 relative">
          {/* Menu 1: IA & LOTE */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "ai" ? null : "ai")}
              className={`btn border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-ink-sm flex items-center gap-1.5 transition-all ${
                openMenu === "ai"
                  ? "border-app-accent bg-app-card text-app-accent"
                  : "border-app-border bg-app-surface text-app-text-primary hover:border-app-accent"
              }`}
            >
              <span className="font-brush text-sm text-app-accent">筆</span>
              <span>IA & LOTE</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${openMenu === "ai" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "ai" && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border-2 border-app-border bg-app-card p-2 shadow-ink-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70 border-b border-dashed border-app-border">
                  OPÇÕES DO MOTOR DE IA
                </div>

                <div className="mt-1.5 flex flex-col gap-1">
                  {/* Batch 5 */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      handleBatchTranslate(5);
                    }}
                    disabled={isTranslating}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface hover:text-amber-500 transition-colors disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <span>Processar Lote (Batch 5)</span>
                    </div>
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-pixel text-[8px] text-amber-500">
                      AUTO
                    </span>
                  </button>

                  <div className="my-1 border-t border-dashed border-app-border" />

                  {/* Thinking Toggle */}
                  <button
                    type="button"
                    onClick={() => setAiThinkingEnabled(!aiThinkingEnabled)}
                    disabled={isTranslating}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Brain size={14} className={aiThinkingEnabled ? "text-amber-500" : "text-app-text-secondary"} />
                      <span>Raciocínio Profundo</span>
                    </div>
                    <span className={`rounded border px-2 py-0.5 font-pixel text-[9px] font-bold ${
                      aiThinkingEnabled
                        ? "border-amber-500 bg-amber-500/15 text-amber-500"
                        : "border-app-border bg-app-surface text-app-text-secondary/60"
                    }`}>
                      {aiThinkingEnabled ? "ON" : "OFF"}
                    </span>
                  </button>

                  {/* Tipos Semânticos Toggle */}
                  <button
                    type="button"
                    onClick={() => setAiInferBlockTypesEnabled(!aiInferBlockTypesEnabled)}
                    disabled={isTranslating}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tags size={14} className={aiInferBlockTypesEnabled ? "text-cyan-400" : "text-app-text-secondary"} />
                      <span>Classificar Tipos de Balão</span>
                    </div>
                    <span className={`rounded border px-2 py-0.5 font-pixel text-[9px] font-bold ${
                      aiInferBlockTypesEnabled
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-400"
                        : "border-app-border bg-app-surface text-app-text-secondary/60"
                    }`}>
                      {aiInferBlockTypesEnabled ? "ON" : "OFF"}
                    </span>
                  </button>

                  {/* 2ª Passada de Naturalidade Toggle */}
                  <button
                    type="button"
                    onClick={() => setAiSecondPassEnabled(!aiSecondPassEnabled)}
                    disabled={isTranslating}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <DialoguePolishIcon size={14} className={aiSecondPassEnabled ? "text-purple-400" : "text-app-text-secondary"} />
                      <span>2ª Passada: Naturalidade</span>
                    </div>
                    <span className={`rounded border px-2 py-0.5 font-pixel text-[9px] font-bold ${
                      aiSecondPassEnabled
                        ? "border-purple-500 bg-purple-500/15 text-purple-400"
                        : "border-app-border bg-app-surface text-app-text-secondary/60"
                    }`}>
                      {aiSecondPassEnabled ? "ON" : "OFF"}
                    </span>
                  </button>

                  <div className="my-1 border-t border-dashed border-app-border" />

                  {/* Perfil Editorial & Persona */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setShowProfileModal(true);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface hover:text-app-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-app-accent" />
                      <div className="flex flex-col text-left">
                        <span>Perfil Editorial</span>
                        <span className="font-pixel text-[8px] text-app-text-secondary/70">
                          {translationProfile.targetMedium.toUpperCase()} · {translationProfile.tone.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="font-brush text-xs text-app-accent">調</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu 2: FERRAMENTAS & PRANCHETA */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "tools" ? null : "tools")}
              className={`btn border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-ink-sm flex items-center gap-1.5 transition-all ${
                openMenu === "tools"
                  ? "border-app-accent bg-app-card text-app-accent"
                  : "border-app-border bg-app-surface text-app-text-primary hover:border-app-accent"
              }`}
            >
              <span className="font-brush text-sm text-app-accent">器</span>
              <span>FERRAMENTAS</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${openMenu === "tools" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "tools" && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border-2 border-app-border bg-app-card p-2 shadow-ink-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70 border-b border-dashed border-app-border">
                  PRANCHETA & REGRAS
                </div>

                <div className="mt-1.5 flex flex-col gap-1">
                  {/* Glossário */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setShowGlossaryModal(true);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface hover:text-app-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Book size={14} className="text-app-accent" />
                      <span>Glossário do Projeto</span>
                    </div>
                    <span className="font-brush text-xs text-app-text-secondary">辞</span>
                  </button>

                  <div className="my-1 border-t border-dashed border-app-border" />

                  {/* Toggle Exibir Balões */}
                  <button
                    type="button"
                    onClick={() => setShowBalloons(!showBalloons)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {showBalloons ? <Eye size={14} className="text-hanko" /> : <EyeOff size={14} className="text-app-text-secondary" />}
                      <span>Caixas de Balões</span>
                    </div>
                    <span className={`rounded border px-2 py-0.5 font-pixel text-[9px] font-bold ${
                      showBalloons
                        ? "border-hanko bg-hanko/15 text-hanko"
                        : "border-app-border bg-app-surface text-app-text-secondary/60"
                    }`}>
                      {showBalloons ? "VISÍVEIS" : "OCULTAS"}
                    </span>
                  </button>

                  {/* Limpar Caixas */}
                  {displayedBubbles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const clearedBlocks = (currentPage.blocks || []).map((b) => ({ ...b, bbox: undefined }));
                        updatePage(currentPage.id, { blocks: clearedBlocks });
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={14} />
                        <span>Limpar Caixas da Imagem</span>
                      </div>
                      <span className="font-pixel text-[9px]">RESET</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu 3: EXPORTAR */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}
              className={`btn border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-ink-sm flex items-center gap-1.5 transition-all ${
                openMenu === "export"
                  ? "border-app-accent bg-app-card text-app-accent"
                  : "border-app-border bg-app-surface text-app-text-primary hover:border-app-accent"
              }`}
            >
              <span className="font-brush text-sm text-app-accent">出</span>
              <span>EXPORTAR</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${openMenu === "export" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "export" && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border-2 border-app-border bg-app-card p-2 shadow-ink-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70 border-b border-dashed border-app-border">
                  EXPORTAÇÃO & ENCADERNAÇÃO
                </div>

                <div className="mt-1.5 flex flex-col gap-1">
                  {/* Exportar Normal */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setFinishAfterExport(false);
                      setShowExportModal(true);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-app-text-primary hover:bg-app-surface hover:text-app-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ScrollExportIcon size={15} className="text-app-accent" />
                      <span>Exportar Roteiro (.txt / .docx)</span>
                    </div>
                    <span className="font-pixel text-[8px] text-app-text-secondary/70">ARQUIVO</span>
                  </button>

                  {/* Finalizar Capítulo */}
                  {isLastPage && (
                    <>
                      <div className="my-1 border-t border-dashed border-app-border" />
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          setShowFinishModal(true);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Flag size={14} />
                          <span>Finalizar Capítulo Completo</span>
                        </div>
                        <span className="font-brush text-xs font-black">済</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI DRAFT (Ação Principal Nanquim) */}
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="btn primary border-2 border-app-text-primary bg-app-accent text-white px-4 py-1 text-xs font-black uppercase tracking-wider shadow-ink hover:shadow-ink-hover hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 transition-all ml-1"
          >
            {isTranslating ? <Loader2 className="animate-spin" size={14} /> : <GPenIcon size={15} />}
            <span>AI DRAFT</span>
          </button>
        </div>
      </header>

      {/* Mesa Central de Edição: Imagem + Painel de Blocos */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Canvas da Imagem (Prancheta Mangaka) */}
        <div className="group relative flex-1 overflow-hidden border-r-2 border-app-border bg-app-bg/60">
          {/* Marcas de Registro / Tonbo (Cantoneiras Editoriais) */}
          <div className="absolute top-2 left-2 text-app-border font-pixel text-xs pointer-events-none select-none z-10">┌</div>
          <div className="absolute top-2 right-2 text-app-border font-pixel text-xs pointer-events-none select-none z-10">┐</div>
          <div className="absolute bottom-2 left-2 text-app-border font-pixel text-xs pointer-events-none select-none z-10">└</div>
          <div className="absolute bottom-2 right-2 text-app-border font-pixel text-xs pointer-events-none select-none z-10">┘</div>

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
                  <div className="relative inline-block select-none max-h-full max-w-full">
                    <img
                      src={pageImageSrc}
                      className="block h-auto max-h-full w-auto max-w-full object-contain border-2 border-app-border shadow-ink-lg transition-transform"
                      alt="Página de mangá sob edição"
                    />

                    {/* Overlay de Bounding Boxes de Balões */}
                    {showBalloons && displayedBubbles.length > 0 && (
                      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                        {displayedBubbles.map((bubble, idx) => {
                          const isHovered =
                            hoveredBlockId === bubble.id || (bubble.blockId && hoveredBlockId === bubble.blockId);
                          const isSelected =
                            selectedBlockId === bubble.id || (bubble.blockId && selectedBlockId === bubble.blockId);

                          return (
                            <div
                              key={bubble.id}
                              style={{
                                left: `${bubble.x}%`,
                                top: `${bubble.y}%`,
                                width: `${bubble.width}%`,
                                height: `${bubble.height}%`,
                              }}
                              className={`pointer-events-auto absolute border-2 transition-all cursor-pointer ${
                                isHovered || isSelected
                                  ? "border-hanko bg-hanko/25 shadow-hanko z-30 scale-[1.01]"
                                  : "border-app-accent/80 bg-app-accent/10 hover:border-hanko hover:bg-hanko/20 z-20"
                              }`}
                              onClick={() => handleBubbleClick(bubble)}
                              onMouseEnter={() => setHoveredBlockId(bubble.blockId || bubble.id)}
                              onMouseLeave={() => setHoveredBlockId(null)}
                              title={`Balão #${String(bubble.orderIndex || idx + 1).padStart(2, "0")}`}
                            >
                              {/* Selo Hanko numerado no canto superior direito */}
                              <div className="absolute -top-3 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-sm border border-app-border bg-hanko px-1 font-pixel text-[9px] font-bold text-white shadow-[1px_1px_0px_#000]">
                                #{String(bubble.orderIndex || idx + 1).padStart(2, "0")}
                              </div>

                              {bubble.text ? (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-nanquim-deep/90 px-1.5 py-0.5 text-[9px] font-body text-washi opacity-0 transition-opacity hover:opacity-100 line-clamp-2">
                                  {bubble.text}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-xs font-mono uppercase text-app-text-secondary/40">
                    <NanquimLoading compact text="Carregando Imagem..." />
                  </div>
                )}
              </TransformComponent>
            </React.Fragment>
          </TransformWrapper>

          {/* Overlay de Tradução Ativa */}
          {isTranslating && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-app-bg/85 backdrop-blur-sm">
              <NanquimLoading compact={false} text={translationStatus || "Processando Tradução"} subtitle="執筆中 • ANALISANDO PÁGINA COM IA" />
              <div className="flex max-w-md flex-col items-center gap-2 text-center">
                <span className="font-pixel text-[11px] uppercase tracking-[0.2em] text-app-text-secondary">
                  {elapsedSeconds}s decorridos
                </span>
                {translationEngine === "ollama" && (
                  <span className="text-[10px] text-app-text-secondary/60 font-body">
                    Ollama local em CPU pode levar 1-5 minutos por página.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Barra Lateral Editorial: Roteiro & Blocos (550px) */}
        <aside className="flex w-[550px] flex-col bg-app-card border-l-2 border-app-border shadow-ink">
          {/* Header do Roteiro */}
          <div className="flex items-center justify-between border-b-2 border-app-border bg-app-surface p-3.5">
            <div className="flex items-center gap-2">
              <span className="font-brush text-base font-black text-app-accent">[台詞]</span>
              <h4 className="font-display text-sm uppercase tracking-wider text-app-text-primary">
                ROTEIRO & BLOCOS DE DIÁLOGO
              </h4>
            </div>
            <button
              type="button"
              className="font-pixel text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 shadow-ink-sm hover:border-rose-500 transition-all"
              onClick={() => updatePage(currentPage.id, { blocks: [] })}
            >
              <RefreshCcw size={10} className="mr-0.5" />
              <span>LIMPAR PÁGINA</span>
            </button>
          </div>

          {/* Lista de Blocos Editáveis */}
          <div className="no-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
            {(!currentPage.blocks || currentPage.blocks.length === 0) && !isTranslating && (
              <div className="flex h-full flex-col items-center justify-center border-2 border-dashed border-app-border/60 bg-app-surface/40 p-8 text-center my-auto">
                <div className="inline-grid h-12 w-12 place-items-center border-2 border-app-border bg-app-card text-app-text-secondary/40 shadow-ink-sm mb-3">
                  <span className="font-brush text-2xl">無</span>
                </div>
                <h4 className="font-display text-base uppercase tracking-wider text-app-text-primary mb-1">
                  FILA DE BALÕES VAZIA
                </h4>
                <p className="font-mono text-xs text-app-text-secondary/70 max-w-xs leading-relaxed mb-4">
                  Clique no botão vermelho <strong className="text-app-accent">AI DRAFT</strong> acima para extrair e traduzir com IA, ou crie blocos manualmente.
                </p>
                <button
                  type="button"
                  onClick={() => addBlock(currentPage.id)}
                  className="btn border-2 border-app-border bg-app-card px-3 py-1 font-bold text-xs uppercase shadow-ink-sm hover:border-app-accent"
                >
                  + Inserir Bloco Manual
                </button>
              </div>
            )}

            {currentPage.blocks?.map((block, index) => {
              const isHovered = hoveredBlockId === block.id;
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onMouseEnter={() => setHoveredBlockId(block.id)}
                  onMouseLeave={() => setHoveredBlockId(null)}
                  className={`group flex flex-col gap-2.5 border-2 p-3 shadow-ink-sm transition-all hover:shadow-ink ${
                    isHovered || isSelected
                      ? "border-hanko bg-app-card shadow-hanko"
                      : "border-app-border bg-app-surface hover:border-app-accent/80"
                  }`}
                  style={{ borderLeftWidth: "5px", borderLeftColor: getBlockColor(block.type) }}
                >
                  {/* Cabeçalho do Bloco: Tipo Semântico + Coordenadas + Reordenação */}
                  <div className="flex items-center justify-between gap-2 border-b border-dashed border-app-border pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-pixel text-[9px] font-bold text-app-accent mr-0.5 select-none">
                        #{String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Badge de Coordenada Vinculada */}
                      {block.bbox && (
                        <span
                          className="inline-flex items-center gap-1 border border-app-accent/40 bg-app-accent/10 px-1.5 py-0.5 font-pixel text-[8px] text-app-accent hover:border-hanko hover:text-hanko cursor-pointer transition-colors"
                          title="Balão vinculado na imagem. Clique para destacar na prancheta."
                          onClick={() => {
                            setSelectedBlockId(block.id);
                            setHoveredBlockId(block.id);
                          }}
                        >
                          <Crosshair size={9} />
                          <span>X:{Math.round(block.bbox.x)}% Y:{Math.round(block.bbox.y)}%</span>
                        </span>
                      )}

                      <span className="font-pixel text-[9px] uppercase tracking-wider text-app-text-secondary/70 mr-1 select-none">
                        TIPO:
                      </span>
                    {[
                      { type: "rect", icon: <RectBubbleIcon size={13} />, title: "Narração / Caixa Retangular" },
                      { type: "outside", icon: <ShoutBubbleIcon size={13} />, title: "Texto Fora do Balão / Grito / SFX" },
                      { type: "thought", icon: <ThoughtBubbleIcon size={13} />, title: "Pensamento / Murmúrio" },
                      { type: "double", icon: <DoubleBubbleIcon size={13} />, title: "Balão Duplo / Sobreposto" },
                    ].map((button) => (
                      <button
                        key={button.type}
                        type="button"
                        title={button.title}
                        onClick={() =>
                          updateBlock(currentPage.id, block.id, {
                            type: block.type === button.type ? "none" : (button.type as BlockType),
                          })
                        }
                        className={`h-6 w-8 border-2 text-[10px] transition-all shadow-ink-sm flex items-center justify-center ${
                          block.type === button.type
                            ? "border-app-text-primary bg-app-text-primary text-app-bg shadow-ink -translate-y-0.5"
                            : "border-app-border bg-app-card text-app-text-secondary hover:border-app-accent hover:text-app-text-primary"
                        }`}
                      >
                        {button.icon}
                      </button>
                    ))}
                  </div>

                  {/* Ações de Reordenação e Exclusão */}
                  <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      title="Mover para cima"
                      className="h-6 w-6 border border-app-border bg-app-card text-app-text-secondary hover:border-app-accent hover:text-app-text-primary flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                      onClick={() => reorderBlocks(currentPage.id, index, index - 1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      title="Mover para baixo"
                      className="h-6 w-6 border border-app-border bg-app-card text-app-text-secondary hover:border-app-accent hover:text-app-text-primary flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                      onClick={() => reorderBlocks(currentPage.id, index, index + 1)}
                      disabled={index === (currentPage.blocks?.length || 0) - 1}
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      title="Remover este bloco"
                      className="h-6 w-6 border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:border-rose-500 hover:bg-rose-500/20 flex items-center justify-center"
                      onClick={() => removeBlock(currentPage.id, block.id)}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Área de Texto da Tradução */}
                <textarea
                  ref={(el) => {
                    textareaRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => handleTextareaKeyDown(e, index)}
                  className="min-h-[72px] resize-none border-2 border-app-border/40 bg-app-card/60 p-2.5 font-body text-sm font-bold outline-none transition-colors focus:border-app-accent focus:bg-app-card text-app-text-primary placeholder:text-app-text-secondary/30 placeholder:font-normal shadow-inner"
                  style={{ color: block.type !== "none" ? getBlockColor(block.type) : "inherit" }}
                  value={block.text}
                  onChange={(event) => updateBlock(currentPage.id, block.id, { text: event.target.value })}
                  placeholder="Digite ou edite o texto da tradução..."
                />
              </div>
            );
          })}

            {/* Botão de Adicionar Bloco Manual */}
            <button
              type="button"
              onClick={() => addBlock(currentPage.id)}
              className="btn h-12 border-2 border-dashed border-app-border bg-app-surface font-display text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-accent hover:bg-app-card shadow-ink-sm flex items-center justify-center gap-2 transition-all mt-1"
            >
              <Plus size={15} />
              <span>+ NOVO BLOCO DE DIÁLOGO MANUAL</span>
            </button>
          </div>

          {/* Lembrete de Atalhos & Legenda (Mangaka Margins) */}
          <div className="border-t-2 border-app-border bg-app-surface px-4 py-3">
            <div className="mb-3 border-b border-dashed border-app-border pb-2.5">
              <h5 className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-accent mb-1.5 flex items-center gap-1">
                <span>[速]</span> ATALHOS DE TECLADO RÁPIDOS
              </h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px] uppercase text-app-text-secondary">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app-text-primary">Ctrl+Enter</span>
                  <span>Próximo Bloco</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app-text-primary">Alt + S</span>
                  <span>Swap (Trocar)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app-text-primary">Alt + M</span>
                  <span>Merge (Unir)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app-text-primary">Alt + 1..4</span>
                  <span>Tipo Semântico</span>
                </div>
              </div>
            </div>

            {/* Legenda de Tipos */}
            <div className="flex items-center justify-between font-mono text-[9px] uppercase text-app-text-secondary">
              <span className="flex items-center gap-1">
                <strong className="text-emerald-500">[]</strong> Retângulo
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-blue-500">{"{}"}</strong> Texto Fora
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-violet-500">()</strong> Pensamento
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-rose-500">//</strong> Balão Duplo
              </span>
            </div>
          </div>

          {/* Rodapé da Barra Lateral */}
          <footer className="flex justify-between border-t-2 border-app-border bg-app-card px-4 py-2 font-mono text-[9px] uppercase text-app-text-secondary/70">
            <span>{currentPage.blocks?.length || 0} blocos na página</span>
            <span className={currentPage.status === "completed" ? "text-emerald-500 font-bold" : "text-app-text-secondary/70"}>
              Status: {currentPage.status === "completed" ? "Concluída" : "Rascunho"}
            </span>
          </footer>
        </aside>
      </div>

      {/* Modais do Sistema */}
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

      <GlossaryModal
        isOpen={showGlossaryModal}
        onClose={() => setShowGlossaryModal(false)}
      />

      <TranslationProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Tira de Contato Inferior (Filmstrip / Navegação por Páginas) */}
      <footer className="flex h-16 items-center justify-between border-t-2 border-app-border bg-app-card px-6 shadow-ink-sm z-20 relative">
        <button
          type="button"
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className="btn border-2 border-app-border bg-app-surface px-4 py-1.5 font-display text-xs font-black uppercase tracking-wider text-app-text-primary hover:border-app-accent hover:shadow-ink-sm disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-ink-sm transition-all"
        >
          <ChevronLeft size={16} />
          <span>ANTERIOR</span>
        </button>

        {/* Filmstrip / Contato de Páginas */}
        <div className="no-scrollbar flex max-w-[50%] items-center gap-2 overflow-x-auto px-4 py-2 border-x border-dashed border-app-border">
          {pages.map((page, index) => {
            const isProcessing = processingQueue.includes(page.id);
            const isCurrent = index === currentPageIndex;
            const isCompleted = page.status === "completed";

            return (
              <div
                key={index}
                title={`Página ${index + 1}${isProcessing ? " (Traduzindo...)" : isCompleted ? " (Concluída)" : ""}`}
                className={`relative cursor-pointer flex-shrink-0 transition-all flex flex-col items-center justify-center font-pixel text-[9px] font-bold select-none ${
                  isCurrent
                    ? "h-8 w-9 border-2 border-app-accent bg-app-surface text-app-accent shadow-ink-sm -translate-y-0.5"
                    : isCompleted
                      ? "h-7 w-7 border border-emerald-600/60 bg-emerald-500/10 text-emerald-500 hover:border-emerald-600"
                      : "h-7 w-7 border border-app-border bg-app-surface/60 text-app-text-secondary/60 hover:border-app-text-primary hover:text-app-text-primary"
                }`}
                onClick={() => useMangaStore.getState().setPageIndex(index)}
              >
                <span>{index + 1}</span>
                {isCompleted && (
                  <span className="font-brush text-[8px] leading-none absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full w-3 h-3 flex items-center justify-center">
                    済
                  </span>
                )}
                {isProcessing && (
                  <span className="absolute -top-1 left-0 right-0 h-1 animate-pulse bg-app-accent" />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={nextPage}
          disabled={currentPageIndex === pages.length - 1}
          className="btn border-2 border-app-border bg-app-surface px-4 py-1.5 font-display text-xs font-black uppercase tracking-wider text-app-text-primary hover:border-app-accent hover:shadow-ink-sm disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-ink-sm transition-all"
        >
          <span>PRÓXIMA</span>
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
};

export default EditorView;

