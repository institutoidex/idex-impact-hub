import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { NOTICIAS } from "@/data/idex";
import { formatarData, noticiasQuery } from "@/lib/queries";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import { Paginacao } from "@/components/Paginacao";
import { FiltroBotao } from "@/components/FiltroBotao";
import talentoImg from "@/assets/talento-brasil.jpg";

const POR_PAGINA = 6;

/** Parâmetros de busca aceitos na URL (todos opcionais). */
type BuscaNoticias = { busca?: string; ano?: string; pagina?: number };

export const Route = createFileRoute("/noticias")({
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
          "Notícias do Instituto IDEX, incluindo o lançamento do projeto Talento Brasil em 26/06/2017.",
      },
      { property: "og:title", content: "Notícias — Instituto IDEX" },
      { property: "og:description", content: "Acompanhe as novidades do instituto." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  const { busca = "", ano = "todos", pagina = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/noticias" });

  // Busca no banco; se ainda não houver registros, mostra o conteúdo fixo atual.
  const { data } = useQuery(noticiasQuery());

  const itens = useMemo(
    () =>
      data && data.length > 0
        ? data.map((n) => ({
            slug: n.slug,
            titulo: n.titulo,
            resumo: n.resumo,
            data: formatarData(n.publicado_em),
            ano: String(new Date(n.publicado_em).getFullYear()),
            imagem: n.imagem_url ?? talentoImg,
          }))
        : NOTICIAS.map((n) => ({
            slug: n.slug,
            titulo: n.titulo,
            resumo: n.resumo,
            data: n.data,
            ano: (n.data.match(/\d{4}/)?.[0] ?? ""),
            imagem: talentoImg,
          })),
    [data],
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

  const vazios = Math.max(0, 3 - visiveis.length);

  return (
    <>
      <PageHero
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

        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {filtradas.length === 0
            ? "Nenhuma notícia encontrada."
            : `${filtradas.length} ${filtradas.length === 1 ? "notícia" : "notícias"} · página ${paginaAtual} de ${totalPaginas}`}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((n, i) => (
            <Reveal as="article" key={n.slug} delay={i * 80}>
              <div className="lift h-full overflow-hidden rounded-3xl border border-border bg-card">
                <img
                  src={n.imagem}
                  alt={n.titulo}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {n.data}
                  </p>
                  <h2 className="mt-2 text-xl">{n.titulo}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{n.resumo}</p>
                  <Link
                    to="/projetos/$slug"
                    params={{ slug: "talento-brasil" }}
                    className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    Ver o projeto
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}

          {Array.from({ length: vazios }).map((_, i) => (
            <Reveal as="article" key={`vazio-${i}`} delay={(i + 1) * 70}>
              <div className="flex h-full min-h-64 flex-col justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-7">
                <Placeholder>notícia em breve</Placeholder>
                <p className="mt-3 text-sm text-muted-foreground">
                  Espaço reservado para os próximos conteúdos.
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Paginacao
          pagina={paginaAtual}
          totalPaginas={totalPaginas}
          aoMudar={(p) => atualizar({ pagina: p })}
        />
      </section>
    </>
  );
}
