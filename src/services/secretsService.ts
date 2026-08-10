import { invoke } from "@tauri-apps/api/core";

export async function loadSecret(provider: "gemini" | "openai-compatible"): Promise<string | null> {
  try {
    return await invoke<string | null>("get_secret", { provider });
  } catch (error) {
    console.error(`Error loading secret for ${provider}:`, error);
    return null;
  }
}

export async function saveSecretNow(provider: "gemini" | "openai-compatible", value: string): Promise<void> {
  try {
    await invoke("set_secret", { provider, value });
  } catch (error) {
    console.error(`Error saving secret for ${provider}:`, error);
  }
}

let timeoutId: number | null = null;
export function queueSecretSave(provider: "gemini" | "openai-compatible", value: string) {
  if (timeoutId) window.clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    void saveSecretNow(provider, value);
    timeoutId = null;
  }, 600);
}

export function stripLegacyKeysFromLocalStorage() {
  const STORAGE_KEY = "manga-storage";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    if (data.state) {
      delete data.state.apiKey;
      delete data.state.openAiCompatibleApiKey;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error stripping legacy keys:", error);
  }
}
