// Contrato da tradução automática de notícias (PT-BR → en-US e es-ES).
// Módulo puro e seguro para o navegador: limites, esquemas Zod e códigos de erro,
// compartilhados entre o botão do editor, o endpoint e o serviço do Gemini.
import { z } from "zod";

/** Endereço do endpoint (rota de servidor TanStack Start). */
export const ROTA_TRADUCAO = "/api/traducao-noticia";

/** Limite total de caracteres enviados (título + resumo + texto). Mostrado no editor. */
export const LIMITE_TOTAL = 12_000;
/** Limites por campo da ENTRADA (português). */
export const LIMITE_TITULO = 300;
export const LIMITE_RESUMO = 1_500;
/** Limite do corpo HTTP bruto (bytes aproximados) antes de qualquer parse. */
/** Limite do corpo bruto em BYTES reais (lido em stream, antes de virar texto). */
export const LIMITE_CORPO = 64 * 1024;
/** Saída pode ser maior que a entrada (inglês/espanhol se expandem): folga de 2x. */
const FOLGA_SAIDA = 2;

/** Somente os campos de texto em português — nunca ids, slug, fotos ou e-mails. */
export const esquemaEntrada = z
  .object({
    titulo: z.string().trim().min(1).max(LIMITE_TITULO),
    resumo: z.string().max(LIMITE_RESUMO),
    conteudo: z.string().max(LIMITE_TOTAL),
  })
  .strict() // campo extra (id, slug, galeria…) = payload inválido
  .refine((e) => totalCaracteres(e) <= LIMITE_TOTAL, { message: "limite_total" });

export type EntradaTraducao = z.infer<typeof esquemaEntrada>;

/** Soma de caracteres usada no limite (mesma conta no editor e no servidor). */
export function totalCaracteres(e: { titulo: string; resumo: string; conteudo: string }) {
  return e.titulo.length + e.resumo.length + e.conteudo.length;
}

const camposSaida = z
  .object({
    titulo: z.string().max(LIMITE_TITULO * FOLGA_SAIDA),
    resumo: z.string().max(LIMITE_RESUMO * FOLGA_SAIDA),
    conteudo: z.string().max(LIMITE_TOTAL * FOLGA_SAIDA),
  })
  .strict();

/** Traduções devolvidas ao editor: os DOIS idiomas sempre juntos. */
export const esquemaSaida = z.object({ "en-US": camposSaida, "es-ES": camposSaida }).strict();
export type TraducoesGeradas = z.infer<typeof esquemaSaida>;

/** Códigos seguros de erro (o texto visível vem do catálogo traducao-ia). */
export const STATUS_POR_CODIGO = {
  sem_token: 401,
  token_invalido: 401,
  sem_permissao: 403,
  payload_invalido: 400,
  nao_configurado: 503,
  limite_local: 429,
  em_andamento: 409,
  cota: 429,
  tempo_esgotado: 504,
  resposta_invalida: 502,
  resposta_truncada: 502,
  falha_provedor: 502,
  /** Falha inesperada ao conferir o administrador (ex.: Supabase fora do ar). */
  falha_verificacao: 503,
  /** A chave existe no servidor, mas o Google a recusou (inválida/API desativada). */
  chave_recusada: 503,
} as const;

export type CodigoServidor = keyof typeof STATUS_POR_CODIGO;
/** Códigos que só existem no navegador (rede caiu, usuário cancelou). */
export type CodigoErroTraducao = CodigoServidor | "rede" | "cancelado";

export type RespostaTraducao =
  | { ok: true; traducoes: TraducoesGeradas }
  | { ok: false; codigo: CodigoErroTraducao };

/**
 * Regra de campo vazio: o que está vazio em português fica vazio na tradução;
 * o que tem texto em português precisa vir traduzido. Devolve false se violar.
 */
export function respeitaVazios(entrada: EntradaTraducao, saida: TraducoesGeradas) {
  for (const loc of ["en-US", "es-ES"] as const) {
    for (const campo of ["titulo", "resumo", "conteudo"] as const) {
      const temPt = entrada[campo].trim().length > 0;
      const temTr = saida[loc][campo].trim().length > 0;
      if (temPt !== temTr) return false;
    }
  }
  return true;
}
