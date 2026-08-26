import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "./supabase";
import type { NoticiaRow, ProjetoRow } from "./db-types";

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
};

export type ProjetoForm = {
  id?: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  imagem_url: string | null;
  iniciado_em: string | null;
  publicado: boolean;
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
  return useMutation({
    mutationFn: async (valores: NoticiaForm): Promise<NoticiaRow> => {
      const { id, ...campos } = valores;
      const consulta = id
        ? supabase.from("noticias").update(campos).eq("id", id).select().single()
        : supabase.from("noticias").insert(campos).select().single();
      const { data, error } = await consulta;
      if (error) throw error;
      return data as NoticiaRow;
    },
    onSuccess: (_dado, valores) => {
      invalidar("noticias");
      toast.success(valores.id ? "Notícia atualizada." : "Notícia criada.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });
}

/** Cria ou atualiza um projeto. */
export function useSalvarProjeto() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (valores: ProjetoForm): Promise<ProjetoRow> => {
      const { id, ...campos } = valores;
      const consulta = id
        ? supabase.from("projetos").update(campos).eq("id", id).select().single()
        : supabase.from("projetos").insert(campos).select().single();
      const { data, error } = await consulta;
      if (error) throw error;
      return data as ProjetoRow;
    },
    onSuccess: (_dado, valores) => {
      invalidar("projetos");
      toast.success(valores.id ? "Projeto atualizado." : "Projeto criado.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });
}

/** Alterna o estado de publicação de uma notícia ou projeto. */
export function useAlternarPublicacao(tabela: "noticias" | "projetos") {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const { error } = await supabase.from(tabela).update({ publicado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_dado, { publicado }) => {
      invalidar(tabela);
      toast.success(publicado ? "Publicado no site." : "Voltou para rascunho.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });
}

/** Remove um registro de notícia ou projeto. */
export function useApagarRegistro(tabela: "noticias" | "projetos") {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tabela).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidar(tabela);
      toast.success("Registro removido.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });
}

/** Transforma erros do banco em mensagens legíveis em pt-BR. */
function traduzirErro(erro: Error) {
  const texto = erro.message ?? "";
  if (texto.includes("duplicate key")) return "Já existe um registro com esse slug.";
  if (texto.includes("row-level security")) return "Sua conta não tem permissão para essa ação.";
  return texto || "Não foi possível salvar. Tente de novo.";
}

export type DocumentoForm = {
  id?: string;
  titulo: string;
  categoria: string;
  ano: number | null;
  arquivo_url: string | null;
  publicado: boolean;
};


/** Cria ou atualiza um documento da página de Transparência. */
export function useSalvarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (valores: DocumentoForm) => {
      const { id, ...campos } = valores;
      const consulta = id
        ? supabase.from("documentos").update(campos).eq("id", id).select().single()
        : supabase.from("documentos").insert(campos).select().single();
      const { data, error } = await consulta;
      if (error) throw error;
      return data;
    },
    onSuccess: (_dado, valores) => {
      void queryClient.invalidateQueries({ queryKey: ["documentos"] });
      void queryClient.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(valores.id ? "Documento atualizado." : "Documento adicionado.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });
}

/** Publica/despublica ou apaga documentos. */
export function useDocumentoAcoes() {
  const queryClient = useQueryClient();
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
      toast.success(publicado ? "Documento publicado." : "Documento oculto do site.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      atualizar();
      toast.success("Documento removido.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });

  return { publicar, apagar };
}

/** Marca uma mensagem de contato como lida/não lida ou apaga. */
export function useMensagemAcoes() {
  const queryClient = useQueryClient();
  const atualizar = () => void queryClient.invalidateQueries({ queryKey: ["mensagens"] });

  const marcarLida = useMutation({
    mutationFn: async ({ id, lida }: { id: string; lida: boolean }) => {
      const { error } = await supabase.from("mensagens").update({ lida }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mensagens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      atualizar();
      toast.success("Mensagem removida.");
    },
    onError: (erro: Error) => toast.error(traduzirErro(erro)),
  });

  return { marcarLida, apagar };
}
