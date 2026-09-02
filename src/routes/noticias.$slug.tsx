import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { NOTICIAS } from "@/data/idex";
import { formatarData } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { SITE_URL, urlAbsoluta, urlNoticia } from "@/lib/site";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { FOTO_TALENTO } from "@/data/fotos";

/** Formato usado pela página, vindo do banco ou do conteúdo fixo de apoio. */
type NoticiaDetalhe = {
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem: string | null;
  /** ISO da publicação, para a metatag article:published_time */
  publicadoEm: string | null;
  data: string;
  /** slug do projeto vinculado (null = notícia geral do instituto) */
  projeto: string | null;
};

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }): Promise<{ noticia: NoticiaDetalhe }> => {
    // Primeiro tenta o banco; se não houver registro, usa a notícia fixa de apoio.
    try {
      const { data } = await supabase
        .from("noticias")
        .select("*")
        .eq("slug", params.slug)
        .eq("publicado", true)
        .maybeSingle();
      if (data) {
        return {
          noticia: {
            slug: data.slug,
            titulo: data.titulo,
            resumo: data.resumo,
            conteudo: data.conteudo,
            imagem: data.imagem_url,
            publicadoEm: data.publicado_em,
            data: formatarData(data.publicado_em),
            projeto: data.projeto_slug,
          },
        };
      }
    } catch {
      // Sem conexão com o banco: seguimos para o conteúdo fixo.
    }

    const fixa = NOTICIAS.find((n) => n.slug === params.slug);
    if (!fixa) throw notFound();
    return {
      noticia: {
        slug: fixa.slug,
        titulo: fixa.titulo,
        resumo: fixa.resumo,
        conteudo: null,
        imagem: null,
        publicadoEm: null,
        data: fixa.data,
        projeto: "talento-brasil",
      },
    };
  },

  head: ({ params, loaderData }) => {
    const url = urlNoticia(params.slug);

    // Sem dados carregados (404, erro ou navegação pendente): não indexar.
    if (!loaderData) {
      return {
        meta: [
          { title: "Notícia indisponível — Instituto IDEX" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const { noticia } = loaderData;
    const titulo = `${noticia.titulo} — Notícias | Instituto IDEX`;
    const imagem = urlAbsoluta(noticia.imagem);

    return {
      meta: [
        { title: titulo },
        { name: "description", content: noticia.resumo },
        { property: "og:title", content: titulo },
        { property: "og:description", content: noticia.resumo },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(noticia.publicadoEm
          ? [{ property: "article:published_time", content: noticia.publicadoEm }]
          : []),
        // Notícia de projeto ganha a seção do projeto; as gerais ficam como "Instituto"
        {
          property: "article:section",
          content: noticia.projeto ? "Projetos" : "Instituto",
        },
        ...(imagem
          ? [
              { property: "og:image", content: imagem },
              { name: "twitter:image", content: imagem },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: noticia.titulo,
            description: noticia.resumo,
            mainEntityOfPage: url,
            ...(imagem ? { image: [imagem] } : {}),
            ...(noticia.publicadoEm ? { datePublished: noticia.publicadoEm } : {}),
            author: { "@type": "Organization", name: "Instituto IDEX", url: SITE_URL },
            publisher: { "@type": "Organization", name: "Instituto IDEX", url: SITE_URL },
          }),
        },
      ],
    };
  },

  component: NoticiaDetalhePagina,
  notFoundComponent: NoticiaNaoEncontrada,
});

function NoticiaDetalhePagina() {
  const { noticia } = Route.useLoaderData();
  const capa = noticia.imagem ?? FOTO_TALENTO.url;

  return (
    <article>
      <section className="relative overflow-hidden pt-28 pb-16">
        <Imagem
          foto={noticia.imagem ? undefined : FOTO_TALENTO}
          src={noticia.imagem ?? undefined}
          alt={noticia.titulo}
          prioridade
          sizes="100vw"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-sm text-ink-foreground/80 hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Todas as notícias
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-widest text-primary uppercase">
            {noticia.data}
          </p>
          <h1 className="mt-3 text-3xl text-ink-foreground sm:text-5xl">{noticia.titulo}</h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/80">{noticia.resumo}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          {noticia.conteudo ? (
            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              {noticia.conteudo.split(/\n{2,}/).map((paragrafo, i) => (
                <p key={i}>{paragrafo}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              O texto completo desta notícia ainda não foi publicado.
            </p>
          )}
        </Reveal>

      </section>
    </article>
  );
}

function NoticiaNaoEncontrada() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6">
      <h1 className="text-3xl">Notícia não encontrada</h1>
      <p className="mt-3 text-muted-foreground">
        Ela pode ter sido despublicada ou o endereço está incorreto.
      </p>
      <Link to="/noticias" className="mt-6 inline-block font-semibold text-primary hover:underline">
        Voltar para as notícias
      </Link>
    </section>
  );
}
