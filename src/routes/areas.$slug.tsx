import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AREAS, type AreaSlug } from "@/data/idex";
import { useAreas, useProjetos } from "@/lib/conteudo";
import { AreaIcon } from "@/components/AreaIcon";
import { Reveal } from "@/components/Reveal";
import { Placeholder, PlaceholderBox } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";

// Template reutilizado pelas seis áreas de atuação.
export const Route = createFileRoute("/areas/$slug")({
  loader: ({ params }) => {
    const area = AREAS.find((a) => a.slug === (params.slug as AreaSlug));
    if (!area) throw notFound();
    return { area };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Área não encontrada — Instituto IDEX" }, { name: "robots", content: "noindex" }] };
    }
    const { area } = loaderData;
    return {
      meta: [
        { title: `${area.nome} — Áreas de Atuação | Instituto IDEX` },
        { name: "description", content: `${area.nome}: ${area.resumo}. Frente de atuação do Instituto IDEX.` },
        { property: "og:title", content: `${area.nome} — Instituto IDEX` },
        { property: "og:description", content: area.resumo },
      ],
    };
  },
  component: AreaDetalhe,
});

function AreaDetalhe() {
  const { area: areaEstatica } = Route.useLoaderData();
  // Conteúdo do banco sobrescreve o estático quando existir
  const area = useAreas().find((a) => a.slug === areaEstatica.slug) ?? areaEstatica;
  const projetos = useProjetos().filter((p) => p.area === area.slug);

  return (
    <>
      <section className="relative overflow-hidden bg-sand pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/areas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Todas as áreas
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <span className={`grid size-20 place-items-center rounded-full ${area.cor}`}>
              <AreaIcon icone={area.icone} className="size-9" />
            </span>
            <div>
              <h1 className="text-4xl sm:text-5xl">{area.nome}</h1>
              <p className="mt-1 font-semibold text-primary">{area.resumo}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-2xl">Sobre esta frente</h2>
          <p className="mt-4 text-muted-foreground">{area.descricao}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl">Projetos relacionados</h2>
        </Reveal>
        {projetos.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projetos.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  to="/projetos/$slug"
                  params={{ slug: p.slug }}
                  className="lift block h-full rounded-3xl border border-border bg-card p-7"
                >
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {p.ano}
                  </p>
                  <h3 className="mt-2 text-xl">{p.nome}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{p.resumo}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <PlaceholderBox
              titulo="Ainda não há projetos publicados nesta área"
              nota="Quando houver, eles aparecem aqui."
            />
            <p className="mt-6">
              <Placeholder>conteúdo desta área em construção</Placeholder>
            </p>
          </div>
        )}
        <Button asChild variant="secondary" className="mt-10 rounded-full">
          <Link to="/como-ajudar">Apoiar esta frente</Link>
        </Button>
      </section>
    </>
  );
}
