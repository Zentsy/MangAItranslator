import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "./utils/cn";

export function usePRM(): boolean {
  const [prm, setPrm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrm(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrm(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return prm;
}

export function Reveal({
  children,
  className,
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn("reveal", on && "reveal-in", className)}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const KANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボ";

function randomKana() {
  return KANA[Math.floor(Math.random() * KANA.length)];
}

/** Decodifica katakana → texto final, como um balão sendo letterado. */
export function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 42,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  const prm = usePRM();
  const [out, setOut] = useState(() =>
    text.replace(/[^ ,.·—!?]/g, () => randomKana()),
  );

  useEffect(() => {
    if (prm) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = Math.max(18, text.length * 2 + 6);
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        frame += 1;
        const revealed = Math.floor((frame / total) * text.length);
        if (revealed >= text.length) {
          setOut(text);
          if (interval) clearInterval(interval);
          return;
        }
        let s = "";
        for (let i = 0; i < text.length; i += 1) {
          const c = text[i];
          if (i < revealed || /[ ,.·—!?]/.test(c)) s += c;
          else s += randomKana();
        }
        setOut(s);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, prm, delay, speed]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
