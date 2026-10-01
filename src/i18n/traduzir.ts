// Traduções editoriais do conteúdo do banco (notícias, projetos, documentos, pastas).
// Formato da coluna jsonb `traducoes`: { "en-US": { titulo, resumo, ... }, "es-ES": {...} }.
// Fallback explícito: campo sem tradução volta ao português original — nunca some.
import { z } from "zod";
import { LOCALE_PADRAO, type Locale } from "./locales";

const camposTraduzidos = z
  .object({
    titulo: z.string().optional(),
    nome: z.string().optional(),
    resumo: z.string().optional(),
    conteudo: z.string().optional(),
    descricao: z.string().optional(),
  })
  .partial();

export const esquemaTraducoes = z
  .object({ "en-US": camposTraduzidos.optional(), "es-ES": camposTraduzidos.optional() })
  .partial();

export type Traducoes = z.infer<typeof esquemaTraducoes>;
export type CampoTraduzivel = keyof z.infer<typeof camposTraduzidos>;

/** Lê o jsonb com segurança: registro antigo sem a coluna ou valor inválido → {}. */
export function lerTraducoes(valor: unknown): Traducoes {
  const r = esquemaTraducoes.safeParse(valor ?? {});
  return r.success ? r.data : {};
}

/**
 * Devolve o registro com os campos pedidos no idioma atual.
 * `emPortugues` indica que ao menos um campo caiu no fallback (para exibir aviso).
 */
export function traduzir<T extends Record<string, unknown>>(
  registro: T,
  locale: Locale,
  campos: CampoTraduzivel[],
): T & { emPortugues: boolean } {
  if (locale === LOCALE_PADRAO) return { ...registro, emPortugues: false };
  const tr = lerTraducoes(registro["traducoes"])[locale] ?? {};
  let emPortugues = false;
  const saida: Record<string, unknown> = { ...registro };
  for (const campo of campos) {
    const original = registro[campo];
    if (typeof original !== "string" || !original.trim()) continue;
    const valor = tr[campo];
    if (valor && valor.trim()) saida[campo] = valor;
    else emPortugues = true;
  }
  return { ...(saida as T), emPortugues };
}

/** Limpa traduções vazias antes de salvar (não grava strings em branco). */
export function limparTraducoes(t: Traducoes): Traducoes {
  const saida: Traducoes = {};
  for (const loc of ["en-US", "es-ES"] as const) {
    const campos = Object.fromEntries(
      Object.entries(t[loc] ?? {}).filter(([, v]) => typeof v === "string" && v.trim()),
    );
    if (Object.keys(campos).length) saida[loc] = campos;
  }
  return saida;
}
