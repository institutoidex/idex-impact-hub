import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NOTICIAS } from "@/data/idex";
import { formatarData, noticiasQuery } from "@/lib/queries";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import talentoImg from "@/assets/talento-brasil.jpg";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Instituto IDEX" },
      {
        name: "description",
        content:
          "Notícias do Instituto IDEX, incluindo o lançamento do projeto Talento Brasil em 26/06/2017.",
      },
      { property: "og:title", content: "Notícias — Instituto IDEX" },
      { property: "og:description", content: "Acompanhe as novidades do instituto." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  // Busca no banco; se ainda não houver registros, mostra o conteúdo fixo atual.
  const { data } = useQuery(noticiasQuery());

  const itens =
    data && data.length > 0
      ? data.map((n) => ({
          slug: n.slug,
          titulo: n.titulo,
          resumo: n.resumo,
          data: formatarData(n.publicado_em),
          imagem: n.imagem_url ?? talentoImg,
        }))
      : NOTICIAS.map((n) => ({
          slug: n.slug,
          titulo: n.titulo,
          resumo: n.resumo,
          data: n.data,
          imagem: talentoImg,
        }));

  const vazios = Math.max(0, 6 - itens.length);

  return (
    <>
      <PageHero
        titulo="O que anda acontecendo"
        descricao="Registros das ações e anúncios do instituto."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Notícias
        </span>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {itens.map((n, i) => (
            <Reveal as="article" key={n.slug} delay={i * 80}>
              <div className="lift h-full overflow-hidden rounded-3xl border border-border bg-card">
                <img
                  src={n.imagem}
                  alt={n.titulo}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-7">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {n.data}
                  </p>
                  <h2 className="mt-2 text-xl">{n.titulo}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{n.resumo}</p>
                  <Link
                    to="/projetos/$slug"
                    params={{ slug: "talento-brasil" }}
                    className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    Ver o projeto
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}

          {Array.from({ length: vazios }).map((_, i) => (
            <Reveal as="article" key={`vazio-${i}`} delay={(i + 1) * 70}>
              <div className="flex h-full min-h-64 flex-col justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-7">
                <Placeholder>notícia em breve</Placeholder>
                <p className="mt-3 text-sm text-muted-foreground">
                  Espaço reservado para os próximos conteúdos.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
