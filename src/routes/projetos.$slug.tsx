import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Users, Handshake, Target } from "lucide-react";
import { AREAS, PROJETOS, type Projeto } from "@/data/idex";
import { supabase } from "@/lib/supabase";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import talentoImg from "@/assets/talento-brasil.jpg";
import heroImg from "@/assets/hero-esporte.jpg";
import culturaImg from "@/assets/comunidade-cultura.jpg";

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
            area: (data.area_slug ?? base?.area ?? "esportes") as Projeto["area"],
            ano: data.iniciado_em
              ? new Date(data.iniciado_em).getFullYear()
              : (base?.ano ?? new Date().getFullYear()),
            resumo: data.resumo,
            real: true,
            objetivo: data.descricao || base?.objetivo,
            local: data.local ?? base?.local,
            parceria: data.parceiro ?? base?.parceria,
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
      return { meta: [{ title: "Projeto não encontrado — Instituto IDEX" }, { name: "robots", content: "noindex" }] };
    }
    const { projeto } = loaderData;
    const imagem = projeto.imagem?.startsWith("http") ? projeto.imagem : null;
    return {
      meta: [
        { title: `${projeto.nome} — Projetos | Instituto IDEX` },
        { name: "description", content: projeto.resumo },
        { property: "og:title", content: `${projeto.nome} — Instituto IDEX` },
        { property: "og:description", content: projeto.resumo },
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
  const area = AREAS.find((a) => a.slug === projeto.area);

  const fichas = [
    { icone: Target, titulo: "Objetivo", texto: projeto.objetivo },
    { icone: Users, titulo: "Público", texto: projeto.publico },
    { icone: Handshake, titulo: "Parceria", texto: projeto.parceria },
    { icone: MapPin, titulo: "Local", texto: projeto.local },
    { icone: CalendarDays, titulo: "Lançamento", texto: projeto.lancamento },
  ];

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
            {area?.nome} · {projeto.ano}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-ink-foreground sm:text-6xl">{projeto.nome}</h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/80">{projeto.resumo}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fichas.map((f, i) => (
            <Reveal key={f.titulo} delay={i * 70}>
              <div className="lift h-full rounded-3xl border border-border bg-card p-7">
                <f.icone className="size-6 text-primary" aria-hidden />
                <h2 className="mt-4 text-lg">{f.titulo}</h2>
                {f.texto ? (
                  <p className="mt-2 text-sm text-muted-foreground">{f.texto}</p>
                ) : (
                  <p className="mt-2">
                    <Placeholder>[informação a definir]</Placeholder>
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl">Galeria</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <Placeholder>fotos oficiais do projeto a enviar</Placeholder>
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[projeto.imagem || talentoImg, heroImg, culturaImg].map((src, i) => (
              <Reveal key={i} delay={i * 90}>
                <img
                  src={src}
                  alt={`Registro do projeto ${projeto.nome}`}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className={`w-full rounded-3xl object-cover ${i % 2 === 0 ? "tilt-left" : "tilt-right"}`}
                />
              </Reveal>
            ))}
          </div>
          <Button asChild className="mt-10 rounded-full">
            <Link to="/como-ajudar">Apoiar este projeto</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
