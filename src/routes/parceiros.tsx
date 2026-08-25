import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, HeartHandshake, BarChart3 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PlaceholderBox } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — Instituto IDEX" },
      {
        name: "description",
        content:
          "Empresas e instituições que caminham com o Instituto IDEX, e como sua organização pode se tornar parceira.",
      },
      { property: "og:title", content: "Parceiros — Instituto IDEX" },
      { property: "og:description", content: "Seja parceiro do Instituto IDEX." },
    ],
  }),
  component: Parceiros,
});

const BENEFICIOS = [
  {
    icone: Megaphone,
    titulo: "Visibilidade com propósito",
    texto: "Sua marca associada a ações reais com crianças e jovens da comunidade.",
  },
  {
    icone: HeartHandshake,
    titulo: "Engajamento do time",
    texto: "Ações de voluntariado corporativo junto aos projetos do instituto.",
  },
  {
    icone: BarChart3,
    titulo: "Prestação de contas",
    texto: "Acompanhamento do destino do apoio pela área de Transparência.",
  },
];

function Parceiros() {
  return (
    <>
      <PageHero
        titulo="Quem caminha junto"
        descricao="Ainda não temos parceiros publicados neste site. Os espaços abaixo estão reservados para as logos oficiais."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Parceiros
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Reveal key={i} delay={i * 60}>
              <PlaceholderBox titulo="[logo do parceiro]" className="h-32" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl">Seja um parceiro</h2>
            <p className="mt-3 max-w-2xl text-ink-foreground/70">
              Apoio institucional, patrocínio de projeto ou parceria técnica — vamos conversar.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BENEFICIOS.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 100}>
                <div className="h-full rounded-3xl bg-ink-card p-7">
                  <b.icone className="size-6 text-primary" aria-hidden />
                  <h3 className="mt-4 text-xl">{b.titulo}</h3>
                  <p className="mt-2 text-sm text-ink-foreground/70">{b.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/contato">Falar com o instituto</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/como-ajudar">Outras formas de ajudar</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
