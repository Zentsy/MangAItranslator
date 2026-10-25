import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMangaStore } from "@/store/useMangaStore";
import { Plus, Trash2, ArrowRight } from "lucide-react";

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
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg sm:max-w-2xl p-6 relative overflow-hidden">
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
              {/* Selo Hanko Editorial [辞] */}
              <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-app-accent text-white shadow-ink-sm -rotate-2 select-none">
                <span className="font-brush text-2xl font-black leading-none">辞</span>
              </div>

              <div>
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  DICIONÁRIO DE TERMOS // PROJECT GLOSSARY
                </span>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                  Glossário Editorial
                </DialogTitle>
              </div>
            </div>

            <div className="mt-4 border border-dashed border-app-border bg-app-surface/60 p-3 shadow-inner">
              <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
                Fixe termos canônicos, nomes próprios, golpes e entidades para garantir máxima consistência nas traduções da IA.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-5 flex flex-col gap-5">
            {/* Formulário de Inserção de Termo */}
            <form onSubmit={handleAdd} className="border-2 border-app-border bg-app-surface/90 p-4 shadow-ink-sm">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                    Termo Original (Raw/JP)
                  </label>
                  <input
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="h-10 border-2 border-app-border bg-app-card px-3 font-mono text-sm text-app-text-primary outline-none transition-all placeholder:text-app-text-secondary/30 focus:border-app-accent focus:shadow-ink-sm"
                    placeholder="Ex: 麦わら (Straw Hat)"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                    Tradução Fixa (PT-BR)
                  </label>
                  <input
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    className="h-10 border-2 border-app-border bg-app-card px-3 font-mono text-sm text-app-text-primary outline-none transition-all placeholder:text-app-text-secondary/30 focus:border-app-accent focus:shadow-ink-sm"
                    placeholder="Ex: Chapéu de Palha"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newTerm.trim() || !newTranslation.trim()}
                  className="btn primary border-2 border-app-text-primary bg-app-accent h-10 px-4 font-black text-xs uppercase tracking-wider text-white shadow-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Cadastrar</span>
                </button>
              </div>
            </form>

            {/* Lista de Termos Cadastrados */}
            <div className="max-h-[260px] overflow-y-auto no-scrollbar flex flex-col gap-2.5 pr-1">
              {glossary.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-app-border bg-app-surface/40 text-center select-none">
                  <span className="font-brush text-3xl font-black text-app-text-secondary/40">無</span>
                  <span className="mt-2 font-display text-sm uppercase tracking-wider text-app-text-secondary/70">
                    Nenhum termo cadastrado ainda
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-app-text-secondary/50">
                    Adicione regras no formulário acima para guiar o motor de tradução.
                  </span>
                </div>
              ) : (
                glossary.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3 border-2 border-app-border bg-app-surface hover:border-app-accent/80 hover:bg-app-card transition-all shadow-ink-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-app-text-primary truncate max-w-[45%]">
                        {item.term}
                      </span>
                      <ArrowRight size={14} className="text-app-text-secondary/40 shrink-0" />
                      <span className="font-mono text-xs font-bold text-app-accent truncate max-w-[45%]">
                        {item.translation}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGlossaryTerm(item.id)}
                      title="Excluir termo do glossário"
                      className="h-8 w-8 shrink-0 border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 border-t-2 border-app-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn border-2 border-app-border bg-app-surface px-5 py-2 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all ml-auto"
            >
              Fechar
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlossaryModal;
