// Teste ISOLADO do envio real pelo Resend — rodar só manualmente no servidor:
//   bun ./scripts/teste-email-contato.ts
// UM destinatário de teste fixo, sem cópia/cópia oculta, dados fictícios, HTML atual.
// Não grava nada no banco e não é importado pelo site (nenhuma rota usa este arquivo).
// Protocolo FIXO = Idempotency-Key estável: repetir o script não duplica o e-mail (24h).
import { configTesteIsolado } from "../src/lib/contato/config.server";
import { montarEmailContato } from "../src/lib/contato/email-html";
import { corpoResend, enviarViaResend } from "../src/lib/contato/resend.server";

const DESTINO_TESTE = "tecnologia@zas.com.br";
const PROTOCOLO_TESTE = "00000000-0000-4000-8000-000000000001";
const RESPONDER_PARA = "ficticio@example.com";

const cfg = configTesteIsolado(process.env, DESTINO_TESTE);
if (!cfg) {
  console.log("configuracao_ausente_ou_invalida");
  process.exit(1);
}

const email = montarEmailContato({
  id: PROTOCOLO_TESTE,
  nome: "Visitante Fictício",
  email: RESPONDER_PARA,
  assunto: "Teste do formulário",
  mensagem: "Esta é uma mensagem fictícia de teste.\n\nNenhum dado real foi usado.",
  recebidoEm: new Date(),
});
const pedido = { id: PROTOCOLO_TESTE, responderPara: RESPONDER_PARA, ...email, assunto: "[TESTE] IDEX — formulário de contato" };

// conferência antes de enviar (sem chave)
const c = corpoResend(cfg, pedido);
console.log(`from=${c.from} to=${c.to.join(",")} cc=${"cc" in c ? "SIM" : "nenhum"} bcc=${"bcc" in c ? "SIM" : "nenhum"} reply_to=${c.reply_to} subject=${c.subject}`);
if (c.to.length !== 1 || c.to[0] !== DESTINO_TESTE || "cc" in c || "bcc" in c) process.exit(1);

try {
  const r = await enviarViaResend(cfg, pedido);
  console.log(`aceito http=${r.status} email_id=${r.id ?? "indisponivel"}`);
} catch (e) {
  const err = e as { codigo?: string; status?: number };
  console.log(`falhou codigo=${err.codigo ?? "desconhecido"} http=${err.status ?? "sem_resposta"}`);
  process.exit(1);
}
