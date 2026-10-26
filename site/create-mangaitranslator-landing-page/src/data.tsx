import { createContext, useContext, useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  IconImport,
  IconQueue,
  IconGlossary,
  IconMemory,
  IconKeys,
  IconVault,
  IconEditor,
  IconExport,
} from "./icons";

export const LINKS = {
  repo: "https://github.com/Zentsy/MangAItranslator",
  latest: "https://github.com/Zentsy/MangAItranslator/releases/latest",
  downloadDirect:
    "https://github.com/Zentsy/MangAItranslator/releases/download/v0.4.0/MangAI.Translator_0.4.0_x64-setup.exe",
  v040: "https://github.com/Zentsy/MangAItranslator/releases/tag/v0.4.0",
  v030: "https://github.com/Zentsy/MangAItranslator/releases/tag/v0.3.5",
  issues: "https://github.com/Zentsy/MangAItranslator/issues",
  license: "https://github.com/Zentsy/MangAItranslator/blob/master/LICENSE",
  kofi: "https://ko-fi.com/zentsy",
};

export type DownloadInfo = {
  downloadUrl: string;
  version: string;
};

export const DownloadContext = createContext<DownloadInfo>({
  downloadUrl: LINKS.downloadDirect,
  version: "v0.4.0",
});

export function DownloadProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DownloadInfo>({
    downloadUrl: LINKS.downloadDirect,
    version: "v0.4.0",
  });

  useEffect(() => {
    fetch("https://api.github.com/repos/Zentsy/MangAItranslator/releases/latest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const exe = data.assets?.find(
          (a: { name?: string; browser_download_url?: string }) =>
            typeof a.name === "string" && a.name.endsWith(".exe") && !a.name.endsWith(".sig")
        );
        if (exe?.browser_download_url) {
          setInfo({
            downloadUrl: exe.browser_download_url,
            version: data.tag_name || "v0.4.0",
          });
        }
      })
      .catch(() => {});
  }, []);

  return <DownloadContext.Provider value={info}>{children}</DownloadContext.Provider>;
}

export function useDownloadInfo() {
  return useContext(DownloadContext);
}

const SHOT = (f: string) =>
  `https://raw.githubusercontent.com/Zentsy/MangAItranslator/master/screenshots/${f}`;

export type Shot = {
  src: string;
  file: string;
  caption: string;
  jp: string;
  wide?: boolean;
};

export const SHOTS: Shot[] = [
  {
    src: SHOT("editor.png"),
    file: "editor.png",
    caption: "revisão bloco a bloco + monitor de lote",
    jp: "編集",
    wide: true,
  },
  {
    src: SHOT("home.png"),
    file: "home.png",
    caption: "dashboard & projetos recentes",
    jp: "家",
  },
  {
    src: SHOT("batch.png"),
    file: "batch.png",
    caption: "fila de tradução em lote",
    jp: "一括",
  },
  {
    src: SHOT("Glossario-v3.png"),
    file: "glossario.png",
    caption: "termos persistidos em SQLite",
    jp: "用語集",
  },
  {
    src: SHOT("exportar.png"),
    file: "exportar.png",
    caption: "exportação .txt / .docx",
    jp: "出力",
  },
  {
    src: SHOT("configs_v3.png"),
    file: "configs.png",
    caption: "motores & modelos v0.3.0",
    jp: "設定",
  },
  {
    src: SHOT("tema%20branco%20-%20home.png"),
    file: "tema-claro.png",
    caption: "interface editorial diurna",
    jp: "白",
  },
];

export type Feature = {
  n: string;
  title: string;
  desc: string;
  Icon: ComponentType<{ className?: string }>;
  tags: string[];
};

export const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Importação inteligente",
    desc: "Pastas completas de capítulos ou páginas avulsas, com detecção automática de vizinhas para nada ficar fora de ordem.",
    Icon: IconImport,
    tags: ["capítulos", "páginas avulsas"],
  },
  {
    n: "02",
    title: "Fila em lote assíncrona",
    desc: "Enfileire múltiplas páginas e acompanhe o progresso em tempo real direto no cabeçalho do editor — enquanto revisa.",
    Icon: IconQueue,
    tags: ["batch queue", "tempo real"],
  },
  {
    n: "03",
    title: "Glossário persistente",
    desc: "Termos, nomes de personagens e golpes salvos em SQLite local por projeto e injetados nos prompts. Coerência do capítulo 1 ao 200.",
    Icon: IconGlossary,
    tags: ["sqlite", "por projeto"],
  },
  {
    n: "04",
    title: "Memória de curto prazo",
    desc: "Contexto carregado entre páginas consecutivas para manter pronomes, tom e falas contínuas consistentes.",
    Icon: IconMemory,
    tags: ["contexto entre páginas"],
  },
  {
    n: "05",
    title: "Atalhos de revisão",
    desc: "M mescla balões adjacentes, S inverte a ordem de leitura, e a navegação inteira flui pelo teclado. Mão não sai do home row.",
    Icon: IconKeys,
    tags: ["M = mesclar", "S = inverter"],
  },
  {
    n: "06",
    title: "Cofre de chaves seguro",
    desc: "API keys isoladas por provedor e guardadas no keyring nativo do sistema operacional. Nada de .env perdido na pasta.",
    Icon: IconVault,
    tags: ["keyring do SO", "isolamento"],
  },
  {
    n: "07",
    title: "Editor de blocos",
    desc: "Revise o rascunho bloco por bloco com preservação de formatação editorial — itálicos, gritos, onomatopeias, tudo sobrevive.",
    Icon: IconEditor,
    tags: ["preservação editorial"],
  },
  {
    n: "08",
    title: "Export & auto-update",
    desc: "Texto final em .txt ou .docx sem sair do fluxo, e o próprio app checa e instala atualizações sozinho.",
    Icon: IconExport,
    tags: [".txt", ".docx", "updater"],
  },
];

export type Step = {
  n: string;
  jp: string;
  title: string;
  desc: string;
  sfx: string;
};

export const STEPS: Step[] = [
  {
    n: "1",
    jp: "ステップ一",
    title: "Escolha o motor",
    desc: "Gemini, Groq, OpenRouter ou 100% local com LM Studio e Ollama.",
    sfx: "スッ",
  },
  {
    n: "2",
    jp: "ステップ二",
    title: "Importe o capítulo",
    desc: "Pasta completa ou páginas avulsas — vizinhas detectadas na hora.",
    sfx: "タタタッ",
  },
  {
    n: "3",
    jp: "ステップ三",
    title: "Gere o AI Draft",
    desc: "Página individual ou lote inteiro, com monitor de progresso ao vivo.",
    sfx: "ドン!",
  },
  {
    n: "4",
    jp: "ステップ四",
    title: "Revise os blocos",
    desc: "Glossário no prompt, M mescla balões, S inverte a ordem de leitura.",
    sfx: "シュッ",
  },
  {
    n: "5",
    jp: "ステップ五",
    title: "Exporte o final",
    desc: "Capítulo fechado em .txt ou .docx, pronto pra soltar o release.",
    sfx: "完成!",
  },
];

export const MODELS = [
  "Gemini 3.8 Flash",
  "Claude Sonnet 5",
  "Claude Fable 5.1",
  "GPT-6 Astra",
  "Qwen 3.8 27B · Groq",
];

export const CHANGELOG = [
  {
    title: "Design System Paper Light (Washi Cru)",
    desc: "Nova identidade visual densa e imersiva inspirada em papel Washi tradicional, nanquim puro e selos Hanko, com contraste editorial perfeito para leituras diurnas.",
  },
  {
    title: "Segunda Passada de Naturalidade (PT-BR)",
    desc: "Polimento refinado por IA após o rascunho literal inicial para deixar os diálogos naturais, fluidos e expressivos, preservando o contexto dramático de cada balão.",
  },
  {
    title: "Preset Japonês Raw → PT-BR Direto",
    desc: "Engenharia de prompt de alta precisão para quadrinhos em japonês original, com desambiguação de kanjis homófonos, furigana e respeito à leitura vertical (tategaki).",
  },
  {
    title: "Perfis de Tradução por Mídia",
    desc: "Presets dedicados para Mangá (JP), Manhwa (KR), Manhua (CN) e Comics (US) com controle de tom de voz (Natural, Informal, Formal, Cru) e live inspector.",
  },
  {
    title: "Iconografia Autoral & Adeus AI Slop",
    desc: "Substituição completa de ícones genéricos por arte vetorial autoral em SVG puro: Penas G, tinteiros, selos Hanko e balões de mangá com economia de 1.8MB no bundle.",
  },
  {
    title: "OpenRouter Auto-Free Estabilizado",
    desc: "Roteador inteligente de modelos vision gratuitos com fallback instantâneo, supressão de tokens de pensamento (<think>) e teto estendido de 4096 tokens.",
  },
  {
    title: "Tradução em Lote & Glossário SQLite",
    desc: "Fila de processamento contínuo com monitor de progresso em tempo real e memória léxica persistente por projeto para coerência narrativa total.",
  },
];

export const ROADMAP = [
  {
    title: "Ciclo Ativo: Fase v0.5.0",
    jp: "次の改善",
    tone: "ink" as const,
    items: [
      "Typesetter Helper Visual com fontes de mangá embutidas",
      "Dicionário interativo de Onomatopeias e SFX japonesas (擬音語・擬態語)",
      "Pacote de Projeto .mangai para intercâmbio entre equipes de scanlation",
      "Detecção local de coordenadas de balões via WebAssembly (WASM)",
    ],
  },
  {
    title: "Futuro v1.0.0",
    jp: "未来",
    tone: "paper" as const,
    items: [
      "Code signing no Windows — adeus, aviso do SmartScreen",
      "Leitura direto da fonte via extensões, no espírito do Mihon",
      "Multiplataforma oficial: instaladores nativos para Linux e macOS",
      "Tradução 100% offline com runtime e modelos locais embarcados",
    ],
  },
  {
    title: "Em pesquisa",
    jp: "研究中",
    tone: "ghost" as const,
    items: [
      "Limpeza inteligente de balões e redraw automático assistido",
      "Modo leitor mobile para acompanhamento e revisão remota de capítulos",
      "A sua ideia aqui — abra uma issue no GitHub e entre pro projeto",
    ],
  },
];

export const TICKER: { t: string; brush?: boolean }[] = [
  { t: "Segunda Passada" },
  { t: "推敲", brush: true },
  { t: "Preset Japonês Raw" },
  { t: "和文", brush: true },
  { t: "Design Paper Light" },
  { t: "和紙", brush: true },
  { t: "Tradução em lote" },
  { t: "翻訳", brush: true },
  { t: "Glossário SQLite" },
  { t: "用語集", brush: true },
  { t: "Memória de contexto" },
  { t: "文脈", brush: true },
  { t: "Atalhos M · S" },
  { t: "Gemini · Groq · OpenRouter" },
  { t: "Export .txt / .docx" },
  { t: "出力", brush: true },
  { t: "Keyring seguro" },
  { t: "Open source · MIT" },
];
