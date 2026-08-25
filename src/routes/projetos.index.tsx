import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAreas, useProjetos } from "@/lib/conteudo";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { cn } from "@/lib/utils";
import talentoImg from "@/assets/talento-brasil.jpg";

export const Route = createFileRoute("/projetos/")({
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
  const [area, setArea] = useState<string>("todas");
  const [ano, setAno] = useState<string>("todos");

  const anos = useMemo(
    () => Array.from(new Set(projetos.map((p) => String(p.ano)))).sort(),
    [projetos],
  );

  // Filtra o catálogo pelos seletores de área e ano.
  const lista = projetos.filter(
    (p) => (area === "todas" || p.area === area) && (ano === "todos" || String(p.ano) === ano),
  );

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
        {/* Filtros */}
        <Reveal className="flex flex-wrap gap-8">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Área
            </p>
            <div className="flex flex-wrap gap-2">
              <FiltroBotao ativo={area === "todas"} onClick={() => setArea("todas")}>
                Todas
              </FiltroBotao>
              {areas.map((a) => (
                <FiltroBotao key={a.slug} ativo={area === a.slug} onClick={() => setArea(a.slug)}>
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
              <FiltroBotao ativo={ano === "todos"} onClick={() => setAno("todos")}>
                Todos
              </FiltroBotao>
              {anos.map((a) => (
                <FiltroBotao key={a} ativo={ano === a} onClick={() => setAno(a)}>
                  {a}
                </FiltroBotao>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Catálogo */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((p, i) => (
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

          {lista.length === 0 && (
            <p className="text-muted-foreground">
              Nenhum projeto publicado com esses filtros.
            </p>
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
      </section>
    </>
  );
}

function FiltroBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-all",
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
