/**
 * Configuração do aviso por e-mail do formulário de contato.
 * Os endereços ficam só no servidor/código — nunca aparecem no site (regra anti-spam).
 *
 * ATIVAÇÃO PENDENTE: enquanto REMETENTE for null, nenhum e-mail é enviado.
 * Quando o domínio do remetente estiver verificado, preencha REMETENTE
 * (ex.: "contato@seudominio.com.br") e ligue o envio real em notificar-contato.functions.ts.
 */
export const EMAIL_CONTATO = {
  /** destino principal das mensagens */
  principal: "idex.secretaria@gmail.com",
  /** cópia (enviada quando o provedor permitir) */
  copia: "idex2007@hotmail.com" as string | null,
  /** remetente do domínio próprio — pendente de definição */
  remetente: null as string | null,
};
