// Verificação de administrador no servidor (nunca confia no navegador).
// Usa o token do próprio usuário + chave publishable: auth.getUser(token) valida
// o token no Supabase e has_role(user.id,'admin') roda com as permissões dele.
// Não usa service_role.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db-types";

export type ResultadoAdmin =
  | { ok: true; userId: string }
  | { ok: false; codigo: "sem_token" | "token_invalido" | "sem_permissao" };

/** Extrai o token "Bearer xxx" do cabeçalho Authorization. */
export function lerToken(request: Request): string | null {
  const h = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(\S+)$/i.exec(h.trim());
  return m ? m[1]! : null;
}

/** Cliente agindo como o usuário (RLS dele), sem sessão persistida. */
function clienteDoUsuario(token: string) {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string;
  const chave = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  return createClient<Database>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/** Confere token e papel admin. `criar` é injetável para testes. */
export async function verificarAdmin(
  request: Request,
  criar: (token: string) => Pick<ReturnType<typeof clienteDoUsuario>, "auth" | "rpc"> = clienteDoUsuario,
): Promise<ResultadoAdmin> {
  const token = lerToken(request);
  if (!token) return { ok: false, codigo: "sem_token" };
  const cliente = criar(token);
  const { data, error } = await cliente.auth.getUser(token);
  if (error || !data?.user?.id) return { ok: false, codigo: "token_invalido" };
  const papel = await cliente.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (papel.error || papel.data !== true) return { ok: false, codigo: "sem_permissao" };
  return { ok: true, userId: data.user.id };
}
