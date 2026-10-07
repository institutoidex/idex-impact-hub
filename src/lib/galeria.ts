// Galeria de fotos da notícia: tipos, normalização e detecção de coluna ausente.
// Módulo puro (sem Supabase/React) para ser usado no painel, na página pública e nos testes.

/** Lista ordenada de URLs públicas (http/https) das fotos da galeria. */
export type Galeria = string[];

/** Limite de fotos por notícia (mantém a página leve e o jsonb pequeno). */
export const LIMITE_GALERIA = 30;

/** Tamanho máximo de cada URL aceita (evita lixo gigante no jsonb). */
const LIMITE_URL = 2048;

/**
 * Aceita só URLs absolutas http/https. Recusa javascript:, data:, blob:,
 * caminhos relativos e textos que não sejam URL.
 */
export function urlGaleriaValida(valor: unknown): valor is string {
  if (typeof valor !== "string") return false;
  const texto = valor.trim();
  if (!texto || texto.length > LIMITE_URL) return false;
  try {
    const url = new URL(texto);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Converte qualquer valor vindo do banco/formulário numa galeria segura:
 * - não-array (null, objeto, texto, coluna ausente) → []
 * - descarta itens inválidos, remove espaços e repetidos (mantém a 1ª ocorrência)
 * - preserva a ordem e corta em LIMITE_GALERIA
 */
export function normalizarGaleria(valor: unknown): Galeria {
  if (!Array.isArray(valor)) return [];
  const vistas = new Set<string>();
  const saida: Galeria = [];
  for (const item of valor) {
    if (!urlGaleriaValida(item)) continue;
    const url = item.trim();
    if (vistas.has(url)) continue;
    vistas.add(url);
    saida.push(url);
    if (saida.length >= LIMITE_GALERIA) break;
  }
  return saida;
}

/** Move a foto do índice `de` uma posição (−1 = para trás, +1 = para frente). */
export function moverNaGaleria(galeria: Galeria, de: number, direcao: -1 | 1): Galeria {
  const para = de + direcao;
  if (de < 0 || de >= galeria.length || para < 0 || para >= galeria.length) return galeria;
  const copia = [...galeria];
  [copia[de], copia[para]] = [copia[para]!, copia[de]!];
  return copia;
}

/**
 * Erro do Postgres/PostgREST por coluna `galeria` inexistente
 * (42703 undefined_column ou PGRST204 fora do cache de schema).
 */
export function erroColunaGaleriaAusente(erro: unknown) {
  const e = erro as { code?: string; message?: string } | null;
  if (!e || (e.code !== "42703" && e.code !== "PGRST204")) return false;
  return /galeria/i.test(e.message ?? "");
}

/**
 * Lançado quando a notícia tem fotos na galeria mas o banco ainda não tem a
 * coluna (migração pendente). A gravação NÃO é refeita sem a galeria: o
 * editor fica aberto com tudo preenchido até a migração ser aplicada.
 */
export class ErroGaleriaColunaAusente extends Error {
  constructor() {
    super("coluna galeria ausente");
    this.name = "ErroGaleriaColunaAusente";
  }
}
