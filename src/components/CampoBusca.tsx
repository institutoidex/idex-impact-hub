import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Campo de busca com ícone e botão de limpar, usado nas listagens públicas. */
export function CampoBusca({
  valor,
  aoMudar,
  placeholder = "Buscar...",
  rotulo = "Buscar",
}: {
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder?: string;
  rotulo?: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={rotulo}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-11 rounded-full pr-10 pl-11"
      />
      {valor && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => aoMudar("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Normaliza texto (minúsculo, sem acento) para comparação de busca. */
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
