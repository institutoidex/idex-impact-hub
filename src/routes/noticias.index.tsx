import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { noticiasQuery } from "@/lib/queries";
import { anoDe, formatarData } from "@/i18n/formatar";
import { traduzir } from "@/i18n/traduzir";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { normalizarLocale } from "@/i18n/locales";
import { seoPagina } from "@/i18n/seo";
import { noticias as catalogoNoticias } from "@/i18n/catalogos/noticias";
import { comum } from "@/i18n/catalogos/comum";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import { Paginacao } from "@/components/Paginacao";
import { FiltroBotao } from "@/components/FiltroBotao";
import { FOTO_TALENTO } from "@/data/fotos";

const POR_PAGINA = 6;

/** Parâmetros de busca aceitos na URL (todos opcionais). */
type BuscaNoticias = { busca?: string; ano?: string; pagina?: number };

export const Route = createFileRoute("/noticias/")({
  // Busca e paginação ficam na URL, para poder compartilhar o link do resultado
  validateSearch: (search: Record<string, unknown>): BuscaNoticias => ({
    busca: typeof search['busca'] === "string" ? search['busca'] : "",
    ano: typeof search['ano'] === "string" ? search['ano'] : "todos",
    pagina: Number(search['pagina']) > 0 ? Number(search['pagina']) : 1,
  }),
  head: ({ match }) => {
    const m = catalogoNoticias[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/noticias",
      titulo: m.seo.titulo,
      descricao: m.seo.descricao,
    });
    return { meta: s.meta, links: s.links };
  },
  component: Noticias,
});

function Noticias() {
  const { busca = "", ano = "todos", pagina = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/noticias/" });
  const locale = useLocale();
  const m = useMensagens(catalogoNoticias);
  const mc = useMensagens(comum);

  // Somente notícias publicadas no banco — sem conteúdo fixo de reserva.
  const { data, isPending, isError, refetch } = useQuery(noticiasQuery());

  const itens = useMemo(
    () =>
      // Durante carregamento ou erro não usamos resultado antigo do cache:
      // a lista fica vazia e só a mensagem de estado aparece.
      // As traduções editoriais (jsonb) são aplicadas AQUI, antes da busca/filtro,
      // para que a busca encontre termos no idioma exibido.
      (isPending || isError ? [] : (data ?? [])).map((n0) => {
        const n = traduzir(n0, locale, ["titulo", "resumo"]);
        return {
        slug: n.slug,
        titulo: n.titulo,
        resumo: n.resumo,
        // texto original em português: a busca também o aceita
        original: `${n0.titulo} ${n0.resumo ?? ""}`,
        emPortugues: n.emPortugues,
        data: formatarData(n.publicado_em, locale),
        // ano pelo dia editorial (mesma regra das datas, sem depender do fuso)
        ano: String(anoDe(n.publicado_em)),
        imagem: n.imagem_url ?? FOTO_TALENTO.url,
        // vínculo opcional com um projeto (null = notícia geral)
        projeto: n.projeto_slug,
        };
      }),
    [data, isPending, isError, locale],
  );

  const anos = useMemo(
    () => Array.from(new Set(itens.map((n) => n.ano).filter(Boolean))).sort().reverse(),
    [itens],
  );

  // Aplica busca por texto e filtro de ano
  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    return itens.filter((n) => {
      const combinaAno = ano === "todos" || n.ano === ano;
      const combinaTexto =
        !termo || normalizar(`${n.titulo} ${n.resumo} ${n.original}`).includes(termo);
      return combinaAno && combinaTexto;
    });
  }, [itens, busca, ano]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  /** Atualiza a URL preservando os demais parâmetros. */
  function atualizar(novos: BuscaNoticias) {
    void navigate({ search: (anterior) => ({ ...anterior, pagina: 1, ...novos }) });
  }

  return (
    <>
      {/* Variante invertida: texto à direita para quebrar a cadência */}
      <PageHero variante="invertida" titulo={m.hero.titulo} descricao={m.hero.descricao}>
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {m.etiqueta}
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Busca e filtro por ano */}
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <CampoBusca
            valor={busca}
            aoMudar={(texto) => atualizar({ busca: texto })}
            placeholder={m.busca.placeholder}
            rotulo={m.busca.rotulo}
          />
          {anos.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <FiltroBotao ativo={ano === "todos"} onClick={() => atualizar({ ano: "todos" })}>
                {m.todosOsAnos}
              </FiltroBotao>
              {anos.map((a) => (
                <FiltroBotao key={a} ativo={ano === a} onClick={() => atualizar({ ano: a })}>
                  {a}
                </FiltroBotao>
              ))}
            </div>
          )}
        </Reveal>

        {/* Estados separados: carregando, erro de conexão, nenhuma publicada */}
        <div className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {isPending ? (
            <p>{m.carregando}</p>
          ) : isError ? (
            <p>
              {m.erro.texto}{" "}
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-semibold text-primary hover:underline"
              >
                {m.erro.tentarNovo}
              </button>
            </p>
          ) : itens.length === 0 ? (
            <p>{m.vazioInicial}</p>
          ) : filtradas.length === 0 ? (
            <p>{m.vazioBusca}</p>
          ) : (
            <p>{m.resultado(filtradas.length, paginaAtual, totalPaginas)}</p>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((n, i) => (
            <Reveal as="article" key={n.slug} delay={i * 80}>
              <div className="lift h-full overflow-hidden rounded-3xl border border-border bg-card">
                {/* Clique na imagem também abre a notícia */}
                <Link to="/noticias/$slug" params={{ slug: n.slug }} aria-label={n.titulo}>
                  <Imagem
                    src={n.imagem}
                    alt={n.titulo}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-[4/3] w-full bg-muted object-contain"
                  />
                </Link>
                <div className="p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {n.data}
                  </p>
                  <h2 className="mt-2 text-xl">
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: n.slug }}
                      className="hover:text-primary"
                    >
                      {n.titulo}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">{n.resumo}</p>
                  {/* aviso explícito quando falta tradução e o texto aparece em português */}
                  {n.emPortugues && (
                    <p className="mt-2 text-xs text-muted-foreground italic">{mc.emPortugues}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: n.slug }}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {m.lerNoticia}
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

        </div>

        {filtradas.length > 0 && (
        <Paginacao
          pagina={paginaAtual}
          totalPaginas={totalPaginas}
          aoMudar={(p) => atualizar({ pagina: p })}
        />
        )}
      </section>
    </>
  );
}
