import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

/**
 * Cliente do banco do Instituto IDEX.
 * A URL e a chave publishable (anon) são públicas por definição —
 * a proteção real vem das políticas de RLS configuradas no banco.
 */
export const SUPABASE_URL = "https://rhgiuskcuowphhwuewcf.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ2l1c2tjdW93cGhod3Vld2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzYyNDYsImV4cCI6MjEwMzI1MjI0Nn0.DnqyODZTkMeXKTLLBS5lysc-KePOqoUU6B8H2MkgOmo";

const noNavegador = typeof window !== "undefined";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: noNavegador,
    autoRefreshToken: noNavegador,
    detectSessionInUrl: noNavegador,
  },
});
