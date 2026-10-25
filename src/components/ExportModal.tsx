import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, FileCode2 } from "lucide-react";
import NanquimLoading from "@/components/NanquimLoading";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'txt' | 'docx') => Promise<void>;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'txt' | 'docx') => {
    setIsExporting(true);
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      console.error("Erro na exportação:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg sm:max-w-md p-6 relative overflow-hidden">
        {/* Cantoneiras Tonbo de Corte Editorial */}
        <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

        {/* Retícula sutil */}
        <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

        <div className="z-10 relative">
          <DialogHeader className="pt-2">
            <div className="flex items-center gap-3">
              {/* Selo Hanko Editorial [出] */}
              <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-app-accent text-white shadow-ink-sm -rotate-2 select-none">
                <span className="font-brush text-2xl font-black leading-none">出</span>
              </div>

              <div>
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  DESPACHO EDITORIAL // EXPORT ARTIFACTS
                </span>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                  Exportar Capítulo
                </DialogTitle>
              </div>
            </div>

            <div className="mt-4 border border-dashed border-app-border bg-app-surface/60 p-3 shadow-inner">
              <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
                Selecione o formato de saída para diagramação externa ou arquivamento do roteiro traduzido.
              </DialogDescription>
            </div>
          </DialogHeader>

          {isExporting ? (
            <div className="my-8 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-app-accent/40 bg-app-surface/80 p-8 shadow-inner">
              <NanquimLoading compact={false} text="Gerando Manuscrito..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 my-6">
              {/* Botão TXT */}
              <button
                disabled={isExporting}
                onClick={() => handleExport('txt')}
                className="group relative flex flex-col items-start gap-3 border-2 border-app-border bg-app-surface p-4 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-app-accent hover:bg-app-card hover:shadow-ink disabled:opacity-50"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center border border-app-border bg-app-card text-app-text-primary group-hover:border-app-accent group-hover:text-app-accent transition-colors">
                    <FileText size={18} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider border border-app-border px-1.5 py-0.5 text-app-text-secondary/80">
                    .TXT
                  </span>
                </div>
                <div>
                  <span className="block font-display text-sm font-bold uppercase tracking-wider text-app-text-primary group-hover:text-app-accent transition-colors">
                    Texto Puro
                  </span>
                  <span className="mt-1 block font-mono text-[10px] text-app-text-secondary/70 leading-snug">
                    Roteiro limpo com marcações de balão e páginas
                  </span>
                </div>
              </button>

              {/* Botão DOCX */}
              <button
                disabled={isExporting}
                onClick={() => handleExport('docx')}
                className="group relative flex flex-col items-start gap-3 border-2 border-app-border bg-app-surface p-4 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-app-accent hover:bg-app-card hover:shadow-ink disabled:opacity-50"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center border border-app-border bg-app-card text-app-text-primary group-hover:border-app-accent group-hover:text-app-accent transition-colors">
                    <FileCode2 size={18} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider border border-app-border px-1.5 py-0.5 text-app-text-secondary/80">
                    .DOCX
                  </span>
                </div>
                <div>
                  <span className="block font-display text-sm font-bold uppercase tracking-wider text-app-text-primary group-hover:text-app-accent transition-colors">
                    MS Word
                  </span>
                  <span className="mt-1 block font-mono text-[10px] text-app-text-secondary/70 leading-snug">
                    Tabelas de diálogo e notas para diagramadores
                  </span>
                </div>
              </button>
            </div>
          )}

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="btn w-full border-2 border-app-border bg-app-surface py-2.5 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
