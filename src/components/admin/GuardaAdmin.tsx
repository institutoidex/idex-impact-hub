import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { ReactNode } from "react";

import { useSessao } from "@/hooks/useSessao";
import { usePapelAdmin } from "@/hooks/usePapelAdmin";

/**
 * Proteção de rota do painel.
 * - Sem sessão: manda para /auth com aviso discreto.
 * - Com sessão, mas sem papel `admin`: volta para a Home com aviso discreto.
 * Enquanto verifica, mostra apenas um estado neutro (nada do painel é renderizado).
 */
export function GuardaAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { sessao, carregando, usuario } = useSessao();
  const papel = usePapelAdmin(usuario?.id);
  const avisou = useRef(false); // evita repetir o toast em re-renderizações

  const semSessao = !carregando && !sessao;
  const semPermissao = Boolean(sessao) && papel.isSuccess && papel.data === false;

  useEffect(() => {
    if (semSessao && !avisou.current) {
      avisou.current = true;
      toast("Acesso restrito", { description: "Entre com sua conta para abrir o painel." });
      navigate({ to: "/auth", replace: true });
    }
  }, [semSessao, navigate]);

  useEffect(() => {
    if (semPermissao && !avisou.current) {
      avisou.current = true;
      toast("Sem permissão", { description: "Sua conta não tem acesso ao painel." });
      navigate({ to: "/", replace: true });
    }
  }, [semPermissao, navigate]);

  // Falha ao consultar o papel: por segurança, não libera o painel
  useEffect(() => {
    if (papel.isError && !avisou.current) {
      avisou.current = true;
      toast("Não foi possível confirmar seu acesso", { description: "Tente entrar novamente." });
      navigate({ to: "/auth", replace: true });
    }
  }, [papel.isError, navigate]);

  const liberado = Boolean(sessao) && papel.data === true;

  if (!liberado) {
    return (
      <div className="px-4 py-32 text-center text-muted-foreground">
        Verificando seu acesso...
      </div>
    );
  }

  return <>{children}</>;
}
