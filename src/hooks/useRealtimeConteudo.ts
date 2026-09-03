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
    // Só abre a conexão de tempo real depois do carregamento da página, para não
    // manter o indicador de carregamento ativo em navegadores mais restritivos.
    let canal: ReturnType<typeof supabase.channel> | null = null;
    let cancelado = false;

    const assinar = () => {
      if (cancelado) return;
      canal = supabase
        .channel("conteudo-idex")
        .on("postgres_changes", { event: "*", schema: "public", table: "noticias" }, () => {
          void queryClient.invalidateQueries({ queryKey: ["noticias"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "projetos" }, () => {
          void queryClient.invalidateQueries({ queryKey: ["projetos"] });
        })
        .subscribe();
    };

    if (document.readyState === "complete") {
      assinar();
    } else {
      window.addEventListener("load", assinar, { once: true });
    }

    return () => {
      cancelado = true;
      window.removeEventListener("load", assinar);
      if (canal) void supabase.removeChannel(canal);
    };
  }, [queryClient]);
}
