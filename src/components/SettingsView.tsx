import React, { useState } from 'react';
import { useMangaStore } from '@/store/useMangaStore';
import { useTheme } from '@/contexts/ThemeContext';
import { dbService } from '@/services/dbService';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Monitor,
  Database
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import StatusModal, { StatusType } from '@/components/StatusModal';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { 
    apiKey, 
    resetOnboarding, 
    clearStore
  } = useMangaStore();

  const { theme, setTheme } = useTheme();

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: StatusType;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const handleResetOnboarding = () => {
    resetOnboarding();
    setStatusModal({
      isOpen: true,
      title: "Guia Reiniciado",
      description: "O tutorial de boas-vindas aparecerá novamente no Dashboard.",
      type: "success"
    });
  };

  const handleWipeAll = async () => {
    try {
      await dbService.wipeAllData();
      clearStore();
      setConfirmWipe(false);
      setStatusModal({
        isOpen: true,
        title: "Dados Limpos",
        description: "Banco local, cache de imagens e configura??es foram apagados com sucesso.",
        type: "success"
      });
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
      setStatusModal({
        isOpen: true,
        title: "Falha na Limpeza",
        description: "N?o foi poss?vel apagar todos os dados locais. Tente novamente.",
        type: "error"
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-app-border bg-app-surface/20 p-8 backdrop-blur-md shadow-2xl">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-app-surface/50 rounded-2xl border border-app-border">
            <Settings className="text-app-text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-app-text-primary">
              Configurações <span className="text-app-text-secondary/20">do App</span>
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/40">Gerencie sua experiência e privacidade</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-app-text-secondary hover:text-app-text-primary uppercase font-bold tracking-widest text-[10px] hover:bg-app-surface/50"
        >
          Voltar para o Início
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar">
        {/* Seção: Motor de IA */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">Motor de Tradução</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-app-surface/40 border border-app-border rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-app-surface/50 rounded text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">Ativo no momento</span>
                <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
              </div>
              <h4 className="font-bold text-lg mb-1 italic text-app-text-primary">Google Gemini</h4>
              <p className="text-xs text-app-text-secondary/60 leading-relaxed mb-4">Uso de API externa (requer chave). Ideal para rascunhos rápidos e precisos.</p>
              <div className="flex items-center gap-2 px-4 py-2 bg-app-bg/40 rounded-xl border border-app-border">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-app-text-secondary/60">Suas chaves são salvas apenas localmente.</span>
              </div>
            </div>

            <div className="p-6 bg-app-surface/20 border border-app-border/50 rounded-3xl opacity-40">
              <h4 className="font-bold text-lg mb-1 italic text-app-text-secondary">Novos Modelos</h4>
              <p className="text-xs text-app-text-secondary/40 leading-relaxed">Em breve: Suporte para DeepSeek, OpenRouter e Anthropic.</p>
              <div className="mt-4 flex items-center gap-1 text-[9px] font-bold text-app-text-secondary/20 uppercase">
                Em desenvolvimento <ChevronRight size={10} />
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Aparência */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">Aparência e Temas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setTheme('dark-organic')}
              className={`p-6 rounded-3xl border transition-all text-left ${theme === 'dark-organic' ? 'border-app-accent/30 bg-app-surface/80' : 'border-app-border bg-app-surface/30 hover:bg-app-surface/50'}`}
            >
              <h4 className="font-bold text-lg mb-1 italic text-app-text-primary">Dark Organic</h4>
              <p className="text-xs text-app-text-secondary/60 leading-relaxed">O tema original profundo e imersivo.</p>
              {theme === 'dark-organic' && <div className="mt-4 text-[9px] font-black uppercase text-emerald-500">Ativo</div>}
            </button>

            <button 
              onClick={() => setTheme('paper-light')}
              className={`p-6 rounded-3xl border transition-all text-left ${theme === 'paper-light' ? 'border-app-accent/30 bg-app-surface/80 shadow-inner' : 'border-app-border bg-app-surface/30 hover:bg-app-surface/50'}`}
            >
              <h4 className="font-bold text-lg mb-1 italic text-app-text-primary">Paper Light</h4>
              <p className="text-xs text-app-text-secondary/60 leading-relaxed">Focado em clareza, simulando papel real.</p>
              {theme === 'paper-light' && <div className="mt-4 text-[9px] font-black uppercase text-app-accent">Ativo</div>}
            </button>
          </div>
        </section>

        {/* Seção: Manutenção e Privacidade */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">Manutenção e Dados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl group hover:bg-rose-500/10 transition-all">
              <h4 className="font-bold text-lg mb-1 italic text-rose-400">Limpar Tudo</h4>
              <p className="text-xs text-app-text-secondary/60 leading-relaxed mb-6">Remove todas as chaves, histórico de traduções e reinicia o app.</p>
              <Button 
                onClick={() => setConfirmWipe(true)}
                variant="destructive" 
                className="w-full rounded-2xl font-black uppercase text-[10px] tracking-widest py-6"
              >
                <Trash2 size={16} className="mr-2" /> APAGAR TODOS OS DADOS
              </Button>
            </div>

            <div className="p-6 bg-app-surface/30 border border-app-border rounded-3xl group hover:bg-app-surface/50 transition-all text-left">
              <h4 className="font-bold text-lg mb-1 italic text-app-text-primary">Redefinir Guia</h4>
              <p className="text-xs text-app-text-secondary/60 leading-relaxed mb-6">Faz o tutorial de boas-vindas aparecer novamente no Dashboard.</p>
              <Button 
                onClick={handleResetOnboarding}
                variant="outline" 
                className="w-full rounded-2xl font-black uppercase text-[10px] tracking-widest border-app-border py-6 text-app-text-secondary hover:text-app-text-primary"
              >
                <RotateCcw size={16} className="mr-2" /> REINICIAR ONBOARDING
              </Button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal 
        isOpen={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={() => {
          void handleWipeAll();
        }}
        title="Apagar Tudo?"
        description="Esta ação é irreversível. Todas as suas traduções salvas localmente e chaves de API serão apagadas permanentemente."
        confirmText="Sim, apagar tudo"
        variant="destructive"
      />

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({...statusModal, isOpen: false})}
        title={statusModal.title}
        description={statusModal.description}
        type={statusModal.type}
      />
    </div>
  );
};

export default SettingsView;
