# Formulário de contato: gravação + aviso por e-mail (Resend)

## Fluxo
1. `src/routes/contato.tsx` valida no navegador e chama `enviarContato` (`src/lib/contato/cliente.ts`)
   com um **id de envio** (`crypto.randomUUID()`) criado uma vez e reaproveitado em clique duplo /
   nova tentativa. O id é renovado quando o visitante altera um campo ou após sucesso.
2. `POST /api/public/contato` (`src/routes/api/public/contato.ts`) → `processarContato`
   (`src/lib/contato/endpoint.server.ts`):
   limite por origem → corpo até 16 KB reais → Zod estrito (campos extras recusados, sem quebra de
   linha em nome/e-mail/assunto) → armadilha anti-robô (`site`) → **grava em `mensagens`** →
   só então envia o e-mail → grava o status do aviso.
3. Falha ao gravar: 503 e **nenhum e-mail**. Falha/ausência de configuração do e-mail: a mensagem
   fica guardada e o visitante vê sucesso normal (não precisa reenviar).
4. Mesmo id repetido: se o conteúdo for idêntico, confirma sem duplicar (e não reenvia se o status já
   é `enviada`); se diferente, 409 sem sobrescrever nem devolver dados.

## E-mail
- API REST oficial `POST https://api.resend.com/emails` (sem SDK), timeout 10 s, sem nova tentativa
  automática. `Idempotency-Key: contato-<id>` (o Resend deduplica reenvios do mesmo protocolo).
- Destinatários vêm **só** do ambiente do servidor; o visitante entra apenas como `reply_to`.
- HTML: `src/lib/contato/email-html.ts` (tabelas 600px, CSS inline, todo dado escapado, texto puro
  equivalente). Logo: PNG atual público em `https://institutoidex.org/__l5e/assets-v1/.../logo-idex-horizontal-v2.png`.
  Exemplo com dados fictícios: `docs/exemplo-email-contato.html` (+ capturas desktop/mobile).
- Logs só com códigos (`[contato] email_timeout`, `falha_registro`…), nunca dados do visitante, IP ou chave.

## Configuração PENDENTE (Project Settings → Secrets)
| Nome | Exemplo | Situação |
|---|---|---|
| `RESEND_API_KEY` | chave da API Resend | **não cadastrada** (nenhuma conexão Resend encontrada neste projeto) |
| `CONTATO_EMAIL_REMETENTE` | `Instituto IDEX <contato@SEU-DOMINIO-VERIFICADO>` | aguardando domínio verificado no Resend |
| `CONTATO_EMAIL_PARA` | destino principal | aguardando confirmação |
| `CONTATO_EMAIL_COPIA` | cópia (opcional) | aguardando confirmação |

Sem qualquer um dos três obrigatórios, nada é enviado e o status fica `nao_configurado`.
Se a chave vier pelo conector Resend da Lovable (gateway), `resend.server.ts` precisa trocar a URL/cabeçalhos
para o gateway — hoje está na API direta com `RESEND_API_KEY`.

## Banco
- Usa a PK uuid já existente de `mensagens` com o id do navegador; gravação feita no servidor com o
  cliente service_role existente (`criarSupabaseAdmin`), restrita a esta tabela.
- SQL **opcional, não executado**: `supabase/migracoes/2026-10-20-notificacao-contato.sql`
  (colunas `notificacao_status`, `notificacao_em`). Sem ela tudo funciona; o status só não é gravado.
- Reenvio manual pelo painel (admin autenticado) é apenas proposta; não implementado.

## Limites
- 5 envios / 10 min por origem (hash SHA-256 do IP, memória da instância — com vários workers cada um
  conta separado e reinício zera; proteção de melhor esforço).
- Campos: nome 120, e-mail 255, assunto 150, mensagem 2000.
