import React, { useEffect, useState } from 'react';
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
import { invoke } from '@tauri-apps/api/core';
import { 
  ChevronLeft, ChevronRight, Wand2, Loader2, 
  ArrowUp, ArrowDown, Trash2, Plus, Download, RefreshCcw,
  ZoomIn, ZoomOut, Maximize, MessageSquareOff, CheckCircle2,
  Flag
} from "lucide-react";

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => zoomIn()}><ZoomIn size={16} /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => zoomOut()}><ZoomOut size={16} /></Button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => resetTransform()}><Maximize size={16} /></Button>
    </div>
  );
};

const EditorView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const { 
    pages, currentPageIndex, nextPage, prevPage, 
    updateBlock, reorderBlocks, addBlock, removeBlock, 
    updatePage, apiKey, currentProjectId, clearStore 
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
        const path = currentPage.path || currentPage.url;
        const cleanPath = path.replace("http://asset.localhost/", "").replace(/%2F/g, "/").replace(/%3A/g, ":");
        
        const contents = await readFile(cleanPath);
        const blob = new Blob([contents]);
        const reader = new FileReader();
        reader.onloadend = () => setImgBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Erro ao carregar imagem via FS:", e);
      }
    }
    loadPageImage();
  }, [currentPageIndex, currentPage?.id]);

  if (!currentPage) return null;

  const handleTranslate = async () => {
    if (!apiKey) return alert("API Key ausente.");
    setIsTranslating(true);
    try {
      const base64 = imgBase64.split(',')[1];
      await translateWithGemini(apiKey, base64, (blocks) => {
        const newBlocks = blocks.map(b => ({
          id: Math.random().toString(36).substring(7),
          text: b.text,
          type: 'none' as BlockType
        }));
        updatePage(currentPage.id, { 
          blocks: [...(currentPage.blocks || []), ...newBlocks],
          status: 'completed'
        });
      });
    } catch (e) {
      alert("Erro ao processar imagem.");
    } finally {
      setIsTranslating(false);
    }
  };

  const togglePageStatus = () => {
    const newStatus = currentPage.status === 'completed' ? 'pending' : 'completed';
    updatePage(currentPage.id, { status: newStatus });
  };

  const handleFinishProject = async () => {
    if (!currentProjectId) return;
    exportToTxt(pages);
    try {
      await invoke("clear_project_cache", { projectId: currentProjectId });
      await dbService.deleteProject(currentProjectId); // Deleta do histórico após finalizar
      clearStore();
      onBack();
    } catch (error) {
      console.error("Erro ao finalizar projeto:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/10 text-white/60">
            <ChevronLeft size={20} /> {t('common.back').toUpperCase()}
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono text-white/40 uppercase tracking-tighter">PÁGINA {currentPageIndex + 1} / {pages.length}</span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] font-mono text-white/20 uppercase truncate max-w-[150px]">{currentPage.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePageStatus}
            className={`gap-2 text-[10px] font-bold border transition-all ${currentPage.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'text-white/20 border-white/5 hover:bg-white/5'}`}
          >
            {currentPage.status === 'completed' ? <CheckCircle2 size={14} /> : <MessageSquareOff size={14} />}
            {currentPage.status === 'completed' ? 'CONCLUÍDA' : 'MARCAR SEM TEXTO'}
          </Button>

          <div className="h-4 w-px bg-white/10 mx-2" />

          <Button variant="outline" size="sm" onClick={() => exportToTxt(pages)} className="border-white/10 hover:bg-white/5 gap-2 text-white/60"><Download size={16} /> EXPORTAR .TXT</Button>
          
          {/* Botão Finalizar CONDICIONAL: Só aparece na última página */}
          {isLastPage && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFinishModal(true)}
              className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 gap-2 font-bold"
            >
              <Flag size={16} /> FINALIZAR CAPÍTULO
            </Button>
          )}

          <Button size="sm" className="bg-white text-black hover:bg-white/90 gap-2 font-bold" onClick={handleTranslate} disabled={isTranslating}>
            {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />} AI DRAFT
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-black/40 relative border-r border-white/5 group overflow-hidden">
          <TransformWrapper initialScale={1} minScale={0.1} maxScale={8} centerOnInit={true} limitToBounds={false} key={currentPage.id}>
            <React.Fragment>
              <ZoomControls />
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {imgBase64 ? (
                  <img src={imgBase64} className="max-h-full max-w-full w-auto h-auto object-contain shadow-2xl transition-transform" alt="page" />
                ) : (
                  <div className="text-white/10 font-mono text-xs uppercase animate-pulse">Carregando Imagem...</div>
                )}
              </TransformComponent>
            </React.Fragment>
          </TransformWrapper>
          {isTranslating && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-[60] gap-4">
              <CyberLoading /><span className="text-[10px] font-mono uppercase tracking-[0.4em] animate-pulse">Vision Engine Processing</span>
            </div>
          )}
        </div>

        <aside className="w-[550px] flex flex-col bg-black/60">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Translation Blocks</h4>
             <Button variant="ghost" size="sm" className="h-6 text-[9px] text-rose-500 hover:bg-rose-500/10" onClick={() => updatePage(currentPage.id, { blocks: [] })}><RefreshCcw size={10} className="mr-1" /> LIMPAR PÁGINA</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
            {(!currentPage.blocks || currentPage.blocks.length === 0) && !isTranslating && (
              <div className="h-full flex flex-col items-center justify-center text-white/10 text-center p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] leading-relaxed">Fila vazia.<br/>Clique em "AI DRAFT" ou adicione um bloco manual.</p>
              </div>
            )}
            {currentPage.blocks?.map((block, index) => (
              <div key={block.id} className="group bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3 hover:border-white/20 transition-all border-l-4 border-l-white/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {[{ type: 'rect', label: '[]' }, { type: 'outside', label: '{}' }, { type: 'thought', label: '()' }, { type: 'double', label: '//' }].map((btn) => (
                      <button key={btn.type} onClick={() => updateBlock(currentPage.id, block.id, { type: block.type === btn.type ? 'none' : btn.type as BlockType })} className={`w-8 h-6 rounded text-[9px] font-bold border transition-all ${block.type === btn.type ? 'bg-white text-black border-white' : 'border-white/10 text-white/30 hover:text-white hover:bg-white/5'}`}>{btn.label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => reorderBlocks(currentPage.id, index, index - 1)} disabled={index === 0}><ArrowUp size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => reorderBlocks(currentPage.id, index, index + 1)} disabled={index === (currentPage.blocks?.length || 0) - 1}><ArrowDown size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:bg-rose-500/10" onClick={() => removeBlock(currentPage.id, block.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
                <textarea className={`bg-black/40 p-3 rounded-lg text-sm font-mono outline-none border border-transparent focus:border-white/20 min-h-[70px] resize-none transition-colors ${block.type !== 'none' ? 'text-emerald-400' : 'text-slate-300'}`} value={block.text} onChange={(e) => updateBlock(currentPage.id, block.id, { text: e.target.value })} placeholder="Texto da tradução..." />
              </div>
            ))}
            <Button variant="outline" className="border-dashed border-white/10 text-white/20 hover:text-white hover:border-white/30 h-14 rounded-xl" onClick={() => addBlock(currentPage.id)}><Plus size={16} className="mr-2" /> NOVO BLOCO MANUAL</Button>
          </div>
          <footer className="p-3 bg-white/5 border-t border-white/5 text-[9px] font-mono text-white/20 flex justify-between uppercase">
             <span>{currentPage.blocks?.length || 0} blocks in queue</span>
             <span className={currentPage.status === 'completed' ? 'text-emerald-500' : 'text-rose-500/40'}>
                Status: {currentPage.status === 'completed' ? 'Completed' : 'Draft'}
             </span>
          </footer>
        </aside>
      </div>

      <ConfirmModal 
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleFinishProject}
        title={t('editor.finishModal.title')}
        description={t('editor.finishModal.description')}
        confirmText={t('editor.finishModal.confirm')}
      />

      <footer className="h-16 border-t border-white/5 bg-black/40 flex items-center px-6 justify-between">
        <Button variant="ghost" onClick={prevPage} disabled={currentPageIndex === 0} className="gap-2 text-white/40 hover:text-white font-bold"><ChevronLeft size={20} /> ANTERIOR</Button>
        <div className="flex gap-2 items-center px-4 overflow-x-auto no-scrollbar max-w-[40%]">
          {pages.map((page, i) => (
            <div key={i} className={`flex-shrink-0 transition-all cursor-pointer ${i === currentPageIndex ? 'w-8 h-1.5 bg-white' : page.status === 'completed' ? 'w-2 h-1.5 bg-emerald-500/40' : 'w-2 h-1.5 bg-white/10 hover:bg-white/30'}`} onClick={() => useMangaStore.getState().setPageIndex(i)} />
          ))}
        </div>
        <Button variant="ghost" onClick={nextPage} disabled={currentPageIndex === pages.length - 1} className="gap-2 text-white/40 hover:text-white font-bold">PRÓXIMA <ChevronRight size={20} /></Button>
      </footer>
    </div>
  );
};

export default EditorView;
