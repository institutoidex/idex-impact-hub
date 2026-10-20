// Configuração do aviso por e-mail — SOMENTE servidor (endereços nunca vão ao navegador).
// Destinos de produção são FIXOS aqui (confirmados pelo Pedro em 20/10/2026) e não podem
// ser trocados por variável de ambiente nem pelo navegador — sem "override" persistente.
// Do ambiente (cofre de secrets da Lovable) vêm só:
//  - RESEND_API_KEY      chave da API do Resend (ÚNICO obrigatório; chave "sending access" basta)
//  - RESEND_FROM_EMAIL   opcional: troca o remetente padrão, mas só se for @institutoidex.org
// Remetente padrão: REMETENTE_PADRAO (domínio verificado no Resend). Remetente inválido no
// ambiente NÃO cai no padrão: o aviso fica "nao_configurado" para o erro ser notado.
// Sem chave, nada é enviado: a mensagem é gravada e o aviso fica "nao_configurado".

/** Destinos fixos de produção. */
export const DESTINO_PRINCIPAL = "idex.secretaria@gmail.com";
export const DESTINO_COPIA = "idex2007@hotmail.com";
/** Único domínio aceito no remetente (nunca zas.com.br nem resend.dev). */
export const DOMINIO_REMETENTE = "institutoidex.org";
/** Remetente padrão (domínio institutoidex.org verificado no Resend em 20/10/2026). */
export const REMETENTE_PADRAO = "Instituto IDEX <formularios@institutoidex.org>";

export type ConfigEmail = {
  chave: string;
  remetente: string;
  para: string;
  copia: string | null;
};

const EMAIL = /^[^\s@<>"',;:\\]+@[^\s@<>"',;:\\]+\.[^\s@<>"',;:\\]+$/;
// eslint-disable-next-line no-control-regex
const CONTROLE = /[\r\n\u0000-\u001f\u007f]/;

/** E-mail simples e seguro para cabeçalho (sem quebras, sem vírgulas = um só destinatário). */
export function emailValido(s: string): boolean {
  return s.length <= 255 && !CONTROLE.test(s) && EMAIL.test(s);
}

/** Remetente "email" ou "Nome <email>", sem quebras e no domínio institutoidex.org. */
export function remetenteValido(s: string): boolean {
  if (CONTROLE.test(s) || s.length > 300) return false;
  const m = /^([^<>"\r\n]{1,100}) <([^<>]+)>$/.exec(s);
  const email = m ? m[2]! : s;
  return emailValido(email) && email.toLowerCase().endsWith(`@${DOMINIO_REMETENTE}`);
}

/** Lê e valida a configuração de produção; devolve null se incompleta ou inválida. */
export function lerConfigEmail(env: Record<string, string | undefined>): ConfigEmail | null {
  const chave = env["RESEND_API_KEY"]?.trim();
  const remetente = env["RESEND_FROM_EMAIL"]?.trim() || REMETENTE_PADRAO;
  if (!chave || !remetenteValido(remetente)) return null;
  return { chave, remetente, para: DESTINO_PRINCIPAL, copia: DESTINO_COPIA };
}

/**
 * Configuração ISOLADA para o primeiro teste real, usada só por script executado
 * direto no servidor (nunca por rota/navegador): um único destinatário, sem cópia.
 */
export function configTesteIsolado(
  env: Record<string, string | undefined>,
  destinoTeste: string,
): ConfigEmail | null {
  const prod = lerConfigEmail(env);
  if (!prod || !emailValido(destinoTeste)) return null;
  return { ...prod, para: destinoTeste, copia: null };
}
