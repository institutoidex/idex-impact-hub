import { createFileRoute, Link } from "@tanstack/react-router";
import { HandCoins, HeartHandshake, Building2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import voluntariadoImg from "@/assets/voluntariado.jpg";

export const Route = createFileRoute("/como-ajudar")({
  head: () => ({
    meta: [
      { title: "Como Ajudar — Instituto IDEX" },
      {
        name: "description",
        content:
          "Doe, seja voluntário ou torne sua empresa parceira do Instituto IDEX e apoie crianças e jovens da comunidade.",
      },
      { property: "og:title", content: "Como Ajudar — Instituto IDEX" },
      { property: "og:description", content: "Três formas de apoiar o instituto." },
    ],
  }),
  component: ComoAjudar,
});

function ComoAjudar() {
  return (
    <>
      <PageHero
        titulo="Três jeitos de fazer diferença"
        descricao="Escolha o que combina com você — todos chegam na mesma criança."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Como ajudar
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Doação */}
          <Reveal>
            <div className="lift tilt-left h-full rounded-3xl border border-border bg-card p-7">
              <HandCoins className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">Doação</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Contribuições diretas sustentam materiais, uniformes e a rotina dos treinos.
              </p>
              <dl className="mt-6 space-y-3 rounded-2xl bg-muted/60 p-5 text-sm">
                <div>
                  <dt className="font-semibold">Chave Pix</dt>
                  <dd className="mt-1">
                    <Placeholder>[chave Pix a definir]</Placeholder>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Dados bancários</dt>
                  <dd className="mt-1">
                    <Placeholder>[banco, agência e conta a definir]</Placeholder>
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {/* Voluntariado */}
          <Reveal delay={100}>
            <div className="lift h-full rounded-3xl border border-border bg-card p-7">
              <HeartHandshake className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">Voluntariado</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Doe tempo e habilidade: treinos, oficinas, apoio administrativo ou comunicação.
              </p>
              <img
                src={voluntariadoImg}
                alt="Voluntários e crianças plantando mudas em praça"
                loading="lazy"
                width={1400}
                height={900}
                className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <Button asChild className="mt-6 w-full rounded-full">
                <Link to="/contato">Quero ser voluntário</Link>
              </Button>
            </div>
          </Reveal>

          {/* Parceria */}
          <Reveal delay={200}>
            <div className="lift tilt-right h-full rounded-3xl bg-ink p-7 text-ink-foreground">
              <Building2 className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">Parceria empresarial</h2>
              <p className="mt-3 text-sm text-ink-foreground/70">
                Patrocínio de projeto, apoio institucional ou voluntariado corporativo.
              </p>
              <div className="mt-6 rounded-2xl bg-ink-card p-5 text-sm text-ink-foreground/80">
                Entre em contato para conversarmos sobre o formato de apoio ideal.
              </div>
              <Button asChild variant="secondary" className="mt-6 w-full rounded-full">
                <Link to="/contato">Falar com o instituto</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
