import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Escuta mudanças em notícias e projetos no banco e atualiza as telas em tempo real.
 * Basta montar uma vez (feito no layout raiz) — vale para o site público e o painel.
 */
export function useRealtimeConteudo() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const canal = supabase
      .channel("conteudo-idex")
      .on("postgres_changes", { event: "*", schema: "public", table: "noticias" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["noticias"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "projetos" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["projetos"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [queryClient]);
}
