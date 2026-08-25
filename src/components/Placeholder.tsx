import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Marcador visual explícito de conteúdo ainda não fornecido. */
export function Placeholder({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("placeholder-note", className)}>{children}</span>;
}

/** Bloco maior de conteúdo pendente (documento, logo, foto de equipe...). */
export function PlaceholderBox({
  titulo,
  nota,
  className,
}: {
  titulo: string;
  nota?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary/40 bg-muted/60 p-6 text-center",
        className,
      )}
    >
      <p className="font-display text-base">{titulo}</p>
      {nota && <p className="text-sm text-muted-foreground">{nota}</p>}
    </div>
  );
}
