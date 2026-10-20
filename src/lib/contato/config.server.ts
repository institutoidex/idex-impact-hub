// Configuração do aviso por e-mail — SOMENTE servidor (endereços nunca vão ao navegador).
// Tudo vem do ambiente (cofre de secrets da Lovable):
//  - RESEND_API_KEY            chave da API do Resend
//  - CONTATO_EMAIL_REMETENTE   From, ex.: "Instituto IDEX <contato@dominio-verificado>"
//  - CONTATO_EMAIL_PARA        destino principal
//  - CONTATO_EMAIL_COPIA       cópia (opcional)
// Enquanto faltar chave, remetente ou destino, nada é enviado: a mensagem é
// gravada normalmente e o aviso fica como "nao_configurado".

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

/** Remetente: "email" ou "Nome <email>", sem quebras de linha. */
export function remetenteValido(s: string): boolean {
  if (CONTROLE.test(s) || s.length > 300) return false;
  const m = /^([^<>"\r\n]{1,100}) <([^<>]+)>$/.exec(s);
  return m ? emailValido(m[2]!) : emailValido(s);
}

/** Lê e valida a configuração; devolve null se incompleta ou inválida. */
export function lerConfigEmail(env: Record<string, string | undefined>): ConfigEmail | null {
  const chave = env["RESEND_API_KEY"]?.trim();
  const remetente = env["CONTATO_EMAIL_REMETENTE"]?.trim();
  const para = env["CONTATO_EMAIL_PARA"]?.trim();
  const copia = env["CONTATO_EMAIL_COPIA"]?.trim() || null;
  if (!chave || !remetente || !para) return null;
  if (!remetenteValido(remetente) || !emailValido(para)) return null;
  if (copia && !emailValido(copia)) return null;
  return { chave, remetente, para, copia };
}
