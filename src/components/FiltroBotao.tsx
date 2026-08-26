import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Botão-pílula usado nos filtros das listagens públicas. */
export function FiltroBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-all",
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
