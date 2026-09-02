import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, HeartHandshake, LogIn, LayoutDashboard } from "lucide-react";
import { NAV } from "@/data/idex";
import { usePastas } from "@/lib/conteudo";
import { montarArvore, PASTAS_BASE } from "@/lib/pastas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BuscaDocumentos } from "@/components/BuscaDocumentos";
import { useSessao } from "@/hooks/useSessao";
import logoAsset from "@/assets/logo-idex.png.asset.json";

/** Cabeçalho fixo com navegação completa e CTA "Como Ajudar" destacado. */
export function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  // Sessão do visitante: decide se mostra "Entrar" ou atalho para o painel
  const { sessao, carregando } = useSessao();

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        // site-cabecalho: alvo do filtro de escala de cinza da acessibilidade
        "site-cabecalho fixed inset-x-0 top-0 z-50 transition-all duration-300",
        rolou
          ? "border-b border-border bg-background/95 shadow-[0_12px_32px_-24px_rgba(36,35,35,0.55)] backdrop-blur"
          : "border-b border-transparent bg-background/85 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setAberto(false)}>
          {/* Logo oficial do Instituto IDEX */}
          <img
            src={logoAsset.url}
            alt="Instituto IDEX"
            width={200}
            height={80}
            decoding="async"
            className="h-10 w-auto object-contain transition-transform group-hover:-rotate-1 sm:h-12"
          />
        </Link>

        {/* Navegação desktop: fonte Public Sans em peso médio, contraste pleno
            e sublinhado verde animado (utilitário nav-link do styles.css) */}
        <nav className="ml-auto hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) =>
            item.to === "/transparencia" ? (
              <MenuTransparencia key={item.to} rotulo={item.label} />
            ) : (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "nav-link-ativo" }}
                className="nav-link"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Ações à direita: shrink-0 garante que busca e botões não sejam esmagados */}
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-2">
          {/* Busca sutil de documentos — sempre visível do breakpoint sm em diante;
              em telas xl os links do menu ficam mais compactos para ela caber */}
          <div className="hidden sm:block">
            <BuscaDocumentos />
          </div>
          <Button asChild variant="idex" className="hidden sm:inline-flex">
            <Link to="/como-ajudar">
              <HeartHandshake className="size-4" />
              Como Ajudar
            </Link>
          </Button>
          {/* Botão de acesso: vira "Painel" quando já está logado (sem cadastro, só login) */}
          {!carregando && (
            <Button
              asChild
              variant="idexContorno"
              className="hidden sm:inline-flex"
              aria-label={sessao ? "Ir para o painel administrativo" : "Entrar na área da equipe"}
            >
              <Link to={sessao ? "/admin" : "/auth"}>
                {sessao ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
                {sessao ? "Painel" : "Entrar"}
              </Link>
            </Button>
          )}
          <button
            type="button"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setAberto((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-border xl:hidden"
          >
            {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 xl:hidden",
          aberto ? "max-h-[32rem]" : "max-h-0",
        )}
      >
        {/* Menu mobile: mesmos princípios de contraste, com área de toque ampla */}
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setAberto(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary font-semibold" }}
              className="border-b border-border/60 py-3 text-sm font-medium text-foreground transition-colors last:border-0 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/como-ajudar"
            onClick={() => setAberto(false)}
            className="mt-3 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            Como Ajudar
          </Link>
          {/* Acesso da equipe também no menu mobile */}
          <Link
            to={sessao ? "/admin" : "/auth"}
            onClick={() => setAberto(false)}
            className="mt-2 mb-3 flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-center text-sm font-semibold"
          >
            {sessao ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
            {sessao ? "Painel" : "Área da equipe"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

/**
 * Item "Transparência": o texto é um link normal que SEMPRE navega para a
 * página geral; o menu de atalhos das pastas abre por um botão de seta
 * separado (Radix não intercepta mais o clique do link).
 */
function MenuTransparencia({ rotulo }: { rotulo: string }) {
  const pastas = usePastas();
  const raizes = montarArvore(pastas);
  const itens = raizes.length
    ? raizes.map((p) => ({ nome: p.nome, slug: p.slug }))
    : PASTAS_BASE;

  return (
    <span className="flex items-center">
      <Link
        to="/transparencia"
        activeProps={{ className: "nav-link-ativo" }}
        className="nav-link"
      >
        {rotulo}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Abrir atalhos das pastas de Transparência"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {itens.map((item) => (
            <DropdownMenuItem key={item.slug} asChild>
              <Link to="/transparencia" search={{ pasta: item.slug, doc: "" }}>
                {item.nome}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

