import { createFileRoute } from "@tanstack/react-router";
import { AREAS } from "@/data/idex";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder, PlaceholderBox } from "@/components/Placeholder";
import culturaImg from "@/assets/comunidade-cultura.jpg";

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
      <PageHero
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
          <img
            src={culturaImg}
            alt="Oficina cultural com crianças em centro comunitário"
            loading="lazy"
            width={1400}
            height={900}
            className="tilt-right w-full rounded-3xl object-cover"
          />
        </Reveal>
      </section>

      {/* Missão, visão, valores */}
      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl">Missão, visão e valores</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Estes textos ainda não foram formalizados pelo instituto. Os espaços abaixo estão
              reservados para o conteúdo oficial.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {["Missão", "Visão", "Valores"].map((t, i) => (
              <Reveal key={t} delay={i * 100}>
                <div className="h-full rounded-3xl border border-border bg-card p-7">
                  <h3 className="text-xl">{t}</h3>
                  <p className="mt-4">
                    <Placeholder>[{t.toLowerCase()} a definir]</Placeholder>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Ainda não formalizado pelo instituto.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl">Equipe</h2>
          <p className="mt-3 text-muted-foreground">
            Nomes, funções e fotos da equipe ainda serão enviados.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="rounded-3xl border border-border bg-card p-6 text-center">
                <div className="mx-auto size-24 rounded-full bg-muted" />
                <p className="mt-4">
                  <Placeholder>[nome a definir]</Placeholder>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">[função a definir]</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Organograma */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl">Organograma</h2>
          <div className="mt-8 rounded-3xl bg-ink p-8 text-ink-foreground">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto w-full max-w-xs rounded-2xl bg-ink-card p-5">
                <p className="font-display text-lg">Diretoria</p>
                <p className="text-xs text-ink-foreground/60">[composição a definir]</p>
              </div>
              <div className="mx-auto my-4 h-8 w-px bg-ink-foreground/20" />
              <div className="grid gap-4 sm:grid-cols-3">
                {["Coordenação de projetos", "Administrativo", "Comunicação"].map((t) => (
                  <div key={t} className="rounded-2xl bg-ink-card p-5">
                    <p className="font-display">{t}</p>
                    <p className="text-xs text-ink-foreground/60">[responsável a definir]</p>
                  </div>
                ))}
              </div>
              <div className="mx-auto my-4 h-8 w-px bg-ink-foreground/20" />
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {AREAS.map((a) => (
                  <div key={a.slug} className="rounded-xl bg-ink-card/70 px-3 py-3 text-sm">
                    {a.nome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <div className="mt-6">
          <PlaceholderBox
            titulo="Organograma oficial"
            nota="Substituir por versão validada pelo instituto quando disponível."
          />
        </div>
      </section>
    </>
  );
}
