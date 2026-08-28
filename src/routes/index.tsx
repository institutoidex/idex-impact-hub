import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowRight, HeartHandshake } from "lucide-react";
// fotos reais do instituto (CDN)
import { Imagem } from "@/components/Imagem";
import GaleriaLightbox from "@/components/GaleriaLightbox";
import { FOTO_HERO, FOTO_TALENTO, GALERIA } from "@/data/fotos";
import { NOTICIAS } from "@/data/idex";
import { Reveal } from "@/components/Reveal";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { Counter } from "@/components/motion/Counter";
import { TiltCard } from "@/components/motion/TiltCard";

import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instituto IDEX — esporte, cultura e comunidade desde 2007" },
      {
        name: "description",
        content:
          "O Instituto IDEX atua desde 2007 em seis frentes sociais: educação, cultura, esportes, meio ambiente, negócios e saúde.",
      },
      { property: "og:title", content: "Instituto IDEX — desenvolvimento social desde 2007" },
      {
        property: "og:description",
        content: "Seis frentes de atuação e o projeto Talento Brasil, para 200 crianças e jovens.",
      },
    ],
    // Pré-carrega a imagem do hero (maior elemento da página) para acelerar o LCP
    links: [{ rel: "preload", as: "image", href: FOTO_HERO.url, fetchPriority: "high" }],
  }),
  component: Inicio,
});

function Inicio() {
  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="relative min-h-[88vh] overflow-hidden pt-28 pb-16">
        <Imagem
          foto={FOTO_HERO}
          prioridade
          sizes="100vw"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        {/* Reforço de contraste na base do hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pt-16 sm:px-6">
          {/* Entrada em CSS puro (utilitário entrada): o texto aparece no primeiro
              paint, sem esperar o JavaScript carregar — nada de hero vazio */}
          <div className="max-w-3xl">
            <span
              className="entrada inline-flex items-center gap-2 rounded-full bg-ink-card/80 px-4 py-1.5 text-xs font-semibold tracking-widest text-ink-foreground uppercase"
              style={{ "--d": "0ms" } as CSSProperties}
            >
              Instituto IDEX · desde 2007
            </span>
            <AnimatedText
              as="h1"
              text={"A gente muda vida\nperto de casa."}
              delay={150}
              className="mt-6 text-[clamp(2rem,8vw,4.5rem)] leading-[1.12] text-balance text-ink-foreground lg:text-7xl"
            />

            <p
              className="entrada mt-6 max-w-xl text-base text-ink-foreground/90 sm:text-lg"
              style={{ "--d": "500ms" } as CSSProperties}
            >
              Esporte, cultura e educação como caminho real para crianças e jovens da comunidade.
            </p>
            <div
              className="entrada mt-8 flex flex-wrap gap-3"
              style={{ "--d": "650ms" } as CSSProperties}
            >
              <Button asChild size="lg" className="rounded-full">
                <Link to="/como-ajudar">
                  <HeartHandshake className="size-4" /> Quero ajudar
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-ink-foreground/30 bg-ink-card/40 text-ink-foreground hover:bg-ink-card"
              >
                <Link to="/projetos">Ver projetos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projeto em destaque --------------------------------------------- */}
      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <Imagem
              foto={FOTO_TALENTO}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="tilt-left w-full rounded-3xl object-cover shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]"
            />
          </Reveal>
          <Reveal delay={120}>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Projeto em destaque
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Talento Brasil</h2>
            <p className="mt-4 text-muted-foreground">
              Treinamento de futebol gratuito para 200 crianças e jovens nas categorias de base, em
              parceria com o Clube Esportivo Penha. Lançado em 26/06/2017, na Câmara dos Vereadores
              de Santa Cruz do Rio Pardo.
            </p>
            <Button asChild className="mt-7 rounded-full">
              <Link to="/projetos/$slug" params={{ slug: "talento-brasil" }}>
                Conhecer o projeto <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Números ---------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 rounded-3xl bg-ink p-8 text-ink-foreground sm:grid-cols-3 sm:p-10">
          {[
            { v: 2007, sep: false, t: "ano de fundação" },
            { v: 19, sep: true, t: "anos de atuação" },
            { v: 200, sep: true, t: "crianças no Talento Brasil" },
          ].map((item, i) => (
            <Reveal key={item.t} delay={i * 100}>
              <div className="h-full rounded-2xl bg-ink-card p-7">
                <p className="font-display text-5xl text-primary">
                  {item.sep ? <Counter valor={item.v} /> : item.v}
                </p>
                <p className="mt-2 text-sm text-ink-foreground/70">{item.t}</p>
              </div>
            </Reveal>
          ))}

        </div>
      </section>

      {/* Notícias --------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">Notícias recentes</h2>
          <Link
            to="/noticias"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todas
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {NOTICIAS.map((n, i) => (
            <Reveal as="article" key={n.slug} delay={i * 90}>
              <TiltCard>
                <div className="lift h-full rounded-3xl border border-border bg-card p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {n.data}
                  </p>
                  <h3 className="mt-3 text-xl">
                    {/* cada notícia tem endereço próprio em /noticias/slug */}
                    <Link
                      to="/noticias/$slug"
                      params={{ slug: n.slug }}
                      className="hover:text-primary"
                    >
                      {n.titulo}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">{n.resumo}</p>
                </div>
              </TiltCard>
            </Reveal>

          ))}
          {[0, 1].map((i) => (
            <Reveal as="article" key={i} delay={(i + 1) * 120}>
              <div className="flex h-full flex-col justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-7">
                <Placeholder>notícia em breve</Placeholder>
                <p className="mt-3 text-sm text-muted-foreground">
                  Novos conteúdos serão publicados aqui.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Galeria de fotos --------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl">Nosso dia a dia em fotos</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Registros dos treinos, jogos e celebrações do Talento Brasil.
          </p>
        </Reveal>
        <GaleriaLightbox fotos={GALERIA.slice(0, 8)} className="mt-8" />
      </section>

      {/* CTA final -------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="grid gap-6 rounded-3xl bg-primary/10 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl">Vem junto com a gente</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Doe ou seja voluntário e ajude a transformar vidas na comunidade.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/como-ajudar">
                  <HeartHandshake className="size-4" /> Doar
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/contato">Falar com o instituto</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
