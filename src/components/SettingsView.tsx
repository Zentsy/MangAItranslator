import React, { useState } from "react";
import {
  getOllamaModelOption,
  getOllamaProfileLabel,
  OLLAMA_MODEL_OPTIONS,
} from "@/config/ollamaModels";
import { useMangaStore } from "@/store/useMangaStore";
import { useTheme } from "@/contexts/ThemeContext";
import { dbService } from "@/services/dbService";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Monitor,
  Database,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import StatusModal, { StatusType } from "@/components/StatusModal";

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const {
    apiKey,
    translationEngine,
    setTranslationEngine,
    ollamaModel,
    setOllamaModel,
    resetOnboarding,
    clearStore,
  } = useMangaStore();

  const { theme, setTheme } = useTheme();
  const selectedOllamaModel = getOllamaModelOption(ollamaModel);

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
      title: "Tutorial reativado",
      description: "As dicas iniciais vao aparecer novamente no painel.",
      type: "success",
    });
  };

  const handleWipeAll = async () => {
    try {
      await dbService.wipeAllData();
      clearStore();
      setConfirmWipe(false);
      setStatusModal({
        isOpen: true,
        title: "Dados apagados",
        description: "Historico, cache de imagens e configuracoes foram removidos deste computador.",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
      setStatusModal({
        isOpen: true,
        title: "Nao foi possivel limpar agora",
        description: "Tente novamente em alguns instantes.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-app-border bg-app-surface/20 p-8 shadow-2xl backdrop-blur-md">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-3">
            <Settings className="text-app-text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-app-text-primary">
              Configuracoes <span className="text-app-text-secondary/20">do app</span>
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-app-text-secondary/40">
              Escolha como voce quer traduzir, visualizar e salvar seus dados
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-widest text-app-text-secondary hover:bg-app-surface/50 hover:text-app-text-primary"
        >
          Voltar para o painel
        </Button>
      </header>

      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto pr-4">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Como voce quer traduzir
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setTranslationEngine("gemini")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                translationEngine === "gemini"
                  ? "border-app-accent/30 bg-app-surface/70"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded bg-app-surface/50 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">
                  {translationEngine === "gemini" ? "Selecionado agora" : "Mais facil de usar"}
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${
                    apiKey ? "bg-emerald-500" : "bg-rose-500"
                  } shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                />
              </div>

              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">
                Google Gemini
              </h4>
              <p className="mb-4 text-xs leading-relaxed text-app-text-secondary/60">
                Melhor escolha para quem quer resultado consistente sem precisar configurar modelo local.
                Costuma entregar mais qualidade e velocidade.
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-app-border bg-app-bg/40 px-4 py-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-app-text-secondary/60">
                  Sua chave fica salva apenas neste computador.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTranslationEngine("ollama")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                translationEngine === "ollama"
                  ? "border-app-accent/30 bg-app-surface/70"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded bg-app-surface/50 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-app-text-secondary">
                  {translationEngine === "ollama" ? "Selecionado agora" : "Modo local"}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                  {selectedOllamaModel.sizeLabel}
                </span>
              </div>

              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">
                Ollama Local
              </h4>
              <p className="mb-4 text-xs leading-relaxed text-app-text-secondary/60">
                Traduz usando um modelo rodando no seu PC. Bom para privacidade e uso offline,
                mas pode ficar mais lento em maquinas modestas. Modelo atual:{" "}
                <span className="text-app-text-primary">{selectedOllamaModel.label}</span>.
              </p>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-bg/40 px-4 py-3">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                    Estilo
                  </div>
                  <div className="text-xs text-app-text-primary">
                    {getOllamaProfileLabel(selectedOllamaModel.profile)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/50">
                    Versao minima
                  </div>
                  <div className="text-xs text-app-text-primary">
                    Ollama {selectedOllamaModel.requiresOllama}
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-app-border bg-app-surface/20 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-app-text-secondary/60">
                  Modelos locais
                </h4>
                <p className="mt-1 text-xs text-app-text-secondary/50">
                  Escolha um modelo mais leve para ganhar velocidade ou um modelo maior se quiser tentar mais qualidade.
                </p>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/40">
                  Instalar no terminal
                </div>
                <code className="text-[11px] text-app-text-primary">
                  {selectedOllamaModel.installCommand}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {OLLAMA_MODEL_OPTIONS.map((model) => {
                const isSelected = ollamaModel === model.id;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setOllamaModel(model.id);
                      setTranslationEngine("ollama");
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-app-accent/30 bg-app-surface/80"
                        : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-app-text-primary">{model.label}</h5>
                          {model.recommended && (
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                              Boa opcao
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-app-text-secondary/40">
                          {model.id}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                        {model.sizeLabel}
                      </span>
                    </div>

                    <p className="min-h-[48px] text-xs leading-relaxed text-app-text-secondary/60">
                      {model.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em]">
                      <span className="text-app-text-secondary/50">
                        {getOllamaProfileLabel(model.profile)}
                      </span>
                      <span className={isSelected ? "text-app-text-primary" : "text-app-text-secondary/40"}>
                        {isSelected ? "Selecionado" : "Escolher"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-bg/30 px-4 py-3">
              <div className="text-xs text-app-text-secondary/60">
                Se voce quer praticidade, fique com <span className="text-app-text-primary">Gemini</span>.
                Se preferir testar tudo localmente, comece por{" "}
                <span className="text-app-text-primary">Qwen 3 VL 2B</span> em PCs mais fracos.
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-app-text-secondary/30">
                Escolha o que fizer mais sentido pra voce <ChevronRight size={10} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Aparencia
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setTheme("dark-organic")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                theme === "dark-organic"
                  ? "border-app-accent/30 bg-app-surface/80"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">Dark Organic</h4>
              <p className="text-xs leading-relaxed text-app-text-secondary/60">
                Tema escuro para focar na leitura e trabalhar por mais tempo.
              </p>
              {theme === "dark-organic" && (
                <div className="mt-4 text-[9px] font-black uppercase text-emerald-500">Ativo</div>
              )}
            </button>

            <button
              onClick={() => setTheme("paper-light")}
              className={`rounded-3xl border p-6 text-left transition-all ${
                theme === "paper-light"
                  ? "border-app-accent/30 bg-app-surface/80 shadow-inner"
                  : "border-app-border bg-app-surface/30 hover:bg-app-surface/50"
              }`}
            >
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">Paper Light</h4>
              <p className="text-xs leading-relaxed text-app-text-secondary/60">
                Tema claro com visual de papel, bom para ambientes iluminados.
              </p>
              {theme === "paper-light" && (
                <div className="mt-4 text-[9px] font-black uppercase text-app-accent">Ativo</div>
              )}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Database size={16} className="text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary/60">
              Seus dados
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-6 transition-all group hover:bg-rose-500/10">
              <h4 className="mb-1 text-lg font-bold italic text-rose-400">Limpar tudo</h4>
              <p className="mb-6 text-xs leading-relaxed text-app-text-secondary/60">
                Apaga historico, imagens em cache e configuracoes salvas neste computador.
              </p>
              <Button
                onClick={() => setConfirmWipe(true)}
                variant="destructive"
                className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 size={16} className="mr-2" /> APAGAR DADOS DESTE APP
              </Button>
            </div>

            <div className="rounded-3xl border border-app-border bg-app-surface/30 p-6 text-left transition-all group hover:bg-app-surface/50">
              <h4 className="mb-1 text-lg font-bold italic text-app-text-primary">
                Mostrar tutorial de novo
              </h4>
              <p className="mb-6 text-xs leading-relaxed text-app-text-secondary/60">
                Traz de volta as dicas iniciais para quem quiser rever como o app funciona.
              </p>
              <Button
                onClick={handleResetOnboarding}
                variant="outline"
                className="w-full rounded-2xl border-app-border py-6 text-[10px] font-black uppercase tracking-widest text-app-text-secondary hover:text-app-text-primary"
              >
                <RotateCcw size={16} className="mr-2" /> MOSTRAR TUTORIAL
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
        title="Apagar dados do app?"
        description="Esta acao nao pode ser desfeita. Suas traducoes salvas localmente, imagens em cache e chaves de API serao removidas deste computador."
        confirmText="Sim, apagar dados"
        variant="destructive"
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        description={statusModal.description}
        type={statusModal.type}
      />
    </div>
  );
};

export default SettingsView;
