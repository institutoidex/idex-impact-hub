import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Verifica no banco se o usuário logado possui o papel `admin`.
 * Usa a função `has_role` (security definer) para não depender de RLS recursivo.
 */
export function usePapelAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["papel-admin", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId!,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });
}
