import { createFileRoute, Outlet } from "@tanstack/react-router";

// Rota de layout dos projetos.
export const Route = createFileRoute("/projetos")({
  component: () => <Outlet />,
});
