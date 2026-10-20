/**
 * Tipos das tabelas do banco do Instituto IDEX (banco próprio do instituto).
 * Mantidos à mão — atualize aqui sempre que o schema mudar.
 */

export type AreaRow = {
  id: string;
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  icone: string;
  cor: string;
  ordem: number;
  criado_em: string;
}

export type ProjetoRow = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  area_slug: string | null;
  imagem_url: string | null;
  local: string | null;
  parceiro: string | null;
  status: string; // "ativo" | "encerrado" | "em-breve"
  iniciado_em: string | null;
  beneficiados: number | null;
  destaque: boolean;
  publicado: boolean;
  criado_em: string;
  /** traduções editoriais en-US/es-ES (jsonb); ausente em bancos sem a migração */
  traducoes?: unknown;
}

export type NoticiaRow = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem_url: string | null;
  /** vínculo opcional: slug do projeto relacionado (null = notícia geral) */
  projeto_slug: string | null;
  publicado: boolean;
  publicado_em: string;
  criado_em: string;
  /** traduções editoriais en-US/es-ES (jsonb); ausente em bancos sem a migração */
  traducoes?: unknown;
  /** galeria (jsonb array de URLs); ausente em bancos sem a migração — use normalizarGaleria */
  galeria?: unknown;
}

/** Pasta (ou subpasta) que organiza os documentos da Transparência. */
export type PastaRow = {
  /** calculado no site (não é coluna): true quando falta tradução e o texto está em português */
  emPortugues?: boolean;
  id: string;
  nome: string;
  slug: string;
  /** pasta mãe; null = pasta de primeiro nível */
  pasta_id: string | null;
  ordem: number;
  criado_em: string;
  /** traduções editoriais en-US/es-ES (jsonb); ausente em bancos sem a migração */
  traducoes?: unknown;
}

export type DocumentoRow = {
  /** calculado no site (não é coluna): true quando falta tradução e o texto está em português */
  emPortugues?: boolean;
  id: string;
  titulo: string;
  categoria: string; // "estatuto" | "relatorio" | "financeiro" | "outro"
  /** pasta onde o documento está guardado (null = raiz) */
  pasta_id: string | null;
  ano: number | null;
  arquivo_url: string | null;
  publicado: boolean;
  criado_em: string;
  /** traduções editoriais en-US/es-ES (jsonb); ausente em bancos sem a migração */
  traducoes?: unknown;
}

export type MensagemRow = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  lida: boolean;
  criado_em: string;
  /** status do aviso por e-mail; ausente em bancos sem a migração opcional */
  notificacao_status?: string | null;
  notificacao_em?: string | null;
}

type Tabela<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      areas: Tabela<AreaRow>;
      projetos: Tabela<ProjetoRow>;
      noticias: Tabela<NoticiaRow>;
      documentos: Tabela<DocumentoRow>;
      pastas: Tabela<PastaRow>;
      mensagens: Tabela<
        MensagemRow,
        {
          /** uuid gerado no navegador (idempotência); opcional, o banco gera se faltar */
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          assunto?: string | null;
          mensagem: string;
        }
      >;
      user_roles: Tabela<{ id: string; user_id: string; role: string }>;
      auditoria: Tabela<AuditoriaRow>;
    };
    Views: { [_ in never]: never };
    Functions: {
      has_role: { Args: { _user_id: string; _role: string }; Returns: boolean };
    };
    Enums: { app_role: "admin" | "editor" };
    CompositeTypes: { [_ in never]: never };
  };
}

/** Trilha de auditoria: cada alteração feita no conteúdo do site. */
export type AuditoriaRow = {
  id: string;
  tabela: string;
  registro_id: string | null;
  titulo: string | null;
  acao: string; // criado | atualizado | publicado | despublicado | excluido
  campos: string[] | null;
  alteracoes: Record<string, { antes: unknown; depois: unknown }> | null;
  autor_id: string | null;
  autor_email: string | null;
  criado_em: string;
}
