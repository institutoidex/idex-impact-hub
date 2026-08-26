import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAreas, useProjetos } from "@/lib/conteudo";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import { Paginacao } from "@/components/Paginacao";
import { FiltroBotao } from "@/components/FiltroBotao";
import talentoImg from "@/assets/talento-brasil.jpg";

const POR_PAGINA = 6;

export const Route = createFileRoute("/projetos/")({
  // Filtros, busca e paginação vivem na URL (link compartilhável)
  validateSearch: (search: Record<string, unknown>) => ({
    busca: typeof search['busca'] === "string" ? search['busca'] : "",
    area: typeof search['area'] === "string" ? search['area'] : "todas",
    ano: typeof search['ano'] === "string" ? search['ano'] : "todos",
    pagina: Number(search['pagina']) > 0 ? Number(search['pagina']) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Projetos — Instituto IDEX" },
      {
        name: "description",
        content:
          "Catálogo de projetos do Instituto IDEX, incluindo o Talento Brasil, futebol gratuito para 200 crianças e jovens.",
      },
      { property: "og:title", content: "Projetos — Instituto IDEX" },
      { property: "og:description", content: "Filtre os projetos do instituto por área e por ano." },
    ],
  }),
  component: ProjetosIndex,
});

function ProjetosIndex() {
  const areas = useAreas();
  const projetos = useProjetos();
  const { busca, area, ano, pagina } = Route.useSearch();
  const navigate = useNavigate({ from: "/projetos" });

  const anos = useMemo(
    () => Array.from(new Set(projetos.map((p) => String(p.ano)))).sort().reverse(),
    [projetos],
  );

  // Filtra o catálogo por área, ano e texto livre
  const lista = useMemo(() => {
    const termo = normalizar(busca);
    return projetos.filter((p) => {
      const combinaArea = area === "todas" || p.area === area;
      const combinaAno = ano === "todos" || String(p.ano) === ano;
      const combinaTexto =
        !termo ||
        normalizar(`${p.nome} ${p.resumo} ${p.local ?? ""} ${p.parceria ?? ""}`).includes(termo);
      return combinaArea && combinaAno && combinaTexto;
    });
  }, [projetos, area, ano, busca]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = lista.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  /** Atualiza a URL preservando os demais parâmetros (e volta para a página 1). */
  function atualizar(
    novos: Partial<{ busca: string; area: string; ano: string; pagina: number }>,
  ) {
    void navigate({ search: (anterior) => ({ ...anterior, pagina: 1, ...novos }) });
  }

  const temFiltro = busca !== "" || area !== "todas" || ano !== "todos";

  return (
    <>
      <PageHero
        titulo="Projetos que acontecem no campo, não no papel"
        descricao="Hoje temos um projeto ativo publicado. Novos projetos entram nesta lista conforme forem lançados."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Projetos
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* Busca */}
        <Reveal>
          <CampoBusca
            valor={busca}
            aoMudar={(texto) => atualizar({ busca: texto })}
            placeholder="Buscar por nome, local ou parceiro"
            rotulo="Buscar projetos"
          />
        </Reveal>

        {/* Filtros */}
        <Reveal className="mt-8 flex flex-wrap gap-8">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Área
            </p>
            <div className="flex flex-wrap gap-2">
              <FiltroBotao ativo={area === "todas"} onClick={() => atualizar({ area: "todas" })}>
                Todas
              </FiltroBotao>
              {areas.map((a) => (
                <FiltroBotao
                  key={a.slug}
                  ativo={area === a.slug}
                  onClick={() => atualizar({ area: a.slug })}
                >
                  {a.nome}
                </FiltroBotao>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Ano
            </p>
            <div className="flex flex-wrap gap-2">
              <FiltroBotao ativo={ano === "todos"} onClick={() => atualizar({ ano: "todos" })}>
                Todos
              </FiltroBotao>
              {anos.map((a) => (
                <FiltroBotao key={a} ativo={ano === a} onClick={() => atualizar({ ano: a })}>
                  {a}
                </FiltroBotao>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {lista.length === 0
              ? "Nenhum projeto encontrado."
              : `${lista.length} ${lista.length === 1 ? "projeto" : "projetos"} · página ${paginaAtual} de ${totalPaginas}`}
          </p>
          {temFiltro && (
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={() => atualizar({ busca: "", area: "todas", ano: "todos" })}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Catálogo */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p, i) => (
            <Reveal as="article" key={p.slug} delay={i * 80}>
              <Link
                to="/projetos/$slug"
                params={{ slug: p.slug }}
                className="lift block h-full overflow-hidden rounded-3xl border border-border bg-card"
              >
                <img
                  src={talentoImg}
                  alt={`Imagem do projeto ${p.nome}`}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {areas.find((a) => a.slug === p.area)?.nome} · {p.ano}
                  </p>
                  <h2 className="mt-2 text-xl">{p.nome}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{p.resumo}</p>
                </div>
              </Link>
            </Reveal>
          ))}

          {visiveis.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
                <p className="text-muted-foreground">
                  Nenhum projeto publicado com esses filtros.
                </p>
              </div>
            </div>
          )}

          {[0, 1].map((i) => (
            <Reveal key={i} delay={(i + 1) * 100}>
              <div className="flex h-full min-h-56 flex-col justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-7">
                <Placeholder>novo projeto em breve</Placeholder>
                <p className="mt-3 text-sm text-muted-foreground">
                  Espaço reservado para os próximos projetos do instituto.
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
