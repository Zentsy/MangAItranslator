import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BlockType = 'rect' | 'outside' | 'thought' | 'double' | 'none';

export interface TranslationBlock {
  id: string;
  text: string;
  type: BlockType;
}

export interface MangaPage {
  id: string;
  url: string;
  name: string;
  translation: string; // Texto consolidado final
  blocks: TranslationBlock[]; // Blocos individuais para o editor supervisionado
  status: 'pending' | 'processing' | 'completed';
}

interface MangaStore {
  pages: MangaPage[];
  currentPageIndex: number;
  apiKey: string;
  useConvention: boolean;
  setApiKey: (key: string) => void;
  setUseConvention: (val: boolean) => void;
  setPages: (pages: MangaPage[]) => void;
  nextPage: () => void;
  prevPage: () => void;
  updatePage: (id: string, updates: Partial<MangaPage>) => void;
  updateBlock: (pageId: string, blockId: string, updates: Partial<TranslationBlock>) => void;
  reorderBlocks: (pageId: string, fromIndex: number, toIndex: number) => void;
  addBlock: (pageId: string) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  setPageIndex: (index: number) => void;
  clearStore: () => void;
}

export const useMangaStore = create<MangaStore>()(
  persist(
    (set) => ({
      pages: [],
      currentPageIndex: 0,
      apiKey: '',
      useConvention: true,

      setApiKey: (apiKey) => set({ apiKey }),
      setUseConvention: (useConvention) => set({ useConvention }),
      setPages: (pages) => set({ pages, currentPageIndex: 0 }),
      
      updatePage: (id, updates) => set((state) => ({
        pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      updateBlock: (pageId, blockId, updates) => set((state) => ({
        pages: state.pages.map(p => {
          if (p.id !== pageId) return p;
          return {
            ...p,
            blocks: p.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
          };
        })
      })),

      reorderBlocks: (pageId, fromIndex, toIndex) => set((state) => ({
        pages: state.pages.map(p => {
          if (p.id !== pageId) return p;
          const newBlocks = [...p.blocks];
          const [moved] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, moved);
          return { ...p, blocks: newBlocks };
        })
      })),

      addBlock: (pageId) => set((state) => ({
        pages: state.pages.map(p => {
          if (p.id !== pageId) return p;
          return {
            ...p,
            blocks: [...p.blocks, { id: Math.random().toString(36).substring(7), text: '', type: 'none' }]
          };
        })
      })),

      removeBlock: (pageId, blockId) => set((state) => ({
        pages: state.pages.map(p => {
          if (p.id !== pageId) return p;
          return { ...p, blocks: p.blocks.filter(b => b.id !== blockId) };
        })
      })),

      nextPage: () => set((state) => ({
        currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1)
      })),

      prevPage: () => set((state) => ({
        currentPageIndex: Math.max(state.currentPageIndex - 1, 0)
      })),

      setPageIndex: (index) => set((state) => ({
        currentPageIndex: Math.max(0, Math.min(index, state.pages.length - 1))
      })),

      clearStore: () => set({ pages: [], currentPageIndex: 0 }),
    }),
    {
      name: 'manga-storage',
      partialize: (state) => ({ apiKey: state.apiKey, useConvention: state.useConvention }),
    }
  )
);