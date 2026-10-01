import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { FOTO_EQUIPE } from "@/data/fotos";
import { normalizarLocale } from "@/i18n/locales";
import { useMensagens } from "@/i18n/mensagens";
import { seoPagina } from "@/i18n/seo";
import { quemSomos } from "@/i18n/catalogos/quem-somos";

export const Route = createFileRoute("/quem-somos")({
  head: ({ match }) => {
    const t = quemSomos[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/quem-somos",
      titulo: t.seo.titulo,
      descricao: t.seo.descricao,
    });
    return { meta: s.meta, links: s.links };
  },
  component: QuemSomos,
});

function QuemSomos() {
  const t = useMensagens(quemSomos);
  return (
    <>
      <PageHero variante="editorial" titulo={t.hero.titulo} descricao={t.hero.descricao}>
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.hero.selo}
        </span>
      </PageHero>

      {/* História (texto oficial) */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl">{t.historia.titulo}</h2>
          {t.historia.paragrafos.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-muted-foreground">
              {p}
            </p>
          ))}
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

      {/* Compromisso institucional: missão, visão e valores oficiais */}
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl text-ink-foreground">{t.compromisso.titulo}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="border-t-2 border-primary pt-4">
              <h3 className="text-2xl text-primary">{t.compromisso.missaoTitulo}</h3>
              <p className="mt-3 text-ink-foreground/85">{t.compromisso.missaoTexto}</p>
            </div>
            <div className="border-t-2 border-primary pt-4">
              <h3 className="text-2xl text-primary">{t.compromisso.visaoTitulo}</h3>
              <p className="mt-3 text-ink-foreground/85">{t.compromisso.visaoTexto}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl">{t.valores.titulo}</h2>
        <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {t.valores.lista.map(({ nome, texto }) => (
            <div key={nome} className="border-l-2 border-primary pl-4">
              <dt className="text-lg font-semibold">{nome}</dt>
              <dd className="mt-2 text-muted-foreground">{texto}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
