-- ------------------------------------------------------------------ --
-- Pastas e subpastas de documentos (Transparência)
-- Rode este arquivo no SQL Editor do Supabase do instituto.
-- ------------------------------------------------------------------ --

create table if not exists public.pastas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  -- pasta mãe: null = pasta de primeiro nível (aparece no menu Transparência)
  pasta_id uuid references public.pastas (id) on delete cascade,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists pastas_pasta_id_idx on public.pastas (pasta_id);

grant select on public.pastas to anon, authenticated;
grant insert, update, delete on public.pastas to authenticated;
grant all on public.pastas to service_role;

alter table public.pastas enable row level security;

drop policy if exists "pastas sao publicas" on public.pastas;
create policy "pastas sao publicas" on public.pastas for select
  to anon, authenticated using (true);

drop policy if exists "pastas editaveis por admin" on public.pastas;
create policy "pastas editaveis por admin" on public.pastas for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Vínculo do documento com a pasta (null = solto na raiz)
alter table public.documentos
  add column if not exists pasta_id uuid references public.pastas (id) on delete set null;

-- Estrutura base de primeiro nível
insert into public.pastas (nome, slug, ordem) values
  ('Documentos', 'documentos', 1),
  ('Emendas Parlamentares', 'emendas-parlamentares', 2),
  ('Organograma', 'organograma', 3),
  ('Perguntas Frequentes', 'perguntas-frequentes', 4),
  ('Processo de Compra', 'processo-de-compra', 5),
  ('Projetos', 'projetos', 6),
  ('Relatórios', 'relatorios', 7)
on conflict (slug) do nothing;
