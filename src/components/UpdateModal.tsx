import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, RefreshCw } from "lucide-react";
import type { AvailableUpdateInfo } from "@/hooks/useAppUpdater";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  update: AvailableUpdateInfo | null;
  isInstalling: boolean;
  progressPercent: number | null;
  statusMessage: string | null;
  onInstall: () => Promise<boolean>;
}

const formatUpdateDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const isLegacyPlaceholder = (body?: string) => {
  if (!body) return true;
  const lower = body.toLowerCase().trim();
  return (
    lower.includes("veja os assets") ||
    lower.includes("see the assets") ||
    lower.length < 5
  );
};

const renderChangelogContent = (body?: string) => {
  if (isLegacyPlaceholder(body)) {
    return (
      <ul className="space-y-2 text-xs text-app-text-secondary">
        <li className="flex items-start gap-2 leading-relaxed">
          <span className="mt-0.5 text-xs text-amber-500 font-bold">✒</span>
          <span>Melhorias de desempenho, estabilidade e refinamentos gerais do app.</span>
        </li>
        <li className="flex items-start gap-2 leading-relaxed">
          <span className="mt-0.5 text-xs text-amber-500 font-bold">✒</span>
          <span>Atualizações de dependências e correções pontuais acumuladas no ciclo.</span>
        </li>
      </ul>
    );
  }

  const lines = (body || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <ul className="space-y-2 text-xs text-app-text-secondary">
      {lines.map((line, idx) => {
        const cleaned = line.replace(/^[-*•]\s*/, "");
        return (
          <li key={idx} className="flex items-start gap-2 leading-relaxed">
            <span className="mt-0.5 text-xs text-amber-500 font-bold">✒</span>
            <span>{cleaned}</span>
          </li>
        );
      })}
    </ul>
  );
};

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  update,
  isInstalling,
  progressPercent,
  statusMessage,
  onInstall,
}) => {
  if (!update) {
    return null;
  }

  const updateDate = formatUpdateDate(update.date);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isInstalling && !open && onClose()}>
      <DialogContent className="border-2 border-app-border bg-app-card text-app-text-primary shadow-ink-lg sm:max-w-xl p-6 relative overflow-hidden">
        {/* Cantoneiras Tonbo de Corte Editorial */}
        <div className="absolute top-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 font-pixel text-xs text-app-border select-none pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 font-pixel text-xs text-app-border select-none pointer-events-none">┘</div>

        {/* Retícula sutil */}
        <div className="halftone absolute inset-0 opacity-[0.03] pointer-events-none" />

        <div className="z-10 relative">
          <DialogHeader className="pt-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* Selo Hanko Editorial [新] */}
              <div className="inline-grid h-12 w-12 shrink-0 place-items-center border-2 border-app-text-primary bg-amber-500 text-black shadow-ink-sm -rotate-2 select-none">
                <span className="font-brush text-2xl font-black leading-none">新</span>
              </div>

              <div>
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  DISTRIBUIÇÃO OFICIAL // NEW VERSION AVAILABLE
                </span>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-app-text-primary leading-tight mt-0.5">
                  Nova Versão Pronta
                </DialogTitle>
              </div>
            </div>

            <div className="border border-dashed border-app-border bg-app-surface/60 p-3 shadow-inner">
              <DialogDescription className="font-mono text-xs text-app-text-secondary leading-relaxed">
                A versão <span className="font-bold text-amber-500 font-mono">{update.version}</span> já está pronta para instalação. O tomo atual em execução é <span className="font-bold text-app-text-primary font-mono">{update.currentVersion}</span>.
              </DialogDescription>
            </div>

            {/* Grid de Versões */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-2 border-app-border bg-app-surface p-3.5 shadow-ink-sm">
              <div>
                <span className="block font-pixel text-[9px] font-bold uppercase tracking-wider text-app-text-secondary/70">
                  Versão Atual
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-app-text-primary">
                  {update.currentVersion}
                </span>
              </div>
              <div>
                <span className="block font-pixel text-[9px] font-bold uppercase tracking-wider text-app-text-secondary/70">
                  Nova Versão
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-amber-500">
                  {update.version}
                </span>
              </div>
              {updateDate && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="block font-pixel text-[9px] font-bold uppercase tracking-wider text-app-text-secondary/70">
                    Publicada em
                  </span>
                  <span className="mt-1 block font-mono text-xs font-semibold text-app-text-primary">
                    {updateDate}
                  </span>
                </div>
              )}
            </div>

            {/* Painel de Changelog */}
            <div className="border-2 border-app-border bg-app-surface/80 p-3.5 shadow-ink-sm">
              <div className="mb-2.5 flex items-center justify-between border-b border-app-border pb-2">
                <span className="font-pixel text-[9px] font-bold uppercase tracking-widest text-app-text-secondary/70">
                  Notas de Lançamento
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-500">
                  CHANGELOG
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto no-scrollbar pr-1">
                {renderChangelogContent(update.body)}
              </div>
            </div>

            {/* Estado de Instalação e Progresso */}
            <div className="border border-dashed border-app-border bg-app-surface/40 p-3">
              <div className="font-pixel text-[10px] font-bold uppercase tracking-wider text-app-text-secondary/80">
                {statusMessage || "Pronto para baixar e atualizar o aplicativo"}
              </div>

              {isInstalling && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-app-text-secondary">
                    <span>PROGRESSO DO DOWNLOAD</span>
                    <span className="font-bold text-amber-500">{progressPercent ?? 0}%</span>
                  </div>
                  <div className="h-3 overflow-hidden border-2 border-app-border bg-app-card">
                    <div
                      className="bar-stripes h-full bg-gradient-to-r from-amber-500 to-app-accent transition-all duration-300"
                      style={{ width: `${progressPercent ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="mt-2 font-mono text-[10px] text-app-text-secondary/50 leading-relaxed">
                * O aplicativo será reiniciado automaticamente para consolidar o instalador da nova versão.
              </p>
            </div>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isInstalling}
              className="btn border-2 border-app-border bg-app-surface px-5 py-2.5 font-bold text-xs uppercase tracking-wider text-app-text-secondary hover:border-app-accent hover:text-app-text-primary shadow-ink-sm transition-all disabled:opacity-50"
            >
              Agora Não
            </button>
            <button
              type="button"
              onClick={() => void onInstall()}
              disabled={isInstalling}
              className="btn primary border-2 border-app-text-primary bg-amber-500 px-6 py-2.5 font-black text-xs uppercase tracking-wider text-black shadow-ink transition-all hover:bg-amber-400 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-hover flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="animate-spin" size={15} />
                  <span>Instalando...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Baixar e Instalar</span>
                </>
              )}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;
