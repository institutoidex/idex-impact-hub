import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Revela o conteúdo com uma animação discreta quando ele entra na viewport.
 * Usa IntersectionObserver + Anime.js e degrada bem no SSR:
 * sem JS (ou com "prefers-reduced-motion") o conteúdo aparece normalmente.
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
        el.classList.add("reveal-in");
        animate(el, {
          opacity: [0, 1],
          y: [24, 0],
          filter: ["blur(6px)", "blur(0px)"],
          duration: 750,
          delay,
          ease: "outQuint",
        });
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
