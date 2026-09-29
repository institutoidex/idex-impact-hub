import { createFileRoute, Link } from "@tanstack/react-router";
import { HandCoins, HeartHandshake, Building2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { FOTO_VOLUNTARIADO } from "@/data/fotos";

// Marcas dos programas de fomento que podem viabilizar os projetos
// (imagem oficial enviada pelo instituto, recortada por logo).
import logoGovernoSp from "@/assets/incentivo/logo-governo-sp.png.asset.json";
import logoLeiIncentivo from "@/assets/incentivo/logo-lei-incentivo-esporte.png.asset.json";
import logoMinisterio from "@/assets/incentivo/logo-ministerio-do-esporte.png.asset.json";
import logoSpLei from "@/assets/incentivo/logo-sp-lei-incentivo.png.asset.json";

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
      {/* Variante invertida: convite com texto à direita */}
      <PageHero
        variante="invertida"
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
              {/* Sem dados bancários oficiais: orientamos o contato antes da doação,
                  para ninguém transferir para uma conta errada */}
              <div className="mt-6 rounded-2xl bg-muted/60 p-5 text-sm">
                <p className="font-semibold">Antes de doar, fale com a gente</p>
                <p className="mt-2 text-muted-foreground">
                  Para garantir que sua doação chegue ao instituto, entre em contato e
                  passaremos os dados oficiais para a contribuição.
                </p>
                <Link
                  to="/contato"
                  className="mt-3 inline-block font-semibold text-primary hover:underline"
                >
                  Entrar em contato
                </Link>
              </div>
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
              <Imagem
                foto={FOTO_VOLUNTARIADO}
                ampliavel
                sizes="(max-width: 768px) 100vw, 33vw"
                className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <Button asChild variant="idex" className="mt-6 w-full">
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
              <Button asChild variant="idexSecundario" className="mt-6 w-full">
                <Link to="/contato">Falar com o instituto</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Leis de incentivo: marcas dos programas de fomento ligados aos
          projetos do instituto (texto neutro, sem prometer apoio atual) */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl">MECANISMOS DE INCENTIVO</h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              <img
                src={logoGovernoSp.url}
                alt="Governo do Estado de São Paulo — Secretaria de Esportes"
                className="h-28 w-auto sm:h-32"
                loading="lazy"
                decoding="async"
              />
              <img
                src={logoLeiIncentivo.url}
                alt="Lei de Incentivo ao Esporte (governo federal)"
                className="h-24 w-auto sm:h-28"
                loading="lazy"
                decoding="async"
              />
              <img
                src={logoMinisterio.url}
                alt="Ministério do Esporte"
                className="h-32 w-auto sm:h-36"
                loading="lazy"
                decoding="async"
              />
              <img
                src={logoSpLei.url}
                alt="SP — Lei de Incentivo ao Esporte (Estado de São Paulo)"
                className="h-20 w-auto sm:h-24"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
