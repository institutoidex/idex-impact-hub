-- Status do aviso por e-mail das mensagens do contato (ADITIVA e idempotente).
-- NÃO executada automaticamente: rodar no SQL Editor do Supabase externo (rhgiuskcuowphhwuewcf).
-- Não altera RLS, papéis, registros existentes nem a coluna id (uuid já existente).
-- Sem esta migração o site funciona igual: o status apenas não é gravado.

alter table public.mensagens
  add column if not exists notificacao_status text,
  add column if not exists notificacao_em timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mensagens_notificacao_status_valido'
  ) then
    alter table public.mensagens
      add constraint mensagens_notificacao_status_valido
      check (notificacao_status is null or notificacao_status in ('enviada','falhou','nao_configurado'));
  end if;
end $$;

notify pgrst, 'reload schema';
