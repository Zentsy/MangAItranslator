# GEMINI.md - MangAItranslator

## Project Overview
MangAItranslator is a desktop application designed for Manga Translation Groups (Scanlators). It automates and optimizes the translation workflow by combining AI-powered text extraction and translation with a supervised editing interface.

- **Primary Technologies:** Tauri (Rust + React/TS), Vite, Tailwind CSS.
- **AI Engines:** Google Gemini API (2.5 Flash) and Ollama (local models).
- **State Management:** Zustand with persistence and debounced database synchronization.
- **Database:** SQLite (via `tauri-plugin-sql`).
- **Styling:** Modular architecture designed for multiple themes. Initial focus on a clean, dark aesthetic using Tailwind CSS and Framer Motion.

## Building and Running

### Prerequisites
- Node.js (v18+)
- Rust (Stable)
- Tauri dependencies (OS-specific)

### Commands
- **Development (Vite + Tauri):** `npm run tauri dev`
- **Build (Production):** `npm run tauri build`
- **Frontend Only Dev:** `npm run dev`
- **Frontend Only Build:** `npm run build`

## Development Conventions

### UI/UX & Aesthetic Mandate
- **Theme Modularity:** ALWAYS use CSS variables or Tailwind utility classes that reference a central theme configuration. Hardcoded colors should be avoided to facilitate future theme switching.
- **Human-Friendly Language:** All UI text, logs (visible to user), and instructions must use language accessible to Scanlators and Translators (Portuguese). Avoid "dev-speak", terminal-style status messages, or technical jargon.
- **Custom Identity:** ALWAYS use the project's custom UI/UX components. NEVER use native OS dialogs.

### Architecture
- **Human-in-the-Loop:** The UI is designed for AI-assisted drafting followed by human validation.
- **Modular Themes:** Style components using a semantic approach (e.g., use `var(--background)` em vez de `bg-[#0a0a0a]`) whenever possible to support theme swaps.
- **Atomic Operations:** Database saves for pages are handled atomically via Rust commands (see `src/services/dbService.ts`).
- **State Persistence:** UI state (API keys, project IDs) is persisted in `localStorage` via Zustand middleware, while heavy data (pages, blocks) is stored in SQLite.
- **Block-Based Editing:** Manga pages are divided into blocks (`rect`, `outside`, `thought`, `double`, `none`) for granular translation control.

### Coding Style
- **TypeScript:** Strict typing is preferred. Use interfaces for state and service models.
- **Localization:** All user-facing strings must use `i18next` (see `src/locales/`).
- **Components:** Modular components in `src/components/`. Prefer functional components with hooks.
- **State:** Use the `useMangaStore` for global application state and `queuePageSave` for debounced database persistence.

### Testing
- **Status:** TODO (Add automated test runner like Vitest).
- **Goal:** Minimum 50% coverage for core translation logic and signal processing.
- **Current Practice:** Manual testing notes are stored in `testes/testes.md`.

## Key Files & Directories
- `src/store/useMangaStore.ts`: Central state management and persistence logic.
- `src/services/dbService.ts`: SQLite interaction layer.
- `src/services/geminiService.ts`: Integration with Google Generative AI.
- `src-tauri/tauri.conf.json`: Tauri application configuration and plugin permissions.
- `conductor/`: Comprehensive project documentation, requirements, and tracks.
- `components.json`: Shadcn/UI configuration.

## Roadmap & Context
Refer to `conductor/product.md` for the product vision and `conductor/tracks.md` for the implementation progress.
