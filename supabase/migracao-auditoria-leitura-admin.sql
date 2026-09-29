-- Migração: restringe a leitura da trilha de auditoria somente a administradores.
-- Motivo: o histórico guarda autor_email e valores antes/depois de cada alteração,
-- e a política anterior ("auditoria leitura autenticada", USING (true)) liberava
-- a leitura para qualquer usuário autenticado.
--
-- Idempotente: pode ser rodada mais de uma vez sem efeito colateral.
-- Pré-requisito: public.has_role(uuid, public.app_role) já existir (criada em schema.sql).
--
-- ANTES DE APLICAR em um banco já existente, confira as políticas reais:
--   select policyname, cmd, qual from pg_policies where tablename = 'auditoria';
-- Se houver outras políticas SELECT permissivas na tabela (criadas fora deste
-- arquivo), remova-as explicitamente — esta migração só remove as duas abaixo.

drop policy if exists "auditoria leitura autenticada" on public.auditoria;
drop policy if exists "auditoria leitura admin" on public.auditoria;

create policy "auditoria leitura admin" on public.auditoria
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
