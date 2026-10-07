import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { ReactNode } from "react";

import { useSessao } from "@/hooks/useSessao";
import { usePapelAdmin } from "@/hooks/usePapelAdmin";
import { useMensagens } from "@/i18n/mensagens";
import { admin } from "@/i18n/catalogos/admin";
import { estadoGuarda } from "./estado-guarda";

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
  const m = useMensagens(admin);
  const avisou = useRef(false); // evita repetir o toast em re-renderizações

  // Marca quando o servidor confirmou admin de verdade (não só o cache otimista)
  const confirmado = useRef(false);
  if (papel.isFetched && papel.isSuccess && papel.data === true) confirmado.current = true;

  const estado = estadoGuarda({
    carregandoSessao: carregando,
    temSessao: Boolean(sessao),
    papel: papel.data,
    papelSucesso: papel.isSuccess,
    papelErro: papel.isError,
    confirmadoNoServidor: confirmado.current,
  });
  const semSessao = estado === "semSessao";
  const semPermissao = estado === "semPermissao";
  const erroPapel = estado === "erro";

  useEffect(() => {
    if (semSessao && !avisou.current) {
      avisou.current = true;
      toast(m.guarda.acessoRestritoTitulo, { description: m.guarda.acessoRestritoDescricao });
      navigate({ to: "/auth", replace: true });
    }
  }, [semSessao, navigate, m]);

  useEffect(() => {
    if (semPermissao && !avisou.current) {
      avisou.current = true;
      toast(m.guarda.semPermissaoTitulo, { description: m.guarda.semPermissaoDescricao });
      navigate({ to: "/", replace: true });
    }
  }, [semPermissao, navigate, m]);

  // Falha ao consultar o papel ANTES de qualquer confirmação: por segurança, não libera
  useEffect(() => {
    if (erroPapel && !avisou.current) {
      avisou.current = true;
      toast(m.guarda.erroConfirmarTitulo, { description: m.guarda.erroConfirmarDescricao });
      navigate({ to: "/auth", replace: true });
    }
  }, [erroPapel, navigate, m]);

  const liberado = estado === "liberado";

  if (!liberado) {
    return (
      <div className="px-4 py-32 text-center text-muted-foreground">
        {m.guarda.verificando}
      </div>
    );
  }

  return <>{children}</>;
}
