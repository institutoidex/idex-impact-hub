import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/idex";
import { supabase } from "@/lib/supabase";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { Imagem } from "@/components/Imagem";
import GaleriaLightbox from "@/components/GaleriaLightbox";
import { FOTO_TALENTO, GALERIA } from "@/data/fotos";
import { normalizarLocale } from "@/i18n/locales";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { seoPagina } from "@/i18n/seo";
import { traduzir } from "@/i18n/traduzir";
import { projetos as catalogoProjetos } from "@/i18n/catalogos/projetos";
import { AvisoPortugues, MarcaPortugues } from "@/components/AvisoPortugues";

/** Projeto carregado, com as traduções editoriais (jsonb) usadas por traduzir(). */
type ProjetoDados = Projeto & { traducoes?: unknown };

// Template de detalhe de projeto: lê do banco e cai para o conteúdo fixo.
export const Route = createFileRoute("/projetos/$slug")({
  loader: async ({ params }): Promise<{ projeto: ProjetoDados }> => {
    const base = PROJETOS.find((p) => p.slug === params.slug);
    try {
      const { data } = await supabase
        .from("projetos")
        .select("*")
        .eq("slug", params.slug)
        .eq("publicado", true)
        .maybeSingle();
      if (data) {
        return {
          projeto: {
            ...(base ?? ({} as Projeto)),
            slug: data.slug,
            nome: data.titulo,
            ano: data.iniciado_em
              ? new Date(data.iniciado_em).getFullYear()
              : (base?.ano ?? new Date().getFullYear()),
            resumo: data.resumo,
            real: true,
            objetivo: data.descricao || base?.objetivo,
            // capa enviada pelo painel
            imagem: data.imagem_url,
            traducoes: data.traducoes,
          } as ProjetoDados,
        };
      }
    } catch {
      // banco indisponível: seguimos com o conteúdo fixo
    }
    if (!base) throw notFound();
    return { projeto: base };
  },
  head: ({ params, match, loaderData }) => {
    const locale = normalizarLocale(match.search.lang);
    const t = catalogoProjetos[locale];
    if (!loaderData) {
      return {
        meta: [{ title: t.detalhe.naoEncontrado }, { name: "robots", content: "noindex" }],
      };
    }
    const { projeto } = loaderData;
    // Campos vindos do banco (titulo/resumo/descricao) traduzidos; nome/objetivo já
    // mapeiam para titulo/descricao no loader, então usamos esses rótulos de volta.
    const traduzido = traduzir(
      { titulo: projeto.nome, resumo: projeto.resumo, descricao: projeto.objetivo, traducoes: (projeto as ProjetoDados).traducoes },
      locale,
      ["titulo", "resumo", "descricao"],
    );
    const imagem = projeto.imagem?.startsWith("http") ? projeto.imagem : null;
    const s = seoPagina({
      lang: match.search.lang,
      caminho: `/projetos/${params.slug}`,
      titulo: `${traduzido.titulo} — Projetos | Instituto IDEX`,
      descricao: traduzido.resumo,
      tipo: "article",
      imagem,
    });
    return { meta: s.meta, links: s.links };
  },
  component: ProjetoDetalhe,
});

function ProjetoDetalhe() {
  const { projeto } = Route.useLoaderData();
  const locale = useLocale();
  const t = useMensagens(catalogoProjetos);
  const traduzido = traduzir(
    { titulo: projeto.nome, resumo: projeto.resumo, descricao: projeto.objetivo, traducoes: (projeto as ProjetoDados).traducoes },
    locale,
    ["titulo", "resumo", "descricao"],
  );

  return (
    <>
      <section className="relative overflow-hidden pt-28 pb-16">
        <Imagem
          foto={projeto.imagem ? undefined : FOTO_TALENTO}
          src={projeto.imagem || undefined}
          alt={t.detalhe.altFoto(traduzido.titulo)}
          prioridade
          sizes="100vw"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 text-sm text-ink-foreground/80 hover:text-primary"
          >
            <ArrowLeft className="size-4" /> {t.detalhe.voltar}
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-widest text-primary uppercase">
            {projeto.ano}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-ink-foreground sm:text-6xl">
            {traduzido.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/80">{traduzido.resumo}</p>
        </div>
      </section>

      {/* Texto do projeto — mesma leitura simples das notícias */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {traduzido.emPortugues && <AvisoPortugues className="mb-4" />}
        <Reveal>
          {traduzido.descricao ? (
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              {traduzido.descricao.split("\n").filter(Boolean).map((paragrafo, i) => (
                <p key={i}>{paragrafo}</p>
              ))}
            </div>
          ) : (
            <Placeholder>{t.detalhe.semTexto}</Placeholder>
          )}
        </Reveal>

        <Reveal className="mt-10">
          <Button asChild variant="idex">
            <Link to="/como-ajudar">{t.detalhe.apoiar}</Link>
          </Button>
        </Reveal>
      </section>

      {/* Galeria de fotos do projeto (apenas Talento Brasil, que tem acervo) */}
      {projeto.slug === "talento-brasil" && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl">{t.detalhe.galeria}</h2>
          </Reveal>
          <GaleriaLightbox fotos={GALERIA} className="mt-8" />
        </section>
      )}
    </>
  );
}
