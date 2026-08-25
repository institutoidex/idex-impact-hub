import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Contador numérico que anima de 0 até o valor final quando entra na tela.
 * Renderiza o valor final no SSR (sem JS o número aparece correto).
 */
export function Counter({
  valor,
  sufixo = "",
  prefixo = "",
  className,
  duracao = 1600,
}: {
  valor: number;
  sufixo?: string;
  prefixo?: string;
  className?: string;
  duracao?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        const alvo = { n: 0 };
        animate(alvo, {
          n: valor,
          duration: duracao,
          ease: "outExpo",
          onUpdate: () => {
            el.textContent = `${prefixo}${Math.round(alvo.n).toLocaleString("pt-BR")}${sufixo}`;
          },
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [valor, duracao, prefixo, sufixo]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefixo}
      {valor.toLocaleString("pt-BR")}
      {sufixo}
    </span>
  );
}
