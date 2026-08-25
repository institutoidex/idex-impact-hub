import { createFileRoute, Outlet } from "@tanstack/react-router";

// Rota de layout: as páginas /areas e /areas/$slug renderizam no Outlet.
export const Route = createFileRoute("/areas")({
  component: () => <Outlet />,
});
