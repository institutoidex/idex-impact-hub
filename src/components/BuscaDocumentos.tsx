import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Search } from "lucide-react";
import { documentosQuery } from "@/lib/queries";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { busca } from "@/i18n/catalogos/busca";
import { traduzir } from "@/i18n/traduzir";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Rótulos das categorias agora vêm do catálogo `busca.categorias` (ver uso abaixo).

/** Acrescenta o parâmetro de download nas URLs do armazenamento. */
function urlDeDownload(url: string) {
  return url.includes("?") ? `${url}&download=` : `${url}?download=`;
}

/**
 * Busca discreta no cabeçalho: encontra documentos publicados e permite
 * abrir (indo até ele na página de Transparência) ou baixar na hora.
 */
export function BuscaDocumentos({ expandida = false }: { expandida?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const locale = useLocale();
  const t = useMensagens(busca);
  const { data: documentos = [] } = useQuery({ ...documentosQuery, enabled: aberto });
  const categorias: Record<string, string> = {
    estatuto: t.categorias.estatuto,
    relatorios: t.categorias.relatorios,
    relatorio: t.categorias.relatorios,
    documentos: t.categorias.documentos,
    financeiro: t.categorias.financeiro,
    lgpd: t.categorias.lgpd,
    outro: t.categorias.outro,
  };

  // Atalho de teclado Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // o preenchimento automático do navegador dispara keydown sem "key"
      if (e.key?.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
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
    void navigate({ to: "/transparencia", search: { pasta: "", doc: id } });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setAberto(true)}
        aria-label={t.buscarDocumentos}
        className={cn(
          "rounded-full bg-card/60 text-muted-foreground shadow-none hover:border-primary hover:bg-accent hover:text-primary",
          expandida && "h-11 w-full justify-start rounded-md px-4",
        )}
      >
        <Search className="size-4" />
        <span className={cn("hidden min-[1440px]:inline", expandida && "inline")}>
          {t.buscarDocumentos}
        </span>
        {/* Atalho de teclado só em telas bem largas, para não apertar o cabeçalho */}
        <kbd
          className={cn(
            "hidden rounded border border-border px-1.5 text-[10px] min-[1536px]:inline",
            expandida && "ml-auto sm:inline",
          )}
        >
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog
        open={aberto}
        onOpenChange={setAberto}
      >
        <CommandInput placeholder={t.digiteParaBuscar} />
        <CommandList>
          <CommandEmpty>
            {documentos.length ? t.nenhumComTermo : t.nenhumPublicado}
          </CommandEmpty>
          {documentos.length > 0 && (
          <CommandGroup heading={t.documentos}>
            {documentos.map((doc) => {
              const docTraduzido = traduzir(doc, locale, ["titulo"]);
              return (
                <CommandItem
                  key={doc.id}
                  value={`${docTraduzido.titulo} ${doc.titulo} ${categorias[doc.categoria] ?? doc.categoria} ${doc.ano ?? ""}`}
                  onSelect={() => irAte(doc.id, doc.categoria)}
                  className="gap-3"
                >
                  <FileText className="size-4 text-secondary" aria-hidden />
                  <span className="flex-1">
                    <span className="block">{docTraduzido.titulo}</span>
                    <span className="block text-xs text-muted-foreground">
                      {categorias[doc.categoria] ?? doc.categoria}
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
                      <Download className="size-3" /> {t.baixar}
                    </a>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
