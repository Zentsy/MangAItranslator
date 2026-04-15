import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileJson, Download, Loader2 } from "lucide-react";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-app-surface/90 border-app-border text-app-text-primary rounded-[2.5rem] sm:max-w-md backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter italic text-app-text-primary">
            <Download className="text-emerald-500" size={24} />
            Exportar Capítulo
          </DialogTitle>
          <div className="h-px w-full bg-gradient-to-r from-app-text-secondary/20 to-transparent mt-4 mb-2" />
          <DialogDescription className="text-app-text-secondary font-mono text-[11px] uppercase tracking-[0.15em] mt-3">
            Escolha o formato ideal para o seu fluxo de trabalho.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            disabled={isExporting}
            onClick={() => handleExport('txt')}
            className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-app-border bg-app-surface/50 hover:bg-app-surface hover:border-app-accent/30 transition-all group disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="text-blue-400" size={24} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold uppercase tracking-widest text-app-text-primary">Texto Puro</span>
              <span className="text-[9px] text-app-text-secondary/40 font-mono">(.txt)</span>
            </div>
          </button>

          <button
            disabled={isExporting}
            onClick={() => handleExport('docx')}
            className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-app-border bg-app-surface/50 hover:bg-app-surface hover:border-app-accent/30 transition-all group disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileJson className="text-indigo-400" size={24} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold uppercase tracking-widest text-app-text-primary">MS Word</span>
              <span className="text-[9px] text-app-text-secondary/40 font-mono">(.docx)</span>
            </div>
          </button>
        </div>

        <DialogFooter className="mt-8">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isExporting}
            className="w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface/50"
          >
            {isExporting ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
            {isExporting ? "Processando..." : "Cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
