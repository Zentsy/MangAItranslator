import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "default" | "destructive";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  variant = "default",
}) => {
  const isDestructive = variant === "destructive";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg sm:max-w-md p-6 relative overflow-hidden">
        {/* Cantoneiras Tonbo de Corte Editorial */}
        <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

        {/* Retícula sutil */}
        <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

        <DialogHeader className="pt-2 z-10 relative">
          <div className="flex items-center gap-3">
            {/* Selo Hanko Editorial */}
            <div
              className={`inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary text-white shadow-ink-sm -rotate-2 select-none ${
                isDestructive ? "bg-rose-600" : "bg-app-accent"
              }`}
            >
              <span className="font-brush text-2xl font-black leading-none">
                {isDestructive ? "破" : "確"}
              </span>
            </div>

            <div>
              <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                {isDestructive ? "AVISO DE EXCLUSÃO // CAUTION" : "CONFIRMAÇÃO // CONFIRM"}
              </span>
              <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                {title}
              </DialogTitle>
            </div>
          </div>

          <div className="mt-4 border border-dashed border-app-border bg-app-surface/60 p-3.5 shadow-inner">
            <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5 z-10 relative">
          <button
            type="button"
            onClick={onClose}
            className="btn border-2 border-app-border bg-app-surface px-4 py-2 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn border-2 px-5 py-2 font-black text-xs uppercase tracking-wider shadow-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
              isDestructive
                ? "border-rose-700 bg-rose-600 text-white hover:bg-rose-700 hover:shadow-ink-hover"
                : "primary border-app-text-primary bg-app-accent text-white hover:shadow-ink-hover"
            }`}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
