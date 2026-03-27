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
      <DialogContent className="rounded-3xl border-white/10 bg-[#0a0a0a] text-slate-200 backdrop-blur-xl sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter italic">
              <FolderPlus size={20} className="text-white" />
              Nome do Capitulo
            </DialogTitle>
            <DialogDescription className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
              O nome sugerido vem da pasta selecionada, mas voce pode ajustar antes de importar.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: One Piece - Cap 1111"
              autoFocus
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-bold uppercase hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-white text-[10px] font-bold uppercase text-black hover:bg-white/90"
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
