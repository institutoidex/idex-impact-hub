-- =====================================================================
-- Instituto IDEX — traduções editoriais (en-US / es-ES)
-- Projeto Supabase EXTERNO: rhgiuskcuowphhwuewcf
-- Rodar no SQL Editor do Supabase. NÃO É APLICADO AUTOMATICAMENTE.
--
-- Aditiva e idempotente: só ADICIONA a coluna jsonb `traducoes` (padrão '{}')
-- em notícias, projetos, documentos e pastas. Não apaga, não renomeia,
-- não altera dados em português e NÃO mexe nas políticas de RLS: as
-- políticas atuais (leitura pública de publicado = true, escrita só da
-- equipe) passam a valer automaticamente para a nova coluna.
--
-- Formato: { "en-US": { "titulo": "...", "resumo": "...", "conteudo": "..." },
--            "es-ES": { ... } }
-- Campo ausente = o site mostra o português original (fallback seguro).
-- =====================================================================

alter table public.noticias   add column if not exists traducoes jsonb not null default '{}'::jsonb;
alter table public.projetos   add column if not exists traducoes jsonb not null default '{}'::jsonb;
alter table public.documentos add column if not exists traducoes jsonb not null default '{}'::jsonb;
alter table public.pastas     add column if not exists traducoes jsonb not null default '{}'::jsonb;

-- Garante que o valor seja sempre um objeto JSON (nunca lista/texto).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'noticias_traducoes_objeto') then
    alter table public.noticias add constraint noticias_traducoes_objeto check (jsonb_typeof(traducoes) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projetos_traducoes_objeto') then
    alter table public.projetos add constraint projetos_traducoes_objeto check (jsonb_typeof(traducoes) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'documentos_traducoes_objeto') then
    alter table public.documentos add constraint documentos_traducoes_objeto check (jsonb_typeof(traducoes) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pastas_traducoes_objeto') then
    alter table public.pastas add constraint pastas_traducoes_objeto check (jsonb_typeof(traducoes) = 'object');
  end if;
end $$;
