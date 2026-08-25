import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

/**
 * Cliente administrativo (service_role) — SOMENTE servidor.
 * Ignora RLS, então nunca deve ser importado por componentes ou rotas do cliente.
 * Use apenas dentro do handler de uma server function, com `await import(...)`.
 *
 * Segredos lidos do ambiente do servidor (cofre de secrets da Lovable):
 *  - IDEX_SUPABASE_URL (opcional; cai no valor público VITE_SUPABASE_URL)
 *  - IDEX_SUPABASE_SERVICE_ROLE_KEY
 */
export function criarSupabaseAdmin() {
  const url = process.env['IDEX_SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'];
  const serviceRoleKey = process.env['IDEX_SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltam IDEX_SUPABASE_URL e/ou IDEX_SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
