# Galeria de fotos das notícias

Fotos extras de uma notícia, exibidas **depois do texto principal**, iguais nos três idiomas (só os textos mudam).

## SQL (aplicar no Supabase externo `rhgiuskcuowphhwuewcf`, SQL Editor)
`supabase/migracoes/2026-10-07-galeria-noticias.sql` — aditiva e idempotente:
- `noticias.galeria jsonb not null default '[]'` + constraint `noticias_galeria_array` (`jsonb_typeof = 'array'`);
- não mexe em RLS, papéis, registros ou arquivos; `notify pgrst, 'reload schema'` no fim.
Em 07/10/2026 a leitura REST (`select=galeria`) respondeu `42703 column noticias.galeria does not exist`: migração **pendente**.

## Arquivos
- `src/lib/galeria.ts` — tipo `Galeria`, `LIMITE_GALERIA` (30), `normalizarGaleria` (só http/https, sem repetidos, ordem mantida, malformado → `[]`), `moverNaGaleria`, `erroColunaGaleriaAusente`, `ErroGaleriaColunaAusente`.
- `src/lib/storage.ts` — `enviarFotoGaleria`: `noticias/galeria/<uuid>/<nome-limpo>.<ext>`, upsert false (mesma foto pode entrar várias vezes; nada sobrescrito/apagado).
- `src/lib/mutations.ts` — `gravarNoticia` (usada por `useSalvarNoticia`) e `camposGaleria`.
- `src/components/admin/UploadImagem.tsx` — `UploadMidia` ganhou modo galeria (`valor`/`aoMudar`/`aoMudarEnviando`); sem essas props (EditorProjeto) continua o modo antigo.
- `src/components/admin/EditorNoticia.tsx` — estado `galeria` inicializado do registro; Salvar bloqueado durante envio; erro de gravação mantém o editor aberto.
- `src/routes/noticias.$slug.tsx` — `select("*")` + `normalizarGaleria`; renderiza `GaleriaLightbox` (visor `VisorFotos`: setas, Esc) com título/alt traduzidos.
- Catálogos: `midia.upload.galeria*`, `noticias.detalhe.galeriaTitulo/galeriaAlt`, `editores.erros.galeriaColunaAusente`.

## Fluxo e regras
1. Enviar fotos acrescenta URLs à galeria do formulário (nada é gravado no banco até Salvar).
2. "Tirar" remove só a associação; o arquivo continua na Biblioteca de Mídia. Setas reordenam.
3. Salvar manda `galeria` quando há fotos ou quando o registro já tinha a coluna.
4. Banco sem migração: notícia sem fotos salva normalmente; com fotos aparece o aviso da migração e o editor fica aberto (nunca grava descartando as fotos). Fallback de `traducoes` ausente mantém a galeria.
5. Notícias antigas ficam com galeria vazia; fotos antigas não são associadas por nome/pasta.
