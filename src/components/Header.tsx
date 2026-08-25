import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, HeartHandshake } from "lucide-react";
import { NAV } from "@/data/idex";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo-idex.png.asset.json";

/** Cabeçalho fixo com navegação completa e CTA "Como Ajudar" destacado. */
export function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        rolou
          ? "bg-background/95 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.6)] backdrop-blur"
          : "bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setAberto(false)}>
          {/* Logo oficial do Instituto IDEX */}
          <img
            src={logoAsset.url}
            alt="Instituto IDEX"
            className="h-10 w-auto object-contain transition-transform group-hover:-rotate-1 sm:h-12"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/como-ajudar">
              <HeartHandshake className="size-4" />
              Como Ajudar
            </Link>
          </Button>
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
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setAberto(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="border-b border-border/60 py-3 text-sm font-medium last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/como-ajudar"
            onClick={() => setAberto(false)}
            className="mt-3 mb-3 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            Como Ajudar
          </Link>
        </nav>
      </div>
    </header>
  );
}
