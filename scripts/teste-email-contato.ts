// Teste ISOLADO do envio real pelo Resend — rodar só manualmente no servidor:
//   bun scripts/teste-email-contato.ts
// Vai para UM destinatário de teste fixo, sem cópia, com dados fictícios.
// Não grava nada no banco e não é importado pelo site (nenhuma rota usa este arquivo).
import { configTesteIsolado } from "../src/lib/contato/config.server";
import { montarEmailContato } from "../src/lib/contato/email-html";
import { enviarViaResend } from "../src/lib/contato/resend.server";

const DESTINO_TESTE = "tecnologia@zas.com.br";

const cfg = configTesteIsolado(process.env, DESTINO_TESTE);
if (!cfg) {
  console.log("configuracao_ausente_ou_invalida (RESEND_API_KEY / RESEND_FROM_EMAIL @institutoidex.org)");
  process.exit(1);
}

const id = crypto.randomUUID();
const email = montarEmailContato({
  id,
  nome: "Visitante Fictício",
  email: "visitante.ficticio@example.com",
  assunto: "Teste do formulário",
  mensagem: "Esta é uma mensagem fictícia de teste.\n\nNenhum dado real foi usado.",
  recebidoEm: new Date(),
});

try {
  await enviarViaResend(cfg, {
    id,
    responderPara: "visitante.ficticio@example.com",
    ...email,
    assunto: "[TESTE] IDEX — formulário de contato",
  });
  console.log(`enviado protocolo=${id} para=${cfg.para} cc=${cfg.copia ?? "nenhum"}`);
} catch (e) {
  console.log(`falhou codigo=${(e as { codigo?: string }).codigo ?? "desconhecido"}`);
  process.exit(1);
}
