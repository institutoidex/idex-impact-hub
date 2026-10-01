import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { LOCALES, LOCALE_PADRAO, urlComLocale } from "@/i18n/locales";

/** Domínio público do site do Instituto IDEX. */
const BASE_URL = "https://idex-impact-hub.lovable.app";

interface EntradaSitemap {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/** Rotas públicas fixas (painel, login e auth ficam de fora). */
const ROTAS_FIXAS: EntradaSitemap[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/quem-somos", changefreq: "monthly", priority: "0.8" },
  { path: "/programa-esportivo", changefreq: "monthly", priority: "0.8" },
  // /projetos está oculto no site (redireciona para a Home), por isso fora do sitemap
  { path: "/noticias", changefreq: "daily", priority: "0.8" },
  { path: "/transparencia", changefreq: "monthly", priority: "0.7" },
  { path: "/como-ajudar", changefreq: "monthly", priority: "0.9" },
  { path: "/contato", changefreq: "yearly", priority: "0.6" },
];

/** Escapa caracteres especiais de XML (&, <, >, aspas). */
function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Gera o XML completo: uma <url> por idioma, cada uma com os alternates de todos os idiomas. */
function montarSitemap(entradas: EntradaSitemap[]): string {
  const blocos: string[] = [];
  for (const e of entradas) {
    // Links alternativos iguais para as 3 variantes da mesma página
    const alternates = [
      ...LOCALES.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${escaparXml(urlComLocale(BASE_URL, e.path, l))}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaparXml(urlComLocale(BASE_URL, e.path, LOCALE_PADRAO))}"/>`,
    ];
    for (const l of LOCALES) {
      blocos.push(
        [
          `  <url>`,
          `    <loc>${escaparXml(urlComLocale(BASE_URL, e.path, l))}</loc>`,
          ...alternates,
          e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
          e.priority ? `    <priority>${e.priority}</priority>` : null,
          `  </url>`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...blocos,
    `</urlset>`,
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: EntradaSitemap[] = [...ROTAS_FIXAS];

        // Somente notícias publicadas (projetos estão ocultos)
        try {
          const noticias = await supabase.from("noticias").select("slug").eq("publicado", true);
          for (const n of noticias.data ?? []) {
            if (n.slug) {
              entries.push({
                path: `/noticias/${encodeURIComponent(n.slug)}`,
                changefreq: "monthly",
                priority: "0.6",
              });
            }
          }
        } catch {
          // Sem banco disponível, o sitemap ainda entrega as rotas fixas.
        }

        return new Response(montarSitemap(entries), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
