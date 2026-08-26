/**
 * Endereços canônicos do site do Instituto IDEX.
 * Centralizado aqui para que canonical, og:url e links internos não divirjam.
 */
export const SITE_URL = "https://idex-impact-hub.lovable.app";

/** URL absoluta de uma notícia (mesmo padrão para notícia geral ou de projeto). */
export function urlNoticia(slug: string) {
  return `${SITE_URL}/noticias/${slug}`;
}

/** URL absoluta de um projeto. */
export function urlProjeto(slug: string) {
  return `${SITE_URL}/projetos/${slug}`;
}

/** Transforma um caminho de imagem em URL absoluta (og:image exige absoluta). */
export function urlAbsoluta(caminho: string | null | undefined) {
  if (!caminho) return null;
  if (caminho.startsWith("http://") || caminho.startsWith("https://")) return caminho;
  return null;
}
