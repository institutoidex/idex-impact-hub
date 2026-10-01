import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Newspaper,
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  History,
  Images,
  FileText,
  Gauge,
  ExternalLink,
  MailOpen,
} from "lucide-react";

import { formatarData, formatarDataHora } from "@/i18n/formatar";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/lib/supabase";
import {
  documentosAdminQuery,
  mensagensQuery,
  midiaQuery,
  noticiasAdminQuery,
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
import { EditorDocumento } from "@/components/admin/EditorDocumento";
import { editores } from "@/i18n/catalogos/editores";
import { GerenciadorPastas } from "@/components/admin/GerenciadorPastas";
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
import type { DocumentoRow, NoticiaRow } from "@/lib/db-types";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { admin } from "@/i18n/catalogos/admin";
import { normalizarLocale } from "@/i18n/locales";

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
  head: ({ match }) => {
    const m = admin[normalizarLocale((match.search as Record<string, unknown>)["lang"])];
    return {
      meta: [
        { title: m.seo.titulo },
        { name: "description", content: m.seo.descricao },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: m.seo.titulo },
        { property: "og:description", content: m.seo.descricao },
      ],
    };
  },
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
  tabela: "noticias" | "projetos" | "documentos" | "mensagens" | "pastas";
  id: string;
  titulo: string;
};

function Painel() {
  const t = useMensagens(admin);
  const te = useMensagens(editores);
  /** Mostra o rótulo traduzido da categoria; o valor gravado continua o mesmo. */
  const rotuloCategoria = (c: string | null | undefined) =>
    ({
      estatuto: te.documento.categoriaEstatuto,
      relatorio: te.documento.categoriaRelatorio,
      financeiro: te.documento.categoriaFinanceiro,
      outro: te.documento.categoriaOutro,
    })[c ?? ""] ?? c ?? "";
  const locale = useLocale();
  const { sessao } = useSessao();
  const logado = Boolean(sessao);
  const mensagens = useQuery({ ...mensagensQuery, enabled: logado });
  const noticias = useQuery({ ...noticiasAdminQuery, enabled: logado });
  const documentos = useQuery({ ...documentosAdminQuery, enabled: logado });
  const midia = useQuery({ ...midiaQuery, enabled: logado });

  // Estado dos editores e da confirmação de exclusão
  const [editorNoticia, setEditorNoticia] = useState<{ aberto: boolean; item: NoticiaRow | null }>({
    aberto: false,
    item: null,
  });
  // Editor de projetos removido: a área de Projetos está oculta no site
  const [pastaDoNovoDocumento, setPastaDoNovoDocumento] = useState<string | null>(null);
  const [editorDocumento, setEditorDocumento] = useState<{
    aberto: boolean;
    item: DocumentoRow | null;
  }>({ aberto: false, item: null });
  const [aExcluir, setAExcluir] = useState<Exclusao | null>(null);

  const publicarNoticia = useAlternarPublicacao("noticias");
  const apagarNoticia = useApagarRegistro("noticias");
  const acoesDocumento = useDocumentoAcoes();
  const acoesMensagem = useMensagemAcoes();

  function confirmarExclusao() {
    if (!aExcluir) return;
    if (aExcluir.tabela === "noticias") apagarNoticia.mutate(aExcluir.id);
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
            {t.pagina.rotulo}
          </span>
          <h1 className="mt-2 text-4xl">{t.pagina.titulo}</h1>
        </div>

        <Tabs defaultValue="visao" className="mt-10">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="visao">
            <Gauge className="size-4" /> {t.abas.visao}
          </TabsTrigger>
          <TabsTrigger value="noticias">
            <Newspaper className="size-4" /> {t.abas.noticias}
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="size-4" /> {t.abas.documentos}
          </TabsTrigger>
          <TabsTrigger value="pastas">
            <FolderTree className="size-4" /> {t.abas.pastas}
          </TabsTrigger>
          <TabsTrigger value="midia">
            <Images className="size-4" /> {t.abas.midia}
          </TabsTrigger>
          <TabsTrigger value="mensagens">
            <Mail className="size-4" /> {t.abas.mensagens}
            {naoLidas > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                {naoLidas}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="size-4" /> {t.abas.historico}
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Visão geral ---------------- */}
        <TabsContent value="visao" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Cartao
              titulo={t.visao.cardNoticias}
              total={noticias.data?.length}
              detalhe={t.visao.publicadas((noticias.data ?? []).filter((n) => n.publicado).length)}
            />
            <Cartao
              titulo={t.visao.cardDocumentos}
              total={documentos.data?.length}
              detalhe={t.visao.noSite((documentos.data ?? []).filter((d) => d.publicado).length)}
            />
            <Cartao
              titulo={t.visao.cardImagens}
              total={midia.data?.length}
              detalhe={t.visao.naBiblioteca}
            />
            <Cartao
              titulo={t.visao.cardMensagens}
              total={mensagens.data?.length}
              detalhe={t.visao.semLer(naoLidas)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg">{t.visao.ultimasAlteracoes}</h2>
            <div className="mt-4">
              <Historico limite={5} />
            </div>
          </div>
        </TabsContent>

        {/* ---------------- Notícias ---------------- */}
        <TabsContent value="noticias" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => setEditorNoticia({ aberto: true, item: null })}
            >
              <Plus className="size-4" /> {t.noticias.nova}
            </Button>
          </div>

          {noticias.isLoading && <Vazio texto={t.noticias.carregando} />}
          {noticias.error && <Vazio texto={t.noticias.erroCarregar} />}
          {noticias.data?.length === 0 && <Vazio texto={t.noticias.vazio} />}

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
                  {formatarData(n.publicado_em, locale, { day: "2-digit", month: "long", year: "numeric" })} · /{n.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={n.publicado}
                    onCheckedChange={(v) => publicarNoticia.mutate({ id: n.id, publicado: v })}
                  />
                  {n.publicado ? t.noticias.publicada : t.noticias.rascunho}
                </label>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t.noticias.editar(n.titulo)}
                  onClick={() => setEditorNoticia({ aberto: true, item: n })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t.noticias.apagar(n.titulo)}
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
              onClick={() => {
                setPastaDoNovoDocumento(null);
                setEditorDocumento({ aberto: true, item: null });
              }}
            >
              <Plus className="size-4" /> {t.documentos.novo}
            </Button>
          </div>

          {documentos.isLoading && <Vazio texto={t.documentos.carregando} />}
          {documentos.error && <Vazio texto={t.documentos.erroCarregar} />}
          {documentos.data?.length === 0 && <Vazio texto={t.documentos.vazio} />}

          {documentos.data?.map((d) => (
            <article
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="min-w-56 flex-1">
                <h2 className="text-lg">{d.titulo}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rotuloCategoria(d.categoria)}
                  {d.ano ? ` · ${d.ano}` : ""}
                  {d.arquivo_url ? "" : ` · ${t.documentos.semArquivo}`}
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
                  {d.publicado ? t.documentos.noSite : t.documentos.oculto}
                </label>
                {d.arquivo_url && (
                  <Button size="icon" variant="outline" className="rounded-full" asChild>
                    <a
                      href={d.arquivo_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t.documentos.abrir(d.titulo)}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t.documentos.editar(d.titulo)}
                  onClick={() => setEditorDocumento({ aberto: true, item: d })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t.documentos.apagar(d.titulo)}
                  onClick={() => setAExcluir({ tabela: "documentos", id: d.id, titulo: d.titulo })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Pastas de documentos ---------------- */}
        <TabsContent value="pastas" className="mt-6">
          <GerenciadorPastas
            aoAbrirDocumento={(pastaId) => {
              setPastaDoNovoDocumento(pastaId);
              setEditorDocumento({ aberto: true, item: null });
            }}
          />
        </TabsContent>

        {/* ---------------- Biblioteca de imagens ---------------- */}
        <TabsContent value="midia" className="mt-6">
          <BibliotecaMidia />
        </TabsContent>

        {/* ---------------- Mensagens ---------------- */}
        <TabsContent value="mensagens" className="mt-6 space-y-4">
          {mensagens.isLoading && <Vazio texto={t.mensagens.carregando} />}
          {mensagens.error && <Vazio texto={t.mensagens.erroCarregar} />}
          {mensagens.data?.length === 0 && <Vazio texto={t.mensagens.vazio} />}
          {mensagens.data?.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl border bg-card p-6 ${
                m.lida ? "border-border" : "border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">{m.assunto || t.mensagens.semAssunto}</h2>
                <span className="text-xs text-muted-foreground">{formatarDataHora(m.criado_em, locale)}</span>
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
                  {m.lida ? t.mensagens.marcarNaoLida : t.mensagens.marcarLida}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <a href={`mailto:${m.email}`}>
                    <Mail className="size-4" /> {t.mensagens.responder}
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
                      titulo: m.assunto || t.mensagens.mensagemDe(m.nome),
                    })
                  }
                >
                  <Trash2 className="size-4" /> {t.mensagens.apagar}
                </Button>
              </div>
            </article>
          ))}
        </TabsContent>

        {/* ---------------- Histórico / auditoria ---------------- */}
        <TabsContent value="historico" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t.historico.descricaoAba}
          </p>
          <Historico />
        </TabsContent>
      </Tabs>

      <EditorNoticia
        aberto={editorNoticia.aberto}
        noticia={editorNoticia.item}
        aoFechar={() => setEditorNoticia({ aberto: false, item: null })}
      />
      <EditorDocumento
        aberto={editorDocumento.aberto}
        documento={editorDocumento.item}
        pastaInicial={pastaDoNovoDocumento}
        aoFechar={() => setEditorDocumento({ aberto: false, item: null })}
      />

      <AlertDialog open={Boolean(aExcluir)} onOpenChange={(v) => !v && setAExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmarExclusao.titulo(aExcluir?.titulo ?? "")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmarExclusao.texto}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.confirmarExclusao.cancelar}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>{t.confirmarExclusao.apagar}</AlertDialogAction>
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
