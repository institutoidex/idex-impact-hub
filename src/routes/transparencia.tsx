import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  HelpCircle,
  Landmark,
  Network,
  ShoppingCart,
  SlidersHorizontal,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useListaDocumentos, usePastas } from "@/lib/conteudo";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PlaceholderBox } from "@/components/Placeholder";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import { cn } from "@/lib/utils";
import {
  caminhoDaPasta,
  documentosDaPasta,
  idsDescendentes,
  montarArvore,
  pastasBasePorLocale,
  type NoPasta,
} from "@/lib/pastas";
import { normalizarLocale } from "@/i18n/locales";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { seoPagina } from "@/i18n/seo";
import { transparencia as catalogoTransparencia } from "@/i18n/catalogos/transparencia";

// Parâmetros da URL: pasta aberta e documento a destacar (busca do cabeçalho).
type BuscaTransparencia = { pasta?: string; doc?: string };

export const Route = createFileRoute("/transparencia")({
  validateSearch: (search: Record<string, unknown>): BuscaTransparencia => ({
    pasta: typeof search['pasta'] === "string" ? search['pasta'] : "",
    doc: typeof search['doc'] === "string" ? search['doc'] : "",
  }),
  head: ({ match }) => {
    const t = catalogoTransparencia[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/transparencia",
      titulo: t.seo.titulo,
      descricao: t.seo.descricao,
    });
    return {
      meta: [...s.meta, { property: "og:description", content: t.seo.ogDescricao }],
      links: s.links,
    };
  },
  component: Transparencia,
});

/**
 * Escolhe um ícone coerente com o assunto da pasta (sem inventar dados).
 * Usa o slug (sempre em português) para o ícone não mudar com o idioma.
 */
function iconeDaPasta(slug: string): LucideIcon {
  const n = normalizar(slug);
  if (n.includes("relator")) return BarChart3;
  if (n.includes("emenda")) return Landmark;
  if (n.includes("organograma")) return Network;
  if (n.includes("pergunta") || n.includes("faq")) return HelpCircle;
  if (n.includes("compra") || n.includes("licita")) return ShoppingCart;
  if (n.includes("projeto")) return Trophy;
  return Folder;
}

function Transparencia() {
  const t = useMensagens(catalogoTransparencia);
  const locale = useLocale();
  const pastas = usePastas();
  const documentos = useListaDocumentos();
  const { pasta: slugPasta, doc: docBuscado } = Route.useSearch();
  const navigate = useNavigate({ from: "/transparencia" });
  const [termoBusca, setTermoBusca] = useState("");
  // No celular a árvore de pastas vira um menu retrátil
  const [menuAberto, setMenuAberto] = useState(false);

  const arvore = montarArvore(pastas);
  const pastaAtual = pastas.find((p) => p.slug === slugPasta) ?? null;
  const caminho = caminhoDaPasta(pastas, pastaAtual?.id ?? null);
  const subpastas = pastaAtual
    ? (arvore.length ? (acharNo(arvore, pastaAtual.id)?.filhas ?? []) : [])
    : arvore;
  const arquivos = documentosDaPasta(documentos, pastaAtual?.id ?? null);
  const pastasBase = pastasBasePorLocale(locale);

  /** Contagem de documentos por pasta, já somando as subpastas. */
  const contagem = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of pastas) {
      const ids = new Set(idsDescendentes(pastas, p.id));
      mapa.set(p.id, documentos.filter((d) => d.pasta_id && ids.has(d.pasta_id)).length);
    }
    return mapa;
  }, [pastas, documentos]);

  // Filtra documentos pelo nome dentro do contexto atual (pasta ou todas)
  const termoNormalizado = normalizar(termoBusca);
  const documentosVisiveis = (pastaAtual ? arquivos : documentos).filter((doc) =>
    termoNormalizado ? normalizar(doc.titulo).includes(termoNormalizado) : true,
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
    setMenuAberto(false);
    void navigate({ search: { pasta: slug ?? "", doc: "" } });
  }

  return (
    <>
      {/* Variante editorial: sóbria, combinando com a página de documentos */}
      <PageHero variante="editorial" titulo={t.hero.titulo} descricao={t.hero.descricao}>
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.etiqueta}
        </span>
      </PageHero>

      {/* Busca em destaque, logo abaixo do herói: caminho mais rápido até o arquivo */}
      <section className="border-b border-border bg-sand pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
              <span className="absolute inset-x-0 top-0 h-1 bg-brand-green" aria-hidden />
              <h2 className="font-display text-2xl sm:text-3xl">
                {pastaAtual ? t.buscarEm(pastaAtual.nome) : t.buscarEmTodas}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pastaAtual ? t.buscaConsideraPasta : t.buscaConsideraTodas(documentos.length)}
              </p>
              <div className="mt-5 [&>div]:max-w-none">
                <CampoBusca
                  valor={termoBusca}
                  aoMudar={setTermoBusca}
                  placeholder={t.buscaPlaceholder}
                  rotulo={t.buscaRotulo}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[300px_1fr]">
        {/* Navegação de pastas: menu retrátil no celular, coluna fixa no desktop */}
        <aside>
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4 text-primary" aria-hidden />
            {pastaAtual ? pastaAtual.nome : t.todasAsPastas}
            <ChevronDown
              className={cn("ml-auto size-4 transition-transform", menuAberto && "rotate-180")}
              aria-hidden
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 lg:max-h-none lg:overflow-visible",
              menuAberto ? "max-h-[70vh] overflow-y-auto" : "max-h-0 lg:max-h-none",
            )}
          >
            <div className="mt-3 lg:mt-0 lg:sticky lg:top-24">
              <p className="mb-3 hidden text-xs font-semibold tracking-widest text-muted-foreground uppercase lg:block">
                {t.pastasRotulo}
              </p>
              <nav className="space-y-1 rounded-2xl border border-border bg-card p-2 lg:border-0 lg:bg-transparent lg:p-0">
                <button
                  type="button"
                  onClick={() => abrir(null)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    !pastaAtual
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted",
                  )}
                >
                  <FolderOpen className="size-4" aria-hidden /> {t.todasAsPastas}
                  <span className="ml-auto text-xs opacity-80">{documentos.length}</span>
                </button>

                {arvore.length > 0
                  ? arvore.map((no) => (
                      <ItemArvore
                        key={no.id}
                        no={no}
                        atual={pastaAtual?.id ?? null}
                        caminhoIds={caminho.map((c) => c.id)}
                        contagem={contagem}
                        aoAbrir={abrir}
                        t={t}
                      />
                    ))
                  : pastasBase.map((p) => (
                      <span
                        key={p.slug}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground"
                      >
                        <Folder className="size-4" aria-hidden /> {p.nome}
                      </span>
                    ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Conteúdo da pasta aberta */}
        <div>
          <Reveal>
            <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <button type="button" className="hover:text-primary" onClick={() => abrir(null)}>
                {t.etiqueta}
              </button>
              {caminho.map((p) => (
                <span key={p.id} className="flex items-center gap-1">
                  <ChevronRight className="size-4" aria-hidden />
                  <button
                    type="button"
                    className="font-medium text-foreground hover:text-primary"
                    onClick={() => abrir(p.slug)}
                  >
                    {p.nome}
                  </button>
                </span>
              ))}
            </nav>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <h2 className="font-display text-3xl">
                {pastaAtual?.nome ?? t.todosOsDocumentos}
              </h2>
              <span className="text-sm text-muted-foreground">
                {t.arquivos(documentosVisiveis.length)}
              </span>
            </div>
            <div className="mt-3 h-1 w-16 bg-brand-green" aria-hidden />
          </Reveal>

          {/* Subpastas: cards com ícone por assunto e tamanhos alternados */}
          {subpastas.length > 0 && !termoNormalizado && (
            <div className="mt-8 grid gap-4 sm:grid-cols-6">
              {subpastas.map((sub, i) => {
                const Icone = iconeDaPasta(sub.slug);
                // Alterna cards largos e estreitos para quebrar o ritmo do grid
                const largo = i % 3 === 0;
                const total = contagem.get(sub.id) ?? 0;
                return (
                  <Reveal
                    key={sub.id}
                    delay={i * 60}
                    className={largo ? "sm:col-span-4" : "sm:col-span-2"}
                  >
                    <button
                      type="button"
                      onClick={() => abrir(sub.slug)}
                      className="lift group relative flex h-full w-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left"
                    >
                      <span
                        className="absolute inset-y-0 left-0 w-1 bg-brand-green opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                        <Icone className="size-5 text-primary" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="font-display block truncate">{sub.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {t.documentos(total)}
                        </span>
                      </span>
                      <ChevronRight
                        className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* Arquivos da pasta */}
          <div className="mt-8 space-y-3">
            {documentosVisiveis.map((doc, i) => (
              <Reveal key={doc.id} delay={Math.min(i, 6) * 40}>
                <div
                  id={`doc-${doc.id}`}
                  className={cn(
                    "lift group relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border bg-card p-5",
                    docBuscado === doc.id ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-secondary/70 transition-colors group-hover:bg-brand-green"
                    aria-hidden
                  />
                  <span className="ml-1 grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                    <FileText className="size-5 text-secondary" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate">{doc.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.ano ? t.ano(doc.ano) : t.documentoPublicado}
                    </p>
                  </div>
                  {doc.arquivo_url &&
                    (() => {
                      // Monta a URL mascarada: o arquivo passa pelo próprio site,
                      // sem expor o endereço real do armazenamento
                      const caminho = doc.arquivo_url!.split("/midia/")[1];
                      if (!caminho) return null;
                      const urlVisualizar = `/api/public/documentos/${caminho}`;
                      const nomeArquivo = caminho.split("/").pop() ?? "arquivo";
                      const urlBaixar = `${urlVisualizar}?download=1&nome=${encodeURIComponent(nomeArquivo)}`;
                      return (
                        // Duas ações: abrir para ver na hora ou baixar o arquivo
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                          <a
                            href={urlVisualizar}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                          >
                            <Eye className="size-3.5" aria-hidden /> {t.visualizar}
                          </a>
                          <a
                            href={urlBaixar}
                            download={nomeArquivo}
                            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            <Download className="size-3.5" aria-hidden /> {t.baixar}
                          </a>
                        </div>
                      );
                    })()}
                </div>
              </Reveal>
            ))}

            {documentosVisiveis.length === 0 && (
              <PlaceholderBox
                titulo={termoNormalizado ? t.vazioComBusca.titulo : t.vazioSemArquivos.titulo}
                nota={termoNormalizado ? t.vazioComBusca.nota : t.vazioSemArquivos.nota}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/** Item recursivo da árvore lateral, com contagem e recolher/expandir. */
function ItemArvore({
  no,
  atual,
  caminhoIds,
  contagem,
  aoAbrir,
  t,
}: {
  no: NoPasta;
  atual: string | null;
  caminhoIds: string[];
  contagem: Map<string, number>;
  aoAbrir: (slug: string) => void;
  t: ReturnType<typeof useMensagens<typeof catalogoTransparencia["pt-BR"]>>;
}) {
  const ativo = atual === no.id;
  const noCaminho = caminhoIds.includes(no.id);
  // Pastas com muitos filhos começam recolhidas, a menos que estejam no caminho ativo
  const [aberto, setAberto] = useState(noCaminho || no.filhas.length <= 4);
  const Icone = iconeDaPasta(no.slug);
  const total = contagem.get(no.id) ?? 0;

  useEffect(() => {
    if (noCaminho) setAberto(true);
  }, [noCaminho]);

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl transition-colors",
          ativo
            ? "bg-primary text-primary-foreground"
            : noCaminho
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted",
        )}
        style={{ paddingLeft: `${no.nivel * 12}px` }}
      >
        {no.filhas.length > 0 ? (
          <button
            type="button"
            aria-label={aberto ? t.recolherPasta(no.nome) : t.expandirPasta(no.nome)}
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
            className="grid size-7 shrink-0 place-items-center rounded-md"
          >
            <ChevronRight
              className={cn("size-4 transition-transform", aberto && "rotate-90")}
              aria-hidden
            />
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => aoAbrir(no.slug)}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-left text-sm",
            ativo && "font-semibold",
          )}
        >
          <Icone className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{no.nome}</span>
          <span className={cn("ml-auto text-xs", ativo ? "opacity-80" : "text-muted-foreground")}>
            {total}
          </span>
        </button>
      </div>
      {aberto && no.filhas.map((f) => (
        <ItemArvore
          key={f.id}
          no={f}
          atual={atual}
          caminhoIds={caminhoIds}
          contagem={contagem}
          aoAbrir={aoAbrir}
          t={t}
        />
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
