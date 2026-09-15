import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/lib/supabase";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Cabeçalho fixo do painel administrativo.
 * Exibe a marca do IDEX, o e-mail do usuário logado e as ações rápidas
 * (ver o site público e encerrar a sessão).
 */
export function AdminHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { usuario } = useSessao();

  async function sair() {
    // Cancela consultas ativas e limpa o cache antes de encerrar a sessão
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    // Volta para a Home após o logout
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 shadow-[0_12px_32px_-24px_rgba(36,35,35,0.55)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Marca e identificação do painel */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <img
              src={logoAsset.url}
              alt="Instituto IDEX"
              width={1626}
              height={905}
              decoding="async"
              className="h-12 w-auto max-w-[5.5rem] object-contain sm:h-16 sm:max-w-[7.25rem]"
            />
          </Link>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Painel
            </p>
            {usuario?.email && (
              <p className="max-w-[16rem] truncate text-xs text-muted-foreground">
                {usuario.email}
              </p>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/">
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Ver o site</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={sair}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
