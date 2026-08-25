import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

/**
 * Cliente do banco do Instituto IDEX (navegador/SSR público).
 * URL e chave publishable (anon) vêm de variáveis de ambiente VITE_*.
 * Elas são públicas por definição — a proteção real vem das políticas de RLS.
 */
export const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as
  | string
  | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Erro claro em vez de falha silenciosa nas consultas
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não configuradas (.env).",
  );
}

const noNavegador = typeof window !== "undefined";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: noNavegador,
    autoRefreshToken: noNavegador,
    detectSessionInUrl: noNavegador,
  },
});
