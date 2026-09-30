import { createFileRoute } from "@tanstack/react-router";

// Proxy de documentos: esconde a URL real do armazenamento (Supabase).
// O navegador vê apenas um endereço do próprio site (/api/public/documentos/...).
// Uso: /api/public/documentos/<caminho-do-arquivo>?download=1&nome=arquivo.pdf

const EXTENSOES_PERMITIDAS: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const Route = createFileRoute("/api/public/documentos/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // Caminho do arquivo dentro do bucket "midia" (ex.: documentos/123-arquivo.pdf)
        const caminho = params._splat ?? "";
        if (!caminho || caminho.includes("..")) {
          return new Response("Caminho inválido", { status: 400 });
        }

        const extensao = caminho.split(".").pop()?.toLowerCase() ?? "";
        const tipo = EXTENSOES_PERMITIDAS[extensao];
        if (!tipo) {
          return new Response("Tipo de arquivo não permitido", { status: 415 });
        }

        const base = import.meta.env['VITE_SUPABASE_URL'] as string;
        const chave = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string;
        const urlOrigem = `${base}/storage/v1/object/public/midia/${caminho}`;

        // Validação: só libera arquivos cadastrados E publicados na Transparência.
        // Compara a URL exata salva em documentos.arquivo_url — qualquer outro
        // objeto do bucket (imagens de notícias, rascunhos etc.) é bloqueado.
        try {
          const consulta = new URL(`${base}/rest/v1/documentos`);
          consulta.searchParams.set("select", "id");
          consulta.searchParams.set("publicado", "eq.true");
          consulta.searchParams.set("arquivo_url", `eq.${urlOrigem}`);
          consulta.searchParams.set("limit", "1");
          const r = await fetch(consulta, {
            headers: { apikey: chave, Accept: "application/json" },
          });
          if (!r.ok) return new Response("Falha na validação", { status: 502 });
          const linhas = (await r.json()) as unknown[];
          if (!Array.isArray(linhas) || linhas.length === 0) {
            return new Response("Arquivo não encontrado", { status: 404 });
          }
        } catch {
          return new Response("Falha na validação", { status: 502 });
        }

        let resposta: Response;
        try {
          resposta = await fetch(urlOrigem);
        } catch {
          return new Response("Falha ao buscar o arquivo", { status: 502 });
        }
        if (!resposta.ok || !resposta.body) {
          return new Response("Arquivo não encontrado", { status: 404 });
        }

        // ?download=1 força o download com nome amigável; sem ele, abre inline no navegador
        const url = new URL(request.url);
        const baixar = url.searchParams.get("download") === "1";
        const nome = url.searchParams.get("nome") || caminho.split("/").pop() || "arquivo";
        const disposicao = baixar
          ? `attachment; filename*=UTF-8''${encodeURIComponent(nome)}`
          : "inline";

        return new Response(resposta.body, {
          status: 200,
          headers: {
            "Content-Type": tipo,
            "Content-Disposition": disposicao,
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
