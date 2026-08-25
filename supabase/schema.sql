-- =====================================================================
-- Instituto IDEX — schema do site institucional
-- Rode no SQL Editor do Supabase (uma vez). Idempotente o suficiente
-- para reexecução com "if not exists" / "on conflict do nothing".
-- =====================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ --
-- Papéis de usuário (nunca guardar papel na tabela de perfil/usuário)
-- ------------------------------------------------------------------ --
do $$ begin
  create type public.app_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "usuario le seus papeis" on public.user_roles;
create policy "usuario le seus papeis" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ------------------------------------------------------------------ --
-- Áreas de atuação
-- ------------------------------------------------------------------ --
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  resumo text not null default '',
  descricao text not null default '',
  icone text not null default 'Trophy',
  cor text not null default 'bg-primary text-primary-foreground',
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

grant select on public.areas to anon, authenticated;
grant insert, update, delete on public.areas to authenticated;
grant all on public.areas to service_role;
alter table public.areas enable row level security;

drop policy if exists "areas publicas" on public.areas;
create policy "areas publicas" on public.areas for select to anon, authenticated using (true);
drop policy if exists "areas editaveis por admin" on public.areas;
create policy "areas editaveis por admin" on public.areas for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------ --
-- Projetos
-- ------------------------------------------------------------------ --
create table if not exists public.projetos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  resumo text not null default '',
  descricao text not null default '',
  area_slug text references public.areas(slug) on update cascade on delete set null,
  imagem_url text,
  local text,
  parceiro text,
  status text not null default 'ativo',
  iniciado_em date,
  beneficiados int,
  destaque boolean not null default false,
  publicado boolean not null default true,
  criado_em timestamptz not null default now()
);

grant select on public.projetos to anon, authenticated;
grant insert, update, delete on public.projetos to authenticated;
grant all on public.projetos to service_role;
alter table public.projetos enable row level security;

drop policy if exists "projetos publicados sao publicos" on public.projetos;
create policy "projetos publicados sao publicos" on public.projetos for select
  to anon, authenticated using (publicado = true);
drop policy if exists "projetos visiveis para admin" on public.projetos;
create policy "projetos visiveis para admin" on public.projetos for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "projetos editaveis por admin" on public.projetos;
create policy "projetos editaveis por admin" on public.projetos for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------ --
-- Notícias
-- ------------------------------------------------------------------ --
create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  resumo text not null default '',
  conteudo text,
  imagem_url text,
  publicado boolean not null default true,
  publicado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

grant select on public.noticias to anon, authenticated;
grant insert, update, delete on public.noticias to authenticated;
grant all on public.noticias to service_role;
alter table public.noticias enable row level security;

drop policy if exists "noticias publicadas sao publicas" on public.noticias;
create policy "noticias publicadas sao publicas" on public.noticias for select
  to anon, authenticated using (publicado = true);
drop policy if exists "noticias visiveis para admin" on public.noticias;
create policy "noticias visiveis para admin" on public.noticias for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "noticias editaveis por admin" on public.noticias;
create policy "noticias editaveis por admin" on public.noticias for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------ --
-- Documentos de transparência
-- ------------------------------------------------------------------ --
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null default 'outro',
  ano int,
  arquivo_url text,
  publicado boolean not null default true,
  criado_em timestamptz not null default now()
);

grant select on public.documentos to anon, authenticated;
grant insert, update, delete on public.documentos to authenticated;
grant all on public.documentos to service_role;
alter table public.documentos enable row level security;

drop policy if exists "documentos publicados sao publicos" on public.documentos;
create policy "documentos publicados sao publicos" on public.documentos for select
  to anon, authenticated using (publicado = true);
drop policy if exists "documentos editaveis por admin" on public.documentos;
create policy "documentos editaveis por admin" on public.documentos for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------ --
-- Mensagens do formulário de contato
-- ------------------------------------------------------------------ --
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  assunto text,
  mensagem text not null,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

grant insert on public.mensagens to anon, authenticated;
grant select, update, delete on public.mensagens to authenticated;
grant all on public.mensagens to service_role;
alter table public.mensagens enable row level security;

-- Qualquer visitante pode enviar, mas ninguém anônimo pode ler.
drop policy if exists "qualquer um envia mensagem" on public.mensagens;
create policy "qualquer um envia mensagem" on public.mensagens for insert
  to anon, authenticated with check (true);
drop policy if exists "somente admin le mensagens" on public.mensagens;
create policy "somente admin le mensagens" on public.mensagens for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "somente admin atualiza mensagens" on public.mensagens;
create policy "somente admin atualiza mensagens" on public.mensagens for update
  to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "somente admin apaga mensagens" on public.mensagens;
create policy "somente admin apaga mensagens" on public.mensagens for delete
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------ --
-- Conteúdo inicial (mesmos textos que já estavam no site)
-- ------------------------------------------------------------------ --
insert into public.areas (slug, nome, resumo, descricao, icone, cor, ordem) values
  ('educacao','Educação','Apoio e desenvolvimento','Apoio e desenvolvimento educacional para crianças e jovens da comunidade. [Detalhamento de objetivos e ações a definir com a equipe do instituto]','GraduationCap','bg-primary text-primary-foreground',1),
  ('cultura','Cultura','Artes e oficinas','Artes e oficinas que ampliam repertório e geram renda para a comunidade. [Detalhamento de objetivos e ações a definir]','Palette','bg-secondary text-secondary-foreground',2),
  ('esportes','Esportes','Ações sociais','Projetos e ações sociais pelo esporte — inclui o Talento Brasil, projeto ativo desde 2017.','Trophy','bg-primary text-primary-foreground',3),
  ('meio-ambiente','Meio Ambiente','Sustentabilidade','Ações de sustentabilidade e educação ambiental na comunidade. [Detalhamento de objetivos e ações a definir]','Leaf','bg-primary text-primary-foreground',4),
  ('negocios','Negócios','Indústria e comércio','Indústria e comércio: a origem do IDEX, hoje a serviço da competitividade local. [Detalhamento de objetivos e ações a definir]','Briefcase','bg-secondary text-secondary-foreground',5),
  ('saude','Saúde','Qualidade de vida','Qualidade de vida como parte do desenvolvimento social integral. [Detalhamento de objetivos e ações a definir]','HeartPulse','bg-secondary text-secondary-foreground',6)
on conflict (slug) do nothing;

insert into public.projetos (slug, titulo, resumo, descricao, area_slug, local, parceiro, status, iniciado_em, beneficiados, destaque)
values (
  'talento-brasil',
  'Talento Brasil',
  'Futebol gratuito para 200 crianças e jovens das categorias de base.',
  'Treinamento de futebol gratuito para 200 crianças e jovens nas categorias de base, em parceria com o Clube Esportivo Penha. Lançado em 26/06/2017, na Câmara dos Vereadores de Santa Cruz do Rio Pardo.',
  'esportes',
  'Rua Armando Cardoso Alves, 106 — Penha',
  'Clube Esportivo Penha',
  'ativo',
  '2017-06-26',
  200,
  true
) on conflict (slug) do nothing;
