import { LINKS } from "../data";
import { Reveal } from "../fx";
import {
  IconGithub,
  IconKofi,
  IconNib,
  IconWarn,
  IconWindows,
} from "../icons";

const SPECS = [
  { k: "versão", v: "v0.3.0 · beta público" },
  { k: "plataforma", v: "Windows x64 (instalador)" },
  { k: "stack", v: "Tauri · Rust · React" },
  { k: "licença", v: "MIT — open source" },
  { k: "atualização", v: "automática, pelo próprio app" },
  { k: "segurança", v: "API keys no keyring do SO" },
];

export function Download() {
  return (
    <section id="baixar" className="relative scroll-mt-20 bg-paper py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="relative overflow-hidden border-[3px] border-ink bg-ink text-paper shadow-[14px_14px_0_var(--color-verm)]">
            <div className="halftone-paper halftone-drift pointer-events-none absolute inset-0 opacity-60" />
            <p className="writing-v pointer-events-none absolute right-6 top-8 font-brush text-5xl text-verm/30">
              翻訳開始
            </p>

            <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
              <div>
                <p className="font-pixel text-sm uppercase tracking-[0.25em] text-verm">
                  /// download
                </p>
                <h2 className="mt-4 font-display text-6xl uppercase leading-[0.92] md:text-7xl">
                  Pronto pra
                  <br />
                  <span className="text-verm">traduzir?</span>
                </h2>
                <p className="mt-6 max-w-md leading-relaxed text-paper/75">
                  Baixe o instalador, conecte seu motor favorito e comece o capítulo de hoje. Beta
                  público — sua issue de hoje é o roadmap de amanhã.
                </p>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                  <a
                    href={LINKS.latest}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-center gap-3 border-[3px] border-paper bg-verm px-8 py-5 font-display text-2xl tracking-wide text-paper shadow-[8px_8px_0_var(--color-paper)] transition-all duration-200 hover:-translate-y-1 hover:bg-verm2 active:translate-y-0 active:shadow-none"
                  >
                    <IconWindows className="h-6 w-6" />
                    BAIXAR WINDOWS x64
                  </a>
                  <div className="flex gap-3">
                    <a
                      href={LINKS.v030}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 border-[3px] border-paper px-4 py-3 font-pixel text-sm text-paper transition-colors duration-200 hover:bg-paper hover:text-ink"
                    >
                      <IconGithub className="h-4 w-4" />
                      releases
                    </a>
                    <a
                      href={LINKS.kofi}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 border-[3px] border-paper bg-kofi px-4 py-3 font-pixel text-sm text-paper transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <IconKofi className="h-4 w-4" />
                      ko-fi
                    </a>
                  </div>
                </div>
                <p className="mt-4 font-pixel text-xs text-paper/50">
                  v0.3.0 · instalador .exe · sem conta, sem telemetria escondida
                </p>
              </div>

              <div className="lg:pl-8">
                <p className="font-pixel text-sm uppercase tracking-[0.2em] text-paper/50">
                  ficha técnica
                </p>
                <dl className="mt-4">
                  {SPECS.map((s) => (
                    <div
                      key={s.k}
                      className="group flex items-baseline justify-between gap-4 border-b-2 border-paper/15 py-3.5 transition-colors duration-200 hover:border-verm"
                    >
                      <dt className="font-pixel text-xs uppercase tracking-widest text-paper/50">
                        {s.k}
                      </dt>
                      <dd className="text-right font-display text-lg tracking-wide text-paper group-hover:text-verm">
                        {s.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="hazard mx-auto mt-10 max-w-4xl border-[3px] border-ink bg-parch pt-8">
            <div className="p-7">
              <p className="flex items-center gap-3 font-display text-2xl uppercase tracking-wide text-ink">
                <IconWarn className="h-7 w-7 text-verm" />
                O SmartScreen avisou? Calma.
              </p>
              <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink/75">
                O app é novo e ainda não tem <strong>code signing</strong> de distribuição no
                Windows — por isso o SmartScreen pode mostrar “aplicativo não reconhecido”. Isso
                não significa malware: o instalador só não tem reputação consolidada ainda (a
                assinatura do updater valida atualizações, mas é outra coisa). Code signing está no
                roadmap; enquanto isso, baixe sempre deste repositório oficial e revise o aviso com
                calma.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-10 text-center font-pixel text-sm text-ink/55">
            ※ use apenas em materiais próprios, licenciados ou com permissão de localização ※
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t-[6px] border-verm bg-ink pb-8 pt-16 text-paper">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a href="#topo" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center border-[3px] border-paper bg-verm text-paper">
                <IconNib className="h-6 w-6" />
              </span>
              <span className="font-display text-2xl tracking-wide">
                MANGAI<span className="text-verm">.</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm leading-relaxed text-paper/65">
              A IA traduz <strong className="text-paper">com</strong> você, não{" "}
              <strong className="text-paper">por</strong> você. Modelos erram — revise sempre antes
              de publicar.
            </p>
            <p className="mt-5 flex items-center gap-3 font-brush text-xl text-verm">
              漫画は愛 <span className="font-pixel text-xs text-paper/40">· feito com nanquim & pena G</span>
            </p>
          </div>

          <div>
            <p className="font-pixel text-xs uppercase tracking-[0.25em] text-paper/40">projeto</p>
            <ul className="mt-4 space-y-3 font-pixel text-sm">
              {[
                { href: LINKS.repo, label: "GitHub ↗" },
                { href: LINKS.v030, label: "Release v0.3.0 ↗" },
                { href: LINKS.license, label: "Licença MIT ↗" },
                { href: LINKS.issues, label: "Reportar bug ↗" },
                { href: "#roadmap", label: "Roadmap" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="link-slash text-paper/75 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-pixel text-xs uppercase tracking-[0.25em] text-paper/40">
              comunidade
            </p>
            <ul className="mt-4 space-y-3 font-pixel text-sm">
              <li>
                <a
                  href={LINKS.kofi}
                  target="_blank"
                  rel="noreferrer"
                  className="link-slash inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-kofi"
                >
                  <IconKofi className="h-4 w-4" /> Apoiar no Ko-fi ↗
                </a>
              </li>
              <li>
                <a
                  href={LINKS.issues}
                  target="_blank"
                  rel="noreferrer"
                  className="link-slash text-paper/75 transition-colors hover:text-paper"
                >
                  Sugerir recurso ↗
                </a>
              </li>
              <li>
                <a
                  href={LINKS.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="link-slash text-paper/75 transition-colors hover:text-paper"
                >
                  Dar uma ★ no repo ↗
                </a>
              </li>
            </ul>
            <p className="mt-6 border-2 border-paper/20 px-3 py-2 font-pixel text-[11px] leading-relaxed text-paper/45">
              status: beta funcional em Windows — foco em polir, validar o updater e caçar bugs de
              uso real.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-paper/15 pt-6 font-pixel text-xs text-paper/45">
          <p>© 2026 Zentsy — open source sob licença MIT</p>
          <p>
            v0.3.0 · beta · <span className="font-brush text-sm text-verm">翻訳は愛だ</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
