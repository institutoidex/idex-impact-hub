import { createFileRoute } from "@tanstack/react-router";

// Recebe o formulário de contato: grava a mensagem e depois avisa a equipe por e-mail (Resend).
// Rota pública (visitantes não têm login). Não é um "relay": destinatários são fixos no
// servidor e o visitante só aparece como Reply-To. Módulos *.server.ts carregados aqui dentro.
export const Route = createFileRoute("/api/public/contato")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [{ processarContato }, { criarBancoContato }, { lerConfigEmail }, { enviarViaResend }, lim] =
          await Promise.all([
            import("@/lib/contato/endpoint.server"),
            import("@/lib/contato/banco.server"),
            import("@/lib/contato/config.server"),
            import("@/lib/contato/resend.server"),
            import("@/lib/contato/limite.server"),
          ]);
        let banco;
        try {
          banco = criarBancoContato();
        } catch {
          console.warn("[contato] banco_nao_configurado");
          return new Response(JSON.stringify({ ok: false, codigo: "falha_registro" }), {
            status: 503,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
        return processarContato(request, {
          origem: () =>
            lim.hashOrigem(
              request.headers.get("cf-connecting-ip") ??
                request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                "desconhecida",
            ),
          limite: lim.limiteContatoGlobal,
          banco,
          lerConfig: () => lerConfigEmail(process.env),
          enviar: (cfg, e) => enviarViaResend(cfg, e),
        });
      },
    },
  },
});
