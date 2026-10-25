import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TranslationProfilePanel from "./TranslationProfilePanel";

interface TranslationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TranslationProfileModal: React.FC<TranslationProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg max-w-3xl p-6 max-h-[90vh] overflow-y-auto relative">
        {/* Cantoneiras Tonbo */}
        <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

        {/* Retícula */}
        <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

        <div className="relative z-10">
          <DialogHeader className="mb-5 pb-4 border-b border-dashed border-app-border">
            <div className="flex items-center gap-3">
              <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-app-accent text-white shadow-ink-sm -rotate-2 select-none">
                <span className="font-brush text-2xl font-black leading-none">調</span>
              </div>
              <div>
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  PERSONA EDITORIAL & PRESETS // AGENT PROFILE
                </span>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                  Perfil de Tradução & Estilo
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-app-text-secondary mt-1">
                  Configure a cultura de origem, o tom dos diálogos, o filtro de linguagem e as diretrizes exclusivas injetadas no System Prompt da IA.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <TranslationProfilePanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationProfileModal;
