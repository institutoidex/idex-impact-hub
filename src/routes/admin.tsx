import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Newspaper,
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  History,
  Images,
  FileText,
  LayoutGrid,
  Gauge,
  ExternalLink,
  MailOpen,
} from "lucide-react";

import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/lib/supabase";
import {
  documentosAdminQuery,
  formatarData,
  mensagensQuery,
  midiaQuery,
  noticiasAdminQuery,
  projetosAdminQuery,
} from "@/lib/queries";
import {
  useAlternarPublicacao,
  useApagarRegistro,
  useDocumentoAcoes,
  useMensagemAcoes,
} from "@/lib/mutations";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { GuardaAdmin } from "@/components/admin/GuardaAdmin";
import { Historico } from "@/components/admin/Historico";
import { EditorNoticia } from "@/components/admin/EditorNoticia";
import { EditorProjeto } from "@/components/admin/EditorProjeto";
import { EditorDocumento } from "@/components/admin/EditorDocumento";
import { BibliotecaMidia } from "@/components/admin/BibliotecaMidia";
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
import type { DocumentoRow, NoticiaRow, ProjetoRow } from "@/lib/db-types";

export const Route = createFileRoute("/admin")({
  ssr: false, // a sessão fica no navegador; nada a renderizar no servidor
  /**
   * Proteção no nível do roteador: roda ANTES de renderizar qualquer coisa.
   * Sem sessão válida, redireciona para o login (/auth) levando o motivo na
   * URL — a tela de login exibe o aviso discreto (o beforeLoad roda antes do
   * Toaster existir, então o aviso precisa ser disparado lá).
   * A verificação do papel `admin` continua no GuardaAdmin (defesa em camadas).
   */
  beforeLoad: async () => {
    // getSession() lê a sessão do armazenamento local (instantâneo);
    // getUser() faria uma ida ao servidor e atrasava a abertura do painel.
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth", search: { motivo: "restrito" }, replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Painel — Instituto IDEX" },
      { name: "description", content: "Painel interno do Instituto IDEX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel — Instituto IDEX" },
      { property: "og:description", content: "Painel interno do instituto." },
    ],
  }),
  component: PainelProtegido,
});

// Envolve o painel com a proteção de rota (sessão + papel admin)
function PainelProtegido() {
  return (
    <GuardaAdmin>
      <Painel />
    </GuardaAdmin>
  );
}

type Exclusao = {
  tabela: "noticias" | "projetos" | "documentos" | "mensagens";
  id: string;
  titulo: string;
};

function Painel() {
  const { sessao } = useSessao();
  const logado = Boolean(sessao);
  const mensagens = useQuery({ ...mensagensQuery, enabled: logado });
  const noticias = useQuery({ ...noticiasAdminQuery, enabled: logado });
  const projetos = useQuery({ ...projetosAdminQuery, enabled: logado });
  const documentos = useQuery({ ...documentosAdminQuery, enabled: logado });
  const midia = useQuery({ ...midiaQuery, enabled: logado });

  // Estado dos editores e da confirmação de exclusão
  const [editorNoticia, setEditorNoticia] = useState<{ aberto: boolean; item: NoticiaRow | null }>({
    aberto: false,
    item: null,
  });
  const [editorProjeto, setEditorProjeto] = useState<{ aberto: boolean; item: ProjetoRow | null }>({
    aberto: false,
    item: null,
  });
  const [editorDocumento, setEditorDocumento] = useState<{
    aberto: boolean;
    item: DocumentoRow | null;
  }>({ aberto: false, item: null });
  const [aExcluir, setAExcluir] = useState<Exclusao | null>(null);

  const publicarNoticia = useAlternarPublicacao("noticias");
  const publicarProjeto = useAlternarPublicacao("projetos");
  const apagarNoticia = useApagarRegistro("noticias");
  const apagarProjeto = useApagarRegistro("projetos");
  const acoesDocumento = useDocumentoAcoes();
  const acoesMensagem = useMensagemAcoes();

  function confirmarExclusao() {
    if (!aExcluir) return;
    if (aExcluir.tabela === "noticias") apagarNoticia.mutate(aExcluir.id);
    if (aExcluir.tabela === "projetos") apagarProjeto.mutate(aExcluir.id);
    if (aExcluir.tabela === "documentos") acoesDocumento.apagar.mutate(aExcluir.id);
    if (aExcluir.tabela === "mensagens") acoesMensagem.apagar.mutate(aExcluir.id);
    setAExcluir(null);
  }

  const naoLidas = (mensagens.data ?? []).filter((m) => !m.lida).length;

  return (
    <>
      <AdminHeader />
      <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
        <div>
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Painel interno
          </span>
          <h1 className="mt-2 text-4xl">Gerenciar o site</h1>
        </div>

        <Tabs defaultValue="visao" className="mt-10">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="visao">
            <Gauge className="size-4" /> Visão geral
          </TabsTrigger>
          <TabsTrigger value="projetos">
            <FolderKanban className="size-4" /> Projetos
          </TabsTrigger>
          <TabsTrigger value="noticias">
            <Newspaper className="size-4" /> Notícias
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="size-4" /> Documentos
          </TabsTrigger>
          <TabsTrigger value="midia">
            <Images className="size-4" /> Imagens
          </TabsTrigger>
          <TabsTrigger value="mensagens">
            <Mail className="size-4" /> Mensagens
            {naoLidas > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                {naoLidas}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="size-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Visão geral ---------------- */}
        <TabsContent value="visao" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Cartao
              titulo="Projetos"
              total={projetos.data?.length}
              detalhe={`${(projetos.data ?? []).filter((p) => p.publicado).length} publicados`}
            />
            <Cartao
              titulo="Notícias"
              total={noticias.data?.length}
              detalhe={`${(noticias.data ?? []).filter((n) => n.publicado).length} publicadas`}
            />
            <Cartao
              titulo="Documentos"
              total={documentos.data?.length}
              detalhe={`${(documentos.data ?? []).filter((d) => d.publicado).length} no site`}
            />
            <Cartao
              titulo="Imagens"
              total={midia.data?.length}
              detalhe="na biblioteca de mídia"
            />
            <Cartao
              titulo="Mensagens"
              total={mensagens.data?.length}
              detalhe={`${naoLidas} sem ler`}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg">Últimas alterações</h2>
            <div className="mt-4">
              <Historico limite={5} />
            </div>
          </div>
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
              {p.imagem_url && (
                <img
                  src={p.imagem_url}
                  alt=""
                  className="h-16 w-24 rounded-xl object-cover"
                  loading="lazy"
                />
              )}
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
                    onCheckedChange={(v) => publicarProjeto.mutate({ id: p.id, publicado: v })}
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
                  onClick={() => setAExcluir({ tabela: "projetos", id: p.id, titulo: p.titulo })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

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
              {n.imagem_url && (
                <img
                  src={n.imagem_url}
                  alt=""
                  className="h-16 w-24 rounded-xl object-cover"
                  loading="lazy"
                />
              )}
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
                    onCheckedChange={(v) => publicarNoticia.mutate({ id: n.id, publicado: v })}
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
                  onClick={() => setAExcluir({ tabela: "noticias", id: n.id, titulo: n.titulo })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Documentos ---------------- */}
        <TabsContent value="documentos" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => setEditorDocumento({ aberto: true, item: null })}
            >
              <Plus className="size-4" /> Novo documento
            </Button>
          </div>

          {documentos.isLoading && <Vazio texto="Carregando documentos..." />}
          {documentos.error && <Vazio texto="Não foi possível carregar os documentos." />}
          {documentos.data?.length === 0 && <Vazio texto="Nenhum documento cadastrado ainda." />}

          {documentos.data?.map((d) => (
            <article
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="min-w-56 flex-1">
                <h2 className="text-lg">{d.titulo}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.categoria}
                  {d.ano ? ` · ${d.ano}` : ""}
                  {d.arquivo_url ? "" : " · sem arquivo anexado"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={d.publicado}
                    onCheckedChange={(v) =>
                      acoesDocumento.publicar.mutate({ id: d.id, publicado: v })
                    }
                  />
                  {d.publicado ? "No site" : "Oculto"}
                </label>
                {d.arquivo_url && (
                  <Button size="icon" variant="outline" className="rounded-full" asChild>
                    <a
                      href={d.arquivo_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir ${d.titulo}`}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Editar ${d.titulo}`}
                  onClick={() => setEditorDocumento({ aberto: true, item: d })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Apagar ${d.titulo}`}
                  onClick={() => setAExcluir({ tabela: "documentos", id: d.id, titulo: d.titulo })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Biblioteca de imagens ---------------- */}
        <TabsContent value="midia" className="mt-6">
          <BibliotecaMidia />
        </TabsContent>

        {/* ---------------- Mensagens ---------------- */}
        <TabsContent value="mensagens" className="mt-6 space-y-4">
          {mensagens.isLoading && <Vazio texto="Carregando mensagens..." />}
          {mensagens.error && <Vazio texto="Sem permissão ou tabela ainda não criada." />}
          {mensagens.data?.length === 0 && <Vazio texto="Nenhuma mensagem recebida ainda." />}
          {mensagens.data?.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl border bg-card p-6 ${
                m.lida ? "border-border" : "border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">{m.assunto || "Sem assunto"}</h2>
                <span className="text-xs text-muted-foreground">{formatarData(m.criado_em)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.nome} — {m.email}
                {m.telefone ? ` — ${m.telefone}` : ""}
              </p>
              <p className="mt-3 text-sm whitespace-pre-line">{m.mensagem}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => acoesMensagem.marcarLida.mutate({ id: m.id, lida: !m.lida })}
                >
                  <MailOpen className="size-4" />
                  {m.lida ? "Marcar como não lida" : "Marcar como lida"}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <a href={`mailto:${m.email}`}>
                    <Mail className="size-4" /> Responder
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() =>
                    setAExcluir({
                      tabela: "mensagens",
                      id: m.id,
                      titulo: m.assunto || `Mensagem de ${m.nome}`,
                    })
                  }
                >
                  <Trash2 className="size-4" /> Apagar
                </Button>
              </div>
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
      <EditorDocumento
        aberto={editorDocumento.aberto}
        documento={editorDocumento.item}
        aoFechar={() => setEditorDocumento({ aberto: false, item: null })}
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
    </>
  );
}

/** Cartão de número da visão geral. */
function Cartao({
  titulo,
  total,
  detalhe,
}: {
  titulo: string;
  total: number | undefined;
  detalhe: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-display text-4xl">{total ?? "—"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>
    </div>
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
