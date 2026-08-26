import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";

/** Domínio público do site do Instituto IDEX. */
const BASE_URL = "https://idex-impact-hub.lovable.app";

interface EntradaSitemap {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/** Rotas públicas fixas (rotas de painel/login ficam de fora). */
const ROTAS_FIXAS: EntradaSitemap[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/quem-somos", changefreq: "monthly", priority: "0.8" },
  { path: "/projetos", changefreq: "weekly", priority: "0.8" },
  { path: "/noticias", changefreq: "daily", priority: "0.8" },
  { path: "/transparencia", changefreq: "monthly", priority: "0.7" },
  { path: "/como-ajudar", changefreq: "monthly", priority: "0.9" },
  { path: "/contato", changefreq: "yearly", priority: "0.6" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: EntradaSitemap[] = [...ROTAS_FIXAS];

        // Conteúdo dinâmico publicado (mesmos filtros dos loaders das páginas)
        try {
          const [projetos, noticias] = await Promise.all([
            supabase.from("projetos").select("slug").eq("publicado", true),
            supabase.from("noticias").select("slug").eq("publicado", true),
          ]);

          for (const p of projetos.data ?? []) {
            if (p.slug) entries.push({ path: `/projetos/${p.slug}`, changefreq: "monthly", priority: "0.7" });
          }
          for (const n of noticias.data ?? []) {
            if (n.slug) entries.push({ path: `/noticias/${n.slug}`, changefreq: "monthly", priority: "0.6" });
          }
        } catch {
          // Sem banco disponível, o sitemap ainda entrega as rotas fixas.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
