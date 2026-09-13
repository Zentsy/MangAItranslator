import { LINKS, MODELS } from "../data";
import { Reveal } from "../fx";
import { IconBolt, IconChip, IconOrbit, IconServer, IconSpark4, IconWarn } from "../icons";

export default function Engines() {
  return (
    <section id="motores" className="relative scroll-mt-20 bg-paper py-24">
      <div className="halftone pointer-events-none absolute -right-28 top-10 h-[420px] w-[420px] opacity-50 [mask-image:radial-gradient(circle,black_25%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                /// motores de IA
              </p>
              <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-ink md:text-6xl">
                Escolha seu <span className="otl-ink">motor.</span>
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-ink/70">
              Nuvem de ponta ou GPU local — o cofre de chaves isola cada provedor no keyring do
              sistema e o app cuida do resto.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Gemini — destaque */}
          <Reveal className="lg:col-span-7">
            <article className="relative h-full overflow-hidden border-[3px] border-ink bg-ink p-8 text-paper shadow-[10px_10px_0_var(--color-verm)] transition-transform duration-300 hover:-translate-y-1">
              <div className="halftone-paper pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 opacity-60 [mask-image:radial-gradient(circle,black_30%,transparent_72%)]" />
              <span className="absolute right-6 top-6 rotate-2 bg-verm px-3 py-1 font-pixel text-xs tracking-widest text-paper">
                ★ RECOMENDADO
              </span>
              <IconSpark4 className="h-12 w-12 text-verm" />
              <h3 className="mt-5 font-display text-4xl uppercase tracking-wide">Gemini</h3>
              <p className="mt-3 max-w-md leading-relaxed text-paper/75">
                Melhor experiência geral para qualidade, OCR e consistência — com Gemini 3.8 Flash
                nativo lendo os balões direto da página.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["GEMINI 3.8 FLASH NATIVO", "OCR FORTE", "CONSISTÊNCIA ALTA"].map((t) => (
                  <span key={t} className="border-2 border-paper/25 px-3 py-1 font-pixel text-xs text-paper/80">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          {/* Groq */}
          <Reveal delay={100} className="lg:col-span-5">
            <article className="relative h-full overflow-hidden border-[3px] border-ink bg-verm p-8 text-paper shadow-[10px_10px_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-1">
              <div className="halftone-paper pointer-events-none absolute -right-14 -top-14 h-56 w-56 opacity-50 [mask-image:radial-gradient(circle,black_30%,transparent_72%)]" />
              <span className="absolute right-6 top-6 -rotate-2 bg-ink px-3 py-1 font-pixel text-xs tracking-widest text-paper">
                ⚡ MODO TURBO
              </span>
              <IconBolt className="h-12 w-12 text-paper" />
              <h3 className="mt-5 font-display text-4xl uppercase tracking-wide">Groq</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-paper/90">
                Velocidade quase instantânea em páginas leves, rodando no hardware LPU.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["HARDWARE LPU", "QWEN 3.8 27B"].map((t) => (
                  <span key={t} className="border-2 border-paper/40 px-3 py-1 font-pixel text-xs text-paper/90">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          {/* trio */}
          {[
            {
              Icon: IconOrbit,
              name: "OpenRouter Auto",
              tag: "GRÁTIS",
              desc: "Seleciona automaticamente modelos vision gratuitos com fallback seguro — e o app ainda corrige respostas duplicadas, vazias ou mal formatadas.",
            },
            {
              Icon: IconChip,
              name: "LM Studio",
              tag: "LOCAL · GPU",
              desc: "A melhor opção local hoje: aceleração por GPU e modelos vision modernos como Qwen 3 VL, sem nada sair da sua máquina.",
            },
            {
              Icon: IconServer,
              name: "Ollama",
              tag: "LOCAL",
              desc: "Opção local simples e experimental para quem já vive dentro do ecossistema Ollama.",
            },
          ].map((e, i) => (
            <Reveal key={e.name} delay={i * 90} className="lg:col-span-4">
              <article className="group h-full border-[3px] border-ink bg-paper p-6 shadow-[7px_7px_0_var(--color-ink)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[10px_10px_0_var(--color-verm)]">
                <div className="flex items-start justify-between">
                  <e.Icon className="h-10 w-10 text-ink transition-colors duration-300 group-hover:text-verm" />
                  <span className="border-2 border-ink px-2 py-0.5 font-pixel text-[11px] tracking-widest">
                    {e.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl uppercase tracking-wide text-ink">
                  {e.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{e.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-12 border-t-[3px] border-ink pt-7">
            <p className="font-pixel text-sm uppercase tracking-[0.2em] text-ink/60">
              Modelos de última geração suportados →
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {MODELS.map((m) => (
                <span
                  key={m}
                  className="cursor-default border-2 border-ink bg-paper px-4 py-1.5 font-display text-lg tracking-wide text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-paper"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 flex max-w-3xl items-start gap-3 font-pixel text-[13px] leading-relaxed text-ink/60">
            <IconWarn className="mt-0.5 h-5 w-5 shrink-0 text-verm" />
            <span>
              Nos modelos grátis do OpenRouter, a qualidade depende do modelo disponível no
              momento — alguns modelos pequenos transcrevem em vez de traduzir.{" "}
              <a href={LINKS.repo} target="_blank" rel="noreferrer" className="link-slash text-verm">
                Revise sempre antes de publicar.
              </a>
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
