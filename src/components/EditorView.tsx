import React, { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useMangaStore, BlockType } from "@/store/useMangaStore";
import { translateWithGemini } from "@/services/geminiService";
import { dbService } from "@/services/dbService";
import { exportToTxt } from "@/utils/exportUtils";
import CyberLoading from "@/components/CyberLoading";
import ConfirmModal from "@/components/ConfirmModal";
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

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/80 p-1 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/40 hover:text-white"
        onClick={() => zoomIn()}
      >
        <ZoomIn size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/40 hover:text-white"
        onClick={() => zoomOut()}
      >
        <ZoomOut size={16} />
      </Button>
      <div className="mx-1 h-4 w-px bg-white/10" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/40 hover:text-white"
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
    currentProjectId,
    clearStore,
    cancelPendingSaves,
  } = useMangaStore();

  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;
  const [isTranslating, setIsTranslating] = useState(false);
  const [imgBase64, setImgBase64] = useState<string>("");
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    async function loadPageImage() {
      if (!currentPage) return;
      try {
        const cleanPath = currentPage.path
          .replace("http://asset.localhost/", "")
          .replace(/%2F/g, "/")
          .replace(/%3A/g, ":");

        const contents = await readFile(cleanPath);
        const blob = new Blob([contents]);
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

  const handleTranslate = async () => {
    if (!apiKey) return alert("API Key ausente.");
    setIsTranslating(true);
    try {
      const base64 = imgBase64.split(",")[1];
      await translateWithGemini(apiKey, base64, (blocks) => {
        const newBlocks = blocks.map((block) => ({
          id: Math.random().toString(36).substring(7),
          text: block.text,
          type: "none" as BlockType,
        }));
        updatePage(currentPage.id, {
          blocks: [...(currentPage.blocks || []), ...newBlocks],
          status: "completed",
        });
      });
    } catch (error) {
      alert("Erro ao processar imagem.");
    } finally {
      setIsTranslating(false);
    }
  };

  const togglePageStatus = () => {
    const newStatus = currentPage.status === "completed" ? "pending" : "completed";
    updatePage(currentPage.id, { status: newStatus });
  };

  const handleFinishProject = async () => {
    if (!currentProjectId) return;

    exportToTxt(pages);
    cancelPendingSaves();

    try {
      await dbService.deleteProject(currentProjectId);
      clearStore();
      onBack();
    } catch (error) {
      console.error("Erro ao finalizar projeto:", error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white/60 hover:bg-white/10">
            <ChevronLeft size={20} /> {t("common.back").toUpperCase()}
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono uppercase tracking-tighter text-white/40">
            PAGINA {currentPageIndex + 1} / {pages.length}
          </span>
          <div className="h-4 w-px bg-white/10" />
          <span className="max-w-[150px] truncate text-[10px] font-mono uppercase text-white/20">
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
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : "border-white/5 text-white/20 hover:bg-white/5"
            }`}
          >
            {currentPage.status === "completed" ? (
              <CheckCircle2 size={14} />
            ) : (
              <MessageSquareOff size={14} />
            )}
            {currentPage.status === "completed" ? "CONCLUIDA" : "MARCAR SEM TEXTO"}
          </Button>

          <div className="mx-2 h-4 w-px bg-white/10" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToTxt(pages)}
            className="gap-2 border-white/10 text-white/60 hover:bg-white/5"
          >
            <Download size={16} /> EXPORTAR .TXT
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
            className="gap-2 bg-white font-bold text-black hover:bg-white/90"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
            AI DRAFT
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="group relative flex-1 overflow-hidden border-r border-white/5 bg-black/40">
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
                {imgBase64 ? (
                  <img
                    src={imgBase64}
                    className="h-auto max-h-full w-auto max-w-full object-contain shadow-2xl transition-transform"
                    alt="page"
                  />
                ) : (
                  <div className="animate-pulse text-xs font-mono uppercase text-white/10">
                    Carregando Imagem...
                  </div>
                )}
              </TransformComponent>
            </React.Fragment>
          </TransformWrapper>
          {isTranslating && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/60">
              <CyberLoading />
              <span className="animate-pulse text-[10px] font-mono uppercase tracking-[0.4em]">
                Vision Engine Processing
              </span>
            </div>
          )}
        </div>

        <aside className="flex w-[550px] flex-col bg-black/60">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
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
          <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {(!currentPage.blocks || currentPage.blocks.length === 0) && !isTranslating && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white/10">
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
                className="group flex flex-col gap-3 rounded-xl border border-l-4 border-l-white/20 border-white/10 bg-white/5 p-3 transition-all hover:border-white/20"
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
                            ? "border-white bg-white text-black"
                            : "border-white/10 text-white/30 hover:bg-white/5 hover:text-white"
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
                      className="h-6 w-6"
                      onClick={() => reorderBlocks(currentPage.id, index, index - 1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
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
                  className={`min-h-[70px] resize-none rounded-lg border border-transparent bg-black/40 p-3 font-mono text-sm outline-none transition-colors focus:border-white/20 ${
                    block.type !== "none" ? "text-emerald-400" : "text-slate-300"
                  }`}
                  value={block.text}
                  onChange={(event) => updateBlock(currentPage.id, block.id, { text: event.target.value })}
                  placeholder="Texto da traducao..."
                />
              </div>
            ))}
            <Button
              variant="outline"
              className="h-14 rounded-xl border-dashed border-white/10 text-white/20 hover:border-white/30 hover:text-white"
              onClick={() => addBlock(currentPage.id)}
            >
              <Plus size={16} className="mr-2" /> NOVO BLOCO MANUAL
            </Button>
          </div>

          <div className="border-t border-white/5 bg-black/20 px-4 py-3">
            <h5 className="mb-2 text-[8px] font-bold uppercase italic tracking-[0.3em] text-white/20">
              Legenda de Sinais
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-mono uppercase text-white/40">
              <div className="flex items-center gap-2">
                <span className="text-white/60">[]</span> Retangulo
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">{"{}"}</span> Texto Fora
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">()</span> Pensamento
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">//</span> Balao Duplo
              </div>
            </div>
          </div>

          <footer className="flex justify-between border-t border-white/5 bg-white/5 p-3 text-[9px] font-mono uppercase text-white/20">
            <span>{currentPage.blocks?.length || 0} blocks in queue</span>
            <span className={currentPage.status === "completed" ? "text-emerald-500" : "text-rose-500/40"}>
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

      <footer className="flex h-16 items-center justify-between border-t border-white/5 bg-black/40 px-6">
        <Button
          variant="ghost"
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className="gap-2 font-bold text-white/40 hover:text-white"
        >
          <ChevronLeft size={20} /> ANTERIOR
        </Button>
        <div className="no-scrollbar flex max-w-[40%] items-center gap-2 overflow-x-auto px-4">
          {pages.map((page, index) => (
            <div
              key={index}
              className={`cursor-pointer flex-shrink-0 transition-all ${
                index === currentPageIndex
                  ? "h-1.5 w-8 bg-white"
                  : page.status === "completed"
                    ? "h-1.5 w-2 bg-emerald-500/40"
                    : "h-1.5 w-2 bg-white/10 hover:bg-white/30"
              }`}
              onClick={() => useMangaStore.getState().setPageIndex(index)}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={nextPage}
          disabled={currentPageIndex === pages.length - 1}
          className="gap-2 font-bold text-white/40 hover:text-white"
        >
          PROXIMA <ChevronRight size={20} />
        </Button>
      </footer>
    </div>
  );
};

export default EditorView;
