import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/idex";
import { supabase } from "@/lib/supabase";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import talentoImg from "@/assets/talento-brasil.jpg";

// Template de detalhe de projeto: lê do banco e cai para o conteúdo fixo.
export const Route = createFileRoute("/projetos/$slug")({
  loader: async ({ params }): Promise<{ projeto: Projeto }> => {
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
          } as Projeto,
        };
      }
    } catch {
      // banco indisponível: seguimos com o conteúdo fixo
    }
    if (!base) throw notFound();
    return { projeto: base };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Projeto não encontrado — Instituto IDEX" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { projeto } = loaderData;
    const imagem = projeto.imagem?.startsWith("http") ? projeto.imagem : null;
    return {
      meta: [
        { title: `${projeto.nome} — Projetos | Instituto IDEX` },
        { name: "description", content: projeto.resumo },
        { property: "og:title", content: `${projeto.nome} — Instituto IDEX` },
        { property: "og:description", content: projeto.resumo },
        { property: "og:type", content: "article" },
        ...(imagem
          ? [
              { property: "og:image", content: imagem },
              { name: "twitter:image", content: imagem },
            ]
          : []),
      ],
    };
  },
  component: ProjetoDetalhe,
});

function ProjetoDetalhe() {
  const { projeto } = Route.useLoaderData();

  return (
    <>
      <section className="relative overflow-hidden pt-28 pb-16">
        <img
          src={projeto.imagem || talentoImg}
          alt={`Foto do projeto ${projeto.nome}`}
          width={1400}
          height={900}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 text-sm text-ink-foreground/80 hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Todos os projetos
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-widest text-primary uppercase">
            {projeto.ano}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-ink-foreground sm:text-6xl">{projeto.nome}</h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/80">{projeto.resumo}</p>
        </div>
      </section>

      {/* Texto do projeto — mesma leitura simples das notícias */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          {projeto.objetivo ? (
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              {projeto.objetivo.split("\n").filter(Boolean).map((paragrafo, i) => (
                <p key={i}>{paragrafo}</p>
              ))}
            </div>
          ) : (
            <Placeholder>[texto do projeto a definir]</Placeholder>
          )}
        </Reveal>

        <Reveal className="mt-10">
          <Button asChild className="rounded-full">
            <Link to="/como-ajudar">Apoiar este projeto</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
