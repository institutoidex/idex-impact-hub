import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, Newspaper, FolderKanban, Plus, Pencil, Trash2, History } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSessao } from "@/hooks/useSessao";
import {
  formatarData,
  mensagensQuery,
  noticiasAdminQuery,
  projetosAdminQuery,
} from "@/lib/queries";
import { useAlternarPublicacao, useApagarRegistro } from "@/lib/mutations";
import { Historico } from "@/components/admin/Historico";
import { EditorNoticia } from "@/components/admin/EditorNoticia";
import { EditorProjeto } from "@/components/admin/EditorProjeto";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { NoticiaRow, ProjetoRow } from "@/lib/db-types";

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
  const projetos = useQuery({ ...projetosAdminQuery, enabled: logado });

  // Estado dos editores e da confirmação de exclusão
  const [editorNoticia, setEditorNoticia] = useState<{ aberto: boolean; item: NoticiaRow | null }>({
    aberto: false,
    item: null,
  });
  const [editorProjeto, setEditorProjeto] = useState<{ aberto: boolean; item: ProjetoRow | null }>({
    aberto: false,
    item: null,
  });
  const [aExcluir, setAExcluir] = useState<{
    tabela: "noticias" | "projetos";
    id: string;
    titulo: string;
  } | null>(null);

  const publicarNoticia = useAlternarPublicacao("noticias");
  const publicarProjeto = useAlternarPublicacao("projetos");
  const apagarNoticia = useApagarRegistro("noticias");
  const apagarProjeto = useApagarRegistro("projetos");

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function confirmarExclusao() {
    if (!aExcluir) return;
    if (aExcluir.tabela === "noticias") apagarNoticia.mutate(aExcluir.id);
    else apagarProjeto.mutate(aExcluir.id);
    setAExcluir(null);
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

      <Tabs defaultValue="noticias" className="mt-10">
        <TabsList>
          <TabsTrigger value="noticias">
            <Newspaper className="size-4" /> Notícias
          </TabsTrigger>
          <TabsTrigger value="projetos">
            <FolderKanban className="size-4" /> Projetos
          </TabsTrigger>
          <TabsTrigger value="mensagens">
            <Mail className="size-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="size-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Notícias ---------------- */}
        <TabsContent value="noticias" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => setEditorNoticia({ aberto: true, item: null })}
            >
              <Plus className="size-4" /> Nova notícia
            </Button>
          </div>

          {noticias.isLoading && <Vazio texto="Carregando notícias..." />}
          {noticias.error && <Vazio texto="Não foi possível carregar as notícias." />}
          {noticias.data?.length === 0 && <Vazio texto="Nenhuma notícia cadastrada ainda." />}

          {noticias.data?.map((n) => (
            <article
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="min-w-56 flex-1">
                <h2 className="text-lg">{n.titulo}</h2>
                <p className="text-sm text-muted-foreground">{n.resumo}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatarData(n.publicado_em)} · /{n.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={n.publicado}
                    onCheckedChange={(v) =>
                      publicarNoticia.mutate({ id: n.id, publicado: v })
                    }
                  />
                  {n.publicado ? "Publicada" : "Rascunho"}
                </label>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Editar ${n.titulo}`}
                  onClick={() => setEditorNoticia({ aberto: true, item: n })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Apagar ${n.titulo}`}
                  onClick={() =>
                    setAExcluir({ tabela: "noticias", id: n.id, titulo: n.titulo })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Projetos ---------------- */}
        <TabsContent value="projetos" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => setEditorProjeto({ aberto: true, item: null })}
            >
              <Plus className="size-4" /> Novo projeto
            </Button>
          </div>

          {projetos.isLoading && <Vazio texto="Carregando projetos..." />}
          {projetos.error && <Vazio texto="Não foi possível carregar os projetos." />}
          {projetos.data?.length === 0 && <Vazio texto="Nenhum projeto cadastrado ainda." />}

          {projetos.data?.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="min-w-56 flex-1">
                <h2 className="text-lg">{p.titulo}</h2>
                <p className="text-sm text-muted-foreground">{p.resumo}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.status} · /{p.slug}
                  {p.destaque ? " · destaque" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={p.publicado}
                    onCheckedChange={(v) =>
                      publicarProjeto.mutate({ id: p.id, publicado: v })
                    }
                  />
                  {p.publicado ? "Publicado" : "Rascunho"}
                </label>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Editar ${p.titulo}`}
                  onClick={() => setEditorProjeto({ aberto: true, item: p })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Apagar ${p.titulo}`}
                  onClick={() =>
                    setAExcluir({ tabela: "projetos", id: p.id, titulo: p.titulo })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Mensagens ---------------- */}
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

        {/* ---------------- Histórico / auditoria ---------------- */}
        <TabsContent value="historico" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Registro de tudo que foi criado, editado, publicado ou apagado no site.
          </p>
          <Historico />
        </TabsContent>
      </Tabs>

      <EditorNoticia
        aberto={editorNoticia.aberto}
        noticia={editorNoticia.item}
        aoFechar={() => setEditorNoticia({ aberto: false, item: null })}
      />
      <EditorProjeto
        aberto={editorProjeto.aberto}
        projeto={editorProjeto.item}
        aoFechar={() => setEditorProjeto({ aberto: false, item: null })}
      />

      <AlertDialog open={Boolean(aExcluir)} onOpenChange={(v) => !v && setAExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar “{aExcluir?.titulo}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita e o conteúdo some do site na hora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
