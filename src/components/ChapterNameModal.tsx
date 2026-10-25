import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";

interface ChapterNameModalProps {
  isOpen: boolean;
  defaultName: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const ChapterNameModal: React.FC<ChapterNameModalProps> = ({
  isOpen,
  defaultName,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
    }
  }, [defaultName, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    onConfirm(trimmedName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg sm:max-w-md p-6 relative overflow-hidden">
        {/* Cantoneiras Tonbo de Corte Editorial */}
        <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

        {/* Retícula sutil */}
        <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

        <form onSubmit={handleSubmit} className="z-10 relative">
          <DialogHeader className="pt-2">
            <div className="flex items-center gap-3">
              {/* Selo Hanko Editorial [題] */}
              <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-app-accent text-white shadow-ink-sm -rotate-2 select-none">
                <span className="font-brush text-2xl font-black leading-none">題</span>
              </div>

              <div>
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  REGISTRO EDITORIAL // CHAPTER ENTRY
                </span>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                  Nome do Capítulo
                </DialogTitle>
              </div>
            </div>

            <div className="mt-4 border border-dashed border-app-border bg-app-surface/60 p-3 shadow-inner">
              <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
                O título sugerido foi extraído da pasta selecionada. Ajuste conforme necessário antes de abrir a mesa editorial.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-5">
            <label className="block mb-2 font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
              Título do Tomo / Capítulo
            </label>
            <div className="relative">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: One Piece - Cap 1111"
                autoFocus
                className="w-full border-2 border-app-border bg-app-surface px-4 py-3 font-mono text-sm text-app-text-primary outline-none transition-all placeholder:text-app-text-secondary/30 focus:border-app-accent focus:shadow-ink-sm"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary/40 pointer-events-none">
                <FolderPlus size={18} />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn border-2 border-app-border bg-app-surface px-4 py-2 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn primary border-2 border-app-text-primary bg-app-accent px-5 py-2 font-black text-xs uppercase tracking-wider text-white shadow-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover disabled:opacity-50 disabled:pointer-events-none"
            >
              Abrir Mesa Editorial
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterNameModal;
