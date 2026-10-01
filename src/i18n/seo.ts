// Metadados por idioma: title, description, OG, canonical e hreflang.
// Cada rota chama seoPagina() no seu head() com o ?lang validado do match.
import { SITE_URL } from "@/lib/site";
import { LOCALES, OG_LOCALE, normalizarLocale, urlComLocale, type Locale } from "./locales";

type Meta = Record<string, string>;

export function seoPagina(opcoes: {
  lang: unknown;
  /** caminho da página sem query (ex.: "/noticias/meu-slug") */
  caminho: string;
  titulo: string;
  descricao: string;
  tipo?: "website" | "article";
  /** imagem absoluta já dimensionada (opcional) */
  imagem?: string | null;
  /** páginas privadas (login/painel) não são indexadas */
  noindex?: boolean;
}): { meta: Meta[]; links: Meta[] } {
  const locale: Locale = normalizarLocale(opcoes.lang);
  const url = urlComLocale(SITE_URL, opcoes.caminho, locale);
  const meta: Meta[] = [
    { title: opcoes.titulo },
    { name: "description", content: opcoes.descricao },
    { property: "og:title", content: opcoes.titulo },
    { property: "og:description", content: opcoes.descricao },
    { property: "og:type", content: opcoes.tipo ?? "website" },
    { property: "og:url", content: url },
    { property: "og:locale", content: OG_LOCALE[locale] },
    ...LOCALES.filter((l) => l !== locale).map((l) => ({
      property: "og:locale:alternate",
      content: OG_LOCALE[l],
    })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opcoes.titulo },
    { name: "twitter:description", content: opcoes.descricao },
  ];
  if (opcoes.imagem) {
    meta.push({ property: "og:image", content: opcoes.imagem });
    meta.push({ name: "twitter:image", content: opcoes.imagem });
  }
  if (opcoes.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
    return { meta, links: [] };
  }
  const links: Meta[] = [
    { rel: "canonical", href: url },
    ...LOCALES.map((l) => ({
      rel: "alternate",
      hrefLang: l,
      href: urlComLocale(SITE_URL, opcoes.caminho, l),
    })),
    { rel: "alternate", hrefLang: "x-default", href: urlComLocale(SITE_URL, opcoes.caminho, "pt-BR") },
  ];
  return { meta, links };
}
