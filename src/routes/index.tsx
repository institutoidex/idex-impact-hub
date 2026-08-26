import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowRight, Instagram, HeartHandshake } from "lucide-react";
import heroImg from "@/assets/hero-esporte.jpg";
import talentoImg from "@/assets/talento-brasil.jpg";
import culturaImg from "@/assets/comunidade-cultura.jpg";
import { NOTICIAS, CONTATO } from "@/data/idex";
import { useAreas } from "@/lib/conteudo";
import { AreaIcon } from "@/components/AreaIcon";
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
    links: [{ rel: "preload", as: "image", href: heroImg, fetchPriority: "high" }],
  }),
  component: Inicio,
});

function Inicio() {
  const areas = useAreas(); // áreas vindas do banco, com fallback estático
  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="relative min-h-[88vh] overflow-hidden pt-28 pb-16">
        <img
          src={heroImg}
          alt="Crianças jogando futebol em campo de bairro ao entardecer"
          width={1600}
          height={1000}
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

      {/* Áreas ----------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl">Seis frentes, uma comunidade</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Cada frente nasce de uma necessidade concreta do território.
          </p>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {areas.map((area, i) => (
            <Reveal as="li" key={area.slug} delay={i * 70}>
              <Link
                to="/areas/$slug"
                params={{ slug: area.slug }}
                className="group flex flex-col items-center text-center"
              >
                <span
                  className={`grid size-24 place-items-center rounded-full ${area.cor} transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-6`}
                >
                  <AreaIcon icone={area.icone} className="size-10" />
                </span>
                <span className="mt-4 font-display text-lg">{area.nome}</span>
                <span className="text-sm text-muted-foreground">{area.resumo}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Projeto em destaque --------------------------------------------- */}
      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <img
              src={talentoImg}
              alt="Treino de futebol de base do projeto Talento Brasil"
              loading="lazy"
              width={1400}
              height={900}
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
                  <h3 className="mt-3 text-xl">{n.titulo}</h3>
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

      {/* Instagram -------------------------------------------------------- */}
      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl">No dia a dia</h2>
              <p className="mt-2 text-muted-foreground">
                Acompanhe o instituto no Instagram {CONTATO.instagram}
              </p>
            </div>
            <a
              href={CONTATO.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Instagram className="size-4" /> Seguir
            </a>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[culturaImg, talentoImg, heroImg, culturaImg].map((src, i) => (
              <Reveal key={i} delay={i * 80}>
                <a
                  href={CONTATO.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="lift block overflow-hidden rounded-2xl"
                >
                  <img
                    src={src}
                    alt="Publicação do Instituto IDEX no Instagram"
                    loading="lazy"
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </a>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Placeholder>feed real do Instagram a integrar</Placeholder>
          </p>
        </div>
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
