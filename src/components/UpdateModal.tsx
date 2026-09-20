import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="border-app-border bg-app-surface/95 text-app-text-primary backdrop-blur-2xl sm:max-w-xl rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 font-black text-xl shadow-inner font-mono">
              新
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none text-app-text-primary">
                Nova versão pronta
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-app-text-secondary">
                A versão <span className="font-bold text-amber-500">{update.version}</span> já está
                disponível. Seu app atual está em{" "}
                <span className="font-bold text-app-text-primary">{update.currentVersion}</span>.
              </DialogDescription>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-app-border bg-app-bg/50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                Versão atual
              </div>
              <div className="mt-1 text-sm font-semibold text-app-text-primary">
                {update.currentVersion}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                Nova versão
              </div>
              <div className="mt-1 text-sm font-semibold text-amber-500">
                {update.version}
              </div>
            </div>
            {updateDate && (
              <div className="sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                  Publicada em
                </div>
                <div className="mt-1 text-sm font-semibold text-app-text-primary">
                  {updateDate}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-app-border bg-app-bg/40 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/60">
                O que mudou
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500/80">
                CHANGELOG
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {renderChangelogContent(update.body)}
            </div>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-bg/30 p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-app-text-secondary/70">
              {statusMessage || "Pronto para baixar a atualização"}
            </div>

            {isInstalling && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-app-text-secondary/70">
                  <span>Progresso do download</span>
                  <span>{progressPercent ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-surface border border-app-border">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            )}

            <p className="mt-3 text-xs leading-relaxed text-app-text-secondary/60">
              No Windows, o app fechará momentaneamente para aplicar o instalador da nova versão.
            </p>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isInstalling}
            className="w-full rounded-2xl border-app-border bg-transparent py-6 text-[10px] font-black uppercase tracking-[0.18em] text-app-text-secondary hover:text-app-text-primary sm:w-auto"
          >
            Agora não
          </Button>
          <Button
            onClick={() => void onInstall()}
            disabled={isInstalling}
            className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-black py-6 text-[10px] font-black uppercase tracking-[0.18em] transition-all shadow-md sm:w-auto"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Download />
                Baixar e instalar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;
