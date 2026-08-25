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
}

export type NoticiaRow = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem_url: string | null;
  publicado: boolean;
  publicado_em: string;
  criado_em: string;
}

export type DocumentoRow = {
  id: string;
  titulo: string;
  categoria: string; // "estatuto" | "relatorio" | "financeiro" | "outro"
  ano: number | null;
  arquivo_url: string | null;
  publicado: boolean;
  criado_em: string;
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
      mensagens: Tabela<
        MensagemRow,
        {
          nome: string;
          email: string;
          telefone?: string | null;
          assunto?: string | null;
          mensagem: string;
        }
      >;
      user_roles: Tabela<{ id: string; user_id: string; role: string }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      has_role: { Args: { _user_id: string; _role: string }; Returns: boolean };
    };
    Enums: { app_role: "admin" | "editor" };
    CompositeTypes: { [_ in never]: never };
  };
}
