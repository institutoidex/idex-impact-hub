import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "./supabase";
import type { NoticiaRow, ProjetoRow } from "./db-types";
import { limparTraducoes, type Traducoes } from "@/i18n/traduzir";
import { useLocale } from "@/i18n/mensagens";
import type { Locale } from "@/i18n/locales";
import { erroColunaTraducoesAusente } from "./erro-traducoes";
import { editores } from "@/i18n/catalogos/editores";
import {
  ErroGaleriaColunaAusente,
  erroColunaGaleriaAusente,
  normalizarGaleria,
  type Galeria,
} from "./galeria";

/**
 * Mutações do painel: criar, editar, publicar e apagar conteúdo.
 * Todas passam pelo cliente publishable — o RLS garante que só admin/editor grava.
 */

/** Gera um slug simples a partir do título (sem acentos, minúsculo, com hífens). */
export function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** O erro do Postgres/PostgREST por coluna inexistente cita o nome da coluna na mensagem. */

/**
 * Monta os campos a enviar ao banco: só inclui `traducoes` quando há algo preenchido
 * (depois de limparTraducoes) ou quando o registro editado já tinha essa coluna —
 * evita mandar a coluna para bancos ainda sem a migração aplicada.
 */
export function camposComTraducoes<T extends Record<string, unknown>>(
  resto: T,
  traducoes: Traducoes | undefined,
  colunaJaExistia: boolean | undefined,
): T & { traducoes?: Traducoes } {
  const limpas = limparTraducoes(traducoes ?? {});
  const temConteudo = Object.keys(limpas).length > 0;
  if (temConteudo || colunaJaExistia) return { ...resto, traducoes: limpas };
  return { ...resto };
}

/**
 * Executa a consulta; se o banco reclamar que a coluna `traducoes` não existe, repete
 * sem ela (para não perder o conteúdo em português) e sinaliza o aviso ao chamador.
 */
async function executarComFallbackTraducoes<R>(
  montar: (incluirTraducoes: boolean) => PromiseLike<{ data: R | null; error: unknown }>,
): Promise<{ data: R; avisoColunaAusente: boolean }> {
  const primeira = await montar(true);
  if (!primeira.error) return { data: primeira.data as R, avisoColunaAusente: false };
  if (!erroColunaTraducoesAusente(primeira.error)) throw primeira.error;
  const segunda = await montar(false);
  if (segunda.error) throw segunda.error;
  return { data: segunda.data as R, avisoColunaAusente: true };
}

/** Transforma erros do banco em mensagens legíveis no idioma do painel. */
function traduzirErro(erro: Error, locale: Locale) {
  const t = editores[locale].erros;
  const texto = erro.message ?? "";
  if (erro instanceof ErroGaleriaColunaAusente) return t.galeriaColunaAusente;
  if (texto.includes("duplicate key")) return t.duplicado;
  if (texto.includes("row-level security")) return t.semPermissao;
  return texto || t.generico;
}

export type NoticiaForm = {
  id?: string;
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem_url: string | null;
  /** slug do projeto relacionado (opcional) */
  projeto_slug: string | null;
  publicado: boolean;
  publicado_em: string;
  /** traduções editoriais (en-US/es-ES); ver src/i18n/traduzir.ts */
  traducoes?: Traducoes;
  /** indica se o registro original já tinha a coluna `traducoes` no banco */
  traducoesColunaExistente?: boolean;
  /** fotos da galeria (URLs em ordem), exibidas depois do texto; ver src/lib/galeria.ts */
  galeria?: Galeria;
  /** indica se o registro original já tinha a coluna `galeria` no banco */
  galeriaColunaExistente?: boolean;
};

/**
 * Campos de galeria a enviar: inclui `galeria` quando há fotos ou quando o
 * registro já tinha a coluna (permite esvaziar). Notícia sem fotos num banco
 * sem a migração não manda a coluna — edição antiga continua funcionando.
 */
export function camposGaleria(
  galeria: Galeria | undefined,
  colunaJaExistia: boolean | undefined,
): { galeria?: Galeria } {
  const limpa = normalizarGaleria(galeria ?? []);
  return limpa.length > 0 || colunaJaExistia ? { galeria: limpa } : {};
}

/**
 * Escolhe um slug livre: devolve `base` se ninguém usa; senão `base-2`, `base-3`...
 * Função pura (testável). `existentes` = slugs já gravados que começam com `base`.
 */
export function escolherSlugLivre(base: string, existentes: string[]): string {
  const usados = new Set(existentes);
  if (!usados.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidato = `${base}-${n}`;
    if (!usados.has(candidato)) return candidato;
  }
}

/** Busca no banco os slugs de notícias parecidos com `base` e devolve um livre. */
async function resolverSlugLivre(base: string): Promise<string> {
  const { data, error } = await supabase
    .from("noticias")
    .select("slug")
    .like("slug", `${base}%`);
  if (error) throw error;
  return escolherSlugLivre(base, (data ?? []).map((l: { slug: string }) => l.slug));
}

/**
 * Grava a notícia (insert/update) — função pura de dados, testável sem React.
 * - Notícia nova: o slug vem do título e ganha sufixo (-2, -3...) se já existir
 *   outra notícia com o mesmo endereço. Edição mantém o slug atual (links não quebram).
 * - Fallback de `traducoes` ausente: repete sem traduções, MAS mantém a galeria.
 * - Coluna `galeria` ausente com fotos: lança ErroGaleriaColunaAusente
 *   (nunca repete descartando as fotos; o editor fica aberto).
 */
export async function gravarNoticia(
  valores: NoticiaForm,
): Promise<{ dado: NoticiaRow; avisoColunaAusente: boolean }> {
  const { id, traducoes, traducoesColunaExistente, galeria, galeriaColunaExistente, ...resto } =
    valores;
  const extraGaleria = camposGaleria(galeria, galeriaColunaExistente);
  const baseSlug = resto.slug || gerarSlug(resto.titulo) || "noticia";

  // Executa a gravação com o slug informado.
  const gravar = (slug: string) =>
    executarComFallbackTraducoes<NoticiaRow>((incluirTraducoes) => {
      const base = { ...resto, slug, ...extraGaleria };
      const campos = incluirTraducoes
        ? camposComTraducoes(base, traducoes, traducoesColunaExistente)
        : base;
      return id
        ? supabase.from("noticias").update(campos).eq("id", id).select().single()
        : supabase.from("noticias").insert(campos).select().single();
    });

  try {
    if (id) {
      const { data, avisoColunaAusente } = await gravar(resto.slug);
      return { dado: data, avisoColunaAusente };
    }
    // Nova notícia: escolhe slug livre; se outra pessoa gravou o mesmo no meio
    // tempo (chave duplicada), tenta de novo uma única vez com novo sufixo.
    let slug = await resolverSlugLivre(baseSlug);
    try {
      const { data, avisoColunaAusente } = await gravar(slug);
      return { dado: data, avisoColunaAusente };
    } catch (erro) {
      const msg = (erro as { message?: string })?.message ?? "";
      if (!msg.includes("duplicate key")) throw erro;
      slug = await resolverSlugLivre(baseSlug);
      const { data, avisoColunaAusente } = await gravar(slug);
      return { dado: data, avisoColunaAusente };
    }
  } catch (erro) {
    if (erroColunaGaleriaAusente(erro)) throw new ErroGaleriaColunaAusente();
    throw erro;
  }
}

export type ProjetoForm = {
  id?: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  imagem_url: string | null;
  iniciado_em: string | null;
  publicado: boolean;
  traducoes?: Traducoes;
  traducoesColunaExistente?: boolean;
};

/** Invalida tudo que depende de notícias/projetos (painel + páginas públicas + auditoria). */
function useInvalidar() {
  const queryClient = useQueryClient();
  return (chave: "noticias" | "projetos") => {
    void queryClient.invalidateQueries({ queryKey: [chave] });
    void queryClient.invalidateQueries({ queryKey: ["auditoria"] });
  };
}

/** Cria ou atualiza uma notícia. */
export function useSalvarNoticia() {
  const invalidar = useInvalidar();
  const locale = useLocale();
  const t = editores[locale].noticia;
  return useMutation({
    mutationFn: gravarNoticia,
    onSuccess: ({ avisoColunaAusente }, valores) => {
      invalidar("noticias");
      if (avisoColunaAusente) toast.warning(editores[locale].traducao.colunaIndisponivel);
      toast.success(valores.id ? t.salvo : t.criado);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

/** Cria ou atualiza um projeto. */
export function useSalvarProjeto() {
  const invalidar = useInvalidar();
  const locale = useLocale();
  const t = editores[locale].projeto;
  return useMutation({
    mutationFn: async (
      valores: ProjetoForm,
    ): Promise<{ dado: ProjetoRow; avisoColunaAusente: boolean }> => {
      const { id, traducoes, traducoesColunaExistente, ...resto } = valores;
      const { data, avisoColunaAusente } = await executarComFallbackTraducoes<ProjetoRow>(
        (incluirTraducoes) => {
          const campos = incluirTraducoes
            ? camposComTraducoes(resto, traducoes, traducoesColunaExistente)
            : resto;
          return id
            ? supabase.from("projetos").update(campos).eq("id", id).select().single()
            : supabase.from("projetos").insert(campos).select().single();
        },
      );
      return { dado: data, avisoColunaAusente };
    },
    onSuccess: ({ avisoColunaAusente }, valores) => {
      invalidar("projetos");
      if (avisoColunaAusente) toast.warning(editores[locale].traducao.colunaIndisponivel);
      toast.success(valores.id ? t.salvo : t.criado);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

/** Alterna o estado de publicação de uma notícia ou projeto. */
export function useAlternarPublicacao(tabela: "noticias" | "projetos") {
  const invalidar = useInvalidar();
  const locale = useLocale();
  const t = editores[locale].toasts;
  return useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const { error } = await supabase.from(tabela).update({ publicado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_dado, { publicado }) => {
      invalidar(tabela);
      toast.success(publicado ? t.publicadoNoSite : t.voltouRascunho);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

/** Remove um registro de notícia ou projeto. */
export function useApagarRegistro(tabela: "noticias" | "projetos") {
  const invalidar = useInvalidar();
  const locale = useLocale();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tabela).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidar(tabela);
      toast.success(editores[locale].toasts.registroRemovido);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

export type DocumentoForm = {
  id?: string;
  titulo: string;
  categoria: string;
  /** pasta onde o arquivo fica guardado (null = raiz da Transparência) */
  pasta_id: string | null;
  ano: number | null;
  arquivo_url: string | null;
  publicado: boolean;
  traducoes?: Traducoes;
  traducoesColunaExistente?: boolean;
};

/** Cria ou atualiza um documento da página de Transparência. */
export function useSalvarDocumento() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = editores[locale].documento;
  return useMutation({
    mutationFn: async (valores: DocumentoForm) => {
      const { id, traducoes, traducoesColunaExistente, ...resto } = valores;
      const { data, avisoColunaAusente } = await executarComFallbackTraducoes(
        (incluirTraducoes) => {
          const campos = incluirTraducoes
            ? camposComTraducoes(resto, traducoes, traducoesColunaExistente)
            : resto;
          return id
            ? supabase.from("documentos").update(campos).eq("id", id).select().single()
            : supabase.from("documentos").insert(campos).select().single();
        },
      );
      return { dado: data, avisoColunaAusente };
    },
    onSuccess: ({ avisoColunaAusente }, valores) => {
      void queryClient.invalidateQueries({ queryKey: ["documentos"] });
      void queryClient.invalidateQueries({ queryKey: ["auditoria"] });
      if (avisoColunaAusente) toast.warning(editores[locale].traducao.colunaIndisponivel);
      toast.success(valores.id ? t.salvo : t.criado);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

/** Publica/despublica ou apaga documentos. */
export function useDocumentoAcoes() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = editores[locale].toasts;
  const atualizar = () => {
    void queryClient.invalidateQueries({ queryKey: ["documentos"] });
    void queryClient.invalidateQueries({ queryKey: ["auditoria"] });
  };

  const publicar = useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const { error } = await supabase.from("documentos").update({ publicado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, { publicado }) => {
      atualizar();
      toast.success(publicado ? t.documentoPublicado : t.documentoOculto);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      atualizar();
      toast.success(t.documentoRemovido);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });

  return { publicar, apagar };
}

/** Marca uma mensagem de contato como lida/não lida ou apaga. */
export function useMensagemAcoes() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const atualizar = () => void queryClient.invalidateQueries({ queryKey: ["mensagens"] });

  const marcarLida = useMutation({
    mutationFn: async ({ id, lida }: { id: string; lida: boolean }) => {
      const { error } = await supabase.from("mensagens").update({ lida }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mensagens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      atualizar();
      toast.success(editores[locale].toasts.mensagemRemovida);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });

  return { marcarLida, apagar };
}

/** Dados do formulário de pasta. */
export type PastaForm = {
  id?: string;
  nome: string;
  slug: string;
  pasta_id: string | null;
  ordem: number;
  traducoes?: Traducoes;
  traducoesColunaExistente?: boolean;
};

/** Cria ou renomeia uma pasta/subpasta de documentos. */
export function useSalvarPasta() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = editores[locale].pasta;
  return useMutation({
    mutationFn: async (valores: PastaForm) => {
      const { id, traducoes, traducoesColunaExistente, ...resto } = valores;
      const { data, avisoColunaAusente } = await executarComFallbackTraducoes(
        (incluirTraducoes) => {
          const campos = incluirTraducoes
            ? camposComTraducoes(resto, traducoes, traducoesColunaExistente)
            : resto;
          return id
            ? supabase.from("pastas").update(campos).eq("id", id).select().single()
            : supabase.from("pastas").insert(campos).select().single();
        },
      );
      return { dado: data, avisoColunaAusente };
    },
    onSuccess: ({ avisoColunaAusente }, valores) => {
      void queryClient.invalidateQueries({ queryKey: ["pastas"] });
      if (avisoColunaAusente) toast.warning(editores[locale].traducao.colunaIndisponivel);
      toast.success(valores.id ? t.salvo : t.criado);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}

/** Apaga uma pasta (as subpastas vão junto; os documentos voltam para a raiz). */
export function useApagarPasta() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pastas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pastas"] });
      void queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success(editores[locale].toasts.pastaRemovida);
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro, locale)),
  });
}
