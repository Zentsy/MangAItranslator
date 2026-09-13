import { useEffect, useState } from "react";
import { LINKS } from "../data";
import { IconNib, IconWindows } from "../icons";
import { cn } from "../utils/cn";

const NAV = [
  { href: "#recursos", label: "Recursos" },
  { href: "#fluxo", label: "Fluxo" },
  { href: "#motores", label: "Motores" },
  { href: "#por-dentro", label: "Por dentro" },
  { href: "#roadmap", label: "Roadmap" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (y / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-ink text-paper transition-shadow duration-300",
        scrolled ? "shadow-[0_4px_0_var(--color-verm)]" : "shadow-[0_3px_0_var(--color-ink3)]",
      )}
    >
      <div
        className="absolute left-0 top-0 h-[3px] bg-verm transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
        <a href="#topo" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border-[3px] border-paper bg-verm text-paper transition-transform duration-300 group-hover:-rotate-12">
            <IconNib className="h-6 w-6" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl tracking-wide">
              MANGAI<span className="text-verm">.</span>
            </span>
            <span className="block font-pixel text-[10px] text-paper/60">
              トランスレーター v0.3.0
            </span>
          </span>
        </a>

        <div className="ml-8 hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="link-slash font-pixel text-sm uppercase tracking-widest text-paper/80 transition-colors hover:text-paper"
            >
              {n.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden border-2 border-paper/30 px-2 py-1 font-pixel text-xs text-paper/70 sm:block">
            v0.3.0 · beta
          </span>
          <a
            href={LINKS.latest}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 border-[3px] border-paper bg-verm px-4 py-2 font-display text-sm tracking-wider text-paper shadow-[4px_4px_0_var(--color-paper)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-verm2 active:translate-y-0 active:shadow-none"
          >
            <IconWindows className="h-4 w-4" />
            BAIXAR
          </a>
        </div>
      </nav>
    </header>
  );
}
