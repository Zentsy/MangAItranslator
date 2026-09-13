import { useState } from "react";
import { LINKS, TICKER, useDownloadInfo } from "../data";
import { Reveal, ScrambleText, usePRM } from "../fx";
import { IconGithub, IconKofi, IconNib, IconSplat, IconStarSm, IconWindows } from "../icons";
import { cn } from "../utils/cn";

const SHOT = (f: string) =>
  `https://raw.githubusercontent.com/Zentsy/MangAItranslator/master/screenshots/${f}`;

export function Ticker({
  reverse = false,
  tone = "ink",
}: {
  reverse?: boolean;
  tone?: "ink" | "verm";
}) {
  return (
    <div
      className={cn(
        "marquee border-y-[3px] border-ink py-3",
        tone === "ink" ? "bg-ink text-paper" : "bg-verm text-paper",
      )}
      aria-hidden
    >
      <div className={cn("marquee-track", reverse && "marquee-reverse")}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {TICKER.map((item, i) => (
              <span key={i} className="flex items-center">
                <span
                  className={cn(
                    "whitespace-nowrap px-5 text-xl tracking-wide",
                    item.brush ? "font-brush text-2xl text-verm" : "font-display uppercase",
                    tone === "verm" && item.brush && "text-ink",
                  )}
                >
                  {item.t}
                </span>
                <IconStarSm className="h-3.5 w-3.5 shrink-0 text-verm" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Opening() {
  const { downloadUrl, version } = useDownloadInfo();
  const prm = usePRM();
  const [par, setPar] = useState({ x: 0, y: 0 });

  const layer = (mx: number, my: number) =>
    prm
      ? undefined
      : {
          transform: `translate(${par.x * mx}px, ${par.y * my}px)`,
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        };

  return (
    <section
      id="topo"
      className="relative overflow-hidden bg-paper pt-28 md:pt-36"
      onMouseMove={(e) => {
        if (prm) return;
        const r = e.currentTarget.getBoundingClientRect();
        setPar({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
    >
      {/* texturas ambiente */}
      <div className="halftone halftone-drift pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] opacity-60 [mask-image:radial-gradient(circle,black_30%,transparent_72%)]" />
      <div className="halftone pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] opacity-40 [mask-image:radial-gradient(circle,black_25%,transparent_70%)]" />
      <IconSplat className="pointer-events-none absolute right-[6%] top-24 h-40 w-40 text-verm opacity-[0.08]" />

      {/* kanji vertical */}
      <div className="writing-v pointer-events-none absolute left-5 top-44 hidden font-brush text-2xl text-ink/50 xl:block">
        漫画翻訳・ペンＧの力
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:gap-8">
        {/* coluna esquerda — o grito de capa */}
        <div className="relative lg:col-span-7">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 font-pixel text-xs">
              <span className="bg-verm px-2 py-1 text-paper">RELEASE {version}</span>
              <span className="border-2 border-ink px-2 py-1">WINDOWS x64</span>
              <span className="border-2 border-ink px-2 py-1">LICENÇA MIT</span>
              <span className="border-2 border-ink px-2 py-1">TAURI · RUST · REACT</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-8 flex items-center gap-3 font-pixel text-sm uppercase tracking-[0.25em] text-verm">
              <span className="inline-block h-[3px] w-10 -skew-x-12 bg-verm" />
              Localização assistida de mangá & quadrinhos
            </p>
          </Reveal>

          <h1 className="mt-5 font-display uppercase leading-[0.92] text-ink">
            <span className="block text-[clamp(3rem,8.4vw,7rem)]">
              <ScrambleText text="A IA TRADUZ" delay={250} />
            </span>
            <span className="relative block text-[clamp(3rem,8.4vw,7rem)]">
              <span className="text-verm">COM</span> VOCÊ,
              <svg
                className="absolute -bottom-2 left-0 w-[min(420px,80%)] text-verm"
                viewBox="0 0 300 24"
                fill="none"
                aria-hidden
              >
                <path
                  className="draw-underline"
                  pathLength={1}
                  d="M4 16 C 60 6, 140 22, 296 8"
                  stroke="currentColor"
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="otl-ink block text-[clamp(3rem,8.4vw,7rem)]">
              NÃO POR VOCÊ.
            </span>
          </h1>

          <Reveal delay={150}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
              Importe o capítulo, gere o rascunho com IA, revise{" "}
              <strong className="font-bold text-ink">balão por balão</strong> e exporte o texto
              final sem perder o contexto da página. Desktop, open source, do seu jeito.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 border-[3px] border-ink bg-ink px-7 py-4 font-display text-xl tracking-wide text-paper shadow-[7px_7px_0_var(--color-verm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--color-verm)] active:translate-y-0 active:shadow-none"
              >
                <IconWindows className="h-5 w-5 text-verm transition-colors group-hover:text-paper" />
                BAIXAR P/ WINDOWS x64
              </a>
              <a
                href={LINKS.repo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border-[3px] border-ink bg-paper px-6 py-4 font-display text-xl tracking-wide text-ink transition-all duration-200 hover:bg-ink hover:text-paper"
              >
                <IconGithub className="h-5 w-5" />
                GITHUB
              </a>
              <a
                href={LINKS.kofi}
                target="_blank"
                rel="noreferrer"
                className="link-slash flex items-center gap-2 font-pixel text-sm text-ink/70 transition-colors hover:text-verm"
              >
                <IconKofi className="h-5 w-5" />
                apoiar no ko-fi ↗
              </a>
            </div>
            <p className="mt-4 font-pixel text-xs text-ink/55">
              grátis · sem conta · suas chaves ficam no keyring do seu SO
            </p>
          </Reveal>

          {/* carimbo hanko */}
          <div className="stamp pointer-events-none absolute right-0 top-14 hidden select-none border-[3px] border-verm px-4 py-3 text-verm sm:block lg:-right-10 [border-style:double] [border-width:6px]">
            <span className="block font-display text-2xl leading-none">v0.3.0</span>
            <span className="mt-1 block font-pixel text-[10px] tracking-widest">BETA · 試験版</span>
          </div>
        </div>

        {/* coluna direita — composição de painéis */}
        <div className="relative min-h-[540px] lg:col-span-5 lg:min-h-0">
          <div className="relative mx-auto max-w-[480px]">
            {/* painel de trás: batch */}
            <Reveal delay={200} className="absolute right-0 top-10 w-[76%]">
              <figure
                className="rotate-[6deg] border-[3px] border-ink bg-ink p-2 shadow-[10px_10px_0_rgba(27,24,29,0.18)] transition-transform duration-500 hover:rotate-[3deg]"
                style={layer(16, 10)}
              >
                <img
                  src={SHOT("batch.png")}
                  alt="Fila de tradução em lote do MangAI Translator"
                  loading="eager"
                  className="aspect-[16/10] w-full border-2 border-paper/20 object-cover object-top"
                />
                <figcaption className="flex justify-between px-1 pt-2 font-pixel text-[10px] text-paper/70">
                  <span>batch.png</span>
                  <span className="text-verm">一括翻訳</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* painel da frente: editor */}
            <Reveal delay={100} className="relative z-10 w-[92%]">
              <figure className="-rotate-2 border-[3px] border-ink bg-ink p-2 shadow-[12px_12px_0_var(--color-verm)] transition-transform duration-500 hover:rotate-0">
                <img
                  src={SHOT("editor.png")}
                  alt="Editor do MangAI Translator com revisão de blocos"
                  loading="eager"
                  className="aspect-[16/11] w-full border-2 border-paper/20 object-cover object-top"
                />
                <figcaption className="flex justify-between px-1 pt-2 font-pixel text-[10px] text-paper/70">
                  <span>editor.png — o coração do app</span>
                  <span className="text-verm">編集</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* balão de fala */}
            <Reveal delay={420} className="absolute -left-4 bottom-16 z-20 sm:-left-12">
              <div
                className="relative -rotate-3 border-[3px] border-ink bg-paper px-4 py-3 font-pixel text-sm shadow-[5px_5px_0_var(--color-ink)]"
                style={layer(-14, 8)}
              >
                glossário injetado no prompt<span className="caret text-verm">▌</span>
                <span className="absolute -bottom-[13px] left-8 h-5 w-5 rotate-45 border-b-[3px] border-r-[3px] border-ink bg-paper" />
              </div>
            </Reveal>

            {/* keycaps flutuantes */}
            <div className="absolute -right-2 top-0 z-20" style={layer(10, -16)}>
              <span className="keycap floaty">M</span>
            </div>
            <div className="absolute -right-6 top-16 z-20" style={layer(20, 14)}>
              <span className="keycap floaty [animation-delay:1.2s]">S</span>
            </div>

            {/* onomatopeias */}
            <span className="pointer-events-none absolute -top-10 right-6 z-20 -rotate-6 font-display text-4xl text-verm [text-shadow:3px_3px_0_var(--color-ink)]">
              ドドン!
            </span>
            <span className="pointer-events-none absolute bottom-2 right-4 z-0 font-brush text-2xl text-ink/40">
              ザザザッ…
            </span>

            <div className="pointer-events-none absolute -left-8 top-24 hidden sm:block" style={layer(-20, -10)}>
              <IconNib className="h-10 w-10 rotate-45 text-ink/25" />
            </div>
          </div>
        </div>
      </div>

      {/* régua de stats */}
      <Reveal delay={100}>
        <div className="mx-auto mt-20 max-w-7xl px-5 pb-16">
          <div className="grid grid-cols-2 border-[3px] border-ink bg-paper shadow-[8px_8px_0_var(--color-ink)] sm:grid-cols-4">
            {[
              { big: "5", small: "motores de IA", jp: "エンジン", verm: false },
              { big: "M/S", small: "atalhos de revisão", jp: "時短", verm: true },
              { big: ".DOCX", small: "exportação editorial", jp: "出力", verm: false },
              { big: "100%", small: "open source · MIT", jp: "無料", verm: false },
            ].map((s, i) => (
              <div
                key={i}
                className={cn(
                  "group border-ink px-5 py-6 transition-colors duration-300 hover:bg-ink",
                  i !== 0 && "border-l-[3px] max-sm:[&:nth-child(3)]:border-l-0",
                  "max-sm:odd:border-l-0 max-sm:[&:nth-child(n+3)]:border-t-[3px] sm:border-t-0",
                )}
              >
                <p
                  className={cn(
                    "font-display text-4xl leading-none",
                    s.verm ? "text-verm" : "text-ink group-hover:text-verm",
                  )}
                >
                  {s.big}
                </p>
                <p className="mt-2 font-pixel text-[11px] uppercase tracking-wider text-ink/60 group-hover:text-paper/70">
                  {s.small}
                </p>
                <p className="font-brush text-sm text-verm opacity-70">{s.jp}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
