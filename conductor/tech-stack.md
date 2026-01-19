# MangAItranslator - Pilha Tecnológica

## 1. Core Framework & Runtime
*   **Framework Desktop:** [Tauri](https://tauri.app/) (React + Rust).
*   **Frontend Library:** React (TypeScript) + Vite.

## 2. Interface e Estilização (Estética Cyber-Organic)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/).
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [ReactBits](https://www.reactbits.dev/).
*   **Animations:** [Framer Motion](https://www.framer.com/motion/).
*   **Image Handling:** `react-zoom-pan-pinch` para navegação em alta resolução.

## 3. Gerenciamento de Dados e Estado
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand).
    *   *Uso:* Store persistente para Fila de Páginas, Blocos de Tradução e Configurações de API.
*   **Internacionalização:** `i18next` para suporte multilingue.

## 4. Motores de IA (Translation Engines)
*   **Cloud (Primário):** [Google Gemini API](https://aistudio.google.com/) (Modelo 2.5 Flash).
*   **Local (Opcional):** [Ollama](https://ollama.ai/) (Modelo `translategemma`).
