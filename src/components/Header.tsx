import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, HeartHandshake, LogIn, LayoutDashboard, ChevronDown } from "lucide-react";
import { NAV } from "@/data/idex";
import { usePastas } from "@/lib/conteudo";
import { montarArvore, pastasBasePorLocale } from "@/lib/pastas";
import { MarcaPortugues } from "@/components/AvisoPortugues";
import { useLocale } from "@/i18n/mensagens";
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
import { SeletorIdioma, SeletorIdiomaLista } from "@/components/SeletorIdioma";
import { useMensagens } from "@/i18n/mensagens";
import { layout } from "@/i18n/catalogos/layout";
import { comum } from "@/i18n/catalogos/comum";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";

/** Cabeçalho fixo com navegação completa e CTA "Como Ajudar" destacado. */
export function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  // Sessão do visitante: decide se mostra "Entrar" ou atalho para o painel
  const { sessao, carregando } = useSessao();
  const t = useMensagens(layout);
  const c = useMensagens(comum);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao ampliar a tela e evita que ele permaneça aberto fora do mobile.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const fecharEmTelaGrande = (evento: MediaQueryListEvent) => {
      if (evento.matches) setAberto(false);
    };
    media.addEventListener("change", fecharEmTelaGrande);
    return () => media.removeEventListener("change", fecharEmTelaGrande);
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
      <div className="mx-auto flex h-20 max-w-[90rem] items-center gap-3 px-4 sm:h-24 sm:gap-4 sm:px-6 xl:h-20 xl:px-8">
        {/* Logo à esquerda */}
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center"
          onClick={() => setAberto(false)}
        >
          {/* Logo oficial do Instituto IDEX */}
          <img
            src={logoAsset.url}
            alt={c.altLogo}
            width={1626}
            height={905}
            decoding="async"
            className="h-auto w-28 shrink-0 object-contain transition-transform group-hover:-rotate-1 sm:w-32 xl:w-[8.25rem]"
          />
        </Link>

        {/* Navegação desktop centralizada */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label={t.navegacaoPrincipal}>
          {NAV.map((item) =>
            item.to === "/transparencia" ? (
              <MenuTransparencia key={item.to} rotulo={t.nav[item.chave]} />
            ) : (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "nav-link-ativo" }}
                className="nav-link"
              >
                {t.nav[item.chave]}
              </Link>
            ),
          )}
        </nav>

        {/* Ações à direita: busca, CTA e acesso à equipe */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* A busca permanece compacta até haver espaço para o rótulo completo. */}
          <div className="hidden sm:block">
            <BuscaDocumentos />
          </div>
          {/* Seletor de idioma (PT · EN · ES) */}
          <SeletorIdioma />
          <Button asChild variant="idex" className="hidden lg:inline-flex">
            <Link to="/como-ajudar">
              <HeartHandshake className="size-4" />
              {t.comoAjudar}
            </Link>
          </Button>
          {/* Botão de acesso: vira "Painel" quando já está logado */}
          {!carregando && (
            <Button
              asChild
              variant="idexContorno"
              className="hidden sm:inline-flex"
              aria-label={sessao ? t.irParaPainel : t.entrarAreaEquipe}
            >
              <Link to={sessao ? "/admin" : "/auth"}>
                {sessao ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
                {sessao ? t.painel : t.entrar}
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={aberto ? t.fecharMenu : t.abrirMenu}
            aria-expanded={aberto}
            aria-controls="menu-principal-mobile"
            onClick={() => setAberto((v) => !v)}
            className="size-10 rounded-md shadow-none xl:hidden"
          >
            {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="menu-principal-mobile"
        className={cn(
          "grid border-t bg-background transition-[grid-template-rows,border-color] duration-300 xl:hidden",
          aberto ? "grid-rows-[1fr] border-border" : "grid-rows-[0fr] border-transparent",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {/* Menu mobile com busca, links e ações em áreas de toque confortáveis. */}
          <nav className="mx-auto flex max-w-[90rem] flex-col px-4 py-4 sm:px-6" aria-label={t.navegacaoMovel}>
            <div className="mb-2 sm:hidden">
              <BuscaDocumentos expandida />
            </div>
            {/* Idiomas com nomes nativos, sempre visíveis no menu do celular */}
            <div className="mb-3">
              <SeletorIdiomaLista />
            </div>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setAberto(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary font-semibold bg-accent" }}
                className="rounded-md border-b border-border/60 px-3 py-3 text-sm font-medium text-foreground transition-colors last:border-0 hover:bg-muted hover:text-primary"
              >
                {t.nav[item.chave]}
              </Link>
            ))}
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:hidden">
              <Button asChild variant="idex" className="h-11">
                <Link to="/como-ajudar" onClick={() => setAberto(false)}>
                  <HeartHandshake className="size-4" />
                  {t.comoAjudar}
                </Link>
              </Button>
              <Button asChild variant="idexContorno" className="h-11">
                <Link to={sessao ? "/admin" : "/auth"} onClick={() => setAberto(false)}>
                  {sessao ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
                  {sessao ? t.painel : t.areaDaEquipe}
                </Link>
              </Button>
            </div>
            <div className="mt-4 hidden lg:block xl:hidden">
              <Button asChild variant="idexContorno" className="h-11 w-full">
                <Link to={sessao ? "/admin" : "/auth"} onClick={() => setAberto(false)}>
                  {sessao ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
                  {sessao ? t.painel : t.areaDaEquipe}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
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
  const t = useMensagens(layout);
  const c = useMensagens(comum);
  const locale = useLocale();
  const pastas = usePastas();
  const raizes = montarArvore(pastas);
  const itens = raizes.length
    ? raizes.map((p) => ({ nome: p.nome, slug: p.slug, emPortugues: Boolean((p as { emPortugues?: boolean }).emPortugues) }))
    : // estrutura base já traduzida nos três idiomas
      pastasBasePorLocale(locale).map((p) => ({ ...p, emPortugues: false }));

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.abrirAtalhosTransparencia}
            className="size-7 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {itens.map((item) => (
            <DropdownMenuItem key={item.slug} asChild>
              <Link to="/transparencia" search={{ pasta: item.slug, doc: "" }}>
                {item.nome}
                {item.emPortugues && <MarcaPortugues />}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

