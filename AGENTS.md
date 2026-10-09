<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Regras técnicas

- Backend = Supabase externo do próprio usuário (project ref `rhgiuskcuowphhwuewcf`), configurado via `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) + secret `IDEX_SUPABASE_SERVICE_ROLE_KEY` no cofre da Lovable. NÃO é Lovable Cloud e NÃO é conector (workspace knowledge proíbe Lovable Cloud sem aval do Pedro). Nunca trocar para Lovable Cloud nem mover credenciais para o código.
- Nota histórica: em 2026-09-29 o host `rhgiuskcuowphhwuewcf.supabase.co` retornou NXDOMAIN temporariamente. Em 2026-10-01 a conexão foi verificada funcional (leituras, formulários e painel) — não usar essa nota como diagnóstico; só investigar pausa do projeto se um erro de DNS reaparecer agora.

- Link de recuperação de senha sempre aponta para o domínio publicado (`urlRedefinicao` em `src/lib/recuperacao-senha.ts`) — por quê: o preview/localhost não está na allowlist do Supabase. Detalhes em `docs/recuperacao-senha.md`.
- GuardaAdmin ignora falha passageira de revalidação do papel só se uma busca real (dataUpdateCount > 0, nunca initialData/isFetched) já confirmou admin para o MESMO usuario.id; troca/perda de usuário zera, resposta false revoga, e o papel revalida ao voltar o foco — por quê: a falha passageira (ex.: seletor de arquivos) apagava o editor aberto, sem abrir brecha entre identidades; o RLS continua barrando gravações.

## Idiomas

- Idioma vem do search param `?lang` validado no root e propagado por `retainSearchParams` — por quê: funciona em SSR/reload/links compartilhados sem mudar rotas. Textos ficam em catálogos tipados `src/i18n/catalogos/*` via `definirMensagens` (pt-BR é a referência; falta de chave quebra o typecheck). Conteúdo do banco usa coluna jsonb `traducoes` + `traduzir()` com fallback explícito ao português. Detalhes em `docs/i18n.md`.
- Capa de notícia enviada por arquivo vira `noticias/capas/<uuid>/<titulo-pt>-capa.<ext>` (enviarCapa/nomeCapa em src/lib/storage.ts; UploadCapa só ativa com a prop `tituloCapa`) — por quê: a mesma foto precisa servir de capa em várias notícias sem colisão nem sobrescrita; URL colada não é baixada e outros envios mantêm o nome original.
- Galeria de notícia = coluna jsonb `noticias.galeria` (array de URLs http/https, sempre lida via `normalizarGaleria`); envios em `noticias/galeria/<uuid>/`; coluna ausente com fotos lança `ErroGaleriaColunaAusente` em vez de regravar sem ela — por quê: fotos nunca podem sumir em silêncio e notícias antigas seguem editáveis antes da migração. Detalhes em `docs/galeria-noticias.md`.
- Tradução automática de notícias = rota POST `/api/traducao-noticia` (módulos `src/lib/traducao-ia/*.server.ts` carregados dentro do handler), Gemini REST com modelo fixo e `GEMINI_API_KEY` só no servidor; admin confirmado no servidor por token + `has_role` com a chave publishable, sem service_role e sem Lovable AI Gateway — por quê: o Pedro escolheu o plano gratuito do Gemini e o papel enviado pelo navegador não é confiável. Detalhes em `docs/traducao-automatica.md`.
