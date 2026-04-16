import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMangaStore } from '@/store/useMangaStore';
import { Lightbulb, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OnboardingOverlay: React.FC = () => {
  const { 
    apiKey, 
    hasFinishedOnboarding, 
    setHasFinishedOnboarding,
    translationEngine
  } = useMangaStore();

  if (hasFinishedOnboarding) return null;

  // Passo 1: Configurar a Chave (Gemini e o fluxo recomendado do MVP)
  const needsApiKey = translationEngine === 'gemini' && !apiKey;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
        {needsApiKey ? (
          /* Ajustado para right-[11rem] para tentar centralizar sob o input da API Key */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-28 right-[11rem] w-80 pointer-events-auto"
          >
            <div className="bg-app-surface text-app-text-primary p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border border-app-border">
              {/* Seta (tail) do balão apontando para o campo ACIMA */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-app-surface border-t border-l border-app-border rotate-45" />
              
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Lightbulb className="text-amber-600" size={20} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tighter text-sm italic">Primeiro Passo</h4>
                  <p className="text-[11px] leading-relaxed font-medium mt-1">
                    Cole sua <span className="underline underline-offset-2 decoration-2 decoration-amber-500">Chave do Gemini</span> no campo acima para liberar o rascunho por IA. Este e o motor recomendado para a melhor experiencia inicial.
                  </p>
                </div>
              </div>

              {/* Link para o futuro tutorial */}
              <div className="mt-3 px-3 py-2 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()} 
                  className="flex items-center justify-between group cursor-help"
                >
                  <span className="text-[10px] font-bold uppercase tracking-tight text-amber-700">Como conseguir uma chave?</span>
                  <ExternalLink size={12} className="text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-app-border">
                <span className="text-[9px] font-mono text-app-text-secondary/40 uppercase tracking-widest">Aguardando chave...</span>
                <button 
                  onClick={() => setHasFinishedOnboarding(true)}
                  className="p-2 hover:bg-app-surface/50 rounded-full transition-colors text-app-text-secondary/40 hover:text-app-text-primary"
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
            className="w-full max-w-md p-6 pointer-events-auto"
          >
            <div className="bg-emerald-500 text-white p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] text-center relative border-4 border-white/20">
              <div className="flex justify-center mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md"
                >
                  <Lightbulb size={40} className="fill-white/20" />
                </motion.div>
              </div>
              
              <h4 className="font-black uppercase tracking-tighter text-3xl italic mb-3">Tudo Pronto!</h4>
              <p className="text-sm leading-relaxed mb-8 opacity-90 font-medium">
                Sua chave está ativa e o sistema está online. <br/>
                <span className="bg-white/20 px-2 py-0.5 rounded">Importe seu primeiro capítulo</span> e deixe o Gemini cuidar do rascunho inicial.
              </p>

              <Button 
                onClick={() => setHasFinishedOnboarding(true)}
                className="w-full bg-white text-emerald-600 hover:bg-white/90 font-black uppercase tracking-[0.2em] py-8 rounded-[2rem] text-sm shadow-xl hover:shadow-2xl transition-all"
              >
                VAMOS COMEÇAR
              </Button>

              <button 
                onClick={() => setHasFinishedOnboarding(true)}
                className="absolute top-8 right-8 opacity-40 hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
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
