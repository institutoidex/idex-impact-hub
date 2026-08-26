import { useQuery } from "@tanstack/react-query";
import {
  AREAS as AREAS_ESTATICAS,
  PROJETOS as PROJETOS_ESTATICOS,
  type Area,
  type Projeto,
} from "@/data/idex";
import { areasQuery, documentosQuery, projetosQuery } from "./queries";
import type { DocumentoRow } from "./db-types";

/**
 * Camada de conteúdo: lê do banco quando disponível e cai para os dados
 * estáticos do arquivo src/data/idex.ts enquanto o banco não tiver registros.
 * Assim o site nunca fica vazio, mesmo com o banco fora do ar.
 */

/** Áreas de atuação (banco > estático). */
export function useAreas(): Area[] {
  const { data } = useQuery(areasQuery);
  if (!data?.length) return AREAS_ESTATICAS;
  return data.map((a) => {
    const base = AREAS_ESTATICAS.find((e) => e.slug === a.slug);
    return {
      ...(base ?? ({} as Area)),
      slug: a.slug,
      nome: a.nome,
      resumo: a.resumo,
      descricao: a.descricao,
      icone: a.icone || base?.icone || "heart",
      cor: a.cor || base?.cor || "bg-primary/10 text-primary",
    } as Area;
  });
}

/** Projetos publicados (banco > estático), no formato usado pelas páginas. */
export function useProjetos(): Projeto[] {
  const { data } = useQuery(projetosQuery);
  if (!data?.length) return PROJETOS_ESTATICOS;
  return data.map((p) => {
    const base = PROJETOS_ESTATICOS.find((e) => e.slug === p.slug);
    return {
      ...(base ?? ({} as Projeto)),
      slug: p.slug,
      nome: p.titulo,
      area: (p.area_slug ?? base?.area ?? "esportes") as Projeto["area"],
      ano: p.iniciado_em ? new Date(p.iniciado_em).getFullYear() : (base?.ano ?? new Date().getFullYear()),
      resumo: p.resumo,
      real: true,
      local: p.local ?? base?.local,
      parceria: p.parceiro ?? base?.parceria,
      // capa enviada pelo painel; quando vazia a página usa a imagem padrão
      imagem: p.imagem_url,
    } as Projeto;
  });
}

/** Documentos de transparência agrupados por categoria (vazio = placeholders). */
export function useDocumentos(): Record<string, DocumentoRow[]> {
  const { data } = useQuery(documentosQuery);
  const grupos: Record<string, DocumentoRow[]> = {};
  for (const doc of data ?? []) {
    (grupos[doc.categoria] ??= []).push(doc);
  }
  return grupos;
}
