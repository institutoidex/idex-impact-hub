// Lado do navegador: chama o endpoint de tradução e aplica as regras puras
// (existência de traduções, mesclagem e validade do resultado).
// Serve a TODAS as entidades do registro (notícia, projeto, documento, pasta).
import { supabase } from "../supabase";
import type { Traducoes } from "@/i18n/traduzir";
import {
  ENTIDADES,
  ROTA_TRADUCAO,
  esquemaSaidaDe,
  normalizarPedido,
  type CodigoErroTraducao,
  type Entidade,
  type EntradaTraducao,
  type PedidoTraducao,
  type RespostaTraducao,
  type TraducoesCampos,
} from "./contrato";

const CODIGOS_CONHECIDOS = new Set<CodigoErroTraducao>([
  "sem_token", "token_invalido", "sem_permissao", "payload_invalido", "nao_configurado",
  "limite_local", "em_andamento", "cota", "tempo_esgotado", "resposta_invalida",
  "resposta_truncada", "falha_provedor", "falha_verificacao", "chave_recusada", "rede", "cancelado",
]);

/** Separa SÓ os campos permitidos da entidade (descarta slug, url, ano, ids…). */
export function camposPermitidos(entidade: Entidade, valores: Record<string, unknown>) {
  return Object.fromEntries(
    ENTIDADES[entidade].campos.map((c) => [c, typeof valores[c] === "string" ? (valores[c] as string) : ""]),
  ) as Record<string, string>;
}

/** Corpo HTTP: notícia mantém o formato antigo; demais entidades usam { entidade, campos }. */
export function corpoPedido(pedido: PedidoTraducao) {
  const campos = camposPermitidos(pedido.entidade, pedido.campos);
  return pedido.entidade === "noticia" ? campos : { entidade: pedido.entidade, campos };
}

/**
 * Envia SÓ os campos em português ao servidor, com o token da sessão.
 * Aceita { entidade, campos } ou o objeto da notícia no formato antigo.
 * `sinal` aborta a chamada (editor fechado/cancelado) → { codigo: "cancelado" }.
 * Sem novas tentativas automáticas.
 */
export async function pedirTraducao(
  entrada: PedidoTraducao | EntradaTraducao,
  sinal?: AbortSignal,
  fetchImpl: typeof fetch = fetch,
  lerToken: () => Promise<string | undefined> = async () =>
    (await supabase.auth.getSession()).data.session?.access_token,
): Promise<RespostaTraducao> {
  const pedido = normalizarPedido(entrada);
  try {
    const token = await lerToken();
    if (!token) return { ok: false, codigo: "sem_token" };
    const resp = await fetchImpl(ROTA_TRADUCAO, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(corpoPedido(pedido)),
      signal: sinal ?? null,
    });
    const json = (await resp.json().catch(() => null)) as RespostaTraducao | null;
    if (json?.ok === true) {
      // confere de novo no navegador, com o esquema da MESMA entidade
      const r = esquemaSaidaDe(pedido.entidade).safeParse(json.traducoes);
      return r.success ? { ok: true, traducoes: r.data as TraducoesCampos } : { ok: false, codigo: "resposta_invalida" };
    }
    const codigo = json && json.ok === false ? json.codigo : null;
    return { ok: false, codigo: codigo && CODIGOS_CONHECIDOS.has(codigo) ? codigo : "falha_provedor" };
  } catch {
    return { ok: false, codigo: sinal?.aborted ? "cancelado" : "rede" };
  }
}

/**
 * Há texto já traduzido em inglês ou espanhol NOS CAMPOS-ALVO da entidade?
 * (outras chaves não contam: elas nunca são substituídas). Padrão: notícia.
 */
export function temTraducaoExistente(t: Traducoes, entidade: Entidade = "noticia") {
  return (["en-US", "es-ES"] as const).some((loc) =>
    ENTIDADES[entidade].campos.some((c) => (t[loc]?.[c] ?? "").trim()),
  );
}

/**
 * Aplica as traduções novas nos dois idiomas de uma vez, preservando
 * quaisquer outras chaves já existentes em cada idioma.
 */
export function mesclarTraducoes(atual: Traducoes, novas: TraducoesCampos): Traducoes {
  return {
    ...atual,
    "en-US": { ...atual["en-US"], ...novas["en-US"] },
    "es-ES": { ...atual["es-ES"], ...novas["es-ES"] },
  };
}

/** Retrato dos campos no momento do clique, para detectar edição durante a espera. */
export function retrato(entrada: Record<string, string>, traducoes: Traducoes) {
  return JSON.stringify([Object.entries(entrada).sort(), traducoes]);
}

/**
 * Motivo para NÃO traduzir agora (null = pode). Usado no clique do botão E no
 * "Substituir" da confirmação, para que a confirmação aberta não contorne
 * envio de arquivos, salvamento, outra tradução ou limite de caracteres.
 * `obrigatorio`: campo que precisa ter texto (título; nome na pasta).
 */
export function bloqueioTraducao(estado: {
  traduzindo: boolean;
  desabilitado: boolean | undefined;
  entrada: Record<string, string>;
  limite: number;
  obrigatorio?: string;
}): "bloqueado" | "semTitulo" | "acima" | null {
  if (estado.traduzindo || estado.desabilitado) return "bloqueado";
  if (!(estado.entrada[estado.obrigatorio ?? "titulo"] ?? "").trim()) return "semTitulo";
  const total = Object.values(estado.entrada).reduce((s, v) => s + v.length, 0);
  if (total > estado.limite) return "acima";
  return null;
}
