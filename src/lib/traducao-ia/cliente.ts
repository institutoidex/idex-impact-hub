// Lado do navegador: chama o endpoint de tradução e aplica as regras puras
// (existência de traduções, mesclagem e validade do resultado).
import { supabase } from "../supabase";
import type { Traducoes } from "@/i18n/traduzir";
import {
  ROTA_TRADUCAO,
  esquemaSaida,
  type CodigoErroTraducao,
  type EntradaTraducao,
  type RespostaTraducao,
  type TraducoesGeradas,
} from "./contrato";

const CODIGOS_CONHECIDOS = new Set<CodigoErroTraducao>([
  "sem_token", "token_invalido", "sem_permissao", "payload_invalido", "nao_configurado",
  "limite_local", "em_andamento", "cota", "tempo_esgotado", "resposta_invalida",
  "resposta_truncada", "falha_provedor", "rede", "cancelado",
]);

/**
 * Envia SÓ os campos em português ao servidor, com o token da sessão.
 * `sinal` aborta a chamada (editor fechado/cancelado) → { codigo: "cancelado" }.
 * Sem novas tentativas automáticas.
 */
export async function pedirTraducao(
  entrada: EntradaTraducao,
  sinal?: AbortSignal,
  fetchImpl: typeof fetch = fetch,
  lerToken: () => Promise<string | undefined> = async () =>
    (await supabase.auth.getSession()).data.session?.access_token,
): Promise<RespostaTraducao> {
  try {
    const token = await lerToken();
    if (!token) return { ok: false, codigo: "sem_token" };
    const resp = await fetchImpl(ROTA_TRADUCAO, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ titulo: entrada.titulo, resumo: entrada.resumo, conteudo: entrada.conteudo }),
      signal: sinal ?? null,
    });
    const json = (await resp.json().catch(() => null)) as RespostaTraducao | null;
    if (json?.ok === true) {
      // confere de novo no navegador antes de entregar ao editor
      const r = esquemaSaida.safeParse(json.traducoes);
      return r.success ? { ok: true, traducoes: r.data } : { ok: false, codigo: "resposta_invalida" };
    }
    const codigo = json && json.ok === false ? json.codigo : null;
    return { ok: false, codigo: codigo && CODIGOS_CONHECIDOS.has(codigo) ? codigo : "falha_provedor" };
  } catch {
    return { ok: false, codigo: sinal?.aborted ? "cancelado" : "rede" };
  }
}

/** Há algum título/resumo/texto já traduzido em inglês ou espanhol? */
export function temTraducaoExistente(t: Traducoes) {
  return (["en-US", "es-ES"] as const).some((loc) =>
    (["titulo", "resumo", "conteudo"] as const).some((c) => (t[loc]?.[c] ?? "").trim()),
  );
}

/**
 * Aplica as traduções novas nos dois idiomas de uma vez, preservando
 * quaisquer outras chaves já existentes em cada idioma.
 */
export function mesclarTraducoes(atual: Traducoes, novas: TraducoesGeradas): Traducoes {
  return {
    ...atual,
    "en-US": { ...atual["en-US"], ...novas["en-US"] },
    "es-ES": { ...atual["es-ES"], ...novas["es-ES"] },
  };
}

/** Retrato do texto no momento do clique, para detectar edição durante a espera. */
export function retrato(entrada: EntradaTraducao, traducoes: Traducoes) {
  return JSON.stringify([entrada.titulo, entrada.resumo, entrada.conteudo, traducoes]);
}

/**
 * Motivo para NÃO traduzir agora (null = pode). Usado no clique do botão E no
 * "Substituir" da confirmação, para que a confirmação aberta não contorne
 * galeria enviando, salvamento, outra tradução ou limite de caracteres.
 */
export function bloqueioTraducao(estado: {
  traduzindo: boolean;
  desabilitado?: boolean;
  entrada: { titulo: string; resumo: string; conteudo: string };
  limite: number;
}): "bloqueado" | "semTitulo" | "acima" | null {
  if (estado.traduzindo || estado.desabilitado) return "bloqueado";
  if (!estado.entrada.titulo.trim()) return "semTitulo";
  const total = estado.entrada.titulo.length + estado.entrada.resumo.length + estado.entrada.conteudo.length;
  if (total > estado.limite) return "acima";
  return null;
}
