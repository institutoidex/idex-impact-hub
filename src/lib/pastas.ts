import type { DocumentoRow, PastaRow } from "./db-types";

/**
 * Utilitários da árvore de pastas da Transparência.
 * A estrutura base abaixo é usada só como espelho visual enquanto o banco
 * ainda não tem pastas cadastradas (ou enquanto a migração não foi rodada).
 */
export const PASTAS_BASE: { nome: string; slug: string }[] = [
  { nome: "Documentos", slug: "documentos" },
  { nome: "Emendas Parlamentares", slug: "emendas-parlamentares" },
  { nome: "Organograma", slug: "organograma" },
  { nome: "Perguntas Frequentes", slug: "perguntas-frequentes" },
  { nome: "Projetos", slug: "projetos" },
  { nome: "Relatórios", slug: "relatorios" },
];

/** Nó da árvore: a pasta e as subpastas já aninhadas. */
export type NoPasta = PastaRow & { filhas: NoPasta[]; nivel: number };

/** Gera um slug amigável (minúsculas, sem acentos). */
export function gerarSlug(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Monta a árvore a partir da lista plana vinda do banco. */
export function montarArvore(pastas: PastaRow[]): NoPasta[] {
  const porPai = new Map<string | null, PastaRow[]>();
  for (const p of pastas) {
    const chave = p.pasta_id ?? null;
    porPai.set(chave, [...(porPai.get(chave) ?? []), p]);
  }
  const ordenar = (lista: PastaRow[]) =>
    [...lista].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));

  const construir = (paiId: string | null, nivel: number): NoPasta[] =>
    ordenar(porPai.get(paiId) ?? []).map((p) => ({
      ...p,
      nivel,
      filhas: construir(p.id, nivel + 1),
    }));

  return construir(null, 0);
}

/** Lista achatada da árvore, útil para selects com indentação. */
export function achatar(nos: NoPasta[]): NoPasta[] {
  return nos.flatMap((n) => [n, ...achatar(n.filhas)]);
}

/** Caminho (breadcrumb) da raiz até a pasta informada. */
export function caminhoDaPasta(pastas: PastaRow[], id: string | null): PastaRow[] {
  const porId = new Map(pastas.map((p) => [p.id, p]));
  const caminho: PastaRow[] = [];
  let atual = id ? porId.get(id) : undefined;
  while (atual) {
    caminho.unshift(atual);
    atual = atual.pasta_id ? porId.get(atual.pasta_id) : undefined;
  }
  return caminho;
}

/** Ids da pasta e de todas as suas descendentes. */
export function idsDescendentes(pastas: PastaRow[], id: string): string[] {
  const filhas = pastas.filter((p) => p.pasta_id === id);
  return [id, ...filhas.flatMap((f) => idsDescendentes(pastas, f.id))];
}

/** Documentos que estão dentro de uma pasta (sem contar as subpastas). */
export function documentosDaPasta(documentos: DocumentoRow[], pastaId: string | null) {
  return documentos.filter((d) => (d.pasta_id ?? null) === pastaId);
}

// Nomes das pastas base traduzidos por idioma (usado só como espelho visual
// enquanto o banco não tem pastas cadastradas). PASTAS_BASE acima continua
// em português para os consumidores que ainda não são localizados.
import type { Locale } from "@/i18n/locales";

const PASTAS_BASE_EN: { nome: string; slug: string }[] = [
  { nome: "Documents", slug: "documentos" },
  { nome: "Congressional Earmarks", slug: "emendas-parlamentares" },
  { nome: "Organizational Chart", slug: "organograma" },
  { nome: "Frequently Asked Questions", slug: "perguntas-frequentes" },
  { nome: "Projects", slug: "projetos" },
  { nome: "Reports", slug: "relatorios" },
];

const PASTAS_BASE_ES: { nome: string; slug: string }[] = [
  { nome: "Documentos", slug: "documentos" },
  { nome: "Enmiendas Parlamentarias", slug: "emendas-parlamentares" },
  { nome: "Organigrama", slug: "organograma" },
  { nome: "Preguntas Frecuentes", slug: "perguntas-frequentes" },
  { nome: "Proyectos", slug: "projetos" },
  { nome: "Informes", slug: "relatorios" },
];

/** Devolve PASTAS_BASE no idioma pedido (fallback visual sem banco). */
export function pastasBasePorLocale(locale: Locale): { nome: string; slug: string }[] {
  if (locale === "en-US") return PASTAS_BASE_EN;
  if (locale === "es-ES") return PASTAS_BASE_ES;
  return PASTAS_BASE;
}
