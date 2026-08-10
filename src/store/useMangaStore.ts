import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_GEMINI_MODEL } from "@/config/geminiModels";
import { DEFAULT_OLLAMA_MODEL } from "@/config/ollamaModels";
import {
  DEFAULT_OPENAI_COMPATIBLE_MODEL,
  DEFAULT_OPENAI_COMPATIBLE_PROVIDER,
  type OpenRouterModelMode,
  type OpenAiCompatibleProviderId,
} from "@/config/openAiCompatibleProviders";
import { dbService, GlossaryTerm } from "@/services/dbService";
import { queueSecretSave } from "@/services/secretsService";

const SAVE_DEBOUNCE_MS = 450;
const pendingSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearPendingSave = (pageId: string) => {
  const timeout = pendingSaveTimers.get(pageId);
  if (!timeout) {
    return;
  }

  clearTimeout(timeout);
  pendingSaveTimers.delete(pageId);
};

const clearAllPendingSaves = () => {
  pendingSaveTimers.forEach((timeout) => clearTimeout(timeout));
  pendingSaveTimers.clear();
};

export type BlockType = "rect" | "outside" | "thought" | "double" | "none";
export type TranslationEngine = "gemini" | "ollama" | "openaiCompatible";
export type AppTheme = "dark-organic" | "paper-light";

export interface TranslationBlock {
  id: string;
  text: string;
  type: BlockType;
}

export interface MangaPage {
  id: string;
  url: string;
  path: string;
  name: string;
  translation: string;
  blocks: TranslationBlock[];
  status: "pending" | "completed";
}

interface MangaStore {
  pages: MangaPage[];
  currentPageIndex: number;
  apiKey: string; // Gemini
  openRouterApiKey: string;
  groqApiKey: string;
  customApiKey: string;
  useConvention: boolean;
  currentProjectId: string | null;
  translationEngine: TranslationEngine;
  geminiModel: string;
  ollamaModel: string;
  openAiCompatibleProvider: OpenAiCompatibleProviderId;
  openAiCompatibleModel: string;
  openRouterModelMode: OpenRouterModelMode;
  aiThinkingEnabled: boolean;
  aiInferBlockTypesEnabled: boolean;
  hasFinishedOnboarding: boolean;
  theme: AppTheme;
  glossary: GlossaryTerm[];
  processingQueue: string[];

  setApiKey: (key: string) => void;
  setOpenRouterApiKey: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  setCustomApiKey: (key: string) => void;
  setUseConvention: (value: boolean) => void;
  setProjectId: (id: string | null) => void;
  setPages: (pages: MangaPage[]) => void;
  setTranslationEngine: (engine: TranslationEngine) => void;
  setGeminiModel: (model: string) => void;
  setOllamaModel: (model: string) => void;
  setOpenAiCompatibleProvider: (provider: OpenAiCompatibleProviderId) => void;
  setOpenAiCompatibleApiKey: (key: string) => void;
  setOpenAiCompatibleModel: (model: string) => void;
  setOpenRouterModelMode: (mode: OpenRouterModelMode) => void;
  setAiThinkingEnabled: (enabled: boolean) => void;
  setAiInferBlockTypesEnabled: (enabled: boolean) => void;
  setHasFinishedOnboarding: (value: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  setGlossary: (terms: GlossaryTerm[]) => void;
  addToProcessingQueue: (pageId: string) => void;
  removeFromProcessingQueue: (pageId: string) => void;
  addGlossaryTerm: (term: string, translation: string) => Promise<void>;
  removeGlossaryTerm: (id: string) => Promise<void>;
  resetOnboarding: () => void;
  nextPage: () => void;
  prevPage: () => void;

  updatePage: (id: string, updates: Partial<MangaPage>) => void;
  updateBlock: (pageId: string, blockId: string, updates: Partial<TranslationBlock>) => void;
  reorderBlocks: (pageId: string, fromIndex: number, toIndex: number) => void;
  addBlock: (pageId: string) => void;
  removeBlock: (pageId: string, blockId: string) => void;

  setPageIndex: (index: number) => void;
  clearStore: () => void;
  queuePageSave: (pageId: string) => void;
  savePageToDb: (pageId: string) => Promise<void>;
  cancelPendingSaves: () => void;
}

export const useMangaStore = create<MangaStore>()(
  persist(
    (set, get) => ({
      pages: [],
      currentPageIndex: 0,
      apiKey: "",
      openRouterApiKey: "",
      groqApiKey: "",
      customApiKey: "",
      useConvention: true,
      currentProjectId: null,
      translationEngine: "gemini",
      geminiModel: DEFAULT_GEMINI_MODEL,
      ollamaModel: DEFAULT_OLLAMA_MODEL,
      openAiCompatibleProvider: DEFAULT_OPENAI_COMPATIBLE_PROVIDER,
      openAiCompatibleModel: DEFAULT_OPENAI_COMPATIBLE_MODEL,
      openRouterModelMode: "auto-free",
      aiThinkingEnabled: false,
      aiInferBlockTypesEnabled: false,
      hasFinishedOnboarding: false,
      theme: "dark-organic",
      glossary: [],
      processingQueue: [],

      setApiKey: (apiKey) => {
        set({ apiKey });
        queueSecretSave("gemini", apiKey);
      },
      setOpenRouterApiKey: (openRouterApiKey) => {
        set({ openRouterApiKey });
        queueSecretSave("openrouter", openRouterApiKey);
      },
      setGroqApiKey: (groqApiKey) => {
        set({ groqApiKey });
        queueSecretSave("groq", groqApiKey);
      },
      setCustomApiKey: (customApiKey) => {
        set({ customApiKey });
        queueSecretSave("custom", customApiKey);
      },
      setOpenAiCompatibleModel: (openAiCompatibleModel) =>
        set({ openAiCompatibleModel }),
      setOpenRouterModelMode: (openRouterModelMode) => set({ openRouterModelMode }),
      setAiThinkingEnabled: (aiThinkingEnabled) => set({ aiThinkingEnabled }),
      setAiInferBlockTypesEnabled: (aiInferBlockTypesEnabled) =>
        set({ aiInferBlockTypesEnabled }),
      setHasFinishedOnboarding: (hasFinishedOnboarding) => set({ hasFinishedOnboarding }),
      setTheme: (theme) => set({ theme }),
      setGlossary: (glossary) => set({ glossary }),
      addToProcessingQueue: (pageId) =>
        set((state) => ({ processingQueue: [...state.processingQueue, pageId] })),
      removeFromProcessingQueue: (pageId) =>
        set((state) => ({
          processingQueue: state.processingQueue.filter((id) => id !== pageId),
        })),
      addGlossaryTerm: async (term, translation) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;
        const id = await dbService.upsertGlossaryTerm(currentProjectId, term, translation);
        set((state) => ({
          glossary: [...state.glossary, { id, project_id: currentProjectId, term, translation }],
        }));
      },
      removeGlossaryTerm: async (id) => {
        await dbService.deleteGlossaryTerm(id);
        set((state) => ({
          glossary: state.glossary.filter((t) => t.id !== id),
        }));
      },
      resetOnboarding: () => set({ hasFinishedOnboarding: false }),
      setPages: (pages) => {
        clearAllPendingSaves();
        set({ pages, currentPageIndex: 0 });
      },

      updatePage: (id, updates) => {
        set((state) => ({
          pages: state.pages.map((page) => (page.id === id ? { ...page, ...updates } : page)),
        }));
        get().queuePageSave(id);
      },

      updateBlock: (pageId, blockId, updates) => {
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) {
              return page;
            }

            return {
              ...page,
              blocks: page.blocks.map((block) =>
                block.id === blockId ? { ...block, ...updates } : block
              ),
            };
          }),
        }));
        get().queuePageSave(pageId);
      },

      reorderBlocks: (pageId, fromIndex, toIndex) => {
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) {
              return page;
            }

            const newBlocks = [...page.blocks];
            const [moved] = newBlocks.splice(fromIndex, 1);
            newBlocks.splice(toIndex, 0, moved);
            return { ...page, blocks: newBlocks };
          }),
        }));
        get().queuePageSave(pageId);
      },

      addBlock: (pageId) => {
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) {
              return page;
            }

            return {
              ...page,
              blocks: [
                ...page.blocks,
                { id: crypto.randomUUID(), text: "", type: "none" },
              ],
            };
          }),
        }));
        get().queuePageSave(pageId);
      },

      removeBlock: (pageId, blockId) => {
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) {
              return page;
            }

            return {
              ...page,
              blocks: page.blocks.filter((block) => block.id !== blockId),
            };
          }),
        }));
        get().queuePageSave(pageId);
      },

      queuePageSave: (pageId) => {
        clearPendingSave(pageId);
        const timeout = setTimeout(() => {
          pendingSaveTimers.delete(pageId);
          void get().savePageToDb(pageId);
        }, SAVE_DEBOUNCE_MS);

        pendingSaveTimers.set(pageId, timeout);
      },

      savePageToDb: async (pageId) => {
        clearPendingSave(pageId);

        const { currentProjectId, pages } = get();
        if (!currentProjectId) {
          return;
        }

        const pageIndex = pages.findIndex((page) => page.id === pageId);
        if (pageIndex === -1) {
          return;
        }

        await dbService.savePage(currentProjectId, pages[pageIndex], pageIndex);
      },

      cancelPendingSaves: () => {
        clearAllPendingSaves();
      },

      nextPage: () =>
        set((state) => ({
          currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1),
        })),

      prevPage: () =>
        set((state) => ({
          currentPageIndex: Math.max(state.currentPageIndex - 1, 0),
        })),

      setPageIndex: (index) =>
        set((state) => ({
          currentPageIndex: Math.max(0, Math.min(index, state.pages.length - 1)),
        })),

      clearStore: () => {
        clearAllPendingSaves();
        queueSecretSave("gemini", "");
        queueSecretSave("openrouter", "");
        queueSecretSave("groq", "");
        queueSecretSave("custom", "");
        set({
          pages: [],
          currentPageIndex: 0,
          currentProjectId: null,
          apiKey: "",
          openRouterApiKey: "",
          groqApiKey: "",
          customApiKey: "",
          useConvention: true,
          translationEngine: "gemini",
          geminiModel: DEFAULT_GEMINI_MODEL,
          ollamaModel: DEFAULT_OLLAMA_MODEL,
          openAiCompatibleProvider: DEFAULT_OPENAI_COMPATIBLE_PROVIDER,
          openAiCompatibleModel: DEFAULT_OPENAI_COMPATIBLE_MODEL,
          openRouterModelMode: "auto-free",
          aiThinkingEnabled: false,
          aiInferBlockTypesEnabled: false,
          hasFinishedOnboarding: false,
          theme: "dark-organic",
          glossary: [],
        });
      },
    }),
    {
      name: "manga-storage",
      partialize: (state) => ({
        useConvention: state.useConvention,
        currentProjectId: state.currentProjectId,
        translationEngine: state.translationEngine,
        geminiModel: state.geminiModel,
        ollamaModel: state.ollamaModel,
        openAiCompatibleProvider: state.openAiCompatibleProvider,
        openAiCompatibleModel: state.openAiCompatibleModel,
        openRouterModelMode: state.openRouterModelMode,
        aiThinkingEnabled: state.aiThinkingEnabled,
        aiInferBlockTypesEnabled: state.aiInferBlockTypesEnabled,
        hasFinishedOnboarding: state.hasFinishedOnboarding,
        theme: state.theme,
      }),
    }
  )
);
