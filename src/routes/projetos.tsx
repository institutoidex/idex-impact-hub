import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Rota de layout dos projetos.
// A área de Projetos está oculta no site: qualquer acesso a /projetos
// (e subpáginas) é redirecionado para a Home.
export const Route = createFileRoute("/projetos")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
