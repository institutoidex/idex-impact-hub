// Contrato do formulário de contato (seguro para o navegador: sem endereços nem segredos).
// O navegador manda só os campos do visitante + um id de envio estável; o servidor
// grava a mensagem e só depois avisa a equipe por e-mail.
import { z } from "zod";

export const ROTA_CONTATO = "/api/public/contato";

/** Limites dos campos (iguais aos do formulário). */
export const LIMITES_CONTATO = { nome: 120, email: 255, assunto: 150, mensagem: 2000 } as const;
/** Tamanho máximo do corpo do pedido, em bytes reais. */
export const LIMITE_CORPO_CONTATO = 16 * 1024;

// Quebras de linha são proibidas em campos de linha única (evita injeção em cabeçalhos).
const semQuebra = (s: string) => !/[\r\n]/.test(s);

/** Esquema estrito: qualquer campo extra (ex.: destinatário) faz o pedido ser recusado. */
export const esquemaContato = z
  .object({
    id: z.string().uuid(),
    nome: z.string().trim().min(2).max(LIMITES_CONTATO.nome).refine(semQuebra),
    email: z.string().trim().email().max(LIMITES_CONTATO.email).refine(semQuebra),
    assunto: z.string().trim().min(2).max(LIMITES_CONTATO.assunto).refine(semQuebra),
    mensagem: z.string().trim().min(5).max(LIMITES_CONTATO.mensagem),
    /** Armadilha anti-robô: campo invisível que pessoas deixam vazio. */
    site: z.string().max(200).optional(),
  })
  .strict();

export type EntradaContato = z.infer<typeof esquemaContato>;

/** Situação do aviso por e-mail (gravada no banco quando a coluna existir). */
export type StatusNotificacao = "enviada" | "falhou" | "nao_configurado";

export type CodigoErroContato = "payload_invalido" | "limite" | "conflito" | "falha_registro";

export const STATUS_HTTP_CONTATO: Record<CodigoErroContato, number> = {
  payload_invalido: 400,
  limite: 429,
  conflito: 409,
  falha_registro: 503,
};

/** Resposta do servidor. `ok: true` significa: a mensagem está guardada. */
export type RespostaContato =
  | { ok: true; protocolo: string }
  | { ok: false; codigo: CodigoErroContato };
