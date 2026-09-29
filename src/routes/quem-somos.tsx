import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { FOTO_EQUIPE } from "@/data/fotos";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem Somos — Instituto IDEX" },
      {
        name: "description",
        content:
          "Fundado em 2007, o Instituto IDEX começou em projetos de comércio exterior e competitividade e hoje atua em seis frentes sociais.",
      },
      { property: "og:title", content: "Quem Somos — Instituto IDEX" },
      {
        property: "og:description",
        content: "A história do instituto, missão, visão, valores e equipe.",
      },
    ],
  }),
  component: QuemSomos,
});

function QuemSomos() {
  return (
    <>
      {/* Variante editorial: filete amarelo da marca + texto à esquerda */}
      <PageHero
        variante="editorial"
        titulo="Uma história que começou no comércio e virou comunidade"
        descricao="O Instituto IDEX foi fundado em 2007."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Quem somos
        </span>
      </PageHero>

      {/* História */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl">Nossa história</h2>
          <p className="mt-4 text-muted-foreground">
            O instituto foi fundado em 2007 e começou sua trajetória em projetos de comércio
            exterior e competitividade.
          </p>
          <p className="mt-4 text-muted-foreground">
            Com o tempo, essa experiência se transformou em atuação social direta. Hoje o Instituto
            IDEX trabalha em seis frentes: educação, cultura, esportes, meio ambiente, negócios e
            saúde.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <Imagem
            foto={FOTO_EQUIPE}
            ampliavel
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="tilt-right w-full rounded-3xl object-cover"
          />
        </Reveal>
      </section>

      {/* Missão, visão e valores ficam ocultos até o instituto enviar os
          textos oficiais (não inventar conteúdo). */}


    </>
  );
}
