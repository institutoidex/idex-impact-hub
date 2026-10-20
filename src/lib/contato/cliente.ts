// Lado do navegador: envia o formulário para o servidor com um id de envio estável.
// O mesmo id é reaproveitado em clique duplo/novas tentativas, então o servidor
// não duplica a mensagem nem o e-mail.
import { ROTA_CONTATO, type RespostaContato } from "./contrato";

export const TEMPO_LIMITE_CLIENTE_MS = 20_000;

export async function enviarContato(
  dados: { id: string; nome: string; email: string; assunto: string; mensagem: string; site?: string },
  f: typeof fetch = fetch,
): Promise<RespostaContato> {
  try {
    const r = await f(ROTA_CONTATO, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(dados),
      signal: AbortSignal.timeout(TEMPO_LIMITE_CLIENTE_MS),
    });
    const corpo = (await r.json().catch(() => null)) as RespostaContato | null;
    if (corpo && typeof corpo === "object" && "ok" in corpo) return corpo;
    return { ok: false, codigo: "falha_registro" };
  } catch {
    return { ok: false, codigo: "falha_registro" };
  }
}
