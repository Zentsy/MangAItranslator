import { useEffect, useState } from "react";
import { FEATURES, LINKS } from "../data";
import { Reveal } from "../fx";
import { IconCheck, IconGithub } from "../icons";
import { cn } from "../utils/cn";

const TOTAL = 6;

/** Simulação viva do monitor de batch do app. */
function BatchMonitor() {
  const [state, setState] = useState({ done: 1, pct: 38 });

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.pct < 100) {
          return { ...s, pct: Math.min(100, s.pct + 7 + Math.floor(Math.random() * 15)) };
        }
        if (s.done >= TOTAL - 1) return { done: 0, pct: 5 };
        return { done: s.done + 1, pct: 5 + Math.floor(Math.random() * 9) };
      });
    }, 460);
    return () => clearInterval(id);
  }, []);

  const overall = ((state.done + state.pct / 100) / TOTAL) * 100;
  const remaining = TOTAL - state.done - 1;
  const eta = remaining * 6 + Math.ceil((100 - state.pct) / 18);

  return (
    <div className="border-[3px] border-ink bg-ink p-6 text-paper shadow-[10px_10px_0_var(--color-verm)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 font-pixel text-sm tracking-widest">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping bg-verm opacity-60" />
            <span className="relative inline-flex h-3 w-3 bg-verm" />
          </span>
          BATCH QUEUE
          <span className="text-paper/40">//</span>
          <span className="text-verm">TRADUZINDO</span>
        </p>
        <p className="font-pixel text-xs text-paper/50">
          monitor em tempo real · ETA 00:{String(eta).padStart(2, "0")}
        </p>
      </div>

      <div className="mt-5 h-4 border-2 border-paper/25 bg-ink2">
        <div
          className="bar-stripes h-full bg-verm transition-[width] duration-500 ease-out"
          style={{ width: `${overall}%` }}
        />
      </div>
      <p className="mt-2 font-pixel text-[11px] text-paper/50">
        {state.done + (state.pct >= 100 ? 1 : 0)}/{TOTAL} páginas na fila · motor: gemini-3.8-flash
      </p>

      <ul className="mt-4">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const status = i < state.done ? "done" : i === state.done ? "run" : "queue";
          return (
            <li
              key={i}
              className={cn(
                "grid grid-cols-[52px_1fr_132px] items-center gap-3 border-b border-paper/10 py-2.5 font-pixel text-sm transition-colors duration-300 sm:grid-cols-[64px_1fr_160px]",
                status === "queue" && "opacity-40",
              )}
            >
              <span className="text-paper/60">p.{String(i + 1).padStart(2, "0")}</span>
              {status === "run" ? (
                <span className="h-2.5 border border-paper/25 bg-ink2">
                  <span
                    className="block h-full bg-verm transition-[width] duration-500 ease-out"
                    style={{ width: `${state.pct}%` }}
                  />
                </span>
              ) : (
                <span className="h-2.5" />
              )}
              <span
                className={cn(
                  "text-right text-[12px] tracking-wider",
                  status === "done" && "text-teal",
                  status === "run" && "text-verm",
                )}
              >
                {status === "done" && (
                  <span className="inline-flex items-center gap-1.5">
                    <IconCheck className="h-3.5 w-3.5" /> CONCLUÍDA
                  </span>
                )}
                {status === "run" && <>TRADUZINDO {state.pct}%</>}
                {status === "queue" && "NA FILA…"}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 font-pixel text-[11px] text-paper/50">
        glossário: 42 termos injetados · memória: 2 págs de contexto · formatação editorial
        preservada
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="recursos" className="relative scroll-mt-20 bg-paper py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-12">
        {/* coluna sticky */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// o que o app faz
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-ink md:text-6xl">
                Arsenal
                <br />
                completo
                <br />
                <span className="otl-verm">do tradutor.</span>
              </h2>
              <p className="mt-6 max-w-sm leading-relaxed text-ink/75">
                O editor é o coração do app: fila em lote, glossário persistido, memória de
                contexto e atalhos que respeitam o seu fluxo — do raw ao texto final.
              </p>
              <a
                href={LINKS.repo}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-3 border-[3px] border-ink px-5 py-3 font-display text-base tracking-wide text-ink transition-all duration-200 hover:bg-ink hover:text-paper"
              >
                <IconGithub className="h-5 w-5" />
                VER CÓDIGO FONTE
              </a>
            </Reveal>
          </div>
        </div>

        {/* lista de recursos */}
        <div className="lg:col-span-8">
          <div className="border-b-[3px] border-ink">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={Math.min(i * 60, 240)}>
              <article className="group grid items-start gap-5 border-t-[3px] border-ink px-2 py-7 transition-colors duration-300 hover:bg-ink sm:grid-cols-[84px_56px_1fr] sm:px-4">
                <span
                  className="font-display text-5xl leading-none text-transparent transition-colors duration-300 group-hover:text-verm"
                  style={{ WebkitTextStroke: "2px var(--color-ink)" }}
                >
                  {f.n}
                </span>
                <span className="grid h-14 w-14 place-items-center border-[3px] border-ink bg-paper text-ink transition-colors duration-300 group-hover:border-verm group-hover:bg-verm group-hover:text-paper">
                  <f.Icon className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-ink transition-colors duration-300 group-hover:text-paper">
                    {f.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink/70 transition-colors duration-300 group-hover:text-paper/75">
                    {f.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="border border-ink/30 px-2 py-0.5 font-pixel text-[11px] text-ink/60 transition-colors duration-300 group-hover:border-paper/30 group-hover:text-paper/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
          </div>

          <Reveal delay={120} className="mt-10">
            <BatchMonitor />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
