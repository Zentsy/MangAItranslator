import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_OLLAMA_MODEL } from "@/config/ollamaModels";
import { dbService } from "@/services/dbService";

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
export type TranslationEngine = "gemini" | "ollama";
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
  apiKey: string;
  useConvention: boolean;
  currentProjectId: string | null;
  translationEngine: TranslationEngine;
  ollamaModel: string;
  hasFinishedOnboarding: boolean;
  theme: AppTheme;

  setApiKey: (key: string) => void;
  setUseConvention: (value: boolean) => void;
  setProjectId: (id: string | null) => void;
  setPages: (pages: MangaPage[]) => void;
  setTranslationEngine: (engine: TranslationEngine) => void;
  setOllamaModel: (model: string) => void;
  setHasFinishedOnboarding: (value: boolean) => void;
  setTheme: (theme: AppTheme) => void;
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
      useConvention: true,
      currentProjectId: null,
      translationEngine: "gemini",
      ollamaModel: DEFAULT_OLLAMA_MODEL,
      hasFinishedOnboarding: false,
      theme: "dark-organic",

      setApiKey: (apiKey) => set({ apiKey }),
      setUseConvention: (useConvention) => set({ useConvention }),
      setProjectId: (currentProjectId) => set({ currentProjectId }),
      setTranslationEngine: (translationEngine) => set({ translationEngine }),
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
      setHasFinishedOnboarding: (hasFinishedOnboarding) => set({ hasFinishedOnboarding }),
      setTheme: (theme) => set({ theme }),
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
                { id: Math.random().toString(36).substring(7), text: "", type: "none" },
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
        set({
          pages: [],
          currentPageIndex: 0,
          currentProjectId: null,
          apiKey: "",
          useConvention: true,
          translationEngine: "gemini",
          ollamaModel: DEFAULT_OLLAMA_MODEL,
          hasFinishedOnboarding: false,
          theme: "dark-organic",
        });
      },
    }),
    {
      name: "manga-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        useConvention: state.useConvention,
        currentProjectId: state.currentProjectId,
        translationEngine: state.translationEngine,
        ollamaModel: state.ollamaModel,
        hasFinishedOnboarding: state.hasFinishedOnboarding,
        theme: state.theme,
      }),
    }
  )
);
