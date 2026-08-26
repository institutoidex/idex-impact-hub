-- Trilha de auditoria do painel: registra criação, atualização, publicação e exclusão.

create table if not exists public.auditoria (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,
  registro_id uuid,
  titulo text,
  acao text not null, -- criado | atualizado | publicado | despublicado | excluido
  campos text[] default '{}',          -- campos alterados
  alteracoes jsonb default '{}'::jsonb, -- {campo: {antes, depois}}
  autor_id uuid,
  autor_email text,
  criado_em timestamptz not null default now()
);

-- Acesso: leitura apenas para pessoas logadas no painel; escrita só pelo gatilho/serviço.
grant select on public.auditoria to authenticated;
grant all on public.auditoria to service_role;
alter table public.auditoria enable row level security;

drop policy if exists "auditoria leitura autenticada" on public.auditoria;
create policy "auditoria leitura autenticada" on public.auditoria
  for select to authenticated using (true);

create index if not exists auditoria_criado_em_idx on public.auditoria (criado_em desc);

-- Função genérica de registro (roda com privilégios do dono para poder inserir).
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_acao text;
  v_campos text[] := '{}';
  v_alteracoes jsonb := '{}'::jsonb;
  v_titulo text;
  v_id uuid;
  v_old jsonb;
  v_new jsonb;
  chave text;
begin
  if (tg_op = 'DELETE') then
    v_old := to_jsonb(old);
    v_acao := 'excluido';
    v_titulo := coalesce(v_old->>'titulo', v_old->>'nome');
    v_id := (v_old->>'id')::uuid;
  elsif (tg_op = 'INSERT') then
    v_new := to_jsonb(new);
    v_acao := 'criado';
    v_titulo := coalesce(v_new->>'titulo', v_new->>'nome');
    v_id := (v_new->>'id')::uuid;
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_titulo := coalesce(v_new->>'titulo', v_new->>'nome');
    v_id := (v_new->>'id')::uuid;
    for chave in select jsonb_object_keys(v_new) loop
      if (v_new->chave) is distinct from (v_old->chave)
         and chave not in ('atualizado_em', 'criado_em') then
        v_campos := array_append(v_campos, chave);
        v_alteracoes := v_alteracoes || jsonb_build_object(
          chave, jsonb_build_object('antes', v_old->chave, 'depois', v_new->chave)
        );
      end if;
    end loop;
    if v_campos = '{}' then
      return new; -- nada mudou de fato
    end if;
    if 'publicado' = any (v_campos) then
      v_acao := case when (v_new->>'publicado')::boolean then 'publicado' else 'despublicado' end;
    else
      v_acao := 'atualizado';
    end if;
  end if;

  insert into public.auditoria (tabela, registro_id, titulo, acao, campos, alteracoes, autor_id, autor_email)
  values (
    tg_table_name,
    v_id,
    v_titulo,
    v_acao,
    v_campos,
    v_alteracoes,
    auth.uid(),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email'
  );

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

-- Gatilhos nas tabelas de conteúdo
do $$
declare t text;
begin
  foreach t in array array['noticias', 'projetos', 'documentos', 'areas'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists trg_auditoria on public.%I', t);
      execute format(
        'create trigger trg_auditoria after insert or update or delete on public.%I
         for each row execute function public.registrar_auditoria()', t);
    end if;
  end loop;
end $$;
