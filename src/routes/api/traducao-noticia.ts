import { createFileRoute } from "@tanstack/react-router";

// Endpoint da tradução automática de notícias (Gemini, plano gratuito).
// Exige token Supabase de um administrador; a chave GEMINI_API_KEY fica só no
// servidor (cofre de secrets) e é lida dentro do handler.
// Módulos *.server.ts são carregados aqui dentro para não entrarem no navegador.
export const Route = createFileRoute("/api/traducao-noticia")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [{ processarTraducao }, { verificarAdmin }, { traduzirComGemini }, { limitadorGlobal }] =
          await Promise.all([
            import("@/lib/traducao-ia/endpoint.server"),
            import("@/lib/traducao-ia/auth.server"),
            import("@/lib/traducao-ia/gemini.server"),
            import("@/lib/traducao-ia/limite.server"),
          ]);
        return processarTraducao(request, {
          verificar: (r) => verificarAdmin(r),
          lerChave: () => process.env["GEMINI_API_KEY"] || undefined,
          traduzir: (entrada, opcoes) => traduzirComGemini(entrada, opcoes),
          limitador: limitadorGlobal,
        });
      },
    },
  },
});
