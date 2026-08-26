import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Revela o conteúdo com uma transição discreta quando ele entra na viewport.
 * A animação é 100% CSS (utilitários reveal/reveal-in do styles.css);
 * o JS apenas observa o scroll e liga a classe — sem depender de biblioteca
 * de animação para o conteúdo aparecer.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Movimento reduzido: mostra direto, sem animar
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("reveal-in");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        // Atraso aplicado na transição CSS definida pelo utilitário reveal
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("reveal-in");
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref as never} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}
