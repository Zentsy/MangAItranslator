import { STEPS } from "../data";
import { Reveal } from "../fx";
import { IconArrowL } from "../icons";
import { cn } from "../utils/cn";

export default function Flow() {
  return (
    <section id="fluxo" className="speedlines relative scroll-mt-20 overflow-hidden bg-ink py-24 text-paper">
      <div className="halftone-paper pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] opacity-50 [mask-image:radial-gradient(circle,black_25%,transparent_70%)]" />
      <div className="pointer-events-none absolute right-10 top-14 hidden rotate-12 font-brush text-3xl text-paper/15 lg:block">
        右から左へ読む
      </div>

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// fluxo rápido
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] md:text-6xl">
                Do raw ao .docx
                <br />
                em <span className="text-verm">5 painéis.</span>
              </h2>
            </div>
            <p className="flex items-center gap-3 font-pixel text-sm text-paper/60">
              <IconArrowL className="h-4 w-4 text-verm" />
              leia da direita pra esquerda, como um bom mangá
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 flex gap-5 overflow-x-auto pb-6 md:flex-row-reverse md:items-stretch md:overflow-visible md:pb-0">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex shrink-0 items-center gap-5 md:flex-1">
                {i > 0 && (
                  <IconArrowL className="hidden h-8 w-8 shrink-0 text-verm md:block" />
                )}
                <article
                  className={cn(
                    "relative w-[264px] border-[3px] border-ink bg-paper p-5 text-ink shadow-[8px_8px_0_var(--color-verm)] transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[12px_12px_0_var(--color-verm)] md:w-auto",
                    i % 2 === 0 ? "md:-rotate-[1.3deg]" : "md:rotate-[1.3deg]",
                  )}
                >
                  <span className="pointer-events-none absolute -top-7 left-3 -rotate-6 font-brush text-xl text-verm">
                    {s.sfx}
                  </span>
                  <div className="flex items-start justify-between">
                    <span className="otl-verm font-display text-6xl leading-none">{s.n}</span>
                    <span className="font-pixel text-[10px] tracking-widest text-ink/50">
                      {s.jp}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
                </article>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-10 text-center font-pixel text-sm text-paper/60">
            <span className="border-2 border-paper/30 px-2 py-0.5 text-paper">M</span> mescla
            balões adjacentes · <span className="border-2 border-paper/30 px-2 py-0.5 text-paper">S</span>{" "}
            inverte a ordem de leitura · navegação inteira pelo teclado
          </p>
        </Reveal>
      </div>
    </section>
  );
}
