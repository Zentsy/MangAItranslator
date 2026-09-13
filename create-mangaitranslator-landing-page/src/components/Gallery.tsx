import { SHOTS } from "../data";
import { Reveal } from "../fx";
import { IconNib } from "../icons";
import { cn } from "../utils/cn";

const ROT = [
  "-rotate-2 lg:translate-y-4",
  "rotate-[1.5deg] lg:-translate-y-2",
  "rotate-[2deg]",
  "-rotate-[1.5deg] lg:translate-y-6",
  "rotate-1 lg:-translate-y-3",
  "-rotate-1 lg:translate-y-3",
  "rotate-[1.8deg] lg:-translate-y-1",
];

export default function Gallery() {
  return (
    <section id="por-dentro" className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-paper">
      <div className="halftone-paper halftone-drift pointer-events-none absolute -right-24 top-20 h-[460px] w-[460px] opacity-40 [mask-image:radial-gradient(circle,black_25%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// por dentro do app
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] md:text-6xl">
                O editor é o <span className="text-verm">coração.</span>
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-paper/60">
              Capturas reais da v0.3.0 — passe o cursor pra endireitar a página na mesa de arte.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3 lg:gap-8">
          {SHOTS.map((s, i) => (
            <Reveal
              key={s.file}
              delay={(i % 3) * 110}
              className={cn(s.wide && "md:col-span-2")}
            >
              <figure
                className={cn(
                  "group relative border-[3px] border-paper bg-ink2 p-2 transition-all duration-500 hover:z-10 hover:rotate-0 hover:scale-[1.03]",
                  i % 2 === 0
                    ? "shadow-[10px_10px_0_var(--color-verm)]"
                    : "shadow-[10px_10px_0_rgba(243,239,227,0.85)]",
                  ROT[i % ROT.length],
                )}
              >
                <span className="tape -top-3 left-6 z-10 -rotate-6" />
                <span className="tape -bottom-3 right-8 z-10 rotate-3" />
                <img
                  src={s.src}
                  alt={`${s.file} — ${s.caption}`}
                  loading="lazy"
                  className={cn(
                    "w-full border-2 border-paper/15 object-cover object-top saturate-[0.92] transition-all duration-500 group-hover:saturate-110",
                    s.wide ? "aspect-[21/10]" : "aspect-[16/10]",
                  )}
                />
                <figcaption className="flex items-center justify-between px-1 pt-2.5 font-pixel text-[11px] text-paper/60">
                  <span>{s.caption}</span>
                  <span className="font-brush text-base text-verm">{s.jp}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}

          {/* cartão de citação fechando a grade */}
          <Reveal delay={220}>
            <div className="relative flex h-full min-h-[240px] rotate-[1.2deg] flex-col justify-between border-[3px] border-ink bg-verm p-6 text-paper shadow-[10px_10px_0_rgba(243,239,227,0.85)] transition-all duration-500 hover:rotate-0 hover:scale-[1.03]">
              <span className="tape -top-3 right-10 z-10 rotate-6" />
              <p className="font-brush text-3xl leading-snug">漫画の心を、<br />そのまま届ける。</p>
              <div>
                <p className="font-display text-2xl uppercase leading-tight tracking-wide">
                  “A IA traduz com você — o resto é lettering.”
                </p>
                <p className="mt-3 flex items-center gap-2 font-pixel text-xs text-paper/80">
                  <IconNib className="h-4 w-4" />
                  filosofia do projeto · README
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
