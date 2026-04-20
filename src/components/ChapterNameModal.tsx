import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="rounded-3xl border-app-border bg-app-surface text-app-text-primary backdrop-blur-xl sm:max-w-md shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter italic text-app-text-primary">
              <FolderPlus size={20} className="text-app-text-primary" />
              Nome do Capitulo
            </DialogTitle>
            <DialogDescription className="mt-2 text-[10px] font-mono uppercase tracking-widest text-app-text-secondary/60">
              O nome sugerido vem da pasta selecionada, mas voce pode ajustar antes de importar.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: One Piece - Cap 1111"
              autoFocus
              className="h-12 w-full rounded-xl border border-app-border bg-app-bg/40 px-4 text-sm text-app-text-primary outline-none transition-colors placeholder:text-app-text-secondary/20 focus:border-app-accent/50"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-app-text-secondary hover:text-app-text-primary text-[10px] font-bold uppercase hover:bg-app-surface/50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-app-text-primary text-[10px] font-bold uppercase text-app-bg hover:opacity-90 shadow-lg"
            >
              Iniciar Traducao
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterNameModal;
