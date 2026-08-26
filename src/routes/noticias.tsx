import { createFileRoute, Outlet } from "@tanstack/react-router";

// Rota de layout das notícias (lista em /noticias e detalhe em /noticias/slug).
export const Route = createFileRoute("/noticias")({
  component: () => <Outlet />,
});
