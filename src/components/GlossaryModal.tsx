import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMangaStore } from "@/store/useMangaStore";
import { Plus, Trash2, Book } from "lucide-react";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const { glossary, addGlossaryTerm, removeGlossaryTerm } = useMangaStore();
  const [newTerm, setNewTerm] = useState("");
  const [newTranslation, setNewTranslation] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newTranslation.trim()) return;
    await addGlossaryTerm(newTerm.trim(), newTranslation.trim());
    setNewTerm("");
    setNewTranslation("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl border-app-border bg-app-surface text-app-text-primary shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl italic font-black uppercase tracking-tight">
            <Book className="text-app-text-secondary" />
            Glossario do Projeto
          </DialogTitle>
          <p className="text-xs text-app-text-secondary/60 uppercase tracking-widest font-mono">
            Defina termos especificos para manter a consistencia da IA
          </p>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-6">
          <form onSubmit={handleAdd} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end bg-app-bg/30 p-4 rounded-2xl border border-app-border">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary/50 ml-1">Termo (ex: Luffy)</label>
              <input
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="h-10 rounded-xl border border-app-border bg-app-surface px-4 text-sm outline-none focus:border-app-accent/30"
                placeholder="Termo original..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary/50 ml-1">Traducao (ex: Luffy)</label>
              <input
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                className="h-10 rounded-xl border border-app-border bg-app-surface px-4 text-sm outline-none focus:border-app-accent/30"
                placeholder="Como a IA deve traduzir..."
              />
            </div>
            <Button type="submit" size="icon" className="h-10 w-10 bg-app-text-primary text-app-bg hover:opacity-90">
              <Plus size={20} />
            </Button>
          </form>

          <div className="max-h-[300px] overflow-y-auto no-scrollbar flex flex-col gap-2">
            {glossary.length === 0 ? (
              <div className="py-12 text-center text-app-text-secondary/30 italic text-sm">
                Nenhum termo cadastrado ainda.
              </div>
            ) : (
              glossary.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-3 rounded-xl border border-app-border bg-app-surface/50 hover:bg-app-surface transition-colors">
                  <span className="font-mono text-sm truncate px-2">{item.term}</span>
                  <span className="font-bold text-sm truncate border-l border-app-border px-4">{item.translation}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGlossaryTerm(item.id)}
                    className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 border-t border-app-border pt-4">
          <Button variant="ghost" onClick={onClose} className="text-app-text-secondary uppercase text-[10px] font-bold tracking-widest hover:text-app-text-primary">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlossaryModal;
