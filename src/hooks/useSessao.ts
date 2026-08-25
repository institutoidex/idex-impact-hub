import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Sessão do usuário logado (painel administrativo).
 * `carregando` evita piscar a tela de login antes de checar a sessão.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Escuta mudanças primeiro para não perder eventos
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      if (ativo) setSessao(s);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSessao(data.session);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { sessao, carregando, usuario: sessao?.user ?? null };
}
