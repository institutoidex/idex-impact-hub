import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Search } from "lucide-react";
import { documentosQuery } from "@/lib/queries";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/** Rótulos das categorias usadas nas abas de Transparência. */
const CATEGORIAS: Record<string, string> = {
  estatuto: "Estatuto",
  relatorios: "Relatórios",
  relatorio: "Relatórios",
  documentos: "Documentos",
  financeiro: "Financeiro",
  lgpd: "LGPD",
  outro: "Outros",
};

/** Acrescenta o parâmetro de download nas URLs do armazenamento. */
function urlDeDownload(url: string) {
  return url.includes("?") ? `${url}&download=` : `${url}?download=`;
}

/**
 * Busca discreta no cabeçalho: encontra documentos publicados e permite
 * abrir (indo até ele na página de Transparência) ou baixar na hora.
 */
export function BuscaDocumentos() {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const { data: documentos = [] } = useQuery({ ...documentosQuery, enabled: aberto });

  // Atalho de teclado Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Leva o visitante até o documento na página de Transparência. */
  function irAte(id: string, categoria: string) {
    setAberto(false);
    void navigate({ to: "/transparencia", search: { aba: categoria, doc: id } });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Buscar documentos"
        className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Search className="size-4" />
        <span className="hidden lg:inline">Buscar documentos</span>
        <kbd className="hidden rounded border border-border px-1.5 text-[10px] lg:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={aberto}
        onOpenChange={setAberto}
      >
        <CommandInput placeholder="Digite o nome do documento, ano ou categoria..." />
        <CommandList>
          <CommandEmpty>
            {documentos.length
              ? "Nenhum documento publicado com esse termo."
              : "Ainda não há documentos publicados."}
          </CommandEmpty>
          {documentos.length > 0 && (
          <CommandGroup heading="Documentos">
            {documentos.map((doc) => (
              <CommandItem
                key={doc.id}
                value={`${doc.titulo} ${CATEGORIAS[doc.categoria] ?? doc.categoria} ${doc.ano ?? ""}`}
                onSelect={() => irAte(doc.id, doc.categoria)}
                className="gap-3"
              >
                <FileText className="size-4 text-secondary" aria-hidden />
                <span className="flex-1">
                  <span className="block">{doc.titulo}</span>
                  <span className="block text-xs text-muted-foreground">
                    {CATEGORIAS[doc.categoria] ?? doc.categoria}
                    {doc.ano ? ` · ${doc.ano}` : ""}
                  </span>
                </span>
                {doc.arquivo_url && (
                  <a
                    href={urlDeDownload(doc.arquivo_url)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:border-primary hover:text-primary"
                  >
                    <Download className="size-3" /> Baixar
                  </a>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
