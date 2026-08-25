import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Título animado palavra a palavra com Anime.js.
 * O texto original permanece acessível para leitores de tela e SSR:
 * as palavras já são renderizadas no HTML, a animação só ajusta a entrada.
 */
export function AnimatedText({
  text,
  className,
  as: Tag = "h1",
  delay = 100,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respeita quem prefere menos movimento
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const palavras = el.querySelectorAll<HTMLElement>("[data-palavra]");
    animate(palavras, {
      opacity: [0, 1],
      y: [{ from: "0.6em" }],
      rotate: [{ from: "3deg" }],
      duration: 800,
      delay: stagger(60, { start: delay }),
      ease: "outExpo",
    });
  }, [delay, text]);

  // As linhas são separadas por "\n" para preservar a quebra desejada
  const linhas = text.split("\n");

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {linhas.map((linha, li) => (
        <span key={li} className="block">
          {linha.split(" ").map((palavra, pi) => (
            <span key={pi} className="inline-block overflow-hidden align-bottom">
              <span data-palavra className="inline-block will-change-transform">
                {palavra}
                {pi < linha.split(" ").length - 1 ? "\u00A0" : ""}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
