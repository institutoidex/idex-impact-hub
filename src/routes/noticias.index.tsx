import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatarData, noticiasQuery } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";
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
  head: () => ({
    meta: [
      { title: "Notícias — Instituto IDEX" },
      {
        name: "description",
        content:
          "Notícias e novidades publicadas pelo Instituto IDEX.",
      },
      { property: "og:title", content: "Notícias — Instituto IDEX" },
      { property: "og:description", content: "Acompanhe as novidades do instituto." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/noticias` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/noticias` }],
  }),
  component: Noticias,
});

function Noticias() {
  const { busca = "", ano = "todos", pagina = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/noticias/" });

  // Somente notícias publicadas no banco — sem conteúdo fixo de reserva.
  const { data, isPending, isError, refetch } = useQuery(noticiasQuery());

  const itens = useMemo(
    () =>
      // Durante carregamento ou erro não usamos resultado antigo do cache:
      // a lista fica vazia e só a mensagem de estado aparece.
      (isPending || isError ? [] : (data ?? [])).map((n) => ({
        slug: n.slug,
        titulo: n.titulo,
        resumo: n.resumo,
        data: formatarData(n.publicado_em),
        ano: String(new Date(n.publicado_em).getFullYear()),
        imagem: n.imagem_url ?? FOTO_TALENTO.url,
        // vínculo opcional com um projeto (null = notícia geral)
        projeto: n.projeto_slug,
      })),
    [data, isPending, isError],
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
        !termo || normalizar(`${n.titulo} ${n.resumo}`).includes(termo);
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
      <PageHero
        variante="invertida"
        titulo="O que anda acontecendo"
        descricao="Registros das ações e anúncios do instituto."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Notícias
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Busca e filtro por ano */}
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <CampoBusca
            valor={busca}
            aoMudar={(texto) => atualizar({ busca: texto })}
            placeholder="Buscar por título ou assunto"
            rotulo="Buscar notícias"
          />
          {anos.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <FiltroBotao ativo={ano === "todos"} onClick={() => atualizar({ ano: "todos" })}>
                Todos os anos
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
            <p>Carregando notícias...</p>
          ) : isError ? (
            <p>
              Não foi possível carregar as notícias agora.{" "}
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-semibold text-primary hover:underline"
              >
                Tentar de novo
              </button>
            </p>
          ) : itens.length === 0 ? (
            <p>Ainda não há notícias publicadas. Volte em breve.</p>
          ) : filtradas.length === 0 ? (
            <p>Nenhuma notícia encontrada para essa busca.</p>
          ) : (
            <p>{`${filtradas.length} ${filtradas.length === 1 ? "notícia" : "notícias"} · página ${paginaAtual} de ${totalPaginas}`}</p>
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
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: n.slug }}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Ler a notícia
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
