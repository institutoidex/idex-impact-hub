import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowRight, HeartHandshake } from "lucide-react";
// fotos reais do instituto (CDN)
import { Imagem } from "@/components/Imagem";
import GaleriaLightbox from "@/components/GaleriaLightbox";
import { FOTO_HERO, FOTO_TALENTO, GALERIA } from "@/data/fotos";
import { useQuery } from "@tanstack/react-query";
import { formatarData, noticiasQuery } from "@/lib/queries";
import { Reveal } from "@/components/Reveal";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { TiltCard } from "@/components/motion/TiltCard";

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
    links: [
      {
        rel: "preload",
        as: "image",
        href: FOTO_HERO.url,
        imageSrcSet: FOTO_HERO.srcSet,
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ],
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
              <Button asChild size="lg" variant="idex">
                <Link to="/como-ajudar">
                  <HeartHandshake className="size-4" /> Quero ajudar
                </Link>
              </Button>
              <Button asChild size="lg" variant="idexClaro">
                <Link to="/noticias">Ver notícias</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa com foto sangrando até as bordas — a chamada de projeto
          foi retirada enquanto a área de Projetos estiver oculta */}
      <section className="bg-sand">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-72 sm:min-h-96">
            <Imagem
              foto={FOTO_TALENTO}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <div className="flex items-center px-4 py-14 sm:px-10 lg:py-24 lg:pl-16 lg:pr-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
            <Reveal delay={120}>
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                No dia a dia
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl">Esporte que aproxima</h2>
              <p className="mt-4 text-muted-foreground">
                Treinos gratuitos de futebol para 200 crianças e jovens das categorias de base, em
                parceria com o Clube Esportivo Penha, desde 2017.
              </p>
              <Button asChild variant="idex" className="mt-7">
                <Link to="/como-ajudar">
                  Quero apoiar <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
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
        <NoticiasRecentes />
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

      {/* CTA final: faixa escura de largura total com o filete amarelo da marca,
          em vez de mais um card arredondado */}
      <section className="bg-ink text-ink-foreground">
        <div className="rule-green" aria-hidden />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl">Vem junto com a gente</h2>
            <p className="mt-3 max-w-xl text-ink-foreground/75">
              Doe ou seja voluntário e ajude a transformar vidas na comunidade.
            </p>
          </Reveal>
          <Reveal delay={120} className="flex flex-wrap gap-3 lg:justify-end">
            <Button asChild size="lg" variant="idex">
              <Link to="/como-ajudar">
                <HeartHandshake className="size-4" /> Doar
              </Link>
            </Button>
            <Button asChild size="lg" variant="idexClaro">
              <Link to="/contato">Falar com o instituto</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/**
 * Notícias recentes da Home: somente as publicadas no banco (as 3 mais novas).
 * Carregando, erro de conexão e lista vazia têm mensagens próprias.
 */
function NoticiasRecentes() {
  const { data, isPending, isError } = useQuery(noticiasQuery(3));

  if (isPending) {
    return <p className="mt-10 text-sm text-muted-foreground" aria-live="polite">Carregando notícias...</p>;
  }
  if (isError) {
    return (
      <p className="mt-10 text-sm text-muted-foreground" aria-live="polite">
        Não foi possível carregar as notícias agora.
      </p>
    );
  }
  if (data.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Ainda não há notícias publicadas. Volte em breve.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {data.map((n, i) => (
        <Reveal as="article" key={n.slug} delay={i * 90}>
          <TiltCard>
            <div className="lift h-full rounded-3xl border border-border bg-card p-7">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                {formatarData(n.publicado_em)}
              </p>
              <h3 className="mt-3 text-xl">
                {/* cada notícia tem endereço próprio em /noticias/slug */}
                <Link to="/noticias/$slug" params={{ slug: n.slug }} className="hover:text-primary">
                  {n.titulo}
                </Link>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{n.resumo}</p>
            </div>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  );
}
