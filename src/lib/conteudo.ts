import { useQuery } from "@tanstack/react-query";
import { PROJETOS as PROJETOS_ESTATICOS, type Projeto } from "@/data/idex";
import { documentosQuery, pastasQuery, projetosQuery } from "./queries";
import type { DocumentoRow, PastaRow } from "./db-types";
import { useLocale } from "@/i18n/mensagens";
import { traduzir } from "@/i18n/traduzir";

/**
 * Camada de conteúdo: lê do banco quando disponível e cai para os dados
 * estáticos do arquivo src/data/idex.ts enquanto o banco não tiver registros.
 * Assim o site nunca fica vazio, mesmo com o banco fora do ar.
 * Todo texto editorial do banco passa por traduzir() no idioma atual.
 */

/** Projetos publicados (banco > estático), já traduzidos para o idioma atual. */
export function useProjetos(): (Projeto & { emPortugues: boolean })[] {
  const locale = useLocale();
  const { data } = useQuery(projetosQuery);
  if (!data?.length) return PROJETOS_ESTATICOS.map((p) => ({ ...p, emPortugues: false }));
  return data.map((p) => {
    const t = traduzir(p, locale, ["titulo", "resumo", "descricao"]);
    const base = PROJETOS_ESTATICOS.find((e) => e.slug === p.slug);
    return {
      ...(base ?? ({} as Projeto)),
      slug: p.slug,
      nome: t.titulo,
      ano: p.iniciado_em
        ? new Date(p.iniciado_em).getFullYear()
        : (base?.ano ?? new Date().getFullYear()),
      resumo: t.resumo,
      real: true,
      // capa enviada pelo painel; quando vazia a página usa a imagem padrão
      imagem: p.imagem_url,
      emPortugues: t.emPortugues,
    } as Projeto & { emPortugues: boolean };
  });
}

/** Documentos de transparência agrupados por categoria (vazio = placeholders). */
export function useDocumentos(): Record<string, DocumentoRow[]> {
  const locale = useLocale();
  const { data } = useQuery(documentosQuery);
  const grupos: Record<string, DocumentoRow[]> = {};
  for (const doc of data ?? []) {
    const t = traduzir(doc, locale, ["titulo"]);
    (grupos[doc.categoria] ??= []).push(t);
  }
  return grupos;
}

/** Documentos publicados em lista crua, já traduzidos (navegação por pastas). */
export function useListaDocumentos(): (DocumentoRow & { emPortugues: boolean })[] {
  const locale = useLocale();
  const { data } = useQuery(documentosQuery);
  return (data ?? []).map((d) => traduzir(d, locale, ["titulo"]));
}

/** Pastas e subpastas cadastradas no painel, com o nome já traduzido. */
export function usePastas(): (PastaRow & { emPortugues: boolean })[] {
  const locale = useLocale();
  const { data } = useQuery(pastasQuery);
  return (data ?? []).map((p) => traduzir(p, locale, ["nome"]));
}
