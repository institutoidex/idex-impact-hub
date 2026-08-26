import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Download, FileText, Folder, FolderOpen } from "lucide-react";
import { useListaDocumentos, usePastas } from "@/lib/conteudo";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PlaceholderBox } from "@/components/Placeholder";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import {
  caminhoDaPasta,
  documentosDaPasta,
  montarArvore,
  PASTAS_BASE,
  type NoPasta,
} from "@/lib/pastas";

// Parâmetros da URL: pasta aberta e documento a destacar (busca do cabeçalho).
type BuscaTransparencia = { pasta?: string; doc?: string };

export const Route = createFileRoute("/transparencia")({
  validateSearch: (search: Record<string, unknown>): BuscaTransparencia => ({
    pasta: typeof search['pasta'] === "string" ? search['pasta'] : "",
    doc: typeof search['doc'] === "string" ? search['doc'] : "",
  }),
  head: () => ({
    meta: [
      { title: "Transparência — Instituto IDEX" },
      {
        name: "description",
        content:
          "Documentos, relatórios, projetos e prestação de contas do Instituto IDEX, organizados por pastas.",
      },
      { property: "og:title", content: "Transparência — Instituto IDEX" },
      { property: "og:description", content: "Documentos e prestação de contas do instituto." },
    ],
  }),
  component: Transparencia,
});

function Transparencia() {
  const pastas = usePastas();
  const documentos = useListaDocumentos();
  const { pasta: slugPasta, doc: docBuscado } = Route.useSearch();
  const navigate = useNavigate({ from: "/transparencia" });
  const [termoBusca, setTermoBusca] = useState("");

  const arvore = montarArvore(pastas);
  const pastaAtual = pastas.find((p) => p.slug === slugPasta) ?? null;
  const caminho = caminhoDaPasta(pastas, pastaAtual?.id ?? null);
  const subpastas = pastaAtual
    ? (arvore.length ? acharNo(arvore, pastaAtual.id)?.filhas ?? [] : [])
    : arvore;
  const arquivos = documentosDaPasta(documentos, pastaAtual?.id ?? null);

  // Filtra documentos pelo nome dentro do contexto atual (pasta ou todas)
  const termoNormalizado = normalizar(termoBusca);
  const documentosVisiveis = (pastaAtual ? arquivos : documentos).filter((doc) =>
    termoNormalizado ? normalizar(doc.titulo).includes(termoNormalizado) : true
  );

  // Rola até o documento vindo da busca do cabeçalho
  useEffect(() => {
    if (!docBuscado) return;
    const t = setTimeout(() => {
      document
        .getElementById(`doc-${docBuscado}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
    return () => clearTimeout(t);
  }, [docBuscado, slugPasta]);

  /** Abre uma pasta mantendo o endereço compartilhável. */
  function abrir(slug: string | null) {
    void navigate({ search: { pasta: slug ?? "", doc: "" } });
  }

  return (
    <>
      <PageHero
        titulo="Conta aberta com quem apoia"
        descricao="Os documentos do instituto ficam organizados em pastas. Clique para navegar e baixar os arquivos."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Transparência
        </span>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[280px_1fr]">
        {/* Navegação lateral: árvore completa de pastas */}
        <aside>
          <Reveal>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Pastas
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => abrir(null)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  !pastaAtual ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <FolderOpen className="size-4" aria-hidden /> Todas as pastas
              </button>

              {arvore.length > 0
                ? arvore.map((no) => (
                    <ItemArvore
                      key={no.id}
                      no={no}
                      atual={pastaAtual?.id ?? null}
                      aoAbrir={abrir}
                    />
                  ))
                : PASTAS_BASE.map((p) => (
                    <span
                      key={p.slug}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground"
                    >
                      <Folder className="size-4" aria-hidden /> {p.nome}
                    </span>
                  ))}
            </nav>
          </Reveal>
        </aside>

        {/* Conteúdo da pasta aberta */}
        <div>
          <Reveal>
            <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <button type="button" className="hover:text-primary" onClick={() => abrir(null)}>
                Transparência
              </button>
              {caminho.map((p) => (
                <span key={p.id} className="flex items-center gap-1">
                  <ChevronRight className="size-4" aria-hidden />
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={() => abrir(p.slug)}
                  >
                    {p.nome}
                  </button>
                </span>
              ))}
            </nav>
            <h2 className="mt-2 text-3xl">{pastaAtual?.nome ?? "Todos os documentos"}</h2>
          </Reveal>

          {/* Subpastas */}
          {subpastas.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {subpastas.map((sub, i) => (
                <Reveal key={sub.id} delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => abrir(sub.slug)}
                    className="lift flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-muted">
                      <Folder className="size-5 text-secondary" aria-hidden />
                    </span>
                    <span className="font-display">{sub.nome}</span>
                  </button>
                </Reveal>
              ))}
            </div>
          )}

          {/* Arquivos da pasta */}
          <div className="mt-6 space-y-4">
            {(pastaAtual ? arquivos : documentos).map((doc) => (
              <a
                key={doc.id}
                id={`doc-${doc.id}`}
                href={doc.arquivo_url ?? "#"}
                target={doc.arquivo_url ? "_blank" : undefined}
                rel="noreferrer"
                className={`lift flex items-center gap-4 rounded-2xl border bg-card p-5 ${
                  docBuscado === doc.id ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-muted">
                  <FileText className="size-5 text-secondary" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-display">{doc.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.ano ? `Ano ${doc.ano}` : "Documento publicado"}
                  </p>
                </div>
                {doc.arquivo_url && (
                  <Download className="ml-auto size-5 text-muted-foreground" aria-hidden />
                )}
              </a>
            ))}

            {(pastaAtual ? arquivos : documentos).length === 0 && (
              <PlaceholderBox
                titulo="Pasta ainda sem arquivos"
                nota="Os PDFs oficiais entram aqui quando enviados pelo painel."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/** Item recursivo da árvore lateral. */
function ItemArvore({
  no,
  atual,
  aoAbrir,
}: {
  no: NoPasta;
  atual: string | null;
  aoAbrir: (slug: string) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => aoAbrir(no.slug)}
        style={{ paddingLeft: `${12 + no.nivel * 14}px` }}
        className={`flex w-full items-center gap-2 rounded-xl py-2 pr-3 text-left text-sm transition-colors ${
          atual === no.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
        }`}
      >
        <Folder className="size-4 shrink-0" aria-hidden /> {no.nome}
      </button>
      {no.filhas.map((f) => (
        <ItemArvore key={f.id} no={f} atual={atual} aoAbrir={aoAbrir} />
      ))}
    </div>
  );
}

/** Encontra um nó da árvore pelo id. */
function acharNo(nos: NoPasta[], id: string): NoPasta | undefined {
  for (const no of nos) {
    if (no.id === id) return no;
    const achado = acharNo(no.filhas, id);
    if (achado) return achado;
  }
  return undefined;
}
