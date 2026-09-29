import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { FOTO_EQUIPE } from "@/data/fotos";

const DESCRICAO =
  "Fundado em 2007, o Instituto IDEX usa o futebol como ferramenta de formação humana, inclusão e novas oportunidades para crianças e jovens.";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem Somos — Instituto IDEX" },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: "Quem Somos — Instituto IDEX" },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuemSomos,
});

/** Valores oficiais enviados pelo instituto (documento SITE_IDEX). */
const VALORES = [
  ["Formação humana", "Utilizar o esporte como ambiente de desenvolvimento de disciplina, respeito, responsabilidade, cooperação, convivência e construção de valores que contribuam para a formação integral de cada participante."],
  ["Acesso e inclusão", "Ampliar oportunidades de participação esportiva, especialmente para crianças e jovens em contextos de maior vulnerabilidade social, promovendo acesso qualificado, gratuito e estruturado ao esporte."],
  ["Desenvolvimento esportivo", "Oferecer processos estruturados de iniciação, formação, avaliação e qualificação, respeitando as diferentes etapas de evolução de cada participante e criando condições para seu crescimento técnico, tático, físico e comportamental."],
  ["Meritocracia esportiva com responsabilidade", "Reconhecer dedicação, evolução e desempenho, criando oportunidades compatíveis com o estágio de desenvolvimento de cada jogador, sem perder de vista o caráter educativo, formativo e social do esporte."],
  ["Intercâmbio esportivo", "Ampliar a experiência dos jogadores por meio da participação em atividades, competições, avaliações e vivências esportivas em diferentes cidades, estados e países, promovendo contato com novas metodologias, culturas esportivas, ambientes competitivos e oportunidades de desenvolvimento."],
  ["Oportunidade", "Criar caminhos para que jovens possam avançar em sua trajetória esportiva, ampliando perspectivas de continuidade no futebol, acesso a novas experiências, avaliações especializadas e possibilidades de inserção em ambientes esportivos de maior desenvolvimento."],
  ["Ética e respeito", "Atuar com transparência, integridade e respeito às pessoas, às regras do esporte, às instituições parceiras e às diferentes culturas e ambientes nos quais o Instituto desenvolve suas atividades."],
  ["Compromisso social", "Desenvolver programas capazes de gerar impacto positivo nos participantes, nas famílias, nos territórios e nas comunidades atendidas, utilizando o esporte como instrumento de transformação social, desenvolvimento humano e ampliação de perspectivas."],
] as const;

function QuemSomos() {
  return (
    <>
      <PageHero
        variante="editorial"
        titulo="Formação que transforma. Oportunidades que ampliam caminhos."
        descricao="Fundado em 2007, o IDEX construiu uma trajetória marcada pelo esporte, pela formação de jovens e pela criação de oportunidades."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Quem somos
        </span>
      </PageHero>

      {/* História (texto oficial) */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl">Nossa história</h2>
          <p className="mt-4 text-muted-foreground">
            Ao longo dos anos, o Instituto desenvolveu e aperfeiçoou uma metodologia própria de
            formação esportiva, aplicada em diferentes cidades e realidades sociais. São milhares de
            crianças e jovens atendidos por programas que utilizam o futebol como ferramenta de
            desenvolvimento humano, inclusão, disciplina, convivência e evolução esportiva.
          </p>
          <p className="mt-4 text-muted-foreground">
            Essa experiência acumulada transformou o IDEX em uma instituição com sólido know-how na
            formação de jogadores. Muitos dos jovens que passaram por seus programas seguiram
            avançando no futebol, participando de competições, processos de avaliação, intercâmbios
            esportivos e oportunidades em outros estados e países.
          </p>
          <p className="mt-4 text-muted-foreground">
            A atuação do Instituto acompanha diferentes etapas da trajetória do atleta, desde a
            iniciação esportiva até a qualificação, avaliação e ampliação de oportunidades. Cada
            programa é pensado para contribuir com a evolução do participante dentro e fora de campo.
          </p>
          <p className="mt-4 text-muted-foreground">
            Hoje, o IDEX conecta formação, competição, avaliação, intercâmbio e oportunidade,
            criando caminhos para que crianças e jovens possam desenvolver seu potencial e construir
            novas perspectivas por meio do esporte.
          </p>
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
          <h2 className="text-3xl text-ink-foreground">Compromisso institucional</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="border-t-2 border-primary pt-4">
              <h3 className="text-2xl text-primary">Missão</h3>
              <p className="mt-3 text-ink-foreground/85">
                Promover o desenvolvimento de crianças, adolescentes e jovens por meio do esporte,
                utilizando o futebol como instrumento de formação humana, inclusão social,
                desenvolvimento esportivo, intercâmbio de experiências e criação de oportunidades no
                Brasil e no exterior.
              </p>
            </div>
            <div className="border-t-2 border-primary pt-4">
              <h3 className="text-2xl text-primary">Visão</h3>
              <p className="mt-3 text-ink-foreground/85">
                Ser referência na formação esportiva e social de jovens, reconhecido pela capacidade
                de transformar o acesso ao esporte em trajetórias de desenvolvimento, evolução,
                intercâmbio e novas oportunidades, ampliando horizontes dentro e fora do futebol.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl">Valores</h2>
        <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {VALORES.map(([nome, texto]) => (
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
