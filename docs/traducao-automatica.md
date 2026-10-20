# Tradução automática dos cadastros trilíngues (Gemini, plano gratuito)

## Inventário (out/2026)
| Editor | Entidade | Campos enviados ao Gemini | Nunca enviados |
|---|---|---|---|
| EditorNoticia | noticia | titulo, resumo, conteudo | slug, capa, galeria, data, projeto, publicado |
| EditorProjeto (rota de projetos segue oculta) | projeto | titulo, resumo, descricao | slug, capa, mídia, data |
| EditorDocumento | documento | titulo | arquivo/URL, ano, categoria, pasta |
| EditorPasta (pastas e subpastas) | pasta | nome | slug, pasta mãe, ordem |
Não há outro editor com abas PT/EN/ES no painel.

## Como incluir um novo formulário trilíngue
1. Acrescentar a entidade em `ENTIDADES` (`contrato.ts`) com `campos` e `obrigatorio` (campo novo também em `LIMITE_POR_CAMPO`).
2. Acrescentar `envio.<entidade>` e `confirmarTexto.<entidade>` nos 3 idiomas em `catalogos/traducao-ia.ts` (o typecheck exige).
3. Acrescentar uma linha em `CONTEXTO` (`gemini.server.ts`).
4. No editor: `<BotaoTraduzir entidade="..." chaveAbertura={`${aberto}:${id}`} entrada={{...}} traducoes={trad} aoAplicar={(n) => setTrad((v) => mesclarTraducoes(v, n))} aoMudarTraduzindo={setTraduzindo} desabilitado={envio || salvar.isPending} />`, bloquear o Salvar com `traduzindo` e envolver o `mutateAsync` em try/catch.
O servidor só aceita entidades do registro e campos estritos; o limite por usuário é o mesmo para todas.

---


Botão no editor de notícia: traduz título, resumo e texto do português para inglês dos EUA (en-US) e espanhol da Espanha (es-ES), numa única chamada. O resultado só preenche as abas do editor: nada é salvo nem publicado sem clicar em Salvar.

## Configurar a chave (uma vez, quando for usar)
1. No Google AI Studio (https://aistudio.google.com/apikey), use a chave de um projeto **sem faturamento ativado** (plano gratuito). O código **não consegue saber** se o projeto tem faturamento: confira no AI Studio, em Faturamento, que o projeto continua no plano gratuito.
2. Na Lovable: Configurações do projeto → Secrets → criar `GEMINI_API_KEY` com a chave. Nunca usar `VITE_`, nunca colar no código nem no chat.
3. Publicar o site para a chave valer no endereço publicado.
Sem a chave, o botão responde "A tradução automática ainda não está configurada" (503) e nada é alterado.

Atenção (página oficial de preços): no plano gratuito o Google pode usar o conteúdo enviado para melhorar os produtos dele ("Used to improve our products: Yes"). Só o texto em português da notícia é enviado.

## Fluxo
```text
EditorNoticia → BotaoTraduzir (clique) → pedirTraducao (token da sessão)
  → POST /api/traducao-noticia → token (auth.getUser) → has_role(admin)
  → validação Zod → GEMINI_API_KEY → limite por usuário → Gemini generateContent
  → JSON validado → editor mescla en-US + es-ES juntos (se o texto não mudou)
```

## Arquivos
- `src/lib/traducao-ia/contrato.ts` — limites, esquemas de entrada/saída, códigos e status HTTP (seguro no navegador).
- `src/lib/traducao-ia/gemini.server.ts` — REST oficial, modelo fixo `gemini-3.1-flash-lite`, `responseJsonSchema`, timeout 45 s, sem tools/busca/retentativas, valida `finishReason` (MAX_TOKENS = cortada).
- `src/lib/traducao-ia/auth.server.ts` — token Bearer + `has_role` com a chave publishable e o token do usuário (sem service_role).
- `src/lib/traducao-ia/limite.server.ts` — 1 tradução por vez e 6 por 10 minutos por usuário.
- `src/lib/traducao-ia/endpoint.server.ts` — ordem das checagens e respostas; logs só com o código.
- `src/routes/api/traducao-noticia.ts` — rota POST; carrega os módulos de servidor dentro do handler.
- `src/lib/traducao-ia/cliente.ts` — chamada do navegador, `temTraducaoExistente`, `mesclarTraducoes`, `retrato`.
- `src/components/admin/BotaoTraduzir.tsx` — props `entrada`, `traducoes`, `aoAplicar`, `desabilitado`, `aoMudarTraduzindo`.
- `src/i18n/catalogos/traducao-ia.ts` — textos pt/en/es.
- Teste: `src/lib/traducao-ia/traducao-ia.test.ts`.

## Payload e respostas
Entrada da notícia (formato original, mantido): `{ titulo, resumo, conteudo }` (strict; nada de id/slug/fotos). Demais: `{ entidade: "projeto"|"documento"|"pasta", campos: {...} }` com campos estritos do registro. Título obrigatório (≤300), resumo ≤1.500, total ≤12.000 caracteres; corpo ≤64 KB.
Sucesso: `{ ok: true, traducoes: { "en-US": {...}, "es-ES": {...} } }`. Erro: `{ ok: false, codigo }`.
| código | status |
|---|---|
| sem_token, token_invalido | 401 |
| sem_permissao | 403 |
| payload_invalido | 400 |
| nao_configurado | 503 |
| cota (429 do Gemini), limite_local | 429 |
| em_andamento | 409 |
| tempo_esgotado | 504 |
| resposta_invalida, resposta_truncada, falha_provedor | 502 |
| falha_verificacao, chave_recusada (chave existe mas o Google recusou) | 503 |

## Regras do editor
- Traduz só no clique; com traduções existentes pede confirmação ("Substituir" / "Manter as atuais").
- Salvar fica bloqueado durante a tradução; traduzir fica bloqueado durante envio de fotos da galeria ou salvamento.
- Se o português ou as traduções mudarem durante a espera, o resultado é ignorado.
- Fechar o editor ou "Cancelar tradução" aborta a chamada; resposta tardia de outra abertura é ignorada.
- Falha nunca apaga nada. Outras chaves de tradução são preservadas.

## Limites conhecidos
- O limite por usuário vive na memória de cada instância do servidor: com várias instâncias ou reinício, a contagem não é compartilhada. A cota real é a do Gemini (429).
- O endpoint real com a chave real não foi testado (chave ainda não configurada).

## Proteções extras (revisão 305e919)
- O corpo do pedido é lido em stream e cortado em 64 KB reais (bytes) antes de virar texto; `content-length` maior já é recusado (400).
- Falha inesperada ao conferir o administrador responde 503 `falha_verificacao` em JSON, com log só do código.
- O "Substituir" da confirmação refaz as mesmas checagens do botão (`bloqueioTraducao`): não traduz com galeria enviando, salvamento, outra tradução, título vazio ou acima do limite.

## Diagnóstico: "ainda não está configurada" na prévia
`nao_configurado` significa que o servidor que atendeu o pedido não tinha `GEMINI_API_KEY` no ambiente. O secret entra no servidor quando ele é montado de novo: a prévia montada antes do cadastro continua sem a chave até a próxima atualização, e o site publicado só recebe a chave ao publicar. Chave presente mas recusada pelo Google aparece como `chave_recusada`.
