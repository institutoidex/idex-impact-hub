import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Chave do cache local do papel (por usuário) — evita esperar a rede a cada entrada */
const chaveCache = (userId: string) => `idex:papel-admin:${userId}`;

function lerCache(userId: string | undefined): boolean | undefined {
  if (!userId || typeof window === "undefined") return undefined;
  const bruto = window.sessionStorage.getItem(chaveCache(userId));
  return bruto === null ? undefined : bruto === "1";
}

/**
 * Verifica no banco se o usuário logado possui o papel `admin`.
 * Usa a função `has_role` (security definer) para não depender de RLS recursivo.
 * O resultado fica em sessionStorage: o painel abre na hora e a confirmação
 * chega em segundo plano (revalidação).
 */
export function usePapelAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["papel-admin", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    // Voltar o foco (ex.: ao fechar o seletor de arquivos) não revalida o papel:
    // evita checagens no meio da edição. Ainda revalida ao montar o painel.
    refetchOnWindowFocus: false,
    // Valor otimista vindo do cache da sessão do navegador
    initialData: lerCache(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId!,
        _role: "admin",
      });
      if (error) throw error;
      const ehAdmin = Boolean(data);
      if (typeof window !== "undefined" && userId) {
        window.sessionStorage.setItem(chaveCache(userId), ehAdmin ? "1" : "0");
      }
      return ehAdmin;
    },
  });
}
