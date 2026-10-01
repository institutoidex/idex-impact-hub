import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Maximize2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import VisorFotos from "@/components/VisorFotos";
import { FOTO_HERO, FOTO_TALENTO, type Foto } from "@/data/fotos";
import { normalizarLocale } from "@/i18n/locales";
import { useMensagens } from "@/i18n/mensagens";
import { seoPagina } from "@/i18n/seo";
import { programaEsportivo } from "@/i18n/catalogos/programa-esportivo";

// Logos oficiais dos quatro projetos (substituem os ícones genéricos).
import logoTalentoEmCampo from "@/assets/projetos/logo-talento-em-campo-v2.png.asset.json";
import logoTalentos from "@/assets/projetos/logo-talentos-v2.png.asset.json";
import logoDraftDay from "@/assets/projetos/logo-draft-day-v2.png.asset.json";
import logoTalentoBrasil from "@/assets/projetos/logo-talento-brasil-v2.png.asset.json";

export const Route = createFileRoute("/programa-esportivo")({
  head: ({ match }) => {
    const t = programaEsportivo[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/programa-esportivo",
      titulo: t.seo.titulo,
      descricao: t.seo.descricao,
    });
    return { meta: s.meta, links: s.links };
  },
  component: ProgramaEsportivo,
});

/** Logos oficiais na mesma ordem dos programas do catálogo. */
const LOGOS = [logoTalentoEmCampo.url, logoTalentos.url, logoDraftDay.url, logoTalentoBrasil.url];
const NUMEROS = ["01", "02", "03", "04"] as const;

function ProgramaEsportivo() {
  const t = useMensagens(programaEsportivo);
  // logo aberta no visor em tela cheia (null = visor fechado)
  const [logoAberta, setLogoAberta] = useState<Foto | null>(null);

  const programas = t.programas.map((p, i) => ({
    ...p,
    numero: NUMEROS[i] ?? "",
    logo: LOGOS[i] ?? "",
  }));

  return (
    <>
      <PageHero variante="foto" foto={FOTO_HERO} titulo={t.hero.titulo} descricao={t.hero.descricao}>
        <span className="text-xs font-semibold tracking-widest uppercase">{t.hero.selo}</span>
      </PageHero>

      {/* Introdução */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl">{t.introducao.titulo}</h2>
          {t.introducao.paragrafos.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-muted-foreground">
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal delay={120}>
          <Imagem
            foto={FOTO_TALENTO}
            ampliavel
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full rounded-lg object-cover"
          />
        </Reveal>
      </section>

      {/* Jornada resumida (tabela da metodologia) */}
      <section className="bg-ink py-16 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl text-ink-foreground sm:text-4xl">{t.jornada.titulo}</h2>
          {/* Grade da jornada: 1 coluna no celular, 2 no tablet e 4 no desktop */}
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {programas.map((p) => (
              <li key={p.nome} className="flex flex-col items-center border-t-2 border-primary pt-6 text-center">
                {/* Logo clicável: abre o visor em tela cheia (navegação fica no nome) */}
                <button
                  type="button"
                  onClick={() => setLogoAberta({ url: p.logo, alt: t.jornada.ampliarLogo(p.nome) })}
                  aria-label={t.jornada.ampliarLogo(p.nome)}
                  className="group relative inline-flex cursor-zoom-in rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="flex size-16 items-center justify-center rounded-md border border-border bg-background p-2 sm:size-20 sm:p-2.5">
                    <img
                      src={p.logo}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </span>
                  {/* dica visual de que dá para expandir */}
                  <span className="pointer-events-none absolute -right-1.5 -top-1.5 rounded-full bg-black/55 p-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="size-3" />
                  </span>
                </button>
                <a href={`#${p.numero}`} className="mt-4 block text-xl font-semibold hover:underline">
                  {p.nome}
                </a>
                <p className="mt-2 max-w-64 text-base text-ink-foreground/80">{p.etapa}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Detalhe de cada programa */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="space-y-16">
          {programas.map((p) => (
            <Reveal key={p.nome}>
              {/* Logo ao lado do texto em qualquer largura de tela; quadro cresce no desktop */}
              <article id={p.numero} className="scroll-mt-28 grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:gap-6">
                {/* Logo clicável: abre o visor em tela cheia */}
                <button
                  type="button"
                  onClick={() => setLogoAberta({ url: p.logo, alt: t.jornada.ampliarLogo(p.nome) })}
                  aria-label={t.jornada.ampliarLogo(p.nome)}
                  className="group relative flex size-20 shrink-0 cursor-zoom-in items-center justify-center self-start rounded-md border border-border bg-background p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-24 sm:p-2.5 md:size-28"
                >
                  <img
                    src={p.logo}
                    alt={t.jornada.ampliarLogo(p.nome)}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                  {/* dica visual de que dá para expandir */}
                  <span className="pointer-events-none absolute -right-1.5 -top-1.5 rounded-full bg-black/55 p-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="size-3" />
                  </span>
                </button>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {t.detalhe.projeto(p.numero, p.etapa)}
                  </p>
                  <h3 className="mt-2 text-3xl">{p.nome}</h3>
                  <p className="mt-1 font-display text-xl text-primary italic">{p.lema}</p>
                  {p.textos.map((texto) => (
                    <p key={texto.slice(0, 24)} className="mt-4 text-muted-foreground">
                      {texto}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Chamada final */}
      <section className="border-t border-border bg-sand py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-2xl">{t.chamadaFinal.texto}</p>
          <Button asChild variant="idex">
            <Link to="/como-ajudar">
              <HeartHandshake className="size-4" />
              {t.chamadaFinal.cta}
            </Link>
          </Button>
        </div>
      </section>

      {/* Visor em tela cheia para a logo ampliada (fecha com Esc ou no botão) */}
      {logoAberta && <VisorFotos fotos={[logoAberta]} onFechar={() => setLogoAberta(null)} />}
    </>
  );
}
