import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMangaStore } from "@/store/useMangaStore";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnboardingOverlay: React.FC = () => {
  const { apiKey, hasFinishedOnboarding, setHasFinishedOnboarding, translationEngine } =
    useMangaStore();

  if (hasFinishedOnboarding) return null;

  const needsApiKey = translationEngine === "gemini" && !apiKey;

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
        {needsApiKey ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto absolute right-[11rem] top-28 w-80"
          >
            <div className="relative rounded-[2.5rem] border border-app-border bg-app-surface p-6 text-app-text-primary shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-app-border bg-app-surface" />

              <div className="mb-3 flex items-start gap-3">
                <div className="rounded-xl bg-amber-500/10 p-2">
                  <Lightbulb className="text-amber-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tighter italic">
                    Primeiro passo
                  </h4>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed">
                    Cole sua{" "}
                    <span className="underline decoration-2 decoration-amber-500 underline-offset-2">
                      chave do Gemini
                    </span>{" "}
                    no campo acima para liberar o rascunho por IA. Se estiver testando o app pela
                    primeira vez, este costuma ser o caminho mais simples.
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-tight text-amber-700">
                  Ainda nao tem chave? Crie uma no Google AI Studio e volte aqui.
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-app-border pt-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                  Aguardando chave...
                </span>
                <button
                  onClick={() => setHasFinishedOnboarding(true)}
                  className="rounded-full p-2 text-app-text-secondary/40 transition-colors hover:bg-app-surface/50 hover:text-app-text-primary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-full max-w-md p-6"
          >
            <div className="relative rounded-[3.5rem] border-4 border-white/20 bg-emerald-500 p-10 text-center text-white shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]">
              <div className="mb-6 flex justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/20 backdrop-blur-md"
                >
                  <Lightbulb size={40} className="fill-white/20" />
                </motion.div>
              </div>

              <h4 className="mb-3 text-3xl font-black uppercase tracking-tighter italic">
                Tudo pronto!
              </h4>
              <p className="mb-8 text-sm font-medium leading-relaxed opacity-90">
                Sua chave esta ativa e o app ja pode gerar o primeiro rascunho. <br />
                <span className="rounded bg-white/20 px-2 py-0.5">Importe um capitulo</span> e
                comece a revisar.
              </p>

              <Button
                onClick={() => setHasFinishedOnboarding(true)}
                className="w-full rounded-[2rem] bg-white py-8 text-sm font-black uppercase tracking-[0.2em] text-emerald-600 shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl"
              >
                Vamos comecar
              </Button>

              <button
                onClick={() => setHasFinishedOnboarding(true)}
                className="absolute right-8 top-8 rounded-full p-2 opacity-40 transition-opacity hover:bg-white/10 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
