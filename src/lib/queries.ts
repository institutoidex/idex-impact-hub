import { queryOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { listarConteudoPasta, listarMidia, listarTodasPastas } from "./storage";
import type {
  AuditoriaRow,
  DocumentoRow,
  MensagemRow,
  NoticiaRow,
  PastaRow,
  ProjetoRow,
} from "./db-types";

/**
 * Consultas ao banco usadas pelas páginas públicas e pelo painel.
 * Tudo passa pelo cliente publishable, respeitando as políticas de RLS.
 */

export const projetosQuery = queryOptions({
  queryKey: ["projetos"],
  queryFn: async (): Promise<ProjetoRow[]> => {
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .eq("publicado", true)
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const projetoQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projetos", slug],
    queryFn: async (): Promise<ProjetoRow | null> => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const noticiasQuery = (limite?: number) =>
  queryOptions({
    queryKey: ["noticias", limite ?? "todas"],
    queryFn: async (): Promise<NoticiaRow[]> => {
      let q = supabase
        .from("noticias")
        .select("*")
        .eq("publicado", true)
        .order("publicado_em", { ascending: false });
      if (limite) q = q.limit(limite);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const documentosQuery = queryOptions({
  queryKey: ["documentos"],
  queryFn: async (): Promise<DocumentoRow[]> => {
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("publicado", true)
      .order("ano", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Painel: mensagens recebidas pelo formulário de contato (exige login). */
export const mensagensQuery = queryOptions({
  queryKey: ["mensagens"],
  queryFn: async (): Promise<MensagemRow[]> => {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Painel: todas as notícias, inclusive rascunhos (exige login). */
export const noticiasAdminQuery = queryOptions({
  queryKey: ["noticias", "admin"],
  queryFn: async (): Promise<NoticiaRow[]> => {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("publicado_em", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Formata datas ISO para o padrão brasileiro. */
export function formatarData(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Painel: todos os projetos, inclusive rascunhos (exige login). */
export const projetosAdminQuery = queryOptions({
  queryKey: ["projetos", "admin"],
  queryFn: async (): Promise<ProjetoRow[]> => {
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Painel: histórico de alterações (mais recentes primeiro). */
export const auditoriaQuery = queryOptions({
  queryKey: ["auditoria"],
  queryFn: async (): Promise<AuditoriaRow[]> => {
    const { data, error } = await supabase
      .from("auditoria")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
});

/** Painel: todos os documentos, inclusive rascunhos (exige login). */
export const documentosAdminQuery = queryOptions({
  queryKey: ["documentos", "admin"],
  queryFn: async (): Promise<DocumentoRow[]> => {
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .order("ano", { ascending: false })
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

/** Painel: biblioteca de mídia do bucket público. */
export const midiaQuery = queryOptions({
  queryKey: ["midia"],
  queryFn: () => listarMidia(),
});

/** Painel: conteúdo direto de uma pasta da biblioteca (subpastas + arquivos). */
export const pastaMidiaQuery = (prefixo: string) =>
  queryOptions({
    queryKey: ["midia", "pasta", prefixo],
    queryFn: () => listarConteudoPasta(prefixo),
  });

/** Painel: todos os caminhos de pastas do bucket (para mover arquivos). */
export const todasPastasMidiaQuery = queryOptions({
  queryKey: ["midia", "pastas-todas"],
  queryFn: () => listarTodasPastas(),
});


/** Uma notícia publicada pelo slug (usada na página de detalhe). */
export const noticiaQuery = (slug: string) =>
  queryOptions({
    queryKey: ["noticias", "slug", slug],
    queryFn: async (): Promise<NoticiaRow | null> => {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

/** Pastas e subpastas de documentos (leitura pública). */
export const pastasQuery = queryOptions({
  queryKey: ["pastas"],
  queryFn: async (): Promise<PastaRow[]> => {
    const { data, error } = await supabase
      .from("pastas")
      .select("*")
      .order("ordem", { ascending: true });
    // se a tabela ainda não existir no banco, o site segue com a estrutura base
    if (error) return [];
    return data ?? [];
  },
});

/**
 * Diz se a tabela `pastas` já existe no banco.
 * Usada no painel para avisar que falta rodar `supabase/pastas.sql`.
 */
export const tabelaPastasQuery = queryOptions({
  queryKey: ["pastas", "tabela-existe"],
  queryFn: async (): Promise<boolean> => {
    const { error } = await supabase.from("pastas").select("id").limit(1);
    return !error;
  },
});
