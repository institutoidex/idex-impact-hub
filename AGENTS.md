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
- GuardaAdmin só expulsa por erro de papel antes da primeira confirmação do servidor, e o papel não revalida ao voltar o foco — por quê: uma falha passageira (ex.: seletor de arquivos) mandava para /auth → /admin e apagava o editor aberto; o RLS continua barrando gravações.

## Idiomas

- Idioma vem do search param `?lang` validado no root e propagado por `retainSearchParams` — por quê: funciona em SSR/reload/links compartilhados sem mudar rotas. Textos ficam em catálogos tipados `src/i18n/catalogos/*` via `definirMensagens` (pt-BR é a referência; falta de chave quebra o typecheck). Conteúdo do banco usa coluna jsonb `traducoes` + `traduzir()` com fallback explícito ao português. Detalhes em `docs/i18n.md`.
