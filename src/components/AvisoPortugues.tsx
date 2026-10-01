// Avisos de fallback: conteúdo do banco sem tradução aparece em português,
// e o visitante precisa saber disso de forma explícita.
import { useMensagens } from "@/i18n/mensagens";
import { comum } from "@/i18n/catalogos/comum";
import { cn } from "@/lib/utils";

/** Linha de aviso (cartões e páginas de detalhe). */
export function AvisoPortugues({ className }: { className?: string }) {
  const mc = useMensagens(comum);
  return <p className={cn("text-xs text-muted-foreground italic", className)}>{mc.emPortugues}</p>;
}

/** Selo curto "PT" para espaços apertados (árvore de pastas, menus, busca). */
export function MarcaPortugues() {
  const mc = useMensagens(comum);
  return (
    <abbr
      title={mc.emPortugues}
      className="ml-1 shrink-0 rounded border border-border px-1 text-[10px] font-semibold text-muted-foreground no-underline"
    >
      PT<span className="sr-only"> — {mc.emPortugues}</span>
    </abbr>
  );
}
