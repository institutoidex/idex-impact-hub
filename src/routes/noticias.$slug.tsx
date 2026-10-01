import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE_URL, urlAbsoluta, urlNoticia } from "@/lib/site";
import { formatarData } from "@/i18n/formatar";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { normalizarLocale } from "@/i18n/locales";
import { traduzir } from "@/i18n/traduzir";
import { seoPagina } from "@/i18n/seo";
import { noticias as catalogoNoticias } from "@/i18n/catalogos/noticias";
import { comum } from "@/i18n/catalogos/comum";
import { Imagem } from "@/components/Imagem";
import { Reveal } from "@/components/Reveal";
import { FOTO_TALENTO } from "@/data/fotos";

/** Formato usado pela página, vindo sempre do banco (somente publicadas). */
type NoticiaDetalhe = {
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem: string | null;
  /** ISO da publicação, para a metatag article:published_time */
  publicadoEm: string | null;
  /** slug do projeto vinculado (null = notícia geral do instituto) */
  projeto: string | null;
  /** traduções editoriais (jsonb) usadas por traduzir() */
  traducoes?: unknown;
};

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }): Promise<{ noticia: NoticiaDetalhe }> => {
    // Regra: só existe página para notícia PUBLICADA no banco.
    // Falha de conexão vira erro (tela de erro), nunca conteúdo fixo;
    // notícia inexistente ou despublicada vira 404.
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("slug", params.slug)
      .eq("publicado", true)
      .maybeSingle();
    if (error) throw new Error("Não foi possível carregar a notícia agora.");
    if (!data) throw notFound();
    return {
      noticia: {
        slug: data.slug,
        titulo: data.titulo,
        resumo: data.resumo,
        conteudo: data.conteudo,
        imagem: data.imagem_url,
        publicadoEm: data.publicado_em,
        projeto: data.projeto_slug,
        traducoes: data.traducoes,
      },
    };
  },

  head: ({ params, match, loaderData }) => {
    const url = urlNoticia(params.slug);
    const locale = normalizarLocale(match.search.lang);
    const m = catalogoNoticias[locale];

    // Sem dados carregados (404, erro ou navegação pendente): não indexar.
    if (!loaderData) {
      return {
        meta: [{ title: m.detalhe.indisponivel }, { name: "robots", content: "noindex" }],
      };
    }

    const { noticia } = loaderData;
    const traduzida = traduzir(noticia, locale, ["titulo", "resumo"]);
    const titulo = `${traduzida.titulo} — ${m.detalhe.tituloSeoSufixo} | Instituto IDEX`;
    const imagem = urlAbsoluta(noticia.imagem);

    const s = seoPagina({
      lang: match.search.lang,
      caminho: `/noticias/${params.slug}`,
      titulo,
      descricao: traduzida.resumo,
      tipo: "article",
      imagem,
    });

    return {
      meta: [
        ...s.meta,
        ...(noticia.publicadoEm
          ? [{ property: "article:published_time", content: noticia.publicadoEm }]
          : []),
        // Notícia de projeto ganha a seção do projeto; as gerais ficam como "Instituto"
        {
          property: "article:section",
          content: noticia.projeto ? m.detalhe.secaoProjetos : m.detalhe.secaoInstituto,
        },
      ],
      links: s.links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: traduzida.titulo,
            description: traduzida.resumo,
            mainEntityOfPage: url,
            inLanguage: locale,
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
  errorComponent: NoticiaErro,
  notFoundComponent: NoticiaNaoEncontrada,
});

function NoticiaDetalhePagina() {
  const { noticia } = Route.useLoaderData();
  const locale = useLocale();
  const m = useMensagens(catalogoNoticias);
  const mc = useMensagens(comum);
  const traduzida = traduzir(noticia, locale, ["titulo", "resumo", "conteudo"]);
  const capa = noticia.imagem ?? FOTO_TALENTO.url;

  return (
    <article>
      <section className="relative overflow-hidden pt-28 pb-16">
        <Imagem
          foto={noticia.imagem ? undefined : FOTO_TALENTO}
          src={noticia.imagem ?? undefined}
          alt={traduzida.titulo}
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
            <ArrowLeft className="size-4" /> {m.detalhe.voltar}
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-widest text-primary uppercase">
            {formatarData(noticia.publicadoEm, locale)}
          </p>
          {/* Título com o mesmo fundo translúcido do resumo */}
          <h1 className="mt-3 w-fit max-w-3xl rounded-2xl border border-ink-foreground/15 bg-ink/60 px-5 py-4 text-3xl text-ink-foreground backdrop-blur-sm sm:text-5xl sm:px-6 sm:py-5">
            {traduzida.titulo}
          </h1>
          {/* Resumo em card, para destacar sobre a foto */}
          <p className="mt-4 max-w-2xl rounded-2xl border border-ink-foreground/15 bg-ink/60 px-5 py-4 text-ink-foreground/85 backdrop-blur-sm">
            {traduzida.resumo}
          </p>
        </div>
      </section>

      {/* Texto completo em card com borda */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {traduzida.emPortugues && (
          <p className="mb-4 text-xs text-muted-foreground italic">{mc.emPortugues}</p>
        )}
        <Reveal>
          {traduzida.conteudo ? (
            <div
              className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
              lang={traduzida.emPortugues ? "pt-BR" : undefined}
            >
              <div className="space-y-4 text-base leading-relaxed text-foreground/90">
                {traduzida.conteudo.split(/\n{2,}/).map((paragrafo, i) => (
                  <p key={i}>{paragrafo}</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{m.detalhe.semConteudo}</p>
          )}
        </Reveal>

      </section>
    </article>
  );
}

function NoticiaNaoEncontrada() {
  const m = useMensagens(catalogoNoticias);
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6">
      <h1 className="text-3xl">{m.detalhe.naoEncontrada.titulo}</h1>
      <p className="mt-3 text-muted-foreground">{m.detalhe.naoEncontrada.texto}</p>
      <Link to="/noticias" className="mt-6 inline-block font-semibold text-primary hover:underline">
        {m.detalhe.naoEncontrada.voltar}
      </Link>
    </section>
  );
}

/** Falha de conexão com o banco: não confundir com notícia inexistente. */
function NoticiaErro() {
  const m = useMensagens(catalogoNoticias);
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6">
      <h1 className="text-3xl">{m.detalhe.erro.titulo}</h1>
      <p className="mt-3 text-muted-foreground">{m.detalhe.erro.texto}</p>
      <Link to="/noticias" className="mt-6 inline-block font-semibold text-primary hover:underline">
        {m.detalhe.erro.voltar}
      </Link>
    </section>
  );
}
