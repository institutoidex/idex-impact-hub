// Envio pela API REST oficial do Resend (POST https://api.resend.com/emails), sem SDK.
// Destinatários vêm só da configuração do servidor; o visitante entra apenas no Reply-To.
// Idempotency-Key = id da mensagem: um reenvio do mesmo protocolo não duplica o e-mail.
// Erros: só um código seguro, nunca corpo do provedor, chave ou dados do visitante.
import type { ConfigEmail } from "./config.server";
import { limparCabecalho } from "./email-html";

export const RESEND_URL = "https://api.resend.com/emails";
export const TEMPO_LIMITE_EMAIL_MS = 10_000;

export type CodigoErroEmail = "timeout" | "recusado" | "rede";

export class ErroEmail extends Error {
  constructor(public codigo: CodigoErroEmail) {
    super(codigo);
  }
}

export type EmailMontado = {
  id: string;
  responderPara: string;
  assunto: string;
  html: string;
  texto: string;
};

/** Monta o corpo JSON do pedido (exportado para os testes). */
export function corpoResend(cfg: ConfigEmail, e: EmailMontado) {
  return {
    from: cfg.remetente,
    to: [cfg.para],
    ...(cfg.copia ? { cc: [cfg.copia] } : {}),
    reply_to: limparCabecalho(e.responderPara),
    subject: limparCabecalho(e.assunto),
    html: e.html,
    text: e.texto,
  };
}

export async function enviarViaResend(
  cfg: ConfigEmail,
  e: EmailMontado,
  opcoes: { fetch?: typeof fetch; tempoMs?: number } = {},
): Promise<void> {
  const f = opcoes.fetch ?? fetch;
  let resp: Response;
  try {
    resp = await f(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.chave}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contato-${e.id}`,
      },
      body: JSON.stringify(corpoResend(cfg, e)),
      signal: AbortSignal.timeout(opcoes.tempoMs ?? TEMPO_LIMITE_EMAIL_MS),
    });
  } catch (err) {
    const nome = (err as { name?: string })?.name;
    throw new ErroEmail(nome === "TimeoutError" || nome === "AbortError" ? "timeout" : "rede");
  }
  // corpo descartado de propósito: pode conter dados que não devem ir a log
  await resp.body?.cancel().catch(() => {});
  if (!resp.ok) throw new ErroEmail("recusado");
}
