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
- Em 2026-09-29 o host `rhgiuskcuowphhwuewcf.supabase.co` estava retornando NXDOMAIN (DNS inexistente) — investigar pausa/exclusão do projeto no dashboard do Supabase antes de assumir que o backend funciona.

