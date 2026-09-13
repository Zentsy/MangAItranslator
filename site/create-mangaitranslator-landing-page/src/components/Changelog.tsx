import { CHANGELOG, LINKS, ROADMAP } from "../data";
import { Reveal } from "../fx";
import { cn } from "../utils/cn";

export function Changelog() {
  return (
    <section id="novidades" className="relative scroll-mt-20 bg-paper py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// changelog
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-ink md:text-6xl">
                Novidades da
              </h2>
              <p className="otl-verm mt-2 font-display text-8xl leading-none md:text-9xl">
                v0.3.0
              </p>
              <p className="mt-7 max-w-sm leading-relaxed text-ink/75">
                Identidade Nanquim & Pena G, lote, glossário e memória — o salto que transformou o
                rascunho de IA em um fluxo editorial de verdade.
              </p>
              <a
                href={LINKS.v030}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-block border-[3px] border-ink px-5 py-3 font-display text-base tracking-wide text-ink transition-all duration-200 hover:bg-ink hover:text-paper"
              >
                NOTAS COMPLETAS DO RELEASE ↗
              </a>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          {CHANGELOG.map((c, i) => (
            <Reveal key={c.title} delay={Math.min(i * 70, 280)}>
              <div className="group relative border-l-[3px] border-ink py-5 pl-8 pr-3 transition-colors duration-300 hover:bg-ink/5">
                <span className="absolute -left-[9px] top-7 h-[15px] w-[15px] border-[3px] border-ink bg-verm transition-transform duration-300 group-hover:rotate-45" />
                <p className="font-pixel text-xs text-verm">
                  {String(i + 1).padStart(2, "0")} / {String(CHANGELOG.length).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-ink">
                  {c.title}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink/70">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Roadmap() {
  return (
    <section id="roadmap" className="relative scroll-mt-20 border-t-[3px] border-ink bg-parch py-24">
      <div className="halftone pointer-events-none absolute -left-24 bottom-0 h-[380px] w-[380px] opacity-40 [mask-image:radial-gradient(circle,black_25%,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// roadmap
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-ink md:text-6xl">
                Pra onde <span className="otl-ink">vamos.</span>
              </h2>
            </div>
            <p className="font-pixel text-sm text-ink/60">
              construído em público — cada issue vira painel deste kanban
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {ROADMAP.map((col, ci) => (
            <Reveal key={col.title} delay={ci * 120}>
              <div
                className={cn(
                  "h-full p-7 transition-transform duration-300 hover:rotate-0 hover:-translate-y-1",
                  col.tone === "ink" &&
                    "-rotate-1 border-[3px] border-ink bg-ink text-paper shadow-[9px_9px_0_var(--color-verm)]",
                  col.tone === "paper" &&
                    "rotate-1 border-[3px] border-ink bg-paper text-ink shadow-[9px_9px_0_var(--color-ink)]",
                  col.tone === "ghost" &&
                    "-rotate-[0.5deg] border-[3px] border-dashed border-ink/50 bg-transparent text-ink",
                )}
              >
                <div className="flex items-baseline justify-between border-b-2 border-current/20 pb-4">
                  <h3 className="font-display text-2xl uppercase tracking-wide">{col.title}</h3>
                  <span
                    className={cn(
                      "font-brush text-xl",
                      col.tone === "ink" ? "text-verm" : "text-verm",
                    )}
                  >
                    {col.jp}
                  </span>
                </div>
                <ul className="mt-5 space-y-4">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="group flex items-start gap-3 text-[15px] leading-relaxed transition-transform duration-200 hover:translate-x-1.5"
                    >
                      <span
                        className={cn(
                          "mt-[7px] h-3 w-3 shrink-0",
                          col.tone === "ink" && "bg-verm",
                          col.tone === "paper" && "border-2 border-ink bg-transparent group-hover:bg-verm group-hover:border-verm",
                          col.tone === "ghost" && "border-2 border-dashed border-ink/50",
                        )}
                      />
                      <span className={cn(col.tone === "ink" ? "text-paper/85" : "text-ink/80")}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
