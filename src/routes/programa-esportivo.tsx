import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Maximize2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import VisorFotos from "@/components/VisorFotos";
import { FOTO_HERO, FOTO_TALENTO, type Foto } from "@/data/fotos";

// Logos oficiais dos quatro projetos (substituem os ícones genéricos).
import logoTalentoEmCampo from "@/assets/projetos/logo-talento-em-campo.png.asset.json";
import logoTalentos from "@/assets/projetos/logo-talentos.png.asset.json";
import logoDraftDay from "@/assets/projetos/logo-draft-day.png.asset.json";
import logoTalentoBrasil from "@/assets/projetos/logo-talento-brasil.png.asset.json";

const TITULO = "Programa Esportivo — Instituto IDEX";
const DESCRICAO =
  "Programas de futebol de campo do IDEX: Talento em Campo, Festival de Talentos, Draft Day e Talento Brasil — da iniciação à qualificação esportiva.";

export const Route = createFileRoute("/programa-esportivo")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://idex-impact-hub.lovable.app/programa-esportivo" }],
  }),
  component: ProgramaEsportivo,
});

/** Projetos na ordem da jornada do atleta (conteúdo oficial enviado pelo instituto). */
const PROGRAMAS = [
  {
    numero: "01",
    nome: "Talento em Campo",
    lema: "O esporte começa aqui.",
    etapa: "Iniciação esportiva e formação de base",
    logo: logoTalentoEmCampo.url,
    textos: [
      "Programa de iniciação esportiva que leva o futebol de campo estruturado a crianças e adolescentes, especialmente em territórios de maior vulnerabilidade social.",
      "Por meio de atividades regulares e orientadas, o programa amplia o acesso à modalidade e trabalha valores que fazem parte da essência do IDEX, como disciplina, respeito, cooperação, responsabilidade e convivência.",
    ],
  },
  {
    numero: "02",
    nome: "Festival de Talentos",
    lema: "Onde o aprendizado entra em campo.",
    etapa: "Integração, competição e desenvolvimento",
    logo: logoTalentos.url,
    textos: [
      "Programa de integração esportiva que reúne jovens e equipes em etapas organizadas de futebol de campo, transformando o jogo em uma experiência de formação, convivência e desenvolvimento.",
      "Com orientação técnica, regras, arbitragem e estrutura adequada, os festivais proporcionam aos participantes a oportunidade de colocar em prática o que aprenderam, vivenciar o ambiente esportivo e fortalecer sua relação com a modalidade.",
    ],
  },
  {
    numero: "03",
    nome: "Draft Day",
    lema: "Onde o talento encontra oportunidade.",
    etapa: "Avaliação, evolução e visibilidade esportiva",
    logo: logoDraftDay.url,
    textos: [
      "O Draft Day é o programa do IDEX voltado à avaliação esportiva e à visibilidade de jovens jogadores em estágio avançado de desenvolvimento.",
      "Por meio de partidas organizadas e monitoradas por profissionais especializados, os atletas têm a oportunidade de demonstrar seu desempenho em situação real de jogo, sendo observados em aspectos técnicos, táticos, físicos, comportamentais e de inteligência de jogo.",
      "A proposta é transformar a vivência competitiva em uma verdadeira vitrine esportiva e instrumento de acompanhamento técnico, aproximando formação, avaliação e novas possibilidades de continuidade no futebol. A avaliação realizada pelos scouts gera um registro qualificado do desempenho do jogador, contribuindo para a construção de seu histórico de evolução ao longo do processo de formação esportiva.",
      "O Draft Day representa, dentro da metodologia do Instituto, o momento em que o jogador pode colocar em campo tudo o que desenvolveu ao longo de sua trajetória, permitindo que sua evolução técnica, tática, física e comportamental seja observada e registrada. Esse acompanhamento fortalece o processo formativo do atleta e amplia as referências para sua continuidade e futuras oportunidades no esporte.",
    ],
  },
  {
    numero: "04",
    nome: "Talento Brasil",
    lema: "Da formação para novas oportunidades.",
    etapa: "Qualificação e preparação para novas oportunidades",
    logo: logoTalentoBrasil.url,
    textos: [
      "O Talento Brasil representa o estágio mais avançado da trajetória esportiva desenvolvida pelo IDEX.",
      "Voltado à qualificação esportiva de jovens que passaram pelo processo de formação e apresentam potencial para avançar na modalidade, o programa amplia o desenvolvimento técnico e prepara esses jogadores para oportunidades reais de continuidade no futebol.",
      "É quando o trabalho iniciado na formação começa a transformar talento, dedicação e trajetória esportiva em possibilidade concreta de futuro.",
    ],
  },
] as const;

function ProgramaEsportivo() {
  return (
    <>
      <PageHero
        variante="foto"
        foto={FOTO_HERO}
        titulo="Programas de Futebol de Campo IDEX"
        descricao="Uma jornada de formação esportiva, integração, avaliação e qualificação de talentos."
      >
        <span className="text-xs font-semibold tracking-widest uppercase">Programa esportivo</span>
      </PageHero>

      {/* Introdução */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl">Do primeiro contato com a bola às novas oportunidades</h2>
          <p className="mt-4 text-muted-foreground">
            O IDEX desenvolve programas de futebol de campo que acompanham diferentes momentos da
            formação esportiva, desde o primeiro contato com a modalidade até a qualificação de
            jovens que demonstram condições de avançar no esporte.
          </p>
          <p className="mt-4 text-muted-foreground">
            As iniciativas são estruturadas para viabilização por diferentes fontes de
            financiamento, como a Lei de Incentivo ao Esporte Federal, a Lei Paulista de Incentivo ao
            Esporte, emendas parlamentares, editais públicos e privados e parcerias institucionais.
          </p>
          <p className="mt-4 text-muted-foreground">
            A metodologia do Instituto integra acesso ao esporte, formação, convivência,
            desenvolvimento técnico e oportunidades de continuidade, utilizando o futebol como
            instrumento de transformação social e desenvolvimento humano.
          </p>
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
          <h2 className="text-3xl text-ink-foreground">Os projetos do IDEX</h2>
          {/* Grade da jornada: 1 coluna no celular, 2 no tablet e 4 no desktop */}
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMAS.map((p) => (
              <li key={p.nome} className="border-t-2 border-primary pt-4">
                {/* Logo do projeto, com quadro que acompanha a largura da tela */}
                <a href={`#${p.numero}`} className="inline-flex" aria-label={p.nome}>
                  <span className="flex size-14 items-center justify-center rounded-md border border-border bg-background p-1.5 sm:size-16 sm:p-2">
                    <img
                      src={p.logo}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </span>
                </a>
                <a href={`#${p.numero}`} className="mt-3 block text-lg font-semibold hover:underline">
                  {p.nome}
                </a>
                <p className="mt-1 text-sm text-ink-foreground/80">{p.etapa}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Detalhe de cada programa */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="space-y-16">
          {PROGRAMAS.map((p) => (
            <Reveal key={p.nome}>
              {/* Logo ao lado do texto em qualquer largura de tela; quadro cresce no desktop */}
              <article id={p.numero} className="scroll-mt-28 grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:gap-6">
                {/* Quadro branco neutro para as logos coloridas dos projetos */}
                <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-border bg-background p-1.5 sm:size-20 sm:p-2 md:size-24">
                  <img
                    src={p.logo}
                    alt={`Logo do projeto ${p.nome}`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Projeto {p.numero} · {p.etapa}
                  </p>
                  <h3 className="mt-2 text-3xl">{p.nome}</h3>
                  <p className="mt-1 font-display text-xl text-primary italic">{p.lema}</p>
                  {p.textos.map((t) => (
                    <p key={t.slice(0, 24)} className="mt-4 text-muted-foreground">
                      {t}
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
          <p className="font-display text-2xl">
            IDEX. Formação que transforma. Oportunidades que ampliam caminhos.
          </p>
          <Button asChild variant="idex">
            <Link to="/como-ajudar">
              <HeartHandshake className="size-4" />
              Apoie os programas
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
