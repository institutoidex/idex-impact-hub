-- Galeria de fotos das notícias (lista ordenada de URLs públicas).
-- Migração ADITIVA e idempotente para o Supabase externo (rhgiuskcuowphhwuewcf).
-- Pode ser rodada mais de uma vez no SQL Editor. Não altera RLS, papéis,
-- registros existentes nem arquivos do storage.
-- Notícias antigas ficam com galeria vazia ('[]'): nenhuma foto é associada por inferência.

alter table public.noticias
  add column if not exists galeria jsonb not null default '[]'::jsonb;

-- Garante que o valor seja sempre um array JSON (a validação de cada URL
-- http/https é feita pelo site em src/lib/galeria.ts).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'noticias_galeria_array'
      and conrelid = 'public.noticias'::regclass
  ) then
    alter table public.noticias
      add constraint noticias_galeria_array
      check (jsonb_typeof(galeria) = 'array');
  end if;
end $$;

comment on column public.noticias.galeria is
  'Lista ordenada de URLs (http/https) das fotos exibidas depois do texto da notícia.';

-- Atualiza o cache de schema da API para a coluna aparecer imediatamente.
notify pgrst, 'reload schema';
