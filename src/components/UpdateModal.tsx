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
import { Download, RefreshCw, Rocket } from "lucide-react";
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
      <DialogContent className="border-app-border bg-app-surface/90 text-app-text-primary backdrop-blur-2xl sm:max-w-xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-3">
              <Rocket className="text-emerald-400" size={22} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                Nova versao pronta
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-app-text-secondary">
                A versao <span className="text-app-text-primary">{update.version}</span> ja esta
                disponivel. Seu app atual esta em{" "}
                <span className="text-app-text-primary">{update.currentVersion}</span>.
              </DialogDescription>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-app-border bg-app-bg/35 p-4 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/45">
                Versao atual
              </div>
              <div className="mt-1 text-sm font-semibold text-app-text-primary">
                {update.currentVersion}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/45">
                Nova versao
              </div>
              <div className="mt-1 text-sm font-semibold text-app-text-primary">
                {update.version}
              </div>
            </div>
            {updateDate && (
              <div className="sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/45">
                  Publicada em
                </div>
                <div className="mt-1 text-sm font-semibold text-app-text-primary">
                  {updateDate}
                </div>
              </div>
            )}
          </div>

          {update.body && (
            <div className="rounded-3xl border border-app-border bg-app-bg/25 p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-secondary/45">
                O que mudou
              </div>
              <div className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-app-text-secondary">
                {update.body}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-app-border bg-app-bg/25 p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-app-text-secondary/55">
              {statusMessage || "Pronto para baixar a atualizacao"}
            </div>

            {isInstalling && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-app-text-secondary/70">
                  <span>Progresso do download</span>
                  <span>{progressPercent ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-surface">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            )}

            <p className="mt-3 text-xs leading-relaxed text-app-text-secondary/55">
              No Windows, o app fecha para abrir o instalador da nova versao.
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
            Agora nao
          </Button>
          <Button
            onClick={() => void onInstall()}
            disabled={isInstalling}
            className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-[0.18em] sm:w-auto"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="animate-spin" />
                Instalando
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
