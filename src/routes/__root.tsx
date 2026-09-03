import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotaoAcessibilidade } from "@/components/BotaoAcessibilidade";
import { VLibras } from "@/components/VLibras";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { useRealtimeConteudo } from "@/hooks/useRealtimeConteudo";

import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// URL pública oficial do site (usada em canonicals, og:url e dados estruturados)
export const SITE_URL = "https://idex-impact-hub.lovable.app";

// Dados estruturados (JSON-LD) globais: Organization + WebSite.
// Melhoram a exibição do instituto nos resultados de busca (nome, logo, redes).
const jsonLdOrganizacao = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": `${SITE_URL}/#organizacao`,
  name: "Instituto IDEX",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  foundingDate: "2007",
  description:
    "ONG brasileira que atua em educação, cultura, esportes, meio ambiente, negócios e saúde desde 2007.",
  sameAs: ["https://instagram.com/idexbrasil", "https://facebook.com/idexsocial"],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Instituto IDEX",
  url: SITE_URL,
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE_URL}/#organizacao` },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Instituto IDEX — desenvolvimento social desde 2007" },
      {
        name: "description",
        content:
          "ONG brasileira que atua em educação, cultura, esportes, meio ambiente, negócios e saúde.",
      },
      { name: "author", content: "Instituto IDEX" },
      // Verificação de propriedade do site no Google Search Console
      {
        name: "google-site-verification",
        content: "f41Di7u7feDIM43P6vFZUwTAlxVsjqowHAfM-jHS7AM",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // As fontes do Google são injetadas pelo componente <FontesWeb /> após a
      // hidratação, para não bloquear a renderização em navegadores com
      // bloqueador embutido (Opera GX, Brave etc.).
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    // Dados estruturados JSON-LD: Organização e WebSite (válidos em todas as páginas)
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLdOrganizacao) },
      { type: "application/ld+json", children: JSON.stringify(jsonLdWebSite) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Escuta o banco e atualiza as páginas em tempo real */}
      <AssinaturaRealtime />
      {/* Barra de progresso de leitura */}
      <ScrollProgress />
      <Header />

      {/* site-conteudo: alvo do filtro de escala de cinza da acessibilidade.
          Fica separado dos widgets flutuantes (fixos) para o filter não quebrá-los */}
      <div className="site-conteudo">
        <main className="min-h-screen">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
      {/* Painel flutuante de acessibilidade */}
      <BotaoAcessibilidade />
      {/* Intérprete de Libras (VLibras) — canto inferior esquerdo */}
      <VLibras />
      <Toaster />
    </QueryClientProvider>
  );
}

/** Componente sem UI: mantém a assinatura de tempo real do conteúdo. */
function AssinaturaRealtime() {
  useRealtimeConteudo();
  return null;
}
