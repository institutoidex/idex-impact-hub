import { createFileRoute, Link } from "@tanstack/react-router";
import { HandCoins, HeartHandshake, Building2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { FOTO_VOLUNTARIADO } from "@/data/fotos";
import { normalizarLocale } from "@/i18n/locales";
import { useMensagens } from "@/i18n/mensagens";
import { seoPagina } from "@/i18n/seo";
import { comoAjudar } from "@/i18n/catalogos/como-ajudar";

// Marca única dos programas de fomento (imagem oficial enviada pelo instituto,
// com as margens brancas aparadas para ocupar melhor o espaço)
import logosIncentivo from "@/assets/incentivo/logos-lei-incentivo-v2.png.asset.json";

export const Route = createFileRoute("/como-ajudar")({
  head: ({ match }) => {
    const t = comoAjudar[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/como-ajudar",
      titulo: t.seo.titulo,
      descricao: t.seo.descricao,
    });
    return { meta: s.meta, links: s.links };
  },
  component: ComoAjudar,
});

function ComoAjudar() {
  const t = useMensagens(comoAjudar);
  return (
    <>
      {/* Variante invertida: convite com texto à direita */}
      <PageHero variante="invertida" titulo={t.hero.titulo} descricao={t.hero.descricao}>
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.hero.selo}
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Doação */}
          <Reveal>
            <div className="lift tilt-left h-full rounded-3xl border border-border bg-card p-7">
              <HandCoins className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">{t.doacao.titulo}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{t.doacao.texto}</p>
              {/* Sem dados bancários oficiais: orientamos o contato antes da doação,
                  para ninguém transferir para uma conta errada */}
              <div className="mt-6 rounded-2xl bg-muted/60 p-5 text-sm">
                <p className="font-semibold">{t.doacao.aviso.titulo}</p>
                <p className="mt-2 text-muted-foreground">{t.doacao.aviso.texto}</p>
                <Link
                  to="/contato"
                  className="mt-3 inline-block font-semibold text-primary hover:underline"
                >
                  {t.doacao.aviso.link}
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Voluntariado */}
          <Reveal delay={100}>
            <div className="lift h-full rounded-3xl border border-border bg-card p-7">
              <HeartHandshake className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">{t.voluntariado.titulo}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{t.voluntariado.texto}</p>
              <Imagem
                foto={FOTO_VOLUNTARIADO}
                ampliavel
                sizes="(max-width: 768px) 100vw, 33vw"
                className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <Button asChild variant="idex" className="mt-6 w-full">
                <Link to="/contato">{t.voluntariado.cta}</Link>
              </Button>
            </div>
          </Reveal>

          {/* Parceria */}
          <Reveal delay={200}>
            <div className="lift tilt-right h-full rounded-3xl bg-ink p-7 text-ink-foreground">
              <Building2 className="size-7 text-primary" aria-hidden />
              <h2 className="mt-4 text-2xl">{t.parceria.titulo}</h2>
              <p className="mt-3 text-sm text-ink-foreground/70">{t.parceria.texto}</p>
              <div className="mt-6 rounded-2xl bg-ink-card p-5 text-sm text-ink-foreground/80">
                {t.parceria.caixa}
              </div>
              <Button asChild variant="idexSecundario" className="mt-6 w-full">
                <Link to="/contato">{t.parceria.cta}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Leis de incentivo: marcas dos programas de fomento ligados aos
          projetos do instituto (texto neutro, sem prometer apoio atual) */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl">{t.incentivo.titulo}</h2>
            {/* Layout vertical: marcas empilhadas e centralizadas */}
            <div className="mt-4 flex flex-col items-center justify-center gap-6">
              <img
                src={logosIncentivo.url}
                alt={t.incentivo.alt}
                className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
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
