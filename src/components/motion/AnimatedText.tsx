import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Título animado palavra a palavra em CSS puro.
 * A animação começa no primeiro paint (não espera o JavaScript hidratar),
 * então o texto nunca fica invisível aguardando o bundle carregar.
 * O texto original permanece acessível para leitores de tela e SSR.
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
  // As linhas são separadas por "\n" para preservar a quebra desejada
  const linhas = text.split("\n");
  let indice = 0; // índice global da palavra — alimenta a cascata de atrasos (--i)

  return (
    <Tag
      className={cn("anim-texto", className)}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {linhas.map((linha, li) => {
        const palavras = linha.split(" ");
        return (
          <span key={li} className="block">
            {palavras.map((palavra, pi) => {
              const i = indice++;
              return (
                <span key={pi} className="inline-block">
                  <span
                    data-palavra
                    className="inline-block will-change-transform"
                    style={{ "--i": i } as CSSProperties}
                  >
                    {palavra}
                    {pi < palavras.length - 1 ? "\u00A0" : ""}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
