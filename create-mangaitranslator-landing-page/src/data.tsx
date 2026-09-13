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
    "https://github.com/Zentsy/MangAItranslator/releases/download/v0.3.0/MangAI.Translator_0.3.0_x64-setup.exe",
  v030: "https://github.com/Zentsy/MangAItranslator/releases/tag/v0.3.0",
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
  version: "v0.3.0",
});

export function DownloadProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DownloadInfo>({
    downloadUrl: LINKS.downloadDirect,
    version: "v0.3.0",
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
            version: data.tag_name || "v0.3.0",
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
    title: "Identidade Nanquim & Pena G",
    desc: "Nova arte autêntica com estética densa de mangá editorial — a mesma que inspirou esta página.",
  },
  {
    title: "Tradução em lote (Batch Queue)",
    desc: "Processamento sequencial de múltiplas páginas com monitor de progresso no cabeçalho do editor.",
  },
  {
    title: "Glossário persistente por projeto",
    desc: "Termos, pronomes e golpes salvos em SQLite local e injetados nos prompts de cada página.",
  },
  {
    title: "Memória de curto prazo",
    desc: "Contexto entre páginas consecutivas para manter pronomes e falas contínuas consistentes.",
  },
  {
    title: "Atalhos rápidos de edição",
    desc: "Teclas M para mesclar balões adjacentes e S para inverter a ordem de leitura.",
  },
  {
    title: "Cofre de chaves (Keyring)",
    desc: "API keys de cada provedor isoladas no gerenciador de credenciais seguro do sistema.",
  },
  {
    title: "Modelos de última geração",
    desc: "Gemini 3.8 Flash, Claude Sonnet 5, Claude Fable 5.1, GPT-6 Astra e Qwen 3.8 27B via Groq.",
  },
];

export const ROADMAP = [
  {
    title: "Próximas melhorias",
    jp: "次の改善",
    tone: "ink" as const,
    items: [
      "Perfis de tradução por idioma de origem e destino",
      "Revisão de naturalidade depois do rascunho inicial",
      "Exportação visual com tradução aplicada sobre a imagem",
      "Limpeza de balões, redraw e typesetting assistido",
    ],
  },
  {
    title: "Futuro",
    jp: "未来",
    tone: "paper" as const,
    items: [
      "Code signing no Windows — adeus, aviso do SmartScreen",
      "Leitura direto da fonte via extensões, no espírito do Mihon",
      "Inglês como idioma de saída: JP, KO e ZH direto pro EN",
    ],
  },
  {
    title: "Em pesquisa",
    jp: "研究中",
    tone: "ghost" as const,
    items: [
      "Experiência mobile ou modo leitor para acompanhar traduções",
      "OCR e visão próprios para reduzir dependência de motores",
      "A sua ideia aqui — abra uma issue e entre pro roadmap",
    ],
  },
];

export const TICKER: { t: string; brush?: boolean }[] = [
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
