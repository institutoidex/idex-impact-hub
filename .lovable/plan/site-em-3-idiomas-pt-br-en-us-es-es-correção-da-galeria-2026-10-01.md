# Site em 3 idiomas (pt-BR, en-US, es-ES) + correção da galeria

## O que o Pedro vai ver
- Seletor "Português · English · Español" no cabeçalho (computador e celular), acessível por teclado e leitor de tela.
- Trocar o idioma mantém a mesma página, filtros, busca, âncora (#) e o que já foi digitado nos formulários.
- Endereço compartilhável por idioma: `?lang=en-US` / `?lang=es-ES` (pt-BR é o padrão, sem parâmetro). Funciona ao abrir direto, recarregar e ao compartilhar.
- Todo o site traduzido: páginas públicas, notícia/projeto, menu, rodapé, busca, Transparência (filtros/pastas), galeria e zoom, acessibilidade, mensagens de carregando/vazio/erro/404, formulários, login/recuperar/redefinir senha e todo o painel da equipe.
- Notícias, projetos, documentos e pastas com campos de tradução EN/ES editáveis no painel; quando faltar tradução, mostra o português com um aviso discreto ("Conteúdo disponível em português").
- Não traduzidos: nomes próprios, marcas, endereço, CNPJ, telefone, PDFs/organograma, nomes de arquivos, mensagens de visitantes.
- Galeria: botão "Próxima foto" deixa de fechar o visualizador; anterior/próxima, zoom e Esc revisados.

## Pendência real esperada
- O banco é o seu Supabase externo — eu não executo SQL. Entrego o arquivo SQL (aditivo, idempotente, não destrutivo) com o novo campo de traduções e o seed das traduções dos 5 artigos publicados para você rodar no SQL Editor. Até lá o site funciona normalmente, mostrando português para o conteúdo do banco.
- Para traduzir os 5 artigos fielmente preciso ler o texto deles; se o banco estiver inacessível daqui (problema de DNS já visto), o seed sai com as traduções do que eu conseguir ler e aviso o que faltou.

## Detalhes técnicos
- `src/i18n/`: `locales.ts` (lista, validação, nomes nativos), `mensagens/pt-BR.ts` (fonte do tipo), `en-US.ts`, `es-ES.ts` tipados por `satisfies Mensagens` (catálogo incompleto quebra o typecheck), `formatar.ts` (Intl de datas/números com data inválida tratada, `Intl.PluralRules`), `LocaleProvider` + `useT()`.
- Locale vem do search param `lang` validado no `__root` (`validateSearch`), então SSR, reload e acesso direto renderizam certo; preferência salva em localStorage (try/catch) só redireciona quando não há `?lang` na URL, dentro de `useEffect`.
- Links internos: helper `useLinkLocale` / `search={(p)=>({...p, lang})}` preservando buscas existentes.
- `<html lang>` dinâmico; `head()` de cada rota lê o locale do match: títulos/descrições/OG traduzidos, `og:locale`, canonical com o próprio `?lang`, `hreflang` pt-BR/en-US/es-ES/x-default; `lang` inválido → noindex + fallback pt-BR. Sitemap ganha as alternativas.
- Conteúdo dinâmico: coluna `traducoes jsonb not null default '{}'` em noticias, projetos, documentos, pastas, formato `{ "en-US": {titulo, resumo, conteudo}, "es-ES": {...} }`, validado com zod; helper `traduzir(registro, locale)` com fallback explícito ao pt-BR; abas PT/EN/ES nos editores do painel; RLS inalterada. Leitura tolera registros sem a coluna.
- `supabase/migracoes/2026-10-01-traducoes.sql` + `supabase/seed/traducoes-artigos.sql` comentados em pt-br.
- Galeria: `stopPropagation` nos botões do VisorFotos/GaleriaLightbox e fechamento só no clique direto no fundo (`e.target === e.currentTarget`).
- Testes vitest: catálogos com as mesmas chaves, validação de locale, preservação de search/hash, `traduzir` com fallback, formatação de datas inválidas. Playwright em 390px e 1280px nos 3 idiomas, com reload.
- Documentação: `docs/i18n.md` (arquivos, fluxos, SQL pendente) + regra no AGENTS.md.
- Sem novas dependências, sem tradução automática/DOM, sem publicar.
