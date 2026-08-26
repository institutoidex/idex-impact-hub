import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, FilePlus2, Folder, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { documentosAdminQuery, pastasQuery, tabelaPastasQuery } from "@/lib/queries";
import { useApagarPasta } from "@/lib/mutations";
import { montarArvore, PASTAS_BASE, type NoPasta } from "@/lib/pastas";
import { EditorPasta } from "@/components/admin/EditorPasta";
import type { DocumentoRow, PastaRow } from "@/lib/db-types";

/**
 * Árvore de pastas do painel: cria, renomeia, move e apaga pastas e subpastas,
 * mostrando quantos documentos estão guardados em cada uma.
 */
export function GerenciadorPastas({
  aoAbrirDocumento,
}: {
  /** abre o editor de documento já dentro da pasta escolhida */
  aoAbrirDocumento: (pastaId: string) => void;
}) {
  const pastas = useQuery(pastasQuery);
  const documentos = useQuery(documentosAdminQuery);
  const tabelaOk = useQuery(tabelaPastasQuery);
  const apagar = useApagarPasta();
  // banco ainda sem a tabela: bloqueia as ações e mostra o passo que falta
  const faltaMigracao = tabelaOk.data === false;

  const [editor, setEditor] = useState<{
    aberto: boolean;
    pasta: PastaRow | null;
    paiPadrao: string | null;
  }>({ aberto: false, pasta: null, paiPadrao: null });
  const [aExcluir, setAExcluir] = useState<PastaRow | null>(null);

  const lista = pastas.data ?? [];
  const arvore = montarArvore(lista);
  const docs = documentos.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Organize os arquivos da Transparência em pastas e subpastas.
        </p>
        <Button
          className="rounded-full"
          disabled={faltaMigracao}
          onClick={() => setEditor({ aberto: true, pasta: null, paiPadrao: null })}
        >
          <FolderPlus className="size-4" /> Nova pasta
        </Button>
      </div>

      {faltaMigracao && (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
          <p className="font-display text-base">A tabela de pastas ainda não existe no banco</p>
          <p className="mt-2 text-muted-foreground">
            Por isso aparece o aviso “Could not find the table 'public.pastas'”. Para liberar a
            criação de pastas, abra o Supabase do instituto → <strong>SQL Editor</strong>, cole o
            conteúdo do arquivo <code>supabase/pastas.sql</code> do projeto e clique em{" "}
            <strong>Run</strong>. Depois recarregue esta página.
          </p>
        </div>
      )}


      {lista.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">
            Nenhuma pasta cadastrada ainda. A estrutura base sugerida é:
          </p>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {PASTAS_BASE.map((p) => (
              <li key={p.slug} className="flex items-center gap-2">
                <Folder className="size-4 text-secondary" aria-hidden /> {p.nome}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-2">
        {arvore.map((no) => (
          <ItemPasta
            key={no.id}
            no={no}
            documentos={docs}
            aoCriarSub={(paiId) => setEditor({ aberto: true, pasta: null, paiPadrao: paiId })}
            aoEditar={(p) => setEditor({ aberto: true, pasta: p, paiPadrao: null })}
            aoExcluir={setAExcluir}
            aoAbrirDocumento={aoAbrirDocumento}
          />
        ))}
      </ul>

      <EditorPasta
        aberto={editor.aberto}
        pasta={editor.pasta}
        paiPadrao={editor.paiPadrao}
        pastas={lista}
        aoFechar={() => setEditor({ aberto: false, pasta: null, paiPadrao: null })}
      />

      <AlertDialog open={Boolean(aExcluir)} onOpenChange={(v) => !v && setAExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar “{aExcluir?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              As subpastas também serão apagadas. Os documentos não são excluídos: eles voltam
              para a raiz da Transparência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              onClick={() => {
                if (aExcluir) apagar.mutate(aExcluir.id);
                setAExcluir(null);
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Linha da árvore, com recursão para as subpastas. */
function ItemPasta({
  no,
  documentos,
  aoCriarSub,
  aoEditar,
  aoExcluir,
  aoAbrirDocumento,
}: {
  no: NoPasta;
  documentos: DocumentoRow[];
  aoCriarSub: (paiId: string) => void;
  aoEditar: (pasta: PastaRow) => void;
  aoExcluir: (pasta: PastaRow) => void;
  aoAbrirDocumento: (pastaId: string) => void;
}) {
  const [aberta, setAberta] = useState(true);
  const arquivos = documentos.filter((d) => d.pasta_id === no.id);
  const temFilhas = no.filhas.length > 0;

  return (
    <li>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <button
          type="button"
          aria-label={aberta ? "Recolher" : "Expandir"}
          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          onClick={() => setAberta((v) => !v)}
        >
          {temFilhas || arquivos.length > 0 ? (
            aberta ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
        </button>
        <Folder className="size-4 text-secondary" aria-hidden />
        <span className="font-display">{no.nome}</span>
        <span className="text-xs text-muted-foreground">
          /{no.slug} · {arquivos.length} {arquivos.length === 1 ? "arquivo" : "arquivos"}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            title="Novo documento nesta pasta"
            onClick={() => aoAbrirDocumento(no.id)}
          >
            <FilePlus2 className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Nova subpasta"
            onClick={() => aoCriarSub(no.id)}
          >
            <FolderPlus className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Editar" onClick={() => aoEditar(no)}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Apagar" onClick={() => aoExcluir(no)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {aberta && (arquivos.length > 0 || temFilhas) && (
        <div className="mt-2 ml-6 space-y-2 border-l border-dashed border-border pl-4">
          {arquivos.map((d) => (
            <p key={d.id} className="text-sm text-muted-foreground">
              {d.titulo}
              {!d.publicado && " · rascunho"}
            </p>
          ))}
          <ul className="space-y-2">
            {no.filhas.map((f) => (
              <ItemPasta
                key={f.id}
                no={f}
                documentos={documentos}
                aoCriarSub={aoCriarSub}
                aoEditar={aoEditar}
                aoExcluir={aoExcluir}
                aoAbrirDocumento={aoAbrirDocumento}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
