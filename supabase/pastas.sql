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
  ('Projetos', 'projetos', 6),
  ('Relatórios', 'relatorios', 7)
on conflict (slug) do nothing;

-- Subpastas de "Documentos"
insert into public.pastas (nome, slug, ordem, pasta_id)
select v.nome, v.slug, v.ordem, p.id
from (values
  ('Atas', 'documentos-atas', 1),
  ('Comprovação de Processo Eleitoral', 'documentos-processo-eleitoral', 2),
  ('Declarações', 'documentos-declaracoes', 3),
  ('Estatuto', 'documentos-estatuto', 4),
  ('Financeiro', 'documentos-financeiro', 5),
  ('LGPD', 'documentos-lgpd', 6)
) as v(nome, slug, ordem)
join public.pastas p on p.slug = 'documentos'
on conflict (slug) do nothing;

-- Subpastas de "Projetos" (é só uma pasta de arquivos, como as demais)
insert into public.pastas (nome, slug, ordem, pasta_id)
select v.nome, v.slug, v.ordem, p.id
from (values
  ('Projetos 2020', 'projetos-2020', 1),
  ('Projetos 2021', 'projetos-2021', 2),
  ('Projetos 2022', 'projetos-2022', 3),
  ('Projetos 2023-2024', 'projetos-2023-2024', 4),
  ('Projetos 2025', 'projetos-2025', 5)
) as v(nome, slug, ordem)
join public.pastas p on p.slug = 'projetos'
on conflict (slug) do nothing;
