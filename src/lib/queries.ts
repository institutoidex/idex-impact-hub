import { queryOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type {
  AreaRow,
  DocumentoRow,
  MensagemRow,
  NoticiaRow,
  ProjetoRow,
} from "./db-types";

/**
 * Consultas ao banco usadas pelas páginas públicas e pelo painel.
 * Tudo passa pelo cliente publishable, respeitando as políticas de RLS.
 */

export const areasQuery = queryOptions({
  queryKey: ["areas"],
  queryFn: async (): Promise<AreaRow[]> => {
    const { data, error } = await supabase.from("areas").select("*").order("ordem");
    if (error) throw error;
    return data ?? [];
  },
});

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
