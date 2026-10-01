import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  retainSearchParams,
} from "@tanstack/react-router";
import { comum } from "@/i18n/catalogos/comum";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { ehLocale, normalizarLocale, OG_LOCALE } from "@/i18n/locales";
import { SincronizarIdioma } from "@/components/SeletorIdioma";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotaoAcessibilidade } from "@/components/BotaoAcessibilidade";
import { VLibras } from "@/components/VLibras";
import { FontesWeb } from "@/components/FontesWeb";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { useRealtimeConteudo } from "@/hooks/useRealtimeConteudo";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";
import compartilhamentoAsset from "@/assets/compartilhamento-idex-v2.jpg.asset.json";

import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  const m = useMensagens(comum).naoEncontrada;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{m.titulo}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {m.texto}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {m.voltar}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const m = useMensagens(comum).erro;
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {m.titulo}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {m.texto}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {m.tentar}
          </button>
          {/* Link do roteador: o middleware retainSearchParams mantém o ?lang */}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {m.voltar}
          </Link>
        </div>
      </div>
    </div>
  );
}

// URL pública oficial do site (usada em canonicals, og:url e dados estruturados)
export const SITE_URL = "https://idex-impact-hub.lovable.app";

// Arquivos oficiais com URL absoluta para buscadores e compartilhamentos sociais.
const LOGO_URL = `${SITE_URL}${logoAsset.url}`;
const IMAGEM_COMPARTILHAMENTO_URL = `${SITE_URL}${compartilhamentoAsset.url}`;

// Dados estruturados (JSON-LD) globais: Organization + WebSite.
// Melhoram a exibição do instituto nos resultados de busca (nome, logo, redes).
const jsonLdOrganizacao = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": `${SITE_URL}/#organizacao`,
  name: "Instituto IDEX",
  url: SITE_URL,
  logo: LOGO_URL,
  foundingDate: "2007",
  description:
    "Instituto dedicado ao desenvolvimento social e à formação de crianças e jovens por meio do esporte, desde 2007.",
  sameAs: ["https://instagram.com/idexbrasil", "https://facebook.com/idexsocial"],
  // Contato oficial (sem e-mail por decisão do instituto — anti-spam)
  telephone: "+55-11-2645-4565",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Cel. José Eusébio, 95 – casa 13",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "01239-030",
    addressCountry: "BR",
  },
  identifier: { "@type": "PropertyValue", name: "CNPJ", value: "08.666.490/0001-71" },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Instituto IDEX",
  url: SITE_URL,
  inLanguage: ["pt-BR", "en-US", "es-ES"],
  publisher: { "@id": `${SITE_URL}/#organizacao` },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // ?lang=en-US | es-ES (pt-BR é o padrão e não aparece). Valor inválido é descartado.
  validateSearch: (search: Record<string, unknown>): { lang?: "en-US" | "es-ES" } => {
    const lang = search["lang"];
    return ehLocale(lang) && lang !== "pt-BR" ? { lang } : {};
  },
  // Todos os links internos mantêm o idioma atual automaticamente.
  search: { middlewares: [retainSearchParams(["lang"])] },
  head: ({ match }) => {
    const m = comum[normalizarLocale(match.search.lang)];
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: m.tituloSite },
      { name: "description", content: m.descricaoSite },
      { name: "author", content: "Instituto IDEX" },
      // Verificação de propriedade do site no Google Search Console
      {
        name: "google-site-verification",
        content: "f41Di7u7feDIM43P6vFZUwTAlxVsjqowHAfM-jHS7AM",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Instituto IDEX" },
      { property: "og:locale", content: OG_LOCALE[normalizarLocale(match.search.lang)] },
      { property: "og:image", content: IMAGEM_COMPARTILHAMENTO_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: m.altLogo },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMAGEM_COMPARTILHAMENTO_URL },
      { name: "twitter:image:alt", content: m.altLogo },
      { name: "theme-color", content: "#00A859" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // As fontes do Google são injetadas pelo componente <FontesWeb /> após a
      // hidratação, para não bloquear a renderização em navegadores com
      // bloqueador embutido (Opera GX, Brave etc.).
      // O sufixo v2 renova ícones antigos mantidos em cache pelo Opera GX e Chrome.
      { rel: "icon", href: "/favicon-v2.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-v2-16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-v2-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-v2-64.png", type: "image/png", sizes: "64x64" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-v2.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest?v=2" },
    ],
    // Dados estruturados JSON-LD: Organização e WebSite (válidos em todas as páginas)
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLdOrganizacao) },
      { type: "application/ld+json", children: JSON.stringify(jsonLdWebSite) },
    ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // <html lang> acompanha o idioma da URL (também no SSR)
  const locale = useLocale();
  return (
    <html lang={locale}>
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
      {/* Aplica o idioma salvo quando a URL não traz ?lang */}
      <SincronizarIdioma />
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
      {/* Fontes da marca carregadas sem bloquear a renderização */}
      <FontesWeb />
      <Toaster />
    </QueryClientProvider>
  );
}

/** Componente sem UI: mantém a assinatura de tempo real do conteúdo. */
function AssinaturaRealtime() {
  useRealtimeConteudo();
  return null;
}
