// Contrato da tradução automática (PT-BR → en-US e es-ES) para TODOS os
// cadastros trilíngues do painel: notícia, projeto, documento e pasta.
// Módulo puro e seguro para o navegador: registro de entidades, limites,
// esquemas Zod e códigos de erro, compartilhados entre botão, endpoint e Gemini.
import { z } from "zod";

/** Endereço do endpoint (rota de servidor TanStack Start). */
export const ROTA_TRADUCAO = "/api/traducao-noticia";

/** Limite total de caracteres enviados (soma dos campos). Mostrado no editor. */
export const LIMITE_TOTAL = 12_000;
/** Limites por campo da ENTRADA (português). */
export const LIMITE_TITULO = 300;
export const LIMITE_RESUMO = 1_500;
/** Limite do corpo bruto em BYTES reais (lido em stream, antes de virar texto). */
export const LIMITE_CORPO = 64 * 1024;
/** Saída pode ser maior que a entrada (inglês/espanhol se expandem): folga de 2x. */
const FOLGA_SAIDA = 2;

/** Limite de cada campo traduzível conhecido. */
const LIMITE_POR_CAMPO = {
  titulo: LIMITE_TITULO,
  nome: LIMITE_TITULO,
  resumo: LIMITE_RESUMO,
  conteudo: LIMITE_TOTAL,
  descricao: LIMITE_TOTAL,
} as const;
type CampoConhecido = keyof typeof LIMITE_POR_CAMPO;

/**
 * REGISTRO (allowlist) de cadastros traduzíveis. Só estes campos de texto em
 * português podem ir ao Gemini. Nunca entram: slug, ids, URLs, arquivos/PDFs,
 * nomes de arquivo, categoria, pasta mãe, datas, ano, ordem, capa ou galeria.
 * Para um novo formulário trilíngue: adicionar uma linha aqui (ver docs/traducao-automatica.md).
 */
export const ENTIDADES = {
  noticia: { campos: ["titulo", "resumo", "conteudo"], obrigatorio: "titulo" },
  projeto: { campos: ["titulo", "resumo", "descricao"], obrigatorio: "titulo" },
  documento: { campos: ["titulo"], obrigatorio: "titulo" },
  pasta: { campos: ["nome"], obrigatorio: "nome" },
} as const satisfies Record<string, { campos: readonly CampoConhecido[]; obrigatorio: CampoConhecido }>;

export type Entidade = keyof typeof ENTIDADES;
/** Campos traduzíveis de uma entidade (ex.: CampoDe<"pasta"> = "nome"). */
export type CampoDe<E extends Entidade> = (typeof ENTIDADES)[E]["campos"][number];
/** Valores em português dos campos de uma entidade. */
export type CamposDe<E extends Entidade> = Record<CampoDe<E>, string>;

/** Pedido interno, já validado: entidade + somente os campos permitidos. */
export type PedidoTraducao = { [E in Entidade]: { entidade: E; campos: CamposDe<E> } }[Entidade];

export function ehEntidade(v: unknown): v is Entidade {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(ENTIDADES, v);
}

/** Soma de caracteres usada no limite (mesma conta no editor e no servidor). */
export function totalCaracteres(campos: Record<string, string>) {
  return Object.values(campos).reduce((s, v) => s + v.length, 0);
}

/** Esquema estrito dos campos em português de uma entidade. */
function esquemaCampos(entidade: Entidade) {
  const { campos, obrigatorio } = ENTIDADES[entidade];
  const forma: Record<string, z.ZodString> = {};
  for (const c of campos) {
    const base = z.string().max(LIMITE_POR_CAMPO[c]);
    forma[c] = c === obrigatorio ? base.trim().min(1) : base;
  }
  return z
    .object(forma)
    .strict() // campo extra (id, slug, url, ano…) = payload inválido
    .refine((e) => totalCaracteres(e as Record<string, string>) <= LIMITE_TOTAL, { message: "limite_total" });
}

/** Formato ANTIGO da notícia ({titulo,resumo,conteudo}) — mantido sem mudança. */
export const esquemaEntrada = esquemaCampos("noticia") as unknown as z.ZodType<CamposDe<"noticia">>;
export type EntradaTraducao = CamposDe<"noticia">;

/** Formato novo: { entidade, campos } — entidade só do registro acima. */
const esquemaGenerico = z
  .object({ entidade: z.string(), campos: z.record(z.string(), z.unknown()) })
  .strict();

/**
 * Valida o corpo recebido pelo endpoint. Aceita:
 * - o formato antigo da notícia (sem `entidade`) → entidade "noticia";
 * - { entidade, campos } com entidade do registro e campos estritos.
 * Retorna null para qualquer outra coisa (vira 400).
 */
export function analisarEntrada(json: unknown): PedidoTraducao | null {
  if (json && typeof json === "object" && "entidade" in json) {
    const g = esquemaGenerico.safeParse(json);
    if (!g.success || !ehEntidade(g.data.entidade)) return null;
    const c = esquemaCampos(g.data.entidade).safeParse(g.data.campos);
    return c.success ? ({ entidade: g.data.entidade, campos: c.data } as PedidoTraducao) : null;
  }
  const n = esquemaCampos("noticia").safeParse(json);
  return n.success ? { entidade: "noticia", campos: n.data as CamposDe<"noticia"> } : null;
}

/** Aceita pedido novo ou objeto da notícia no formato antigo (compatibilidade). */
export function normalizarPedido(x: PedidoTraducao | EntradaTraducao): PedidoTraducao {
  return "entidade" in x ? x : { entidade: "noticia", campos: x };
}

/** Esquema da SAÍDA de uma entidade: os dois idiomas, só os campos permitidos. */
export function esquemaSaidaDe(entidade: Entidade) {
  const forma: Record<string, z.ZodString> = {};
  for (const c of ENTIDADES[entidade].campos) forma[c] = z.string().max(LIMITE_POR_CAMPO[c] * FOLGA_SAIDA);
  const campos = z.object(forma).strict();
  return z.object({ "en-US": campos, "es-ES": campos }).strict();
}

/** Traduções genéricas (campo → texto) nos dois idiomas, sempre juntas. */
export type TraducoesCampos = { "en-US": Record<string, string>; "es-ES": Record<string, string> };

/** Saída da notícia (compatibilidade com o código existente). */
export const esquemaSaida = esquemaSaidaDe("noticia") as unknown as z.ZodType<{
  "en-US": CamposDe<"noticia">;
  "es-ES": CamposDe<"noticia">;
}>;
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
  /** O Google respondeu 503/UNAVAILABLE (modelo sobrecarregado): passageiro, sem novas tentativas automáticas. */
  provedor_ocupado: 503,
} as const;

export type CodigoServidor = keyof typeof STATUS_POR_CODIGO;
/** Códigos que só existem no navegador (rede caiu, usuário cancelou). */
export type CodigoErroTraducao = CodigoServidor | "rede" | "cancelado";

export type RespostaTraducao =
  | { ok: true; traducoes: TraducoesCampos }
  | { ok: false; codigo: CodigoErroTraducao };

/**
 * Regra de campo vazio: o que está vazio em português fica vazio na tradução;
 * o que tem texto em português precisa vir traduzido. Devolve false se violar.
 */
export function respeitaVazios(entrada: PedidoTraducao | EntradaTraducao, saida: TraducoesCampos) {
  const p = normalizarPedido(entrada);
  const campos = p.campos as Record<string, string>;
  for (const loc of ["en-US", "es-ES"] as const) {
    for (const campo of ENTIDADES[p.entidade].campos) {
      const temPt = (campos[campo] ?? "").trim().length > 0;
      const temTr = (saida[loc][campo] ?? "").trim().length > 0;
      if (temPt !== temTr) return false;
    }
  }
  return true;
}
