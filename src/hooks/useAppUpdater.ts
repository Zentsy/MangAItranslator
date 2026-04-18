import { useCallback, useEffect, useRef, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";

const UPDATE_CHECK_TIMEOUT_MS = 15_000;
const UPDATE_DOWNLOAD_TIMEOUT_MS = 15 * 60_000;

export interface AvailableUpdateInfo {
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
}

export interface UpdateCheckResult {
  status: "available" | "none" | "error";
  message: string;
  update: AvailableUpdateInfo | null;
}

const normalizeUpdaterError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("404") || lower.includes("not found")) {
    return "Ainda nao existe uma release publica com updater pronta para este app.";
  }

  if (lower.includes("signature")) {
    return "A atualizacao encontrada nao passou na validacao de assinatura.";
  }

  if (lower.includes("timeout")) {
    return "A verificacao demorou demais. Tente novamente em alguns instantes.";
  }

  return "Nao foi possivel verificar atualizacoes agora.";
};

const closeUpdateResource = async (update: Update | null) => {
  if (!update) {
    return;
  }

  try {
    await update.close();
  } catch (error) {
    console.warn("Nao foi possivel liberar o recurso do updater:", error);
  }
};

export const useAppUpdater = () => {
  const pendingUpdateRef = useRef<Update | null>(null);
  const [appVersion, setAppVersion] = useState("0.1.0");
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    setIsChecking(true);
    setLastError(null);
    if (!silent) {
      setStatusMessage("Procurando uma nova versao...");
    }

    try {
      const update = await check({ timeout: UPDATE_CHECK_TIMEOUT_MS });
      setLastCheckedAt(new Date().toISOString());

      await closeUpdateResource(pendingUpdateRef.current);
      pendingUpdateRef.current = null;

      if (!update) {
        setAvailableUpdate(null);
        const result: UpdateCheckResult = {
          status: "none",
          message: "Voce ja esta na versao mais recente.",
          update: null,
        };
        setStatusMessage(result.message);
        return result;
      }

      pendingUpdateRef.current = update;
      const nextUpdate: AvailableUpdateInfo = {
        currentVersion: update.currentVersion,
        version: update.version,
        date: update.date,
        body: update.body,
      };

      setAvailableUpdate(nextUpdate);
      const result: UpdateCheckResult = {
        status: "available",
        message: `Nova versao encontrada: ${update.version}`,
        update: nextUpdate,
      };
      setStatusMessage(result.message);
      return result;
    } catch (error) {
      const friendlyError = normalizeUpdaterError(error);
      console.warn("Erro ao verificar atualizacoes:", error);
      setLastError(friendlyError);
      if (!silent) {
        setStatusMessage(friendlyError);
      }
      return {
        status: "error",
        message: friendlyError,
        update: null,
      } satisfies UpdateCheckResult;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!pendingUpdateRef.current || isInstalling) {
      return false;
    }

    setIsInstalling(true);
    setLastError(null);
    setProgressPercent(0);
    setStatusMessage("Baixando a atualizacao...");

    try {
      let downloaded = 0;
      let contentLength = 0;

      await pendingUpdateRef.current.downloadAndInstall(
        (event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength ?? 0;
              setStatusMessage("Baixando a atualizacao...");
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              if (contentLength > 0) {
                setProgressPercent(Math.min(100, Math.round((downloaded / contentLength) * 100)));
              }
              break;
            case "Finished":
              setProgressPercent(100);
              setStatusMessage("Download concluido. Preparando instalacao...");
              break;
          }
        },
        { timeout: UPDATE_DOWNLOAD_TIMEOUT_MS }
      );

      await closeUpdateResource(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
      setAvailableUpdate(null);
      setStatusMessage("Atualizacao instalada. Reiniciando o app...");

      try {
        await relaunch();
      } catch (error) {
        console.warn("Relaunch nao foi concluido automaticamente:", error);
      }

      return true;
    } catch (error) {
      const friendlyError = normalizeUpdaterError(error);
      setLastError(friendlyError);
      setStatusMessage(friendlyError);
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [isInstalling]);

  useEffect(() => {
    void getVersion()
      .then((version) => setAppVersion(version))
      .catch((error) => console.warn("Nao foi possivel ler a versao do app:", error));

    void checkForUpdates({ silent: true });

    return () => {
      void closeUpdateResource(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    };
  }, [checkForUpdates]);

  return {
    appVersion,
    availableUpdate,
    isChecking,
    isInstalling,
    progressPercent,
    statusMessage,
    lastCheckedAt,
    lastError,
    checkForUpdates,
    installUpdate,
  };
};
