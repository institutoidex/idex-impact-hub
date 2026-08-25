import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, Newspaper, FolderKanban } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSessao } from "@/hooks/useSessao";
import {
  formatarData,
  mensagensQuery,
  noticiasAdminQuery,
  projetosQuery,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  ssr: false, // a sessão fica no navegador; nada a renderizar no servidor
  head: () => ({
    meta: [
      { title: "Painel — Instituto IDEX" },
      { name: "description", content: "Painel interno do Instituto IDEX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel — Instituto IDEX" },
      { property: "og:description", content: "Painel interno do instituto." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { sessao, carregando, usuario } = useSessao();

  // Sem sessão, volta para o login
  useEffect(() => {
    if (!carregando && !sessao) navigate({ to: "/auth", replace: true });
  }, [carregando, sessao, navigate]);

  const logado = Boolean(sessao);
  const mensagens = useQuery({ ...mensagensQuery, enabled: logado });
  const noticias = useQuery({ ...noticiasAdminQuery, enabled: logado });
  const projetos = useQuery({ ...projetosQuery, enabled: logado });

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (carregando || !sessao) {
    return <div className="px-4 py-32 text-center text-muted-foreground">Carregando painel...</div>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Painel interno
          </span>
          <h1 className="mt-2 text-4xl">Conteúdo do site</h1>
          <p className="mt-2 text-sm text-muted-foreground">Conectado como {usuario?.email}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={sair}>
          <LogOut className="size-4" /> Sair
        </Button>
      </div>

      <Tabs defaultValue="mensagens" className="mt-10">
        <TabsList>
          <TabsTrigger value="mensagens">
            <Mail className="size-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger value="noticias">
            <Newspaper className="size-4" /> Notícias
          </TabsTrigger>
          <TabsTrigger value="projetos">
            <FolderKanban className="size-4" /> Projetos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens" className="mt-6 space-y-4">
          {mensagens.isLoading && <Vazio texto="Carregando mensagens..." />}
          {mensagens.error && <Vazio texto="Sem permissão ou tabela ainda não criada." />}
          {mensagens.data?.length === 0 && <Vazio texto="Nenhuma mensagem recebida ainda." />}
          {mensagens.data?.map((m) => (
            <article key={m.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">{m.assunto || "Sem assunto"}</h2>
                <span className="text-xs text-muted-foreground">{formatarData(m.criado_em)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.nome} — {m.email}
                {m.telefone ? ` — ${m.telefone}` : ""}
              </p>
              <p className="mt-3 text-sm whitespace-pre-line">{m.mensagem}</p>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="noticias" className="mt-6 space-y-4">
          {noticias.error && <Vazio texto="Tabela de notícias ainda não criada." />}
          {noticias.data?.length === 0 && <Vazio texto="Nenhuma notícia cadastrada." />}
          {noticias.data?.map((n) => (
            <article
              key={n.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-border bg-card p-6"
            >
              <span>
                <h2 className="text-lg">{n.titulo}</h2>
                <p className="text-sm text-muted-foreground">{n.resumo}</p>
              </span>
              <span className="text-xs text-muted-foreground">
                {n.publicado ? "Publicada" : "Rascunho"} · {formatarData(n.publicado_em)}
              </span>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="projetos" className="mt-6 space-y-4">
          {projetos.error && <Vazio texto="Tabela de projetos ainda não criada." />}
          {projetos.data?.length === 0 && <Vazio texto="Nenhum projeto cadastrado." />}
          {projetos.data?.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-border bg-card p-6"
            >
              <span>
                <h2 className="text-lg">{p.titulo}</h2>
                <p className="text-sm text-muted-foreground">{p.resumo}</p>
              </span>
              <span className="text-xs text-muted-foreground">{p.status}</span>
            </article>
          ))}
        </TabsContent>
      </Tabs>

      <p className="mt-10 text-xs text-muted-foreground">
        A edição de conteúdo é feita direto no banco por enquanto. Posso montar telas de
        criação/edição aqui quando você quiser.
      </p>
    </section>
  );
}

/** Bloco simples de estado vazio/erro do painel. */
function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-sm text-muted-foreground">
      {texto}
    </p>
  );
}
