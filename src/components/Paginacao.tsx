import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paginação simples e acessível usada nas listagens públicas.
 * Recebe a página atual (1..total) e devolve a página escolhida.
 */
export function Paginacao({
  pagina,
  totalPaginas,
  aoMudar,
}: {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginação" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <Botao
        aria-label="Página anterior"
        disabled={pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
      >
        <ChevronLeft className="size-4" />
      </Botao>

      {paginas.map((n) => (
        <Botao
          key={n}
          aria-label={`Página ${n}`}
          aria-current={n === pagina ? "page" : undefined}
          ativo={n === pagina}
          onClick={() => aoMudar(n)}
        >
          {n}
        </Botao>
      ))}

      <Botao
        aria-label="Próxima página"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
      >
        <ChevronRight className="size-4" />
      </Botao>
    </nav>
  );
}

function Botao({
  ativo,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-10 items-center justify-center rounded-full border text-sm transition-all disabled:pointer-events-none disabled:opacity-40",
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}
