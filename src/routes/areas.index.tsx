import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useAreas } from "@/lib/conteudo";
import { AreaIcon } from "@/components/AreaIcon";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/areas/")({
  head: () => ({
    meta: [
      { title: "Áreas de Atuação — Instituto IDEX" },
      {
        name: "description",
        content:
          "Educação, cultura, esportes, meio ambiente, negócios e saúde: as seis frentes do Instituto IDEX.",
      },
      { property: "og:title", content: "Áreas de Atuação — Instituto IDEX" },
      { property: "og:description", content: "Conheça as seis frentes de atuação do instituto." },
    ],
  }),
  component: AreasIndex,
});

function AreasIndex() {
  const areas = useAreas(); // banco com fallback estático
  return (
    <>
      <PageHero
        titulo="Onde a gente coloca a mão"
        descricao="Seis frentes de trabalho que se cruzam no dia a dia da comunidade."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Áreas de atuação
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => (
            <Reveal as="li" key={area.slug} delay={i * 80}>
              <Link
                to="/areas/$slug"
                params={{ slug: area.slug }}
                className={`lift group block h-full rounded-3xl border border-border bg-card p-7 ${
                  i % 2 === 0 ? "tilt-left" : "tilt-right"
                }`}
              >
                <span className={`grid size-16 place-items-center rounded-full ${area.cor}`}>
                  <AreaIcon icone={area.icone} className="size-7" />
                </span>
                <h2 className="mt-5 flex items-center gap-2 text-2xl">
                  {area.nome}
                  <ArrowUpRight className="size-5 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </h2>
                <p className="mt-1 text-sm font-semibold text-primary">{area.resumo}</p>
                <p className="mt-3 text-sm text-muted-foreground">{area.descricao}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
