import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useProjetos } from "@/lib/conteudo";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { CampoBusca, normalizar } from "@/components/CampoBusca";
import { Paginacao } from "@/components/Paginacao";
import { FiltroBotao } from "@/components/FiltroBotao";
import { FOTO_TALENTO } from "@/data/fotos";

const POR_PAGINA = 6;

/** Parâmetros de busca aceitos na URL (todos opcionais). */
type BuscaProjetos = { busca?: string; ano?: string; pagina?: number };

export const Route = createFileRoute("/projetos/")({
  // Busca, ano e paginação vivem na URL (link compartilhável)
  validateSearch: (search: Record<string, unknown>): BuscaProjetos => ({
    busca: typeof search['busca'] === "string" ? search['busca'] : "",
    ano: typeof search['ano'] === "string" ? search['ano'] : "todos",
    pagina: Number(search['pagina']) > 0 ? Number(search['pagina']) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Projetos — Instituto IDEX" },
      {
        name: "description",
        content:
          "Projetos do Instituto IDEX, incluindo o Talento Brasil, futebol gratuito para 200 crianças e jovens.",
      },
      { property: "og:title", content: "Projetos — Instituto IDEX" },
      { property: "og:description", content: "Conheça os projetos do instituto." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProjetosIndex,
});

function ProjetosIndex() {
  const projetos = useProjetos();
  const { busca = "", ano = "todos", pagina = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/projetos/" });

  const anos = useMemo(
    () => Array.from(new Set(projetos.map((p) => String(p.ano)))).sort().reverse(),
    [projetos],
  );

  // Aplica busca por texto e filtro de ano
  const lista = useMemo(() => {
    const termo = normalizar(busca);
    return projetos.filter((p) => {
      const combinaAno = ano === "todos" || String(p.ano) === ano;
      const combinaTexto = !termo || normalizar(`${p.nome} ${p.resumo}`).includes(termo);
      return combinaAno && combinaTexto;
    });
  }, [projetos, ano, busca]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = lista.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  /** Atualiza a URL preservando os demais parâmetros (e volta para a página 1). */
  function atualizar(novos: BuscaProjetos) {
    void navigate({ search: (anterior) => ({ ...anterior, pagina: 1, ...novos }) });
  }

  const vazios = Math.max(0, 3 - visiveis.length);

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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Busca e filtro por ano */}
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <CampoBusca
            valor={busca}
            aoMudar={(texto) => atualizar({ busca: texto })}
            placeholder="Buscar por nome ou assunto"
            rotulo="Buscar projetos"
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
          {lista.length === 0
            ? "Nenhum projeto encontrado."
            : `${lista.length} ${lista.length === 1 ? "projeto" : "projetos"} · página ${paginaAtual} de ${totalPaginas}`}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p, i) => (
            <Reveal as="article" key={p.slug} delay={i * 80}>
              <div className="lift h-full overflow-hidden rounded-3xl border border-border bg-card">
                <img
                  src={p.imagem || FOTO_TALENTO.url}
                  alt={`Imagem do projeto ${p.nome}`}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {p.ano}
                  </p>
                  <h2 className="mt-2 text-xl">
                    <Link
                      to="/projetos/$slug"
                      params={{ slug: p.slug }}
                      className="hover:text-primary"
                    >
                      {p.nome}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">{p.resumo}</p>
                  <Link
                    to="/projetos/$slug"
                    params={{ slug: p.slug }}
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
