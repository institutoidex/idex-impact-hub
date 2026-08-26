import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Atalho: /login e /painel apontam para a tela de acesso da equipe (/auth).
 */
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", replace: true });
  },
});
