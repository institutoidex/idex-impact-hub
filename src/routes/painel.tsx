import { createFileRoute, redirect } from "@tanstack/react-router";

/** Atalho: /painel leva ao painel administrativo (/admin). */
export const Route = createFileRoute("/painel")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
});
