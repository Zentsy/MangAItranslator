import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type StatusType = "error" | "success" | "info" | "warning";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: StatusType;
  buttonText?: string;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = "info",
  buttonText = "Entendido",
}) => {
  const getStampConfig = () => {
    switch (type) {
      case "error":
        return {
          char: "誤",
          label: "ERRO DO SISTEMA // ERROR",
          badgeClass: "bg-rose-600 text-white border-rose-800",
          btnClass: "border-rose-700 bg-rose-600 text-white hover:bg-rose-700 shadow-ink",
        };
      case "success":
        return {
          char: "成",
          label: "OPERAÇÃO CONCLUÍDA // SUCCESS",
          badgeClass: "bg-emerald-600 text-white border-emerald-800",
          btnClass: "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700 shadow-ink",
        };
      case "warning":
        return {
          char: "注",
          label: "AVISO EDITORIAL // WARNING",
          badgeClass: "bg-amber-500 text-black border-amber-700",
          btnClass: "border-amber-600 bg-amber-500 text-black hover:bg-amber-600 shadow-ink",
        };
      default:
        return {
          char: "報",
          label: "COMUNICADO DO APP // NOTICE",
          badgeClass: "bg-app-accent text-white border-app-text-primary",
          btnClass: "primary border-app-text-primary bg-app-accent text-white shadow-ink",
        };
    }
  };

  const config = getStampConfig();

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
            {/* Selo Hanko por Tipo */}
            <div
              className={`inline-grid h-12 w-12 shrink-0 place-items-center border-2 shadow-ink-sm -rotate-2 select-none ${config.badgeClass}`}
            >
              <span className="font-brush text-2xl font-black leading-none">{config.char}</span>
            </div>

            <div>
              <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                {config.label}
              </span>
              <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                {title}
              </DialogTitle>
            </div>
          </div>

          <div className="mt-4 border border-dashed border-app-border bg-app-surface/60 p-4 shadow-inner">
            <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 z-10 relative">
          <button
            type="button"
            onClick={onClose}
            className={`btn w-full py-2.5 font-display text-sm uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover ${config.btnClass}`}
          >
            {buttonText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
